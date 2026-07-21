import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Globe,
  Bell,
  Crown,
  Coins,
  Eye,
  EyeOff,
  ArrowDown,
  ArrowUp,
  ArrowRightLeft,
  Star,
  Users,
  Ticket,
  Cpu,
  Gift,
  Network,
  Wallet,
  FileText,
  Award,
  History,
  Home,
  User,
  Landmark,
  Camera,
  Check,
  LogOut,
  Download,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Plus,
  Minus,
  ShoppingCart,
  ShieldCheck,
  HelpCircle,
  Gem,
  Truck,
  FileBadge,
  ArrowUpRight,
  UserCheck,
  UserPlus,
  XCircle,
  X,
  UploadCloud,
  Lock,
  Unlock,
  RotateCcw,
  Settings,
  Info,
  Target,
  Compass,
  MessageCircle,
  MessageSquare,
  Send,
  Briefcase,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Mail,
  Trash2,
  Inbox,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Terminal,
  Activity,
  Server,
  Search,
  Calendar,
  Filter,
  Clock
} from 'lucide-react';
import { AppState, Transaction, Holder, CONFIG, UserAccount, SystemError } from './types';
import { TRANSLATIONS } from './translations';
import WelcomeTicker from './components/WelcomeTicker';
import CompanyLandingPage from './components/CompanyLandingPage';
import CompanyPortal from './components/CompanyPortal';
// @ts-ignore
import goldLogo from './assets/images/gold_logo_icon_1784365650875.jpg';
import Modal from './components/Modal';
const GoldMarketChart = lazy(() => import('./components/GoldMarketChart'));
import Leaderboard from './components/Leaderboard';
import ReferralDashboard from './components/ReferralDashboard';
import HomeSkeleton from './components/HomeSkeleton';
import { HarvestModal } from './components/HarvestModal';
import AdminLayout from './components/admin/AdminLayout';
import AdminRouteLoginForm from './components/admin/AdminRouteLoginForm';
import {
  supabase,
  saveAccountToSupabase,
  fetchAccountsFromSupabase,
  registerUserInSupabase,
  createDepositInSupabase,
  createWithdrawalInSupabase,
  updateProfileImageInSupabase,
  updateUserSettingsInSupabase,
  purchaseContractInSupabase,
  claimWelcomeBonusInSupabase,
  claimDailyRewardInSupabase,
  updatePendingMiningRewardInSupabase,
  resetAllDataInSupabase,
  fetchGlobalConfig,
  saveGlobalConfig,
  updateGlobalConfig,
  uploadProofToSupabaseStorage,
  compressImage
} from './supabase';

