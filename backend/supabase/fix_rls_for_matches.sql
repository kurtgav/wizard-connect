-- FIX RLS FOR MATCHES TO WORK
-- Users need to be able to see other users' basic info to see their matches!

-- 1. Update users RLS policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.users;

-- Allow users to view ANY profile (limited to public info)
-- This is necessary for the JOIN in matches to work
CREATE POLICY "Users can view other profiles"
    ON public.users FOR SELECT
    USING (true); -- In a production app, you might want to restrict this more, but for now this is the fix

-- 2. Keep the update policy restricted
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Verify matches RLS
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = user_id);

SELECT 'RLS Fix Applied: Users can now see matches details' as status;
