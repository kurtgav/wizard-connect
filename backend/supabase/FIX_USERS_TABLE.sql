-- FIX USERS TABLE - Add missing columns
-- This migration adds avatar_url and all other missing columns to users table

-- Check and add avatar_url if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'year'
    ) THEN
        ALTER TABLE public.users ADD COLUMN year TEXT;
        RAISE NOTICE 'Added year column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'major'
    ) THEN
        ALTER TABLE public.users ADD COLUMN major TEXT;
        RAISE NOTICE 'Added major column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'gender'
    ) THEN
        ALTER TABLE public.users ADD COLUMN gender TEXT;
        RAISE NOTICE 'Added gender column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'gender_preference'
    ) THEN
        ALTER TABLE public.users ADD COLUMN gender_preference TEXT;
        RAISE NOTICE 'Added gender_preference column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'visibility'
    ) THEN
        ALTER TABLE public.users ADD COLUMN visibility TEXT;
        RAISE NOTICE 'Added visibility column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'contact_preference'
    ) THEN
        ALTER TABLE public.users ADD COLUMN contact_preference TEXT;
        RAISE NOTICE 'Added contact_preference column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'instagram'
    ) THEN
        ALTER TABLE public.users ADD COLUMN instagram TEXT;
        RAISE NOTICE 'Added instagram column to users table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone column to users table';
    END IF;
END $$;

-- Verify columns exist
SELECT 'Users table columns verified:' as status;
