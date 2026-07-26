import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  DollarSign,
  Maximize2
} from 'lucide-react';

interface TransactionItem {
  tx: {
    id?: string;
    type: string;
    amount: number;
    date: number;
    description?: string;
    status?: string;
  };
  username: string;
}

interface MarketTrendsChartProps {
  transactions: TransactionItem[];
  language?: 'id' | 'en';
}

export default function MarketTrendsChart({ transactions, language = 'id' }: MarketTrendsChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [metricFilter, setMetricFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  // Generate 30 days dataset
  const {
    chartData,
    total30dDeposits,
    total30dWithdrawals,
    net30d,
    avgDailyDeposit,
    peakDay,
    prevTotalVol,
    currentTotalVol,
    totalVolGrowthPct,
    depGrowthPct,
    witGrowthPct
  } = useMemo(() => {
    const now = new Date();
    const daysMap: { [key: string]: { dateStr: string; fullDate: string; deposit: number; withdraw: number; net: number; count: number } } = {};

    // Initialize last 30 days
    const daysArray: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthShort = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
      const dateStr = `${dayNum} ${monthShort}`;

      daysMap[key] = {
        dateStr,
        fullDate: key,
        deposit: 0,
        withdraw: 0,
        net: 0,
        count: 0
      };
      daysArray.push(key);
    }

    let depSum = 0;
    let witSum = 0;
    let prevDepSum = 0;
    let prevWitSum = 0;

    const current30dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0).getTime();
    const prev30dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59, 0, 0, 0, 0).getTime();

    // Aggregate transactions into daysMap
    transactions.forEach(item => {
      const tx = item.tx;
      if (!tx || !tx.date) return;

      // Filter out rejected transactions if status is explicitly rejected
      if (tx.status && tx.status.toLowerCase().includes('reject')) return;

      const txTime = new Date(tx.date).getTime();
      const txDate = new Date(tx.date);
      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-${String(txDate.getDate()).padStart(2, '0')}`;
      const amt = Number(tx.amount) || 0;

      if (daysMap[key]) {
        if (tx.type === 'deposit') {
          daysMap[key].deposit += amt;
          depSum += amt;
        } else if (tx.type === 'withdraw') {
          daysMap[key].withdraw += amt;
          witSum += amt;
        }
        daysMap[key].net = daysMap[key].deposit - daysMap[key].withdraw;
        daysMap[key].count += 1;
      } else if (txTime >= prev30dStart && txTime < current30dStart) {
        if (tx.type === 'deposit') {
          prevDepSum += amt;
        } else if (tx.type === 'withdraw') {
          prevWitSum += amt;
        }
      }
    });

    const formattedData = daysArray.map(key => daysMap[key]);

    // Find peak day
    let maxVal = 0;
    let peak = formattedData[0] || { dateStr: '-', deposit: 0 };
    formattedData.forEach(d => {
      if (d.deposit + d.withdraw > maxVal) {
        maxVal = d.deposit + d.withdraw;
        peak = d;
      }
    });

    const currentTotalVol = depSum + witSum;
    const prevTotalVol = prevDepSum + prevWitSum;

    const totalVolGrowthPct = prevTotalVol > 0
      ? ((currentTotalVol - prevTotalVol) / prevTotalVol) * 100
      : (currentTotalVol > 0 ? 100 : 0);

    const depGrowthPct = prevDepSum > 0
      ? ((depSum - prevDepSum) / prevDepSum) * 100
      : (depSum > 0 ? 100 : 0);

    const witGrowthPct = prevWitSum > 0
      ? ((witSum - prevWitSum) / prevWitSum) * 100
      : (witSum > 0 ? 100 : 0);

    return {
      chartData: formattedData,
      total30dDeposits: depSum,
      total30dWithdrawals: witSum,
      net30d: depSum - witSum,
      avgDailyDeposit: Math.round(depSum / 30),
      peakDay: peak,
      prevTotalVol,
      currentTotalVol,
      totalVolGrowthPct,
      depGrowthPct,
      witGrowthPct
    };
  }, [transactions, language]);

  // Currency formatter
  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(1)}Jt`;
    }
    if (val >= 1_000) {
      return `Rp ${(val / 1_000).toFixed(0)}rb`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span>{data.fullDate} ({data.dateStr})</span>
            <span className="text-[10px] text-slate-400 font-normal">{data.count} tx</span>
          </div>

          <div className="space-y-1">
            {(metricFilter === 'all' || metricFilter === 'deposits') && (
              <div className="flex justify-between items-center text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {language === 'id' ? 'Deposit' : 'Deposits'}:
                </span>
                <span className="font-mono font-bold">Rp {data.deposit.toLocaleString('id-ID')}</span>
              </div>
            )}

            {(metricFilter === 'all' || metricFilter === 'withdrawals') && (
              <div className="flex justify-between items-center text-rose-400 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {language === 'id' ? 'Penarikan' : 'Withdrawals'}:
                </span>
                <span className="font-mono font-bold">Rp {data.withdraw.toLocaleString('id-ID')}</span>
              </div>
            )}

            {metricFilter === 'all' && (
              <div className="flex justify-between items-center text-cyan-400 font-medium pt-1 border-t border-slate-800/80">
                <span>Net Cashflow:</span>
                <span className={`font-mono font-bold ${data.net >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  Rp {data.net.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-slate-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                {language === 'id' ? 'MARKET TRENDS & VOLUMETRIK 30 HARI' : 'MARKET TRENDS (30-DAY VOLUME)'}
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'id'
                  ? 'Tren kumulatif perbandingan volume deposit & penarikan harian selama 30 hari terakhir.'
                  : '30-day historical transaction volume trends comparing daily deposits vs withdrawals.'}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS (Chart Type & Filter) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Metric Filter */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMetricFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metricFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'id' ? 'Semua' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter('deposits')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metricFilter === 'deposits'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter('withdrawals')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metricFilter === 'withdrawals'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'id' ? 'Penarikan' : 'Withdrawals'}
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-slate-400">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Area Chart"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'area' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'hover:text-white'
              }`}
            >
              <AreaChartIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="Bar Chart"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              title="Line Chart"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'line' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'hover:text-white'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY KPI CARDS WITH PERCENTAGE GROWTH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
        {/* CARD 1: PERCENTAGE GROWTH SUMMARY */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              {language === 'id' ? 'PERTUMBUHAN VOLUME' : 'VOLUME GROWTH'}
            </span>
            <span className="text-[9px] text-slate-500 font-normal">vs 30d prior</span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-lg font-black font-mono ${totalVolGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalVolGrowthPct >= 0 ? '+' : ''}{totalVolGrowthPct.toFixed(1)}%
            </span>
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
              totalVolGrowthPct >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {totalVolGrowthPct >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {totalVolGrowthPct >= 0 ? 'Growth' : 'Decline'}
            </span>
          </div>

          <div className="text-[9px] text-slate-400 mt-1 truncate">
            {language === 'id' ? 'Vol' : 'Vol'}: <span className="font-mono text-slate-200">Rp {currentTotalVol.toLocaleString('id-ID')}</span> vs <span className="font-mono text-slate-400">Rp {prevTotalVol.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* CARD 2: DEPOSITS 30D */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              {language === 'id' ? 'DEPOSIT 30 HARI' : '30D DEPOSITS'}
            </span>
            <span className={`text-[9px] font-mono font-bold ${depGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {depGrowthPct >= 0 ? '+' : ''}{depGrowthPct.toFixed(0)}%
            </span>
          </div>
          <div className="text-base font-black text-emerald-400 font-mono mt-1">
            Rp {total30dDeposits.toLocaleString('id-ID')}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            Avg: Rp {avgDailyDeposit.toLocaleString('id-ID')}/{language === 'id' ? 'hari' : 'day'}
          </div>
        </div>

        {/* CARD 3: WITHDRAWALS 30D */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              {language === 'id' ? 'PENARIKAN 30 HARI' : '30D WITHDRAWALS'}
            </span>
            <span className={`text-[9px] font-mono font-bold ${witGrowthPct <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {witGrowthPct >= 0 ? '+' : ''}{witGrowthPct.toFixed(0)}%
            </span>
          </div>
          <div className="text-base font-black text-rose-400 font-mono mt-1">
            Rp {total30dWithdrawals.toLocaleString('id-ID')}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            Total outflux
          </div>
        </div>

        {/* CARD 4: NET CASHFLOW */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            NET CASHFLOW (30D)
          </div>
          <div className={`text-base font-black font-mono mt-1 ${net30d >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            Rp {net30d.toLocaleString('id-ID')}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            {net30d >= 0 ? 'Surplus / Net Inflow' : 'Deficit / Net Outflow'}
          </div>
        </div>

        {/* CARD 5: PEAK VOLUME */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {language === 'id' ? 'PUNCAK VOLUME' : 'PEAK VOLUME DAY'}
          </div>
          <div className="text-base font-black text-amber-400 font-mono mt-1 truncate">
            {peakDay.dateStr}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
            Rp {(peakDay.deposit + peakDay.withdraw).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* RECHARTS MAIN CONTAINER */}
      <div className="h-72 w-full pt-2 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorWithdraw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="dateStr"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={formatIDR}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 font-semibold">{value === 'deposit' ? (language === 'id' ? 'Deposit Masuk' : 'Deposits') : (language === 'id' ? 'Penarikan Keluar' : 'Withdrawals')}</span>}
              />

              {(metricFilter === 'all' || metricFilter === 'deposits') && (
                <Area
                  type="monotone"
                  dataKey="deposit"
                  name="deposit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDeposit)"
                />
              )}

              {(metricFilter === 'all' || metricFilter === 'withdrawals') && (
                <Area
                  type="monotone"
                  dataKey="withdraw"
                  name="withdraw"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWithdraw)"
                />
              )}
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="dateStr"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={formatIDR}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 font-semibold">{value === 'deposit' ? (language === 'id' ? 'Deposit Masuk' : 'Deposits') : (language === 'id' ? 'Penarikan Keluar' : 'Withdrawals')}</span>}
              />

              {(metricFilter === 'all' || metricFilter === 'deposits') && (
                <Bar dataKey="deposit" name="deposit" fill="#10b981" radius={[4, 4, 0, 0]} />
              )}
              {(metricFilter === 'all' || metricFilter === 'withdrawals') && (
                <Bar dataKey="withdraw" name="withdraw" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="dateStr"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={formatIDR}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 font-semibold">{value === 'deposit' ? (language === 'id' ? 'Deposit Masuk' : 'Deposits') : (language === 'id' ? 'Penarikan Keluar' : 'Withdrawals')}</span>}
              />

              {(metricFilter === 'all' || metricFilter === 'deposits') && (
                <Line
                  type="monotone"
                  dataKey="deposit"
                  name="deposit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(metricFilter === 'all' || metricFilter === 'withdrawals') && (
                <Line
                  type="monotone"
                  dataKey="withdraw"
                  name="withdraw"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e' }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
