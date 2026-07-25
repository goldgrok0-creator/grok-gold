import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, XCircle } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
  withdrawBank: string;
  setWithdrawBank: (bank: string) => void;
  withdrawAccount: string;
  setWithdrawAccount: (account: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  rewardBalance: number;
  executeWithdrawal: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  language,
  withdrawBank,
  setWithdrawBank,
  withdrawAccount,
  setWithdrawAccount,
  withdrawAmount,
  setWithdrawAmount,
  rewardBalance,
  executeWithdrawal,
}) => {
  const formatWithdrawAmount = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean) {
      setWithdrawAmount(parseInt(clean).toLocaleString('id-ID'));
    } else {
      setWithdrawAmount('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-sm bg-[#110724] border border-gold-primary/30 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-rose-500" />
                {language === 'id' ? 'Form Penarikan Saldo' : 'Withdrawal Form'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              {/* Bank Select */}
              <div>
                <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">
                  {language === 'id' ? 'Pilih Bank Tujuan' : 'Select Destination Bank'}
                </label>
                <select
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                >
                  {['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'DANA', 'OVO', 'Gopay'].map((b) => (
                    <option key={b} value={b} className="bg-[#110724] text-white font-semibold">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">
                  {language === 'id' ? 'Nomor Rekening / No. E-Wallet' : 'Account / E-Wallet Number'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'id' ? 'Masukkan No Rekening...' : 'Enter Account Number...'}
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary font-mono"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-gold-primary text-[10px] block mb-1.5 uppercase flex justify-between">
                  <span>{language === 'id' ? 'Nominal Penarikan (Rp)' : 'Withdrawal Amount (Rp)'}</span>
                  <span className="text-slate-400 font-semibold text-[9px]">
                    {language === 'id' ? 'Saldo Reward:' : 'Reward Balance:'} Rp {(rewardBalance ?? 0).toLocaleString('id-ID')}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-black">Rp</span>
                  <input
                    type="text"
                    placeholder="Min Rp 100.000"
                    value={withdrawAmount}
                    onChange={(e) => formatWithdrawAmount(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/30 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeWithdrawal}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-gold-primary/25"
              >
                {language === 'id' ? 'Tarik Saldo' : 'Withdraw Balance'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
