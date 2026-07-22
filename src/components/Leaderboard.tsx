import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Trophy,
  Users,
  Cpu,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { UserAccount, AppState, CONFIG, isMemberAccount } from '../types';

// Premium responsive 3D Crown SVG for Podium Cards
const CrownSVG = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <svg className="w-10 h-8.5 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-bounce duration-[1800ms] absolute -top-6.5 left-1/2 -translate-x-1/2 z-20" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#facc15" />
            <stop offset="70%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <linearGradient id="jewel-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="jewel-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
        </defs>
        <path d="M 20 58 Q 50 68 80 58 Q 50 53 20 58 Z" fill="#713f12" />
        <path d="M 18 58 L 10 32 L 30 46 L 50 14 L 70 46 L 90 32 L 82 58 Q 50 68 18 58 Z" fill="url(#gold-grad)" stroke="#451a03" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M 18 58 Q 50 68 82 58" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeOpacity="0.8" />
        <path d="M 18 58 Q 50 68 82 58 L 80 66 Q 50 76 20 66 Z" fill="url(#gold-grad)" stroke="#451a03" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="30" cy="64.5" r="3.5" fill="url(#jewel-purple)" stroke="#1e1b4b" strokeWidth="0.5" />
        <circle cx="50" cy="67" r="4.5" fill="url(#jewel-red)" stroke="#1e1b4b" strokeWidth="0.5" />
        <circle cx="70" cy="64.5" r="3.5" fill="url(#jewel-purple)" stroke="#1e1b4b" strokeWidth="0.5" />
        <circle cx="10" cy="32" r="5" fill="url(#jewel-red)" stroke="#451a03" strokeWidth="1" />
        <circle cx="30" cy="46" r="4" fill="url(#jewel-purple)" stroke="#451a03" strokeWidth="1" />
        <circle cx="50" cy="14" r="6.5" fill="url(#jewel-red)" stroke="#451a03" strokeWidth="1" />
        <circle cx="70" cy="46" r="4" fill="url(#jewel-purple)" stroke="#451a03" strokeWidth="1" />
        <circle cx="90" cy="32" r="5" fill="url(#jewel-red)" stroke="#451a03" strokeWidth="1" />
      </svg>
    );
  }
  if (rank === 2) {
    return (
      <svg className="w-9 h-8 drop-shadow-[0_0_6px_rgba(203,213,225,0.4)] absolute -top-6 left-1/2 -translate-x-1/2 z-20" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="jewel-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="jewel-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <path d="M 20 58 Q 50 68 80 58 Q 50 53 20 58 Z" fill="#334155" />
        <path d="M 18 58 L 10 32 L 30 46 L 50 14 L 70 46 L 90 32 L 82 58 Q 50 68 18 58 Z" fill="url(#silver-grad)" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M 18 58 Q 50 68 82 58" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
        <path d="M 18 58 Q 50 68 82 58 L 80 66 Q 50 76 20 66 Z" fill="url(#silver-grad)" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="30" cy="64.5" r="3" fill="url(#jewel-teal)" stroke="#0f172a" strokeWidth="0.5" />
        <circle cx="50" cy="67" r="4" fill="url(#jewel-blue)" stroke="#0f172a" strokeWidth="0.5" />
        <circle cx="70" cy="64.5" r="3" fill="url(#jewel-teal)" stroke="#0f172a" strokeWidth="0.5" />
        <circle cx="10" cy="32" r="4" fill="url(#jewel-blue)" stroke="#1e293b" strokeWidth="1" />
        <circle cx="30" cy="46" r="3.5" fill="url(#jewel-teal)" stroke="#1e293b" strokeWidth="1" />
        <circle cx="50" cy="14" r="5.5" fill="url(#jewel-blue)" stroke="#1e293b" strokeWidth="1" />
        <circle cx="70" cy="46" r="3.5" fill="url(#jewel-teal)" stroke="#1e293b" strokeWidth="1" />
        <circle cx="90" cy="32" r="4" fill="url(#jewel-blue)" stroke="#1e293b" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg className="w-9 h-8 drop-shadow-[0_0_6px_rgba(180,83,9,0.4)] absolute -top-6 left-1/2 -translate-x-1/2 z-20" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bronze-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="jewel-bronze-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="jewel-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path d="M 20 58 Q 50 68 80 58 Q 50 53 20 58 Z" fill="#431407" />
      <path d="M 18 58 L 10 32 L 30 46 L 50 14 L 70 46 L 90 32 L 82 58 Q 50 68 18 58 Z" fill="url(#bronze-grad)" stroke="#3c0c00" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M 18 58 Q 50 68 82 58" fill="none" stroke="#ffedd5" strokeWidth="1.5" strokeOpacity="0.8" />
      <path d="M 18 58 Q 50 68 82 58 L 80 66 Q 50 76 20 66 Z" fill="url(#bronze-grad)" stroke="#3c0c00" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="30" cy="64.5" r="3" fill="url(#jewel-bronze-purple)" stroke="#270500" strokeWidth="0.5" />
      <circle cx="50" cy="67" r="4" fill="url(#jewel-orange)" stroke="#270500" strokeWidth="0.5" />
      <circle cx="70" cy="64.5" r="3" fill="url(#jewel-bronze-purple)" stroke="#270500" strokeWidth="0.5" />
      <circle cx="10" cy="32" r="4" fill="url(#jewel-orange)" stroke="#3c0c00" strokeWidth="1" />
      <circle cx="30" cy="46" r="3.5" fill="url(#jewel-bronze-purple)" stroke="#3c0c00" strokeWidth="1" />
      <circle cx="50" cy="14" r="5.5" fill="url(#jewel-orange)" stroke="#3c0c00" strokeWidth="1" />
      <circle cx="70" cy="46" r="3.5" fill="url(#jewel-bronze-purple)" stroke="#3c0c00" strokeWidth="1" />
      <circle cx="90" cy="32" r="4" fill="url(#jewel-orange)" stroke="#3c0c00" strokeWidth="1" />
    </svg>
  );
};

