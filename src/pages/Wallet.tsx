import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Wallet, ArrowDown, ArrowUp, Coins, History, Gift, Check, UploadCloud, 
  ShieldCheck, Lock, XCircle, ArrowRightLeft, Crown, Award, Users, Gem 
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { CONFIG } from '../types';
import { calculateCappingEarnings } from '../utils/capping';
import { TRANSLATIONS } from '../translations';

const WalletPage: React.FC = () => {
  const {
    state,
    language,
    triggerModal,
    syncFromSupabase,
    globalConfig,
    currentAccount,
    updateState
  } = useAppState();

  const {
    depositAmount,
    setDepositAmount,
    depositMethod,
    setDepositMethod,
    depositProof,
    setDepositProof,
    depositProofName,
    setDepositProofName,
    isUploadingProof,
    copiedBank,
    setCopiedBank,
    copiedUSDT,
    setCopiedUSDT,
    executeDeposit,
    executeWithdraw,
    executeTransfer,
    isLoading: isWalletLoading
  } = useWallet();

  const {
    claimDailyReward,
    claimWelcomeBonus,
    networkActiveCount,
    canClaimWelcomeBonus,
    isLoading: isContractLoading
  } = useContract();

  // Sub-tabs within Wallet: 'dashboard', 'deposit', 'reward'
  const [walletTab, setWalletTab] = useState<'dashboard' | 'deposit' | 'reward'>('dashboard');

  // Modal States
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [showBonusSchemaModal, setShowBonusSchemaModal] = useState(false);

  // Form States for Withdraw/Transfer
  const [withdrawBank, setWithdrawBank] = useState('BCA');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const t = TRANSLATIONS[language];

  // Calculations
  const totalEarned = state.totalEarned;
  const totalPortfolioValue = state.activeContracts * CONFIG.PRICE_PER_UNIT;
  const dailyYield = totalPortfolioValue * CONFIG.DAILY_REWARD_PERCENT;
  
  // Real Income Breakdown from transactions and WELCOME BONUS PROGRAM
  const { miningProfit, referralReward, rebateReward, bonusReward } = useMemo(() => {
    const metrics = calculateCappingEarnings(state);
    return {
      miningProfit: metrics.dailyRewardEarnings,
      referralReward: metrics.referralEarnings,
      rebateReward: metrics.rebateEarnings,
      bonusReward: metrics.bonusIncome,
    };
  }, [state]);

  const bonusProgressRatio = CONFIG.REQUIRED_HOLDERS > 0 
    ? Math.min(100, (networkActiveCount / CONFIG.REQUIRED_HOLDERS) * 100) 
    : 0;

  const handleCopyBankNumber = () => {
    const num = globalConfig?.bankNumber || '8402-1920-22';
    navigator.clipboard.writeText(num);
    setCopiedBank(true);
    triggerModal(
      language === 'id' ? '✅ Nomor Rekening disalin!' : '✅ Bank Account Number copied!',
      'success'
    );
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleCopyUSDTAddress = () => {
    const addr = globalConfig?.usdtAddress || 'TYrN8xZ7p8asD89xHjasDJKH190Kash18a';
    navigator.clipboard.writeText(addr);
    setCopiedUSDT(true);
    triggerModal(
      language === 'id' ? '✅ Alamat USDT berhasil disalin!' : '✅ USDT address copied successfully!',
      'success'
    );
    setTimeout(() => setCopiedUSDT(false), 2000);
  };

  const formatWithdrawAmount = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (num === '') {
      setWithdrawAmount('');
      return;
    }
    setWithdrawAmount(parseInt(num).toLocaleString('id-ID'));
  };

  const formatTransferAmount = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (num === '') {
      setTransferAmount('');
      return;
    }
    setTransferAmount(parseInt(num).toLocaleString('id-ID'));
  };

  const handleQuickDeposit = (amount: number) => {
    setDepositAmount(amount.toLocaleString('id-ID'));
  };

  const formatDepositAmount = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (num === '') {
      setDepositAmount('');
      return;
    }
    setDepositAmount(parseInt(num).toLocaleString('id-ID'));
  };

  const handleProofUpload = (file: File) => {
    // In React 19, use a simulated upload to preserve UI fidelity
    setDepositProofName(file.name);
    // Read local url for instant display
    const reader = new FileReader();
    reader.onload = () => {
      setDepositProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerWithdrawFlow = () => {
    if (state.mainBalance < 100000) {
      triggerModal(
        language === 'id' 
          ? '❌ Minimal penarikan saldo adalah Rp 100.000.' 
          : '❌ Minimum withdrawal amount is Rp 100,000.',
        'warning'
      );
      return;
    }
    setWithdrawModalOpen(true);
  };

  const handleExecuteWithdrawal = async () => {
    const rawAmount = parseInt(withdrawAmount.replace(/[^0-9]/g, ''));
    if (isNaN(rawAmount) || rawAmount < 100000) {
      triggerModal(
        language === 'id' ? '❌ Minimal penarikan adalah Rp 100.000.' : '❌ Minimum withdrawal is Rp 100,000.',
        'warning'
      );
      return;
    }
    if (rawAmount > state.mainBalance) {
      triggerModal(t.insufficientBalance, 'danger');
      return;
    }
    if (!withdrawAccount.trim()) {
      triggerModal(
        language === 'id' ? '❌ Harap isi nomor rekening tujuan.' : '❌ Please fill in the target bank account number.',
        'warning'
      );
      return;
    }

    const success = await executeWithdraw(rawAmount, withdrawBank, withdrawAccount);
    if (success) {
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawAccount('');
    }
  };

  const handleExecuteTransfer = async () => {
    const rawAmount = parseInt(transferAmount.replace(/[^0-9]/g, ''));
    if (isNaN(rawAmount) || rawAmount < 10000) {
      triggerModal(
        language === 'id' ? '❌ Minimal transfer adalah Rp 10.000.' : '❌ Minimum transfer is Rp 10,000.',
        'warning'
      );
      return;
    }
    if (rawAmount > state.mainBalance) {
      triggerModal(t.insufficientBalance, 'danger');
      return;
    }
    if (!transferRecipient.trim()) {
      triggerModal(
        language === 'id' ? '❌ Harap isi ID / Username penerima.' : '❌ Please specify the recipient ID or Username.',
        'warning'
      );
      return;
    }

    const success = await executeTransfer(rawAmount, transferRecipient);
    if (success) {
      setTransferModalOpen(false);
      setTransferAmount('');
      setTransferRecipient('');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. DASHBOARD VIEW */}
      {walletTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 text-left"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.wallet}</h2>
          </div>

          {/* Split balances card */}
          <div className="bg-gradient-to-br from-[#120a26] to-[#040108] border border-gold-primary/30 rounded-3xl p-5 shadow-2xl relative">
            <span className="text-[10px] font-black text-slate-400 tracking-wider block mb-1.5 uppercase">
              {t.totalBalance}
            </span>
            <div className="text-3xl font-black text-gradient-gold font-orbitron mb-5">
              Rp {Math.floor((state.mainBalance ?? 0) + (state.rewardBalance ?? 0)).toLocaleString('id-ID')}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block mb-1">{t.mainBalance}</span>
                <div className="text-sm font-black text-white">
                  Rp {state.mainBalance.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold block mb-1">{t.rewardBalance}</span>
                <div className="text-sm font-black text-gold-primary">
                  Rp {Math.floor(state.rewardBalance ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setWalletTab('deposit')}
              className="py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-extrabold transition flex flex-col items-center gap-1.5 shadow-md cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
              {t.deposit}
            </button>
            <button
              onClick={triggerWithdrawFlow}
              className="py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-extrabold transition flex flex-col items-center gap-1.5 shadow-md cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              {t.withdraw}
            </button>
            <button
              onClick={() => setWalletTab('reward')}
              className="py-3 bg-gradient-to-br from-yellow-300 to-gold-primary text-black rounded-2xl text-[10px] font-black transition flex flex-col items-center gap-1.5 shadow-lg shadow-gold-primary/10 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              {language === 'id' ? 'KLAIM BONUS' : 'REWARDS'}
            </button>
          </div>

          {/* Quick Transfer Option */}
          <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-4 shadow-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-black text-white uppercase">{language === 'id' ? 'Transfer Antar Pengguna' : 'P2P Balance Transfer'}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{language === 'id' ? 'Kirim saldo instan bebas biaya admin' : 'Send funds instantly with zero fees'}</div>
              </div>
            </div>
            <button
              onClick={() => setTransferModalOpen(true)}
              className="text-[9px] font-black bg-blue-500/15 border border-blue-500/25 hover:bg-blue-500/25 text-blue-400 px-3 py-1.5 rounded-xl uppercase transition cursor-pointer"
            >
              {language === 'id' ? 'Kirim' : 'Transfer'}
            </button>
          </div>

          {/* Earnings detail */}
          <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl">
            <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase">
              {t.earningsDetail}
            </div>

            <div className="space-y-3 font-semibold text-xs text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">📊 {t.totalEarned}</span>
                <span className="text-white font-extrabold">Rp {totalEarned.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">🎁 Daily Reward Rate</span>
                <span className="text-emerald-400 font-extrabold">Rp {dailyYield.toLocaleString('id-ID')} (2%)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">👥 Referral Reward</span>
                <span className="text-amber-400 font-extrabold">Rp {referralReward.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">🔄 Rebate Reward</span>
                <span className="text-fuchsia-400 font-extrabold">Rp {rebateReward.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">🎁 Bonus</span>
                <span className="text-blue-400 font-extrabold">Rp {bonusReward.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl">
            <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase flex items-center gap-1.5">
              <History className="w-4.5 h-4.5" />
              {t.txHistory}
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {state.transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-bold text-xs space-y-1">
                  <div>{t.emptyTx}</div>
                </div>
              ) : (
                state.transactions.map((tx, idx) => (
                  <div key={`${tx.id}-${idx}`} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : tx.type === 'withdraw'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-gold-primary/10 text-gold-primary'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDown className="w-4 h-4" /> : tx.type === 'withdraw' ? <ArrowUp className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">{tx.description}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                          {new Date(tx.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-black font-mono ${
                      tx.type === 'deposit' || tx.type === 'reward' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. DEPOSIT VIEW */}
      {walletTab === 'deposit' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5 text-left"
        >
          {/* HEADER & CURRENT BALANCE BAR */}
          <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div 
                onClick={() => setWalletTab('dashboard')}
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
                completed: depositAmount !== ''
              },
              { 
                step: '2', 
                label: language === 'id' ? '2. Bayar' : '2. Transfer',
                active: depositAmount !== '',
                completed: depositAmount !== '' && depositProof !== null
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

            <div className="grid grid-cols-2 gap-3">
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
                    value={depositAmount}
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
              {depositMethod === 'bank' ? (
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

                    {/* Debit Card Visual representation */}
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
                            <span className="text-[8px] text-slate-500 font-bold block uppercase font-sans">Account Holder / Atas Nama</span>
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
                    <span className="font-extrabold text-amber-400 block uppercase mb-0.5 font-sans">💡 Tips Penting:</span>
                    {language === 'id' 
                      ? 'Harap sertakan Username Anda di kolom catatan/remark transfer jika tersedia untuk proses konfirmasi super instan.' 
                      : 'Please add your login username in the transfer remark section to ensure ultra-rapid automated verification.'}
                  </div>
                </div>
              ) : (
                /* CRYPTO USDT TRC20 BLOCK */
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs font-black text-gold-primary uppercase tracking-wider">
                        {language === 'id' ? 'ALAMAT DOMPET KRIPTO' : 'USDT WALLET DESTINATION'}
                      </span>
                      <span className="text-[10px] font-black bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10 uppercase">
                        USDT (TRC-20)
                      </span>
                    </div>

                    {/* Crypto terminal card */}
                    <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/25 rounded-2xl p-4 shadow-xl">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Network Standard (TRC20 Only)</span>
                          <span className="text-[10px] text-emerald-400 font-black tracking-widest block uppercase mt-0.5">
                            TRON NETWORK (TRC-20)
                          </span>
                        </div>

                        <div className="space-y-1 bg-black/40 border border-white/5 rounded-xl p-2.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">USDT TRC20 Address</span>
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-[10px] font-mono font-bold text-white break-all select-all flex-1 pr-1">
                              {globalConfig?.usdtAddress || 'TYrN8xZ7p8asD89xHjasDJKH190Kash18a'}
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

                        {/* Live rate converter calculator representation */}
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                          <div>
                            <span className="text-[8px] text-slate-500 font-bold block uppercase">Estimated Amount</span>
                            <span className="text-xs font-black text-emerald-400 mt-0.5 block font-mono">
                              ~ $ {(parseInt(depositAmount.replace(/[^0-9]/g, '')) / 15000 || 0).toFixed(2)} USDT
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
                      ? 'Hanya kirim saldo USDT menggunakan jaringan TRC-20. Kesalahan memilih jaringan crypto dapat menyebabkan kehilangan dana permanen.' 
                      : 'Only transmit USDT on the TRC-20 standard network. Sending crypto assets to alternative networks will result in permanent loss.'}
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
              onClick={() => document.getElementById('proof-upload-input-modular')?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition duration-150 flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
                depositProof
                  ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'border-purple-900/30 bg-black/45 hover:border-gold-primary/30'
              }`}
            >
              <input
                id="proof-upload-input-modular"
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
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 animate-scale-up">
                    <Check className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <span className="text-emerald-400 text-sm font-black block uppercase tracking-wide">
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
                    className="mt-2 px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-400 uppercase tracking-wider transition active:scale-95"
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
                    <span className="text-slate-200 text-xs font-black block uppercase tracking-wider font-sans">
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
              <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-wider">PT GrockGold Mining SLA Guarantee</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'id' 
                  ? 'Setoran Anda diamankan oleh gerbang audit keuangan otomatis kami. Setelah bukti transfer diunggah, sistem akan memproses dan mengaktifkan saldo Anda secara instan dan langsung masuk ke akun Anda.' 
                  : 'Your deposit is processed by our automated financial audit gateway. Once the transfer receipt is uploaded, the system will instantly process and credit your balance directly to your wallet.'}
              </p>
            </div>
          </div>

          {/* SUBMIT DEPOSIT BUTTON */}
          <button
            onClick={executeDeposit}
            disabled={!depositProof || isWalletLoading}
            className={`w-full py-4.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              (!depositProof || isWalletLoading)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/20 shadow-none'
                : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black hover:brightness-110 shadow-gold-primary/10 active:scale-[0.99]'
            }`}
          >
            {!depositProof ? (
              <Lock className="w-4 h-4 shrink-0" />
            ) : (
              <ArrowDown className="w-4 h-4 shrink-0 animate-bounce" />
            )}
            {t.processDeposit}
          </button>
        </motion.div>
      )}

      {/* 3. REWARD VIEW */}
      {walletTab === 'reward' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 text-left"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <div 
              onClick={() => setWalletTab('dashboard')}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.rewards}</h2>
          </div>

          {/* VIP / REWARDS HARVEST TRACKER - LUXURY PREMIUM "WELCOME BONUS" CARD */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1203] via-[#09041a] to-[#03010b] border-2 border-amber-500/35 rounded-3xl p-5 shadow-[0_0_30px_rgba(245,158,11,0.18)] transition duration-300 hover:border-amber-400/50 group">
            {/* Premium Glare / Light Ray Effect */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-br from-amber-500/15 to-transparent pointer-events-none rounded-full blur-xl group-hover:scale-125 transition duration-500" />
            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-gradient-to-tr from-[#7209b7]/20 to-transparent pointer-events-none rounded-full blur-2xl" />
            
            {/* Ambient Shimmer Strip overlay */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-40 group-hover:animate-[shimmer_1.5s_infinite]" />

            {/* Top Header Row */}
            <div className="flex justify-between items-start mb-3.5 relative z-10">
              <div>
                {/* Glowing Elite Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500/25 to-yellow-500/10 border border-amber-500/35 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.1)] mb-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[9.5px] font-black tracking-widest text-amber-300 uppercase font-sans">
                    {language === 'id' ? 'ELITE WELCOME BONUS' : 'ELITE WELCOME BONUS'}
                  </span>
                </div>
                
                {/* Giant Majestic Amount with Gold Gradient */}
                <div className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-tight font-orbitron flex items-baseline gap-1 drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]">
                  <span className="text-xs font-black text-amber-400/90 mr-0.5 font-sans">Rp</span>
                  {CONFIG.WELCOME_BONUS_AMOUNT.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Interactive Info Button */}
              <button
                type="button"
                onClick={() => setShowBonusSchemaModal(true)}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#271803] to-[#130735] hover:from-amber-500 hover:to-yellow-500 text-amber-400 hover:text-black flex items-center justify-center text-[10px] font-serif font-black transition-all duration-300 shadow-md border border-amber-500/35 active:scale-90 cursor-pointer"
              >
                i
              </button>
            </div>

            {/* Description Text */}
            <p className="text-[10px] text-slate-400/95 font-semibold leading-relaxed mb-4 relative z-10 font-sans">
              {language === 'id' 
                ? 'Dapatkan subsidi dana penambangan langsung cair untuk mempercepat penambangan emas Anda setelah syarat terpenuhi!' 
                : 'Get a direct mining capital grant instantly credited to supercharge your digital gold yield once requirements are met!'}
            </p>

            {/* Elegant Requirement Card */}
            <div className="bg-black/55 border border-amber-500/20 rounded-2xl p-3 mb-4.5 relative overflow-hidden z-10">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              
              <div className="text-[8.5px] text-amber-400 font-black tracking-widest uppercase mb-1.5 flex items-center gap-1 font-sans">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{language === 'id' ? 'PERSYARATAN UTAMA' : 'MAIN REQUIREMENT'}</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-inner">
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-[11.5px] text-slate-100 font-extrabold leading-tight">
                    {language === 'id' ? `Miliki ${CONFIG.REQUIRED_HOLDERS} Holder Aktif` : `Have ${CONFIG.REQUIRED_HOLDERS} Active Holders`}
                  </div>
                  <div className="text-[8.5px] text-slate-400 mt-0.5 leading-normal">
                    {language === 'id' ? 'Ajak rekan Anda mendaftar & aktifkan kontrak tambang' : 'Invite your partners to register and activate a mining contract'}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar and counter */}
            <div className="mb-4.5 relative z-10">
              <div className="flex justify-between items-baseline mb-1.5 leading-none">
                <span className="text-[8.5px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-1 font-sans">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  {language === 'id' ? 'PROGRESS TARGET HOLDER' : 'HOLDER TARGET PROGRESS'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-black text-amber-400 font-orbitron">
                    {networkActiveCount} <span className="text-[9px] text-slate-500 font-sans font-bold">/ {CONFIG.REQUIRED_HOLDERS}</span>
                  </span>
                  <span className="text-[8.5px] font-bold text-slate-500">
                    ({Math.min(100, Math.round(bonusProgressRatio))}%)
                  </span>
                </div>
              </div>
              
              {/* Custom gold glowing progress bar */}
              <div className="w-full h-3.5 bg-black/55 rounded-full overflow-hidden border border-amber-500/15 p-[2px] shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)] relative flex items-center justify-end pr-1"
                  style={{ width: `${bonusProgressRatio}%` }}
                >
                  {bonusProgressRatio >= 15 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-md animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Button / Disbursed Banner */}
            <div className="relative z-10">
              {state.welcomeBonusClaimed ? (
                <div className="w-full py-3 rounded-2xl text-[10.5px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'id' ? 'DANA INVESTASI Rp 1.8M SUDAH CAIR' : 'Rp 1.8M INVESTMENT GRANT DISBURSED'}</span>
                </div>
              ) : canClaimWelcomeBonus ? (
                <button
                  onClick={claimWelcomeBonus}
                  disabled={isContractLoading}
                  className="w-full py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black hover:brightness-110 active:scale-[0.98] shadow-lg shadow-amber-500/30 cursor-pointer hover:shadow-amber-500/40 transform animate-pulse hover:animate-none"
                >
                  <Gem className="w-4 h-4 text-black" />
                  <span>{language === 'id' ? 'KLAIM Rp 1.8 MILIAR SEKARANG' : 'CLAIM Rp 1.8 BILLION NOW'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowBonusSchemaModal(true)}
                  className="w-full py-3 rounded-2xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 bg-[#120a28]/80 text-slate-400 border border-amber-500/15 hover:border-amber-400/35 hover:bg-[#160d32]/90 hover:text-white cursor-pointer group"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500/70 group-hover:scale-110 transition duration-300" />
                  <span>{language === 'id' ? 'PERSYARATAN BELUM TERPENUH' : 'REQUIREMENTS NOT YET MET'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="text-xs font-black text-gold-primary uppercase tracking-wider mb-2 font-sans">
              All Earned Yield Categories
            </div>

            <div className="border-l-4 border-emerald-400 bg-emerald-500/5 p-3 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[9px] text-emerald-400 font-bold block uppercase">TOTAL MINING REWARDS EARNED</span>
                <span className="text-slate-200 text-xs font-bold font-sans">Cumulative Mining Yield</span>
              </div>
              <span className="text-emerald-400 font-black text-sm font-mono">Rp {miningProfit.toLocaleString('id-ID')}</span>
            </div>

            <div className="border-l-4 border-amber-400 bg-amber-500/5 p-3 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[9px] text-amber-400 font-bold block">REFERRAL DIRECT INCENTIVES</span>
                <span className="text-slate-200 text-xs font-bold font-sans">Active Downline Level Rates</span>
              </div>
              <span className="text-amber-400 font-black text-sm font-mono">Rp {referralReward.toLocaleString('id-ID')}</span>
            </div>

            <div className="border-l-4 border-fuchsia-400 bg-fuchsia-500/5 p-3 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[9px] text-fuchsia-400 font-bold block">REBATE LEVEL HARVEST</span>
                <span className="text-slate-200 text-xs font-bold font-sans">Network Sales Performance Share</span>
              </div>
              <span className="text-fuchsia-400 font-black text-sm font-mono">Rp {rebateReward.toLocaleString('id-ID')}</span>
            </div>

            <div className="border-l-4 border-blue-400 bg-blue-500/5 p-3 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[9px] text-blue-400 font-bold block">WELCOME BONUS</span>
                <span className="text-slate-200 text-xs font-bold font-sans">Registration Member Incentives</span>
              </div>
              <span className="text-blue-400 font-black text-sm font-mono">Rp {bonusReward.toLocaleString('id-ID')}</span>
            </div>

            <div className="bg-gold-primary/10 border border-gold-primary/20 rounded-2xl p-4 text-center mt-5">
              <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">TOTAL REWARD REVENUES</span>
              <span className="text-2xl font-black text-gradient-gold block mt-1 font-orbitron">
                Rp {totalEarned.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODALS */}
      {/* CUSTOM WITHDRAWAL FORM MODAL */}
      <AnimatePresence>
        {withdrawModalOpen && (
          <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWithdrawModalOpen(false)}
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
                <button onClick={() => setWithdrawModalOpen(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold text-left">
                {/* Bank Select */}
                <div>
                  <label className="text-gold-primary text-[10px] block mb-1.5 uppercase font-sans">Pilih Bank Tujuan</label>
                  <select
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    className="w-full bg-black/45 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
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
                  <label className="text-gold-primary text-[10px] block mb-1.5 uppercase font-sans">Nomor Rekening / No. E-Wallet</label>
                  <input
                    type="text"
                    placeholder="Masukkan No Rekening..."
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-black/45 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary font-mono"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-gold-primary text-[10px] block mb-1.5 uppercase flex justify-between font-sans">
                    <span>Nominal Penarikan (Rp)</span>
                    <span className="text-slate-400 font-semibold text-[9px]">Saldo: Rp {state.mainBalance.toLocaleString('id-ID')}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-black font-sans">Rp</span>
                    <input
                      type="text"
                      placeholder="Min Rp 100.000"
                      value={withdrawAmount}
                      onChange={(e) => formatWithdrawAmount(e.target.value)}
                      className="w-full bg-black/45 border border-purple-900/30 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteWithdrawal}
                  disabled={isWalletLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-gold-primary/25 cursor-pointer"
                >
                  {isWalletLoading ? 'Loading...' : 'Tarik Saldo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM TRANSFER FORM MODAL */}
      <AnimatePresence>
        {transferModalOpen && (
          <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTransferModalOpen(false)}
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
                <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2 font-sans">
                  <ArrowRightLeft className="w-5 h-5 text-blue-400 animate-pulse" />
                  {language === 'id' ? 'Form Transfer Saldo' : 'Transfer Balance Form'}
                </h3>
                <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold text-left">
                {/* Recipient User ID */}
                <div>
                  <label className="text-gold-primary text-[10px] block mb-1.5 uppercase font-sans">ID atau Username Penerima</label>
                  <input
                    type="text"
                    placeholder="Contoh: GGM-USER1024"
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="w-full bg-black/45 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary font-mono uppercase"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-gold-primary text-[10px] block mb-1.5 uppercase flex justify-between font-sans">
                    <span>Nominal Transfer (Rp)</span>
                    <span className="text-slate-400 font-semibold text-[9px]">Saldo: Rp {state.mainBalance.toLocaleString('id-ID')}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-black font-sans">Rp</span>
                    <input
                      type="text"
                      placeholder="Min Rp 10.000"
                      value={transferAmount}
                      onChange={(e) => formatTransferAmount(e.target.value)}
                      className="w-full bg-black/45 border border-purple-900/30 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setTransferModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteTransfer}
                  disabled={isWalletLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-gold-primary/25 cursor-pointer"
                >
                  {isWalletLoading ? 'Loading...' : 'Kirim Transfer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BONUS SCHEMATIC DETAILS MODAL */}
      <AnimatePresence>
        {showBonusSchemaModal && (
          <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBonusSchemaModal(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-[#110626] to-[#060312] border border-amber-500/35 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2 font-sans">
                  <Award className="w-5 h-5 text-amber-400" />
                  {language === 'id' ? 'Skema Elite Bonus' : 'Elite Bonus Schematic'}
                </span>
                <button onClick={() => setShowBonusSchemaModal(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-[11px] leading-relaxed text-slate-300 font-medium font-sans">
                <p>
                  {language === 'id'
                    ? 'Program subsidi investasi penambangan gold mining resmi dari PT GrockGold Mining Indonesia senilai Rp 1.800.000.'
                    : 'The official gold mining investment subsidy from PT GrockGold Mining Indonesia worth Rp 1,800,000.'}
                </p>

                <div className="space-y-2 bg-black/45 border border-amber-500/10 rounded-2xl p-3.5">
                  <span className="text-amber-400 font-extrabold uppercase tracking-wide block">Ketentuan Kualifikasi:</span>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Miliki minimal 80 downline aktif di jaringan Anda.' : 'Accumulate at least 80 active downline users in your structure.'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Satu perangkat/rekening bank dilarang kloning akun.' : 'Account duplication / multi-farming is strictly audited.'}</span>
                  </div>
                </div>

                <p className="text-amber-300/80 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[10px]">
                  {language === 'id'
                    ? 'Dana akan dikreditkan secara instan ke Saldo Utama Anda setelah disetujui, dan dapat digunakan untuk mengaktifkan armada kontrak tambahan atau ditarik langsung.'
                    : 'Subsidies are credited instantly into your Main Wallet upon claim verification, enabling downline activation or direct withdrawals.'}
                </p>
              </div>

              <button
                onClick={() => setShowBonusSchemaModal(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Pahami & Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;
