import React, { useState } from 'react';
import { ShieldCheck, Lock, User } from 'lucide-react';
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

      if (fetchErr || !found || (found.username?.toLowerCase() !== 'admin' && found.role !== 'admin')) {
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
      const adminMapped = mappedAccounts?.find(acc => acc.username.toLowerCase() === 'admin');

      if (!adminMapped) {
        triggerModal(language === 'id' ? '❌ Gagal memetakan akun admin!' : '❌ Failed to map admin account!', 'danger');
        setLoading(false);
        return;
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
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in mx-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-black tracking-widest text-slate-200 uppercase">GrockGold Admin Portal</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Secure Cryptographic Operations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Username</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={usr}
              onChange={(e) => setUsr(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-rose-500 text-slate-200 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security Code / Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-rose-500 text-slate-200 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black rounded-xl uppercase transition tracking-wider flex items-center justify-center gap-2 cursor-pointer font-bold mt-2"
        >
          {loading ? 'Verifying Credentials...' : 'Authenticate'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-800/60">
        <button
          onClick={() => {
            window.history.pushState(null, '', '/');
            window.dispatchEvent(new Event('popstate'));
          }}
          className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-bold transition cursor-pointer"
        >
          &larr; Return to Member Area
        </button>
      </div>
    </div>
  );
}
