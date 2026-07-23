import { Bot, session } from 'grammy';
import { config } from './config/botConfig.js';
import { BotContext, SessionData } from './types/botTypes.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';
import { authMiddleware, requireAdmin } from './middleware/authMiddleware.js';
import { handleStartCommand } from './commands/start.js';
import { handleLinkCommand } from './commands/link.ts';
import { handleDashboardCommand } from './commands/dashboard.js';
import { handleDepositCommand } from './commands/deposit.js';
import { handleWithdrawCommand } from './commands/withdraw.js';
import { handleMiningCommand } from './commands/mining.js';
import { handleReferralCommand } from './commands/referral.js';
import { handleAdminCommand } from './commands/admin.js';
import { handleCallbackQuery } from './handlers/callbackHandler.js';
import { handleTextMessage } from './handlers/textHandler.js';

if (!config.botToken) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set in environment variables. Bot launcher will run in standby mode.');
}

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken || 'DUMMY_TOKEN_FOR_STANDBY');

  // Install session middleware
  bot.use(
    session({
      initial: (): SessionData => ({ step: 'idle' }),
    })
  );

  // Install custom middlewares
  bot.use(loggerMiddleware);
  bot.use(authMiddleware);

  // Register commands
  bot.command('start', handleStartCommand);
  bot.command('link', handleLinkCommand);
  bot.command('dashboard', handleDashboardCommand);
  bot.command('deposit', handleDepositCommand);
  bot.command('withdraw', handleWithdrawCommand);
  bot.command('mining', handleMiningCommand);
  bot.command('referral', handleReferralCommand);
  bot.command('admin', requireAdmin, handleAdminCommand);

  // Register callback queries
  bot.on('callback_query:data', handleCallbackQuery);

  // Register text messages
  bot.on('message:text', handleTextMessage);

  // Catch errors
  bot.catch((err) => {
    console.error('Error in Telegram Bot:', err);
  });

  return bot;
}

// Auto-start polling if executed directly
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  if (config.botToken) {
    console.log('🚀 Starting GrockGold Telegram Bot in Long-Polling mode...');
    const bot = createBot();
    bot.start({
      onStart: (botInfo) => {
        console.log(`✅ GrockGold Telegram Bot running as @${botInfo.username}`);
      },
    });
  }
}
