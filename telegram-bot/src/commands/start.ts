import { BotContext } from '../types/botTypes.js';
import { keyboards } from '../utils/keyboards.js';
import { formatters } from '../utils/formatters.js';

export async function handleStartCommand(ctx: BotContext) {
  const fromUser = ctx.from;
  if (!fromUser) return;

  const firstName = fromUser.first_name || 'Miner';

  if (!ctx.user) {
    // Unlinked user welcome
    const welcomeMsg =
      `👋 <b>Welcome to GrockGold Mining System</b>\n\n` +
      `You haven't linked your account yet.\n\n` +
      `Please choose one of the following options to connect your GrockGold account or start mining:`;

    await ctx.reply(welcomeMsg, {
      parse_mode: 'HTML',
      reply_markup: keyboards.getUnlinkedMenu(),
    });
  } else {
    // Linked user dashboard
    const dashboardText = formatters.formatDashboardText(ctx.user, firstName);
    const keyboard = ctx.isAdmin ? keyboards.getAdminDashboardMenu() : keyboards.getMemberDashboardMenu();

    await ctx.reply(dashboardText, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}
