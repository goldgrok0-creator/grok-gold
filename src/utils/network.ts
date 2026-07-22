import { UserAccount, CONFIG, isMemberAccount } from '../types';

/**
 * Calculates the exact unique count of ACTIVE MEMBERS in a user's referral network.
 * 
 * Rules:
 * 1. Must traverse all network downline levels (direct L1, L2, L3...).
 * 2. Deduplicates by username so 1 member = 1 count max (prevents double counting / manipulation).
 * 3. Excludes accounts that are blocked, banned, or admin.
 * 4. Must ONLY count ACTIVE MEMBERS (accounts with activeContracts >= 1 or an approved deposit >= MIN_DEPOSIT).
 * 5. Simply registered accounts without active contracts or deposits MUST NOT be counted.
 */
export function calculateNetworkActiveCount(
  username: string | undefined | null,
  accounts: UserAccount[]
): { count: number; activeHolders: UserAccount[] } {
  if (!username) return { count: 0, activeHolders: [] };

  const usernameLower = username.toLowerCase();

  // Recursive search to collect all downline accounts in user's network tree
  const getDownlinesRecursive = (current: string, visited = new Set<string>()): UserAccount[] => {
    if (!current || visited.has(current.toLowerCase())) return [];
    visited.add(current.toLowerCase());

    const directChildren = accounts.filter(acc => {
      if (!isMemberAccount(acc)) return false;
      if (!acc.invitedBy) return false;
      const inv = acc.invitedBy.toLowerCase();
      return inv === current.toLowerCase() || (acc as any).sponsorUsername?.toLowerCase() === current.toLowerCase();
    });

    let results: UserAccount[] = [...directChildren];
    for (const child of directChildren) {
      if (child.username && child.username.toLowerCase() !== current.toLowerCase()) {
        results = results.concat(getDownlinesRecursive(child.username, visited));
      }
    }
    return results;
  };

  const rawDownlines = getDownlinesRecursive(usernameLower);

  // Deduplicate downline accounts by username (Rule 10: 1 member = 1 count max)
  const uniqueMap = new Map<string, UserAccount>();
  for (const acc of rawDownlines) {
    if (acc && acc.username && acc.username.toLowerCase() !== usernameLower && isMemberAccount(acc)) {
      uniqueMap.set(acc.username.toLowerCase(), acc);
    }
  }

  const uniqueDownlines = Array.from(uniqueMap.values());

  // Filter for ACTIVE MEMBERS ONLY:
  // - Not blocked/banned and is a member account
  // - Must have activeContracts >= 1 OR an approved deposit >= MIN_DEPOSIT
  const activeHolders = uniqueDownlines.filter(acc => {
    if (!isMemberAccount(acc)) return false;

    const isBlocked = 
      (acc as any).isBanned || 
      (acc as any).blocked || 
      (acc as any).status === 'blocked' || 
      (acc.state as any)?.isBanned || 
      (acc.state as any)?.status === 'blocked';
    if (isBlocked) return false;

    const activeContracts = acc.state?.activeContracts || 0;
    const hasActiveContract = activeContracts >= 1;

    const approvedDeposits = (acc.state?.transactions || []).filter(
      t => t.type === 'deposit' && (
        t.status === 'approved' || 
        t.status === 'success' || 
        t.status === 'completed' || 
        !t.status
      ) && (t.amount || 0) >= CONFIG.MIN_DEPOSIT
    );
    const hasApprovedDeposit = approvedDeposits.length > 0;

    return hasActiveContract || hasApprovedDeposit;
  });

  return {
    count: activeHolders.length,
    activeHolders
  };
}
