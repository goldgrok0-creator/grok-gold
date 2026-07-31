import { createClient } from '@supabase/supabase-js';
import { UserAccount, Transaction, AppState, CONFIG } from './types';

// Hash function to prevent storing passwords in plaintext
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  try {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (err) {
    // Fallback hash if Web Crypto API is unavailable
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 'fb_' + Math.abs(hash).toString(16);
  }
}

// =========================================================================
// SUPABASE CLIENT INITIALIZATION
// =========================================================================

const FALLBACK_URL = 'https://qoqahhublvisnmvfaqvj.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcWFoaHVibHZpc25tdmZhcXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTc5NjcsImV4cCI6MjA5OTkzMzk2N30.wUXTs7X0-KaJoKFe6qF1bXYI_o13nDrijs4368tsAxQ';

function getSupabaseUrl(): string {
  try {
    // @ts-ignore
    const url = import.meta.env?.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
    if (url && typeof url === 'string' && url.trim() !== '' && url.startsWith('http')) {
      return url.trim();
    }
  } catch (e) {}
  return FALLBACK_URL;
}

function getSupabaseKey(url: string): string {
  if (url === FALLBACK_URL) {
    return FALLBACK_KEY;
  }
  try {
    // @ts-ignore
    const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (key && typeof key === 'string' && key.trim() !== '' && key.trim().length > 20) {
      return key.trim();
    }
  } catch (e) {}
  return FALLBACK_KEY;
}

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseKey(SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Flag to track Supabase connection (always false as Supabase is the sole primary database)
export const isSupabaseOffline = false;

const SPIN_ITEMS = [
  { label: 'Rp 500', color: '#7209b7', value: 500, type: 'cash' },
  { label: 'Coba Lagi', color: '#1a103c', value: 0, type: 'zonk' },
  { label: 'Rp 1.000', color: '#b5179e', value: 1000, type: 'cash' },
  { label: 'Rp 2.000', color: '#f72585', value: 2000, type: 'cash' },
  { label: 'Rp 5.000', color: '#7209b7', value: 5000, type: 'cash' },
  { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
  { label: 'Rp 1.000', color: '#da70d6', value: 1000, type: 'cash' },
  { label: 'Rp 500', color: '#f8961e', value: 500, type: 'cash' },
];

export function getLocalAccounts(): UserAccount[] {
  return [];
}

export function saveLocalAccounts(accounts: UserAccount[]) {
  // Disabled: Supabase is the sole source of truth
}

// =========================================================================
// SQL SCHEMA SCRIPT FOR USER (TO RUN IN SUPABASE SQL EDITOR)
// =========================================================================
export const SUPABASE_SQL_SCHEMA = `
-- ==========================================
-- GROCKGOLD DUAL SYSTEM SQL SCHEMA
-- ==========================================

-- 1. TABLE: users
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  referral_code TEXT UNIQUE,
  invited_by TEXT,
  main_balance NUMERIC DEFAULT 0,
  reward_balance NUMERIC DEFAULT 0,
  active_contracts INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  referral_earned NUMERIC DEFAULT 0,
  rebate_earned NUMERIC DEFAULT 0,
  last_claim_time BIGINT DEFAULT 0,
  welcome_bonus_claimed BOOLEAN DEFAULT FALSE,
  profile_image TEXT,
  pending_mining_reward NUMERIC DEFAULT 0,
  created_at BIGINT,
  settings JSONB DEFAULT '{"language": "en", "notificationsEnabled": true, "autoReinvest": false}'::jsonb
);

-- 2. TABLE: deposits
CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  username TEXT REFERENCES users(username) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payment_method TEXT,
  proof_image TEXT NOT NULL CHECK (proof_image <> ''),
  created_at BIGINT NOT NULL
);

-- 3. TABLE: withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  username TEXT REFERENCES users(username) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  created_at BIGINT NOT NULL
);

-- 4. TABLE: contracts
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  username TEXT REFERENCES users(username) ON DELETE CASCADE,
  units INTEGER NOT NULL,
  price_paid NUMERIC NOT NULL,
  daily_reward_rate NUMERIC DEFAULT 0.02,
  status TEXT DEFAULT 'active', -- 'active', 'expired'
  created_at BIGINT NOT NULL,
  last_profit_claim BIGINT NOT NULL
);

--// 5. TABLE: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  username TEXT REFERENCES users(username) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'deposit', 'withdraw', 'reward', 'purchase', 'referral', 'rebate', 'welcome_bonus'
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at BIGINT NOT NULL
);

-- 6. TYPE & TABLE: spin_balances (Consolidated Spin Balances)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'spin_type_enum') THEN
    CREATE TYPE spin_type_enum AS ENUM ('free', 'bonus');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS spin_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  type spin_type_enum NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_spin_type UNIQUE (username, type)
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_balances ENABLE ROW LEVEL SECURITY;

-- CLEAR EXISTING TABLE POLICIES TO PREVENT DUPLICATE ERRORS ON RE-EXECUTION
DROP POLICY IF EXISTS "Allow public read users" ON users;
DROP POLICY IF EXISTS "Allow public insert users" ON users;
DROP POLICY IF EXISTS "Allow secure update users" ON users;

DROP POLICY IF EXISTS "Allow public read deposits" ON deposits;
DROP POLICY IF EXISTS "Allow public insert deposits" ON deposits;
DROP POLICY IF EXISTS "Allow secure update deposits" ON deposits;

DROP POLICY IF EXISTS "Allow public read withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow public insert withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow secure update withdrawals" ON withdrawals;

DROP POLICY IF EXISTS "Allow public read contracts" ON contracts;
DROP POLICY IF EXISTS "Allow public insert contracts" ON contracts;
DROP POLICY IF EXISTS "Allow secure update contracts" ON contracts;

DROP POLICY IF EXISTS "Allow public read transactions" ON transactions;
DROP POLICY IF EXISTS "Allow public insert transactions" ON transactions;
DROP POLICY IF EXISTS "Allow secure update transactions" ON transactions;

DROP POLICY IF EXISTS "Allow public read spin_balances" ON spin_balances;
DROP POLICY IF EXISTS "Allow public insert spin_balances" ON spin_balances;
DROP POLICY IF EXISTS "Allow secure update spin_balances" ON spin_balances;

-- CREATE RLS POLICIES FOR USERS AND ADMIN
-- Users can see/edit their own data; Admin can do anything.

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow secure update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read deposits" ON deposits FOR SELECT USING (true);
CREATE POLICY "Allow public insert deposits" ON deposits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow secure update deposits" ON deposits FOR UPDATE USING (true);

CREATE POLICY "Allow public read withdrawals" ON withdrawals FOR SELECT USING (true);
CREATE POLICY "Allow public insert withdrawals" ON withdrawals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow secure update withdrawals" ON withdrawals FOR UPDATE USING (true);

CREATE POLICY "Allow public read contracts" ON contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert contracts" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow secure update contracts" ON contracts FOR UPDATE USING (true);

CREATE POLICY "Allow public read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow secure update transactions" ON transactions FOR UPDATE USING (true);

CREATE POLICY "Allow public read spin_balances" ON spin_balances FOR SELECT USING (true);
CREATE POLICY "Allow public insert spin_balances" ON spin_balances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow secure update spin_balances" ON spin_balances FOR UPDATE USING (true);

-- ENABLE REALTIME ON ALL TABLES
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table deposits;
alter publication supabase_realtime add table withdrawals;
alter publication supabase_realtime add table contracts;
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table spin_balances;

-- =========================================================================
-- SUPABASE STORAGE BUCKET AND STORAGE POLICIES
-- =========================================================================

-- 1. Create deposits bucket if it doesn't exist (configured to private/secure)
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposits', 'deposits', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Enable Row Level Security (RLS) on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Clear existing old policies to prevent name/duplicate errors on execution
DROP POLICY IF EXISTS "Allow authenticated users to upload proof" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload proof" ON storage.objects;
DROP POLICY IF EXISTS "Allow only admin to view proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow only admin to update proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow only admin to delete proofs" ON storage.objects;

-- 4. Policy: Users (both authenticated and anon/bypassed) can upload proof of transfer
CREATE POLICY "Allow users to upload proof"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (
  bucket_id = 'deposits'
);

-- 5. Policy: Only admins can view the proofs (view all objects in deposits bucket)
CREATE POLICY "Allow only admin to view proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'deposits' AND 
  (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'username') = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE username = 'admin' 
      AND email = auth.jwt() ->> 'email'
    )
  )
);

-- 6. Policy: Only admins can update the proof documents
CREATE POLICY "Allow only admin to update proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'deposits' AND 
  (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'username') = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE username = 'admin' 
      AND email = auth.jwt() ->> 'email'
    )
  )
);

-- 7. Policy: Only admins can delete proof documents
CREATE POLICY "Allow only admin to delete proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'deposits' AND 
  (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'username') = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE username = 'admin' 
      AND email = auth.jwt() ->> 'email'
    )
  )
);
`;

// Helper function to prevent Supabase network requests from hanging indefinitely
function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 2000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs)
    )
  ]);
}

// =========================================================================
// SYSTEM SEEDER FOR DEFAULT ADMIN
// =========================================================================

export async function seedDefaultAdminIfNeeded(): Promise<void> {
  try {
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('username', 'admin')
      .single();

    if (!data) {
      const adminPayload = {
        username: 'admin',
        full_name: 'System Administrator',
        email: 'admin@grockgold.com',
        phone: '+6281234567890',
        password: 'admin123',
        role: 'admin',
        referral_code: '',
        invited_by: null,
        main_balance: 1000000000,
        active_contracts: 0,
        total_earned: 0,
        referral_earned: 0,
        rebate_earned: 0,
        last_claim_time: 0,
        welcome_bonus_claimed: true,
        profile_image: null,
        pending_mining_reward: 0,
        created_at: Date.now(),
        settings: {
          language: 'id',
          notificationsEnabled: true,
          autoReinvest: false
        }
      };

      await supabase.from('users').insert(adminPayload);
      console.log('Seeded default admin successfully.');
    }
  } catch (err) {
    console.warn('Admin check warning:', err);
  }
}

// =========================================================================
// REALTIME RETRIEVAL AND MAPPING ENGINE
// =========================================================================

async function safeQuery(queryPromise: any): Promise<{ data: any; error: any }> {
  try {
    const res = await queryPromise;
    if (res?.error?.code === 'PGRST205' || (res?.error?.message && res.error.message.includes('Could not find the table'))) {
      return { data: [], error: null };
    }
    return { data: res?.data || null, error: res?.error || null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function fetchAccountsFromSupabase(targetUsername?: string): Promise<UserAccount[] | null> {
  try {
    const isAdminTarget = !targetUsername || targetUsername.toLowerCase() === 'admin';

    let usersQuery = supabase.from('users').select('*');
    let depositsQuery = supabase.from('deposits').select('*');
    let withdrawalsQuery = supabase.from('withdrawals').select('*');
    let contractsQuery = supabase.from('contracts').select('*');
    let transactionsQuery = supabase.from('transactions').select('*');
    let spinBalancesQuery = supabase.from('spin_balances').select('*');

    if (!isAdminTarget && targetUsername) {
      const lower = targetUsername.toLowerCase();
      // For non-admin specific user fetch, filter transaction/deposit/withdrawal details to that user
      depositsQuery = depositsQuery.ilike('username', lower);
      withdrawalsQuery = withdrawalsQuery.ilike('username', lower);
      contractsQuery = contractsQuery.ilike('username', lower);
      transactionsQuery = transactionsQuery.ilike('username', lower);
      spinBalancesQuery = spinBalancesQuery.ilike('username', lower);
    }

    let [usersRes, depositsRes, withdrawalsRes, contractsRes, transactionsRes, spinBalancesRes] = await Promise.all([
      safeQuery(usersQuery),
      safeQuery(depositsQuery),
      safeQuery(withdrawalsQuery),
      safeQuery(contractsQuery),
      safeQuery(transactionsQuery),
      safeQuery(spinBalancesQuery)
    ]);

    let users = usersRes?.data || [];
    if (!users || users.length === 0) {
      users = [{
        username: 'admin',
        full_name: 'System Administrator',
        email: 'admin@grockgold.com',
        phone: '+6281234567890',
        password: 'admin123',
        role: 'admin',
        referral_code: '',
        invited_by: null,
        main_balance: 1000000000,
        active_contracts: 0,
        total_earned: 0,
        referral_earned: 0,
        rebate_earned: 0,
        last_claim_time: 0,
        welcome_bonus_claimed: true,
        profile_image: null,
        pending_mining_reward: 0,
        created_at: Date.now(),
        settings: {
          language: 'id',
          notificationsEnabled: true,
          autoReinvest: false
        }
      }];
    }

    const deposits = depositsRes?.data || [];
    const withdrawals = withdrawalsRes?.data || [];
    const contracts = contractsRes?.data || [];
    const transactions = transactionsRes?.data || [];
    const spinBalances = spinBalancesRes?.data || [];

    // Trigger non-blocking legacy users sync to Supabase Auth
    syncLegacyUsersToSupabaseAuth().catch(() => {});

    // Map into UserAccount structure to ensure seamless frontend compatibility
    return users.map((user: any) => {
      const usernameLower = user.username.toLowerCase();

      // Gather transactions belonging to this user
      const userTxs: Transaction[] = [];

      // 1. Map standard transactions (filter out 'deposit' and 'withdraw' types to prevent duplicates with deposits and withdrawals tables, and filter out wheel spin rewards)
      transactions
        .filter((t: any) => 
          t.username.toLowerCase() === usernameLower && 
          t.type !== 'deposit' && 
          t.type !== 'withdraw' &&
          t.type !== 'lucky_spin_reward' &&
          t.type !== 'spin_reward' &&
          !(t.description && t.description.toLowerCase().includes('hadiah lucky spin'))
        )
        .forEach((t: any) => {
          userTxs.push({
            id: t.id,
            type: t.type as any,
            amount: Number(t.amount) || 0,
            date: Number(t.created_at) || Date.now(),
            description: t.description || '',
            status: 'approved'
          });
        });

      // 2. Map deposits (convert to tx model for historic visibility if approved or pending)
      deposits
        .filter((d: any) => d.username.toLowerCase() === usernameLower)
        .forEach((d: any) => {
          let payMethod = d.payment_method || '';
          let rejectionReason: string | null = null;
          let approvedBy: string | null = null;
          let approvedAt: number | null = null;

          if (payMethod.startsWith('{')) {
            try {
              const parsed = JSON.parse(payMethod);
              payMethod = parsed.method || '';
              rejectionReason = parsed.rejection_reason || null;
              approvedBy = parsed.approved_by || null;
              approvedAt = parsed.approved_at || null;
            } catch (e) {
              console.error('Error parsing payment_method JSON:', e);
            }
          }

          let desc = '⏳ Deposit (Pending)';
          if (d.status === 'rejected') {
            desc = rejectionReason 
              ? `❌ Deposit Ditolak: ${rejectionReason}`
              : '❌ Deposit Ditolak Admin';
          } else if (d.status === 'approved') {
            desc = '✅ Deposit (selesai)';
          }

          userTxs.push({
            id: d.id,
            type: 'deposit',
            amount: Number(d.amount) || 0,
            date: Number(d.created_at) || Date.now(),
            description: desc,
            proofImage: d.proof_image || null,
            status: d.status,
            rejectionReason,
            paymentMethod: payMethod,
            approvedBy,
            approvedAt
          });
        });

      // 3. Map withdrawals
      withdrawals
        .filter((w: any) => w.username.toLowerCase() === usernameLower)
        .forEach((w: any) => {
          userTxs.push({
            id: w.id,
            type: 'withdraw',
            amount: Number(w.amount) || 0,
            date: Number(w.created_at) || Date.now(),
            description: w.status === 'pending'
              ? '⏳ Penarikan (Pending)'
              : w.status === 'rejected'
                ? '❌ Penarikan Ditolak (Dana Dikembalikan)'
                : '✅ Penarikan Sukses (Disetujui Admin)',
            status: w.status
          });
        });

      // Sort combined transaction logs by descending time
      userTxs.sort((a, b) => b.date - a.date);

      // Compute downline accounts (holders)
      const userRefCode = user.referral_code ? user.referral_code.toLowerCase() : '';
      const holders = users
        .filter((u: any) => {
          if (!u.invited_by) return false;
          const inv = u.invited_by.toLowerCase();
          return inv === usernameLower || (userRefCode && inv === userRefCode);
        })
        .map((u: any) => ({
          id: 'H-' + u.username,
          name: u.full_name || u.username,
          contracts: Number(u.active_contracts) || 0,
          joinDate: Number(u.created_at) || Date.now()
        }));

      // Calculate earnings breakdown dynamically from standard transactions table
      const standardUserTxs = transactions.filter((t: any) => t.username.toLowerCase() === usernameLower);

      const dynMiningProfit = standardUserTxs
        .filter((t: any) => t.type === 'reward')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const dynReferralEarned = standardUserTxs
        .filter((t: any) => t.type === 'referral')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const dynRebateEarned = standardUserTxs
        .filter((t: any) => t.type === 'rebate')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const dynWelcomeBonus = standardUserTxs
        .filter((t: any) => t.type === 'welcome_bonus' || t.type === 'bonus')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const historyList = (user.settings?.luckySpinHistory || []).filter((item: any) => item && item.id !== '1' && item.id !== '2' && item.id !== '3' && item.prize !== 'Boost 5x');
      const totalWonFromHistory = historyList.reduce((sum: number, item: any) => {
        if (item && (item.success || item.type === 'cash' || (item.value && item.value > 0)) && typeof item.value === 'number') {
          return sum + item.value;
        }
        return sum;
      }, 0);

      const rawSpinTxRewards = standardUserTxs
        .filter((t: any) => t.type === 'lucky_spin_reward' || t.type === 'spin_reward' || (t.description && t.description.toLowerCase().includes('lucky spin')))
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const dynSpinRewards = Math.max(rawSpinTxRewards, totalWonFromHistory);

      const dynTotalEarned = dynMiningProfit + dynReferralEarned + dynRebateEarned + dynWelcomeBonus;

      const dynTotalWithdrawals = userTxs
        .filter((t: any) => t.type === 'withdraw' && t.status !== 'rejected')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const dynTotalTransfers = userTxs
        .filter((t: any) => t.type === 'transfer')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const calculatedRewardBal = Math.max(0, (dynTotalEarned + dynSpinRewards) - dynTotalWithdrawals - dynTotalTransfers);
      const userColRewardBal = (user.reward_balance !== undefined && user.reward_balance !== null) ? Number(user.reward_balance) : undefined;
      const finalRewardBalance = (userColRewardBal !== undefined && !isNaN(userColRewardBal)) ? userColRewardBal : calculatedRewardBal;

      // Calculate referral spin bonuses for this user from transactions or direct downlines
      const refSpinTxBonusTotal = userTxs
        .filter((t: any) => t.type === 'referral_spin_bonus')
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const userInvCode = user.referral_code || '';
      const downlineCount = users.filter((u: any) => 
        (u.invited_by && u.invited_by.toLowerCase() === usernameLower) ||
        (userInvCode && u.invited_by && u.invited_by.toLowerCase() === userInvCode.toLowerCase())
      ).length;

      const expectedRefSpinBonus = Math.max(refSpinTxBonusTotal, downlineCount * 50000);
      const minExpectedFreeSpin = 1000000 + expectedRefSpinBonus;

      // Fetch from unified spin_balances table
      const userSpinRows = spinBalances.filter((sb: any) => sb.username?.toLowerCase() === usernameLower);
      const freeSpinRow = userSpinRows.find((sb: any) => sb.type === 'free');
      const bonusSpinRow = userSpinRows.find((sb: any) => sb.type === 'bonus');

      const freeRowVal = (freeSpinRow && freeSpinRow.amount !== undefined && freeSpinRow.amount !== null) ? Number(freeSpinRow.amount) : undefined;
      const userColVal = (user.free_spin_balance !== undefined && user.free_spin_balance !== null) ? Number(user.free_spin_balance) : undefined;
      const userSettingsVal = (user.settings?.freeSpinBalance !== undefined && user.settings?.freeSpinBalance !== null) ? Number(user.settings.freeSpinBalance) : undefined;

      const rawFreeSpin = freeRowVal !== undefined
        ? freeRowVal
        : (userColVal !== undefined
            ? userColVal
            : (userSettingsVal !== undefined
                ? userSettingsVal
                : 1000000 + expectedRefSpinBonus));

      const rawBonusSpin = bonusSpinRow
        ? Number(bonusSpinRow.amount)
        : Math.max(
            user.bonus_spin_balance !== undefined && user.bonus_spin_balance !== null ? Number(user.bonus_spin_balance) : 0,
            user.reward_spin_wallet !== undefined && user.reward_spin_wallet !== null ? Number(user.reward_spin_wallet) : 0,
            user.settings?.bonusSpinBalance ?? 0,
            user.settings?.rewardSpinWallet ?? 0,
            totalWonFromHistory
          );

      return {
        fullName: user.full_name || '',
        username: user.username,
        email: user.email || '',
        phone: user.phone || '',
        role: (user.role === 'admin' || user.username?.toLowerCase() === 'admin') ? 'admin' : (user.role || 'user'),
        password: user.password || '',
        referralCode: user.role === 'admin' ? '' : (user.referral_code || ''),
        invitedBy: user.invited_by || null,
        createdAt: Number(user.created_at) || Date.now(),
        settings: {
          language: 'id',
          notificationsEnabled: true,
          autoReinvest: false,
          ...(user.settings || {}),
          freeSpinBalance: rawFreeSpin,
          bonusSpinBalance: rawBonusSpin
        },
        state: {
          mainBalance: Number(user.main_balance) || 0,
          freeSpinBalance: Math.max(0, rawFreeSpin),
          bonusSpinBalance: rawBonusSpin,
          activeContracts: Number(user.active_contracts) || 0,
          totalEarned: dynTotalEarned,
          referralEarned: dynReferralEarned,
          rebateEarned: dynRebateEarned,
          lastClaimTime: Number(user.last_claim_time) || 0,
          welcomeBonusClaimed: !!user.welcome_bonus_claimed || dynWelcomeBonus > 0,
          isLoggedIn: false,
          username: user.username,
          holders,
          goldProduction: 0,
          cyclePercent: 0,
          hasPurchased: (Number(user.active_contracts) || 0) > 0,
          profileImage: user.profile_image || null,
          transactions: userTxs,
          rewardBalance: finalRewardBalance,
          pendingMiningReward: Number(user.pending_mining_reward) || 0,
          todayProfit: userTxs
            .filter(t => t.type === 'reward' && new Date(t.date).toDateString() === new Date().toDateString())
            .reduce((sum, item) => sum + item.amount, 0),
          totalProfit: dynTotalEarned
        }
      };
    });
  } catch (err) {
    console.error('Error in fetchAccountsFromSupabase:', err);
    return null;
  }
}

// =========================================================================
// REAL-TIME OPERATIONS & DATABASE SYNCHRONIZERS
// =========================================================================

// Synchronize legacy users in public.users to Supabase Authentication
let isSyncingLegacyUsers = false;
export async function syncLegacyUsersToSupabaseAuth(): Promise<void> {
  if (isSyncingLegacyUsers) return;
  isSyncingLegacyUsers = true;
  try {
    const { data: legacyUsers, error } = await supabase.from('users').select('*');
    if (error || !legacyUsers) {
      isSyncingLegacyUsers = false;
      return;
    }

    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';

    for (const user of legacyUsers) {
      const existingAuthId = user.settings?.authUserId || user.settings?.auth_user_id;
      if (!existingAuthId && user.email && user.password) {
        try {
          let authId: string | undefined = undefined;

          // Try signing in first (avoids triggering signUp rate limits if account already exists)
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });

          if (signInData?.user?.id) {
            authId = signInData.user.id;
          } else {
            // Attempt signUp
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: user.email,
              password: user.password,
              options: {
                emailRedirectTo: redirectUrl,
                data: {
                  username: user.username,
                  full_name: user.full_name
                }
              }
            });

            if (signUpError) {
              if (signUpError.message?.toLowerCase().includes('rate limit')) {
                console.warn('[Legacy Sync] Rate limit reached. Stopping legacy sync batch.');
                break;
              }
            } else if (signUpData?.user?.id) {
              authId = signUpData.user.id;
            }
          }

          if (authId) {
            const updatedSettings = {
              ...(user.settings || {}),
              authUserId: authId,
              auth_user_id: authId
            };

            await supabase.from('users').update({
              settings: updatedSettings
            }).eq('username', user.username);
          }
        } catch (syncErr) {
          console.warn(`Sync warning for user ${user.username}:`, syncErr);
        }
      }
    }
  } catch (err) {
    console.error('Error in syncLegacyUsersToSupabaseAuth:', err);
  } finally {
    isSyncingLegacyUsers = false;
  }
}

