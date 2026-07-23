import { NextFunction } from 'grammy';
import { BotContext } from '../types/botTypes.js';

export async function loggerMiddleware(ctx: BotContext, next: NextFunction) {
  const start = Date.now();
  const updateType = ctx.update ? Object.keys(ctx.update)[1] || 'unknown' : 'unknown';
  const fromUser = ctx.from ? `@${ctx.from.username || ctx.from.id}` : 'system';

  console.log(`[Telegram Bot] 📩 Incoming ${updateType} from ${fromUser}`);

  await next();

  const ms = Date.now() - start;
  console.log(`[Telegram Bot] ✅ Handled ${updateType} in ${ms}ms`);
}
