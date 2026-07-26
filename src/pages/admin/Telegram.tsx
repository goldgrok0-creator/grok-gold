import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, Shield, Bell, ExternalLink, Loader2, Users, Radio, Unlink, RefreshCw, AlertTriangle, Key } from 'lucide-react';
import { useAppState } from '../../AppContext';
import { saveTelegramChatIdToSupabase, fetchAccountsFromSupabase } from '../../supabase';
import { UserAccount } from '../../types';
import { telegramService } from '../../services/telegramService';

export const TelegramAdminPage: React.FC = () => {
  const {
    language,
    currentAccount,
    setCurrentAccount,
    setAccounts,
    triggerModal
  } = useAppState();

  // Guard check (ensure page is rendered for admin)
  const isAdmin = currentAccount?.role === 'admin';

  // Telegram Admin State
  const [telegramIdInput, setTelegramIdInput] = useState(currentAccount?.settings?.telegramId || '');
  const [botInfo, setBotInfo] = useState<{ configured: boolean; bot?: { id: number; username: string; firstName: string }; error?: string } | null>(null);
  const activeBotUsername = (botInfo?.bot?.username && !botInfo.bot.username.includes('trading_sinyal_pro')) ? botInfo.bot.username : 'GrockGoldMiningBot';
  const [isSavingTg, setIsSavingTg] = useState(false);
  const [isTestingTg, setIsTestingTg] = useState(false);

  // Bot Menu Interactive Tester state
  const [showBotPreview, setShowBotPreview] = useState(true);
  const [botMessage, setBotMessage] = useState<string>('');
  const [botKeyboard, setBotKeyboard] = useState<{ text: string; callback_data: string }[][]>([]);
  const [isLoadingBotInteract, setIsLoadingBotInteract] = useState(false);

  // One-time linking code state
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Linked Users state
  const [linkedUsers, setLinkedUsers] = useState<any[]>([]);
  const [isLoadingLinkedUsers, setIsLoadingLinkedUsers] = useState(false);
  const [unlinkingUsername, setUnlinkingUsername] = useState<string | null>(null);

  // Broadcast modal / state
  const [broadcastTitle, setBroadcastTitle] = useState('📢 Pengumuman Resmi Admin GROCKGOLD');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Load Bot Info and Linked Users
  const loadLinkedUsers = async () => {
    if (!currentAccount?.username) return;
    setIsLoadingLinkedUsers(true);
    try {
      const res = await fetch(`/api/telegram/admin/linked-users?requester=${encodeURIComponent(currentAccount.username)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setLinkedUsers(data.users);
      }
    } catch (err) {
      console.warn('Error loading linked users:', err);
    } finally {
      setIsLoadingLinkedUsers(false);
    }
  };

  useEffect(() => {
    if (currentAccount?.settings?.telegramId !== undefined) {
      setTelegramIdInput(currentAccount.settings.telegramId || '');
    }
  }, [currentAccount?.settings?.telegramId]);

  useEffect(() => {
    telegramService.getBotInfo().then(res => setBotInfo(res)).catch(() => {});
    loadLinkedUsers();
  }, [currentAccount?.username]);

  const handleSaveTelegramId = async () => {
    if (!currentAccount) return;

    const cleanId = telegramIdInput.trim();

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

      const saveRes = await saveTelegramChatIdToSupabase(
        currentAccount.username,
        cleanId,
        newSettings
      );

      if (!saveRes.success) {
        triggerModal(
          language === 'id'
            ? `❌ Gagal menyimpan ke Supabase: ${saveRes.error}`
            : `❌ Failed saving to Supabase: ${saveRes.error}`,
          'danger'
        );
        return;
      }

      const freshAccounts = await fetchAccountsFromSupabase(currentAccount.username);
      let updatedAccount: UserAccount | null = null;

      if (freshAccounts && freshAccounts.length > 0) {
        setAccounts(freshAccounts);
        const found = freshAccounts.find(a => a.username.toLowerCase() === currentAccount.username.toLowerCase());
        if (found) updatedAccount = found;
      }

      if (!updatedAccount) {
        updatedAccount = {
          ...currentAccount,
          settings: newSettings
        };
      }

      setCurrentAccount(updatedAccount);

      const freshBot = await telegramService.getBotInfo().catch(() => null);
      if (freshBot) setBotInfo(freshBot);

      if (cleanId) {
        const notifRes = await telegramService.sendNotification({
          telegramId: cleanId,
          username: currentAccount.username,
          eventType: 'security',
          title: 'Notifikasi Admin Telegram Terhubung 🛡️',
          message: `Telegram ID Admin (${cleanId}) telah berhasil dihubungkan ke akun Administrator GROCKGOLD @${currentAccount.username}. Notifikasi kontrol sistem aktif!`,
          status: 'Admin Connected'
        }).catch(() => null);

        if (notifRes && notifRes.success && notifRes.delivered) {
          triggerModal(
            language === 'id'
              ? '✅ Telegram Admin Chat ID Berhasil Disimpan & Terhubung! Pesan konfirmasi telah dikirim.'
              : '✅ Admin Telegram Chat ID Linked & Connected!',
            'success'
          );
        } else {
          triggerModal(
            language === 'id' ? '✅ Pengaturan Telegram Admin Berhasil Disimpan!' : '✅ Admin Telegram Settings Saved!',
            'success'
          );
        }
      } else {
        triggerModal(language === 'id' ? 'ℹ️ Telegram ID Diperbarui' : 'ℹ️ Telegram ID Updated', 'info');
      }

      loadLinkedUsers();
    } catch (err: any) {
      triggerModal('❌ Terjadi kesalahan: ' + (err.message || String(err)), 'danger');
    } finally {
      setIsSavingTg(false);
    }
  };

  const handleTestTelegramNotification = async () => {
    const cleanId = telegramIdInput.trim();

    if (!cleanId) {
      triggerModal(language === 'id' ? '⚠️ Mohon isi Telegram Chat ID Admin terlebih dahulu.' : '⚠️ Please enter your Telegram Chat ID first.', 'warning');
      return;
    }
    if (!currentAccount) return;

    setIsTestingTg(true);
    try {
      const res = await telegramService.sendTestNotification(cleanId, currentAccount.username);
      if (res.success && res.delivered) {
        triggerModal(
          language === 'id' 
            ? '🚀 Notifikasi Uji Coba Terkirim ke Telegram Admin! Silakan periksa pesan Anda.' 
            : '🚀 Admin Test Notification Sent!',
          'success'
        );
      } else if (res.error) {
        triggerModal(`❌ Gagal mengirim: ${res.error}\n\nPastikan Anda sudah buka bot @${activeBotUsername} dan menekan /start.`, 'danger');
      } else {
        triggerModal('⚠️ Pesan tidak dapat terkirim. Buka bot Telegram dan tekan /start.', 'warning');
      }
    } catch (err: any) {
      triggerModal('❌ Terjadi kesalahan saat mengirim notifikasi uji coba.', 'danger');
    } finally {
      setIsTestingTg(false);
    }
  };

  const handleGenerateLinkCode = async () => {
    if (!currentAccount?.username) return;
    setIsGeneratingCode(true);
    try {
      const res = await telegramService.generateLinkingCode(currentAccount.username);
      if (res.success && res.code) {
        setLinkingCode(res.code);
        const link = res.deepLink || `https://t.me/${activeBotUsername}?start=${res.code}`;
        window.open(link, '_blank', 'noopener,noreferrer');
        triggerModal(`Tautan Deep Link Telegram dibuat! Membuka bot @${activeBotUsername}... Cukup tekan START di Telegram.`, 'success');
      } else {
        triggerModal(res.error || 'Gagal membuat tautan verifikasi', 'danger');
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
        triggerModal(res.error || 'Gagal memproses menu Telegram', 'danger');
      }
    } catch (err: any) {
      triggerModal('Error: ' + String(err), 'danger');
    } finally {
      setIsLoadingBotInteract(false);
    }
  };

  const handleUnlinkUser = async (targetUsername: string) => {
    if (!currentAccount?.username) return;
    if (!confirm(`Apakah Anda yakin ingin melepas koneksi Telegram untuk user @${targetUsername}?`)) return;

    setUnlinkingUsername(targetUsername);
    try {
      const res = await fetch('/api/telegram/admin/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsername,
          requesterUsername: currentAccount.username
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerModal(`✅ Koneksi Telegram untuk @${targetUsername} berhasil dilepas!`, 'success');
        loadLinkedUsers();
      } else {
        triggerModal(data.error || 'Gagal melepas koneksi Telegram user.', 'danger');
      }
    } catch (err: any) {
      triggerModal('Error: ' + String(err), 'danger');
    } finally {
      setUnlinkingUsername(null);
    }
  };

  const handleSendAdminBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      triggerModal('Mohon tuliskan isi pesan broadcast.', 'warning');
      return;
    }
    if (!currentAccount?.username) return;

    setIsSendingBroadcast(true);
    try {
      const res = await fetch('/api/telegram/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterUsername: currentAccount.username,
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerModal(`📢 Broadcast berhasil terkirim ke ${data.deliveredCount || linkedUsers.length} pengguna Telegram!`, 'success');
        setBroadcastMessage('');
      } else {
        triggerModal(data.error || 'Gagal mengirim broadcast', 'danger');
      }
    } catch (err: any) {
      triggerModal('Error: ' + String(err), 'danger');
    } finally {
      setIsSendingBroadcast(false);
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

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-rose-400 font-bold bg-rose-950/20 border border-rose-500/30 rounded-2xl">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        Halaman ini khusus untuk Role Administrator. Akses Anda ditolak.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 text-left font-sans"
    >
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Send className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black tracking-wider text-white uppercase">
              {language === 'id' ? 'KONSOL INTEGRASI TELEGRAM ADMIN' : 'TELEGRAM ADMIN CONSOLE'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Kelola notifikasi otomatis real-time, pantau akun terhubung, broadcast pengumuman massal, dan kontrol bot Telegram resmi GROCKGOLD.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 z-10">
          <a
            href={`https://t.me/${activeBotUsername}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-2xl transition flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            Bot Official: @{activeBotUsername} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ADMIN TELEGRAM CONNECTION FORM */}
      <div className="bg-[#0e061c] border border-cyan-500/20 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            {language === 'id' ? 'Koneksi Telegram Admin Utama' : 'Main Admin Telegram Connection'}
          </div>
          {currentAccount?.settings?.telegramId ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Admin Terhubung
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Belum Terhubung
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Telegram Chat ID Admin <span className="text-rose-400">*</span>
              </label>
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Cek Chat ID @userinfobot <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="text"
              placeholder="Masukkan angka Chat ID Admin (Contoh: 123456789)"
              value={telegramIdInput}
              onChange={e => setTelegramIdInput(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Digunakan untuk menerima notifikasi deposit baru, penarikan, dan permohonan persetujuan sistem secara instan di Telegram Admin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveTelegramId}
              disabled={isSavingTg}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSavingTg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {language === 'id' ? 'Simpan & Hubungkan Admin' : 'Save & Link Admin'}
            </button>

            <button
              type="button"
              onClick={handleGenerateLinkCode}
              disabled={isGeneratingCode}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              {language === 'id' ? 'Buka Bot Deep Link' : 'Open Bot Deep Link'}
            </button>

            {currentAccount?.settings?.telegramId && (
              <button
                type="button"
                onClick={handleTestTelegramNotification}
                disabled={isTestingTg}
                className="bg-black/60 hover:bg-black border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isTestingTg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                {language === 'id' ? 'Uji Alert Admin' : 'Test Admin Alert'}
              </button>
            )}
          </div>

          {linkingCode && (
            <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-900/30 border border-amber-400/60 rounded-2xl flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase block tracking-wider">Kode Verifikasi Bot Admin (Berlaku 15 Menit):</span>
                <span className="text-xl font-black text-yellow-300 tracking-widest font-mono">{linkingCode}</span>
              </div>
              <a
                href={`https://t.me/${activeBotUsername}?start=${linkingCode}`}
                target="_blank"
                rel="noreferrer"
                className="bg-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl shadow hover:bg-amber-300 transition flex items-center gap-1"
              >
                Pakai di Bot <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN BROADCAST TOOL */}
      <div className="bg-[#0e061c] border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            {language === 'id' ? 'Fitur Broadcast Pengumuman Massal' : 'Mass Announcement Broadcast'}
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {linkedUsers.length} Member Terhubung
          </span>
        </div>

        <form onSubmit={handleSendAdminBroadcast} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Judul Broadcast
            </label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={e => setBroadcastTitle(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 transition"
              placeholder="Judul pengumuman..."
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Isi Pesan Broadcast (Mendukung HTML Telegram: &lt;b&gt;, &lt;i&gt;, &lt;code&gt;)
            </label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition"
              placeholder="Tuliskan pengumuman atau info promo ke seluruh anggota Telegram..."
            />
          </div>

          <button
            type="submit"
            disabled={isSendingBroadcast || !broadcastMessage.trim()}
            className="w-full bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs py-3 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSendingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
            {language === 'id' ? 'Kirim Broadcast ke Seluruh Member Terhubung' : 'Send Mass Broadcast'}
          </button>
        </form>
      </div>

      {/* LIVE BOT INTERACTIVE TESTER */}
      <div className="bg-[#0e061c] border border-cyan-500/20 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
              Simulator Interactive Bot Menu & Control Panel Admin
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!showBotPreview) handleInteractBot(undefined, '/start');
              setShowBotPreview(!showBotPreview);
            }}
            className="px-3 py-1 text-[10px] font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition cursor-pointer shadow"
          >
            {showBotPreview ? 'Sembunyikan' : 'Buka Simulator Bot'}
          </button>
        </div>

        {showBotPreview && (
          <div className="p-3.5 bg-[#0a1120] border border-cyan-500/20 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-[10px]">
                  GG
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1">
                    GROCKGOLD Bot <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  </div>
                  <div className="text-[9px] text-slate-400">@{activeBotUsername}</div>
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

            <div className="p-3 bg-black/70 border border-white/5 rounded-xl text-slate-200 text-xs leading-relaxed space-y-1 font-sans">
              {isLoadingBotInteract ? (
                <div className="flex items-center justify-center py-4 text-cyan-400 gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Telegram API...</span>
                </div>
              ) : botMessage ? (
                renderFormattedText(botMessage)
              ) : (
                <span className="text-slate-400 italic">Tekan 'Kirim /start' untuk menguji menu bot.</span>
              )}
            </div>

            {botKeyboard.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Inline Keyboard Buttons:
                </span>
                {botKeyboard.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-2 gap-1.5">
                    {row.map((btn, btnIdx) => (
                      <button
                        key={btnIdx}
                        type="button"
                        onClick={() => handleInteractBot(btn.callback_data)}
                        disabled={isLoadingBotInteract}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center text-center cursor-pointer active:scale-95 shadow ${
                          row.length === 1 ? 'col-span-2' : ''
                        } ${
                          btn.callback_data === 'admin_panel' || btn.callback_data.startsWith('admin_')
                            ? 'bg-gradient-to-r from-purple-600/40 via-amber-500/30 to-gold-primary/30 border-amber-400/60 text-amber-300 font-black'
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

      {/* LINKED USERS TABLE */}
      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Daftar Member Terhubung Telegram ({linkedUsers.length})
          </div>
          <button
            onClick={loadLinkedUsers}
            disabled={isLoadingLinkedUsers}
            className="p-1.5 bg-black/40 hover:bg-black text-slate-300 rounded-xl border border-white/10 transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLinkedUsers ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {linkedUsers.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            Belum ada member yang menghubungkan akun Telegram.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Telegram Chat ID</th>
                  <th className="py-2.5 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {linkedUsers.map(user => {
                  const tgId = user.telegram_user_id || user.telegram_id || user.settings?.telegramId || '-';
                  return (
                    <tr key={user.username} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-bold text-white">
                        @{user.username}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">
                        {tgId}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => handleUnlinkUser(user.username)}
                          disabled={unlinkingUsername === user.username}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {unlinkingUsername === user.username ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                          Lepas Koneksi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TelegramAdminPage;
