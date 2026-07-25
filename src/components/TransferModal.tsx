import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightLeft, XCircle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
  transferRecipient: string;
  setTransferRecipient: (recipient: string) => void;
  transferAmount: string;
  setTransferAmount: (amount: string) => void;
  rewardBalance: number;
  executeTransfer: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  language,
  transferRecipient,
  setTransferRecipient,
  transferAmount,
  setTransferAmount,
  rewardBalance,
  executeTransfer,
}) => {
  const formatTransferAmount = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean) {
      setTransferAmount(parseInt(clean).toLocaleString('id-ID'));
    } else {
      setTransferAmount('');
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
                <ArrowRightLeft className="w-5 h-5 text-blue-400 animate-pulse" />
                {language === 'id' ? 'Form Transfer Saldo' : 'Transfer Balance Form'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              {/* Recipient User ID */}
              <div>
                <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">
                  {language === 'id' ? 'ID atau Username Penerima' : 'Recipient ID or Username'}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: GGM-USER1024"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary font-mono uppercase"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-gold-primary text-[10px] block mb-1.5 uppercase flex justify-between">
                  <span>{language === 'id' ? 'Nominal Transfer (Rp)' : 'Transfer Amount (Rp)'}</span>
                  <span className="text-slate-400 font-semibold text-[9px]">
                    {language === 'id' ? 'Saldo Reward:' : 'Reward Balance:'} Rp {(rewardBalance ?? 0).toLocaleString('id-ID')}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-black">Rp</span>
                  <input
                    type="text"
                    placeholder="Min Rp 10.000"
                    value={transferAmount}
                    onChange={(e) => formatTransferAmount(e.target.value)}
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
                onClick={executeTransfer}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-gold-primary/25"
              >
                {language === 'id' ? 'Kirim Transfer' : 'Send Transfer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
