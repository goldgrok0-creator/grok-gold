import { BotContext } from '../types/botTypes.js';
import { formatters } from '../utils/formatters.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleDashboardCommand(ctx: BotContext) {
  if (!ctx.user) {
    await ctx.reply('⚠️ Silakan hubungkan akun GrockGold Anda terlebih dahulu.');
    return;
  }

  const firstName = ctx.from?.first_name || ctx.user.full_name || 'Miner';
  const text = formatters.formatDashboardText(ctx.user, firstName);
  const keyboard = ctx.isAdmin ? keyboards.getAdminDashboardMenu() : keyboards.getMemberDashboardMenu();

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}
