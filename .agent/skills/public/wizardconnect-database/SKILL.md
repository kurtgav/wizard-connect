---
name: wizardconnect-database
description: "Supabase/PostgreSQL database operations for Wizard Connect platform including schema creation, migrations, and Row Level Security policies. Use when creating or modifying database tables, writing RLS policies for data security, running database migrations, defining triggers and functions, managing indexes and constraints."
---

# Wizard Connect Database

Supabase/PostgreSQL database schema, migrations, and security policies.

## Database Schema

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    instagram TEXT,
    phone TEXT,
    contact_preference TEXT DEFAULT 'email' CHECK (contact_preference IN ('email', 'phone', 'instagram')),
    visibility TEXT DEFAULT 'matches_only' CHECK (visibility IN ('public', 'matches_only', 'private')),
    year TEXT,
    major TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey responses
CREATE TABLE IF NOT EXISTS public.surveys (
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
);

-- Crushes
CREATE TABLE IF NOT EXISTS public.crushes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crush_email TEXT NOT NULL,
    rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, crush_email)
);

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(5,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    rank INTEGER NOT NULL,
    is_mutual_crush BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, matched_user_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (participant1 < participant2)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)

### Enabling RLS

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
```

### User Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Matches can view matched users
CREATE POLICY "Matches can view each other"
    ON public.users FOR SELECT
    USING (
        id IN (
            SELECT matched_user_id FROM matches
            WHERE user_id = auth.uid() AND user_id IS NOT NULL
        )
    );

-- Public profiles visible to everyone
CREATE POLICY "Public profiles are visible to everyone"
    ON public.users FOR SELECT
    USING (visibility = 'public');
```

### Survey Policies

```sql
CREATE POLICY "Users can view their own survey"
    ON public.surveys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create/update their own survey"
    ON public.surveys FOR ALL
    USING (auth.uid() = user_id);
```

### Crushes Policies

```sql
CREATE POLICY "Users can view their own crushes"
    ON public.crushes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crushes"
    ON public.crushes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crushes"
    ON public.crushes FOR DELETE
    USING (auth.uid() = user_id);
```

### Matches Policies

```sql
CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = user_id);
```

### Conversations and Messages

```sql
-- Conversations
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = participant1 OR auth.uid() = participant2);

-- Messages
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE participant1 = auth.uid() OR participant2 = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM conversations
            WHERE participant1 = auth.uid() OR participant2 = auth.uid()
        )
    );
```

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_year ON public.users(year);
CREATE INDEX idx_users_major ON public.users(major);

-- Surveys
CREATE INDEX idx_surveys_user_id ON public.surveys(user_id);
CREATE INDEX idx_surveys_complete ON public.surveys(is_complete);

-- Crushes
CREATE INDEX idx_crushes_user_id ON public.crushes(user_id);
CREATE INDEX idx_crushes_email ON public.crushes(crush_email);

-- Matches
CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_compatibility ON public.matches(compatibility_score DESC);

-- Conversations
CREATE INDEX idx_conversations_participant1 ON public.conversations(participant1);
CREATE INDEX idx_conversations_participant2 ON public.conversations(participant2);
CREATE INDEX idx_conversations_updated ON public.conversations(updated_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
```

## Triggers and Functions

### Updated Timestamp Trigger

```sql
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON public.surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Conversation Update Trigger

```sql
-- Function to update conversation last_message and updated_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message = NEW.content,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();
```

## Views

```sql
-- Matches with user details
CREATE OR REPLACE VIEW matches_with_details AS
SELECT
    m.id,
    m.user_id,
    m.matched_user_id,
    m.compatibility_score,
    m.rank,
    m.is_mutual_crush,
    m.created_at,
    u.email,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    u.year,
    u.major
FROM public.matches m
JOIN public.users u ON m.matched_user_id = u.id;

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

## Migrations

### Creating a New Migration

```sql
-- Create migration file in backend/supabase/migrations/
-- Format: 002_description.sql

-- Example: Add new column
ALTER TABLE public.users ADD COLUMN new_field TEXT;

-- Add index
CREATE INDEX idx_users_new_field ON public.users(new_field);

-- Add policy
CREATE POLICY "Policy description"
    ON public.users FOR SELECT
    USING (condition);
```

### Running Migrations

Run SQL directly in Supabase SQL Editor or use Supabase CLI:

```bash
supabase db push
```

## Common Queries

### Get User Profile

```sql
SELECT * FROM public.users WHERE id = auth.uid();
```

### Get User Survey

```sql
SELECT * FROM public.surveys WHERE user_id = auth.uid();
```

### Get User Matches

```sql
SELECT * FROM public.matches WHERE user_id = auth.uid() ORDER BY compatibility_score DESC;
```

### Get Conversations

```sql
SELECT * FROM public.conversations
WHERE participant1 = auth.uid() OR participant2 = auth.uid()
ORDER BY updated_at DESC;
```

### Get Messages in Conversation

```sql
SELECT * FROM public.messages
WHERE conversation_id = $1
ORDER BY created_at ASC;
```

### Check Mutual Crush

```sql
SELECT EXISTS (
    SELECT 1 FROM public.crushes
    WHERE user_id = $1 AND crush_email = $2
) AND EXISTS (
    SELECT 1 FROM public.crushes
    WHERE crush_email = $1 AND user_id = (SELECT id FROM auth.users WHERE email = $2 LIMIT 1)
);
```

## JSONB Operations

### Query Survey Responses

```sql
-- Get specific survey response
SELECT responses->>'question_id' as answer
FROM public.surveys
WHERE user_id = auth.uid();

-- Filter by survey response
SELECT * FROM public.surveys
WHERE responses->>'gender' = 'male';

-- Update specific field
UPDATE public.surveys
SET responses = jsonb_set(responses, '{new_field}', '"value"')
WHERE user_id = auth.uid();
```

## Performance Tips

- Always add indexes on foreign keys and frequently queried columns
- Use JSONB for flexible survey responses with indexing on top-level fields
- Enable connection pooling in Supabase settings
- Use `EXPLAIN ANALYZE` to analyze query performance
- Consider materialized views for complex queries

## Security Best Practices

- Always enable RLS on all tables
- Grant minimal necessary permissions
- Use parameterized queries to prevent SQL injection
- Never store sensitive data in plain text
- Use Supabase Auth for user authentication
- Implement rate limiting on API level
