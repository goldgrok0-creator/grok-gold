import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, X, Save } from 'lucide-react';
import { UserAccount } from '../../types';

interface MembersProps {
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  saveAccountToSupabase: (account: UserAccount) => Promise<boolean>;
}

export default function Members({
  accounts,
  setAccounts,
  language,
  triggerModal,
  saveAccountToSupabase
}: MembersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editContracts, setEditContracts] = useState('');

  // --- FILTERED USERS ---
  const filteredUsers = useMemo(() => {
    return accounts
      .filter(acc => acc.username.toLowerCase() !== 'admin')
      .filter(acc => {
        const query = searchQuery.toLowerCase();
        return (
          acc.username.toLowerCase().includes(query) ||
          acc.fullName.toLowerCase().includes(query) ||
          acc.email.toLowerCase().includes(query) ||
          (acc.phone && acc.phone.toLowerCase().includes(query))
        );
      });
  }, [accounts, searchQuery]);

  // Edit User Balance / Contracts
  const handleEditUser = (username: string) => {
    const user = accounts.find(acc => acc.username === username);
    if (user) {
      setEditingUsername(username);
      setEditBalance((user.state?.mainBalance || 0).toString());
      setEditContracts((user.state?.activeContracts || 0).toString());
    }
  };

  const handleSaveUserEdit = () => {
    if (!editingUsername) return;
    
    const balanceNum = parseInt(editBalance) || 0;
    const contractsNum = parseInt(editContracts) || 0;

    const updatedAccounts = accounts.map(acc => {
      if (acc.username === editingUsername) {
        const updated = {
          ...acc,
          state: {
            ...acc.state,
            mainBalance: balanceNum,
            activeContracts: contractsNum
          }
        };
        saveAccountToSupabase(updated);
        return updated;
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    setEditingUsername(null);
    triggerModal(language === 'id' ? '✅ Data pengguna berhasil diupdate!' : '✅ User data updated successfully!', 'success');
  };

  // Delete User
  const handleDeleteUser = (username: string) => {
    if (window.confirm(language === 'id' ? `Apakah Anda yakin ingin menghapus user ${username}?` : `Are you sure you want to delete user ${username}?`)) {
      const updatedAccounts = accounts.filter(acc => acc.username !== username);
      setAccounts(updatedAccounts);
      triggerModal(language === 'id' ? `🗑️ User ${username} berhasil dihapus dari sistem!` : `🗑️ User ${username} deleted from the system!`, 'success');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search and stats bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'id' ? 'Cari berdasarkan username, nama, email...' : 'Search username, full name, email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-rose-500 transition text-slate-200"
          />
        </div>
        <div className="text-xs text-slate-400 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          {language === 'id' ? 'Menampilkan' : 'Showing'} <span className="font-bold text-rose-400">{filteredUsers.length}</span> {language === 'id' ? 'pengguna' : 'users'}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">{language === 'id' ? 'Anggota' : 'User'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Kontak' : 'Contracts'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Saldo Utama' : 'Main Balance'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Total Profit' : 'Total Profit'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Rujukan' : 'Referred By'}</th>
              <th className="py-3 px-4 text-right">{language === 'id' ? 'Aksi' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {filteredUsers.map(user => (
              <tr key={user.username} className="hover:bg-white/5 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200">{user.username}</span>
                    {user.referralCode && (
                      <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-mono font-bold rounded">
                        {user.referralCode}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{user.fullName} • {user.email}</div>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-purple-400">
                  {user.state?.activeContracts || 0} Unit
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                  Rp {(user.state?.mainBalance || 0).toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">
                  Rp {(user.state?.totalEarned || 0).toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-400">
                  {user.invitedBy || 'Direct'}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => handleEditUser(user.username)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                      title={language === 'id' ? 'Edit Saldo / Kontrak' : 'Edit Balance / Contracts'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.username)}
                      className="p-1.5 bg-rose-950/50 hover:bg-rose-950 text-rose-400 hover:text-rose-200 border border-rose-900/30 rounded-lg transition cursor-pointer"
                      title={language === 'id' ? 'Hapus Anggota' : 'Delete Member'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  {language === 'id' ? 'Tidak ada pengguna ditemukan.' : 'No users match search criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT USER STATE MODAL INLINE-LIKE */}
      {editingUsername && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 max-w-md animate-fade-in mt-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black tracking-widest text-slate-300 uppercase">
              {language === 'id' ? `Edit User: ${editingUsername}` : `Modify User: ${editingUsername}`}
            </h3>
            <button onClick={() => setEditingUsername(null)} className="text-slate-500 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {language === 'id' ? 'Saldo Utama (IDR)' : 'Main Balance (IDR)'}
              </label>
              <input
                type="number"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {language === 'id' ? 'Kontrak Aktif' : 'Active Contracts'}
              </label>
              <input
                type="number"
                value={editContracts}
                onChange={(e) => setEditContracts(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-purple-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setEditingUsername(null)}
              className="px-3 py-1.5 bg-slate-900 text-slate-400 text-xs font-bold rounded-lg hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUserEdit}
              className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-black rounded-lg hover:bg-rose-500 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
