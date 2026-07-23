# 🛡️ GrockGold Telegram Bot & Mini App Integration

Production-ready, highly modular, clean-architecture Telegram Bot and Mini App integration for the **GrockGold Mining Platform**.

---

## 🌟 Key Features

1. **Permanent Identity Binding (`telegram_user_id`)**:
   - Binds users uniquely via Telegram BIGINT `telegram_user_id` in Supabase PostgreSQL.
   - Prevents fraud and username change spoofing.

2. **Full-Stack Account Linking**:
   - Seamless account connection via 6-digit one-time verification code generated from the web dashboard.
   - Instant verification and synchronization with Supabase.

3. **Live Real-time Dashboard**:
   - Real-time balances, active mining contracts, daily reward tracking, referral bonuses, and deposit/withdrawal statuses directly from Supabase.

4. **Telegram Mini App Auto-Login**:
   - Supports Telegram Mini App running inside Telegram (`https://grokgold.vercel.app`).
   - Validates Telegram `initData` HMAC-SHA256 signature server-side for zero-password seamless auto-login!

5. **Server-Side Admin Role Security**:
   - Strict server-side role validation for `/admin` and `admin_*` callback queries.
   - Prevents non-admin regular members from accessing admin control panels or approving transactions.

6. **Automatic Real-time Notifications**:
   - Dispatches automated notification alerts for Deposit Approvals, Withdrawal Approvals, Mining Rewards, Referral Bonuses, and Security updates.

---

## 📁 Directory Architecture

```
telegram-bot/
│
├── src/
│   ├── config/          # Bot configuration & environment variables
│   ├── database/        # Supabase client initialization
│   ├── types/           # TypeScript interfaces & bot context types
│   ├── services/        # Business logic (User, Wallet, Mining, Referral, Admin)
│   ├── middleware/      # Auth, Admin guard, logger & session middleware
│   ├── commands/        # Command handlers (/start, /link, /dashboard, /admin, etc.)
│   ├── handlers/        # Callback query & text message handlers
│   ├── utils/           # Keyboards, formatters, Telegram initData validator
│   └── index.ts         # GrammY Bot initialization & runner
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Variables (.env)

Add the following to your `.env` file:

```env
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_from_botfather"
TELEGRAM_WEBAPP_URL="https://grokgold.vercel.app"
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

---

## 🚀 How to Run locally

1. Install dependencies:
   ```bash
   cd telegram-bot
   npm install
   ```

2. Start development mode (Long Polling):
   ```bash
   npm run dev
   ```

3. Production Build:
   ```bash
   npm run build
   npm start
   ```

---

## ☁️ Deployment on Vercel / Cloud Run / Webhook

To connect the bot via Webhook on Vercel or Cloud Run:
Set Webhook URL via curl:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.vercel.app/api/telegram/webhook"
```

All webhook payloads are handled by the Express endpoint `/api/telegram/webhook` in `server.ts`.