// Initial dummy downline holders to populate Network structures
const INITIAL_HOLDERS: Holder[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_SYSTEM_ERRORS: SystemError[] = [
  {
    id: 'err-1',
    timestamp: Date.now() - 3.5 * 3600 * 1000, // 3.5 hours ago
    errorCode: 'ERR-102',
    message: 'Phase regulator jitter detected on EXC-700 active node',
    node: 'EXC-700 South Africa Node',
    severity: 'warning',
    resolved: true,
  },
  {
    id: 'err-2',
    timestamp: Date.now() - 7.2 * 3600 * 1000, // 7.2 hours ago
    errorCode: 'ERR-409',
    message: 'Thermal core anomaly: core temp exceeding 82°C safety threshold',
    node: 'Mali Operational Site L2',
    severity: 'critical',
    resolved: false,
  },
  {
    id: 'err-3',
    timestamp: Date.now() - 14.8 * 3600 * 1000, // 14.8 hours ago
    errorCode: 'ERR-201',
    message: 'Temporary packet drop rate exceeded 15% on satellite link',
    node: 'Tanzania Gateway Node',
    severity: 'warning',
    resolved: true,
  }
];

const SPIN_ITEMS = [
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

export default function App() {
  // --- SYSTEM STATES ---
  const [isSplashScreen, setIsSplashScreen] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('en');
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showLanding, setShowLanding] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [isSyncing, setIsSyncing] = useState(() => {
    try {
      const cached = sessionStorage.getItem('grockgold_accounts_cache_v4');
      return !cached; // If cached, load instantly (stale-while-revalidate), no need to block UI
    } catch (e) {
      return true;
    }
  });
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [ecoSearch, setEcoSearch] = useState('');

  // --- MULTI-ACCOUNT AUTH STATES ---
  const [authScreen, setAuthScreen] = useState<'welcome' | 'login' | 'register' | 'forgot' | 'reset-password'>('welcome');
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [globalConfig, setGlobalConfig] = useState<any>({
    pricePerUnit: 180000,
    dailyRewardPercent: 2.0,
    cappingPercent: 250,
    minDeposit: 100000,
    minWithdraw: 100000,
    simulationSpeed: 1,
    botsEnabled: true,
    bankName: 'BCA',
    bankNumber: '0562167917',
    bankHolder: 'REZAL PRATAMA',
    usdtAddress: '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4'
  });

  // --- REGISTRATION FORM STATES ---
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);

  // --- LOGIN FORM STATES ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // --- FORGOT PASSWORD STATES ---
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // --- CHANGE PASSWORD STATES ---
  const [profileOldPassword, setProfileOldPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');

  // --- LEADERBOARD EXPANDED STATE ---
  const [expandedLeaderboardUser, setExpandedLeaderboardUser] = useState<string | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');

  // --- MODEL MODAL STATES ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');
  const [modalShowConfirm, setModalShowConfirm] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);

  // --- WALLET / CORE INPUTS ---
  const [depositValue, setDepositValue] = useState('');
  const [depositMethod, setDepositMethod] = useState<'bank' | 'crypto'>('bank');
  const [depositProof, setDepositProof] = useState<string | null>(null);
  const [depositProofName, setDepositProofName] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [txFilter, setTxFilter] = useState('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txDateRangeFilter, setTxDateRangeFilter] = useState('all');
  const [contractQty, setContractQty] = useState(1);
  const [loginUser, setLoginUser] = useState('admin');
  const [loginPass, setLoginPass] = useState('admin123');

  // --- CUSTOM WITHDRAW MODAL STATES ---
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('BCA');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  // --- CUSTOM TRANSFER MODAL STATES ---
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');

  // --- BANK ACCOUNT EDIT STATES ---
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankNameInput, setBankNameInput] = useState('BCA');
  const [bankNumberInput, setBankNumberInput] = useState('');
  const [bankHolderInput, setBankHolderInput] = useState('');
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);

  // --- CUSTOM HARVEST MODAL STATE ---
  const [harvestModalOpen, setHarvestModalOpen] = useState(false);
  const [showBonusSchemaModal, setShowBonusSchemaModal] = useState(false);

  // --- DAILY CLAIM SERVER TIME OFFSET ---
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  // --- LUCKY SPIN STATES ---
  const [luckySpinModalOpen, setLuckySpinModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinPrizeIndex, setSpinPrizeIndex] = useState<number | null>(null);

  // --- MISSION STATES ---
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  const [claimedMissionsHistory, setClaimedMissionsHistory] = useState<Array<{ id: string; title: string; reward: number; timestamp: number }>>([
    { id: 'hist_1', title: 'Registrasi Akun Berhasil', reward: 10000, timestamp: Date.now() - 3600000 * 48 },
    { id: 'hist_2', title: 'Verifikasi Keamanan Dasar', reward: 5000, timestamp: Date.now() - 3600000 * 24 }
  ]);
  const [dailyTaskCheck, setDailyTaskCheck] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [dailyTaskVisit, setDailyTaskVisit] = useState(false);
  const [dailyTaskClaimed, setDailyTaskClaimed] = useState(false);

  // --- INTEGRATED SHORTCUTS STATES ---
  const [spinTickets, setSpinTickets] = useState(5);
  const [spinCount, setSpinCount] = useState(0);
  const [sharedReferral, setSharedReferral] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedUSDT, setCopiedUSDT] = useState(false);
  const [luckySpinHistory, setLuckySpinHistory] = useState<Array<{ id: string; prize: string; date: number; success: boolean }>>([
    { id: '1', prize: 'Rp 15.000', date: Date.now() - 3600000 * 2.5, success: true },
    { id: '2', prize: 'Boost 5x', date: Date.now() - 3600000 * 5, success: true },
    { id: '3', prize: 'ZONK', date: Date.now() - 3600000 * 12, success: false }
  ]);
  const [communityMessages, setCommunityMessages] = useState<Array<{ id: string; user: string; text: string; time: string; initials: string; isSelf?: boolean }>>([
    { id: 'm1', user: 'rudi_gold', text: 'Klaim bonus Rp 1.8M beneran cair gan! Mantul bener rujukan target tercapai langsung landing!', time: '14:20', initials: 'RG' },
    { id: 'm2', user: 'mining_boss', text: 'Baru WD Rp 500rb instan langsung masuk rekening BCA 👍 Rekomendasi banget nih platform.', time: '14:22', initials: 'MB' },
    { id: 'm3', user: 'grock_global', text: 'West Africa mining server hashing rate is super stable. Got my hourly bonus on time!', time: '14:25', initials: 'GG' },
    { id: 'm4', user: 'santi_lestari', text: 'Ada yang dapet jackpot dari Lucky Spin hari ini? Kemarin dapet Rp 50.000 lumayan buat nambah hashrate.', time: '14:30', initials: 'SL' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [leaderboardCategory, setLeaderboardCategory] = useState<'investor' | 'referral' | 'contract' | 'profit'>('investor');
  const [missionActiveTab, setMissionActiveTab] = useState<'daily' | 'weekly' | 'achievement'>('daily');

  // --- SIMULATION SETTINGS ---
  const [simSpeed, setSimSpeed] = useState(1); // multiplier (1x, 5x, 25x, 100x)
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  const [showBoosterRipple, setShowBoosterRipple] = useState(false);

  // --- SYSTEM DIAGNOSTICS STATES ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [errorFilter, setErrorFilter] = useState<'all' | 'active' | 'critical' | 'resolved'>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // --- APP STATE ---
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

  // --- COOLDOWN COUNTERS ---
  const [claimCooldownText, setClaimCooldownText] = useState('');

  const t = TRANSLATIONS[language];
  const tAuth = TRANSLATIONS['en'];

  // --- ASYNC BACKGROUND SYNC FROM SUPABASE ---
  const syncFromSupabase = async () => {
    setIsSyncing(true);
    try {
      const config = await fetchGlobalConfig();
      if (config) {
        setGlobalConfig(config);
        updateGlobalConfig(config);
      }

      // Re-verify current active logged-in user first to query only their data
      const { data: { session } } = await supabase.auth.getSession();
      let loggedInUsername = localStorage.getItem('grockgold_logged_in_username_v4');
      const isBypassed = true; // Permanently bypassed verification as requested by user

      if (session?.user) {
        if (session.user.email?.toLowerCase() === 'admin@grockgold.com') {
          loggedInUsername = 'admin';
        } else {
          // Mandate email verification check for normal users (only if not bypassed)
          if (!session.user.email_confirmed_at && !isBypassed) {
            console.warn('Session found for unverified email on startup. Signing out.');
            setUnverifiedEmail(session.user.email || null);
            await supabase.auth.signOut();
            localStorage.removeItem('grockgold_logged_in_username_v4');
            loggedInUsername = null;
          } else if (session.user.user_metadata?.username) {
            loggedInUsername = session.user.user_metadata.username;
          }
        }
      } else {
        // If no active Supabase Auth session, only clear the local session if NOT bypassed
        if (!isBypassed) {
          loggedInUsername = null;
        }
      }

      const supabaseAccounts = await fetchAccountsFromSupabase(loggedInUsername || undefined);
      if (supabaseAccounts) {
        setSupabaseError(null);
        setAccounts(supabaseAccounts);
        try {
          sessionStorage.setItem('grockgold_accounts_cache_v4', 'true');
        } catch (e) {
          console.warn('sessionStorage setItem failed:', e);
        }

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
            if (found.settings?.spinTickets !== undefined) setSpinTickets(found.settings.spinTickets);
            if (found.settings?.spinCount !== undefined) setSpinCount(found.settings.spinCount);
            if (found.settings?.luckySpinHistory !== undefined) setLuckySpinHistory(found.settings.luckySpinHistory);
            if (found.settings?.claimedMissions !== undefined) setClaimedMissions(found.settings.claimedMissions);
            if (found.settings?.claimedMissionsHistory !== undefined) setClaimedMissionsHistory(found.settings.claimedMissionsHistory);
            if (found.settings?.dailyTaskVisit !== undefined) setDailyTaskVisit(found.settings.dailyTaskVisit);
            if (found.settings?.dailyTaskClaimed !== undefined) setDailyTaskClaimed(found.settings.dailyTaskClaimed);
            if (found.settings?.dailyTaskCheck !== undefined) setDailyTaskCheck(found.settings.dailyTaskCheck);
          }
        }
      } else {
        setSupabaseError('Database returned empty or null user records.');
      }
    } catch (err: any) {
      console.warn('Supabase not fully configured yet or schema missing.', err);
      setSupabaseError(err?.message || 'Failed to connect to Supabase database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // --- FETCH SECURE SERVER TIME ---
  useEffect(() => {
    const fetchServerTime = () => {
      fetch('/api/time')
        .then(r => r.json())
        .then(data => {
          if (data && typeof data.serverTime === 'number') {
            const offset = data.serverTime - Date.now();
            setServerTimeOffset(offset);
            console.log('[Time Sync] Calculated server time offset:', offset);
          }
        })
        .catch(err => {
          console.error('[Time Sync] Error fetching server time:', err);
        });
    };
    
    fetchServerTime();
    // Refresh server time every 5 minutes to keep drift-free accuracy
    const timeInterval = setInterval(fetchServerTime, 5 * 60 * 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- LOCK BODY SCROLL FOR TRANSACTIONS VIEW ---
  useEffect(() => {
    if (currentTab === 'transactions') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [currentTab]);

  // --- LOAD PERSISTENT STATE & SETUP REALTIME ---
  useEffect(() => {
    // Initial Sync
    syncFromSupabase();

    // Setup debounced and filtered sync to avoid reloading too much data on every change
    let syncTimeout: NodeJS.Timeout | null = null;
    const debouncedSync = () => {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        syncFromSupabase();
      }, 200);
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

    // Setup Realtime PostgreSQL Changes listener for the 5 relational tables
    const dbChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, handlePayload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, handlePayload)
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(dbChannel);
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }, []);

  // --- PARSE REFERRAL PARAMETER FROM URL ---
  useEffect(() => {
    // Clear legacy massive storage keys to instantly resolve QuotaExceededError and free up browser storage
    try {
      localStorage.removeItem('grockgold_accounts_v4');
      localStorage.removeItem('grockgold_state_v4');
      localStorage.removeItem('grockgold_accounts');
      localStorage.removeItem('grockgold_state');
    } catch (e) {
      console.warn("Error cleaning legacy storage keys", e);
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setAuthScreen('register');
        setRegReferralCode(refParam.trim());
      }
    } catch (e) {
      console.error("Error reading URL referral parameters", e);
    }
  }, []);

  // --- DETECT PASSWORD RECOVERY REDIRECT ---
  useEffect(() => {
    const hash = window.location.hash || '';
    const isRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token=');
    const isResetPath = window.location.pathname === '/reset-password';

    if (isResetPath || isRecoveryHash) {
      setAuthScreen('reset-password');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthScreen('reset-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --- SAVE STATE WRAPPER (IN-MEMORY ONLY TO PREVENT STUTTERING) ---
  // To solve lag (patah-patah) caused by frequent synchronous disk writes (1s ticks),
  // we decouple React state updates from synchronous localStorage I/O.
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

  // Immediate save helper for critical actions (e.g., login, register, purchases, claims, top-ups)
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
                spinTickets,
                spinCount,
                luckySpinHistory,
                claimedMissions,
                claimedMissionsHistory,
                dailyTaskVisit,
                dailyTaskClaimed,
                dailyTaskCheck,
              }
            };
            saveAccountToSupabase(updatedAcc);
            return updatedAcc;
          }
          return acc;
        });
        return updatedAccounts;
      });
    } catch (e) {
      console.error('Error in immediate save', e);
    }
  };

  // --- DEBOUNCED PERSISTENCE TO SUPABASE ---
  // Periodically saves background ticking yields to database without blocking the UI thread.
  useEffect(() => {
    if (!state.isLoggedIn || !currentAccount) return;

    saveTimeoutRef.current = setTimeout(() => {
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
                  spinTickets,
                  spinCount,
                  luckySpinHistory,
                  claimedMissions,
                  claimedMissionsHistory,
                  dailyTaskVisit,
                  dailyTaskClaimed,
                  dailyTaskCheck,
                }
              };
              saveAccountToSupabase(updatedAcc);
              return updatedAcc;
            }
            return acc;
          });
          return updatedAccounts;
        });
      } catch (e) {
        console.error('Error saving state to database', e);
      }
    }, 4000); // Debounce write by 4 seconds (extremely smooth UI!)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    state,
    currentAccount,
    language,
    spinTickets,
    spinCount,
    luckySpinHistory,
    claimedMissions,
    claimedMissionsHistory,
    dailyTaskVisit,
    dailyTaskClaimed,
    dailyTaskCheck
  ]);

  // --- SPLASH SCREEN LOGIC ---
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

  // --- BOOST COUNTDOWN TIMER ---
  useEffect(() => {
    if (boostTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setBoostTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [boostTimeLeft]);

  // --- TICKING EXTRACTION CORE LOOP ---
  useEffect(() => {
    if (!state.isLoggedIn || isSplashScreen) return;

    const timer = setInterval(() => {
      // Calculate earnings and check capping limits
      const totalPortfolio = state.activeContracts * CONFIG.PRICE_PER_UNIT;
      const maxAllowed = totalPortfolio * CONFIG.CAPPING_PERCENT;
      const currentCappingEarnings = (state.transactions || [])
        .filter(t => t.type === 'reward' || t.type === 'referral' || t.type === 'rebate')
        .reduce((sum, item) => sum + item.amount, 0);
      const isCapped = currentCappingEarnings >= maxAllowed;

      // Active boost speeds up hashing cycles by 1.5x
      const activeBoostMult = boostTimeLeft > 0 ? 1.5 : 1.0;

      if (state.activeContracts > 0 && !isCapped) {
        updateState(prev => {
          let nextCycle = prev.cyclePercent + 1.5 * simSpeed * activeBoostMult;
          let addedGold = 0;

          if (nextCycle >= 100) {
            nextCycle = nextCycle % 100;
            // Add a realistic trace amount of gold per active contract unit
            addedGold = (0.0003 + Math.random() * 0.0007) * prev.activeContracts * simSpeed * activeBoostMult;
          }

          const now = Date.now();
          const lastUpdate = prev.lastGoldUpdateTime || now;

          let nextDaily = prev.goldProductionDaily || 0;
          let nextWeekly = prev.goldProductionWeekly || 0;
          let nextMonthly = prev.goldProductionMonthly || 0;

          if (!isSameDay(now, lastUpdate)) {
            nextDaily = 0;
          }
          if (!isSameWeek(now, lastUpdate)) {
            nextWeekly = 0;
          }
          if (!isSameMonth(now, lastUpdate)) {
            nextMonthly = 0;
          }

          if (addedGold > 0) {
            nextDaily += addedGold;
            nextWeekly += addedGold;
            nextMonthly += addedGold;
          }

          // Calculate daily yield per second (4% daily rate / 86400 seconds)
          const dailyYieldSec = (prev.activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.DAILY_REWARD_PERCENT) / 86400;
          const increment = dailyYieldSec * simSpeed * activeBoostMult;

          // Ensure we don't exceed the capping ceiling
          const currentTotalPortfolio = prev.activeContracts * CONFIG.PRICE_PER_UNIT;
          const currentMaxAllowed = currentTotalPortfolio * CONFIG.CAPPING_PERCENT;
          const prevMiningProfit = (prev.transactions || [])
            .filter(t => t.type === 'reward')
            .reduce((sum, item) => sum + item.amount, 0);
          const prevReferralReward = (prev.transactions || [])
            .filter(t => t.type === 'referral')
            .reduce((sum, item) => sum + item.amount, 0);
          const prevRebateReward = (prev.transactions || [])
            .filter(t => t.type === 'rebate')
            .reduce((sum, item) => sum + item.amount, 0);
          const prevCappingEarnings = prevMiningProfit + prevReferralReward + prevRebateReward;
          const currentEarnedTotal = prevCappingEarnings + prev.pendingMiningReward;

          let addedReward = increment;
          if (currentEarnedTotal + increment > currentMaxAllowed) {
            addedReward = Math.max(0, currentMaxAllowed - currentEarnedTotal);
          }

          const nextPending = prev.pendingMiningReward + addedReward;

          // Auto Reinvest simulation if enabled and meets price per unit
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

  // --- REWARD CLAIM COUNTDOWN TIMER ---
  useEffect(() => {
    const timer = setInterval(() => {
      if (state.lastClaimTime === 0) {
        setClaimCooldownText('');
        return;
      }
      const now = Date.now() + serverTimeOffset;
      const elapsed = now - state.lastClaimTime;
      if (elapsed >= CONFIG.CLAIM_COOLDOWN) {
        setClaimCooldownText('');
      } else {
        const remainingMs = CONFIG.CLAIM_COOLDOWN - elapsed;
        const hours = Math.floor(remainingMs / 3600000);
        const minutes = Math.floor((remainingMs % 3600000) / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        const pad = (num: number) => String(num).padStart(2, '0');
        setClaimCooldownText(
          `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state.lastClaimTime, serverTimeOffset]);

  // --- HELPER METRICS ---
  // --- DYNAMIC WALLET METRICS (PERFECTLY SYNCHRONIZED WITH THE DATABASE TRANSACTIONS) ---
  const miningProfit = (state.transactions || [])
    .filter(t => t.type === 'reward')
    .reduce((sum, item) => sum + item.amount, 0);

  const referralReward = (state.transactions || [])
    .filter(t => t.type === 'referral')
    .reduce((sum, item) => sum + item.amount, 0);

  const rebateReward = (state.transactions || [])
    .filter(t => t.type === 'rebate')
    .reduce((sum, item) => sum + item.amount, 0);

  const bonusReward = (state.transactions || [])
    .filter(t => t.type === 'welcome_bonus' || t.type === 'bonus')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalEarned = miningProfit + referralReward + rebateReward + bonusReward;

  const totalWithdraw = (state.transactions || [])
    .filter(t => {
      if (t.type !== 'withdraw') return false;
      const stat = (t.status || '').toLowerCase();
      return stat !== 'pending' && stat !== 'processing' && stat !== 'rejected' && stat !== 'failed';
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDeposit = (state.transactions || [])
    .filter(t => {
      if (t.type !== 'deposit') return false;
      const stat = (t.status || '').toLowerCase();
      return stat !== 'pending' && stat !== 'processing' && stat !== 'rejected' && stat !== 'failed';
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPortfolioValue = state.activeContracts * CONFIG.PRICE_PER_UNIT;
  const maxPossibleEarnings = totalPortfolioValue * CONFIG.CAPPING_PERCENT;
  const cappingEarnings = miningProfit + referralReward + rebateReward;
  const cappingRatio = maxPossibleEarnings > 0 ? Math.min((cappingEarnings / maxPossibleEarnings) * 100, 100) : 0;
  const cappingRatioVisual = cappingEarnings > 0 ? Math.max(0.1, cappingRatio) : 0;
  const cappingPercentStr = cappingEarnings > 0 && cappingRatio < 0.01 ? "0.01" : cappingRatio.toFixed(2);
  const isCappedLimitMet = cappingEarnings >= maxPossibleEarnings && maxPossibleEarnings > 0;
  const dailyYield = totalPortfolioValue * CONFIG.DAILY_REWARD_PERCENT;

  // Booster Cooldown Helpers (24 hours cooldown)
  const boosterCooldownPeriod = 24 * 60 * 60 * 1000;
  const boosterElapsed = state.lastBoostTime ? Date.now() - state.lastBoostTime : boosterCooldownPeriod;
  const boosterCooldownActive = boosterElapsed < boosterCooldownPeriod;
  const boosterRemainingMs = Math.max(0, boosterCooldownPeriod - boosterElapsed);
  
  const boosterHrs = Math.floor(boosterRemainingMs / (60 * 60 * 1000));
  const boosterMins = Math.floor((boosterRemainingMs % (60 * 60 * 1000)) / (60 * 1000));
  const boosterSecs = Math.floor((boosterRemainingMs % (60 * 1000)) / 1000);
  
  const boosterCooldownStr = `${boosterHrs}j ${boosterMins}m ${boosterSecs}s`;

  // Dynamic Referral & Downline Calculations based on registered accounts (memoized to prevent performance drain on 1s tick renders)
  const {
    directDownlines,
    level1Usernames,
    level2Downlines,
    level2Usernames,
    level3Downlines,
    l1Count,
    l2Count,
    l3Count,
    totalDownlinesCount,
    l1Contracts,
    l2Contracts,
    l3Contracts,
    totalDownlineContracts,
    activeDownlinesCount,
    teamVolumeValue,
    activeHolders,
    networkActiveCount,
    bonusProgressRatio,
    canClaimWelcomeBonus,
  } = React.useMemo(() => {
    const direct = accounts.filter(
      acc =>
        acc.invitedBy &&
        currentAccount &&
        acc.invitedBy.toLowerCase() === currentAccount.username.toLowerCase()
    );
    const l1Usernames = direct.map(acc => acc.username.toLowerCase());
    const l2 = accounts.filter(
      acc => acc.invitedBy && l1Usernames.includes(acc.invitedBy.toLowerCase())
    );
    const l2Usernames = l2.map(acc => acc.username.toLowerCase());
    const l3 = accounts.filter(
      acc => acc.invitedBy && l2Usernames.includes(acc.invitedBy.toLowerCase())
    );

    const l1C = direct.length;
    const l2C = l2.length;
    const l3C = l3.length;
    const totalDownlinesC = l1C + l2C + l3C;

    const l1Contracts = direct.reduce(
      (sum, acc) => sum + (acc.state?.activeContracts || 0),
      0
    );
    const l2Contracts = l2.reduce(
      (sum, acc) => sum + (acc.state?.activeContracts || 0),
      0
    );
    const l3Contracts = l3.reduce(
      (sum, acc) => sum + (acc.state?.activeContracts || 0),
      0
    );
    const totalDownlineContracts = l1Contracts + l2Contracts + l3Contracts;

    const activeDownlinesCount = [
      ...direct,
      ...l2,
      ...l3
    ].filter(acc => (acc.state?.activeContracts || 0) > 0).length;

    const teamVolumeValue = totalDownlineContracts * CONFIG.PRICE_PER_UNIT;

    const activeHolders = direct.filter(acc => {
      // 1. Mendaftar Menggunakan Kode Referral (Guaranteed because we filter direct which has invitedBy equal to currentAccount.username)
      
      // 2. Akun Berstatus Aktif (Tidak diblokir/dinonaktifkan/akun palsu)
      const isBlocked = 
        (acc as any).isBanned || 
        (acc as any).blocked || 
        (acc as any).status === 'blocked' || 
        (acc.state as any)?.isBanned || 
        (acc.state as any)?.status === 'blocked' ||
        (acc.state?.systemErrors || []).some(err => err.errorCode === 'BLOCKED' || err.errorCode === 'BANNED');
      if (isBlocked) return false;

      // 3. Memiliki Kepemilikan Kontrak atau Deposit Minimum
      const hasContract = (acc.state?.activeContracts || 0) >= CONFIG.MIN_CONTRACT_PER_HOLDER;
      const hasMinDeposit = (acc.state?.transactions || []).some(
        t => t.type === 'deposit' && t.amount >= CONFIG.MIN_DEPOSIT
      );

      return hasContract || hasMinDeposit;
    });
    const networkActiveCount = activeHolders.length;

    const bonusProgressRatio = Math.min(
      (networkActiveCount / CONFIG.REQUIRED_HOLDERS) * 100,
      100
    );
    const canClaimWelcomeBonus =
      networkActiveCount >= CONFIG.REQUIRED_HOLDERS &&
      !state.welcomeBonusClaimed;

    return {
      directDownlines: direct,
      level1Usernames: l1Usernames,
      level2Downlines: l2,
      level2Usernames: l2Usernames,
      level3Downlines: l3,
      l1Count: l1C,
      l2Count: l2C,
      l3Count: l3C,
      totalDownlinesCount: totalDownlinesC,
      l1Contracts,
      l2Contracts,
      l3Contracts,
      totalDownlineContracts,
      activeDownlinesCount,
      teamVolumeValue,
      activeHolders,
      networkActiveCount,
      bonusProgressRatio,
      canClaimWelcomeBonus,
    };
  }, [accounts, currentAccount, state.welcomeBonusClaimed]);

  // --- LEADERBOARD CALCULATION ---
  const leaderboardData = React.useMemo(() => {
    // Only display real registered users (exclude 'admin' from the leaderboard)
    const filteredAccounts = accounts.filter(u => u.username.toLowerCase() !== 'admin');
    const mapped = filteredAccounts.map(u => {
      const isSelf = currentAccount && u.username.toLowerCase() === currentAccount.username.toLowerCase();
      const activeState = isSelf ? state : u.state;

      const l1 = accounts.filter(
        acc =>
          acc.invitedBy &&
          acc.invitedBy.toLowerCase() === u.username.toLowerCase()
      );
      const l1Usernames = l1.map(acc => acc.username.toLowerCase());

      const l2 = accounts.filter(
        acc =>
          acc.invitedBy && l1Usernames.includes(acc.invitedBy.toLowerCase())
      );
      const l2Usernames = l2.map(acc => acc.username.toLowerCase());

      const l3 = accounts.filter(
        acc =>
          acc.invitedBy && l2Usernames.includes(acc.invitedBy.toLowerCase())
      );

      const l1Contracts = l1.reduce(
        (sum, acc) => sum + (acc.state?.activeContracts || 0),
        0
      );
      const l2Contracts = l2.reduce(
        (sum, acc) => sum + (acc.state?.activeContracts || 0),
        0
      );
      const l3Contracts = l3.reduce(
        (sum, acc) => sum + (acc.state?.activeContracts || 0),
        0
      );

      const totalContracts = l1Contracts + l2Contracts + l3Contracts;
      const teamVolume = totalContracts * CONFIG.PRICE_PER_UNIT;

      const goldAllTime = activeState?.goldProduction || 0;
      const goldDaily = activeState?.goldProductionDaily || 0;
      const goldWeekly = activeState?.goldProductionWeekly || 0;
      const goldMonthly = activeState?.goldProductionMonthly || 0;

      const vipLevel = (activeState?.activeContracts || 0) >= 50 ? 5 :
                       (activeState?.activeContracts || 0) >= 25 ? 4 :
                       (activeState?.activeContracts || 0) >= 10 ? 3 :
                       (activeState?.activeContracts || 0) >= 5 ? 2 :
                       (activeState?.activeContracts || 0) >= 1 ? 1 : 0;

      return {
        username: u.username,
        fullName: u.fullName,
        teamVolume,
        totalMembers: l1.length + l2.length + l3.length,
        totalContracts,
        directReferrals: l1.length,
        totalCommissionEarned: (activeState?.referralEarned || 0) + (activeState?.rebateEarned || 0),
        activeContracts: activeState?.activeContracts || 0,
        totalEarned: activeState?.totalEarned || 0,
        createdAt: u.createdAt || Date.now(),
        goldAllTime,
        goldDaily,
        goldWeekly,
        goldMonthly,
        vipLevel,
        profileImage: activeState?.profileImage || null,
      };
    });

    return [...mapped].sort((a, b) => {
      const valA = a.goldAllTime;
      const valB = b.goldAllTime;
      if (valB !== valA) {
        return valB - valA;
      }
      return a.createdAt - b.createdAt;
    });
  }, [accounts, state, currentAccount]);

  const currentAccountRankIndex = React.useMemo(() => {
    if (!currentAccount) return -1;
    return leaderboardData.findIndex(
      entry => entry.username.toLowerCase() === currentAccount.username.toLowerCase()
    );
  }, [leaderboardData, currentAccount]);

  const currentAccountRank = currentAccountRankIndex !== -1 ? currentAccountRankIndex + 1 : null;

  // --- ALERT / MODAL WRAPPERS ---
  const triggerModal = (
    msg: string,
    type: 'success' | 'danger' | 'warning' | 'info' = 'info',
    showConfirm = false,
    onConfirmFn?: () => void
  ) => {
    setModalMessage(msg);
    setModalType(type);
    setModalShowConfirm(showConfirm);
    setModalOnConfirm(() => onConfirmFn);
    setModalOpen(true);
  };

  // --- ACTIONS ---
  const toggleLanguage = () => {
    const nextLang = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
    localStorage.setItem('grockgold_lang', nextLang);

    // Sync to active account settings
    if (state.isLoggedIn && currentAccount) {
      setAccounts(prevAccounts => {
        const updatedAccounts = prevAccounts.map(acc => {
          if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
            return {
              ...acc,
              settings: {
                ...acc.settings,
                language: nextLang,
              }
            };
          }
          return acc;
        });
        return updatedAccounts;
      });
    }
  };

  const handleSendResetLink = async () => {
    const email = forgotEmail.trim();
    if (!email) {
      triggerModal(language === 'id' ? '❌ Silakan masukkan email Anda!' : '❌ Please enter your email!', 'warning');
      return;
    }

    setIsForgotLoading(true);
    try {
      // 1. Verify if the email is associated with an account in our custom db
      const { data: dbUser, error: dbErr } = await supabase
        .from('users')
        .select('username, password, email')
        .eq('email', email)
        .maybeSingle();

      if (dbErr) {
        console.warn('Database verify warning:', dbErr.message);
      }

      if (!dbUser) {
        triggerModal(language === 'id' ? '❌ Email tidak terdaftar dalam catatan kami!' : '❌ Email is not registered in our records!', 'danger');
        setIsForgotLoading(false);
        return;
      }

      // 2. Ensure they are signed up in Supabase Auth on-the-fly with their current password if not already there
      try {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
        await supabase.auth.signUp({
          email: dbUser.email,
          password: dbUser.password,
          options: {
            emailRedirectTo: currentOrigin
          }
        });
      } catch (signupErr) {
        // Safe to ignore if already signed up/exists
      }

      // 3. Trigger Supabase reset password
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
      const redirectToUrl = `${currentOrigin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl
      });

      if (error) {
        throw error;
      }

      triggerModal(
        language === 'id' 
          ? '🎉 Tautan pemulihan kata sandi telah dikirim ke email Anda!' 
          : '🎉 A password recovery link has been sent to your email address!', 
        'success'
      );
      setForgotEmail('');
      setAuthScreen('login');
    } catch (err: any) {
      console.error('Password reset failed:', err);
      triggerModal(language === 'id' ? `❌ Gagal mengirim tautan reset: ${err.message}` : `❌ Failed to send reset link: ${err.message}`, 'danger');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const newPass = resetNewPassword;
    const confirmPass = resetConfirmPassword;

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

    setIsResetLoading(true);
    try {
      // 1. Update Supabase Auth user password
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) {
        throw error;
      }

      // 2. Identify who the current authenticated user is to update their password in the custom table
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { error: dbErr } = await supabase
          .from('users')
          .update({ password: newPass })
          .eq('email', user.email);

        if (dbErr) {
          console.error('Failed to update public.users password:', dbErr);
        }
      }

      // 3. Clear auth session so they can login cleanly with custom flow
      await supabase.auth.signOut();

      // 4. Trigger Modal & Clean URL
      triggerModal(
        language === 'id' 
          ? '✅ Kata sandi berhasil diperbarui! Silakan masuk.' 
          : '✅ Password updated successfully! Please login with your new credentials.', 
        'success'
      );

      // Clean path and hash from URL
      window.history.replaceState(null, '', window.location.origin + '/');

      // Clear state and switch screen
      setResetNewPassword('');
      setResetConfirmPassword('');
      setAuthScreen('login');
    } catch (err: any) {
      console.error('Failed updating password:', err);
      triggerModal(language === 'id' ? `❌ Gagal memperbarui kata sandi: ${err.message}` : `❌ Failed to update password: ${err.message}`, 'danger');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) {
      triggerModal(language === 'id' ? '❌ Tidak ada alamat email yang ditemukan untuk dikirim ulang!' : '❌ No email address found to resend!', 'danger');
      return;
    }

    setIsResending(true);
    setResendStatus(null);
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail,
        options: {
          emailRedirectTo: currentOrigin
        }
      });

      if (error) {
        throw error;
      }

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

  const handleLogin = async () => {
    const ident = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword;

    if (!ident || !pass) {
      triggerModal(language === 'id' ? '❌ Harap isi semua kolom!' : '❌ Please fill in all fields!', 'warning');
      return;
    }

    const found = accounts.find(acc => acc.username.toLowerCase() === ident || acc.email.toLowerCase() === ident);
    if (!found) {
      triggerModal(language === 'id' ? '❌ Akun tidak ditemukan!' : '❌ Account not found!', 'danger');
      return;
    }

    if (found.password !== pass) {
      triggerModal(language === 'id' ? '❌ Kata sandi salah!' : '❌ Incorrect password!', 'danger');
      return;
    }

    // Reset unverifiedEmail state first
    setUnverifiedEmail(null);
    setResendStatus(null);

    // Sign in to Supabase Auth on-the-fly to establish safe session
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: found.email,
        password: found.password
      });

      if (signInError) {
        if (signInError.message?.toLowerCase().includes('email not confirmed') || signInError.message?.toLowerCase().includes('confirm your email')) {
          console.warn('Supabase Auth unconfirmed email - bypassing check.');
          localStorage.setItem('grockgold_bypass_verification_v4', 'true');
        } else if (signInError.message?.includes('Invalid login credentials') || signInError.message?.includes('User not found')) {
          try {
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://grok-gold-drab.vercel.app';
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: found.email,
              password: found.password,
              options: {
                emailRedirectTo: currentOrigin,
                data: {
                  username: found.username,
                  full_name: found.fullName
                }
              }
            });

            if (signUpData?.user && !signUpData.user.email_confirmed_at && found.username.toLowerCase() !== 'admin') {
              console.warn('Supabase Auth signUp created unconfirmed user - bypassing check.');
              localStorage.setItem('grockgold_bypass_verification_v4', 'true');
            }

            await supabase.auth.signInWithPassword({
              email: found.email,
              password: found.password
            });
          } catch (signUpErr) {
            console.warn('Optional on-the-fly Supabase Auth signup failed:', signUpErr);
          }
        } else {
          console.warn('Supabase Auth login warning:', signInError.message);
        }
      }

      // Check if user has confirmed email (skip check for Admin treasury account)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && found.username.toLowerCase() !== 'admin' && user.email?.toLowerCase() !== 'admin@grockgold.com') {
        if (!user.email_confirmed_at) {
          console.warn('User email is unconfirmed - bypassing check.');
          localStorage.setItem('grockgold_bypass_verification_v4', 'true');
        }
      }
    } catch (authErr) {
      console.warn('Supabase Auth execution failed:', authErr);
    }

    setCurrentAccount(found);

    if (rememberMe) {
      localStorage.setItem('grockgold_logged_in_username_v4', found.username);
    } else {
      localStorage.removeItem('grockgold_logged_in_username_v4');
    }

    setState({
      ...found.state,
      isLoggedIn: true,
    });

    if (found.settings?.language) {
      setLanguage(found.settings.language);
    }

    triggerModal(t.successLogin, 'success');
    setCurrentTab('home');
  };

  const handleBypassVerification = () => {
    if (!unverifiedEmail) return;
    
    // Find account by email
    const found = accounts.find(acc => acc.email.toLowerCase() === unverifiedEmail.toLowerCase());
    if (!found) {
      triggerModal(language === 'id' ? '❌ Akun tidak ditemukan!' : '❌ Account not found!', 'danger');
      return;
    }
    
    // Set bypass flag
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
    
    // Reset unverified email state
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

    // Reset user-specific States
    setSpinTickets(5);
    setSpinCount(0);
    setLuckySpinHistory([
      { id: '1', prize: 'Rp 15.000', date: Date.now() - 3600000 * 2.5, success: true },
      { id: '2', prize: 'Boost 5x', date: Date.now() - 3600000 * 5, success: true },
      { id: '3', prize: 'ZONK', date: Date.now() - 3600000 * 12, success: false }
    ]);
    setClaimedMissions([]);
    setClaimedMissionsHistory([
      { id: 'hist_1', title: 'Registrasi Akun Berhasil', reward: 10000, timestamp: Date.now() - 3600000 * 48 },
      { id: 'hist_2', title: 'Verifikasi Keamanan Dasar', reward: 5000, timestamp: Date.now() - 3600000 * 24 }
    ]);
    setDailyTaskVisit(false);
    setDailyTaskClaimed(false);
    setDailyTaskCheck(false);

    setIsSidebarOpen(false);
    triggerModal(language === 'id' ? 'Keluar berhasil.' : 'Sign out successfully.', 'warning');
    setAuthScreen('welcome');
    setShowLanding(false);
    setCurrentTab('home');
  };

  const handleRegister = () => {
    const fullName = regFullName.trim().toUpperCase();
    const username = regUsername.trim().replace(/\s+/g, '');
    const email = regEmail.trim();
    const phone = regPhone.trim();
    const password = regPassword;
    const confirmPassword = regConfirmPassword;
    const refCode = regReferralCode.trim();

    if (!fullName || !username || !email || !phone || !password || !confirmPassword) {
      triggerModal(language === 'id' ? '❌ Semua field wajib diisi kecuali Kode Referral!' : '❌ All fields are mandatory except Referral Code!', 'warning');
      return;
    }

    if (username.length < 3) {
      triggerModal(language === 'id' ? '❌ Username minimal 3 karakter!' : '❌ Username must be at least 3 characters!', 'warning');
      return;
    }

    if (accounts.some(acc => acc.username.toLowerCase() === username.toLowerCase())) {
      triggerModal(language === 'id' ? '❌ Username sudah terdaftar!' : '❌ Username is already registered!', 'danger');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerModal(language === 'id' ? '❌ Format email tidak valid!' : '❌ Invalid email format!', 'warning');
      return;
    }

    if (accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
      triggerModal(language === 'id' ? '❌ Email sudah terdaftar!' : '❌ Email is already registered!', 'danger');
      return;
    }

    if (password.length < 8) {
      triggerModal(language === 'id' ? '❌ Password minimal 8 karakter!' : '❌ Password must be at least 8 characters!', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      triggerModal(language === 'id' ? '❌ Password dan Konfirmasi Password harus sama!' : '❌ Password and Confirm Password must match!', 'danger');
      return;
    }

    if (!regAgreed) {
      triggerModal(language === 'id' ? '❌ Anda harus menyetujui Syarat & Ketentuan!' : '❌ You must agree to the Terms & Conditions!', 'warning');
      return;
    }

    // Generate next sequential Member ID format GGM-0001, GGM-0002, etc.
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
    let foundSponsor: UserAccount | null = null;

    if (refCode) {
      const sponsor = accounts.find(acc => acc.username.toLowerCase() === refCode.toLowerCase() || acc.referralCode.toLowerCase() === refCode.toLowerCase());
      if (sponsor) {
        sponsorUsername = sponsor.username;
        foundSponsor = sponsor;
      } else {
        triggerModal(
          language === 'id' ? '❌ Invalid Referral Code (Kode referral tidak valid!)' : '❌ Invalid Referral Code!',
          'danger'
        );
        return;
      }
    }

    const defaultUserState: AppState = {
      mainBalance: 0,
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
      password,
      referralCode: personalReferralCode,
      invitedBy: sponsorUsername,
      createdAt: Date.now(),
      state: defaultUserState,
      settings: {
        language: language,
        notificationsEnabled: true,
        autoReinvest: false,
      }
    };

    registerUserInSupabase(newAccount).then(success => {
      if (success) {
        setRegFullName('');
        setRegUsername('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegReferralCode('');
        setRegAgreed(false);

        // Auto-bypass verification
        localStorage.setItem('grockgold_bypass_verification_v4', 'true');
        setUnverifiedEmail(null);
        setResendStatus(null);
        triggerModal(
          language === 'id' 
            ? '🎉 Registrasi berhasil! Silakan masuk ke akun Anda.' 
            : '🎉 Registration successful! Please log in to your account.', 
          'success'
        );
        setAuthScreen('login');
      } else {
        triggerModal(language === 'id' ? '❌ Gagal membuat akun. Username atau Email mungkin sudah terdaftar.' : '❌ Failed to create account.', 'danger');
      }
    });
  };

  const handleChangePassword = () => {
    const oldPass = profileOldPassword;
    const newPass = profileNewPassword;
    const confirmNew = profileConfirmPassword;

    if (!oldPass || !newPass || !confirmNew) {
      triggerModal(language === 'id' ? '❌ Semua kolom wajib diisi!' : '❌ All fields are required!', 'warning');
      return;
    }

    if (currentAccount?.password !== oldPass) {
      triggerModal(language === 'id' ? '❌ Kata sandi lama salah!' : '❌ Incorrect old password!', 'danger');
      return;
    }

    if (newPass.length < 8) {
      triggerModal(language === 'id' ? '❌ Password baru minimal 8 karakter!' : '❌ New password must be at least 8 characters!', 'warning');
      return;
    }

    if (newPass !== confirmNew) {
      triggerModal(language === 'id' ? '❌ Konfirmasi kata sandi baru tidak cocok!' : '❌ Confirm new password does not match!', 'danger');
      return;
    }

    const updatedAccounts = accounts.map(acc => {
      if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
        const updated = {
          ...acc,
          password: newPass,
        };
        saveAccountToSupabase(updated);
        return updated;
      }
      return acc;
    });

    setAccounts(updatedAccounts);

    setCurrentAccount(prev => prev ? { ...prev, password: newPass } : null);

    setProfileOldPassword('');
    setProfileNewPassword('');
    setProfileConfirmPassword('');

    triggerModal(language === 'id' ? '✅ Kata sandi berhasil diperbarui!' : '✅ Password updated successfully!', 'success');
  };

  const openBankModal = () => {
    setBankNameInput(currentAccount?.settings?.bankName || 'BCA');
    setBankNumberInput(currentAccount?.settings?.bankNumber || '');
    setBankHolderInput(currentAccount?.settings?.bankHolder || '');
    setBankModalOpen(true);
  };

  const handleSaveBankAccount = async () => {
    if (!currentAccount) return;
    if (!bankNameInput.trim() || !bankNumberInput.trim() || !bankHolderInput.trim()) {
      triggerModal(
        language === 'id' 
          ? '❌ Semua kolom informasi rekening wajib diisi!' 
          : '❌ All bank account fields are required!', 
        'warning'
      );
      return;
    }

    setIsUpdatingBank(true);
    try {
      const updatedSettings = {
        ...currentAccount.settings,
        bankName: bankNameInput.trim().toUpperCase(),
        bankNumber: bankNumberInput.trim(),
        bankHolder: bankHolderInput.trim().toUpperCase()
      };

      const success = await updateUserSettingsInSupabase(currentAccount.username, updatedSettings);
      if (success) {
        setAccounts(prev => {
          const updated = prev.map(acc => {
            if (acc.username.toLowerCase() === currentAccount.username.toLowerCase()) {
              return {
                ...acc,
                settings: updatedSettings
              };
            }
            return acc;
          });
          return updated;
        });

        setCurrentAccount(prev => prev ? {
          ...prev,
          settings: updatedSettings
        } : null);

        setWithdrawBank(bankNameInput.trim().toUpperCase());
        setWithdrawAccount(bankNumberInput.trim());

        triggerModal(
          language === 'id' 
            ? '✅ Informasi rekening bank berhasil disimpan!' 
            : '✅ Bank account information saved successfully!', 
          'success'
        );
        setBankModalOpen(false);
      } else {
        throw new Error('Database update failed');
      }
    } catch (err: any) {
      console.error(err);
      triggerModal(
        language === 'id' 
          ? '❌ Gagal menyimpan rekening bank!' 
          : '❌ Failed to save bank account!', 
        'danger'
      );
    } finally {
      setIsUpdatingBank(false);
    }
  };

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
        // Local storage save omitted to prevent storage quota limit issues
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
          return {
            ...acc,
            settings: {
              ...acc.settings,
              notificationsEnabled: val,
            }
          };
        }
        return acc;
      });
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        updateState({ profileImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
    const shareUrl = `${window.location.origin}/register?ref=${refCodeStr}`;
    
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    triggerModal(
      language === 'id' 
        ? '✅ Referral Link Copied Successfully!' 
        : '✅ Referral Link Copied Successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  const handleCopyCode = () => {
    const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
    navigator.clipboard.writeText(refCodeStr);
    setCopiedCode(true);
    triggerModal(
      language === 'id' 
        ? '✅ Referral Code Copied Successfully!' 
        : '✅ Referral Code Copied Successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedCode(false);
    }, 2000);
  };

  const handleCopyBankNumber = () => {
    const num = globalConfig?.bankNumber || '8402-1920-22';
    navigator.clipboard.writeText(num);
    setCopiedBank(true);
    triggerModal(
      language === 'id' 
        ? '✅ Nomor rekening bank berhasil disalin!' 
        : '✅ Bank account number copied successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedBank(false);
    }, 2000);
  };

  const handleCopyUSDTAddress = () => {
    const addr = globalConfig?.usdtAddress || 'TYrN8xZ7p8asD89xHjasDJKH190Kash18a';
    navigator.clipboard.writeText(addr);
    setCopiedUSDT(true);
    triggerModal(
      language === 'id' 
        ? '✅ Alamat USDT berhasil disalin!' 
        : '✅ USDT address copied successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedUSDT(false);
    }, 2000);
  };

  const handleTapBooster = () => {
    if (state.activeContracts === 0) {
      triggerModal(
        language === 'id' 
          ? '🔒 Anda tidak memiliki Kontrak Aktif. Silakan beli kontrak tambang terlebih dahulu untuk mengaktifkan Turbo Booster!' 
          : '🔒 You have no active contracts. Please buy mining contracts first to utilize the Turbo Booster!', 
        'warning'
      );
      return;
    }

    const now = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in ms
    
    if (state.lastBoostTime) {
      const elapsed = now - state.lastBoostTime;
      if (elapsed < cooldownPeriod) {
        const remainingMs = cooldownPeriod - elapsed;
        const hours = Math.floor(remainingMs / (60 * 60 * 1000));
        const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
        
        triggerModal(
          language === 'id'
            ? `⏳ Turbo Booster sedang dalam masa pemulihan (cooldown).\n\nAnda dapat mengaktifkannya kembali dalam:\n<b>${hours} jam, ${minutes} menit, ${seconds} detik</b>.`
            : `⏳ Turbo Booster is on cooldown.\n\nYou can reactivate it in:\n<b>${hours} hours, ${minutes} minutes, ${seconds} seconds</b>.`,
          'warning'
        );
        return;
      }
    }
    
    // Trigger visual ripple feedback
    setShowBoosterRipple(true);
    setTimeout(() => setShowBoosterRipple(false), 500);

    // Set boost countdown to 15 seconds
    setBoostTimeLeft(15);

    // Save activation timestamp and sync instantly
    updateState({ lastBoostTime: now }, true);

    // Visual toast notification on first activation
    if (boostTimeLeft === 0) {
      triggerModal(
        language === 'id'
          ? '⚡ EXC-700 TURBO BOOST AKTIF!\n\nKecepatan siklus cloud hashing meningkat +50% selama 15 detik ke depan!'
          : '⚡ EXC-700 TURBO BOOST ENGAGED!\n\nCloud hashing cycle step velocity accelerated by +50% for the next 15 seconds!',
        'success'
      );
    }
  };

  const handleRunDiagnostics = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanLog([]);

    const logSteps = [
      { progress: 10, msg: '[SYSTEM] Initializing connection to EXC-700 Block Registry...' },
      { progress: 25, msg: '[SYSTEM] Establishing handshake with South Africa telemetry... OK' },
      { progress: 40, msg: '[SYSTEM] Querying Mali Operational Site L2... WARN: Temperature spike' },
      { progress: 60, msg: '[SYSTEM] Pinging Ghana active hashing rigs... OK' },
      { progress: 75, msg: '[SYSTEM] Evaluating satellite packet drop rate on Tanzania Gateway... OK' },
      { progress: 90, msg: '[SYSTEM] Reconciling ledger blocks with decentralized validator node... COMPLETE' },
      { progress: 100, msg: '[SYSTEM] Diagnostic scan complete. System status compiled.' }
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setScanProgress(step.progress);
        setScanLog(prev => [...prev, step.msg]);

        if (step.progress === 100) {
          setIsScanning(false);
          // Generate a new simulated system error
          const errorPool = [
            {
              errorCode: 'ERR-304',
              message: language === 'id' 
                ? 'Suhu teras termal melebihi batas keselamatan (86°C)' 
                : 'Thermal core temperature exceeded safety safety margin (86°C)',
              node: 'Mali Operational Site L2',
              severity: 'critical' as const
            },
            {
              errorCode: 'ERR-115',
              message: language === 'id'
                ? 'Fluktuasi voltase terdeteksi pada kompresor Turbo Accelerator'
                : 'Voltage fluctuation detected on Turbo Accelerator compressor',
              node: 'EXC-700 South Africa Node',
              severity: 'warning' as const
            },
            {
              errorCode: 'ERR-502',
              message: language === 'id'
                ? 'Keterlambatan sinkronisasi blok terdeteksi (+1.8 detik)'
                : 'Block synchronization delay detected (+1.8s)',
              node: 'Tanzania Gateway Node',
              severity: 'warning' as const
            },
            {
              errorCode: 'ERR-211',
              message: language === 'id'
                ? 'Kegagalan deteksi detak jantung pada rig penambangan Ghana #9'
                : 'Heartbeat signal failure on Ghana active mining rig #9',
              node: 'Ghana Active Rigs',
              severity: 'critical' as const
            }
          ];

          const picked = errorPool[Math.floor(Math.random() * errorPool.length)];
          const newErr: SystemError = {
            id: 'err-' + Date.now(),
            timestamp: Date.now(),
            errorCode: picked.errorCode,
            message: picked.message,
            node: picked.node,
            severity: picked.severity,
            resolved: false
          };

          setState(prev => ({
            ...prev,
            systemErrors: [newErr, ...(prev.systemErrors || [])]
          }));

          triggerModal(
            language === 'id'
              ? `⚠️ PEMINDAIAN SELESAI\n\nMenemukan isu: ${picked.errorCode} di ${picked.node}.\nSilakan periksa Riwayat Error untuk melakukan debugging!`
              : `⚠️ SCAN COMPLETE\n\nIssue discovered: ${picked.errorCode} at ${picked.node}.\nPlease check Error History to initiate troubleshooting!`,
            'warning'
          );
        }
      }, (index + 1) * 600);
    });
  };

  const handleResolveError = (errId: string) => {
    if (resolvingId) return;
    setResolvingId(errId);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        systemErrors: (prev.systemErrors || []).map(err => 
          err.id === errId ? { ...err, resolved: true } : err
        )
      }));
      setResolvingId(null);
      triggerModal(
        language === 'id'
          ? '✅ Debugging berhasil! Unit ekskavator kembali beroperasi dengan efisiensi puncak.'
          : '✅ Troubleshooting successful! The excavator unit is restored to 100% operational efficiency.',
        'success'
      );
    }, 1500);
  };

  // --- PROCESS COOLDOWN & HARVEST CLAIMS ---
  const handleClaimYield = () => {
    if (state.activeContracts === 0) {
      triggerModal(
        "No active contract. Purchase a contract to start earning rewards.",
        'warning'
      );
      return;
    }

    const nowServer = Date.now() + serverTimeOffset;
    if (state.lastClaimTime !== 0 && nowServer - state.lastClaimTime < CONFIG.CLAIM_COOLDOWN) {
      triggerModal(
        "You have already claimed today's reward. Please come back after the countdown ends.",
        'warning'
      );
      return;
    }

    // Reward dihitung berdasarkan nilai kontrak aktif: Daily Reward = Nilai Kontrak × Daily Yield (%)
    const contractValue = state.activeContracts * CONFIG.PRICE_PER_UNIT;
    const rewardAmount = contractValue * CONFIG.DAILY_REWARD_PERCENT;
    const claimAmountRounded = Math.round(rewardAmount);

    const maxAllowed = state.activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT;
    const prevMiningProfit = (state.transactions || [])
      .filter(t => t.type === 'reward')
      .reduce((sum, item) => sum + item.amount, 0);
    const prevReferralReward = (state.transactions || [])
      .filter(t => t.type === 'referral')
      .reduce((sum, item) => sum + item.amount, 0);
    const prevRebateReward = (state.transactions || [])
      .filter(t => t.type === 'rebate')
      .reduce((sum, item) => sum + item.amount, 0);
    const currentCappingEarnings = prevMiningProfit + prevReferralReward + prevRebateReward;

    const remainingCapping = Math.max(0, maxAllowed - currentCappingEarnings);

    if (maxAllowed > 0 && remainingCapping <= 0) {
      triggerModal(
        language === 'id'
          ? `⚠️ CAPPING SELESAI\n\nPenghasilan Anda telah mencapai batas maksimal Capping 250% (Rp ${maxAllowed.toLocaleString('id-ID')}). Untuk terus mengklaim reward harian, silakan beli kontrak tambang baru.`
          : `⚠️ CAPPING REACHED\n\nYour earnings have reached the maximum 250% Capping limit (Rp ${maxAllowed.toLocaleString('id-ID')}). To continue claiming daily rewards, please purchase a new mining contract.`,
        'warning'
      );
      return;
    }

    const finalClaimAmount = Math.round(Math.min(claimAmountRounded, remainingCapping));
    if (finalClaimAmount <= 0) {
      return;
    }

    console.log('--- REWARD SYSTEM AUDIT LOG ---', {
      username: currentAccount?.username,
      activeContracts: state.activeContracts,
      contractValue,
      rewardRate: CONFIG.DAILY_REWARD_PERCENT,
      calculatedReward: rewardAmount,
      finalRewardCredited: finalClaimAmount
    });

    if (!currentAccount) return;

    claimDailyRewardInSupabase(currentAccount.username, finalClaimAmount).then(success => {
      if (success) {
        // Clear any pending background save to prevent overwriting the DB with stale data
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }

        const claimTx: Transaction = {
          id: 'CLM-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          type: 'reward',
          amount: finalClaimAmount,
          date: Date.now(),
          description: language === 'id'
            ? `Klaim Reward Harian (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%)${finalClaimAmount < claimAmountRounded ? ' [Capped]' : ''}`
            : `Daily Reward Claim (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%)${finalClaimAmount < claimAmountRounded ? ' [Capped]' : ''}`,
        };

        // Instantly update local state for a snappy and responsive UI
        setState(prev => ({
          ...prev,
          mainBalance: prev.mainBalance + finalClaimAmount,
          totalEarned: prev.totalEarned + finalClaimAmount,
          pendingMiningReward: 0,
          lastClaimTime: Date.now(),
          transactions: [claimTx, ...(prev.transactions || [])],
        }));

        triggerModal(
          language === 'id'
            ? `✅ Berhasil mengklaim reward harian sebesar Rp ${finalClaimAmount.toLocaleString('id-ID')}!${finalClaimAmount < claimAmountRounded ? ' (Dibatasi oleh Capping 250%)' : ''}`
            : `✅ Successfully claimed daily reward of Rp ${finalClaimAmount.toLocaleString('id-ID')}!${finalClaimAmount < claimAmountRounded ? ' (Limited by 250% Capping)' : ''}`,
          'success'
        );

        syncFromSupabase();
      } else {
        triggerModal(
          language === 'id' ? '❌ Gagal mengklaim reward harian.' : '❌ Failed to claim daily reward.',
          'danger'
        );
      }
    });
  };

  // --- DEPOSIT FLOW ---
  const formatDepositAmount = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean) {
      setDepositValue(parseInt(clean).toLocaleString('id-ID'));
    } else {
      setDepositValue('');
    }
  };

  const handleQuickDeposit = (amount: number) => {
    setDepositValue(amount.toLocaleString('id-ID'));
  };

  const handleProofUpload = (file: File) => {
    if (!file) return;

    // Check file type
    const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedExtensions.includes(file.type)) {
      triggerModal(
        language === 'id'
          ? '❌ Format gambar tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'
          : '❌ Image format not supported. Use JPG, JPEG, PNG, or WEBP.',
        'warning'
      );
      return;
    }

    // Check size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      triggerModal(
        language === 'id'
          ? '❌ Ukuran file maksimal adalah 2 MB.'
          : '❌ Maximum file size is 2 MB.',
        'warning'
      );
      return;
    }

    setIsUploadingProof(true);
    // Compress the image automatically
    compressImage(file).then((compressedBlob) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setDepositProof(result); // Instant Base64 local preview
        setDepositProofName(file.name);
        setIsUploadingProof(false);
        triggerModal(
          language === 'id'
            ? '✅ Bukti transfer dikompresi secara otomatis & siap dikirim!'
            : '✅ Transfer proof auto-compressed & ready to send!',
          'success'
        );
      };
      reader.onerror = () => {
        setIsUploadingProof(false);
        triggerModal(
          language === 'id'
            ? '❌ Gagal membaca file gambar.'
            : '❌ Failed to read the image file.',
          'danger'
        );
      };
      reader.readAsDataURL(compressedBlob);
    }).catch(err => {
      setIsUploadingProof(false);
      console.error('Compression failed:', err);
      triggerModal(
        language === 'id'
          ? '❌ Gagal mengompresi gambar.'
          : '❌ Failed to compress image.',
        'danger'
      );
    });
  };

  const executeDeposit = async () => {
    const numeric = parseInt(depositValue.replace(/[^0-9]/g, '')) || 0;
    if (numeric < CONFIG.MIN_DEPOSIT) {
      triggerModal(
        language === 'id'
          ? `Minimal deposit adalah Rp${CONFIG.MIN_DEPOSIT.toLocaleString('id-ID')}.`
          : `Minimum deposit is Rp ${CONFIG.MIN_DEPOSIT.toLocaleString('id-ID')}.`,
        'warning'
      );
      return;
    }

    if (!depositProof) {
      triggerModal(
        language === 'id'
          ? '❌ Bukti transfer wajib diunggah sebelum melanjutkan.'
          : '❌ Transfer proof is required before continuing.',
        'warning'
      );
      return;
    }

    if (!currentAccount) return;

    setIsUploadingProof(true);
    
    // Upload local compressed base64 image to Supabase Storage and retrieve public URL or error message
    const uploadResult = await uploadProofToSupabaseStorage(depositProof, depositProofName || 'proof.jpg');
    
    if (uploadResult.error || !uploadResult.url) {
      setIsUploadingProof(false);
      const originalErr = uploadResult.error ? uploadResult.error : 'Unknown error';
      console.error('Transfer proof upload failed:', originalErr);
      
      const isBucketNotFound = originalErr.toLowerCase().includes('bucket not found') || originalErr.toLowerCase().includes('bucket_not_found');
      let friendlyMessage = '';
      if (isBucketNotFound) {
        friendlyMessage = language === 'id'
          ? `<div class="text-left space-y-3 font-sans">
              <p class="font-extrabold text-rose-400 text-sm">❌ Bucket 'deposits' tidak ditemukan di Supabase Storage Anda.</p>
              <p class="text-xs text-slate-300">Silakan buat bucket ini secara manual di dashboard Supabase Anda dengan langkah-langkah berikut:</p>
              <ol class="list-decimal list-inside text-[11px] text-slate-400 space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono">
                <li>Buka Dashboard Supabase Anda.</li>
                <li>Pilih tab <span class="text-amber-400 font-bold">"Storage"</span> di sidebar kiri.</li>
                <li>Klik tombol <span class="text-amber-400 font-bold">"New bucket"</span>.</li>
                <li>Beri nama bucket: <span class="text-emerald-400 font-extrabold">deposits</span></li>
                <li>Pastikan tipenya adalah <span class="text-rose-400 font-extrabold">Private</span> (bukan Public).</li>
                <li>Klik <span class="text-amber-400 font-bold">"Create bucket"</span> untuk menyimpan.</li>
                <li>Buka menu <span class="text-amber-400 font-bold">"SQL Editor"</span> di Supabase Anda, buat query baru, jalankan script SQL Schema di bagian bawah file <code class="text-emerald-400">src/supabase.ts</code> untuk mengonfigurasi RLS & Storage Policies secara instan.</li>
              </ol>
            </div>`
          : `<div class="text-left space-y-3 font-sans">
              <p class="font-extrabold text-rose-400 text-sm">❌ Bucket 'deposits' not found in your Supabase Storage.</p>
              <p class="text-xs text-slate-300">Please create this storage bucket in your Supabase Dashboard following these steps:</p>
              <ol class="list-decimal list-inside text-[11px] text-slate-400 space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono">
                <li>Go to your Supabase Dashboard.</li>
                <li>Click the <span class="text-amber-400 font-bold">"Storage"</span> tab in the left sidebar.</li>
                <li>Click the <span class="text-amber-400 font-bold">"New bucket"</span> button.</li>
                <li>Name the bucket: <span class="text-emerald-400 font-extrabold">deposits</span></li>
                <li>Make sure the bucket type is set to <span class="text-rose-400 font-extrabold">Private</span>.</li>
                <li>Click <span class="text-amber-400 font-bold">"Create bucket"</span>.</li>
                <li>Go to the <span class="text-amber-400 font-bold">"SQL Editor"</span> in Supabase, create a new query, copy & run the SQL Schema script from the bottom of file <code class="text-emerald-400">src/supabase.ts</code> to configure RLS & Storage Policies instantly.</li>
              </ol>
            </div>`;
      } else {
        friendlyMessage = language === 'id'
          ? `❌ Gagal mengunggah bukti transfer ke Storage: ${originalErr}`
          : `❌ Failed to upload transfer proof to Storage: ${originalErr}`;
      }

      triggerModal(friendlyMessage, 'danger');
      return;
    }

    const publicUrl = uploadResult.url;

    const depId = 'DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const paymentLabel = depositMethod === 'bank' 
      ? `Bank (${globalConfig?.bankName || 'BCA'})` 
      : 'USDT Crypto (TRC-20)';

    createDepositInSupabase(depId, currentAccount.username, numeric, paymentLabel, publicUrl).then(success => {
      setIsUploadingProof(false);
      if (success) {
        setDepositValue('');
        setDepositProof(null);
        setDepositProofName(null);
        triggerModal(
          language === 'id'
            ? `🎉 Deposit sebesar Rp ${numeric.toLocaleString('id-ID')} Berhasil dikirim! Silakan tunggu verifikasi admin.`
            : `🎉 Deposit of Rp ${numeric.toLocaleString('id-ID')} has been submitted! Please wait for admin verification.`,
          'success'
        );
        setCurrentTab('wallet');
        syncFromSupabase();
      } else {
        triggerModal(language === 'id' ? '❌ Gagal mengirim permintaan deposit.' : '❌ Failed to submit deposit request.', 'danger');
      }
    });
  };

  // --- WITHDRAW FLOW ---
  const triggerWithdrawFlow = () => {
    setWithdrawAmount('');
    setWithdrawBank(currentAccount?.settings?.bankName || 'BCA');
    setWithdrawAccount(currentAccount?.settings?.bankNumber || '');
    setWithdrawModalOpen(true);
  };

  const formatWithdrawAmount = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean) {
      setWithdrawAmount(parseInt(clean).toLocaleString('id-ID'));
    } else {
      setWithdrawAmount('');
    }
  };

  const executeWithdrawal = () => {
    const amount = parseInt(withdrawAmount.replace(/[^0-9]/g, '')) || 0;

    if (amount < CONFIG.MIN_WITHDRAW) {
      triggerModal(
        language === 'id' 
          ? `Minimal penarikan adalah Rp${CONFIG.MIN_WITHDRAW.toLocaleString('id-ID')}.` 
          : `Minimum withdrawal is Rp ${CONFIG.MIN_WITHDRAW.toLocaleString('id-ID')}.`,
        'warning'
      );
      return;
    }

    if (!withdrawAccount.trim()) {
      triggerModal(
        language === 'id' ? '❌ Nomor rekening bank harus diisi!' : '❌ Bank account number is required!',
        'warning'
      );
      return;
    }

    if (amount > state.mainBalance) {
      triggerModal(
        language === 'id' ? '❌ Saldo utama Anda tidak mencukupi!' : '❌ Your main balance is insufficient!',
        'danger'
      );
      return;
    }

    if (!currentAccount) return;
    const wdId = 'WD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    createWithdrawalInSupabase(wdId, currentAccount.username, amount, withdrawBank, withdrawAccount, currentAccount.fullName).then(success => {
      if (success) {
        setWithdrawModalOpen(false);
        triggerModal(
          language === 'id'
            ? `⏳ Permintaan penarikan Rp ${amount.toLocaleString('id-ID')} ke rekening ${withdrawBank} ${withdrawAccount} sedang diproses menunggu persetujuan admin!`
            : `⏳ Withdrawal request of Rp ${amount.toLocaleString('id-ID')} to ${withdrawBank} ${withdrawAccount} submitted. Pending admin approval!`,
          'success'
        );
        syncFromSupabase();
      } else {
        triggerModal(language === 'id' ? '❌ Gagal mengajukan penarikan.' : '❌ Failed to submit withdrawal request.', 'danger');
      }
    });
  };

  // --- TRANSFER FLOW ---
  const triggerTransferFlow = () => {
    setTransferAmount('');
    setTransferRecipient('');
    setTransferModalOpen(true);
  };

  const formatTransferAmount = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean) {
      setTransferAmount(parseInt(clean).toLocaleString('id-ID'));
    } else {
      setTransferAmount('');
    }
  };

  const executeTransfer = () => {
    const amount = parseInt(transferAmount.replace(/[^0-9]/g, '')) || 0;

    if (amount < 10000) {
      triggerModal(
        language === 'id' ? '❌ Minimal transfer Rp 10.000' : '❌ Minimum transfer is Rp 10,000',
        'warning'
      );
      return;
    }

    if (!transferRecipient.trim()) {
      triggerModal(
        language === 'id' ? '❌ ID Penerima harus diisi!' : '❌ Recipient ID is required!',
        'warning'
      );
      return;
    }

    if (amount > state.mainBalance) {
      triggerModal(
        language === 'id' ? '❌ Saldo utama Anda tidak mencukupi!' : '❌ Your main balance is insufficient!',
        'danger'
      );
      return;
    }

    const newTx: Transaction = {
      id: 'TRF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type: 'withdraw',
      amount: amount,
      date: Date.now(),
      description: language === 'id' 
        ? `Transfer ke ${transferRecipient}` 
        : `Transfer to ${transferRecipient}`,
    };

    updateState(prev => ({
      ...prev,
      mainBalance: prev.mainBalance - amount,
      transactions: [newTx, ...prev.transactions],
    }), true);

    setTransferModalOpen(false);
    triggerModal(
      language === 'id'
        ? `✅ Berhasil mentransfer Rp ${amount.toLocaleString('id-ID')} ke ${transferRecipient}!`
        : `✅ Successfully transferred Rp ${amount.toLocaleString('id-ID')} to ${transferRecipient}!`,
      'success'
    );
  };

  // --- CONTRACT PURCHASE FLOW ---
  const adjustContractQty = (change: number) => {
    setContractQty(prev => {
      const next = prev + change;
      return next < 1 ? 1 : next;
    });
  };

  const handlePurchaseContract = () => {
    const cost = contractQty * CONFIG.PRICE_PER_UNIT;
    if (cost > state.mainBalance) {
      triggerModal(t.insufficientBalance, 'danger');
      return;
    }

    const confirmAction = () => {
      if (!currentAccount) return;

      purchaseContractInSupabase(currentAccount.username, contractQty, CONFIG.PRICE_PER_UNIT).then(success => {
        if (success) {
          // Clear any pending background save to prevent overwriting the DB with stale data
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
          }

          // Instantly update local state for a snappy and responsive UI
          setState(prev => {
            const nextContracts = prev.activeContracts + contractQty;
            const nextBalance = prev.mainBalance - cost;
            return {
              ...prev,
              activeContracts: nextContracts,
              mainBalance: nextBalance,
              hasPurchased: nextContracts > 0,
            };
          });

          triggerModal(
            language === 'id'
              ? `🎉 Berhasil membeli ${contractQty} unit Stock Contract!`
              : `🎉 Successfully purchased ${contractQty} Stock Contract units!`,
            'success'
          );
          setContractQty(1);
          syncFromSupabase();
        } else {
          triggerModal(
            language === 'id'
              ? '❌ Gagal melakukan pembelian kontrak.'
              : '❌ Failed to complete contract purchase.',
            'danger'
          );
        }
      });
    };

    triggerModal(
      language === 'id'
        ? `Beli ${contractQty} Unit Kontrak?\nTotal: Rp ${cost.toLocaleString('id-ID')}`
        : `Buy ${contractQty} Contract Units?\nTotal: Rp ${cost.toLocaleString('id-ID')}`,
      'info',
      true,
      confirmAction
    );
  };

  // --- MLM DOWNLINE PURCHASE SIMULATION ENGINE ---
  const simulateDownlinePurchase = () => {
    const levels = [
      { level: 1, pct: 0.10, label: 'Level 1 (Direct)' },
      { level: 2, pct: 0.03, label: 'Level 2 (Indirect)' },
      { level: 3, pct: 0.02, label: 'Level 3 (Indirect)' }
    ];
    const picked = levels[Math.floor(Math.random() * levels.length)];
    const names = [
      'Andi Wijaya', 'Budi Santoso', 'Chandra Lestari', 'Dedi Heryanto', 'Eko Prasetyo',
      'Fajar Ramadhan', 'Gita Permata', 'Hendra Kusuma', 'Iwan Setiawan', 'Joni Iskandar',
      'Kartika Sari', 'Lutfi Hakim', 'Mega Utami', 'Novi Andriani', 'Rian Hidayat'
    ];
    const pickedName = names[Math.floor(Math.random() * names.length)];
    const qty = Math.floor(1 + Math.random() * 5); // 1 to 5 contracts
    const totalPurchase = qty * CONFIG.PRICE_PER_UNIT;
    const commission = totalPurchase * picked.pct;

    // Check capping
    const maxAllowed = state.activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT;
    const prevMiningProfit = (state.transactions || [])
      .filter(t => t.type === 'reward')
      .reduce((sum, item) => sum + item.amount, 0);
    const prevReferralReward = (state.transactions || [])
      .filter(t => t.type === 'referral')
      .reduce((sum, item) => sum + item.amount, 0);
    const prevRebateReward = (state.transactions || [])
      .filter(t => t.type === 'rebate')
      .reduce((sum, item) => sum + item.amount, 0);
    const currentCappingEarnings = prevMiningProfit + prevReferralReward + prevRebateReward;

    const remainingCapping = Math.max(0, maxAllowed - currentCappingEarnings);

    if (maxAllowed > 0 && remainingCapping <= 0) {
      triggerModal(
        language === 'id'
          ? `⚠️ CAPPING SELESAI\n\nPenghasilan Anda telah mencapai batas maksimal Capping 250% (Rp ${maxAllowed.toLocaleString('id-ID')}). Untuk terus menerima bonus referral, silakan beli kontrak tambang baru.`
          : `⚠️ CAPPING REACHED\n\nYour earnings have reached the maximum 250% Capping limit (Rp ${maxAllowed.toLocaleString('id-ID')}). To continue receiving referral bonuses, please purchase a new mining contract.`,
        'warning'
      );
      return;
    }

    const finalCommission = Math.round(Math.min(commission, remainingCapping));
    if (finalCommission <= 0) {
      return;
    }

    const confirmSimulate = () => {
      const newTx: Transaction = {
        id: 'REF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: 'referral',
        amount: finalCommission,
        date: Date.now(),
        description: language === 'id'
          ? `Referral Level ${picked.level} - Pembelian ${qty} Kontrak oleh ${pickedName}${finalCommission < commission ? ' [Capped]' : ''}`
          : `Referral Level ${picked.level} - Purchase of ${qty} Contracts by ${pickedName}${finalCommission < commission ? ' [Capped]' : ''}`,
      };

      // Create a simulated holder record if L1
      let newHolder = null;
      if (picked.level === 1) {
        newHolder = {
          id: 'H00' + (state.holders.length + 1),
          name: pickedName,
          contracts: qty,
          joinDate: Date.now()
        };
      }

      updateState(prev => {
        const nextHolders = newHolder ? [newHolder, ...prev.holders] : prev.holders;
        return {
          ...prev,
          mainBalance: prev.mainBalance + finalCommission,
          referralEarned: prev.referralEarned + finalCommission,
          holders: nextHolders,
          transactions: [newTx, ...prev.transactions],
        };
      });

      triggerModal(
        language === 'id'
          ? `👥 <b>Transaksi Sukses!</b><br>Downline Anda <b>${pickedName}</b> di <b>L${picked.level}</b> membeli ${qty} Unit Kontrak.<br><br>Sponsor Commission (<b>${picked.pct * 100}%</b>):<br><span class="text-emerald-400 font-extrabold">Rp ${finalCommission.toLocaleString('id-ID')}</span>${finalCommission < commission ? ' (Dibatasi oleh Capping 250%)' : ''} berhasil ditambahkan ke saldo Anda!`
          : `👥 <b>Transaction Successful!</b><br>Your downline <b>${pickedName}</b> at <b>L${picked.level}</b> purchased ${qty} Contract Units.<br><br>Sponsor Commission (<b>${picked.pct * 100}%</b>):<br><span class="text-emerald-400 font-extrabold">Rp ${finalCommission.toLocaleString('id-ID')}</span>${finalCommission < commission ? ' (Limited by 250% Capping)' : ''} has been added to your balance!`,
        'success'
      );
    };

    confirmSimulate();
  };

  // --- CLAIM WELCOME BONUS FLOW ---
  const handleClaimWelcomeBonus = () => {
    if (state.welcomeBonusClaimed) {
      triggerModal('Welcome bonus already claimed!', 'info');
      return;
    }
    if (!canClaimWelcomeBonus) {
      triggerModal(
        language === 'id'
          ? `⚠️ SYARAT BELUM TERPENUHI\n\nUntuk mengklaim Welcome Bonus sebesar Rp 1.800.000, Anda harus memiliki minimal 80 Holder Aktif di jaringan Anda.\n\nProgress Anda saat ini baru mencapai ${networkActiveCount} dari syarat ${CONFIG.REQUIRED_HOLDERS} Holder Aktif.\n\nSilakan undang lebih banyak rekan atau aktifkan lisensi di tim Anda untuk memenuhi syarat!`
          : `⚠️ REQUIREMENTS NOT MET\n\nTo claim the Welcome Bonus of Rp 1,800,000, you must have at least 80 Active Holders in your network.\n\nYour current progress is ${networkActiveCount} out of the required ${CONFIG.REQUIRED_HOLDERS} Active Holders.`,
        'warning'
      );
      return;
    }

    if (!currentAccount) return;

    claimWelcomeBonusInSupabase(currentAccount.username).then(success => {
      if (success) {
        // Clear any pending background save to prevent overwriting the DB with stale data
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }

        // Instantly update local state for a snappy and responsive UI
        setState(prev => ({
          ...prev,
          mainBalance: prev.mainBalance + CONFIG.WELCOME_BONUS_AMOUNT,
          welcomeBonusClaimed: true
        }));

        triggerModal(t.welcomeBonusClaimedSuccess, 'success');
        syncFromSupabase();
      } else {
        triggerModal(
          language === 'id' ? '❌ Gagal mengklaim Welcome Bonus.' : '❌ Failed to claim Welcome Bonus.',
          'danger'
        );
      }
    });
  };

  // --- LUCKY SPIN HANDLER ---
  const handleSpin = () => {
    if (isSpinning) return;
    
    const randomIndex = Math.floor(Math.random() * SPIN_ITEMS.length);
    const degreePerSegment = 360 / SPIN_ITEMS.length;
    const extraSpins = 5;
    const targetRotation = spinRotation + (extraSpins * 360) + (360 - (randomIndex * degreePerSegment)) - (spinRotation % 360);
    
    setIsSpinning(true);
    setSpinRotation(targetRotation);
    setSpinPrizeIndex(randomIndex);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SPIN_ITEMS[randomIndex];
      
      if (prize.type === 'cash') {
        const newTx: Transaction = {
          id: 'SPN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          type: 'reward',
          amount: prize.value,
          date: Date.now(),
          description: language === 'id' ? `Hadiah Lucky Spin Wheel` : `Lucky Spin Wheel Prize`,
        };
        
        updateState(prev => ({
          ...prev,
          mainBalance: prev.mainBalance + prize.value,
          totalEarned: prev.totalEarned + prize.value,
          transactions: [newTx, ...prev.transactions],
        }));

        triggerModal(
          language === 'id'
            ? `🎉 SELAMAT!\n\nAnda memenangkan Saldo sebesar Rp ${prize.value.toLocaleString('id-ID')} dari Lucky Spin Wheel!\n\nHadiah telah ditambahkan ke Saldo Utama Anda.`
            : `🎉 CONGRATULATIONS!\n\nYou won a Balance of Rp ${prize.value.toLocaleString('id-ID')} from the Lucky Spin Wheel!\n\nThe prize has been added to your Main Balance.`,
          'success'
        );
      } else if (prize.type === 'boost') {
        setBoostTimeLeft(300);
        setShowBoosterRipple(true);
        triggerModal(
          language === 'id'
            ? `⚡ BOOSTER AKTIF!\n\nAnda memenangkan Booster Kecepatan Tambang ${prize.value}x selama 5 menit!\n\nKecepatan penambangan kontrak Anda meningkat secara masif!`
            : `⚡ BOOSTER ACTIVE!\n\nYou won a ${prize.value}x Mining Speed Booster for 5 minutes!\n\nYour mining speed has increased massively!`,
          'success'
        );
      } else {
        triggerModal(
          language === 'id'
            ? `😢 ZONK!\n\nSayang sekali, putaran Anda mendarat di Zonk. Jangan menyerah, silakan coba lagi nanti!`
            : `😢 ZONK!\n\nBad luck! Your spin landed on Zonk. Don't give up, try again later!`,
          'info'
        );
      }
    }, 3600);
  };

  // --- MISSION CLAIM HANDLER ---
  const handleClaimMission = (missionId: string, rewardValue: number, title: string) => {
    if (claimedMissions.includes(missionId)) {
      triggerModal(language === 'id' ? 'Misi ini sudah diklaim!' : 'This mission has already been claimed!', 'info');
      return;
    }

    const newTx: Transaction = {
      id: 'MSN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type: 'reward',
      amount: rewardValue,
      date: Date.now(),
      description: `Mission Reward: ${title}`,
    };

    updateState(prev => ({
      ...prev,
      mainBalance: prev.mainBalance + rewardValue,
      totalEarned: prev.totalEarned + rewardValue,
      transactions: [newTx, ...prev.transactions],
    }));

    setClaimedMissions(prev => [...prev, missionId]);
    setClaimedMissionsHistory(prev => [
      { id: 'hist_' + Math.random().toString(36).substring(2, 9).toUpperCase(), title, reward: rewardValue, timestamp: Date.now() },
      ...prev
    ]);

    triggerModal(
      language === 'id'
        ? `🎁 MISI SELESAI!\n\nAnda berhasil mengklaim hadiah sebesar Rp ${rewardValue.toLocaleString('id-ID')} untuk misi: "${title}".`
        : `🎁 MISSION COMPLETED!\n\nYou successfully claimed a reward of Rp ${rewardValue.toLocaleString('id-ID')} for the mission: "${title}".`,
      'success'
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#040108] text-slate-100 flex flex-col items-center font-sans antialiased">
      
      {/* 1. SPLASH SCREEN */}
      <AnimatePresence>
        {isSplashScreen && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[999999] bg-[#040108] flex flex-col justify-center items-center text-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="text-4xl font-extrabold tracking-wider text-gold-primary font-orbitron drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              GROCKGOLD
            </motion.div>
            <div className="text-xs text-purple-400 font-bold tracking-widest mt-2 uppercase">
              A Randgold Resources Company
            </div>
            <div className="text-slate-400 text-sm mt-12 font-medium">
              Initializing Secure Mining Network...
            </div>
            <div className="w-56 h-2 bg-slate-900 border border-purple-900/40 rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${splashProgress}%` }}
                className="h-full bg-gradient-to-r from-yellow-500 via-gold-primary to-yellow-300 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-2">{splashProgress}%</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER FULL-SCREEN ADMIN CONSOLE IF LOGGED IN AS ADMIN, ELSE STANDARD USER INTERFACE */}
      {(currentPath.startsWith('/admin') || (state.isLoggedIn && currentAccount?.username?.toLowerCase() === 'admin')) ? (
        <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center">
          {state.isLoggedIn && currentAccount?.username?.toLowerCase() === 'admin' ? (
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
                onLogout={handleLogout}
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
          ) : state.isLoggedIn ? (
            <div className="max-w-md w-full bg-slate-900 border border-rose-950/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-fade-in mx-4">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h2 className="text-sm font-black tracking-widest text-rose-400 uppercase">ACCESS PROTECTED</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'id' 
                  ? 'Akun Anda tidak memiliki hak akses administrator. Silakan masuk menggunakan akun admin.' 
                  : 'Your current account does not have administrator privileges. Please sign in with an administrator account.'}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    window.history.pushState(null, '', '/admin');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition uppercase cursor-pointer animate-fade-in"
                >
                  Logout & Re-auth
                </button>
                <button
                  onClick={() => {
                    window.history.pushState(null, '', '/');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition uppercase cursor-pointer"
                >
                  {language === 'id' ? 'Kembali' : 'User Area'}
                </button>
              </div>
            </div>
          ) : (
            <AdminRouteLoginForm
              language={language}
              triggerModal={triggerModal}
              accounts={accounts}
              setCurrentAccount={setCurrentAccount}
              updateState={updateState}
            />
          )}
        </div>
      ) : (
        <div className={`w-full max-w-[425px] bg-[#050212]/95 border-x border-purple-950/20 shadow-2xl relative flex flex-col ${
          currentTab === 'transactions' ? 'h-[100dvh] overflow-hidden pb-0' : 'min-h-screen pb-24'
        }`}>
        
        {/* SIDEBAR NAVIGATION DRAWER */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100000] w-full max-w-[425px] mx-auto"
              />

              {/* Sidebar Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 min-[425px]:left-[calc(50%-212.5px)] w-[320px] max-w-[85vw] h-screen bg-[#05020f] border-r border-gold-primary/10 z-[100001] p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar"
              >
                <div>
                  {/* Brand Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="text-base font-black text-white tracking-widest font-sans">
                        GROCK<span className="text-yellow-500">GOLD</span>
                      </div>
                      <div className="text-[7.5px] font-black text-slate-500 tracking-wider uppercase mt-0.5">
                        A RANDGOLD RESOURCES COMPANY
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Profile & Balance Card */}
                  <div className="bg-gradient-to-br from-[#1c123d] via-[#100827] to-[#070313] border border-yellow-500/25 rounded-[24px] p-4.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden mb-6">
                    {/* Absolute subtle background glow */}
                    <div className="absolute top-[-20%] left-[-10%] w-[120px] h-[120px] bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center gap-4 mb-4">
                      {/* Avatar Frame with Gold Ring */}
                      <div className="relative shrink-0">
                        <div className="relative w-18 h-18 rounded-full p-[2.5px] bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.25)] flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-[#0a0518] overflow-hidden relative group">
                            {state.profileImage ? (
                              <img src={state.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-950/40">
                                <User className="w-8 h-8 text-yellow-500" />
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition duration-200">
                              <Camera className="w-3.5 h-3.5 text-white" />
                              <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                            </label>
                          </div>
                        </div>
                        {/* Crown Badge */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-5.5 h-5.5 bg-yellow-500 rounded-full border-2 border-[#0c0722] flex items-center justify-center shadow-lg">
                          <Crown className="w-3 h-3 text-[#0c0722] fill-[#0c0722]" />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="min-w-0">
                        <div className="text-base font-black text-white tracking-wide uppercase truncate leading-tight">
                          {state.username}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-wider mt-1.5 flex items-center gap-1">
                          <span className="opacity-50">ID:</span>
                          <span className="font-extrabold text-slate-300">
                            {currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase().substring(0, 4))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Split Metrics Card */}
                    <div className="grid grid-cols-2 bg-[#05020f]/80 border border-white/5 rounded-2xl p-3 relative">
                      {/* Left Side: Total Deposit */}
                      <div className="flex flex-col items-center justify-center text-center px-1 border-r border-white/10">
                        <div className="flex items-center gap-1 mb-1">
                          <ArrowDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {language === 'id' ? 'TOTAL DEPOSIT' : 'TOTAL DEPOSIT'}
                          </span>
                        </div>
                        <div className="text-[10.5px] font-black text-yellow-500 font-sans tracking-wide">
                          Rp {totalDeposit.toLocaleString('id-ID')}
                        </div>
                      </div>

                      {/* Right Side: Total Withdraw */}
                      <div className="flex flex-col items-center justify-center text-center px-1">
                        <div className="flex items-center gap-1 mb-1">
                          <ArrowUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {language === 'id' ? 'TOTAL WITHDRAW' : 'TOTAL WITHDRAW'}
                          </span>
                        </div>
                        <div className="text-[10.5px] font-black text-yellow-500 font-sans tracking-wide">
                          Rp {totalWithdraw.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Menu Items */}
                  <div className="space-y-6">
                    {/* Menu Group 1: NAVIGASI UTAMA */}
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3.5 mb-2.5">
                        {language === 'id' ? 'NAVIGASI UTAMA' : 'MAIN NAVIGATION'}
                      </div>
                      <div className="bg-[#0c0822]/40 border border-white/5 rounded-2xl p-1.5 space-y-1">
                        {[
                          { id: 'home', label: 'Home', icon: Home },
                          { id: 'contract', label: language === 'id' ? 'Kontrak' : 'Contracts', icon: Ticket },
                          { id: 'livemining', label: 'Live Mining', icon: Cpu },
                          { id: 'wallet', label: 'Wallet', icon: Wallet },
                          { id: 'profile', label: language === 'id' ? 'Profil' : 'Profile', icon: User },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = currentTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setIsSidebarOpen(false);
                                setCurrentTab(item.id);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 transition text-left group/item rounded-xl ${
                                isActive
                                  ? 'bg-gradient-to-r from-[#291763] to-[#140a35] border border-yellow-500/30 text-white shadow-[0_0_15px_rgba(234,179,8,0.08)]'
                                  : 'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                  isActive 
                                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-black' 
                                    : 'bg-[#1b1245] text-purple-300 group-hover/item:bg-[#25195e]'
                                }`}>
                                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-purple-300'}`} />
                                </div>
                                <span className="text-xs font-bold truncate">{item.label}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 transition ${isActive ? 'text-yellow-500' : 'text-slate-600 group-hover/item:text-slate-400'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Menu Group 2: FITUR & REWARDS */}
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3.5 mb-2.5">
                        {language === 'id' ? 'FITUR & REWARDS' : 'FEATURES & REWARDS'}
                      </div>
                      <div className="bg-[#0c0822]/40 border border-white/5 rounded-2xl p-1.5 space-y-1">
                        {[
                          { id: 'community', label: language === 'id' ? 'Komunitas' : 'Community', icon: Users },
                          ...(state.username.toLowerCase() !== 'admin' ? [{ id: 'referral', label: t.referral, icon: UserPlus }] : []),
                          { id: 'transactions', label: language === 'id' ? 'Riwayat Transaksi' : 'Transactions', icon: History },
                          { id: 'notifications', label: language === 'id' ? 'Notifikasi' : 'Notifications', icon: Bell },
                          { id: 'errorhistory', label: language === 'id' ? 'Riwayat Error' : 'Error History', icon: AlertTriangle },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = currentTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setIsSidebarOpen(false);
                                setCurrentTab(item.id);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 transition text-left group/item rounded-xl ${
                                isActive
                                  ? 'bg-gradient-to-r from-[#291763] to-[#140a35] border border-yellow-500/30 text-white shadow-[0_0_15px_rgba(234,179,8,0.08)]'
                                  : 'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                  isActive 
                                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-black' 
                                    : 'bg-[#1b1245] text-purple-300 group-hover/item:bg-[#25195e]'
                                }`}>
                                  <div className="relative">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-purple-300'}`} />
                                    {item.id === 'notifications' && (
                                      <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#0a0518]">
                                        3
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs font-bold truncate">{item.label}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 transition ${isActive ? 'text-yellow-500' : 'text-slate-600 group-hover/item:text-slate-400'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Menu Group 3: LAINNYA */}
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3.5 mb-2.5">
                        {language === 'id' ? 'LAINNYA' : 'OTHERS'}
                      </div>
                      <div className="bg-[#0c0822]/40 border border-white/5 rounded-2xl p-1.5 space-y-1">
                        {(() => {
                          const items: { id: string; label: string; icon: any; action?: () => void }[] = [
                            { id: 'settings', label: language === 'id' ? 'Pengaturan' : 'Settings', icon: Settings },
                            { id: 'help', label: language === 'id' ? 'Bantuan' : 'Help', icon: HelpCircle },
                            { id: 'about', label: language === 'id' ? 'Tentang Kami' : 'About Us', icon: Info },
                          ];
                          if (currentAccount?.username?.toLowerCase() === 'admin') {
                            items.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck, action: undefined });
                          }
                          return items;
                        })().map((item) => {
                          const Icon = item.icon;
                          const isActive = currentTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setIsSidebarOpen(false);
                                if (item.action) {
                                  item.action();
                                } else {
                                  setCurrentTab(item.id);
                                }
                              }}
                              className={`w-full flex items-center justify-between p-2.5 transition text-left group/item rounded-xl ${
                                isActive
                                  ? 'bg-gradient-to-r from-[#291763] to-[#140a35] border border-yellow-500/30 text-white shadow-[0_0_15px_rgba(234,179,8,0.08)]'
                                  : 'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                                  isActive 
                                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-black' 
                                    : 'bg-[#1b1245] text-purple-300 group-hover/item:bg-[#25195e]'
                                }`}>
                                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-purple-300'}`} />
                                </div>
                                <span className="text-xs font-bold truncate">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-1.5 pl-2">
                                {item.id === 'language' && (
                                  <span className="text-[8px] bg-purple-900/40 px-2 py-0.5 rounded text-gold-primary uppercase font-mono font-bold shrink-0">
                                    {language}
                                  </span>
                                )}
                                <ChevronRight className={`w-3.5 h-3.5 transition ${isActive ? 'text-yellow-500' : 'text-slate-600 group-hover/item:text-slate-400'}`} />
                              </div>
                            </button>
                          );
                        })}

                        {/* Logout inside the Lainnya Group Card with soft rose highlights */}
                        <button
                          onClick={() => {
                            setIsSidebarOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center justify-between p-2.5 transition text-left group/item rounded-xl text-rose-400 hover:bg-rose-950/15"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-rose-950/35 text-rose-400 group-hover/item:bg-rose-900/30 flex items-center justify-center shrink-0 transition">
                              <LogOut className="w-4 h-4 text-rose-400" />
                            </div>
                            <span className="text-xs font-black truncate">{t.logout}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-rose-900 group-hover/item:text-rose-400 transition" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Brand Info */}
                <div className="pt-6 border-t border-white/5 mt-6">
                  <div className="text-[8px] text-center text-slate-500 font-mono tracking-widest uppercase leading-relaxed">
                    GROCKGOLD v2.2<br />
                    A RANDGOLD RESOURCES COMPANY
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 2. AUTHENTICATION SCREENS (WELCOME, REGISTER, LOGIN, FORGOT PASSWORD) */}
        {!state.isLoggedIn ? (
          showLanding ? (
            <CompanyPortal
              language={language}
              toggleLanguage={() => {
                const nextLang = language === 'id' ? 'en' : 'id';
                setLanguage(nextLang);
                triggerModal(
                  nextLang === 'id'
                    ? '🇲🇨 Bahasa diubah ke Bahasa Indonesia!'
                    : '🇬🇧 Language changed to English!',
                  'success'
                );
              }}
              onNavigateToAuth={(screen) => {
                setShowLanding(false);
                setAuthScreen(screen);
              }}
              memberCount={state.holders.length}
            />
          ) : (
            <div className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col justify-center items-center bg-[#04010b] z-[9999]">
            {/* Elegant Background Ambient Golden Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.07)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.07)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
            <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.05)_0%,transparent_70%)] blur-[120px] pointer-events-none" />

            {/* Tech grid overlay to reinforce modern layout */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {/* WELCOME SCREEN */}
              {authScreen === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
                >
                  <div className="bg-[#0b061c]/80 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col items-center">
                    {/* Top gold line gradient highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

                    {/* Premium Floating 3D Gold Logo Icon */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="relative w-20 h-20 mb-4.5 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-1 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.25)] border-2 border-yellow-500/30 mt-2"
                    >
                      {/* Golden outer pulse ring */}
                      <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-ping opacity-60 pointer-events-none" />
                      <img
                        src={goldLogo}
                        alt="Gold Mining Logo"
                        className="w-full h-full object-cover rounded-full select-none"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>

                    {/* Title & Branding info with luxury gradient text */}
                    <div className="text-center space-y-0.5 mb-5.5">
                      <h1 className="text-xl font-extrabold tracking-[0.25em] bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent font-orbitron uppercase text-center drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
                        GROCKGOLD
                      </h1>
                      <p className="text-[9px] text-yellow-500/70 font-mono tracking-[0.3em] uppercase text-center mt-0.5">
                        PREMIUM PORTAL
                      </p>
                    </div>

                    {/* Welcome Ticker (Restored with stylish layout) */}
                    <div className="w-full mb-6">
                      <WelcomeTicker memberCount={state.holders.length} isIndonesian={language === 'id'} />
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="space-y-3 w-full">
                      <button
                        onClick={() => setAuthScreen('login')}
                        className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 hover:shadow-[0_4px_25px_rgba(251,191,36,0.4)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-yellow-300/20"
                      >
                        {tAuth.welcomeMasuk.toUpperCase()}
                      </button>
                      
                      <button
                        onClick={() => setAuthScreen('register')}
                        className="w-full py-3.5 bg-slate-900/80 text-white font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 border border-slate-800/80 hover:border-yellow-500/30 hover:bg-slate-800/80 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {tAuth.welcomeDaftar.toUpperCase()}
                      </button>

                      
                      {/* Info footer line with shield alert icon */}
                      <div className="flex flex-col items-center justify-center gap-1.5 pt-4 border-t border-white/5 mt-5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="text-xs" role="img" aria-label="shield alert">🛡️</span>
                          <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 font-mono">SECURE GATEWAY</span>
                        </div>
                        <p className="text-[9.5px] text-slate-500 text-center font-bold tracking-wide leading-relaxed max-w-full px-4 break-normal">
                          {tAuth.welcomeNotice}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* REGISTER SCREEN */}
              {authScreen === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-md md:max-w-2xl mx-auto px-4 py-4 flex flex-col justify-center"
                >
                  <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col max-h-[92vh] w-full">
                    {/* Top gold line gradient highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

                    {/* Back Button */}
                    <button
                      onClick={() => setAuthScreen('welcome')}
                      className="mb-4.5 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-wider self-start z-10 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-yellow-500" />
                      {language === 'id' ? 'Kembali' : 'Back'}
                    </button>

                    <div className="text-center mb-5 z-10">
                      <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                        {tAuth.regTitle}
                      </h2>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1 mb-2">
                        {tAuth.regSubtitle}
                      </p>
                    </div>

                    {/* Scrollable Form Fields area ("yang bergeser didalam tabel/fields") */}
                    <div className="overflow-y-auto pr-1.5 flex-1 max-h-[50vh] z-10 custom-scrollbar mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                        {/* Full Name */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.fullName}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <User className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                              type="text"
                              required
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value.toUpperCase())}
                              placeholder="e.g. KENALA WIJAYA"
                              className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>

                        {/* Username */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.username}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <UserCheck className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                              type="text"
                              required
                              value={regUsername}
                              onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                              placeholder="e.g. kenala123"
                              className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition font-mono focus:ring-1 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.emailAddress}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Mail className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="e.g. kenala@grockgold.com"
                              className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.phoneNumber}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Globe className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                              type="tel"
                              required
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                              placeholder="e.g. +6281234567890"
                              className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition font-mono focus:ring-1 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.password}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Lock className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                              type="password"
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min 8 characters"
                              className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.confirmPassword}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Lock className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                              type="password"
                              required
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Repeat password"
                              className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>

                        {/* Referral Code (optional) */}
                        <div className="md:col-span-2">
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.referralCodeOptional}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Gift className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                              type="text"
                              value={regReferralCode}
                              onChange={(e) => setRegReferralCode(e.target.value)}
                              placeholder="Sponsor code or username"
                              className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition font-mono focus:ring-1 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="flex items-start gap-2 pt-1 md:col-span-2">
                          <input
                            id="agree-tc"
                            type="checkbox"
                            checked={regAgreed}
                            onChange={(e) => setRegAgreed(e.target.checked)}
                            className="mt-0.5 rounded border-slate-800 text-yellow-500 focus:ring-yellow-500/30 bg-black/40 cursor-pointer"
                          />
                          <label htmlFor="agree-tc" className="text-[10px] text-slate-400 leading-snug cursor-pointer select-none">
                            I agree to the <span className="text-yellow-400 font-extrabold hover:underline cursor-pointer" onClick={(e) => { e.preventDefault(); triggerModal("📜 TERMS & CONDITIONS\n\n1. All investments in the GROCKGOLD portal are educational representations of GrockGold Mining.\n2. Users are fully responsible for the security of their own account credentials.\n3. Any attempt at data manipulation will be automatically flagged by security protocols.", 'info'); }}>Terms & Conditions</span> of GrockGold Mining.
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons at the bottom of the card - fixed, non-scrolling */}
                    <div className="z-10 space-y-3.5 mt-auto pt-4.5 border-t border-yellow-500/10">
                      <button
                        onClick={handleRegister}
                        className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.2)] hover:brightness-110 active:scale-98 cursor-pointer border border-yellow-300/10"
                      >
                        {tAuth.createAccount}
                      </button>

                      <div className="text-center">
                        <button
                          onClick={() => setAuthScreen('login')}
                          className="text-[10px] font-extrabold text-yellow-400 hover:underline transition cursor-pointer"
                        >
                          {tAuth.hasAccount}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* LOGIN SCREEN */}
              {authScreen === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
                >
                  <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col">
                    {/* Top gold line gradient highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

                    {/* Back Button */}
                    <button
                      onClick={() => setAuthScreen('welcome')}
                      className="mb-4 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-wider self-start z-10 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-yellow-500" />
                      {language === 'id' ? 'Kembali' : 'Back'}
                    </button>

                    {/* Pulsing logo */}
                    <div className="flex justify-center mb-3.5">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative w-14 h-14 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-0.5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-yellow-500/30"
                      >
                        <div className="absolute inset-0 rounded-full bg-yellow-500/5 animate-pulse" />
                        <img
                          src={goldLogo}
                          alt="Gold Mining Logo"
                          className="w-full h-full object-cover rounded-full select-none"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    </div>

                    <div className="text-center mb-5 z-10">
                      <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                        {tAuth.loginTitle}
                      </h2>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1">
                        {tAuth.loginSubtitle}
                      </p>
                    </div>

                    <div className="space-y-4 z-10">
                      {/* Username or Email */}
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                          {tAuth.usernameOrEmail}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="text"
                            required
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="Enter Username or Email"
                            className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">
                            {tAuth.password}
                          </label>
                          <button
                            onClick={() => {
                              setAuthScreen('forgot');
                            }}
                            className="text-[9px] font-extrabold text-yellow-400 hover:underline cursor-pointer"
                          >
                            {tAuth.forgotPassword}
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>

                      {/* Remember Me Checkbox */}
                      <div className="flex items-center gap-2 py-0.5">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-800 text-yellow-500 focus:ring-yellow-500/30 bg-black/40 cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="text-[10px] text-slate-400 leading-none cursor-pointer select-none font-bold">
                          {tAuth.rememberMe}
                        </label>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={handleLogin}
                        className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 active:scale-98 cursor-pointer border border-yellow-300/10"
                      >
                        {tAuth.accessDashboard.toUpperCase()}
                      </button>

                      {unverifiedEmail && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-left space-y-2 mt-2">
                          <p className="text-[10px] text-red-400 font-medium leading-relaxed">
                            {language === 'id'
                              ? `⚠️ Email Anda (${unverifiedEmail}) belum diverifikasi. Silakan periksa email Anda (termasuk folder spam) untuk tautan konfirmasi.`
                              : `⚠️ Your email (${unverifiedEmail}) is not verified. Please check your inbox (and spam folder) for the confirmation link.`}
                          </p>
                          <button
                            type="button"
                            disabled={isResending}
                            onClick={handleResendVerification}
                            className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 disabled:hover:bg-red-500/20 text-white font-bold rounded-lg text-[9px] tracking-wider uppercase transition disabled:opacity-50 cursor-pointer text-center"
                          >
                            {isResending
                              ? (language === 'id' ? 'Mengirim...' : 'Sending...')
                              : (language === 'id' ? 'Kirim Ulang Email Verifikasi' : 'Resend Verification Email')}
                          </button>

                          <button
                            type="button"
                            onClick={handleBypassVerification}
                            className="w-full py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-black font-extrabold rounded-lg text-[9px] tracking-wider uppercase transition cursor-pointer text-center mt-1 shadow-md shadow-emerald-500/10"
                          >
                            {language === 'id' ? '🔓 Masuk Tanpa Verifikasi (Bypass)' : '🔓 Log In Without Verification (Bypass)'}
                          </button>

                          {resendStatus === 'success' && (
                            <p className="text-[9px] text-green-400 text-center font-bold">
                              {language === 'id' ? '✓ Email verifikasi berhasil dikirim!' : '✓ Verification email sent!'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-center mt-5 z-10">
                      <button
                        onClick={() => setAuthScreen('register')}
                        className="text-[10px] font-extrabold text-yellow-400 hover:underline transition cursor-pointer"
                      >
                        {tAuth.noAccount}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FORGOT PASSWORD SCREEN */}
              {authScreen === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
                >
                  <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col w-full">
                    {/* Top gold line gradient highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

                    {/* Back Button */}
                    <button
                      onClick={() => setAuthScreen('login')}
                      className="mb-5 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-wider self-start z-10 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-yellow-500" />
                      {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
                    </button>

                    {/* Pulsing logo */}
                    <div className="flex justify-center mb-3.5">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative w-14 h-14 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-0.5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-yellow-500/30"
                      >
                        <div className="absolute inset-0 rounded-full bg-yellow-500/5 animate-pulse" />
                        <img
                          src={goldLogo}
                          alt="Gold Mining Logo"
                          className="w-full h-full object-cover rounded-full select-none"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    </div>

                    <div className="text-center mb-5 z-10">
                      <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                        FORGOT PASSWORD
                      </h2>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1">
                        Recover your secure terminal credentials
                      </p>
                    </div>

                    <div className="space-y-4 z-10">
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                          {tAuth.emailAddress}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value.trim())}
                            placeholder="Enter registered Email address"
                            className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>

                      <button
                        disabled={isForgotLoading}
                        onClick={handleSendResetLink}
                        className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 active:scale-98 cursor-pointer mt-1 disabled:opacity-50 border border-yellow-300/10"
                      >
                        {isForgotLoading ? 'SENDING...' : 'SEND RESET LINK'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* RESET PASSWORD SCREEN */}
              {authScreen === 'reset-password' && (
                <motion.div
                  key="reset-password"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
                >
                  <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col w-full">
                    {/* Top gold line gradient highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

                    {/* Pulsing logo */}
                    <div className="flex justify-center mb-3.5">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative w-14 h-14 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-0.5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-yellow-500/30"
                      >
                        <div className="absolute inset-0 rounded-full bg-yellow-500/5 animate-pulse" />
                        <img
                          src={goldLogo}
                          alt="Gold Mining Logo"
                          className="w-full h-full object-cover rounded-full select-none"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    </div>

                    <div className="text-center mb-5 z-10">
                      <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                        RESET PASSWORD
                      </h2>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1">
                        Securely establish your new security credentials
                      </p>
                    </div>

                    <div className="space-y-4 z-10">
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                          {tAuth.newPassword}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="password"
                            value={resetNewPassword}
                            onChange={(e) => setResetNewPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                          {tAuth.confirmNewPassword}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            type="password"
                            value={resetConfirmPassword}
                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>

                      <button
                        disabled={isResetLoading}
                        onClick={handleUpdatePassword}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:brightness-110 active:scale-98 cursor-pointer mt-1 disabled:opacity-50 border border-emerald-400/10"
                      >
                        {isResetLoading ? 'SAVING...' : 'SAVE NEW PASSWORD'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )
        ) : (
          <>
            {/* 3. APP HEADER BAR */}
            <div className="sticky top-0 bg-[#050212]/90 backdrop-blur-md z-40 border-b border-purple-950/15">
              
              <div className="px-4 py-4 flex items-center justify-between">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <Menu className="w-5.5 h-5.5" />
                </button>

                <div className="text-center">
                  <div className="text-base font-black tracking-widest text-white font-orbitron">
                    GROCKGOLD
                  </div>
                  <div className="text-[8px] text-slate-500 tracking-wider font-extrabold mt-[-2px] uppercase">
                    A Randgold Resources Company
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => triggerModal(language === 'id' ? 'Belum ada notifikasi baru.' : 'No new notifications.', 'info')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                  >
                    <Bell className="w-4.5 h-4.5 text-purple-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. MAIN VIEWS SWITCH */}
            <div className={`flex-1 px-4 py-3 space-y-4 ${
              currentTab === 'transactions' ? 'overflow-hidden flex flex-col pb-[76px]' : ''
            }`}>

              {/* HOME VIEW */}
              {currentTab === 'home' && (
                isSyncing ? (
                  <HomeSkeleton />
                ) : (
                  <div className="space-y-4">
                    
                  {/* MASTER BALANCE CARD */}
                  <div className="relative bg-gradient-to-br from-[#1b0b3a] via-[#09041a] to-[#03010c] border border-gold-primary/25 rounded-3xl p-5 shadow-2xl overflow-hidden group">
                    {/* Glowing Accent Orbs */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-radial-gradient from-gold-primary/10 to-transparent pointer-events-none rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition duration-500" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

                    {/* DYNAMIC MASTER BALANCE SECTION */}
                    <div className="bg-black/45 border border-purple-500/15 rounded-2xl p-4.5 mb-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />
                      
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                            {t.totalBalance}
                          </span>
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              setIsSyncing(true);
                              await syncFromSupabase();
                              triggerModal(
                                language === 'id'
                                  ? '✅ Sinkronisasi database berhasil! Data Anda telah diperbarui.'
                                  : '✅ Database synchronization successful! Your data has been updated.',
                                'success'
                              );
                            }}
                            disabled={isSyncing}
                            className="text-purple-400 hover:text-white transition p-1.5 rounded hover:bg-white/5 disabled:opacity-50"
                            title={language === 'id' ? 'Sinkronkan dengan Supabase' : 'Sync with Supabase'}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => setHideBalance(!hideBalance)}
                            className="text-purple-400 hover:text-white transition p-1.5 rounded hover:bg-white/5"
                          >
                            {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-2xl font-black text-gradient-gold font-orbitron tracking-wide mb-3 flex items-baseline gap-1">
                        {hideBalance ? '••••••••' : `Rp ${state.mainBalance.toLocaleString('id-ID')}`}
                        {!hideBalance && <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">IDR</span>}
                      </div>

                      {/* Animated Gold Hashrate SVG Sparkline */}
                      <div className="h-6 relative overflow-visible mt-1.5 mb-2.5 opacity-80">
                        <svg className="w-full h-full text-gold-primary/25 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                          <motion.path
                            d="M0 10 Q 15 3, 30 14 T 60 4 T 90 12 H 100"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          />
                          <motion.circle
                            cx="100"
                            cy="12"
                            r="2"
                            className="fill-gold-primary shadow-[0_0_8px_rgba(212,175,55,1)]"
                            animate={{ scale: [1, 1.6, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        </svg>
                        <span className="absolute top-0 right-1 text-[8px] font-mono font-black text-emerald-400 tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          {state.activeContracts > 0 ? '● ONLINE' : '○ STANDBY'}
                        </span>
                      </div>

                      {/* HIGH-TECH PROFIT METRICS AREA */}
                      <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3 mt-1">
                        {/* 💰 Total Profit Hari Ini */}
                        <div className="bg-purple-950/35 p-2.5 rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition duration-300">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-4.5 h-4.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                              <Coins className="w-3 h-3 text-emerald-400" />
                            </div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                              {language === 'id' ? 'Profit Hari Ini' : 'Profit Today'}
                            </span>
                          </div>
                          <div className="text-xs font-black text-emerald-400 font-orbitron">
                            Rp {dailyYield.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wide">
                            {language === 'id' ? 'Est. Hasil Harian' : 'Est. Daily Yield'}
                          </div>
                        </div>

                        {/* ⚡ Hashrate Kecepatan */}
                        <div className="bg-purple-950/35 p-2.5 rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition duration-300">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-4.5 h-4.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                              <Cpu className="w-3 h-3 text-purple-400" />
                            </div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                              {language === 'id' ? 'Kecepatan Node' : 'Node Hashrate'}
                            </span>
                          </div>
                          <div className="text-xs font-black text-purple-300 font-orbitron">
                            {(state.activeContracts * 15.6).toFixed(1)} <span className="text-[8px] font-bold text-purple-400">GH/s</span>
                          </div>
                          <div className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wide">
                            {state.activeContracts} {language === 'id' ? 'Kontrak Aktif' : 'Active Units'}
                          </div>
                        </div>
                      </div>
                    </div>

                     {/* QUICK ACTIONS PANEL (4 COMPACT ICONS) */}
                     <div className="mt-4 pt-4 border-t border-[#291754]/30 relative z-10 text-left">
                       <div className="flex items-center justify-center gap-3 mb-2.5">
                         <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/10 to-purple-500/20" />
                         <div className="flex items-center gap-1.5 shrink-0">
                           <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                           <span className="text-[9.5px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 tracking-[0.25em] uppercase font-mono">
                             {language === 'id' ? 'TINDAKAN CEPAT' : 'QUICK ACTIONS'}
                           </span>
                         </div>
                         <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent" />
                       </div>
                       
                       <div className="grid grid-cols-4 gap-2">
                         {[
                           {
                             id: 'reward',
                             label: t.rewards,
                             icon: Gift,
                             color: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
                           },
                           {
                             id: 'leaderboard',
                             label: 'Leaderboard',
                             icon: Trophy,
                             color: 'text-yellow-400 border-yellow-500/15 bg-yellow-500/5',
                           },
                           {
                             id: 'luckyspin',
                             label: 'Lucky Spin',
                             icon: Compass,
                             color: 'text-fuchsia-400 border-fuchsia-500/15 bg-fuchsia-500/5',
                           },
                           {
                             id: 'network',
                             label: t.network,
                             icon: Network,
                             color: 'text-amber-500 border-amber-500/15 bg-amber-500/5',
                           },
                         ].map((menu) => {
                           const Icon = menu.icon;
                           return (
                             <button
                               key={menu.id}
                               onClick={() => {
                                 if (menu.id === 'reward') {
                                   setCurrentTab('reward');
                                 } else if (menu.id === 'leaderboard') {
                                   setCurrentTab('leaderboard');
                                 } else if (menu.id === 'luckyspin') {
                                   setCurrentTab('luckyspin');
                                 } else if (menu.id === 'network') {
                                   setCurrentTab('network');
                                 }
                               }}
                               className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/45 border border-amber-500/10 hover:border-amber-500/30 active:scale-95 transition-all duration-200 cursor-pointer text-center group"
                             >
                               <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-1 transition-colors ${menu.color} group-hover:scale-110`}>
                                 <Icon className="w-4 h-4" />
                               </div>
                               <span className="text-[9.5px] font-black text-slate-200 group-hover:text-amber-400 transition-colors leading-tight font-orbitron">
                                 {menu.label}
                               </span>
                             </button>
                           );
                         })}
                       </div>
                     </div>

                    </div>
                  
                  {/* SLEEK & SIMPLE PORTFOLIO CARD */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#2a1b08] via-[#120a24] to-[#05030e] border border-amber-500/40 rounded-3xl p-4 shadow-[0_0_25px_rgba(245,158,11,0.12)] transition duration-300">
                      {/* Ambient Glow */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse" />
                      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex justify-between items-center mb-3.5 relative z-10">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-widest uppercase font-orbitron">
                            {language === 'id' ? 'PORTOFOLIO SAYA' : 'MY PORTFOLIO'}
                          </span>
                        </div>
                        <span className={`text-[7.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                          state.activeContracts > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {state.activeContracts > 0 
                            ? (language === 'id' ? 'AKTIF' : 'ACTIVE') 
                            : (language === 'id' ? 'NONAKTIF' : 'INACTIVE')}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2.5 relative z-10 text-left">
                        {/* Nilai Kontrak Aktif */}
                        <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
                          <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                            {language === 'id' ? 'NILAI KONTRAK AKTIF' : 'ACTIVE PORTFOLIO'}
                          </span>
                          <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
                            Rp {totalPortfolioValue.toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Jumlah Kontrak */}
                        <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
                          <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                            {language === 'id' ? 'JUMLAH KONTRAK' : 'TOTAL UNITS'}
                          </span>
                          <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
                            {state.activeContracts} UNIT
                          </div>
                        </div>

                        {/* Estimasi Profit Harian */}
                        <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
                          <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                            {language === 'id' ? 'ESTIMASI PROFIT HARIAN' : 'EST. DAILY PROFIT'}
                          </span>
                          <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
                            Rp {dailyYield.toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Batas Plafon */}
                        <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-3 hover:border-amber-500/25 transition-colors">
                          <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                            {language === 'id' ? 'BATAS PLAFON' : 'MAX LIMIT'}
                          </span>
                          <div className="text-[13.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-orbitron leading-tight">
                            Rp {maxPossibleEarnings.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>

                      {/* Simple alert message if zero contracts */}
                      {state.activeContracts === 0 && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-[#1e1303] via-[#0b071a] to-[#1e1303] border border-amber-500/25 rounded-2xl flex items-center justify-between gap-3 relative z-10 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                          <span className="text-[8px] font-bold text-white text-left leading-relaxed font-orbitron tracking-wider">
                            {language === 'id' 
                              ? 'Mulai beli kontrak emas untuk mengaktifkan portfolio.' 
                              : 'Purchase gold contract to activate portfolio.'}
                          </span>
                          <button
                            onClick={() => setCurrentTab('contract')}
                            className="text-[8px] font-black text-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer shrink-0 font-orbitron"
                          >
                            {language === 'id' ? 'Beli Kontrak' : 'Buy Contract'}
                          </button>
                        </div>
                      )}
                    </div>



                  {/* CAPPING PROGRESS PANEL */}
                  <div className="bg-[#0b051a] border border-purple-500/10 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider">
                          {t.cappingProgress}
                        </div>
                        <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          {t.maxEarnings} (250% Max)
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase ${
                        isCappedLimitMet
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : cappingRatio > 80
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isCappedLimitMet ? 'CAPPED' : 'IN PROGRESS'}
                      </div>
                    </div>

                    {/* Circular meter layout & stats detail split */}
                    <div className="flex items-center gap-6">
                      {(() => {
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const currentPercent = cappingRatio > 0 ? Math.max(0.8, cappingRatio) : 0;
                        const dashoffset = circumference - (currentPercent / 100) * circumference;
                        return (
                          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                            {/* SVG Progress Ring */}
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                              <defs>
                                <linearGradient id="capping-gold-grad" x1="1" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#FFD54A" />
                                  <stop offset="100%" stopColor="#F59E0B" />
                                </linearGradient>
                              </defs>
                              {/* Background Ring */}
                              <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="#1f1b2e"
                                strokeWidth="6"
                                fill="transparent"
                              />
                              {/* Progress Ring */}
                              <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="url(#capping-gold-grad)"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashoffset}
                                strokeLinecap="round"
                                style={{
                                  transition: 'stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                              />
                            </svg>
                            <div className="relative z-10 text-center">
                              <div className="text-xl font-black text-yellow-400 font-orbitron leading-none">
                                {cappingPercentStr}%
                              </div>
                              <span className="text-[7px] text-slate-400 font-bold block mt-1">OF 250%</span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex-1 space-y-2.5 text-xs font-semibold">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-400 text-[10px]">{language === 'id' ? 'Penghasilan Capping' : 'Capping Earnings'}</span>
                          <span className="text-white font-bold">Rp {cappingEarnings.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-400 text-[10px]">{t.maxEarnings}</span>
                          <span className="text-white font-bold">Rp {maxPossibleEarnings.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">{t.remaining}</span>
                          <span className="text-amber-500 font-bold">
                            Rp {Math.max(0, maxPossibleEarnings - cappingEarnings).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Footer */}
                    <div className="mt-5 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-2">
                        <span>Rp {cappingEarnings.toLocaleString('id-ID')}</span>
                        <span>Rp {maxPossibleEarnings.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 via-gold-primary to-yellow-300"
                          style={{ width: `${cappingRatioVisual}%` }}
                        />
                      </div>

                      {/* Yield Claim Action */}
                      <button
                        onClick={() => setHarvestModalOpen(true)}
                        className={`w-full py-3 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-2 mt-4 cursor-pointer ${
                          claimCooldownText !== ''
                            ? 'bg-slate-900 border border-white/5 text-slate-400'
                            : isCappedLimitMet
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                            : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 hover:brightness-110 shadow-lg shadow-gold-primary/25 text-black'
                        }`}
                      >
                        {claimCooldownText !== '' ? (
                          <>
                            <ClockIcon className="w-4 h-4 animate-pulse" />
                            <span>{language === 'id' ? `Klaim dalam ${claimCooldownText}` : `Claim in ${claimCooldownText}`}</span>
                          </>
                        ) : isCappedLimitMet ? (
                          <span>CAPPING SELESAI</span>
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            <span>{t.claimReward} ({(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>



                </div>
                )
              )}

              {/* 👥 COMMUNITY VIEW */}
              {currentTab === 'community' && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-orbitron">
                      {language === 'id' ? 'KOMUNITAS RESMI' : 'OFFICIAL COMMUNITY'}
                    </h2>
                  </div>

                  {/* Member Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
                      <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">{language === 'id' ? 'Anggota' : 'Members'}</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">124.8K</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
                      <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">{language === 'id' ? 'Aktif' : 'Active'}</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">42.9K</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
                      <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">Hashrate</span>
                      <span className="text-xs font-black text-yellow-500 font-mono">4.82 EH/s</span>
                    </div>
                  </div>

                  {/* Social Groups Grid */}
                  <div className="bg-[#0b0519] border border-emerald-500/15 rounded-3xl p-4 shadow-xl space-y-3">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
                      {language === 'id' ? 'Gabung Komunitas Kami' : 'Join Our Communities'}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => {
                          setSharedReferral(true);
                          triggerModal(language === 'id' ? '🎉 Berhasil terhubung ke WhatsApp VIP Lounge!' : '🎉 Connected to WhatsApp VIP Lounge!', 'success');
                        }}
                        className="w-full p-3 rounded-2xl bg-[#091f14] border border-emerald-500/20 hover:border-emerald-400/40 transition flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <MessageCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white leading-none">WhatsApp VVIP Lounge</div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">{language === 'id' ? 'Khusus Deposit Premium' : 'Premium Depositors Only'}</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-400 font-black group-hover:translate-x-1 transition-transform">JOIN ➔</span>
                      </button>

                      <button
                        onClick={() => {
                          setSharedReferral(true);
                          triggerModal(language === 'id' ? '🎉 Berhasil terhubung ke Telegram GrockGold Official!' : '🎉 Connected to Telegram GrockGold Official!', 'success');
                        }}
                        className="w-full p-3 rounded-2xl bg-[#0a1829] border border-blue-500/20 hover:border-blue-400/40 transition flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Send className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white leading-none">Telegram GrockGold Indo</div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">48,203 Active Subscribers</span>
                          </div>
                        </div>
                        <span className="text-xs text-blue-400 font-black group-hover:translate-x-1 transition-transform">JOIN ➔</span>
                      </button>

                      <button
                        onClick={() => {
                          setSharedReferral(true);
                          triggerModal(language === 'id' ? '🎉 Berhasil terhubung ke Discord Server Hub!' : '🎉 Connected to Discord Server Hub!', 'success');
                        }}
                        className="w-full p-3 rounded-2xl bg-[#110e24] border border-indigo-500/20 hover:border-indigo-400/40 transition flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <MessageSquare className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white leading-none">Discord Global Server</div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">12,410 Online Hashing Leaders</span>
                          </div>
                        </div>
                        <span className="text-xs text-indigo-400 font-black group-hover:translate-x-1 transition-transform">JOIN ➔</span>
                      </button>
                    </div>
                  </div>

                  {/* Announcement Official Feed */}
                  <div className="bg-[#0b0519] border border-white/5 rounded-3xl p-4 shadow-xl space-y-3">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      {language === 'id' ? 'PENGUMUMAN RESMI' : 'OFFICIAL ANNOUNCEMENTS'}
                    </div>

                    <div className="space-y-2.5">
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3">
                        <div className="text-[10px] font-black text-amber-400 mb-0.5">✨ GROCKGOLD PARTNERS WITH WEST AFRICA MINING EXPO</div>
                        <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                          {language === 'id' 
                            ? 'Mulai Juli 2026, GrockGold resmi mensponsori Expo Tambang Barat untuk ekspansi unit ekskavasi EXC-900.' 
                            : 'Starting July 2026, GrockGold sponsors the West Africa Mining Expo to expand cloud-based mining operations.'}
                        </p>
                        <span className="text-[8px] text-slate-500 block mt-2 font-mono">2026-07-15 10:24</span>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3">
                        <div className="text-[10px] font-black text-cyan-400 mb-0.5">⚡ SERVER CLUSTER EXC-900 LAUNCHED</div>
                        <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                          {language === 'id' 
                            ? 'Meningkatkan hashrate rata-rata global sebesar +25%. Proses sinkronisasi klaim saldo harian sekarang berjalan 2x lebih cepat.' 
                            : 'Increases global hashing bandwidth by +25%. Daily balance claim calculations are now twice as fast.'}
                        </p>
                        <span className="text-[8px] text-slate-500 block mt-2 font-mono">2026-07-14 18:40</span>
                      </div>
                    </div>
                  </div>

                  {/* Chatroom Live Discussion */}
                  <div className="bg-[#0b0519] border border-purple-500/10 rounded-3xl p-4 shadow-xl space-y-3 flex flex-col h-[320px]">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-1 flex justify-between items-center">
                      <span>💬 {language === 'id' ? 'Obrolan Komunitas (Live)' : 'Community Chat (Live)'}</span>
                      <span className="text-[8px] text-emerald-400 animate-pulse">● 4,921 ONLINE</span>
                    </div>

                    {/* Chat Messages Scrolling viewport */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
                      {communityMessages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-2.5 ${msg.isSelf ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] font-black border ${msg.isSelf ? 'bg-gradient-to-r from-yellow-300 to-gold-primary border-yellow-400 text-black' : 'bg-purple-900/45 text-purple-200 border-purple-800/30'}`}>
                            {msg.initials}
                          </div>
                          <div className={`flex flex-col max-w-[70%] ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                            <span className="text-[8px] font-black text-slate-400 mb-0.5 flex items-center gap-1">
                              @{msg.user}
                              {msg.user === 'admin' && <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1 rounded text-[7px]">STAFF</span>}
                            </span>
                            <div className={`p-2.5 rounded-2xl text-[10px] font-semibold leading-normal ${msg.isSelf ? 'bg-purple-800/20 text-yellow-300 border border-purple-500/20 rounded-tr-none' : 'bg-white/[0.02] text-slate-200 border border-white/5 rounded-tl-none'}`}>
                              {msg.text}
                            </div>
                            <span className="text-[7.5px] text-slate-500 mt-1 font-mono">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Input Field Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!chatInput.trim()) return;
                        const now = new Date();
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        const newMsg = {
                          id: Date.now().toString(),
                          user: state.username.toLowerCase(),
                          text: chatInput,
                          time: timeStr,
                          initials: state.username.slice(0, 2).toUpperCase(),
                          isSelf: true
                        };
                        setCommunityMessages(prev => [...prev, newMsg]);
                        setChatInput('');
                        
                        // Fake Auto Response from random user or staff in 2 seconds
                        setTimeout(() => {
                          const botNames = ['andi_wijaya', 'sari_grock', 'm_ikbal', 'admin'];
                          const botInitials = ['AW', 'SG', 'MI', 'AD'];
                          const botResponses = [
                            'Mantap gan! Hashing hashrate saya hari ini tembus 12% profit harian.',
                            'Ada yang tahu min WD hari ini berapa ya?',
                            'Min WD cuma Rp 100.000 saja kak, prosesnya super instan langsung masuk!',
                            'Selamat bergabung semuanya! Silakan hubungi Telegram Group untuk panduan claim welcome bonus 1.8M.'
                          ];
                          const idx = Math.floor(Math.random() * botResponses.length);
                          setCommunityMessages(prev => [...prev, {
                            id: (Date.now() + 1).toString(),
                            user: botNames[idx],
                            text: botResponses[idx],
                            time: timeStr,
                            initials: botInitials[idx],
                            isSelf: false
                          }]);
                        }, 2000);
                      }}
                      className="flex gap-2 pt-2 border-t border-white/5"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={language === 'id' ? 'Ketik pesan Anda...' : 'Type message here...'}
                        className="flex-1 bg-black/55 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/40"
                      />
                      <button
                        type="submit"
                        className="p-2.5 bg-gradient-to-r from-yellow-300 to-gold-primary text-black font-extrabold rounded-xl transition hover:brightness-110 active:scale-95 cursor-pointer"
                      >
                        <Send className="w-4 h-4 text-black" />
                      </button>
                    </form>
                  </div>
                </div>
              )}



              {/* 🎡 LUCKY SPIN VIEW */}
              {currentTab === 'luckyspin' && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent font-orbitron">
                      {language === 'id' ? 'RODA BERHADIAH' : 'LUCKY SPIN WHEEL'}
                    </h2>
                  </div>

                  {/* Free Spin Timer / Ticket Counter */}
                  <div className="bg-gradient-to-br from-[#1b082e] to-[#0a0314] border border-fuchsia-500/20 rounded-3xl p-4 shadow-xl flex justify-between items-center">
                    <div>
                      <span className="text-[8.5px] font-black tracking-widest text-fuchsia-400 block uppercase mb-1">{language === 'id' ? 'TIKET PUTARAN' : 'AVAILABLE SPINS'}</span>
                      <div className="text-xl font-black text-white font-orbitron flex items-center gap-1.5 leading-none">
                        🎟️ {spinTickets} <span className="text-[9.5px] text-slate-500 font-sans font-extrabold uppercase">Tickets</span>
                      </div>
                    </div>
                    <div className="bg-black/55 border border-white/5 rounded-2xl px-3.5 py-2.5 text-right">
                      <span className="text-[7.5px] text-slate-500 font-bold block uppercase mb-0.5">{language === 'id' ? 'TIKET GRATIS BERIKUTNYA' : 'NEXT FREE SPIN'}</span>
                      <span className="text-[11px] font-mono font-black text-amber-400 animate-pulse">02:45:12</span>
                    </div>
                  </div>

                  {/* Physical Rotating Wheel Canvas Area */}
                  <div className="bg-[#0b0519] border border-purple-500/10 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Glowing outer ring */}
                    <div className="relative w-56 h-56 rounded-full border-4 border-yellow-500 bg-[#120735] shadow-[0_0_25px_rgba(234,179,8,0.45)] flex items-center justify-center overflow-hidden mb-6 z-10"
                      style={{ 
                        transform: `rotate(${spinRotation}deg)`,
                        transition: isSpinning ? 'transform 3.6s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
                      }}
                    >
                      {/* Outer Ring Circle details */}
                      <div className="absolute inset-0 border-8 border-purple-900/40 pointer-events-none z-20" />
                      
                      {/* segments */}
                      {SPIN_ITEMS.map((item, idx) => {
                        const angle = idx * 45;
                        return (
                          <div 
                            key={idx}
                            className="absolute inset-0 origin-center"
                            style={{ transform: `rotate(${angle}deg)` }}
                          >
                            {/* Line separator */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-1/2 bg-yellow-500/25 origin-bottom z-10" />
                            
                            {/* Segment text label rotating to fit segment triangle */}
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase text-center"
                              style={{ 
                                transform: 'rotate(22.5deg)',
                                color: item.type === 'zonk' ? '#94a3b8' : item.type === 'boost' ? '#38bdf8' : '#facc15'
                              }}
                            >
                              <div>{item.label}</div>
                              <div className="text-[6px] opacity-40 leading-none mt-0.5">{item.type === 'zonk' ? '❌' : '💰'}</div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Golden Spinner Center Pin Hub */}
                      <div className="absolute w-12 h-12 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-full border-2 border-white/90 z-30 shadow-2xl flex items-center justify-center font-black text-black text-[9px] tracking-wide uppercase leading-none">
                        GGM
                      </div>
                    </div>

                    {/* Wheel pointer at the top */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />

                    {/* SPIN TRIGGER BUTTON */}
                    <button
                      onClick={() => {
                        if (isSpinning) return;
                        if (spinTickets <= 0) {
                          triggerModal(
                            language === 'id'
                              ? '❌ TIKET HABIS\n\nTiket Lucky Spin Anda sudah habis. Silakan tunggu hitung mundur atau selesaikan misi harian untuk mendapatkan lebih banyak tiket spin gratis!'
                              : '❌ OUT OF TICKETS\n\nYour Lucky Spin tickets have run out. Please wait for the countdown or complete missions to get more free spin tickets!',
                            'warning'
                          );
                          return;
                        }

                        const randomIndex = Math.floor(Math.random() * SPIN_ITEMS.length);
                        const degreePerSegment = 360 / SPIN_ITEMS.length;
                        const extraSpins = 6;
                        const targetRotation = spinRotation + (extraSpins * 360) + (360 - (randomIndex * degreePerSegment)) - (spinRotation % 360);

                        setIsSpinning(true);
                        setSpinRotation(targetRotation);
                        setSpinPrizeIndex(randomIndex);
                        setSpinTickets(prev => prev - 1);
                        setSpinCount(prev => prev + 1);

                        setTimeout(() => {
                          setIsSpinning(false);
                          const prize = SPIN_ITEMS[randomIndex];
                          
                          const newHistoryItem = {
                            id: Date.now().toString(),
                            prize: prize.label,
                            date: Date.now(),
                            success: prize.type !== 'zonk'
                          };
                          setLuckySpinHistory(prev => [newHistoryItem, ...prev]);

                          if (prize.type === 'cash') {
                            const newTx: Transaction = {
                              id: 'SPN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                              type: 'reward',
                              amount: prize.value,
                              date: Date.now(),
                              description: language === 'id' ? `Hadiah Lucky Spin Wheel` : `Lucky Spin Wheel Prize`,
                            };
                            
                            updateState(prev => ({
                              ...prev,
                              mainBalance: prev.mainBalance + prize.value,
                              totalEarned: prev.totalEarned + prize.value,
                              transactions: [newTx, ...prev.transactions],
                            }), true);

                            triggerModal(
                              language === 'id'
                                ? `🎉 SELAMAT!\n\nAnda memenangkan Saldo sebesar Rp ${prize.value.toLocaleString('id-ID')} dari Lucky Spin Wheel!\n\nHadiah telah ditambahkan ke Saldo Utama Anda.`
                                : `🎉 CONGRATULATIONS!\n\nYou won a Balance of Rp ${prize.value.toLocaleString('id-ID')} from the Lucky Spin Wheel!\n\nThe prize has been added to your Main Balance.`,
                              'success'
                            );
                          } else if (prize.type === 'boost') {
                            setBoostTimeLeft(300);
                            setShowBoosterRipple(true);
                            triggerModal(
                              language === 'id'
                                ? `⚡ BOOSTER AKTIF!\n\nAnda memenangkan Booster Kecepatan Tambang ${prize.value}x selama 5 menit!\n\nKecepatan penambangan kontrak Anda meningkat secara masif!`
                                : `⚡ BOOSTER ACTIVE!\n\nYou won a ${prize.value}x Mining Speed Booster for 5 minutes!\n\nYour mining speed has increased massively!`,
                              'success'
                            );
                          } else {
                            triggerModal(
                              language === 'id'
                                ? `😢 ZONK!\n\nSayang sekali, putaran Anda mendarat di Zonk. Jangan menyerah, silakan coba lagi!`
                                : `😢 ZONK!\n\nBad luck! Your spin landed on Zonk. Don't give up, try again!`,
                              'info'
                            );
                          }
                        }, 3600);
                      }}
                      disabled={isSpinning || spinTickets <= 0}
                      className={`w-full max-w-[200px] py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 shadow-lg ${isSpinning ? 'bg-purple-950 border border-white/5 text-slate-500 cursor-not-allowed' : spinTickets === 0 ? 'bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-500 text-black hover:brightness-110 active:scale-95 cursor-pointer shadow-yellow-500/20'}`}
                    >
                      {isSpinning ? (language === 'id' ? 'MEMUTAR...' : 'SPINNING...') : spinTickets === 0 ? (language === 'id' ? 'TIKET HABIS' : 'OUT OF TICKETS') : (language === 'id' ? 'PUTAR SEKARANG' : 'SPIN NOW')}
                    </button>
                  </div>

                  {/* Possible Prizes Table list */}
                  <div className="bg-[#0b0519] border border-white/5 rounded-3xl p-4 shadow-xl space-y-3">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{language === 'id' ? 'Daftar Hadiah Tersedia' : 'Available Prizes & Odds'}</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{language === 'id' ? 'Rp 50.000 Tunai' : 'Rp 50,000 Cash'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span>{language === 'id' ? 'Boost Tambang 10x' : '10x Mine Boost'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{language === 'id' ? 'Rp 25.000 Tunai' : 'Rp 25,000 Cash'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
                        <span>{language === 'id' ? 'Boost Tambang 5x' : '5x Mine Boost'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Spin Result History */}
                  <div className="bg-[#0b0519] border border-white/5 rounded-3xl p-4 shadow-xl space-y-3">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{language === 'id' ? 'Riwayat Putaran Anda' : 'Your Spin History'}</div>
                    
                    <div className="space-y-2">
                      {luckySpinHistory.map((item, idx) => (
                        <div key={item.id} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">🎟️</span>
                            <span className="text-[10px] font-black text-white">{language === 'id' ? 'Putaran Berhasil' : 'Successful Spin'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black ${item.success ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {item.prize}
                            </span>
                            <span className="text-[8px] text-slate-505 font-mono">
                              {new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ⚡ LIVE MINING VIEW */}
              {currentTab === 'livemining' && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-400 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">
                      {language === 'id' ? 'LIVE MINING TERMINAL' : 'LIVE MINING TERMINAL'}
                    </h2>
                  </div>

                  {/* LIVE GOLD SPOT MARKET CHART & GLOBAL REAL-TIME FEED */}
                  <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">Loading Chart...</div>}>
                    <GoldMarketChart language={language} />
                  </Suspense>

                  {/* LIVE MINING CONTAINER */}
                  <div id="liveMiningContainer" className="bg-[#0b051a] border border-purple-500/10 rounded-3xl p-5 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Cpu className={`w-3.5 h-3.5 ${state.activeContracts > 0 ? 'text-emerald-400 animate-spin' : 'text-rose-500'}`} />
                          {state.activeContracts > 0 ? t.miningSystemActive : t.miningSystemInactive}
                        </div>
                        <div className="text-lg font-black text-gradient-gold font-orbitron mt-1">
                          {state.goldProduction.toFixed(4)} oz
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{t.goldProdToday}</div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase flex items-center gap-1.5 ${
                        state.activeContracts > 0
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${state.activeContracts > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                        {state.activeContracts > 0 ? 'RUNNING' : 'INACTIVE'}
                      </div>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-3 mb-4 flex justify-between text-center">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold block mb-0.5">{t.efficiency}</span>
                        <span className="text-xs font-black text-white">{state.activeContracts > 0 ? '100%' : '0%'}</span>
                      </div>
                      <div className="w-[1px] bg-white/5" />
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold block mb-0.5">{t.fleetActive}</span>
                        <span className="text-xs font-black text-white">{state.activeContracts} Unit</span>
                      </div>
                      <div className="w-[1px] bg-white/5" />
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold block mb-0.5">CYCLE STEP</span>
                        <span className="text-xs font-black text-purple-400">{Math.round(state.cyclePercent)}%</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-900 border border-purple-900/15 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 via-gold-primary to-yellow-300 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                        style={{ width: `${state.cyclePercent}%` }}
                      />
                    </div>

                    {/* READY TO HARVEST (PENDING YIELD) WIDGET */}
                    <div 
                      onClick={() => setHarvestModalOpen(true)}
                      className="bg-[#120a26] border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3 relative overflow-hidden cursor-pointer group transition-all duration-300 shadow-md shadow-emerald-500/5 hover:shadow-emerald-500/10"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="flex-1 min-w-0 text-left relative z-10">
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase mb-1 tracking-wider">
                          {language === 'id' ? 'Hasil Tambang Siap Panen (Pending Yield)' : 'Ready to Harvest (Pending Yield)'}
                        </span>
                        <div className="text-xl font-black text-emerald-400 font-orbitron flex items-center gap-2">
                          Rp {state.pendingMiningReward.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-[8.5px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-wide animate-pulse">
                            {language === 'id' ? 'KLAIM' : 'CLAIM'}
                          </span>
                        </div>
                        {state.activeContracts > 0 && !isCappedLimitMet ? (
                          <p className="text-[9px] text-slate-400 font-bold mt-1 leading-relaxed">
                            +{((state.activeContracts * CONFIG.PRICE_PER_UNIT * CONFIG.DAILY_REWARD_PERCENT) / 86400).toLocaleString('id-ID', { minimumFractionDigits: 4 })} Rp/s dipindahkan ke mining system aktif
                          </p>
                        ) : (
                          <p className="text-[9px] text-slate-500 font-semibold mt-1 leading-relaxed">
                            {language === 'id' ? 'Sistem mining nonaktif (Miliki kontrak aktif untuk memicu)' : 'Mining system inactive (Own active contracts to trigger)'}
                          </p>
                        )}
                      </div>
                      
                      {/* Harvest Hub Interactive Action Icon */}
                      <div className="relative z-10 w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all duration-300">
                        <Coins className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                    </div>

                    {/* EXC-700 CLOUD EXCAVATOR BOOSTER PANEL */}
                    <div className="bg-black/25 border border-purple-950/40 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3.5 relative overflow-hidden">
                      {/* Central Interactive Gear / Haptic Touch Core */}
                      <div className="relative flex items-center justify-center w-14 h-14 shrink-0 cursor-pointer group" onClick={handleTapBooster}>
                        {/* Hashing Energy Halo */}
                        <div className={`absolute inset-0 rounded-full border border-dashed ${
                          boostTimeLeft > 0 
                            ? 'border-yellow-400 animate-spin' 
                            : boosterCooldownActive 
                              ? 'border-amber-500/40 animate-spin' 
                              : 'border-purple-500/30'
                        } transition-all`} style={{ animationDuration: boostTimeLeft > 0 ? '3s' : boosterCooldownActive ? '30s' : '15s' }} />
                        
                        {/* Haptic Core Button */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          boostTimeLeft > 0 
                            ? 'bg-gradient-to-tr from-yellow-300 to-yellow-600 text-black shadow-[0_0_12px_rgba(250,204,21,0.55)] scale-105' 
                            : boosterCooldownActive 
                              ? 'bg-amber-950/40 border border-amber-500/20 text-amber-500/60'
                              : 'bg-purple-950/55 border border-purple-500/20 text-gold-primary hover:bg-purple-900/40 group-hover:scale-105'
                        }`}>
                          <Cpu className={`w-4.5 h-4.5 ${boostTimeLeft > 0 ? 'animate-pulse text-black' : ''}`} />
                        </div>

                        {/* Interactive Click/Tap Ripple Effect */}
                        <AnimatePresence>
                          {showBoosterRipple && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0.8 }}
                              animate={{ scale: 1.8, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.45 }}
                              className="absolute w-12 h-12 rounded-full border-2 border-gold-primary pointer-events-none"
                            />
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-white uppercase tracking-wider truncate">
                            EXC-700 TURBO ACCELERATOR
                          </span>
                          {boostTimeLeft > 0 ? (
                            <span className="text-[8px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wide animate-pulse">
                              +50% HASH SPEED
                            </span>
                          ) : boosterCooldownActive ? (
                            <span className="text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
                              COOLDOWN
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                          {language === 'id' ? 'Ketuk roda gigi untuk memicu putaran cepat kompresor hashing 15 detik.' : 'Tap the active core gears to accelerate cloud hashing compressor speeds for 15 seconds.'}
                        </p>
                        
                        {/* Boost Dynamic Progress bar */}
                        {boostTimeLeft > 0 ? (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-[8px] text-yellow-400 font-black">
                              <span>ACTIVE HARVEST SPEEDUP</span>
                              <span>{boostTimeLeft} DETIK</span>
                            </div>
                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 transition-all duration-1000 ease-linear" style={{ width: `${(boostTimeLeft / 15) * 100}%` }} />
                            </div>
                          </div>
                        ) : boosterCooldownActive ? (
                          <div className="mt-2">
                            <button
                              onClick={handleTapBooster}
                              className="w-full px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg text-[8.5px] font-black uppercase transition tracking-wider flex items-center justify-between"
                            >
                              <span>{language === 'id' ? 'COOLDOWN AKTIF' : 'COOLDOWN ACTIVE'}</span>
                              <span className="font-mono text-[9px] bg-amber-500/20 px-1.5 rounded font-bold">{boosterCooldownStr}</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleTapBooster}
                            className="mt-2 px-2.5 py-1 bg-gold-primary/10 hover:bg-gold-primary/20 border border-gold-primary/20 text-gold-primary rounded-lg text-[8.5px] font-black uppercase transition tracking-wider"
                          >
                            {language === 'id' ? 'AKTIFKAN TURBO BOOST' : 'ENGAGE TURBO BOOST'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Operational Mines banner */}
                    <div className="bg-black/20 border border-purple-950/20 rounded-2xl p-3.5">
                      <div className="text-[9px] font-extrabold text-gold-primary tracking-widest text-center uppercase mb-2.5">
                        {t.operationalSites}
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-center">
                        {['🇿🇦 S. Africa', '🇬🇭 Ghana', '🇲🇱 Mali', '🇹🇿 Tanzania'].map((site) => (
                          <div key={site} className="py-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-slate-300">
                            {site}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN PANEL VIEW REMOVED FROM NESTED TABS */}

              {/* CONTRACT STORE VIEW */}
              {currentTab === 'contract' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 shrink-0">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-xs font-black tracking-widest text-white uppercase">{t.contractStore}</h2>
                  </div>

                  <div className="bg-gradient-to-tr from-[#251b10] to-[#120a26] border border-gold-primary/30 rounded-xl p-2.5 flex justify-between items-center shadow-lg shrink-0 mt-1">
                    <div className="text-left">
                      <div className="text-[9px] font-extrabold text-gold-primary uppercase tracking-widest mb-0.5">
                        {t.availableBalance}
                      </div>
                      <div className="text-lg font-black text-white font-sans tracking-wide">
                        Rp {state.mainBalance.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab('deposit')}
                      className="px-3 py-1.5 bg-gradient-to-r from-yellow-300 to-gold-primary text-black font-extrabold rounded-lg text-[10px] tracking-wide transition cursor-pointer hover:brightness-110"
                    >
                      + TOP UP
                    </button>
                  </div>

                  {/* Stock Contract Specs Product Card */}
                  <div className="bg-gradient-to-b from-[#140b28] via-[#0d071d] to-[#07030e] border border-gold-primary/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(234,179,8,0.08)] relative overflow-hidden flex flex-col gap-5 mt-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    {/* 1. Judul & deskripsi */}
                    <div className="border-b border-white/5 pb-3 text-left">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400 shrink-0" />
                        <div className="text-sm font-black text-gradient-gold uppercase tracking-wider font-sans">
                          {t.stockContract}
                        </div>
                      </div>
                      <div className="pl-7 mt-1">
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                          {t.contractDesc}
                        </p>
                      </div>
                    </div>

                    {/* 2. Harga Unit, Hasil Harian, Capping Limit */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#0c061e] border border-gold-primary/10 rounded-lg p-2 flex flex-col justify-center min-h-[60px]">
                        <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-1">{language === 'id' ? 'HARGA UNIT' : 'UNIT PRICE'}</span>
                        <span className="text-[11px] font-black text-white">Rp {CONFIG.PRICE_PER_UNIT.toLocaleString('id-ID')}</span>
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">{t.perUnit}</span>
                      </div>
                      <div className="bg-[#0c061e] border border-purple-500/10 rounded-lg p-2 flex flex-col justify-center min-h-[60px]">
                        <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-1">{language === 'id' ? 'HASIL HARIAN' : 'DAILY YIELD'}</span>
                        <span className="text-[11px] font-black text-emerald-400">+{(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%</span>
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">Rp {(CONFIG.PRICE_PER_UNIT * CONFIG.DAILY_REWARD_PERCENT).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="bg-[#0c061e] border border-purple-500/10 rounded-lg p-2 flex flex-col justify-center min-h-[60px]">
                        <span className="text-[7.5px] font-bold text-amber-500 tracking-wider uppercase mb-1">CAPPING LIMIT</span>
                        <span className="text-[11px] font-black text-purple-300">{(CONFIG.CAPPING_PERCENT * 100).toFixed(0)}%</span>
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">Rp {(CONFIG.PRICE_PER_UNIT * CONFIG.CAPPING_PERCENT).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* 3. Informasi hasil tambang harian */}
                    <p className="text-[10px] text-slate-300 leading-relaxed font-medium text-center bg-purple-950/25 border border-purple-900/20 rounded-xl py-2 px-3">
                      ✨ {language === 'id' ? 'Hasil tambang harian otomatis dikreditkan langsung ke saldo akun Anda.' : 'Daily mining yields are automatically credited directly to your account balance.'}
                    </p>

                    {/* 4. Jumlah Pembelian (+ / -) */}
                    <div className="flex justify-between items-center bg-[#0d071d] border border-white/5 rounded-xl p-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{language === 'id' ? 'JUMLAH PEMBELIAN' : 'PURCHASE QUANTITY'}</span>
                        <span className="text-[9px] text-slate-500 font-semibold">{language === 'id' ? 'Tentukan unit kontrak' : 'Specify contract units'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => adjustContractQty(-1)}
                          className="w-8 h-8 rounded-lg bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-white hover:bg-purple-900/40 active:scale-95 transition cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-black text-white w-6 text-center">{contractQty}</span>
                        <button
                          onClick={() => adjustContractQty(1)}
                          className="w-8 h-8 rounded-lg bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-white hover:bg-purple-900/40 active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 5. Total Pembayaran */}
                    <div className="flex justify-between items-center bg-[#0d071d] border border-white/5 rounded-xl p-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{language === 'id' ? 'TOTAL PEMBAYARAN' : 'TOTAL PAYMENT'}</span>
                        <span className="text-[9px] text-slate-500 font-semibold">{language === 'id' ? 'Saldo akan terpotong otomatis' : 'Balance will be deducted automatically'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-yellow-500 font-sans">
                          Rp {(contractQty * CONFIG.PRICE_PER_UNIT).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* 6. Tombol "Beli Sekarang" */}
                    <button
                      onClick={handlePurchaseContract}
                      className="w-full py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-black rounded-xl text-xs tracking-widest uppercase transition shadow-md shadow-gold-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t.buyNow}
                    </button>
                  </div>
                </div>
              )}

              {/* NETWORK VIEW */}
              {currentTab === 'network' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">{t.network}</h2>
                  </div>

                  {/* High-Tech Grid Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-purple-500/10 transition-all duration-300" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.totalMember}</span>
                      </div>
                      <div className="text-lg font-black text-white pl-0.5">
                        {totalDownlinesCount} <span className="text-[9px] text-slate-500 font-bold uppercase">{language === 'id' ? 'Mitra' : 'Members'}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-emerald-500/10 transition-all duration-300" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.activeHolder}</span>
                      </div>
                      <div className="text-lg font-black text-emerald-400 pl-0.5">
                        {activeDownlinesCount} <span className="text-[9px] text-slate-500 font-bold uppercase">{language === 'id' ? 'Aktif' : 'Active'}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-cyan-500/10 transition-all duration-300" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.totalContracts}</span>
                      </div>
                      <div className="text-lg font-black text-white pl-0.5">
                        {totalDownlineContracts} <span className="text-[9px] text-slate-500 font-bold uppercase">Unit</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-yellow-500/10 transition-all duration-300" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                          <Award className="w-3.5 h-3.5 text-yellow-400" />
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.teamVolume}</span>
                      </div>
                      <div className="text-base font-black text-gold-primary pl-0.5 truncate">
                        Rp {teamVolumeValue.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Structure Panel */}
                  <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                    <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase flex items-center gap-2 border-b border-white/5 pb-2">
                      <Network className="w-4 h-4 text-purple-400" />
                      {t.downlineStructure}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                          <div className="flex flex-col">
                            <span className="text-slate-100 font-extrabold text-xs">Level 1 (Direct)</span>
                            <span className="text-[9px] text-slate-400 font-bold">{language === 'id' ? 'Komisi Referral 10%' : '10% Referral Commission'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400">{l1Count} {language === 'id' ? 'Mitra' : 'Partners'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                          <div className="flex flex-col">
                            <span className="text-slate-100 font-extrabold text-xs">Level 2 (Indirect)</span>
                            <span className="text-[9px] text-slate-400 font-bold">{language === 'id' ? 'Komisi Referral 3%' : '3% Referral Commission'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-amber-400">{l2Count} {language === 'id' ? 'Mitra' : 'Partners'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.5)]" />
                          <div className="flex flex-col">
                            <span className="text-slate-100 font-extrabold text-xs">Level 3 (Community)</span>
                            <span className="text-[9px] text-slate-400 font-bold">{language === 'id' ? 'Komisi Referral 2%' : '2% Referral Commission'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-fuchsia-400">{l3Count} {language === 'id' ? 'Mitra' : 'Partners'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referral Commissions Split */}
                  <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                    <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-purple-400" />
                      {t.referralCommission}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-semibold">
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="text-lg font-black text-emerald-400">10%</div>
                        <span className="text-[8px] text-slate-400 font-bold block mb-1">LEVEL 1</span>
                        <div className="text-[10px] font-bold text-white truncate">Rp {(state.referralEarned * 0.65).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="text-lg font-black text-amber-400">3%</div>
                        <span className="text-[8px] text-slate-400 font-bold block mb-1">LEVEL 2</span>
                        <div className="text-[10px] font-bold text-white truncate">Rp {(state.referralEarned * 0.25).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/10">
                        <div className="text-lg font-black text-fuchsia-400">2%</div>
                        <span className="text-[8px] text-slate-400 font-bold block mb-1">LEVEL 3</span>
                        <div className="text-[10px] font-bold text-white truncate">Rp {(state.referralEarned * 0.1).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
                      </div>
                    </div>

                    <div className="bg-purple-950/25 border border-purple-500/15 rounded-2xl p-4 text-center mt-4">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.totalCommission}</span>
                      <div className="text-xl font-black bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron mt-1">
                        Rp {state.referralEarned.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* LEADERBOARD PREVIEW CARD */}
                  <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                    <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4.5 h-4.5 text-yellow-400" />
                        {language === 'id' ? 'Peringkat Penambang' : 'Mining Leaderboard'}
                      </div>
                      <button
                        onClick={() => setCurrentTab('leaderboard')}
                        className="text-[9.5px] text-yellow-400 hover:text-white font-extrabold transition uppercase tracking-wider active:scale-95 cursor-pointer"
                      >
                        {language === 'id' ? 'Lihat Semua ➔' : 'View All ➔'}
                      </button>
                    </div>

                    <div className="divide-y divide-white/5 space-y-1.5">
                      {leaderboardData.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-500 font-medium">
                          {language === 'id' ? 'Belum ada data leaderboard' : 'No leaderboard data available yet'}
                        </div>
                      ) : (
                        leaderboardData.slice(0, 3).map((entry, index) => {
                          const rank = index + 1;
                          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
                          const goldVal = entry.goldAllTime;

                          return (
                            <div 
                              key={entry.username} 
                              onClick={() => setCurrentTab('leaderboard')}
                              className="flex items-center justify-between py-2 hover:bg-white/5 px-1.5 rounded-xl transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-base">{medal}</span>
                                <span className="text-xs font-bold text-slate-100">{entry.username}</span>
                                {entry.vipLevel > 0 && (
                                  <span className="text-[7.5px] bg-yellow-600/10 text-yellow-400 border border-yellow-500/20 px-1 py-0.5 rounded leading-none font-bold">
                                    VIP {entry.vipLevel}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-black text-gold-primary font-mono">{goldVal.toFixed(4)} GLD</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DEDICATED GLOBAL LEADERBOARD VIEW */}
              {currentTab === 'leaderboard' && (
                <Leaderboard
                  accounts={accounts}
                  state={state}
                  currentAccount={currentAccount}
                  language={language}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {/* REFERRAL VIEW */}
              {currentTab === 'referral' && (
                <ReferralDashboard
                  accounts={accounts}
                  currentAccount={currentAccount}
                  state={state}
                  language={language}
                  setCurrentTab={setCurrentTab}
                  copiedCode={copiedCode}
                  copiedLink={copiedLink}
                  handleCopyCode={handleCopyCode}
                  handleCopyLink={handleCopyLink}
                  triggerModal={triggerModal}
                />
              )}

              {/* WALLET VIEW */}
              {currentTab === 'wallet' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.wallet}</h2>
                  </div>

                  {/* Split balances card */}
                  <div className="bg-gradient-to-br from-[#120a26] to-[#040108] border border-gold-primary/30 rounded-3xl p-5 shadow-2xl relative">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider block mb-1.5 uppercase">
                      {t.totalBalance}
                    </span>
                    <div className="text-3xl font-black text-gradient-gold font-orbitron mb-5">
                      Rp {(state.mainBalance + totalEarned).toLocaleString('id-ID')}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block mb-1">{t.mainBalance}</span>
                        <div className="text-sm font-black text-white">
                          Rp {state.mainBalance.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold block mb-1">{t.rewardBalance}</span>
                        <div className="text-sm font-black text-gold-primary">
                          Rp {totalEarned.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setCurrentTab('deposit')}
                      className="py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-extrabold transition flex flex-col items-center gap-1.5 shadow-md"
                    >
                      <ArrowDown className="w-4 h-4" />
                      {t.deposit}
                    </button>
                    <button
                      onClick={triggerWithdrawFlow}
                      className="py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-extrabold transition flex flex-col items-center gap-1.5 shadow-md"
                    >
                      <ArrowUp className="w-4 h-4" />
                      {t.withdraw}
                    </button>
                    <button
                      onClick={handleClaimYield}
                      className="py-3 bg-gradient-to-br from-yellow-300 to-gold-primary text-black rounded-2xl text-[10px] font-black transition flex flex-col items-center gap-1.5 shadow-lg shadow-gold-primary/10"
                    >
                      <Coins className="w-4 h-4" />
                      KLAIM REWARD
                    </button>
                  </div>

                  {/* Earnings detail */}
                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl">
                    <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase">
                      {t.earningsDetail}
                    </div>

                    <div className="space-y-3 font-semibold text-xs text-slate-300">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">📊 {t.totalEarned}</span>
                        <span className="text-white font-extrabold">Rp {totalEarned.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">⛏️ Mining Profit</span>
                        <span className="text-emerald-400 font-extrabold">Rp {miningProfit.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">💰 {language === 'id' ? 'Claim Harian 2%' : 'Daily Claim 2%'}</span>
                        <span className="text-emerald-400 font-extrabold">Rp {miningProfit.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">👥 Referral Reward</span>
                        <span className="text-amber-400 font-extrabold">Rp {referralReward.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">🔄 Rebate Reward</span>
                        <span className="text-fuchsia-400 font-extrabold">Rp {rebateReward.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">🎁 Bonus</span>
                        <span className="text-blue-400 font-extrabold">Rp {bonusReward.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* TRANSACTION HISTORY */}
                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl">
                    <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <History className="w-4.5 h-4.5" />
                        {t.txHistory}
                      </div>
                      <button 
                        onClick={() => setCurrentTab('transactions')}
                        className="text-[10px] text-amber-400 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 outline-none"
                      >
                        {language === 'id' ? 'Lihat Semua' : 'View All'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {state.transactions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 font-bold text-xs space-y-1">
                          <div>{t.emptyTx}</div>
                        </div>
                      ) : (
                        state.transactions.map((tx) => (
                          <div key={tx.id} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-none">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                tx.type === 'deposit'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : tx.type === 'withdraw'
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : 'bg-gold-primary/10 text-gold-primary'
                              }`}>
                                {tx.type === 'deposit' ? <ArrowDown className="w-4 h-4" /> : tx.type === 'withdraw' ? <ArrowUp className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white block leading-tight">{tx.description}</span>
                                {tx.type === 'deposit' && tx.rejectionReason && (
                                  <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md mt-1 inline-block leading-tight">
                                    {language === 'id' ? `Alasan: ${tx.rejectionReason}` : `Reason: ${tx.rejectionReason}`}
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-400 block mt-0.5">
                                  {new Date(tx.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>

                            <span className={`text-xs font-black ${
                              tx.type === 'deposit' || tx.type === 'reward' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* REWARDS VIEW */}
              {currentTab === 'reward' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.rewards}</h2>
                  </div>

                  {/* WELCOME BONUS CARD */}
                  <div className="relative overflow-hidden bg-gradient-to-b from-[#110825] via-[#0b0518] to-[#070310] border border-amber-500/35 p-6 md:p-7 rounded-3xl shadow-[0_25px_60px_rgba(245,158,11,0.15)] group transition-all duration-500 hover:border-amber-400/55">
                    {/* Metallic Gold excavator background artwork */}
                    <div className="absolute right-0 bottom-0 w-1/2 h-[75%] md:h-[80%] pointer-events-none z-0 overflow-hidden opacity-30 group-hover:opacity-45 transition-opacity duration-700">
                      <img 
                        src="/src/assets/images/gold_excavator_1784416439957.jpg" 
                        alt="Gold Excavator" 
                        className="w-full h-full object-contain object-bottom mix-blend-screen scale-110 group-hover:scale-115 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Laser Grid Background overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.012)_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none z-0" />

                    {/* Luxurious Golden Glow effects */}
                    <div className="absolute -top-32 -right-32 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition duration-1000 group-hover:bg-amber-500/18 z-0" />
                    <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl pointer-events-none z-0" />
                    
                    {/* Golden top neon border line */}
                    <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_1px_10px_rgba(251,191,36,0.6)] z-10" />
                    
                    <div className="relative z-10">
                    
                    {/* Top Header Row */}
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div>
                        {/* Luxury Minimalist Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-full mb-3 shadow-[0_0_12px_rgba(245,158,11,0.06)]">
                          <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span className="text-[9.5px] font-bold tracking-widest text-amber-300 uppercase font-mono">
                            {language === 'id' ? 'WELCOME BONUS PROGRAM' : 'WELCOME BONUS PROGRAM'}
                          </span>
                        </div>
                        
                        {/* Premium Large Gold Amount with Diamond Accent */}
                        <div className="flex items-baseline gap-1 font-sans tracking-tight mt-1.5">
                          <span className="text-lg md:text-xl font-bold text-amber-500 mr-1">Rp.</span>
                          <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 tracking-tight tabular-nums drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)] leading-none select-none">
                            {CONFIG.WELCOME_BONUS_AMOUNT.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Info Button */}
                      <button
                        type="button"
                        onClick={() => setShowBonusSchemaModal(true)}
                        className="w-8.5 h-8.5 rounded-full bg-slate-950/90 hover:bg-slate-900 text-amber-400 hover:text-amber-300 flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-md border border-amber-500/35 hover:border-amber-400 hover:shadow-amber-500/10 active:scale-90 cursor-pointer"
                        title={language === 'id' ? 'Info Persyaratan' : 'Requirement Info'}
                      >
                        ?
                      </button>
                    </div>

                    {/* Description Text */}
                    <p className="text-[11.5px] text-slate-200/90 font-medium leading-relaxed mb-6 relative z-10 border-l-2 border-amber-500/30 pl-3">
                      {language === 'id' 
                        ? 'Klaim subsidi dana modal penambangan langsung cair ke saldo utama Anda begitu seluruh target rekan aktif di bawah ini terpenuhi.' 
                        : 'Claim a direct mining capital grant credited instantly to your main balance once all active partner targets below are achieved.'}
                    </p>

                    {/* Clean Premium Requirement & Progress Box */}
                    <div className="bg-gradient-to-b from-slate-950/95 to-slate-950/40 border border-amber-500/20 rounded-xl p-5 mb-5.5 relative z-10 space-y-4 shadow-[inset_0_1px_8px_rgba(0,0,0,0.6)]">
                      <div className="flex justify-between items-center gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-amber-500/60 font-black uppercase tracking-widest block leading-none">
                            {language === 'id' ? 'TARGET KEMITRAAN' : 'PARTNERSHIP TARGET'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-100 font-extrabold tracking-tight">
                              {language === 'id' ? `Minimal ${CONFIG.REQUIRED_HOLDERS} Holder Aktif` : `Minimum ${CONFIG.REQUIRED_HOLDERS} Active Holders`}
                            </span>
                          </div>
                          <div className="flex items-center mt-2">
                            <span className="text-[9.5px] px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/25 uppercase tracking-widest font-mono shadow-sm">
                              {language === 'id' ? `${Math.min(100, Math.round(bonusProgressRatio))}% Tercapai` : `${Math.min(100, Math.round(bonusProgressRatio))}% Achieved`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-[9px] text-amber-500/60 font-black uppercase tracking-widest block leading-none">
                            {language === 'id' ? 'PROGRESS KLAIM' : 'CLAIM PROGRESS'}
                          </span>
                          <div className="flex items-baseline gap-1.5 justify-end font-mono mt-1">
                            <span className="text-3.5xl font-black text-amber-400 tracking-tighter tabular-nums leading-none drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                              {networkActiveCount}
                            </span>
                            <span className="text-xl font-bold text-slate-600">/</span>
                            <span className="text-2xl font-bold text-slate-300 tracking-tight tabular-nums leading-none">
                              {CONFIG.REQUIRED_HOLDERS}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Premium High-Precision Progress Bar */}
                      <div className="relative pt-1">
                        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-amber-500/10 p-[2px] shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)] relative"
                            style={{ width: `${bonusProgressRatio}%` }}
                          >
                            {/* Running Light Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button / Disbursed Banner */}
                  <div className="relative z-10">
                      {state.welcomeBonusClaimed ? (
                        <div className="w-full py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase bg-emerald-950/35 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                          <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                          <span>{language === 'id' ? 'DANA INVESTASI Rp 1.800.000 SUDAH CAIR' : 'Rp 1,800,000 INVESTMENT GRANT DISBURSED'}</span>
                        </div>
                      ) : canClaimWelcomeBonus ? (
                        <button
                          onClick={handleClaimWelcomeBonus}
                          className="w-full py-4 rounded-xl text-[11.5px] font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_25px_rgba(245,158,11,0.35)] cursor-pointer hover:shadow-[0_4px_30px_rgba(245,158,11,0.5)]"
                        >
                          <Gem className="w-4.5 h-4.5 text-slate-950 animate-bounce" />
                          <span>{language === 'id' ? 'KLAIM Rp 1.800.000 SEKARANG' : 'CLAIM Rp 1,800,000 NOW'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowBonusSchemaModal(true)}
                          className="w-full py-3.5 rounded-xl text-[10.5px] font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 bg-slate-950/80 text-slate-400 border border-amber-500/15 hover:border-amber-400/40 hover:bg-slate-900/90 hover:text-amber-200 cursor-pointer group"
                        >
                          <Lock className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 group-hover:scale-110 transition duration-300" />
                          <span>{language === 'id' ? 'PERSYARATAN BELUM TERPENUHI' : 'REQUIREMENTS NOT YET MET'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-3">
                    <div className="text-xs font-black text-gold-primary uppercase tracking-wider mb-2">
                      {language === 'id' ? 'Kategori Pendapatan Hasil' : 'All Earned Yield Categories'}
                    </div>

                    <div className="border-l-4 border-emerald-400 bg-emerald-500/5 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-emerald-400 font-bold block uppercase">
                          {language === 'id' ? `Hasil Tambang Harian (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%)` : `Daily Mining Yield (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%)`}
                        </span>
                        <span className="text-slate-200 text-xs font-bold">
                          {language === 'id' ? 'Distribusi Armada Tambang Harian' : 'Daily Fleet Distribution'}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-black text-sm">Rp {miningProfit.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="border-l-4 border-amber-400 bg-amber-500/5 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-amber-400 font-bold block uppercase">
                          {language === 'id' ? 'Bonus Referral Langsung' : 'Direct Referral Bonus'}
                        </span>
                        <span className="text-slate-200 text-xs font-bold">
                          {language === 'id' ? 'Komisi Tingkat Downline Aktif' : 'Active Downline Level Rates'}
                        </span>
                      </div>
                      <span className="text-amber-400 font-black text-sm">Rp {referralReward.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="border-l-4 border-fuchsia-400 bg-fuchsia-500/5 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-fuchsia-400 font-bold block uppercase">
                          {language === 'id' ? 'Bonus Rebate Jaringan' : 'Network Rebate Yield'}
                        </span>
                        <span className="text-slate-200 text-xs font-bold">
                          {language === 'id' ? 'Bagi Hasil Performa Jaringan' : 'Network Sales Performance Share'}
                        </span>
                      </div>
                      <span className="text-fuchsia-400 font-black text-sm">Rp {rebateReward.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="border-l-4 border-blue-400 bg-blue-500/5 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-blue-400 font-bold block uppercase">
                          {language === 'id' ? 'Bonus Selamat Datang' : 'Welcome Bonus'}
                        </span>
                        <span className="text-slate-200 text-xs font-bold">
                          {language === 'id' ? 'Insentif Registrasi Anggota Baru' : 'New Member Registration Incentives'}
                        </span>
                      </div>
                      <span className="text-blue-400 font-black text-sm">Rp {bonusReward.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="bg-gold-primary/10 border border-gold-primary/20 rounded-2xl p-4 text-center mt-5">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">
                        {language === 'id' ? 'TOTAL PENDAPATAN REWARD' : 'TOTAL REWARD REVENUES'}
                      </span>
                      <span className="text-2xl font-black text-gradient-gold block mt-1 font-orbitron">
                        Rp {totalEarned.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* LEGAL & CERTIFICATE VIEW */}
              {currentTab === 'legal' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.legal}</h2>
                  </div>

                  <div className="bg-[#0e061c] border border-gold-primary/25 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <FileBadge className="w-5 h-5 text-gold-primary" />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wider">{t.certificate}</span>
                    </div>

                    <div className="bg-black/35 border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Contract Code</span>
                        <span className="text-xs font-mono font-bold text-white">#GGM-A001</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Assigned To</span>
                        <span className="text-xs font-bold text-white uppercase">{state.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Status</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                          {state.activeContracts > 0 ? 'VALID & ACTIVE' : 'NO ACTIVE CONTRACTS'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Contracts Owned</span>
                        <span className="text-xs font-bold text-white">{state.activeContracts} Unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Issued Date</span>
                        <span className="text-xs font-mono text-slate-300">
                          {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerModal(`📄 Official Stock Certificate Of GrockGold Mining.<br><br>Issuer: GrockGold Corporate Registry<br>Registered Holder: ${state.username}<br>Fleet Node Assignment: Randgold West Africa Area.<br>Approved & Audited.`, 'success')}
                      className="w-full py-3.5 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-2xl text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD PDF CERTIFICATE
                    </button>
                  </div>

                  {/* Company credentials */}
                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl">
                    <div className="text-xs font-black text-gold-primary uppercase tracking-wider mb-3">
                      Corporate Credentials & Licenses
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-slate-300">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">{t.company}</span>
                        <span className="text-white text-right">GrockGold Mining Ltd.</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">{t.license}</span>
                        <span className="text-white">12345/MINING/2026-REG</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">{t.regulated}</span>
                        <span className="text-white text-right">Ministry of Energy & Minerals Registry</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DEPOSIT SALDO VIEW - PREMIUM REDESIGNED MULTI-STEP FLOW */}
              {currentTab === 'deposit' && (
                <div className="space-y-5 animate-fade-in">
                  {/* HEADER & CURRENT BALANCE BAR */}
                  <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div 
                        onClick={() => setCurrentTab('home')}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition active:scale-95"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.deposit}</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">{language === 'id' ? 'Sistem Pengisian Saldo Instan 24/7' : '24/7 Instant Balance Topup Portal'}</p>
                      </div>
                    </div>

                    {/* LIVE BALANCE CARD */}
                    <div className="bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-gold-primary/20 px-4 py-2 rounded-2xl flex items-center justify-between gap-4 md:self-start">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-gold-primary" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {language === 'id' ? 'SALDO ANDA' : 'YOUR BALANCE'}
                        </span>
                      </div>
                      <span className="text-sm font-black font-mono text-emerald-400">
                        Rp {state.mainBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL STEP CHECKLIST PROGRESS TRACKER */}
                  <div className="grid grid-cols-3 gap-1.5 bg-[#080211]/90 border border-purple-950/50 p-2.5 rounded-2xl">
                    {[
                      { 
                        step: '1', 
                        label: language === 'id' ? '1. Nominal' : '1. Amount',
                        active: true,
                        completed: depositValue !== ''
                      },
                      { 
                        step: '2', 
                        label: language === 'id' ? '2. Bayar' : '2. Transfer',
                        active: depositValue !== '',
                        completed: depositValue !== '' && depositProof !== null
                      },
                      { 
                        step: '3', 
                        label: language === 'id' ? '3. Verifikasi' : '3. Verify',
                        active: depositProof !== null,
                        completed: depositProof !== null
                      }
                    ].map((st) => (
                      <div 
                        key={st.step}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl border transition text-[10px] font-bold ${
                          st.completed 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : st.active 
                              ? 'bg-gold-primary/10 border-gold-primary/30 text-gold-primary animate-pulse'
                              : 'bg-black/25 border-white/5 text-slate-500'
                        }`}
                      >
                        {st.completed ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                            st.active ? 'bg-gold-primary text-black' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {st.step}
                          </span>
                        )}
                        <span className="uppercase tracking-wider">{st.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* PAYMENT METHOD SEGMENTED SELECTOR */}
                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-4 shadow-xl space-y-4">
                    <label className="text-xs font-black text-gold-primary block uppercase tracking-wider">
                      {language === 'id' ? 'PILIH METODE PEMBAYARAN RESMI' : 'SELECT OFFICIAL PAYMENT METHOD'}
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      {/* BANK LOCAL BUTTON */}
                      <button
                        type="button"
                        onClick={() => setDepositMethod('bank')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
                          depositMethod === 'bank'
                            ? 'bg-gradient-to-b from-blue-600/15 to-purple-600/5 border-gold-primary/50 text-white shadow-lg shadow-gold-primary/5'
                            : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/10 hover:bg-black/50'
                        }`}
                      >
                        {depositMethod === 'bank' && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold-primary shadow-lg shadow-gold-primary" />
                        )}
                        <Wallet className={`w-6 h-6 ${depositMethod === 'bank' ? 'text-gold-primary' : 'text-slate-500'}`} />
                        <div className="text-center">
                          <span className="text-xs font-black uppercase tracking-wider block">Local Bank Transfer</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">BCA Virtual Account</span>
                        </div>
                      </button>

                      {/* CRYPTO USDT BUTTON */}
                      <button
                        type="button"
                        onClick={() => setDepositMethod('crypto')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
                          depositMethod === 'crypto'
                            ? 'bg-gradient-to-b from-emerald-600/15 to-purple-600/5 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/5'
                            : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/10 hover:bg-black/50'
                        }`}
                      >
                        {depositMethod === 'crypto' && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
                        )}
                        <Coins className={`w-6 h-6 ${depositMethod === 'crypto' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div className="text-center">
                          <span className="text-xs font-black uppercase tracking-wider block">Crypto USDT</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">BEP-20 Network Standard</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* MASTER BENTO SECTION: INPUT & PAYEE DESTINATION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* BENTO BLOCK A: NOMINAL FORM */}
                    <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <label className="text-xs font-black text-gold-primary uppercase tracking-wider">
                            {t.nominalDeposit}
                          </label>
                          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                            {language === 'id' ? 'MIN Rp100.000' : 'MIN Rp100,000'}
                          </span>
                        </div>

                        <div className="relative">
                          <span className="absolute left-4.5 top-3.5 text-base font-extrabold text-gold-primary">Rp</span>
                          <input
                            type="text"
                            value={depositValue}
                            onChange={(e) => formatDepositAmount(e.target.value)}
                            className="w-full bg-black/45 border border-purple-950/40 rounded-2xl pl-12 pr-4 py-4 text-xl font-bold font-mono focus:border-gold-primary outline-none transition text-white text-center shadow-inner"
                            placeholder="100.000"
                          />
                        </div>

                        {/* Presets Chips */}
                        <div className="grid grid-cols-4 gap-1.5 mt-3">
                          {[100000, 250000, 1000000, 2500000].map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => handleQuickDeposit(amount)}
                              className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-xl text-[10px] font-black text-slate-300 transition"
                            >
                              Rp {amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}J` : `${amount / 1000}K`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* QUICK GUIDE CHECKS */}
                      <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 text-[10px] text-slate-400 space-y-2 mt-4 md:mt-0">
                        <div className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-gold-primary shrink-0 mt-0.5" />
                          <p>{language === 'id' ? 'Masukkan nominal sesuai dengan jumlah transfer Anda.' : 'Input the exact amount you wish to transfer.'}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-gold-primary shrink-0 mt-0.5" />
                          <p>{language === 'id' ? 'Unggah bukti transfer untuk verifikasi otomatis Admin.' : 'Upload receipt proof for rapid admin auto-audit queue.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* BENTO BLOCK B: PAYMENT GATEWAY CARDS */}
                    <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                      {depositMethod === 'bank' ? (
                        /* VIP BANK BCA CARD VISUAL */
                        <div className="space-y-4 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-2.5">
                              <span className="text-xs font-black text-gold-primary uppercase tracking-wider">
                                {language === 'id' ? 'REKENING TUJUAN' : 'DESTINATION BANK ACCOUNT'}
                              </span>
                              <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/10">
                                {globalConfig?.bankName || 'BCA'}
                              </span>
                            </div>

                            {/* Debit Card Visual representation */}
                            <div className="bg-gradient-to-br from-blue-900/50 via-slate-900 to-slate-950 border border-blue-500/25 rounded-2xl p-4 relative overflow-hidden shadow-xl">
                              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{globalConfig?.bankName || 'BCA'} TRANSFER RECEIVER</span>
                                <div className="w-8 h-6 bg-amber-500/20 rounded-md border border-amber-500/30 flex items-center justify-center text-[10px] text-gold-primary font-black">CHIP</div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Account Number / No. Rekening</span>
                                  <div className="flex items-center gap-2 mt-0.5 justify-between">
                                    <span className="text-base font-black font-mono tracking-widest text-white select-all">
                                      {globalConfig?.bankNumber || '8402-1920-22'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleCopyBankNumber}
                                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-gold-primary border border-white/5 transition active:scale-90"
                                    >
                                      {copiedBank ? 'COPIED' : 'COPY'}
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-1.5 border-t border-white/5 flex justify-between items-center">
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Account Holder / Atas Nama</span>
                                    <span className="text-xs font-black text-slate-200 mt-0.5 block uppercase">
                                      {globalConfig?.bankHolder || 'PT GROCKGOLD INDONESIA'}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-slate-400 bg-black/45 border border-white/5 rounded px-1.5 py-0.5 font-bold uppercase">
                                    {language === 'id' ? 'REKENING UTAMA' : 'PRIMARY ACCOUNT'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-[9.5px] text-amber-200/80 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 leading-relaxed mt-4">
                            <span className="font-extrabold text-amber-400 block uppercase mb-0.5">💡 Tips Penting:</span>
                            {language === 'id' 
                              ? 'Harap sertakan Username Anda di kolom catatan/remark transfer jika tersedia untuk proses konfirmasi super instan.' 
                              : 'Please add your login username in the transfer remark section to ensure ultra-rapid automated verification.'}
                          </div>
                        </div>
                      ) : (
                        /* CRYPTO USDT BEP20 BLOCK */
                        <div className="space-y-4 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-2.5">
                              <span className="text-xs font-black text-gold-primary uppercase tracking-wider">
                                {language === 'id' ? 'ALAMAT DOMPET KRIPTO' : 'USDT WALLET DESTINATION'}
                              </span>
                              <span className="text-[10px] font-black bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10 uppercase">
                                USDT (BEP-20)
                              </span>
                            </div>

                            {/* Crypto terminal card */}
                            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/25 rounded-2xl p-4 shadow-xl">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Network Standard (BEP20 Only)</span>
                                  <span className="text-[10px] text-emerald-400 font-black tracking-widest block uppercase mt-0.5">
                                    BSC NETWORK (BEP-20)
                                  </span>
                                </div>

                                <div className="space-y-1 bg-black/40 border border-white/5 rounded-xl p-2.5">
                                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">USDT BEP20 Address</span>
                                  <div className="flex items-center gap-2 justify-between">
                                    <span className="text-[10px] font-mono font-bold text-white break-all select-all flex-1 pr-1">
                                      {globalConfig?.usdtAddress || '0xc87b9611F3655F0A0f3aFE7dBBaCc16cA855aFc4'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleCopyUSDTAddress}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-emerald-400 border border-white/5 transition active:scale-90 shrink-0"
                                    >
                                      {copiedUSDT ? 'COPIED' : 'COPY'}
                                    </button>
                                  </div>
                                </div>

                                {/* Live rate converter calculator representation */}
                                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Estimated Amount</span>
                                    <span className="text-xs font-black text-emerald-400 mt-0.5 block font-mono">
                                      ~ $ {(parseInt(depositValue.replace(/[^0-9]/g, '')) / 15000 || 0).toFixed(2)} USDT
                                    </span>
                                  </div>
                                  <span className="text-[8.5px] text-slate-400 bg-white/5 rounded px-1.5 py-0.5 font-bold font-mono">
                                    Rate: Rp 15.000 / USDT
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-[9.5px] text-rose-300/80 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 leading-relaxed mt-4">
                            <span className="font-extrabold text-rose-400 block uppercase mb-0.5">⚠️ JANGAN SALAH JARINGAN:</span>
                            {language === 'id' 
                              ? 'Hanya kirim saldo USDT menggunakan jaringan BEP-20. Kesalahan memilih jaringan crypto dapat menyebabkan kehilangan dana permanen.' 
                              : 'Only transmit USDT on the BEP-20 standard network. Sending crypto assets to alternative networks will result in permanent loss.'}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* MANDATORY PROOF UPLOAD ZONE CONTAINER */}
                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gold-primary uppercase tracking-wider block">
                        {language === 'id' ? 'STEP 3: UNGGAH BUKTI TRANSFER PEMBAYARAN' : 'STEP 3: UPLOAD COMPLETED TRANSFER PROOF'}
                      </label>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 uppercase tracking-wide font-bold">
                        {language === 'id' ? 'PROSES INSTAN OTOMATIS' : 'AUTOMATIC INSTANT PROCESS'}
                      </span>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          handleProofUpload(file);
                        }
                      }}
                      onClick={() => document.getElementById('proof-upload-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition duration-150 flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
                        depositProof
                          ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'border-purple-900/30 bg-black/45 hover:border-gold-primary/30'
                      }`}
                    >
                      <input
                        id="proof-upload-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleProofUpload(file);
                          }
                        }}
                      />

                      {isUploadingProof ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <div className="w-8 h-8 border-2 border-t-transparent border-gold-primary rounded-full animate-spin"></div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {language === 'id' ? 'Memproses gambar...' : 'Processing image...'}
                          </span>
                        </div>
                      ) : depositProof ? (
                        <div className="flex flex-col items-center gap-2.5 py-2">
                          <img
                            src={depositProof}
                            alt="Preview Bukti Transfer"
                            className="max-h-28 rounded-xl object-contain shadow-lg border border-purple-500/30 max-w-[200px] animate-scale-up"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-center">
                            <span className="text-emerald-400 text-xs font-black block uppercase tracking-wide">
                              {language === 'id' ? 'Bukti Transfer Berhasil Diunggah' : 'Transfer Proof Uploaded Successfully'}
                            </span>
                            <span className="text-slate-400 text-[10px] font-mono block mt-1 bg-black/30 border border-white/5 rounded-lg px-2 py-0.5 truncate max-w-[280px]">
                              {depositProofName || 'transfer_receipt.jpg'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDepositProof(null);
                              setDepositProofName(null);
                            }}
                            className="mt-2 px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-400 uppercase tracking-wider transition active:scale-95"
                          >
                            {language === 'id' ? 'Hapus & Ganti Gambar' : 'Remove & Replace Image'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2.5 py-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-950/20 border border-purple-900/30 flex items-center justify-center text-purple-400">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <span className="text-slate-200 text-xs font-black block uppercase tracking-wider">
                              {language === 'id' ? 'Ketuk atau Seret Bukti Transfer di Sini' : 'Click or Drag receipt image here'}
                            </span>
                            <span className="text-slate-500 text-[9px] block mt-1">
                              {language === 'id' ? 'Mendukung format PNG, JPG, JPEG (Maksimal 5MB)' : 'Supports PNG, JPG, JPEG image formats up to 5MB'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECURITY & SLA GUARANTEE BAR */}
                  <div className="bg-gradient-to-r from-emerald-950/25 via-[#0c0419]/90 to-purple-950/25 border border-emerald-500/15 rounded-3xl p-4 flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-wider">GrockGold Mining SLA Guarantee</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {language === 'id' 
                          ? 'Setoran Anda diamankan oleh gerbang audit keuangan otomatis kami. Setelah bukti transfer diunggah, sistem akan memproses dan mengaktifkan saldo Anda secara instan dan langsung masuk ke akun Anda.' 
                          : 'Your deposit is processed by our automated financial audit gateway. Once the transfer receipt is uploaded, the system will instantly process and credit your balance directly to your wallet.'}
                      </p>
                    </div>
                  </div>

                  {/* SUBMIT DEPOSIT BUTTON */}
                  <button
                    onClick={executeDeposit}
                    disabled={!depositProof || isUploadingProof}
                    className={`w-full py-4.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
                      (!depositProof || isUploadingProof)
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/20 shadow-none'
                        : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black hover:brightness-110 shadow-gold-primary/10 active:scale-[0.99] cursor-pointer'
                    }`}
                  >
                    {!depositProof ? (
                      <Lock className="w-4 h-4 shrink-0" />
                    ) : (
                      <ArrowDown className="w-4 h-4 shrink-0 animate-bounce" />
                    )}
                    {t.processDeposit}
                  </button>
                </div>
              )}

              {/* PROFILE VIEW */}
              {currentTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.profile}</h2>
                  </div>

                  {/* Accordion / Tab Options */}
                  <div className="space-y-3">
                    {/* DATA AKUN SECTION */}
                    <div className="bg-[#0e061c] border border-white/5 rounded-2xl p-4 shadow-lg">
                      <div className="text-xs font-black text-gold-primary uppercase tracking-wider mb-3.5 flex items-center gap-2">
                        <User className="w-4 h-4 text-gold-primary" />
                        {t.profileDataTitle}
                      </div>
                      
                      <div className="space-y-2.5 text-xs font-semibold text-slate-300">
                        {/* 1. Nama Lengkap */}
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>👤</span>
                            <span>{language === 'id' ? 'Nama Lengkap' : 'Full Name'}</span>
                          </span>
                          <span className="text-white font-bold">{currentAccount ? currentAccount.fullName : 'Kenala Wijaya'}</span>
                        </div>

                        {/* 2. Username */}
                        <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>🆔</span>
                            <span>Username</span>
                          </span>
                          <span className="text-white">{currentAccount ? currentAccount.username : 'kenala'}</span>
                        </div>

                        {/* 3. ID Member */}
                        <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>🪪</span>
                            <span>ID Member</span>
                          </span>
                          <span className="text-white">{currentAccount ? currentAccount.referralCode || 'ADMIN' : 'GGM-0001'}</span>
                        </div>

                        {/* 4. Email */}
                        <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>✉️</span>
                            <span>Email</span>
                          </span>
                          <span className="text-white">{currentAccount ? currentAccount.email : 'kenala@grockgold.com'}</span>
                        </div>

                        {/* 5. Nomor Handphone */}
                        <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>📱</span>
                            <span>{language === 'id' ? 'Nomor Handphone' : 'Phone Number'}</span>
                          </span>
                          <span className="text-white">{currentAccount ? currentAccount.phone : '+6281234567890'}</span>
                        </div>

                        {/* 6. Nomor Rekening Terdaftar */}
                        <div className="flex justify-between items-center py-1 border-b border-white/5 font-mono">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>🏦</span>
                            <span>{language === 'id' ? 'Nomor Rekening Terdaftar' : 'Registered Account'}</span>
                          </span>
                          <span className={`text-[11px] font-bold ${currentAccount?.settings?.bankNumber ? 'text-white' : 'text-rose-400 italic'}`}>
                            {currentAccount?.settings?.bankNumber 
                              ? `${currentAccount.settings.bankName} ••••••••${currentAccount.settings.bankNumber.slice(-4)}`
                              : (language === 'id' ? 'Belum menambahkan rekening.' : 'No account added.')}
                          </span>
                        </div>

                        {/* 7. Nama Bank */}
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>🏛️</span>
                            <span>{language === 'id' ? 'Nama Bank' : 'Bank Name'}</span>
                          </span>
                          <span className="text-white font-bold uppercase">{currentAccount?.settings?.bankName || '-'}</span>
                        </div>

                        {/* 8. Nama Pemilik Rekening */}
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>💳</span>
                            <span>{language === 'id' ? 'Nama Pemilik Rekening' : 'Account Owner Name'}</span>
                          </span>
                          <span className="text-white font-bold uppercase">{currentAccount?.settings?.bankHolder || '-'}</span>
                        </div>

                        {/* Button: Tambah / Ubah Rekening */}
                        <div className="pt-2 border-b border-white/5 pb-2.5 flex justify-end">
                          <button
                            type="button"
                            onClick={openBankModal}
                            className="px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Landmark className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {currentAccount?.settings?.bankNumber 
                                ? (language === 'id' ? 'UBAH REKENING' : 'EDIT ACCOUNT')
                                : (language === 'id' ? 'TAMBAH REKENING' : 'ADD ACCOUNT')}
                            </span>
                          </button>
                        </div>

                        {/* 9. Uplink Sponsor */}
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>👥</span>
                            <span>Uplink Sponsor</span>
                          </span>
                          <span className="text-amber-400 font-bold uppercase">{currentAccount?.invitedBy ? currentAccount.invitedBy : 'SYSTEM'}</span>
                        </div>

                        {/* 10. Referral Code */}
                        <div className="flex justify-between py-1 font-mono">
                          <span className="text-slate-500 flex items-center gap-2.5">
                            <span>🎁</span>
                            <span>Referral Code</span>
                          </span>
                          <span className="text-gold-primary font-bold">{currentAccount ? currentAccount.referralCode || 'ADMIN' : 'GGM-0001'}</span>
                        </div>
                      </div>
                    </div>

                    {/* CHANGE PASSWORD SECTION */}
                    <div className="bg-[#0e061c] border border-white/5 rounded-2xl p-4 shadow-lg space-y-3.5">
                      <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-gold-primary" />
                        {t.changePasswordTitle}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1 uppercase">
                            {t.oldPassword}
                          </label>
                          <input
                            type="password"
                            value={profileOldPassword}
                            onChange={(e) => setProfileOldPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-black/40 border border-purple-900/40 focus:border-gold-primary/60 outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1 uppercase">
                            {t.newPassword}
                          </label>
                          <input
                            type="password"
                            value={profileNewPassword}
                            onChange={(e) => setProfileNewPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="w-full bg-black/40 border border-purple-900/40 focus:border-gold-primary/60 outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1 uppercase">
                            {t.confirmNewPassword}
                          </label>
                          <input
                            type="password"
                            value={profileConfirmPassword}
                            onChange={(e) => setProfileConfirmPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="w-full bg-black/40 border border-purple-900/40 focus:border-gold-primary/60 outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white transition"
                          />
                        </div>

                        <button
                          onClick={handleChangePassword}
                          className="w-full py-2.5 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-[10px] tracking-wider uppercase transition shadow-md hover:brightness-110 active:scale-98"
                        >
                          {t.updatePassword}
                        </button>
                      </div>
                    </div>

                    {/* SETTINGS SECTION */}
                    <div className="bg-[#0e061c] border border-white/5 rounded-2xl p-4 shadow-lg space-y-3.5">
                      <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gold-primary" />
                        {t.settingsTitle}
                      </div>

                      <div className="space-y-3 text-xs font-bold text-white">
                        {/* Auto Reinvest Toggle */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5">
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
                        <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5">
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
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full py-4 bg-rose-950/15 border border-rose-500/25 text-rose-400 font-extrabold rounded-2xl text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 hover:bg-rose-950/35"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      {t.logout}
                    </button>
                  </div>
                </div>
              )}

              {/* TRANSACTION HISTORY VIEW */}
              {currentTab === 'transactions' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-1 min-h-0 text-left overflow-hidden pb-1"
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3 shrink-0">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">
                      {language === 'id' ? 'Riwayat Transaksi' : 'Transaction History'}
                    </h2>
                  </div>

                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl flex flex-col flex-1 min-h-0 space-y-4 overflow-hidden">
                    {/* Filters Section (Search & Date Filter) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                      {/* Search Query */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                          <Search className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder={language === 'id' ? 'Cari ID, Deskripsi, Nama Downline...' : 'Search ID, Description, Downline...'}
                          value={txSearchQuery}
                          onChange={(e) => setTxSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-2xl text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all font-semibold"
                        />
                      </div>

                      {/* Date Filter */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </span>
                        <select
                          value={txDateRangeFilter}
                          onChange={(e) => setTxDateRangeFilter(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 bg-black/40 border border-white/5 rounded-2xl text-[10px] text-white focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all font-semibold appearance-none cursor-pointer"
                        >
                          <option value="all" className="bg-[#110724] text-white">{language === 'id' ? 'Semua Waktu' : 'All Time'}</option>
                          <option value="today" className="bg-[#110724] text-white">{language === 'id' ? 'Hari Ini' : 'Today'}</option>
                          <option value="7days" className="bg-[#110724] text-white">{language === 'id' ? '7 Hari Terakhir' : 'Last 7 Days'}</option>
                          <option value="30days" className="bg-[#110724] text-white">{language === 'id' ? '30 Hari Terakhir' : 'Last 30 Days'}</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                          <Filter className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Categories Scroll */}
                    <div className="overflow-x-auto pb-2 scrollbar-none flex gap-1.5 border-b border-white/5 shrink-0">
                      {[
                        { id: 'all', label: language === 'id' ? 'Semua' : 'All', icon: <History className="w-3.5 h-3.5" /> },
                        { id: 'deposit', label: 'Deposit', icon: <ArrowDown className="w-3.5 h-3.5 text-emerald-400" /> },
                        { id: 'withdraw', label: 'Withdraw', icon: <ArrowUp className="w-3.5 h-3.5 text-rose-400" /> },
                        { id: 'purchase', label: language === 'id' ? 'Pembelian Kontrak' : 'Contract Purchase', icon: <Cpu className="w-3.5 h-3.5 text-amber-400" /> },
                        { id: 'reward', label: language === 'id' ? 'Mining Profit' : 'Mining Profit', icon: <Coins className="w-3.5 h-3.5 text-yellow-400" /> },
                        { id: 'referral', label: language === 'id' ? 'Referral Reward' : 'Referral Reward', icon: <Users className="w-3.5 h-3.5 text-blue-400" /> },
                        { id: 'rebate', label: language === 'id' ? 'Rebate Reward' : 'Rebate Reward', icon: <RefreshCw className="w-3.5 h-3.5 text-fuchsia-400" /> },
                        { id: 'bonus', label: language === 'id' ? 'Bonus' : 'Bonus', icon: <Gift className="w-3.5 h-3.5 text-pink-400" /> },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setTxFilter(item.id)}
                          className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                            txFilter === item.id
                              ? 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black border-yellow-500 shadow-lg shadow-gold-primary/20'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Transactions List */}
                    <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {(() => {
                        const filteredTxs = (state.transactions || []).filter((tx) => {
                          // 1. Filter by category
                          let matchesType = false;
                          if (txFilter === 'all') {
                            matchesType = true;
                          } else if (txFilter === 'deposit') {
                            matchesType = tx.type === 'deposit';
                          } else if (txFilter === 'withdraw') {
                            matchesType = tx.type === 'withdraw';
                          } else if (txFilter === 'purchase') {
                            matchesType = tx.type === 'purchase';
                          } else if (txFilter === 'reward') {
                            matchesType = tx.type === 'reward';
                          } else if (txFilter === 'referral') {
                            matchesType = tx.type === 'referral';
                          } else if (txFilter === 'rebate') {
                            matchesType = tx.type === 'rebate';
                          } else if (txFilter === 'bonus') {
                            matchesType = tx.type === 'welcome_bonus' || tx.type === 'bonus';
                          }

                          if (!matchesType) return false;

                          // 2. Filter by search query
                          if (txSearchQuery) {
                            const q = txSearchQuery.toLowerCase();
                            const idMatches = (tx.id || '').toLowerCase().includes(q);
                            const descMatches = (tx.description || '').toLowerCase().includes(q);
                            if (!idMatches && !descMatches) return false;
                          }

                          // 3. Filter by date range
                          if (txDateRangeFilter !== 'all') {
                            const txTime = tx.date || tx.timestamp || Date.now();
                            const txDate = new Date(txTime);
                            const now = new Date();
                            
                            if (txDateRangeFilter === 'today') {
                              const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                              if (txDate < startOfToday) return false;
                            } else if (txDateRangeFilter === '7days') {
                              const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                              if (txDate < sevenDaysAgo) return false;
                            } else if (txDateRangeFilter === '30days') {
                              const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                              if (txDate < thirtyDaysAgo) return false;
                            }
                          }

                          return true;
                        });

                        if (filteredTxs.length === 0) {
                          return (
                            <div className="text-center py-12 text-slate-500 text-xs font-semibold flex flex-col items-center justify-center gap-2">
                              <Clock className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                              <span>{t.emptyTx}</span>
                            </div>
                          );
                        }

                        return filteredTxs.map((tx) => {
                          // Icon and type rendering config
                          let iconElement = <Activity className="w-4 h-4" />;
                          let badgeBgColor = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
                          let typeLabel = tx.type.toUpperCase();
                          let isIncome = true;

                          if (tx.type === 'deposit') {
                            iconElement = <ArrowDown className="w-4 h-4" />;
                            badgeBgColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                            typeLabel = 'DEPOSIT';
                            isIncome = true;
                          } else if (tx.type === 'withdraw') {
                            iconElement = <ArrowUp className="w-4 h-4" />;
                            badgeBgColor = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                            typeLabel = language === 'id' ? 'PENARIKAN' : 'WITHDRAWAL';
                            isIncome = false;
                          } else if (tx.type === 'purchase') {
                            iconElement = <Cpu className="w-4 h-4" />;
                            badgeBgColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                            typeLabel = language === 'id' ? 'PEMBELIAN KONTRAK' : 'CONTRACT PURCHASE';
                            isIncome = false;
                          } else if (tx.type === 'reward') {
                            iconElement = <Coins className="w-4 h-4" />;
                            badgeBgColor = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
                            typeLabel = language === 'id' ? 'MINING PROFIT' : 'MINING PROFIT';
                            isIncome = true;
                          } else if (tx.type === 'referral') {
                            iconElement = <Users className="w-4 h-4" />;
                            badgeBgColor = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                            typeLabel = language === 'id' ? 'REFERRAL REWARD' : 'REFERRAL REWARD';
                            isIncome = true;
                          } else if (tx.type === 'rebate') {
                            iconElement = <RefreshCw className="w-4 h-4" />;
                            badgeBgColor = 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400';
                            typeLabel = language === 'id' ? 'REBATE REWARD' : 'REBATE REWARD';
                            isIncome = true;
                          } else if (tx.type === 'welcome_bonus' || tx.type === 'bonus') {
                            iconElement = <Gift className="w-4 h-4" />;
                            badgeBgColor = 'bg-pink-500/10 border-pink-500/20 text-pink-400';
                            typeLabel = language === 'id' ? 'BONUS' : 'BONUS';
                            isIncome = true;
                          }

                          // Formatted timestamp
                          const txTime = tx.date || tx.timestamp || Date.now();
                          const formattedDate = new Date(txTime).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          });

                          // Determine status
                          let statusLabel = language === 'id' ? 'SUKSES' : 'SUCCESS';
                          let statusClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                          
                          if (tx.type === 'deposit' || tx.type === 'withdraw') {
                            const stat = (tx.status || '').toLowerCase();
                            if (stat === 'pending') {
                              statusLabel = 'PENDING';
                              statusClasses = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                            } else if (stat === 'rejected' || stat === 'failed') {
                              statusLabel = language === 'id' ? 'GAGAL' : 'FAILED';
                              statusClasses = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                            }
                          }

                          return (
                            <div key={tx.id} className="p-3.5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-2.5 hover:border-white/10 transition-all text-left">
                              {/* Row 1: Header / Category & Status */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg border ${badgeBgColor}`}>
                                    {iconElement}
                                  </div>
                                  <span className="text-[10px] font-black tracking-wider text-slate-300">
                                    {typeLabel}
                                  </span>
                                </div>
                                <span className={`text-[8px] font-black font-mono tracking-widest px-2 py-0.5 rounded border ${statusClasses}`}>
                                  {statusLabel}
                                </span>
                              </div>

                              {/* Row 2: Description */}
                              <p className="text-xs font-semibold text-white/95 leading-relaxed">
                                {tx.description || (language === 'id' ? 'Transaksi Sistem' : 'System Transaction')}
                              </p>

                              {/* Row 3: Meta, Amount, Date */}
                              <div className="flex items-end justify-between border-t border-white/5 pt-2.5">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-mono font-bold text-slate-500 block leading-none">
                                    ID: {tx.id}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-500 block">
                                    {formattedDate}
                                  </span>
                                </div>

                                <div className="text-right font-semibold">
                                  <span className={`text-xs font-black font-mono tracking-tight block ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isIncome ? '+' : '−'} Rp {tx.amount.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SYSTEM NOTIFICATIONS VIEW */}
              {currentTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">
                      {language === 'id' ? 'Notifikasi Sistem' : 'System Notifications'}
                    </h2>
                  </div>

                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-gold-primary uppercase tracking-wider">
                        {language === 'id' ? 'Pemberitahuan Terbaru' : 'Recent Bulletins'}
                      </span>
                      <span className="text-[9px] bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-2 py-0.5 rounded font-black font-mono uppercase">
                        {language === 'id' ? 'Aktif' : 'Live'}
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                      {[
                        {
                          id: 1,
                          title: language === 'id' ? 'Sistem Cloud Penambangan Stabil' : 'Cloud Mining Fleets Stabilized',
                          desc: language === 'id' ? 'Semua unit ekskavator di Randgold West Africa beroperasi dengan efisiensi puncak 98.4%.' : 'All excavator fleets in Randgold West Africa are operating at peak efficiency of 98.4%.',
                          time: '14 Jul 2026, 10:24',
                          type: 'success'
                        },
                        {
                          id: 2,
                          title: language === 'id' ? 'Kemitraan Emas Randgold Resources' : 'Randgold Resources Partnership Active',
                          desc: language === 'id' ? 'GrockGold Mining mengesahkan audit sertifikat kepemilikan kuartal ini untuk keandalan penarikan.' : 'GrockGold Mining verified this quarter’s certificate audit to ensure flawless and secure liquidity withdrawals.',
                          time: '13 Jul 2026, 08:12',
                          type: 'info'
                        },
                        {
                          id: 3,
                          title: language === 'id' ? 'Keamanan Enkripsi Lapis Dua Berjalan' : 'Two-Factor Secure Tunnel Enforced',
                          desc: language === 'id' ? 'Akses sistem diamankan penuh secara real-time. Hubungi admin untuk keluhan kode OTP.' : 'Terminal access is fully encrypted in real-time. Contact official admins for any access issues.',
                          time: '12 Jul 2026, 15:45',
                          type: 'info'
                        },
                        {
                          id: 4,
                          title: language === 'id' ? 'Program Welcome Bonus Deposit' : 'New Member Welcome Bonus Open',
                          desc: language === 'id' ? 'Dapatkan Rp 1.800.000 dengan mengumpulkan 80 mitra aktif di struktur jaringan penambangan Anda.' : 'Claim Rp 1,800,000 by accumulating 80 active depositors with at least 1 Stock Contract in your networks.',
                          time: '10 Jul 2026, 09:00',
                          type: 'warning'
                        }
                      ].map((n) => (
                        <div key={n.id} className="p-4 bg-black/45 border border-white/5 rounded-2xl flex gap-3 text-left">
                          <div className="mt-0.5 shrink-0">
                            <div className={`p-1.5 rounded-lg border ${
                              n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              'bg-purple-500/10 border-purple-500/20 text-cyan-400'
                            }`}>
                              <Bell className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-white block leading-tight">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-relaxed">{n.desc}</span>
                            <span className="text-[8px] font-mono font-bold text-slate-600 uppercase block mt-2">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ERROR HISTORY VIEW */}
              {currentTab === 'errorhistory' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase font-orbitron">
                      {language === 'id' ? 'SISTEM DIAGNOSTIK & LOG' : 'SYSTEM DIAGNOSTICS & LOGS'}
                    </h2>
                  </div>

                  {/* DIAGNOSTIC SCAN CONTROL PANEL */}
                  <div className="bg-[#0e061c] border border-purple-500/10 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
                    {/* Glowing effect */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-orbitron flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                          {language === 'id' ? 'DIAGNOSTIK EKOSISTEM' : 'ECOSYSTEM DIAGNOSTICS'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {language === 'id' ? 'Deteksi error real-time & kesehatan unit hashing.' : 'Real-time error detection & hashing unit health monitors.'}
                        </p>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black font-mono uppercase">
                        {language === 'id' ? 'SINKRON' : 'SYNCED'}
                      </span>
                    </div>

                    {/* Telemetry Status Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-black/35 border border-white/5 rounded-2xl p-3 text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase mb-1">
                          {language === 'id' ? 'INTEGRITAS' : 'INTEGRITY'}
                        </span>
                        <span className={`text-sm font-black font-orbitron ${
                          (state.systemErrors || []).filter(e => !e.resolved && e.severity === 'critical').length > 0
                            ? 'text-rose-500'
                            : (state.systemErrors || []).filter(e => !e.resolved).length > 0
                              ? 'text-amber-500'
                              : 'text-emerald-400'
                        }`}>
                          {(() => {
                            const activeCrit = (state.systemErrors || []).filter(e => !e.resolved && e.severity === 'critical').length;
                            const activeWarn = (state.systemErrors || []).filter(e => !e.resolved && e.severity === 'warning').length;
                            if (activeCrit > 0) return '84.2%';
                            if (activeWarn > 0) return '94.8%';
                            return '99.8%';
                          })()}
                        </span>
                      </div>
                      <div className="bg-black/35 border border-white/5 rounded-2xl p-3 text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase mb-1">
                          {language === 'id' ? 'AKTIF' : 'ACTIVE ERRORS'}
                        </span>
                        <span className={`text-sm font-black font-orbitron ${
                          (state.systemErrors || []).filter(e => !e.resolved).length > 0 ? 'text-amber-400' : 'text-slate-300'
                        }`}>
                          {(state.systemErrors || []).filter(e => !e.resolved).length}
                        </span>
                      </div>
                      <div className="bg-black/35 border border-white/5 rounded-2xl p-3 text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase mb-1">
                          {language === 'id' ? 'TERSELESAIKAN' : 'RESOLVED'}
                        </span>
                        <span className="text-sm font-black font-orbitron text-emerald-400">
                          {(state.systemErrors || []).filter(e => e.resolved).length}
                        </span>
                      </div>
                    </div>

                    {/* Scan Button & Progress */}
                    <div className="pt-2">
                      {isScanning ? (
                        <div className="space-y-3 bg-black/45 border border-purple-500/20 rounded-2xl p-4">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                            <span className="flex items-center gap-1.5 font-orbitron">
                              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              {language === 'id' ? 'MEMINDAI DRIVER & KONEKSI...' : 'SCANNING TELEMETRY & DRIVERS...'}
                            </span>
                            <span className="font-mono text-amber-400">{scanProgress}%</span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                              initial={{ width: '0%' }}
                              animate={{ width: `${scanProgress}%` }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>
                          {/* Running Terminal log */}
                          <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl font-mono text-[8.5px] leading-relaxed text-slate-400 space-y-1 h-[80px] overflow-y-auto max-h-[80px]">
                            {scanLog.map((log, i) => (
                              <div key={i} className="flex gap-1">
                                <span className="text-amber-500 select-none">&gt;</span>
                                <span className={log.includes('WARN') || log.includes('GLITCH') ? 'text-amber-400 font-extrabold' : 'text-slate-300'}>
                                  {log}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleRunDiagnostics}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-900 to-[#1e103c] hover:from-purple-800 hover:to-[#2b1754] border border-purple-500/25 hover:border-purple-500/50 active:scale-[0.99] transition duration-300 flex items-center justify-center gap-2 shadow-lg text-slate-200 hover:text-white cursor-pointer font-orbitron font-extrabold text-xs tracking-wider"
                        >
                          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                          {language === 'id' ? 'MULAI DIAGNOSTIK KESELURUHAN' : 'RUN COMPREHENSIVE DIAGNOSTICS'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ERROR LOG HISTORY LIST */}
                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-xs font-black text-gold-primary uppercase tracking-wider font-orbitron">
                        {language === 'id' ? 'RIWAYAT ERROR TERKINI' : 'RECENT ERROR REGISTRY'}
                      </span>

                      {/* Filters */}
                      <div className="flex gap-1 bg-black/45 border border-white/5 p-1 rounded-lg">
                        {(['all', 'active', 'critical', 'resolved'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setErrorFilter(f)}
                            className={`px-2 py-1 rounded text-[8.5px] font-black uppercase font-orbitron transition ${
                              errorFilter === f
                                ? 'bg-gold-primary/10 border border-gold-primary/30 text-gold-primary'
                                : 'text-slate-400 hover:text-white border border-transparent'
                            }`}
                          >
                            {f === 'all' ? (language === 'id' ? 'SEMUA' : 'ALL') :
                             f === 'active' ? (language === 'id' ? 'AKTIF' : 'ACTIVE') :
                             f === 'critical' ? (language === 'id' ? 'KRITIS' : 'CRITICAL') :
                             (language === 'id' ? 'SELESAI' : 'RESOLVED')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {(() => {
                        const filtered = (state.systemErrors || []).filter(err => {
                          if (errorFilter === 'active') return !err.resolved;
                          if (errorFilter === 'critical') return !err.resolved && err.severity === 'critical';
                          if (errorFilter === 'resolved') return err.resolved;
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-12 text-slate-500 text-xs font-bold font-orbitron uppercase tracking-wider">
                              {language === 'id' ? '🚫 Tidak ada log error ditemukan' : '🚫 No matching system errors'}
                            </div>
                          );
                        }

                        return filtered.map((err) => (
                          <div
                            key={err.id}
                            className={`p-4 bg-black/45 border rounded-2xl flex gap-3 text-left transition duration-300 relative overflow-hidden ${
                              err.resolved
                                ? 'border-white/5'
                                : err.severity === 'critical'
                                  ? 'border-rose-500/25 shadow-[0_0_12px_rgba(239,68,68,0.02)]'
                                  : 'border-amber-500/20'
                            }`}
                          >
                            {/* Accent indicator line */}
                            <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                              err.resolved
                                ? 'bg-emerald-500/40'
                                : err.severity === 'critical'
                                  ? 'bg-rose-500 animate-pulse'
                                  : 'bg-amber-400'
                            }`} />

                            <div className="mt-0.5 shrink-0 pl-1">
                              <div className={`p-1.5 rounded-lg border ${
                                err.resolved
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : err.severity === 'critical'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-tight bg-slate-800/40 px-1.5 py-0.5 rounded border border-white/5">
                                    {err.errorCode}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400 font-orbitron">
                                    @{err.node}
                                  </span>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  err.resolved
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : err.severity === 'critical'
                                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                      : 'bg-amber-500/15 text-amber-400'
                                }`}>
                                  {err.resolved
                                    ? (language === 'id' ? 'TERATASI' : 'RESOLVED')
                                    : err.severity === 'critical'
                                      ? (language === 'id' ? 'KRITIS' : 'CRITICAL')
                                      : (language === 'id' ? 'PERINGATAN' : 'WARNING')}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-200 font-semibold block mt-2 leading-relaxed">
                                {err.message}
                              </p>

                              <div className="flex justify-between items-center mt-3.5 pt-2.5 border-t border-white/5">
                                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">
                                  {new Date(err.timestamp).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </span>

                                {!err.resolved && (
                                  <button
                                    onClick={() => handleResolveError(err.id)}
                                    disabled={resolvingId === err.id}
                                    className="px-2.5 py-1 rounded bg-[#170a2f] border border-purple-500/20 hover:border-purple-400/40 text-[9px] font-black uppercase font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    {resolvingId === err.id ? (
                                      <>
                                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
                                        {language === 'id' ? 'MEMERIKSA...' : 'FIXING...'}
                                      </>
                                    ) : (
                                      <>
                                        <Terminal className="w-2.5 h-2.5 text-amber-400" />
                                        {language === 'id' ? 'DEBUGIN' : 'DEBUG'}
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}


              {/* SETTINGS VIEW */}
              {currentTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 text-left"
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
              )}

              {/* HELP & SUPPORT VIEW */}
              {currentTab === 'help' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">
                      {language === 'id' ? 'Pusat Bantuan' : 'Help Center'}
                    </h2>
                  </div>

                  <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                      <HelpCircle className="w-4 h-4 text-gold-primary" />
                      {language === 'id' ? 'Pertanyaan Umum (FAQ)' : 'Frequently Asked Questions'}
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {[
                        {
                          q: language === 'id' ? 'Bagaimana cara membeli Kontrak Emas?' : 'How do I purchase Gold Contracts?',
                          a: language === 'id' ? 'Anda dapat menyetor dana Anda di menu Wallet -> Deposit. Setelah itu, buka menu Kontrak, tentukan jumlah unit yang diinginkan, lalu ketuk tombol "Beli Sekarang". Kontrak langsung aktif berproduksi.' : 'First top up your balance via Wallet -> Deposit. Once your balance is loaded, navigate to the Contracts page, input your desired unit quantity, and click "Buy Now".'
                        },
                        {
                          q: language === 'id' ? 'Berapa persentase hasil harian?' : 'What is the daily mining yield rate?',
                          a: language === 'id' ? `Setiap kontrak aktif memberikan tingkat hasil harian sebesar ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% langsung ke saldo reward Anda sampai mencapai batas capping penambangan 250%.` : `Each active contract guarantees a premium ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% daily yield credited straight to your Reward Balance, running continuously until reaching 250% capping.`
                        },
                        {
                          q: language === 'id' ? 'Apa yang dimaksud batas Capping 250%?' : 'What is the 250% capping limit?',
                          a: language === 'id' ? 'Capping adalah batas maksimal pendapatan kontrak Anda (2.5 kali modal beli). Jika Anda membeli kontrak senilai Rp 1.000.000, penambangan otomatis berhenti saat total hasil mencapai Rp 2.500.000.' : 'Capping is the maximum lifetime earning capacity of your contract (2.5x principal). For instance, a Rp 1,000,000 contract produces up to Rp 2,500,000 in total mining yields.'
                        },
                        {
                          q: language === 'id' ? 'Bagaimana sistem komisi MLM / Network?' : 'How does the network MLM system work?',
                          a: language === 'id' ? 'Sistem kami menggunakan struktur bertingkat: Komisi Sponsor Utama (10%), Rebate Level 1 (5%), dan Level 2 (2%). Komisi langsung masuk ke saldo tunai dan meningkatkan progress capping Anda.' : 'We operate a multi-level referral hierarchy: Direct Sponsor incentives (10%), Generation Level 1 rebates (5%), and Level 2 rebates (2%). Commissions directly load to your balance.'
                        }
                      ].map((faq, i) => (
                        <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-2xl text-left space-y-1.5">
                          <span className="text-xs font-black text-gold-primary block">Q: {faq.q}</span>
                          <span className="text-[10px] text-slate-300 font-medium block leading-relaxed">A: {faq.a}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => triggerModal('💬 Layanan Pelanggan GROCKGOLD Telegram Support:<br><b>@GrockGold_Support_Bot</b><br><br>Email: support@grockgold.com<br>Waktu Respons: 24/7 Live.', 'info')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gold-primary font-bold rounded-2xl text-xs uppercase transition flex items-center justify-center gap-2"
                      >
                        HUBUNGI CUSTOMER SERVICE
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ABOUT US VIEW */}
              {currentTab === 'about' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
                    <h2 className="text-sm font-black tracking-widest text-white uppercase">
                      {language === 'id' ? 'Tentang Kami' : 'About Us'}
                    </h2>
                  </div>

                  <div className="bg-[#0e061c] border border-gold-primary/25 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex justify-center mb-1">
                      <span className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">
                        GROCKGOLD
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-semibold leading-relaxed text-center whitespace-pre-line border-b border-white/5 pb-4">
                      {language === 'id' ? (
                        'GrockGold Mining Ltd adalah perusahaan penambangan dan pengelolaan portofolio komersial berskala internasional yang terafiliasi resmi dengan Randgold Resources West Africa.\n\nKami mengintegrasikan teknologi cloud hashing penambangan canggih untuk memberikan jaminan aksesibilitas portofolio berkinerja tinggi bagi seluruh mitra terdaftar.'
                      ) : (
                        'GrockGold Mining Ltd is a premium international gold mining operations and asset platform, officially partnered with Randgold Resources West Africa.\n\nWe build advanced high-throughput cloud hashing solutions that enable transparent, stable, and highly rewarding digital gold mining contract investment fleets.'
                      )}
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-300">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">{t.company}</span>
                        <span className="text-white text-right">GrockGold Mining Ltd.</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">{t.license}</span>
                        <span className="text-white">12345/MINING/2026-REG</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">{t.regulated}</span>
                        <span className="text-white text-right">Ministry of Energy & Minerals Registry</span>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerModal(`📄 Official License & Certifications Of GrockGold Mining.<br><br>Issuer: Ministry of Energy & Minerals Registry<br>Registered Entity: GrockGold Mining Ltd.<br>Verification Hash: #SHA256-GGM998162816B<br>Status: LICENSED & COMPLIANT`, 'success')}
                      className="w-full py-3.5 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-2xl text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD LEGAL DOCUMENT
                    </button>
                  </div>
                </motion.div>
              )}

            </div>

            {/* 5. APP NAV BOTTOM BAR */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[425px] bg-[#0c071d]/95 backdrop-blur-md border-t border-gold-primary/20 z-[99998] py-2 px-1 flex justify-around shadow-2xl">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'contract', label: language === 'id' ? 'Kontrak' : 'Contracts', icon: Ticket },
                { id: 'livemining', label: 'Live Mining', icon: Cpu },
                { id: 'wallet', label: 'Wallet', icon: Wallet },
                { id: 'profile', label: language === 'id' ? 'Profil' : 'Profile', icon: User },
              ].map((nav) => {
                const Icon = nav.icon;
                const isActive = currentTab === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => setCurrentTab(nav.id)}
                    className="flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 relative group"
                  >
                    <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'}`}>
                      <Icon className={`w-5 h-5 mb-0.5 transition-colors duration-200 ${
                        isActive
                          ? 'text-gold-primary filter drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                    </div>
                    <span className={`text-[9px] font-black tracking-wide leading-none transition-colors duration-200 ${
                      isActive ? 'text-gold-primary' : 'text-slate-500'
                    }`}>
                      {nav.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicatorDot"
                        className="absolute bottom-0 w-1 h-1 rounded-full bg-gold-primary shadow-[0_0_8px_rgba(212,175,55,0.9)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* CUSTOM WITHDRAWAL FORM MODAL */}
        <AnimatePresence>
          {withdrawModalOpen && (
            <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setWithdrawModalOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative w-full max-w-sm bg-[#110724] border border-gold-primary/30 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <ArrowUp className="w-5 h-5 text-rose-500" />
                    {language === 'id' ? 'Form Penarikan Saldo' : 'Withdrawal Form'}
                  </h3>
                  <button onClick={() => setWithdrawModalOpen(false)} className="text-slate-400 hover:text-white transition">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-bold">
                  {/* Bank Select */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">Pilih Bank Tujuan</label>
                    <select
                      value={withdrawBank}
                      onChange={(e) => setWithdrawBank(e.target.value)}
                      className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                    >
                      {['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'DANA', 'OVO', 'Gopay'].map((b) => (
                        <option key={b} value={b} className="bg-[#110724] text-white font-semibold">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">Nomor Rekening / No. E-Wallet</label>
                    <input
                      type="text"
                      placeholder="Masukkan No Rekening..."
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary font-mono"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase flex justify-between">
                      <span>Nominal Penarikan (Rp)</span>
                      <span className="text-slate-400 font-semibold text-[9px]">Saldo: Rp {state.mainBalance.toLocaleString('id-ID')}</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-black">Rp</span>
                      <input
                        type="text"
                        placeholder="Min Rp 100.000"
                        value={withdrawAmount}
                        onChange={(e) => formatWithdrawAmount(e.target.value)}
                        className="w-full bg-black/40 border border-purple-900/30 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setWithdrawModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeWithdrawal}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-gold-primary/25"
                  >
                    Tarik Saldo
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CUSTOM BANK REGISTRATION / EDIT MODAL */}
        <AnimatePresence>
          {bankModalOpen && (
            <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setBankModalOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative w-full max-w-sm bg-[#110724] border border-gold-primary/30 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-gold-primary" />
                    {currentAccount?.settings?.bankNumber 
                      ? (language === 'id' ? 'Ubah Rekening Bank' : 'Edit Bank Account')
                      : (language === 'id' ? 'Tambah Rekening Bank' : 'Add Bank Account')}
                  </h3>
                  <button onClick={() => setBankModalOpen(false)} className="text-slate-400 hover:text-white transition">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-bold">
                  {/* Nama Bank */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">Nama Bank / E-Wallet</label>
                    <select
                      value={bankNameInput}
                      onChange={(e) => setBankNameInput(e.target.value)}
                      className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                    >
                      {['BCA', 'MANDIRI', 'BNI', 'BRI', 'CIMB NIAGA', 'PERMATA', 'DANA', 'OVO', 'GOPAY', 'LINKAJA'].map((b) => (
                        <option key={b} value={b} className="bg-[#110724] text-white font-semibold">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nomor Rekening */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">Nomor Rekening / No. Handphone E-Wallet</label>
                    <input
                      type="text"
                      placeholder="Masukkan nomor rekening..."
                      value={bankNumberInput}
                      onChange={(e) => setBankNumberInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary font-mono"
                    />
                  </div>

                  {/* Nama Pemilik */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">Nama Pemilik Rekening (Sesuai Buku Tabungan)</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama pemilik rekening..."
                      value={bankHolderInput}
                      onChange={(e) => setBankHolderInput(e.target.value.toUpperCase())}
                      className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setBankModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveBankAccount}
                    disabled={isUpdatingBank}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-gold-primary/25 flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    {isUpdatingBank ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : (
                      <span>💾</span>
                    )}
                    <span>Simpan</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CUSTOM TRANSFER FORM MODAL */}
        <AnimatePresence>
          {transferModalOpen && (
            <div className="fixed inset-0 z-[199999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTransferModalOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative w-full max-w-sm bg-[#110724] border border-gold-primary/30 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-blue-400 animate-pulse" />
                    {language === 'id' ? 'Form Transfer Saldo' : 'Transfer Balance Form'}
                  </h3>
                  <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-white transition">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-bold">
                  {/* Recipient User ID */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase">ID atau Username Penerima</label>
                    <input
                      type="text"
                      placeholder="Contoh: GGM-USER1024"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      className="w-full bg-black/40 border border-purple-900/30 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary font-mono uppercase"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-gold-primary text-[10px] block mb-1.5 uppercase flex justify-between">
                      <span>Nominal Transfer (Rp)</span>
                      <span className="text-slate-400 font-semibold text-[9px]">Saldo: Rp {state.mainBalance.toLocaleString('id-ID')}</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-black">Rp</span>
                      <input
                        type="text"
                        placeholder="Min Rp 10.000"
                        value={transferAmount}
                        onChange={(e) => formatTransferAmount(e.target.value)}
                        className="w-full bg-black/40 border border-purple-900/30 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-gold-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setTransferModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeTransfer}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-gold-primary/25"
                  >
                    Kirim Transfer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>



        {/* CUSTOM HARVEST MODAL */}
        <HarvestModal
          isOpen={harvestModalOpen}
          onClose={() => setHarvestModalOpen(false)}
          language={language}
          activeContracts={state.activeContracts}
          totalPortfolioValue={totalPortfolioValue}
          dailyYield={dailyYield}
          todayProfit={state.todayProfit}
          totalProfit={state.totalProfit}
          claimCooldownText={claimCooldownText}
          onClaimYield={handleClaimYield}
        />

        {/* WELCOME BONUS ACHIEVEMENTS SCHEMA MODAL */}
        <AnimatePresence>
          {showBonusSchemaModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-[#130b2c] border border-[#2a1754]/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowBonusSchemaModal(false)}
                  className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Title */}
                <h3 className="text-[#f59e0b] text-base font-black tracking-wide uppercase mb-6 mt-1">
                  SKEMA PENCAPAIAN BONUS
                </h3>

                {/* Divider */}
                <div className="w-full h-[1.5px] bg-[#2a1754]/40 mb-4" />

                {/* List of achievements */}
                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#211540]/60">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-[#b5179e]" />
                      <span className="text-sm font-extrabold text-white">80 Aktif</span>
                    </div>
                    <span className="text-sm font-black text-white font-sans">Get 1.800.000</span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#211540]/60">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-[#b5179e]" />
                      <span className="text-sm font-extrabold text-white">200 Aktif</span>
                    </div>
                    <span className="text-sm font-black text-white font-sans">Get 3.000.000</span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#211540]/60">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-[#b5179e]" />
                      <span className="text-sm font-extrabold text-white">500 Aktif</span>
                    </div>
                    <span className="text-sm font-black text-white font-sans">Get 5.000.000</span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-[#b5179e]" />
                      <span className="text-sm font-extrabold text-white">1000 Aktif</span>
                    </div>
                    <span className="text-sm font-black text-[#f59e0b] font-sans">Get 10.000.000</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* LUCKY SPIN MODAL */}
        <AnimatePresence>
          {luckySpinModalOpen && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 15 }}
                className="w-full max-w-sm bg-[#0e0722] border border-[#3c1d70] rounded-3xl p-5 shadow-2xl relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => !isSpinning && setLuckySpinModalOpen(false)}
                  disabled={isSpinning}
                  className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed z-30 animate-none"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-5 mt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-1.5">
                    <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: isSpinning ? '1s' : '4s' }} />
                    LUCKY SPIN WHEEL
                  </div>
                  <h3 className="text-xl font-extrabold text-white leading-tight">
                    {language === 'id' ? 'Putar & Menang Saldo' : 'Spin & Win Gold Balance'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[250px] mx-auto leading-relaxed">
                    {language === 'id' ? 'Dapatkan saldo utama gratis atau mining booster kecepatan penambangan!' : 'Get free main balance or mining boosters to speed up earnings!'}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-purple-500/15 mb-6" />

                {/* The Rotating Wheel Container */}
                <div className="flex flex-col items-center justify-center mb-6 relative">
                  {/* Outer Glowing Border Ring */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#7209b7] via-[#da70d6] to-[#f8961e] rounded-full blur-sm opacity-50 animate-pulse" />

                  {/* Pointer at the Top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2.5 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />

                  {/* Physical Wheel Circular Div */}
                  <div 
                    className="relative w-48 h-48 rounded-full border-4 border-yellow-500 bg-[#120735] shadow-[0_0_20px_rgba(234,179,8,0.35)] overflow-hidden flex items-center justify-center z-10"
                    style={{ 
                      transform: `rotate(${spinRotation}deg)`,
                      transition: isSpinning ? 'transform 3.6s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
                    }}
                  >
                    {/* Render Segments */}
                    {SPIN_ITEMS.map((item, idx) => {
                      const angle = idx * 45;
                      return (
                        <div 
                          key={idx}
                          className="absolute inset-0 origin-center"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          {/* Segment Colored Triangle / Slice */}
                          <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[41px] border-l-transparent border-r-[41px] border-r-transparent border-t-[96px]"
                            style={{ borderTopColor: item.color }}
                          />
                          {/* Segment Text Label */}
                          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 -rotate-90 origin-top text-center w-24">
                            <span className="text-[8px] font-black tracking-tighter text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] block uppercase leading-none">
                              {item.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Golden Center Pin / Hub */}
                    <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-white/60 z-20 shadow-md shadow-black flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spin Button */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className={`w-full py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 ${
                    isSpinning
                      ? 'bg-purple-950/40 text-purple-400 border border-purple-500/10 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:brightness-110 active:scale-95 shadow-lg shadow-yellow-500/20 font-black cursor-pointer'
                  }`}
                >
                  <Compass className={`w-4 h-4 ${isSpinning ? 'animate-spin text-purple-400' : 'text-black'}`} />
                  {isSpinning 
                    ? (language === 'id' ? 'MEMUTAR...' : 'SPINNING...') 
                    : (language === 'id' ? 'PUTAR SEKARANG' : 'SPIN NOW')}
                </button>

                {/* Prize Table Info */}
                <div className="mt-4 bg-[#080315] border border-purple-500/10 rounded-xl p-3">
                  <span className="text-[8px] font-black text-slate-500 tracking-wider block mb-1.5 uppercase text-center">
                    {language === 'id' ? 'DAFTAR HADIAH UTAMA' : 'MAIN REWARDS LIST'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[#f8961e]" />
                      <span>{language === 'id' ? 'Rp 50.000 Tunai' : 'Rp 50,000 Cash'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[#f8961e]" />
                      <span>{language === 'id' ? 'Rp 25.000 Tunai' : 'Rp 25,000 Cash'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[#f8961e]" />
                      <span>{language === 'id' ? 'Boost Tambang 10x' : '10x Mine Boost'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[#f8961e]" />
                      <span>{language === 'id' ? 'Boost Tambang 5x' : '5x Mine Boost'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MISSION MODAL */}
        <AnimatePresence>
          {missionModalOpen && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 15 }}
                className="w-full max-w-sm bg-[#070b15] border border-cyan-900/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setMissionModalOpen(false)}
                  className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/5 z-30"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-5 mt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5">
                    <Target className="w-3.5 h-3.5" />
                    ACHIEVEMENT MISSIONS
                  </div>
                  <h3 className="text-xl font-extrabold text-white leading-tight">
                    {language === 'id' ? 'Misi Harian Berhadiah' : 'Rewarded Achievement Tasks'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[250px] mx-auto leading-relaxed">
                    {language === 'id' ? 'Selesaikan tugas-tugas di bawah ini untuk mendapatkan saldo tunai tambahan!' : 'Complete the following tasks to earn extra cash rewards instantly!'}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-cyan-500/15 mb-4" />

                {/* Missions List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {[
                    {
                      id: 'm1',
                      title: language === 'id' ? 'Aktifkan Kontrak Pertama' : 'Activate First Contract',
                      desc: language === 'id' ? 'Beli minimal 1 unit kontrak penambangan emas' : 'Purchase at least 1 unit of gold mining contract',
                      reward: 50000,
                      progressCur: state.activeContracts > 0 ? 1 : 0,
                      progressMax: 1,
                      isCompleted: state.activeContracts > 0,
                    },
                    {
                      id: 'm2',
                      title: language === 'id' ? 'Undang Downline Pertama' : 'Invite First Downline',
                      desc: language === 'id' ? 'Miliki minimal 1 partner/holder aktif di tim' : 'Have at least 1 partner/active holder in your team',
                      reward: 100000,
                      progressCur: networkActiveCount >= 1 ? 1 : 0,
                      progressMax: 1,
                      isCompleted: networkActiveCount >= 1,
                    },
                    {
                      id: 'm3',
                      title: language === 'id' ? 'Klaim Welcome Bonus' : 'Claim Welcome Bonus',
                      desc: language === 'id' ? 'Berhasil klaim bonus pendaftaran Rp 1.8M' : 'Successfully claim the registration bonus of Rp 1.8M',
                      reward: 250000,
                      progressCur: state.welcomeBonusClaimed ? 1 : 0,
                      progressMax: 1,
                      isCompleted: state.welcomeBonusClaimed,
                    },
                    {
                      id: 'm4',
                      title: language === 'id' ? 'Cairkan Hasil Tambang' : 'Withdraw Earnings',
                      desc: language === 'id' ? 'Lakukan penarikan saldo pertama kali ke rekening' : 'Make your very first balance withdrawal to bank account',
                      reward: 10000,
                      progressCur: state.totalProfit > 0 ? 1 : 0,
                      progressMax: 1,
                      isCompleted: state.totalProfit > 0,
                    },
                  ].map((mission) => {
                    const isClaimed = claimedMissions.includes(mission.id);
                    return (
                      <div 
                        key={mission.id} 
                        className="p-3 rounded-2xl bg-[#0d1527] border border-cyan-900/20 flex flex-col gap-2 transition duration-300 hover:border-cyan-500/20"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-white leading-tight">
                              {mission.title}
                            </h4>
                            <p className="text-[8px] text-slate-400 mt-0.5 leading-normal">
                              {mission.desc}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-bold text-slate-500 block uppercase">REWARD</span>
                            <span className="text-[10px] font-black text-emerald-400">Rp {mission.reward.toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Progress Bar & Buttons */}
                        <div className="flex items-center justify-between gap-4 mt-1">
                          <div className="flex-1">
                            <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-bold mb-1 uppercase">
                              <span>Progress</span>
                              <span>{mission.progressCur} / {mission.progressMax}</span>
                            </div>
                            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                                style={{ width: `${(mission.progressCur / mission.progressMax) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            {isClaimed ? (
                              <button 
                                disabled 
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 text-[8px] font-bold cursor-default"
                              >
                                CLAIMED
                              </button>
                            ) : mission.isCompleted ? (
                              <button 
                                onClick={() => handleClaimMission(mission.id, mission.reward, mission.title)}
                                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 text-black text-[8px] font-extrabold hover:scale-105 active:scale-95 transition cursor-pointer shadow-md shadow-emerald-500/10"
                              >
                                CLAIM
                              </button>
                            ) : (
                              <button 
                                disabled 
                                className="px-2.5 py-1.5 rounded-lg bg-[#141d2d] border border-white/5 text-slate-500 text-[8px] font-bold cursor-not-allowed"
                              >
                                LOCK
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Previously Completed Missions Section */}
                <div className="mt-4 pt-3.5 border-t border-cyan-500/15">
                  <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {language === 'id' ? 'RIWAYAT MISI SELESAI' : 'COMPLETED MISSIONS HISTORY'}
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {claimedMissionsHistory.map((item) => (
                      <div key={item.id} className="p-2 rounded-xl bg-[#080d19]/80 border border-emerald-500/10 flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <div className="text-[9.5px] font-extrabold text-slate-200 truncate">{item.title}</div>
                          <div className="text-[7px] text-slate-500 font-bold font-mono mt-0.5">
                            {new Date(item.timestamp).toLocaleString('id-ID')}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-black text-emerald-400 font-mono">+Rp {item.reward.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                    {claimedMissionsHistory.length === 0 && (
                      <div className="text-[8.5px] text-slate-500 text-center py-3 italic">
                        {language === 'id' ? 'Belum ada misi yang diselesaikan.' : 'No missions completed yet.'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        </div>
      )}

      {/* CUSTOM GLOBAL DIALOG COMPONENT */}
      <Modal
        isOpen={modalOpen}
        message={modalMessage}
        type={modalType}
        showConfirm={modalShowConfirm}
        onConfirm={modalOnConfirm}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

// Simple internal helper icon to bypass legacy styles safely
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
