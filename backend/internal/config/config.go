package config

import (
	"os"
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
	URL    string
	Key    string
	JWTSecret string
}

type AuthConfig struct {
	JWTSecret           string
	AccessTokenExpiry   time.Duration
	RefreshTokenExpiry  time.Duration
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

	cfg := &Config{
		Server: ServerConfig{
			Port:            getEnv("SERVER_PORT", "8080"),
			ReadTimeout:     15 * time.Second,
			WriteTimeout:    15 * time.Second,
			ShutdownTimeout: 10 * time.Second,
			Environment:     getEnv("ENVIRONMENT", "development"),
		},
		Supabase: SupabaseConfig{
			URL:       getEnv("SUPABASE_URL", ""),
			Key:       getEnv("SUPABASE_ANON_KEY", ""),
			JWTSecret: getEnv("SUPABASE_JWT_SECRET", ""),
		},
		Auth: AuthConfig{
			JWTSecret:          getEnv("JWT_SECRET", ""),
			AccessTokenExpiry:  24 * time.Hour,
			RefreshTokenExpiry: 7 * 24 * time.Hour,
		},
		CORS: CORSConfig{
			AllowedOrigins: []string{
				getEnv("FRONTEND_URL", "http://localhost:3000"),
				"https://wizard-connect.vercel.app",
			},
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
