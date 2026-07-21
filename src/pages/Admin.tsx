import React from 'react';
import { useAppState } from '../AppContext';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/AdminLayout';
import { saveAccountToSupabase, saveGlobalConfig, updateGlobalConfig } from '../supabase';

export const AdminPage: React.FC = () => {
  const {
    accounts,
    setAccounts,
    currentAccount,
    setCurrentAccount,
    language,
    triggerModal,
    updateState,
    globalConfig,
    setGlobalConfig
  } = useAppState();

  const { logout } = useAuth();

  return (
    <div className="w-full min-h-screen bg-slate-950">
      <AdminLayout
        accounts={accounts}
        setAccounts={setAccounts}
        currentAccount={currentAccount}
        setCurrentAccount={setCurrentAccount}
        saveAccountToSupabase={saveAccountToSupabase}
        language={language}
        triggerModal={triggerModal}
        updateState={updateState}
        onLogout={logout}
        globalConfig={globalConfig}
        onSaveGlobalConfig={async (newConfig: any) => {
          const success = await saveGlobalConfig(newConfig);
          if (success) {
            setGlobalConfig(newConfig);
            updateGlobalConfig(newConfig);
          }
          return success;
        }}
      />
    </div>
  );
};

export default AdminPage;
