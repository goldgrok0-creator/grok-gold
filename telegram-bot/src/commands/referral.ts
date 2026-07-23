import { BotContext } from '../types/botTypes.js';
import { referralService } from '../services/referralService.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleReferralCommand(ctx: BotContext) {
  if (!ctx.user) {
    await ctx.reply('⚠️ Silakan hubungkan akun GrockGold Anda terlebih dahulu.');
    return;
  }

  const stats = await referralService.getReferralStats(ctx.user.username);

  const text =
    `<b>👥 PROGRAM REFERRAL & BONUS TIM GROCKGOLD</b>\n\n` +
    `🏷️ <b>Kode Referral Anda:</b> <code>${stats.referralCode}</code>\n` +
    `🔗 <b>Link Undangan:</b> <code>${stats.referralLink}</code>\n\n` +
    `📊 <b>Statistik Referensi:</b>\n` +
    `• Direct Referrals: ${stats.directReferralsCount} Member\n` +
    `• Total Bonus Diperoleh: Rp ${stats.totalReferralBonus.toLocaleString('id-ID')}\n\n` +
    `🎁 <i>Bagikan link di atas ke rekan Anda untuk mendapatkan komisi 10% setiap pembagian hasil tambang!</i>`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboards.getBackToMainKeyboard(),
  });
}
