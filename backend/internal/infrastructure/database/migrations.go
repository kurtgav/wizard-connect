package database

import (
	"context"
	"fmt"
	"log"
)

// AutoMigrate ensures the database schema is up to date and self-heals missing columns/policies
func (d *Database) AutoMigrate(ctx context.Context) error {
	log.Println("🚀 Running AGENT-GRADE Auto-Migration...")

	// 0. Enable Extensions
	extensions := []string{
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
		`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
	}
	for _, q := range extensions {
		d.Exec(ctx, q)
	}

	// 1. Repair Users Table
	userCols := []struct {
		Name string
		Type string
	}{
		{"email", "TEXT"},
		{"first_name", "TEXT"},
		{"last_name", "TEXT"},
		{"avatar_url", "TEXT"},
		{"bio", "TEXT"},
		{"instagram", "TEXT"},
		{"phone", "TEXT"},
		{"contact_preference", "TEXT DEFAULT 'email'"},
		{"visibility", "TEXT DEFAULT 'matches_only'"},
		{"year", "TEXT"},
		{"major", "TEXT"},
		{"gender", "TEXT"},
		{"gender_preference", "TEXT"},
	}
	for _, col := range userCols {
		query := fmt.Sprintf("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS %s %s", col.Name, col.Type)
		d.Exec(ctx, query)
	}

	// 2. Repair Surveys Table
	d.Exec(ctx, `CREATE TABLE IF NOT EXISTS public.surveys (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
		responses JSONB NOT NULL DEFAULT '{}',
		personality_type TEXT,
		interests TEXT[] DEFAULT '{}',
		values TEXT[] DEFAULT '{}',
		lifestyle TEXT,
		is_complete BOOLEAN DEFAULT FALSE,
		completed_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	surveyCols := []struct {
		Name string
		Type string
	}{
		{"personality_type", "TEXT"},
		{"interests", "TEXT[] DEFAULT '{}'"},
		{"values", "TEXT[] DEFAULT '{}'"},
		{"lifestyle", "TEXT"},
		{"is_complete", "BOOLEAN DEFAULT FALSE"},
	}
	for _, col := range surveyCols {
		query := fmt.Sprintf("ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS %s %s", col.Name, col.Type)
		d.Exec(ctx, query)
	}

	// 3. Repair Matches Table
	d.Exec(ctx, `CREATE TABLE IF NOT EXISTS public.matches (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
		matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
		compatibility_score DECIMAL(5,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
		rank INTEGER NOT NULL,
		is_mutual_crush BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		UNIQUE(user_id, matched_user_id)
	)`)
	matchCols := []struct {
		Name string
		Type string
	}{
		{"user_id", "UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE"},
		{"matched_user_id", "UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE"},
		{"compatibility_score", "DECIMAL(5,2) NOT NULL DEFAULT 0.0"},
		{"rank", "INTEGER NOT NULL DEFAULT 1"},
		{"is_mutual_crush", "BOOLEAN DEFAULT FALSE"},
		{"created_at", "TIMESTAMPTZ DEFAULT NOW()"},
	}
	for _, col := range matchCols {
		query := fmt.Sprintf("ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS %s %s", col.Name, col.Type)
		d.Exec(ctx, query)
	}
	// Create indexes for matches
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id)`)
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_matches_compatibility ON public.matches(compatibility_score DESC)`)

	// 4. Repair Crushes Table
	d.Exec(ctx, `CREATE TABLE IF NOT EXISTS public.crushes (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
		crush_email TEXT NOT NULL,
		rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 5),
		created_at TIMESTAMPTZ DEFAULT NOW(),
		UNIQUE(user_id, crush_email)
	)`)
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_crushes_user_id ON public.crushes(user_id)`)

	// 5. Repair Conversations Table
	d.Exec(ctx, `CREATE TABLE IF NOT EXISTS public.conversations (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		participant1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
		participant2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
		last_message TEXT,
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		created_at TIMESTAMPTZ DEFAULT NOW(),
		CHECK (participant1 < participant2)
	)`)
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1)`)
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2)`)
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC)`)

	// 6. Repair Messages Table
	d.Exec(ctx, `CREATE TABLE IF NOT EXISTS public.messages (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
		sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
		content TEXT NOT NULL,
		is_read BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at)`)
	d.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id)`)

	// 7. Repair Constraints
	constraints := []string{
		`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_gender`,
		`ALTER TABLE public.users ADD CONSTRAINT check_gender CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say', 'other', '') OR gender IS NULL)`,
		`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_gender_preference`,
		`ALTER TABLE public.users ADD CONSTRAINT check_gender_preference CHECK (gender_preference IN ('male', 'female', 'both', '') OR gender_preference IS NULL)`,
	}
	for _, q := range constraints {
		d.Exec(ctx, q)
	}

	// 8. Setup RLS Policies for all tables
	// Users table
	d.Exec(ctx, `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can manage own profile" ON public.users`)
	d.Exec(ctx, `CREATE POLICY "Users can manage own profile" ON public.users FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Public view" ON public.users`)
	d.Exec(ctx, `CREATE POLICY "Public view" ON public.users FOR SELECT USING (true)`)

	// Surveys table
	d.Exec(ctx, `ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can manage own survey" ON public.surveys`)
	d.Exec(ctx, `CREATE POLICY "Users can manage own survey" ON public.surveys FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`)

	// Matches table
	d.Exec(ctx, `ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can view own matches" ON public.matches`)
	d.Exec(ctx, `CREATE POLICY "Users can view own matches" ON public.matches FOR SELECT USING (auth.uid() = user_id)`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can insert own matches" ON public.matches`)
	d.Exec(ctx, `CREATE POLICY "Users can insert own matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() = user_id)`)

	// Crushes table
	d.Exec(ctx, `ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can manage own crushes" ON public.crushes`)
	d.Exec(ctx, `CREATE POLICY "Users can manage own crushes" ON public.crushes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`)

	// Conversations table
	d.Exec(ctx, `ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations`)
	d.Exec(ctx, `CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant1 OR auth.uid() = participant2)`)

	// Messages table
	d.Exec(ctx, `ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can view own messages" ON public.messages`)
	d.Exec(ctx, `CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
		conversation_id IN (
			SELECT id FROM conversations
			WHERE participant1 = auth.uid() OR participant2 = auth.uid()
		)
	)`)
	d.Exec(ctx, `DROP POLICY IF EXISTS "Users can send messages" ON public.messages`)
	d.Exec(ctx, `CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (
		sender_id = auth.uid() AND
		conversation_id IN (
			SELECT id FROM conversations
			WHERE participant1 = auth.uid() OR participant2 = auth.uid()
		)
	)`)

	log.Println("✅ Auto-Migration Complete. Database is now SELF-HEALED.")
	return nil
}
