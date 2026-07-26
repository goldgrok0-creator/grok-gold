import React, { useState, useMemo } from 'react';
import { Search, Users, Network as NetworkIcon, Edit3, ArrowRight, Check, Shield } from 'lucide-react';
import { UserAccount, isMemberAccount } from '../../types';
import { supabase } from '../../supabase';

interface NetworkProps {
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  saveAccountToSupabase: (account: UserAccount) => Promise<boolean>;
}

export default function Network({
  accounts,
  setAccounts,
  language,
  triggerModal,
  saveAccountToSupabase
}: NetworkProps) {
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [searchMember, setSearchMember] = useState('');

  // Sponsor Reassignment Form
  const [editingTargetUser, setEditingTargetUser] = useState<string | null>(null);
  const [newSponsorUsername, setNewSponsorUsername] = useState('');
  const [isSubmittingSponsor, setIsSubmittingSponsor] = useState(false);

  // Compute Network Downlines for Selected User
  const networkTree = useMemo(() => {
    if (!selectedUsername) return { gen1: [], gen2: [], gen3: [] };

    const targetUser = accounts.find(a => a.username.toLowerCase() === selectedUsername.toLowerCase());
    if (!targetUser) return { gen1: [], gen2: [], gen3: [] };

    // Gen 1: Directly invited by selectedUsername
    const gen1 = accounts.filter(a => a.invitedBy && a.invitedBy.toLowerCase() === selectedUsername.toLowerCase());
    const gen1Usernames = new Set(gen1.map(a => a.username.toLowerCase()));

    // Gen 2: Invited by any Gen 1 user
    const gen2 = accounts.filter(a => a.invitedBy && gen1Usernames.has(a.invitedBy.toLowerCase()));
    const gen2Usernames = new Set(gen2.map(a => a.username.toLowerCase()));

    // Gen 3: Invited by any Gen 2 user
    const gen3 = accounts.filter(a => a.invitedBy && gen2Usernames.has(a.invitedBy.toLowerCase()));

    return { gen1, gen2, gen3 };
  }, [accounts, selectedUsername]);

  const handleUpdateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetUser) return;

    const user = accounts.find(a => a.username === editingTargetUser);
    if (!user) return;

    const cleanSponsor = newSponsorUsername.trim().toLowerCase();

    // Prevent self-sponsor
    if (cleanSponsor === editingTargetUser.toLowerCase()) {
      triggerModal('Member tidak bisa menjadi sponsor diri sendiri!', 'warning');
      return;
    }

    setIsSubmittingSponsor(true);

    try {
      const updatedAccount: UserAccount = {
        ...user,
        invitedBy: cleanSponsor || null
      };

      await saveAccountToSupabase(updatedAccount);

      // Direct update in Supabase
      await supabase
        .from('users')
        .update({ invited_by: cleanSponsor || null })
        .eq('username', editingTargetUser);

      setAccounts(prev => prev.map(a => a.username === editingTargetUser ? updatedAccount : a));
      setEditingTargetUser(null);
      setNewSponsorUsername('');

      triggerModal(
        language === 'id' 
          ? `✅ Sponsor untuk ${editingTargetUser} berhasil diubah menjadi ${cleanSponsor || 'DIRECT'}!` 
          : `✅ Sponsor updated for ${editingTargetUser}!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      triggerModal('Failed to update sponsor.', 'danger');
    } finally {
      setIsSubmittingSponsor(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
          {language === 'id' ? 'AUDIT JARINGAN REFFERAL & SUNTIK SPONSOR' : 'REFERRAL NETWORK AUDIT & SPONSOR EDITOR'}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {language === 'id' 
            ? 'Inspeksi kedalaman jaringan Downline Gen 1 (10%), Gen 2 (5%), Gen 3 (2%), dan ubah sponsor jika salah daftar.' 
            : 'Audit downline network depth (Gen 1, Gen 2, Gen 3) and edit member sponsor connections.'}
        </p>
      </div>

      {/* Select Member to Inspect */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pilih / Cari Member Utama untuk Audit Jaringan
        </label>
        <div className="flex gap-2">
          <select
            value={selectedUsername}
            onChange={(e) => setSelectedUsername(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="">-- {language === 'id' ? 'Pilih Member untuk Audit' : 'Select Member'} --</option>
            {accounts
              .filter(isMemberAccount)
              .map(acc => (
                <option key={acc.username} value={acc.username}>
                  {acc.username} ({acc.fullName}) - Sponsor: {acc.invitedBy || 'DIRECT'}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* NETWORK TREE RESULTS */}
      {selectedUsername && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gen 1 */}
            <div className="bg-gradient-to-br from-purple-950/40 to-slate-950 p-4 rounded-2xl border border-purple-800/40 space-y-3">
              <div className="flex justify-between items-center border-b border-purple-800/40 pb-2">
                <span className="text-xs font-black uppercase text-purple-300">Generasi 1 (Bonus 10%)</span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 font-mono font-bold text-xs rounded-full">
                  {networkTree.gen1.length} Downline
                </span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {networkTree.gen1.map(u => (
                  <div key={u.username} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{u.username}</div>
                      <div className="text-[10px] text-slate-400">{u.fullName}</div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTargetUser(u.username);
                        setNewSponsorUsername(u.invitedBy || '');
                      }}
                      className="p-1.5 bg-purple-900/50 hover:bg-purple-800 text-purple-200 rounded-lg transition cursor-pointer"
                      title="Ubah Sponsor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {networkTree.gen1.length === 0 && (
                  <div className="text-slate-500 text-xs italic text-center py-4">Belum ada downline Gen 1.</div>
                )}
              </div>
            </div>

            {/* Gen 2 */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 p-4 rounded-2xl border border-indigo-800/40 space-y-3">
              <div className="flex justify-between items-center border-b border-indigo-800/40 pb-2">
                <span className="text-xs font-black uppercase text-indigo-300">Generasi 2 (Bonus 5%)</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs rounded-full">
                  {networkTree.gen2.length} Downline
                </span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {networkTree.gen2.map(u => (
                  <div key={u.username} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{u.username}</div>
                      <div className="text-[10px] text-slate-400">Invited by: {u.invitedBy}</div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTargetUser(u.username);
                        setNewSponsorUsername(u.invitedBy || '');
                      }}
                      className="p-1.5 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 rounded-lg transition cursor-pointer"
                      title="Ubah Sponsor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {networkTree.gen2.length === 0 && (
                  <div className="text-slate-500 text-xs italic text-center py-4">Belum ada downline Gen 2.</div>
                )}
              </div>
            </div>

            {/* Gen 3 */}
            <div className="bg-gradient-to-br from-pink-950/40 to-slate-950 p-4 rounded-2xl border border-pink-800/40 space-y-3">
              <div className="flex justify-between items-center border-b border-pink-800/40 pb-2">
                <span className="text-xs font-black uppercase text-pink-300">Generasi 3 (Bonus 2%)</span>
                <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 font-mono font-bold text-xs rounded-full">
                  {networkTree.gen3.length} Downline
                </span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {networkTree.gen3.map(u => (
                  <div key={u.username} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{u.username}</div>
                      <div className="text-[10px] text-slate-400">Invited by: {u.invitedBy}</div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTargetUser(u.username);
                        setNewSponsorUsername(u.invitedBy || '');
                      }}
                      className="p-1.5 bg-pink-900/50 hover:bg-pink-800 text-pink-200 rounded-lg transition cursor-pointer"
                      title="Ubah Sponsor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {networkTree.gen3.length === 0 && (
                  <div className="text-slate-500 text-xs italic text-center py-4">Belum ada downline Gen 3.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SPONSOR MODAL */}
      {editingTargetUser && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120726] border border-purple-900/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <h4 className="text-sm font-black uppercase text-rose-400 tracking-wider">
              UBAH SPONSOR / INVITER FOR <span className="font-mono text-white">{editingTargetUser}</span>
            </h4>

            <form onSubmit={handleUpdateSponsor} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Username Sponsor Baru
                </label>
                <input
                  type="text"
                  placeholder="Isi username sponsor baru..."
                  value={newSponsorUsername}
                  onChange={(e) => setNewSponsorUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTargetUser(null)}
                  className="flex-1 py-2 bg-slate-900 text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSponsor}
                  className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  {isSubmittingSponsor ? 'Memproses...' : 'Simpan Sponsor Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
