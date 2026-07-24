import { supabase, registerUserInSupabase } from '../supabase';
import { UserAccount } from '../types';

export const authService = {
  async loginWithSupabase(email: string, pass: string, isBypassed: boolean) {
    return await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
  },

  async signUpWithSupabase(email: string, pass: string, username: string, fullName: string, currentOrigin: string) {
    return await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        emailRedirectTo: currentOrigin,
        data: {
          username,
          full_name: fullName
        }
      }
    });
  },

  async registerUser(newAccount: UserAccount): Promise<{ success: boolean; error?: string } | boolean> {
    return await registerUserInSupabase(newAccount);
  },

  async resetPasswordForEmail(email: string, redirectToUrl: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectToUrl
    });
  },

  async updatePasswordInSupabase(password: string) {
    return await supabase.auth.updateUser({ password });
  },

  async updateDatabasePassword(email: string, pass: string) {
    return await supabase
      .from('users')
      .update({ password: pass })
      .eq('email', email);
  },

  async resendVerificationEmail(email: string, currentOrigin: string) {
    return await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: currentOrigin
      }
    });
  },

  async logout() {
    return await supabase.auth.signOut();
  }
};
