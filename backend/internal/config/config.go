package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Supabase SupabaseConfig
	Auth     AuthConfig
	CORS     CORSConfig
}

type ServerConfig struct {
	Port            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
	Environment     string // "development", "production"
}

type SupabaseConfig struct {
	URL       string
	Key       string
	JWTSecret string
}

type AuthConfig struct {
	JWTSecret          string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
}

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	supabaseURL := getEnv("SUPABASE_URL", "")
	supabaseKey := getEnv("SUPABASE_ANON_KEY", "")
	supabaseJWT := getEnv("SUPABASE_JWT_SECRET", "")
	dbPassword := getEnv("DB_PASSWORD", "")
	jwtSecret := getEnv("JWT_SECRET", "")

	// Validate required environment variables
	if supabaseURL == "" {
		return nil, fmt.Errorf("SUPABASE_URL environment variable is required")
	}
	if supabaseKey == "" {
		return nil, fmt.Errorf("SUPABASE_ANON_KEY environment variable is required")
	}
	if supabaseJWT == "" {
		return nil, fmt.Errorf("SUPABASE_JWT_SECRET environment variable is required")
	}
	if dbPassword == "" {
		return nil, fmt.Errorf("DB_PASSWORD environment variable is required")
	}
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is required")
	}

	cfg := &Config{
		Server: ServerConfig{
			Port:            getEnv("PORT", "8080"),
			ReadTimeout:     15 * time.Second,
			WriteTimeout:    15 * time.Second,
			ShutdownTimeout: 10 * time.Second,
			Environment:     getEnv("ENVIRONMENT", "development"),
		},
		Supabase: SupabaseConfig{
			URL:       supabaseURL,
			Key:       supabaseKey,
			JWTSecret: supabaseJWT,
		},
		Auth: AuthConfig{
			JWTSecret:          jwtSecret,
			AccessTokenExpiry:  24 * time.Hour,
			RefreshTokenExpiry: 7 * 24 * time.Hour,
		},
		CORS: CORSConfig{
			AllowedOrigins: func() []string {
				origins := []string{"https://wizard-connect.vercel.app"}
				frontendURL := getEnv("FRONTEND_URL", "http://localhost:3000")
				if frontendURL != "" {
					parts := strings.Split(frontendURL, ",")
					for _, p := range parts {
						origins = append(origins, strings.TrimSpace(p))
					}
				}
				return origins
			}(),
			AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders: []string{"Content-Type", "Authorization"},
		},
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
