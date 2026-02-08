package middleware

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AdminRepository interface {
	IsAdmin(ctx context.Context, userID string) (bool, error)
}

type AdminMiddleware struct {
	adminRepo AdminRepository
}

func NewAdminMiddleware(adminRepo AdminRepository) *AdminMiddleware {
	return &AdminMiddleware{
		adminRepo: adminRepo,
	}
}

// RequireAdmin checks if the user is an admin
func (m *AdminMiddleware) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserID(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		isAdmin, err := m.adminRepo.IsAdmin(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify admin status"})
			c.Abort()
			return
		}

		if !isAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
