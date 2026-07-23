import { Context, SessionFlavor } from 'grammy';

export interface GrockGoldUser {
  id?: string;
  username: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  main_balance: number;
  active_contracts: number;
  pending_mining_reward: number;
  total_earned: number;
  referral_code?: string;
  referred_by?: string;
  telegram_user_id?: number | string;
  telegram_id?: string;
  telegram_username?: string;
  telegram_first_name?: string;
  telegram_last_name?: string;
  telegram_photo_url?: string;
  telegram_language?: string;
  telegram_linked_at?: string;
  settings?: {
    telegramId?: string;
  };
}

export interface SessionData {
  step?: 'idle' | 'awaiting_link_code' | 'awaiting_deposit_amount' | 'awaiting_withdraw_amount';
  tempData?: Record<string, any>;
}

export type BotContext = Context & SessionFlavor<SessionData> & {
  user?: GrockGoldUser | null;
  isAdmin?: boolean;
};

export interface TransactionRecord {
  id: string;
  username: string;
  type: 'deposit' | 'withdraw' | 'claim' | 'referral' | 'purchase';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method?: string;
  description?: string;
  created_at: string;
}
