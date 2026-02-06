-- ============================================
-- SETUP ADMIN ALLOWLIST & ACCESS
-- ============================================

-- 1. Create allowlist table
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

-- 2. Insert requested admins
INSERT INTO public.admin_allowlist (email) VALUES
    ('kurtgavin.design@gmail.com'),
    ('nicolemaaba@gmail.com'),
    ('Agpfrancisco1@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 3. Function to automatically grant admin role based on email
CREATE OR REPLACE FUNCTION public.handle_admin_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the email is in the allowlist
    IF EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = NEW.email) THEN
        -- Update user metadata to include admin role
        NEW.raw_user_meta_data = 
            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
            '{"role": "admin", "is_admin": true}'::jsonb;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to run on user creation/update
DROP TRIGGER IF EXISTS assign_admin_role_on_signup ON auth.users;
CREATE TRIGGER assign_admin_role_on_signup
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_admin_role_assignment();

-- 5. Retroactively update any existing users in the allowlist
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin", "is_admin": true}'::jsonb
WHERE email IN (SELECT email FROM public.admin_allowlist);

-- ============================================
-- FIX RLS POLICIES TO USE METADATA
-- ============================================

-- The previous policy in 002 checked "auth.jwt() ->> 'role'" which is the database role.
-- We need to check user_metadata for the 'admin' role.

-- Fix Campaigns Policy
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;

CREATE POLICY "Admins can manage campaigns"
    ON public.campaigns FOR ALL
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

-- Ensure authenticated users can still VIEW active campaigns (from 002)
-- (No change needed for "Authenticated users can view active campaigns")

-- Grant access to the allowlist table for admins (optional, but good for management)
CREATE POLICY "Admins can manage allowlist"
    ON public.admin_allowlist FOR ALL
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );
