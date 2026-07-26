import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, X, Save, UserPlus, Shield, Eye, Lock, Check, AlertTriangle, RefreshCw, Key } from 'lucide-react';
import { UserAccount, isMemberAccount } from '../../types';
import { supabase } from '../../supabase';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'has_contracts'>('all');
  
  // Modals state
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserAccount | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Edit Form Fields
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editReferralCode, setEditReferralCode] = useState('');
  const [editInvitedBy, setEditInvitedBy] = useState('');
  const [editMainBalance, setEditMainBalance] = useState('');
  const [editRewardBalance, setEditRewardBalance] = useState('');
  const [editFreeSpinBalance, setEditFreeSpinBalance] = useState('');
  const [editBonusSpinBalance, setEditBonusSpinBalance] = useState('');
  const [editActiveContracts, setEditActiveContracts] = useState('');
  const [editPendingReward, setEditPendingReward] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editIsSuspended, setEditIsSuspended] = useState(false);

  // Add User Form Fields
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newSponsor, setNewSponsor] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('0');
  const [newInitialContracts, setNewInitialContracts] = useState('0');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // --- FILTERED USERS ---
  const filteredUsers = useMemo(() => {
    return accounts
      .filter(isMemberAccount)
      .filter(acc => {
        // Status Filter
        if (statusFilter === 'active' && acc.settings?.isSuspended) return false;
        if (statusFilter === 'suspended' && !acc.settings?.isSuspended) return false;
        if (statusFilter === 'has_contracts' && (acc.state?.activeContracts || 0) < 1) return false;

        // Search Query
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          acc.username.toLowerCase().includes(query) ||
          acc.fullName.toLowerCase().includes(query) ||
          acc.email.toLowerCase().includes(query) ||
          (acc.phone && acc.phone.toLowerCase().includes(query)) ||
          (acc.referralCode && acc.referralCode.toLowerCase().includes(query)) ||
          (acc.invitedBy && acc.invitedBy.toLowerCase().includes(query))
        );
      });
  }, [accounts, searchQuery, statusFilter]);

  // Open Edit Modal & Populate Form
  const handleStartEdit = (user: UserAccount) => {
    setEditingUsername(user.username);
    setEditFullName(user.fullName || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditPassword(''); // empty unless changing
    setEditReferralCode(user.referralCode || '');
    setEditInvitedBy(user.invitedBy || '');
    setEditMainBalance((user.state?.mainBalance || 0).toString());
    setEditRewardBalance((user.state?.rewardBalance || 0).toString());
    setEditFreeSpinBalance((user.settings?.freeSpinBalance ?? user.state?.freeSpinBalance ?? 1000000).toString());
    setEditBonusSpinBalance((user.settings?.bonusSpinBalance ?? user.state?.bonusSpinBalance ?? 0).toString());
    setEditActiveContracts((user.state?.activeContracts || 0).toString());
    setEditPendingReward((user.state?.pendingMiningReward || 0).toString());
    setEditRole(user.role === 'admin' ? 'admin' : 'user');
    setEditIsSuspended(!!user.settings?.isSuspended);
  };

  // Save Complete Edit Updates
  const handleSaveUserEdit = async () => {
    if (!editingUsername) return;

    const user = accounts.find(acc => acc.username === editingUsername);
    if (!user) return;

    const mainBalNum = parseFloat(editMainBalance) || 0;
    const rewardBalNum = parseFloat(editRewardBalance) || 0;
    const freeSpinNum = parseFloat(editFreeSpinBalance) || 0;
    const bonusSpinNum = parseFloat(editBonusSpinBalance) || 0;
    const contractsNum = parseInt(editActiveContracts) || 0;
    const pendingRewardNum = parseFloat(editPendingReward) || 0;

    const updatedAccount: UserAccount = {
      ...user,
      fullName: editFullName.trim() || user.fullName,
      email: editEmail.trim() || user.email,
      phone: editPhone.trim() || user.phone,
      password: editPassword.trim() !== '' ? editPassword.trim() : user.password,
      referralCode: editReferralCode.trim() || user.referralCode,
      invitedBy: editInvitedBy.trim() || user.invitedBy,
      role: editRole,
      settings: {
        language: user.settings?.language || 'id',
        notificationsEnabled: user.settings?.notificationsEnabled ?? true,
        autoReinvest: user.settings?.autoReinvest ?? false,
        ...(user.settings || {}),
        freeSpinBalance: freeSpinNum,
        bonusSpinBalance: bonusSpinNum,
        rewardSpinWallet: bonusSpinNum,
        isSuspended: editIsSuspended
      },
      state: {
        ...user.state,
        mainBalance: mainBalNum,
        rewardBalance: rewardBalNum,
        freeSpinBalance: freeSpinNum,
        bonusSpinBalance: bonusSpinNum,
        activeContracts: contractsNum,
        pendingMiningReward: pendingRewardNum,
        hasPurchased: contractsNum > 0
      }
    };

    // 1. Save to Supabase (User table)
    const success = await saveAccountToSupabase(updatedAccount);

    // Also explicitly force direct DB update
    try {
      const dbPayload: any = {
        full_name: updatedAccount.fullName,
        email: updatedAccount.email,
        phone: updatedAccount.phone,
        referral_code: updatedAccount.referralCode,
        invited_by: updatedAccount.invitedBy,
        main_balance: mainBalNum,
        reward_balance: rewardBalNum,
        free_spin_balance: freeSpinNum,
        bonus_spin_balance: bonusSpinNum,
        active_contracts: contractsNum,
        pending_mining_reward: pendingRewardNum,
        settings: updatedAccount.settings
      };
      if (editPassword.trim() !== '') {
        dbPayload.password = editPassword.trim();
      }
      await supabase.from('users').update(dbPayload).eq('username', editingUsername);
    } catch (err) {
      console.error('Direct Supabase update error:', err);
    }

    // 2. Update local state
    setAccounts(prev => prev.map(acc => acc.username === editingUsername ? updatedAccount : acc));
    setEditingUsername(null);
    triggerModal(
      language === 'id' 
        ? `✅ Account ${editingUsername} updated successfully!` 
        : `✅ Account ${editingUsername} updated successfully!`, 
      'success'
    );
  };

  // Create New Member Account
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      triggerModal(language === 'id' ? 'Silakan lengkapi data wajib (Username, Nama, Email, Password).' : 'Please complete required fields.', 'warning');
      return;
    }

    const cleanUsername = newUsername.trim().toLowerCase();
    
    // Check duplicate
    if (accounts.some(acc => acc.username.toLowerCase() === cleanUsername)) {
      triggerModal(language === 'id' ? 'Username sudah digunakan oleh member lain.' : 'Username already exists.', 'danger');
      return;
    }

    setIsAddingUser(true);

    const initialBal = parseFloat(newInitialBalance) || 0;
    const initialContracts = parseInt(newInitialContracts) || 0;

    const newAccount: UserAccount = {
      username: cleanUsername,
      fullName: newFullName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim(),
      password: newPassword.trim(),
      referralCode: cleanUsername,
      invitedBy: newSponsor.trim() || null,
      createdAt: Date.now(),
      role: 'user',
      settings: {
        language: 'id',
        notificationsEnabled: true,
        autoReinvest: false,
        freeSpinBalance: 1000000,
        bonusSpinBalance: 0,
        rewardSpinWallet: 0,
        isSuspended: false
      },
      state: {
        mainBalance: initialBal,
        rewardBalance: 0,
        freeSpinBalance: 1000000,
        bonusSpinBalance: 0,
        activeContracts: initialContracts,
        totalEarned: 0,
        referralEarned: 0,
        rebateEarned: 0,
        lastClaimTime: 0,
        welcomeBonusClaimed: false,
        isLoggedIn: false,
        username: cleanUsername,
        holders: [],
        goldProduction: 0,
        cyclePercent: 0,
        hasPurchased: initialContracts > 0,
        profileImage: null,
        transactions: initialBal > 0 ? [{
          id: 'DEP-INIT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          type: 'deposit',
          amount: initialBal,
          date: Date.now(),
          description: '✅ Setoran Awal (Registrasi Admin)',
          status: 'approved'
        }] : [],
        pendingMiningReward: 0,
        todayProfit: 0,
        totalProfit: 0
      }
    };

    try {
      // Save to Supabase DB
      const dbPayload = {
        username: newAccount.username,
        full_name: newAccount.fullName,
        email: newAccount.email,
        phone: newAccount.phone,
        password: newAccount.password,
        referral_code: newAccount.referralCode,
        invited_by: newAccount.invitedBy,
        created_at: newAccount.createdAt,
        main_balance: initialBal,
        active_contracts: initialContracts,
        total_earned: 0,
        settings: newAccount.settings
      };
      await supabase.from('users').insert(dbPayload);

      setAccounts(prev => [newAccount, ...prev]);
      setShowAddUserModal(false);

      // Reset form
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewSponsor('');
      setNewInitialBalance('0');
      setNewInitialContracts('0');

      triggerModal(
        language === 'id'
          ? `✅ Member baru ${cleanUsername} berhasil dibuat!`
          : `✅ New member ${cleanUsername} created successfully!`,
        'success'
      );
    } catch (err) {
      console.error('Failed to create new user in Supabase:', err);
      triggerModal(language === 'id' ? '❌ Gagal mendaftarkan user ke database.' : '❌ Database insertion failed.', 'danger');
    } finally {
      setIsAddingUser(false);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (username: string) => {
    if (window.confirm(language === 'id' ? `Apakah Anda yakin ingin menghapus member ${username}? Data tidak dapat dikembalikan!` : `Are you sure you want to permanently delete user ${username}?`)) {
      try {
        await supabase.from('users').delete().eq('username', username);
        setAccounts(prev => prev.filter(acc => acc.username !== username));
        triggerModal(
          language === 'id' 
            ? `🗑️ Member ${username} berhasil dihapus dari sistem!` 
            : `🗑️ User ${username} deleted from system!`, 
          'success'
        );
      } catch (err) {
        console.error('Failed to delete user in Supabase:', err);
        triggerModal(language === 'id' ? '❌ Gagal menghapus user dari database.' : '❌ Failed to delete user from database.', 'danger');
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search, Filter, and Add User Header Bar */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="flex flex-1 flex-col md:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'id' ? 'Cari username, nama, email, WA, sponsor...' : 'Search username, name, email, sponsor...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-rose-500 transition text-slate-200"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
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
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition uppercase cursor-pointer ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'id' ? 'Aktif' : 'Active'}
            </button>
            <button
              onClick={() => setStatusFilter('has_contracts')}
              className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition uppercase cursor-pointer ${
                statusFilter === 'has_contracts' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'id' ? 'Ada Hashrate' : 'Mining'}
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition uppercase cursor-pointer ${
                statusFilter === 'suspended' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'id' ? 'Diblokir' : 'Suspended'}
            </button>
          </div>
        </div>

        {/* Right Action: Add Member Button */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0 font-mono">
            Total: <span className="font-bold text-rose-400">{filteredUsers.length}</span> {language === 'id' ? 'member' : 'users'}
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-black rounded-xl transition uppercase cursor-pointer shadow-lg shadow-rose-950/40"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'id' ? 'Tambah Member Baru' : 'Add New Member'}</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">{language === 'id' ? 'Informasi Member' : 'Member Details'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Hashrate' : 'Contracts'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Saldo Utama' : 'Main Balance'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Saldo Reward' : 'Reward Balance'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Status' : 'Status'}</th>
              <th className="py-3 px-4">{language === 'id' ? 'Sponsor' : 'Sponsor'}</th>
              <th className="py-3 px-4 text-right">{language === 'id' ? 'Kelola' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 font-medium">
            {filteredUsers.map(user => {
              const isSuspended = !!user.settings?.isSuspended;
              return (
                <tr key={user.username} className={`hover:bg-white/5 transition ${isSuspended ? 'bg-amber-950/10' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-900 to-rose-900 border border-purple-500/30 flex items-center justify-center font-bold text-white text-xs shrink-0 uppercase">
                        {user.username.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100">{user.username}</span>
                          {user.role === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[8px] font-black uppercase rounded">
                              ADMIN
                            </span>
                          )}
                          {user.referralCode && (
                            <span className="px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9px] font-mono font-bold rounded">
                              {user.referralCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {user.fullName} • {user.email} {user.phone ? `• ${user.phone}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-purple-400">
                    <span className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/20 rounded-md">
                      {user.state?.activeContracts || 0} Unit
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    Rp {(user.state?.mainBalance || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    Rp {(user.state?.rewardBalance || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    {isSuspended ? (
                      <span className="px-2 py-0.5 bg-rose-950/60 border border-rose-500/30 text-rose-400 text-[9px] font-black uppercase rounded-full flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        SUSPENDED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase rounded-full flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3" />
                        AKTIF
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">
                    {user.invitedBy || 'DIRECT'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                        title={language === 'id' ? 'Detail Profile Member' : 'View Profile Details'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="p-1.5 bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition cursor-pointer"
                        title={language === 'id' ? 'Edit Lengkap Account Member' : 'Edit Full User Details'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className="p-1.5 bg-rose-950/50 hover:bg-rose-950 text-rose-400 hover:text-rose-200 border border-rose-900/30 rounded-lg transition cursor-pointer"
                        title={language === 'id' ? 'Hapus Member Permamen' : 'Delete Member'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                  {language === 'id' ? 'Tidak ada member ditemukan berdasarkan kriteria pencarian.' : 'No members match search criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: COMPREHENSIVE EDIT USER MODAL */}
      {editingUsername && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f081e] border border-purple-900/40 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-purple-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
                  EDIT DATA MEMBER: <span className="text-purple-400 font-mono">{editingUsername}</span>
                </h3>
              </div>
              <button 
                onClick={() => setEditingUsername(null)} 
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* SECTION A: PROFILE DATA */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-wider mb-2">
                  1. INFORMASI PROFIL & AKSES
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                    <span>Reset Password</span>
                    <span className="text-[9px] text-slate-500 font-normal">(Kosongkan jika tidak diubah)</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Password baru..."
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Kode Referral
                    </label>
                    <input
                      type="text"
                      value={editReferralCode}
                      onChange={(e) => setEditReferralCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-purple-300 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Sponsor / Inviter
                    </label>
                    <input
                      type="text"
                      value={editInvitedBy}
                      onChange={(e) => setEditInvitedBy(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: FINANCES & HASHRATE */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-wider mb-2">
                  2. SALDO KAS & HASHRATE MINING
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Saldo Utama (IDR)
                    </label>
                    <input
                      type="number"
                      value={editMainBalance}
                      onChange={(e) => setEditMainBalance(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Saldo Reward (IDR)
                    </label>
                    <input
                      type="number"
                      value={editRewardBalance}
                      onChange={(e) => setEditRewardBalance(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold text-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Saldo Free Spin
                    </label>
                    <input
                      type="number"
                      value={editFreeSpinBalance}
                      onChange={(e) => setEditFreeSpinBalance(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-purple-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Saldo Bonus Spin
                    </label>
                    <input
                      type="number"
                      value={editBonusSpinBalance}
                      onChange={(e) => setEditBonusSpinBalance(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-pink-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Kontrak Mining (Unit)
                    </label>
                    <input
                      type="number"
                      value={editActiveContracts}
                      onChange={(e) => setEditActiveContracts(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono font-black text-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Pending Reward (IDR)
                    </label>
                    <input
                      type="number"
                      value={editPendingReward}
                      onChange={(e) => setEditPendingReward(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Role System</span>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-rose-400 font-bold focus:outline-none"
                    >
                      <option value="user">User Standard</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Status Akses Akun</span>
                    <button
                      type="button"
                      onClick={() => setEditIsSuspended(!editIsSuspended)}
                      className={`px-3 py-1 text-xs font-black rounded-lg uppercase cursor-pointer transition ${
                        editIsSuspended ? 'bg-amber-600 text-white' : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {editIsSuspended ? 'SUSPENDED (DIBLOKIR)' : 'AKTIF NORMAL'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingUsername(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUserEdit}
                className="px-5 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/40"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW MEMBER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f081e] border border-purple-900/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-purple-900/30 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
                  TAMBAH MEMBER BARU
                </h3>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)} 
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: miner88"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai KTP/rekening..."
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Password login..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sponsor / Reffered By</label>
                  <input
                    type="text"
                    placeholder="Username sponsor..."
                    value={newSponsor}
                    onChange={(e) => setNewSponsor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Saldo Awal (IDR)</label>
                  <input
                    type="number"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kontrak Awal (Unit)</label>
                  <input
                    type="number"
                    value={newInitialContracts}
                    onChange={(e) => setNewInitialContracts(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-purple-400 font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  disabled={isAddingUser}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAddingUser ? (
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Daftarkan Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW MEMBER PROFILE DETAILS */}
      {viewingUser && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f081e] border border-purple-900/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-purple-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase">
                  DETAIL PROFIL MEMBER: <span className="text-rose-400 font-mono">{viewingUser.username}</span>
                </h3>
              </div>
              <button 
                onClick={() => setViewingUser(null)} 
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-left text-xs">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Nama Lengkap:</span> <span className="font-bold text-white">{viewingUser.fullName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-bold text-slate-300">{viewingUser.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">WhatsApp / Phone:</span> <span className="font-mono text-slate-300">{viewingUser.phone || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Kode Referral:</span> <span className="font-mono font-bold text-purple-300">{viewingUser.referralCode || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sponsor / Inviter:</span> <span className="font-mono text-purple-400">{viewingUser.invitedBy || 'DIRECT'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tanggal Gabung:</span> <span className="font-mono text-slate-400">{new Date(viewingUser.createdAt || Date.now()).toLocaleString('id-ID')}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Saldo Utama</div>
                  <div className="text-sm font-black font-mono text-emerald-400">Rp {(viewingUser.state?.mainBalance || 0).toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Saldo Reward</div>
                  <div className="text-sm font-black font-mono text-amber-400">Rp {(viewingUser.state?.rewardBalance || 0).toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Kontrak Aktif</div>
                  <div className="text-sm font-black font-mono text-purple-400">{viewingUser.state?.activeContracts || 0} Unit</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Total Earned</div>
                  <div className="text-sm font-black font-mono text-slate-200">Rp {(viewingUser.state?.totalEarned || 0).toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    const userToEdit = viewingUser;
                    setViewingUser(null);
                    handleStartEdit(userToEdit);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Edit Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
