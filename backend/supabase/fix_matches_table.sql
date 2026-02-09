-- Fix for matches table schema issues
-- This migration ensures matches table has all required columns

-- Check if table exists, create if not
DO $$
BEGIN
    -- Drop table if it exists (will recreate with correct schema)
    DROP TABLE IF EXISTS public.matches CASCADE;
END $$;

-- Create matches table with correct schema
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

-- Enable Row Level Security
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Drop ALL policies if they exist
DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches';
END $$;

-- Create RLS policies
CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matches"
    ON public.matches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_compatibility ON public.matches(compatibility_score DESC);
