import React from 'react';
import { motion } from 'motion/react';
import { 
  Eye, EyeOff, Coins, Cpu, Sparkles, Gift, Trophy, Compass, Network, Briefcase, Clock 
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useContract } from '../hooks/useContract';
import { CONFIG } from '../types';
import { calculateCappingEarnings } from '../utils/capping';
import { TRANSLATIONS } from '../translations';
import HomeSkeleton from '../components/HomeSkeleton';

interface HomeProps {
  setHarvestModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Home: React.FC<HomeProps> = ({ setHarvestModalOpen }) => {
  const {
    state,
    language,
    hideBalance,
    setHideBalance,
    isSyncing,
    setCurrentTab,
    claimCooldownText
  } = useAppState();

  const { claimDailyReward } = useContract();
  const t = TRANSLATIONS[language];

  const cappingMetrics = calculateCappingEarnings(state);
  const {
    totalModalAktif: totalPortfolioValue,
    maxPossibleEarnings,
    cappingEarnings,
    remainingCapping,
    cappingRatio,
    isCapped: isCappedLimitMet
  } = cappingMetrics;

  const dailyYield = totalPortfolioValue * CONFIG.DAILY_REWARD_PERCENT;

  if (isSyncing) {
    return <HomeSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* MASTER BALANCE CARD */}
      <div className="relative bg-gradient-to-br from-[#1b0b3a] via-[#09041a] to-[#03010c] border border-gold-primary/25 rounded-3xl p-5 shadow-2xl overflow-hidden group">
        {/* Glowing Accent Orbs */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-radial-gradient from-gold-primary/10 to-transparent pointer-events-none rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition duration-500" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        {/* DYNAMIC MASTER BALANCE SECTION */}
        <div className="bg-black/45 border border-purple-500/15 rounded-2xl p-4.5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />
          
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                {t.mainBalance}
              </span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="text-purple-400 hover:text-white transition p-1 rounded hover:bg-white/5 cursor-pointer"
            >
              {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-2xl font-black text-gradient-gold font-orbitron tracking-wide mb-3 flex items-baseline gap-1">
            {hideBalance ? '••••••••' : `Rp ${state.mainBalance.toLocaleString('id-ID')}`}
            {!hideBalance && <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">IDR</span>}
          </div>

          {/* Animated Gold Hashrate SVG Sparkline */}
          <div className="h-6 relative overflow-visible mt-1.5 mb-2.5 opacity-80">
            <svg className="w-full h-full text-gold-primary/25 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
              <motion.path
                d="M0 10 Q 15 3, 30 14 T 60 4 T 90 12 H 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              />
              <motion.circle
                cx="100"
                cy="12"
                r="2"
                className="fill-gold-primary shadow-[0_0_8px_rgba(212,175,55,1)]"
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </svg>
            <span className="absolute top-0 right-1 text-[8px] font-mono font-black text-emerald-400 tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              {state.activeContracts > 0 ? '● ONLINE' : '○ STANDBY'}
            </span>
          </div>

          {/* HIGH-TECH PROFIT METRICS AREA */}
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3 mt-1">
            {/* 💰 Total Profit Hari Ini */}
            <div className="bg-purple-950/35 p-2.5 rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition duration-300">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4.5 h-4.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Coins className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                  {language === 'id' ? 'Profit Hari Ini' : 'Profit Today'}
                </span>
              </div>
              <div className="text-xs font-black text-emerald-400 font-orbitron">
                Rp {dailyYield.toLocaleString('id-ID')}
              </div>
              <div className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wide">
                {language === 'id' ? 'Est. Hasil Harian' : 'Est. Daily Yield'}
              </div>
            </div>

            {/* ⚡ Hashrate Kecepatan */}
            <div className="bg-purple-950/35 p-2.5 rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition duration-300">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4.5 h-4.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Cpu className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                  {language === 'id' ? 'Kecepatan Node' : 'Node Hashrate'}
                </span>
              </div>
              <div className="text-xs font-black text-purple-300 font-orbitron">
                {(state.activeContracts * 15.6).toFixed(1)} <span className="text-[8px] font-bold text-purple-400">GH/s</span>
              </div>
              <div className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wide">
                {state.activeContracts} {language === 'id' ? 'Kontrak Aktif' : 'Active Units'}
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS PANEL (4 COMPACT ICONS) */}
        <div className="mt-4 pt-4 border-t border-[#291754]/30 relative z-10 text-left">
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/10 to-purple-500/20" />
            <div className="flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-[9.5px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 tracking-[0.25em] uppercase font-mono">
                {language === 'id' ? 'TINDAKAN CEPAT' : 'QUICK ACTIONS'}
              </span>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent" />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                id: 'rewards',
                label: t.rewards,
                icon: Gift,
                color: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
              },
              {
                id: 'leaderboard',
                label: 'Leaderboard',
                icon: Trophy,
                color: 'text-yellow-400 border-yellow-500/15 bg-yellow-500/5',
              },
              {
                id: 'luckyspin',
                label: 'Lucky Spin',
                icon: Compass,
                color: 'text-fuchsia-400 border-fuchsia-500/15 bg-fuchsia-500/5',
              },
              {
                id: 'network',
                label: 'Network',
                icon: Network,
                color: 'text-amber-500 border-amber-500/15 bg-amber-500/5',
              },
            ].map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => setCurrentTab(menu.id)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/45 border border-amber-500/10 hover:border-amber-500/30 active:scale-95 transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-1 transition-colors ${menu.color} group-hover:scale-110`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-black text-slate-200 group-hover:text-amber-400 transition-colors leading-tight font-orbitron">
                    {menu.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SLEEK & SIMPLE PORTFOLIO CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2a1b08] via-[#120a24] to-[#05030e] border border-amber-500/40 rounded-3xl p-4 shadow-[0_0_25px_rgba(245,158,11,0.12)] transition duration-300">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-3.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-widest uppercase font-orbitron">
              {language === 'id' ? 'PORTOFOLIO SAYA' : 'MY PORTFOLIO'}
            </span>
          </div>
          <span className={`text-[7.5px] font-black uppercase px-2 py-0.5 rounded-md ${
            state.activeContracts > 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {state.activeContracts > 0 
              ? (language === 'id' ? 'AKTIF' : 'ACTIVE') 
              : (language === 'id' ? 'NONAKTIF' : 'INACTIVE')}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 relative z-10 text-left">
          {/* Nilai Kontrak Aktif */}
          <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
            <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
              {language === 'id' ? 'NILAI KONTRAK AKTIF' : 'ACTIVE PORTFOLIO'}
            </span>
            <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
              Rp {totalPortfolioValue.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Jumlah Kontrak */}
          <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
            <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
              {language === 'id' ? 'JUMLAH KONTRAK' : 'TOTAL UNITS'}
            </span>
            <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
              {state.activeContracts} UNIT
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
            <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
              {language === 'id' ? 'TOTAL PROFIT' : 'TOTAL PROFIT'}
            </span>
            <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
              Rp {(state.totalProfit || 0).toLocaleString('id-ID')}
            </div>
          </div>

          {/* Batas Plafon */}
          <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
            <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
              {language === 'id' ? 'BATAS PLAFON' : 'MAX LIMIT'}
            </span>
            <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
              Rp {maxPossibleEarnings.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Simple alert message if zero contracts */}
        {state.activeContracts === 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-[#1e1303] via-[#0b071a] to-[#1e1303] border border-amber-500/25 rounded-2xl flex items-center justify-between gap-3 relative z-10 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <span className="text-[8px] font-bold text-white text-left leading-relaxed font-orbitron tracking-wider">
              {language === 'id' 
                ? 'Mulai beli kontrak emas untuk mengaktifkan portfolio.' 
                : 'Purchase gold contract to activate portfolio.'}
            </span>
            <button
              onClick={() => setCurrentTab('contract')}
              className="text-[8px] font-black text-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer shrink-0 font-orbitron"
            >
              {language === 'id' ? 'Beli Kontrak' : 'Buy Contract'}
            </button>
          </div>
        )}
      </div>

      {/* CAPPING PROGRESS PANEL */}
      <div className="bg-[#0b051a] border border-purple-500/10 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">
              {t.cappingProgress}
            </div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
              {t.maxEarnings} (250% Max)
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase ${
            isCappedLimitMet
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : cappingRatio > 80
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {isCappedLimitMet ? 'CAPPED' : 'IN PROGRESS'}
          </div>
        </div>

        {/* Circular meter layout & stats detail split */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            {/* Conic progress meter wrapper */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
              style={{
                background: `conic-gradient(var(--color-gold-primary) ${cappingRatio}%, rgba(255,255,255,0.03) ${cappingRatio}%)`,
              }}
            />
            <div className="absolute inset-1 bg-[#0b051a] rounded-full border border-purple-950/20" />
            <div className="relative z-10 text-center">
              <div className="text-xl font-black text-yellow-400 font-orbitron leading-none">
                {Math.round(cappingRatio)}%
              </div>
              <span className="text-[7px] text-slate-400 font-bold block mt-1">OF 250%</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 text-xs font-semibold text-left">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-400 text-[10px]">{language === 'id' ? 'Penghasilan Capping' : 'Capping Earnings'}</span>
              <span className="text-white font-bold">Rp {cappingEarnings.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-400 text-[10px]">{t.maxEarnings}</span>
              <span className="text-white font-bold">Rp {maxPossibleEarnings.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px]">{t.remaining}</span>
              <span className="text-amber-500 font-bold">
                Rp {remainingCapping.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Footer */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-2">
            <span>Rp {cappingEarnings.toLocaleString('id-ID')}</span>
            <span>Rp {maxPossibleEarnings.toLocaleString('id-ID')}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 via-gold-primary to-yellow-300"
              style={{ width: `${cappingRatio}%` }}
            />
          </div>

          {/* Yield Claim Action */}
          <button
            onClick={() => {
              if (setHarvestModalOpen) {
                setHarvestModalOpen(true);
              } else {
                claimDailyReward();
              }
            }}
            disabled={claimCooldownText !== '' || state.activeContracts === 0 || isCappedLimitMet}
            className={`w-full py-3 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-2 mt-4 cursor-pointer ${
              claimCooldownText !== ''
                ? 'bg-slate-900 border border-white/5 text-slate-400 cursor-not-allowed'
                : isCappedLimitMet
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 hover:brightness-110 shadow-lg shadow-gold-primary/25 text-black'
            }`}
          >
            {claimCooldownText !== '' ? (
              <>
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{language === 'id' ? `Klaim dalam ${claimCooldownText}` : `Claim in ${claimCooldownText}`}</span>
              </>
            ) : isCappedLimitMet ? (
              <span>CAPPING SELESAI</span>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                <span>{t.claimReward} ({(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
