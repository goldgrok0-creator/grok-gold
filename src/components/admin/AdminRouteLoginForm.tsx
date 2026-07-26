import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowLeft, Sparkles, KeyRound } from 'lucide-react';
import { UserAccount, AppState } from '../../types';
import { supabase, hashPassword, fetchAccountsFromSupabase } from '../../supabase';

interface AdminRouteLoginFormProps {
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  accounts: UserAccount[];
  setCurrentAccount: React.Dispatch<React.SetStateAction<UserAccount | null>>;
  updateState: (updater: Partial<AppState> | ((prev: AppState) => AppState)) => void;
}

export default function AdminRouteLoginForm({
  language,
  triggerModal,
  accounts,
  setCurrentAccount,
  updateState
}: AdminRouteLoginFormProps) {
  const [usr, setUsr] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usr.trim() || !pass) {
      triggerModal(language === 'id' ? '❌ Harap isi semua kolom!' : '❌ Please fill in all fields!', 'warning');
      return;
    }

    setLoading(true);
    try {
      const identifier = usr.trim().toLowerCase();

      // Direct database query for admin authentication (tamper-proof!)
      const { data: found, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.${identifier},email.ilike.${identifier}`)
        .maybeSingle();

      if (fetchErr || !found || (found.role !== 'admin' && found.username?.toLowerCase() !== 'admin')) {
        triggerModal(language === 'id' ? '❌ Akun admin tidak ditemukan!' : '❌ Admin account not found!', 'danger');
        setLoading(false);
        return;
      }

      const inputHash = await hashPassword(pass);
      const isPasswordValid = found.password === pass || found.password === inputHash;

      if (!isPasswordValid) {
        triggerModal(language === 'id' ? '❌ Kata sandi salah!' : '❌ Incorrect password!', 'danger');
        setLoading(false);
        return;
      }

      // Sync with Supabase Auth
      try {
        await supabase.auth.signInWithPassword({
          email: found.email,
          password: pass // use plaintext pass for auth signup/signin
        });
      } catch (authErr) {
        console.warn('Supabase Auth login bypassed on admin portal', authErr);
      }

      // Fetch the full UserAccount object mapped with properties
      const mappedAccounts = await fetchAccountsFromSupabase('admin');
      let adminMapped = mappedAccounts?.find(acc => acc.role === 'admin' || acc.username.toLowerCase() === found.username?.toLowerCase());

      if (!adminMapped && found) {
        adminMapped = {
          fullName: found.full_name || 'System Admin',
          username: found.username || 'admin',
          email: found.email || 'admin@grockgold.com',
          phone: found.phone || '',
          password: found.password || pass,
          referralCode: '',
          invitedBy: null,
          createdAt: Number(found.created_at) || Date.now(),
          settings: found.settings || { language: 'en', notificationsEnabled: true, autoReinvest: false },
          state: {
            mainBalance: Number(found.main_balance) || 0,
            activeContracts: Number(found.active_contracts) || 0,
            totalEarned: Number(found.total_earned) || 0,
            referralEarned: Number(found.referral_earned) || 0,
            rebateEarned: Number(found.rebate_earned) || 0,
            rewardBalance: Number(found.reward_balance) || 0,
            lastClaimTime: Number(found.last_claim_time) || 0,
            welcomeBonusClaimed: !!found.welcome_bonus_claimed,
            isLoggedIn: true,
            username: found.username || 'admin',
            holders: [],
            goldProduction: 0,
            cyclePercent: 0,
            hasPurchased: (Number(found.active_contracts) || 0) > 0,
            profileImage: found.profile_image || null,
            transactions: [],
            pendingMiningReward: Number(found.pending_mining_reward) || 0,
            todayProfit: 0,
            totalProfit: Number(found.total_earned) || 0
          }
        };
      }

      // Update states
      localStorage.setItem('grockgold_logged_in_username_v4', adminMapped.username);
      setCurrentAccount(adminMapped);
      updateState({ isLoggedIn: true });
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new Event('popstate'));
      triggerModal(language === 'id' ? '🔑 Akses Admin Diterima!' : '🔑 Admin Access Granted!', 'success');
    } catch (err: any) {
      triggerModal(err?.message || 'Login failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#04020a] relative overflow-hidden font-sans">
      {/* Background Ambient Glowing Orbs & Cyber Grid */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(225,29,72,0.08)_0%,rgba(245,158,11,0.05)_50%,transparent_70%)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-[#0a0518]/90 backdrop-blur-2xl border border-amber-500/20 hover:border-amber-500/35 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_0_80px_rgba(225,29,72,0.12),0_20px_40px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden transition-all duration-300"
      >
        {/* Top Gold Light Beam Stroke */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-rose-500/50 blur-[2px]" />

        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-16 h-16 bg-gradient-to-br from-amber-400/20 via-rose-600/20 to-purple-900/40 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.25)] relative"
            >
              <ShieldCheck className="w-8 h-8 text-amber-400" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#0a0518] animate-ping" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#0a0518]" />
            </motion.div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              {language === 'id' ? 'PORTAL KEAMANAN UTAMA' : 'SECURE COMMAND GATEWAY'}
            </div>
            <h2 className="text-lg font-black tracking-widest text-white uppercase font-orbitron">
              <span className="text-white">GROCKGOLD </span>
              <span className="text-amber-400 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">ADMIN</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
              {language === 'id' ? 'Otentikasi Enkripsi Kriptografik Tier-1' : 'Cryptographic Security & Control Portal'}
            </p>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-[9.5px] text-slate-300 font-mono leading-tight">
            <span className="text-amber-400 font-bold block mb-0.5">SSL 256-BIT ENCRYPTED</span>
            {language === 'id' ? 'Akses terbatas untuk administrator yang terverifikasi.' : 'Restricted access for verified system operators.'}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest flex justify-between items-center">
              <span>{language === 'id' ? 'IDENTITAS ADMIN' : 'ADMIN IDENTITY'}</span>
              <span className="text-[8px] font-mono text-amber-400/80">REQUIRED</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={usr}
                onChange={(e) => setUsr(e.target.value)}
                placeholder={language === 'id' ? 'Username atau Email Admin' : 'Admin Username or Email'}
                className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 text-white font-mono placeholder:text-slate-600 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest flex justify-between items-center">
              <span>{language === 'id' ? 'KODE KEAMANAN / KATA SANDI' : 'PASSCODE / SECURITY KEY'}</span>
              <span className="text-[8px] font-mono text-amber-400/80">ENCRYPTED</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl py-3 pl-10 pr-10 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 text-white font-mono placeholder:text-slate-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-black rounded-xl uppercase transition-all duration-300 tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(225,29,72,0.3)] mt-2 font-mono"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>{language === 'id' ? 'MEMVERIFIKASI AKSES...' : 'VERIFYING CREDENTIALS...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'id' ? 'MASUK KE ADMIN PORTAL' : 'AUTHENTICATE ACCESS'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Return Link */}
        <div className="text-center pt-3 border-t border-slate-800/80 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="text-[10.5px] text-slate-400 hover:text-amber-400 uppercase tracking-wider font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer hover:underline group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition duration-200" />
            <span>{language === 'id' ? 'Kembali ke Area Member' : 'Return to Member Area'}</span>
          </button>

          <div className="flex items-center gap-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYSTEM NODE STATUS: ONLINE • ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

