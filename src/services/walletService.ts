import { createDepositInSupabase, createWithdrawalInSupabase, supabase } from '../supabase';

export const walletService = {
  async createDeposit(depId: string, username: string, amount: number, paymentLabel: string, proofImage: string): Promise<boolean> {
    return await createDepositInSupabase(depId, username, amount, paymentLabel, proofImage);
  },

  async createWithdrawal(wdId: string, username: string, amount: number, withdrawBank: string, withdrawAccount: string, fullName: string): Promise<boolean> {
    return await createWithdrawalInSupabase(wdId, username, amount, withdrawBank, withdrawAccount, fullName);
  }
};
