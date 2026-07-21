import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp, Coins, History, Gift } from 'lucide-react';
import { AppState } from '../types';

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

      {/* Earnings detail */}
      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl">
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase">
          {t.earningsDetail}
        </div>

        <div className="space-y-3 font-semibold text-xs text-slate-300">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">📊 {t.totalEarned}</span>
            <span className="text-white font-extrabold">Rp {totalEarned.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">⛏️ {language === 'id' ? 'Profit Mining (Claim 2%)' : 'Mining Profit (2% Claim)'}</span>
            <span className="text-emerald-400 font-extrabold">Rp {miningProfit.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">👥 Referral Reward</span>
            <span className="text-amber-400 font-extrabold">Rp {referralReward.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">🔄 Rebate Reward</span>
            <span className="text-fuchsia-400 font-extrabold">Rp {rebateReward.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">🎁 Bonus</span>
            <span className="text-blue-400 font-extrabold">Rp {bonusReward.toLocaleString('id-ID')}</span>
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
