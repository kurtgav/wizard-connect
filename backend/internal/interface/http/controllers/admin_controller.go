package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"wizard-connect/internal/domain/repositories"
)

type AdminController struct {
	adminRepo repositories.AdminRepository
	userRepo  repositories.UserRepository
}

type AddAdminRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type RemoveAdminRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func NewAdminController(
	adminRepo repositories.AdminRepository,
	userRepo repositories.UserRepository,
) *AdminController {
	return &AdminController{
		adminRepo: adminRepo,
		userRepo:  userRepo,
	}
}

func (ctrl *AdminController) ListAdmins(c *gin.Context) {
	admins, err := ctrl.adminRepo.ListAdmins(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admins"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"admins": admins,
	})
}

func (ctrl *AdminController) AddAdmin(c *gin.Context) {
	var req AddAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.adminRepo.AddAdmin(c.Request.Context(), req.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add admin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Admin added successfully",
		"email":   req.Email,
	})
}

func (ctrl *AdminController) RemoveAdmin(c *gin.Context) {
	var req RemoveAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.adminRepo.RemoveAdmin(c.Request.Context(), req.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove admin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Admin removed successfully",
		"email":   req.Email,
	})
}

func (ctrl *AdminController) GetAllUsers(c *gin.Context) {
	users, err := ctrl.userRepo.ListAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"count": len(users),
	})
}
