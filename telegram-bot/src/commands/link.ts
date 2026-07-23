import { BotContext } from '../types/botTypes.js';
import { userService } from '../services/userService.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleLinkCommand(ctx: BotContext) {
  if (!ctx.from) return;

  const args = ctx.match; // Match payload if called via /link <code_or_username>
  const code = typeof args === 'string' ? args.trim() : '';

  if (code) {
    // Attempt direct link
    const res = await userService.linkAccountByCode(code, {
      id: ctx.from.id,
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
      language_code: ctx.from.language_code,
    });

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
    // Ask for code or username
    ctx.session.step = 'awaiting_link_code';
    await ctx.reply(
      `🔗 <b>HUBUNGKAN AKUN GROCKGOLD</b>\n\n` +
      `Silakan kirimkan <b>Kode Verifikasi 6-Digit</b> yang Anda dapatkan dari Menu Pengaturan Website GrockGold, atau ketikkan Username Anda.\n\n` +
      `<i>Contoh: <code>784912</code> atau <code>grockmaster</code></i>`,
      { parse_mode: 'HTML' }
    );
  }
}
