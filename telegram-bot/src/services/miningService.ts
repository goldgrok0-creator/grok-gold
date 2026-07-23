import { supabase } from '../database/supabaseClient.js';

export const miningService = {
  /**
   * Claim daily mining reward
   */
  async claimDailyReward(username: string): Promise<{ success: boolean; amountEarned?: number; message: string }> {
    try {
      // 1. Fetch user data
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        return { success: false, message: 'Data pengguna tidak ditemukan.' };
      }

      // 2. Calculate mining reward based on active contracts
      const activeContracts = Number(user.active_contracts || 0);
      const baseReward = activeContracts > 0 ? activeContracts * 50000 : 10000; // Rp 10.000 free bonus or contract based

      const currentPending = Number(user.pending_mining_reward || 0);
      const rewardToClaim = currentPending > 0 ? currentPending : baseReward;

      const newMainBalance = Number(user.main_balance || 0) + rewardToClaim;
      const newTotalEarned = Number(user.total_earned || 0) + rewardToClaim;

      // 3. Update user balances
      const { error: updateErr } = await supabase
        .from('users')
        .update({
          main_balance: newMainBalance,
          pending_mining_reward: 0,
          total_earned: newTotalEarned,
        })
        .eq('username', username);

      if (updateErr) {
        return { success: false, message: 'Gagal memproses klaim reward: ' + updateErr.message };
      }

      // 4. Record transaction log
      const txId = 'CLAIM-' + Math.floor(100000 + Math.random() * 900000);
      await supabase.from('transactions').insert({
        id: txId,
        username,
        type: 'claim',
        amount: rewardToClaim,
        status: 'completed',
        description: 'Klaim Daily Mining Reward via Telegram Bot',
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        amountEarned: rewardToClaim,
        message: `🎉 Klaim Berhasil! Rp ${rewardToClaim.toLocaleString('id-ID')} telah ditambahkan ke Saldo Utama Anda.`,
      };
    } catch (err: any) {
      return { success: false, message: 'Kesalahan server: ' + String(err.message || err) };
    }
  },
};
