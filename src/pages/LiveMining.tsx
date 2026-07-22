import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Cpu, Coins, Key, Server, Cpu as ChipIcon, RefreshCw, Star, Play
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useContract } from '../hooks/useContract';
import { CONFIG } from '../types';
import { calculateCappingEarnings } from '../utils/capping';
import { TRANSLATIONS } from '../translations';

const GoldMarketChart = lazy(() => import('../components/GoldMarketChart'));

interface LiveMiningPageProps {
  setHarvestModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isCappedLimitMet?: boolean;
}

const LiveMiningPage: React.FC<LiveMiningPageProps> = ({
  setHarvestModalOpen,
  isCappedLimitMet
}) => {
  const {
    state,
    language,
    setCurrentTab,
    updateState,
    triggerModal,
    boostTimeLeft,
    setBoostTimeLeft
  } = useAppState();

  const {
    claimDailyReward,
    claimWelcomeBonus,
    networkActiveCount,
    canClaimWelcomeBonus,
    isLoading: isContractLoading
  } = useContract();

  const cappingMetrics = calculateCappingEarnings(state);
  const {
    totalModalAktif: totalPortfolioValue,
    maxPossibleEarnings,
    cappingEarnings,
    remainingCapping,
    cappingRatio,
    cappingPercentStr,
    isCapped: cappingIsCapped
  } = cappingMetrics;

  const dailyYield = totalPortfolioValue * CONFIG.DAILY_REWARD_PERCENT;
  const resolvedIsCappedLimitMet = isCappedLimitMet !== undefined 
    ? isCappedLimitMet 
    : cappingIsCapped;

  const t = TRANSLATIONS[language];

  const [showBoosterRipple, setShowBoosterRipple] = useState(false);

  // Calculate booster cooldown based on state.lastBoostTime
  const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
  const nowTime = Date.now();
  const boosterCooldownActive = !!(state.lastBoostTime && (nowTime - state.lastBoostTime < cooldownPeriod));

  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (state.lastBoostTime) {
      const elapsed = Date.now() - state.lastBoostTime;
      if (elapsed < cooldownPeriod) {
        setCooldownTimeLeft(cooldownPeriod - elapsed);
      } else {
        setCooldownTimeLeft(0);
      }
    }
  }, [state.lastBoostTime, nowTime]);

  // Tick the cooldown clock
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTimeLeft > 0) {
      timer = setInterval(() => {
        setCooldownTimeLeft(prev => {
          if (prev <= 1000) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTimeLeft]);

  // Formatted booster cooldown string
  const boosterCooldownStr = (() => {
    if (cooldownTimeLeft <= 0) return '00:00:00';
    const hours = Math.floor(cooldownTimeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((cooldownTimeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((cooldownTimeLeft % (60 * 1000)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  })();

  const handleTapBooster = () => {
    if (state.activeContracts === 0) {
      triggerModal(
        language === 'id' 
          ? '🔒 Anda tidak memiliki Kontrak Aktif. Silakan beli kontrak tambang terlebih dahulu untuk mengaktifkan Turbo Booster!' 
          : '🔒 You have no active contracts. Please buy mining contracts first to utilize the Turbo Booster!', 
        'warning'
      );
      return;
    }

    if (booldownActive()) {
      const remainingMs = cooldownTimeLeft;
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
      
      triggerModal(
        language === 'id'
          ? `⏳ Turbo Booster sedang dalam masa pemulihan (cooldown).\n\nAnda dapat mengaktifkannya kembali dalam:\n<b>${hours} jam, ${minutes} menit, ${seconds} detik</b>.`
          : `⏳ Turbo Booster is on cooldown.\n\nYou can reactivate it in:\n<b>${hours} hours, ${minutes} minutes, ${seconds} seconds</b>.`,
        'warning'
      );
      return;
    }
    
    // Trigger visual ripple feedback
    setShowBoosterRipple(true);
    setTimeout(() => setShowBoosterRipple(false), 500);

    // Set boost countdown to 15 seconds
    setBoostTimeLeft(15);

    // Save activation timestamp and sync instantly
    const triggerNow = Date.now();
    updateState({ lastBoostTime: triggerNow }, true);
    setCooldownTimeLeft(cooldownPeriod);

    // Visual toast notification on first activation
    if (boostTimeLeft === 0) {
      triggerModal(
        language === 'id'
          ? '⚡ EXC-700 TURBO BOOST AKTIF!\n\nKecepatan siklus cloud hashing meningkat +50% selama 15 detik ke depan!'
          : '⚡ EXC-700 TURBO BOOST ENGAGED!\n\nCloud hashing cycle step velocity accelerated by +50% for the next 15 seconds!',
        'success'
      );
    }
  };

  const booldownActive = () => {
    if (!state.lastBoostTime) return false;
    return (Date.now() - state.lastBoostTime) < cooldownPeriod;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 text-left"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-400 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">
          {language === 'id' ? 'LIVE MINING TERMINAL' : 'LIVE MINING TERMINAL'}
        </h2>
      </div>

      {/* LIVE GOLD SPOT MARKET CHART */}
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">Loading Chart...</div>}>
        <GoldMarketChart language={language} />
      </Suspense>

      {/* LIVE MINING CONTAINER */}
      <div id="liveMiningContainer" className="bg-[#0b051a] border border-purple-500/10 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Cpu className={`w-3.5 h-3.5 ${state.activeContracts > 0 ? 'text-emerald-400 animate-spin' : 'text-rose-500'}`} />
              {state.activeContracts > 0 ? t.miningSystemActive : t.miningSystemInactive}
            </div>
            <div className="text-lg font-black text-amber-400 font-orbitron mt-1">
              {state.goldProduction.toFixed(4)} oz
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{t.goldProdToday}</div>
          </div>

          <div className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase flex items-center gap-1.5 ${
            state.activeContracts > 0
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state.activeContracts > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            {state.activeContracts > 0 ? 'RUNNING' : 'INACTIVE'}
          </div>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-2xl p-3 mb-4 flex justify-between text-center">
          <div>
            <span className="text-[8px] text-slate-400 font-bold block mb-0.5">{t.efficiency}</span>
            <span className="text-xs font-black text-white">{state.activeContracts > 0 ? '100%' : '0%'}</span>
          </div>
          <div className="w-[1px] bg-white/5" />
          <div>
            <span className="text-[8px] text-slate-400 font-bold block mb-0.5">{t.fleetActive}</span>
            <span className="text-xs font-black text-white">{state.activeContracts} Unit</span>
          </div>
          <div className="w-[1px] bg-white/5" />
          <div>
            <span className="text-[8px] text-slate-400 font-bold block mb-0.5">CYCLE STEP</span>
            <span className="text-xs font-black text-purple-400">{Math.round(state.cyclePercent)}%</span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-900 border border-purple-900/15 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 via-gold-primary to-yellow-300 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            style={{ width: `${state.cyclePercent}%` }}
          />
        </div>




        {/* EXC-700 CLOUD EXCAVATOR BOOSTER PANEL */}
        <div className="bg-black/25 border border-purple-950/40 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3.5 relative overflow-hidden">
          {/* Central Interactive Gear */}
          <div className="relative flex items-center justify-center w-14 h-14 shrink-0 cursor-pointer group" onClick={handleTapBooster}>
            {/* Hashing Energy Halo */}
            <div className={`absolute inset-0 rounded-full border border-dashed ${
              boostTimeLeft > 0 
                ? 'border-yellow-400 animate-spin' 
                : booldownActive() 
                  ? 'border-amber-500/40 animate-spin' 
                  : 'border-purple-500/30'
            } transition-all`} style={{ animationDuration: boostTimeLeft > 0 ? '3s' : booldownActive() ? '30s' : '15s' }} />
            
            {/* Haptic Core Button */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              boostTimeLeft > 0 
                ? 'bg-gradient-to-tr from-yellow-300 to-yellow-600 text-black shadow-[0_0_12px_rgba(250,204,21,0.55)] scale-105' 
                : booldownActive() 
                  ? 'bg-amber-950/40 border border-amber-500/20 text-amber-500/60'
                  : 'bg-purple-950/55 border border-purple-500/20 text-gold-primary hover:bg-purple-900/40 group-hover:scale-105'
            }`}>
              <Cpu className={`w-4.5 h-4.5 ${boostTimeLeft > 0 ? 'animate-pulse text-black' : ''}`} />
            </div>

            {/* Interactive Click/Tap Ripple Effect */}
            <AnimatePresence>
              {showBoosterRipple && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute w-12 h-12 rounded-full border-2 border-gold-primary pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 text-left min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-white uppercase tracking-wider truncate font-sans">
                EXC-700 TURBO ACCELERATOR
              </span>
              {boostTimeLeft > 0 ? (
                <span className="text-[8px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wide animate-pulse font-sans">
                  +50% HASH SPEED
                </span>
              ) : booldownActive() ? (
                <span className="text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase tracking-wide font-sans">
                  COOLDOWN
                </span>
              ) : null}
            </div>
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed font-sans">
              {language === 'id' ? 'Ketuk roda gigi untuk memicu putaran cepat kompresor hashing 15 detik.' : 'Tap the active core gears to accelerate cloud hashing compressor speeds for 15 seconds.'}
            </p>
            
            {/* Boost Dynamic Progress bar */}
            {boostTimeLeft > 0 ? (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[8px] text-yellow-400 font-black font-sans">
                  <span>ACTIVE HARVEST SPEEDUP</span>
                  <span>{boostTimeLeft} DETIK</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all duration-1000 ease-linear" style={{ width: `${(boostTimeLeft / 15) * 100}%` }} />
                </div>
              </div>
            ) : booldownActive() ? (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleTapBooster}
                  className="w-full px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg text-[8.5px] font-black uppercase transition tracking-wider flex items-center justify-between cursor-pointer"
                >
                  <span className="font-sans">{language === 'id' ? 'COOLDOWN AKTIF' : 'COOLDOWN ACTIVE'}</span>
                  <span className="font-mono text-[9px] bg-amber-500/20 px-1.5 rounded font-bold">{boosterCooldownStr}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTapBooster}
                className="mt-2 px-2.5 py-1 bg-gold-primary/10 hover:bg-gold-primary/20 border border-gold-primary/20 text-gold-primary rounded-lg text-[8.5px] font-black uppercase transition tracking-wider cursor-pointer font-sans"
              >
                {language === 'id' ? 'AKTIFKAN TURBO BOOST' : 'ENGAGE TURBO BOOST'}
              </button>
            )}
          </div>
        </div>

        {/* Operational Mines banner */}
        <div className="bg-black/20 border border-purple-950/20 rounded-2xl p-3.5">
          <div className="text-[9px] font-extrabold text-gold-primary tracking-widest text-center uppercase mb-2.5 font-sans">
            {t.operationalSites}
          </div>
          <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-center">
            {['🇿🇦 S. Africa', '🇬🇭 Ghana', '🇲🇱 Mali', '🇹🇿 Tanzania'].map((site) => (
              <div key={site} className="py-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-slate-300 font-sans">
                {site}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveMiningPage;
