import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Coins, 
  Cpu, 
  Wallet, 
  Network as NetworkIcon, 
  User, 
  HelpCircle, 
  ShieldAlert, 
  LogOut, 
  Copy, 
  Check, 
  Upload, 
  DollarSign, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Globe, 
  Camera,
  BookOpen,
  X,
  FileText
} from 'lucide-react';
import { UserAccount, Transaction, AppState, isMemberAccount } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  purchaseContractInSupabase, 
  createDepositInSupabase, 
  createWithdrawalInSupabase, 
  claimDailyRewardInSupabase,
  claimWelcomeBonusInSupabase,
  saveAccountToSupabase,
  uploadProofToSupabaseStorage
} from '../supabase';

interface MemberDashboardProps {
  currentAccount: UserAccount;
  setCurrentAccount: React.Dispatch<React.SetStateAction<UserAccount | null>>;
  onLogout: () => void;
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  globalConfig: any;
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

export default function MemberDashboard({
  currentAccount,
  setCurrentAccount,
  onLogout,
  language,
  triggerModal,
  globalConfig,
  accounts,
  setAccounts
}: MemberDashboardProps) {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'dashboard' | 'buy' | 'mine' | 'wallet' | 'network' | 'profile' | 'faq'>('dashboard');

  // Clipboard copies
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Buy Contract Form
  const [buyUnits, setBuyUnits] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  // Claim Rewards
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimTimer, setClaimTimer] = useState<string>('');

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [depositMethod, setDepositMethod] = useState<'BCA' | 'USDT'>('BCA');
  const [depositProof, setDepositProof] = useState<File | null>(null);
  const [depositProofPreview, setDepositProofPreview] = useState<string | null>(null);
  const [isUploadingDeposit, setIsUploadingDeposit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Withdrawal Form
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Profile Form
  const [profileFullName, setProfileFullName] = useState(currentAccount.fullName);
  const [profilePhone, setProfilePhone] = useState(currentAccount.phone);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(currentAccount.state.profileImage);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Global pricing metrics from config
  const pricePerUnit = globalConfig?.pricePerUnit || 180000;
  const dailyRewardPercent = globalConfig?.dailyRewardPercent || 2.0;
  const cappingPercent = globalConfig?.cappingPercent || 250;
  const minDeposit = globalConfig?.minDeposit || 100000;
  const minWithdraw = globalConfig?.minWithdraw || 100000;

  // Real-time claims timer
  useEffect(() => {
    const updateTimer = () => {
      const lastClaim = currentAccount.state.lastClaimTime || 0;
      const nextClaim = lastClaim + 24 * 60 * 60 * 1000;
      const diff = nextClaim - Date.now();

      if (diff <= 0) {
        setClaimTimer('');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setClaimTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentAccount.state.lastClaimTime]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentAccount.referralCode || currentAccount.username);
    setCopiedCode(true);
    triggerModal(language === 'id' ? 'Kode referral disalin!' : 'Referral code copied!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?ref=${currentAccount.referralCode || currentAccount.username}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    triggerModal(language === 'id' ? 'Tautan pendaftaran disalin!' : 'Registration link copied!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 1. BUY CONTRACTS HANDLER
  const handleBuyContracts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buyUnits <= 0) return;

    const totalCost = buyUnits * pricePerUnit;
    if (currentAccount.state.mainBalance < totalCost) {
      triggerModal(t.insufficientBalance, 'danger');
      return;
    }

    setIsBuying(true);
    try {
      const success = await purchaseContractInSupabase(currentAccount.username, buyUnits, pricePerUnit);
      if (success) {
        // Build simulated transaction locally
        const newTx: Transaction = {
          id: 'PUR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          type: 'purchase',
          amount: totalCost,
          date: Date.now(),
          description: language === 'id' ? `Membeli Kontrak Tambang (${buyUnits} Unit)` : `Purchased Mining Contract (${buyUnits} Units)`
        };

        const updatedAccount: UserAccount = {
          ...currentAccount,
          state: {
            ...currentAccount.state,
            mainBalance: currentAccount.state.mainBalance - totalCost,
            activeContracts: currentAccount.state.activeContracts + buyUnits,
            transactions: [newTx, ...currentAccount.state.transactions],
            hasPurchased: true
          }
        };

        setCurrentAccount(updatedAccount);
        // Sync accounts list
        setAccounts(prev => prev.map(acc => acc.username === currentAccount.username ? updatedAccount : acc));
        triggerModal(t.contractPurchased, 'success');
        setBuyUnits(1);
      } else {
        triggerModal(language === 'id' ? '❌ Gagal melakukan transaksi.' : '❌ Failed to process transaction.', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerModal(language === 'id' ? '❌ Terjadi kesalahan jaringan.' : '❌ Network error occurred.', 'danger');
    } finally {
      setIsBuying(false);
    }
  };

  // 2. CLAIM DAILY REWARD HANDLER
  const handleClaimDailyReward = async () => {
    if (claimTimer) {
      triggerModal(t.cooldownMessage, 'warning');
      return;
    }

    const valueOfContracts = currentAccount.state.activeContracts * pricePerUnit;
    if (valueOfContracts <= 0) {
      triggerModal(language === 'id' ? '❌ Anda tidak memiliki kontrak aktif.' : '❌ You do not have any active contracts.', 'danger');
      return;
    }

    const calculatedReward = Math.round(valueOfContracts * (dailyRewardPercent / 100));
    
    // Determine streak info
    const claimStreak = (currentAccount.settings as any)?.claimStreak || 0;
    const currentStreak = claimStreak + 1;
    // Simple progressive streak reward
    const streakBonus = Math.min(25000, currentStreak * 2500); 

    setIsClaiming(true);
    try {
      const claimResult = await claimDailyRewardInSupabase(currentAccount.username, calculatedReward + streakBonus);
      if (claimResult.success) {
        const txId = 'CLM-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        const newTx: Transaction = {
          id: txId,
          type: 'reward',
          amount: calculatedReward + streakBonus,
          date: Date.now(),
          description: language === 'id' 
            ? `Klaim Reward Harian (Streak Hari ke-${currentStreak})${streakBonus > 0 ? ` + Bonus Streak Rp ${streakBonus.toLocaleString('id-ID')}` : ''}`
            : `Claimed Daily Reward (Streak Day ${currentStreak})${streakBonus > 0 ? ` + Streak Bonus Rp ${streakBonus.toLocaleString('id-ID')}` : ''}`
        };

        const updatedAccount: UserAccount = {
          ...currentAccount,
          settings: {
            ...currentAccount.settings,
            claimStreak: currentStreak
          } as any,
          state: {
            ...currentAccount.state,
            mainBalance: currentAccount.state.mainBalance + calculatedReward + streakBonus,
            totalEarned: currentAccount.state.totalEarned + calculatedReward + streakBonus,
            lastClaimTime: Date.now(),
            transactions: [newTx, ...currentAccount.state.transactions]
          }
        };

        setCurrentAccount(updatedAccount);
        setAccounts(prev => prev.map(acc => acc.username === currentAccount.username ? updatedAccount : acc));
        triggerModal(language === 'id' ? `✅ Berhasil klaim Rp ${(calculatedReward + streakBonus).toLocaleString('id-ID')}!` : `✅ Successfully claimed Rp ${(calculatedReward + streakBonus).toLocaleString('id-ID')}!`, 'success');
      } else {
        triggerModal(language === 'id' ? '❌ Gagal melakukan klaim (Mungkin capping terlampaui).' : '❌ Claim failed (Capping limit exceeded).', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerModal(language === 'id' ? '❌ Gagal menghubungi server.' : '❌ Failed to reach database.', 'danger');
    } finally {
      setIsClaiming(false);
    }
  };

  // 3. WELCOME BONUS
  const handleClaimWelcomeBonus = async () => {
    if (currentAccount.state.welcomeBonusClaimed) return;

    try {
      const success = await claimWelcomeBonusInSupabase(currentAccount.username);
      if (success) {
        const bonusAmount = 1800000;
        const newTx: Transaction = {
          id: 'WLC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          type: 'welcome_bonus',
          amount: bonusAmount,
          date: Date.now(),
          description: t.welcomeBonusTitle
        };

        const updatedAccount: UserAccount = {
          ...currentAccount,
          state: {
            ...currentAccount.state,
            mainBalance: currentAccount.state.mainBalance + bonusAmount,
            welcomeBonusClaimed: true,
            transactions: [newTx, ...currentAccount.state.transactions]
          }
        };

        setCurrentAccount(updatedAccount);
        setAccounts(prev => prev.map(acc => acc.username === currentAccount.username ? updatedAccount : acc));
        triggerModal(t.welcomeBonusClaimedSuccess, 'success');
      } else {
        triggerModal('❌ Gagal klaim bonus.', 'danger');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. DEPOSIT HANDLER WITH STORAGE COMPRESSION & PRIVATE SECURE UPLOAD
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDepositProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setDepositProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      triggerModal(language === 'id' ? 'Format file harus berupa gambar!' : 'File must be an image!', 'danger');
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || depositAmount < minDeposit) {
      triggerModal(language === 'id' ? `Minimal deposit Rp ${minDeposit.toLocaleString('id-ID')}` : `Minimum deposit is Rp ${minDeposit.toLocaleString('id-ID')}`, 'warning');
      return;
    }

    if (!depositProof) {
      triggerModal(language === 'id' ? '❌ Anda wajib melampirkan bukti transfer!' : '❌ Transfer proof is required!', 'danger');
      return;
    }

    setIsUploadingDeposit(true);
    try {
      const depId = 'DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const fileName = `${currentAccount.username}_${depId}_proof.jpg`;

      // Upload file to private Supabase bucket
      const { url: storageUrl, error: uploadErr } = await uploadProofToSupabaseStorage(depositProof, fileName);
      if (uploadErr || !storageUrl) {
        throw new Error(uploadErr || 'Upload failed');
      }

      // Record deposit in supabase with 'pending' status
      const success = await createDepositInSupabase(
        depId,
        currentAccount.username,
        depositAmount,
        depositMethod,
        storageUrl
      );

      if (success) {
        // Sync local interface state as pending
        const newTx: Transaction = {
          id: depId,
          type: 'deposit',
          amount: depositAmount,
          date: Date.now(),
          description: '⏳ Deposit (Pending)',
          proofImage: storageUrl,
          status: 'pending'
        };

        const updatedAccount: UserAccount = {
          ...currentAccount,
          state: {
            ...currentAccount.state,
            transactions: [newTx, ...currentAccount.state.transactions]
          }
        };

        setCurrentAccount(updatedAccount);
        setAccounts(prev => prev.map(acc => acc.username === currentAccount.username ? updatedAccount : acc));
        triggerModal(t.successDeposit, 'success');
        
        // Reset form
        setDepositAmount(minDeposit);
        setDepositProof(null);
        setDepositProofPreview(null);
      } else {
        triggerModal('❌ Gagal merekam pengajuan deposit.', 'danger');
      }
    } catch (err: any) {
      console.error(err);
      triggerModal(`❌ Upload gagal: ${err.message || err}`, 'danger');
    } finally {
      setIsUploadingDeposit(false);
    }
  };

  // 5. WITHDRAWAL HANDLER
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < minWithdraw) {
      triggerModal(language === 'id' ? `Minimal penarikan Rp ${minWithdraw.toLocaleString('id-ID')}` : `Minimum withdrawal is Rp ${minWithdraw.toLocaleString('id-ID')}`, 'warning');
      return;
    }

    if (currentAccount.state.mainBalance < withdrawAmount) {
      triggerModal(t.insufficientBalance, 'danger');
      return;
    }

    if (!accountNumber || !accountName) {
      triggerModal(language === 'id' ? 'Lengkapi nomor dan nama rekening tujuan!' : 'Fill in account details!', 'warning');
      return;
    }

    setIsWithdrawing(true);
    try {
      const wdId = 'WTH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const success = await createWithdrawalInSupabase(
        wdId,
        currentAccount.username,
        withdrawAmount,
        bankName,
        accountNumber,
        accountName
      );

      if (success) {
        const newTx: Transaction = {
          id: wdId,
          type: 'withdraw',
          amount: withdrawAmount,
          date: Date.now(),
          description: '⏳ Penarikan (Pending)',
          status: 'pending'
        };

        // Deduct balance instantly to prevent double-spending in frontend
        const updatedAccount: UserAccount = {
          ...currentAccount,
          state: {
            ...currentAccount.state,
            mainBalance: currentAccount.state.mainBalance - withdrawAmount,
            transactions: [newTx, ...currentAccount.state.transactions]
          }
        };

        setCurrentAccount(updatedAccount);
        setAccounts(prev => prev.map(acc => acc.username === currentAccount.username ? updatedAccount : acc));
        triggerModal(t.successWithdraw, 'success');
        
        // Reset form
        setWithdrawAmount(minWithdraw);
        setAccountNumber('');
        setAccountName('');
      } else {
        triggerModal('❌ Pengajuan penarikan gagal.', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerModal('❌ Terjadi kesalahan pengiriman data.', 'danger');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // 6. EDIT PROFILE & PASSWORD
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFullName) return;

    setIsUpdatingProfile(true);
    try {
      const updatedAccount: UserAccount = {
        ...currentAccount,
        fullName: profileFullName,
        phone: profilePhone
      };

      const success = await saveAccountToSupabase(updatedAccount);
      if (success) {
        setCurrentAccount(updatedAccount);
        setAccounts(prev => prev.map(acc => acc.username === currentAccount.username ? updatedAccount : acc));
        triggerModal(language === 'id' ? 'Profil berhasil diperbarui!' : 'Profile updated successfully!', 'success');
      } else {
        triggerModal('❌ Gagal menyimpan data profil.', 'danger');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    if (oldPassword !== currentAccount.password) {
      triggerModal(t.incorrectOldPassword, 'danger');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      triggerModal(language === 'id' ? 'Konfirmasi kata sandi baru tidak cocok!' : 'New password confirmation mismatch!', 'danger');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const updatedAccount: UserAccount = {
        ...currentAccount,
        password: newPassword
      };

      const success = await saveAccountToSupabase(updatedAccount);
      if (success) {
        setCurrentAccount(updatedAccount);
        setAccounts(prev => prev.map(acc => acc.username === currentAccount.username ? updatedAccount : acc));
        triggerModal(t.passwordUpdated, 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        triggerModal('❌ Gagal memperbarui kata sandi.', 'danger');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Dynamic calculations for downlines structure (holds / network)
  const directReferrals = currentAccount.state.holders || [];
  const level1Count = directReferrals.length;
  
  // Calculate total downlines up to level 3 and team volume
  const getDownlineTree = () => {
    const l1 = accounts.filter(acc => isMemberAccount(acc) && acc.invitedBy?.toLowerCase() === currentAccount.username.toLowerCase());
    const l2: UserAccount[] = [];
    const l3: UserAccount[] = [];

    l1.forEach(accL1 => {
      const matches = accounts.filter(acc => isMemberAccount(acc) && acc.invitedBy?.toLowerCase() === accL1.username.toLowerCase());
      l2.push(...matches);
    });

    l2.forEach(accL2 => {
      const matches = accounts.filter(acc => isMemberAccount(acc) && acc.invitedBy?.toLowerCase() === accL2.username.toLowerCase());
      l3.push(...matches);
    });

    const totalL1Contracts = l1.reduce((sum, acc) => sum + acc.state.activeContracts, 0);
    const totalL2Contracts = l2.reduce((sum, acc) => sum + acc.state.activeContracts, 0);
    const totalL3Contracts = l3.reduce((sum, acc) => sum + acc.state.activeContracts, 0);

    const totalVolume = (totalL1Contracts + totalL2Contracts + totalL3Contracts) * pricePerUnit;

    return {
      l1,
      l2,
      l3,
      totalCount: l1.length + l2.length + l3.length,
      totalVolume
    };
  };

  const downlineStats = getDownlineTree();

  // Enforce 250% Capping Calculation
  const maxCappingEarnings = currentAccount.state.activeContracts * pricePerUnit * (cappingPercent / 100);
  const earnedTowardsCapping = currentAccount.state.transactions
    .filter(tx => ['reward', 'referral', 'rebate'].includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingCapping = Math.max(0, maxCappingEarnings - earnedTowardsCapping);
  const cappingProgressPercent = maxCappingEarnings > 0 
    ? Math.min(100, (earnedTowardsCapping / maxCappingEarnings) * 100)
    : 0;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR FOR DESKTOP / TOP BAR FOR MOBILE */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-purple-950/35 p-5 flex flex-col justify-between shrink-0">
        
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex flex-col border-b border-purple-950/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#070313] flex items-center justify-center text-[10px] font-black text-yellow-500">
                  GG
                </div>
              </div>
              <div>
                <span className="text-sm font-black tracking-widest text-white uppercase font-orbitron">
                  GROCK<span className="text-yellow-500">GOLD</span>
                </span>
                <span className="block text-[6.5px] text-slate-500 font-extrabold tracking-widest uppercase font-sans">MEMBER PORTAL</span>
              </div>
            </div>
          </div>

          {/* User badge */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center overflow-hidden shrink-0">
              {currentAccount.state.profileImage ? (
                <img src={currentAccount.state.profileImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4.5 h-4.5 text-yellow-500" />
              )}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-[11px] text-slate-400 font-extrabold font-mono uppercase tracking-widest truncate">@{currentAccount.username}</p>
              <h4 className="text-xs font-black text-white truncate max-w-[130px]">{currentAccount.fullName}</h4>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'buy', label: t.buyContract, icon: Coins },
              { id: 'mine', label: t.miningTerminal, icon: Cpu },
              { id: 'wallet', label: t.wallet, icon: Wallet },
              { id: 'network', label: t.network, icon: NetworkIcon },
              { id: 'profile', label: t.profile, icon: User },
              { id: 'faq', label: 'FAQ', icon: HelpCircle }
            ].map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-wider shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/10 font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-purple-950/40 hidden md:block">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/15 transition uppercase tracking-wider cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>

      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* HEADER BAR WITH GLOBAL CONFIG SUMMARY */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-950/35">
          <div>
            <h2 className="text-xl font-black uppercase text-white font-orbitron tracking-widest">{t.welcomeTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.welcomeSubtitle}</p>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            <div className="bg-slate-900 border border-yellow-500/20 px-3.5 py-1.5 rounded-xl text-xs font-mono font-black text-yellow-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              1 GLD = Rp {pricePerUnit.toLocaleString('id-ID')}
            </div>
            
            <button
              onClick={onLogout}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/20 text-rose-400 uppercase cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>
          </div>
        </header>

        {/* -----------------------------------------------------------------
            TAB 1: DASHBOARD OVERVIEW 
            ----------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Capping status / welcome banner */}
            {!currentAccount.state.welcomeBonusClaimed && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/15 border border-yellow-500/40 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-widest">{t.welcomeBonusTitle}</h4>
                  <p className="text-[11px] text-slate-300 font-bold mt-1">Dapatkan modal pendaftaran instan Rp 1.800.000 secara gratis untuk memulai eksplorasi emas.</p>
                </div>
                <button
                  onClick={handleClaimWelcomeBonus}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-black rounded-xl tracking-widest transition uppercase active:scale-95 shrink-0 shadow-lg cursor-pointer"
                >
                  🎁 KLAIM SEKARANG
                </button>
              </div>
            )}

            {/* Core Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition" />
                <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{t.mainBalance}</span>
                <h3 className="text-xl font-black text-yellow-500 mt-2 font-orbitron">Rp {currentAccount.state.mainBalance.toLocaleString('id-ID')}</h3>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setActiveTab('wallet')} className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase text-slate-300 rounded-lg transition cursor-pointer">DEPOSIT</button>
                  <button onClick={() => setActiveTab('wallet')} className="flex-1 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-[10px] font-black uppercase text-yellow-400 rounded-lg transition cursor-pointer">WITHDRAW</button>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-16 h-16 bg-purple-500/5 rounded-full blur-xl" />
                <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{t.totalContracts}</span>
                <h3 className="text-xl font-black text-white mt-2 font-orbitron">{currentAccount.state.activeContracts} UNIT</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t.portfolioValue}</span>
                  <span className="text-[11px] text-slate-300 font-bold font-mono">Rp {(currentAccount.state.activeContracts * pricePerUnit).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{t.dailyReward}</span>
                <h3 className="text-xl font-black text-emerald-400 mt-2 font-orbitron">Rp {(currentAccount.state.activeContracts * pricePerUnit * (dailyRewardPercent / 100)).toLocaleString('id-ID')} / claim</h3>
                <div className="flex justify-between items-center mt-4 text-[10px] text-slate-400 font-bold uppercase">
                  <span>claim rate</span>
                  <span className="text-yellow-500 font-black">{dailyRewardPercent.toFixed(1)}% / hari</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{t.totalEarned}</span>
                <h3 className="text-xl font-black text-white mt-2 font-orbitron">Rp {currentAccount.state.totalEarned.toLocaleString('id-ID')}</h3>
                <div className="flex justify-between items-center mt-4 text-[10px] text-slate-400 font-bold uppercase">
                  <span>Rebate / Referral</span>
                  <span className="text-purple-400 font-bold">Rp {(currentAccount.state.referralEarned + currentAccount.state.rebateEarned).toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>

            {/* Capping Progress block */}
            <div className="bg-[#100726]/30 border border-purple-950/40 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                    <span>{t.cappingProgress}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Pendapatan dibatasi maksimal {cappingPercent}% dari nilai kontrak aktif Anda (Capping Rule). Beli lebih banyak kontrak untuk meningkatkan batas capping.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-extrabold block">{t.remaining}</span>
                  <span className="text-xs font-black text-yellow-500 font-mono font-orbitron">Rp {remainingCapping.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 transition-all duration-1000"
                    style={{ width: `${cappingProgressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-extrabold font-mono uppercase">
                  <span>{earnedTowardsCapping.toLocaleString('id-ID')} ({cappingProgressPercent.toFixed(1)}%)</span>
                  <span>max: {maxCappingEarnings.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Grid for Claim module + Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Claim Module */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4">
                  <span className="text-[10px] text-yellow-500 font-black tracking-widest uppercase block">AUTOMATED MINING</span>
                  <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                    <Cpu className="w-8 h-8 text-yellow-500 animate-spin-slow" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white uppercase">{t.miningSystemActive}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold max-w-xs mx-auto leading-normal">
                      Ekskavator Anda mengumpulkan emas batuan di Johannesburg. Klaim hasil tambang Anda sekarang.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {claimTimer ? (
                    <button
                      disabled
                      className="w-full py-4 rounded-2xl text-xs font-black tracking-widest bg-slate-950 border border-white/5 text-slate-500 uppercase flex flex-col items-center justify-center gap-1"
                    >
                      <span>COOLDOWN AKTIF</span>
                      <span className="text-yellow-500/80 font-orbitron font-black tracking-[0.15em] text-sm">{claimTimer}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleClaimDailyReward}
                      disabled={isClaiming || currentAccount.state.activeContracts <= 0}
                      className="w-full py-4 rounded-2xl text-xs font-black tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-[0.98] transition uppercase cursor-pointer disabled:opacity-50"
                    >
                      {isClaiming ? 'SEDANG MEMPROSES...' : '⛏️ KLAIM HASIL SEKARANG'}
                    </button>
                  )}
                  
                  <p className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider font-mono">Klaim tersedia setiap siklus 24 jam</p>
                </div>
              </div>

              {/* Transactions Log */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-white/5 rounded-3xl p-5 space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">{t.txHistory}</h4>
                  <button onClick={() => setActiveTab('wallet')} className="text-[10px] text-yellow-400 font-extrabold uppercase hover:underline">LIHAT SEMUA</button>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-none pr-1">
                  {currentAccount.state.transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs font-mono">{t.emptyTx}</div>
                  ) : (
                    currentAccount.state.transactions.slice(0, 6).map((tx) => (
                      <div key={tx.id} className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs transition hover:border-white/10">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-white truncate max-w-[250px]">{tx.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="uppercase">{tx.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-black font-mono block ${
                            ['purchase', 'withdraw'].includes(tx.type) ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {['purchase', 'withdraw'].includes(tx.type) ? '-' : '+'}Rp {tx.amount.toLocaleString('id-ID')}
                          </span>
                          <span className={`text-[8.5px] font-black uppercase tracking-widest block ${
                            tx.status === 'pending' ? 'text-yellow-500' : tx.status === 'rejected' ? 'text-rose-500' : 'text-slate-500'
                          }`}>
                            {tx.status || 'selesai'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 2: BUY CONTRACTS (TOKO KONTRAK)
            ----------------------------------------------------------------- */}
        {activeTab === 'buy' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-5 space-y-4">
                <span className="text-[10px] text-yellow-500 font-black tracking-widest uppercase block">{t.contractStore}</span>
                <h3 className="text-2xl font-black text-white uppercase font-orbitron">{t.stockContract}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t.contractDesc} Setiap unit kontrak memberi Anda andil dalam pengoperasian armada excavator tambang emas RandGold, mendistribusikan yield harian otomatis sebesar {dailyRewardPercent.toFixed(1)}% setiap hari.
                </p>

                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">{t.price}</span>
                    <span className="text-yellow-400 font-black font-mono">Rp {pricePerUnit.toLocaleString('id-ID')} / Unit</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">Yield Harian Est</span>
                    <span className="text-emerald-400 font-black font-mono">{dailyRewardPercent.toFixed(1)}% / hari</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">Maksimum Capping</span>
                    <span className="text-rose-400 font-black font-mono">{cappingPercent}% ({ (pricePerUnit * (cappingPercent/100)).toLocaleString('id-ID') } / Unit)</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 bg-slate-950 border border-purple-950/40 p-6 rounded-2xl space-y-6">
                <form onSubmit={handleBuyContracts} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{t.qty}</label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setBuyUnits(prev => Math.max(1, prev - 1))}
                        className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 hover:border-white/20 text-white font-black text-md transition cursor-pointer"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="1"
                        value={buyUnits}
                        onChange={(e) => setBuyUnits(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 h-12 rounded-xl bg-slate-900 border border-white/5 text-center text-white font-black font-mono text-lg focus:border-yellow-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setBuyUnits(prev => prev + 1)}
                        className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 hover:border-white/20 text-white font-black text-md transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/5 my-4" />

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">{t.totalPayment}</span>
                    <span className="text-xl font-black text-yellow-500 font-mono font-orbitron">Rp {(buyUnits * pricePerUnit).toLocaleString('id-ID')}</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={isBuying || buyUnits <= 0}
                    className="w-full py-4 rounded-xl text-xs font-black tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 active:scale-[0.98] transition uppercase cursor-pointer disabled:opacity-50"
                  >
                    {isBuying ? 'SEDANG TRANSAKSI...' : '🪙 BELI KONTRAK SEKARANG'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 3: MINING TERMINAL (SIMULATOR RETRO EMAS)
            ----------------------------------------------------------------- */}
        {activeTab === 'mine' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-[#050212]/80 border border-purple-500/20 p-5 sm:p-7 rounded-[32px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-purple-500/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] text-yellow-500 font-black tracking-widest uppercase block">SYS OPERATION CENTER</span>
                  <h3 className="text-lg font-black text-white uppercase font-orbitron tracking-wider">JOHANNESBURG TELEMETRY</h3>
                </div>
                <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-purple-950/40 px-3.5 py-1.5 rounded-xl font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  EFFICIENT HASH-RATE SECURE
                </div>
              </div>

              {/* Graphical Simulator Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center">
                  <Coins className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Produksi Emas Real-time</span>
                  <h4 className="text-lg font-black text-white font-mono mt-1">{(currentAccount.state.activeContracts * 0.125).toFixed(3)} Oz / jam</h4>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center">
                  <Cpu className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Efisiensi Excavator</span>
                  <h4 className="text-lg font-black text-emerald-400 mt-1">98.4% (EXCELLENT)</h4>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center">
                  <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Kontrak Tambang</span>
                  <h4 className="text-lg font-black text-white mt-1">{currentAccount.state.activeContracts} UNIT S&P</h4>
                </div>

              </div>

              {/* Giant claim widget */}
              <div className="mt-8 bg-black/40 border border-white/5 rounded-2xl p-6 text-center space-y-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">KLAIM MINING REWARD HARIAN</span>
                
                {claimTimer ? (
                  <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-900 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black uppercase">CLAIM COOLDOWN AKTIF</p>
                    <div className="text-2xl font-black text-yellow-500 font-orbitron tracking-widest mt-1">{claimTimer}</div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <button
                      onClick={handleClaimDailyReward}
                      disabled={isClaiming || currentAccount.state.activeContracts <= 0}
                      className="w-full py-4 rounded-xl text-xs font-black tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 hover:shadow-yellow-500/10 transition uppercase disabled:opacity-50 cursor-pointer"
                    >
                      {isClaiming ? 'MENGHUBUNGI PORTAL...' : '⛏️ AMBIL REWARD SEKARANG'}
                    </button>
                  </div>
                )}

                <p className="text-[10.5px] text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
                  Semua yield diproduksi secara real-time berdasarkan kapasitas excavator fisik. Pastikan Anda melakukan klaim setiap 24 jam sebelum cooldown berakhir.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 4: WALLET DEPOSIT & WITHDRAW
            ----------------------------------------------------------------- */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* DEPOSIT Dana */}
              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-6">
                <div>
                  <span className="text-[10px] text-yellow-500 font-black tracking-widest uppercase block">DEPOSIT PORTAL</span>
                  <h3 className="text-lg font-black text-white uppercase font-orbitron">{t.deposit}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Lakukan transfer ke rekening bank lokal atau alamat USDT di bawah ini untuk menambahkan Saldo Utama Anda.</p>
                </div>

                {/* Bank / USDT Instructions */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setDepositMethod('BCA')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                        depositMethod === 'BCA' 
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' 
                          : 'bg-transparent text-slate-400 border-white/5'
                      }`}
                    >
                      LOCAL BANK (BCA)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDepositMethod('USDT')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                        depositMethod === 'USDT' 
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' 
                          : 'bg-transparent text-slate-400 border-white/5'
                      }`}
                    >
                      CRYPTO (USDT ERC-20)
                    </button>
                  </div>

                  {depositMethod === 'BCA' ? (
                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase">BANK TRANSFER</p>
                      <p className="font-bold text-white uppercase">BANK: BCA (BANK CENTRAL ASIA)</p>
                      <p className="font-mono text-yellow-500 font-black text-md select-all cursor-pointer">0562167917</p>
                      <p className="text-slate-300 font-semibold">NAMA: REZAL PRATAMA</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase">ERC-20 USDT PORT</p>
                      <p className="font-bold text-white uppercase">NETWORK: ERC-20 / ETHEREUM</p>
                      <p className="font-mono text-yellow-500 font-black text-[11px] select-all break-all cursor-pointer">0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{t.nominalDeposit}</label>
                    <input 
                      type="number"
                      min={minDeposit}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-black font-mono focus:border-yellow-500 outline-none"
                    />
                  </div>

                  {/* Drag and Drop Secure File Upload Area */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">Bukti Transfer (Screenshot/Foto)</label>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                        isDragOver 
                          ? 'border-yellow-500 bg-yellow-500/5' 
                          : depositProof 
                            ? 'border-emerald-500 bg-emerald-500/5' 
                            : 'border-white/10 hover:border-yellow-500/30'
                      }`}
                    >
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {depositProofPreview ? (
                        <div className="space-y-2 relative">
                          <img src={depositProofPreview} alt="Proof" className="max-h-28 rounded-lg object-contain mx-auto" />
                          <p className="text-[10px] text-emerald-400 font-black uppercase">BUKTI DISIAPKAN • {depositProof?.name}</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 animate-pulse" />
                          <p className="text-[11px] text-slate-300 font-extrabold uppercase">Tarik & Lepas Bukti atau Klik untuk Memilih</p>
                          <p className="text-[9.5px] text-slate-500 font-semibold font-mono">Format JPEG/PNG. Maks 10MB.</p>
                        </>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isUploadingDeposit || depositAmount < minDeposit || !depositProof}
                    className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition uppercase disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingDeposit ? 'SEDANG MENGUPLOAD BUKTI...' : '📤 PROSES DEPOSIT SEKARANG'}
                  </button>
                </form>
              </div>

              {/* WITHDRAW Saldo */}
              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-6">
                <div>
                  <span className="text-[10px] text-yellow-500 font-black tracking-widest uppercase block">WITHDRAWAL PORTAL</span>
                  <h3 className="text-lg font-black text-white uppercase font-orbitron">{t.withdraw}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Tarik saldo utama Anda langsung ke rekening bank lokal atau dompet USDT Anda secara aman.</p>
                </div>

                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">PILIH BANK TUJUAN</label>
                    <select 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-bold focus:border-yellow-500 outline-none"
                    >
                      <option value="BCA">BCA (BANK CENTRAL ASIA)</option>
                      <option value="MANDIRI">MANDIRI</option>
                      <option value="BNI">BNI</option>
                      <option value="BRI">BRI</option>
                      <option value="USDT ERC20">USDT (ERC-20)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">NOMOR REKENING / ALAMAT DOMPET</label>
                    <input 
                      type="text"
                      required
                      placeholder="Masukkan No Rekening atau Alamat USDT"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-bold focus:border-yellow-500 outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">NAMA REKENING PENERIMA</label>
                    <input 
                      type="text"
                      required
                      placeholder="Nama Sesuai Rekening Bank"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-bold focus:border-yellow-500 outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">NOMINAL PENARIKAN</label>
                    <input 
                      type="number"
                      min={minWithdraw}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-black font-mono focus:border-yellow-500 outline-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-extrabold uppercase">
                      <span>Min: Rp {minWithdraw.toLocaleString('id-ID')}</span>
                      <span>Tersedia: Rp {currentAccount.state.mainBalance.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isWithdrawing || withdrawAmount < minWithdraw || currentAccount.state.mainBalance < withdrawAmount}
                    className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition uppercase disabled:opacity-50 cursor-pointer"
                  >
                    {isWithdrawing ? 'MEMPROSES VERIFIKASI...' : '💸 PROSES PENARIKAN SEKARANG'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 5: MLM NETWORK (REFERRAL / JARANGAN)
            ----------------------------------------------------------------- */}
        {activeTab === 'network' && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Referral Code Box */}
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-[10px] text-yellow-500 font-black tracking-widest uppercase block">{t.referral}</span>
                <h3 className="text-xl font-black text-white uppercase font-orbitron">{t.referralCommission}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-1">
                  Undang rekan Anda ke GrockGold Mining dan dapatkan komisi instan berjenjang 3 level (Level 1: 10%, Level 2: 3%, Level 3: 2%) dari setiap pembelian kontrak yang mereka lakukan.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider block">{t.referralCode}</span>
                    <span className="text-md font-black text-yellow-400 font-mono tracking-widest uppercase">{currentAccount.referralCode || currentAccount.username}</span>
                  </div>
                  <button 
                    onClick={handleCopyCode}
                    className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/5 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="overflow-hidden pr-2">
                    <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider block">{t.referralLink}</span>
                    <span className="text-[10.5px] text-slate-400 font-mono truncate block">{window.location.origin}/?ref={currentAccount.referralCode || currentAccount.username}</span>
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/5 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Downlines Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[9.5px] text-slate-500 font-black uppercase block">Level 1 (Direct)</span>
                <h4 className="text-xl font-black text-white mt-1 font-orbitron">{downlineStats.l1.length} Anggota</h4>
              </div>
              <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[9.5px] text-slate-500 font-black uppercase block">Level 2 (Indirect)</span>
                <h4 className="text-xl font-black text-white mt-1 font-orbitron">{downlineStats.l2.length} Anggota</h4>
              </div>
              <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[9.5px] text-slate-500 font-black uppercase block">Level 3 (Indirect)</span>
                <h4 className="text-xl font-black text-white mt-1 font-orbitron">{downlineStats.l3.length} Anggota</h4>
              </div>
            </div>

            {/* Direct Referral Table List */}
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">{t.downlineStructure}</h4>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
                {downlineStats.l1.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-mono">Belum ada downline terdaftar menggunakan link Anda</div>
                ) : (
                  downlineStats.l1.map((child) => (
                    <div key={child.username} className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs transition hover:border-white/10">
                      <div>
                        <p className="font-extrabold text-white">@{child.username} ({child.fullName})</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Gabung: {new Date(child.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-yellow-500 font-mono block">{child.state.activeContracts} UNIT KONTRAK</span>
                        <span className="text-[9.5px] text-slate-500 font-semibold block">Level 1 Direct</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 6: USER PROFILE & SETTINGS
            ----------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Account Details form */}
              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase font-orbitron">{t.profileDataTitle}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Perbarui data profil keanggotaan Anda di bawah ini.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">USERNAME</label>
                    <input 
                      type="text"
                      disabled
                      value={currentAccount.username}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-slate-500 text-xs font-black font-mono cursor-not-allowed outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">ALAMAT EMAIL</label>
                    <input 
                      type="email"
                      disabled
                      value={currentAccount.email}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-slate-500 text-xs font-black font-mono cursor-not-allowed outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{t.fullName}</label>
                    <input 
                      type="text"
                      required
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0d0721] border border-white/5 text-white text-xs font-extrabold focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{t.phoneNumber}</label>
                    <input 
                      type="text"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0d0721] border border-white/5 text-white text-xs font-extrabold focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition uppercase cursor-pointer"
                  >
                    {isUpdatingProfile ? 'SEDANG MEMPERBARUI...' : '💾 SIMPAN INFORMASI PROFIL'}
                  </button>
                </form>
              </div>

              {/* Password update form */}
              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase font-orbitron">{t.changePasswordTitle}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Ubah sandi keamanan login Anda secara berkala untuk menjaga keamanan akun.</p>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{t.oldPassword}</label>
                    <input 
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-bold focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{t.newPassword}</label>
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-bold focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{t.confirmNewPassword}</label>
                    <input 
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/5 text-white text-xs font-bold focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition uppercase cursor-pointer"
                  >
                    {isUpdatingPassword ? 'SEDANG MENGUBAH SANDI...' : '🔐 PERBARUI KATA SANDI'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 7: HELP CENTER FAQ 
            ----------------------------------------------------------------- */}
        {activeTab === 'faq' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-[10px] text-yellow-500 font-black tracking-widest uppercase block">CUSTOMER CARE</span>
                <h3 className="text-xl font-black text-white uppercase font-orbitron">{t.faqTitle}</h3>
                <p className="text-[11px] text-slate-400 font-bold">Butuh jawaban cepat terkait operasional tambang emas RandGold?</p>
              </div>

              <div className="space-y-3 max-w-4xl mx-auto">
                {(language === 'id' ? [
                  { q: 'Bagaimana cara mulai menghasilkan profit harian?', a: 'Sangat mudah! Pertama, lakukan deposit ke rekening bank BCA resmi kami. Setelah saldo Anda diperbarui, masuk ke menu "Beli Kontrak" dan beli jumlah unit kontrak yang Anda inginkan. Setiap unit kontrak akan menghasilkan profit harian otomatis sebesar 4.0%.' },
                  { q: 'Berapa batas maksimum pendapatan (Capping Rule)?', a: 'Sistem menerapkan aturan capping sebesar 250% dari nilai total kontrak aktif Anda. Ini berarti jika Anda memiliki kontrak senilai Rp 1.800.000, Anda dapat menghasilkan hingga Rp 4.500.000 sebelum kontrak tersebut selesai (expired). Batas ini mencakup semua jenis komisi, rebate harian, dan bonus.' },
                  { q: 'Kapan hasil tambang / reward harian bisa diklaim?', a: 'Hasil tambang harian Anda diproduksi secara real-time dan dapat diklaim setiap 24 jam sekali di menu "Mining Terminal". Setelah diklaim, dana akan langsung masuk ke Saldo Utama Anda.' },
                  { q: 'Berapa minimal transaksi deposit dan penarikan?', a: 'Minimal deposit dana adalah sebesar Rp 100.000, dan minimal penarikan (withdraw) saldo harian adalah sebesar Rp 100.000.' },
                  { q: 'Bagaimana komisi referral berjenjang bekerja?', a: 'Kami menawarkan bonus kemitraan hingga 3 level kedalaman: Level 1 (Direct) sebesar 10% dari nominal pembelian kontrak downline Anda, Level 2 sebesar 3%, dan Level 3 sebesar 2%. Komisi langsung ditambahkan ke saldo Anda secara real-time.' }
                ] : [
                  { q: 'How do I start generating daily profit?', a: 'First, make a deposit to our official bank account. Once your main balance is updated, navigate to the "Buy Contract" store and buy your desired units. Each active contract unit yields a 4.0% automatic return daily.' },
                  { q: 'What is the maximum earnings limit (Capping Rule)?', a: 'We enforce a 250% capping rule on all active portfolios. If you hold contracts worth Rp 1,800,000, you can earn up to Rp 4,500,000 before the contracts mature and expire. This limit covers all referral rewards, daily yields, and bonuses.' },
                  { q: 'When can I claim my mining yields / daily rewards?', a: 'Mining yields compile continuously in real-time. You can claim them once every 24 hours under the "Mining Terminal" tab. Upon claiming, the funds are instantly added to your Main Balance.' },
                  { q: 'What are the minimum deposit and withdrawal amounts?', a: 'The minimum amount for deposits is Rp 100,000, and the minimum amount for daily withdrawals is also Rp 100,000.' },
                  { q: 'How does the multi-tier referral system work?', a: 'We offer an lucrative 3-tier affiliate program: Level 1 (Direct) yields 10% of your invitees contract purchases, Level 2 yields 3%, and Level 3 yields 2%. Commissions are paid out instantly in real-time.' }
                ]).map((item, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-start gap-2">
                      <span className="text-slate-500 font-bold">Q:</span>
                      <span>{item.q}</span>
                    </h4>
                    <p className="text-[11.5px] text-slate-300 font-semibold leading-relaxed pl-5">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