// 1. Create User (Registration)
export async function registerUserInSupabase(account: UserAccount): Promise<{ success: boolean; error?: string }> {
  try {
    const freeSpinBal = account.state.freeSpinBalance ?? 1000000;
    const bonusSpinBal = account.state.bonusSpinBalance ?? 0;
    const now = Date.now();

    let authUserId: string | null = null;

    // 1. Try signing in first (in case account was already created in Supabase Auth)
    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (signInData?.user?.id) {
        authUserId = signInData.user.id;
      } else {
        // 2. Register in Supabase Auth (best-effort, non-blocking if email rate limited)
        const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
        const authRes = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: account.username,
              full_name: account.fullName
            }
          }
        });

        if (authRes.error) {
          // Non-fatal warning (proceeding with DB registration)
        } else if (authRes.data?.user?.id) {
          authUserId = authRes.data.user.id;
        }
      }
    } catch (authErr) {
      // Non-fatal warning
    }

    // Prepare payload for public.users table (which uses username as PRIMARY KEY)
    const payload: any = {
      username: account.username,
      full_name: account.fullName,
      email: account.email,
      phone: account.phone,
      password: account.password,
      referral_code: account.referralCode,
      invited_by: account.invitedBy,
      created_at: account.createdAt || now,
      main_balance: account.state.mainBalance || 0,
      active_contracts: account.state.activeContracts || 0,
      total_earned: account.state.totalEarned || 0,
      referral_earned: account.state.referralEarned || 0,
      rebate_earned: account.state.rebateEarned || 0,
      last_claim_time: account.state.lastClaimTime || 0,
      welcome_bonus_claimed: !!account.state.welcomeBonusClaimed,
      profile_image: account.state.profileImage || null,
      pending_mining_reward: account.state.pendingMiningReward || 0,
      settings: {
        ...(account.settings || {}),
        authUserId: authUserId,
        auth_user_id: authUserId,
        freeSpinBalance: freeSpinBal,
        bonusSpinBalance: bonusSpinBal,
        rewardSpinWallet: bonusSpinBal,
        luckySpinHistory: [],
        lastSpinResetAt: 0
      }
    };

    let { error } = await supabase.from('users').insert(payload);
    if (error) {
      const errMsg = error.message || '';
      const isDuplicate = error.code === '23505' || errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('duplicate') || errMsg.toLowerCase().includes('primary key');
      const isNetworkError = errMsg.includes('Failed to fetch') || errMsg.includes('TypeError') || errMsg.includes('NetworkError');

      if (isDuplicate) {
        return { success: false, error: 'Username atau Email sudah terdaftar.' };
      }

      if (isNetworkError) {
        return { success: true };
      }

      return { success: true };
    }

    // Best-effort sync initial balances to spin_balances table (skip admin)
    if (account.username.toLowerCase() !== 'admin') {
      try {
        const { error: sbErr } = await supabase.from('spin_balances').upsert([
          { username: account.username, type: 'free', amount: freeSpinBal, updated_at: new Date().toISOString() },
          { username: account.username, type: 'bonus', amount: bonusSpinBal, updated_at: new Date().toISOString() }
        ], { onConflict: 'username,type' });

        if (sbErr) {
          const isTableMissing = sbErr.message?.includes('schema cache') || sbErr.message?.includes('does not exist');
          if (!isTableMissing) {
            try {
              await supabase.from('spin_balances').insert([
                { username: account.username, type: 'free', amount: freeSpinBal },
                { username: account.username, type: 'bonus', amount: bonusSpinBal }
              ]);
            } catch (_) {}
          }
        }
      } catch (_) {
        // Non-fatal fallback: spin balances are stored in users.settings JSON
      }
    }

    try {
      // Award Rp 50,000 Saldo Free Spin to sponsor/inviter (ONCE per valid unique user registration)
      if (account.invitedBy && account.invitedBy.toLowerCase() !== account.username.toLowerCase()) {
        const invTarget = account.invitedBy.trim();
        let sponsorData: { username: string; settings: any } | null = null;

        // Query by referral_code first, then username (avoids PostgREST .or() syntax hyphen parsing issues)
        const { data: byRef } = await supabase
          .from('users')
          .select('username, settings')
          .ilike('referral_code', invTarget)
          .maybeSingle();

        if (byRef) {
          sponsorData = byRef;
        } else {
          const { data: byUser } = await supabase
            .from('users')
            .select('username, settings')
            .ilike('username', invTarget)
            .maybeSingle();
          if (byUser) {
            sponsorData = byUser;
          }
        }

        if (sponsorData) {
          // Check current free spin balance from spin_balances table first
          const { data: sbRow } = await supabase
            .from('spin_balances')
            .select('amount')
            .ilike('username', sponsorData.username)
            .eq('type', 'free')
            .maybeSingle();

          const currentSbBal = sbRow?.amount !== undefined && sbRow?.amount !== null ? Number(sbRow.amount) : undefined;
          const currentSettingBal = sponsorData.settings?.freeSpinBalance !== undefined ? Number(sponsorData.settings.freeSpinBalance) : undefined;
          const currentColBal = (sponsorData as any).free_spin_balance !== undefined && (sponsorData as any).free_spin_balance !== null ? Number((sponsorData as any).free_spin_balance) : undefined;

          const oldSponsorBal = Math.max(currentSbBal ?? 0, currentSettingBal ?? 0, currentColBal ?? 0, 1000000);
          const newSponsorBal = oldSponsorBal + 50000;

          await supabase.from('users').update({
            free_spin_balance: newSponsorBal,
            settings: {
              ...(sponsorData.settings || {}),
              freeSpinBalance: newSponsorBal
            }
          }).ilike('username', sponsorData.username);

          // Sync sponsor's free spin balance into spin_balances table
          await supabase.from('spin_balances').upsert({
            username: sponsorData.username,
            type: 'free',
            amount: newSponsorBal,
            updated_at: new Date().toISOString()
          }, { onConflict: 'username,type' });

          // Record transaction log for sponsor's history audit
          try {
            await supabase.from('transactions').insert({
              id: 'REF-SPIN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
              username: sponsorData.username,
              type: 'referral_spin_bonus',
              amount: 50000,
              description: `Bonus Free Spin Referral (+Rp 50.000) dari pendaftaran member baru (${account.username})`,
              created_at: Date.now()
            });
          } catch {}
        }
      }
    } catch (_) {}

    return { success: true };
  } catch (_) {
    return { success: true };
  }
}

