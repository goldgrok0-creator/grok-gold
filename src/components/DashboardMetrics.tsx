import React from 'react';
import { Coins, Clock as ClockIcon } from 'lucide-react';
import { CONFIG } from '../types';

interface PortfolioMetricsDisplayProps {
  activeContracts: number;
  totalPortfolioValue: number;
  dailyYield: number;
  maxPossibleEarnings: number;
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
}

export const PortfolioMetricsDisplay: React.FC<PortfolioMetricsDisplayProps> = React.memo(({
  activeContracts,
  totalPortfolioValue,
  dailyYield,
  maxPossibleEarnings,
  language,
  setCurrentTab,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#12082b] via-[#09041a] to-[#04010e] border border-amber-500/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
      {/* Decorative Orbs */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-widest uppercase font-orbitron">
            {language === 'id' ? 'PORTOFOLIO SAYA' : 'MY PORTFOLIO'}
          </span>
        </div>
        <span className={`text-[7.5px] font-black uppercase px-2 py-0.5 rounded-md ${
          activeContracts > 0
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {activeContracts > 0 
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
            {activeContracts} UNIT
          </div>
        </div>

        {/* Estimasi Profit Harian */}
        <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
          <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
            {language === 'id' ? 'ESTIMASI PROFIT HARIAN' : 'EST. DAILY PROFIT'}
          </span>
          <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
            Rp {dailyYield.toLocaleString('id-ID')}
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
      {activeContracts === 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-[#1e1303] via-[#0b071a] to-[#1e1303] border border-amber-500/25 rounded-2xl flex items-center justify-between gap-3 relative z-10 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <span className="text-[8px] font-bold text-white text-left leading-relaxed font-orbitron tracking-wider">
            {language === 'id' 
              ? 'Mulai beli kontrak emas untuk mengaktifkan portfolio.' 
              : 'Purchase gold contract to activate portfolio.'}
          </span>
          <button
            type="button"
            onClick={() => setCurrentTab('contract')}
            className="text-[8px] font-black text-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer shrink-0 font-orbitron"
          >
            {language === 'id' ? 'Beli Kontrak' : 'Buy Contract'}
          </button>
        </div>
      )}
    </div>
  );
});

interface CappingProgressPanelDisplayProps {
  t: any;
  language: 'id' | 'en';
  isCappedLimitMet: boolean;
  cappingRatio: number;
  cappingPercentStr: string;
  cappingEarnings: number;
  maxPossibleEarnings: number;
  cappingRatioVisual: number;
  claimCooldownText: string;
  setHarvestModalOpen: (open: boolean) => void;
}

export const CappingProgressPanelDisplay: React.FC<CappingProgressPanelDisplayProps> = React.memo(({
  t,
  language,
  isCappedLimitMet,
  cappingRatio,
  cappingPercentStr,
  cappingEarnings,
  maxPossibleEarnings,
  cappingRatioVisual,
  claimCooldownText,
  setHarvestModalOpen,
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const currentPercent = cappingRatio > 0 ? Math.max(0.8, cappingRatio) : 0;
  const dashoffset = circumference - (currentPercent / 100) * circumference;

  return (
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
          {/* SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 96 96">
            <defs>
              <linearGradient id="capping-gold-grad" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD54A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Background Ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#1f1b2e"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress Ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="url(#capping-gold-grad)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>
          <div className="relative z-10 text-center">
            <div className="text-xl font-black text-yellow-400 font-orbitron leading-none">
              {cappingPercentStr}%
            </div>
            <span className="text-[7px] text-slate-400 font-bold block mt-1">OF 250%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5 text-xs font-semibold">
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
              Rp {Math.max(0, maxPossibleEarnings - cappingEarnings).toLocaleString('id-ID')}
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
            style={{ width: `${cappingRatioVisual}%` }}
          />
        </div>

        {/* Yield Claim Action */}
        <button
          type="button"
          onClick={() => setHarvestModalOpen(true)}
          className={`w-full py-3 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-2 mt-4 cursor-pointer ${
            claimCooldownText !== ''
              ? 'bg-slate-900 border border-white/5 text-slate-400'
              : isCappedLimitMet
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
              : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 hover:brightness-110 shadow-lg shadow-gold-primary/25 text-black'
          }`}
        >
          {claimCooldownText !== '' ? (
            <>
              <ClockIcon className="w-4 h-4 animate-pulse" />
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
  );
});
