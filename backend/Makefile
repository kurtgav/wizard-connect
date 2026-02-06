.PHONY: run build test fmt lint clean deps

# Variables
BINARY_NAME=api
BINARY_PATH=bin/$(BINARY_NAME)
SOURCE_PATH=./cmd/api

# Run the application
run:
	@echo "Starting server..."
	@go run $(SOURCE_PATH)/main.go

# Build the application
build:
	@echo "Building..."
	@go build -o $(BINARY_PATH) $(SOURCE_PATH)/*.go
	@echo "Built $(BINARY_PATH)"

# Run tests
test:
	@echo "Running tests..."
	@go test -v ./...

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...

# Run linter
lint:
	@echo "Running linter..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run ./...; \
	else \
		echo "golangci-lint not installed. Install it from https://golangci-lint.run/usage/install/"; \
	fi

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@rm -rf bin/
	@go clean

# Install development tools
tools:
	@echo "Installing development tools..."
	@go install github.com/cosmtrek/air/golangci-lint/cmd/golangci-lint@latest

# Run with hot reload (requires air)
dev:
	@echo "Running with hot reload..."
	@if command -v air >/dev/null 2>&1; then \
		air; \
	else \
		echo "air not installed. Run: go install github.com/cosmtrek/air@latest"; \
		go run $(SOURCE_PATH)/main.go; \
	fi

# Docker build
docker-build:
	@echo "Building Docker image..."
	@docker build -t wizard-connect-api .

# Docker run
docker-run:
	@echo "Running Docker container..."
	@docker run -p 8080:8080 --env-file .env wizard-connect-api

# Help
help:
	@echo "Available commands:"
	@echo "  make run         - Run the application"
	@echo "  make build       - Build the application"
	@echo "  make test        - Run tests"
	@echo "  make fmt         - Format code"
	@echo "  make lint        - Run linter"
	@echo "  make deps        - Download dependencies"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make tools       - Install development tools"
	@echo "  make dev         - Run with hot reload"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run  - Run Docker container"
