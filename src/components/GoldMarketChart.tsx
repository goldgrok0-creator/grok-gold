import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Activity, ShieldCheck, Globe, Wifi } from 'lucide-react';
import { supabase } from '../supabase';

interface GoldMarketChartProps {
  language: 'id' | 'en';
}

interface GlobalActivity {
  id: string;
  type: 'registration' | 'contract' | 'claim' | 'referral' | 'deposit';
  username: string;
  timestamp: number;
  amount?: number;
}

function maskUsername(username: string): string {
  if (!username) return 'Member #0000';
  let clean = username.replace(/[@#]/g, '');
  if (clean.length === 0) return 'Member #0000';
  
  // Deterministic hash to generate a 4-character uppercase code
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(16).toUpperCase();
  const code = (hex + '1234').substring(0, 4);
  return `Member #${code}`;
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'registration':
      return '👤';
    case 'claim':
      return '💰';
    case 'contract':
      return '⚡';
    case 'referral':
      return '🤝';
    case 'deposit':
      return '💸';
    default:
      return '⚙️';
  }
}

function getActivityLabel(type: string, language: 'id' | 'en'): string {
  if (language === 'id') {
    switch (type) {
      case 'registration': return 'Member Baru';
      case 'claim': return 'Klaim Reward';
      case 'contract': return 'Aktivasi Kontrak';
      case 'referral': return 'Referral Baru';
      case 'deposit': return 'Pembayaran Sukses';
      default: return 'Aktivitas';
    }
  } else {
    switch (type) {
      case 'registration': return 'New Member';
      case 'claim': return 'Claim Reward';
      case 'contract': return 'Contract Activated';
      case 'referral': return 'New Referral';
      case 'deposit': return 'Successful Payment';
      default: return 'Activity';
    }
  }
}

function getActivityText(activity: GlobalActivity, language: 'id' | 'en'): string {
  const maskedName = maskUsername(activity.username);
  
  if (language === 'id') {
    switch (activity.type) {
      case 'registration':
        return `${maskedName} berhasil bergabung`;
      case 'contract':
        return `${maskedName} berhasil mengaktifkan kontrak tambang`;
      case 'claim':
        return `${maskedName} berhasil klaim reward sebesar Rp ${(activity.amount || 0).toLocaleString('id-ID')}`;
      case 'referral':
        return `Referral ${maskedName} bergabung lewat undangan`;
      case 'deposit':
        return `Pembayaran ${maskedName} sukses sebesar Rp ${(activity.amount || 0).toLocaleString('id-ID')}`;
      default:
        return `${maskedName} melakukan aktivitas`;
    }
  } else {
    switch (activity.type) {
      case 'registration':
        return `${maskedName} has successfully joined`;
      case 'contract':
        return `${maskedName} activated a mining contract`;
      case 'claim':
        return `${maskedName} claimed rewards of Rp ${(activity.amount || 0).toLocaleString('id-ID')}`;
      case 'referral':
        return `Referral ${maskedName} joined via invitation`;
      case 'deposit':
        return `Payment of Rp ${(activity.amount || 0).toLocaleString('id-ID')} for ${maskedName} succeeded`;
      default:
        return `${maskedName} performed an activity`;
    }
  }
}

function formatRelativeTime(timestamp: number, language: 'id' | 'en'): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (language === 'id') {
    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) {
      if (diffMin <= 2) return '2 menit lalu';
      if (diffMin <= 15) return '15 menit lalu';
      return `${diffMin} menit lalu`;
    }
    if (diffHour < 24) {
      if (diffHour === 1) return '1 jam lalu';
      return `${diffHour} jam lalu`;
    }
    return `${diffDay} hari lalu`;
  } else {
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) {
      if (diffMin <= 2) return '2 minutes ago';
      if (diffMin <= 15) return '15 minutes ago';
      return `${diffMin} minutes ago`;
    }
    if (diffHour < 24) {
      if (diffHour === 1) return '1 hour ago';
      return `${diffHour} hours ago`;
    }
    return `${diffDay} days ago`;
  }
}

