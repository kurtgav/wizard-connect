-- Auto-create user profile in public.users when user is created in auth.users
-- This ensures every authenticated user has a profile record

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, contact_preference, visibility, gender, gender_preference)
    VALUES (
        NEW.id,
        NEW.email,
        '',
        '',
        'email',
        'matches_only',
        'prefer_not_to_say',
        'both'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create a shell user for existing auth users who don't have profiles yet
INSERT INTO public.users (id, email, first_name, last_name, contact_preference, visibility, gender, gender_preference)
SELECT
    au.id,
    au.email,
    '' as first_name,
    '' as last_name,
    'email',
    'matches_only',
    'prefer_not_to_say',
    'both'
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;
