import crypto from 'crypto';

export interface TelegramInitDataUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Validates Telegram Mini App initData string using HMAC-SHA256 algorithm
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string, botToken: string): { valid: boolean; user?: TelegramInitDataUser; authDate?: number } {
  if (!initData || !botToken) return { valid: false };

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return { valid: false };

    urlParams.delete('hash');

    // Sort params alphabetically
    const params: string[] = [];
    for (const [key, value] of urlParams.entries()) {
      params.push(`${key}=${value}`);
    }
    params.sort();

    const dataCheckString = params.join('\n');

    // 1. secret_key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // 2. calculated_hash = HMAC_SHA256(secret_key, dataCheckString)
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      return { valid: false };
    }

    const userJson = urlParams.get('user');
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const user: TelegramInitDataUser | undefined = userJson ? JSON.parse(userJson) : undefined;

    return {
      valid: true,
      user,
      authDate,
    };
  } catch (err) {
    console.error('Error validating Telegram initData:', err);
    return { valid: false };
  }
}