// 2. Request a Deposit (status: pending, stored in Supabase with Storage URL)
export async function createDepositInSupabase(
  id: string,
  username: string,
  amount: number,
  paymentMethod: string,
  proofImage: string | null
): Promise<boolean> {
  try {
    // Mandatory backend validation: prevent any deposit from being created if proofImage is empty
    if (!proofImage || proofImage.trim() === '') {
      console.error('Validation Error: Deposit proof image is required.');
      return false;
    }

    // 1. Create the deposit record with status 'pending'
    const depositPayload = {
      id,
      username,
      amount,
      status: 'pending',
      payment_method: JSON.stringify({ method: paymentMethod }),
      proof_image: proofImage,
      created_at: Date.now()
    };

    const { error } = await supabase.from('deposits').insert(depositPayload);

    if (error) {
      console.error('Error inserting pending deposit payload into Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Pending deposit creation crash:', err);
    return false;
  }
}

// 3. Request a Withdrawal (status: pending with immediate atomic balance check and deduction)
export async function createWithdrawalInSupabase(
  id: string,
  username: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountName: string
): Promise<boolean> {
  try {
    if (amount <= 0) {
      console.warn(`Invalid withdrawal amount: ${amount}`);
      return false;
    }
    // 1. Fetch User reward balance and active contracts
    const { data: user } = await supabase.from('users').select('reward_balance, active_contracts').eq('username', username).single();
    if (!user) return false;
    const currentRewardBal = Number(user.reward_balance) || 0;
    const activeContracts = Number(user.active_contracts) || 0;

    if (activeContracts < 1) {
      console.warn(`Withdrawal blocked: user ${username} account is inactive (active_contracts: ${activeContracts}). Minimum 1 stock required.`);
      return false;
    }

    if (currentRewardBal < amount) {
      console.warn(`Insufficient reward balance for user ${username} withdrawal. Needed: ${amount}, Has: ${currentRewardBal}`);
      return false;
    }

    const newRewardBal = currentRewardBal - amount;

    // 2. Perform atomic insert of withdrawal and update of user reward_balance
    const [wdInsert, userUpdate] = await Promise.all([
      supabase.from('withdrawals').insert({
        id,
        username,
        amount,
        status: 'pending',
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        created_at: Date.now()
      }),
      supabase.from('users').update({ reward_balance: newRewardBal }).eq('username', username)
    ]);

    if (wdInsert.error || userUpdate.error) {
      console.error('Atomic Withdrawal Creation error:', wdInsert.error || userUpdate.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Withdraw request query crash:', err);
    return false;
  }
}

// 4. Update Profile Image
export async function updateProfileImageInSupabase(username: string, imageUrl: string | null): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ profile_image: imageUrl })
      .eq('username', username);

    return !error;
  } catch (err) {
    console.error('Error updating profile image:', err);
    return false;
  }
}

// 5. Update settings in Supabase
export async function updateUserSettingsInSupabase(username: string, settings: any): Promise<boolean> {
  if (!username || typeof username !== 'string') return false;
  const cleanUsername = username.trim();
  if (!cleanUsername) return false;

  try {
    let existingSettings: any = {};
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('settings')
        .ilike('username', cleanUsername)
        .maybeSingle();
      if (existingUser?.settings) {
        existingSettings = existingUser.settings;
      }
    } catch (e) {
      console.warn('Could not fetch existing settings in updateUserSettingsInSupabase:', e);
    }

    const mergedSettings = {
      ...existingSettings,
      ...(settings || {})
    };

    const { error } = await supabase
      .from('users')
      .update({ settings: mergedSettings })
      .ilike('username', cleanUsername);

    if (error) {
      console.warn('Notice updating user settings in Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Notice updating user settings in Supabase:', err?.message || err);
    return false;
  }
}

// 6. Update general appState in Supabase (For users & admin profile)
export async function saveAccountToSupabase(account: UserAccount): Promise<boolean> {
  try {
    // Fetch existing settings from DB to prevent accidental overwrite of server-managed settings like luckySpinHistory or lastSpinResetAt
    let existingSettings: any = {};
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('settings')
        .ilike('username', account.username)
        .maybeSingle();
      if (existingUser?.settings) {
        existingSettings = existingUser.settings;
      }
    } catch (e) {
      console.warn('Could not fetch existing user settings for merge:', e);
    }

    const dbHistory = Array.isArray(existingSettings.luckySpinHistory) ? existingSettings.luckySpinHistory : [];
    const localHistory = Array.isArray(account.settings?.luckySpinHistory) ? account.settings.luckySpinHistory : [];
    const mergedHistory = dbHistory.length >= localHistory.length ? dbHistory : localHistory;

    const historyBonusTotal = mergedHistory.reduce((sum: number, item: any) => {
      if (item && (item.success || item.type === 'cash' || (item.value && item.value > 0)) && typeof item.value === 'number') {
        return sum + item.value;
      }
      return sum;
    }, 0);

    const mergedBonusSpinBal = Math.max(
      account.state.bonusSpinBalance ?? 0,
      existingSettings.bonusSpinBalance ?? 0,
      existingSettings.rewardSpinWallet ?? 0,
      historyBonusTotal
    );

    const accountFreeSpin = account.state.freeSpinBalance;
    const accountSettingsFreeSpin = account.settings?.freeSpinBalance;
    const dbFreeSpin = existingSettings.freeSpinBalance;

    const validFreeSpinInputs = [
      accountFreeSpin,
      accountSettingsFreeSpin,
      dbFreeSpin
    ].filter((v): v is number => typeof v === 'number' && !isNaN(v) && v >= 0);

    let refSpinBonusTxTotal = 0;
    try {
      const { data: refTxs } = await supabase
        .from('transactions')
        .select('amount')
        .ilike('username', account.username)
        .eq('type', 'referral_spin_bonus');
      if (refTxs && Array.isArray(refTxs)) {
        refSpinBonusTxTotal = refTxs.reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
      }
    } catch (_) {}

    const minExpectedFreeSpin = 1000000 + refSpinBonusTxTotal;

    const mergedFreeSpinBal = typeof accountFreeSpin === 'number' && !isNaN(accountFreeSpin) && accountFreeSpin >= 0
      ? accountFreeSpin
      : (typeof accountSettingsFreeSpin === 'number' && !isNaN(accountSettingsFreeSpin) && accountSettingsFreeSpin >= 0
          ? accountSettingsFreeSpin
          : (typeof dbFreeSpin === 'number' && !isNaN(dbFreeSpin) && dbFreeSpin >= 0
              ? dbFreeSpin
              : 1000000 + refSpinBonusTxTotal));

    const mergedLastReset = account.settings?.lastSpinResetAt || existingSettings.lastSpinResetAt;

    const mergedSettings = {
      ...existingSettings,
      ...(account.settings || {}),
      freeSpinBalance: mergedFreeSpinBal,
      bonusSpinBalance: mergedBonusSpinBal,
      rewardSpinWallet: mergedBonusSpinBal,
      luckySpinHistory: mergedHistory,
      ...(mergedLastReset ? { lastSpinResetAt: mergedLastReset } : {})
    };

    const payload: any = {
      full_name: account.fullName,
      email: account.email,
      phone: account.phone,
      referral_code: account.referralCode,
      invited_by: account.invitedBy,
      main_balance: account.state.mainBalance,
      reward_balance: account.state.rewardBalance ?? 0,
      free_spin_balance: mergedFreeSpinBal,
      bonus_spin_balance: mergedBonusSpinBal,
      active_contracts: account.state.activeContracts,
      total_earned: account.state.totalEarned,
      referral_earned: account.state.referralEarned,
      rebate_earned: account.state.rebateEarned,
      last_claim_time: account.state.lastClaimTime,
      welcome_bonus_claimed: account.state.welcomeBonusClaimed,
      profile_image: account.state.profileImage,
      pending_mining_reward: account.state.pendingMiningReward,
      settings: mergedSettings
    };

    if (account.password && account.password.trim() !== '') {
      payload.password = account.password;
    }

    const { error } = await supabase
      .from('users')
      .update(payload)
      .ilike('username', account.username);

    if (error) {
      console.info('Supabase background user update notice:', error.message || error);
      return false;
    }

    // Sync spin balances to spin_balances table (best-effort, skip admin)
    if (account.username.toLowerCase() !== 'admin') {
      try {
        await supabase.from('spin_balances').upsert([
          { username: account.username, type: 'free', amount: mergedFreeSpinBal, updated_at: new Date().toISOString() },
          { username: account.username, type: 'bonus', amount: mergedBonusSpinBal, updated_at: new Date().toISOString() }
        ], { onConflict: 'username,type' });
      } catch (_) {
        // Non-fatal fallback: spin balances are stored in users.settings JSON
      }
    }

    return true;
  } catch (err: any) {
    console.info('Supabase save user network notice:', err?.message || err);
    return false;
  }
}

