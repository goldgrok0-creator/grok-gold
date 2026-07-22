import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp, Coins, History, Gift, Users, RefreshCw, Gem, Boxes } from 'lucide-react';
import { AppState, CONFIG } from '../types';

interface WalletPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  t: any;
  state: AppState;
  totalEarned: number;
  triggerWithdrawFlow: () => void;
  handleClaimYield: () => void;
  miningProfit: number;
  referralReward: number;
  rebateReward: number;
  bonusReward: number;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  language,
  setCurrentTab,
  t,
  state,
  totalEarned,
  triggerWithdrawFlow,
  handleClaimYield,
  miningProfit,
  referralReward,
  rebateReward,
  bonusReward,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<'mining' | 'referral' | 'bonus' | 'rebate' | null>(null);

  // Calculations for Portfolio Overview
  const activeContractsCount = state.activeContracts || 0;
  const activeContractValue = activeContractsCount * CONFIG.PRICE_PER_UNIT;

  const rawSum = (miningProfit || 0) + (referralReward || 0) + (bonusReward || 0) + (rebateReward || 0);

  // Percentages
  const miningPct = rawSum > 0 ? Math.round(((miningProfit || 0) / rawSum) * 100) : 19;
  const referralPct = rawSum > 0 ? Math.round(((referralReward || 0) / rawSum) * 100) : 81;
  const bonusPct = rawSum > 0 ? Math.round(((bonusReward || 0) / rawSum) * 100) : 0;
  const rebatePct = rawSum > 0 ? Math.round(((rebateReward || 0) / rawSum) * 100) : 0;

  // Fractions for chart SVG ring (if rawSum === 0, display visual proportions matching design: 19%, 81%, 0.5%, 0.5%)
  const fMining = rawSum > 0 ? (miningProfit / rawSum) : 0.19;
  const fReferral = rawSum > 0 ? (referralReward / rawSum) : 0.79;
  const fBonus = rawSum > 0 ? (bonusReward / rawSum) : 0.01;
  const fRebate = rawSum > 0 ? (rebateReward / rawSum) : 0.01;

  const totalF = fMining + fReferral + fBonus + fRebate;
  const normMining = fMining / totalF;
  const normReferral = fReferral / totalF;
  const normBonus = fBonus / totalF;
  const normRebate = fRebate / totalF;

  const R = 38;
  const C = 2 * Math.PI * R; // ~238.761
  const strokeWidth = 10;
  const gap = 2; // small gap between arcs

  let currentAcc = 0;
  const getSegmentStyle = (fraction: number) => {
    const arcLen = Math.max(0, fraction * C - gap);
    const strokeDasharray = `${arcLen} ${C - arcLen}`;
    const strokeDashoffset = -currentAcc;
    currentAcc += fraction * C;
    return { strokeDasharray, strokeDashoffset };
  };

  const segMining = getSegmentStyle(normMining);
  const segReferral = getSegmentStyle(normReferral);
  const segBonus = getSegmentStyle(normBonus);
  const segRebate = getSegmentStyle(normRebate);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft
          className="w-5 h-5 text-slate-400 cursor-pointer"
          onClick={() => setCurrentTab('home')}
        />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.wallet}</h2>
      </div>

      {/* Split balances card */}
      <div className="bg-gradient-to-br from-[#120a26] to-[#040108] border border-gold-primary/30 rounded-3xl p-5 shadow-2xl relative">
        <span className="text-[10px] font-black text-slate-400 tracking-wider block mb-1.5 uppercase">
          {t.totalBalance}
        </span>
        <div className="text-3xl font-black text-gradient-gold font-orbitron mb-5">
          Rp {(state.mainBalance + totalEarned).toLocaleString('id-ID')}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block mb-1">{t.mainBalance}</span>
            <div className="text-sm font-black text-white">
              Rp {state.mainBalance.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold block mb-1">{t.rewardBalance}</span>
            <div className="text-sm font-black text-gold-primary">
              Rp {totalEarned.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setCurrentTab('deposit')}
          className="py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-extrabold transition flex flex-col items-center gap-1.5 shadow-md cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
          {t.deposit}
        </button>
        <button
          onClick={triggerWithdrawFlow}
          className="py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-extrabold transition flex flex-col items-center gap-1.5 shadow-md cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
          {t.withdraw}
        </button>
        <button
          onClick={handleClaimYield}
          className="py-3 bg-gradient-to-br from-yellow-300 to-gold-primary text-black rounded-2xl text-[10px] font-black transition flex flex-col items-center gap-1.5 shadow-lg shadow-gold-primary/10 cursor-pointer hover:brightness-110 active:scale-95"
        >
          <Coins className="w-4 h-4" />
          KLAIM REWARD
        </button>
      </div>

      {/* PORTFOLIO OVERVIEW / RINCIAN PENDAPATAN */}
      <div className="bg-gradient-to-b from-[#110726] to-[#080314] border border-amber-500/20 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Gem className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-wider font-orbitron uppercase">
                PORTFOLIO OVERVIEW
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {language === 'id' ? 'Rincian pendapatan & nilai kontrak Anda' : 'Your earnings & active contract overview'}
              </p>
            </div>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-black text-[10px] sm:text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm uppercase tracking-wider shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Content Body: Ring Chart Centered Top + 4 Income Rows Vertically Underneath */}
        <div className="flex flex-col space-y-6">
          
          {/* Ring Chart Container (Centered) */}
          <div className="relative flex flex-col items-center justify-center p-2">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center cursor-pointer group">
              
              {/* SVG Donut Chart */}
              <svg className="w-full h-full -rotate-90 transform filter drop-shadow-[0_0_12px_rgba(245,158,11,0.2)]" viewBox="0 0 100 100">
                {/* Background Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  stroke="#1a1130"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />

                {/* Mining Segment (Amber/Gold) */}
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  stroke="#f59e0b"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={segMining.strokeDasharray}
                  strokeDashoffset={segMining.strokeDashoffset}
                  className="transition-all duration-300 ease-out cursor-pointer hover:stroke-amber-300 hover:stroke-[12]"
                  onClick={() => setSelectedCategory('mining')}
                >
                  <title>Mining Income: Rp {miningProfit.toLocaleString('id-ID')} ({miningPct}%)</title>
                </circle>

                {/* Referral Segment (Emerald Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  stroke="#22c55e"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={segReferral.strokeDasharray}
                  strokeDashoffset={segReferral.strokeDashoffset}
                  className="transition-all duration-300 ease-out cursor-pointer hover:stroke-emerald-300 hover:stroke-[12]"
                  onClick={() => setSelectedCategory('referral')}
                >
                  <title>Referral Income: Rp {referralReward.toLocaleString('id-ID')} ({referralPct}%)</title>
                </circle>

                {/* Bonus Segment (Purple) */}
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  stroke="#a855f7"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={segBonus.strokeDasharray}
                  strokeDashoffset={segBonus.strokeDashoffset}
                  className="transition-all duration-300 ease-out cursor-pointer hover:stroke-purple-300 hover:stroke-[12]"
                  onClick={() => setSelectedCategory('bonus')}
                >
                  <title>Bonus Income: Rp {bonusReward.toLocaleString('id-ID')} ({bonusPct}%)</title>
                </circle>

                {/* Rebate Segment (Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  stroke="#3b82f6"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={segRebate.strokeDasharray}
                  strokeDashoffset={segRebate.strokeDashoffset}
                  className="transition-all duration-300 ease-out cursor-pointer hover:stroke-blue-300 hover:stroke-[12]"
                  onClick={() => setSelectedCategory('rebate')}
                >
                  <title>Rebate Income: Rp {rebateReward.toLocaleString('id-ID')} ({rebatePct}%)</title>
                </circle>
              </svg>

              {/* Ring Center Info */}
              <div 
                onClick={() => setSelectedCategory('mining')} 
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-auto cursor-pointer"
              >
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">
                  NILAI KONTRAK AKTIF
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-orbitron leading-tight mb-1">
                  Rp {activeContractValue.toLocaleString('id-ID')}
                </span>
                <div className="flex items-center gap-1.5 my-0.5">
                  <span className="text-amber-400 font-bold text-xs">💎</span>
                  <span className="text-xs sm:text-sm font-black text-amber-300">{activeContractsCount}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                  KONTRAK AKTIF
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-medium text-center mt-2 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <span>👆</span>
              <span>{language === 'id' ? 'Klik chart atau baris di bawah untuk melihat detail per kategori' : 'Click chart or rows below for category details'}</span>
            </p>
          </div>

          {/* 4 income rows stacked vertically */}
          <div className="space-y-2.5">
            {/* Row 1: Mining Income */}
            <button
              onClick={() => setSelectedCategory('mining')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border transition-all cursor-pointer text-left ${
                selectedCategory === 'mining' 
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#201505] border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">⛏️</span>
                  <span className="text-xs font-bold text-white">Mining Income</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="text-xs font-black text-white font-mono">
                  Rp {miningProfit.toLocaleString('id-ID')}
                </div>
                <span className="bg-[#2a1d08] border border-amber-500/50 text-amber-300 font-black text-[10px] px-2.5 py-1 rounded-full min-w-[42px] text-center shadow-sm">
                  {miningPct}%
                </span>
              </div>
            </button>

            {/* Row 2: Referral Income */}
            <button
              onClick={() => setSelectedCategory('referral')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border transition-all cursor-pointer text-left ${
                selectedCategory === 'referral' 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                  : 'border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#051e13] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">👥</span>
                  <span className="text-xs font-bold text-white">Referral Income</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="text-xs font-black text-white font-mono">
                  Rp {referralReward.toLocaleString('id-ID')}
                </div>
                <span className="bg-[#082a1a] border border-emerald-500/50 text-emerald-300 font-black text-[10px] px-2.5 py-1 rounded-full min-w-[42px] text-center shadow-sm">
                  {referralPct}%
                </span>
              </div>
            </button>

            {/* Row 3: Bonus Income */}
            <button
              onClick={() => setSelectedCategory('bonus')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border transition-all cursor-pointer text-left ${
                selectedCategory === 'bonus' 
                  ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                  : 'border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1b082a] border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-md">
                  <Gift className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎁</span>
                  <span className="text-xs font-bold text-white">Bonus Income</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="text-xs font-black text-white font-mono">
                  Rp {bonusReward.toLocaleString('id-ID')}
                </div>
                <span className="bg-[#250b3b] border border-purple-500/50 text-purple-300 font-black text-[10px] px-2.5 py-1 rounded-full min-w-[42px] text-center shadow-sm">
                  {bonusPct}%
                </span>
              </div>
            </button>

            {/* Row 4: Rebate Income */}
            <button
              onClick={() => setSelectedCategory('rebate')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border transition-all cursor-pointer text-left ${
                selectedCategory === 'rebate' 
                  ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#07182a] border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-md">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🔄</span>
                  <span className="text-xs font-bold text-white">Rebate Income</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="text-xs font-black text-white font-mono">
                  Rp {rebateReward.toLocaleString('id-ID')}
                </div>
                <span className="bg-[#0b233e] border border-blue-500/50 text-blue-300 font-black text-[10px] px-2.5 py-1 rounded-full min-w-[42px] text-center shadow-sm">
                  {rebatePct}%
                </span>
              </div>
            </button>

          </div>

        </div>

      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0d061c] border border-amber-500/30 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedCategory === 'mining' && '⛏️'}
                  {selectedCategory === 'referral' && '👥'}
                  {selectedCategory === 'bonus' && '🎁'}
                  {selectedCategory === 'rebate' && '🔄'}
                </span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {selectedCategory === 'mining' && 'Mining Income Detail'}
                  {selectedCategory === 'referral' && 'Referral Income Detail'}
                  {selectedCategory === 'bonus' && 'Bonus Income Detail'}
                  {selectedCategory === 'rebate' && 'Rebate Income Detail'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 py-1">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Total Income</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  Rp {
                    selectedCategory === 'mining' ? miningProfit.toLocaleString('id-ID') :
                    selectedCategory === 'referral' ? referralReward.toLocaleString('id-ID') :
                    selectedCategory === 'bonus' ? bonusReward.toLocaleString('id-ID') :
                    rebateReward.toLocaleString('id-ID')
                  }
                </span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Portfolio Share</span>
                <span className="text-xs font-black text-emerald-400 font-mono">
                  {
                    selectedCategory === 'mining' ? miningPct :
                    selectedCategory === 'referral' ? referralPct :
                    selectedCategory === 'bonus' ? bonusPct :
                    rebatePct
                  }%
                </span>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[11px] text-slate-300 leading-relaxed">
                {selectedCategory === 'mining' && (language === 'id' ? 'Hasil klaim profit harian (2% per klaim) dari kontrak server GPU pertambangan aktif Anda.' : 'Daily yield claim profit (2% per claim) from your active GPU mining server contracts.')}
                {selectedCategory === 'referral' && (language === 'id' ? 'Komisi bonus dari tim dan teman yang Anda undang ke platform.' : 'Commission rewards from team members and invited friends on the platform.')}
                {selectedCategory === 'bonus' && (language === 'id' ? 'Bonus promosi khusus, milestone pencapaian, dan event spesial.' : 'Special promotional bonuses, achievement milestones, and event rewards.')}
                {selectedCategory === 'rebate' && (language === 'id' ? 'Rebate cash-back otomatis dari setiap pembelian unit server.' : 'Automatic cashback rebate on every server unit purchase.')}
              </div>
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-2xl transition cursor-pointer uppercase tracking-wider"
            >
              {language === 'id' ? 'Tutup Detail' : 'Close Details'}
            </button>
          </motion.div>
        </div>
      )}

      {/* TRANSACTION HISTORY */}
      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl">
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History className="w-4.5 h-4.5" />
            {t.txHistory}
          </div>
          <button
            onClick={() => setCurrentTab('transactions')}
            className="text-[10px] text-amber-400 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 outline-none"
          >
            {language === 'id' ? 'Lihat Semua' : 'View All'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
          {state.transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-bold text-xs space-y-1">
              <div>{t.emptyTx}</div>
            </div>
          ) : (
            state.transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-none">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : tx.type === 'withdraw'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-gold-primary/10 text-gold-primary'
                    }`}
                  >
                    {tx.type === 'deposit' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : tx.type === 'withdraw' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <Gift className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block leading-tight">{tx.description}</span>
                    {tx.type === 'deposit' && tx.rejectionReason && (
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md mt-1 inline-block leading-tight">
                        {language === 'id' ? `Alasan: ${tx.rejectionReason}` : `Reason: ${tx.rejectionReason}`}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {new Date(tx.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-black ${
                    tx.type === 'deposit' || tx.type === 'reward' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;

