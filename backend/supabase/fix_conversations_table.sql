-- VERIFY AND FIX CONVERSATIONS TABLE
-- This script ensures the conversations table has the correct schema and constraints

DO $$
BEGIN
    -- 1. Ensure table exists with correct base columns
    CREATE TABLE IF NOT EXISTS public.conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        participant1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        participant2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        last_message TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (participant1 < participant2)
    );

    -- 2. Ensure last_message column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'conversations' AND column_name = 'last_message'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN last_message TEXT;
    END IF;

    -- 3. Ensure updated_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'conversations' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- 4. Ensure created_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'conversations' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- 5. Fix the CHECK constraint (drop and recreate if it somehow exists with wrong logic)
    ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_participant_check;
    ALTER TABLE public.conversations ADD CONSTRAINT conversations_participant_check CHECK (participant1 < participant2);
    
    -- Ensure unique pairing
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'conversations_participants_key'
    ) THEN
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_participants_key UNIQUE (participant1, participant2);
    END IF;

END $$;

-- Policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant1 OR auth.uid() = participant2);

-- Messages Table Fix
DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS public.messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
END $$;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
    conversation_id IN (
        SELECT id FROM public.conversations
        WHERE participant1 = auth.uid() OR participant2 = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
        SELECT id FROM public.conversations
        WHERE participant1 = auth.uid() OR participant2 = auth.uid()
    )
);

SELECT 'Conversations and Messages tables checked and fixed' as status;
