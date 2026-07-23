import { NextFunction } from 'grammy';
import { BotContext } from '../types/botTypes.js';
import { userService } from '../services/userService.js';

/**
 * Middleware to resolve the connected GrockGold account for the current Telegram user
 */
export async function authMiddleware(ctx: BotContext, next: NextFunction) {
  if (ctx.from) {
    const user = await userService.getUserByTelegramId(ctx.from.id);
    ctx.user = user;
    ctx.isAdmin = !!(user && (user.role === 'admin' || user.username?.toLowerCase() === 'admin'));
  } else {
    ctx.user = null;
    ctx.isAdmin = false;
  }
  await next();
}

/**
 * Guard middleware to enforce linked account status
 */
export async function requireLinkedAccount(ctx: BotContext, next: NextFunction) {
  if (!ctx.user) {
    await ctx.reply(
      `<b>🛡️ GROCKGOLD BOT - AKUN BELUM TERHUBUNG</b>\n\n` +
      `Silakan hubungkan akun GrockGold Anda terlebih dahulu menggunakan tombol <b>🔗 Link Existing Account</b> atau perintah <code>/link &lt;kode&gt;</code>.`,
      { parse_mode: 'HTML' }
    );
    return;
  }
  await next();
}

/**
 * Guard middleware to enforce admin privileges (Server-side validation)
 */
export async function requireAdmin(ctx: BotContext, next: NextFunction) {
  if (!ctx.isAdmin) {
    await ctx.reply(
      `<b>⛔ AKSES DITOLAK (ACCESS DENIED)</b>\n\n` +
      `Maaf, fitur <b>Admin Control Panel</b> hanya dapat diakses oleh akun dengan status <b>Admin</b>.\n` +
      `<i>Tindakan ini telah diverifikasi dan ditolak secara aman oleh server GROCKGOLD.</i>`,
      { parse_mode: 'HTML' }
    );
    return;
  }
  await next();
}
