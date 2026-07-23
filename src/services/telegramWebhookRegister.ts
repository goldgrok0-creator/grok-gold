// Telegram Webhook Registration Utility

export async function registerTelegramWebhook(options?: { botToken?: string; webhookUrl?: string; force?: boolean }) {
  const token = options?.botToken || process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const targetUrl = options?.webhookUrl || process.env.TELEGRAM_WEBHOOK_URL || (process.env.APP_URL ? `${process.env.APP_URL}/api/telegram/webhook` : undefined);

  if (!token) {
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN or BOT_TOKEN is missing in environment variables.'
    };
  }

  if (!targetUrl) {
    return {
      success: false,
      error: 'TELEGRAM_WEBHOOK_URL is missing in environment variables.'
    };
  }

  try {
    // 1. Check current webhook info
    if (!options?.force) {
      const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const infoJson = await infoRes.json();

      if (infoJson.ok && infoJson.result?.url === targetUrl) {
        console.log(`[Telegram Webhook] Webhook is already registered to: ${targetUrl}`);
        return {
          success: true,
          alreadyRegistered: true,
          webhookUrl: targetUrl,
          info: infoJson.result
        };
      }
    }

    // 2. Set new webhook URL
    console.log(`[Telegram Webhook] Registering Telegram webhook to: ${targetUrl}`);
    const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: false
      })
    });

    const setJson = await setRes.json();

    if (setJson.ok) {
      console.log(`[Telegram Webhook] ✅ Webhook successfully set to ${targetUrl}`);
      return {
        success: true,
        alreadyRegistered: false,
        webhookUrl: targetUrl,
        description: setJson.description
      };
    } else {
      console.warn(`[Telegram Webhook] ❌ Failed to set webhook:`, setJson);
      return {
        success: false,
        error: setJson.description || 'Failed to set webhook in Telegram API',
        details: setJson
      };
    }
  } catch (err: any) {
    console.error(`[Telegram Webhook] Error setting webhook:`, err);
    return {
      success: false,
      error: err.message || String(err)
    };
  }
}

export async function removeTelegramWebhook(botToken?: string) {
  const token = botToken || process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { success: false, error: 'Token missing' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
      method: 'POST'
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}
