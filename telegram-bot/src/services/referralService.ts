import { supabase } from '../database/supabaseClient.js';

export const referralService = {
  /**
   * Get referral statistics for a user
   */
  async getReferralStats(username: string) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('referral_code, referred_by')
        .eq('username', username)
        .single();

      const refCode = user?.referral_code || username;

      // Count direct referrals
      const { data: teamMembers } = await supabase
        .from('users')
        .select('username, created_at, main_balance')
        .eq('referred_by', refCode);

      const teamList = teamMembers || [];
      const totalBonus = teamList.length * 25000; // Rp 25.000 bonus per referral

      return {
        referralCode: refCode,
        referralLink: `https://grokgold.vercel.app/register?ref=${refCode}`,
        directReferralsCount: teamList.length,
        teamMembers: teamList,
        totalReferralBonus: totalBonus,
      };
    } catch (err) {
      console.error('Error fetching referral stats:', err);
      return {
        referralCode: username,
        referralLink: `https://grokgold.vercel.app/register?ref=${username}`,
        directReferralsCount: 0,
        teamMembers: [],
        totalReferralBonus: 0,
      };
    }
  },
};
