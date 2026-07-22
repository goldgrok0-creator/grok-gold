import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Settings, Send, CheckCircle2, HelpCircle, Shield, Bell, CreditCard, Wallet, Gift, ExternalLink, Loader2 } from 'lucide-react';
import { useAppState } from '../AppContext';
import { saveAccountToSupabase, updateUserSettingsInSupabase } from '../supabase';
import { UserAccount, CONFIG } from '../types';
import { TRANSLATIONS } from '../translations';
import { telegramService } from '../services/telegramService';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    currentAccount,
    setCurrentAccount,
    setAccounts,
    setCurrentTab,
    triggerModal,
    state
  } = useAppState();

  const t = TRANSLATIONS[language];

  // Telegram state
  const [telegramIdInput, setTelegramIdInput] = useState(currentAccount?.settings?.telegramId || '');
  const [botInfo, setBotInfo] = useState<{ configured: boolean; bot?: { id: number; username: string; firstName: string }; error?: string } | null>(null);
  const [isSavingTg, setIsSavingTg] = useState(false);
  const [isTestingTg, setIsTestingTg] = useState(false);

  useEffect(() => {
    if (currentAccount?.settings?.telegramId !== undefined) {
      setTelegramIdInput(currentAccount.settings.telegramId || '');
    }
  }, [currentAccount?.settings?.telegramId]);

  useEffect(() => {
    telegramService.getBotInfo().then(res => setBotInfo(res)).catch(() => {});
  }, []);

  const handleSaveTelegramId = async () => {
    if (!currentAccount) {
      triggerModal(language === 'id' ? '⚠️ Silakan login terlebih dahulu untuk menyimpan pengaturan.' : '⚠️ Please login first to save settings.', 'warning');
      return;
    }

    const cleanId = telegramIdInput.trim();
    setIsSavingTg(true);

    try {
      const newSettings = {
        ...(currentAccount.settings || {}),
        telegramId: cleanId,
      };

      const updatedAccount: UserAccount = {
        ...currentAccount,
        settings: newSettings
      };

      // 1. Update Supabase users table settings column and account details
      await updateUserSettingsInSupabase(currentAccount.username, newSettings);
      await saveAccountToSupabase(updatedAccount);

      // 2. Update React App State Context & LocalStorage
      setCurrentAccount(updatedAccount);
      setAccounts(prevAccounts => {
        const updatedAccounts = prevAccounts.map(acc => {
          if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
            return updatedAccount;
          }
          return acc;
        });
        try {
          localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
        } catch (e) {
          console.error('LocalStorage write error:', e);
        }
        return updatedAccounts;
      });

      // Fetch fresh bot info
      const freshBot = await telegramService.getBotInfo();
      setBotInfo(freshBot);

      // 3. Send a welcoming confirmation message to Telegram if ID was provided
      if (cleanId) {
        const notifRes = await telegramService.sendNotification({
          telegramId: cleanId,
          username: currentAccount.username,
          eventType: 'security',
          title: 'Notifikasi Telegram Terhubung 🛡️',
          message: `Telegram ID Anda (${cleanId}) telah berhasil dihubungkan ke akun GROCKGOLD @${currentAccount.username}. Notifikasi otomatis aktif!`,
          status: 'Secured'
        }).catch(err => {
          console.warn('Telegram security note failed:', err);
          return null;
        });

        if (notifRes && notifRes.success && notifRes.delivered) {
          triggerModal(
            language === 'id'
              ? '✅ Telegram ID Berhasil Disimpan & Terhubung! Pesan konfirmasi telah dikirim ke Telegram Anda.'
              : '✅ Telegram ID Linked & Connected! Confirmation message sent to Telegram.',
            'success'
          );
        } else if (notifRes && notifRes.error) {
          triggerModal(
            language === 'id'
              ? `✅ Telegram Chat ID Disimpan!\n\n⚠️ Catatan Notifikasi: ${notifRes.error}\n\nLangkah: Buka bot Telegram @trading_sinyal_pro_bot dan tekan /start agar bot dapat mengirim pesan.`
              : `✅ Telegram Chat ID Saved!\n\n⚠️ Delivery Note: ${notifRes.error}\n\nStep: Open Telegram bot @trading_sinyal_pro_bot and press /start so the bot can send messages.`,
            'info'
          );
        } else {
          triggerModal(
            language === 'id' ? '✅ Pengaturan Telegram Berhasil Disimpan!' : '✅ Telegram Settings Saved Successfully!',
            'success'
          );
        }
      } else {
        triggerModal(
          language === 'id' ? 'ℹ️ Pengaturan Telegram Diperbarui' : 'ℹ️ Telegram Settings Updated',
          'info'
        );
      }
    } catch (err: any) {
      console.error('Save Telegram ID error:', err);
      triggerModal('❌ Gagal menyimpan Telegram ID: ' + (err.message || String(err)), 'error');
    } finally {
      setIsSavingTg(false);
    }
  };

  const handleTestTelegramNotification = async () => {
    const cleanId = telegramIdInput.trim();

    if (!cleanId) {
      triggerModal(language === 'id' ? '⚠️ Mohon isi Telegram Chat ID Anda terlebih dahulu.' : '⚠️ Please enter your Telegram Chat ID first.', 'warning');
      return;
    }
    if (!currentAccount) {
      triggerModal(language === 'id' ? '⚠️ Silakan login terlebih dahulu.' : '⚠️ Please login first.', 'warning');
      return;
    }

    setIsTestingTg(true);
    try {
      const res = await telegramService.sendTestNotification(cleanId, currentAccount.username);
      if (res.success && res.delivered) {
        triggerModal(
          language === 'id' 
            ? '🚀 Notifikasi Uji Coba Terkirim! Periksa pesan di aplikasi Telegram Anda.' 
            : '🚀 Test Notification Sent! Check your message in Telegram app.',
          'success'
        );
      } else if (res.error) {
        triggerModal(`❌ Gagal mengirim: ${res.error}\n\nPastikan Anda sudah buka bot @trading_sinyal_pro_bot dan menekan /start.`, 'error');
      } else if (res.skipped) {
        triggerModal(`⚠️ ${res.reason || 'Notifikasi dilewati.'}`, 'warning');
      } else {
        triggerModal('⚠️ Pesan tidak dapat terkirim. Pastikan Anda sudah tekan /start pada Bot Telegram @trading_sinyal_pro_bot.', 'warning');
      }
    } catch (err: any) {
      console.error('Test Telegram error:', err);
      triggerModal('❌ Terjadi kesalahan saat mengirim notifikasi uji coba.', 'error');
    } finally {
      setIsTestingTg(false);
    }
  };

  const handleToggleAutoReinvest = (val: boolean) => {
    if (!currentAccount) return;

    setAccounts(prevAccounts => {
      const updatedAccounts = prevAccounts.map(acc => {
        if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
          const updated = {
            ...acc,
            settings: {
              ...acc.settings,
              autoReinvest: val,
            }
          };
          saveAccountToSupabase(updated);
          return updated;
        }
        return acc;
      });
      try {
        localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
      } catch (e) {
        console.error(e);
      }
      return updatedAccounts;
    }
  );

    setCurrentAccount(prev => prev ? {
      ...prev,
      settings: {
        ...prev.settings,
        autoReinvest: val,
      }
    } : null);

    triggerModal(
      language === 'id'
        ? `✅ Auto Reinvest ${val ? 'Diaktifkan' : 'Dinonaktifkan'}`
        : `✅ Auto Reinvest ${val ? 'Enabled' : 'Disabled'}`,
      'info'
    );
  };

  const handleToggleNotifications = (val: boolean) => {
    if (!currentAccount) return;

    setAccounts(prevAccounts => {
      const updatedAccounts = prevAccounts.map(acc => {
        if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
          const updated = {
            ...acc,
            settings: {
              ...acc.settings,
              notificationsEnabled: val,
            }
          };
          saveAccountToSupabase(updated);
          return updated;
        }
        return acc;
      });
      try {
        localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
      } catch (e) {
        console.error(e);
      }
      return updatedAccounts;
    });

    setCurrentAccount(prev => prev ? {
      ...prev,
      settings: {
        ...prev.settings,
        notificationsEnabled: val,
      }
    } : null);

    triggerModal(
      language === 'id'
        ? `🔔 Notifikasi ${val ? 'Diaktifkan' : 'Dinonaktifkan'}`
        : `🔔 Notifications ${val ? 'Enabled' : 'Disabled'}`,
      'info'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left font-sans pb-12"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Pengaturan' : 'Settings'}
        </h2>
      </div>

      {/* --- TELEGRAM BOT INTEGRATION SECTION --- */}
      <div className="bg-[#0e061c] border border-cyan-500/20 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-400" />
            {language === 'id' ? 'Integrasi Telegram Bot' : 'Telegram Bot Integration'}
          </div>
          {currentAccount?.settings?.telegramId ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Terhubung
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Belum Terhubung
            </span>
          )}
        </div>

        {/* Bot status alert box */}
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              Bot Resmi GROCKGOLD: <strong className="text-cyan-300">@{botInfo?.bot?.username || 'trading_sinyal_pro_bot'}</strong>
            </span>
          </div>
          <a
            href={`https://t.me/${botInfo?.bot?.username || 'trading_sinyal_pro_bot'}`}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition flex items-center gap-1 shadow-md"
          >
            Buka Bot <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Connection Form */}
        <div className="space-y-3 pt-1">
          {/* Telegram Chat ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Telegram Chat ID / User ID <span className="text-rose-400">*</span>
              </label>
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Cek Chat ID di @userinfobot <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan angka Chat ID (Contoh: 123456789)"
                value={telegramIdInput}
                onChange={e => setTelegramIdInput(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              Nomor ID unik Telegram Anda. Dapatkan gratis secara otomatis melalui bot <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-semibold">@userinfobot</a>.
            </p>
          </div>

          {/* Notice about /start */}
          <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-[10px] text-slate-300 space-y-1">
            <span className="font-bold text-cyan-300 block">⚡ ALUR MENGHUBUNGKAN:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Dapatkan Chat ID dari <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-cyan-300 underline">@userinfobot</a> dan masukkan pada kolom di atas.</li>
              <li>Klik <strong className="text-white">Simpan & Hubungkan</strong>.</li>
              <li>Buka Bot Resmi <strong className="text-cyan-300">@{botInfo?.bot?.username || 'trading_sinyal_pro_bot'}</strong> dan tekan tombol <strong className="text-white">/start</strong> agar bot diizinkan mengirim pesan ke Telegram Anda.</li>
            </ol>
            <div className="pt-2">
              <a
                href={`https://t.me/${botInfo?.bot?.username || 'trading_sinyal_pro_bot'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold hover:bg-cyan-500/30 transition text-[10px]"
              >
                Tekan /start di @{botInfo?.bot?.username || 'trading_sinyal_pro_bot'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveTelegramId}
              disabled={isSavingTg}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg transition duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSavingTg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {language === 'id' ? 'Simpan & Hubungkan' : 'Save & Link'}
            </button>

            {currentAccount?.settings?.telegramId && (
              <button
                type="button"
                onClick={handleTestTelegramNotification}
                disabled={isTestingTg}
                className="bg-black/60 hover:bg-black border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition duration-200 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isTestingTg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                {language === 'id' ? 'Uji Notifikasi' : 'Test Alert'}
              </button>
            )}
          </div>
        </div>

        {/* Feature Event Badges */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Notifikasi Otomatis Yang Akan Diterima:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Deposit Masuk / Disetujui</span>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
              <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Pengajuan & Pencairan Withdraw</span>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
              <Gift className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Hasil Tambang & Daily Claim</span>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Keamanan & Perubahan Profil</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- STANDARD SETTINGS SECTION --- */}
      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
          <Settings className="w-4 h-4 text-gold-primary" />
          {t.settingsTitle}
        </div>

        <div className="space-y-3 text-xs font-bold text-white">
          {/* Auto Reinvest Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex flex-col text-left">
              <span className="text-xs">Auto Reinvest (Rp {(CONFIG.PRICE_PER_UNIT / 1000).toLocaleString('id-ID')}k)</span>
              <span className="text-[8px] text-slate-400 font-medium">Beli kontrak otomatis dari hasil tambang</span>
            </div>
            <button
              onClick={() => handleToggleAutoReinvest(!currentAccount?.settings?.autoReinvest)}
              className={`w-10 h-6 rounded-full p-1 transition duration-200 focus:outline-none ${
                currentAccount?.settings?.autoReinvest ? 'bg-gold-primary' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                  currentAccount?.settings?.autoReinvest ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex flex-col text-left">
              <span className="text-xs">{language === 'id' ? 'Notifikasi Real-time' : 'Real-time Notifications'}</span>
              <span className="text-[8px] text-slate-400 font-medium">Terima peringatan aktivitas armada</span>
            </div>
            <button
              onClick={() => handleToggleNotifications(!currentAccount?.settings?.notificationsEnabled)}
              className={`w-10 h-6 rounded-full p-1 transition duration-200 focus:outline-none ${
                currentAccount?.settings?.notificationsEnabled ? 'bg-gold-primary' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                  currentAccount?.settings?.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;

