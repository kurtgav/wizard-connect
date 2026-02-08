# ⚡ Wizard Connect Created by: Kurt Gavin

A university matching platform that connects students based on personality, interests, and values.

## 🏗️ Project Structure

```
wizard-connect/
├── frontend/          ← Next.js 16 frontend (TypeScript + Tailwind)
├── backend/           ← Go API server
├── docs/              ← Documentation
├── scripts/           ← Setup and utility scripts
└── .git/              ← Git repository

```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- Supabase account

### 1. Clone & Install
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
go mod download
```

### 2. Configure Environment

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

### 3. Run Locally
```bash
# Terminal 1: Backend
cd backend
go run cmd/api/main.go

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit: http://localhost:3000

## 📦 Deployment

- **Frontend**: Vercel → Root Directory: `frontend`
- **Backend**: Render → Root Directory: `backend`

## 📚 Documentation

See `docs/` folder for detailed guides.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase
- **Backend**: Go, Gin, PostgreSQL (via Supabase)
- **Auth**: Supabase Auth + JWT

## 📄 License

MIT
# Test commit
