-- Functions to allow backend to fetch user info from auth.users
-- These functions use SECURITY DEFINER to run with elevated privileges

CREATE OR REPLACE FUNCTION public.get_user_from_auth(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        au.id,
        au.email
    FROM auth.users au
    WHERE au.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_from_auth TO authenticated;
