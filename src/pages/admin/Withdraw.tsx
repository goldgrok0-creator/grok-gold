import React, { useMemo, useState, useEffect } from 'react';
import { Check, X, Search, Copy, CheckCircle2, Trash2, CreditCard, RefreshCw } from 'lucide-react';
import { UserAccount } from '../../types';
import { supabase } from '../../supabase';

interface WithdrawProps {
  accounts: UserAccount[];
  language: 'id' | 'en';
  onApprove: (username: string, txId: string) => Promise<void>;
  onReject: (username: string, txId: string) => Promise<void>;
}

export default function Withdraw({
  accounts,
  language,
  onApprove,
  onReject
}: WithdrawProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Direct state to read directly from database for absolute real-time accuracy and fallback
  const [directWithdrawals, setDirectWithdrawals] = useState<any[]>([]);

  const fetchDirectWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('id, username, amount, bank_info, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) {
        setDirectWithdrawals(data);
      }
    } catch (err) {
      console.error('Error fetching direct withdrawals in admin:', err);
    }
  };

  useEffect(() => {
    fetchDirectWithdrawals();
  }, []);

  // --- COMPUTE & MERGE WITHDRAWALS ---
  const withdrawals = useMemo(() => {
    let propWithdrawals: { tx: any; username: string }[] = [];
    accounts.forEach(acc => {
      if (acc.state?.transactions) {
        acc.state.transactions.forEach((t: any) => {
          if (t.type === 'withdraw') {
            propWithdrawals.push({ tx: t, username: acc.username });
          }
        });
      }
    });

    let directMapped = directWithdrawals.map(w => {
      let desc = '⏳ Penarikan diproses...';
      if (w.status === 'rejected') {
        desc = '❌ Penarikan Ditolak Admin';
      } else if (w.status === 'approved') {
        desc = '✅ Penarikan Sukses (Disetujui Admin)';
      }

      return {
        username: w.username,
        tx: {
          id: w.id,
          type: 'withdraw',
          amount: Number(w.amount) || 0,
          date: Number(w.created_at) || Date.now(),
          description: desc,
          status: w.status,
          bankName: w.bank_name || 'BCA',
          accountNumber: w.account_number || '',
          accountName: w.account_name || ''
        }
      };
    });

    const mergedMap = new Map<string, { tx: any; username: string }>();

    propWithdrawals.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    directMapped.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    let result = Array.from(mergedMap.values());
    result.sort((a, b) => b.tx.date - a.tx.date);

    return result.filter(item => {
      // Filter status
      if (statusFilter !== 'all' && item.tx.status !== statusFilter) return false;

      // Search query
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        item.username.toLowerCase().includes(query) ||
        item.tx.id.toLowerCase().includes(query) ||
        (item.tx.bankName && item.tx.bankName.toLowerCase().includes(query)) ||
        (item.tx.accountNumber && item.tx.accountNumber.toLowerCase().includes(query)) ||
        (item.tx.accountName && item.tx.accountName.toLowerCase().includes(query))
      );
    });
  }, [accounts, directWithdrawals, statusFilter, searchQuery]);

  const handleApproveWithRefresh = async (username: string, txId: string) => {
    try {
      await onApprove(username, txId);
      fetchDirectWithdrawals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectWithRefresh = async (username: string, txId: string) => {
    try {
      await onReject(username, txId);
      fetchDirectWithdrawals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyPayoutDetails = (txId: string, bankName: string, accNum: string, accName: string) => {
    const textToCopy = `${bankName} - ${accNum} a.n ${accName}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleDeleteWithdrawal = async (txId: string) => {
    if (window.confirm(language === 'id' ? `Hapus catatan penarikan ${txId}?` : `Delete withdrawal record ${txId}?`)) {
      try {
        await supabase.from('withdrawals').delete().eq('id', txId);
        fetchDirectWithdrawals();
      } catch (err) {
        console.error('Delete withdrawal error:', err);
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
          {language === 'id' ? 'MANAJEMEN PENARIKAN SALDO MEMBER' : 'WITHDRAWAL PAYOUT MANAGEMENT'}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {language === 'id' 
            ? 'Periksa rekening tujuan transfer member, salin nomor rekening instan, lalu setujui penarikan.' 
            : 'Review payout banking details, copy destination accounts, and approve withdrawals.'}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'id' ? 'Cari username, TXID, nama bank, no rekening, nama pemilik...' : 'Search username, TXID, bank, account number...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-rose-500 text-slate-200"
          />
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 gap-1 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition uppercase cursor-pointer ${
              statusFilter === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'id' ? 'Semua' : 'All'}
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition uppercase cursor-pointer ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition uppercase cursor-pointer ${
              statusFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disetujui
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition uppercase cursor-pointer ${
              statusFilter === 'rejected' ? 'bg-rose-950 text-rose-300 border border-rose-800/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ditolak
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">{language === 'id' ? 'Member' : 'User'}</th>
              <th className="py-3 px-4">TXID</th>
              <th className="py-3 px-4">{language === 'id' ? 'Jumlah Penarikan' : 'Amount'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Rekening Tujuan Transfer' : 'Payout Banking Details'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Tanggal' : 'Date'}</th>
              <th className="py-3 px-4 text-right">{language === 'id' ? 'Status & Aksi' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 font-medium">
            {withdrawals.map(({ tx, username }) => {
              const isPending = tx.status === 'pending' || tx.description.toLowerCase().includes('proses') || tx.description.toLowerCase().includes('pending');
              const bankName = tx.bankName || 'BCA';
              const accNum = tx.accountNumber || '-';
              const accName = tx.accountName || username;

              return (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-slate-200">{username}</td>
                  <td className="py-3 px-4 font-mono text-purple-400 font-bold">{tx.id}</td>
                  <td className="py-3 px-4 font-mono font-black text-rose-400 text-sm">
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1 max-w-xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-black text-purple-300 uppercase">{bankName}</span>
                        <button
                          onClick={() => handleCopyPayoutDetails(tx.id, bankName, accNum, accName)}
                          className="text-[9px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                        >
                          {copiedTxId === tx.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Rekening</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-slate-200 font-bold text-xs">{accNum}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">a.n {accName}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(tx.date).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isPending ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleApproveWithRefresh(username, tx.id)}
                          className="px-2.5 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-800 rounded-lg border border-emerald-500/30 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                          title="Setujui & Transfer Selesai"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleRejectWithRefresh(username, tx.id)}
                          className="px-2.5 py-1 bg-rose-950 text-rose-400 hover:bg-rose-900 rounded-lg border border-rose-500/30 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                          title="Tolak & Refund Dana"
                        >
                          <X className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          tx.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </span>
                        <button
                          onClick={() => handleDeleteWithdrawal(tx.id)}
                          className="p-1 text-slate-600 hover:text-rose-400 transition cursor-pointer"
                          title="Hapus Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                  {language === 'id' ? 'Tidak ada transaksi penarikan ditemukan.' : 'No withdrawal records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
