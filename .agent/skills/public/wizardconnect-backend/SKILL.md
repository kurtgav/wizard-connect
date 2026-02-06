---
name: wizardconnect-backend
description: "Go API development following clean architecture patterns for Wizard Connect platform. Use when creating new API endpoints or handlers, adding domain services or business logic, implementing database repositories, adding middleware or authentication logic, working with Gin HTTP framework."
---

# Wizard Connect Backend

Clean architecture Go API for university matchmaking platform.

## Architecture Overview

```
backend/
├── cmd/api/                # Application entry point
│   └── main.go
└── internal/
    ├── application/        # Use cases and DTOs (optional)
    ├── config/            # Configuration management
    ├── domain/            # Core business logic
    │   ├── entities/      # Business entities
    │   ├── repositories/  # Repository interfaces
    │   └── services/      # Domain services
    ├── infrastructure/    # External dependencies
    │   ├── database/      # Repository implementations
    │   ├── supabase/      # Supabase client
    │   └── http/         # HTTP middleware
    └── interface/         # External interfaces
        └── http/          # HTTP handlers & routes
```

## Creating New Endpoints

### 1. Define Domain Entity

```go
// internal/domain/entities/entity_name.go
package entities

type Entity struct {
    ID        string    `json:"id" db:"id"`
    Field     string    `json:"field" db:"field"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
```

### 2. Define Repository Interface

```go
// internal/domain/repositories/entity_name.go
package repositories

import "context"
import "wizard-connect/internal/domain/entities"

type EntityRepository interface {
    Create(ctx context.Context, entity *entities.Entity) error
    GetByID(ctx context.Context, id string) (*entities.Entity, error)
    Update(ctx context.Context, entity *entities.Entity) error
    Delete(ctx context.Context, id string) error
}
```

### 3. Implement Repository

```go
// internal/infrastructure/database/entity_name.go
package database

import (
    "context"
    "database/sql"
    "wizard-connect/internal/domain/entities"
    "wizard-connect/internal/domain/repositories"
)

type entityRepository struct {
    db *sql.DB
}

func NewEntityRepository(db *sql.DB) repositories.EntityRepository {
    return &entityRepository{db: db}
}

func (r *entityRepository) Create(ctx context.Context, entity *entities.Entity) error {
    query := `INSERT INTO entities (id, field) VALUES ($1, $2)`
    _, err := r.db.ExecContext(ctx, query, entity.ID, entity.Field)
    return err
}
```

### 4. Create Controller

```go
// internal/interface/http/controllers/entity_name.go
package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type EntityController struct {
    repo repositories.EntityRepository
}

func NewEntityController(repo repositories.EntityRepository) *EntityController {
    return &EntityController{repo: repo}
}

func (c *EntityController) Create(ctx *gin.Context) {
    var req CreateEntityRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    entity := &entities.Entity{
        ID:    uuid.New().String(),
        Field: req.Field,
    }

    if err := c.repo.Create(ctx, entity); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    ctx.JSON(http.StatusCreated, entity)
}
```

### 5. Register Routes

```go
// internal/interface/http/routes/routes.go
package routes

import (
    "github.com/gin-gonic/gin"
    "wizard-connect/internal/interface/http/controllers"
)

func RegisterRoutes(
    router *gin.Engine,
    entityController *controllers.EntityController,
) {
    v1 := router.Group("/api/v1")

    entities := v1.Group("/entities")
    {
        entities.POST("", entityController.Create)
        entities.GET("/:id", entityController.GetByID)
    }
}
```

## Authentication

### JWT Middleware

```go
// internal/interface/http/middleware/auth.go
package middleware

import (
    "net/http"
    "strings"
    "github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
    return func(ctx *gin.Context) {
        authHeader := ctx.GetHeader("Authorization")
        if authHeader == "" {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing auth header"})
            return
        }

        token := strings.TrimPrefix(authHeader, "Bearer ")
        if token == authHeader {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid auth header"})
            return
        }

        claims, err := ValidateJWT(token, jwtSecret)
        if err != nil {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            return
        }

        ctx.Set("user_id", claims.UserID)
        ctx.Next()
    }
}
```

### Protect Routes

```go
// internal/interface/http/routes/routes.go
func RegisterRoutes(
    router *gin.Engine,
    entityController *controllers.EntityController,
    authMiddleware gin.HandlerFunc,
) {
    v1 := router.Group("/api/v1")
    v1.Use(authMiddleware) // Apply auth to all v1 routes

    // Or apply to specific groups
    public := v1.Group("/public")
    protected := v1.Group("/protected")
    protected.Use(authMiddleware)
}
```

## Domain Services

### Example Service

```go
// internal/domain/services/entity_service.go
package services

