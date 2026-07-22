-- =========================================================================
-- SUPABASE MIGRATION FOR COMMUNITY REAL-TIME CHAT
-- =========================================================================

-- 1. Create community_messages table
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    username TEXT NOT NULL,
    avatar_url TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for fast real-time queries & user lookups
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON public.community_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON public.community_messages (user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone (authenticated and anon) to read community messages
DROP POLICY IF EXISTS "Allow read community messages" ON public.community_messages;
CREATE POLICY "Allow read community messages"
    ON public.community_messages
    FOR SELECT
    USING (true);

-- Allow authenticated users or session users to insert messages for themselves
DROP POLICY IF EXISTS "Allow insert community messages" ON public.community_messages;
CREATE POLICY "Allow insert community messages"
    ON public.community_messages
    FOR INSERT
    WITH CHECK (auth.uid() IS NULL OR auth.uid() = user_id OR user_id IS NULL OR auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow users to delete their own messages
DROP POLICY IF EXISTS "Allow delete own community messages" ON public.community_messages;
CREATE POLICY "Allow delete own community messages"
    ON public.community_messages
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Enable Supabase Realtime publication for community_messages
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Table might already be in publication
  NULL;
END $$;
