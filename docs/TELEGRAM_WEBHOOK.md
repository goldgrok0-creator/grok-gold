# GrockGold Telegram Webhook Documentation

## Overview

The Telegram Webhook endpoint `/api/telegram/webhook` integrates the Telegram Bot into the GrockGold mining ecosystem.

### Features

1. **Vercel Serverless & Express Compatible Endpoint**:
   - `/api/telegram/webhook` accepts incoming Telegram updates.
   
2. **Commands Supported**:
   - `/start` : Checks if the Telegram user is linked to a GrockGold account.
     - **Unlinked**: Displays a welcome message and interactive buttons (`📝 Register`, `🔗 Link Existing Account`, `🌐 Open Website`, `📞 Customer Support`).
     - **Linked**: Displays a live dashboard summary (Main Balance, Mining Status, Active Contracts, Referral Count) with a direct `🚀 Open GrockGold` Mini App button.
   - `/start <6_DIGIT_CODE>` : Automatically links the Telegram account upon launching the bot with a verification code.
   - `/help` : Provides instructions on how to link accounts and interact with the bot.
   - `/link <6_DIGIT_CODE>` : Binds the account using a 6-digit code generated from the GrockGold Settings page.

3. **Callback Query Handler**:
   - `refresh_dashboard`: Updates the dashboard message with current balance and mining stats.
   - `link_account`: Guides the user on how to obtain and enter their verification code.
   - `check_mining`: Displays active mining rigs and daily returns.

4. **Web App Security (`initData` Verification)**:
   - Server-side HMAC-SHA256 signature verification ensures incoming Mini App auth requests are authentic and signed by Telegram using `TELEGRAM_BOT_TOKEN`.

5. **Webhook Registration Endpoint**:
   - Call `POST /api/telegram/register-webhook` to configure the bot webhook URL via Telegram's `setWebhook` API.
   - Automatic registration is attempted on server boot if `TELEGRAM_WEBHOOK_URL` is configured.

---

## Environment Variables

Ensure the following variables are set in your environment or Vercel settings:

```env
TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
TELEGRAM_WEBHOOK_URL="https://your-domain.vercel.app/api/telegram/webhook"
TELEGRAM_WEBAPP_URL="https://grokgold.vercel.app"
VITE_SUPABASE_URL="https://your-supabase.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

---

## Webhook Registration

To manually register the webhook with Telegram:

```bash
curl -X POST https://your-domain.vercel.app/api/telegram/register-webhook \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

Or trigger registration via Telegram API directly:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.vercel.app/api/telegram/webhook", "allowed_updates": ["message", "callback_query"]}'
```
