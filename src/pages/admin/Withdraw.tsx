import React, { useMemo, useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
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
  // Direct state to read directly from database for absolute real-time accuracy and fallback
  const [directWithdrawals, setDirectWithdrawals] = useState<any[]>([]);

  const fetchDirectWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*');
      if (!error && data) {
        setDirectWithdrawals(data);
      }
    } catch (err) {
      console.error('Error fetching direct withdrawals in admin:', err);
    }
  };

  useEffect(() => {
    fetchDirectWithdrawals();

    const channel = supabase
      .channel('direct-withdrawals-admin-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => {
        fetchDirectWithdrawals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- COMPUTE WITHDRAWALS ---
  const withdrawals = useMemo(() => {
    // 1. Gather all from accounts prop
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

    // 2. Map direct database rows
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
          status: w.status
        }
      };
    });

    // 3. Merge sources to prevent duplicates and prioritize direct/realtime db data
    const mergedMap = new Map<string, { tx: any; username: string }>();

    propWithdrawals.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    directMapped.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    const result = Array.from(mergedMap.values());
    result.sort((a, b) => b.tx.date - a.tx.date);
    return result;
  }, [accounts, directWithdrawals]);

  const handleApproveWithRefresh = async (username: string, txId: string) => {
    try {
      await onApprove(username, txId);
      fetchDirectWithdrawals(); // refresh local list
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectWithRefresh = async (username: string, txId: string) => {
    try {
      await onReject(username, txId);
      fetchDirectWithdrawals(); // refresh local list
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase mb-2">
        {language === 'id' ? 'MANAJEMEN PENARIKAN' : 'WITHDRAWAL REQUESTS'}
      </h3>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">{language === 'id' ? 'Anggota' : 'User'}</th>
              <th className="py-3 px-4">TXID</th>
              <th className="py-3 px-4">{language === 'id' ? 'Jumlah' : 'Amount'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Detail / Status' : 'Details / Status'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Tanggal' : 'Date'}</th>
              <th className="py-3 px-4 text-right">{language === 'id' ? 'Verifikasi' : 'Verification'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {withdrawals.map(({ tx, username }) => {
              const isPending = tx.status === 'pending' || tx.description.toLowerCase().includes('proses') || tx.description.toLowerCase().includes('pending');
              return (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-slate-200">{username}</td>
                  <td className="py-3 px-4 font-mono text-purple-400">{tx.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">Rp {tx.amount.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      tx.status === 'approved' || tx.description.includes('Sukses') || tx.description.includes('Disetujui') ? 'bg-emerald-500/15 text-emerald-400' :
                      tx.status === 'rejected' || tx.description.includes('Ditolak') || tx.description.includes('Rejected') ? 'bg-rose-500/15 text-rose-400' :
                      'bg-amber-500/15 text-amber-400 animate-pulse'
                    }`}>
                      {tx.description}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{new Date(tx.date).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-3 px-4 text-right">
                    {isPending ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleApproveWithRefresh(username, tx.id)}
                          className="p-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 rounded border border-emerald-500/20 transition cursor-pointer"
                          title="Approve & Send"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRejectWithRefresh(username, tx.id)}
                          className="p-1 bg-rose-950 text-rose-400 hover:bg-rose-900 rounded border border-rose-500/20 transition cursor-pointer"
                          title="Reject & Refund"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px] uppercase font-bold">{language === 'id' ? 'Selesai' : 'Processed'}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  {language === 'id' ? 'Tidak ada transaksi penarikan.' : 'No withdrawals found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

