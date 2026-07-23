import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Settings, Send, CheckCircle2, HelpCircle, Shield, Bell, CreditCard, Wallet, Gift, ExternalLink, Loader2 } from 'lucide-react';
import { useAppState } from '../AppContext';
import { saveAccountToSupabase, updateUserSettingsInSupabase, saveTelegramChatIdToSupabase, fetchAccountsFromSupabase } from '../supabase';
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

  // Bot Menu Interactive Tester state
  const [showBotPreview, setShowBotPreview] = useState(false);
  const [botMessage, setBotMessage] = useState<string>('');
  const [botKeyboard, setBotKeyboard] = useState<{ text: string; callback_data: string }[][]>([]);
  const [isLoadingBotInteract, setIsLoadingBotInteract] = useState(false);

  // One-time linking code state
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleGenerateLinkCode = async () => {
    if (!currentAccount?.username) return;
    setIsGeneratingCode(true);
    try {
      const res = await telegramService.generateLinkingCode(currentAccount.username);
      if (res.success && res.code) {
        setLinkingCode(res.code);
        triggerModal(`Kode Verifikasi Bot 6-Digit Berhasil Dibuat: ${res.code}. Masukkan di Telegram Bot dengan mengetik /link ${res.code}`, 'success');
      } else {
        triggerModal(res.error || 'Gagal membuat kode verifikasi', 'danger');
      }
    } catch (err: any) {
      triggerModal('Error: ' + String(err), 'danger');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleInteractBot = async (callbackData?: string, commandText?: string) => {
    const targetId = telegramIdInput.trim() || currentAccount?.settings?.telegramId || '123456789';
    setIsLoadingBotInteract(true);
    try {
      const res = await telegramService.interact({
        chatId: targetId,
        callbackData,
        commandText
      });
      if (res.success && res.result) {
        setBotMessage(res.result.text);
        setBotKeyboard(res.result.reply_markup?.inline_keyboard || []);
      } else {
        triggerModal(res.error || 'Gagal memproses menu Telegram', 'error');
      }
    } catch (err: any) {
      triggerModal('Error: ' + String(err), 'error');
    } finally {
      setIsLoadingBotInteract(false);
    }
  };

  const renderFormattedText = (htmlText: string) => {
    const lines = htmlText.split('\n');
    return lines.map((line, lineIdx) => {
      let cleanLine = line
        .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
        .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
        .replace(/<code>(.*?)<\/code>/g, '<code class="bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-cyan-500/30">$1</code>');

      return (
        <div key={lineIdx} className="min-h-[1.2em]" dangerouslySetInnerHTML={{ __html: cleanLine }} />
      );
    });
  };

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

    // 7. Validate Telegram Chat ID must be a number
    if (cleanId && !/^\d+$/.test(cleanId)) {
      triggerModal(
        language === 'id'
          ? '⚠️ Telegram Chat ID harus berupa angka saja (Contoh: 123456789).'
          : '⚠️ Telegram Chat ID must be numbers only (e.g. 123456789).',
        'warning'
      );
      return;
    }

    setIsSavingTg(true);

    try {
      const newSettings = {
        ...(currentAccount.settings || {}),
        telegramId: cleanId,
      };

      // 1, 2, 3, 4, 9. Save Telegram Chat ID directly to Supabase users table (telegram_id column & settings column)
      const saveRes = await saveTelegramChatIdToSupabase(
        currentAccount.username,
        cleanId,
        newSettings
      );

      if (!saveRes.success) {
        // 9. Display actual Supabase error message if save fails
        triggerModal(
          language === 'id'
            ? `❌ Gagal menyimpan ke Supabase: ${saveRes.error}`
            : `❌ Failed saving to Supabase: ${saveRes.error}`,
          'error'
        );
        return;
      }

      // 8. Refresh user data from Supabase and update state to show "Terhubung"
      const freshAccounts = await fetchAccountsFromSupabase(currentAccount.username);
      let updatedAccount: UserAccount | null = null;

      if (freshAccounts && freshAccounts.length > 0) {
        setAccounts(freshAccounts);
        const found = freshAccounts.find(a => a.username.toLowerCase() === currentAccount.username.toLowerCase());
        if (found) {
          updatedAccount = found;
        }
      }

      if (!updatedAccount) {
        updatedAccount = {
          ...currentAccount,
          settings: newSettings
        };
      }

      setCurrentAccount(updatedAccount);

      // Refresh bot info
      const freshBot = await telegramService.getBotInfo().catch(() => null);
      if (freshBot) setBotInfo(freshBot);

      // 6. Send a confirmation message via Telegram Bot (Does NOT fail the save process if Telegram message fails)
      if (cleanId) {
        const notifRes = await telegramService.sendNotification({
          telegramId: cleanId,
          username: currentAccount.username,
          eventType: 'security',
          title: 'Notifikasi Telegram Terhubung 🛡️',
          message: `Telegram ID Anda (${cleanId}) telah berhasil dihubungkan ke akun GROCKGOLD @${currentAccount.username}. Notifikasi otomatis aktif!`,
          status: 'Secured'
        }).catch(err => {
          console.warn('Telegram security note warning:', err);
          return null;
        });

        if (notifRes && notifRes.success && notifRes.delivered) {
          triggerModal(
            language === 'id'
              ? '✅ Telegram Chat ID Berhasil Disimpan & Terhubung! Pesan konfirmasi telah dikirim ke Telegram Anda.'
              : '✅ Telegram Chat ID Linked & Connected! Confirmation message sent to Telegram.',
            'success'
          );
        } else if (notifRes && notifRes.error) {
          triggerModal(
            language === 'id'
              ? `✅ Telegram Chat ID Berhasil Disimpan & Terhubung!\n\n⚠️ Catatan Pengiriman Bot: ${notifRes.error}\n\nLangkah: Buka bot Telegram @${botInfo?.bot?.username || 'GrockGoldMiningBot'} dan tekan /start agar bot dapat mengirim pesan.`
              : `✅ Telegram Chat ID Linked & Connected!\n\n⚠️ Bot Note: ${notifRes.error}\n\nStep: Open Telegram bot @${botInfo?.bot?.username || 'GrockGoldMiningBot'} and press /start so the bot can send messages.`,
            'info'
          );
        } else {
          triggerModal(
            language === 'id' ? '✅ Pengaturan Telegram Berhasil Disimpan & Terhubung!' : '✅ Telegram Settings Saved & Connected!',
            'success'
          );
        }
      } else {
        triggerModal(
          language === 'id' ? 'ℹ️ Telegram ID Diperbarui' : 'ℹ️ Telegram ID Updated',
          'info'
        );
      }
    } catch (err: any) {
      console.error('Save Telegram ID error:', err);
      triggerModal('❌ Terjadi kesalahan: ' + (err.message || String(err)), 'error');
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
        triggerModal(`❌ Gagal mengirim: ${res.error}\n\nPastikan Anda sudah buka bot @GrockGoldMiningBot dan menekan /start.`, 'error');
      } else if (res.skipped) {
        triggerModal(`⚠️ ${res.reason || 'Notifikasi dilewati.'}`, 'warning');
      } else {
        triggerModal('⚠️ Pesan tidak dapat terkirim. Pastikan Anda sudah tekan /start pada Bot Telegram @GrockGoldMiningBot.', 'warning');
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
              Bot Resmi GROCKGOLD: <strong className="text-cyan-300">@{botInfo?.bot?.username || 'GrockGoldMiningBot'}</strong>
            </span>
          </div>
          <a
            href={`https://t.me/${botInfo?.bot?.username || 'GrockGoldMiningBot'}`}
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
              <li>Buka Bot Resmi <strong className="text-cyan-300">@{botInfo?.bot?.username || 'GrockGoldMiningBot'}</strong> dan tekan tombol <strong className="text-white">/start</strong> agar bot diizinkan mengirim pesan ke Telegram Anda.</li>
            </ol>
            <div className="pt-2">
              <a
                href={`https://t.me/${botInfo?.bot?.username || 'GrockGoldMiningBot'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold hover:bg-cyan-500/30 transition text-[10px]"
              >
                Tekan /start di @{botInfo?.bot?.username || 'GrockGoldMiningBot'} <ExternalLink className="w-3 h-3" />
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

            <button
              type="button"
              onClick={handleGenerateLinkCode}
              disabled={isGeneratingCode}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition duration-200 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
              {language === 'id' ? 'Buat Kode Verifikasi Bot' : 'Get Link Code'}
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

          {linkingCode && (
            <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-900/30 border border-amber-400/60 rounded-2xl flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase block tracking-wider">Kode Verifikasi Telegram Bot (Berlaku 15 Menit):</span>
                <span className="text-xl font-black text-yellow-300 tracking-widest font-mono">{linkingCode}</span>
              </div>
              <a
                href={`https://t.me/${botInfo?.bot?.username || 'GrockGoldMiningBot'}?start=${linkingCode}`}
                target="_blank"
                rel="noreferrer"
                className="bg-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl shadow hover:bg-amber-300 transition flex items-center gap-1"
              >
                Gunakan di Bot <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Interactive Telegram Bot Menu Preview & Tester */}
          <div className="p-4 bg-[#0a1120] border border-cyan-500/30 rounded-2xl space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                    Uji Coba Inline Keyboard Bot
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {currentAccount?.role === 'admin' || currentAccount?.username?.toLowerCase() === 'admin' ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      👑 Hak Akses: Administrator (Akses Penuh Admin Control Menu)
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      👤 Hak Akses: Member Regular (Terhubung Chat ID & Notifikasi, Akses Admin Dibatasi)
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!showBotPreview) {
                    handleInteractBot(undefined, '/start');
                  }
                  setShowBotPreview(!showBotPreview);
                }}
                className="px-3 py-1 text-[10px] font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition cursor-pointer shadow-md"
              >
                {showBotPreview ? 'Sembunyikan Menu' : '⚡ Buka Bot Menu'}
              </button>
            </div>

            {showBotPreview && (
              <div className="p-3.5 bg-[#0e1626] border border-cyan-500/20 rounded-2xl space-y-3 text-xs">
                {/* Bot Header Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-[10px] shadow-inner">
                      GG
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1">
                        GROCKGOLD Bot <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      </div>
                      <div className="text-[9px] text-slate-400">@{botInfo?.bot?.username || 'GrockGoldMiningBot'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInteractBot(undefined, '/start')}
                    disabled={isLoadingBotInteract}
                    className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold rounded-lg border border-cyan-500/30 transition flex items-center gap-1 cursor-pointer"
                  >
                    {isLoadingBotInteract ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Kirim /start'}
                  </button>
                </div>

                {/* Message Output */}
                <div className="p-3 bg-black/70 border border-white/5 rounded-xl text-slate-200 text-xs leading-relaxed space-y-1 font-sans">
                  {isLoadingBotInteract ? (
                    <div className="flex items-center justify-center py-4 text-cyan-400 gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses API Telegram...</span>
                    </div>
                  ) : botMessage ? (
                    renderFormattedText(botMessage)
                  ) : (
                    <span className="text-slate-400 italic">Tekan 'Kirim /start' untuk melihat menu utama bot.</span>
                  )}
                </div>

                {/* Inline Keyboard Buttons */}
                {botKeyboard.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Telegram Inline Keyboard (Klik tombol):
                    </span>
                    {botKeyboard.map((row, rowIdx) => (
                      <div key={rowIdx} className="grid grid-cols-2 gap-1.5">
                        {row.map((btn, btnIdx) => (
                          <button
                            key={btnIdx}
                            type="button"
                            onClick={() => handleInteractBot(btn.callback_data)}
                            disabled={isLoadingBotInteract}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center text-center cursor-pointer active:scale-95 shadow-md ${
                              row.length === 1 ? 'col-span-2' : ''
                            } ${
                              btn.callback_data === 'admin_panel' || btn.callback_data.startsWith('admin_')
                                ? 'bg-gradient-to-r from-purple-600/40 via-amber-500/30 to-gold-primary/30 border-amber-400/60 text-amber-300 hover:bg-amber-500/40 shadow-amber-900/30 font-black'
                                : btn.callback_data === 'menu_main'
                                ? 'bg-gradient-to-r from-amber-500/20 to-gold-primary/20 border-gold-primary/40 text-gold-primary hover:bg-gold-primary/30'
                                : btn.callback_data === 'claim_daily_reward'
                                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/40'
                                : 'bg-cyan-950/40 hover:bg-cyan-900/50 border-cyan-500/30 text-cyan-300'
                            }`}
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

