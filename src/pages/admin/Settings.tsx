import React, { useState } from 'react';
import { Save, Lock, Shield, Key, Bell, Globe, HelpCircle, Check, CreditCard, DollarSign, Cpu } from 'lucide-react';
import { GlobalConfig, CONFIG } from '../../types';
import { saveGlobalConfigToSupabase } from '../../supabase';

interface SettingsProps {
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  globalConfig?: GlobalConfig;
  onSaveGlobalConfig?: (config: GlobalConfig) => Promise<boolean>;
}

export default function Settings({
  language,
  triggerModal,
  globalConfig,
  onSaveGlobalConfig
}: SettingsProps) {
  // Banking & Payment Options
  const [bankName, setBankName] = useState(globalConfig?.paymentBankName || 'BANK CENTRAL ASIA (BCA)');
  const [bankAccount, setBankAccount] = useState(globalConfig?.paymentBankAccount || '8835019283');
  const [bankHolder, setBankHolder] = useState(globalConfig?.paymentBankHolder || 'PT GROCKGOLD INDONESIA');
  const [usdtAddress, setUsdtAddress] = useState(globalConfig?.usdtWalletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');

  // Financial Parameters
  const defaultUnitPrice = globalConfig?.pricePerUnit || CONFIG.PRICE_PER_UNIT;
  const defaultDailyRate = globalConfig?.dailyRewardPercent || globalConfig?.dailyRewardRate || (CONFIG.DAILY_REWARD_PERCENT * 100);
  const defaultCappingRate = globalConfig?.cappingPercent || globalConfig?.cappingRate || (CONFIG.CAPPING_PERCENT * 100);
  const defaultMinDeposit = globalConfig?.minDeposit || globalConfig?.minDepositAmount || CONFIG.MIN_DEPOSIT;
  const defaultMinWithdraw = globalConfig?.minWithdraw || globalConfig?.minWithdrawAmount || CONFIG.MIN_WITHDRAW;

  const [unitPrice, setUnitPrice] = useState(defaultUnitPrice.toString());
  const [dailyRate, setDailyRate] = useState(defaultDailyRate.toString());
  const [cappingRate, setCappingRate] = useState(defaultCappingRate.toString());
  const [minDeposit, setMinDeposit] = useState(defaultMinDeposit.toString());
  const [minWithdraw, setMinWithdraw] = useState(defaultMinWithdraw.toString());

  // Contact & Announcement Links
  const [waLink, setWaLink] = useState(globalConfig?.supportWhatsappLink || 'https://wa.me/6281234567890');
  const [telegramLink, setTelegramLink] = useState(globalConfig?.supportTelegramLink || 'https://t.me/grockgold_official');
  const [runningNotice, setRunningNotice] = useState(globalConfig?.runningNoticeText || '🔥 PENGUMUMAN: Promo bonus deposit 10% dan hadiah Lucky Spin berlaku untuk seluruh member aktif!');

  // Admin Credentials Change
  const [adminCurrentPass, setAdminCurrentPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminSecurityPin, setAdminSecurityPin] = useState('123456');

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const parsedUnitPrice = parseFloat(unitPrice) || CONFIG.PRICE_PER_UNIT;
    const parsedDailyRate = parseFloat(dailyRate) || (CONFIG.DAILY_REWARD_PERCENT * 100);
    const parsedCappingRate = parseFloat(cappingRate) || (CONFIG.CAPPING_PERCENT * 100);
    const parsedMinDeposit = parseFloat(minDeposit) || CONFIG.MIN_DEPOSIT;
    const parsedMinWithdraw = parseFloat(minWithdraw) || CONFIG.MIN_WITHDRAW;

    const updatedConfig: GlobalConfig = {
      paymentBankName: bankName.trim(),
      paymentBankAccount: bankAccount.trim(),
      paymentBankHolder: bankHolder.trim(),
      usdtWalletAddress: usdtAddress.trim(),
      pricePerUnit: parsedUnitPrice,
      dailyRewardRate: parsedDailyRate,
      dailyRewardPercent: parsedDailyRate,
      cappingRate: parsedCappingRate,
      cappingPercent: parsedCappingRate,
      minDepositAmount: parsedMinDeposit,
      minDeposit: parsedMinDeposit,
      minWithdrawAmount: parsedMinWithdraw,
      minWithdraw: parsedMinWithdraw,
      supportWhatsappLink: waLink.trim(),
      supportTelegramLink: telegramLink.trim(),
      runningNoticeText: runningNotice.trim(),
      updatedAt: Date.now()
    };

    try {
      if (onSaveGlobalConfig) {
        await onSaveGlobalConfig(updatedConfig);
      } else {
        await saveGlobalConfigToSupabase(updatedConfig);
      }

      triggerModal(
        language === 'id' 
          ? '✅ Seluruh konfigurasi sistem & rekening pembayaran berhasil diperbarui!' 
          : '✅ System configuration saved successfully!', 
        'success'
      );
    } catch (err) {
      console.error('Error saving settings:', err);
      triggerModal('❌ Gagal menyimpan konfigurasi sistem.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
          {language === 'id' ? 'PENGATURAN SISTEM & REKENING DEPOSIT' : 'SYSTEM & FINANCIAL CONFIGURATION'}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {language === 'id' 
            ? 'Atur rekening bank tujuan deposit member, tarif yield mining, minimal WD, dan pesan running text.' 
            : 'Configure receiving payment accounts, yield parameters, withdrawal limits, and ticker notes.'}
        </p>
      </div>

      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SECTION 1: REKENING DEPOSIT & WALLET */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-5 h-5 text-rose-400" />
              <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                1. REKENING BANK & WALLET TUJUAN DEPOSIT
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nama Bank Resmi
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nomor Rekening Bank
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nama Pemilik Rekening (a.n)
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 uppercase font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Alamat Wallet USDT (BEP-20 / TRC-20)
                </label>
                <input
                  type="text"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: FINANCIAL & YIELD PARAMETERS */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                2. PARAMETER KONTRAK & LIMIT TRANSAKSI
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Harga per Unit Kontrak (IDR)
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Yield Mining Harian (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Limit Capping Profit (%)
                </label>
                <input
                  type="number"
                  value={cappingRate}
                  onChange={(e) => setCappingRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-purple-300 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Minimal Deposit (IDR)
                </label>
                <input
                  type="number"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Minimal Penarikan / Withdraw (IDR)
                </label>
                <input
                  type="number"
                  value={minWithdraw}
                  onChange={(e) => setMinWithdraw(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-rose-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: OFFICIAL SUPPORT & TICKER NOTICE */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                3. LINK DUKUNGAN CUSTOMER SERVICE & TEKS PENGUMUMAN (RUNNING TICKER)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Link WhatsApp CS Official
                </label>
                <input
                  type="text"
                  value={waLink}
                  onChange={(e) => setWaLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Link Telegram Community / Channel
                </label>
                <input
                  type="text"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-400 font-mono focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Teks Pengumuman Running Text (Home Ticker)
                </label>
                <textarea
                  value={runningNotice}
                  onChange={(e) => setRunningNotice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-amber-200 focus:outline-none min-h-[70px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-black rounded-xl uppercase transition cursor-pointer shadow-xl shadow-rose-950/50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
