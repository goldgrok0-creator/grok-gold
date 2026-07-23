import { BotContext } from '../types/botTypes.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleWithdrawCommand(ctx: BotContext) {
  if (!ctx.user) {
    await ctx.reply('⚠️ Silakan hubungkan akun GrockGold Anda terlebih dahulu.');
    return;
  }

  const text =
    `<b>💸 PENARIKAN DANA (WITHDRAWAL)</b>\n\n` +
    `👤 <b>Username:</b> @${ctx.user.username}\n` +
    `💳 <b>Saldo Utama Siap Tarik:</b> Rp ${Number(ctx.user.main_balance || 0).toLocaleString('id-ID')}\n\n` +
    `📌 <b>Ketentuan Penarikan:</b>\n` +
    `• Minimal Penarikan: Rp 100.000\n` +
    `• Biaya Penanganan: 0% (Bebas Biaya)\n` +
    `• Waktu Proses: 5 - 30 Menit (Otomatis & Notifikasi Telegram)\n\n` +
    `Gunakan Telegram Mini App atau hubungi Admin untuk memproses penarikan instant.`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboards.getBackToMainKeyboard(),
  });
}
