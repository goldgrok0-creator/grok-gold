import { BotContext } from '../types/botTypes.js';
import { keyboards } from '../utils/keyboards.js';
import { formatters } from '../utils/formatters.js';
import { miningService } from '../services/miningService.js';
import { walletService } from '../services/walletService.js';
import { referralService } from '../services/referralService.js';
import { adminService } from '../services/adminService.js';

export async function handleCallbackQuery(ctx: BotContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  await ctx.answerCallbackQuery().catch(() => {});

  // Handle Unlinked Menu Actions
  if (data === 'cmd_link') {
    ctx.session.step = 'awaiting_link_code';
    await ctx.reply(
      `🔗 <b>HUBUNGKAN AKUN GROCKGOLD</b>\n\n` +
      `Silakan ketikkan <b>Kode Verifikasi 6-Digit</b> dari Menu Pengaturan Website, atau ketikkan Username Anda.\n\n` +
      `<i>Contoh: <code>784912</code></i>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  if (data === 'cmd_register') {
    await ctx.reply(
      `📝 <b>PENDAFTARAN AKUN GROCKGOLD</b>\n\n` +
      `Buka website resmi GrockGold untuk mendaftar akun baru secara gratis dan dapatkan bonus awal penambangan!`,
      {
        parse_mode: 'HTML',
        reply_markup: keyboards.getUnlinkedMenu(),
      }
    );
    return;
  }

  if (data === 'menu_main' || data === 'menu_dashboard') {
    if (!ctx.user) {
      await ctx.reply(`👋 Welcome to GrockGold! Account unlinked.`, {
        parse_mode: 'HTML',
        reply_markup: keyboards.getUnlinkedMenu(),
      });
      return;
    }

    const firstName = ctx.from?.first_name || 'Miner';
    const text = formatters.formatDashboardText(ctx.user, firstName);
    const keyboard = ctx.isAdmin ? keyboards.getAdminDashboardMenu() : keyboards.getMemberDashboardMenu();

    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
    return;
  }

  // Handle Member Actions
  if (data === 'menu_deposit') {
    const text =
      `<b>💳 DEPOSIT & ISI SALDO GROCKGOLD</b>\n\n` +
      `📌 <b>Username:</b> @${ctx.user?.username || '-'}\n` +
      `💰 <b>Saldo Saat Ini:</b> Rp ${Number(ctx.user?.main_balance || 0).toLocaleString('id-ID')}\n\n` +
      `<b>Pilihan Metode Pembayaran:</b>\n` +
      `• QRIS Instant (Semua Bank & E-Wallet)\n` +
      `• Bank BCA: <code>883920192</code> a.n GROCKGOLD\n\n` +
      `<i>Minimal Deposit: Rp 50.000</i>`;

    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToMainKeyboard() });
    return;
  }

  if (data === 'menu_withdraw') {
    const text =
      `<b>💸 PENARIKAN DANA (WITHDRAWAL)</b>\n\n` +
      `💳 <b>Saldo Siap Tarik:</b> Rp ${Number(ctx.user?.main_balance || 0).toLocaleString('id-ID')}\n\n` +
      `📌 <b>Ketentuan:</b> Minimal Rp 100.000 | Biaya 0% | Waktu 5 - 30 Menit.\n` +
      `Buka Mini App untuk memilih rekening bank tujuan Anda.`;

    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToMainKeyboard() });
    return;
  }

  if (data === 'menu_mining' || data === 'claim_daily_reward' || data === 'menu_bonus' || data === 'menu_daily') {
    if (data === 'claim_daily_reward' && ctx.user) {
      const claimRes = await miningService.claimDailyReward(ctx.user.username);
      await ctx.reply(claimRes.message, {
        parse_mode: 'HTML',
        reply_markup: keyboards.getBackToMainKeyboard(),
      });
      return;
    }

    const text =
      `<b>⛏️ MINING & DAILY REWARD</b>\n\n` +
      `📦 <b>Kontrak Aktif:</b> ${ctx.user?.active_contracts || 0} Unit\n` +
      `💰 <b>Reward Harian Pending:</b> Rp ${Number(ctx.user?.pending_mining_reward || 0).toLocaleString('id-ID')}\n\n` +
      `Klik tombol di bawah ini untuk klaim reward hari ini:`;

    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: keyboards.getBackToMainKeyboard(),
    });
    return;
  }

  if (data === 'menu_referral') {
    const stats = await referralService.getReferralStats(ctx.user?.username || '');
    const text =
      `<b>👥 PROGRAM REFERRAL GROCKGOLD</b>\n\n` +
      `🏷️ <b>Kode Referral:</b> <code>${stats.referralCode}</code>\n` +
      `🔗 <b>Link:</b> <code>${stats.referralLink}</code>\n` +
      `👥 <b>Total Anggota:</b> ${stats.directReferralsCount} Member\n` +
      `🎁 <b>Total Bonus:</b> Rp ${stats.totalReferralBonus.toLocaleString('id-ID')}`;

    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToMainKeyboard() });
    return;
  }

  if (data === 'menu_history') {
    const txs = await walletService.getUserTransactions(ctx.user?.username || '', 5);
    let text = `<b>📜 RIWAYAT TRANSAKSI TERAKHIR</b>\n\n`;

    if (txs.length === 0) {
      text += `Belum ada riwayat transaksi.`;
    } else {
      text += txs
        .map(
          (t, i) =>
            `<b>${i + 1}. [${t.type.toUpperCase()}]</b> Rp ${Number(t.amount || 0).toLocaleString('id-ID')}\n` +
            `   Status: <b>${t.status.toUpperCase()}</b> | ${formatters.formatDateTime(t.created_at)}`
        )
        .join('\n\n');
    }

    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToMainKeyboard() });
    return;
  }

  if (data === 'menu_profile' || data === 'menu_settings') {
    const text =
      `<b>👤 PROFIL AKUN GROCKGOLD</b>\n\n` +
      `👤 <b>Username:</b> @${ctx.user?.username}\n` +
      `📛 <b>Nama:</b> ${ctx.user?.full_name || '-'}\n` +
      `📧 <b>Email:</b> ${ctx.user?.email || '-'}\n` +
      `📱 <b>Telegram Chat ID:</b> <code>${ctx.from?.id}</code>\n` +
      `🛡️ <b>Status Koneksi:</b> ✅ TERHUBUNG`;

    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToMainKeyboard() });
    return;
  }

  // Handle Admin Actions (STRICT SERVER VALIDATION)
  if (data.startsWith('admin_')) {
    if (!ctx.isAdmin) {
      await ctx.reply(
        `<b>⛔ AKSES DITOLAK (ACCESS DENIED)</b>\n\n` +
        `Maaf, tindakan ini hanya dapat dijalankan oleh Admin.`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    if (data === 'admin_panel') {
      await ctx.reply(
        `<b>👑 GROCKGOLD ADMIN CONTROL PANEL</b>\n\n` +
        `Silakan pilih menu manajemen sistem di bawah ini:`,
        { parse_mode: 'HTML', reply_markup: keyboards.getAdminPanelMenu() }
      );
      return;
    }

    if (data === 'admin_sys_stats') {
      const sys = await adminService.getSystemOverview();
      if (!sys) {
        await ctx.reply('⚠️ Gagal mengambil statistik sistem.');
        return;
      }

      const text =
        `<b>📊 SYSTEM OVERVIEW & REKAPITULASI</b>\n\n` +
        `👥 <b>Total Pengguna:</b> ${sys.totalUsers} Akun (${sys.adminCount} Admin, ${sys.memberCount} Member)\n` +
        `💰 <b>Total Saldo Sistem:</b> Rp ${sys.totalMainBalance.toLocaleString('id-ID')}\n` +
        `⛏️ <b>Total Kontrak Aktif:</b> ${sys.totalActiveContracts} Unit\n\n` +
        `💳 <b>Deposit Pending:</b> ${sys.pendingDeposits.length} Tx (Rp ${sys.pendingDepSum.toLocaleString('id-ID')})\n` +
        `💸 <b>Withdraw Pending:</b> ${sys.pendingWithdrawals.length} Tx (Rp ${sys.pendingWdSum.toLocaleString('id-ID')})\n\n` +
        `<i>⏰ Diperbarui: ${formatters.formatDateTime()}</i>`;

      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToAdminKeyboard() });
      return;
    }

    if (data === 'admin_pending_deposits') {
      const sys = await adminService.getSystemOverview();
      const pendingDeps = sys?.pendingDeposits || [];

      if (pendingDeps.length === 0) {
        await ctx.reply(`<b>💳 PENDING DEPOSITS</b>\n\n✅ Tidak ada pengajuan deposit tertunda.`, {
          parse_mode: 'HTML',
          reply_markup: keyboards.getBackToAdminKeyboard(),
        });
      } else {
        const text =
          `<b>💳 PENDING DEPOSITS (${pendingDeps.length} Transaksi)</b>\n\n` +
          pendingDeps.slice(0, 5).map((dep: any, i: number) =>
            `<b>${i + 1}. User:</b> @${dep.username}\n` +
            `   💰 Rp ${Number(dep.amount || 0).toLocaleString('id-ID')}\n` +
            `   🆔 <code>${dep.id}</code>\n`
          ).join('\n');

        await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToAdminKeyboard() });
      }
      return;
    }

    if (data === 'admin_pending_withdrawals') {
      const sys = await adminService.getSystemOverview();
      const pendingWds = sys?.pendingWithdrawals || [];

      if (pendingWds.length === 0) {
        await ctx.reply(`<b>💸 PENDING WITHDRAWALS</b>\n\n✅ Tidak ada pengajuan penarikan tertunda.`, {
          parse_mode: 'HTML',
          reply_markup: keyboards.getBackToAdminKeyboard(),
        });
      } else {
        const text =
          `<b>💸 PENDING WITHDRAWALS (${pendingWds.length} Transaksi)</b>\n\n` +
          pendingWds.slice(0, 5).map((wd: any, i: number) =>
            `<b>${i + 1}. User:</b> @${wd.username}\n` +
            `   💸 Rp ${Number(wd.amount || 0).toLocaleString('id-ID')}\n` +
            `   🆔 <code>${wd.id}</code>\n`
          ).join('\n');

        await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToAdminKeyboard() });
      }
      return;
    }

    if (data === 'admin_users_summary') {
      const sys = await adminService.getSystemOverview();
      const userList = sys?.userList || [];

      const text =
        `<b>👥 RINGKASAN AKUN USER (${userList.length} User)</b>\n\n` +
        userList.slice(0, 8).map((u: any, i: number) =>
          `<b>${i + 1}. @${u.username}</b> - Rp ${Number(u.main_balance || 0).toLocaleString('id-ID')} [${u.role === 'admin' ? '👑 Admin' : '👤 Member'}]`
        ).join('\n');

      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboards.getBackToAdminKeyboard() });
      return;
    }

    if (data === 'admin_broadcast_info') {
      await ctx.reply(
        `<b>📢 BROADCAST PESAN TELEGRAM</b>\n\n` +
        `Ketikkan pesan broadcast yang ingin dikirimkan ke seluruh pengguna terhubung via Telegram Bot API.`,
        { parse_mode: 'HTML', reply_markup: keyboards.getBackToAdminKeyboard() }
      );
      return;
    }
  }
}
