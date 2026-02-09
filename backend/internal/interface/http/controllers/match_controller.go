package controllers

import (
	"fmt"
	"net/http"
	"time"

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

// Helper types for API response transformation
type MatchedUserDetails struct {
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	AvatarURL string `json:"avatar_url"`
	Bio       string `json:"bio"`
	Year      string `json:"year"`
	Major     string `json:"major"`
}

type APIResponseMatch struct {
	ID                 string              `json:"id"`
	UserID             string              `json:"user_id"`
	MatchedUserID      string              `json:"matched_user_id"`
	CompatibilityScore float64             `json:"compatibility_score"`
	Rank               int                 `json:"rank"`
	IsMutualCrush      bool                `json:"is_mutual_crush"`
	CreatedAt          string              `json:"created_at"`
	MatchedUser        *MatchedUserDetails `json:"matched_user"`
}

// GetMatches retrieves user's matches
func (ctrl *MatchController) GetMatches(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	matches, err := ctrl.matchRepo.GetByUserIDWithUserDetails(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve matches"})
		return
	}

	// Transform to match frontend expected structure with nested matched_user
	apiMatches := make([]APIResponseMatch, len(matches))
	for i, m := range matches {
		apiMatches[i] = APIResponseMatch{
			ID:                 m.ID,
			UserID:             m.UserID,
			MatchedUserID:      m.MatchedUserID,
			CompatibilityScore: m.CompatibilityScore,
			Rank:               m.Rank,
			IsMutualCrush:      m.IsMutualCrush,
			CreatedAt:          m.CreatedAt.Format(time.RFC3339),
			MatchedUser: &MatchedUserDetails{
				Email:     m.MatchedEmail,
				FirstName: m.FirstName,
				LastName:  m.LastName,
				AvatarURL: m.AvatarURL,
				Bio:       m.Bio,
				Year:      m.Year,
				Major:     m.Major,
			},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":             apiMatches,
		"results_released": true,
	})
}

// GenerateMatches creates new matches for user
func (ctrl *MatchController) GenerateMatches(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Check if user has completed survey
	survey, err := ctrl.surveyRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		fmt.Printf("ERROR: Failed to get user survey: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please complete the survey first"})
		return
	}
	if !survey.IsComplete {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please complete the survey first"})
		return
	}

	// Delete existing matches
	if err := ctrl.matchRepo.DeleteByUserID(c.Request.Context(), userID); err != nil {
		fmt.Printf("ERROR: Failed to delete existing matches: %v\n", err)
	}

	// Generate new matches (top 7 matches)
	matches, err := ctrl.matchingService.GenerateMatches(c.Request.Context(), userID, 7)
	if err != nil {
		fmt.Printf("ERROR: Failed to generate matches: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate matches: " + err.Error()})
		return
	}

	// Save matches to database
	for _, match := range matches {
		if err := ctrl.matchRepo.Create(c.Request.Context(), match); err != nil {
			fmt.Printf("ERROR: Failed to save match: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save matches"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    matches,
		"message": "Matches generated successfully",
	})
}
