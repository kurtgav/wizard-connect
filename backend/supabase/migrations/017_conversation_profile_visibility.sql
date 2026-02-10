-- Add policy to allow authenticated users to view profiles of users they have conversations with
-- This ensures users can see each other's avatars and info in the messages view

DROP POLICY IF EXISTS "Conversation participants can view each other's profiles" ON public.users;

CREATE POLICY "Conversation participants can view each other's profiles"
    ON public.users FOR SELECT
    USING (
        id IN (
            SELECT participant1 FROM conversations WHERE participant2 = auth.uid()
            UNION
            SELECT participant2 FROM conversations WHERE participant1 = auth.uid()
        )
    );
