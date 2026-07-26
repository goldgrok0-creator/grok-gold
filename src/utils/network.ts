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

    const parentAcc = accounts.find(a => a.username?.toLowerCase() === current.toLowerCase());
    const parentRefCode = parentAcc?.referralCode ? parentAcc.referralCode.toLowerCase() : '';

    const directChildren = accounts.filter(acc => {
      if (!isMemberAccount(acc)) return false;
      const childInv = (acc.invitedBy || (acc as any).invited_by || (acc as any).sponsorUsername || '').toString().toLowerCase().trim();
      if (!childInv) return false;
      return (
        childInv === current.toLowerCase() || 
        (parentRefCode && childInv === parentRefCode) ||
        (parentRefCode && childInv.includes(parentRefCode)) ||
        childInv.includes(current.toLowerCase()) ||
        (acc as any).sponsorUsername?.toLowerCase() === current.toLowerCase()
      );
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

    const activeContracts = 
      Number(acc.state?.activeContracts) || 
      Number((acc as any).activeContracts) || 
      Number((acc as any).active_contracts) || 
      Number((acc as any).contracts) || 
      0;

    const hasActiveContract = activeContracts >= 1 || !!acc.state?.hasPurchased || !!(acc as any).hasPurchased;

    const userTxs = acc.state?.transactions || (acc as any).transactions || [];
    const hasActiveTransaction = userTxs.some(
      (t: any) => 
        (t.type === 'deposit' || t.type === 'purchase' || t.type === 'contract') && (
          t.status === 'approved' || 
          t.status === 'success' || 
          t.status === 'completed' || 
          !t.status
        ) && (Number(t.amount) || 0) > 0
    );

    return hasActiveContract || hasActiveTransaction;
  });

  return {
    count: activeHolders.length,
    activeHolders
  };
}
