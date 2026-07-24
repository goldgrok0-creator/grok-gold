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
import { AppState, Transaction, Holder, CONFIG, UserAccount, SystemError, isMemberAccount } from './types';
import { calculateCappingEarnings } from './utils/capping';
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
import NotificationsPage from './components/NotificationsPage';
import AboutPage from './components/AboutPage';
import HelpPage from './components/HelpPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import ContactInfoPage from './components/ContactInfoPage';
import SettingsPage from './pages/Settings';
import LuckySpinPage from './pages/LuckySpin';
import { SearchableCountrySelect } from './components/SearchableCountrySelect';
import { WORLD_COUNTRIES } from './data/countries';
import ContractPage from './components/ContractPage';
import NetworkPage from './components/NetworkPage';
import WalletPage from './components/WalletPage';
import { CommunityPage } from './components/CommunityPage';
import { HarvestModal } from './components/HarvestModal';
import ClockIcon from './components/icons/ClockIcon';
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
  compressImage,
  hashPassword,
  executeLuckySpinInSupabase
} from './supabase';
import { calculateNetworkActiveCount } from './utils/network';

/**
 * Calculates the time remaining until the next available Lucky Spin
 * and returns formatted timer object for display on the Lucky Spin page.
 */
export function calculateLuckySpinCountdown(
  nextResetAt: number | null | undefined,
  serverTimeOffset: number = 0,
  spinsRemaining: number = 0
): {
  formatted: string;
  remainingSeconds: number;
  hours: string;
  minutes: string;
  seconds: string;
  isLocked: boolean;
} {
  if (spinsRemaining > 0 || !nextResetAt || nextResetAt <= 0) {
    return {
      formatted: '24:00:00',
      remainingSeconds: 86400,
      hours: '24',
      minutes: '00',
      seconds: '00',
      isLocked: false,
    };
  }

  const currentServerNow = Date.now() + serverTimeOffset;
  const diffMs = nextResetAt - currentServerNow;
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (totalSeconds <= 0) {
    return {
      formatted: '00:00:00',
      remainingSeconds: 0,
      hours: '00',
      minutes: '00',
      seconds: '00',
      isLocked: false,
    };
  }

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return {
    formatted: `${hours}:${minutes}:${seconds}`,
    remainingSeconds: totalSeconds,
    hours,
    minutes,
    seconds,
    isLocked: true,
  };
}

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

import { isSameDay, isSameWeek, isSameMonth } from './utils/date';

