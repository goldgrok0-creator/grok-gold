import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { UserAccount } from '../../types';

interface ContractsProps {
  accounts: UserAccount[];
  language: 'id' | 'en';
  pricePerUnit: number;
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  onGiftContracts: (recipient: string, quantity: number) => void;
}

export default function Contracts({
  accounts,
  language,
  pricePerUnit,
  triggerModal,
  onGiftContracts
}: ContractsProps) {
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftContractsQty, setGiftContractsQty] = useState('1');

  const handleGift = () => {
    if (!giftRecipient) {
      triggerModal(language === 'id' ? 'Silakan pilih penerima.' : 'Please select recipient.', 'warning');
      return;
    }
    const qty = parseInt(giftContractsQty) || 1;
    if (qty <= 0) return;

    onGiftContracts(giftRecipient, qty);
    setGiftRecipient('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase mb-2">
        {language === 'id' ? 'HADIAH KONTRAK MINING' : 'GIFT MINING CONTRACTS'}
      </h3>
      
      <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl max-w-md space-y-4">
        <p className="text-xs text-slate-400">
          {language === 'id' 
            ? 'Gunakan form ini untuk langsung menambahkan Kontrak Hashing ke akun anggota secara gratis (sebagai reward / bonus).' 
            : 'Grant contract licenses instantly to specific user accounts for zero cost as promotional rewards.'}
        </p>
        
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {language === 'id' ? 'Pilih Anggota' : 'Select User'}
          </label>
          <select
            value={giftRecipient}
            onChange={(e) => setGiftRecipient(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none text-slate-200"
          >
            <option value="">-- Choose User --</option>
            {accounts
              .filter(acc => acc.username.toLowerCase() !== 'admin')
              .map(acc => (
                <option key={acc.username} value={acc.username}>
                  {acc.username} ({acc.fullName})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {language === 'id' ? 'Jumlah Kontrak (Unit)' : 'Quantity (Units)'}
          </label>
          <input
            type="number"
            min="1"
            value={giftContractsQty}
            onChange={(e) => setGiftContractsQty(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none text-slate-200"
          />
        </div>

        <button
          onClick={handleGift}
          className="w-full py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-black rounded-lg transition uppercase flex items-center justify-center gap-2 cursor-pointer font-bold"
        >
          <Gift className="w-4 h-4" />
          {language === 'id' ? 'KIRIM KONTRAK MINING' : 'GRANT MINING UNITS'}
        </button>
      </div>
    </div>
  );
}
