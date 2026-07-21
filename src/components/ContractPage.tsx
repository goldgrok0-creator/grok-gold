import React from 'react';
import { motion } from 'motion/react';
import { Coins, Minus, Plus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { AppState, CONFIG } from '../types';

interface ContractPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  t: any;
  state: AppState;
  contractQty: number;
  adjustContractQty: (amount: number) => void;
  handlePurchaseContract: () => void;
}

export const ContractPage: React.FC<ContractPageProps> = ({
  language,
  setCurrentTab,
  t,
  state,
  contractQty,
  adjustContractQty,
  handlePurchaseContract,
}) => {
  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
        <ChevronLeft
          className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition"
          onClick={() => setCurrentTab('home')}
        />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">
          {t.contractStore}
        </h2>
      </div>

      <div className="bg-gradient-to-tr from-[#251b10] to-[#120a26] border border-gold-primary/30 rounded-2xl p-4 flex justify-between items-center shadow-lg mt-2">
        <div className="text-left">
          <div className="text-[9px] font-extrabold text-gold-primary uppercase tracking-widest mb-1">
            {t.availableBalance}
          </div>
          <div className="text-lg font-black text-white font-sans tracking-wide">
            Rp {state.mainBalance.toLocaleString('id-ID')}
          </div>
        </div>
        <button
          onClick={() => setCurrentTab('deposit')}
          className="px-3.5 py-2 bg-gradient-to-r from-yellow-300 to-gold-primary text-black font-extrabold rounded-xl text-[10px] tracking-wide transition cursor-pointer hover:brightness-110 active:scale-95"
        >
          + TOP UP
        </button>
      </div>

      {/* Stock Contract Specs Product Card */}
      <div className="bg-gradient-to-b from-[#140b28] via-[#0d071d] to-[#07030e] border border-gold-primary/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(234,179,8,0.08)] relative overflow-hidden flex flex-col gap-5 mt-1">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Judul & deskripsi */}
        <div className="border-b border-white/5 pb-3 text-left">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400 shrink-0" />
            <div className="text-sm font-black text-gradient-gold uppercase tracking-wider font-sans">
              {t.stockContract}
            </div>
          </div>
          <div className="pl-7 mt-1">
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              {t.contractDesc}
            </p>
          </div>
        </div>

        {/* 2. Harga Unit, Hasil Harian, Capping Limit */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#0c061e] border border-gold-primary/10 rounded-lg p-2 flex flex-col justify-center min-h-[60px]">
            <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-1">
              {language === 'id' ? 'HARGA UNIT' : 'UNIT PRICE'}
            </span>
            <span className="text-[11px] font-black text-white">
              Rp {CONFIG.PRICE_PER_UNIT.toLocaleString('id-ID')}
            </span>
            <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">
              {t.perUnit}
            </span>
          </div>
          <div className="bg-[#0c061e] border border-purple-500/10 rounded-lg p-2 flex flex-col justify-center min-h-[60px]">
            <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-1">
              {language === 'id' ? 'HASIL HARIAN' : 'DAILY YIELD'}
            </span>
            <span className="text-[11px] font-black text-emerald-400">
              +{(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%
            </span>
            <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">
              Rp {(CONFIG.PRICE_PER_UNIT * CONFIG.DAILY_REWARD_PERCENT).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#0c061e] border border-purple-500/10 rounded-lg p-2 flex flex-col justify-center min-h-[60px]">
            <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-1">
              CAPPING LIMIT
            </span>
            <span className="text-[11px] font-black text-purple-300">
              {(CONFIG.CAPPING_PERCENT * 100).toFixed(0)}%
            </span>
            <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">
              Rp {(CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* 3. Informasi hasil tambang harian */}
        <p className="text-[10px] text-slate-300 leading-relaxed font-medium text-center bg-purple-950/25 border border-purple-900/20 rounded-xl py-2 px-3">
          ✨ {language === 'id' ? 'Hasil tambang harian otomatis dikreditkan langsung ke saldo akun Anda.' : 'Daily mining yields are automatically credited directly to your account balance.'}
        </p>

        {/* 4. Jumlah Pembelian (+ / -) */}
        <div className="flex justify-between items-center bg-[#0d071d] border border-white/5 rounded-xl p-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'id' ? 'JUMLAH PEMBELIAN' : 'PURCHASE QUANTITY'}
            </span>
            <span className="text-[9px] text-slate-500 font-semibold">
              {language === 'id' ? 'Tentukan unit kontrak' : 'Specify contract units'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustContractQty(-1)}
              className="w-8 h-8 rounded-lg bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-white hover:bg-purple-900/40 active:scale-95 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-white w-6 text-center">{contractQty}</span>
            <button
              onClick={() => adjustContractQty(1)}
              className="w-8 h-8 rounded-lg bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-white hover:bg-purple-900/40 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5. Total Pembayaran */}
        <div className="flex justify-between items-center bg-[#0d071d] border border-white/5 rounded-xl p-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'id' ? 'TOTAL PEMBAYARAN' : 'TOTAL PAYMENT'}
            </span>
            <span className="text-[9px] text-slate-500 font-semibold">
              {language === 'id' ? 'Saldo akan terpotong otomatis' : 'Balance will be deducted automatically'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-yellow-500 font-sans">
              Rp {(contractQty * CONFIG.PRICE_PER_UNIT).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* 6. Tombol "Beli Sekarang" */}
        <button
          onClick={handlePurchaseContract}
          className="w-full py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-black rounded-xl text-xs tracking-widest uppercase transition shadow-md shadow-gold-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          {t.buyNow}
        </button>
      </div>
    </div>
  );
};

export default ContractPage;