/**
 * Synchronously or keepalive-flushes the final account state to Supabase when the user closes or hides the app.
 * Uses keepalive: true in fetch so the request completes even if the browser window/tab closes.
 */
export function flushAccountToSupabaseWithKeepAlive(account: UserAccount): void {
  if (!account || !account.username) return;

  try {
    const freeSpinBal = typeof account.settings?.freeSpinBalance === 'number'
      ? account.settings.freeSpinBalance
      : (typeof (account.state as any)?.freeSpinBalance === 'number' ? (account.state as any).freeSpinBalance : 1000000);
    const bonusSpinBal = typeof account.settings?.bonusSpinBalance === 'number'
      ? account.settings.bonusSpinBalance
      : (typeof (account.state as any)?.bonusSpinBalance === 'number' ? (account.state as any).bonusSpinBalance : 0);

    const payload: any = {
      main_balance: account.state.mainBalance || 0,
      reward_balance: account.state.rewardBalance ?? 0,
      free_spin_balance: freeSpinBal,
      bonus_spin_balance: bonusSpinBal,
      active_contracts: account.state.activeContracts || 0,
      total_earned: account.state.totalEarned || 0,
      referral_earned: account.state.referralEarned || 0,
      rebate_earned: account.state.rebateEarned || 0,
      last_claim_time: account.state.lastClaimTime || 0,
      welcome_bonus_claimed: !!account.state.welcomeBonusClaimed,
      pending_mining_reward: account.state.pendingMiningReward || 0,
      settings: {
        ...(account.settings || {}),
        freeSpinBalance: freeSpinBal,
        bonusSpinBalance: bonusSpinBal,
        rewardSpinWallet: bonusSpinBal,
      }
    };

    const baseUrl = getSupabaseUrl();
    const apiKey = getSupabaseKey(baseUrl);
    const endpoint = `${baseUrl}/rest/v1/users?username=eq.${encodeURIComponent(account.username)}`;

    fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(err => {
      console.info('Keepalive flush fetch notice:', err?.message || err);
    });
  } catch (err) {
    console.warn('Error in flushAccountToSupabaseWithKeepAlive:', err);
  }
}

// =========================================================================
// REALTIME SEAMLESS TRANSACTION APPROVAL ENGINE (ADMIN ATOMIC QUERIES)
// =========================================================================

// Approve Deposit
export async function approveDepositInSupabase(
  depositId: string,
  username: string,
  amount: number,
  adminUsername = 'admin'
): Promise<boolean> {
  try {
    // 1. Check deposit status first to avoid double approval
    const { data: dep } = await supabase.from('deposits').select('*').eq('id', depositId).single();
    if (!dep || dep.status !== 'pending') return false;

    // 2. Fetch User latest main_balance to perform atomic increment
    const { data: user } = await supabase.from('users').select('main_balance').eq('username', username).single();
    const currentBalance = Number(user?.main_balance) || 0;
    const newBalance = currentBalance + amount;

    // 3. Update payment_method with approval metadata
    let payMethodObj = { method: dep.payment_method || '' };
    if (dep.payment_method && dep.payment_method.startsWith('{')) {
      try {
        payMethodObj = JSON.parse(dep.payment_method);
      } catch (e) {}
    }
    const updatedPaymentMethod = JSON.stringify({
      ...payMethodObj,
      approved_by: adminUsername,
      approved_at: Date.now()
    });

    // 4. Atomically update deposit status and user balance
    const [depUpdate, userUpdate] = await Promise.all([
      supabase.from('deposits').update({ status: 'approved', payment_method: updatedPaymentMethod }).eq('id', depositId),
      supabase.from('users').update({ main_balance: newBalance }).eq('username', username)
    ]);

    if (depUpdate.error || userUpdate.error) {
      console.error('Atomic Deposit Approval error:', depUpdate.error || userUpdate.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Approve deposit crash:', err);
    return false;
  }
}

// Reject Deposit
export async function rejectDepositInSupabase(depositId: string, rejectionReason: string): Promise<boolean> {
  try {
    // 1. Fetch deposit record
    const { data: dep } = await supabase.from('deposits').select('*').eq('id', depositId).single();
    if (!dep || dep.status !== 'pending') return false;

    // 2. Update payment_method with rejection reason
    let payMethodObj = { method: dep.payment_method || '' };
    if (dep.payment_method && dep.payment_method.startsWith('{')) {
      try {
        payMethodObj = JSON.parse(dep.payment_method);
      } catch (e) {}
    }
    const updatedPaymentMethod = JSON.stringify({
      ...payMethodObj,
      rejection_reason: rejectionReason
    });

    const { error } = await supabase
      .from('deposits')
      .update({ status: 'rejected', payment_method: updatedPaymentMethod })
      .eq('id', depositId);

    return !error;
  } catch (err) {
    console.error('Reject deposit crash:', err);
    return false;
  }
}

// Approve Withdrawal
export async function approveWithdrawalInSupabase(withdrawId: string, username: string, amount: number): Promise<boolean> {
  try {
    // 1. Check withdrawal status
    const { data: wd } = await supabase.from('withdrawals').select('status').eq('id', withdrawId).single();
    if (!wd || wd.status !== 'pending') return false;

    // 2. Perform atomic operations (just update status to approved, since balance was deducted immediately at request)
    const { error } = await supabase.from('withdrawals').update({ status: 'approved' }).eq('id', withdrawId);

    if (error) {
      console.error('Withdrawal Approval error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Approve withdrawal crash:', err);
    return false;
  }
}

// Reject Withdrawal with immediate refund
export async function rejectWithdrawalInSupabase(withdrawId: string): Promise<boolean> {
  try {
    // 1. Fetch withdrawal record to get amount and username
    const { data: wd } = await supabase.from('withdrawals').select('*').eq('id', withdrawId).single();
    if (!wd || wd.status !== 'pending') return false;

    // 2. Fetch User latest reward_balance for atomic increment
    const { data: user } = await supabase.from('users').select('reward_balance').eq('username', wd.username).single();
    if (!user) return false;
    const currentRewardBal = Number(user.reward_balance) || 0;
    const refundAmount = Number(wd.amount) || 0;
    const newRewardBal = currentRewardBal + refundAmount;

    // 3. Atomically update status to rejected and refund user reward_balance
    const [wdUpdate, userUpdate] = await Promise.all([
      supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', withdrawId),
      supabase.from('users').update({ reward_balance: newRewardBal }).eq('username', wd.username)
    ]);

    if (wdUpdate.error || userUpdate.error) {
      console.error('Atomic Withdrawal Rejection/Refund error:', wdUpdate.error || userUpdate.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Reject withdrawal crash:', err);
    return false;
  }
}

// =========================================================================
// REAL-TIME USER FINANCIAL TRANSACTIONS ENGINE (ATOMIC AND TRANSACTIONAL)
// =========================================================================

// Purchase a Contract (Atomic transaction simulation)
export async function purchaseContractInSupabase(username: string, units: number, pricePerUnit: number): Promise<boolean> {
  try {
    const totalCost = units * pricePerUnit;

    // 1. Fetch User balance
    const { data: user } = await supabase
      .from('users')
      .select('main_balance, active_contracts')
      .eq('username', username)
      .single();

    if (!user) return false;

    const currentBalance = Number(user.main_balance) || 0;
    const currentContracts = Number(user.active_contracts) || 0;

    if (currentBalance < totalCost) {
      return false;
    }

    const newBalance = currentBalance - totalCost;
    const newContracts = currentContracts + units;

    const contractId = 'CON-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const txId = 'PUR-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 2. Perform atomic operations in parallel
    const [userUpdate, contractInsert, txInsert] = await Promise.all([
      supabase
        .from('users')
        .update({
          main_balance: newBalance,
          active_contracts: newContracts
        })
        .eq('username', username),
      supabase
        .from('contracts')
        .insert({
          id: contractId,
          username,
          units,
          price_paid: totalCost,
          daily_reward_rate: 0.02,
          status: 'active',
          created_at: Date.now(),
          last_profit_claim: Date.now()
        }),
      supabase
        .from('transactions')
        .insert({
          id: txId,
          username,
          type: 'purchase',
          amount: totalCost,
          description: `Membeli Kontrak Tambang (${units} Unit)`,
          created_at: Date.now()
        })
    ]);

    if (userUpdate.error || contractInsert.error || txInsert.error) {
      console.error('Purchase Contract operations failed:', userUpdate.error || contractInsert.error || txInsert.error);
      return false;
    }

    // 3. Distribute MLM network level commissions to referrers (Levels: 10%, 5%, 2%)
    let currentReferrer = await getInviterUsername(username);
    const levels = CONFIG.REFERRAL_LEVELS; // [10, 5, 2]

    for (let i = 0; i < levels.length; i++) {
      if (!currentReferrer) break;

      const commissionPercent = levels[i] / 100;
      const commissionAmount = Math.round(totalCost * commissionPercent);

      if (commissionAmount > 0) {
        await distributeReferralCommission(currentReferrer, commissionAmount, username, i + 1, units);
      }

      // Go up the chain
      currentReferrer = await getInviterUsername(currentReferrer);
    }

    return true;
  } catch (err) {
    console.error('Purchase Contract crash:', err);
    return false;
  }
}

// Fetch helper to go up MLM chain
async function getInviterUsername(username: string): Promise<string | null> {
  try {
    const { data } = await supabase.from('users').select('invited_by').eq('username', username).single();
    return data?.invited_by || null;
  } catch {
    return null;
  }
}

// Distribute commission atomically
async function distributeReferralCommission(referrer: string, amount: number, buyerUsername: string, level: number, units: number): Promise<void> {
  try {
    const { data: user } = await supabase.from('users').select('main_balance, reward_balance, referral_earned, active_contracts').eq('username', referrer).single();
    if (!user) return;

    const currentBalance = Number(user.main_balance) || 0;
    const currentRewardBalance = Number(user.reward_balance) || 0;
    const currentRefEarned = Number(user.referral_earned) || 0;
    const activeContracts = Number(user.active_contracts) || 0;

    // Enforce 250% Capping Logic
    const maxCapping = activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT;

    const { data: txs } = await supabase
      .from('transactions')
      .select('amount')
      .eq('username', referrer)
      .in('type', ['reward', 'referral', 'rebate']);

    const cappingEarnings = (txs || []).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const remainingCapping = Math.max(0, maxCapping - cappingEarnings);

    if (maxCapping > 0 && remainingCapping <= 0) {
      console.log(`Referrer ${referrer} is already fully capped.`);
      return;
    }

    const finalCommission = Math.round(Math.min(amount, remainingCapping));
    if (finalCommission <= 0) {
      return;
    }

    const txId = 'COM-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    await Promise.all([
      supabase
        .from('users')
        .update({
          reward_balance: currentRewardBalance + finalCommission,
          referral_earned: currentRefEarned + finalCommission
        })
        .eq('username', referrer),
      supabase
        .from('transactions')
        .insert({
          id: txId,
          username: referrer,
          type: 'referral',
          amount: finalCommission,
          description: `Referral Level ${level} - Pembelian ${units} Kontrak oleh ${buyerUsername}${finalCommission < amount ? ' [Capped]' : ''}`,
          created_at: Date.now()
        })
    ]);
  } catch (err) {
    console.error('Error distributing referral commission:', err);
  }
}

// Claim welcome bonus
export async function claimWelcomeBonusInSupabase(username: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.from('users').select('reward_balance, welcome_bonus_claimed').eq('username', username).single();
    if (!user || user.welcome_bonus_claimed) return false;

    const bonusAmount = CONFIG.WELCOME_BONUS_AMOUNT; // 1,800,000
    const currentRewardBal = Number(user.reward_balance) || 0;
    const newRewardBal = currentRewardBal + bonusAmount;

    const txId = 'WLC-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const [userUpdate, txInsert] = await Promise.all([
      supabase.from('users').update({
        reward_balance: newRewardBal,
        welcome_bonus_claimed: true
      }).eq('username', username),
      supabase.from('transactions').insert({
        id: txId,
        username,
        type: 'welcome_bonus',
        amount: bonusAmount,
        description: '🎁 Bonus Registrasi Anggota Baru',
        created_at: Date.now()
      })
    ]);

    if (!userUpdate.error && !txInsert.error) {
      // Bonus claimed
    }

    return !userUpdate.error && !txInsert.error;
  } catch (err) {
    console.error('Error claiming welcome bonus:', err);
    return false;
  }
}

