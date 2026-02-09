-- ============================================
-- RLS FIX FOR ADMIN ANALYTICS
-- ============================================

-- Ensure admins can read all surveys for analytics
-- We check if the user is in the admin_users table

-- 1. Create a helper function if not exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Policy for Surveys
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all surveys" ON public.surveys;
CREATE POLICY "Admins can view all surveys" ON public.surveys
    FOR SELECT
    USING (public.is_admin());

-- 3. Policy for Campaigns (Admins need to see inactive/draft ones too)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
CREATE POLICY "Admins can view all campaigns" ON public.campaigns
    FOR SELECT
    USING (public.is_admin());

-- 4. Grant access to verified admins (just to be safe)
GRANT SELECT ON public.surveys TO authenticated;
GRANT SELECT ON public.campaigns TO authenticated;

NOTIFY pgrst, 'reload config';
