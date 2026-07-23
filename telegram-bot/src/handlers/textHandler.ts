import { BotContext } from '../types/botTypes.js';
import { userService } from '../services/userService.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleTextMessage(ctx: BotContext) {
  const text = ctx.message?.text?.trim();
  if (!text || text.startsWith('/')) return;

  const step = ctx.session.step;

  if (step === 'awaiting_link_code' || !ctx.user) {
    if (!ctx.from) return;

    const res = await userService.linkAccountByCode(text, {
      id: ctx.from.id,
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
      language_code: ctx.from.language_code,
    });

    ctx.session.step = 'idle';

    if (res.success) {
      await ctx.reply(res.message, {
        parse_mode: 'HTML',
        reply_markup: keyboards.getMemberDashboardMenu(),
      });
    } else {
      await ctx.reply(res.message, {
        parse_mode: 'HTML',
        reply_markup: keyboards.getUnlinkedMenu(),
      });
    }
  } else {
    // General chat response
    await ctx.reply(
      `👋 Halo <b>${ctx.from?.first_name || 'Miner'}</b>!\n\nSilakan pilih menu transaksi dan fitur pada tombol keyboard di bawah ini:`,
      {
        parse_mode: 'HTML',
        reply_markup: ctx.isAdmin ? keyboards.getAdminDashboardMenu() : keyboards.getMemberDashboardMenu(),
      }
    );
  }
}