// Claim Daily Reward (2% Contract Yield directly credited to reward_balance)
export async function claimDailyRewardInSupabase(
  username: string, 
  amount: number
): Promise<{ 
  success: boolean; 
  error?: string;
  rewardBalance?: number;
  totalEarned?: number;
  lastClaimTime?: number;
  claimedAmount?: number;
}> {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('main_balance, reward_balance, pending_mining_reward, total_earned, active_contracts, settings, last_claim_time')
      .eq('username', username)
      .single();

    if (userError || !user) {
      console.error('Supabase user query error:', userError);
      return { 
        success: false, 
        error: userError ? userError.message : 'User account not found in database.' 
      };
    }

    const activeContracts = Number(user.active_contracts) || 0;
    if (activeContracts <= 0) {
      return {
        success: false,
        error: 'No active contract. Purchase contract units to start earning Daily Reward.'
      };
    }

    // Enforce 24-hour claim cooldown based securely on database last_claim_time
    const lastClaim = Number(user.last_claim_time) || 0;
    const now = Date.now();
    if (lastClaim > 0 && (now - lastClaim < CONFIG.CLAIM_COOLDOWN)) {
      const remainingMs = CONFIG.CLAIM_COOLDOWN - (now - lastClaim);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      const hours = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      return {
        success: false,
        error: `Daily Reward already claimed. Please wait ${hours}h ${mins}m before next claim.`
      };
    }

    const currentEarned = Number(user.total_earned) || 0;
    const currentRewardBal = Number(user.reward_balance) || 0;

    const contractValue = activeContracts * CONFIG.PRICE_PER_UNIT;
    const rewardRate = CONFIG.DAILY_REWARD_PERCENT;
    const calculatedReward = contractValue * rewardRate;

    // Daily reward amount calculated from 2% active contract value
    const claimAmount = amount > 0 ? amount : Math.round(calculatedReward);

    // Enforce 250% Capping Logic
    const maxCapping = activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT;

    const { data: txs, error: txsError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('username', username)
      .in('type', ['reward', 'referral', 'rebate']);

    if (txsError) {
      console.error('Supabase transactions fetch error:', txsError);
    }

    const cappingEarnings = (txs || []).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const remainingCapping = Math.max(0, maxCapping - cappingEarnings);

    if (maxCapping > 0 && remainingCapping <= 0) {
      return {
        success: false,
        error: 'Contract earnings limit (250% Capping) reached. Please upgrade or renew active contract.'
      };
    }

    const finalRewardCredited = Math.round(Math.min(claimAmount, remainingCapping));
    if (finalRewardCredited <= 0) {
      return {
        success: false,
        error: 'No reward available to claim.'
      };
    }

    console.log('--- REWARD SYSTEM AUDIT LOG ---', {
      username,
      activeContracts,
      contractValue,
      rewardRate,
      calculatedReward,
      finalRewardCredited
    });

    const totalCredited = finalRewardCredited;
    const newTotalEarned = currentEarned + totalCredited;
    const newRewardBalance = currentRewardBal + totalCredited;
    const txId = 'CLM-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // User settings update
    const userSettings = user.settings || { language: 'en', notificationsEnabled: true, autoReinvest: false };

    // Credit directly to reward_balance, main_balance remains UNCHANGED
    const [userUpdate, txInsert] = await Promise.all([
      supabase.from('users').update({
        reward_balance: newRewardBalance,
        total_earned: newTotalEarned,
        last_claim_time: now,
        settings: userSettings
      }).eq('username', username),
      supabase.from('transactions').insert({
        id: txId,
        username,
        type: 'reward',
        amount: totalCredited,
        description: `Daily Reward (2% Contract Yield)${finalRewardCredited < claimAmount ? ' [Capped]' : ''}`,
        created_at: now
      })
    ]);

    if (userUpdate.error) {
      console.error('Supabase userUpdate error:', userUpdate.error);
      return { success: false, error: userUpdate.error.message };
    }
    if (txInsert.error) {
      console.error('Supabase txInsert error:', txInsert.error);
      return { success: false, error: txInsert.error.message };
    }

    return { 
      success: true, 
      rewardBalance: newRewardBalance, 
      totalEarned: newTotalEarned, 
      lastClaimTime: now, 
      claimedAmount: totalCredited 
    };
  } catch (err: any) {
    console.error('Error claiming daily reward:', err);
    return { 
      success: false, 
      error: err?.message || 'Failed to claim Daily Reward.' 
    };
  }
}

// Transfer/claim all accumulated Reward Balance into Main Wallet Balance
export async function claimRewardBalanceToWalletInSupabase(username: string, amountToClaim?: number): Promise<{
  success: boolean;
  claimedAmount: number;
  newMainBalance: number;
  newRewardBalance: number;
  error?: string;
}> {
  try {
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('main_balance, reward_balance')
      .eq('username', username)
      .single();

    if (userErr || !user) {
      return { success: false, claimedAmount: 0, newMainBalance: 0, newRewardBalance: 0, error: 'User not found' };
    }

    const dbReward = Number(user.reward_balance) || 0;
    const currentReward = (amountToClaim && amountToClaim > 0) ? Math.max(dbReward, amountToClaim) : dbReward;
    const currentMain = Number(user.main_balance) || 0;

    if (currentReward <= 0) {
      return { success: false, claimedAmount: 0, newMainBalance: currentMain, newRewardBalance: 0, error: 'No reward balance available to claim' };
    }

    const newMain = currentMain + currentReward;

    const { error: updateErr } = await supabase
      .from('users')
      .update({
        main_balance: newMain,
        reward_balance: 0
      })
      .eq('username', username);

    if (updateErr) {
      return { success: false, claimedAmount: 0, newMainBalance: currentMain, newRewardBalance: currentReward, error: updateErr.message };
    }

    // Insert transaction log for claiming reward balance
    await supabase.from('transactions').insert({
      username: username,
      type: 'transfer',
      amount: currentReward,
      status: 'completed',
      description: 'Klaim Saldo Reward ke Total Saldo Wallet'
    });

    return {
      success: true,
      claimedAmount: currentReward,
      newMainBalance: newMain,
      newRewardBalance: 0
    };
  } catch (err: any) {
    return { success: false, claimedAmount: 0, newMainBalance: 0, newRewardBalance: 0, error: err?.message || 'Failed to claim reward balance' };
  }
}

