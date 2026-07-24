import { registerTelegramWebhook, removeTelegramWebhook } from '../../src/services/telegramWebhookRegister';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'DELETE') {
      const result = await removeTelegramWebhook();
      return res.status(200).json(result);
    }

    const { force, webhookUrl } = req.body || req.query || {};
    const result = await registerTelegramWebhook({
      force: force === true || force === 'true',
      webhookUrl: typeof webhookUrl === 'string' ? webhookUrl : undefined
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Error in /api/telegram/register-webhook:', err);
    console.error('Stack trace:', err?.stack || 'No stack trace');
    return res.status(200).json({ success: false, error: err.message || String(err) });
  }
}

