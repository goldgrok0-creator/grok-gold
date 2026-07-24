import { processTelegramWebhook } from '../../src/services/telegramWebhookHandler';

export default async function handler(req: any, res: any) {
  const timestamp = new Date().toISOString();
  console.log(`[VERCEL WEBHOOK INCOMING] ${timestamp} | Method: ${req.method}`);

  // Telegram Webhook accepts POST requests only.
  // Return 200 even for non-POST to prevent Telegram retries if hit improperly.
  if (req.method !== 'POST') {
    console.warn(`[VERCEL WEBHOOK WARN] Received ${req.method} request on webhook endpoint.`);
    return res.status(200).json({
      success: false,
      error: 'Method Not Allowed. Telegram Webhook accepts POST requests only.'
    });
  }

  try {
    let update = req.body;

    // Handle body parsing if req.body comes as string or Buffer
    if (typeof update === 'string') {
      try {
        update = JSON.parse(update);
      } catch (parseErr) {
        console.error('[VERCEL WEBHOOK ERROR] Failed to parse string body:', parseErr);
        return res.status(200).json({ success: false, error: 'Invalid JSON string' });
      }
    }

    if (!update || typeof update !== 'object') {
      console.warn('[VERCEL WEBHOOK WARN] Empty or invalid object payload received.');
      return res.status(200).json({ success: false, error: 'Invalid payload' });
    }

    // Process Telegram update
    const result = await processTelegramWebhook(update);
    console.log(`[VERCEL WEBHOOK SUCCESS] ${timestamp} | Result:`, result);

    // ALWAYS return HTTP 200 to Telegram
    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error(`[VERCEL WEBHOOK FATAL ERROR] ${timestamp}:`, err?.message || err);
    console.error('Stack Trace:', err?.stack || 'No stack trace available');

    // Return 200 OK to Telegram so it never marks webhook as failed with 500
    return res.status(200).json({
      success: false,
      error: err?.message || String(err),
      handled: true
    });
  }
}

