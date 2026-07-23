import { processTelegramWebhook } from '../../src/services/telegramWebhookHandler';

export default async function handler(req: any, res: any) {
  // Only allow POST method for Telegram Webhook updates
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Telegram Webhook accepts POST requests only.'
    });
  }

  try {
    const update = req.body;
    if (!update || typeof update !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid JSON payload received.' });
    }

    const result = await processTelegramWebhook(update);

    // Always respond 200 OK to Telegram so it doesn't retry failed hooks endlessly
    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error('Unhandled error in /api/telegram/webhook serverless handler:', err);
    return res.status(200).json({ success: false, error: err.message || String(err) });
  }
}
