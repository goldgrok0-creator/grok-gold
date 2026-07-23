import { supabase } from '../database/supabaseClient.js';

export const adminService = {
  /**
   * Get overall system metrics
   */
  async getSystemOverview() {
    try {
      const [{ data: users }, { data: txs }] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      ]);

      const userList = users || [];
      const txList = txs || [];

      const adminCount = userList.filter((u: any) => u.role === 'admin' || u.username === 'admin').length;
      const memberCount = userList.length - adminCount;
      const totalMainBalance = userList.reduce((acc, u) => acc + Number(u.main_balance || 0), 0);
      const totalActiveContracts = userList.reduce((acc, u) => acc + Number(u.active_contracts || 0), 0);

      const pendingDeposits = txList.filter((t: any) => t.type === 'deposit' && (t.status === 'pending' || !t.status));
      const pendingWithdrawals = txList.filter((t: any) => t.type === 'withdraw' && (t.status === 'pending' || !t.status));

      const pendingDepSum = pendingDeposits.reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const pendingWdSum = pendingWithdrawals.reduce((acc, t) => acc + Number(t.amount || 0), 0);

      return {
        totalUsers: userList.length,
        adminCount,
        memberCount,
        totalMainBalance,
        totalActiveContracts,
        pendingDeposits,
        pendingWithdrawals,
        pendingDepSum,
        pendingWdSum,
        userList,
        txList,
      };
    } catch (err) {
      console.error('Error in admin system overview:', err);
      return null;
    }
  },

  /**
   * Unlink a user's Telegram account
   */
  async unlinkUser(username: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          telegram_user_id: null,
          telegram_id: null,
          telegram_username: null,
          telegram_linked_at: null,
        })
        .eq('username', username);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: String(err) };
    }
  },

  /**
   * Approve a pending deposit
   */
  async approveDeposit(txId: string, adminUsername: string) {
    try {
      // 1. Get deposit transaction
      const { data: depTx, error: txErr } = await supabase.from('transactions').select('*').eq('id', txId).single();
      if (txErr || !depTx) return { success: false, error: 'Transaksi tidak ditemukan.' };

      if (depTx.status === 'approved') return { success: false, error: 'Transaksi deposit ini sudah disetujui sebelumnya.' };

      // 2. Update transaction status
      await supabase.from('transactions').update({
        status: 'approved',
        approved_by: adminUsername,
        approved_at: new Date().toISOString(),
      }).eq('id', txId);

      // 3. Credit user's main balance
      const { data: targetUser } = await supabase.from('users').select('*').eq('username', depTx.username).single();
      if (targetUser) {
        const newBal = Number(targetUser.main_balance || 0) + Number(depTx.amount || 0);
        await supabase.from('users').update({ main_balance: newBal }).eq('username', depTx.username);
      }

      return { success: true, deposit: depTx, targetUser };
    } catch (err: any) {
      return { success: false, error: String(err) };
    }
  },

  /**
   * Approve a pending withdrawal
   */
  async approveWithdrawal(txId: string, adminUsername: string) {
    try {
      const { data: wdTx, error: txErr } = await supabase.from('transactions').select('*').eq('id', txId).single();
      if (txErr || !wdTx) return { success: false, error: 'Transaksi penarikan tidak ditemukan.' };

      if (wdTx.status === 'approved') return { success: false, error: 'Transaksi penarikan ini sudah disetujui sebelumnya.' };

      await supabase.from('transactions').update({
        status: 'approved',
        approved_by: adminUsername,
        approved_at: new Date().toISOString(),
      }).eq('id', txId);

      const { data: targetUser } = await supabase.from('users').select('*').eq('username', wdTx.username).single();

      return { success: true, withdraw: wdTx, targetUser };
    } catch (err: any) {
      return { success: false, error: String(err) };
    }
  },
};
