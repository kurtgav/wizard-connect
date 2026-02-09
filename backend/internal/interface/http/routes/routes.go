package routes

import (
	"wizard-connect/internal/config"
	"wizard-connect/internal/domain/services"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/controllers"
	"wizard-connect/internal/interface/http/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.RouterGroup, db *database.Database, cfg *config.Config) {
	// Initialize repositories
	userRepo := database.NewUserRepository(db)
	surveyRepo := database.NewSurveyRepository(db)
	matchRepo := database.NewMatchRepository(db)
	crushRepo := database.NewCrushRepository(db)
	messageRepo := database.NewMessageRepository(db)
	conversationRepo := database.NewConversationRepository(db)
	campaignRepo := database.NewCampaignRepository(db.DB)
	adminRepo := database.NewAdminRepository(db)

	// Initialize services
	matchingService := services.NewMatchingService(surveyRepo, crushRepo, matchRepo)

	// Initialize controllers
	userController := controllers.NewUserController(userRepo)
	surveyController := controllers.NewSurveyController(surveyRepo)
	matchController := controllers.NewMatchController(matchRepo, surveyRepo, matchingService)
	messageController := controllers.NewMessageController(conversationRepo, messageRepo, userRepo)
	crushController := controllers.NewCrushController(crushRepo)
	campaignController := controllers.NewCampaignController(campaignRepo)
	adminController := controllers.NewAdminController(adminRepo, userRepo)

	// Initialize auth middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.Auth.JWTSecret)
	adminMiddleware := middleware.NewAdminMiddleware(adminRepo)

	// Public routes
	public := router.Group("")
	{
		public.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "time": "healthy"})
		})
	}

	// Protected routes (require authentication)
	protected := router.Group("")
	protected.Use(authMiddleware.Authenticate())
	{
		// User routes
		users := protected.Group("/users")
		{
			users.GET("/me", userController.GetProfile)
			users.PUT("/me", userController.UpdateProfile)
		}

		// Survey routes
		surveys := protected.Group("/surveys")
		{
			surveys.GET("", surveyController.GetSurvey)
			surveys.POST("", surveyController.SubmitSurvey)
		}

		// Match routes
		matches := protected.Group("/matches")
		{
			matches.GET("", matchController.GetMatches)
			matches.POST("/generate", matchController.GenerateMatches)
		}

		// Message routes
		messages := protected.Group("/messages")
		{
			messages.GET("/conversations", messageController.GetConversations)
			messages.GET("/conversations/:id", messageController.GetMessages)
			messages.POST("/conversations/:id/messages", messageController.SendMessage)
		}

		// Crush routes
		crushes := protected.Group("/crushes")
		{
			crushes.GET("", crushController.GetCrushes)
			crushes.POST("", crushController.SubmitCrushes)
		}

		// Admin routes (require admin role)
		admin := protected.Group("/admin")
		admin.Use(adminMiddleware.RequireAdmin())
		{
			// Admin management
			admins := admin.Group("/admins")
			{
				admins.GET("", adminController.ListAdmins)
				admins.POST("/add", adminController.AddAdmin)
				admins.POST("/remove", adminController.RemoveAdmin)
			}

			// User management
			users := admin.Group("/users")
			{
				users.GET("", adminController.GetAllUsers)
			}

			// Campaign management
			campaigns := admin.Group("/campaigns")
			{
				campaigns.POST("", campaignController.CreateCampaign)
				campaigns.GET("", campaignController.GetCampaigns)
				campaigns.GET("/:id", campaignController.GetCampaignByID)
				campaigns.PUT("/:id", campaignController.UpdateCampaign)
				campaigns.DELETE("/:id", campaignController.DeleteCampaign)
				campaigns.POST("/:id/run-algorithm", campaignController.RunMatchingAlgorithm)
				campaigns.GET("/:id/statistics", campaignController.GetCampaignStatistics)
			}
		}
	}
}
