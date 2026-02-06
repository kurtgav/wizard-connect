-- ============================================
-- CREATE ADMIN USER (SIMPLIFIED)
-- ============================================

-- Step 1: Ensure users table has required columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Step 2: Enable RLS on users table if not enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create admin policy (simple version)
-- First, drop if exists (ignore error)
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;

-- Create the policy without complex checks for now
CREATE POLICY "Admins can manage users"
    ON public.users FOR ALL
    USING (false); -- Will be updated with proper admin check

-- Step 4: Create auth user for admin
DO $$
DECLARE
    admin_email TEXT := 'admin@wizardconnect.com';
    admin_id UUID;
BEGIN
    -- Try to find existing admin by email
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email LIMIT 1;
    
    IF admin_id IS NULL THEN
        -- Create new auth user
        INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            admin_email,
            '{"role": "admin", "is_admin": true}'::jsonb,
            NOW(),
            NOW()
        );
        
        -- Get the new user ID
        SELECT id INTO admin_id FROM auth.users WHERE email = admin_email LIMIT 1;
    END IF;
    
    -- Create corresponding public.users record
    INSERT INTO public.users (id, email, first_name, last_name, created_at, updated_at)
    VALUES (
        admin_id,
        admin_email,
        'Admin',
        'User',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Admin user created successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating admin user: %', SQLERRM;
END $$;

-- ============================================
-- VERIFY ADMIN USER
-- ============================================

-- Check that both records were created
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    au.raw_user_meta_data as auth_meta,
    pu.id as public_id,
    pu.email as public_email,
    pu.first_name,
    pu.last_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'admin@wizardconnect.com';