// Premium Gold Wreath Laurels flanking the Rank 1 avatar
const LaurelWreath = () => {
  return (
    <svg className="absolute -inset-x-5 -inset-y-3.5 w-[calc(100%+40px)] h-[calc(100%+24px)] pointer-events-none opacity-[0.32] z-0" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="laurel-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M 42 75 C 32 70, 26 55, 28 35" stroke="url(#laurel-gold)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 28 35 Q 22 33, 24 28 Q 30 30, 28 35" fill="url(#laurel-gold)" />
      <path d="M 29 45 Q 21 44, 21 38 Q 28 39, 29 45" fill="url(#laurel-gold)" />
      <path d="M 31 55 Q 23 56, 21 50 Q 28 49, 31 55" fill="url(#laurel-gold)" />
      <path d="M 35 65 Q 26 68, 24 62 Q 31 60, 35 65" fill="url(#laurel-gold)" />
      <path d="M 40 73 Q 31 77, 29 71 Q 36 68, 40 73" fill="url(#laurel-gold)" />
      <path d="M 78 75 C 88 70, 94 55, 92 35" stroke="url(#laurel-gold)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 92 35 Q 98 33, 96 28 Q 90 30, 92 35" fill="url(#laurel-gold)" />
      <path d="M 91 45 Q 99 44, 99 38 Q 92 39, 91 45" fill="url(#laurel-gold)" />
      <path d="M 89 55 Q 97 56, 99 50 Q 92 49, 89 55" fill="url(#laurel-gold)" />
      <path d="M 85 65 Q 94 68, 96 62 Q 89 60, 85 65" fill="url(#laurel-gold)" />
      <path d="M 80 73 Q 89 77, 91 71 Q 84 68, 80 73" fill="url(#laurel-gold)" />
    </svg>
  );
};

interface LeaderboardProps {
  accounts: UserAccount[];
  state: AppState;
  currentAccount: UserAccount | null;
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
}

