-- ============================================
-- CAMPAIGNS TABLE ADDITION
-- ============================================

-- Create campaigns table for managing time-based matching events
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    survey_open_date TIMESTAMPTZ NOT NULL,
    survey_close_date TIMESTAMPTZ NOT NULL,
    profile_update_start_date TIMESTAMPTZ,
    profile_update_end_date TIMESTAMPTZ,
    results_release_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_participants INTEGER DEFAULT 0,
    total_matches_generated INTEGER DEFAULT 0,
    algorithm_version VARCHAR(50),
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(survey_open_date, survey_close_date);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Policies: Admin can manage campaigns, authenticated users can read active campaigns
CREATE POLICY "Admins can manage campaigns"
    ON public.campaigns FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Authenticated users can view active campaigns"
    ON public.campaigns FOR SELECT
    USING (is_active = TRUE);

-- ============================================
-- UPDATE USERS TABLE - ADD MISSING FIELDS
-- ============================================

-- Add missing fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS college VARCHAR(100),
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS seeking_gender VARCHAR(50);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_gender ON public.users(gender);
CREATE INDEX IF NOT EXISTS idx_users_seeking_gender ON public.users(seeking_gender);

-- ============================================
-- UPDATE MATCHES TABLE - ADD CAMPAIGN AND TRACKING
-- ============================================

-- Add campaign_id and tracking fields to matches
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS rank_for_a INTEGER CHECK (rank_for_a >= 1 AND rank_for_a <= 7),
ADD COLUMN IF NOT EXISTS rank_for_b INTEGER CHECK (rank_for_b >= 1 AND rank_for_b <= 7),
ADD COLUMN IF NOT EXISTS user_a_viewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_b_viewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_a_contacted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_b_contacted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS messaging_unlocked BOOLEAN DEFAULT FALSE;

-- Add index for campaign_id
CREATE INDEX IF NOT EXISTS idx_matches_campaign ON public.matches(campaign_id);

-- Update RLS policies for matches to use existing columns
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;

CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    USING (
        auth.uid() = user_id OR
        auth.uid() = matched_user_id
    );

-- ============================================
-- UPDATE MESSAGES TABLE - ENHANCE FOR MATCH-BASED MESSAGING
-- ============================================

-- Add recipient_id and read_at if not exists
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add index for recipient
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

CREATE POLICY "Users can send messages to their matches"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM conversations
            WHERE participant1 = auth.uid() OR participant2 = auth.uid()
        )
    );

-- ============================================
-- UPDATE CRUSHES TABLE - ADD CAMPAIGN TRACKING
-- ============================================

-- Add campaign tracking fields
ALTER TABLE public.crushes
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS crush_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS is_matched BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_mutual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nudge_sent BOOLEAN DEFAULT FALSE;

-- Add index for campaign_id
CREATE INDEX IF NOT EXISTS idx_crushes_campaign ON public.crushes(campaign_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own crushes" ON public.crushes;

CREATE POLICY "Users can view their own crushes"
    ON public.crushes FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- UPDATE SURVEYS TABLE - ADD CAMPAIGN TRACKING
-- ============================================

-- Add campaign_id to surveys
ALTER TABLE public.surveys
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE;

-- Add index for campaign_id
CREATE INDEX IF NOT EXISTS idx_surveys_campaign ON public.surveys(campaign_id);

-- ============================================
-- CREATE INITIAL CAMPAIGN FOR VALENTINE'S 2026
-- ============================================

-- Insert Valentine's 2026 campaign
INSERT INTO public.campaigns (
    id,
    name,
    survey_open_date,
    survey_close_date,
    profile_update_start_date,
    profile_update_end_date,
    results_release_date,
    is_active,
    algorithm_version,
    config
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Valentine''s 2026 Matching',
    '2026-02-05 00:00:00+00',
    '2026-02-10 23:59:59+00',
    '2026-02-11 00:00:00+00',
    '2026-02-13 23:59:59+00',
    '2026-02-14 07:00:00+00',
    TRUE,
    '2.0',
    '{
        "weights": {
            "demographics": 0.10,
            "personality": 0.30,
            "values": 0.25,
            "lifestyle": 0.20,
            "interests": 0.15
        },
        "num_matches": 7,
        "mutual_crush_bonus": 0.20,
        "one_way_crush_bonus": 0.10,
        "minimum_compatibility_score": 30
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE TRIGGER FOR updated_at ON CAMPAIGNS
-- ============================================

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT UPDATE, INSERT ON public.users TO authenticated;
GRANT UPDATE, INSERT ON public.surveys TO authenticated;
GRANT INSERT ON public.crushes TO authenticated;
GRANT INSERT ON public.messages TO authenticated;
