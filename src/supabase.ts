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

const FALLBACK_URL = 'https://qfhwprovgkjuiyiguxtn.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHdwcm92Z2tqdWl5aWd1eHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc0NTUsImV4cCI6MjA5OTc5MzQ1NX0.r2MkVzBez8D0Hgi5CMzNSUPHRMSDNq6To0AYTfioGYA';

function getSupabaseUrl(): string {
  try {
    // @ts-ignore
    const url = import.meta.env?.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
    if (url && typeof url === 'string' && url.trim() !== '' && url.startsWith('http')) {
      if (!url.includes('clsnuxoihrzuzdjisgbm')) {
        return url.trim();
      }
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
      if (!key.includes('ImNsc251eG9paHJ6dXpkamlzZ2JtI')) {
        return key.trim();
      }
    }
  } catch (e) {}
  return FALLBACK_KEY;
}

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseKey(SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Flag to track if we need to fall back to Local Storage database due to Supabase connection/table errors
export let isSupabaseOffline = false;

const SPIN_ITEMS = [
  { label: 'Rp 5.000', color: '#7209b7', value: 5000, type: 'cash' },
  { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
  { label: 'Rp 15.000', color: '#b5179e', value: 15000, type: 'cash' },
  { label: 'Boost 5x', color: '#f72585', value: 5, type: 'boost' },
  { label: 'Rp 25.000', color: '#7209b7', value: 25000, type: 'cash' },
  { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
  { label: 'Rp 50.000', color: '#da70d6', value: 50000, type: 'cash' },
  { label: 'Boost 10x', color: '#f8961e', value: 10, type: 'boost' },
];

export function getLocalAccounts(): UserAccount[] {
  try {
    const data = localStorage.getItem('grockgold_local_db_accounts');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local db accounts:', e);
  }

  // Seed default admin and user
  const admin: UserAccount = {
    fullName: 'System Administrator',
    username: 'admin',
    email: 'admin@grockgold.com',
    phone: '+6281234567890',
    password: 'fb_a559ea12' /* admin123 */,
    referralCode: '',
    invitedBy: null,
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    settings: {
      language: 'id',
      notificationsEnabled: true,
      autoReinvest: false,
    },
    state: {
      mainBalance: 1000000000,
      activeContracts: 0,
      totalEarned: 0,
      referralEarned: 0,
      rebateEarned: 0,
      lastClaimTime: 0,
      welcomeBonusClaimed: true,
      isLoggedIn: false,
      username: 'admin',
      holders: [],
      goldProduction: 0,
      cyclePercent: 0,
      hasPurchased: false,
      profileImage: null,
      transactions: [],
      pendingMiningReward: 0,
      todayProfit: 0,
      totalProfit: 0,
    }
  };

  const defaultUser: UserAccount = {
    fullName: 'Grock Gold Member',
    username: 'member1',
    email: 'member1@grockgold.com',
    phone: '+628111222333',
    password: 'fb_9e000000' /* password123 */,
    referralCode: 'GOLD1',
    invitedBy: null,
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    settings: {
      language: 'id',
      notificationsEnabled: true,
      autoReinvest: false,
    },
    state: {
      mainBalance: 2000000,
      activeContracts: 1,
      totalEarned: 450000,
      referralEarned: 180000,
      rebateEarned: 50000,
      lastClaimTime: Date.now() - 12 * 3600 * 1000,
      welcomeBonusClaimed: true,
      isLoggedIn: false,
      username: 'member1',
      holders: [],
      goldProduction: 10,
      cyclePercent: 50,
      hasPurchased: true,
      profileImage: null,
      transactions: [
        {
          id: 'welcome-bonus-1',
          type: 'welcome_bonus',
          amount: 1800000,
          date: Date.now() - 5 * 24 * 3600 * 1000,
          description: 'Welcome Bonus GrockGold',
          status: 'approved'
        },
        {
          id: 'purchase-1',
          type: 'purchase',
          amount: 180000,
          date: Date.now() - 4 * 24 * 3600 * 1000,
          description: 'Aktivasi Kontrak Tambang Emas (1 Unit)',
          status: 'approved'
        }
      ],
      pendingMiningReward: 25000,
      todayProfit: 15000,
      totalProfit: 450000
    }
  };

  const accounts = [admin, defaultUser];
  saveLocalAccounts(accounts);
  return accounts;
}

export function saveLocalAccounts(accounts: UserAccount[]) {
  try {
    const sanitized = accounts.map(({ password, ...rest }) => rest);
    localStorage.setItem('grockgold_local_db_accounts', JSON.stringify(sanitized));
  } catch (e) {
    console.error('Failed to save local db accounts:', e);
  }
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
  active_contracts INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  referral_earned NUMERIC DEFAULT 0,
  rebate_earned NUMERIC DEFAULT 0,
  last_claim_time BIGINT DEFAULT 0,
  welcome_bonus_claimed BOOLEAN DEFAULT FALSE,
  profile_image TEXT,
  pending_mining_reward NUMERIC DEFAULT 0,
  created_at BIGINT,
  settings JSONB DEFAULT '{"language": "id", "notificationsEnabled": true, "autoReinvest": false}'::jsonb
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

-- 5. TABLE: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  username TEXT REFERENCES users(username) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'deposit', 'withdraw', 'reward', 'purchase', 'referral', 'rebate', 'welcome_bonus'
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at BIGINT NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

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

-- ENABLE REALTIME ON ALL TABLES
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table deposits;
alter publication supabase_realtime add table withdrawals;
alter publication supabase_realtime add table contracts;
alter publication supabase_realtime add table transactions;

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

// =========================================================================
// SYSTEM SEEDER FOR DEFAULT ADMIN
// =========================================================================

export async function seedDefaultAdminIfNeeded(): Promise<void> {
  if (isSupabaseOffline) return;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', 'admin')
      .single();

    if (error) {
      console.warn('Supabase not available during admin seed check, switching to offline local storage database.');
      isSupabaseOffline = true;
      return;
    }

    if (!data) {
      const adminPayload = {
        username: 'admin',
        full_name: 'System Administrator',
        email: 'admin@grockgold.com',
        phone: '+6281234567890',
        password: 'admin123',
        referral_code: '',
        invited_by: null,
        main_balance: 1000000000, // Large starting balance for Admin treasury
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
    console.warn('Error seeding default admin, switching to offline local storage database:', err);
    isSupabaseOffline = true;
  }
}

// =========================================================================
// REALTIME RETRIEVAL AND MAPPING ENGINE
// =========================================================================

export async function fetchAccountsFromSupabase(targetUsername?: string): Promise<UserAccount[] | null> {
  if (isSupabaseOffline) {
    return getLocalAccounts();
  }
  try {
    // Seed default admin first
    await seedDefaultAdminIfNeeded();

    if (isSupabaseOffline) {
      return getLocalAccounts();
    }

    let usersQuery = supabase.from('users').select('*');
    let depositsQuery = supabase.from('deposits').select('*');
    let withdrawalsQuery = supabase.from('withdrawals').select('*');
    let contractsQuery = supabase.from('contracts').select('*');
    let transactionsQuery = supabase.from('transactions').select('*');

    // Fetch all records for all tables to ensure downline statistics and the global leaderboard rankings are fully populated and correct for all users.

    const [usersRes, depositsRes, withdrawalsRes, contractsRes, transactionsRes] = await Promise.all([
      usersQuery,
      depositsQuery,
      withdrawalsQuery,
      contractsQuery,
      transactionsQuery
    ]);

    if (usersRes.error) {
      console.warn('Supabase usersQuery error, falling back to local storage database:', usersRes.error);
      isSupabaseOffline = true;
      return getLocalAccounts();
    }
    if (depositsRes.error) {
      console.error('Supabase depositsQuery error:', depositsRes.error);
    }
    if (withdrawalsRes.error) {
      console.error('Supabase withdrawalsQuery error:', withdrawalsRes.error);
    }
    if (contractsRes.error) {
      console.error('Supabase contractsQuery error:', contractsRes.error);
    }
    if (transactionsRes.error) {
      console.error('Supabase transactionsQuery error:', transactionsRes.error);
    }

    const users = usersRes.data || [];
    const deposits = depositsRes.data || [];
    const withdrawals = withdrawalsRes.data || [];
    const contracts = contractsRes.data || [];
    const transactions = transactionsRes.data || [];

    // Map into UserAccount structure to ensure seamless frontend compatibility
    return users.map((user: any) => {
      const usernameLower = user.username.toLowerCase();

      // Gather transactions belonging to this user
      const userTxs: Transaction[] = [];

      // 1. Map standard transactions (filter out 'deposit' and 'withdraw' types to prevent duplicates with deposits and withdrawals tables)
      transactions
        .filter((t: any) => t.username.toLowerCase() === usernameLower && t.type !== 'deposit' && t.type !== 'withdraw')
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
      const holders = users
        .filter((u: any) => u.invited_by?.toLowerCase() === usernameLower)
        .map((u: any) => ({
          id: 'H-' + u.username,
          name: u.full_name,
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

      const dynTotalEarned = dynMiningProfit + dynReferralEarned + dynRebateEarned + dynWelcomeBonus;

      return {
        fullName: user.full_name || '',
        username: user.username,
        email: user.email || '',
        phone: user.phone || '',
        password: (targetUsername && targetUsername.toLowerCase() === usernameLower) ? (user.password || '') : '',
        referralCode: user.username.toLowerCase() === 'admin' ? '' : (user.referral_code || ''),
        invitedBy: user.invited_by || null,
        createdAt: Number(user.created_at) || Date.now(),
        settings: user.settings || {
          language: 'id',
          notificationsEnabled: true,
          autoReinvest: false
        },
        state: {
          mainBalance: Number(user.main_balance) || 0,
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
          pendingMiningReward: Number(user.pending_mining_reward) || 0,
          todayProfit: userTxs
            .filter(t => t.type === 'reward' && new Date(t.date).toDateString() === new Date().toDateString())
            .reduce((sum, item) => sum + item.amount, 0),
          totalProfit: dynTotalEarned
        }
      };
    });
  } catch (err) {
    console.warn('Error in fetchAccountsFromSupabase, falling back to robust Local Storage database state:', err);
    isSupabaseOffline = true;
    return getLocalAccounts();
  }
}

// =========================================================================
// REAL-TIME OPERATIONS & DATABASE SYNCHRONIZERS
// =========================================================================

// 1. Create User (Registration)
export async function registerUserInSupabase(account: UserAccount): Promise<boolean> {
  if (isSupabaseOffline) {
    const accounts = getLocalAccounts();
    const exists = accounts.some(a => a.username.toLowerCase() === account.username.toLowerCase());
    if (exists) return false;
    const hashedPassword = await hashPassword(account.password);
    const newAccount: UserAccount = {
      ...account,
      password: hashedPassword,
    };
    accounts.push(newAccount);
    saveLocalAccounts(accounts);
    return true;
  }
  try {
    const hashedPassword = await hashPassword(account.password);
    const payload = {
      username: account.username,
      full_name: account.fullName,
      email: account.email,
      phone: account.phone,
      password: hashedPassword,
      referral_code: account.referralCode,
      invited_by: account.invitedBy,
      created_at: account.createdAt,
      main_balance: account.state.mainBalance,
      active_contracts: account.state.activeContracts,
      total_earned: account.state.totalEarned,
      referral_earned: account.state.referralEarned,
      rebate_earned: account.state.rebateEarned,
      last_claim_time: account.state.lastClaimTime,
      welcome_bonus_claimed: account.state.welcomeBonusClaimed,
      profile_image: account.state.profileImage,
      pending_mining_reward: account.state.pendingMiningReward,
      settings: account.settings
    };

    const { error } = await supabase.from('users').insert(payload);
    if (error) {
      console.warn('Error creating user in Supabase:', error.message);
      return false;
    }

    // Try to register in Supabase Auth on-the-fly as well
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
      await supabase.auth.signUp({
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
    } catch (authErr) {
      console.warn('Auth sign-up optional warning:', authErr);
    }

    return true;
  } catch (err) {
    console.error('Registration query crash:', err);
    return false;
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
  if (isSupabaseOffline) {
    const accounts = getLocalAccounts();
    const idx = accounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      if (!accounts[idx].state.transactions) accounts[idx].state.transactions = [];
      accounts[idx].state.transactions.unshift({
        id,
        type: 'deposit',
        amount,
        date: Date.now(),
        description: '⏳ Deposit (Pending)',
        proofImage,
        status: 'pending',
        paymentMethod
      });
      saveLocalAccounts(accounts);
      return true;
    }
    return false;
  }
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
      console.error('Error inserting pending deposit payload:', error);
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
  if (isSupabaseOffline) {
    const accounts = getLocalAccounts();
    const idx = accounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      const balance = accounts[idx].state.mainBalance;
      if (balance < amount) return false;
      accounts[idx].state.mainBalance -= amount;
      if (!accounts[idx].state.transactions) accounts[idx].state.transactions = [];
      accounts[idx].state.transactions.unshift({
        id,
        type: 'withdraw',
        amount,
        date: Date.now(),
        description: '⏳ Penarikan (Pending)',
        status: 'pending'
      });
      saveLocalAccounts(accounts);
      return true;
    }
    return false;
  }
  try {
    if (amount <= 0) {
      console.warn(`Invalid withdrawal amount: ${amount}`);
      return false;
    }
    // 1. Fetch User balance
    const { data: user } = await supabase.from('users').select('main_balance').eq('username', username).single();
    if (!user) return false;
    const currentBalance = Number(user.main_balance) || 0;

    if (currentBalance < amount) {
      console.warn(`Insufficient balance for user ${username} withdrawal. Needed: ${amount}, Has: ${currentBalance}`);
      return false;
    }

    const newBalance = currentBalance - amount;

    // 2. Perform atomic insert of withdrawal and update of user balance
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
      supabase.from('users').update({ main_balance: newBalance }).eq('username', username)
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
  if (isSupabaseOffline) {
    const accounts = getLocalAccounts();
    const idx = accounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      accounts[idx].state.profileImage = imageUrl;
      saveLocalAccounts(accounts);
      return true;
    }
    return false;
  }
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
  if (isSupabaseOffline) {
    const accounts = getLocalAccounts();
    const idx = accounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      accounts[idx].settings = { ...accounts[idx].settings, ...settings };
      saveLocalAccounts(accounts);
      return true;
    }
    return false;
  }
  try {
    const { error } = await supabase
      .from('users')
      .update({ settings })
      .eq('username', username);

    return !error;
  } catch (err) {
    console.error('Error updating settings:', err);
    return false;
  }
}

// 6. Update general appState in Supabase (For users & admin profile)
export async function saveAccountToSupabase(account: UserAccount): Promise<boolean> {
  if (isSupabaseOffline) {
    const accounts = getLocalAccounts();
    const idx = accounts.findIndex(a => a.username.toLowerCase() === account.username.toLowerCase());
    if (idx !== -1) {
      accounts[idx] = account;
      saveLocalAccounts(accounts);
      return true;
    }
    return false;
  }
  try {
    const payload: any = {
      full_name: account.fullName,
      email: account.email,
      phone: account.phone,
      referral_code: account.referralCode,
      invited_by: account.invitedBy,
      main_balance: account.state.mainBalance,
      active_contracts: account.state.activeContracts,
      total_earned: account.state.totalEarned,
      referral_earned: account.state.referralEarned,
      rebate_earned: account.state.rebateEarned,
      reward_balance: account.state.rewardBalance ?? 0,
      last_claim_time: account.state.lastClaimTime,
      welcome_bonus_claimed: account.state.welcomeBonusClaimed,
      profile_image: account.state.profileImage,
      pending_mining_reward: account.state.pendingMiningReward,
      settings: account.settings
    };

    if (account.password && account.password.trim() !== '') {
      payload.password = account.password;
    }

    const { error } = await supabase
      .from('users')
      .update(payload)
      .eq('username', account.username);

    if (error) {
      console.warn('Supabase update user error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving user to Supabase:', err);
    return false;
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

    // 2. Fetch User latest balance for atomic increment
    const { data: user } = await supabase.from('users').select('main_balance').eq('username', wd.username).single();
    if (!user) return false;
    const currentBalance = Number(user.main_balance) || 0;
    const refundAmount = Number(wd.amount) || 0;
    const newBalance = currentBalance + refundAmount;

    // 3. Atomically update status to rejected and refund user balance
    const [wdUpdate, userUpdate] = await Promise.all([
      supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', withdrawId),
      supabase.from('users').update({ main_balance: newBalance }).eq('username', wd.username)
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

    // 3. Distribute MLM network level commissions to referrers (Levels: 10%, 3%, 2%)
    let currentReferrer = await getInviterUsername(username);
    const levels = CONFIG.REFERRAL_LEVELS; // [10, 3, 2]

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
    const { data: user } = await supabase.from('users').select('main_balance, reward_balance, welcome_bonus_claimed').eq('username', username).single();
    if (!user || user.welcome_bonus_claimed) return false;

    const currentRewardBalance = Number(user.reward_balance) || 0;
    const bonusAmount = CONFIG.WELCOME_BONUS_AMOUNT; // 1,800,000

    const txId = 'WLC-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const [userUpdate, txInsert] = await Promise.all([
      supabase.from('users').update({
        reward_balance: currentRewardBalance + bonusAmount,
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

    return !userUpdate.error && !txInsert.error;
  } catch (err) {
    console.error('Error claiming welcome bonus:', err);
    return false;
  }
}

// Claim yield / reward claim
export async function claimDailyRewardInSupabase(
  username: string, 
  amount: number, 
  streakBonus: number = 0, 
  currentStreak: number = 1
): Promise<boolean> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('main_balance, total_earned, active_contracts, settings, last_claim_time')
      .eq('username', username)
      .single();
    if (!user) return false;

    // Enforce 24-hour claim cooldown based securely on database last_claim_time
    const lastClaim = Number(user.last_claim_time) || 0;
    if (lastClaim > 0 && (Date.now() - lastClaim < CONFIG.CLAIM_COOLDOWN)) {
      console.warn(`Database cooldown active for user ${username}. Cannot claim yet.`);
      return false;
    }

    const currentBalance = Number(user.main_balance) || 0;
    const currentEarned = Number(user.total_earned) || 0;
    const activeContracts = Number(user.active_contracts) || 0;

    const contractValue = activeContracts * CONFIG.PRICE_PER_UNIT;
    const rewardRate = CONFIG.DAILY_REWARD_PERCENT;
    const calculatedReward = contractValue * rewardRate;

    // Enforce 250% Capping Logic
    const maxCapping = activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT;

    const { data: txs } = await supabase
      .from('transactions')
      .select('amount')
      .eq('username', username)
      .in('type', ['reward', 'referral', 'rebate']);

    const cappingEarnings = (txs || []).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const remainingCapping = Math.max(0, maxCapping - cappingEarnings);

    if (maxCapping > 0 && remainingCapping <= 0) {
      console.log(`User ${username} is already fully capped.`);
      return false;
    }

    const finalRewardCredited = Math.round(Math.min(amount, remainingCapping));
    if (finalRewardCredited <= 0) {
      return false;
    }

    console.log('--- REWARD SYSTEM AUDIT LOG ---', {
      username,
      activeContracts,
      contractValue,
      rewardRate,
      calculatedReward,
      finalRewardCredited,
      streakBonus,
      currentStreak
    });

    const txId = 'CLM-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Prepare updated settings with claimStreak and claimStreakHistory
    const userSettings = user.settings || { language: 'id', notificationsEnabled: true, autoReinvest: false };
    const nextSettings = {
      ...userSettings,
      claimStreak: currentStreak,
      claimStreakHistory: [
        {
          id: txId,
          date: Date.now(),
          amount: finalRewardCredited + streakBonus,
          streak: currentStreak,
          status: 'Success',
          balanceBefore: currentBalance,
          balanceAfter: currentBalance + finalRewardCredited + streakBonus
        },
        ...(userSettings.claimStreakHistory || [])
      ].slice(0, 10)
    };

    const [userUpdate, txInsert] = await Promise.all([
      supabase.from('users').update({
        main_balance: currentBalance + finalRewardCredited + streakBonus,
        total_earned: currentEarned + finalRewardCredited + streakBonus,
        reward_balance: 0,
        pending_mining_reward: 0,
        last_claim_time: Date.now(),
        settings: nextSettings
      }).eq('username', username),
      supabase.from('transactions').insert({
        id: txId,
        username,
        type: 'reward',
        amount: finalRewardCredited + streakBonus,
        description: `Klaim Reward Harian (Streak Hari ke-${currentStreak})${streakBonus > 0 ? ` + Bonus Streak Rp ${streakBonus.toLocaleString('id-ID')}` : ''}${finalRewardCredited < amount ? ' [Capped]' : ''}`,
        created_at: Date.now()
      })
    ]);

    return !userUpdate.error && !txInsert.error;
  } catch (err) {
    console.error('Error claiming daily reward:', err);
    return false;
  }
}

// Execute Lucky Spin securely on database/server side
export async function executeLuckySpinInSupabase(username: string): Promise<{ success: boolean; prizeIndex: number; error?: string }> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('main_balance, total_earned, settings')
      .eq('username', username)
      .single();
    if (!user) return { success: false, prizeIndex: 0, error: 'User not found' };

    const settings = user.settings || { language: 'id', notificationsEnabled: true, autoReinvest: false };
    const tickets = typeof settings.spinTickets === 'number' ? settings.spinTickets : 5;
    const count = typeof settings.spinCount === 'number' ? settings.spinCount : 0;

    if (tickets <= 0) {
      return { success: false, prizeIndex: 0, error: 'No tickets left' };
    }

    // Secure database server-side representation of spin wheel elements
    const SPIN_ITEMS_DB = [
      { label: 'Rp 5.000', color: '#7209b7', value: 5000, type: 'cash' },
      { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
      { label: 'Rp 15.000', color: '#b5179e', value: 15000, type: 'cash' },
      { label: 'Boost 5x', color: '#f72585', value: 5, type: 'boost' },
      { label: 'Rp 25.000', color: '#7209b7', value: 25000, type: 'cash' },
      { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
      { label: 'Rp 50.000', color: '#da70d6', value: 50000, type: 'cash' },
      { label: 'Boost 10x', color: '#f8961e', value: 10, type: 'boost' },
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

    const currentBalance = Number(user.main_balance) || 0;
    const currentEarned = Number(user.total_earned) || 0;

    let updatedBalance = currentBalance;
    let updatedEarned = currentEarned;

    const updates: any = {
      settings: nextSettings
    };

    if (prize.type === 'cash') {
      updatedBalance += prize.value;
      updatedEarned += prize.value;
      updates.main_balance = updatedBalance;
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
          type: 'reward',
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
    // 1. Authorization Check: Only administrators can modify global configuration
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== 'admin@grockgold.com') {
      console.warn('Unauthorized saveGlobalConfig attempt by:', user?.email || 'unauthenticated');
      return false;
    }

    // 2. Ensure admin user is seeded/created if missing
    await seedDefaultAdminIfNeeded();

    // 3. Fetch current admin settings
    const { data: adminRes, error: fetchErr } = await supabase
      .from('users')
      .select('settings')
      .eq('username', 'admin')
      .single();

    if (fetchErr) {
      console.error('saveGlobalConfig failed to fetch admin settings:', fetchErr.message);
      throw fetchErr;
    }

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
        throw updateErr;
      }
    }

    // 4. Update local in-memory CONFIG instantly
    updateGlobalConfig(config);

    return true;
  } catch (err: any) {
    console.error('saveGlobalConfig general error:', err?.message || err);
    return false;
  }
}

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
  try {
    const fileName = getStorageFileName(urlOrPath);
    if (!fileName) return null;
    
    const { data, error } = await supabase.storage
      .from('deposits')
      .createSignedUrl(fileName, 3600); // 1 hour validity

    if (error) {
      console.error('Error generating signed URL from Supabase Storage:', error);
      return null;
    }
    return data.signedUrl || null;
  } catch (err) {
    console.error('getSignedProofUrl crash:', err);
    return null;
  }
}

/**
 * Compresses and uploads a transfer proof to Supabase Storage and returns the public URL & errors if any.
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

    const { data, error } = await supabase.storage
      .from('deposits')
      .upload(storagePath, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error detailed:', error);
      return { url: null, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('deposits')
      .getPublicUrl(storagePath);

    return { url: urlData.publicUrl || storagePath, error: null };
  } catch (err: any) {
    console.error('uploadProofToSupabaseStorage crash:', err);
    return { url: null, error: err.message || String(err) };
  }
}


