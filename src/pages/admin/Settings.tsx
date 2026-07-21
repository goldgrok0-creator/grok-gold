import React from 'react';
import { Save } from 'lucide-react';

interface SettingsProps {
  systemConfig: any;
  language: 'id' | 'en';
  onSaveSystemConfig: (updated: any) => Promise<void>;
}

export default function Settings({
  systemConfig,
  language,
  onSaveSystemConfig
}: SettingsProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated = {
      ...systemConfig,
      bankName: formData.get('bankName') as string,
      bankNumber: formData.get('bankNumber') as string,
      bankHolder: formData.get('bankHolder') as string,
      usdtAddress: formData.get('usdtAddress') as string,
      pricePerUnit: parseInt(formData.get('pricePerUnit') as string) || 180000,
      dailyRewardPercent: parseFloat(formData.get('dailyRewardPercent') as string) || 4.0
    };
    onSaveSystemConfig(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase mb-2">
        {language === 'id' ? 'SINKRONISASI REKENING & KONFIGURASI PERUSAHAAN' : 'COMPANY SETTINGS & RECEIVING ACCOUNTS'}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl max-w-lg space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Name</label>
            <input
              type="text"
              name="bankName"
              defaultValue={systemConfig?.bankName || 'BCA'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Holder Name</label>
            <input
              type="text"
              name="bankHolder"
              defaultValue={systemConfig?.bankHolder || 'REZAL PRATAMA'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Account Number</label>
          <input
            type="text"
            name="bankNumber"
            defaultValue={systemConfig?.bankNumber || '0562167917'}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">USDT (BEP-20) Address</label>
          <input
            type="text"
            name="usdtAddress"
            defaultValue={systemConfig?.usdtAddress || '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4'}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {language === 'id' ? 'Harga Per Unit (IDR)' : 'Price Per Unit (IDR)'}
            </label>
            <input
              type="number"
              name="pricePerUnit"
              defaultValue={systemConfig?.pricePerUnit || 180000}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none font-mono text-purple-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {language === 'id' ? 'Reward Harian (%)' : 'Daily Reward (%)'}
            </label>
            <input
              type="number"
              step="0.1"
              name="dailyRewardPercent"
              defaultValue={systemConfig?.dailyRewardPercent || 4.0}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none font-mono text-emerald-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg transition uppercase flex items-center justify-center gap-2 cursor-pointer font-bold"
        >
          <Save className="w-4 h-4" />
          {language === 'id' ? 'SIMPAN UTAMA' : 'SAVE CONFIGURATION'}
        </button>
      </form>
    </div>
  );
}