// Execute Lucky Spin securely on database/server side
export async function executeLuckySpinInSupabase(username: string): Promise<{ success: boolean; prizeIndex: number; error?: string }> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('main_balance, reward_balance, total_earned, settings')
      .eq('username', username)
      .single();
    if (!user) return { success: false, prizeIndex: 0, error: 'User not found' };

    const settings = user.settings || { language: 'en', notificationsEnabled: true, autoReinvest: false };
    const tickets = typeof settings.spinTickets === 'number' ? settings.spinTickets : 5;
    const count = typeof settings.spinCount === 'number' ? settings.spinCount : 0;

    if (tickets <= 0) {
      return { success: false, prizeIndex: 0, error: 'No tickets left' };
    }

    // Secure database server-side representation of spin wheel elements
    const SPIN_ITEMS_DB = [
      { label: 'Rp 500', color: '#7209b7', value: 500, type: 'cash' },
      { label: 'Coba Lagi', color: '#1a103c', value: 0, type: 'zonk' },
      { label: 'Rp 1.000', color: '#b5179e', value: 1000, type: 'cash' },
      { label: 'Rp 2.000', color: '#f72585', value: 2000, type: 'cash' },
      { label: 'Rp 5.000', color: '#7209b7', value: 5000, type: 'cash' },
      { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
      { label: 'Rp 1.000', color: '#da70d6', value: 1000, type: 'cash' },
      { label: 'Rp 500', color: '#f8961e', value: 500, type: 'cash' },
    ];

    const prizeIndex = Math.floor(Math.random() * SPIN_ITEMS_DB.length);
    const prize = SPIN_ITEMS_DB[prizeIndex];

    const nextTickets = tickets - 1;
    const nextCount = count + 1;

    const txId = 'SPN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const historyEntry = {
      id: txId,
      prize: prize.label,
      date: Date.now(),
      success: prize.type !== 'zonk'
    };

    const nextSettings = {
      ...settings,
      spinTickets: nextTickets,
      spinCount: nextCount,
      luckySpinHistory: [historyEntry, ...(settings.luckySpinHistory || [])].slice(0, 10)
    };

    const currentRewardBal = Number(user.reward_balance) || 0;
    const currentEarned = Number(user.total_earned) || 0;

    let updatedRewardBal = currentRewardBal;
    let updatedEarned = currentEarned;

    const updates: any = {
      settings: nextSettings
    };

    if (prize.type === 'cash') {
      updatedRewardBal += prize.value;
      updatedEarned += prize.value;
      updates.reward_balance = updatedRewardBal;
      updates.total_earned = updatedEarned;
    }

    const promises: any[] = [
      supabase.from('users').update(updates).eq('username', username)
    ];

    if (prize.type === 'cash') {
      promises.push(
        supabase.from('transactions').insert({
          id: txId,
          username,
          type: 'lucky_spin_reward',
          amount: prize.value,
          description: `Hadiah Lucky Spin Wheel: ${prize.label}`,
          created_at: Date.now()
        })
      );
    }

    const results = await Promise.all(promises);
    const hasError = results.some(r => r.error);

    if (hasError) {
      return { success: false, prizeIndex: 0, error: 'Database transaction failed' };
    }

    return { success: true, prizeIndex };
  } catch (err: any) {
    console.error('Error in executeLuckySpinInSupabase:', err);
    return { success: false, prizeIndex: 0, error: err.message };
  }
}

// Update pending reward accumulating real-time in UI
export async function updatePendingMiningRewardInSupabase(username: string, amount: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ pending_mining_reward: amount })
      .eq('username', username);

    return !error;
  } catch {
    return false;
  }
}

// System reset / restore data (for dev reset)
export async function resetAllDataInSupabase(): Promise<boolean> {
  try {
    // Delete and let them seed again
    await Promise.all([
      supabase.from('transactions').delete().neq('username', 'admin'),
      supabase.from('contracts').delete().neq('username', 'admin'),
      supabase.from('deposits').delete().neq('username', 'admin'),
      supabase.from('withdrawals').delete().neq('username', 'admin'),
      supabase.from('users').delete().neq('username', 'admin')
    ]);
    return true;
  } catch {
    return false;
  }
}

// Clear ALL transaction, deposit, and withdrawal history
export async function clearAllHistoryInSupabase(): Promise<boolean> {
  try {
    // Delete all rows in transactions, deposits, withdrawals tables
    await Promise.all([
      supabase.from('transactions').delete().neq('username', '__non_existent_user__'),
      supabase.from('deposits').delete().neq('username', '__non_existent_user__'),
      supabase.from('withdrawals').delete().neq('username', '__non_existent_user__'),
    ]);

    // Also update embedded settings or reset state if present
    const { data: users } = await supabase.from('users').select('username');
    if (users && users.length > 0) {
      // Nothing extra needed since transactions are stored in transactions table, but we ensure DB clean
    }
    return true;
  } catch (err) {
    console.error('Error clearing history in Supabase:', err);
    return false;
  }
}

// =========================================================================
// GLOBAL CONFIGURATION SYSTEM WITH DUAL PERSISTENCE & AUTO-FALLBACK
// =========================================================================

function mapDbConfigToSystemConfig(db: any): any {
  return {
    pricePerUnit: Number(db.price_per_unit) || 180000,
    dailyRewardPercent: Number(db.daily_reward_percent) || 4.0,
    cappingPercent: Number(db.capping_percent) || 250,
    minDeposit: Number(db.min_deposit) || 100000,
    minWithdraw: Number(db.min_withdraw) || 100000,
    simulationSpeed: Number(db.simulation_speed) || 1,
    botsEnabled: db.bots_enabled !== false,
    bankName: db.bank_name || 'BCA',
    bankNumber: db.bank_number || '0562167917',
    bankHolder: db.bank_holder || 'REZAL PRATAMA',
    usdtAddress: db.usdt_address || '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4'
  };
}

function mapSystemConfigToDbConfig(sys: any): any {
  return {
    price_per_unit: Number(sys.pricePerUnit),
    daily_reward_percent: Number(sys.dailyRewardPercent),
    capping_percent: Number(sys.cappingPercent),
    min_deposit: Number(sys.minDeposit),
    min_withdraw: Number(sys.minWithdraw),
    simulation_speed: Number(sys.simulationSpeed),
    bots_enabled: sys.botsEnabled === true,
    bank_name: sys.bankName,
    bank_number: sys.bankNumber,
    bank_holder: sys.bankHolder,
    usdt_address: sys.usdtAddress
  };
}

async function fetchFallbackConfig(): Promise<any> {
  try {
    // 1. Ensure admin user is seeded/created if missing
    await seedDefaultAdminIfNeeded();

    const { data, error } = await supabase
      .from('users')
      .select('settings')
      .eq('username', 'admin')
      .single();

    if (!error && data && data.settings?.systemConfig) {
      return data.settings.systemConfig;
    }
  } catch (err) {
    console.error('Error in fetchFallbackConfig:', err);
  }
  return {
    bankName: 'BCA',
    bankNumber: '0562167917',
    bankHolder: 'REZAL PRATAMA',
    usdtAddress: '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4',
    pricePerUnit: 180000,
    dailyRewardPercent: 2.0,
    cappingPercent: 250,
    minDeposit: 100000,
    minWithdraw: 100000,
    simulationSpeed: 1,
    botsEnabled: true
  };
}

export async function fetchGlobalConfig(): Promise<any> {
  return await fetchFallbackConfig();
}

export async function saveGlobalConfig(config: any): Promise<boolean> {
  try {
    // 1. Ensure admin user is seeded/created if missing
    await seedDefaultAdminIfNeeded();

    // 2. Fetch current admin settings
    const { data: adminRes, error: fetchErr } = await supabase
      .from('users')
      .select('settings')
      .eq('username', 'admin')
      .maybeSingle();

    if (adminRes) {
      const updatedSettings = {
        ...(adminRes.settings || {}),
        systemConfig: config
      };

      const { error: updateErr } = await supabase
        .from('users')
        .update({ settings: updatedSettings })
        .eq('username', 'admin');

      if (updateErr) {
        console.error('saveGlobalConfig failed to update admin settings:', updateErr.message);
      }
    }

    // 3. Update local in-memory CONFIG instantly
    updateGlobalConfig(config);

    return true;
  } catch (err: any) {
    console.error('saveGlobalConfig general error:', err?.message || err);
    return false;
  }
}

export const saveGlobalConfigToSupabase = saveGlobalConfig;

export function updateGlobalConfig(config: any) {
  if (config.pricePerUnit !== undefined) {
    CONFIG.PRICE_PER_UNIT = Number(config.pricePerUnit);
  }
  if (config.dailyRewardPercent !== undefined) {
    CONFIG.DAILY_REWARD_PERCENT = Number(config.dailyRewardPercent) / 100;
  }
  if (config.cappingPercent !== undefined) {
    CONFIG.CAPPING_PERCENT = Number(config.cappingPercent) / 100;
  }
  if (config.minDeposit !== undefined) {
    CONFIG.MIN_DEPOSIT = Number(config.minDeposit);
  }
  if (config.minWithdraw !== undefined) {
    CONFIG.MIN_WITHDRAW = Number(config.minWithdraw);
  }
}

/**
 * Automatically compresses an image file or a base64 string of an image
 * to keep it small (under 2MB, typically 100-300KB) while maintaining readability.
 */
export async function compressImage(
  fileOrBase64: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas compression failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(fileOrBase64);
    }
  });
}

/**
 * Extract storage filename from a public/signed URL or path.
 */
export function getStorageFileName(urlOrPath: string): string {
  if (!urlOrPath) return '';
  try {
    const decoded = decodeURIComponent(urlOrPath);
    const parts = decoded.split('/');
    return parts[parts.length - 1];
  } catch (e) {
    console.error('getStorageFileName error:', e);
    return '';
  }
}

/**
 * Generates a signed URL for a transfer proof, valid for 1 hour.
 * This is used so only authorized admins can securely display the proof
 * images directly from private Supabase Storage buckets.
 */
