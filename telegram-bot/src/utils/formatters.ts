import { GrockGoldUser } from '../types/botTypes.js';

export const formatters = {
  formatCurrency: (amount: number): string => {
    return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
  },

  formatDateTime: (dateString?: string): string => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';
  },

  formatDashboardText: (user: GrockGoldUser, firstName: string): string => {
    const mainBal = formatters.formatCurrency(user.main_balance || 0);
    const pendingReward = formatters.formatCurrency(user.pending_mining_reward || 0);
    const totalEarned = formatters.formatCurrency(user.total_earned || 0);
    const activeContracts = user.active_contracts || 0;
    const refCount = 0; // Dynamic count

    return (
      `👋 <b>Welcome back ${firstName}</b>\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `💰 <b>Main Balance:</b> ${mainBal}\n` +
      `⛏ <b>Mining Status:</b> ${activeContracts > 0 ? '🟢 RUNNING' : '🟡 STANDBY'}\n` +
      `📈 <b>Today's Earnings:</b> ${pendingReward}\n` +
      `👥 <b>Referral Count:</b> ${refCount} Members\n` +
      `🎁 <b>Referral Bonus:</b> Rp 0\n` +
      `📦 <b>Active Contracts:</b> ${activeContracts} Unit\n` +
      `📊 <b>Total Earnings:</b> ${totalEarned}\n` +
      `💸 <b>Pending Withdraw:</b> Rp 0\n` +
      `🏦 <b>Pending Deposit:</b> Rp 0\n` +
      `📈 <b>Capping Progress:</b> 0% / 300%\n` +
      `━━━━━━━━━━━━━━\n\n` +
      `<i>Real-time synchronized with GrockGold Supabase Database.</i>`
    );
  },
};
