import React, { useMemo } from 'react';
import { TrendingUp, Users, Wallet as WalletIcon, Briefcase, Clock } from 'lucide-react';
import { UserAccount } from '../../types';

interface DashboardProps {
  accounts: UserAccount[];
  systemConfig: any;
  language: 'id' | 'en';
  onNavigate: (path: string) => void;
}

export default function Dashboard({ accounts, systemConfig, language, onNavigate }: DashboardProps) {
  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const totalUsers = accounts.length - 1; // Exclude admin
    let totalBalances = 0;
    let totalContracts = 0;
    let allTransactions: { tx: any; username: string }[] = [];

    accounts.forEach(acc => {
      if (acc.username.toLowerCase() !== 'admin') {
        totalBalances += acc.state?.mainBalance || 0;
        totalContracts += acc.state?.activeContracts || 0;
      }
      if (acc.state?.transactions) {
        acc.state.transactions.forEach((t: any) => {
          allTransactions.push({ tx: t, username: acc.username });
        });
      }
    });

    // Sort transactions
    allTransactions.sort((a, b) => b.tx.date - a.tx.date);

    const deposits = allTransactions.filter(t => t.tx.type === 'deposit');
    const withdrawals = allTransactions.filter(t => t.tx.type === 'withdraw');

    const pendingDeposits = deposits.filter(t => t.tx.description.toLowerCase().includes('pending'));
    const pendingWithdrawals = withdrawals.filter(t => t.tx.description.toLowerCase().includes('proses') || t.tx.description.toLowerCase().includes('pending'));

    const totalDepositsVolume = deposits.reduce((sum, item) => sum + item.tx.amount, 0);
    const totalWithdrawalsVolume = withdrawals.reduce((sum, item) => sum + item.tx.amount, 0);

    return {
      totalUsers: Math.max(0, totalUsers),
      totalBalances,
      totalContracts,
      totalDepositsVolume,
      totalWithdrawalsVolume,
      allTransactions,
      deposits,
      withdrawals,
      pendingDepositsCount: pendingDeposits.length,
      pendingDepositsVolume: pendingDeposits.reduce((sum, item) => sum + item.tx.amount, 0),
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsVolume: pendingWithdrawals.reduce((sum, item) => sum + item.tx.amount, 0)
    };
  }, [accounts]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* WELCOME BANNER & SYSTEM STATUS */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 border border-purple-900/20 rounded-2xl p-5 shadow-2xl animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-[9px] font-black text-rose-400 tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              {language === 'id' ? 'SISTEM KONTROL TERINTEGRASI' : 'INTEGRATED CONTROL ROOM'}
            </div>
            <h2 className="text-lg font-extrabold text-white">
              {language === 'id' ? 'Selamat Datang di Portal Utama Admin' : 'Welcome to the Primary Admin Terminal'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'id' 
                ? 'Kelola data pengguna, konfirmasi transaksi masuk/keluar, dan awasi parameter hashrate global.' 
                : 'Govern user databases, approve financial flows, and supervise real-time mining hashrate stability.'}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl shrink-0">
            <div className="text-right">
              <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">{language === 'id' ? 'RATA-RATA REWARD' : 'EST. DAILY INTEREST'}</span>
              <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">{Number(systemConfig?.dailyRewardPercent || 4).toFixed(1)}% / {language === 'id' ? 'Hari' : 'Day'}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-right">
              <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">{language === 'id' ? 'HARGA KONTRAK' : 'CONTRACT VALUE'}</span>
              <span className="text-xs font-black text-purple-400 font-mono mt-0.5 block">Rp {Number(systemConfig?.pricePerUnit || 180000).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* HIGH-FIDELITY GLASS STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Users */}
        <div className="relative overflow-hidden bg-slate-950/45 border-l-4 border-l-rose-500 border border-slate-900 rounded-2xl p-4 transition-all duration-300 hover:border-slate-800/80 hover:translate-y-[-2px] hover:shadow-xl group">
          <div className="absolute -right-3 -bottom-3 text-rose-500/5 group-hover:text-rose-500/10 transition-colors duration-300">
            <Users className="w-20 h-20" />
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {language === 'id' ? 'TOTAL ANGGOTA' : 'TOTAL MEMBERS'}
            </span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">{stats.totalUsers}</div>
          <div className="text-[9px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            {language === 'id' ? 'Terdaftar aktif di sistem' : 'Registered active accounts'}
          </div>
        </div>

        {/* Stat 2: Total Balances liability */}
        <div className="relative overflow-hidden bg-slate-950/45 border-l-4 border-l-emerald-500 border border-slate-900 rounded-2xl p-4 transition-all duration-300 hover:border-slate-800/80 hover:translate-y-[-2px] hover:shadow-xl group">
          <div className="absolute -right-3 -bottom-3 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors duration-300">
            <WalletIcon className="w-20 h-20" />
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {language === 'id' ? 'SALDO ANGGOTA' : 'COMBINED LIABILITY'}
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <WalletIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-100 font-mono tracking-tight leading-8 truncate">
            Rp {stats.totalBalances.toLocaleString('id-ID')}
          </div>
          <div className="text-[9px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            {language === 'id' ? 'Akumulasi saldo kas user' : 'Sum of user wallets'}
          </div>
        </div>

        {/* Stat 3: Total Contracts */}
        <div className="relative overflow-hidden bg-slate-950/45 border-l-4 border-l-purple-500 border border-slate-900 rounded-2xl p-4 transition-all duration-300 hover:border-slate-800/80 hover:translate-y-[-2px] hover:shadow-xl group">
          <div className="absolute -right-3 -bottom-3 text-purple-500/5 group-hover:text-purple-500/10 transition-colors duration-300">
            <Briefcase className="w-20 h-20" />
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {language === 'id' ? 'UNIT TAMBANG AKTIF' : 'ACTIVE HASH UNIT'}
            </span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Briefcase className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {stats.totalContracts} <span className="text-xs font-bold text-slate-400">Unit</span>
          </div>
          <div className="text-[9px] text-slate-500 font-medium mt-1 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            Rp {(stats.totalContracts * Number(systemConfig?.pricePerUnit || 180000)).toLocaleString('id-ID')} {language === 'id' ? 'Volume kontrak' : 'Contract volume'}
          </div>
        </div>

        {/* Stat 4: Pending Approvals Alert queue */}
        <div className="relative overflow-hidden bg-slate-950/45 border-l-4 border-l-amber-500 border border-slate-900 rounded-2xl p-4 transition-all duration-300 hover:border-slate-800/80 hover:translate-y-[-2px] hover:shadow-xl group">
          <div className="absolute -right-3 -bottom-3 text-amber-500/5 group-hover:text-amber-500/10 transition-colors duration-300">
            <TrendingUp className="w-20 h-20" />
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {language === 'id' ? 'ANTRIAN TRANSAKSI' : 'PENDING QUEUES'}
            </span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {stats.pendingDepositsCount + stats.pendingWithdrawalsCount}
          </div>
          <div className="text-[9px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            {stats.pendingDepositsCount} DEP • {stats.pendingWithdrawalsCount} Penarikan
          </div>
        </div>
      </div>

      {/* MID-DASHBOARD DUAL-COLUMN INSIGHT MODULE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Box A: Parallel Transaction Volumetrics Bar Chart (12 Columns) */}
        <div className="lg:col-span-12 bg-slate-950/40 border border-slate-800/50 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {language === 'id' ? 'ANALISIS VOLUMETRIK KAS MASUK & KELUAR' : 'VOLUME ANALYTICS INFLOW VS OUTFLOW'}
            </h3>
            
            <div className="space-y-4">
              {/* Deposits Inflow */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-semibold">{language === 'id' ? 'Total Deposit Masuk' : 'Total Deposits Inflow'}</span>
                  <span className="font-bold text-emerald-400 font-mono">Rp {stats.totalDepositsVolume.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    style={{ width: `${stats.totalDepositsVolume + stats.totalWithdrawalsVolume > 0 ? (stats.totalDepositsVolume / (stats.totalDepositsVolume + stats.totalWithdrawalsVolume)) * 100 : 50}%` }}
                  />
                </div>
              </div>

              {/* Withdrawals Outflow */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-semibold">{language === 'id' ? 'Total Penarikan Keluar' : 'Total Withdrawals Outflow'}</span>
                  <span className="font-bold text-rose-400 font-mono">Rp {stats.totalWithdrawalsVolume.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                    style={{ width: `${stats.totalDepositsVolume + stats.totalWithdrawalsVolume > 0 ? (stats.totalWithdrawalsVolume / (stats.totalDepositsVolume + stats.totalWithdrawalsVolume)) * 100 : 50}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/40 flex justify-between items-center text-[10px] text-slate-500 font-medium">
            <span>{language === 'id' ? 'Sistem Likuiditas Kas' : 'Reserve & Liability Net ratio'}</span>
            <span className="text-slate-400 font-semibold font-mono">
              Net: Rp {(stats.totalDepositsVolume - stats.totalWithdrawalsVolume).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Pending Approvals Alert Bar */}
      {(stats.pendingDepositsCount > 0 || stats.pendingWithdrawalsCount > 0) && (
        <div className="relative overflow-hidden bg-amber-950/15 border border-amber-500/25 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-xl mt-0.5 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest text-amber-400 uppercase">
                {language === 'id' ? 'TRANSAKSI MENUNGGU VERIFIKASI SEGERA' : 'FINANCIAL TRANSACTIONS AWAITING ACTION'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'id' 
                  ? `Terdapat ${stats.pendingDepositsCount} deposit dan ${stats.pendingWithdrawalsCount} penarikan baru yang membutuhkan otorisasi Anda.` 
                  : `There are ${stats.pendingDepositsCount} pending deposits and ${stats.pendingWithdrawalsCount} withdrawal requests ready to process.`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 relative z-10 w-full md:w-auto">
            <button 
              onClick={() => onNavigate('/admin/deposit')} 
              className="flex-1 md:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition uppercase tracking-wide cursor-pointer shadow-lg shadow-amber-950/30 font-bold"
            >
              {language === 'id' ? 'Otorisasi Deposit' : 'Process Deposits'}
            </button>
            <button 
              onClick={() => onNavigate('/admin/withdraw')} 
              className="flex-1 md:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition uppercase tracking-wide cursor-pointer shadow-lg shadow-rose-950/30 font-bold"
            >
              {language === 'id' ? 'Otorisasi Penarikan' : 'Process Withdrawals'}
            </button>
          </div>
        </div>
      )}

      {/* AUDIT LOGS OVERVIEW */}
      <div className="bg-slate-950/35 border border-slate-900/80 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            {language === 'id' ? 'ALUR AKTIVITAS TRANSAKSI TERBARU' : 'RECENT SYSTEM TRANSACTION FEED'}
          </h3>
          <span className="text-[9px] bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-slate-400 font-mono font-bold uppercase tracking-wider">
            REAL-TIME AUDIT
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-900">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-900 text-slate-500 font-black tracking-wider text-[10px] uppercase">
                <th className="py-3 px-4">{language === 'id' ? 'Anggota' : 'User'}</th>
                <th className="py-3 px-4">{language === 'id' ? 'Tipe' : 'Type'}</th>
                <th className="py-3 px-4">{language === 'id' ? 'Jumlah' : 'Amount'}</th>
                <th className="py-3 px-4">{language === 'id' ? 'Keterangan' : 'Description'}</th>
                <th className="py-3 px-4">{language === 'id' ? 'Tanggal' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {stats.allTransactions.slice(0, 8).map(({ tx, username }) => (
                <tr key={tx.id} className="hover:bg-white/5 transition duration-150">
                  <td className="py-3 px-4 font-black text-slate-200">{username}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                      tx.type === 'withdraw' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' :
                      'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-slate-100">
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-medium truncate max-w-[220px]">
                    {tx.description}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-bold font-mono text-[10.5px]">
                    {new Date(tx.date).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {stats.allTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    {language === 'id' ? 'Belum ada riwayat transaksi.' : 'No transactions recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