import (
    "context"
    "wizard-connect/internal/domain/entities"
    "wizard-connect/internal/domain/repositories"
)

type EntityService interface {
    ProcessEntity(ctx context.Context, id string) error
}

type entityService struct {
    repo repositories.EntityRepository
}

func NewEntityService(repo repositories.EntityRepository) EntityService {
    return &entityService{repo: repo}
}

func (s *entityService) ProcessEntity(ctx context.Context, id string) error {
    entity, err := s.repo.GetByID(ctx, id)
    if err != nil {
        return err
    }

    // Business logic here

    return s.repo.Update(ctx, entity)
}
```

## Database Operations

### Using Supabase Client

```go
// internal/infrastructure/supabase/client.go
package supabase

import (
    "github.com/supabase-community/supabase-go"
)

func NewClient(url, key string) *supabase.Client {
    return supabase.NewClient(url, key, nil)
}

// Usage in repository
client := NewClient(config.SupabaseURL, config.SupabaseAnonKey)

data, _, err := client.From("users").Select("*", "", false).Execute()
```

### Using Direct PostgreSQL

```go
// internal/infrastructure/database/database.go
package database

import (
    "database/sql"
    _ "github.com/lib/pq"
)

func NewConnection(connectionString string) (*sql.DB, error) {
    return sql.Open("postgres", connectionString)
}

// Usage in repository
rows, err := db.QueryContext(ctx, "SELECT id, field FROM entities WHERE id = $1", id)
```

## Response Patterns

### Standard Response

```go
ctx.JSON(http.StatusOK, gin.H{
    "data": entity,
})

// Error response
ctx.JSON(http.StatusBadRequest, gin.H{
    "error": "error message",
})
```

### Pagination Response

```go
type PaginatedResponse struct {
    Data       []T     `json:"data"`
    Total      int     `json:"total"`
    Page       int     `json:"page"`
    PageSize   int     `json:"page_size"`
}

ctx.JSON(http.StatusOK, PaginatedResponse{
    Data:     entities,
    Total:    total,
    Page:     page,
    PageSize: pageSize,
})
```

## Error Handling

```go
import (
    "errors"
)

var (
    ErrNotFound      = errors.New("not found")
    ErrValidation   = errors.New("validation error")
    ErrUnauthorized  = errors.New("unauthorized")
)

// In controller
if err != nil {
    if errors.Is(err, ErrNotFound) {
        ctx.JSON(http.StatusNotFound, gin.H{"error": "not found"})
        return
    }
    ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
    return
}
```

## Configuration

```go
// internal/config/config.go
package config

import "github.com/joho/godotenv"

type Config struct {
    ServerPort     string
    Environment    string
    SupabaseURL   string
    SupabaseAnonKey string
    JWTSecret     string
}

func Load() (*Config, error) {
    godotenv.Load()

    return &Config{
        ServerPort:     getEnv("SERVER_PORT", "8080"),
        Environment:    getEnv("ENVIRONMENT", "development"),
        SupabaseURL:   getEnv("SUPABASE_URL", ""),
        SupabaseAnonKey: getEnv("SUPABASE_ANON_KEY", ""),
        JWTSecret:     getEnv("JWT_SECRET", ""),
    }, nil
}
```

## Testing

```go
// internal/domain/services/entity_service_test.go
package services_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestProcessEntity(t *testing.T) {
    mockRepo := &MockEntityRepository{}
    service := NewEntityService(mockRepo)

    err := service.ProcessEntity(context.Background(), "test-id")
    assert.NoError(t, err)
}
```

## Makefile Commands

```bash
make run      # Run the server
make build    # Build binary
make test     # Run tests
make fmt      # Format code
make lint     # Run linter
```
