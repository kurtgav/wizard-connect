# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files first (better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s" \
    -a -installsuffix cgo \
    -o bin/api ./cmd/api

# Runtime stage - Use distroless for smaller image
FROM gcr.io/distroless/static-debian12

WORKDIR /root/

# Copy binary and ca-certificates
COPY --from=builder /app/bin/api .
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Expose port
EXPOSE 8080

# Run the application
CMD ["/root/api"]
