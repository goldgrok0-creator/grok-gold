import React, { useMemo, useState, useEffect } from 'react';
import { Eye, Check, X, Search, PlusCircle, Trash2, Edit, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { UserAccount, isMemberAccount } from '../../types';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Rejection Dialog state
  const [rejectingTx, setRejectingTx] = useState<{ username: string; txId: string } | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Manual Deposit Creation State
  const [showManualDepositModal, setShowManualDepositModal] = useState(false);
  const [manualUsername, setManualUsername] = useState('');
  const [manualAmount, setManualAmount] = useState('100000');
  const [manualPaymentMethod, setManualPaymentMethod] = useState('BCA Transfer');
  const [manualStatus, setManualStatus] = useState<'approved' | 'pending'>('approved');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Direct state from database for absolute accuracy & real-time updates
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

    const channelName = `direct-deposits-admin-refresh_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, () => {
        fetchDirectDeposits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- COMPUTE & MERGE DEPOSITS ---
  const deposits = useMemo(() => {
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
          console.error('Error parsing payment_method JSON:', e);
        }
      }

      let desc = '⏳ Deposit (Pending)';
      if (d.status === 'rejected') {
        desc = rejectionReason 
          ? `❌ Deposit Ditolak: ${rejectionReason}`
          : '❌ Deposit Ditolak Admin';
      } else if (d.status === 'approved') {
        desc = '✅ Deposit (Selesai)';
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

    const mergedMap = new Map<string, { tx: any; username: string }>();
    
    propTransactions.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    directMapped.forEach(item => {
      mergedMap.set(item.tx.id, item);
    });

    let result = Array.from(mergedMap.values());
    result.sort((a, b) => b.tx.date - a.tx.date);

    // Apply Filter & Search
    return result.filter(item => {
      // Status filter
      if (statusFilter !== 'all' && item.tx.status !== statusFilter) return false;

      // Search query
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        item.username.toLowerCase().includes(query) ||
        item.tx.id.toLowerCase().includes(query) ||
        (item.tx.paymentMethod && item.tx.paymentMethod.toLowerCase().includes(query)) ||
        (item.tx.description && item.tx.description.toLowerCase().includes(query))
      );
    });
  }, [accounts, directDeposits, statusFilter, searchQuery]);

  // Reject confirmation
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
      fetchDirectDeposits();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleApproveWithRefresh = async (username: string, txId: string) => {
    try {
      await onApprove(username, txId);
      fetchDirectDeposits();
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Manual Deposit Injection
  const handleCreateManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUsername.trim()) {
      alert(language === 'id' ? 'Silakan pilih / isi username member!' : 'Please specify member username!');
      return;
    }

    const amt = parseFloat(manualAmount) || 0;
    if (amt <= 0) {
      alert(language === 'id' ? 'Nominal deposit tidak valid!' : 'Invalid deposit amount!');
      return;
    }

    setIsSubmittingManual(true);
    const newTxId = 'DEP-MAN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const userToCredit = manualUsername.trim().toLowerCase();

    try {
      // 1. Save deposit record in Supabase
      const depositPayload = {
        id: newTxId,
        username: userToCredit,
        amount: amt,
        status: manualStatus,
        payment_method: JSON.stringify({ method: manualPaymentMethod, approved_by: 'admin_manual' }),
        proof_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', // system generated proof
        created_at: Date.now()
      };
      await supabase.from('deposits').insert(depositPayload);

      // 2. If status is approved, update user's main balance directly
      if (manualStatus === 'approved') {
        const { data: userData } = await supabase.from('users').select('main_balance').eq('username', userToCredit).single();
        const currentBal = Number(userData?.main_balance) || 0;
        await supabase.from('users').update({ main_balance: currentBal + amt }).eq('username', userToCredit);
      }

      setShowManualDepositModal(false);
      setManualUsername('');
      setManualAmount('100000');
      fetchDirectDeposits();
      alert(language === 'id' ? `✅ Deposit manual sebesar Rp ${amt.toLocaleString('id-ID')} untuk ${userToCredit} berhasil diinput!` : `✅ Manual deposit created successfully!`);
    } catch (err) {
      console.error('Failed to create manual deposit:', err);
      alert('Failed to insert manual deposit record.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Delete Deposit Record
  const handleDeleteDeposit = async (txId: string) => {
    if (window.confirm(language === 'id' ? `Hapus catatan deposit ${txId}?` : `Delete deposit record ${txId}?`)) {
      try {
        await supabase.from('deposits').delete().eq('id', txId);
        fetchDirectDeposits();
      } catch (err) {
        console.error('Delete deposit error:', err);
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Header & Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div>
          <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
            {language === 'id' ? 'MANAJEMEN DEPOSIT & SETORAN DANA' : 'DEPOSIT REQUESTS & INFLOW'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'id' ? 'Otorisasi setoran member, verifikasi bukti transfer, & catat deposit manual.' : 'Approve user deposits, verify payment proofs, and record manual entries.'}
          </p>
        </div>

        <button
          onClick={() => setShowManualDepositModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition uppercase cursor-pointer shadow-lg shadow-emerald-950/40 shrink-0 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'id' ? 'Input Deposit Manual' : 'Inject Manual Deposit'}</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'id' ? 'Cari berdasarkan username, TXID, metode pembayaran...' : 'Search username, TXID, method...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-rose-500 text-slate-200"
          />
        </div>

        {/* Status Tabs */}
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

      {/* Deposits Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">{language === 'id' ? 'Member' : 'User'}</th>
              <th className="py-3 px-4">TXID</th>
              <th className="py-3 px-4">{language === 'id' ? 'Nominal Deposit' : 'Amount'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Metode / Status' : 'Method / Status'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Bukti Transfer' : 'Proof'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Tanggal' : 'Date'}</th>
              <th className="py-3 px-4 text-right">{language === 'id' ? 'Keputusan Admin' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 font-medium">
            {deposits.map(({ tx, username }) => {
              const isPending = tx.status === 'pending';
              return (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-slate-200">{username}</td>
                  <td className="py-3 px-4 font-mono text-purple-400 font-bold">{tx.id}</td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">{tx.paymentMethod || 'BANK TRANSFER'}</div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                      tx.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      tx.status === 'rejected' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
                    }`}>
                      {tx.description}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {tx.proofImage ? (
                      <button
                        onClick={() => setViewingProofUrl(tx.proofImage || null)}
                        className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-[9px] text-purple-300 font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        LIHAT BUKTI
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">-</span>
                    )}
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
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui
                        </button>
                        <button
                          onClick={() => setRejectingTx({ username, txId: tx.id })}
                          className="px-2.5 py-1 bg-rose-950 text-rose-400 hover:bg-rose-900 rounded-lg border border-rose-500/30 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end items-center gap-2">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">
                          {tx.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </span>
                        <button
                          onClick={() => handleDeleteDeposit(tx.id)}
                          className="p-1 text-slate-600 hover:text-rose-400 transition cursor-pointer"
                          title="Hapus record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                  {language === 'id' ? 'Tidak ada transaksi deposit ditemukan.' : 'No deposit requests found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* REJECTION REASON DIALOG MODAL */}
      {rejectingTx && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120726] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="text-sm font-black uppercase text-rose-400 tracking-wider">
                Alasan Penolakan Deposit
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
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Bukti transfer buram, nama pengirim tidak sesuai, atau nominal salah."
                className="w-full bg-black/40 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/40 min-h-[100px] resize-none font-medium leading-relaxed"
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
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-black text-slate-300 uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmittingReject || !reason.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 rounded-xl text-xs font-black text-white uppercase cursor-pointer disabled:opacity-40"
              >
                {isSubmittingReject ? 'Memproses...' : 'Tolak Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL DEPOSIT MODAL */}
      {showManualDepositModal && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120726] border border-purple-900/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black uppercase text-slate-200 tracking-wider">
                  INPUT DEPOSIT MANUAL
                </h4>
              </div>
              <button
                onClick={() => setShowManualDepositModal(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualDeposit} className="space-y-3 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Member Target <span className="text-rose-500">*</span></label>
                <select
                  required
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Pilih Member --</option>
                  {accounts
                    .filter(isMemberAccount)
                    .map(acc => (
                      <option key={acc.username} value={acc.username}>
                        {acc.username} ({acc.fullName})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nominal Deposit (IDR) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  required
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-bold font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Metode Setoran</label>
                <input
                  type="text"
                  value={manualPaymentMethod}
                  onChange={(e) => setManualPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status Langsung</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-bold"
                >
                  <option value="approved">Disetujui Langsung (Kredit Saldo)</option>
                  <option value="pending">Pending (Perlu Konfirmasi Nanti)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowManualDepositModal(false)}
                  disabled={isSubmittingManual}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingManual ? 'Menyimpan...' : 'Simpan Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
