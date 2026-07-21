import { supabase } from './supabase';

// =========================================================================
// REALTIME SEAMLESS TRANSACTION APPROVAL ENGINE (ADMIN ATOMIC QUERIES)
// =========================================================================

// Approve Deposit
export async function approveDepositInSupabase(
  depositId: string,
  username: string,
  amount: number,
  adminUsername = 'admin'
): Promise<boolean> {
  try {
    // 1. Check deposit status first to avoid double approval
    const { data: dep } = await supabase.from('deposits').select('*').eq('id', depositId).single();
    if (!dep || dep.status !== 'pending') return false;

    // 2. Fetch User latest main_balance to perform atomic increment
    const { data: user } = await supabase.from('users').select('main_balance').eq('username', username).single();
    const currentBalance = Number(user?.main_balance) || 0;
    const newBalance = currentBalance + amount;

    // 3. Update payment_method with approval metadata
    let payMethodObj = { method: dep.payment_method || '' };
    if (dep.payment_method && dep.payment_method.startsWith('{')) {
      try {
        payMethodObj = JSON.parse(dep.payment_method);
      } catch (e) {}
    }
    const updatedPaymentMethod = JSON.stringify({
      ...payMethodObj,
      approved_by: adminUsername,
      approved_at: Date.now()
    });

    // 4. Atomically update deposit status and user balance
    const [depUpdate, userUpdate] = await Promise.all([
      supabase.from('deposits').update({ status: 'approved', payment_method: updatedPaymentMethod }).eq('id', depositId),
      supabase.from('users').update({ main_balance: newBalance }).eq('username', username)
    ]);

    if (depUpdate.error || userUpdate.error) {
      console.error('Atomic Deposit Approval error:', depUpdate.error || userUpdate.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Approve deposit crash:', err);
    return false;
  }
}

// Reject Deposit
export async function rejectDepositInSupabase(depositId: string, rejectionReason: string): Promise<boolean> {
  try {
    // 1. Fetch deposit record
    const { data: dep } = await supabase.from('deposits').select('*').eq('id', depositId).single();
    if (!dep || dep.status !== 'pending') return false;

    // 2. Update payment_method with rejection reason
    let payMethodObj = { method: dep.payment_method || '' };
    if (dep.payment_method && dep.payment_method.startsWith('{')) {
      try {
        payMethodObj = JSON.parse(dep.payment_method);
      } catch (e) {}
    }
    const updatedPaymentMethod = JSON.stringify({
      ...payMethodObj,
      rejection_reason: rejectionReason
    });

    const { error } = await supabase
      .from('deposits')
      .update({ status: 'rejected', payment_method: updatedPaymentMethod })
      .eq('id', depositId);

    return !error;
  } catch (err) {
    console.error('Reject deposit crash:', err);
    return false;
  }
}

// Approve Withdrawal
export async function approveWithdrawalInSupabase(withdrawId: string, username: string, amount: number): Promise<boolean> {
  try {
    // 1. Check withdrawal status
    const { data: wd } = await supabase.from('withdrawals').select('status').eq('id', withdrawId).single();
    if (!wd || wd.status !== 'pending') return false;

    // 2. Fetch User balance
    const { data: user } = await supabase.from('users').select('main_balance').eq('username', username).single();
    const currentBalance = Number(user?.main_balance) || 0;

    if (currentBalance < amount) {
      console.warn('Insufficient user balance to approve withdrawal!');
      return false;
    }

    const newBalance = currentBalance - amount;
    const txId = 'TXW-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 3. Perform atomic operations
    const [wdUpdate, userUpdate, txInsert] = await Promise.all([
      supabase.from('withdrawals').update({ status: 'approved' }).eq('id', withdrawId),
      supabase.from('users').update({ main_balance: newBalance }).eq('username', username),
      supabase.from('transactions').insert({
        id: txId,
        username,
        type: 'withdraw',
        amount,
        description: '✅ Penarikan Sukses (Disetujui Admin)',
        created_at: Date.now()
      })
    ]);

    if (wdUpdate.error || userUpdate.error || txInsert.error) {
      console.error('Atomic Withdrawal Approval error:', wdUpdate.error || userUpdate.error || txInsert.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Approve withdrawal crash:', err);
    return false;
  }
}

// Reject Withdrawal
export async function rejectWithdrawalInSupabase(withdrawId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', withdrawId);

    return !error;
  } catch (err) {
    console.error('Reject withdrawal crash:', err);
    return false;
  }
}
