import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, ExternalLink, Loader2, Unlink, RefreshCw, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAppState } from '../AppContext';
import { telegramService } from '../services/telegramService';
import { fetchAccountsFromSupabase } from '../supabase';

interface TelegramLinkingBannerProps {
  compact?: boolean;
}

export const TelegramLinkingBanner: React.FC<TelegramLinkingBannerProps> = ({ compact = false }) => {
  const { currentAccount, setCurrentAccount, setAccounts, syncFromSupabase, triggerModal, language } = useAppState();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isCheckingSync, setIsCheckingSync] = useState(false);

  // Check if current account has Telegram linked
  const isLinked = Boolean(
    currentAccount?.telegram_id || 
    currentAccount?.telegram_user_id || 
    currentAccount?.settings?.telegramId
  );

  const linkedTgId = currentAccount?.telegram_id || currentAccount?.telegram_user_id || currentAccount?.settings?.telegramId || '';
  const linkedTgUsername = currentAccount?.telegram_username || currentAccount?.settings?.telegramUsername || '';

  // Auto-polling when modal is open to detect instant linking
  useEffect(() => {
    if (!showModal || isLinked) return;

    const interval = setInterval(async () => {
      if (!currentAccount?.username) return;
      try {
        const freshAccounts = await fetchAccountsFromSupabase(currentAccount.username);
        if (freshAccounts && freshAccounts.length > 0) {
          const updated = freshAccounts.find(a => a.username.toLowerCase() === currentAccount.username.toLowerCase());
          if (updated && (updated.telegram_id || updated.telegram_user_id || updated.settings?.telegramId)) {
            setCurrentAccount(updated);
            setAccounts(freshAccounts);
            setShowModal(false);
            triggerModal(
              language === 'id' 
                ? '🎉 Telegram berhasil terhubung ke akun GROCKGOLD Anda!' 
                : '🎉 Telegram account successfully linked to your GROCKGOLD account!',
              'success'
            );
          }
        }
      } catch (e) {
        console.warn('Polling link status check error:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showModal, isLinked, currentAccount?.username]);

  const handleConnectTelegram = async () => {
    if (!currentAccount?.username) return;

    setIsGenerating(true);
    try {
      const res = await telegramService.generateLinkingCode(currentAccount.username);
      if (res.success) {
        const botName = res.botUsername || 'GrockGoldMiningBot';
        const link = res.deepLink || `https://t.me/${botName}?start=${res.code}`;
        
        setDeepLink(link);
        setShowModal(true);

        // Directly open Telegram deep link in new window / app
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        triggerModal(res.error || 'Gagal membuat tautan verifikasi Telegram.', 'danger');
      }
    } catch (err: any) {
      triggerModal('Terjadi kesalahan: ' + (err.message || String(err)), 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlink = async () => {
    if (!currentAccount?.username) return;
    if (!confirm(language === 'id' ? 'Apakah Anda yakin ingin melepaskan koneksi akun Telegram?' : 'Are you sure you want to unlink your Telegram account?')) return;

    setIsUnlinking(true);
    try {
      const res = await telegramService.unlinkAccount(currentAccount.username);
      if (res.success) {
        await syncFromSupabase(true);
        triggerModal(
          language === 'id' ? '✅ Koneksi Telegram berhasil dilepas.' : '✅ Telegram account successfully unlinked.',
          'info'
        );
      } else {
        triggerModal(res.error || 'Gagal melepas koneksi Telegram.', 'danger');
      }
    } catch (err: any) {
      triggerModal('Error: ' + String(err), 'danger');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleManualCheck = async () => {
    if (!currentAccount?.username) return;
    setIsCheckingSync(true);
    try {
      await syncFromSupabase(true);
      const freshAccounts = await fetchAccountsFromSupabase(currentAccount.username);
      if (freshAccounts && freshAccounts.length > 0) {
        const updated = freshAccounts.find(a => a.username.toLowerCase() === currentAccount.username.toLowerCase());
        if (updated && (updated.telegram_id || updated.telegram_user_id || updated.settings?.telegramId)) {
          setCurrentAccount(updated);
          setShowModal(false);
          triggerModal('🎉 Telegram berhasil terhubung ke akun GROCKGOLD Anda!', 'success');
        } else {
          triggerModal('⚠️ Belum terdeteksi. Silakan tekan tombol START pada bot Telegram @GrockGoldMiningBot.', 'warning');
        }
      }
    } catch (err: any) {
      triggerModal('Error: ' + String(err), 'danger');
    } finally {
      setIsCheckingSync(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-[#0b061a]/80 border border-cyan-500/20 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            <Send className="w-4 h-4" />
          </div>
          <div className="min-w-0 text-left">
            <div className="font-bold text-white text-[11px] truncate flex items-center gap-1.5">
              <span>Bot Telegram Official</span>
              {isLinked ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black uppercase">
                  🟢 Terhubung
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black uppercase">
                  Belum Terhubung
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">@GrockGoldMiningBot</div>
          </div>
        </div>

        {isLinked ? (
          <a
            href="https://t.me/GrockGoldMiningBot"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl font-bold text-[10px] transition flex items-center gap-1 shrink-0"
          >
            Buka Bot <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <button
            onClick={handleConnectTelegram}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-[10px] uppercase rounded-xl transition flex items-center gap-1 shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Hubungkan Telegram
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`relative overflow-hidden rounded-3xl transition duration-300 ${
        isLinked
          ? 'bg-gradient-to-r from-[#091f2c] via-[#09152b] to-[#0d0720] border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.1)]'
          : 'bg-gradient-to-r from-[#170e2e] via-[#100824] to-[#0d0720] border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.1)]'
      }`}>
        {/* Glow Accent Circles */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none blur-2xl ${
          isLinked ? 'bg-cyan-500/10' : 'bg-amber-500/10'
        }`} />

        <div className="p-4 sm:p-5 relative z-10 space-y-3.5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isLinked ? 'bg-cyan-500 text-black' : 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black'
              }`}>
                <Send className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  Bot Resmi @GrockGoldMiningBot
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Integrasi Notifikasi & Auto-Login Telegram
                </div>
              </div>
            </div>

            {/* Badge Status */}
            {isLinked ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-[10px] uppercase tracking-wider shadow">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                🟢 Telegram Terhubung
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[10px] uppercase tracking-wider shadow">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Belum Terhubung
              </span>
            )}
          </div>

          {/* Content Description */}
          {isLinked ? (
            <div className="bg-black/40 border border-cyan-500/15 rounded-2xl p-3.5 text-left space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Telegram Chat ID</div>
                  <div className="font-mono text-cyan-300 font-black text-xs">{linkedTgId}</div>
                </div>
                {linkedTgUsername && (
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Username Telegram</div>
                    <div className="font-mono text-cyan-300 font-black text-xs">@{linkedTgUsername}</div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-300 flex items-center gap-1.5 pt-1 border-t border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Notifikasi otomatis Deposit, Penarikan, Daily Reward & Keamanan aktif.
              </div>
            </div>
          ) : (
            <div className="text-left text-xs text-slate-300 space-y-1.5">
              <p className="font-medium text-[11px] leading-relaxed">
                Hubungkan akun GROCKGOLD Anda dengan bot resmi <strong className="text-cyan-300 font-bold">@GrockGoldMiningBot</strong> secara otomatis melalui Telegram Deep Link untuk mengaktifkan notifikasi transaksi dan auto-login instant.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            {isLinked ? (
              <>
                <a
                  href="https://t.me/GrockGoldMiningBot"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Buka Bot @GrockGoldMiningBot
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={handleUnlink}
                  disabled={isUnlinking}
                  className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isUnlinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                  Putuskan Koneksi
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectTelegram}
                disabled={isGenerating}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black uppercase text-xs tracking-wider rounded-2xl transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Membuat Tautan Telegram...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Hubungkan Telegram (@GrockGoldMiningBot)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* POPUP MODAL FOR DEEP LINK AUTOMATED LINKING */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0826] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-cyan-500" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-black text-sm uppercase tracking-wider">
                  <Send className="w-5 h-5" />
                  Hubungkan Ke @GrockGoldMiningBot
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <p className="leading-relaxed">
                  Tautan linking otomatis dibuat untuk akun <strong className="text-white font-bold">@{currentAccount?.username}</strong>.
                </p>

                {/* Animated Status Card */}
                <div className="bg-gradient-to-br from-cyan-950/40 via-purple-950/40 to-black border border-cyan-500/30 rounded-2xl p-5 text-center space-y-3 shadow-inner">
                  <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 animate-pulse">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Menunggu Tekan START di Telegram</div>
                    <div className="text-[11px] text-cyan-300 font-medium mt-0.5">
                      Cukup tekan tombol <strong>START</strong> di Telegram, akun Anda akan langsung terhubung secara otomatis!
                    </div>
                  </div>
                </div>

                {/* Quick Steps */}
                <div className="bg-cyan-950/20 border border-cyan-500/15 rounded-2xl p-3.5 space-y-1.5">
                  <div className="font-extrabold text-cyan-300 uppercase text-[10px] tracking-wider">
                    Langkah Sederhana:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-200 font-medium">
                    <li>Klik tombol <strong className="text-amber-300">"Buka Bot & Tekan START"</strong> di bawah.</li>
                    <li>Di aplikasi Telegram, tekan tombol <strong className="text-amber-300">START</strong>.</li>
                    <li>Akun Anda akan terhubung otomatis tanpa ketik kode apapun!</li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-amber-300 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-400" />
                  Sistem memantau verifikasi dari Telegram secara real-time... Pop-up ini akan tertutup otomatis saat berhasil.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={deepLink || 'https://t.me/GrockGoldMiningBot'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black uppercase text-xs tracking-wider rounded-2xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Buka Bot & Tekan START
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={handleManualCheck}
                  disabled={isCheckingSync}
                  className="w-full py-2.5 bg-black/40 hover:bg-black/70 border border-white/10 text-slate-300 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSync ? 'animate-spin text-amber-400' : ''}`} />
                  Cek Status Verifikasi Manual
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
