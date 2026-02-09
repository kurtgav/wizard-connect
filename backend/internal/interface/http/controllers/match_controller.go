package controllers

import (
	"net/http"

	"wizard-connect/internal/domain/services"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"

	"github.com/gin-gonic/gin"
)

type MatchController struct {
	matchRepo       *database.MatchRepository
	surveyRepo      *database.SurveyRepository
	matchingService services.MatchingService
}

func NewMatchController(
	matchRepo *database.MatchRepository,
	surveyRepo *database.SurveyRepository,
	matchingService services.MatchingService,
) *MatchController {
	return &MatchController{
		matchRepo:       matchRepo,
		surveyRepo:      surveyRepo,
		matchingService: matchingService,
	}
}

// GetMatches retrieves the user's matches
func (ctrl *MatchController) GetMatches(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	matches, err := ctrl.matchRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve matches"})
		return
	}

	// Campaign date enforcement: Hide details until results are released
	if !database.IsResultsReleased() {
		c.JSON(http.StatusOK, gin.H{
			"data":             []interface{}{},
			"results_released": false,
			"match_count":      len(matches),
			"message":          "Matches will be revealed on February 14th!",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":             matches,
		"results_released": true,
	})
}

// GenerateMatches creates new matches for the user
func (ctrl *MatchController) GenerateMatches(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Check if user has completed survey
	survey, err := ctrl.surveyRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil || !survey.IsComplete {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please complete the survey first"})
		return
	}

	// Delete existing matches
	_ = ctrl.matchRepo.DeleteByUserID(c.Request.Context(), userID)

	// Generate new matches (top 7 matches)
	matches, err := ctrl.matchingService.GenerateMatches(c.Request.Context(), userID, 7)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate matches"})
		return
	}

	// Save matches to database
	for _, match := range matches {
		if err := ctrl.matchRepo.Create(c.Request.Context(), match); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save matches"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    matches,
		"message": "Matches generated successfully",
	})
}
