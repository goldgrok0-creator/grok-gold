import { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { contractService } from '../services/contractService';
import { CONFIG, Transaction } from '../types';
import { TRANSLATIONS } from '../translations';
import { calculateNetworkActiveCount } from '../utils/network';

export const useContract = () => {
  const {
    currentAccount,
    state,
    updateState,
    language,
    triggerModal,
    syncFromSupabase,
    accounts
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const t = TRANSLATIONS[language];

  const networkActiveCount = useMemo(() => {
    if (!currentAccount) return 0;
    return calculateNetworkActiveCount(currentAccount.username, accounts).count;
  }, [currentAccount, accounts]);

  const canClaimWelcomeBonus = useMemo(() => {
    return networkActiveCount >= CONFIG.REQUIRED_HOLDERS && !state.welcomeBonusClaimed;
  }, [networkActiveCount, state.welcomeBonusClaimed]);

  const purchaseContract = async (qty: number) => {
    const cost = qty * CONFIG.PRICE_PER_UNIT;
    if (cost > state.mainBalance) {
      triggerModal(t.insufficientBalance, 'danger');
      return false;
    }

    if (!currentAccount) return false;
    setIsLoading(true);

    const success = await contractService.purchaseContract(currentAccount.username, qty);
    setIsLoading(false);

    if (success) {
      triggerModal(
        language === 'id'
          ? `🎉 Berhasil membeli ${qty} unit Stock Contract!`
          : `🎉 Successfully purchased ${qty} Stock Contract units!`,
        'success'
      );
      await syncFromSupabase();
      return true;
    } else {
      triggerModal(
        language === 'id'
          ? '❌ Gagal melakukan pembelian kontrak.'
          : '❌ Failed to complete contract purchase.',
        'danger'
      );
      return false;
    }
  };

  const claimWelcomeBonus = async () => {
    if (state.welcomeBonusClaimed) {
      triggerModal('Welcome bonus already claimed!', 'info');
      return false;
    }
    if (!canClaimWelcomeBonus) {
      triggerModal(
        language === 'id'
          ? `⚠️ SYARAT BELUM TERPENUHI\n\nUntuk mengklaim Welcome Bonus sebesar Rp 1.800.000, Anda harus memiliki minimal 80 Holder Aktif di jaringan Anda.\n\nProgress Anda saat ini baru mencapai ${networkActiveCount} dari syarat ${CONFIG.REQUIRED_HOLDERS} Holder Aktif.\n\nSilakan undang lebih banyak rekan atau aktifkan lisensi di tim Anda untuk memenuhi syarat!`
          : `⚠️ REQUIREMENTS NOT MET\n\nTo claim the Welcome Bonus of Rp 1,800,000, you must have at least 80 Active Holders in your network.\n\nYour current progress is ${networkActiveCount} out of the required ${CONFIG.REQUIRED_HOLDERS} Active Holders.`,
        'warning'
      );
      return false;
    }

    if (!currentAccount) return false;
    setIsLoading(true);

    const success = await contractService.claimWelcomeBonus(currentAccount.username);
    setIsLoading(false);

    if (success) {
      triggerModal(t.welcomeBonusClaimedSuccess, 'success');
      await syncFromSupabase();
      return true;
    } else {
      triggerModal(
        language === 'id' ? '❌ Gagal mengklaim Welcome Bonus.' : '❌ Failed to claim Welcome Bonus.',
        'danger'
      );
      return false;
    }
  };

  const claimDailyReward = async () => {
    if (state.activeContracts === 0) {
      triggerModal(
        language === 'id' 
          ? "⚠️ TIDAK ADA KONTRAK AKTIF\n\nAnda tidak memiliki unit kontrak aktif. Beli unit kontrak untuk mulai klaim Daily Reward."
          : "⚠️ NO ACTIVE CONTRACT\n\nNo active contract. Purchase a contract to start earning rewards.",
        'warning'
      );
      return false;
    }

    const now = Date.now();
    if (state.lastClaimTime !== 0 && now - state.lastClaimTime < CONFIG.CLAIM_COOLDOWN) {
      triggerModal(
        language === 'id'
          ? "⚠️ SUDAH MENGKLAIM HARI INI\n\nAnda sudah mengklaim reward harian hari ini. Silakan tunggu hingga hitung mundur selesai."
          : "⚠️ ALREADY CLAIMED TODAY\n\nYou have already claimed today's reward. Please come back after the countdown ends.",
        'warning'
      );
      return false;
    }

    const contractValue = state.activeContracts * CONFIG.PRICE_PER_UNIT;
    const rewardAmount = contractValue * CONFIG.DAILY_REWARD_PERCENT;
    const claimAmountRounded = Math.round(rewardAmount);

    if (!currentAccount) return false;
    setIsLoading(true);

    const res = await contractService.claimDailyReward(currentAccount.username, claimAmountRounded);
    setIsLoading(false);

    if (res.success) {
      const claimedVal = res.claimedAmount || claimAmountRounded;
      const claimTx: Transaction = {
        id: 'CLM-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: 'reward',
        amount: claimedVal,
        date: Date.now(),
        description: `Daily Reward (${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% Contract Yield)`,
      };

      // Add to rewardBalance, keep mainBalance UNCHANGED, do NOT reset pendingMiningReward
      updateState(prev => ({
        ...prev,
        rewardBalance: res.rewardBalance ?? ((prev.rewardBalance ?? 0) + claimedVal),
        totalEarned: res.totalEarned ?? (prev.totalEarned + claimedVal),
        lastClaimTime: res.lastClaimTime ?? Date.now(),
        transactions: [claimTx, ...(prev.transactions || [])],
      }), true);

      triggerModal(
        language === 'id'
          ? `✅ Berhasil mengklaim Daily Reward sebesar Rp ${claimedVal.toLocaleString('id-ID')} ke Saldo Reward Anda!`
          : `✅ Successfully claimed Daily Reward of Rp ${claimedVal.toLocaleString('id-ID')} to your Reward Balance!`,
        'success'
      );
      await syncFromSupabase();
      return true;
    } else {
      const errMsg = res.error || (language === 'id' ? 'Gagal mengklaim Daily Reward.' : 'Failed to claim Daily Reward.');
      triggerModal(`❌ ${errMsg}`, 'danger');
      return false;
    }
  };

  const harvestRewards = async () => {
    return await claimDailyReward();
  };

  const simulateDownlinePurchase = () => {
    const levels = [
      { level: 1, pct: 0.10, label: 'Level 1 (Direct)' },
      { level: 2, pct: 0.03, label: 'Level 2 (Indirect)' },
      { level: 3, pct: 0.02, label: 'Level 3 (Indirect)' }
    ];
    const picked = levels[Math.floor(Math.random() * levels.length)];
    const names = [
      'Andi Wijaya', 'Budi Santoso', 'Chandra Lestari', 'Dedi Heryanto', 'Eko Prasetyo',
      'Fajar Ramadhan', 'Gita Permata', 'Hendra Kusuma', 'Iwan Setiawan', 'Joni Iskandar',
      'Kartika Sari', 'Lutfi Hakim', 'Mega Utami', 'Novi Andriani', 'Rian Hidayat'
    ];
    const pickedName = names[Math.floor(Math.random() * names.length)];
    const qty = Math.floor(1 + Math.random() * 5);
    const totalPurchase = qty * CONFIG.PRICE_PER_UNIT;
    const commission = totalPurchase * picked.pct;

    const newTx: Transaction = {
      id: 'REF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type: 'deposit',
      amount: commission,
      date: Date.now(),
      description: language === 'id'
        ? `Komisi Ref L${picked.level} (${pickedName} Beli ${qty} Unit)`
        : `Ref L${picked.level} Comm (${pickedName} Bought ${qty} Units)`,
    };

    updateState(prev => ({
      ...prev,
      mainBalance: prev.mainBalance + commission,
      referralEarned: prev.referralEarned + commission,
      transactions: [newTx, ...prev.transactions],
    }), true);

    triggerModal(
      language === 'id'
        ? `⚡ SIMULASI MLM BERHASIL\n\nAnggota Jaringan L${picked.level} Anda (${pickedName}) telah membeli ${qty} Unit Kontrak.\n\nAnda mendapatkan komisi 10% sebesar Rp ${commission.toLocaleString('id-ID')}!`
        : `⚡ MLM SIMULATION SUCCESS\n\nYour L${picked.level} Network member (${pickedName}) purchased ${qty} Contract Units.\n\nYou have been credited 10% commission of Rp ${commission.toLocaleString('id-ID')}!`,
      'success'
    );
  };

  return {
    purchaseContract,
    claimWelcomeBonus,
    claimDailyReward,
    harvestRewards,
    simulateDownlinePurchase,
    networkActiveCount,
    canClaimWelcomeBonus,
    isLoading
  };
};
