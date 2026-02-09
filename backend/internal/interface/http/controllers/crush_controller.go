package controllers

import (
	"net/http"

	"wizard-connect/internal/domain/entities"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CrushController struct {
	crushRepo *database.CrushRepository
}

func NewCrushController(crushRepo *database.CrushRepository) *CrushController {
	return &CrushController{
		crushRepo: crushRepo,
	}
}

// GetCrushes retrieves the user's crush list
func (ctrl *CrushController) GetCrushes(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	crushes, err := ctrl.crushRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve crushes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": crushes,
	})
}

// SubmitCrushes submits the user's crush list
func (ctrl *CrushController) SubmitCrushes(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		Crushes []struct {
			Email string `json:"email" binding:"required,email"`
			Rank  int    `json:"rank" binding:"required,min=1,max=5"`
		} `json:"crushes" binding:"required,min=1,max=5"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Campaign date enforcement
	if !database.IsSurveyOpen() {
		c.JSON(http.StatusForbidden, gin.H{"error": "Crush list submission is not available at this time"})
		return
	}

	// Delete existing crushes for this user
	// TODO: Implement delete by user ID

	// Create new crushes
	crushes := make([]*entities.Crush, 0, len(req.Crushes))
	for _, crush := range req.Crushes {
		newCrush := &entities.Crush{
			ID:         uuid.New().String(),
			UserID:     userID,
			CrushEmail: crush.Email,
			Rank:       crush.Rank,
		}
		crushes = append(crushes, newCrush)

		if err := ctrl.crushRepo.Create(c.Request.Context(), newCrush); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save crushes"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    crushes,
		"message": "Crush list submitted successfully",
	})
}
