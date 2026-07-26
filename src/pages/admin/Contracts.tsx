import React, { useState, useMemo } from 'react';
import { Gift, Search, Award, ShieldAlert, Cpu, PlusCircle, Trash2, Check, RefreshCw } from 'lucide-react';
import { UserAccount, GlobalConfig, isMemberAccount } from '../../types';
import { supabase } from '../../supabase';
import {
  getContractPrice,
  getDailyRewardRate,
  calculateContractValuation,
  calculateDailyRewardEstimate
} from '../../utils/contract';

interface ContractsProps {
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  saveAccountToSupabase: (account: UserAccount) => Promise<boolean>;
  globalConfig?: GlobalConfig;
}

export default function Contracts({
  accounts,
  setAccounts,
  language,
  triggerModal,
  saveAccountToSupabase,
  globalConfig
}: ContractsProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [unitsToGift, setUnitsToGift] = useState('1');
  const [giftReason, setGiftReason] = useState('Bonus Hashrate VIP Member');
  const [isSubmittingGift, setIsSubmittingGift] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Active miners
  const activeMiners = useMemo(() => {
    return accounts
      .filter(isMemberAccount)
      .filter(acc => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          acc.username.toLowerCase().includes(query) ||
          acc.fullName.toLowerCase().includes(query) ||
          (acc.referralCode && acc.referralCode.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => (b.state?.activeContracts || 0) - (a.state?.activeContracts || 0));
  }, [accounts, searchQuery]);

  const handleGiftContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      triggerModal(language === 'id' ? 'Silakan pilih member penerima!' : 'Please select recipient user!', 'warning');
      return;
    }

    const units = parseInt(unitsToGift) || 0;
    if (units <= 0) {
      triggerModal(language === 'id' ? 'Jumlah unit tidak valid!' : 'Invalid units count!', 'warning');
      return;
    }

    const user = accounts.find(acc => acc.username === selectedUser);
    if (!user) return;

    setIsSubmittingGift(true);

    try {
      const currentContracts = user.state?.activeContracts || 0;
      const updatedContracts = currentContracts + units;
      const valuation = calculateContractValuation(units, globalConfig);
      const currentRate = getDailyRewardRate(globalConfig);

      const newTx = {
        id: 'GIFT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: 'gift_contract' as const,
        amount: valuation, // valuation based on central contract unit price
        date: Date.now(),
        description: `🎁 Bonus Hashrate +${units} Unit (${giftReason})`,
        status: 'approved'
      };

      const updatedAccount: UserAccount = {
        ...user,
        state: {
          ...user.state,
          activeContracts: updatedContracts,
          hasPurchased: true,
          transactions: [newTx, ...(user.state?.transactions || [])]
        }
      };

      // Save to Supabase
      await saveAccountToSupabase(updatedAccount);

      // Save contract record into Supabase contracts table
      try {
        await supabase.from('contracts').insert({
          id: 'GIFT-CONTRACT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          username: selectedUser,
          units: units,
          price_paid: 0,
          daily_reward_rate: currentRate,
          created_at: Date.now(),
          last_profit_claim: Date.now()
        });
      } catch (e) {
        console.warn('Supabase contracts table note:', e);
      }

      setAccounts(prev => prev.map(acc => acc.username === selectedUser ? updatedAccount : acc));
      
      triggerModal(
        language === 'id'
          ? `✅ Berhasil memberikan +${units} Unit Hashrate kepada ${selectedUser}!`
          : `✅ Successfully gifted +${units} units to ${selectedUser}!`,
        'success'
      );

      // Reset
      setSelectedUser('');
      setUnitsToGift('1');
    } catch (err) {
      console.error(err);
      triggerModal('Failed to gift contract.', 'danger');
    } finally {
      setIsSubmittingGift(false);
    }
  };

  const handleAdjustContracts = async (user: UserAccount, delta: number) => {
    const current = user.state?.activeContracts || 0;
    const nextVal = Math.max(0, current + delta);

    if (nextVal === current) return;

    const updatedAccount: UserAccount = {
      ...user,
      state: {
        ...user.state,
        activeContracts: nextVal,
        hasPurchased: nextVal > 0
      }
    };

    await saveAccountToSupabase(updatedAccount);
    setAccounts(prev => prev.map(acc => acc.username === user.username ? updatedAccount : acc));
    triggerModal(`Updated ${user.username} contracts to ${nextVal} units.`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
          {language === 'id' ? 'MANAJEMEN HASHRATE & KONTRAK MINING' : 'HASHRATE & CONTRACT MANAGEMENT'}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {language === 'id' 
            ? 'Hadiahkan unit mining VIP kepada member, sesuaikan unit aktif, dan pantau total kekuatan hashing.' 
            : 'Gift VIP mining hash units to members and monitor active network hashrate.'}
        </p>
      </div>

      {/* Gift Contract Panel */}
      <div className="bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 p-5 rounded-2xl border border-purple-800/40 space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-rose-400" />
          <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
            {language === 'id' ? 'HADIAHKAN KONTRAK HASHRATE' : 'GIFT HASHRATE CONTRACT'}
          </h4>
        </div>

        <form onSubmit={handleGiftContract} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {language === 'id' ? 'Pilih Member Target' : 'Target Member'}
            </label>
            <select
              required
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
            >
              <option value="">-- {language === 'id' ? 'Pilih Member' : 'Select User'} --</option>
              {accounts
                .filter(isMemberAccount)
                .map(acc => (
                  <option key={acc.username} value={acc.username}>
                    {acc.username} ({acc.fullName}) - Current: {acc.state?.activeContracts || 0} Unit
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {language === 'id' ? 'Jumlah Unit Hashrate' : 'Units Count'}
            </label>
            <input
              type="number"
              min="1"
              required
              value={unitsToGift}
              onChange={(e) => setUnitsToGift(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-purple-300 font-mono font-bold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {language === 'id' ? 'Catatan / Alasan Bonus' : 'Gift Note'}
            </label>
            <input
              type="text"
              value={giftReason}
              onChange={(e) => setGiftReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmittingGift || !selectedUser}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-black rounded-xl uppercase transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40"
            >
              {isSubmittingGift ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>{language === 'id' ? 'Kirim Hashrate' : 'Gift Contract'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Contract Inventory Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'id' ? 'Cari member dengan kontrak mining...' : 'Search members with active contracts...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-rose-500 text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{language === 'id' ? 'Member' : 'User'}</th>
                <th className="py-3 px-4">{language === 'id' ? 'Unit Hashrate Aktif' : 'Active Hash Units'}</th>
                <th className="py-3 px-4">{language === 'id' ? 'Estimasi Yield Harian' : 'Est. Daily Reward'}</th>
                <th className="py-3 px-4">{language === 'id' ? 'Nilai Kontrak (Est)' : 'Valuation'}</th>
                <th className="py-3 px-4 text-right">{language === 'id' ? 'Penyesuaian Quick' : 'Adjust'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium">
              {activeMiners.map(user => {
                const units = user.state?.activeContracts || 0;
                const estDailyYield = calculateDailyRewardEstimate(units, globalConfig);
                const estValuation = calculateContractValuation(units, globalConfig);

                return (
                  <tr key={user.username} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{user.username}</div>
                      <div className="text-[10px] text-slate-500">{user.fullName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono font-black rounded-lg">
                        {units} Unit
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      Rp {estDailyYield.toLocaleString('id-ID')} / hari
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      Rp {estValuation.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => handleAdjustContracts(user, -1)}
                          disabled={units <= 0}
                          className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-[10px] font-black rounded cursor-pointer disabled:opacity-30"
                        >
                          -1 Unit
                        </button>
                        <button
                          onClick={() => handleAdjustContracts(user, 1)}
                          className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 text-[10px] font-black rounded cursor-pointer"
                        >
                          +1 Unit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {activeMiners.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 italic">
                    {language === 'id' ? 'Tidak ada member ditemukan.' : 'No members found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
