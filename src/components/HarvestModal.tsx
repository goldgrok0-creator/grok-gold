import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, XCircle, Cpu } from 'lucide-react';
import { CONFIG } from '../types';

// Simple internal helper icon to bypass legacy styles safely
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface HarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
  activeContracts: number;
  totalPortfolioValue: number;
  dailyYield: number;
  todayProfit: number;
  totalProfit: number;
  claimCooldownText: string;
  onClaimYield: () => void;
  onViewMining?: () => void;
}

export const HarvestModal: React.FC<HarvestModalProps> = ({
  isOpen,
  onClose,
  language,
  activeContracts,
  totalPortfolioValue,
  dailyYield,
  todayProfit,
  totalProfit,
  claimCooldownText,
  onClaimYield,
  onViewMining,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-sm bg-[#120a26] border border-emerald-500/35 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2 font-orbitron">
                <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />
                {language === 'id' ? 'KLAIM REWARD HARIAN' : 'CLAIM DAILY REWARD'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-1">
              {activeContracts === 0 ? (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center space-y-2">
                  <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
                  <p className="text-xs font-bold text-rose-400">
                    {language === 'id'
                      ? 'Tidak ada kontrak aktif. Beli unit kontrak untuk mulai mendapatkan reward.'
                      : 'No active contract. Purchase a contract to start earning rewards.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-slate-400 font-extrabold block uppercase mb-1 tracking-wider">
                      {language === 'id' ? 'NILAI KONTRAK AKTIF' : 'ACTIVE CONTRACT VALUE'}
                    </span>
                    <div className="text-2xl font-black text-white font-orbitron">
                      Rp {totalPortfolioValue.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold block mt-1.5">
                      {language === 'id' 
                        ? `Daily Reward (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%): Rp ${dailyYield.toLocaleString('id-ID')}`
                        : `Daily Reward (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%): Rp ${dailyYield.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-center text-[10px] font-bold">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-0.5">
                      <span className="text-slate-400 block uppercase tracking-wider text-[9px]">
                        {language === 'id' ? 'PROFIT HARI INI' : "TODAY'S PROFIT"}
                      </span>
                      <div className="text-emerald-400 font-mono text-xs font-black flex items-center justify-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{((todayProfit || 0) / CONFIG.PRICE_PER_UNIT).toFixed(4)} GOLD</span>
                      </div>
                      <span className="text-slate-400 text-[9.5px] block font-mono">
                        ≈ Rp {(todayProfit || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-0.5">
                      <span className="text-slate-400 block uppercase tracking-wider text-[9px]">
                        {language === 'id' ? 'TOTAL PROFIT' : 'TOTAL PROFIT'}
                      </span>
                      <div className="text-amber-400 font-mono text-xs font-black flex items-center justify-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{((totalProfit || 0) / CONFIG.PRICE_PER_UNIT).toFixed(4)} GOLD</span>
                      </div>
                      <span className="text-slate-400 text-[9.5px] block font-mono">
                        ≈ Rp {(totalProfit || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {claimCooldownText !== '' && (
                    <p className="text-[9.5px] text-amber-400 font-bold text-center bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                      {language === 'id' 
                        ? "Klaim berhasil hari ini. Kembali lagi setelah hitung mundur selesai."
                        : "You have already claimed today's reward. Please come back after the countdown ends."}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === 'id' ? 'Kembali' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClaimYield();
                    if (claimCooldownText === '' && activeContracts > 0) {
                      onClose();
                    }
                  }}
                  disabled={activeContracts === 0}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeContracts === 0
                      ? 'bg-slate-950 border border-white/5 text-slate-500 cursor-not-allowed'
                      : claimCooldownText !== ''
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-extrabold hover:brightness-110 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {claimCooldownText !== '' ? (
                    <>
                      <ClockIcon className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                      <span className="text-[10px] text-amber-400 font-mono font-bold">{claimCooldownText}</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 text-black" />
                      <span>{language === 'id' ? 'KLAIM' : 'CLAIM'}</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onViewMining) onViewMining();
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600/20 via-emerald-500/30 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-500/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/50"
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>VIEW MINING</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
