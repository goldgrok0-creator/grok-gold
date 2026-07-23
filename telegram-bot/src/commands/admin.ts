import { BotContext } from '../types/botTypes.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleAdminCommand(ctx: BotContext) {
  if (!ctx.isAdmin) {
    await ctx.reply(
      `<b>⛔ AKSES DITOLAK (ACCESS DENIED)</b>\n\n` +
      `Maaf, fitur <b>Admin Control Panel</b> dan perintah admin Telegram hanya dapat diakses oleh akun dengan hak akses <b>Admin</b>.\n\n` +
      `<i>Akses ini telah diverifikasi dan ditolak oleh server GROCKGOLD.</i>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  const text =
    `<b>👑 GROCKGOLD ADMIN CONTROL PANEL</b>\n\n` +
    `Selamat datang Administrator <b>${ctx.from?.first_name || 'System Admin'}</b>!\n` +
    `🔰 <b>Status Verifikasi:</b> ✅ <b>AUTHENTICATED ADMIN</b>\n\n` +
    `Silakan pilih menu manajemen sistem di bawah ini:`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboards.getAdminPanelMenu(),
  });
}
