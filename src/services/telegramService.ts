export interface TelegramNotificationParams {
  username?: string;
  telegramId?: string;
  eventType: 'deposit' | 'withdraw' | 'claim' | 'security' | 'test';
  title: string;
  message: string;
  amount?: number;
  status?: string;
}

export const telegramService = {
  async getBotInfo(): Promise<{
    configured: boolean;
    bot?: { id: number; username: string; firstName: string };
    error?: string;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/telegram/bot-info');
      return await res.json();
    } catch (err) {
      console.warn('Error fetching bot info:', err);
      return { configured: false, error: String(err) };
    }
  },

  async sendNotification(params: TelegramNotificationParams): Promise<{
    success: boolean;
    delivered?: boolean;
    skipped?: boolean;
    reason?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/telegram/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to dispatch telegram notification:', err);
      return { success: false, error: String(err) };
    }
  },

  async sendTestNotification(telegramId: string, username: string) {
    return this.sendNotification({
      telegramId,
      username,
      eventType: 'test',
      title: 'Uji Coba Notifikasi Telegram',
      message: `Selamat! Akun GrockGold @${username} berhasil terhubung ke Telegram ID (${telegramId}). Notifikasi otomatis untuk Deposit, Withdraw, Claim Daily Reward, dan Keamanan Akun sudah aktif!`,
      status: 'Connected'
    });
  }
};