export default function Leaderboard({
  accounts,
  state,
  currentAccount,
  language,
  setCurrentTab
}: LeaderboardProps) {
  const [leaderboardFilter, setLeaderboardFilter] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [leaderboardCategory, setLeaderboardCategory] = useState<'investor' | 'referral' | 'contract' | 'profit'>('investor');
  const [expandedLeaderboardUser, setExpandedLeaderboardUser] = useState<string | null>(null);

  // Helper to render high-fidelity custom avatar (Initials or custom image) with premium glowing borders
  const renderAvatar = (user: any, sizeClasses: string = "w-[90px] h-[90px]", borderGlowClass: string = "border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]") => {
    if (!user) {
      return (
        <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-slate-800 to-slate-900 ${borderGlowClass} flex items-center justify-center relative overflow-hidden shrink-0`}>
          <svg className="w-1/2 h-1/2 text-slate-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    if (user.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt={user.fullName}
          referrerPolicy="no-referrer"
          className={`${sizeClasses} rounded-full object-cover ${borderGlowClass}`}
        />
      );
    }
    const initials = user.fullName 
      ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() 
      : user.username.slice(0, 2).toUpperCase();
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-tr from-[#1f1235] via-[#331c54] to-[#c59c35]/30 ${borderGlowClass} flex items-center justify-center font-black text-amber-300 tracking-wider relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <span className="relative z-10 font-orbitron">{initials}</span>
      </div>
    );
  };

  // Helper to get category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'investor': return '💰';
      case 'referral': return '👥';
      case 'contract': return '📄';
      case 'profit': return '📈';
      default: return '🏆';
    }
  };

  // Real dynamic sorting & scoring using database accounts with absolute business-logic accuracy
  const processedLeaderboard = useMemo(() => {
    // Exclude admin from the leaderboard
    let filteredAccounts = accounts.filter(isMemberAccount);

    // Ensure current logged in user is included if non-admin
    if (currentAccount && isMemberAccount(currentAccount)) {
      const exists = filteredAccounts.some(u => u.username.toLowerCase() === currentAccount.username.toLowerCase());
      if (!exists) {
        filteredAccounts = [currentAccount, ...filteredAccounts];
      }
    }

    const isWeekly = leaderboardFilter === 'weekly';
    const isMonthly = leaderboardFilter === 'monthly';
    const now = Date.now();
    const weekAgo = now - 7 * 86400 * 1000;
    const monthAgo = now - 30 * 86400 * 1000;

    const mapped = filteredAccounts.map(u => {
      const isSelf = currentAccount && u.username.toLowerCase() === currentAccount.username.toLowerCase();
      const activeState = isSelf ? { ...u.state, ...state } : u.state;

      // 1. Deposit: Accumulation of successful deposits (approved/completed)
      const approvedDeposits = (activeState?.transactions || []).filter(
        tx => tx.type === 'deposit' && (
          tx.status === 'approved' || 
          tx.status === 'success' ||
          tx.status === 'completed' ||
          tx.status === undefined || 
          tx.description.includes('Disetujui') || 
          tx.description.includes('Berhasil') || 
          tx.description.includes('Otomatis') ||
          tx.description.includes('selesai') ||
          tx.description.toLowerCase().includes('deposit')
        ) && tx.status !== 'rejected' && tx.status !== 'pending'
      );
      const totalDepositFromTxs = approvedDeposits.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const contractValue = (activeState?.activeContracts || 0) * CONFIG.PRICE_PER_UNIT;
      const totalDeposit = Math.max(totalDepositFromTxs, contractValue);

      let finalDeposit = totalDeposit;
      if (isWeekly) {
        const weeklyTxs = approvedDeposits.filter(tx => tx.date >= weekAgo);
        const weeklySum = weeklyTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        if (weeklySum > 0) finalDeposit = weeklySum;
      } else if (isMonthly) {
        const monthlyTxs = approvedDeposits.filter(tx => tx.date >= monthAgo);
        const monthlySum = monthlyTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        if (monthlySum > 0) finalDeposit = monthlySum;
      }

      // 2. Referral: Direct referrals with active contracts
      const directReferrals = accounts.filter(acc => {
        if (!isMemberAccount(acc)) return false;
        if (!acc.invitedBy) return false;
        const inv = acc.invitedBy.toLowerCase();
        const isSponsor = inv === u.username.toLowerCase() || (u.referralCode && inv === u.referralCode.toLowerCase());
        if (!isSponsor) return false;

        const targetState = (currentAccount && acc.username.toLowerCase() === currentAccount.username.toLowerCase()) 
          ? state 
          : acc.state;
        return (targetState?.activeContracts || 0) >= 1;
      }).length;

      const activeReferralsCount = Math.max(directReferrals, activeState?.holders?.filter(h => h.contracts > 0).length || 0);

      // 3. Contract: Total active contracts
      const activeContracts = activeState?.activeContracts || 0;

      // 4. Profit: Total profit in Rp
      const allTimeProfit = Math.max(activeState?.totalProfit || 0, activeState?.totalEarned || 0);
      let finalProfit = allTimeProfit;

      if (isWeekly) {
        const weeklyRewardTxs = (activeState?.transactions || []).filter(tx => 
          (tx.type === 'reward' || tx.type === 'referral' || tx.type === 'rebate' || tx.type === 'welcome_bonus' || tx.type === 'bonus') && 
          tx.date >= weekAgo
        );
        const weeklyProfitSum = weeklyRewardTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        if (weeklyProfitSum > 0) finalProfit = weeklyProfitSum;
      } else if (isMonthly) {
        const monthlyRewardTxs = (activeState?.transactions || []).filter(tx => 
          (tx.type === 'reward' || tx.type === 'referral' || tx.type === 'rebate' || tx.type === 'welcome_bonus' || tx.type === 'bonus') && 
          tx.date >= monthAgo
        );
        const monthlyProfitSum = monthlyRewardTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        if (monthlyProfitSum > 0) finalProfit = monthlyProfitSum;
      }

      let score = 0;
      let displayStr = '';

      if (leaderboardCategory === 'investor') { // State 'investor' represents Deposit
        score = finalDeposit;
        displayStr = `Rp ${Math.round(finalDeposit).toLocaleString('id-ID')}`;
      } else if (leaderboardCategory === 'referral') {
        score = activeReferralsCount;
        displayStr = `${activeReferralsCount} ${language === 'id' ? 'Mitra' : 'Partners'}`;
      } else if (leaderboardCategory === 'contract') {
        score = activeContracts;
        displayStr = `${activeContracts} Unit`;
      } else { // 'profit'
        score = finalProfit;
        displayStr = `Rp ${Math.round(finalProfit).toLocaleString('id-ID')}`;
      }

      const vipLevel = activeContracts >= 50 ? 5 :
                       activeContracts >= 25 ? 4 :
                       activeContracts >= 10 ? 3 :
                       activeContracts >= 5 ? 2 :
                       activeContracts >= 1 ? 1 : 0;

      return {
        username: u.username,
        fullName: u.fullName,
        vipLevel,
        profileImage: activeState?.profileImage || null,
        createdAt: u.createdAt || Date.now(),
        score,
        displayStr,
        activeContracts,
        activeReferralsCount,
        totalProfit: allTimeProfit
      };
    });

    // Sort descending by score, tie-breaker: older account gets higher rank
    return mapped.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.createdAt - b.createdAt;
    });
  }, [accounts, state, currentAccount, leaderboardFilter, leaderboardCategory, language]);

  // Premium dynamic podium cards renderer helper
  const renderRankCard = (user: any, rank: number) => {
    const isRank1 = rank === 1;
    const isRank2 = rank === 2;
    const isRank3 = rank === 3;
    const isPlaceholder = !user;

    const username = isPlaceholder ? `rank_${rank}_placeholder` : user.username;
    const fullName = isPlaceholder ? (language === 'id' ? 'Belum Ada Peringkat' : 'No Ranking Yet') : user.fullName;
    const userHandle = isPlaceholder ? '-' : `@${user.username}`;

    // Premium visual themes based on ranking placement
    let cardBg = "bg-gradient-to-b from-[#180e29] to-black/90 border-white/5 shadow-[0_4px_25px_rgba(0,0,0,0.6)]";
    let borderGlow = "border-white/10";
    let rankBadge = "bg-white/5 border-white/10 text-slate-400";
    let avatarBorder = "border-2 border-slate-500 shadow-lg";
    let scoreBg = "bg-white/5 border-white/10 text-slate-300";
    let scoreColor = "text-slate-300";
    let minHeight = "min-h-[145px] md:min-h-[160px]";
    let scaleVal = 1.0;

    if (isRank1) {
      cardBg = "bg-gradient-to-b from-[#1c1202] via-[#0d0701] to-[#040108]";
      borderGlow = "border-amber-500/50 shadow-[0_0_25px_rgba(251,191,36,0.25)] ring-1 ring-yellow-500/10";
      rankBadge = "border border-amber-500/30 bg-amber-500/10 text-amber-400 font-black tracking-widest";
      avatarBorder = "border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7)] ring-4 ring-amber-500/10";
      scoreBg = "bg-[#0c051a]/60 border border-[#3a200a]/50";
      scoreColor = "text-yellow-400 font-extrabold";
      minHeight = "min-h-[185px] md:min-h-[200px]";
      scaleVal = 1.02;
    } else if (isRank2) {
      cardBg = "bg-gradient-to-b from-[#1c1d24] via-[#0d0e12] to-[#040108]";
      borderGlow = "border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.1)]";
      rankBadge = "border border-slate-400/30 bg-slate-400/10 text-slate-300 font-black tracking-widest";
      avatarBorder = "border-2 border-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.4)] ring-4 ring-slate-400/10";
      scoreBg = "bg-[#040108]/60 border border-slate-400/20";
      scoreColor = "text-slate-300 font-extrabold";
      minHeight = "min-h-[160px] md:min-h-[175px]";
      scaleVal = 0.98;
    } else if (isRank3) {
      cardBg = "bg-gradient-to-b from-[#24130d] via-[#100806] to-[#040108]";
      borderGlow = "border-amber-700/30 shadow-[0_0_15px_rgba(217,119,6,0.1)]";
      rankBadge = "border border-amber-700/30 bg-amber-700/10 text-amber-600 font-black tracking-widest";
      avatarBorder = "border-2 border-amber-700 shadow-[0_0_15px_rgba(217,119,6,0.4)] ring-4 ring-amber-700/10";
      scoreBg = "bg-[#040108]/60 border border-amber-700/20";
      scoreColor = "text-amber-500 font-extrabold";
      minHeight = "min-h-[160px] md:min-h-[175px]";
      scaleVal = 0.96;
    }

    // Default score values for placeholders
    let displayScore = '-';
    if (isPlaceholder) {
      if (leaderboardCategory === 'investor' || leaderboardCategory === 'profit') {
        displayScore = 'Rp 0';
      } else if (leaderboardCategory === 'referral') {
        displayScore = `0 ${language === 'id' ? 'Mitra' : 'Partners'}`;
      } else if (leaderboardCategory === 'contract') {
        displayScore = '0 Unit';
      }
    } else {
      displayScore = user.displayStr;
    }

    const bagColor = isRank1 ? "#ffd700" : isRank2 ? "#cbd5e1" : "#d97706";

    return (
      <motion.div
        key={username}
        initial={{ opacity: 0, y: 20, scale: scaleVal }}
        animate={{ opacity: 1, y: 0, scale: scaleVal }}
        whileHover={isPlaceholder ? {} : { scale: scaleVal * 1.03, translateY: -2, transition: { duration: 0.2 } }}
        whileTap={isPlaceholder ? {} : { scale: scaleVal * 0.98 }}
        className={`p-2 rounded-[28px] border ${cardBg} ${borderGlow} flex flex-col items-center justify-between ${minHeight} relative overflow-visible transition-all duration-300`}
      >
        {/* Inner container to clip decorative shine background effects */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0 pointer-events-none">
          {isRank1 && (
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-amber-500/15 to-transparent" />
          )}
          {isRank2 && (
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-400/5 to-transparent" />
          )}
          {isRank3 && (
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-700/5 to-transparent" />
          )}
        </div>

        {/* 3D Majestic Crown sitting centered on top of the card border */}
        <CrownSVG rank={rank} />

        {/* Space top to offset Crown */}
        <div className={isRank1 ? "h-3.5 z-10" : "h-2.5 z-10"} />

        {/* Rank Indicator Badge */}
        <div className={`px-2.5 py-0.5 rounded-full text-[7px] md:text-[8px] font-black tracking-widest uppercase ${rankBadge} z-10 shadow-sm mt-1 font-orbitron`}>
          RANK {rank}
        </div>

        {/* Avatar Area with glowing rings and flanking laurels */}
        <div className="relative mb-1.5 mt-2.5 shrink-0 z-10 flex items-center justify-center">
          {isRank1 && <LaurelWreath />}
          {renderAvatar(
            user, 
            isRank1 ? "w-[54px] h-[54px] md:w-[62px] md:h-[62px]" : "w-[42px] h-[42px] md:w-[48px] md:h-[48px]", 
            avatarBorder
          )}
        </div>

        {/* Name and Handle Labels */}
        <div className="flex flex-col items-center justify-center w-full px-1 z-10 mb-1 mt-0.5">
          <h3 className={`truncate max-w-full leading-tight uppercase tracking-wider text-center w-full font-sans ${isRank1 ? 'text-[9.5px] md:text-[11px] font-extrabold text-white' : 'text-[8.5px] md:text-[9.5px] font-bold text-slate-100'}`}>
            {fullName}
          </h3>
          <span className={`text-center block w-full truncate mt-0.5 font-sans ${isRank1 ? 'text-[7.5px] md:text-[8.5px] text-slate-400 font-bold' : 'text-[6.5px] md:text-[7.5px] text-slate-500 font-medium'}`}>
            {userHandle}
          </span>
        </div>

        {/* Category Value Capsule at the bottom */}
        <div className={`mt-auto mb-0.5 w-[92%] rounded-full py-1 px-2 flex items-center justify-center gap-1 shadow-inner z-10 ${scoreBg}`}>
          <span className="text-[10px] md:text-xs shrink-0">{getCategoryIcon(leaderboardCategory)}</span>
          <span className={`text-[9px] md:text-[10.5px] font-black font-mono tracking-wide leading-none ${scoreColor}`}>
            {displayScore}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 text-left pb-20">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition active:scale-90" onClick={() => setCurrentTab('home')} />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-orbitron flex items-center gap-1.5">
          <Trophy className="w-4.5 h-4.5 text-yellow-400" />
          {language === 'id' ? 'LEADERBOARD DEPOSIT & KINERJA' : 'DEPOSIT & PERFORMANCE LEADERBOARD'}
        </h2>
      </div>

      {/* Timeframe Selectors */}
      <div className="flex bg-black/45 border border-white/5 p-1 rounded-2xl gap-1 shadow-inner">
        {(['weekly', 'monthly', 'alltime'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setLeaderboardFilter(filter)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer active:scale-98 ${leaderboardFilter === filter ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black shadow-md font-extrabold' : 'text-slate-400 hover:text-white'}`}
          >
            {filter === 'weekly' ? (language === 'id' ? 'Mingguan' : 'Weekly') : filter === 'monthly' ? (language === 'id' ? 'Bulanan' : 'Monthly') : (language === 'id' ? 'Semua' : 'All Time')}
          </button>
        ))}
      </div>

      {/* Category Selectors */}
      <div className="grid grid-cols-4 gap-1.5">
        {(['investor', 'referral', 'contract', 'profit'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setLeaderboardCategory(cat)}
            className={`py-1.5 rounded-lg text-[9px] md:text-xs font-bold uppercase tracking-wide border transition cursor-pointer active:scale-95 ${leaderboardCategory === cat ? 'bg-amber-500/15 text-yellow-400 border-amber-500/40 shadow-sm shadow-yellow-500/5' : 'bg-black/20 border-white/5 text-slate-400 hover:text-slate-200'}`}
          >
            {cat === 'investor' ? 'Deposit' : cat === 'referral' ? 'Referral' : cat === 'contract' ? 'Contract' : 'Profit'}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {processedLeaderboard.length === 0 ? (
        <div className="py-12 bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl text-center text-xs text-slate-500 font-medium">
          {language === 'id' ? 'Belum ada data leaderboard' : 'No leaderboard data available yet'}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Podium Top 3 Grid */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-3 gap-2 md:gap-3 items-end max-w-lg mx-auto">
              {renderRankCard(processedLeaderboard[1] || null, 2)}
              {renderRankCard(processedLeaderboard[0] || null, 1)}
              {renderRankCard(processedLeaderboard[2] || null, 3)}
            </div>
          </div>

          {/* Monthly Rewards Banner */}
          <div className="bg-gradient-to-r from-[#1e1136] to-[#0f071e] border border-amber-500/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 border border-amber-400/20 flex items-center justify-center text-xl shadow-lg shrink-0">🎁</div>
              <div className="flex-1 min-w-0">
                <span className="text-[8.5px] font-black tracking-widest text-amber-400 block uppercase mb-0.5">{language === 'id' ? 'HADIAH BULANAN LEADERBOARD' : 'MONTHLY LEADERBOARD REWARDS'}</span>
                <p className="text-[10px] text-slate-200 font-bold leading-tight truncate">
                  {language === 'id' ? 'Peringkat 1 mendapat Rp 10.000.000 + EXC-1000 Hashrate' : 'Rank 1 receives Rp 10,000,000 + EXC-1000 Hashrate'}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
          </div>

          {/* Top 10 Listings */}
          <div className="bg-[#0b0519]/90 border border-purple-500/10 rounded-3xl p-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/5 border border-amber-400/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {language === 'id' ? 'Peringkat 4 - 10' : 'Rankings 4 - 10'}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                {language === 'id' ? 'Terupdate Otomatis' : 'Auto Updated'}
              </span>
            </div>

            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, idx) => {
                const rankNum = idx + 4;
                const userIndex = idx + 3;
                const user = processedLeaderboard[userIndex];

                if (user) {
                  const isSelf = currentAccount && user.username.toLowerCase() === currentAccount.username.toLowerCase();
                  const isExpanded = expandedLeaderboardUser === user.username;

                  return (
                    <motion.div
                      key={user.username}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                      className={`flex flex-col p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${isSelf ? 'bg-gradient-to-r from-purple-500/15 to-purple-900/10 border-purple-500/40 shadow-md shadow-purple-500/5' : 'bg-white/[0.01] border-white/5 hover:border-purple-500/15'}`}
                      onClick={(e) => {
                        setExpandedLeaderboardUser(isExpanded ? null : user.username);
                        if (!isExpanded) {
                          const target = e.currentTarget;
                          setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 150);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* Rank Number & Badge */}
                          <div className="flex items-center justify-center font-black font-orbitron w-10 text-xs text-slate-400">
                            <span className="mr-1">{rankNum}</span>
                          </div>

                          {/* Foto Profil */}
                          <div className="shrink-0">
                            {renderAvatar(user, "w-10 h-10", "border border-white/10")}
                          </div>

                          {/* Nama Lengkap & Username */}
                          <div className="min-w-0">
                            <div className="text-xs font-black text-white leading-tight flex items-center gap-1.5 truncate">
                              <span>{user.fullName}</span>
                              {isSelf && (
                                <span className="text-[7.5px] bg-amber-400/20 text-amber-400 border border-amber-400/30 px-1 py-0.5 rounded font-black tracking-wider leading-none uppercase shrink-0">
                                  {language === 'id' ? 'Kamu' : 'You'}
                                </span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-slate-400 font-medium block mt-0.5">@{user.username}</span>
                          </div>
                        </div>

                        {/* Nilai Kategori */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-black/35 border border-white/5 py-1 px-2.5 rounded-xl">
                          <span className="text-xs">{getCategoryIcon(leaderboardCategory)}</span>
                          <span className="text-xs font-black text-amber-400 font-mono tracking-wide leading-none">
                            {user.displayStr}
                          </span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-500/10">
                                <span className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Rujukan Jaringan' : 'Network Downlines'}
                                </span>
                                <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                                  {user.activeReferralsCount || 0} {language === 'id' ? 'Mitra' : 'Partners'}
                                </span>
                              </div>
                              <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-500/10">
                                <span className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Kontrak Pribadi' : 'Personal Contracts'}
                                </span>
                                <span className="text-xs font-extrabold text-yellow-400 flex items-center gap-1.5">
                                  <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                                  {user.activeContracts} Unit
                                </span>
                              </div>
                              <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-500/10 col-span-2">
                                <span className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Akumulasi Profit' : 'Accumulated Profit'}
                                </span>
                                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                                  Rp {(user.totalProfit || 0).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                } else {
                  // Dynamic placeholder value based on active category
                  let placeholderVal = 'Rp 0';
                  if (leaderboardCategory === 'referral') {
                    placeholderVal = language === 'id' ? '0 Mitra' : '0 Partners';
                  } else if (leaderboardCategory === 'contract') {
                    placeholderVal = '0 Unit';
                  }

                  const placeholderKey = `placeholder-rank-${rankNum}`;
                  const isExpanded = expandedLeaderboardUser === placeholderKey;

                  return (
                    <motion.div
                      key={placeholderKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className={`flex flex-col p-3 rounded-2xl border border-dashed transition-all duration-200 cursor-pointer ${isExpanded ? 'border-purple-500/30 bg-purple-950/20' : 'border-white/5 bg-white/[0.005] hover:border-purple-500/15'}`}
                      onClick={(e) => {
                        setExpandedLeaderboardUser(isExpanded ? null : placeholderKey);
                        if (!isExpanded) {
                          const target = e.currentTarget;
                          setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 150);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* Rank Number */}
                          <div className="flex items-center justify-center font-black font-orbitron w-10 text-xs text-slate-500">
                            <span className="mr-1">{rankNum}</span>
                          </div>

                          {/* Default Circle Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700/50 border border-white/10 flex items-center justify-center font-bold text-slate-500 shrink-0">
                            <span className="text-[10px]">-</span>
                          </div>

                          {/* Nama Lengkap & Username */}
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-500 leading-tight">
                              {language === 'id' ? 'Belum ada peserta' : 'No participant yet'}
                            </div>
                            <span className="text-[9.5px] text-slate-600 font-medium block mt-0.5">@-</span>
                          </div>
                        </div>

                        {/* Nilai Kategori */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-black/15 border border-white/5 py-1 px-2.5 rounded-xl">
                          <span className="text-xs opacity-40">{getCategoryIcon(leaderboardCategory)}</span>
                          <span className="text-xs font-bold text-slate-500 font-mono tracking-wide leading-none">
                            {placeholderVal}
                          </span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-dashed border-white/5 grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/5">
                                <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Rujukan Jaringan' : 'Network Downlines'}
                                </span>
                                <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-slate-500" />
                                  0 {language === 'id' ? 'Mitra' : 'Partners'}
                                </span>
                              </div>
                              <div className="bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/5">
                                <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Kontrak Pribadi' : 'Personal Contracts'}
                                </span>
                                <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5">
                                  <Cpu className="w-3.5 h-3.5 text-slate-500" />
                                  0 Unit
                                </span>
                              </div>
                              <div className="bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/5 col-span-2">
                                <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Akumulasi Profit' : 'Accumulated Profit'}
                                </span>
                                <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-slate-500" />
                                  Rp 0
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
              })}
            </div>
          </div>

          {/* List entries for Rank 11 onwards */}
          {processedLeaderboard.length > 10 && (
            <div className="bg-[#0b0519]/80 border border-white/5 rounded-3xl p-4 shadow-xl space-y-2.5">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                {language === 'id' ? 'Peringkat Tambahan (Rank 11+)' : 'Additional Rankings (Rank 11+)'}
              </div>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-900/40">
                {processedLeaderboard.slice(10, 100).map((user, idx) => {
                  const rankNum = idx + 11;
                  const isSelf = currentAccount && user.username.toLowerCase() === currentAccount.username.toLowerCase();
                  const isExpanded = expandedLeaderboardUser === user.username;

                  return (
                    <div 
                      key={user.username} 
                      className={`flex flex-col p-2.5 rounded-2xl border transition duration-200 cursor-pointer ${isSelf ? 'bg-purple-500/15 border-purple-500/30' : 'bg-white/[0.01] border-white/5 hover:border-purple-500/15'}`}
                      onClick={(e) => {
                        setExpandedLeaderboardUser(isExpanded ? null : user.username);
                        if (!isExpanded) {
                          const target = e.currentTarget;
                          setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 150);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-extrabold text-slate-500 font-mono w-5 text-center">{rankNum}</span>
                          <div>
                            <div className="text-[10.5px] font-black text-white leading-none flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {isSelf && (
                                <span className="text-[7.5px] bg-yellow-400/25 text-yellow-400 px-1 py-0.5 rounded uppercase font-black tracking-wider leading-none">
                                  {language === 'id' ? 'Kamu' : 'You'}
                                </span>
                              )}
                            </div>
                            <span className="text-[8.5px] text-slate-400 font-medium mt-0.5 block">@{user.username}</span>
                          </div>
                        </div>
                        <div className="text-[10.5px] font-mono font-black text-slate-300 bg-black/25 py-0.5 px-2 rounded-lg">{user.displayStr}</div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-purple-950/60 p-2 rounded-xl border border-purple-500/10">
                                <span className="text-[8px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Rujukan Jaringan' : 'Network Downlines'}
                                </span>
                                <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                                  {user.activeReferralsCount || 0} {language === 'id' ? 'Mitra' : 'Partners'}
                                </span>
                              </div>
                              <div className="bg-purple-950/60 p-2 rounded-xl border border-purple-500/10">
                                <span className="text-[8px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                                  {language === 'id' ? 'Kontrak Pribadi' : 'Personal Contracts'}
                                </span>
                                <span className="text-xs font-extrabold text-yellow-400 flex items-center gap-1.5">
                                  <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                                  {user.activeContracts} Unit
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
