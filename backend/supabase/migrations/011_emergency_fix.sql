-- ============================================
-- EMERGENCY FIX FOR COLUMN MISMATCHES
-- ============================================

-- Fix Admin Users "user_id" vs "id" issue
DO $$
BEGIN
    -- Check if admin_users exists contains 'id' but not 'user_id'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'user_id') THEN
        
        ALTER TABLE public.admin_users RENAME COLUMN id TO user_id;
    END IF;

    -- Ensure created_by exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'created_by') THEN
        ALTER TABLE public.admin_users ADD COLUMN created_by TEXT DEFAULT 'system';
    END IF;
END $$;

-- Fix Matches "matched_user_id" issue
DO $$
BEGIN
    -- Ensure matched_user_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'matched_user_id') THEN
        ALTER TABLE public.matches ADD COLUMN matched_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Ensure user_id exists (sanity check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'user_id') THEN
         ALTER TABLE public.matches ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop and Recreate Admin Functions to ensure they use user_id
DROP FUNCTION IF EXISTS public.add_admin CASCADE;
DROP FUNCTION IF EXISTS public.remove_admin CASCADE;

CREATE OR REPLACE FUNCTION public.add_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
    is_current_admin BOOLEAN;
BEGIN
    -- Check if current user is admin (using user_id)
    SELECT EXISTS(
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    ) INTO is_current_admin;
    
    IF NOT is_current_admin THEN
        RAISE EXCEPTION 'Only admins can add new admins';
    END IF;
    
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    INSERT INTO public.admin_users (user_id, email, created_by)
    VALUES (target_user_id, user_email, auth.uid()::text)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.remove_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_current_admin BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    ) INTO is_current_admin;
    
    IF NOT is_current_admin THEN
        RAISE EXCEPTION 'Only admins can remove admins';
    END IF;
    
    DELETE FROM public.admin_users WHERE email = user_email;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION public.add_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_admin TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
