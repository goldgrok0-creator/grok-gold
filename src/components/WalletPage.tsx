import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp, Coins, History, Gift, Users, RefreshCw, Gem, Boxes, ShieldCheck, Sparkles, X } from 'lucide-react';
import { AppState, CONFIG } from '../types';
import { calculateCappingEarnings } from '../utils/capping';

interface WalletPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  t: any;
  state: AppState;
  totalEarned: number;
  triggerWithdrawFlow: () => void;
  handleClaimYield: () => void;
  handleClaimRewardToWallet?: () => void;
  miningProfit: number;
  referralReward: number;
  rebateReward: number;
  bonusReward: number;
  networkActiveCount?: number;
  canClaimWelcomeBonus?: boolean;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  language,
  setCurrentTab,
  t,
  state,
  totalEarned,
  triggerWithdrawFlow,
  handleClaimYield,
  handleClaimRewardToWallet,
  miningProfit,
  referralReward,
  rebateReward,
  bonusReward,
  networkActiveCount = 0,
  canClaimWelcomeBonus = false,
}) => {
  // Selected segment state for Donut Chart interactivity
  const [selectedSegment, setSelectedSegment] = useState<
    'mining' | 'referral' | 'bonus' | 'rebate' | 'luckyspin' | null
  >(null);

  // Calculations via single source of truth capping utility
  const cappingMetrics = React.useMemo(() => calculateCappingEarnings(state), [
    state?.activeContracts,
    state?.transactions,
    state?.referralEarned,
    state?.rebateEarned,
    state?.bonusSpinBalance,
    state?.welcomeBonusClaimed,
  ]);
  const {
    activeContracts: activeContractsCount,
    totalModalAktif: activeContractValue,
    maxPossibleEarnings,
    dailyRewardEarnings,
    referralEarnings: calculatedReferral,
    rebateEarnings: calculatedRebate,
    cappingEarnings,
    remainingCapping,
    bonusIncome: effectiveBonus,
    luckySpinReward: effectiveLuckySpin,
  } = cappingMetrics;

  const dailyRewardAmount = miningProfit > 0 ? miningProfit : dailyRewardEarnings;
  const effectiveReferralReward = referralReward > 0 ? referralReward : calculatedReferral;
  const effectiveRebateReward = rebateReward > 0 ? rebateReward : calculatedRebate;
  const effectiveLuckySpinReward = effectiveLuckySpin || 0;

  const rawSum =
    (dailyRewardAmount || 0) +
    (effectiveReferralReward || 0) +
    (effectiveBonus || 0) +
    (effectiveRebateReward || 0) +
    (effectiveLuckySpinReward || 0);

  // Calculate percentage shares
  const calcPct = (amount: number) => {
    if (rawSum <= 0) return 0;
    return (amount / rawSum) * 100;
  };

  const pctMining = rawSum > 0 ? calcPct(dailyRewardAmount) : Math.round(CONFIG.DAILY_REWARD_PERCENT * 100);
  const pctReferral = calcPct(effectiveReferralReward);
  const pctBonus = calcPct(effectiveBonus);
  const pctRebate = calcPct(effectiveRebateReward);
  const pctLuckySpin = calcPct(effectiveLuckySpinReward);

  // Helper to format percentage strings cleanly
  const formatPct = (pct: number) => {
    if (pct === 0) return '0%';
    if (pct % 1 === 0) return `${pct.toFixed(0)}%`;
    return `${pct.toFixed(1)}%`;
  };

  // Fractions for chart SVG ring
  const fMining = rawSum > 0 ? dailyRewardAmount / rawSum : 0.2;
  const fReferral = rawSum > 0 ? effectiveReferralReward / rawSum : 0.2;
  const fBonus = rawSum > 0 ? effectiveBonus / rawSum : 0.2;
  const fRebate = rawSum > 0 ? effectiveRebateReward / rawSum : 0.2;
  const fLuckySpin = rawSum > 0 ? effectiveLuckySpinReward / rawSum : 0.2;

  const totalF = fMining + fReferral + fBonus + fRebate + fLuckySpin;
  const normMining = fMining / (totalF || 1);
  const normReferral = fReferral / (totalF || 1);
  const normBonus = fBonus / (totalF || 1);
  const normRebate = fRebate / (totalF || 1);
  const normLuckySpin = fLuckySpin / (totalF || 1);

  const R = 38;
  const C = 2 * Math.PI * R; // ~238.761
  const strokeWidthDefault = 9;
  const strokeWidthSelected = 13;
  const gap = 2.5; // small gap between arcs

  // Segments metadata dictionary
  const segmentsMap = {
    mining: {
      key: 'mining' as const,
      label: language === 'id' ? 'Daily Reward' : 'Daily Reward',
      nominal: dailyRewardAmount,
      pct: pctMining,
      formattedPct: formatPct(pctMining),
      color: '#f59e0b', // Amber
      glowColor: 'rgba(245, 158, 11, 0.7)',
      filterId: 'glow-amber',
      icon: <Coins className="w-4 h-4 text-amber-400" />,
      emoji: '🎁',
      normFraction: normMining,
    },
    referral: {
      key: 'referral' as const,
      label: language === 'id' ? 'Referral Income' : 'Referral Income',
      nominal: effectiveReferralReward,
      pct: pctReferral,
      formattedPct: formatPct(pctReferral),
      color: '#22c55e', // Emerald
      glowColor: 'rgba(34, 197, 94, 0.7)',
      filterId: 'glow-emerald',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      emoji: '👥',
      normFraction: normReferral,
    },
    bonus: {
      key: 'bonus' as const,
      label: language === 'id' ? 'Bonus Income' : 'Bonus Income',
      nominal: effectiveBonus,
      pct: pctBonus,
      formattedPct: formatPct(pctBonus),
      color: '#a855f7', // Purple
      glowColor: 'rgba(168, 85, 247, 0.7)',
      filterId: 'glow-purple',
      icon: <Gift className="w-4 h-4 text-purple-400" />,
      emoji: '🎁',
      normFraction: normBonus,
    },
    rebate: {
      key: 'rebate' as const,
      label: language === 'id' ? 'Rebate Income' : 'Rebate Income',
      nominal: effectiveRebateReward,
      pct: pctRebate,
      formattedPct: formatPct(pctRebate),
      color: '#3b82f6', // Blue
      glowColor: 'rgba(59, 130, 246, 0.7)',
      filterId: 'glow-blue',
      icon: <RefreshCw className="w-4 h-4 text-blue-400" />,
      emoji: '🔄',
      normFraction: normRebate,
    },
    luckyspin: {
      key: 'luckyspin' as const,
      label: language === 'id' ? 'Lucky Spin Reward' : 'Lucky Spin Reward',
      nominal: effectiveLuckySpinReward,
      pct: pctLuckySpin,
      formattedPct: formatPct(pctLuckySpin),
      color: '#ec4899', // Pink
      glowColor: 'rgba(236, 72, 153, 0.7)',
      filterId: 'glow-pink',
      icon: <Sparkles className="w-4 h-4 text-pink-400" />,
      emoji: '🎰',
      normFraction: normLuckySpin,
    },
  };

  // Compute strokeDasharray and strokeDashoffset for each segment
  let currentAcc = 0;
  const segmentsList = Object.values(segmentsMap).map((seg) => {
    const fraction = seg.normFraction;
    const arcLen = Math.max(0, fraction * C - gap);
    const strokeDasharray = `${arcLen} ${C - arcLen}`;
    const strokeDashoffset = -currentAcc;
    currentAcc += fraction * C;
    return {
      ...seg,
      strokeDasharray,
      strokeDashoffset,
    };
  });

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
          Rp {Math.floor(state.mainBalance ?? 0).toLocaleString('id-ID')}
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
              Rp {Math.floor(state.rewardBalance ?? 0).toLocaleString('id-ID')}
            </div>
            {(state.rewardBalance ?? 0) > 0 && handleClaimRewardToWallet && (
              <button
                onClick={handleClaimRewardToWallet}
                className="mt-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-[9px] hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer inline-flex items-center gap-1 font-orbitron"
              >
                <Coins className="w-2.5 h-2.5" />
                {language === 'id' ? 'KLAIM KE WALLET' : 'CLAIM TO WALLET'}
              </button>
            )}
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
          onClick={() => {
            if ((state.rewardBalance ?? 0) > 0 && handleClaimRewardToWallet) {
              handleClaimRewardToWallet();
            } else {
              handleClaimYield();
            }
          }}
          className="py-3 bg-gradient-to-br from-yellow-300 to-gold-primary text-black rounded-2xl text-[10px] font-black transition flex flex-col items-center gap-1.5 shadow-lg shadow-gold-primary/10 cursor-pointer hover:brightness-110 active:scale-95"
        >
          <Coins className="w-4 h-4" />
          {(state.rewardBalance ?? 0) > 0 ? (language === 'id' ? 'KLAIM KE WALLET' : 'CLAIM TO WALLET') : 'KLAIM REWARD'}
        </button>
      </div>

      {/* PORTFOLIO OVERVIEW / RINCIAN PENDAPATAN */}
      <div
        onClick={() => {
          if (selectedSegment !== null) setSelectedSegment(null);
        }}
        className="bg-gradient-to-b from-[#110726] to-[#080314] border border-amber-500/20 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5"
      >
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

        {/* Ring Donut Chart Container */}
        <div className="relative flex flex-col items-center justify-center p-2">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* SVG Donut Chart */}
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-full h-full -rotate-90 transform filter drop-shadow-[0_0_14px_rgba(245,158,11,0.25)]"
                viewBox="0 0 100 100"
              >
                <defs>
                  <filter id="glow-amber" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="1.8" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="1.8" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="1.8" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-blue" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="1.8" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-pink" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="1.8" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  stroke="#1a1130"
                  strokeWidth={strokeWidthDefault}
                  fill="none"
                />

                {/* Interactive Donut Segments */}
                {segmentsList.map((seg) => {
                  const isSelected = selectedSegment === seg.key;
                  const isDimmed = selectedSegment !== null && !isSelected;
                  return (
                    <circle
                      key={seg.key}
                      cx="50"
                      cy="50"
                      r={R}
                      stroke={seg.color}
                      strokeWidth={isSelected ? strokeWidthSelected : strokeWidthDefault}
                      fill="none"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="round"
                      filter={isSelected ? `url(#${seg.filterId})` : 'none'}
                      opacity={isDimmed ? 0.35 : 1}
                      className="cursor-pointer transition-all duration-300 ease-out hover:opacity-100"
                      style={{
                        transformOrigin: 'center',
                        filter: isSelected ? `drop-shadow(0 0 8px ${seg.glowColor})` : undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSegment(isSelected ? null : seg.key);
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        setSelectedSegment(isSelected ? null : seg.key);
                      }}
                    >
                      <title>{`${seg.label}: Rp ${seg.nominal.toLocaleString('id-ID')} (${seg.formattedPct})`}</title>
                    </circle>
                  );
                })}
              </svg>
            </div>

            {/* Ring Center Info with Smooth Transition */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 z-10 select-none pointer-events-none">
              <AnimatePresence mode="wait">
                {selectedSegment === null ? (
                  <motion.div
                    key="default-summary"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex flex-col items-center justify-center"
                  >
                    <span className="text-[9px] sm:text-[10px] font-black text-amber-400/90 tracking-wider uppercase mb-0.5">
                      {language === 'id' ? 'NILAI KONTRAK AKTIF' : 'ACTIVE PORTFOLIO'}
                    </span>

                    <span className="text-lg sm:text-2xl font-black text-amber-300 font-orbitron leading-tight mb-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.35)]">
                      Rp {activeContractValue.toLocaleString('id-ID')}
                    </span>

                    <div className="flex items-center gap-1.5 my-0.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      <span className="text-amber-400 font-bold text-xs">💎</span>
                      <span className="text-xs font-black text-amber-300">{activeContractsCount}</span>
                      <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase ml-0.5">
                        {language === 'id' ? 'UNIT AKTIF' : 'ACTIVE UNITS'}
                      </span>
                    </div>

                    <span className="text-[8px] text-slate-500 font-semibold mt-1">
                      {language === 'id' ? 'Ketuk segmen untuk persentase' : 'Tap segment for percentage'}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`segment-${selectedSegment}`}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex flex-col items-center justify-center px-1"
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-xs">{segmentsMap[selectedSegment].emoji}</span>
                      <span
                        className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase truncate max-w-[130px]"
                        style={{ color: segmentsMap[selectedSegment].color }}
                      >
                        {segmentsMap[selectedSegment].label}
                      </span>
                    </div>

                    <div
                      className="text-xl sm:text-2xl font-black font-orbitron leading-none my-1 drop-shadow-md"
                      style={{ color: segmentsMap[selectedSegment].color }}
                    >
                      {segmentsMap[selectedSegment].formattedPct}
                    </div>

                    <span className="text-xs sm:text-sm font-black text-white font-mono leading-tight">
                      Rp {segmentsMap[selectedSegment].nominal.toLocaleString('id-ID')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSegment(null);
                      }}
                      className="mt-1.5 pointer-events-auto text-[8px] font-bold text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{language === 'id' ? 'Reset' : 'Reset'}</span>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Income Rows Stacked Vertically - Clean & Percentage Badges Removed */}
        <div className="space-y-2.5">
          {/* Row 1: Daily Reward */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSegment(selectedSegment === 'mining' ? null : 'mining');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition cursor-pointer text-left border ${
              selectedSegment === 'mining'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-white/[0.02] border-white/5 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#201505] border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🎁</span>
                <span className="text-xs font-bold text-white">Daily Reward</span>
                {activeContractsCount === 0 && (
                  <span className="text-[9px] text-slate-400 font-normal ml-1">(0 Kontrak Aktif)</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-white font-mono">
                Rp {dailyRewardAmount.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Row 2: Referral Income */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSegment(selectedSegment === 'referral' ? null : 'referral');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition cursor-pointer text-left border ${
              selectedSegment === 'referral'
                ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                : 'bg-white/[0.02] border-white/5 hover:border-emerald-500/30'
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
            <div className="text-right">
              <div className="text-xs font-black text-white font-mono">
                Rp {effectiveReferralReward.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Row 3: Bonus Income */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSegment(selectedSegment === 'bonus' ? null : 'bonus');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition cursor-pointer text-left border ${
              selectedSegment === 'bonus'
                ? 'bg-purple-500/15 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'bg-white/[0.02] border-white/5 hover:border-purple-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1b082a] border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-md">
                <Gift className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎁</span>
                  <span className="text-xs font-bold text-white">Bonus Income</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {state.welcomeBonusClaimed ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                      {language === 'id' ? 'Sudah Diklaim' : 'Claimed'}
                    </span>
                  ) : (networkActiveCount || 0) >= CONFIG.REQUIRED_HOLDERS ? (
                    <span className="text-amber-300 font-semibold animate-pulse flex items-center gap-1">
                      <Gem className="w-3 h-3 text-amber-300 inline" />
                      {language === 'id' ? 'Eligible untuk Claim Bonus' : 'Eligible for Claim Bonus'}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {language === 'id'
                        ? `Belum memenuhi syarat (${networkActiveCount || 0}/${CONFIG.REQUIRED_HOLDERS} Member)`
                        : `Not eligible (${networkActiveCount || 0}/${CONFIG.REQUIRED_HOLDERS} Members)`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-white font-mono">
                Rp {effectiveBonus.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Row 4: Rebate Income */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSegment(selectedSegment === 'rebate' ? null : 'rebate');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition cursor-pointer text-left border ${
              selectedSegment === 'rebate'
                ? 'bg-blue-500/15 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-white/[0.02] border-white/5 hover:border-blue-500/30'
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
            <div className="text-right">
              <div className="text-xs font-black text-white font-mono">
                Rp {effectiveRebateReward.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Row 5: Lucky Spin Reward */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSegment(selectedSegment === 'luckyspin' ? null : 'luckyspin');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition cursor-pointer text-left border ${
              selectedSegment === 'luckyspin'
                ? 'bg-pink-500/15 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                : 'bg-white/[0.02] border-white/5 hover:border-pink-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2a081a] border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0 shadow-md">
                <Sparkles className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎰</span>
                  <span className="text-xs font-bold text-white">Lucky Spin Reward</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  <span className="text-pink-300 font-semibold">
                    {language === 'id' ? 'Terpisah dari Capping 250%' : 'Separated from 250% Capping'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-white font-mono">
                Rp {effectiveLuckySpinReward.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>

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
            state.transactions.map((tx, idx) => (
              <div
                key={`${tx.id}-${idx}`}
                className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-none"
              >
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
                    <span className="text-xs font-bold text-white block leading-tight">
                      {tx.description}
                    </span>
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
                  {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'} Rp{' '}
                  {tx.amount.toLocaleString('id-ID')}
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

