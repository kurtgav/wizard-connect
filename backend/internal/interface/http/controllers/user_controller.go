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
		ctrl.userRepo.Create(c.Request.Context(), newUser)
		user = newUser
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

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
		ctrl.userRepo.Create(c.Request.Context(), user)
	}

	if req.FirstName != nil && *req.FirstName != "" {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil && *req.LastName != "" {
		user.LastName = *req.LastName
	}
	if req.Bio != nil && *req.Bio != "" {
		user.Bio = *req.Bio
	}
	if req.Instagram != nil && *req.Instagram != "" {
		user.Instagram = *req.Instagram
	}
	if req.Phone != nil && *req.Phone != "" {
		user.Phone = *req.Phone
	}
	if req.ContactPreference != nil && *req.ContactPreference != "" {
		user.ContactPref = *req.ContactPreference
	}
	if req.Visibility != nil && *req.Visibility != "" {
		user.Visibility = *req.Visibility
	}
	if req.Year != nil && *req.Year != "" {
		user.Year = *req.Year
	}
	if req.Major != nil && *req.Major != "" {
		user.Major = *req.Major
	}
	if req.Gender != nil && *req.Gender != "" {
		user.Gender = *req.Gender
	}
	if req.GenderPreference != nil && *req.GenderPreference != "" {
		user.GenderPreference = *req.GenderPreference
	}

	if err := ctrl.userRepo.Update(c.Request.Context(), user); err != nil {
		fmt.Printf("DATABASE UPDATE ERROR: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update profile",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user, "message": "Profile updated successfully"})
}
func (ctrl *UserController) logDBError(op string, err error) {
	fmt.Printf("DATABASE ERROR [%s]: %v\n", op, err)
}
