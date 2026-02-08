-- Add gender column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add check constraint for valid gender values
ALTER TABLE public.users ADD CONSTRAINT check_gender 
    CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say', 'other') OR gender IS NULL);

-- Add gender_preference column (who user wants to match with)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender_preference TEXT;

-- Add check constraint for valid gender preference values
ALTER TABLE public.users ADD CONSTRAINT check_gender_preference 
    CHECK (gender_preference IN ('male', 'female', 'both') OR gender_preference IS NULL);
