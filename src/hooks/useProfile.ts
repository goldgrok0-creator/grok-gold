import { useState } from 'react';
import { useAppState } from '../AppContext';
import { accountService } from '../services/accountService';

export const useProfile = () => {
  const {
    currentAccount,
    setCurrentAccount,
    accounts,
    setAccounts,
    language,
    setLanguage,
    state,
    updateState,
    triggerModal
  } = useAppState();

  const changePassword = async (oldPass: string, newPass: string, confirmNew: string) => {
    if (!oldPass || !newPass || !confirmNew) {
      triggerModal(language === 'id' ? '❌ Semua kolom wajib diisi!' : '❌ All fields are required!', 'warning');
      return false;
    }

    if (currentAccount?.password !== oldPass) {
      triggerModal(language === 'id' ? '❌ Kata sandi lama salah!' : '❌ Incorrect old password!', 'danger');
      return false;
    }

    if (newPass.length < 8) {
      triggerModal(language === 'id' ? '❌ Password baru minimal 8 karakter!' : '❌ New password must be at least 8 characters!', 'warning');
      return false;
    }

    if (newPass !== confirmNew) {
      triggerModal(language === 'id' ? '❌ Konfirmasi kata sandi baru tidak cocok!' : '❌ Confirm new password does not match!', 'danger');
      return false;
    }

    const updatedAccounts = accounts.map(acc => {
      if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
        const updated = { ...acc, password: newPass };
        accountService.saveAccount(updated);
        return updated;
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    try {
      localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
    } catch (e) {
      console.error(e);
    }

    setCurrentAccount(prev => prev ? { ...prev, password: newPass } : null);
    triggerModal(language === 'id' ? '✅ Kata sandi berhasil diperbarui!' : '✅ Password updated successfully!', 'success');
    return true;
  };

  const toggleAutoReinvest = (val: boolean) => {
    if (!currentAccount) return;

    const updatedAccounts = accounts.map(acc => {
      if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
        const updated = {
          ...acc,
          settings: {
            ...acc.settings,
            autoReinvest: val,
          }
        };
        accountService.saveAccount(updated);
        return updated;
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    try {
      localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
    } catch (e) {
      console.error(e);
    }

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

  const toggleNotifications = (val: boolean) => {
    if (!currentAccount) return;

    const updatedAccounts = accounts.map(acc => {
      if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
        const updated = {
          ...acc,
          settings: {
            ...acc.settings,
            notificationsEnabled: val,
          }
        };
        accountService.saveAccount(updated);
        return updated;
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    try {
      localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
    } catch (e) {
      console.error(e);
    }

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

  const changeLanguage = (lang: 'id' | 'en') => {
    setLanguage(lang);
    if (!currentAccount) return;

    const updatedAccounts = accounts.map(acc => {
      if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
        const updated = {
          ...acc,
          settings: {
            ...acc.settings,
            language: lang,
          }
        };
        accountService.saveAccount(updated);
        return updated;
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    try {
      localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
    } catch (e) {
      console.error(e);
    }

    setCurrentAccount(prev => prev ? {
      ...prev,
      settings: {
        ...prev.settings,
        language: lang,
      }
    } : null);
  };

  const updateProfileImage = (base64Image: string) => {
    updateState({ profileImage: base64Image });
    if (!currentAccount) return;
    accountService.updateProfileImage(currentAccount.username, base64Image);
  };

  return {
    changePassword,
    toggleAutoReinvest,
    toggleNotifications,
    changeLanguage,
    updateProfileImage
  };
};
