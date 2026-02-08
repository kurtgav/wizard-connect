-- ============================================
-- FIX RLS SECURITY VULNERABILITY
-- ============================================
-- This migration fixes the security issue where RLS policies
-- reference user_metadata, which is editable by users.

-- 1. Create a secure admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'system'
);

-- 2. Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Only existing admins can manage admin_users
CREATE POLICY "Admins can manage admin_users"
    ON public.admin_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- 4. Migrate existing admins from allowlist to admin_users
INSERT INTO public.admin_users (user_id, email, created_by)
SELECT 
    au.id as user_id,
    au.email,
    'migration' as created_by
FROM auth.users au
INNER JOIN public.admin_allowlist al ON au.email = al.email
ON CONFLICT (user_id) DO NOTHING;

-- 5. Drop insecure trigger that modifies user_metadata
DROP TRIGGER IF EXISTS assign_admin_role_on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.handle_admin_role_assignment();

-- 6. Drop function that references user_metadata in campaigns (if exists)
DROP FUNCTION IF EXISTS public.assign_admin_role_on_signup();

-- 7. Fix Campaigns RLS Policy - Use admin_users table instead of user_metadata
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;

CREATE POLICY "Admins can manage campaigns"
    ON public.campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- 8. Fix Admin Allowlist RLS Policy - Use admin_users table instead of user_metadata
DROP POLICY IF EXISTS "Admins can manage allowlist" ON public.admin_allowlist;

CREATE POLICY "Admins can manage allowlist"
    ON public.admin_allowlist FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- 9. Add admin_users grant for authenticated users to check admin status
GRANT SELECT ON public.admin_users TO authenticated;

-- 10. Create function to add admins securely (only callable by existing admins)
CREATE OR REPLACE FUNCTION public.add_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
    is_current_admin BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT EXISTS(
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    ) INTO is_current_admin;
    
    IF NOT is_current_admin THEN
        RAISE EXCEPTION 'Only admins can add new admins';
    END IF;
    
    -- Get the target user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    -- Add to admin_users
    INSERT INTO public.admin_users (user_id, email, created_by)
    VALUES (target_user_id, user_email, auth.uid()::text)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to remove admins securely
CREATE OR REPLACE FUNCTION public.remove_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_current_admin BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT EXISTS(
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    ) INTO is_current_admin;
    
    IF NOT is_current_admin THEN
        RAISE EXCEPTION 'Only admins can remove admins';
    END IF;
    
    -- Remove from admin_users
    DELETE FROM public.admin_users WHERE email = user_email;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check current admins
SELECT
    au.user_id,
    au.email,
    au.created_at,
    au.created_by
FROM public.admin_users au
ORDER BY au.created_at;

-- Verify RLS policies are secure
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('campaigns', 'admin_allowlist', 'admin_users')
ORDER BY tablename, policyname;
