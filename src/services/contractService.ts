import { 
  purchaseContractInSupabase, 
  claimWelcomeBonusInSupabase, 
  claimDailyRewardInSupabase, 
  updatePendingMiningRewardInSupabase 
} from '../supabase';
import { CONFIG } from '../types';

export const contractService = {
  async purchaseContract(username: string, qty: number): Promise<boolean> {
    return await purchaseContractInSupabase(username, qty, CONFIG.PRICE_PER_UNIT);
  },

  async claimWelcomeBonus(username: string): Promise<boolean> {
    return await claimWelcomeBonusInSupabase(username);
  },

  async claimDailyReward(username: string, amount: number) {
    return await claimDailyRewardInSupabase(username, amount);
  },

  async updatePendingReward(username: string, pendingReward: number): Promise<boolean> {
    return await updatePendingMiningRewardInSupabase(username, pendingReward);
  }
};
