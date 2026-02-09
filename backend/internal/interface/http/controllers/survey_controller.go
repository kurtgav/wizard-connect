package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"wizard-connect/internal/domain/entities"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"
)

type SurveyController struct {
	surveyRepo *database.SurveyRepository
}

func NewSurveyController(surveyRepo *database.SurveyRepository) *SurveyController {
	return &SurveyController{
		surveyRepo: surveyRepo,
	}
}

// GetSurvey retrieves the user's survey responses
func (ctrl *SurveyController) GetSurvey(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	survey, err := ctrl.surveyRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		// Return empty survey if not found
		c.JSON(http.StatusOK, gin.H{
			"data": &entities.SurveyResponse{
				UserID:     userID,
				Responses:  make(map[string]interface{}),
				Interests:  []string{},
				Values:     []string{},
				IsComplete: false,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": survey,
	})
}

// SubmitSurvey creates or updates survey responses
func (ctrl *SurveyController) SubmitSurvey(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		Responses       map[string]interface{} `json:"responses"`
		PersonalityType string                 `json:"personality_type"`
		Interests       []string               `json:"interests"`
		Values          []string               `json:"values"`
		Lifestyle       string                 `json:"lifestyle"`
		IsComplete      bool                   `json:"is_complete"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()

	survey := &entities.SurveyResponse{
		UserID:          userID,
		Responses:       req.Responses,
		PersonalityType: req.PersonalityType,
		Interests:       req.Interests,
		Values:          req.Values,
		Lifestyle:       req.Lifestyle,
		IsComplete:      req.IsComplete,
	}

	if req.IsComplete {
		survey.CompletedAt = now
	}

	// Check if survey exists
	existing, err := ctrl.surveyRepo.GetByUserID(c.Request.Context(), userID)
	if err == nil && existing != nil {
		survey.ID = existing.ID
		survey.CreatedAt = existing.CreatedAt
	} else {
		survey.CreatedAt = now
	}
	survey.UpdatedAt = now

	if err := ctrl.surveyRepo.CreateOrUpdate(c.Request.Context(), survey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save survey: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    survey,
		"message": "Survey saved successfully",
	})
}
