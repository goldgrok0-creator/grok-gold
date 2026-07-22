import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, Holder, CONFIG, UserAccount, SystemError } from './types';
import { supabase, fetchAccountsFromSupabase, saveAccountToSupabase, fetchGlobalConfig, updateGlobalConfig } from './supabase';

const INITIAL_HOLDERS: Holder[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_SYSTEM_ERRORS: SystemError[] = [
  {
    id: 'err-1',
    timestamp: Date.now() - 3.5 * 3600 * 1000,
    errorCode: 'ERR-102',
    message: 'Phase regulator jitter detected on EXC-700 active node',
    node: 'EXC-700 South Africa Node',
    severity: 'warning',
    resolved: true,
  },
  {
    id: 'err-2',
    timestamp: Date.now() - 7.2 * 3600 * 1000,
    errorCode: 'ERR-409',
    message: 'Thermal core anomaly: core temp exceeding 82°C safety threshold',
    node: 'Mali Operational Site L2',
    severity: 'critical',
    resolved: false,
  },
  {
    id: 'err-3',
    timestamp: Date.now() - 14.8 * 3600 * 1000,
    errorCode: 'ERR-201',
    message: 'Temporary packet drop rate exceeded 15% on satellite link',
    node: 'Tanzania Gateway Node',
    severity: 'warning',
    resolved: true,
  }
];

export const SPIN_ITEMS = [
  { label: 'Rp 5.000', color: '#7209b7', value: 5000, type: 'cash' },
  { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
  { label: 'Rp 15.000', color: '#b5179e', value: 15000, type: 'cash' },
  { label: 'Boost 5x', color: '#f72585', value: 5, type: 'boost' },
  { label: 'Rp 25.000', color: '#7209b7', value: 25000, type: 'cash' },
  { label: 'ZONK', color: '#1a103c', value: 0, type: 'zonk' },
  { label: 'Rp 50.000', color: '#da70d6', value: 50000, type: 'cash' },
  { label: 'Boost 10x', color: '#f8961e', value: 10, type: 'boost' },
];

function isSameDay(t1: number, t2: number) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function getWeekNumber(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

function isSameWeek(t1: number, t2: number) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return d1.getFullYear() === d2.getFullYear() && getWeekNumber(d1) === getWeekNumber(d2);
}

function isSameMonth(t1: number, t2: number) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

interface AppContextType {
  isSplashScreen: boolean;
  setIsSplashScreen: React.Dispatch<React.SetStateAction<boolean>>;
  splashProgress: number;
  setSplashProgress: React.Dispatch<React.SetStateAction<number>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  language: 'id' | 'en';
  setLanguage: React.Dispatch<React.SetStateAction<'id' | 'en'>>;
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  hideBalance: boolean;
  setHideBalance: React.Dispatch<React.SetStateAction<boolean>>;
  isSyncing: boolean;
  setIsSyncing: React.Dispatch<React.SetStateAction<boolean>>;
  supabaseError: string | null;
  setSupabaseError: React.Dispatch<React.SetStateAction<string | null>>;
  
  authScreen: 'welcome' | 'login' | 'register' | 'forgot' | 'reset-password';
  setAuthScreen: React.Dispatch<React.SetStateAction<'welcome' | 'login' | 'register' | 'forgot' | 'reset-password'>>;
  showLanding: boolean;
  setShowLanding: React.Dispatch<React.SetStateAction<boolean>>;
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  currentAccount: UserAccount | null;
  setCurrentAccount: React.Dispatch<React.SetStateAction<UserAccount | null>>;
  
  globalConfig: any;
  setGlobalConfig: React.Dispatch<React.SetStateAction<any>>;
  
  unverifiedEmail: string | null;
  setUnverifiedEmail: React.Dispatch<React.SetStateAction<string | null>>;
  resendStatus: string | null;
  setResendStatus: React.Dispatch<React.SetStateAction<string | null>>;
  isResending: boolean;
  setIsResending: React.Dispatch<React.SetStateAction<boolean>>;
  
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalMessage: string;
  setModalMessage: React.Dispatch<React.SetStateAction<string>>;
  modalType: 'success' | 'danger' | 'warning' | 'info';
  setModalType: React.Dispatch<React.SetStateAction<'success' | 'danger' | 'warning' | 'info'>>;
  modalShowConfirm: boolean;
  setModalShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  modalOnConfirm: (() => void) | undefined;
  setModalOnConfirm: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  triggerModal: (message: string, type?: 'success' | 'danger' | 'warning' | 'info', showConfirm?: boolean, onConfirm?: () => void) => void;
  
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateState: (updater: Partial<AppState> | ((prev: AppState) => AppState), forceSaveImmediately?: boolean) => void;
  saveImmediately: (latestState: AppState) => void;
  syncFromSupabase: () => Promise<void>;
  
  simSpeed: number;
  setSimSpeed: React.Dispatch<React.SetStateAction<number>>;
  boostTimeLeft: number;
  setBoostTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  claimCooldownText: string;
  setClaimCooldownText: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSplashScreen, setIsSplashScreen] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [hideBalance, setHideBalance] = useState(false);
  const [isSyncing, setIsSyncing] = useState(() => {
    try {
      const cached = sessionStorage.getItem('grockgold_accounts_cache_v4');
      return !cached;
    } catch (e) {
      return true;
    }
  });
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const [authScreen, setAuthScreen] = useState<'welcome' | 'login' | 'register' | 'forgot' | 'reset-password'>('welcome');
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  
  const [globalConfig, setGlobalConfig] = useState<any>({
    pricePerUnit: 180000,
    dailyRewardPercent: 2.0,
    cappingPercent: 250,
    minDeposit: 100000,
    minWithdraw: 100000,
    simulationSpeed: 1,
    botsEnabled: true,
    bankName: 'BCA',
    bankNumber: '8402-1920-22',
    bankHolder: 'PT GROCKGOLD INDONESIA',
    usdtAddress: 'TYrN8xZ7p8asD89xHjasDJKH190Kash18a'
  });

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');
  const [modalShowConfirm, setModalShowConfirm] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);

  const triggerModal = (
    message: string,
    type: 'success' | 'danger' | 'warning' | 'info' = 'info',
    showConfirm: boolean = false,
    onConfirm?: () => void
  ) => {
    setModalMessage(message);
    setModalType(type);
    setModalShowConfirm(showConfirm);
    setModalOnConfirm(() => onConfirm);
    setModalOpen(true);
  };

  const [simSpeed, setSimSpeed] = useState(1);
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  const [claimCooldownText, setClaimCooldownText] = useState('');

  const [state, setState] = useState<AppState>({
    mainBalance: 0,
    activeContracts: 0,
    totalEarned: 0,
    referralEarned: 0,
    rebateEarned: 0,
    lastClaimTime: 0,
    welcomeBonusClaimed: false,
    isLoggedIn: false,
    username: 'ADMIN',
    holders: INITIAL_HOLDERS,
    goldProduction: 0,
    cyclePercent: 0,
    hasPurchased: false,
    profileImage: null,
    transactions: INITIAL_TRANSACTIONS,
    pendingMiningReward: 0,
    todayProfit: 0,
    totalProfit: 0,
    systemErrors: INITIAL_SYSTEM_ERRORS,
  });

  // Fetch from Supabase
  const syncFromSupabase = async () => {
    let loggedInUsername = localStorage.getItem('grockgold_logged_in_username_v4');
    const isBypassed = localStorage.getItem('grockgold_bypass_verification_v4') === 'true';

    try {
      const config = await fetchGlobalConfig().catch(() => null);
      if (config) {
        setGlobalConfig(config);
        updateGlobalConfig(config);
      }

      let session = null;
      try {
        const sessionRes = await supabase.auth.getSession();
        session = sessionRes.data?.session;
      } catch (e) {
        console.warn('Failed to get Supabase Auth session, continuing offline/local mode', e);
      }

      if (session?.user) {
        if (session.user.email?.toLowerCase() === 'admin@grockgold.com') {
          loggedInUsername = 'admin';
        } else {
          if (!session.user.email_confirmed_at && !isBypassed) {
            console.warn('Session found for unverified email on startup. Signing out.');
            setUnverifiedEmail(session.user.email || null);
            try {
              await supabase.auth.signOut();
            } catch (signOutErr) {}
            localStorage.removeItem('grockgold_logged_in_username_v4');
            loggedInUsername = null;
          } else if (session.user.user_metadata?.username) {
            loggedInUsername = session.user.user_metadata.username;
          }
        }
      } else {
        if (!isBypassed) {
          loggedInUsername = null;
        }
      }

      const supabaseAccounts = await fetchAccountsFromSupabase(loggedInUsername || undefined).catch(() => null);
      if (supabaseAccounts && supabaseAccounts.length > 0) {
        setSupabaseError(null);
        setAccounts(supabaseAccounts);
        const sanitizedAccounts = supabaseAccounts.map(({ password, ...rest }) => rest);
        localStorage.setItem('grockgold_accounts_v4', JSON.stringify(sanitizedAccounts));
        sessionStorage.setItem('grockgold_accounts_cache_v4', JSON.stringify(sanitizedAccounts));

        if (loggedInUsername) {
          const found = supabaseAccounts.find(acc => acc.username.toLowerCase() === loggedInUsername.toLowerCase());
          if (found) {
            setCurrentAccount(found);
            setState(prev => ({
              ...prev,
              ...found.state,
              isLoggedIn: true,
            }));
            if (found.settings?.language) {
              setLanguage(found.settings.language);
            }
          }
        }
      } else {
        throw new Error('Database returned empty or null user records.');
      }
    } catch (err: any) {
      console.warn('Supabase offline or failed to sync. Using local storage fallback.', err);
      setSupabaseError(null);

      // Local storage fallback
      const cached = localStorage.getItem('grockgold_accounts_v4');
      let fallbackAccounts: UserAccount[] = [];
      if (cached) {
        try {
          fallbackAccounts = JSON.parse(cached);
        } catch (e) {
          console.warn('Failed to parse cached accounts', e);
        }
      }

      // If no local accounts exist, seed default offline Admin
      if (!fallbackAccounts || fallbackAccounts.length === 0) {
        fallbackAccounts = [
          {
            username: 'admin',
            fullName: 'System Administrator',
            email: 'admin@grockgold.com',
            phone: '+6281234567890',
            password: 'admin123',
            referralCode: 'ADMIN_OFFLINE',
            invitedBy: null,
            createdAt: Date.now(),
            settings: {
              language: 'id',
              notificationsEnabled: true,
              autoReinvest: false,
            },
            state: {
              mainBalance: 1000000000,
              activeContracts: 0,
              totalEarned: 0,
              referralEarned: 0,
              rebateEarned: 0,
              lastClaimTime: 0,
              welcomeBonusClaimed: true,
              isLoggedIn: false,
              username: 'admin',
              holders: [],
              goldProduction: 0,
              cyclePercent: 0,
              hasPurchased: false,
              profileImage: null,
              transactions: [],
              pendingMiningReward: 0,
              todayProfit: 0,
              totalProfit: 0,
              systemErrors: INITIAL_SYSTEM_ERRORS,
            },
          },
        ];
        localStorage.setItem('grockgold_accounts_v4', JSON.stringify(fallbackAccounts));
      }

      setAccounts(fallbackAccounts);

      if (loggedInUsername) {
        const found = fallbackAccounts.find(acc => acc.username.toLowerCase() === loggedInUsername.toLowerCase());
        if (found) {
          setCurrentAccount(found);
          setState(prev => ({
            ...prev,
            ...found.state,
            isLoggedIn: true,
          }));
          if (found.settings?.language) {
            setLanguage(found.settings.language);
          }
        }
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Real-time PostgreSQL Setup
  useEffect(() => {
    syncFromSupabase();

    let syncTimeout: NodeJS.Timeout | null = null;
    const debouncedSync = () => {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        syncFromSupabase();
      }, 800);
    };

    const handlePayload = (payload: any) => {
      const loggedInUsername = localStorage.getItem('grockgold_logged_in_username_v4');
      if (!loggedInUsername) return;
      
      const payloadUsername = payload.new?.username || payload.old?.username || payload.new?.invited_by;
      if (
        loggedInUsername.toLowerCase() === 'admin' ||
        !payloadUsername ||
        payloadUsername.toLowerCase() === 'admin' ||
        payloadUsername.toLowerCase() === loggedInUsername.toLowerCase()
      ) {
        debouncedSync();
      }
    };

    const dbChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, handlePayload)
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }, []);

  const updateState = (
    updater: Partial<AppState> | ((prev: AppState) => AppState),
    forceSaveImmediately: boolean = false
  ) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      if (forceSaveImmediately) {
        setTimeout(() => saveImmediately(next), 0);
      }
      return next;
    });
  };

  const saveImmediately = (latestState: AppState) => {
    if (!latestState.isLoggedIn || !currentAccount) return;
    try {
      setAccounts(prevAccounts => {
        const updatedAccounts = prevAccounts.map(acc => {
          if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
            const updatedAcc = {
              ...acc,
              state: latestState,
              settings: {
                ...acc.settings,
                language: language,
              }
            };
            saveAccountToSupabase(updatedAcc);
            return updatedAcc;
          }
          return acc;
        });
        localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
        return updatedAccounts;
      });
      localStorage.setItem('grockgold_state_v4', JSON.stringify(latestState));
    } catch (e) {
      console.error('Error in immediate localStorage save', e);
    }
  };

  // Debounced Persistence to LocalStorage / Supabase
  useEffect(() => {
    if (!state.isLoggedIn || !currentAccount) return;

    const handler = setTimeout(() => {
      try {
        setAccounts(prevAccounts => {
          const updatedAccounts = prevAccounts.map(acc => {
            if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
              const updatedAcc = {
                ...acc,
                state: state,
                settings: {
                  ...acc.settings,
                  language: language,
                }
              };
              saveAccountToSupabase(updatedAcc);
              return updatedAcc;
            }
            return acc;
          });
          localStorage.setItem('grockgold_accounts_v4', JSON.stringify(updatedAccounts));
          return updatedAccounts;
        });
        localStorage.setItem('grockgold_state_v4', JSON.stringify(state));
      } catch (e) {
        console.error('Error saving state to localStorage', e);
      }
    }, 4000);

    return () => clearTimeout(handler);
  }, [state, currentAccount, language]);

  // Splash Screen Loader
  useEffect(() => {
    const hasCache = sessionStorage.getItem('grockgold_accounts_cache_v4') || localStorage.getItem('grockgold_logged_in_username_v4');
    const step = hasCache ? 25 : 10;
    const intervalTime = hasCache ? 15 : 30;
    const interval = setInterval(() => {
      setSplashProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsSplashScreen(false), hasCache ? 50 : 150);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);
    return () => clearInterval(interval);
  }, []);

  // Boost countdown
  useEffect(() => {
    if (boostTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setBoostTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [boostTimeLeft]);

  // Core background mining loop
  useEffect(() => {
    if (!state.isLoggedIn || isSplashScreen) return;

    const timer = setInterval(() => {
      const totalPortfolio = state.activeContracts * CONFIG.PRICE_PER_UNIT;
      const maxAllowed = totalPortfolio * CONFIG.CAPPING_PERCENT;
      const isCapped = state.totalEarned >= maxAllowed;
      const activeBoostMult = boostTimeLeft > 0 ? 1.5 : 1.0;

      if (state.activeContracts > 0 && !isCapped) {
        updateState(prev => {
          let nextCycle = prev.cyclePercent + 1.5 * simSpeed * activeBoostMult;
          let addedGold = 0;

          if (nextCycle >= 100) {
            nextCycle = nextCycle % 100;
            addedGold = (0.0003 + Math.random() * 0.0007) * prev.activeContracts * simSpeed * activeBoostMult;
          }

          const now = Date.now();
          const lastUpdate = prev.lastGoldUpdateTime || now;

          let nextDaily = prev.goldProductionDaily || 0;
          let nextWeekly = prev.goldProductionWeekly || 0;
          let nextMonthly = prev.goldProductionMonthly || 0;

          if (!isSameDay(now, lastUpdate)) nextDaily = 0;
          if (!isSameWeek(now, lastUpdate)) nextWeekly = 0;
          if (!isSameMonth(now, lastUpdate)) nextMonthly = 0;

          if (addedGold > 0) {
            nextDaily += addedGold;
            nextWeekly += addedGold;
            nextMonthly += addedGold;
          }

          const dailyYieldSec = (prev.activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.DAILY_REWARD_PERCENT) / 86400;
          const increment = dailyYieldSec * simSpeed * activeBoostMult;

          const currentTotalPortfolio = prev.activeContracts * CONFIG.PRICE_PER_UNIT;
          const currentMaxAllowed = currentTotalPortfolio * CONFIG.CAPPING_PERCENT;
          const currentEarnedTotal = prev.totalEarned + prev.pendingMiningReward;

          let addedReward = increment;
          if (currentEarnedTotal + increment > currentMaxAllowed) {
            addedReward = Math.max(0, currentMaxAllowed - currentEarnedTotal);
          }

          const nextPending = prev.pendingMiningReward + addedReward;

          if (currentAccount?.settings?.autoReinvest && nextPending >= CONFIG.PRICE_PER_UNIT) {
            const unitsToBuy = Math.floor(nextPending / CONFIG.PRICE_PER_UNIT);
            const cost = unitsToBuy * CONFIG.PRICE_PER_UNIT;
            
            const autoTx: Transaction = {
              id: 'AUTO-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
              type: 'reward',
              amount: cost,
              date: Date.now(),
              description: language === 'id'
                ? `Auto-Reinvest: Beli ${unitsToBuy} Unit`
                : `Auto-Reinvest: Purchased ${unitsToBuy} Units`,
            };

            return {
              ...prev,
              cyclePercent: nextCycle,
              goldProduction: prev.goldProduction + addedGold,
              goldProductionDaily: nextDaily,
              goldProductionWeekly: nextWeekly,
              goldProductionMonthly: nextMonthly,
              lastGoldUpdateTime: now,
              pendingMiningReward: nextPending - cost,
              activeContracts: prev.activeContracts + unitsToBuy,
              transactions: [autoTx, ...prev.transactions],
            };
          }

          return {
            ...prev,
            cyclePercent: nextCycle,
            goldProduction: prev.goldProduction + addedGold,
            goldProductionDaily: nextDaily,
            goldProductionWeekly: nextWeekly,
            goldProductionMonthly: nextMonthly,
            lastGoldUpdateTime: now,
            pendingMiningReward: nextPending,
          };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isLoggedIn, state.activeContracts, state.totalEarned, isSplashScreen, simSpeed, boostTimeLeft, currentAccount?.settings?.autoReinvest]);

  // Claim cooldown countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (state.lastClaimTime === 0) {
        setClaimCooldownText('');
        return;
      }
      const now = Date.now();
      const elapsed = now - state.lastClaimTime;
      if (elapsed >= CONFIG.CLAIM_COOLDOWN) {
        setClaimCooldownText('');
      } else {
        const remainingMs = CONFIG.CLAIM_COOLDOWN - elapsed;
        const hours = Math.floor(remainingMs / 3600000);
        const minutes = Math.floor((remainingMs % 3600000) / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        const pad = (num: number) => String(num).padStart(2, '0');
        setClaimCooldownText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state.lastClaimTime]);

  const value = useMemo(() => ({
    isSplashScreen,
    setIsSplashScreen,
    splashProgress,
    setSplashProgress,
    isSidebarOpen,
    setIsSidebarOpen,
    language,
    setLanguage,
    currentTab,
    setCurrentTab,
    hideBalance,
    setHideBalance,
    isSyncing,
    setIsSyncing,
    supabaseError,
    setSupabaseError,
    authScreen,
    setAuthScreen,
    showLanding,
    setShowLanding,
    accounts,
    setAccounts,
    currentAccount,
    setCurrentAccount,
    globalConfig,
    setGlobalConfig,
    unverifiedEmail,
    setUnverifiedEmail,
    resendStatus,
    setResendStatus,
    isResending,
    setIsResending,
    modalOpen,
    setModalOpen,
    modalMessage,
    setModalMessage,
    modalType,
    setModalType,
    modalShowConfirm,
    setModalShowConfirm,
    modalOnConfirm,
    setModalOnConfirm,
    triggerModal,
    state,
    setState,
    updateState,
    saveImmediately,
    syncFromSupabase,
    simSpeed,
    setSimSpeed,
    boostTimeLeft,
    setBoostTimeLeft,
    claimCooldownText,
    setClaimCooldownText
  }), [
    isSplashScreen,
    splashProgress,
    isSidebarOpen,
    language,
    currentTab,
    hideBalance,
    isSyncing,
    supabaseError,
    authScreen,
    showLanding,
    accounts,
    currentAccount,
    globalConfig,
    unverifiedEmail,
    resendStatus,
    isResending,
    modalOpen,
    modalMessage,
    modalType,
    modalShowConfirm,
    modalOnConfirm,
    state,
    simSpeed,
    boostTimeLeft,
    claimCooldownText
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppContextProvider');
  }
  return context;
};
