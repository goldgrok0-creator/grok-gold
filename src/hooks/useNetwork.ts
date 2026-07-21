import { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { networkService } from '../services/networkService';

export const useNetwork = () => {
  const {
    currentAccount,
    accounts,
    state,
    language,
    triggerModal
  } = useAppState();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const downlines = useMemo(() => {
    if (!currentAccount) {
      return { direct: [], l2: [], l3: [] };
    }
    return networkService.calculateDownline(currentAccount.username, accounts);
  }, [currentAccount, accounts]);

  const copyReferralLink = () => {
    const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
    const shareUrl = `${window.location.origin}/register?ref=${refCodeStr}`;
    
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    triggerModal(
      language === 'id' 
        ? '✅ Referral Link Copied Successfully!' 
        : '✅ Referral Link Copied Successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  const copyReferralCode = () => {
    const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
    navigator.clipboard.writeText(refCodeStr);
    setCopiedCode(true);
    triggerModal(
      language === 'id' 
        ? '✅ Referral Code Copied Successfully!' 
        : '✅ Referral Code Copied Successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedCode(false);
    }, 2000);
  };

  const recordClick = async (referralCode: string, source: string) => {
    return await networkService.recordClick(referralCode, source);
  };

  return {
    downlines,
    copiedLink,
    copiedCode,
    copyReferralLink,
    copyReferralCode,
    recordClick
  };
};
