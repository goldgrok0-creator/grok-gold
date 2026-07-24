export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'reward' | 'purchase' | 'referral' | 'rebate' | 'welcome_bonus' | 'bonus';
  amount: number;
  date: number; // timestamp
  description: string;
  proofImage?: string | null;
  status?: string;
  rejectionReason?: string | null;
  paymentMethod?: string;
  approvedBy?: string | null;
  approvedAt?: number | null;
}

export interface Holder {
  id: string;
  name: string;
  contracts: number;
  joinDate: number;
}

export interface ReferralData {
  code: string;
  link: string;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  totalCommission: number;
}

export interface UserAccount {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role?: 'admin' | 'user' | string;
  country?: string;
  password: string;
  referralCode: string; // User's personal invite code
  invitedBy: string | null; // Referrer's username
  createdAt: number;
  state: AppState;
  settings: {
    authUserId?: string;
    auth_user_id?: string;
    language: 'id' | 'en';
    notificationsEnabled: boolean;
    autoReinvest: boolean;
    bankName?: string;
    bankNumber?: string;
    bankHolder?: string;
    spinTickets?: number;
    spinCount?: number;
    freeSpinBalance?: number;
    bonusSpinBalance?: number;
    rewardSpinWallet?: number;
    lastSpinResetAt?: number;
    luckySpinHistory?: Array<{ id: string; prize: string; date: number; success: boolean }>;
    claimedMissions?: string[];
    claimedMissionsHistory?: Array<{ id: string; title: string; reward: number; timestamp: number }>;
    dailyTaskVisit?: boolean;
    dailyTaskClaimed?: boolean;
    dailyTaskCheck?: boolean;
    telegramId?: string;
    telegramUsername?: string;
  };
}

export function isMemberAccount(acc: UserAccount | null | undefined): boolean {
  if (!acc) return false;
  if (acc.role === 'admin') return false;
  if (acc.username && acc.username.toLowerCase() === 'admin') return false;
  return true;
}

export interface AppState {
  mainBalance: number;
  freeSpinBalance?: number;
  bonusSpinBalance?: number;
  activeContracts: number;
  totalEarned: number;
  referralEarned: number;
  rebateEarned: number;
  rewardBalance?: number; // Accumulated reward balance waiting to be claimed to wallet_balance
  lastClaimTime: number;
  welcomeBonusClaimed: boolean;
  isLoggedIn: boolean;
  username: string;
  holders: Holder[];
  goldProduction: number;
  cyclePercent: number;
  hasPurchased: boolean;
  profileImage: string | null;
  transactions: Transaction[];
  pendingMiningReward: number; // Added for real-time mining yield accumulation
  lastBoostTime?: number; // Last activation timestamp of the Turbo Booster
  todayProfit?: number; // Today's claimed profit
  totalProfit?: number; // Total claimed profit
  goldProductionDaily?: number; // Added for daily tracking
  goldProductionWeekly?: number; // Added for weekly tracking
  goldProductionMonthly?: number; // Added for monthly tracking
  lastGoldUpdateTime?: number; // Last time gold stats were updated
  systemErrors?: SystemError[]; // Error history from diagnostic scanning
}

export interface SystemError {
  id: string;
  timestamp: number;
  errorCode: string;
  message: string;
  node: string;
  severity: 'warning' | 'critical';
  resolved: boolean;
}

export const CONFIG = {
  PRICE_PER_UNIT: 180000,
  DAILY_REWARD_PERCENT: 0.02,
  CAPPING_PERCENT: 2.5,
  REFERRAL_LEVELS: [10, 3, 2], // 10% L1, 3% L2, 2% L3
  WELCOME_BONUS_AMOUNT: 1800000,
  REQUIRED_HOLDERS: 80,
  MIN_CONTRACT_PER_HOLDER: 1,
  CLAIM_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MIN_DEPOSIT: 100000,
  MIN_WITHDRAW: 100000,
  SPIN_COST: 100000,
  MAX_DAILY_SPINS: 3,
  WELCOME_FREE_SPIN_BONUS: 1000000,
  REFERRAL_FREE_SPIN_BONUS: 50000,
};

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
}

export interface MiningItem {
  id: string;
  type: string;
  x: number;
  y: number;
  radius: number;
  value: number;
  weight: number;
  color: string;
  label: string;
  pulse?: boolean;
}

export interface GameStats {
  gold: number;
  targetGold: number;
  level: number;
  upgradesCount?: number;
  multiplier?: number;
}

export interface PricePoint {
  time: string;
  price: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  body: string;
  timestamp: string;
}
