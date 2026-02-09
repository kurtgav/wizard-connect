-- Fix for missing 'responses' column in surveys table
-- This migration ensures that surveys table has all required columns

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'responses'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN responses JSONB NOT NULL DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'personality_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN personality_type TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'interests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'values'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN "values" TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'lifestyle'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN lifestyle TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'is_complete'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN is_complete BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'completed_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'surveys'
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.surveys ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Drop ALL policies on surveys table (ignore if they don't exist)
DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own survey" ON public.surveys';
    EXECUTE 'DROP POLICY IF EXISTS "Users can create/update their own survey" ON public.surveys';
    EXECUTE 'DROP POLICY IF EXISTS "Users can create their own survey" ON public.surveys';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own survey" ON public.surveys';
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view their own survey"
    ON public.surveys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own survey"
    ON public.surveys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own survey"
    ON public.surveys FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_surveys_updated_at ON public.surveys;
CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON public.surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
