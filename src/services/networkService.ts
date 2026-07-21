import { UserAccount } from '../types';

export const networkService = {
  async recordClick(referralCode: string, source: string): Promise<boolean> {
    try {
      console.log('recordClick stub called for:', referralCode, source);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  calculateDownline(username: string, accounts: UserAccount[]) {
    // Direct Referrals (Level 1)
    const direct = accounts.filter(
      acc => acc.invitedBy && acc.invitedBy.toLowerCase() === username.toLowerCase()
    );

    // Level 2 (Referred by Level 1)
    const directUsernames = direct.map(d => d.username.toLowerCase());
    const l2 = accounts.filter(
      acc => acc.invitedBy && directUsernames.includes(acc.invitedBy.toLowerCase())
    );

    // Level 3 (Referred by Level 2)
    const l2Usernames = l2.map(l => l.username.toLowerCase());
    const l3 = accounts.filter(
      acc => acc.invitedBy && l2Usernames.includes(acc.invitedBy.toLowerCase())
    );

    return { direct, l2, l3 };
  }
};
