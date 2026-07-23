import { InlineKeyboard } from 'grammy';
import { config } from '../config/botConfig.js';

export const keyboards = {
  /**
   * Keyboard for Unlinked / Guest Users
   */
  getUnlinkedMenu: () => {
    return new InlineKeyboard()
      .text('📝 Register', 'cmd_register')
      .text('🔗 Link Existing Account', 'cmd_link')
      .row()
      .url('🌐 Visit Website', config.webAppUrl)
      .url('📞 Customer Support', 'https://t.me/grockgold_support');
  },

  /**
   * Dashboard Keyboard for Linked Member Users
   */
  getMemberDashboardMenu: () => {
    return new InlineKeyboard()
      .webApp('🚀 Open Mini App', config.webAppUrl)
      .row()
      .text('📊 Dashboard', 'menu_dashboard')
      .text('💰 Deposit', 'menu_deposit')
      .row()
      .text('💸 Withdraw', 'menu_withdraw')
      .text('⛏ Mining', 'menu_mining')
      .row()
      .text('👥 Referral', 'menu_referral')
      .text('🎁 Bonus', 'menu_bonus')
      .row()
      .text('📜 History', 'menu_history')
      .text('👤 Profile', 'menu_profile')
      .row()
      .text('⚙ Settings', 'menu_settings')
      .url('📞 Support', 'https://t.me/grockgold_support');
  },

  /**
   * Dashboard Keyboard for Admin Users
   */
  getAdminDashboardMenu: () => {
    return new InlineKeyboard()
      .text('👑 Admin Control Panel', 'admin_panel')
      .webApp('🚀 Open Mini App', config.webAppUrl)
      .row()
      .text('📊 Dashboard', 'menu_dashboard')
      .text('💰 Deposit', 'menu_deposit')
      .row()
      .text('💸 Withdraw', 'menu_withdraw')
      .text('⛏ Mining', 'menu_mining')
      .row()
      .text('👥 Referral', 'menu_referral')
      .text('🎁 Bonus', 'menu_bonus')
      .row()
      .text('📜 History', 'menu_history')
      .text('👤 Profile', 'menu_profile')
      .row()
      .text('⚙ Settings', 'menu_settings')
      .url('📞 Support', 'https://t.me/grockgold_support');
  },

  /**
   * Admin Control Panel Keyboard
   */
  getAdminPanelMenu: () => {
    return new InlineKeyboard()
      .text('📊 System Stats', 'admin_sys_stats')
      .text('👥 User Overview', 'admin_users_summary')
      .row()
      .text('💳 Deposit Pending', 'admin_pending_deposits')
      .text('💸 Withdraw Pending', 'admin_pending_withdrawals')
      .row()
      .text('📢 Broadcast Message', 'admin_broadcast_info')
      .row()
      .text('⬅️ Kembali ke Menu Utama', 'menu_main');
  },

  /**
   * Back to Main Menu Button
   */
  getBackToMainKeyboard: () => {
    return new InlineKeyboard().text('⬅️ Kembali ke Menu Utama', 'menu_main');
  },

  /**
   * Back to Admin Panel Button
   */
  getBackToAdminKeyboard: () => {
    return new InlineKeyboard().text('⬅️ Kembali ke Admin Control Panel', 'admin_panel');
  },
};
