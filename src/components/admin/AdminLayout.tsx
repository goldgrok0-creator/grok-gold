import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Briefcase,
  Wallet as WalletIcon,
  Network as NetworkIcon,
  ShieldAlert,
  LogOut,
  X
} from 'lucide-react';
import { UserAccount, Transaction, AppState } from '../../types';
import { supabase } from '../../supabase';
import {
  approveDepositInSupabase,
  rejectDepositInSupabase,
  approveWithdrawalInSupabase,
  rejectWithdrawalInSupabase
} from '../../supabaseAdmin';
import { getSignedProofUrl } from '../../supabase';

// Lazy loaded page components
const Dashboard = React.lazy(() => import('../../pages/admin/Dashboard'));
const Members = React.lazy(() => import('../../pages/admin/Members'));
const Deposit = React.lazy(() => import('../../pages/admin/Deposit'));
const Withdraw = React.lazy(() => import('../../pages/admin/Withdraw'));
const Settings = React.lazy(() => import('../../pages/admin/Settings'));
const Contracts = React.lazy(() => import('../../pages/admin/Contracts'));
const Network = React.lazy(() => import('../../pages/admin/Network'));

interface AdminLayoutProps {
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  currentAccount: UserAccount | null;
  setCurrentAccount: React.Dispatch<React.SetStateAction<UserAccount | null>>;
  saveAccountToSupabase: (account: UserAccount) => Promise<boolean>;
  language: 'id' | 'en';
  triggerModal: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  updateState: (updater: Partial<AppState> | ((prev: AppState) => AppState), forceSaveImmediately?: boolean) => void;
  onLogout?: () => void;
  globalConfig: any;
  onSaveGlobalConfig: (newConfig: any) => Promise<boolean>;
}

