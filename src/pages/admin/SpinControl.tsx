import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCw,
  Gift,
  Ticket,
  Users,
  Award,
  Search,
  Sliders,
  History,
  Save,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { UserAccount, GlobalConfig } from '../../types';
import {
  saveGlobalConfigToSupabase,
  fetchAdminSpinDataFromSupabase,
  adjustSpinBalanceInSupabase,
  massGiftSpinBalancesInSupabase
} from '../../supabase';

interface SpinControlProps {
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  saveAccountToSupabase: (account: UserAccount) => Promise<boolean>;
  globalConfig?: GlobalConfig;
  onSaveGlobalConfig?: (config: GlobalConfig) => Promise<boolean>;
}

export default function SpinControl({
  accounts,
  language,
  triggerModal,
  globalConfig,
  onSaveGlobalConfig
}: SpinControlProps) {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'mass_gift' | 'settings' | 'history'>('members');
  const [searchTerm, setSearchTerm] = useState('');

  // Detect admin username
  const adminUsername = useMemo(() => {
    const adminAcc = accounts.find(a => a.role === 'admin' || a.username?.toLowerCase() === 'admin');
    return adminAcc?.username || 'admin';
  }, [accounts]);

  // Server/Database Spin Data
  const [usersData, setUsersData] = useState<any[]>([]);
  const [spinBalances, setSpinBalances] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalAvailableFreeSpin: 0,
    totalBonusBalanceAvailable: 0,
    totalSpinsPlayed: 0,
    totalRewardsDistributed: 0
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Mass Gift State
  const [massTicketCount, setMassTicketCount] = useState<number>(3);
  const [massGiftType, setMassGiftType] = useState<'free' | 'bonus'>('free');
  const [massNote, setMassNote] = useState<string>('Bonus Event Lucky Spin Admin');
  const [isProcessingMass, setIsProcessingMass] = useState<boolean>(false);

  // Global Spin Settings State
  const [spinEnabled, setSpinEnabled] = useState<boolean>(
    globalConfig?.spinFeatureEnabled ?? true
  );
  const [defaultTickets, setDefaultTickets] = useState<string>(
    (globalConfig?.defaultSpinTickets ?? 5).toString()
  );
  const [referralBonusTickets, setReferralBonusTickets] = useState<string>(
    (globalConfig?.referralSpinBonusTickets ?? 1).toString()
  );
  const [winRateMode, setWinRateMode] = useState<'normal' | 'high_win' | 'conservative' | 'jackpot'>(
    globalConfig?.spinWinRateMode || 'normal'
  );
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Sync settings state if globalConfig props change
  useEffect(() => {
    if (globalConfig) {
      if (globalConfig.spinFeatureEnabled !== undefined) setSpinEnabled(globalConfig.spinFeatureEnabled);
      if (globalConfig.defaultSpinTickets !== undefined) setDefaultTickets(globalConfig.defaultSpinTickets.toString());
      if (globalConfig.referralSpinBonusTickets !== undefined) setReferralBonusTickets(globalConfig.referralSpinBonusTickets.toString());
      if (globalConfig.spinWinRateMode) setWinRateMode(globalConfig.spinWinRateMode);
    }
  }, [globalConfig]);

  // Load consolidated spin data from server / database
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const res = await fetchAdminSpinDataFromSupabase(adminUsername);
      if (res && res.success) {
        if (Array.isArray(res.users)) setUsersData(res.users);
        if (Array.isArray(res.spinBalances)) setSpinBalances(res.spinBalances);
        if (Array.isArray(res.history)) setHistoryList(res.history);
        if (res.stats) {
          setStatsData({
            totalAvailableFreeSpin: Number(res.stats.totalAvailableFreeSpin) || 0,
            totalBonusBalanceAvailable: Number(res.stats.totalBonusBalanceAvailable) || 0,
            totalSpinsPlayed: Number(res.stats.totalSpinsPlayed) || 0,
            totalRewardsDistributed: Number(res.stats.totalRewardsDistributed) || 0
          });
        }
      }
    } catch (err) {
      console.error('Failed to load admin spin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [adminUsername]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Consolidated member rows built strictly from spin_balances & database users
  const memberRows = useMemo(() => {
    const baseUsers = usersData.length > 0
      ? usersData
      : accounts
          .filter(a => a.role !== 'admin' && a.username?.toLowerCase() !== 'admin')
          .map(a => ({
            id: a.username,
            username: a.username,
            full_name: a.fullName,
            email: a.email,
            created_at: a.createdAt
          }));

    return baseUsers.map(u => {
      const uUsername = u.username || '';
      const userSbs = spinBalances.filter(sb => sb.username?.toLowerCase() === uUsername.toLowerCase());
      const freeRow = userSbs.find(sb => sb.type === 'free');
      const bonusRow = userSbs.find(sb => sb.type === 'bonus');

      const freeBalance = freeRow ? Number(freeRow.amount) || 0 : 0;
      const bonusBalance = bonusRow ? Number(bonusRow.amount) || 0 : 0;

      const userSpinCount = historyList.filter(t =>
        t.username?.toLowerCase() === uUsername.toLowerCase() &&
        (t.type === 'lucky_spin_reward' || t.type === 'spin_reward' || t.type === 'spin_zonk')
      ).length;

      return {
        id: u.id || uUsername,
        username: uUsername,
        fullName: u.full_name || u.fullName || uUsername,
        email: u.email || '',
        freeBalance,
        bonusBalance,
        userSpinCount
      };
    });
  }, [usersData, accounts, spinBalances, historyList]);

  // Search filtering
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return memberRows;
    const term = searchTerm.toLowerCase();
    return memberRows.filter(m =>
      m.username.toLowerCase().includes(term) ||
      m.fullName.toLowerCase().includes(term) ||
      String(m.id).toLowerCase().includes(term)
    );
  }, [memberRows, searchTerm]);

  // Handle Adjust Balance for a specific user (Free Spin or Bonus Spin)
  const handleAdjustUserBalance = async (
    targetUserId: string,
    targetUsername: string,
    type: 'free' | 'bonus',
    mode: 'add' | 'set',
    amount: number
  ) => {
    // Correct OR validation requirement (#6)
    if (isNaN(amount) || (mode === 'add' && amount <= 0) || (mode === 'set' && amount < 0)) {
      triggerModal(
        language === 'id' ? '❌ Jumlah nominal/tiket tidak valid.' : '❌ Invalid ticket/amount value.',
        'warning'
      );
      return;
    }

    setIsProcessingAction(true);
    try {
      const res = await adjustSpinBalanceInSupabase({
        requesterUsername: adminUsername,
        targetUserId,
        targetUsername,
        type,
        mode,
        amount,
        note: `Perubahan langsung oleh Admin @${adminUsername}`
      });

      if (res && res.success) {
        triggerModal(
          language === 'id'
            ? `✅ Berhasil ${mode === 'add' ? 'menambahkan' : 'menyetel'} ${type === 'free' ? 'Saldo Spin' : 'Bonus Spin'} ${targetUsername}! (Total baru: ${type === 'free' ? `${res.newAmount} Tiket/Saldo` : `Rp ${res.newAmount.toLocaleString('id-ID')}`})`
            : `✅ Successfully ${mode === 'add' ? 'added' : 'set'} ${type === 'free' ? 'Spin Tickets' : 'Bonus Spin'} for ${targetUsername}!`,
          'success'
        );
        await loadData();
      } else {
        triggerModal(`❌ ${res?.error || 'Gagal mengubah saldo spin.'}`, 'danger');
      }
    } catch (err: any) {
      triggerModal(`❌ Terjadi kesalahan: ${err?.message || String(err)}`, 'danger');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Atomic Server-side Mass Gift (#8)
  const handleMassGiftTickets = async () => {
    const numAmt = Number(massTicketCount);
    // Correct OR validation
    if (isNaN(numAmt) || numAmt <= 0) {
      triggerModal('❌ Masukkan jumlah nominal/tiket massal yang valid (minimal 1).', 'warning');
      return;
    }

    const recipientCount = memberRows.length;
    const confirmMsg = language === 'id'
      ? `Apakah Anda yakin ingin membagikan +${numAmt} ${massGiftType === 'free' ? 'Tiket Spin' : 'Saldo Bonus Spin'} secara massal ke SELURUH ${recipientCount} anggota aktif?`
      : `Are you sure you want to distribute +${numAmt} ${massGiftType === 'free' ? 'Spin Tickets' : 'Bonus Spin'} to ALL ${recipientCount} active members?`;

    if (!window.confirm(confirmMsg)) return;

    setIsProcessingMass(true);
    try {
      const res = await massGiftSpinBalancesInSupabase({
        requesterUsername: adminUsername,
        type: massGiftType,
        amount: numAmt,
        note: massNote
      });

      if (res && res.success) {
        triggerModal(
          language === 'id'
            ? `🎉 BERHASIL! +${numAmt} ${massGiftType === 'free' ? 'Tiket Spin' : 'Bonus Spin'} telah dibagikan secara atomic ke ${res.recipientCount} anggota!`
            : `🎉 SUCCESS! +${numAmt} granted to ${res.recipientCount} members!`,
          'success'
        );
        await loadData();
      } else {
        triggerModal(`❌ ${res?.error || 'Gagal memproses pembagian massal.'}`, 'danger');
      }
    } catch (err: any) {
      triggerModal(`❌ Terjadi kesalahan mass gift: ${err?.message || String(err)}`, 'danger');
    } finally {
      setIsProcessingMass(false);
    }
  };

  // Handle Save Global Spin Settings
  const handleSaveSpinSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    const updatedConfig: GlobalConfig = {
      ...(globalConfig || {}),
      spinFeatureEnabled: spinEnabled,
      defaultSpinTickets: parseInt(defaultTickets, 10) || 5,
      referralSpinBonusTickets: parseInt(referralBonusTickets, 10) || 1,
      spinWinRateMode: winRateMode,
      updatedAt: Date.now()
    };

    try {
      if (onSaveGlobalConfig) {
        await onSaveGlobalConfig(updatedConfig);
      } else {
        await saveGlobalConfigToSupabase(updatedConfig);
      }

      triggerModal(
        language === 'id'
          ? '✅ Konfigurasi Lucky Spin berhasil diperbarui!'
          : '✅ Lucky Spin configuration updated successfully!',
        'success'
      );
    } catch (err) {
      console.error('Error saving spin config:', err);
      triggerModal('❌ Gagal menyimpan konfigurasi Lucky Spin.', 'danger');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <RotateCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wider text-slate-100 uppercase">
                {language === 'id' ? 'KONTROL & PENGATURAN LUCKY SPIN' : 'LUCKY SPIN CONTROL PANEL'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'id'
                  ? 'Kelola tiket spin & saldo bonus anggota secara konsisten via spin_balances (Single Source of Truth).'
                  : 'Manage member spin tickets & bonus balance using unified spin_balances database.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoadingData}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-amber-400' : ''}`} />
            Refresh Data
          </button>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            spinEnabled 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${spinEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {spinEnabled ? (language === 'id' ? 'LUCKY SPIN AKTIF' : 'LUCKY SPIN ENABLED') : (language === 'id' ? 'NONAKTIF' : 'DISABLED')}
          </span>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS (Requirement #5: Distinguish lifetime vs available balance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo Spin Tersedia */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'id' ? 'SALDO SPIN TERSEDIA' : 'AVAILABLE SPIN BALANCES'}
            </span>
            <span className="text-xl font-black text-amber-400 mt-1 block font-mono">
              {statsData.totalAvailableFreeSpin.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Tiket/saldo spin aktif member
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        {/* Total Putaran Dimainkan */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'id' ? 'TOTAL SPIN DIMAINKAN' : 'TOTAL SPINS PLAYED'}
            </span>
            <span className="text-xl font-black text-cyan-400 mt-1 block font-mono">
              {statsData.totalSpinsPlayed.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Akumulasi putaran wheel
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
            <RotateCw className="w-5 h-5" />
          </div>
        </div>

        {/* Total Reward yang Pernah Didistribusikan (Lifetime) */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'id' ? 'TOTAL REWARD DIBAGIKAN' : 'LIFETIME REWARDS DISTRIBUTED'}
            </span>
            <span className="text-xl font-black text-emerald-400 mt-1 block font-mono">
              Rp {statsData.totalRewardsDistributed.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Total hadiah dimenangkan
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Total Saldo Bonus Spin Saat Ini (Current Available Wallet) */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'id' ? 'SALDO REWARD SAAT INI' : 'CURRENT REWARD BALANCE'}
            </span>
            <span className="text-xl font-black text-purple-400 mt-1 block font-mono">
              Rp {statsData.totalBonusBalanceAvailable.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Saldo bonus spin belum ditarik
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'members'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          {language === 'id' ? '1. Kelola Tiket Member' : '1. Manage Member Tickets'}
        </button>

        <button
          onClick={() => setActiveSubTab('mass_gift')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'mass_gift'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Gift className="w-4 h-4" />
          {language === 'id' ? '2. Bagi Tiket Massal' : '2. Mass Distribution'}
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          {language === 'id' ? '3. Pengaturan & Odds' : '3. Settings & Win Odds'}
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          {language === 'id' ? '4. Log Audit Putaran' : '4. Spin Audit Log'}
        </button>
      </div>

      {/* TAB 1: KELOLA TIKET & SALDO MEMBER */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder={language === 'id' ? 'Cari username, nama, ID...' : 'Search username or ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-[11px] text-slate-400">
              {language === 'id'
                ? `Menampilkan ${filteredMembers.length} dari ${memberRows.length} anggota`
                : `Showing ${filteredMembers.length} of ${memberRows.length} members`}
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">USER & ID UNIK</th>
                    <th className="p-3.5">SALDO SPIN TERSEDIA</th>
                    <th className="p-3.5">SALDO BONUS SPIN (RP)</th>
                    <th className="p-3.5">TOTAL PUTARAN</th>
                    <th className="p-3.5 text-right">AKSI KONTROL SALDO ADMIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-400 mb-2" />
                        Memuat data spin_balances dari database...
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                        {language === 'id' ? 'Tidak ada data anggota ditemukan.' : 'No members found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      return (
                        <tr key={m.username} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white text-xs">{m.username}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {m.fullName} {m.id ? `• ID: ${m.id}` : ''}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                              <Ticket className="w-3.5 h-3.5" />
                              {m.freeBalance.toLocaleString('id-ID')}
                            </span>
                          </td>

                          <td className="p-3.5 text-purple-400 font-mono font-bold">
                            Rp {m.bonusBalance.toLocaleString('id-ID')}
                          </td>

                          <td className="p-3.5 text-slate-300 font-mono">
                            {m.userSpinCount}x
                          </td>

                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              disabled={isProcessingAction}
                              onClick={() => handleAdjustUserBalance(m.id, m.username, 'free', 'add', 1)}
                              title="+1 Spin"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-300 transition-all disabled:opacity-50"
                            >
                              +1
                            </button>
                            <button
                              disabled={isProcessingAction}
                              onClick={() => handleAdjustUserBalance(m.id, m.username, 'free', 'add', 5)}
                              title="+5 Spin"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-300 transition-all disabled:opacity-50"
                            >
                              +5
                            </button>
                            <button
                              disabled={isProcessingAction}
                              onClick={() => handleAdjustUserBalance(m.id, m.username, 'free', 'add', 10)}
                              title="+10 Spin"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-300 transition-all disabled:opacity-50"
                            >
                              +10
                            </button>
                            <button
                              disabled={isProcessingAction}
                              onClick={() => {
                                const input = window.prompt(
                                  language === 'id' 
                                    ? `Setel saldo Tiket Spin pasti untuk ${m.username}:`
                                    : `Set exact Spin Tickets for ${m.username}:`,
                                  m.freeBalance.toString()
                                );
                                if (input !== null) {
                                  const val = parseInt(input, 10);
                                  // Correct OR validation
                                  if (!isNaN(val) && val >= 0) {
                                    handleAdjustUserBalance(m.id, m.username, 'free', 'set', val);
                                  } else {
                                    triggerModal('❌ Nominal tidak valid.', 'warning');
                                  }
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50"
                            >
                              Set Spin
                            </button>
                            <button
                              disabled={isProcessingAction}
                              onClick={() => {
                                const input = window.prompt(
                                  language === 'id'
                                    ? `Setel Saldo Bonus Spin (Rp) untuk ${m.username}:`
                                    : `Set Bonus Spin Balance (Rp) for ${m.username}:`,
                                  m.bonusBalance.toString()
                                );
                                if (input !== null) {
                                  const val = parseFloat(input);
                                  if (!isNaN(val) && val >= 0) {
                                    handleAdjustUserBalance(m.id, m.username, 'bonus', 'set', val);
                                  } else {
                                    triggerModal('❌ Nominal tidak valid.', 'warning');
                                  }
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500 hover:text-black transition-all disabled:opacity-50"
                            >
                              Set Bonus
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BAGI TIKET MASSAL (SERVER-SIDE ATOMIC TRANSACTION) */}
      {activeSubTab === 'mass_gift' && (
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-slate-100 tracking-wider">
                {language === 'id' ? 'PEMBAGIAN TIKET / SALDO SPIN MASSAL (ATOMIC)' : 'ATOMIC MASS SPIN DISTRIBUTION'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {language === 'id'
                  ? 'Bagikan Tiket/Saldo Spin secara atomic server-side ke seluruh anggota aktif tanpa risiko gagal sebagian.'
                  : 'Distribute spin tickets atomically server-side to all active members without partial failures.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Tipe Saldo yang Dibagikan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMassGiftType('free')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      massGiftType === 'free'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Tiket / Saldo Spin Gratis
                  </button>
                  <button
                    type="button"
                    onClick={() => setMassGiftType('bonus')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      massGiftType === 'bonus'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Saldo Bonus Spin (Rp)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Jumlah Ditambahkan per Member
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={massTicketCount}
                    onChange={(e) => setMassTicketCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-1.5">
                    {[1, 3, 5, 10].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setMassTicketCount(cnt)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                          massTicketCount === cnt
                            ? 'bg-purple-500 text-white border-purple-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        +{cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Catatan Audit Admin
                </label>
                <input
                  type="text"
                  value={massNote}
                  onChange={(e) => setMassNote(e.target.value)}
                  placeholder="Contoh: Bonus Event Akhir Pekan"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  Ringkasan Eksekusi Massal Atomic:
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>Total Penerima: <strong className="text-white">{memberRows.length} Anggota Active</strong></li>
                  <li>Inkremen per Anggota: <strong className="text-purple-300">+{massTicketCount} {massGiftType === 'free' ? 'Tiket' : 'Rp'}</strong></li>
                  <li>Admin Verifikator: <strong className="text-amber-400">@{adminUsername}</strong></li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleMassGiftTickets}
                disabled={isProcessingMass}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingMass ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memproses Pembagian Massal Atomic...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    EKSEKUSI PEMBAGIAN MASSAL KE {memberRows.length} ANGGOTA
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                INFORMASI KONSISTENSI SPIN BALANCES
              </h5>
              <div className="text-[11px] text-slate-400 space-y-2.5 leading-relaxed">
                <p>
                  1. Admin Panel membaca dan menulis saldo langsung ke tabel <strong>spin_balances</strong> database Supabase.
                </p>
                <p>
                  2. Pembagian massal dijalankan via atomic bulk transaction di backend/server sehingga tidak akan terjadi gagal di tengah jalan.
                </p>
                <p>
                  3. Setiap penambahan/perubahan oleh Admin dicatat secara permanen dalam tabel audit <strong>transactions</strong> lengkap dengan timestamp dan username admin verifikator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN GLOBAL SPIN & WIN ODDS */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSpinSettings} className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-slate-100 tracking-wider">
                {language === 'id' ? 'KONFIGURASI GLOBAL & PROBABILITAS SPIN' : 'GLOBAL SPIN CONFIG & WIN ODDS'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {language === 'id'
                  ? 'Atur tiket pendaftaran default, bonus referral deposit, serta mode akurasi hasil putaran.'
                  : 'Configure default signup tickets, sponsor bonuses, and win rate modes.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Feature Switch */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">
                Status Modul Lucky Spin
              </label>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-bold">
                  {spinEnabled ? 'Aktif (Member Bisa Spin)' : 'Nonaktif (Di-suspend)'}
                </span>
                <button
                  type="button"
                  onClick={() => setSpinEnabled(!spinEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    spinEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            {/* Default Signup Tickets */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">
                Tiket Spin Default Pendaftaran Baru
              </label>
              <input
                type="number"
                min="0"
                value={defaultTickets}
                onChange={(e) => setDefaultTickets(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Jumlah tiket gratis saat user baru mendaftar akun.
              </span>
            </div>

            {/* Referral Deposit Bonus Tickets */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">
                Bonus Tiket Referral per Downline Deposit
              </label>
              <input
                type="number"
                min="0"
                value={referralBonusTickets}
                onChange={(e) => setReferralBonusTickets(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Tiket spin otomatis yang dihadiahkan ke Sponsor saat Downline melakukan deposit.
              </span>
            </div>

            {/* Win Rate Mode */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">
                Mode Akurasi Hasil Spin (Win Rate Control)
              </label>
              <select
                value={winRateMode}
                onChange={(e) => setWinRateMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="normal">Normal (Acak Seimbang / Fair Standard)</option>
                <option value="high_win">High Win Rate (80% Hadiah Tunai)</option>
                <option value="conservative">Konservatif (Tinggi Peluang Zonk)</option>
                <option value="jackpot">Jackpot Event Mode (Ganda Hadiah Boost)</option>
              </select>
              <span className="text-[10px] text-slate-500 block">
                Mengatur algoritma peluang mendarat di segmen Cash vs Zonk.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SIMPAN KONFIGURASI SPIN
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: LOG AUDIT PUTARAN & TRANSACTION DB (Requirement #9) */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                AUDIT LOG RIWAYAT SPIN DARI DATABASE TRANSACTIONS
              </h4>
            </div>

            <button
              onClick={loadData}
              disabled={isLoadingData}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-emerald-400' : ''}`} />
              Refresh History
            </button>
          </div>

          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">TRANSAKSI ID</th>
                    <th className="p-3.5">ANGGOTA</th>
                    <th className="p-3.5">TIPE / HASIL</th>
                    <th className="p-3.5">NOMINAL</th>
                    <th className="p-3.5">DESKRIPSI & CATATAN</th>
                    <th className="p-3.5">ADMIN VERIFIKATOR</th>
                    <th className="p-3.5 text-right">TANGGAL & WAKTU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-400 mb-2" />
                        Memuat riwayat transaksi database...
                      </td>
                    </tr>
                  ) : historyList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                        Belum ada riwayat transaksi putaran spin di database.
                      </td>
                    </tr>
                  ) : (
                    historyList.map((item) => {
                      const amountNum = Number(item.amount) || 0;
                      const isGrant = item.type === 'admin_spin_ticket_grant' || item.type === 'admin_spin_bonus_grant';
                      const isCash = (item.type === 'lucky_spin_reward' || item.type === 'spin_reward') && amountNum > 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5 font-mono text-[11px] text-amber-400">
                            {item.id}
                          </td>

                          <td className="p-3.5 font-bold text-white">
                            {item.username}
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              isGrant
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : isCash
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isGrant
                                ? (item.type === 'admin_spin_ticket_grant' ? 'ADMIN GRANT TICKET' : 'ADMIN GRANT BONUS')
                                : isCash
                                ? 'HADIAH CASH'
                                : 'ZONK / FREE'}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            {amountNum > 0 ? (item.type?.includes('ticket') ? `+${amountNum} Tiket` : `Rp ${amountNum.toLocaleString('id-ID')}`) : '-'}
                          </td>

                          <td className="p-3.5 text-slate-300 max-w-xs truncate">
                            {item.description || 'Transaksi Spin'}
                          </td>

                          <td className="p-3.5 text-amber-300 font-mono text-[11px]">
                            {item.approved_by ? `@${item.approved_by}` : 'System'}
                          </td>

                          <td className="p-3.5 text-right font-mono text-[11px] text-slate-400">
                            {new Date(item.created_at || item.date || Date.now()).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
