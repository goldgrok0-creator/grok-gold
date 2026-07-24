-- =========================================================================
-- SUPABASE MIGRATION: CONSOLIDATE SPIN BALANCES INTO UNIFIED spin_balances TABLE
-- =========================================================================

-- 1. Create enum type for spin balance types ('free', 'bonus')
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'spin_type_enum') THEN
    CREATE TYPE public.spin_type_enum AS ENUM ('free', 'bonus');
  END IF;
END $$;

-- 2. Create spin_balances table
CREATE TABLE IF NOT EXISTS public.spin_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
    type public.spin_type_enum NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_spin_type UNIQUE (username, type)
);

-- 3. Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_spin_balances_username ON public.spin_balances(username);
CREATE INDEX IF NOT EXISTS idx_spin_balances_username_type ON public.spin_balances(username, type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.spin_balances ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS Policies for spin_balances
DROP POLICY IF EXISTS "Allow public read spin_balances" ON public.spin_balances;
CREATE POLICY "Allow public read spin_balances" 
    ON public.spin_balances FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow public insert spin_balances" ON public.spin_balances;
CREATE POLICY "Allow public insert spin_balances" 
    ON public.spin_balances FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow secure update spin_balances" ON public.spin_balances;
CREATE POLICY "Allow secure update spin_balances" 
    ON public.spin_balances FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "Allow secure delete spin_balances" ON public.spin_balances;
CREATE POLICY "Allow secure delete spin_balances" 
    ON public.spin_balances FOR DELETE 
    USING (true);

-- 6. Migrate existing data from public.users table / settings JSONB into spin_balances

-- 6a. Migrate 'free' spin balance
INSERT INTO public.spin_balances (username, type, amount, updated_at)
SELECT 
    username,
    'free'::public.spin_type_enum,
    COALESCE(
        CASE 
            WHEN (settings->>'freeSpinBalance') IS NOT NULL AND (settings->>'freeSpinBalance')::numeric >= 0 
                THEN (settings->>'freeSpinBalance')::numeric
            WHEN free_spin_balance IS NOT NULL THEN free_spin_balance
            ELSE 1000000
        END,
        1000000
    ) AS amount,
    now()
FROM public.users
ON CONFLICT (username, type) 
DO UPDATE SET 
    amount = EXCLUDED.amount,
    updated_at = now();

-- 6b. Migrate 'bonus' spin balance
INSERT INTO public.spin_balances (username, type, amount, updated_at)
SELECT 
    username,
    'bonus'::public.spin_type_enum,
    COALESCE(
        CASE 
            WHEN (settings->>'bonusSpinBalance') IS NOT NULL AND (settings->>'bonusSpinBalance')::numeric >= 0 
                THEN (settings->>'bonusSpinBalance')::numeric
            WHEN (settings->>'rewardSpinWallet') IS NOT NULL AND (settings->>'rewardSpinWallet')::numeric >= 0 
                THEN (settings->>'rewardSpinWallet')::numeric
            WHEN bonus_spin_balance IS NOT NULL THEN bonus_spin_balance
            ELSE 0
        END,
        0
    ) AS amount,
    now()
FROM public.users
ON CONFLICT (username, type) 
DO UPDATE SET 
    amount = EXCLUDED.amount,
    updated_at = now();

-- 7. Enable Supabase Realtime publication for spin_balances table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_balances;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
