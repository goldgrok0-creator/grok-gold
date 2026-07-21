import { 
  saveAccountToSupabase, 
  fetchAccountsFromSupabase, 
  updateProfileImageInSupabase, 
  updateUserSettingsInSupabase 
} from '../supabase';
import { UserAccount } from '../types';

export const accountService = {
  async fetchAccounts(loggedInUsername?: string): Promise<UserAccount[] | null> {
    return await fetchAccountsFromSupabase(loggedInUsername);
  },

  async saveAccount(account: UserAccount): Promise<boolean> {
    return await saveAccountToSupabase(account);
  },

  async updateProfileImage(username: string, imageUrl: string): Promise<boolean> {
    return await updateProfileImageInSupabase(username, imageUrl);
  },

  async updateUserSettings(username: string, settings: any): Promise<boolean> {
    return await updateUserSettingsInSupabase(username, settings);
  }
};
