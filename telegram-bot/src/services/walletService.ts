import { supabase } from '../database/supabaseClient.js';
import { TransactionRecord } from '../types/botTypes.js';

export const walletService = {
  /**
   * Get transactions history for a user
   */
  async getUserTransactions(username: string, limit = 5): Promise<TransactionRecord[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('username', username)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data as TransactionRecord[];
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return [];
    }
  },

  /**
   * Create deposit request
   */
  async createDepositRequest(username: string, amount: number, paymentMethod = 'QRIS'): Promise<{ success: boolean; txId?: string; message?: string }> {
    try {
      const txId = 'DEP-' + Math.floor(100000 + Math.random() * 900000);
      const payload = {
        id: txId,
        username,
        type: 'deposit',
        amount,
        status: 'pending',
        payment_method: paymentMethod,
        description: `Pengajuan deposit via Telegram Bot (${paymentMethod})`,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('transactions').insert(payload);
      if (error) return { success: false, message: error.message };

      return { success: true, txId, message: 'Deposit berhasil diajukan!' };
    } catch (err: any) {
      return { success: false, message: String(err) };
    }
  },

  /**
   * Create withdrawal request
   */
  async createWithdrawRequest(username: string, amount: number, destination: string): Promise<{ success: boolean; txId?: string; message?: string }> {
    try {
      // 1. Check user main balance first
      const { data: user, error: userErr } = await supabase.from('users').select('main_balance').eq('username', username).single();
      if (userErr || !user) return { success: false, message: 'User tidak ditemukan.' };

      if (Number(user.main_balance || 0) < amount) {
        return { success: false, message: `Saldo tidak mencukupi! Saldo Anda: Rp ${Number(user.main_balance || 0).toLocaleString('id-ID')}` };
      }

      const txId = 'WD-' + Math.floor(100000 + Math.random() * 900000);
      const payload = {
        id: txId,
        username,
        type: 'withdraw',
        amount,
        status: 'pending',
        payment_method: 'Bank / E-Wallet',
        description: `Penarikan ke ${destination}`,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('transactions').insert(payload);
      if (error) return { success: false, message: error.message };

      return { success: true, txId, message: 'Penarikan berhasil diajukan!' };
    } catch (err: any) {
      return { success: false, message: String(err) };
    }
  },
};
