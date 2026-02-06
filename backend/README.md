# Wizard Connect Backend

A production-ready Go backend API for the Wizard Connect matchmaking platform, built with clean architecture principles.

## Tech Stack

- **Go 1.21** - Programming language
- **Gin** - HTTP web framework
- **Supabase/PostgreSQL** - Database and authentication
- **JWT** - Authentication tokens
- **Render** - Hosting (free tier)

## Architecture

This project follows **Clean Architecture** principles:

```
.
├── cmd/                    # Application entry points
│   └── api/
│       └── main.go
├── internal/
│   ├── application/        # Application use cases & DTOs
│   ├── config/            # Configuration management
│   ├── domain/            # Domain entities & business logic
│   │   ├── entities/      # Business entities
│   │   ├── repositories/  # Repository interfaces
│   │   └── services/      # Domain services (e.g., matching algorithm)
│   ├── infrastructure/    # External dependencies
│   │   ├── database/      # Database implementations
│   │   ├── supabase/      # Supabase client
│   │   └── middleware/    # HTTP middleware
│   └── interface/         # External interfaces
│       └── http/          # HTTP handlers & routes
└── pkg/                   # Reusable packages
```

## Features

- ✅ Clean architecture with separation of concerns
- ✅ Secure JWT authentication
- ✅ Rate limiting (100 req/s with burst of 200)
- ✅ CORS configuration
- ✅ Comprehensive matching algorithm
- ✅ Supabase integration
- ✅ SQL injection protection
- ✅ Graceful shutdown
- ✅ Health check endpoint
- ✅ Structured logging

## Getting Started

### Prerequisites

- Go 1.21 or higher
- Supabase account (free tier)
- PostgreSQL database (via Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wizard-connect-backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase credentials:
   ```env
   SERVER_PORT=8080
   ENVIRONMENT=development

   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_JWT_SECRET=your-jwt-secret
   DB_PASSWORD=your-db-password

   JWT_SECRET=your-super-secret-key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Go to Supabase SQL Editor
   - Run the SQL migration: `supabase/migrations/001_initial_schema.sql`

5. **Run the server**
   ```bash
   make run
   # or
   go run cmd/api/main.go
   ```

The API will be available at `http://localhost:8080`

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Authentication (via Supabase)
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile

### Survey
- `GET /api/v1/surveys` - Get user survey responses
- `POST /api/v1/surveys` - Submit/update survey

### Matches
- `GET /api/v1/matches` - Get user's matches
- `POST /api/v1/matches/generate` - Generate new matches

### Messages
- `GET /api/v1/messages/conversations` - Get all conversations
- `GET /api/v1/messages/conversations/:id` - Get messages in a conversation
- `POST /api/v1/messages/conversations/:id/messages` - Send a message

### Crushes
- `GET /api/v1/crushes` - Get user's crush list
- `POST /api/v1/crushes` - Submit crush list

## Development

### Running tests
```bash
make test
```

### Building
```bash
make build
```

### Formatting code
```bash
make fmt
```

### Linting
```bash
make lint
```

## Deployment

### Render (Free Tier)

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure settings**:
   - Runtime: Go
   - Build Command: `go build -o bin/api ./cmd/api`
   - Start Command: `./bin/api`
4. **Add Environment Variables** (from `.env`)
5. **Deploy!**

The `render.yaml` file includes all necessary configurations.

### Environment Variables for Production

```env
ENVIRONMENT=production
SERVER_PORT=8080
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>
DB_PASSWORD=<your-db-password>
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://wizard-connect.vercel.app
```

## Security

- ✅ JWT authentication with Supabase
- ✅ Rate limiting per IP/user
- ✅ CORS protection
- ✅ SQL injection prevention (prepared statements)
- ✅ Row Level Security (RLS) in Supabase
- ✅ Environment variable protection
- ✅ Secure password hashing (via Supabase Auth)

## Performance

- Connection pooling
- Indexed database queries
- Efficient memory usage
- Graceful shutdown with timeout
- Context-based cancellation

## Monitoring

- Health check endpoint at `/health`
- Structured logging with timestamps
- Error tracking and reporting

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
