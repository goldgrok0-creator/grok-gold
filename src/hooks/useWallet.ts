import { useState } from 'react';
import { useAppState } from '../AppContext';
import { walletService } from '../services/walletService';
import { CONFIG, Transaction } from '../types';

export const useWallet = () => {
  const {
    currentAccount,
    state,
    updateState,
    language,
    globalConfig,
    triggerModal,
    setCurrentTab
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<'bank' | 'crypto'>('bank');
  const [depositProof, setDepositProof] = useState('');
  const [depositProofName, setDepositProofName] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedUSDT, setCopiedUSDT] = useState(false);

  const deposit = async (amountStr: string, depositMethod: 'bank' | 'crypto', depositProof: string) => {
    const numeric = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;

    if (numeric < CONFIG.MIN_DEPOSIT) {
      triggerModal(
        language === 'id'
          ? `Minimal deposit adalah Rp${CONFIG.MIN_DEPOSIT.toLocaleString('id-ID')}.`
          : `Minimum deposit is Rp ${CONFIG.MIN_DEPOSIT.toLocaleString('id-ID')}.`,
        'warning'
      );
      return false;
    }

    if (!depositProof) {
      triggerModal(
        language === 'id'
          ? '❌ Bukti transfer wajib diunggah sebelum melanjutkan.'
          : '❌ Transfer proof is required before continuing.',
        'warning'
      );
      return false;
    }

    if (!currentAccount) return false;
    setIsLoading(true);

    const depId = 'DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const paymentLabel = depositMethod === 'bank' 
      ? `Bank (${globalConfig?.bankName || 'BCA'})` 
      : 'USDT Crypto (TRC-20)';

    const success = await walletService.createDeposit(depId, currentAccount.username, numeric, paymentLabel, depositProof);
    setIsLoading(false);

    if (success) {
      triggerModal(
        language === 'id'
          ? `🎉 Deposit sebesar Rp ${numeric.toLocaleString('id-ID')} Berhasil diproses otomatis! Saldo Anda telah ditambahkan.`
          : `🎉 Deposit of Rp ${numeric.toLocaleString('id-ID')} has been processed automatically! Your balance is updated.`,
        'success'
      );
      setCurrentTab('wallet');
      return true;
    } else {
      triggerModal(language === 'id' ? '❌ Gagal mengirim permintaan deposit.' : '❌ Failed to submit deposit request.', 'danger');
      return false;
    }
  };

  const withdraw = async (amountStr: string, withdrawBank: string, withdrawAccount: string) => {
    if (state.activeContracts < 1) {
      triggerModal(
        language === 'id'
          ? '❌ AKUN BELUM AKTIF\n\nPenarikan saldo (Withdraw) hanya dapat dilakukan setelah akun Anda aktif dengan membeli minimal 1 unit Stock / Kontrak (Rp 100.000).\n\nSilakan lakukan pembelian Stock di menu Utama untuk mengaktifkan akun Anda!'
          : '❌ INACTIVE ACCOUNT\n\nWithdrawal can only be performed after your account is active by purchasing at least 1 Stock unit (Rp 100,000).\n\nPlease purchase Stock on the Home page to activate your account!',
        'warning'
      );
      return false;
    }
    const amount = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;

    if (amount < CONFIG.MIN_WITHDRAW) {
      triggerModal(
        language === 'id' 
          ? `Minimal penarikan adalah Rp${CONFIG.MIN_WITHDRAW.toLocaleString('id-ID')}.` 
          : `Minimum withdrawal is Rp ${CONFIG.MIN_WITHDRAW.toLocaleString('id-ID')}.`,
        'warning'
      );
      return false;
    }

    if (!withdrawAccount.trim()) {
      triggerModal(
        language === 'id' ? '❌ Nomor rekening bank harus diisi!' : '❌ Bank account number is required!',
        'warning'
      );
      return false;
    }

    if (amount > state.mainBalance) {
      triggerModal(
        language === 'id' ? '❌ Saldo utama Anda tidak mencukupi!' : '❌ Your main balance is insufficient!',
        'danger'
      );
      return false;
    }

    if (!currentAccount) return false;
    setIsLoading(true);

    const wdId = 'WD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const success = await walletService.createWithdrawal(
      wdId,
      currentAccount.username,
      amount,
      withdrawBank,
      withdrawAccount,
      currentAccount.fullName
    );
    setIsLoading(false);

    if (success) {
      triggerModal(
        language === 'id'
          ? `⏳ Permintaan penarikan Rp ${amount.toLocaleString('id-ID')} ke rekening ${withdrawBank} ${withdrawAccount} sedang diproses menunggu persetujuan admin!`
          : `⏳ Withdrawal request of Rp ${amount.toLocaleString('id-ID')} to ${withdrawBank} ${withdrawAccount} submitted. Pending admin approval!`,
        'success'
      );
      return true;
    } else {
      triggerModal(language === 'id' ? '❌ Gagal mengajukan penarikan.' : '❌ Failed to submit withdrawal request.', 'danger');
      return false;
    }
  };

  const transfer = async (amountStr: string, transferRecipient: string) => {
    const amount = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;

    if (amount < 10000) {
      triggerModal(
        language === 'id' ? '❌ Minimal transfer Rp 10.000' : '❌ Minimum transfer is Rp 10,000',
        'warning'
      );
      return false;
    }

    if (!transferRecipient.trim()) {
      triggerModal(
        language === 'id' ? '❌ ID Penerima harus diisi!' : '❌ Recipient ID is required!',
        'warning'
      );
      return false;
    }

    if (amount > state.mainBalance) {
      triggerModal(
        language === 'id' ? '❌ Saldo utama Anda tidak mencukupi!' : '❌ Your main balance is insufficient!',
        'danger'
      );
      return false;
    }

    const newTx: Transaction = {
      id: 'TRF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type: 'withdraw',
      amount: amount,
      date: Date.now(),
      description: language === 'id' 
        ? `Transfer ke ${transferRecipient}` 
        : `Transfer to ${transferRecipient}`,
    };

    updateState(prev => ({
      ...prev,
      mainBalance: prev.mainBalance - amount,
      transactions: [newTx, ...prev.transactions],
    }), true);

    triggerModal(
      language === 'id'
        ? `✅ Berhasil mentransfer Rp ${amount.toLocaleString('id-ID')} ke ${transferRecipient}!`
        : `✅ Successfully transferred Rp ${amount.toLocaleString('id-ID')} to ${transferRecipient}!`,
      'success'
    );
    return true;
  };

  const executeDeposit = async () => {
    const success = await deposit(depositAmount, depositMethod, depositProof);
    if (success) {
      setDepositAmount('');
      setDepositProof('');
      setDepositProofName('');
    }
    return success;
  };

  const executeWithdraw = async (amount: number, withdrawBank: string, withdrawAccount: string) => {
    return await withdraw(String(amount), withdrawBank, withdrawAccount);
  };

  const executeTransfer = async (amount: number, transferRecipient: string) => {
    return await transfer(String(amount), transferRecipient);
  };

  return {
    deposit,
    withdraw,
    transfer,
    isLoading,
    depositAmount,
    setDepositAmount,
    depositMethod,
    setDepositMethod,
    depositProof,
    setDepositProof,
    depositProofName,
    setDepositProofName,
    isUploadingProof,
    copiedBank,
    setCopiedBank,
    copiedUSDT,
    setCopiedUSDT,
    executeDeposit,
    executeWithdraw,
    executeTransfer
  };
};
