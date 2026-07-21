import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Coins, Minus, Plus, ShoppingCart 
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useContract } from '../hooks/useContract';
import { CONFIG } from '../types';
import { TRANSLATIONS } from '../translations';

const ContractPage: React.FC = () => {
  const {
    state,
    language,
    setCurrentTab
  } = useAppState();

  const {
    purchaseContract,
    isLoading
  } = useContract();

  const [contractQty, setContractQty] = useState(1);
  const t = TRANSLATIONS[language];

  const adjustContractQty = (amount: number) => {
    setContractQty(prev => {
      const next = prev + amount;
      return next < 1 ? 1 : next;
    });
  };

  const handlePurchase = async () => {
    const success = await purchaseContract(contractQty);
    if (success) {
      setContractQty(1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col justify-between overflow-hidden text-left"
    >
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 shrink-0">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-xs font-black tracking-widest text-white uppercase">{t.contractStore}</h2>
      </div>

      <div className="bg-gradient-to-tr from-[#251b10] to-[#120a26] border border-gold-primary/30 rounded-xl p-2.5 flex justify-between items-center shadow-lg shrink-0 mt-2">
        <div className="text-left">
          <div className="text-[9px] font-extrabold text-gold-primary uppercase tracking-widest mb-0.5">
            {t.availableBalance}
          </div>
          <div className="text-lg font-black text-white font-sans tracking-wide">
            Rp {state.mainBalance.toLocaleString('id-ID')}
          </div>
        </div>
        <button
          onClick={() => setCurrentTab('deposit')}
          className="px-3 py-1.5 bg-gradient-to-r from-yellow-300 to-gold-primary text-black font-extrabold rounded-lg text-[10px] tracking-wide transition cursor-pointer hover:brightness-110"
        >
          + TOP UP
        </button>
      </div>

      {/* Stock Contract Specs Product Card */}
      <div className="flex-1 bg-gradient-to-b from-[#140b28] via-[#0d071d] to-[#07030e] border border-gold-primary/20 rounded-xl p-3.5 shadow-[0_0_20px_rgba(234,179,8,0.08)] relative overflow-hidden flex flex-col justify-between mt-2.5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="border-b border-white/5 pb-2 mb-2 text-left shrink-0">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400 shrink-0" />
            <div className="text-xs font-black text-gradient-gold uppercase tracking-wider font-sans">
              {t.stockContract}
            </div>
          </div>
          <div className="pl-5.5 mt-0.5">
            <p className="text-[10px] text-slate-400 leading-normal font-semibold">
              {t.contractDesc}
            </p>
          </div>
        </div>

        {/* 3-Column Metrics Grid */}
        <div className="grid grid-cols-3 gap-1.5 text-center mb-2 shrink-0">
          <div className="bg-[#0c061e] border border-gold-primary/10 rounded-lg p-2 flex flex-col justify-center">
            <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-0.5">{language === 'id' ? 'HARGA UNIT' : 'UNIT PRICE'}</span>
            <span className="text-[11px] font-black text-white">Rp {CONFIG.PRICE_PER_UNIT.toLocaleString('id-ID')}</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase">{t.perUnit}</span>
          </div>
          <div className="bg-[#0c061e] border border-purple-500/10 rounded-lg p-2 flex flex-col justify-center">
            <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-0.5">{language === 'id' ? 'HASIL HARIAN' : 'DAILY YIELD'}</span>
            <span className="text-[11px] font-black text-emerald-400">+{(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase">Rp {(CONFIG.PRICE_PER_UNIT * CONFIG.DAILY_REWARD_PERCENT).toLocaleString('id-ID')}</span>
          </div>
          <div className="bg-[#0c061e] border border-purple-500/10 rounded-lg p-2 flex flex-col justify-center">
            <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-0.5">CAPPING LIMIT</span>
            <span className="text-[11px] font-black text-purple-300">{(CONFIG.CAPPING_PERCENT * 100).toFixed(0)}%</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase">Rp {(CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 leading-normal font-medium text-center bg-purple-950/20 border border-purple-900/10 rounded-lg py-1.5 px-2 mb-2 shrink-0">
          ✨ {language === 'id' ? 'Hasil tambang harian otomatis dikreditkan langsung ke saldo akun Anda.' : 'Daily mining yields are automatically credited directly to your account balance.'}
        </p>

        {/* Quantity selectors & buy button */}
        <div className="mt-auto pt-2 border-t border-white/5 space-y-2.5 shrink-0">
          <div className="flex justify-between items-center bg-black/45 border border-white/5 rounded-lg p-2">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{t.qty}</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => adjustContractQty(-1)}
                  className="w-7 h-7 rounded-lg bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-white hover:bg-purple-900/40 transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black text-white w-5 text-center font-mono">{contractQty}</span>
                <button
                  type="button"
                  onClick={() => adjustContractQty(1)}
                  className="w-7 h-7 rounded-lg bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-white hover:bg-purple-900/40 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{t.totalPayment}</span>
              <span className="text-sm font-black text-yellow-500 block mt-0.5 font-mono">
                Rp {(contractQty * CONFIG.PRICE_PER_UNIT).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-black rounded-xl text-xs tracking-widest uppercase transition shadow-md shadow-gold-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            {isLoading ? 'Processing...' : t.buyNow}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ContractPage;
