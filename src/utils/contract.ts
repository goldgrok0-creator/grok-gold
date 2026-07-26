import { CONFIG, GlobalConfig } from '../types';

/**
 * Single source of truth for contract calculations across User pages and Admin Panel.
 * Standardized Formula:
 * - Contract Valuation = Units * Unit Price
 * - Daily Reward Rate = Daily Rate Percentage (e.g., 2% per day = 0.02)
 * - Daily Estimated Reward = Contract Valuation * Daily Reward Rate
 * - Capping Limit = Contract Valuation * Capping Rate (e.g., 250% = 2.5)
 */

export function getContractPrice(globalConfig?: GlobalConfig | null): number {
  if (globalConfig && typeof globalConfig.pricePerUnit === 'number' && globalConfig.pricePerUnit > 0) {
    return globalConfig.pricePerUnit;
  }
  return CONFIG.PRICE_PER_UNIT;
}

export function getDailyRewardRate(globalConfig?: GlobalConfig | null): number {
  if (globalConfig) {
    if (typeof globalConfig.dailyRewardRate === 'number' && globalConfig.dailyRewardRate > 0) {
      return globalConfig.dailyRewardRate > 1 ? globalConfig.dailyRewardRate / 100 : globalConfig.dailyRewardRate;
    }
    if (typeof globalConfig.dailyRewardPercent === 'number' && globalConfig.dailyRewardPercent > 0) {
      return globalConfig.dailyRewardPercent > 1 ? globalConfig.dailyRewardPercent / 100 : globalConfig.dailyRewardPercent;
    }
  }
  return CONFIG.DAILY_REWARD_PERCENT; // 0.02 (2% per day)
}

export function getCappingPercent(globalConfig?: GlobalConfig | null): number {
  if (globalConfig) {
    if (typeof globalConfig.cappingPercent === 'number' && globalConfig.cappingPercent > 0) {
      return globalConfig.cappingPercent > 10 ? globalConfig.cappingPercent / 100 : globalConfig.cappingPercent;
    }
    if (typeof globalConfig.cappingRate === 'number' && globalConfig.cappingRate > 0) {
      return globalConfig.cappingRate > 10 ? globalConfig.cappingRate / 100 : globalConfig.cappingRate;
    }
  }
  return CONFIG.CAPPING_PERCENT; // 2.5 (250%)
}

export function calculateContractValuation(units: number, globalConfig?: GlobalConfig | null): number {
  const price = getContractPrice(globalConfig);
  return Math.round(units * price);
}

export function calculateDailyRewardEstimate(units: number, globalConfig?: GlobalConfig | null): number {
  const valuation = calculateContractValuation(units, globalConfig);
  const rate = getDailyRewardRate(globalConfig);
  return Math.round(valuation * rate);
}

export function calculateMaxCapping(units: number, globalConfig?: GlobalConfig | null): number {
  const valuation = calculateContractValuation(units, globalConfig);
  const capRate = getCappingPercent(globalConfig);
  return Math.round(valuation * capRate);
}
