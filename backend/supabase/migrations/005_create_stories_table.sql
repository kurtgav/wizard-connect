-- ============================================
-- CREATE STORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    display_name VARCHAR(100), -- Can be "Anonymous" or user provided
    program VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE, -- Auto-approve for now, change to FALSE if moderation is needed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policies

-- Everyone can view approved stories
CREATE POLICY "Public can view approved stories"
    ON public.stories FOR SELECT
    USING (is_approved = TRUE);

-- Authenticated users can insert stories
CREATE POLICY "Authenticated users can create stories"
    ON public.stories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own stories
CREATE POLICY "Users can update their own stories"
    ON public.stories FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can manage all stories
CREATE POLICY "Admins can manage stories"
    ON public.stories FOR ALL
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

-- Trigger for updated_at
CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.stories TO authenticated;
GRANT SELECT ON public.stories TO anon;
