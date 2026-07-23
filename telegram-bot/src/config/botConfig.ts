import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  webAppUrl: process.env.TELEGRAM_WEBAPP_URL || process.env.VERCEL_URL || 'https://grokgold.vercel.app',
  adminUsernames: ['admin', 'grockgold_admin'],
  port: parseInt(process.env.PORT || '3000', 10),
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
};

if (!config.supabaseUrl || !config.supabaseKey) {
  console.warn('⚠️ Supabase credentials not fully provided in environment variables.');
}
