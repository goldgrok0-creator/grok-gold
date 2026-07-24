import { useState } from 'react';
import { useAppState } from '../AppContext';
import { authService } from '../services/authService';
import { TRANSLATIONS } from '../translations';
import { AppState, UserAccount } from '../types';
import { supabase, hashPassword, fetchAccountsFromSupabase } from '../supabase';

export const useAuth = () => {
  const {
    accounts,
    setAccounts,
    currentAccount,
    setCurrentAccount,
    state,
    setState,
    language,
    setLanguage,
    setAuthScreen,
    setCurrentTab,
    unverifiedEmail,
    setUnverifiedEmail,
    setResendStatus,
    setIsResending,
    triggerModal,
    setIsSidebarOpen
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const t = TRANSLATIONS[language];

  const login = async (loginIdentifier: string, loginPassword: string, rememberMe: boolean) => {
    const ident = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword;

    if (!ident || !pass) {
      triggerModal(language === 'id' ? '❌ Harap isi semua kolom!' : '❌ Please fill in all fields!', 'warning');
      return;
    }

    let targetAccount = accounts.find(acc => acc.username.toLowerCase() === ident || acc.email.toLowerCase() === ident);
    let dbUser: any = null;

    if (!targetAccount || !targetAccount.password) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .or(`username.ilike.${ident},email.ilike.${ident}`)
          .maybeSingle();
        if (data) {
          dbUser = data;
        }
      } catch (err) {
        console.warn('Error querying user directly from Supabase for auth:', err);
      }
    }

    if (!targetAccount && !dbUser) {
      triggerModal(language === 'id' ? '❌ Akun tidak ditemukan!' : '❌ Account not found!', 'danger');
      return;
    }

    const hashedInput = await hashPassword(pass);
    const expectedPassword = targetAccount?.password || dbUser?.password || '';

    const passMatches = (expectedPassword === pass) || (expectedPassword === hashedInput);

    if (!passMatches) {
      triggerModal(language === 'id' ? '❌ Kata sandi salah!' : '❌ Incorrect password!', 'danger');
      return;
    }

    const userEmail = targetAccount?.email || dbUser?.email || '';
    const userUsername = targetAccount?.username || dbUser?.username || '';

    setUnverifiedEmail(null);
    setResendStatus(null);
    setIsLoading(true);

    try {
      const loginPromise = authService.loginWithSupabase(userEmail, expectedPassword || pass, false);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 1000));

      const result: any = await Promise.race([loginPromise, timeoutPromise]);

      if (result && !result.timeout) {
        const signInError = result.error;
        if (signInError) {
          if (signInError.message?.toLowerCase().includes('email not confirmed') || signInError.message?.toLowerCase().includes('confirm your email')) {
            setUnverifiedEmail(userEmail);
            triggerModal(
              language === 'id'
                ? '⚠️ Email Anda belum diverifikasi! Silakan periksa kotak masuk email Anda.'
                : '⚠️ Your email is not verified yet! Please check your email inbox.',
              'warning'
            );
            await authService.logout();
            setIsLoading(false);
            return;
          }
        }
      }
    } catch (authErr) {
      console.warn('Supabase Auth execution failed or timed out:', authErr);
    } finally {
      setIsLoading(false);
    }

    let freshAccount: UserAccount | null = null;
    try {
      const fetchedAccounts = await fetchAccountsFromSupabase(userUsername);
      if (fetchedAccounts && fetchedAccounts.length > 0) {
        freshAccount = fetchedAccounts.find(a => a.username.toLowerCase() === userUsername.toLowerCase()) || null;
      }
    } catch (e) {
      console.warn('Could not fetch fresh account on login:', e);
    }

    const rawFreeSpinBal = dbUser ? (dbUser.state?.freeSpinBalance ?? dbUser.settings?.freeSpinBalance ?? 1000000) : 1000000;
    const rawBonusSpinBal = dbUser ? (dbUser.state?.bonusSpinBalance ?? dbUser.settings?.bonusSpinBalance ?? 0) : 0;

    const finalAccount = freshAccount || targetAccount || {
      fullName: dbUser.full_name || '',
      username: dbUser.username,
      email: dbUser.email || '',
      phone: dbUser.phone || '',
      password: dbUser.password || pass,
      referralCode: dbUser.referral_code || '',
      invitedBy: dbUser.invited_by || null,
      createdAt: Number(dbUser.created_at) || Date.now(),
      settings: dbUser.settings || { language: 'id', notificationsEnabled: true, autoReinvest: false },
      state: {
        mainBalance: Number(dbUser.main_balance) || 0,
        freeSpinBalance: rawFreeSpinBal,
        bonusSpinBalance: rawBonusSpinBal,
        activeContracts: Number(dbUser.active_contracts) || 0,
        totalEarned: Number(dbUser.total_earned) || 0,
        referralEarned: Number(dbUser.referral_earned) || 0,
        rebateEarned: Number(dbUser.rebate_earned) || 0,
        rewardBalance: Number(dbUser.reward_balance) || 0,
        lastClaimTime: Number(dbUser.last_claim_time) || 0,
        welcomeBonusClaimed: !!dbUser.welcome_bonus_claimed,
        isLoggedIn: true,
        username: dbUser.username,
        holders: [],
        goldProduction: 0,
        cyclePercent: 0,
        hasPurchased: (Number(dbUser.active_contracts) || 0) > 0,
        profileImage: dbUser.profile_image || null,
        transactions: [],
        pendingMiningReward: Number(dbUser.pending_mining_reward) || 0,
        todayProfit: 0,
        totalProfit: Number(dbUser.total_earned) || 0
      }
    };

    setCurrentAccount(finalAccount);

    localStorage.setItem('grockgold_logged_in_username_v4', userUsername);

    triggerModal(
      language === 'id'
        ? `🎉 Selamat datang kembali, ${finalAccount.fullName || userUsername}!`
        : `🎉 Welcome back, ${finalAccount.fullName || userUsername}!`,
      'success'
    );

    setState({
      ...finalAccount.state,
      username: userUsername,
      isLoggedIn: true,
    });

    if (finalAccount.settings?.language) {
      setLanguage(finalAccount.settings.language);
    }

    if (finalAccount.username.toLowerCase() === 'admin') {
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new Event('popstate'));
      setCurrentTab('admin');
    } else {
      setCurrentTab('home');
    }
  };

  const bypassVerification = () => {
    if (!unverifiedEmail) return;
    
    const found = accounts.find(acc => acc.email.toLowerCase() === unverifiedEmail.toLowerCase());
    if (!found) {
      triggerModal(language === 'id' ? '❌ Akun tidak ditemukan!' : '❌ Account not found!', 'danger');
      return;
    }
    
    localStorage.setItem('grockgold_bypass_verification_v4', 'true');
    localStorage.setItem('grockgold_logged_in_username_v4', found.username);
    
    setCurrentAccount(found);
    setState({
      ...found.state,
      isLoggedIn: true,
    });
    
    if (found.settings?.language) {
      setLanguage(found.settings.language);
    }
    
    setUnverifiedEmail(null);
    setResendStatus(null);
    
    triggerModal(
      language === 'id' 
        ? '🔓 Masuk Berhasil (Bypass Verifikasi)! Sesi lokal diaktifkan.' 
        : '🔓 Login Successful (Verification Bypass)! Local session activated.', 
      'success'
    );
    setCurrentTab('home');
  };

  const register = async (
    fullNameInput: string,
    usernameInput: string,
    emailInput: string,
    phoneInput: string,
    passwordInput: string,
    confirmPasswordInput: string,
    refCodeInput: string,
    regAgreed: boolean,
    countryInput?: string
  ) => {
    const fullName = fullNameInput.trim().toUpperCase();
    const username = usernameInput.trim().replace(/\s+/g, '');
    const email = emailInput.trim();
    const phone = phoneInput.trim();
    const country = (countryInput || 'Indonesia').trim();
    const password = passwordInput;
    const confirmPassword = confirmPasswordInput;
    const refCode = refCodeInput.trim();

    if (!fullName || !username || !email || !phone || !password || !confirmPassword) {
      triggerModal(language === 'id' ? '❌ Semua field wajib diisi kecuali Kode Referral!' : '❌ All fields are mandatory except Referral Code!', 'warning');
      return false;
    }

    if (username.length < 3) {
      triggerModal(language === 'id' ? '❌ Username minimal 3 karakter!' : '❌ Username must be at least 3 characters!', 'warning');
      return false;
    }

    if (accounts.some(acc => acc.username.toLowerCase() === username.toLowerCase())) {
      triggerModal(language === 'id' ? '❌ Username sudah terdaftar!' : '❌ Username is already registered!', 'danger');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerModal(language === 'id' ? '❌ Format email tidak valid!' : '❌ Invalid email format!', 'warning');
      return false;
    }

    if (accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
      triggerModal(language === 'id' ? '❌ Email sudah terdaftar!' : '❌ Email is already registered!', 'danger');
      return false;
    }

    if (password.length < 8) {
      triggerModal(language === 'id' ? '❌ Password minimal 8 karakter!' : '❌ Password must be at least 8 characters!', 'warning');
      return false;
    }

    if (password !== confirmPassword) {
      triggerModal(language === 'id' ? '❌ Password dan Konfirmasi Password harus sama!' : '❌ Password and Confirm Password must match!', 'danger');
      return false;
    }

    if (!regAgreed) {
      triggerModal(language === 'id' ? '❌ Anda harus menyetujui Syarat & Ketentuan!' : '❌ You must agree to the Terms & Conditions!', 'warning');
      return false;
    }

    let nextNum = 1;
    const ggmCodes = accounts
      .map(acc => acc.referralCode || '')
      .filter(code => code.startsWith('GGM-'));
    
    const numericParts = ggmCodes
      .map(code => {
        const numStr = code.substring(4);
        return /^\d+$/.test(numStr) ? parseInt(numStr, 10) : 0;
      })
      .filter(num => num > 0);
    
    if (numericParts.length > 0) {
      nextNum = Math.max(...numericParts) + 1;
    }
    const personalReferralCode = 'GGM-' + String(nextNum).padStart(4, '0');

    let sponsorUsername: string | null = null;

    if (refCode) {
      const sponsor = accounts.find(acc => acc.username.toLowerCase() === refCode.toLowerCase() || acc.referralCode.toLowerCase() === refCode.toLowerCase());
      if (sponsor) {
        sponsorUsername = sponsor.username;
      } else {
        triggerModal(
          language === 'id' ? '❌ Invalid Referral Code (Kode referral tidak valid!)' : '❌ Invalid Referral Code!',
          'danger'
        );
        return false;
      }
    }

    const defaultUserState: AppState = {
      mainBalance: 0,
      freeSpinBalance: 1000000,
      bonusSpinBalance: 0,
      activeContracts: 0,
      totalEarned: 0,
      referralEarned: 0,
      rebateEarned: 0,
      lastClaimTime: 0,
      welcomeBonusClaimed: false,
      isLoggedIn: false,
      username: username,
      holders: [],
      goldProduction: 0,
      cyclePercent: 0,
      hasPurchased: false,
      profileImage: null,
      transactions: [],
      pendingMiningReward: 0,
      todayProfit: 0,
      totalProfit: 0,
    };

    const newAccount: UserAccount = {
      fullName,
      username,
      email,
      phone,
      country,
      password,
      referralCode: personalReferralCode,
      invitedBy: sponsorUsername,
      createdAt: Date.now(),
      state: defaultUserState,
      settings: {
        language: language,
        notificationsEnabled: true,
        autoReinvest: false,
        freeSpinBalance: 1000000,
        bonusSpinBalance: 0,
        rewardSpinWallet: 0,
        luckySpinHistory: [],
        lastSpinResetAt: 0,
      }
    };

    setIsLoading(true);
    await authService.logout().catch(() => {});
    const success = await authService.registerUser(newAccount);

    if (success) {
      try {
        await authService.loginWithSupabase(email, password, false);
      } catch (e) {
        console.warn("Auto login after registration failed silently:", e);
      }
      setIsLoading(false);
      localStorage.setItem('grockgold_logged_in_username_v4', username);
      setCurrentAccount(newAccount);
      setState({
        ...defaultUserState,
        username: username,
        isLoggedIn: true,
      });
      setUnverifiedEmail(null);
      setResendStatus(null);
      triggerModal(
        language === 'id' 
          ? `🎉 Registrasi berhasil! Selamat datang, ${fullName || username}.` 
          : `🎉 Registration successful! Welcome, ${fullName || username}.`, 
        'success'
      );
      setCurrentTab('home');
      return true;
    } else {
      triggerModal(language === 'id' ? '❌ Registrasi gagal!' : '❌ Registration failed!', 'danger');
      return false;
    }
  };

  const resendVerification = async () => {
    if (!unverifiedEmail) {
      triggerModal(language === 'id' ? '❌ Tidak ada alamat email yang ditemukan untuk dikirim ulang!' : '❌ No email address found to resend!', 'danger');
      return;
    }

    setIsResending(true);
    setResendStatus(null);
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
      const { error } = await authService.resendVerificationEmail(unverifiedEmail, currentOrigin);

      if (error) throw error;

      setResendStatus('success');
      triggerModal(
        language === 'id'
          ? '🎉 Email verifikasi berhasil dikirim ulang! Silakan periksa kotak masuk atau spam Anda.'
          : '🎉 Verification email resent successfully! Please check your inbox or spam folder.',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to resend verification:', err);
      setResendStatus('error');
      triggerModal(
        language === 'id'
          ? `❌ Gagal mengirim ulang email: ${err.message || err}`
          : `❌ Failed to resend email: ${err.message || err}`,
        'danger'
      );
    } finally {
      setIsResending(false);
    }
  };

  const forgotPassword = async (email: string) => {
    if (!email) {
      triggerModal(language === 'id' ? '❌ Harap masukkan email Anda!' : '❌ Please enter your email!', 'warning');
      return;
    }

    const dbUser = accounts.find(acc => acc.email.toLowerCase() === email.trim().toLowerCase());
    if (!dbUser) {
      triggerModal(
        language === 'id' 
          ? '❌ Email tidak terdaftar di sistem lokal kita!' 
          : '❌ This email is not registered in our local system!', 
        'danger'
      );
      return;
    }

    setIsLoading(true);
    try {
      try {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
        await authService.signUpWithSupabase(dbUser.email, dbUser.password, dbUser.username, dbUser.fullName, currentOrigin);
      } catch (signupErr) {}

      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
      const redirectToUrl = `${currentOrigin}/reset-password`;
      const { error } = await authService.resetPasswordForEmail(email, redirectToUrl);

      if (error) throw error;

      triggerModal(
        language === 'id' 
          ? '🎉 Tautan pemulihan kata sandi telah dikirim ke email Anda!' 
          : '🎉 A password recovery link has been sent to your email address!', 
        'success'
      );
      setAuthScreen('login');
    } catch (err: any) {
      console.error('Password reset failed:', err);
      triggerModal(language === 'id' ? `❌ Gagal mengirim tautan reset: ${err.message}` : `❌ Failed to send reset link: ${err.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPass: string, confirmPass: string) => {
    if (!newPass || !confirmPass) {
      triggerModal(language === 'id' ? '❌ Harap isi semua kolom!' : '❌ Please fill in all fields!', 'warning');
      return;
    }

    if (newPass.length < 8) {
      triggerModal(language === 'id' ? '❌ Kata sandi minimal 8 karakter!' : '❌ Password must be at least 8 characters!', 'warning');
      return;
    }

    if (newPass !== confirmPass) {
      triggerModal(language === 'id' ? '❌ Konfirmasi kata sandi tidak cocok!' : '❌ Confirm password does not match!', 'danger');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authService.updatePasswordInSupabase(newPass);
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { error: dbErr } = await authService.updateDatabasePassword(user.email, newPass);
        if (dbErr) {
          console.error('Failed to update public.users password:', dbErr);
        }
      }

      await authService.logout();

      triggerModal(
        language === 'id' 
          ? '✅ Kata sandi berhasil diperbarui! Silakan masuk.' 
          : '✅ Password updated successfully! Please login with your new credentials.', 
        'success'
      );

      window.history.replaceState(null, '', window.location.origin + '/');
      setAuthScreen('login');
    } catch (err: any) {
      console.error('Failed updating password:', err);
      triggerModal(language === 'id' ? `❌ Gagal memperbarui kata sandi: ${err.message}` : `❌ Failed to update password: ${err.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Supabase Auth signout warning:', err);
    }

    if (currentAccount) {
      setAccounts(prevAccounts => {
        const updatedAccounts = prevAccounts.map(acc => {
          if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
            return {
              ...acc,
              state: {
                ...state,
                isLoggedIn: false,
              },
            };
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

    setCurrentAccount(null);
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
    }));
    localStorage.removeItem('grockgold_logged_in_username_v4');
    localStorage.removeItem('grockgold_bypass_verification_v4');

    setIsSidebarOpen(false);
    triggerModal(language === 'id' ? 'Keluar berhasil.' : 'Sign out successfully.', 'warning');
    setAuthScreen('welcome');
    setCurrentTab('home');
  };

  return {
    login,
    bypassVerification,
    register,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    isLoading
  };
};
