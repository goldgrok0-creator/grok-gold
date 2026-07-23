import { supabase } from '../database/supabaseClient.js';
import { GrockGoldUser } from '../types/botTypes.js';

export const userService = {
  /**
   * Find user by Telegram User ID (or legacy telegram_id text)
   */
  async getUserByTelegramId(telegramUserId: number | string): Promise<GrockGoldUser | null> {
    try {
      const tgIdStr = String(telegramUserId);
      const tgIdNum = typeof telegramUserId === 'number' ? telegramUserId : parseInt(tgIdStr, 10);

      // Check by telegram_user_id (BIGINT) or telegram_id (TEXT)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`telegram_user_id.eq.${isNaN(tgIdNum) ? 0 : tgIdNum},telegram_id.eq.${tgIdStr}`)
        .maybeSingle();

      if (error) {
        // Fallback search using json arrow for settings -> telegramId
        const { data: allUsers } = await supabase.from('users').select('*');
        if (allUsers) {
          const match = allUsers.find(
            (u: any) =>
              String(u.telegram_user_id) === tgIdStr ||
              String(u.telegram_id) === tgIdStr ||
              String(u.settings?.telegramId) === tgIdStr
          );
          if (match) return match as GrockGoldUser;
        }
        return null;
      }

      return (data as GrockGoldUser) || null;
    } catch (err) {
      console.error('Error fetching user by telegram ID:', err);
      return null;
    }
  },

  /**
   * Link user account using verification code or username
   */
  async linkAccountByCode(
    code: string,
    telegramUser: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      language_code?: string;
    }
  ): Promise<{ success: boolean; message: string; user?: GrockGoldUser }> {
    try {
      // 1. Verify code in telegram_linking_codes
      const { data: codeData, error: codeErr } = await supabase
        .from('telegram_linking_codes')
        .select('*')
        .eq('code', code.trim())
        .maybeSingle();

      let targetUsername = '';
      if (codeData && new Date(codeData.expires_at) > new Date()) {
        targetUsername = codeData.username;
      } else {
        // Try direct username match if user typed username directly e.g. "username:password" or username
        targetUsername = code.trim().replace(/^@/, '');
      }

      // 2. Fetch target user by username
      const { data: targetUser, error: userErr } = await supabase
        .from('users')
        .select('*')
        .ilike('username', targetUsername)
        .maybeSingle();

      if (!targetUser) {
        return {
          success: false,
          message: '❌ Kode verifikasi atau Username tidak valid. Pastikan Anda telah membuat kode verifikasi di Menu Pengaturan Website.',
        };
      }

      // 3. Update user with Telegram details
      const now = new Date().toISOString();
      const updatedSettings = {
        ...(targetUser.settings || {}),
        telegramId: String(telegramUser.id),
      };

      const { data: updatedUser, error: updateErr } = await supabase
        .from('users')
        .update({
          telegram_user_id: telegramUser.id,
          telegram_id: String(telegramUser.id),
          telegram_username: telegramUser.username || '',
          telegram_first_name: telegramUser.first_name || '',
          telegram_last_name: telegramUser.last_name || '',
          telegram_language: telegramUser.language_code || 'id',
          telegram_linked_at: now,
          settings: updatedSettings,
        })
        .eq('username', targetUser.username)
        .select()
        .single();

      if (updateErr) {
        return { success: false, message: '❌ Gagal memperbarui data akun ke database: ' + updateErr.message };
      }

      // 4. Delete used linking code
      if (codeData) {
        await supabase.from('telegram_linking_codes').delete().eq('code', code.trim());
      }

      // 5. Log activity
      await supabase.from('telegram_activity_logs').insert({
        telegram_user_id: telegramUser.id,
        username: targetUser.username,
        action: 'account_linked',
        details: { telegramUser, linkedAt: now },
      });

      return {
        success: true,
        message: `🎉 Selamat! Akun GrockGold <b>@${targetUser.username}</b> berhasil terhubung dengan Telegram ID <code>${telegramUser.id}</code>!`,
        user: updatedUser as GrockGoldUser,
      };
    } catch (err: any) {
      return { success: false, message: '❌ Terjadi kesalahan server: ' + String(err.message || err) };
    }
  },

  /**
   * Generate 6-digit linking code for user (used by web app)
   */
  async generateLinkingCode(username: string): Promise<{ success: boolean; code?: string; expiresAt?: string; error?: string }> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

      const { error } = await supabase.from('telegram_linking_codes').upsert({
        code,
        username,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, code, expiresAt };
    } catch (err: any) {
      return { success: false, error: String(err) };
    }
  },
};
