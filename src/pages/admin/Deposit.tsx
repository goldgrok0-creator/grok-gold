import React, { useMemo, useState, useEffect } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { UserAccount } from '../../types';
import { supabase } from '../../supabase';

interface DepositProps {
  accounts: UserAccount[];
  language: 'id' | 'en';
  onApprove: (username: string, txId: string) => Promise<void>;
  onReject: (username: string, txId: string, reason: string) => Promise<void>;
  setViewingProofUrl: (url: string | null) => void;
}

export default function Deposit({
  accounts,
  language,
  onApprove,
  onReject,
  setViewingProofUrl
}: DepositProps) {
  // Rejection Dialog state
  const [rejectingTx, setRejectingTx] = useState<{ username: string; txId: string } | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Direct state to read directly from database for absolute real-time accuracy and fallback
  const [directDeposits, setDirectDeposits] = useState<any[]>([]);

  const fetchDirectDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*');
      if (!error && data) {
        setDirectDeposits(data);
      }
    } catch (err) {
      console.error('Error fetching direct deposits in admin:', err);
    }
  };

  useEffect(() => {
    fetchDirectDeposits();

    const channel = supabase
      .channel('direct-deposits-admin-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, () => {
        fetchDirectDeposits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- COMPUTE DEPOSITS ---
  const deposits = useMemo(() => {
    // 1. Map prop accounts (standard)
    let propTransactions: { tx: any; username: string }[] = [];
    accounts.forEach(acc => {
      if (acc.state?.transactions) {
        acc.state.transactions.forEach((t: any) => {
          if (t.type === 'deposit') {
            propTransactions.push({ tx: t, username: acc.username });
          }
        });
      }
    });

    // 2. Map direct database rows
    let directMapped = directDeposits.map(d => {
      let payMethod = d.payment_method || '';
      let rejectionReason: string | null = null;
      let approvedBy: string | null = null;
      let approvedAt: number | null = null;

      if (payMethod.startsWith('{')) {
        try {
          const parsed = JSON.parse(payMethod);
          payMethod = parsed.method || '';
          rejectionReason = parsed.rejection_reason || null;
          approvedBy = parsed.approved_by || null;
          approvedAt = parsed.approved_at || null;
        } catch (e) {
          console.error('Error parsing payment_method JSON in direct deposits:', e);
        }
      }

      let desc = '⏳ Deposit (Pending)';
      if (d.status === 'rejected') {
        desc = rejectionReason 
          ? `❌ Deposit Ditolak: ${rejectionReason}`
          : '❌ Deposit Ditolak Admin';
      } else if (d.status === 'approved') {
        desc = '✅ Deposit (selesai)';
      }

      return {
        username: d.username,
        tx: {
          id: d.id,
          type: 'deposit',
          amount: Number(d.amount) || 0,
          date: Number(d.created_at) || Date.now(),
          description: desc,
          proofImage: d.proof_image || null,
          status: d.status,
          rejectionReason,
          paymentMethod: payMethod,
          approvedBy,
          approvedAt
        }
      };
    });

    // 3. Merge sources to prevent duplication and ensure direct database inserts show up immediately
    const mergedMap = new Map<string, { tx: any; username: string }>();
    
    propTransactions.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    directMapped.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    const result = Array.from(mergedMap.values());
    result.sort((a, b) => b.tx.date - a.tx.date);
    return result;
  }, [accounts, directDeposits]);

  const handleConfirmReject = async () => {
    if (!rejectingTx) return;
    if (!reason.trim()) {
      alert(language === 'id' ? 'Silakan isi alasan penolakan!' : 'Please specify a rejection reason!');
      return;
    }

    setIsSubmittingReject(true);
    try {
      await onReject(rejectingTx.username, rejectingTx.txId, reason.trim());
      setRejectingTx(null);
      setReason('');
      fetchDirectDeposits(); // refresh local list
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleApproveWithRefresh = async (username: string, txId: string) => {
    try {
      await onApprove(username, txId);
      fetchDirectDeposits(); // refresh local list
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <div className="space-y-4 animate-fade-in relative">
      <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase mb-2">
        {language === 'id' ? 'MANAJEMEN DEPOSIT' : 'DEPOSIT REQUESTS'}
      </h3>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">{language === 'id' ? 'Anggota' : 'User'}</th>
              <th className="py-3 px-4">TXID</th>
              <th className="py-3 px-4">{language === 'id' ? 'Jumlah' : 'Amount'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Status / Deskripsi' : 'Status / Description'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Bukti' : 'Proof'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Tanggal' : 'Date'}</th>
              <th className="py-3 px-4 text-right">{language === 'id' ? 'Persetujuan' : 'Approval'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {deposits.map(({ tx, username }) => {
              const isPending = tx.status === 'pending';
              return (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-slate-200">{username}</td>
                  <td className="py-3 px-4 font-mono text-purple-400">{tx.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">Rp {tx.amount.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      tx.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                      tx.status === 'rejected' ? 'bg-rose-500/15 text-rose-400' :
                      'bg-amber-500/15 text-amber-400 animate-pulse'
                    }`}>
                      {tx.description}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {tx.proofImage ? (
                      <button
                        onClick={() => setViewingProofUrl(tx.proofImage || null)}
                        className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 rounded text-[9px] text-purple-300 font-bold flex items-center gap-1 transition cursor-pointer"
                        title={language === 'id' ? 'Lihat Bukti Transfer' : 'View Transfer Proof'}
                      >
                        <Eye className="w-3 h-3" />
                        {language === 'id' ? 'LIHAT' : 'VIEW'}
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(tx.date).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isPending ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleApproveWithRefresh(username, tx.id)}
                          className="p-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 rounded border border-emerald-500/20 transition cursor-pointer"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRejectingTx({ username, txId: tx.id })}
                          className="p-1 bg-rose-950 text-rose-400 hover:bg-rose-900 rounded border border-rose-500/20 transition cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px] uppercase font-bold">
                        {tx.status === 'approved' ? (language === 'id' ? 'Disetujui' : 'Approved') : (language === 'id' ? 'Ditolak' : 'Rejected')}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  {language === 'id' ? 'Tidak ada transaksi deposit.' : 'No deposits found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* REJECTION REASON DIALOG MODAL */}
      {rejectingTx && (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#120726] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="text-sm font-black uppercase text-rose-400 tracking-wider">
                {language === 'id' ? 'Alasan Penolakan Deposit' : 'Deposit Rejection Reason'}
              </h4>
              <button
                onClick={() => {
                  setRejectingTx(null);
                  setReason('');
                }}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'id' ? 'Masukan alasan penolakan' : 'Enter rejection reason'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Bukti transfer buram atau nominal tidak sesuai.' : 'Example: Blurred receipt or incorrect amount.'}
                className="w-full bg-black/40 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 min-h-[100px] resize-none font-medium leading-relaxed"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectingTx(null);
                  setReason('');
                }}
                disabled={isSubmittingReject}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-black text-slate-300 uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmittingReject || !reason.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 rounded-xl text-xs font-black text-white uppercase tracking-wider transition active:scale-95 disabled:opacity-40"
              >
                {isSubmittingReject ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  language === 'id' ? 'Tolak Deposit' : 'Reject Deposit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
