-- Wizard Connect Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    year TEXT, -- 1st Year, 2nd Year, 3rd Year, 4th Year, 5th Year+
    major TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

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

-- Public profiles can be viewed by everyone
CREATE POLICY "Public profiles are visible to everyone"
    ON public.users FOR SELECT
    USING (visibility = 'public');

-- Survey responses table
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

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own survey"
    ON public.surveys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create/update their own survey"
    ON public.surveys FOR ALL
    USING (auth.uid() = user_id);

-- Crushes table
CREATE TABLE IF NOT EXISTS public.crushes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crush_email TEXT NOT NULL,
    rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, crush_email)
);

ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crushes"
    ON public.crushes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crushes"
    ON public.crushes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crushes"
    ON public.crushes FOR DELETE
    USING (auth.uid() = user_id);

-- Matches table
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

-- Index for faster lookups
CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_compatibility ON public.matches(compatibility_score DESC);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = user_id);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (participant1 < participant2) -- Ensure consistent ordering
);

CREATE INDEX idx_conversations_participant1 ON public.conversations(participant1);
CREATE INDEX idx_conversations_participant2 ON public.conversations(participant2);
CREATE INDEX idx_conversations_updated ON public.conversations(updated_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = participant1 OR auth.uid() = participant2);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Senders can update their own messages"
    ON public.messages FOR UPDATE
    USING (sender_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON public.surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Create a view for matches with user details
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
