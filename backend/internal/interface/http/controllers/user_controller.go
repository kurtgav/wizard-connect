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
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	email, _ := middleware.GetUserEmail(c)

	fmt.Printf("DEBUG: Fetching profile for userID=%s, email=%s\n", userID, email)

	user, err := ctrl.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		fmt.Printf("DEBUG: User not found in database, creating shell user. Error: %v\n", err)

		// Auto-Create shell if user exists in Auth but not in our public table
		newUser := &entities.User{
			ID:               userID,
			Email:            email,
			ContactPref:      "email",
			Visibility:       "matches_only",
			Gender:           "prefer_not_to_say",
			GenderPreference: "both",
		}

		createErr := ctrl.userRepo.Create(c.Request.Context(), newUser)
		if createErr != nil {
			fmt.Printf("ERROR: Failed to create shell user: %v\n", createErr)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user profile"})
			return
		}

		fmt.Printf("DEBUG: Shell user created successfully: %+v\n", newUser)
		user = newUser
	} else {
		fmt.Printf("DEBUG: User found in database: %+v\n", user)
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
		AvatarURL         *string `json:"avatar_url" alias:"avatarUrl"`
		ContactPreference *string `json:"contact_preference" alias:"contactPreference"`
		Visibility        *string `json:"visibility"`
		Year              *string `json:"year"`
		Major             *string `json:"major"`
		Gender            *string `json:"gender"`
		GenderPreference  *string `json:"gender_preference" alias:"genderPreference"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Log full request body for debugging
	fmt.Printf("DEBUG: Full update request: %+v\n", req)

	fmt.Printf("DEBUG: Updating profile for userID=%s, email=%s\n", userID, email)

	user, err := ctrl.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		fmt.Printf("DEBUG: User not found in database, creating shell user for update. Error: %v\n", err)
		user = &entities.User{
			ID:               userID,
			Email:            email,
			ContactPref:      "email",
			Visibility:       "matches_only",
			Gender:           "prefer_not_to_say",
			GenderPreference: "both",
		}

		createErr := ctrl.userRepo.Create(c.Request.Context(), user)
		if createErr != nil {
			fmt.Printf("ERROR: Failed to create shell user: %v\n", createErr)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user profile"})
			return
		}

		fmt.Printf("DEBUG: Shell user created successfully: %+v\n", user)
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
	if req.AvatarURL != nil && *req.AvatarURL != "" {
		user.AvatarURL = *req.AvatarURL
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

	fmt.Printf("DEBUG: Updating user with data: %+v\n", user)
	fmt.Printf("DEBUG: AvatarURL received: %v\n", req.AvatarURL)

	if err := ctrl.userRepo.Update(c.Request.Context(), user); err != nil {
		fmt.Printf("DATABASE UPDATE ERROR: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update profile",
			"details": err.Error(),
		})
		return
	}

	fmt.Printf("DEBUG: User profile updated successfully\n")

	c.JSON(http.StatusOK, gin.H{"data": user, "message": "Profile updated successfully"})
}
