import { fetchGlobalConfig, saveGlobalConfig, resetAllDataInSupabase } from '../supabase';

export const adminService = {
  async fetchConfig(): Promise<any> {
    return await fetchGlobalConfig();
  },

  async saveConfig(config: any): Promise<boolean> {
    return await saveGlobalConfig(config);
  },

  async resetData(): Promise<boolean> {
    return await resetAllDataInSupabase();
  }
};
