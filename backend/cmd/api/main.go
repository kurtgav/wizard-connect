package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"wizard-connect/internal/config"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"
	"wizard-connect/internal/interface/http/routes"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	db, err := database.NewDatabase(getDatabaseURL(cfg))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Create Gin router
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(gin.Logger())
	router.Use(middleware.NewCORS(middleware.CORSConfig{
		AllowedOrigins: cfg.CORS.AllowedOrigins,
		AllowedMethods: cfg.CORS.AllowedMethods,
		AllowedHeaders: cfg.CORS.AllowedHeaders,
	}))

	// Initialize rate limiter (100 requests per second, burst of 200)
	rateLimiter := middleware.NewRateLimiter(100, 200)
	rateLimiter.Cleanup(5 * time.Minute) // Cleanup every 5 minutes

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().UTC(),
		})
	})

	// API routes
	api := router.Group("/api/v1")
	api.Use(rateLimiter.RateLimit())
	routes.SetupRoutes(api, db, cfg)

	// Start server
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	// Graceful shutdown
	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

func getDatabaseURL(cfg *config.Config) string {
	return fmt.Sprintf(
		"postgresql://postgres:%s@db.%s.supabase.co:5432/postgres?sslmode=require",
		os.Getenv("DB_PASSWORD"),
		getProjectID(cfg.Supabase.URL),
	)
}

func getProjectID(url string) string {
	// Extract project ID from Supabase URL
	// Format: https://XXXXXX.supabase.co
	parts := strings.Split(url, ".")
	if len(parts) > 1 {
		return parts[0]
	}
	return ""
}
