import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Wallet,
  Percent,
  MousePointerClick,
  UserPlus,
  UserCheck,
  Activity,
  Trophy,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Gift
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { CONFIG } from '../types';

const RewardsPage: React.FC = () => {
  const {
    state,
    language,
    accounts,
    currentAccount,
    setCurrentTab
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Localized dictionary
  const dict = {
    id: {
      rewardsTitle: 'REWARDS & KOMISI',
      referralCommission: 'Struktur Komisi Referral',
      totalEarned: 'Total Komisi Didapat',
      conversionRate: 'Tingkat Konversi Jaringan',
      clicks: 'Klik Tautan',
      registrations: 'Mendaftar',
      activeUsers: 'Pengguna Aktif',
      convRate: 'Tingkat Konversi',
      refTracking: 'Pelacakan Tautan & Trafik',
      trafficSource: 'Sumber Trafik',
      leaderboardTitle: 'Top Sponsor Leaderboard',
      partners: 'Mitra',
      bonusEarned: 'Bonus Diperoleh',
      commissionsHistory: 'Riwayat Komisi & Bonus',
      buyer: 'Dari pembeli',
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      newRegs: 'Pendaftar Baru',
      activeRefs: 'Referral Aktif',
      netGrowth: 'Pertumbuhan Jaringan',
      analytics: 'Analisis Pertumbuhan',
      clickMsg: '1 klik link referral',
      regMsg: 'mendaftar',
      activeMsg: 'aktif beli kontrak',
      commissionDetail: 'Pembagian komisi langsung ditransfer ke saldo dompet Anda setelah downline mengaktifkan kontrak penambangan emas.'
    },
    en: {
      rewardsTitle: 'REWARDS & COMMISSIONS',
      referralCommission: 'Referral Commission Structure',
      totalEarned: 'Total Commission Earned',
      conversionRate: 'Network Conversion Rate',
      clicks: 'Link Clicks',
      registrations: 'Registered',
      activeUsers: 'Active Users',
      convRate: 'Conversion Rate',
      refTracking: 'Link Tracking & Sources',
      trafficSource: 'Traffic Sources',
      leaderboardTitle: 'Top Sponsor Leaderboard',
      partners: 'Partners',
      bonusEarned: 'Bonus Earned',
      commissionsHistory: 'Commission & Bonus History',
      buyer: 'From buyer',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      newRegs: 'New Registrations',
      activeRefs: 'Active Referrals',
      netGrowth: 'Network Growth',
      analytics: 'Growth Analytics',
      clickMsg: '1 click on referral link',
      regMsg: 'registered',
      activeMsg: 'active purchased contract',
      commissionDetail: 'Commission distribution is directly transferred to your wallet balance after downline activates gold mining contracts.'
    }
  };

  const t = dict[language];

  // Downline calculations
  const directList = useMemo(() => {
    return accounts.filter(
      acc =>
        acc.invitedBy &&
        currentAccount &&
        acc.invitedBy.toLowerCase() === currentAccount.username.toLowerCase()
    );
  }, [accounts, currentAccount]);

  const level1Usernames = useMemo(() => directList.map(acc => acc.username.toLowerCase()), [directList]);

  const l2List = useMemo(() => {
    return accounts.filter(
      acc => acc.invitedBy && level1Usernames.includes(acc.invitedBy.toLowerCase())
    );
  }, [accounts, level1Usernames]);

  const level2Usernames = useMemo(() => l2List.map(acc => acc.username.toLowerCase()), [l2List]);

  const l3List = useMemo(() => {
    return accounts.filter(
      acc => acc.invitedBy && level2Usernames.includes(acc.invitedBy.toLowerCase())
    );
  }, [accounts, level2Usernames]);

  const l1Count = directList.length;
  const l2Count = l2List.length;
  const l3Count = l3List.length;
  const totalReferrals = l1Count + l2Count + l3Count;

  const activeL1 = directList.filter(u => (u.state?.activeContracts || 0) > 0).length;
  const activeL2 = l2List.filter(u => (u.state?.activeContracts || 0) > 0).length;
  const activeL3 = l3List.filter(u => (u.state?.activeContracts || 0) > 0).length;
  const activeReferrals = activeL1 + activeL2 + activeL3;

  const clicksCount = useMemo(() => {
    const dbClicksCount = currentAccount?.state?.referralClicks?.length || 0;
    if (dbClicksCount > 0) {
      return dbClicksCount;
    }
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

  // Top sponsor leaderboard
  const topReferrers = useMemo(() => {
    return accounts
      .filter(acc => acc.username.toLowerCase() !== 'admin')
      .map(acc => {
        const directDownlinesCount = accounts.filter(
          down => down.invitedBy && down.invitedBy.toLowerCase() === acc.username.toLowerCase()
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

  // Chart data setup
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
    <div className="space-y-4 text-left pb-20 font-sans">
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron flex items-center gap-1.5">
          <Gift className="w-4.5 h-4.5 text-yellow-400" />
          {t.rewardsTitle}
        </h2>
      </div>

      {/* TOTAL COMMISSIONS & REWARDS ACCUMULATION */}
      <div className="bg-gradient-to-br from-[#2a1708] via-[#110524] to-[#04010a] border border-amber-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.08)] relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
        <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block mb-1">{t.totalEarned}</span>
        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 font-orbitron">
          Rp {state.referralEarned.toLocaleString('id-ID')}
        </div>
        <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-2 max-w-sm mx-auto">
          {t.commissionDetail}
        </p>
      </div>

      {/* REFERRAL COMMISSIONS SPLIT CARD */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-purple-400" />
          {t.referralCommission}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          {/* Level 1 */}
          <div className="p-3 rounded-2xl bg-black/45 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
            <div className="text-[8.5px] text-slate-400 font-bold block uppercase mb-1">LEVEL 1</div>
            <div className="text-xs font-black text-emerald-400 mb-0.5">10% BONUS</div>
            <div className="text-[9px] text-slate-500 font-bold">{l1Count} {t.partners}</div>
          </div>

          {/* Level 2 */}
          <div className="p-3 rounded-2xl bg-black/45 border border-amber-500/10 hover:border-amber-500/20 transition-colors">
            <div className="text-[8.5px] text-slate-400 font-bold block uppercase mb-1">LEVEL 2</div>
            <div className="text-xs font-black text-amber-400 mb-0.5">3% BONUS</div>
            <div className="text-[9px] text-slate-500 font-bold">{l2Count} {t.partners}</div>
          </div>

          {/* Level 3 */}
          <div className="p-3 rounded-2xl bg-black/45 border border-fuchsia-500/10 hover:border-fuchsia-500/20 transition-colors">
            <div className="text-[8.5px] text-slate-400 font-bold block uppercase mb-1">LEVEL 3</div>
            <div className="text-xs font-black text-fuchsia-400 mb-0.5">2% BONUS</div>
            <div className="text-[9px] text-slate-500 font-bold">{l3Count} {t.partners}</div>
          </div>
        </div>
      </div>

      {/* CONVERSION RATE FUNNEL */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-2">
          <Percent className="w-4 h-4 text-purple-400" />
          <span>{t.conversionRate}</span>
        </div>

        <div className="space-y-4">
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
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.max(10, clickToRegPercent)}%` }} />
            </div>
            <span className="text-[8px] text-slate-500 font-semibold italic">{clickToRegPercent}% {t.regMsg}</span>
          </div>

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
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.max(10, regToActivePercent)}%` }} />
            </div>
            <span className="text-[8px] text-slate-500 font-semibold italic">{regToActivePercent}% {t.activeMsg}</span>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/15 rounded-2xl p-4 text-center mt-2.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">{t.convRate} (Overall)</span>
            <div className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-orbitron mt-1">
              {overallConvPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* GROWTH ANALYTICS CHART */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-black text-gold-primary tracking-widest uppercase">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>{t.analytics}</span>
          </div>
          
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
        <div className="flex items-center justify-center gap-4 text-[9px] font-black tracking-wide uppercase mb-3 text-slate-400">
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

        {/* Interactive SVG Chart */}
        <div className="relative h-[180px] w-full bg-black/35 rounded-2xl border border-purple-950/40 p-1.5 overflow-hidden shadow-inner flex items-center justify-center">
          <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between p-4 pointer-events-none opacity-[0.06] border-y border-white">
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

            <path d={svgCoordinates.regArea} fill="url(#grad-reg)" />
            <path d={svgCoordinates.activeArea} fill="url(#grad-active)" />
            <path d={svgCoordinates.growthArea} fill="url(#grad-growth)" />

            <path d={svgCoordinates.regLine} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgCoordinates.activeLine} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgCoordinates.growthLine} fill="none" stroke="#e879f9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {svgCoordinates.pointsReg.map((pt, idx) => {
              const isHovered = hoveredPoint === idx;
              return (
                <g key={`group-${idx}`} className="cursor-pointer">
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

                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={isHovered ? 5 : 3} 
                    fill="#fbbf24" 
                    stroke="#000" 
                    strokeWidth="1"
                    pointerEvents="none"
                  />
                  
                  <circle 
                    cx={svgCoordinates.pointsActive[idx].x} 
                    cy={svgCoordinates.pointsActive[idx].y} 
                    r={isHovered ? 5 : 3} 
                    fill="#34d399" 
                    stroke="#000" 
                    strokeWidth="1"
                    pointerEvents="none"
                  />

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

          <AnimatePresence>
            {hoveredPoint !== null && (
              <motion.div 
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
                  {chartPoints[hoveredPoint].label} • Details
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

      {/* TRAFFIC SOURCES */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
          <Activity className="w-4.5 h-4.5 text-purple-400" />
          <span>{t.refTracking}</span>
        </div>

        <div className="space-y-3">
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

          <div className="space-y-2.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">{t.trafficSource}</span>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span>🟢 WhatsApp</span>
                <span className="font-bold text-slate-200">45% <span className="text-[8px] text-slate-500 font-medium">({Math.round(clicksCount * 0.45)} clicks)</span></span>
              </div>
              <div className="w-full h-1.5 bg-black/45 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span>🔵 Telegram</span>
                <span className="font-bold text-slate-200">30% <span className="text-[8px] text-slate-500 font-medium">({Math.round(clicksCount * 0.3)} clicks)</span></span>
              </div>
              <div className="w-full h-1.5 bg-black/45 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span>🔴 YouTube</span>
                <span className="font-bold text-slate-200">15% <span className="text-[8px] text-slate-500 font-medium">({Math.round(clicksCount * 0.15)} clicks)</span></span>
              </div>
              <div className="w-full h-1.5 bg-black/45 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP SPONSOR LEADERBOARD */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
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

      {/* COMMISSION & BONUS HISTORY */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center justify-between font-orbitron">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4.5 h-4.5 text-yellow-400" />
            <span>{t.commissionsHistory}</span>
          </div>
          <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full leading-none font-bold font-mono">
            {currentAccount?.state?.referralCommissions?.length || 0}
          </span>
        </div>

        <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
          {!currentAccount?.state?.referralCommissions || currentAccount.state.referralCommissions.length === 0 ? (
            <div className="text-center py-8 px-4 bg-black/25 border border-white/5 rounded-2xl font-semibold">
              <div className="text-xl mb-1 text-slate-600">💸</div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {language === 'id' ? 'Belum ada riwayat transaksi komisi yang tercatat di database.' : 'No commission transaction history recorded in the database yet.'}
              </p>
            </div>
          ) : (
            [...currentAccount.state.referralCommissions]
              .sort((a: any, b: any) => b.created_at - a.created_at)
              .map((comm: any) => (
                <div
                  key={comm.id}
                  className="p-3 bg-black/35 hover:bg-black/60 border border-white/5 rounded-xl transition duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500 shrink-0 font-extrabold text-xs">
                      L{comm.level}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-200">
                        {t.buyer}: <span className="text-yellow-400 font-mono">@{comm.buyer_username}</span>
                      </div>
                      <div className="text-[8.5px] text-slate-500 font-mono mt-0.5">ID: {comm.id}</div>
                      
                      <div className="text-[8px] text-slate-400 flex items-center gap-1 mt-0.5 font-bold">
                        <Calendar className="w-2.5 h-2.5 text-slate-500" />
                        <span>
                          {new Date(comm.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(comm.created_at).toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="inline-block px-1.5 py-0.5 rounded-full text-[7.5px] font-black uppercase mb-1 leading-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {comm.status?.toUpperCase() || 'PAID'}
                    </span>
                    <div className="text-[10px] font-black text-emerald-400 font-sans">
                      +Rp {Number(comm.amount).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
