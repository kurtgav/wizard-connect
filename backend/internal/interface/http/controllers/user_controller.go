package controllers

import (
	"fmt"
	"net/http"

	"wizard-connect/internal/domain/entities"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userRepo *database.UserRepository
}

func NewUserController(userRepo *database.UserRepository) *UserController {
	return &UserController{
		userRepo: userRepo,
	}
}

// GetProfile returns the current user's profile
func (ctrl *UserController) GetProfile(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	email, _ := middleware.GetUserEmail(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user, err := ctrl.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		// Auto-Create shell if user exists in Auth but not in our public table
		newUser := &entities.User{
			ID:               userID,
			Email:            email,
			ContactPref:      "email",
			Visibility:       "matches_only",
			Gender:           "prefer_not_to_say",
			GenderPreference: "both",
		}
		if err := ctrl.userRepo.Create(c.Request.Context(), newUser); err != nil {
			fmt.Printf("DATABASE SYNC ERROR: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync user"})
			return
		}
		user = newUser
	}

	c.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}

// UpdateProfile updates the current user's profile
func (ctrl *UserController) UpdateProfile(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	email, _ := middleware.GetUserEmail(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		FirstName         *string `json:"first_name" alias:"firstName"`
		LastName          *string `json:"last_name" alias:"lastName"`
		Bio               *string `json:"bio"`
		Instagram         *string `json:"instagram"`
		Phone             *string `json:"phone"`
		ContactPreference *string `json:"contact_preference" alias:"contactPreference"`
		Visibility        *string `json:"visibility"`
		Year              *string `json:"year"`
		Major             *string `json:"major"`
		Gender            *string `json:"gender"`
		GenderPreference  *string `json:"gender_preference" alias:"genderPreference"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get existing user or create if missing
	user, err := ctrl.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		user = &entities.User{
			ID:               userID,
			Email:            email,
			ContactPref:      "email",
			Visibility:       "matches_only",
			Gender:           "prefer_not_to_say",
			GenderPreference: "both",
		}
		// Create the initial record first
		if err := ctrl.userRepo.Create(c.Request.Context(), user); err != nil {
			fmt.Printf("DATABASE CREATE ERROR: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user record"})
			return
		}
	}

	// Update fields if provided
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Bio != nil {
		user.Bio = *req.Bio
	}
	if req.Instagram != nil {
		user.Instagram = *req.Instagram
	}
	if req.Phone != nil {
		user.Phone = *req.Phone
	}
	if req.ContactPreference != nil {
		user.ContactPref = *req.ContactPreference
	}
	if req.Visibility != nil {
		user.Visibility = *req.Visibility
	}
	if req.Year != nil {
		user.Year = *req.Year
	}
	if req.Major != nil {
		user.Major = *req.Major
	}
	if req.Gender != nil {
		user.Gender = *req.Gender
	}
	if req.GenderPreference != nil {
		user.GenderPreference = *req.GenderPreference
	}

	// Save updates
	if err := ctrl.userRepo.Update(c.Request.Context(), user); err != nil {
		fmt.Printf("DATABASE UPDATE ERROR: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    user,
		"message": "Profile updated successfully",
	})
}
func (ctrl *UserController) logDBError(op string, err error) {
	fmt.Printf("DATABASE ERROR [%s]: %v\n", op, err)
}
