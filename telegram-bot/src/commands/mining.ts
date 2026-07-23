import { BotContext } from '../types/botTypes.js';
import { keyboards } from '../utils/keyboards.js';

export async function handleMiningCommand(ctx: BotContext) {
  if (!ctx.user) {
    await ctx.reply('⚠️ Silakan hubungkan akun GrockGold Anda terlebih dahulu.');
    return;
  }

  const activeContracts = ctx.user.active_contracts || 0;
  const pendingReward = ctx.user.pending_mining_reward || 0;

  const text =
    `<b>⛏️ GROCKGOLD MINING DASHBOARD</b>\n\n` +
    `⚡ <b>Status Rig:</b> ${activeContracts > 0 ? '🟢 ACTIVE & MINING' : '🟡 STANDBY'}\n` +
    `📦 <b>Kontrak Aktif:</b> ${activeContracts} Unit Kontrak Tambang Emas\n` +
    `⏳ <b>Countdown Timer:</b> 04j 28m 12s (Reset Harian)\n` +
    `💰 <b>Profit Pending Siap Klaim:</b> Rp ${Number(pendingReward).toLocaleString('id-ID')}\n\n` +
    `Klik tombol <b>🎁 Klaim Mining Reward</b> di bawah untuk langsung mencairkan hasil tambang ke Saldo Utama Anda!`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboards.getBackToMainKeyboard(),
  });
}
