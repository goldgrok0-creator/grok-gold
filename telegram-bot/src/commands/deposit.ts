import { BotContext } from '../types/botTypes.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleDepositCommand(ctx: BotContext) {
  if (!ctx.user) {
    await ctx.reply('⚠️ Silakan hubungkan akun GrockGold Anda terlebih dahulu.');
    return;
  }

  const text =
    `<b>💳 DEPOSIT & ISI SALDO GROCKGOLD</b>\n\n` +
    `📌 <b>Username:</b> @${ctx.user.username}\n` +
    `💰 <b>Saldo Saat Ini:</b> Rp ${Number(ctx.user.main_balance || 0).toLocaleString('id-ID')}\n\n` +
    `<b>Pilihan Metode Pembayaran:</b>\n` +
    `1. <b>QRIS Instant All Payment:</b> (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay)\n` +
    `2. <b>Transfer Bank Manual:</b> Bank Central Asia (BCA) No. Rek: <code>883920192</code> a.n GROCKGOLD MINING\n\n` +
    `<i>Minimal Deposit: Rp 50.000</i>\n\n` +
    `Ketik nominal deposit atau klik tombol di bawah untuk membuka form deposit via Mini App:`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboards.getBackToMainKeyboard(),
  });
}