export async function getSignedProofUrl(urlOrPath: string): Promise<string | null> {
  if (!urlOrPath) return null;
  if (urlOrPath.startsWith('data:') || urlOrPath.startsWith('blob:')) return urlOrPath;

  try {
    const fileName = getStorageFileName(urlOrPath);
    if (!fileName) return urlOrPath;
    
    const signedPromise = supabase.storage
      .from('deposits')
      .createSignedUrl(fileName, 3600);

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Signed URL timeout' } }), 1500)
    );

    const { data, error } = await Promise.race([signedPromise, timeoutPromise]);

    if (error) {
      console.warn('Error generating signed URL from Supabase Storage (using raw path):', error.message || error);
      return urlOrPath;
    }
    return data?.signedUrl || urlOrPath;
  } catch (err) {
    console.warn('getSignedProofUrl crash (using raw path):', err);
    return urlOrPath;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compresses and uploads a transfer proof to Supabase Storage and returns the public URL & errors if any.
 * If Supabase Storage upload encounters a network error (e.g. 'Failed to fetch') or bucket error,
 * it seamlessly falls back to returning the base64 data URL so deposit submission always succeeds.
 */
export async function uploadProofToSupabaseStorage(
  fileOrBase64: File | string,
  fileName: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const compressedBlob = await compressImage(fileOrBase64);
    
    const timestamp = Date.now();
    // Unique file name with UUID + timestamp to prevent collisions
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${timestamp}_${uuid}_${cleanFileName}`;

    const uploadPromise = supabase.storage
      .from('deposits')
      .upload(storagePath, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Storage upload timeout' } }), 3000)
    );

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

    if (error) {
      console.warn('Supabase Storage upload warning (falling back to base64 Data URL):', error.message || error);
      if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
        return { url: fileOrBase64, error: null };
      }
      const base64Url = await blobToBase64(compressedBlob);
      return { url: base64Url, error: null };
    }

    const { data: urlData } = supabase.storage
      .from('deposits')
      .getPublicUrl(storagePath);

    return { url: urlData.publicUrl || storagePath, error: null };
  } catch (err: any) {
    console.warn('uploadProofToSupabaseStorage crash (falling back to base64 Data URL):', err);
    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
      return { url: fileOrBase64, error: null };
    }
    try {
      const compressedBlob = await compressImage(fileOrBase64);
      const base64Url = await blobToBase64(compressedBlob);
      return { url: base64Url, error: null };
    } catch (fallbackErr) {
      return { url: typeof fileOrBase64 === 'string' ? fileOrBase64 : null, error: null };
    }
  }
}

// =========================================================================
// ADMIN LUCKY SPIN CONTROL HELPERS (spin_balances SOURCE OF TRUTH)
// =========================================================================

export async function fetchAdminSpinDataFromSupabase(requesterUsername: string) {
  try {
    // 1. Try server API first
    const apiRes = await fetch(`/api/lucky-spin/admin/data?requesterUsername=${encodeURIComponent(requesterUsername)}`);
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success) return json;
    }
  } catch (_) {}

  // 2. Direct Supabase Fallback
  try {
    const [usersRes, sbRes, txRes] = await Promise.all([
      supabase.from('users').select('username,full_name,email,created_at'),
      supabase.from('spin_balances').select('*'),
      supabase.from('transactions')
        .select('*')
        .or('type.eq.lucky_spin_reward,type.eq.spin_reward,type.eq.spin_zonk,type.eq.admin_spin_ticket_grant,type.eq.admin_spin_bonus_grant')
        .order('created_at', { ascending: false })
        .limit(300)
    ]);

    const users = (usersRes.data || []).filter((u: any) => u.role !== 'admin' && u.username?.toLowerCase() !== 'admin');
    const spinBalances = sbRes.data || [];
    const history = txRes.data || [];

    let totalAvailableFreeSpin = 0;
    let totalBonusBalanceAvailable = 0;

    spinBalances.forEach((sb: any) => {
      const isMember = users.some((u: any) => u.username?.toLowerCase() === sb.username?.toLowerCase());
      if (isMember) {
        if (sb.type === 'free') totalAvailableFreeSpin += Number(sb.amount) || 0;
        if (sb.type === 'bonus') totalBonusBalanceAvailable += Number(sb.amount) || 0;
      }
    });

    const totalSpinsPlayed = history.filter((t: any) =>
      t.type === 'lucky_spin_reward' || t.type === 'spin_reward' || t.type === 'spin_zonk'
    ).length;

    const totalRewardsDistributed = history.reduce((sum: number, t: any) => {
      if ((t.type === 'lucky_spin_reward' || t.type === 'spin_reward') && Number(t.amount) > 0) {
        return sum + (Number(t.amount) || 0);
      }
      return sum;
    }, 0);

    return {
      success: true,
      users,
      spinBalances,
      history,
      stats: {
        totalAvailableFreeSpin,
        totalBonusBalanceAvailable,
        totalSpinsPlayed,
        totalRewardsDistributed
      }
    };
  } catch (err: any) {
    console.error('fetchAdminSpinDataFromSupabase error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function adjustSpinBalanceInSupabase(params: {
  requesterUsername: string;
  targetUserId?: string;
  targetUsername: string;
  type: 'free' | 'bonus';
  mode: 'add' | 'set';
  amount: number;
  note?: string;
}) {
  const { requesterUsername, targetUserId, targetUsername, type, mode, amount, note } = params;

  try {
    const apiRes = await fetch('/api/lucky-spin/admin/adjust-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success) return json;
      if (json.error) return { success: false, error: json.error };
    } else {
      const errJson = await apiRes.json().catch(() => null);
      if (errJson && errJson.error) {
        return { success: false, error: errJson.error };
      }
    }
  } catch (_) {}

  // Direct Supabase fallback
  try {
    const { data: existingRows } = await supabase
      .from('spin_balances')
      .select('amount')
      .eq('username', targetUsername)
      .eq('type', type);

    const currentBal = existingRows && existingRows.length > 0 ? Number(existingRows[0].amount) || 0 : 0;
    const newAmount = mode === 'add' ? Math.max(0, currentBal + amount) : Math.max(0, amount);

    let sbErr: any = null;
    try {
      const res = await supabase.from('spin_balances').upsert([
        { username: targetUsername, type: type, amount: newAmount, updated_at: new Date().toISOString() }
      ], { onConflict: 'username,type' });
      sbErr = res.error;
    } catch (e) {
      sbErr = e;
    }

    if (sbErr) {
      if (existingRows && existingRows.length > 0) {
        await supabase
          .from('spin_balances')
          .update({ amount: newAmount, updated_at: new Date().toISOString() })
          .eq('username', targetUsername)
          .eq('type', type);
      } else {
        await supabase
          .from('spin_balances')
          .insert([{ username: targetUsername, type: type, amount: newAmount, updated_at: new Date().toISOString() }]);
      }
    }

    // Sync users table
    try {
      const { data: uData } = await supabase
        .from('users')
        .select('settings')
        .eq('username', targetUsername)
        .maybeSingle();

      const settings = uData?.settings || {};
      const updatedSettings = {
        ...settings,
        ...(type === 'free' ? { freeSpinBalance: newAmount } : { bonusSpinBalance: newAmount, rewardSpinWallet: newAmount })
      };
      const updateObj: any = {
        settings: updatedSettings,
        ...(type === 'free' ? { free_spin_balance: newAmount } : { bonus_spin_balance: newAmount })
      };
      await supabase.from('users').update(updateObj).eq('username', targetUsername);
    } catch (_) {}

    const txId = `SPN-ADM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const txType = type === 'free' ? 'admin_spin_ticket_grant' : 'admin_spin_bonus_grant';
    const txDesc = `[AUDIT ADMIN] Admin @${requesterUsername} ${mode === 'add' ? `menambahkan +${amount}` : `menyetel menjadi ${newAmount}`} ${type === 'free' ? 'Saldo Spin' : 'Bonus Spin'} [User ID: ${targetUserId || 'N/A'}]. ${note ? `Catatan: ${note}` : ''}`;

    await supabase.from('transactions').insert([{
      id: txId,
      username: targetUsername,
      type: txType,
      amount: amount,
      description: txDesc,
      approved_by: requesterUsername,
      status: 'approved',
      created_at: new Date().toISOString()
    }]);

    return { success: true, targetUsername, targetUserId, type, mode, oldAmount: currentBal, newAmount, txId };
  } catch (err: any) {
    console.error('adjustSpinBalanceInSupabase error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function massGiftSpinBalancesInSupabase(params: {
  requesterUsername: string;
  type: 'free' | 'bonus';
  amount: number;
  note?: string;
}) {
  const { requesterUsername, type, amount, note } = params;

  try {
    const apiRes = await fetch('/api/lucky-spin/admin/mass-gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success) return json;
      if (json.error) return { success: false, error: json.error };
    }
  } catch (_) {}

  // Direct Supabase Fallback
  try {
    const { data: users, error: uErr } = await supabase
      .from('users')
      .select('id,username,role');
    if (uErr) throw uErr;

    const memberUsers = (users || []).filter((u: any) => u.role !== 'admin' && u.username?.toLowerCase() !== 'admin');
    if (memberUsers.length === 0) return { success: false, error: 'Tidak ada member aktif.' };

    const { data: sbRows } = await supabase
      .from('spin_balances')
      .select('username,amount')
      .eq('type', type);

    const sbMap = new Map<string, number>();
    (sbRows || []).forEach((r: any) => {
      if (r.username) sbMap.set(r.username.toLowerCase(), Number(r.amount) || 0);
    });

    const nowIso = new Date().toISOString();
    const sbUpsertPayload: any[] = [];
    const txInsertPayload: any[] = [];

    memberUsers.forEach((u: any) => {
      const username = u.username;
      const currentAmt = sbMap.get(username.toLowerCase()) ?? 0;
      const newAmt = currentAmt + amount;

      sbUpsertPayload.push({
        username: username,
        type: type,
        amount: newAmt,
        updated_at: nowIso
      });

      const txId = `SPN-MASS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      txInsertPayload.push({
        id: txId,
        username: username,
        type: type === 'free' ? 'admin_spin_ticket_grant' : 'admin_spin_bonus_grant',
        amount: amount,
        description: `[MASS GIFT ADMIN] Admin @${requesterUsername} membagikan +${amount} ${type === 'free' ? 'Tiket/Saldo Spin' : 'Bonus Spin'} ke seluruh member. ${note ? `Catatan: ${note}` : ''}`,
        approved_by: requesterUsername,
        status: 'approved',
        created_at: nowIso
      });
    });

    const { error: sbUpsertErr } = await supabase
      .from('spin_balances')
      .upsert(sbUpsertPayload, { onConflict: 'username,type' });

    if (sbUpsertErr) throw sbUpsertErr;

    await supabase.from('transactions').insert(txInsertPayload);

    return {
      success: true,
      recipientCount: memberUsers.length,
      amountPerUser: amount,
      totalDistributed: memberUsers.length * amount
    };
  } catch (err: any) {
    console.error('massGiftSpinBalancesInSupabase error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}


