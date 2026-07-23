-- =========================================================================
-- MIGRATION: TELEGRAM BOT & MINI APP INTEGRATION FOR USERS TABLE
-- GROCKGOLD PLATFORM - PRODUCTION READY SQL MIGRATION
-- =========================================================================

-- 1. Add Telegram identity and metadata columns to users table safely
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_first_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_last_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_language TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_linked_at TIMESTAMP WITH TIME ZONE;

-- 2. Indexes for high performance lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_user_id ON public.users (telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_username ON public.users (telegram_username);

-- 3. Create table for 6-digit account linking verification codes
CREATE TABLE IF NOT EXISTS public.telegram_linking_codes (
    code VARCHAR(10) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_codes_username ON public.telegram_linking_codes (username);
CREATE INDEX IF NOT EXISTS idx_telegram_codes_expires ON public.telegram_linking_codes (expires_at);

-- 4. Create table for Telegram bot activity logs
CREATE TABLE IF NOT EXISTS public.telegram_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_logs_user ON public.telegram_activity_logs (telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_logs_created ON public.telegram_activity_logs (created_at DESC);

-- 5. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.telegram_linking_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Allow select telegram_linking_codes" ON public.telegram_linking_codes;
CREATE POLICY "Allow select telegram_linking_codes" ON public.telegram_linking_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert telegram_linking_codes" ON public.telegram_linking_codes;
CREATE POLICY "Allow insert telegram_linking_codes" ON public.telegram_linking_codes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete telegram_linking_codes" ON public.telegram_linking_codes;
CREATE POLICY "Allow delete telegram_linking_codes" ON public.telegram_linking_codes FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow select telegram_activity_logs" ON public.telegram_activity_logs;
CREATE POLICY "Allow select telegram_activity_logs" ON public.telegram_activity_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert telegram_activity_logs" ON public.telegram_activity_logs;
CREATE POLICY "Allow insert telegram_activity_logs" ON public.telegram_activity_logs FOR INSERT WITH CHECK (true);
