import React, { useState } from 'react';
import { 
  ChevronLeft, Wallet, Check, QrCode, Coins, HelpCircle, 
  UploadCloud, ShieldCheck, Lock, ArrowDown 
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { CONFIG } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  compressImage, 
  uploadProofToSupabaseStorage, 
  createDepositInSupabase 
} from '../supabase';

const DepositPage: React.FC = () => {
  const {
    state,
    language,
    currentAccount,
    globalConfig,
    setCurrentTab,
    triggerModal,
    syncFromSupabase,
    setShowQrisGuideModal
  } = useAppState();

  const [depositMethod, setDepositMethod] = useState<'qris' | 'bank' | 'crypto'>('qris');
  const [depositValue, setDepositValue] = useState('');
  const [depositProof, setDepositProof] = useState<string | null>(null);
  const [depositProofName, setDepositProofName] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedUSDT, setCopiedUSDT] = useState(false);

  const t = TRANSLATIONS[language];

  const formatDepositAmount = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean) {
      setDepositValue(parseInt(clean).toLocaleString('id-ID'));
    } else {
      setDepositValue('');
    }
  };

  const handleQuickDeposit = (amount: number) => {
    setDepositValue(amount.toLocaleString('id-ID'));
  };

  const handleCopyBankNumber = () => {
    const num = globalConfig?.bankNumber || '8402-1920-22';
    navigator.clipboard.writeText(num);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
    triggerModal(language === 'id' ? 'Nomor rekening disalin!' : 'Bank account number copied!', 'info');
  };

  const handleCopyUSDTAddress = () => {
    const addr = globalConfig?.usdtAddress || '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4';
    navigator.clipboard.writeText(addr);
    setCopiedUSDT(true);
    setTimeout(() => setCopiedUSDT(false), 2000);
    triggerModal(language === 'id' ? 'Alamat USDT disalin!' : 'USDT address copied!', 'info');
  };

  const handleProofUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerModal(language === 'id' ? '❌ Hanya berkas gambar yang diperbolehkan.' : '❌ Only image files are allowed.', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerModal(language === 'id' ? '❌ Ukuran gambar maksimal 5MB.' : '❌ Image size max 5MB.', 'warning');
      return;
    }

    setIsUploadingProof(true);
    try {
      const compressedDataUrl = await compressImage(file, 1000, 0.7);
      setDepositProof(compressedDataUrl);
      setDepositProofName(file.name);
      triggerModal(language === 'id' ? '✅ Bukti transfer berhasil dimuat.' : '✅ Receipt image loaded successfully.', 'success');
    } catch {
      triggerModal(language === 'id' ? '❌ Gagal memproses gambar.' : '❌ Failed to process image.', 'danger');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const executeDeposit = async () => {
    const numeric = parseInt(depositValue.replace(/[^0-9]/g, '')) || 0;
    if (numeric < CONFIG.MIN_DEPOSIT) {
      triggerModal(
        language === 'id'
          ? `Minimal deposit adalah Rp${CONFIG.MIN_DEPOSIT.toLocaleString('id-ID')}.`
          : `Minimum deposit is Rp ${CONFIG.MIN_DEPOSIT.toLocaleString('id-ID')}.`,
        'warning'
      );
      return;
    }

    if (!depositProof) {
      triggerModal(
        language === 'id'
          ? '❌ Bukti transfer wajib diunggah sebelum melanjutkan.'
          : '❌ Transfer proof is required before continuing.',
        'warning'
      );
      return;
    }

    if (!currentAccount) return;

    setIsUploadingProof(true);
    const uploadResult = await uploadProofToSupabaseStorage(depositProof, depositProofName || 'proof.jpg');
    const publicUrl = uploadResult.url || depositProof;

    if (!publicUrl) {
      setIsUploadingProof(false);
      triggerModal(
        language === 'id' ? '❌ Gagal memproses gambar bukti transfer.' : '❌ Failed to process transfer proof image.',
        'danger'
      );
      return;
    }

    const depId = 'DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const paymentLabel = depositMethod === 'bank'
      ? `Bank (${globalConfig?.bankName || 'BCA'})`
      : depositMethod === 'qris'
      ? `QRIS Instant (${globalConfig?.qrisNmid || 'NMID: ID1024389201928'})`
      : 'USDT Crypto (TRC-20)';

    createDepositInSupabase(depId, currentAccount.username, numeric, paymentLabel, publicUrl).then(success => {
      setIsUploadingProof(false);
      if (success) {
        setDepositValue('');
        setDepositProof(null);
        setDepositProofName(null);
        triggerModal(
          language === 'id'
            ? `🎉 Deposit sebesar Rp ${numeric.toLocaleString('id-ID')} Berhasil dikirim! Silakan tunggu verifikasi admin.`
            : `🎉 Deposit of Rp ${numeric.toLocaleString('id-ID')} has been submitted! Please wait for admin verification.`,
          'success'
        );
        setCurrentTab('wallet');
        syncFromSupabase();
      } else {
        triggerModal(language === 'id' ? '❌ Gagal mengirim permintaan deposit.' : '❌ Failed to submit deposit request.', 'danger');
      }
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* HEADER & CURRENT BALANCE BAR */}
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => setCurrentTab('home')}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.deposit}</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">{language === 'id' ? 'Sistem Pengisian Saldo Instan 24/7' : '24/7 Instant Balance Topup Portal'}</p>
          </div>
        </div>

        {/* LIVE BALANCE CARD */}
        <div className="bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-gold-primary/20 px-4 py-2 rounded-2xl flex items-center justify-between gap-4 md:self-start">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gold-primary" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {language === 'id' ? 'SALDO ANDA' : 'YOUR BALANCE'}
            </span>
          </div>
          <span className="text-sm font-black font-mono text-emerald-400">
            Rp {state.mainBalance.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* VISUAL STEP CHECKLIST PROGRESS TRACKER */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#080211]/90 border border-purple-950/50 p-2.5 rounded-2xl">
        {[
          { 
            step: '1', 
            label: language === 'id' ? '1. Nominal' : '1. Amount',
            active: true,
            completed: depositValue !== ''
          },
          { 
            step: '2', 
            label: language === 'id' ? '2. Bayar' : '2. Transfer',
            active: depositValue !== '',
            completed: depositValue !== '' && depositProof !== null
          },
          { 
            step: '3', 
            label: language === 'id' ? '3. Verifikasi' : '3. Verify',
            active: depositProof !== null,
            completed: depositProof !== null
          }
        ].map((st) => (
          <div 
            key={st.step}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl border transition text-[10px] font-bold ${
              st.completed 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : st.active 
                  ? 'bg-gold-primary/10 border-gold-primary/30 text-gold-primary animate-pulse'
                  : 'bg-black/25 border-white/5 text-slate-500'
            }`}
          >
            {st.completed ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                st.active ? 'bg-gold-primary text-black' : 'bg-slate-800 text-slate-500'
              }`}>
                {st.step}
              </span>
            )}
            <span className="uppercase tracking-wider">{st.label}</span>
          </div>
        ))}
      </div>

      {/* PAYMENT METHOD SEGMENTED SELECTOR */}
      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-4 shadow-xl space-y-4">
        <label className="text-xs font-black text-gold-primary block uppercase tracking-wider">
          {language === 'id' ? 'PILIH METODE PEMBAYARAN RESMI' : 'SELECT OFFICIAL PAYMENT METHOD'}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* QRIS INSTANT BUTTON */}
          <button
            type="button"
            onClick={() => {
              setDepositMethod('qris');
              setShowQrisGuideModal(true);
            }}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
              depositMethod === 'qris'
                ? 'bg-gradient-to-b from-purple-600/20 to-fuchsia-600/10 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/10 hover:bg-black/50'
            }`}
          >
            {depositMethod === 'qris' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400" />
            )}
            <QrCode className={`w-6 h-6 ${depositMethod === 'qris' ? 'text-purple-400' : 'text-slate-500'}`} />
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-wider block">QRIS Instant</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">DANA, OVO, GoPay, Mobile Banking</span>
            </div>
          </button>

          {/* BANK LOCAL BUTTON */}
          <button
            type="button"
            onClick={() => setDepositMethod('bank')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
              depositMethod === 'bank'
                ? 'bg-gradient-to-b from-blue-600/15 to-purple-600/5 border-gold-primary/50 text-white shadow-lg shadow-gold-primary/5'
                : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/10 hover:bg-black/50'
            }`}
          >
            {depositMethod === 'bank' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold-primary shadow-lg shadow-gold-primary" />
            )}
            <Wallet className={`w-6 h-6 ${depositMethod === 'bank' ? 'text-gold-primary' : 'text-slate-500'}`} />
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-wider block">Local Bank Transfer</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">BCA Virtual Account</span>
            </div>
          </button>

          {/* CRYPTO USDT BUTTON */}
          <button
            type="button"
            onClick={() => setDepositMethod('crypto')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
              depositMethod === 'crypto'
                ? 'bg-gradient-to-b from-emerald-600/15 to-purple-600/5 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/5'
                : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/10 hover:bg-black/50'
            }`}
          >
            {depositMethod === 'crypto' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
            )}
            <Coins className={`w-6 h-6 ${depositMethod === 'crypto' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-wider block">Crypto USDT</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">TRC-20 Network Standard</span>
            </div>
          </button>
        </div>
      </div>

      {/* MASTER BENTO SECTION: INPUT & PAYEE DESTINATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* BENTO BLOCK A: NOMINAL FORM */}
        <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-black text-gold-primary uppercase tracking-wider">
                {t.nominalDeposit}
              </label>
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                {language === 'id' ? 'MIN Rp100.000' : 'MIN Rp100,000'}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4.5 top-3.5 text-base font-extrabold text-gold-primary">Rp</span>
              <input
                type="text"
                value={depositValue}
                onChange={(e) => formatDepositAmount(e.target.value)}
                className="w-full bg-black/45 border border-purple-950/40 rounded-2xl pl-12 pr-4 py-4 text-xl font-bold font-mono focus:border-gold-primary outline-none transition text-white text-center shadow-inner"
                placeholder="100.000"
              />
            </div>

            {/* Presets Chips */}
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {[100000, 250000, 1000000, 2500000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickDeposit(amount)}
                  className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-xl text-[10px] font-black text-slate-300 transition cursor-pointer"
                >
                  Rp {amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}J` : `${amount / 1000}K`}
                </button>
              ))}
            </div>
          </div>

          {/* QUICK GUIDE CHECKS */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 text-[10px] text-slate-400 space-y-2 mt-4 md:mt-0">
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-gold-primary shrink-0 mt-0.5" />
              <p>{language === 'id' ? 'Masukkan nominal sesuai dengan jumlah transfer Anda.' : 'Input the exact amount you wish to transfer.'}</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-gold-primary shrink-0 mt-0.5" />
              <p>{language === 'id' ? 'Unggah bukti transfer untuk verifikasi otomatis Admin.' : 'Upload receipt proof for rapid admin auto-audit queue.'}</p>
            </div>
          </div>
        </div>

        {/* BENTO BLOCK B: PAYMENT GATEWAY CARDS */}
        <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          {depositMethod === 'qris' ? (
            /* OFFICIAL INDONESIAN QRIS STAND CARD */
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
                  <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-purple-400" />
                    QRIS INSTANT PAYMENT
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowQrisGuideModal(true)}
                      className="text-[10px] font-black bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-lg transition shadow-md shadow-purple-600/20 uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{language === 'id' ? 'Cara Bayar' : 'How to Pay'}</span>
                    </button>
                    <span className="text-[10px] font-black bg-purple-600/20 text-purple-300 px-2 py-1 rounded-md border border-purple-500/20 uppercase animate-pulse">
                      ⚡ INSTANT
                    </span>
                  </div>
                </div>

                {/* OFFICIAL QRIS STAND DISPLAY CARD MATCHING ASPI SPEC */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden border border-slate-200 text-slate-900 select-none max-w-sm mx-auto">
                  <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden pointer-events-none">
                    <div className="bg-red-600 w-32 h-12 -rotate-45 -translate-x-12 -translate-y-2 shadow-md"></div>
                  </div>

                  <div className="absolute bottom-0 right-0 w-36 h-28 overflow-hidden pointer-events-none">
                    <div className="bg-gradient-to-l from-red-600 to-red-500 w-44 h-24 rounded-tl-full translate-x-6 translate-y-6 shadow-lg"></div>
                  </div>

                  <div className="flex justify-between items-start pt-1 pb-2 border-b border-slate-200 relative z-10">
                    <div className="flex items-center gap-2 pl-4">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-black tracking-tighter text-black font-mono leading-none">QRIS</span>
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-sm"></div>
                        </div>
                        <span className="text-[7px] font-extrabold text-slate-800 leading-tight uppercase tracking-tight">
                          QR Code Standar<br/>Pembayaran Nasional
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pr-1">
                      <div className="text-right">
                        <span className="text-[12px] font-black text-red-600 tracking-tighter italic block leading-none">GPN</span>
                        <span className="text-[5.5px] font-extrabold text-slate-600 tracking-widest block">GERAKAN NAIK</span>
                      </div>
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-sm">
                        🦅
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-2 relative z-10 space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-black text-black tracking-wide uppercase">
                      {globalConfig?.qrisMerchantName || 'HITACHIMA, DIGITAL & KREATIF'}
                    </h3>
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-[10px] font-mono font-extrabold text-slate-800">
                        NMID: {globalConfig?.qrisNmid || 'ID1026555768062'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const nmid = globalConfig?.qrisNmid || 'ID1026555768062';
                          navigator.clipboard.writeText(nmid);
                          triggerModal(language === 'id' ? 'NMID QRIS disalin!' : 'NMID copied!', 'info');
                        }}
                        className="text-[8px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300 transition active:scale-95 cursor-pointer"
                      >
                        COPY
                      </button>
                    </div>
                    <p className="text-[9px] font-mono font-bold text-slate-600">
                      {globalConfig?.qrisTerminal || 'A01'}
                    </p>
                  </div>

                  <div className="my-2 p-2 bg-white rounded-xl border border-slate-200 shadow-inner flex flex-col items-center justify-center relative z-10 max-w-[210px] mx-auto">
                    {globalConfig?.qrisImage ? (
                      <img src={globalConfig.qrisImage} alt="QRIS Code" className="w-44 h-44 object-contain rounded-lg" />
                    ) : (
                      <div className="w-44 h-44 relative flex flex-col items-center justify-center bg-white p-2">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                          <path d="M0,0 h30 v30 h-30 z M4,4 v22 h22 v-22 z M8,8 h14 v14 h-14 z" fill="currentColor" />
                          <path d="M70,0 h30 v30 h-30 z M74,4 v22 h22 v-22 z M78,8 h14 v14 h-14 z" fill="currentColor" />
                          <path d="M0,70 h30 v30 h-30 z M4,74 v22 h22 v-22 z M8,78 h14 v14 h-14 z" fill="currentColor" />
                          
                          <rect x="35" y="2" width="6" height="6" fill="currentColor" />
                          <rect x="45" y="8" width="10" height="5" fill="currentColor" />
                          <rect x="38" y="18" width="18" height="5" fill="currentColor" />
                          <rect x="60" y="5" width="5" height="12" fill="currentColor" />
                          
                          <rect x="2" y="36" width="12" height="6" fill="currentColor" />
                          <rect x="18" y="34" width="12" height="8" fill="currentColor" />
                          <rect x="34" y="32" width="16" height="14" fill="currentColor" />
                          <rect x="54" y="35" width="10" height="6" fill="currentColor" />
                          <rect x="68" y="32" width="8" height="12" fill="currentColor" />
                          <rect x="80" y="35" width="16" height="12" fill="currentColor" />
                          
                          <rect x="36" y="52" width="10" height="14" fill="currentColor" />
                          <rect x="50" y="50" width="14" height="8" fill="currentColor" />
                          <rect x="68" y="52" width="12" height="12" fill="currentColor" />
                          <rect x="84" y="52" width="12" height="8" fill="currentColor" />
                          
                          <rect x="35" y="72" width="8" height="14" fill="currentColor" />
                          <rect x="48" y="70" width="16" height="8" fill="currentColor" />
                          <rect x="68" y="72" width="10" height="10" fill="currentColor" />
                          <rect x="82" y="68" width="14" height="14" fill="currentColor" />
                          
                          <rect x="38" y="88" width="18" height="8" fill="currentColor" />
                          <rect x="60" y="86" width="12" height="10" fill="currentColor" />
                          <rect x="76" y="86" width="18" height="10" fill="currentColor" />
                        </svg>

                        <div className="absolute inset-0 m-auto w-8 h-8 bg-red-600 rounded-md border-2 border-white flex items-center justify-center shadow-lg z-10">
                          <span className="text-[7px] font-black text-white tracking-tighter">QRIS</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 text-center relative z-10">
                    <p className="text-[9px] font-black text-black tracking-widest uppercase">
                      SATU QRIS UNTUK SEMUA
                    </p>
                    <p className="text-[7.5px] font-medium text-slate-600">
                      Cek aplikasi penyelenggara di: <span className="font-bold text-slate-800">www.aspi-qris.id</span>
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-end relative z-10 text-[7px] text-slate-600">
                    <div className="text-left font-mono leading-tight">
                      <span className="block">Dicetak oleh: {globalConfig?.qrisPrintedBy || '93600914'}</span>
                      <span className="block">Versi cetak: {globalConfig?.qrisPrintVersion || 'v0.0.2026.07.23'}</span>
                    </div>

                    <div className="text-right text-white">
                      <span className="text-[6.5px] font-black text-slate-800 uppercase block mb-0.5">Cara pembayaran QRIS:</span>
                      <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded-full text-[6px] font-bold shadow-sm">
                        <span>Buka Aplikasi</span>
                        <span>➔</span>
                        <span>Scan</span>
                        <span>➔</span>
                        <span>Bayar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9.5px] text-purple-200/80 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 leading-relaxed mt-3">
                <span className="font-extrabold text-purple-300 block uppercase mb-0.5">⚡ PROSES DEPOSIT INSTAN:</span>
                {language === 'id' 
                  ? 'Scan QRIS di atas dengan DANA, OVO, GoPay, ShopeePay, atau Mobile Banking pilihan Anda. Tanpa biaya admin 24/7.' 
                  : 'Scan the QRIS code above with DANA, OVO, GoPay, ShopeePay, or your Mobile Banking app. Zero admin fees 24/7.'}
              </div>
            </div>
          ) : depositMethod === 'bank' ? (
            /* VIP BANK BCA CARD VISUAL */
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-black text-gold-primary uppercase tracking-wider">
                    {language === 'id' ? 'REKENING TUJUAN' : 'DESTINATION BANK ACCOUNT'}
                  </span>
                  <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/10">
                    {globalConfig?.bankName || 'BCA'}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-blue-900/50 via-slate-900 to-slate-950 border border-blue-500/25 rounded-2xl p-4 relative overflow-hidden shadow-xl">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{globalConfig?.bankName || 'BCA'} TRANSFER RECEIVER</span>
                    <div className="w-8 h-6 bg-amber-500/20 rounded-md border border-amber-500/30 flex items-center justify-center text-[10px] text-gold-primary font-black">CHIP</div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Account Number / No. Rekening</span>
                      <div className="flex items-center gap-2 mt-0.5 justify-between">
                        <span className="text-base font-black font-mono tracking-widest text-white select-all">
                          {globalConfig?.bankNumber || '8402-1920-22'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyBankNumber}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-gold-primary border border-white/5 transition active:scale-90 cursor-pointer"
                        >
                          {copiedBank ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <span className="text-[8px] text-slate-500 font-bold block uppercase">Account Holder / Atas Nama</span>
                        <span className="text-xs font-black text-slate-200 mt-0.5 block uppercase">
                          {globalConfig?.bankHolder || 'PT GROCKGOLD INDONESIA'}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-400 bg-black/45 border border-white/5 rounded px-1.5 py-0.5 font-bold uppercase">
                        {language === 'id' ? 'REKENING UTAMA' : 'PRIMARY ACCOUNT'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9.5px] text-amber-200/80 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 leading-relaxed mt-4">
                <span className="font-extrabold text-amber-400 block uppercase mb-0.5">💡 Tips Penting:</span>
                {language === 'id' 
                  ? 'Harap sertakan Username Anda di kolom catatan/remark transfer jika tersedia untuk proses konfirmasi super instan.' 
                  : 'Please add your login username in the transfer remark section to ensure ultra-rapid automated verification.'}
              </div>
            </div>
          ) : (
            /* CRYPTO USDT BEP20 BLOCK */
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-black text-gold-primary uppercase tracking-wider">
                    {language === 'id' ? 'ALAMAT DOMPET KRIPTO' : 'USDT WALLET DESTINATION'}
                  </span>
                  <span className="text-[10px] font-black bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10 uppercase">
                    USDT (BEP-20)
                  </span>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/25 rounded-2xl p-4 shadow-xl">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Network Standard (BEP20 Only)</span>
                      <span className="text-[10px] text-emerald-400 font-black tracking-widest block uppercase mt-0.5">
                        BSC NETWORK (BEP-20)
                      </span>
                    </div>

                    <div className="space-y-1 bg-black/40 border border-white/5 rounded-xl p-2.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">USDT BEP20 Address</span>
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[10px] font-mono font-bold text-white break-all select-all flex-1 pr-1">
                          {globalConfig?.usdtAddress || '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUSDTAddress}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-emerald-400 border border-white/5 transition active:scale-90 shrink-0 cursor-pointer"
                        >
                          {copiedUSDT ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <span className="text-[8px] text-slate-500 font-bold block uppercase">Estimated Amount</span>
                        <span className="text-xs font-black text-emerald-400 mt-0.5 block font-mono">
                          ~ $ {(parseInt(depositValue.replace(/[^0-9]/g, '')) / 15000 || 0).toFixed(2)} USDT
                        </span>
                      </div>
                      <span className="text-[8.5px] text-slate-400 bg-white/5 rounded px-1.5 py-0.5 font-bold font-mono">
                        Rate: Rp 15.000 / USDT
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9.5px] text-rose-300/80 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 leading-relaxed mt-4">
                <span className="font-extrabold text-rose-400 block uppercase mb-0.5">⚠️ JANGAN SALAH JARINGAN:</span>
                {language === 'id' 
                  ? 'Hanya kirim saldo USDT menggunakan jaringan BEP-20. Kesalahan memilih jaringan crypto dapat menyebabkan kehilangan dana permanen.' 
                  : 'Only transmit USDT on the BEP-20 standard network. Sending crypto assets to alternative networks will result in permanent loss.'}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MANDATORY PROOF UPLOAD ZONE CONTAINER */}
      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-gold-primary uppercase tracking-wider block">
            {language === 'id' ? 'STEP 3: UNGGAH BUKTI TRANSFER PEMBAYARAN' : 'STEP 3: UPLOAD COMPLETED TRANSFER PROOF'}
          </label>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 uppercase tracking-wide font-bold">
            {language === 'id' ? 'PROSES INSTAN OTOMATIS' : 'AUTOMATIC INSTANT PROCESS'}
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              handleProofUpload(file);
            }
          }}
          onClick={() => document.getElementById('proof-upload-input')?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition duration-150 flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
            depositProof
              ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'
              : 'border-purple-900/30 bg-black/45 hover:border-gold-primary/30'
          }`}
        >
          <input
            id="proof-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleProofUpload(file);
              }
            }}
          />

          {isUploadingProof ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-8 h-8 border-2 border-t-transparent border-gold-primary rounded-full animate-spin"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {language === 'id' ? 'Memproses gambar...' : 'Processing image...'}
              </span>
            </div>
          ) : depositProof ? (
            <div className="flex flex-col items-center gap-2.5 py-2">
              <img
                src={depositProof}
                alt="Preview Bukti Transfer"
                className="max-h-28 rounded-xl object-contain shadow-lg border border-purple-500/30 max-w-[200px] animate-scale-up"
                referrerPolicy="no-referrer"
              />
              <div className="text-center">
                <span className="text-emerald-400 text-xs font-black block uppercase tracking-wide">
                  {language === 'id' ? 'Bukti Transfer Berhasil Diunggah' : 'Transfer Proof Uploaded Successfully'}
                </span>
                <span className="text-slate-400 text-[10px] font-mono block mt-1 bg-black/30 border border-white/5 rounded-lg px-2 py-0.5 truncate max-w-[280px]">
                  {depositProofName || 'transfer_receipt.jpg'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDepositProof(null);
                  setDepositProofName(null);
                }}
                className="mt-2 px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-400 uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                {language === 'id' ? 'Hapus & Ganti Gambar' : 'Remove & Replace Image'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 py-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/20 border border-purple-900/30 flex items-center justify-center text-purple-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-slate-200 text-xs font-black block uppercase tracking-wider">
                  {language === 'id' ? 'Ketuk atau Seret Bukti Transfer di Sini' : 'Click or Drag receipt image here'}
                </span>
                <span className="text-slate-500 text-[9px] block mt-1">
                  {language === 'id' ? 'Mendukung format PNG, JPG, JPEG (Maksimal 5MB)' : 'Supports PNG, JPG, JPEG image formats up to 5MB'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECURITY & SLA GUARANTEE BAR */}
      <div className="bg-gradient-to-r from-emerald-950/25 via-[#0c0419]/90 to-purple-950/25 border border-emerald-500/15 rounded-3xl p-4 flex items-start gap-3">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-wider">GrockGold Mining SLA Guarantee</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            {language === 'id' 
              ? 'Setoran Anda diamankan oleh gerbang audit keuangan otomatis kami. Setelah bukti transfer diunggah, sistem akan memproses dan mengaktifkan saldo Anda secara instan dan langsung masuk ke akun Anda.' 
              : 'Your deposit is processed by our automated financial audit gateway. Once the transfer receipt is uploaded, the system will instantly process and credit your balance directly to your wallet.'}
          </p>
        </div>
      </div>

      {/* SUBMIT DEPOSIT BUTTON */}
      <button
        type="button"
        onClick={executeDeposit}
        disabled={!depositProof || isUploadingProof}
        className={`w-full py-4.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
          (!depositProof || isUploadingProof)
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/20 shadow-none'
            : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black hover:brightness-110 shadow-gold-primary/10 active:scale-[0.99] cursor-pointer'
        }`}
      >
        {!depositProof ? (
          <Lock className="w-4 h-4 shrink-0" />
        ) : (
          <ArrowDown className="w-4 h-4 shrink-0 animate-bounce" />
        )}
        {t.processDeposit}
      </button>
    </div>
  );
};

export default DepositPage;