export default function App() {
  // --- SYSTEM STATES ---
  const [isSplashScreen, setIsSplashScreen] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('en');
  const [currentTab, setCurrentTab] = useState<string>('home');
  const prevTabRef = useRef(currentTab);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  useEffect(() => {
    if (prevTabRef.current !== currentTab) {
      const TAB_ORDER = [
        'home',
        'contract',
        'livemining',
        'wallet',
        'profile',
        'community',
        'luckyspin',
        'network',
        'leaderboard',
        'referral',
        'reward',
        'deposit',
        'transactions',
        'notifications',
        'settings',
        'help',
        'about',
        'privacy',
        'terms',
        'contact',
        'legal',
        'errorhistory'
      ];
      const prevIdx = TAB_ORDER.indexOf(prevTabRef.current);
      const currIdx = TAB_ORDER.indexOf(currentTab);
      if (currIdx !== -1 && prevIdx !== -1) {
        setSlideDirection(currIdx >= prevIdx ? 1 : -1);
      } else {
        setSlideDirection(1);
      }
      prevTabRef.current = currentTab;
    }
  }, [currentTab]);
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
  const lastTickTimeRef = useRef<number>(Date.now());
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
  const [regCountry, setRegCountry] = useState('');
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
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

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
  const [luckySpinHistory, setLuckySpinHistory] = useState<Array<{ id: string; prize: string; date: number; success: boolean }>>([]);
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
    rewardBalance: 0,
    lastClaimTime: 0,
    welcomeBonusClaimed: false,
    isLoggedIn: false,
    username: '',
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

      // Re-verify current active logged-in user with Supabase Auth session or localStorage session
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseAccounts = await fetchAccountsFromSupabase();

      const savedUsername = localStorage.getItem('grockgold_logged_in_username_v4');
      let loggedInUsername: string | null = null;
      let matchedAccount: UserAccount | null = null;

      if (session?.user && supabaseAccounts) {
        const authUser = session.user;
        matchedAccount = supabaseAccounts.find(acc =>
          (acc.email && authUser.email && acc.email.toLowerCase() === authUser.email.toLowerCase()) ||
          (acc.settings?.authUserId === authUser.id) ||
          (acc.settings?.auth_user_id === authUser.id) ||
          (authUser.user_metadata?.username && acc.username.toLowerCase() === authUser.user_metadata.username.toLowerCase())
        ) || null;

        if (matchedAccount) {
          loggedInUsername = matchedAccount.username;
          // Ensure relation auth_user_id -> auth.users.id is saved in settings if missing
          if (matchedAccount.settings?.authUserId !== authUser.id) {
            updateUserSettingsInSupabase(matchedAccount.username, {
              ...(matchedAccount.settings || {}),
              authUserId: authUser.id,
              auth_user_id: authUser.id
            }).catch(() => {});
          }
        } else if (authUser.email?.toLowerCase() === 'admin@grockgold.com') {
          loggedInUsername = 'admin';
          matchedAccount = supabaseAccounts.find(a => a.username.toLowerCase() === 'admin') || null;
        }
      }

      // Fallback: Check localStorage saved username or current active account username
      if (!matchedAccount && supabaseAccounts && supabaseAccounts.length > 0) {
        const targetUser = savedUsername || currentAccount?.username;
        if (targetUser) {
          matchedAccount = supabaseAccounts.find(a => a.username.toLowerCase() === targetUser.toLowerCase()) || null;
          if (matchedAccount) {
            loggedInUsername = matchedAccount.username;
          }
        }
      }

      if (supabaseAccounts) {
        setSupabaseError(null);
        setAccounts(supabaseAccounts);
        try {
          sessionStorage.setItem('grockgold_accounts_cache_v4', 'true');
        } catch (e) {
          console.warn('sessionStorage setItem failed:', e);
        }

        if (matchedAccount) {
          const found = matchedAccount;
          setCurrentAccount(found);
          setState(prev => ({
            ...prev,
            ...found.state,
            username: found.username,
            isLoggedIn: true,
          }));
          if (found.settings?.language) {
            setLanguage(found.settings.language);
          }
          if (found.username.toLowerCase() === 'admin') {
            if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
              setCurrentTab('admin');
            }
          }
          if (found.settings?.spinTickets !== undefined) setSpinTickets(found.settings.spinTickets);
          if (found.settings?.spinCount !== undefined) setSpinCount(found.settings.spinCount);
          setLuckySpinHistory(found.settings?.luckySpinHistory || []);
          if (found.settings?.claimedMissions !== undefined) setClaimedMissions(found.settings.claimedMissions);
          if (found.settings?.claimedMissionsHistory !== undefined) setClaimedMissionsHistory(found.settings.claimedMissionsHistory);
          if (found.settings?.dailyTaskVisit !== undefined) setDailyTaskVisit(found.settings.dailyTaskVisit);
          if (found.settings?.dailyTaskClaimed !== undefined) setDailyTaskClaimed(found.settings.dailyTaskClaimed);
          if (found.settings?.dailyTaskCheck !== undefined) setDailyTaskCheck(found.settings.dailyTaskCheck);
        } else {
          setCurrentAccount(null);
          localStorage.removeItem('grockgold_logged_in_username_v4');
          setState(prev => ({ ...prev, isLoggedIn: false }));
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
    let isMounted = true;
    const fetchServerTime = async () => {
      try {
        const r = await fetch('/api/time', { cache: 'no-store' });
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        const data = await r.json();
        if (isMounted && data && typeof data.serverTime === 'number') {
          const offset = data.serverTime - Date.now();
          setServerTimeOffset(offset);
        }
      } catch (err: any) {
        if (isMounted) {
          setServerTimeOffset(0);
          console.warn('[Time Sync] Server time endpoint unavailable, using local device time fallback:', err?.message || err);
        }
      }
    };
    
    fetchServerTime();
    // Refresh server time every 5 minutes to keep drift-free accuracy
    const timeInterval = setInterval(fetchServerTime, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(timeInterval);
    };
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
    const channelName = `app_main_schema_db_changes_${Math.random().toString(36).substring(2, 9)}`;
    const dbChannel = supabase
      .channel(channelName)
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

    // Reset last tick time on mount / change
    lastTickTimeRef.current = Date.now();

    // Determine loop interval dynamically
    // When on live mining, tick at 1 second for perfect visual real-time smoothness
    // When on other tabs, throttle tick to 6 seconds to completely save device battery and CPU resources
    const tickInterval = currentTab === 'livemining' ? 1000 : 6000;

    const timer = setInterval(() => {
      const nowTime = Date.now();
      const elapsedMs = nowTime - lastTickTimeRef.current;
      // Safeguard: clamp elapsed seconds in case of browser throttling or system sleep
      const elapsedSecs = Math.min(Math.max(elapsedMs / 1000, 0.1), 3600);
      lastTickTimeRef.current = nowTime;

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
          let nextCycle = prev.cyclePercent + 1.5 * simSpeed * activeBoostMult * elapsedSecs;
          let addedGold = 0;

          if (nextCycle >= 100) {
            nextCycle = nextCycle % 100;
            // Add a realistic trace amount of gold per active contract unit
            addedGold = (0.0003 + Math.random() * 0.0007) * prev.activeContracts * simSpeed * activeBoostMult * elapsedSecs;
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

          return {
            ...prev,
            cyclePercent: nextCycle,
            goldProduction: prev.goldProduction + addedGold,
            goldProductionDaily: nextDaily,
            goldProductionWeekly: nextWeekly,
            goldProductionMonthly: nextMonthly,
            lastGoldUpdateTime: now,
            pendingMiningReward: 0,
          };
        });
      }
    }, tickInterval);

    return () => clearInterval(timer);
  }, [state.isLoggedIn, state.activeContracts, state.totalEarned, isSplashScreen, simSpeed, boostTimeLeft, currentAccount?.settings?.autoReinvest, currentTab]);

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
  // --- DYNAMIC WALLET METRICS (PERFECTLY SYNCHRONIZED WITH THE DATABASE TRANSACTIONS & MEMOIZED FOR MAXIMUM PERFORMANCE) ---
  const {
    miningProfit,
    referralReward,
    rebateReward,
    bonusReward,
    totalEarned,
    totalWithdraw,
    totalDeposit,
  } = React.useMemo(() => {
    const txs = state.transactions || [];
    let mining = 0;
    let referral = 0;
    let rebate = 0;
    let bonus = 0;
    let withdraw = 0;
    let deposit = 0;

    for (let i = 0; i < txs.length; i++) {
      const t = txs[i];
      const amt = Number(t.amount) || 0;
      if (t.type === 'reward') {
        mining += amt;
      } else if (t.type === 'referral') {
        referral += amt;
      } else if (t.type === 'rebate') {
        rebate += amt;
      } else if (t.type === 'welcome_bonus' || t.type === 'bonus') {
        bonus += amt;
      } else if (t.type === 'withdraw') {
        const stat = (t.status || '').toLowerCase();
        if (stat !== 'pending' && stat !== 'processing' && stat !== 'rejected' && stat !== 'failed') {
          withdraw += amt;
        }
      } else if (t.type === 'deposit') {
        const stat = (t.status || '').toLowerCase();
        if (stat !== 'pending' && stat !== 'processing' && stat !== 'rejected' && stat !== 'failed') {
          deposit += amt;
        }
      }
    }

    const finalReferral = Math.max(referral, state.referralEarned || 0);
    const finalRebate = Math.max(rebate, state.rebateEarned || 0);

    // Bonus Income ONLY exists after the user has met requirements and executed Claim Bonus!
    if (state.welcomeBonusClaimed) {
      if (bonus === 0) bonus = CONFIG.WELCOME_BONUS_AMOUNT;
    } else {
      bonus = 0; // Referral registrations do NOT automatically generate Bonus Income
    }

    const recordedProfit = Math.max(state.totalEarned || 0, state.totalProfit || 0);
    const nonMiningTotal = finalReferral + finalRebate + bonus;
    const calculatedMining = Math.max(mining, Math.max(0, recordedProfit - nonMiningTotal));

    return {
      miningProfit: calculatedMining,
      referralReward: finalReferral,
      rebateReward: finalRebate,
      bonusReward: bonus,
      totalEarned: calculatedMining + finalReferral + finalRebate + bonus,
      totalWithdraw: withdraw,
      totalDeposit: deposit,
    };
  }, [state.transactions, state.welcomeBonusClaimed, state.referralEarned, state.rebateEarned, state.totalEarned, state.totalProfit]);

  const cappingMetrics = calculateCappingEarnings(state);
  const {
    totalModalAktif: totalPortfolioValue,
    maxPossibleEarnings,
    cappingEarnings,
    cappingRatio,
    cappingRatioVisual,
    cappingPercentStr,
    isCapped: isCappedLimitMet
  } = cappingMetrics;

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
        isMemberAccount(acc) &&
        acc.invitedBy &&
        currentAccount &&
        acc.invitedBy.toLowerCase() === currentAccount.username.toLowerCase()
    );
    const l1Usernames = direct.map(acc => acc.username.toLowerCase());
    const l2 = accounts.filter(
      acc => isMemberAccount(acc) && acc.invitedBy && l1Usernames.includes(acc.invitedBy.toLowerCase())
    );
    const l2Usernames = l2.map(acc => acc.username.toLowerCase());
    const l3 = accounts.filter(
      acc => isMemberAccount(acc) && acc.invitedBy && l2Usernames.includes(acc.invitedBy.toLowerCase())
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

    const { count: networkActiveCount, activeHolders } = calculateNetworkActiveCount(
      currentAccount?.username,
      accounts
    );

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
    const filteredAccounts = accounts.filter(isMemberAccount);
    const mapped = filteredAccounts.map(u => {
      const isSelf = currentAccount && u.username.toLowerCase() === currentAccount.username.toLowerCase();
      const activeState = isSelf ? state : u.state;

      const l1 = accounts.filter(
        acc =>
          isMemberAccount(acc) &&
          acc.invitedBy &&
          acc.invitedBy.toLowerCase() === u.username.toLowerCase()
      );
      const l1Usernames = l1.map(acc => acc.username.toLowerCase());

      const l2 = accounts.filter(
        acc =>
          isMemberAccount(acc) &&
          acc.invitedBy && l1Usernames.includes(acc.invitedBy.toLowerCase())
      );
      const l2Usernames = l2.map(acc => acc.username.toLowerCase());

      const l3 = accounts.filter(
        acc =>
          isMemberAccount(acc) &&
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

    // Direct database query for user authentication (prevent password exposure)
    let dbUser: any = null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.${ident},email.ilike.${ident}`)
        .maybeSingle();
      if (data) {
        dbUser = data;
      }
    } catch (e) {
      console.error('Error querying user directly for auth:', e);
    }

    if (!dbUser) {
      triggerModal(language === 'id' ? '❌ Akun tidak ditemukan!' : '❌ Account not found!', 'danger');
      return;
    }

    const inputHash = await hashPassword(pass);
    const isPasswordValid = dbUser.password === pass || dbUser.password === inputHash;

    if (!isPasswordValid) {
      triggerModal(language === 'id' ? '❌ Kata sandi salah!' : '❌ Incorrect password!', 'danger');
      return;
    }

    const mappedAccounts = await fetchAccountsFromSupabase(dbUser.username);
    let found = mappedAccounts?.find(acc => acc.username.toLowerCase() === dbUser.username.toLowerCase());

    if (!found) {
      found = {
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
    }

    // Reset unverifiedEmail state first
    setUnverifiedEmail(null);
    setResendStatus(null);

    // Sign in to Supabase Auth on-the-fly to establish safe session
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: found.email,
        password: pass
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
              password: pass,
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
              password: pass
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

    localStorage.setItem('grockgold_logged_in_username_v4', found.username);

    setState({
      ...found.state,
      username: found.username,
      isLoggedIn: true,
    });

    if (found.settings?.language) {
      setLanguage(found.settings.language);
    }

    triggerModal(t.successLogin, 'success');
    if (found.username.toLowerCase() === 'admin') {
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new Event('popstate'));
      setCurrentTab('admin');
    } else {
      setCurrentTab('home');
    }
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
      username: found.username,
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
    setLuckySpinHistory([]);
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
      country: regCountry || 'Indonesia',
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
        setRegCountry('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegReferralCode('');
        setRegAgreed(false);

        // Auto-bypass verification and auto-login newly created account
        localStorage.setItem('grockgold_bypass_verification_v4', 'true');
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
      } else {
        triggerModal(language === 'id' ? '❌ Gagal membuat akun. Username atau Email mungkin sudah terdaftar.' : '❌ Failed to create account.', 'danger');
      }
    });
  };

  const handleChangePassword = async () => {
    const oldPass = profileOldPassword;
    const newPass = profileNewPassword;
    const confirmNew = profileConfirmPassword;

    if (!oldPass || !newPass || !confirmNew) {
      triggerModal(language === 'id' ? '❌ Semua kolom wajib diisi!' : '❌ All fields are required!', 'warning');
      return;
    }

    const hashedOld = await hashPassword(oldPass);
    const passMatches = (currentAccount?.password === oldPass) || (currentAccount?.password === hashedOld);

    if (!passMatches) {
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

  // --- PROCESS DAILY REWARD CLAIMS ---
  const handleClaimYield = async () => {
    if (!currentAccount) return;

    if (state.activeContracts === 0) {
      triggerModal(
        language === 'id'
          ? '⚠️ TIDAK ADA KONTRAK AKTIF\n\nAnda tidak memiliki unit kontrak aktif. Beli unit kontrak untuk mulai mengklaim Daily Reward.'
          : '⚠️ NO ACTIVE CONTRACT\n\nYou have no active contracts. Purchase a contract to start earning Daily Reward.',
        'warning'
      );
      return;
    }

    const nowServer = Date.now() + serverTimeOffset;
    if (state.lastClaimTime !== 0 && (nowServer - state.lastClaimTime < CONFIG.CLAIM_COOLDOWN)) {
      triggerModal(
        language === 'id'
          ? '⚠️ SUDAH MENGKLAIM HARI INI\n\nAnda sudah mengklaim Daily Reward hari ini. Silakan tunggu hingga hitung mundur selesai.'
          : "⚠️ ALREADY CLAIMED TODAY\n\nYou have already claimed today's Daily Reward. Please wait until the countdown ends.",
        'warning'
      );
      return;
    }

    const contractValue = state.activeContracts * CONFIG.PRICE_PER_UNIT;
    const rewardAmount = Math.round(contractValue * CONFIG.DAILY_REWARD_PERCENT);

    if (rewardAmount <= 0) {
      triggerModal(
        language === 'id' ? '⚠️ Jumlah Daily Reward 0.' : '⚠️ Daily Reward amount is 0.',
        'warning'
      );
      return;
    }

    const res = await claimDailyRewardInSupabase(currentAccount.username, rewardAmount);

    if (res.success) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      const claimedVal = res.claimedAmount || rewardAmount;
      const claimTx: Transaction = {
        id: 'CLM-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: 'reward',
        amount: claimedVal,
        date: Date.now(),
        description: `Daily Reward (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% Contract Yield)`,
      };

      // Add to rewardBalance directly, mainBalance remains UNCHANGED, do NOT reset pendingMiningReward
      setState(prev => ({
        ...prev,
        rewardBalance: res.rewardBalance ?? ((prev.rewardBalance ?? 0) + claimedVal),
        totalEarned: res.totalEarned ?? (prev.totalEarned + claimedVal),
        lastClaimTime: res.lastClaimTime ?? Date.now(),
        transactions: [claimTx, ...(prev.transactions || [])],
      }));

      triggerModal(
        language === 'id'
          ? `✅ Berhasil mengklaim Daily Reward sebesar Rp ${claimedVal.toLocaleString('id-ID')} ke Saldo Reward Anda!`
          : `✅ Successfully claimed Daily Reward of Rp ${claimedVal.toLocaleString('id-ID')} to your Reward Balance!`,
        'success'
      );

      syncFromSupabase();
    } else {
      const errMsg = res.error || (language === 'id' ? 'Gagal mengklaim Daily Reward.' : 'Failed to claim Daily Reward.');
      triggerModal(`❌ ${errMsg}`, 'danger');
    }
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
    
    // Upload local compressed base64 image to Supabase Storage and retrieve public URL or fallback base64 Data URL
    const uploadResult = await uploadProofToSupabaseStorage(depositProof, depositProofName || 'proof.jpg');
    
    const publicUrl = uploadResult.url || depositProof;
    
    if (!publicUrl) {
      setIsUploadingProof(false);
      triggerModal(
        language === 'id' ? '❌ Gagal memproses gambar bukti transfer.' : '❌ Failed to process transfer proof image.',
        'danger'
      );
      return;
    }

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
    if (isSubmittingWithdrawal) return;

    const amount = parseInt(withdrawAmount.replace(/[^0-9]/g, '')) || 0;

    if (amount <= 0) {
      triggerModal(
        language === 'id' ? '❌ Nominal penarikan harus lebih besar dari 0!' : '❌ Withdrawal amount must be greater than 0!',
        'warning'
      );
      return;
    }

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

    setIsSubmittingWithdrawal(true);
    const wdId = 'WD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    createWithdrawalInSupabase(wdId, currentAccount.username, amount, withdrawBank, withdrawAccount, currentAccount.fullName).then(success => {
      setIsSubmittingWithdrawal(false);
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
    }).catch(err => {
      setIsSubmittingWithdrawal(false);
      console.error(err);
      triggerModal(language === 'id' ? '❌ Gagal mengajukan penarikan.' : '❌ Failed to submit withdrawal request.', 'danger');
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
    const { maxPossibleEarnings: maxAllowed, remainingCapping } = calculateCappingEarnings(state);

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
          rewardBalance: (prev.rewardBalance ?? 0) + finalCommission,
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
          rewardBalance: (prev.rewardBalance ?? 0) + CONFIG.WELCOME_BONUS_AMOUNT,
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
  const handleSpin = async () => {
    if (isSpinning) return;
    if (!currentAccount) return;

    if (spinTickets <= 0) {
      triggerModal(
        language === 'id' ? '❌ Anda tidak memiliki Tiket Spin tersisa!' : '❌ You have no Spin Tickets left!',
        'warning'
      );
      return;
    }

    setIsSpinning(true);

    const res = await executeLuckySpinInSupabase(currentAccount.username);
    if (!res.success) {
      setIsSpinning(false);
      triggerModal(
        language === 'id' ? `❌ Gagal melakukan Spin: ${res.error}` : `❌ Spin execution failed: ${res.error}`,
        'danger'
      );
      return;
    }

    const randomIndex = res.prizeIndex;
    const degreePerSegment = 360 / SPIN_ITEMS.length;
    const extraSpins = 5;
    const targetRotation = spinRotation + (extraSpins * 360) + (360 - (randomIndex * degreePerSegment)) - (spinRotation % 360);
    
    setSpinRotation(targetRotation);
    setSpinPrizeIndex(randomIndex);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SPIN_ITEMS[randomIndex];
      
      // Update local spin stats
      setSpinTickets(prev => Math.max(0, prev - 1));
      setSpinCount(prev => prev + 1);

      const historyEntry = {
        id: 'SPN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        prize: prize.label,
        date: Date.now(),
        success: prize.type !== 'zonk'
      };
      setLuckySpinHistory(prev => [historyEntry, ...prev].slice(0, 10));

      if (prize.type === 'cash') {
        const newTx: Transaction = {
          id: historyEntry.id,
          type: 'reward',
          amount: prize.value,
          date: Date.now(),
          description: language === 'id' ? `Hadiah Lucky Spin Wheel` : `Lucky Spin Wheel Prize`,
        };
        
        updateState(prev => ({
          ...prev,
          rewardBalance: (prev.rewardBalance ?? 0) + prize.value,
          totalEarned: prev.totalEarned + prize.value,
          transactions: [newTx, ...prev.transactions],
        }));

        triggerModal(
          language === 'id'
            ? `🎉 SELAMAT!\n\nAnda memenangkan Hadiah sebesar Rp ${prize.value.toLocaleString('id-ID')} dari Lucky Spin Wheel!\n\nHadiah telah masuk ke Saldo Reward Anda. Silakan klaim ke Saldo Wallet kapan saja.`
            : `🎉 CONGRATULATIONS!\n\nYou won a Prize of Rp ${prize.value.toLocaleString('id-ID')} from the Lucky Spin Wheel!\n\nThe prize has been added to your Reward Balance.`,
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
      rewardBalance: (prev.rewardBalance ?? 0) + rewardValue,
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

      {/* RENDER FULL-SCREEN ADMIN CONSOLE IF LOGGED IN AS ADMIN OR ON /ADMIN PATH, ELSE STANDARD USER INTERFACE */}
      {(currentPath.startsWith('/admin') || currentTab === 'admin') ? (
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
                            items.push({ 
                              id: 'admin', 
                              label: 'Admin Panel', 
                              icon: ShieldCheck, 
                              action: () => {
                                window.history.pushState(null, '', '/admin');
                                window.dispatchEvent(new Event('popstate'));
                              } 
                            });
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
              onNavigateToTab={(tab) => {
                setShowLanding(false);
                setCurrentTab(tab);
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

                        {/* Country */}
                        <SearchableCountrySelect
                          value={regCountry}
                          onChange={(countryName, countryObj) => {
                            setRegCountry(countryName);
                            if (countryObj && countryObj.dialCode) {
                              setRegPhone(countryObj.dialCode + ' ');
                            }
                          }}
                          label={tAuth.country || (language === 'id' ? 'NEGARA' : 'COUNTRY')}
                        />

                        {/* Phone */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                            {tAuth.phoneNumber}
                          </label>
                          <div className="relative">
                            {(() => {
                              const countryObj = WORLD_COUNTRIES.find(
                                c => c.name.toLowerCase() === regCountry.toLowerCase()
                              );
                              return (
                                <>
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {countryObj ? (
                                      <span className="text-xs font-mono font-bold text-yellow-400 flex items-center gap-1 select-none">
                                        <span>{countryObj.flag}</span>
                                        <span className="text-[11px]">{countryObj.dialCode}</span>
                                      </span>
                                    ) : (
                                      <Globe className="w-4 h-4 text-slate-500" />
                                    )}
                                  </div>
                                  <input
                                    type="tel"
                                    required
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                                    placeholder={countryObj ? `${countryObj.dialCode} 8123456789` : "e.g. +6281234567890"}
                                    className={`w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl ${countryObj ? (countryObj.dialCode.length > 3 ? 'pl-22' : 'pl-18') : 'pl-10'} pr-4 py-2.5 text-xs font-medium text-white transition font-mono focus:ring-1 focus:ring-yellow-500/20`}
                                  />
                                </>
                              );
                            })()}
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
                    <AnimatePresence>
                      {Boolean(regCountry.trim()) && (
                        <motion.div
                          key="register-actions"
                          initial={{ opacity: 0, y: 12, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.96 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="z-10 space-y-3.5 mt-auto pt-4.5 border-t border-yellow-500/10"
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>
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
            <div className={`flex-1 px-4 py-3 overflow-x-hidden ${
              currentTab === 'transactions' ? 'overflow-hidden flex flex-col pb-[76px]' : ''
            }`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, x: slideDirection * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection * -28 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full space-y-4"
                >

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

                  {/* BONUS MEMBER BARU: SALDO FREE SPIN BANNER */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="relative overflow-hidden rounded-3xl min-h-[130px] p-4 sm:p-5 bg-gradient-to-r from-[#14052e] via-[#090217] to-[#1d0640] border-2 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.35)] flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    {/* Corner Info Button (Top Right Fixed) */}
                    <button
                      onClick={() => {
                        triggerModal(
                          language === 'id'
                            ? `<div class="space-y-0">
                                <div class="text-center pt-0.5 pb-1">
                                  <div class="w-14 h-14 mx-auto rounded-full bg-gradient-to-b from-[#3b176e]/90 to-[#1e0a39]/90 border border-purple-400/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-2">🎁</div>
                                  <h3 class="text-[18px] sm:text-[20px] font-bold text-white tracking-wide">Informasi Saldo Free Spin</h3>
                                  <div class="relative my-2 flex items-center justify-center">
                                    <div class="w-full border-t border-purple-500/25"></div>
                                    <span class="absolute bg-[#12072b] px-3 text-purple-400 text-xs">✦</span>
                                  </div>
                                </div>
                                <div class="divide-y divide-purple-500/20 text-slate-200">
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">🎉</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">Bonus Member Baru</div>
                                      <div class="text-slate-300 text-[13px] sm:text-[14px] leading-relaxed">Gratis <span class="text-[#FFD700] font-bold">Rp1.000.000</span> Saldo Free Spin setelah pendaftaran berhasil.</div>
                                    </div>
                                  </div>
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">👥</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">Bonus Undang Member</div>
                                      <div class="text-slate-300 text-[13px] sm:text-[14px] leading-relaxed">Setiap berhasil mengundang 1 member baru, Anda memperoleh <span class="text-[#FFD700] font-bold">Rp50.000</span> Saldo Free Spin.</div>
                                    </div>
                                  </div>
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">🎯</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">Penggunaan</div>
                                      <div class="text-slate-300 text-[13px] sm:text-[14px] leading-relaxed">Saldo Free Spin hanya dapat digunakan untuk bermain <span class="text-purple-300 font-semibold">Lucky Spin</span>.</div>
                                    </div>
                                  </div>
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">⚠️</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">Catatan</div>
                                      <div class="text-slate-400 text-[13px] sm:text-[14px] leading-relaxed">Saldo Free Spin tidak dapat ditarik maupun ditransfer.</div>
                                    </div>
                                  </div>
                                </div>
                              </div>`
                            : `<div class="space-y-0">
                                <div class="text-center pt-0.5 pb-1">
                                  <div class="w-14 h-14 mx-auto rounded-full bg-gradient-to-b from-[#3b176e]/90 to-[#1e0a39]/90 border border-purple-400/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-2">🎁</div>
                                  <h3 class="text-[18px] sm:text-[20px] font-bold text-white tracking-wide">Free Spin Balance Info</h3>
                                  <div class="relative my-2 flex items-center justify-center">
                                    <div class="w-full border-t border-purple-500/25"></div>
                                    <span class="absolute bg-[#12072b] px-3 text-purple-400 text-xs">✦</span>
                                  </div>
                                </div>
                                <div class="divide-y divide-purple-500/20 text-slate-200">
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">🎉</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">New Member Bonus</div>
                                      <div class="text-slate-300 text-[13px] sm:text-[14px] leading-relaxed">Free <span class="text-[#FFD700] font-bold">Rp1,000,000</span> Free Spin Balance upon successful registration.</div>
                                    </div>
                                  </div>
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">👥</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">Invite Bonus</div>
                                      <div class="text-slate-300 text-[13px] sm:text-[14px] leading-relaxed">For every 1 new member invited, you receive <span class="text-[#FFD700] font-bold">Rp50,000</span> Free Spin Balance.</div>
                                    </div>
                                  </div>
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">🎯</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">Usage</div>
                                      <div class="text-slate-300 text-[13px] sm:text-[14px] leading-relaxed">Free Spin Balance can only be used to play <span class="text-purple-300 font-semibold">Lucky Spin</span>.</div>
                                    </div>
                                  </div>
                                  <div class="py-2.5 flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#210d43] border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner mt-0.5">⚠️</div>
                                    <div class="flex-1 text-left">
                                      <div class="font-bold text-white text-[14px] sm:text-[15px] mb-0.5">Note</div>
                                      <div class="text-slate-400 text-[13px] sm:text-[14px] leading-relaxed">Free Spin Balance cannot be withdrawn or transferred.</div>
                                    </div>
                                  </div>
                                </div>
                              </div>`,
                          'info'
                        );
                      }}
                      className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-6 h-6 rounded-full bg-purple-500/20 hover:bg-purple-500/50 border border-purple-300/40 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer transition-all shadow-sm z-20"
                      title="Info Saldo Free Spin"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {/* Ambient Gold & Purple Background Glows */}
                    <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

                    {/* Left Section: Large Lucky Spin Wheel & Text Info */}
                    <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto relative z-10">
                      {/* Large Glowing Wheel Graphic */}
                      <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                        {/* Glow backdrop */}
                        <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

                        {/* Top Indicator Pointer */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-amber-300 z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />

                        {/* Outer Rotating Glowing Wheel */}
                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 border-amber-300 bg-amber-950 p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.6)] flex items-center justify-center relative animate-[spin_12s_linear_infinite]">
                          <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                            {/* Colorful Wheel Segments */}
                            <path d="M50 50 L50 0 A50 50 0 0 1 100 50 Z" fill="#f59e0b" />
                            <path d="M50 50 L100 50 A50 50 0 0 1 50 100 Z" fill="#8b5cf6" />
                            <path d="M50 50 L50 100 A50 50 0 0 1 0 50 Z" fill="#ec4899" />
                            <path d="M50 50 L0 50 A50 50 0 0 1 50 0 Z" fill="#3b82f6" />
                            
                            {/* Inner Dividing Lines */}
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#fef08a" strokeWidth="2" />
                            <line x1="50" y1="0" x2="50" y2="100" stroke="#fef08a" strokeWidth="2" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="#fef08a" strokeWidth="2" />
                            
                            {/* Center Pin */}
                            <circle cx="50" cy="50" r="14" fill="#1e1b4b" stroke="#fde047" strokeWidth="3" />
                            <circle cx="50" cy="50" r="6" fill="#f59e0b" />
                          </svg>
                        </div>

                        {/* Gift Icon Badge */}
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-800 p-1.5 sm:p-2 rounded-xl border border-purple-300/80 shadow-[0_0_12px_rgba(168,85,247,0.7)] text-amber-300 z-20 animate-bounce">
                          <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300/30" />
                        </div>
                      </div>

                      {/* Text Info Block */}
                      <div className="flex flex-col justify-center gap-1">
                        <span className="text-[11px] sm:text-xs font-black tracking-widest text-purple-200/90 uppercase font-orbitron">
                          {language === 'id' ? 'SALDO FREE SPIN' : 'FREE SPIN BALANCE'}
                        </span>

                        <div className="text-2xl sm:text-3xl font-black text-amber-400 font-orbitron tracking-wide leading-none drop-shadow-[0_2px_12px_rgba(251,191,36,0.45)]">
                          Rp {(state.freeSpinBalance ?? 1000000).toLocaleString('id-ID')}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-fuchsia-300 uppercase tracking-wider bg-fuchsia-950/60 border border-fuchsia-500/30 px-2.5 py-0.5 rounded-full w-fit">
                            <span>✨</span>
                            <span>{language === 'id' ? 'BONUS MEMBER BARU' : 'NEW MEMBER BONUS'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Gold Glowing Action Button */}
                    <button
                      onClick={() => setCurrentTab('luckyspin')}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 active:scale-95 text-black font-black text-xs sm:text-sm tracking-wider py-3 sm:py-3.5 px-5 sm:px-6 rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.55)] flex items-center justify-center gap-2 cursor-pointer transition-all uppercase shrink-0 border border-yellow-200 relative z-10 group animate-pulse"
                    >
                      <Compass className="w-4 h-4 text-black group-hover:rotate-45 transition-transform duration-300" />
                      <span>{language === 'id' ? 'MAIN LUCKY SPIN' : 'PLAY LUCKY SPIN'}</span>
                      <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </motion.div>
                  
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
              {currentTab === 'community' && <CommunityPage />}



              {/* 🎡 LUCKY SPIN VIEW */}
              {currentTab === 'luckyspin' && <LuckySpinPage calculateCountdown={calculateLuckySpinCountdown} />}

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
                <ContractPage
                  language={language}
                  setCurrentTab={setCurrentTab}
                  t={t}
                  state={state}
                  contractQty={contractQty}
                  adjustContractQty={adjustContractQty}
                  handlePurchaseContract={handlePurchaseContract}
                />
              )}

              {/* NETWORK VIEW */}
              {currentTab === 'network' && (
                <NetworkPage
                  language={language}
                  setCurrentTab={setCurrentTab}
                  t={t}
                  totalDownlinesCount={totalDownlinesCount}
                  activeDownlinesCount={activeDownlinesCount}
                  totalDownlineContracts={totalDownlineContracts}
                  teamVolumeValue={teamVolumeValue}
                  l1Count={l1Count}
                  l2Count={l2Count}
                  l3Count={l3Count}
                  state={state}
                  leaderboardData={leaderboardData}
                />
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
                <WalletPage
                  language={language}
                  setCurrentTab={setCurrentTab}
                  t={t}
                  state={state}
                  totalEarned={totalEarned}
                  triggerWithdrawFlow={triggerWithdrawFlow}
                  handleClaimYield={handleClaimYield}
                  miningProfit={miningProfit}
                  referralReward={referralReward}
                  rebateReward={rebateReward}
                  bonusReward={bonusReward}
                />
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
                          {language === 'id' ? 'Total Hasil Tambang' : 'Total Mining Earned'}
                        </span>
                        <span className="text-slate-200 text-xs font-bold">
                          {language === 'id' ? 'Akumulasi Hasil Tambang' : 'Cumulative Mining Yield'}
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
                        { id: 'reward', label: 'Daily Reward', icon: <Coins className="w-3.5 h-3.5 text-yellow-400" /> },
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

                        return filteredTxs.map((tx, idx) => {
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
                            <div key={`${tx.id}-${idx}`} className="p-3.5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-2.5 hover:border-white/10 transition-all text-left">
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
                <NotificationsPage language={language} setCurrentTab={setCurrentTab} />
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

                        return filtered.map((err, idx) => (
                          <div
                            key={`${err.id}-${idx}`}
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
                <SettingsPage />
              )}

              {/* HELP & SUPPORT VIEW */}
              {currentTab === 'help' && (
                <HelpPage language={language} setCurrentTab={setCurrentTab} triggerModal={triggerModal} />
              )}

              {/* ABOUT US VIEW */}
              {currentTab === 'about' && (
                <AboutPage language={language} setCurrentTab={setCurrentTab} triggerModal={triggerModal} />
              )}

              {/* PRIVACY POLICY VIEW */}
              {currentTab === 'privacy' && (
                <PrivacyPolicyPage language={language} setCurrentTab={setCurrentTab} />
              )}

              {/* TERMS OF SERVICE VIEW */}
              {currentTab === 'terms' && (
                <TermsOfServicePage language={language} setCurrentTab={setCurrentTab} />
              )}

              {/* CONTACT INFO VIEW */}
              {currentTab === 'contact' && (
                <ContactInfoPage language={language} setCurrentTab={setCurrentTab} triggerModal={triggerModal} />
              )}

                </motion.div>
              </AnimatePresence>
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
          onViewMining={() => {
            setHarvestModalOpen(false);
            setCurrentTab('livemining');
          }}
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
                className="w-full max-w-md bg-[#0e0722] border border-[#3c1d70] rounded-3xl p-5 shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setLuckySpinModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/5 z-30"
                >
                  <X className="w-5 h-5" />
                </button>

                <LuckySpinPage />
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
                    {claimedMissionsHistory.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="p-2 rounded-xl bg-[#080d19]/80 border border-emerald-500/10 flex justify-between items-center gap-2">
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