export default function AdminLayout({
  accounts,
  setAccounts,
  currentAccount,
  setCurrentAccount,
  saveAccountToSupabase,
  language,
  triggerModal,
  updateState,
  onLogout,
  globalConfig,
  onSaveGlobalConfig
}: AdminLayoutProps) {
  // Routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Lightbox for deposit proof image
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [signedProofUrl, setSignedProofUrl] = useState<string | null>(null);
  const [isLoadingSignedUrl, setIsLoadingSignedUrl] = useState(false);

  useEffect(() => {
    if (viewingProofUrl) {
      setIsLoadingSignedUrl(true);
      getSignedProofUrl(viewingProofUrl)
        .then((url) => {
          setSignedProofUrl(url);
        })
        .catch((err) => {
          console.error('Failed to get signed URL for deposit proof:', err);
          setSignedProofUrl(viewingProofUrl); // Fallback to raw public URL
        })
        .finally(() => {
          setIsLoadingSignedUrl(false);
        });
    } else {
      setSignedProofUrl(null);
    }
  }, [viewingProofUrl]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  const systemConfig = useMemo(() => {
    const defaultWalletSettings = {
      bankName: 'BCA',
      bankNumber: '0562167917',
      bankHolder: 'REZAL PRATAMA',
      usdtAddress: '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4',
      pricePerUnit: 180000,
      dailyRewardPercent: 4.0,
      cappingPercent: 250,
      minDeposit: 100000,
      minWithdraw: 100000,
      simulationSpeed: 1,
      botsEnabled: true
    };
    return { ...defaultWalletSettings, ...globalConfig };
  }, [globalConfig]);

  // Save updated system config
  const handleSaveSystemConfig = async (newConfig: any) => {
    const success = await onSaveGlobalConfig(newConfig);
    if (success) {
      triggerModal(language === 'id' ? 'Konfigurasi berhasil diperbarui.' : 'Configuration updated successfully.', 'success');
      
      // Update local memory list for real-time consistency
      const adminUser = accounts.find(acc => acc.username.toLowerCase() === 'admin');
      if (adminUser) {
        const updatedAdmin = {
          ...adminUser,
          state: {
            ...adminUser.state,
            systemConfig: newConfig
          }
        };
        setAccounts(prev => prev.map(acc => acc.username.toLowerCase() === 'admin' ? updatedAdmin : acc));
      }
    } else {
      triggerModal(language === 'id' ? '❌ Gagal memperbarui konfigurasi.' : '❌ Failed to update configuration.', 'danger');
    }
  };

  // Approve Pending Deposit
  const handleApproveDeposit = async (username: string, txId: string, amount?: number) => {
    let finalAmount = amount;
    if (finalAmount === undefined) {
      const account = accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase());
      const tx = account?.state.transactions.find((t: any) => t.id === txId);
      if (tx) {
        finalAmount = tx.amount;
      }
    }
    if (finalAmount === undefined) {
      // Direct query fallback if not found in memory
      try {
        const { data: dep } = await supabase.from('deposits').select('amount').eq('id', txId).single();
        if (dep) {
          finalAmount = Number(dep.amount);
        }
      } catch (err) {
        console.error('Error fetching deposit amount fallback:', err);
      }
    }

    if (finalAmount === undefined || isNaN(finalAmount)) {
      triggerModal(language === 'id' ? '❌ Gagal mendapatkan nominal deposit.' : '❌ Failed to resolve deposit amount.', 'danger');
      return;
    }

    const success = await approveDepositInSupabase(txId, username, finalAmount, 'admin');
    if (success) {
      triggerModal(language === 'id' ? '✅ Deposit berhasil disetujui!' : '✅ Deposit approved successfully!', 'success');
      
      // Sync local memory accounts list
      setAccounts(prev => prev.map(acc => {
        if (acc.username.toLowerCase() === username.toLowerCase()) {
          const existingTxs = acc.state?.transactions || [];
          const hasTx = existingTxs.some((t: any) => t.id === txId);
          
          let updatedTxs = existingTxs;
          if (hasTx) {
            updatedTxs = existingTxs.map((t: any) => {
              if (t.id === txId) {
                return {
                  ...t,
                  status: 'approved',
                  description: '✅ Deposit (selesai)'
                };
              }
              return t;
            });
          } else {
            updatedTxs = [
              {
                id: txId,
                type: 'deposit',
                amount: finalAmount!,
                date: Date.now(),
                status: 'approved',
                description: '✅ Deposit (selesai)'
              },
              ...existingTxs
            ];
          }

          return {
            ...acc,
            state: {
              ...acc.state,
              mainBalance: (acc.state?.mainBalance || 0) + finalAmount!,
              transactions: updatedTxs
            }
          };
        }
        return acc;
      }));
    } else {
      triggerModal(language === 'id' ? '❌ Gagal menyetujui deposit.' : '❌ Failed to approve deposit.', 'danger');
    }
  };

  // Reject Pending Deposit
  const handleRejectDeposit = async (username: string, txId: string, rejectionReason: string) => {
    const success = await rejectDepositInSupabase(txId, rejectionReason);
    if (success) {
      triggerModal(language === 'id' ? '❌ Deposit ditolak!' : '❌ Deposit rejected!', 'warning');
      
      setAccounts(prev => prev.map(acc => {
        if (acc.username.toLowerCase() === username.toLowerCase()) {
          const existingTxs = acc.state?.transactions || [];
          const hasTx = existingTxs.some((t: any) => t.id === txId);
          
          let updatedTxs = existingTxs;
          if (hasTx) {
            updatedTxs = existingTxs.map((t: any) => {
              if (t.id === txId) {
                return {
                  ...t,
                  status: 'rejected',
                  rejectionReason: rejectionReason,
                  description: language === 'id' ? `❌ Deposit Ditolak: ${rejectionReason}` : `❌ Deposit Rejected: ${rejectionReason}`
                };
              }
              return t;
            });
          } else {
            updatedTxs = [
              {
                id: txId,
                type: 'deposit',
                amount: 0,
                date: Date.now(),
                status: 'rejected',
                rejectionReason: rejectionReason,
                description: language === 'id' ? `❌ Deposit Ditolak: ${rejectionReason}` : `❌ Deposit Rejected: ${rejectionReason}`
              },
              ...existingTxs
            ];
          }

          return {
            ...acc,
            state: {
              ...acc.state,
              transactions: updatedTxs
            }
          };
        }
        return acc;
      }));
    } else {
      triggerModal(language === 'id' ? '❌ Gagal menolak deposit.' : '❌ Failed to reject deposit.', 'danger');
    }
  };

  // Approve Pending Withdrawal
  const handleApproveWithdrawal = async (username: string, txId: string) => {
    const account = accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase());
    const tx = account?.state.transactions.find((t: any) => t.id === txId);
    if (!tx) return;

    const success = await approveWithdrawalInSupabase(txId, username, tx.amount);
    if (success) {
      triggerModal(language === 'id' ? '✅ Penarikan berhasil disetujui!' : '✅ Withdrawal approved successfully!', 'success');
      
      setAccounts(prev => prev.map(acc => {
        if (acc.username.toLowerCase() === username.toLowerCase()) {
          return {
            ...acc,
            state: {
              ...acc.state,
              mainBalance: Math.max(0, (acc.state?.mainBalance || 0) - tx.amount),
              transactions: acc.state.transactions.map((t: any) => {
                if (t.id === txId) {
                  return { ...t, description: language === 'id' ? '✅ Penarikan Sukses (Disetujui Admin)' : '✅ Withdrawal Successful (Approved)' };
                }
                return t;
              })
            }
          };
        }
        return acc;
      }));
    } else {
      triggerModal(language === 'id' ? '❌ Gagal menyetujui penarikan (Saldo user mungkin tidak cukup).' : '❌ Failed to approve withdrawal (User balance might be insufficient).', 'danger');
    }
  };

  // Reject Pending Withdrawal
  const handleRejectWithdrawal = async (username: string, txId: string) => {
    const success = await rejectWithdrawalInSupabase(txId);
    if (success) {
      triggerModal(language === 'id' ? '❌ Penarikan ditolak & dana dikembalikan!' : '❌ Withdrawal rejected & funds refunded!', 'warning');
      
      setAccounts(prev => prev.map(acc => {
        if (acc.username.toLowerCase() === username.toLowerCase()) {
          return {
            ...acc,
            state: {
              ...acc.state,
              transactions: acc.state.transactions.map((t: any) => {
                if (t.id === txId) {
                  return { ...t, description: language === 'id' ? '❌ Penarikan Ditolak Admin' : '❌ Withdrawal Rejected by Admin' };
                }
                return t;
              })
            }
          };
        }
        return acc;
      }));
    } else {
      triggerModal(language === 'id' ? '❌ Gagal menolak penarikan.' : '❌ Failed to reject withdrawal.', 'danger');
    }
  };

  // Gift Mining Contract
  const handleGiftContract = (recipient: string, qty: number) => {
    const newTx: Transaction = {
      id: 'GFT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type: 'reward',
      amount: qty * systemConfig.pricePerUnit,
      date: Date.now(),
      description: language === 'id' ? `🎁 Bonus Kontrak Tambahan (${qty} Unit)` : `🎁 Gifted Contract Bonus (${qty} Units)`
    };

    const updatedAccounts = accounts.map(acc => {
      if (acc.username.toLowerCase() === recipient.toLowerCase()) {
        const updated = {
          ...acc,
          state: {
            ...acc.state,
            activeContracts: acc.state.activeContracts + qty,
            transactions: [newTx, ...acc.state.transactions]
          }
        };
        saveAccountToSupabase(updated);
        return updated;
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    triggerModal(language === 'id' ? `✅ Berhasil mengirim ${qty} Kontrak ke ${recipient}!` : `✅ Successfully gifted ${qty} Contracts to ${recipient}!`, 'success');
  };

  // Sidebar Menu configuration
  const menuItems = [
    { path: '/admin', id: 'dashboard', label: language === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/members', id: 'members', label: language === 'id' ? 'Anggota' : 'Users', icon: Users },
    { path: '/admin/deposit', id: 'deposit', label: language === 'id' ? 'Deposit' : 'Deposits', icon: ArrowDownCircle },
    { path: '/admin/withdraw', id: 'withdraw', label: language === 'id' ? 'Penarikan' : 'Withdrawals', icon: ArrowUpCircle },
    { path: '/admin/contracts', id: 'contracts', label: language === 'id' ? 'Kontrak' : 'Contracts', icon: Briefcase },
    { path: '/admin/settings', id: 'settings', label: language === 'id' ? 'Settings' : 'Settings', icon: WalletIcon },
    { path: '/admin/network', id: 'network', label: language === 'id' ? 'Jaringan' : 'Network', icon: NetworkIcon },
  ];

  // Active check for classes
  const isTabActive = (itemPath: string) => {
    if (itemPath === '/admin') {
      return currentPath === '/admin' || currentPath === '/admin/dashboard' || currentPath.endsWith('/admin/');
    }
    return currentPath === itemPath;
  };

  // Render match pages
  const renderPage = () => {
    if (currentPath === '/admin' || currentPath === '/admin/dashboard' || currentPath.endsWith('/admin/')) {
      return (
        <Dashboard
          accounts={accounts}
          systemConfig={systemConfig}
          language={language}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/admin/members') {
      return (
        <Members
          accounts={accounts}
          setAccounts={setAccounts}
          language={language}
          triggerModal={triggerModal}
          saveAccountToSupabase={saveAccountToSupabase}
        />
      );
    }
    if (currentPath === '/admin/deposit') {
      return (
        <Deposit
          accounts={accounts}
          language={language}
          onApprove={handleApproveDeposit}
          onReject={handleRejectDeposit}
          setViewingProofUrl={setViewingProofUrl}
        />
      );
    }
    if (currentPath === '/admin/withdraw') {
      return (
        <Withdraw
          accounts={accounts}
          language={language}
          onApprove={handleApproveWithdrawal}
          onReject={handleRejectWithdrawal}
        />
      );
    }
    if (currentPath === '/admin/settings') {
      return (
        <Settings
          systemConfig={systemConfig}
          language={language}
          onSaveSystemConfig={handleSaveSystemConfig}
        />
      );
    }
    if (currentPath === '/admin/contracts') {
      return (
        <Contracts
          accounts={accounts}
          language={language}
          pricePerUnit={systemConfig.pricePerUnit}
          triggerModal={triggerModal}
          onGiftContracts={handleGiftContract}
        />
      );
    }
    if (currentPath === '/admin/network') {
      return (
        <Network
          accounts={accounts}
          language={language}
        />
      );
    }
    // Fallback to Dashboard
    return (
      <Dashboard
        accounts={accounts}
        systemConfig={systemConfig}
        language={language}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div id="admin-panel-container" className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-purple-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-950/40 border border-rose-500/20 rounded-lg text-rose-500">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-rose-400 via-purple-300 to-rose-400 bg-clip-text text-transparent uppercase cursor-pointer" onClick={() => navigate('/admin')}>
              {language === 'id' ? 'TERMINAL ADMIN GROCKGOLD' : 'GROCKGOLD ADMIN CONSOLE'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'id' ? 'Kontrol sistem, persetujuan transaksi, & manajemen mining real-time.' : 'Configure global parameters, manage users, and authorize transactions.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          <div className="text-xs bg-slate-900 border border-purple-900/30 px-3.5 py-1.5 rounded-xl font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse font-bold"></span>
            SYS VER 5.3.0 • {language === 'id' ? 'KONEKSI AKTIF' : 'SECURE CONNECTED'}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-600/15 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white transition uppercase cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'Keluar' : 'Logout'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ADMIN TABS BUTTONS */}
      <div className="flex flex-wrap gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {menuItems.map(t => {
          const Icon = t.icon;
          const isActive = isTabActive(t.path);
          return (
            <button
              key={t.id}
              onClick={() => navigate(t.path)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition uppercase shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-slate-900/60 border border-purple-950/30 rounded-2xl p-4 md:p-6 backdrop-blur-md min-h-[450px]">
        <Suspense fallback={<div className="text-slate-500 font-mono text-xs py-16 animate-pulse text-center">{language === 'id' ? 'Memuat halaman admin...' : 'Loading admin page...'}</div>}>
          {renderPage()}
        </Suspense>
      </div>

      {/* LIGHTBOX MODAL OVERLAY FOR DEPOSIT PROOF */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setViewingProofUrl(null)}
              className="p-2.5 bg-slate-900/85 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer border border-white/10"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-w-3xl w-full max-h-[80vh] flex items-center justify-center bg-slate-950/40 rounded-3xl p-2 border border-white/5 shadow-2xl relative overflow-hidden">
            {isLoadingSignedUrl ? (
              <div className="text-slate-400 font-mono text-xs py-16 animate-pulse text-center">
                {language === 'id' ? 'Menyiapkan gambar aman...' : 'Preparing secure image...'}
              </div>
            ) : (
              <img
                src={signedProofUrl || viewingProofUrl}
                alt="Transfer Proof"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl transition hover:scale-105 duration-300"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          
          <p className="text-slate-400 text-xs mt-3 font-medium bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-white/5 animate-fade-in">
            {language === 'id' ? 'Bukti Transfer Pembayaran' : 'Payment Transfer Proof'}
          </p>
        </div>
      )}
    </div>
  );
}
