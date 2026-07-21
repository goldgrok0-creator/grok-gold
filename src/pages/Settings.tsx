import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Settings } from 'lucide-react';
import { useAppState } from '../AppContext';
import { saveAccountToSupabase } from '../supabase';
import { CONFIG } from '../types';
import { TRANSLATIONS } from '../translations';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    currentAccount,
    setCurrentAccount,
    setAccounts,
    setCurrentTab,
    triggerModal,
    state
  } = useAppState();

  const t = TRANSLATIONS[language];

  const handleToggleAutoReinvest = (val: boolean) => {
    if (!currentAccount) return;

    setAccounts(prevAccounts => {
      const updatedAccounts = prevAccounts.map(acc => {
        if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
          const updated = {
            ...acc,
            settings: {
              ...acc.settings,
              autoReinvest: val,
            }
          };
          saveAccountToSupabase(updated);
          return updated;
        }
        return acc;
      });
      try {
        localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
      } catch (e) {
        console.error(e);
      }
      return updatedAccounts;
    });

    setCurrentAccount(prev => prev ? {
      ...prev,
      settings: {
        ...prev.settings,
        autoReinvest: val,
      }
    } : null);

    triggerModal(
      language === 'id'
        ? `✅ Auto Reinvest ${val ? 'Diaktifkan' : 'Dinonaktifkan'}`
        : `✅ Auto Reinvest ${val ? 'Enabled' : 'Disabled'}`,
      'info'
    );
  };

  const handleToggleNotifications = (val: boolean) => {
    if (!currentAccount) return;

    setAccounts(prevAccounts => {
      const updatedAccounts = prevAccounts.map(acc => {
        if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
          const updated = {
            ...acc,
            settings: {
              ...acc.settings,
              notificationsEnabled: val,
            }
          };
          saveAccountToSupabase(updated);
          return updated;
        }
        return acc;
      });
      try {
        localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
      } catch (e) {
        console.error(e);
      }
      return updatedAccounts;
    });

    setCurrentAccount(prev => prev ? {
      ...prev,
      settings: {
        ...prev.settings,
        notificationsEnabled: val,
      }
    } : null);

    triggerModal(
      language === 'id'
        ? `🔔 Notifikasi ${val ? 'Diaktifkan' : 'Dinonaktifkan'}`
        : `🔔 Notifications ${val ? 'Enabled' : 'Disabled'}`,
      'info'
    );
  };

  const toggleLanguage = () => {
    const nextLang: 'id' | 'en' = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
    localStorage.setItem('grockgold_lang', nextLang);

    if (state.isLoggedIn && currentAccount) {
      setAccounts(prevAccounts => {
        const updatedAccounts = prevAccounts.map(acc => {
          if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
            const updated = {
              ...acc,
              settings: {
                ...acc.settings,
                language: nextLang,
              }
            };
            saveAccountToSupabase(updated);
            return updated;
          }
          return acc;
        });
        try {
          localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
        } catch (e) {
          console.error(e);
        }
        return updatedAccounts;
      });
    }

    triggerModal(
      nextLang === 'en'
        ? '🇬🇧 Language changed to English!'
        : '🇲🇨 Bahasa diubah ke Bahasa Indonesia!',
      'success'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left font-sans"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Pengaturan' : 'Settings'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
          <Settings className="w-4 h-4 text-gold-primary" />
          {t.settingsTitle}
        </div>

        <div className="space-y-3 text-xs font-bold text-white">
          {/* Auto Reinvest Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex flex-col text-left">
              <span className="text-xs">Auto Reinvest (Rp {(CONFIG.PRICE_PER_UNIT / 1000).toLocaleString('id-ID')}k)</span>
              <span className="text-[8px] text-slate-400 font-medium">Beli kontrak otomatis dari hasil tambang</span>
            </div>
            <button
              onClick={() => handleToggleAutoReinvest(!currentAccount?.settings?.autoReinvest)}
              className={`w-10 h-6 rounded-full p-1 transition duration-200 focus:outline-none ${
                currentAccount?.settings?.autoReinvest ? 'bg-gold-primary' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                  currentAccount?.settings?.autoReinvest ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="flex flex-col text-left">
              <span className="text-xs">{language === 'id' ? 'Notifikasi Real-time' : 'Real-time Notifications'}</span>
              <span className="text-[8px] text-slate-400 font-medium">Terima peringatan aktivitas armada</span>
            </div>
            <button
              onClick={() => handleToggleNotifications(!currentAccount?.settings?.notificationsEnabled)}
              className={`w-10 h-6 rounded-full p-1 transition duration-200 focus:outline-none ${
                currentAccount?.settings?.notificationsEnabled ? 'bg-gold-primary' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                  currentAccount?.settings?.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
