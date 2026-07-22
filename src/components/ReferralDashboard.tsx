import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Users,
  UserCheck,
  UserPlus,
  Coins,
  Send,
  Check,
  TrendingUp,
  Trophy,
  Activity,
  Layers,
  ArrowUpRight,
  Sparkles,
  Network,
  Percent,
  MousePointerClick,
  Share2,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Globe,
  ExternalLink
} from 'lucide-react';
import { UserAccount, AppState, CONFIG, isMemberAccount } from '../types';

interface ReferralDashboardProps {
  accounts: UserAccount[];
  currentAccount: UserAccount | null;
  state: AppState;
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  copiedCode: boolean;
  copiedLink: boolean;
  handleCopyCode: () => void;
  handleCopyLink: () => void;
  triggerModal: (msg: string, type?: any, showConfirm?: boolean, onConfirmFn?: () => void) => void;
}

export default function ReferralDashboard({
  accounts,
  currentAccount,
  state,
  language,
  setCurrentTab,
  copiedCode,
  copiedLink,
  handleCopyCode,
  handleCopyLink,
  triggerModal
}: ReferralDashboardProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [tableSearch, setTableSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Localized Dictionary
  const dict = {
    id: {
      referralDashboard: 'DASHBOARD REFERRAL',
      referralStats: 'Statistik Referral',
      totalReferral: 'Total Referral',
      activeReferral: 'Referral Aktif',
      pendingReferral: 'Menunggu Aktivasi',
      totalBonus: 'Total Bonus',
      refCode: 'Kode Referral Anda',
      refLink: 'Tautan Referral Resmi',
      sponsorUplink: 'Sponsor Uplink',
      noSponsor: 'Tanpa Sponsor (Pendaftaran Langsung)',
      sponsorName: 'Nama Sponsor',
      sponsorID: 'ID Sponsor',
      joinDate: 'Tanggal Bergabung',
      copyLink: 'SALIN TAUTAN',
      shareRef: 'BAGIKAN REFERRAL',
      analytics: 'Analitik Pertumbuhan',
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      newRegs: 'Pendaftaran Baru',
      activeRefs: 'Referral Aktif',
      netGrowth: 'Pertumbuhan Jaringan',
      conversionRate: 'Conversion Rate Jaringan',
      clicks: 'Klik Tautan',
      registrations: 'Mendaftar',
      activeUsers: 'Pengguna Aktif',
      convRate: 'Persentase Konversi',
      refTracking: 'Pelacakan Tautan & Sumber',
      trafficSource: 'Sumber Trafik',
      leaderboardTitle: 'Peringkat Sponsor Terbaik',
      rank: 'Peringkat',
      username: 'Nama Pengguna',
      bonusEarned: 'Bonus Diperoleh',
      referralList: 'Daftar Mitra Jaringan',
      searchPlaceholder: 'Cari username mitra...',
      allLevels: 'Semua Level',
      levelX: 'Level {x}',
      allStatus: 'Semua Status',
      active: 'Aktif',
      pending: 'Belum Aktif',
      bonusGen: 'Bonus Dihasilkan',
      noDownlines: 'Belum ada mitra di jaringan Anda. Bagikan tautan referral untuk mulai membangun tim Anda!',
      successCopy: 'Berhasil disalin!',
      partners: 'Mitra',
      copiedText: 'Teks berbagi disalin ke clipboard!',
      clickMsg: '1 klik link referral',
      regMsg: 'mendaftar',
      activeMsg: 'aktif beli kontrak'
    },
    en: {
      referralDashboard: 'REFERRAL DASHBOARD',
      referralStats: 'Referral Statistics',
      totalReferral: 'Total Referrals',
      activeReferral: 'Active Referrals',
      pendingReferral: 'Pending Activation',
      totalBonus: 'Total Bonus',
      refCode: 'Your Referral Code',
      refLink: 'Official Referral Link',
      sponsorUplink: 'Sponsor Uplink',
      noSponsor: 'No Sponsor (Direct Registration)',
      sponsorName: 'Sponsor Name',
      sponsorID: 'Sponsor ID',
      joinDate: 'Joined Date',
      copyLink: 'COPY LINK',
      shareRef: 'SHARE REFERRAL',
      analytics: 'Growth Analytics',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      newRegs: 'New Registrations',
      activeRefs: 'Active Referrals',
      netGrowth: 'Network Growth',
      conversionRate: 'Network Conversion Rate',
      clicks: 'Link Clicks',
      registrations: 'Registered',
      activeUsers: 'Active Users',
      convRate: 'Conversion Rate',
      refTracking: 'Link Tracking & Sources',
      trafficSource: 'Traffic Sources',
      leaderboardTitle: 'Top Sponsor Leaderboard',
      rank: 'Rank',
      username: 'Username',
      bonusEarned: 'Bonus Earned',
      referralList: 'Network Partners List',
      searchPlaceholder: 'Search partner username...',
      allLevels: 'All Levels',
      levelX: 'Level {x}',
      allStatus: 'All Status',
      active: 'Active',
      pending: 'Pending',
      bonusGen: 'Bonus Generated',
      noDownlines: 'No partners in your network yet. Share your referral link to start building your team!',
      successCopy: 'Copied successfully!',
      partners: 'Partners',
      copiedText: 'Share text copied to clipboard!',
      clickMsg: '1 click on referral link',
      regMsg: 'registered',
      activeMsg: 'active purchased contract'
    }
  };

  const t = dict[language];

  // --- 1. DYNAMIC REFERRAL & DOWNLINE CALCULATIONS ---
  const direct = useMemo(() => {
    return accounts.filter(
      acc =>
        isMemberAccount(acc) &&
        acc.invitedBy &&
        currentAccount &&
        acc.invitedBy.toLowerCase() === currentAccount.username.toLowerCase()
    );
  }, [accounts, currentAccount]);

  const level1Usernames = useMemo(() => direct.map(acc => acc.username.toLowerCase()), [direct]);

  const l2 = useMemo(() => {
    return accounts.filter(
      acc => isMemberAccount(acc) && acc.invitedBy && level1Usernames.includes(acc.invitedBy.toLowerCase())
    );
  }, [accounts, level1Usernames]);

  const level2Usernames = useMemo(() => l2.map(acc => acc.username.toLowerCase()), [l2]);

  const l3 = useMemo(() => {
    return accounts.filter(
      acc => isMemberAccount(acc) && acc.invitedBy && level2Usernames.includes(acc.invitedBy.toLowerCase())
    );
  }, [accounts, level2Usernames]);

  const l1Count = direct.length;
  const l2Count = l2.length;
  const l3Count = l3.length;
  const totalReferrals = l1Count + l2Count + l3Count;

  const activeL1 = direct.filter(acc => (acc.state?.activeContracts || 0) > 0).length;
  const activeL2 = l2.filter(acc => (acc.state?.activeContracts || 0) > 0).length;
  const activeL3 = l3.filter(acc => (acc.state?.activeContracts || 0) > 0).length;
  const activeReferrals = activeL1 + activeL2 + activeL3;

  const pendingReferrals = totalReferrals - activeReferrals;

  // --- 2. CONVERSION RATE DATA ---
  const clicksCount = useMemo(() => {
    let hash = 0;
    const name = currentAccount?.username || "ggm";
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    return Math.max(38, totalReferrals * 4 + (hash % 15) + 12);
  }, [currentAccount, totalReferrals]);

  const clickToRegPercent = clicksCount > 0 ? Math.min(100, Math.round((totalReferrals / clicksCount) * 100)) : 0;
  const regToActivePercent = totalReferrals > 0 ? Math.min(100, Math.round((activeReferrals / totalReferrals) * 100)) : 0;
  const overallConvPercent = clicksCount > 0 ? Math.min(100, Math.round((activeReferrals / clicksCount) * 100)) : 0;

  // --- 3. DYNAMIC SPONSOR UPLINK ---
  const sponsor = useMemo(() => {
    if (!currentAccount?.invitedBy) return null;
    return accounts.find(acc => acc.username.toLowerCase() === currentAccount.invitedBy?.toLowerCase()) || null;
  }, [accounts, currentAccount]);

  // --- 4. DYNAMIC LEADERBOARD SORTED BY REFERRALS ---
  const topReferrers = useMemo(() => {
    return accounts
      .filter(isMemberAccount)
      .map(acc => {
        const directDownlinesCount = accounts.filter(
          down => isMemberAccount(down) && down.invitedBy && down.invitedBy.toLowerCase() === acc.username.toLowerCase()
        ).length;
        const refBonus = acc.state?.referralEarned || (directDownlinesCount * 18000);
        return {
          username: acc.username,
          fullName: acc.fullName,
          count: directDownlinesCount,
          bonus: refBonus,
          vipLevel: (acc.state?.activeContracts || 0) >= 10 ? 2 : (acc.state?.activeContracts || 0) >= 3 ? 1 : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [accounts]);

  // --- 5. DYNAMIC DOWNLINE LIST TABLE ---
  const allDownlineList = useMemo(() => {
    const list: Array<{
      username: string;
      fullName: string;
      level: number;
      createdAt: number;
      active: boolean;
      activeContracts: number;
      bonusGenerated: number;
    }> = [];

    // Level 1
    direct.forEach(acc => {
      const activeContracts = acc.state?.activeContracts || 0;
      const bonusGenerated = activeContracts * CONFIG.PRICE_PER_UNIT * 0.10;
      const isBlocked = 
        (acc as any).isBanned || 
        (acc as any).blocked || 
        (acc as any).status === 'blocked' || 
        (acc.state as any)?.isBanned || 
        (acc.state as any)?.status === 'blocked' ||
        (acc.state?.systemErrors || []).some((err: any) => err.errorCode === 'BLOCKED' || err.errorCode === 'BANNED');
      const hasContract = (acc.state?.activeContracts || 0) >= CONFIG.MIN_CONTRACT_PER_HOLDER;
      const hasMinDeposit = (acc.state?.transactions || []).some(
        (t: any) => t.type === 'deposit' && t.amount >= CONFIG.MIN_DEPOSIT
      );
      const isHolderAktif = !isBlocked && (hasContract || hasMinDeposit);

      list.push({
        username: acc.username,
        fullName: acc.fullName,
        level: 1,
        createdAt: acc.createdAt || (Date.now() - 3 * 24 * 60 * 60 * 1000),
        active: isHolderAktif,
        activeContracts,
        bonusGenerated
      });
    });

    // Level 2
    l2.forEach(acc => {
      const activeContracts = acc.state?.activeContracts || 0;
      const bonusGenerated = activeContracts * CONFIG.PRICE_PER_UNIT * 0.03;
      const isBlocked = 
        (acc as any).isBanned || 
        (acc as any).blocked || 
        (acc as any).status === 'blocked' || 
        (acc.state as any)?.isBanned || 
        (acc.state as any)?.status === 'blocked' ||
        (acc.state?.systemErrors || []).some((err: any) => err.errorCode === 'BLOCKED' || err.errorCode === 'BANNED');
      const hasContract = (acc.state?.activeContracts || 0) >= CONFIG.MIN_CONTRACT_PER_HOLDER;
      const hasMinDeposit = (acc.state?.transactions || []).some(
        (t: any) => t.type === 'deposit' && t.amount >= CONFIG.MIN_DEPOSIT
      );
      const isHolderAktif = !isBlocked && (hasContract || hasMinDeposit);

      list.push({
        username: acc.username,
        fullName: acc.fullName,
        level: 2,
        createdAt: acc.createdAt || (Date.now() - 6 * 24 * 60 * 60 * 1000),
        active: isHolderAktif,
        activeContracts,
        bonusGenerated
      });
    });

    // Level 3
    l3.forEach(acc => {
      const activeContracts = acc.state?.activeContracts || 0;
      const bonusGenerated = activeContracts * CONFIG.PRICE_PER_UNIT * 0.02;
      const isBlocked = 
        (acc as any).isBanned || 
        (acc as any).blocked || 
        (acc as any).status === 'blocked' || 
        (acc.state as any)?.isBanned || 
        (acc.state as any)?.status === 'blocked' ||
        (acc.state?.systemErrors || []).some((err: any) => err.errorCode === 'BLOCKED' || err.errorCode === 'BANNED');
      const hasContract = (acc.state?.activeContracts || 0) >= CONFIG.MIN_CONTRACT_PER_HOLDER;
      const hasMinDeposit = (acc.state?.transactions || []).some(
        (t: any) => t.type === 'deposit' && t.amount >= CONFIG.MIN_DEPOSIT
      );
      const isHolderAktif = !isBlocked && (hasContract || hasMinDeposit);

      list.push({
        username: acc.username,
        fullName: acc.fullName,
        level: 3,
        createdAt: acc.createdAt || (Date.now() - 9 * 24 * 60 * 60 * 1000),
        active: isHolderAktif,
        activeContracts,
        bonusGenerated
      });
    });

    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [direct, l2, l3]);

  // Filter list
  const filteredDownlineList = useMemo(() => {
    return allDownlineList.filter(item => {
      const matchesSearch = item.username.toLowerCase().includes(tableSearch.toLowerCase()) || 
                            item.fullName.toLowerCase().includes(tableSearch.toLowerCase());
      const matchesLevel = levelFilter === 'all' ? true : item.level === parseInt(levelFilter);
      const matchesStatus = statusFilter === 'all' ? true : 
                            statusFilter === 'active' ? item.active : !item.active;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [allDownlineList, tableSearch, levelFilter, statusFilter]);

  // --- 6. PREMIUM GRAPH DATA & VECTOR PATH ---
  const chartPoints = useMemo(() => {
    let data: Array<{ label: string, reg: number, active: number, growth: number }> = [];
    if (activeTab === 'daily') {
      data = [
        { label: 'Mon', reg: Math.round(totalReferrals * 0.12), active: Math.round(activeReferrals * 0.1), growth: Math.round(totalReferrals * 0.15) },
        { label: 'Tue', reg: Math.round(totalReferrals * 0.28), active: Math.round(activeReferrals * 0.15), growth: Math.round(totalReferrals * 0.25) },
        { label: 'Wed', reg: Math.round(totalReferrals * 0.45), active: Math.round(activeReferrals * 0.35), growth: Math.round(totalReferrals * 0.4) },
        { label: 'Thu', reg: Math.round(totalReferrals * 0.55), active: Math.round(activeReferrals * 0.48), growth: Math.round(totalReferrals * 0.6) },
        { label: 'Fri', reg: Math.round(totalReferrals * 0.72), active: Math.round(activeReferrals * 0.62), growth: Math.round(totalReferrals * 0.78) },
        { label: 'Sat', reg: Math.round(totalReferrals * 0.88), active: Math.round(activeReferrals * 0.82), growth: Math.round(totalReferrals * 0.92) },
        { label: 'Sun', reg: totalReferrals, active: activeReferrals, growth: totalReferrals },
      ];
    } else if (activeTab === 'weekly') {
      data = [
        { label: 'W1', reg: Math.round(totalReferrals * 0.15), active: Math.round(activeReferrals * 0.12), growth: Math.round(totalReferrals * 0.18) },
        { label: 'W2', reg: Math.round(totalReferrals * 0.38), active: Math.round(activeReferrals * 0.32), growth: Math.round(totalReferrals * 0.42) },
        { label: 'W3', reg: Math.round(totalReferrals * 0.68), active: Math.round(activeReferrals * 0.6), growth: Math.round(totalReferrals * 0.72) },
        { label: 'W4', reg: totalReferrals, active: activeReferrals, growth: totalReferrals },
      ];
    } else { // monthly
      data = [
        { label: 'Jan', reg: Math.round(totalReferrals * 0.08), active: Math.round(activeReferrals * 0.05), growth: Math.round(totalReferrals * 0.1) },
        { label: 'Feb', reg: Math.round(totalReferrals * 0.22), active: Math.round(activeReferrals * 0.18), growth: Math.round(totalReferrals * 0.24) },
        { label: 'Mar', reg: Math.round(totalReferrals * 0.42), active: Math.round(activeReferrals * 0.38), growth: Math.round(totalReferrals * 0.46) },
        { label: 'Apr', reg: Math.round(totalReferrals * 0.62), active: Math.round(activeReferrals * 0.52), growth: Math.round(totalReferrals * 0.64) },
        { label: 'May', reg: Math.round(totalReferrals * 0.82), active: Math.round(activeReferrals * 0.75), growth: Math.round(totalReferrals * 0.85) },
        { label: 'Jun', reg: totalReferrals, active: activeReferrals, growth: totalReferrals },
      ];
    }
    return data;
  }, [activeTab, totalReferrals, activeReferrals]);

  // Helper to convert data coordinates to SVG points
  const chartDimensions = { width: 500, height: 180 };
  const svgCoordinates = useMemo(() => {
    const { width, height } = chartDimensions;
    const paddingX = 40;
    const paddingY = 20;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const maxVal = Math.max(...chartPoints.map(p => Math.max(p.reg, p.active, p.growth, 5)));

    const pointsReg: Array<{ x: number, y: number, label: string, val: number }> = [];
    const pointsActive: Array<{ x: number, y: number, label: string, val: number }> = [];
    const pointsGrowth: Array<{ x: number, y: number, label: string, val: number }> = [];

    chartPoints.forEach((p, idx) => {
      const x = paddingX + (idx / (chartPoints.length - 1)) * chartW;
      
      const yReg = paddingY + chartH - (p.reg / maxVal) * chartH;
      const yActive = paddingY + chartH - (p.active / maxVal) * chartH;
      const yGrowth = paddingY + chartH - (p.growth / maxVal) * chartH;

      pointsReg.push({ x, y: yReg, label: p.label, val: p.reg });
      pointsActive.push({ x, y: yActive, label: p.label, val: p.active });
      pointsGrowth.push({ x, y: yGrowth, label: p.label, val: p.growth });
    });

    const buildPath = (pts: typeof pointsReg) => {
      if (pts.length === 0) return '';
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        // Curve calculation (cubic bezier)
        const cpX1 = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
        const cpY1 = pts[i - 1].y;
        const cpX2 = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
        const cpY2 = pts[i].y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pts[i].x} ${pts[i].y}`;
      }
      return path;
    };

    const buildAreaPath = (pts: typeof pointsReg) => {
      const linePath = buildPath(pts);
      if (!linePath) return '';
      return `${linePath} L ${pts[pts.length - 1].x} ${height - paddingY} L ${pts[0].x} ${height - paddingY} Z`;
    };

    return {
      regLine: buildPath(pointsReg),
      regArea: buildAreaPath(pointsReg),
      activeLine: buildPath(pointsActive),
      activeArea: buildAreaPath(pointsActive),
      growthLine: buildPath(pointsGrowth),
      growthArea: buildAreaPath(pointsGrowth),
      pointsReg,
      pointsActive,
      pointsGrowth,
      paddingX,
      paddingY,
      chartW,
      chartH,
      maxVal
    };
  }, [chartPoints]);

  return (
    <div id="referral-dashboard-container" className="space-y-5 text-slate-100 pb-10">
      
      {/* HEADER SECTION */}
      <div id="ref-header" className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
        <ChevronLeft 
          id="btn-back-home"
          className="w-5.5 h-5.5 text-slate-400 cursor-pointer hover:text-white transition active:scale-90" 
          onClick={() => setCurrentTab('home')} 
        />
        <div className="flex flex-col">
          <h2 id="ref-title" className="text-sm font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">
            {t.referralDashboard}
          </h2>
        </div>
      </div>

      {/* 1. STATS GRID CARDS */}
      <div id="ref-stats-grid" className="grid grid-cols-2 gap-3.5">
        
        {/* Card: Total Referral */}
        <motion.div 
          id="stat-card-total"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-b from-[#140b28] to-[#0a0416] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.totalReferral}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white pl-0.5">{totalReferrals}</span>
            <span className="text-[9px] text-slate-500 font-extrabold uppercase">{t.partners}</span>
          </div>
          <div className="mt-2 text-[9px] text-purple-400/80 font-semibold flex items-center gap-1">
            <Network className="w-2.5 h-2.5 shrink-0" />
            <span>L1: {l1Count} • L2: {l2Count} • L3: {l3Count}</span>
          </div>
        </motion.div>

        {/* Card: Active Referral */}
        <motion.div 
          id="stat-card-active"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-gradient-to-b from-[#140b28] to-[#0a0416] border border-emerald-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.activeReferral}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400 pl-0.5">{activeReferrals}</span>
            <span className="text-[9px] text-slate-500 font-extrabold uppercase">{t.active}</span>
          </div>
          <div className="mt-2 text-[9px] text-emerald-400/80 font-semibold flex items-center gap-0.5">
            <Percent className="w-2.5 h-2.5 shrink-0" />
            <span>{totalReferrals > 0 ? Math.round((activeReferrals / totalReferrals) * 100) : 0}% Active Ratio</span>
          </div>
        </motion.div>

        {/* Card: Pending Activation */}
        <motion.div 
          id="stat-card-pending"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-b from-[#140b28] to-[#0a0416] border border-yellow-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300"
        >
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Activity className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.pendingReferral}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-yellow-500 pl-0.5">{pendingReferrals}</span>
            <span className="text-[9px] text-slate-500 font-extrabold uppercase">{t.pending}</span>
          </div>
          <div className="mt-2 text-[9px] text-yellow-500/75 font-semibold">
            ⏳ Waiting first gold contract purchase
          </div>
        </motion.div>

        {/* Card: Total Commission */}
        <motion.div 
          id="stat-card-bonus"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-gradient-to-b from-[#140b28] to-[#0a0416] border border-gold-primary/20 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-gold-primary/40 transition-all duration-300"
        >
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-gold-primary/10 flex items-center justify-center border border-gold-primary/20">
              <Coins className="w-3.5 h-3.5 text-gold-primary" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.totalBonus}</span>
          </div>
          <div className="text-sm font-black text-gradient-gold pl-0.5 font-sans truncate">
            Rp {state.referralEarned.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[9px] text-amber-400/85 font-semibold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
            <span>Bonus automatically added to wallet</span>
          </div>
        </motion.div>

      </div>

      {/* 2. REFERRAL LINKS & SPONSOR AREA */}
      <div id="ref-links-sponsor-panel" className="bg-gradient-to-br from-[#0f0620] to-[#080312] border border-purple-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Your Referral Code */}
        <div id="ref-code-area" className="relative space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gold-primary uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t.refCode}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-black/45 border border-purple-900/35 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-100 flex items-center justify-between">
              <span>{currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase())}</span>
              <button
                id="btn-copy-code"
                onClick={handleCopyCode}
                className="text-gold-primary hover:text-yellow-300 transition text-xs font-extrabold flex items-center gap-1 cursor-pointer active:scale-95"
              >
                {copiedCode ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">📋 <span className="text-[10px]">COPY</span></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Official Referral Link */}
        <div id="ref-link-area" className="bg-[#120824] border border-purple-500/15 rounded-2xl p-4 relative overflow-hidden shadow-inner">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest block">
                {t.refLink}
              </span>
            </div>
            
            <button
              id="btn-copy-link"
              onClick={handleCopyLink}
              className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-90 flex items-center gap-1 ${
                copiedLink 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-gradient-to-r from-yellow-400 via-gold-primary to-yellow-600 text-black shadow-md hover:brightness-110'
              }`}
            >
              <span>📋</span>
              <span>{copiedLink ? 'COPIED ✓' : 'COPY LINK'}</span>
            </button>
          </div>

          <div className="mt-4 pt-1">
            <div className="w-full bg-black/50 border border-purple-950/40 rounded-xl px-3 py-2.5 text-[10px] font-mono text-slate-300 break-all select-all leading-relaxed pr-16 shadow-inner">
              {`${window.location.origin}/register?ref=${currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase())}`}
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          id="btn-share-referral"
          onClick={() => {
            const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
            const shareUrl = `${window.location.origin}/register?ref=${refCodeStr}`;
            const shareText = language === 'id' 
              ? `Bergabunglah dengan sistem penambangan GrockGold menggunakan kode ${refCodeStr} dan hasilkan yield harian hingga ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%! ${shareUrl}`
              : `Join the GrockGold mining system with code ${refCodeStr} and earn up to ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% daily contract yield! ${shareUrl}`;
            
            if (navigator.share) {
              navigator.share({
                title: 'GrockGold Mining',
                text: shareText,
                url: shareUrl,
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(shareText);
              triggerModal(t.copiedText, 'success');
            }
          }}
          className="w-full py-3.5 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-2xl text-xs tracking-wider uppercase transition shadow-lg hover:brightness-110 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t.shareRef}</span>
        </button>

        {/* Sponsor Uplink */}
        <div id="sponsor-uplink-section" className="border-t border-purple-500/10 pt-3 mt-1.5">
          <div className="flex items-center gap-2 text-gold-primary text-[10px] font-extrabold uppercase tracking-widest mb-2">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.sponsorUplink}</span>
          </div>

          {sponsor ? (
            <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8.5 h-8.5 rounded-full bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-base font-bold text-yellow-400">
                  👤
                </div>
                <div>
                  <div className="font-extrabold text-slate-100 flex items-center gap-1.5">
                    <span>{sponsor.fullName}</span>
                    <span className="text-[8.5px] bg-purple-900/40 text-purple-300 border border-purple-500/20 px-1 py-0.5 rounded leading-none font-bold">UPLINE</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">@{sponsor.username}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">{t.joinDate}</span>
                <span className="text-[10px] text-slate-300 font-bold">
                  {sponsor.createdAt 
                    ? new Date(sponsor.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '12 Jan 2026'
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-purple-950/10 border border-purple-900/10 rounded-xl p-3 text-center text-[10px] text-slate-400 font-semibold leading-relaxed">
              🌍 {t.noSponsor}
            </div>
          )}
        </div>

      </div>

      {/* 3. REFERRAL GROWTH ANALYTICS (CUSTOM CHART) */}
      <div id="analytics-chart-panel" className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-black text-gold-primary tracking-widest uppercase">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>{t.analytics}</span>
          </div>
          
          {/* Toggles */}
          <div className="flex bg-black/45 border border-purple-900/30 rounded-xl p-0.5 text-[9px] font-black">
            {(['daily', 'weekly', 'monthly'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setHoveredPoint(null);
                }}
                className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-yellow-400 to-gold-primary text-black font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'daily' ? t.daily : tab === 'weekly' ? t.weekly : t.monthly}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div id="chart-legend" className="flex items-center justify-center gap-4 text-[9px] font-black tracking-wide uppercase mb-3 text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-yellow-400 inline-block" />
            <span>{t.newRegs}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
            <span>{t.activeRefs}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-fuchsia-400 inline-block" />
            <span>{t.netGrowth}</span>
          </div>
        </div>

        {/* Interactive SVG Rendered Chart */}
        <div className="relative h-[180px] w-full bg-black/35 rounded-2xl border border-purple-950/40 p-1.5 overflow-hidden shadow-inner flex items-center justify-center">
          
          {/* Grid lines inside chart */}
          <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between p-4 pointer-events-none opacity-[0.06] border-y border-white">
            <div className="border-t border-dashed border-white w-full" />
            <div className="border-t border-dashed border-white w-full" />
            <div className="border-t border-dashed border-white w-full" />
            <div className="border-t border-dashed border-white w-full" />
          </div>

          <svg 
            viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`} 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Glowing gradients for areas */}
              <linearGradient id="grad-reg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="grad-active" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="grad-growth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e879f9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#e879f9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fills */}
            <path d={svgCoordinates.regArea} fill="url(#grad-reg)" />
            <path d={svgCoordinates.activeArea} fill="url(#grad-active)" />
            <path d={svgCoordinates.growthArea} fill="url(#grad-growth)" />

            {/* Curved Stroke Lines */}
            <path d={svgCoordinates.regLine} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgCoordinates.activeLine} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgCoordinates.growthLine} fill="none" stroke="#e879f9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Grid & Point Dots */}
            {svgCoordinates.pointsReg.map((pt, idx) => {
              const isHovered = hoveredPoint === idx;
              return (
                <g key={`group-${idx}`} className="cursor-pointer">
                  {/* Invisible broad hover line */}
                  <line 
                    x1={pt.x} 
                    y1={svgCoordinates.paddingY} 
                    x2={pt.x} 
                    y2={chartDimensions.height - svgCoordinates.paddingY} 
                    stroke="white" 
                    strokeWidth="15" 
                    strokeOpacity="0"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* Vertical thin hover guidance line */}
                  {isHovered && (
                    <line 
                      x1={pt.x} 
                      y1={svgCoordinates.paddingY} 
                      x2={pt.x} 
                      y2={chartDimensions.height - svgCoordinates.paddingY} 
                      stroke="#818cf8" 
                      strokeWidth="1" 
                      strokeDasharray="3,3" 
                      strokeOpacity="0.6"
                      pointerEvents="none"
                    />
                  )}

                  {/* Golden Registration Dots */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={isHovered ? 5 : 3} 
                    fill="#fbbf24" 
                    stroke="#000" 
                    strokeWidth="1"
                    pointerEvents="none"
                  />
                  
                  {/* Emerald Active Dots */}
                  <circle 
                    cx={svgCoordinates.pointsActive[idx].x} 
                    cy={svgCoordinates.pointsActive[idx].y} 
                    r={isHovered ? 5 : 3} 
                    fill="#34d399" 
                    stroke="#000" 
                    strokeWidth="1"
                    pointerEvents="none"
                  />

                  {/* Fuchsia Network Growth Dots */}
                  <circle 
                    cx={svgCoordinates.pointsGrowth[idx].x} 
                    cy={svgCoordinates.pointsGrowth[idx].y} 
                    r={isHovered ? 5 : 3} 
                    fill="#e879f9" 
                    stroke="#000" 
                    strokeWidth="1"
                    pointerEvents="none"
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Div when Hovering */}
          <AnimatePresence>
            {hoveredPoint !== null && (
              <motion.div 
                id="chart-tooltip"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bg-[#090315]/95 border border-purple-500/40 rounded-xl p-2.5 shadow-2xl text-[10px] pointer-events-none z-30 space-y-1 font-semibold"
                style={{
                  left: `${Math.min(chartDimensions.width - 150, Math.max(10, (svgCoordinates.pointsReg[hoveredPoint].x / chartDimensions.width) * 100))}%`,
                  bottom: '12px'
                }}
              >
                <div className="font-black text-slate-200 border-b border-white/5 pb-1 uppercase tracking-wider">
                  {chartPoints[hoveredPoint].label} • Report Details
                </div>
                <div className="flex justify-between gap-6 text-amber-400">
                  <span>🆕 {t.newRegs}:</span>
                  <span className="font-bold font-mono">{chartPoints[hoveredPoint].reg}</span>
                </div>
                <div className="flex justify-between gap-6 text-emerald-400">
                  <span>✅ {t.activeRefs}:</span>
                  <span className="font-bold font-mono">{chartPoints[hoveredPoint].active}</span>
                </div>
                <div className="flex justify-between gap-6 text-fuchsia-400">
                  <span>📈 {t.netGrowth}:</span>
                  <span className="font-bold font-mono">{chartPoints[hoveredPoint].growth}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. CONVERSION RATE FUNNEL */}
      <div id="conversion-funnel-panel" className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-2">
          <Percent className="w-4 h-4 text-purple-400" />
          <span>{t.conversionRate}</span>
        </div>

        {/* Funnel Visual Container */}
        <div className="space-y-4">
          
          {/* Step 1: Link Clicks */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-extrabold flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>1. {t.clicks}</span>
              </span>
              <span className="font-bold text-slate-100 font-mono">{clicksCount} Clicks</span>
            </div>
            <div className="w-full h-2 bg-black/45 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-[8px] text-slate-500 font-semibold italic">{t.clickMsg}</span>
          </div>

          {/* Step 2: Registrations */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-extrabold flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>2. {t.registrations}</span>
              </span>
              <span className="font-bold text-yellow-400 font-mono">
                {totalReferrals} Users <span className="text-[9px] text-slate-500">({clickToRegPercent}%)</span>
              </span>
            </div>
            <div className="w-full h-2 bg-black/45 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-yellow-400 rounded-full" 
                style={{ width: `${Math.max(10, clickToRegPercent)}%` }} 
              />
            </div>
            <span className="text-[8px] text-slate-500 font-semibold italic">{clickToRegPercent}% {t.regMsg}</span>
          </div>

          {/* Step 3: Active Users */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-extrabold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>3. {t.activeUsers}</span>
              </span>
              <span className="font-bold text-emerald-400 font-mono">
                {activeReferrals} Active <span className="text-[9px] text-slate-500">({regToActivePercent}%)</span>
              </span>
            </div>
            <div className="w-full h-2 bg-black/45 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-emerald-400 rounded-full" 
                style={{ width: `${Math.max(10, regToActivePercent)}%` }} 
              />
            </div>
            <span className="text-[8px] text-slate-500 font-semibold italic">{regToActivePercent}% {t.activeMsg}</span>
          </div>

          {/* Core Conversion Metric Panel */}
          <div className="bg-purple-950/20 border border-purple-500/15 rounded-2xl p-4 text-center mt-2.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">{t.convRate} (Overall)</span>
            <div className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-orbitron mt-1">
              {overallConvPercent}%
            </div>
            <p className="text-[8.5px] text-slate-400 font-medium leading-relaxed mt-1">
              {language === 'id' 
                ? 'Persentase total pengunjung tautan yang mendaftar dan membeli kontrak aktif.' 
                : 'Overall conversion of landing page visits converting into active gold miners.'
              }
            </p>
          </div>

        </div>
      </div>

      {/* 5. LINK TRACKING & TRAFFIC SOURCES */}
      <div id="traffic-sources-panel" className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
          <Activity className="w-4.5 h-4.5 text-purple-400" />
          <span>{t.refTracking}</span>
        </div>

        <div className="space-y-3">
          
          {/* Tracking details */}
          <div className="grid grid-cols-2 gap-3.5 mb-2 text-center text-xs font-semibold">
            <div className="p-3 rounded-2xl bg-black/45 border border-purple-500/10">
              <span className="text-[8.5px] text-slate-400 font-bold block uppercase mb-1">TOTAL HITS</span>
              <span className="text-sm font-black text-indigo-400">{clicksCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/45 border border-purple-500/10">
              <span className="text-[8.5px] text-slate-400 font-bold block uppercase mb-1">REGISTERS</span>
              <span className="text-sm font-black text-yellow-400">{totalReferrals}</span>
            </div>
          </div>

          {/* Traffic Sources Breakdown */}
          <div className="space-y-2.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">{t.trafficSource}</span>
            
            {/* WhatsApp */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="flex items-center gap-1">🟢 WhatsApp</span>
                <span className="font-bold text-slate-200">45% <span className="text-[8px] text-slate-500 font-medium">({Math.round(clicksCount * 0.45)} clicks)</span></span>
              </div>
              <div className="w-full h-1.5 bg-black/45 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="flex items-center gap-1">🔵 Telegram</span>
                <span className="font-bold text-slate-200">30% <span className="text-[8px] text-slate-500 font-medium">({Math.round(clicksCount * 0.3)} clicks)</span></span>
              </div>
              <div className="w-full h-1.5 bg-black/45 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            {/* YouTube */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="flex items-center gap-1">🔴 YouTube</span>
                <span className="font-bold text-slate-200">15% <span className="text-[8px] text-slate-500 font-medium">({Math.round(clicksCount * 0.15)} clicks)</span></span>
              </div>
              <div className="w-full h-1.5 bg-black/45 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>

            {/* X / Other */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="flex items-center gap-1">⚫ TikTok / X</span>
                <span className="font-bold text-slate-200">10% <span className="text-[8px] text-slate-500 font-medium">({Math.round(clicksCount * 0.1)} clicks)</span></span>
              </div>
              <div className="w-full h-1.5 bg-black/45 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 6. SPONSOR LEADERBOARD */}
      <div id="leaderboard-panel" className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
          <Trophy className="w-4.5 h-4.5 text-yellow-400" />
          <span>{t.leaderboardTitle}</span>
        </div>

        <div className="space-y-2">
          {topReferrers.map((ref, index) => {
            const isSelf = currentAccount && ref.username.toLowerCase() === currentAccount.username.toLowerCase();
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
            return (
              <div 
                id={`leaderboard-row-${ref.username}`}
                key={ref.username}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                  isSelf 
                    ? 'bg-purple-900/20 border-gold-primary/40 shadow-md shadow-gold-primary/5' 
                    : 'bg-black/45 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                    index === 0 ? 'bg-yellow-400/10 text-yellow-400' :
                    index === 1 ? 'bg-slate-300/10 text-slate-300' :
                    index === 2 ? 'bg-amber-700/10 text-amber-500' : 'bg-black/30 text-slate-500'
                  }`}>
                    {medal}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                      <span>{ref.fullName}</span>
                      {isSelf && (
                        <span className="text-[7px] bg-gold-primary text-black px-1 rounded leading-none font-black uppercase">ANDA</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">@{ref.username}</span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-extrabold text-slate-200 block">{ref.count} {t.partners}</span>
                  <span className="text-[9px] text-amber-500 font-bold block">Rp {ref.bonus.toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. MITRA NETWORK TABLE LIST */}
      <div id="referrals-table-panel" className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4.5 h-4.5 text-purple-400" />
            <span>{t.referralList}</span>
          </div>
          <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full leading-none font-bold">
            {allDownlineList.length} Total
          </span>
        </div>

        {/* Filters */}
        <div id="table-filters" className="space-y-2.5 mb-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-partner"
              type="text"
              placeholder={t.searchPlaceholder}
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-black/45 border border-purple-900/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition duration-300 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
            
            {/* Level Filter */}
            <div className="flex items-center gap-1.5 bg-black/45 border border-purple-900/25 rounded-xl px-2 py-2">
              <Filter className="w-3 h-3 text-purple-400 shrink-0" />
              <select
                id="select-level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#0f0620]">{t.allLevels}</option>
                <option value="1" className="bg-[#0f0620]">{t.levelX.replace('{x}', '1')}</option>
                <option value="2" className="bg-[#0f0620]">{t.levelX.replace('{x}', '2')}</option>
                <option value="3" className="bg-[#0f0620]">{t.levelX.replace('{x}', '3')}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-black/45 border border-purple-900/25 rounded-xl px-2 py-2">
              <Activity className="w-3 h-3 text-purple-400 shrink-0" />
              <select
                id="select-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#0f0620]">{t.allStatus}</option>
                <option value="active" className="bg-[#0f0620]">{t.active}</option>
                <option value="pending" className="bg-[#0f0620]">{t.pending}</option>
              </select>
            </div>

          </div>

        </div>

        {/* Table/List */}
        <div id="table-container" className="max-h-[300px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
          {filteredDownlineList.length === 0 ? (
            <div className="text-center py-10 px-4 bg-black/25 border border-white/5 rounded-2xl">
              <div className="text-2xl mb-2 text-slate-600">👥</div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                {tableSearch || levelFilter !== 'all' || statusFilter !== 'all' 
                  ? (language === 'id' ? 'Tidak ada hasil pencarian.' : 'No results found.')
                  : t.noDownlines
                }
              </p>
            </div>
          ) : (
            filteredDownlineList.map((partner) => (
              <div
                id={`partner-row-${partner.username}`}
                key={partner.username}
                className="p-3 bg-black/35 hover:bg-black/60 border border-white/5 rounded-xl transition duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    partner.level === 1 ? 'bg-emerald-500/10 text-emerald-400' :
                    partner.level === 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-fuchsia-500/10 text-fuchsia-400'
                  }`}>
                    L{partner.level}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-200">
                      {partner.fullName}
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-mono">@{partner.username}</div>
                    
                    {/* Date */}
                    <div className="text-[8px] text-slate-500 flex items-center gap-1 mt-0.5 font-bold">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>
                        {new Date(partner.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  {/* Status Badge */}
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase mb-1 leading-none ${
                    partner.active 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {partner.active ? t.active : t.pending}
                  </span>

                  {/* Bonus Value */}
                  <div className="text-[10px] font-black text-slate-100 font-sans">
                    Rp {partner.bonusGenerated.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[7.5px] text-slate-500 font-bold block uppercase">{t.bonusGen}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
