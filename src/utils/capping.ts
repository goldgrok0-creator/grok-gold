import { AppState, CONFIG, Transaction } from '../types';

export interface CappingMetrics {
  activeContracts: number;
  totalModalAktif: number;       // activeContracts * PRICE_PER_UNIT
  maxPossibleEarnings: number;   // totalModalAktif * CAPPING_PERCENT (2.5)
  
  // Components included in Capping Earnings
  dailyRewardEarnings: number;   // Daily Reward / Daily Performance Reward
  referralEarnings: number;      // Referral Income / Referral Reward
  rebateEarnings: number;        // Rebate Income / Rebate Reward

  cappingEarnings: number;       // Daily Reward + Referral Income + Rebate Income
  remainingCapping: number;      // max(0, maxPossibleEarnings - cappingEarnings)
  cappingRatio: number;          // (cappingEarnings / maxPossibleEarnings) * 100
  cappingRatioVisual: number;
  cappingPercentStr: string;
  isCapped: boolean;             // cappingEarnings >= maxPossibleEarnings && maxPossibleEarnings > 0

  // Bonus Income - SEPARATE, NOT included in 250% Capping
  bonusIncome: number;
}

/**
 * Calculates the exact Capping Earnings and Progress based on system rules:
 * 1. Maximum Earnings = Total Modal Aktif x 250%
 * 2. Capping Earnings = Daily Reward + Referral Income + Rebate Income
 * 3. Bonus Income MUST NOT be included in Capping Earnings and does not reduce Remaining Capping.
 * 4. Prevents double counting (no direct addition of totalEarned or totalProfit).
 */
export function calculateCappingEarnings(
  state: Partial<AppState> | undefined | null,
  activeContractsOverride?: number
): CappingMetrics {
  const activeContracts = activeContractsOverride !== undefined
    ? activeContractsOverride
    : (state?.activeContracts || 0);

  const totalModalAktif = activeContracts * CONFIG.PRICE_PER_UNIT;
  const maxPossibleEarnings = totalModalAktif * CONFIG.CAPPING_PERCENT; // 2.5 (250%)

  const transactions: Transaction[] = state?.transactions || [];

  let dailyReward = 0;
  let referral = 0;
  let rebate = 0;
  let bonus = 0;

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'reward') {
      dailyReward += amount;
    } else if (tx.type === 'referral') {
      referral += amount;
    } else if (tx.type === 'rebate') {
      rebate += amount;
    } else if (tx.type === 'welcome_bonus' || tx.type === 'bonus') {
      bonus += amount;
    }
  }

  // Fallbacks for direct state records if transaction log is partial
  const finalReferral = Math.max(referral, state?.referralEarned || 0);
  const finalRebate = Math.max(rebate, state?.rebateEarned || 0);

  // Bonus Income logic - completely separate from Capping
  let finalBonus = bonus;
  if (state?.welcomeBonusClaimed) {
    if (finalBonus === 0) finalBonus = CONFIG.WELCOME_BONUS_AMOUNT;
  } else {
    finalBonus = 0; // Unclaimed bonus does not count as received bonus income
  }

  // EXACT FORMULA: Capping Earnings = Daily Reward + Referral Income + Rebate Income
  const cappingEarnings = dailyReward + finalReferral + finalRebate;

  const remainingCapping = Math.max(0, maxPossibleEarnings - cappingEarnings);
  
  const cappingRatio = maxPossibleEarnings > 0 
    ? Math.min(100, (cappingEarnings / maxPossibleEarnings) * 100) 
    : 0;

  const cappingRatioVisual = cappingEarnings > 0 ? Math.max(0.1, cappingRatio) : 0;
  const cappingPercentStr = cappingEarnings > 0 && cappingRatio < 0.01 
    ? "0.01" 
    : cappingRatio.toFixed(2);

  const isCapped = cappingEarnings >= maxPossibleEarnings && maxPossibleEarnings > 0;

  return {
    activeContracts,
    totalModalAktif,
    maxPossibleEarnings,
    dailyRewardEarnings: dailyReward,
    referralEarnings: finalReferral,
    rebateEarnings: finalRebate,
    cappingEarnings,
    remainingCapping,
    cappingRatio,
    cappingRatioVisual,
    cappingPercentStr,
    isCapped,
    bonusIncome: finalBonus,
  };
}