export default function GoldMarketChart({ language }: GoldMarketChartProps) {
  // Starting gold spot price in IDR per gram
  const [goldPrice, setGoldPrice] = useState(1485600);
  const [priceHistory, setPriceHistory] = useState<number[]>([
    1484200, 1484500, 1484100, 1484900, 1485300, 1485100, 1485400, 1485200, 1485600
  ]);
  const [priceChange, setPriceChange] = useState(0.24); // % change
  const [isUp, setIsUp] = useState(true);

  // Real-time Supabase Activities State
  const [activities, setActivities] = useState<GlobalActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [timeTicker, setTimeTicker] = useState(0);

  // Price simulator loop (updates every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setGoldPrice(prev => {
        const percentChange = (Math.random() * 0.37 - 0.15) / 100;
        const diff = prev * percentChange;
        const nextPrice = Math.round(prev + diff);
        
        setPriceHistory(history => [...history.slice(1), nextPrice]);

        const initialPrice = 1483000;
        const changeFromStart = ((nextPrice - initialPrice) / initialPrice) * 100;
        setPriceChange(parseFloat(changeFromStart.toFixed(2)));
        setIsUp(changeFromStart >= 0);

        return nextPrice;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Sync relative timers
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(prev => prev + 1);
    }, 15000); // refresh every 15s
    return () => clearInterval(timer);
  }, []);

  const loadActivities = async () => {
    try {
      // 1. Fetch recent users
      const { data: usersData } = await supabase
        .from('users')
        .select('username, created_at, invited_by')
        .order('created_at', { ascending: false })
        .limit(20);

      // 2. Fetch recent transactions
      const { data: txsData } = await supabase
        .from('transactions')
        .select('username, type, amount, description, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      // 3. Fetch approved deposits
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('username, amount, status, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20);

      const merged: GlobalActivity[] = [];

      // Map users
      if (usersData) {
        usersData.forEach((u: any) => {
          const timestamp = Number(u.created_at) || Date.now();
          merged.push({
            id: `reg-${u.username}-${timestamp}`,
            type: 'registration',
            username: u.username,
            timestamp,
          });

          if (u.invited_by && u.invited_by.trim() !== '') {
            merged.push({
              id: `ref-${u.username}-${timestamp}`,
              type: 'referral',
              username: u.username,
              timestamp,
            });
          }
        });
      }

      // Map transactions
      if (txsData) {
        txsData.forEach((t: any) => {
          const timestamp = Number(t.created_at) || Date.now();
          if (t.type === 'reward' || t.type === 'welcome_bonus') {
            merged.push({
              id: `tx-${t.type}-${t.username}-${timestamp}`,
              type: 'claim',
              username: t.username,
              timestamp,
              amount: Number(t.amount) || 0,
            });
          } else if (t.type === 'purchase') {
            merged.push({
              id: `tx-purchase-${t.username}-${timestamp}`,
              type: 'contract',
              username: t.username,
              timestamp,
              amount: Number(t.amount) || 0,
            });
          }
        });
      }

      // Map deposits
      if (depositsData) {
        depositsData.forEach((d: any) => {
          const timestamp = Number(d.created_at) || Date.now();
          merged.push({
            id: `dep-${d.username}-${timestamp}`,
            type: 'deposit',
            username: d.username,
            timestamp,
            amount: Number(d.amount) || 0,
          });
        });
      }

      // Sort combined array descending by timestamp
      merged.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(merged.slice(0, 20));
    } catch (err) {
      console.error('Error loading real-time global activities:', err);
    }
  };

  useEffect(() => {
    loadActivities();

    // Listen to real-time changes using Supabase Realtime Channels
    const channelName = `global-live-activities_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadActivities();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadActivities();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, () => {
        loadActivities();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
        loadActivities();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Generate SVG path for sparkline chart
  const minVal = Math.min(...priceHistory) * 0.9995;
  const maxVal = Math.max(...priceHistory) * 1.0005;
  const range = maxVal - minVal || 1;
  
  const width = 280;
  const height = 48;
  const points = priceHistory.map((val, i) => {
    const x = (i / (priceHistory.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div id="goldMarketChartContainer" className="bg-[#0b051a] border border-gold-primary/15 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gold-primary/10 border border-gold-primary/20 text-gold-primary animate-pulse">
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">
              {language === 'id' ? 'PASAR EMAS SPOT INTERNASIONAL' : 'INTERNATIONAL SPOT GOLD'}
            </span>
            <span className="text-xs font-black text-white font-orbitron">
              GROCKGOLD INDEX
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-gradient-gold font-orbitron">
            Rp {goldPrice.toLocaleString('id-ID')}/g
          </div>
          <div className={`text-[9px] font-bold flex items-center justify-end gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? '+' : ''}{priceChange}% (24H)
          </div>
        </div>
      </div>

      {/* Sparkline Graphic */}
      <div className="bg-black/35 rounded-2xl p-3 border border-white/5 relative overflow-hidden flex flex-col justify-end h-20">
        <div className="absolute top-2 left-3 flex gap-4 text-[8px] font-bold text-slate-500 uppercase font-mono">
          <span>HIGH: Rp {Math.max(...priceHistory).toLocaleString('id-ID')}</span>
          <span>LOW: Rp {Math.min(...priceHistory).toLocaleString('id-ID')}</span>
        </div>
        
        {/* SVG Sparkline */}
        <div className="w-full h-12 flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="goldChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area under line */}
            <path d={areaD} fill="url(#goldChartGradient)" />
            {/* Main Sparkline */}
            <path
              d={pathD}
              fill="none"
              stroke="#d4af37"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_4px_rgba(212,175,55,0.6)]"
            />
            {/* Pulse on the latest data point */}
            <circle
              cx={width}
              cy={height - ((priceHistory[priceHistory.length - 1] - minVal) / range) * height}
              r="3.5"
              fill="#facc15"
              className="animate-ping"
              style={{ transformOrigin: 'center' }}
            />
            <circle
              cx={width}
              cy={height - ((priceHistory[priceHistory.length - 1] - minVal) / range) * height}
              r="2.5"
              fill="#d4af37"
            />
          </svg>
        </div>
      </div>

      {/* Real-time Global Activity Ticker matching original screenshot design */}
      <div className="bg-[#12082b]/80 border border-purple-900/40 rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-xl">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-loop {
            display: flex;
            gap: 2.5rem;
            animation: marquee 65s linear infinite;
            width: max-content;
          }
          .animate-marquee-loop:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        {/* Header + Ticker container */}
        <div className="flex items-start gap-3.5 pr-22">
          <Activity className="w-5 h-5 text-purple-300 shrink-0 mt-0.5 animate-pulse" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-xs font-black tracking-widest text-slate-400 uppercase font-orbitron mb-1.5">
              {language === 'id' ? 'AKTIVITAS LIVE GLOBAL' : 'GLOBAL LIVE BULLETIN'}
            </div>

            <div className="overflow-hidden relative w-full h-6 flex items-center">
              {activities.length === 0 ? (
                <div className="text-slate-400 text-xs font-semibold italic">
                  {language === 'id' ? 'Belum ada aktivitas terbaru' : 'No recent activities'}
                </div>
              ) : (
                <div className="animate-marquee-loop whitespace-nowrap">
                  {[...activities, ...activities].map((act, index) => {
                    let displayUser = act.username ? act.username.replace(/^@/, '') : 'Member';
                    if (displayUser.length > 15) {
                      displayUser = maskUsername(displayUser);
                    } else {
                      displayUser = `@${displayUser}`;
                    }

                    let actionText = '';
                    let valueText = '';

                    if (language === 'id') {
                      switch (act.type) {
                        case 'contract':
                          actionText = 'membeli kontrak baru';
                          valueText = act.amount ? `${act.amount} GLD` : '1 GLD';
                          break;
                        case 'claim':
                          actionText = 'klaim reward sebesar';
                          valueText = `Rp ${(act.amount || 0).toLocaleString('id-ID')}`;
                          break;
                        case 'deposit':
                          actionText = 'pembayaran sukses sebesar';
                          valueText = `Rp ${(act.amount || 0).toLocaleString('id-ID')}`;
                          break;
                        case 'registration':
                          actionText = 'berhasil bergabung';
                          valueText = 'Member Baru';
                          break;
                        case 'referral':
                          actionText = 'mendapatkan referral baru';
                          valueText = '';
                          break;
                        default:
                          actionText = 'melakukan transaksi';
                          valueText = act.amount ? `Rp ${(act.amount).toLocaleString('id-ID')}` : '';
                      }
                    } else {
                      switch (act.type) {
                        case 'contract':
                          actionText = 'purchased new contract';
                          valueText = act.amount ? `${act.amount} GLD` : '1 GLD';
                          break;
                        case 'claim':
                          actionText = 'claimed reward of';
                          valueText = `Rp ${(act.amount || 0).toLocaleString('id-ID')}`;
                          break;
                        case 'deposit':
                          actionText = 'payment succeeded';
                          valueText = `Rp ${(act.amount || 0).toLocaleString('id-ID')}`;
                          break;
                        case 'registration':
                          actionText = 'successfully joined';
                          valueText = 'New Member';
                          break;
                        case 'referral':
                          actionText = 'new referral joined';
                          valueText = '';
                          break;
                        default:
                          actionText = 'performed activity';
                          valueText = act.amount ? `Rp ${(act.amount).toLocaleString('id-ID')}` : '';
                      }
                    }

                    return (
                      <span key={`${act.id}-${index}`} className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap pr-4">
                        <span>🇮🇩</span>
                        <span className="font-bold text-white">{displayUser}</span>
                        <span className="text-slate-200 font-medium">{actionText}</span>
                        {valueText && <span className="font-extrabold text-amber-400">{valueText}</span>}
                        <span className="text-slate-400 text-[10px] font-medium ml-0.5">
                          ({formatRelativeTime(act.timestamp, language)})
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Node Location Badge floating right */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#2d1558]/90 border border-purple-600/40 text-white rounded-full px-2.5 py-1 flex items-center gap-1 text-[10px] font-extrabold tracking-wider shadow-md shrink-0">
          <Globe className="w-3 h-3 text-purple-200 shrink-0" />
          <span>JAKARTA</span>
        </div>
      </div>

      {/* Telemetry quick status metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="py-2.5 px-1 bg-[#120829] border border-purple-900/30 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase mb-0.5">
            {language === 'id' ? 'TREN PASAR' : 'MARKET BIAS'}
          </span>
          <span className="text-emerald-400 font-black text-xs sm:text-sm uppercase">BULLISH</span>
        </div>
        <div className="py-2.5 px-1 bg-[#120829] border border-purple-900/30 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase mb-0.5">SPREAD</span>
          <span className="text-white font-mono font-black text-xs sm:text-sm">0.015%</span>
        </div>
        <div className="py-2.5 px-1 bg-[#120829] border border-purple-900/30 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase mb-0.5">LIQUIDITY</span>
          <span className="text-white font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-200 shrink-0" />
            SECURED
          </span>
        </div>
      </div>
    </div>
  );
}
