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

	"wizard-connect/internal/config"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"
	"wizard-connect/internal/interface/http/routes"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	env := os.Getenv("GIN_MODE")
	if env == "" && cfg.Server.Environment == "production" {
		env = "release"
	}
	if env != "" {
		gin.SetMode(env)
	}

	// Initialize database
	dbURL := getDatabaseURL(cfg)
	db, err := database.NewDatabase(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Configure database connection pool
	db.DB.SetMaxOpenConns(getEnvAsInt("DB_MAX_OPEN_CONNS", 25))
	db.DB.SetMaxIdleConns(getEnvAsInt("DB_MAX_IDLE_CONNS", 10))
	db.DB.SetConnMaxLifetime(getEnvAsDuration("DB_CONN_MAX_LIFETIME", 5*time.Minute))
	db.DB.SetConnMaxIdleTime(getEnvAsDuration("DB_CONN_MAX_IDLETIME", 1*time.Minute))

	// Run auto-migrations
	if err := db.AutoMigrate(context.Background()); err != nil {
		log.Printf("Migration warning: %v", err)
	}

	// Create Gin router
	router := gin.New()

	// 1. Global Middleware (Apply to ALL routes including System/Socket/API)
	router.Use(gin.Recovery())
	router.Use(gin.Logger())
	router.Use(gzip.Gzip(gzip.DefaultCompression))

	// Apply CORS globally - handles all OPTIONS preflights and Origin checks
	router.Use(middleware.NewCORS(middleware.CORSConfig{
		AllowedOrigins: cfg.CORS.AllowedOrigins,
		AllowedMethods: cfg.CORS.AllowedMethods,
		AllowedHeaders: cfg.CORS.AllowedHeaders,
	}))

	// 2. System Endpoints
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().UTC(),
		})
	})

	// 3. API & WebSocket routes
	rateLimiter := middleware.NewRateLimiter(100, 200)
	rateLimiter.Cleanup(5 * time.Minute)

	apiGroup := router.Group("/api/v1")
	apiGroup.Use(rateLimiter.RateLimit())

	// Initialize and mount all functional routes
	routes.SetupRoutes(router, apiGroup, db, cfg)

	// Start server
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

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
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		return dbURL
	}
	return fmt.Sprintf(
		"postgresql://postgres:%s@db.%s.supabase.co:5432/postgres?sslmode=require",
		os.Getenv("DB_PASSWORD"),
		getProjectID(cfg.Supabase.URL),
	)
}

func getProjectID(url string) string {
	url = strings.TrimPrefix(url, "https://")
	url = strings.TrimPrefix(url, "http://")
	parts := strings.Split(url, ".")
	if len(parts) > 0 {
		return parts[0]
	}
	return ""
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		var result int
		if _, err := fmt.Sscanf(value, "%d", &result); err == nil {
			return result
		}
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if result, err := time.ParseDuration(value); err == nil {
			return result
		}
	}
	return defaultValue
}
