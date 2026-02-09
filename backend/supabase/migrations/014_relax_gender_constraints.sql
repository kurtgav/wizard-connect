-- Relax gender constraints to allow empty strings from Go defaults
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_gender;
ALTER TABLE public.users ADD CONSTRAINT check_gender 
    CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say', 'other', '') OR gender IS NULL);

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_gender_preference;
ALTER TABLE public.users ADD CONSTRAINT check_gender_preference 
    CHECK (gender_preference IN ('male', 'female', 'both', '') OR gender_preference IS NULL);
