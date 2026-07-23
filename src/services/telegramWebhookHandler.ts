import crypto from 'crypto';

// Rate Limiter Memory Cache
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Telegram Mini App initData Verification
export function verifyTelegramInitData(initData: string, botToken: string): boolean {
  try {
    if (!initData || !botToken) return false;

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    urlParams.delete('hash');
    const params: string[] = [];
    for (const [key, value] of urlParams.entries()) {
      params.push(`${key}=${value}`);
    }
    params.sort();
    const dataCheckString = params.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
  } catch (err) {
    console.error('Error verifying initData:', err);
    return false;
  }
}

// Helper to call Telegram Bot API
export async function callTelegramApi(method: string, payload: any, botToken?: string) {
  const token = botToken || process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('[TELEGRAM API ERROR] TELEGRAM_BOT_TOKEN / BOT_TOKEN is missing in environment variables.');
    throw new Error('TELEGRAM_BOT_TOKEN / BOT_TOKEN is missing in environment variables.');
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!json.ok) {
    console.warn(`[TELEGRAM API WARN] ${method} failed for chat ${payload.chat_id || 'N/A'}:`, json.description || json);
  } else {
    console.log(`[TELEGRAM API SUCCESS] ${method} successfully delivered to chat ${payload.chat_id || 'N/A'}`);
  }
  return json;
}

// Supabase REST Helper
async function querySupabase(path: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[SUPABASE WARN] Configuration missing (SUPABASE_URL / VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
      return null;
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      method: options.method || 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[SUPABASE ERROR] Query failed for ${path}:`, errText);
      return null;
    }

    try {
      return await res.json();
    } catch {
      return true;
    }
  } catch (err: any) {
    console.error(`[SUPABASE FETCH EXCEPTION] Path: ${path}:`, err?.message || String(err));
    return null;
  }
}

// Fetch linked GrockGold user by Telegram User ID
async function findUserByTelegramId(telegramUserId: number | string) {
  const idStr = String(telegramUserId);
  const data = await querySupabase(`users?or=(telegram_user_id.eq.${idStr},telegram_id.eq.${idStr})&select=*`);
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  return null;
}

// Format Dashboard Summary for Linked User
function formatDashboardMessage(user: any, tgUser: any) {
  const name = user.full_name || user.username || tgUser.first_name || 'Miner';
  const username = user.username ? `@${user.username}` : '-';
  const balance = Number(user.balance || 0).toLocaleString('id-ID');
  const usdBalance = (Number(user.balance || 0) / 15800).toFixed(2);
  const activeContracts = Array.isArray(user.contracts) 
    ? user.contracts.filter((c: any) => c.status === 'active' || c.status === 'Running').length 
    : (user.active_contracts || 0);
  const isMining = activeContracts > 0 || user.is_mining;
  const miningStatus = isMining ? '🟢 MENGHASILKAN (ACTIVE)' : '🔴 NON-AKTIF';
  const referralsCount = Number(user.referrals_count || user.total_referrals || 0);

  return `
<b>🚀 GROCKGOLD MINING DASHBOARD</b>
<i>Selamat Datang kembali, <b>${name}</b> (${username})!</i>

<b>👤 STATUS AKUN & TELEGRAM BINDING</b>
• Telegram ID: <code>${tgUser.id}</code>
• Status Link: 🟢 Terhubung (Verified)
• Level Akun: VIP Gold Tier

<b>💰 SALDO & SKOR SAYA</b>
• Saldo Utama: <b>Rp ${balance}</b> (~$${usdBalance} USD)
• Total Pendapatan: <b>Rp ${Number(user.total_earnings || 0).toLocaleString('id-ID')}</b>

<b>⚡ RINGKASAN MINING RIG</b>
• Status Mesin: <b>${miningStatus}</b>
• Kontrak Aktif: <b>${activeContracts} Mesin</b>
• Total Rujukan: <b>${referralsCount} Orang</b>

<i>Klik tombol di bawah untuk membuka GrockGold Mini App secara langsung tanpa login!</i>
`.trim();
}

// Format Welcome Message for Unlinked User
function formatUnlinkedWelcomeMessage(tgUser: any) {
  return `
<b>👋 SELAMAT DATANG DI GROCKGOLD OFFICIAL BOT</b>

Halo <b>${tgUser.first_name || 'Penambang'}</b> (@${tgUser.username || 'user'})!
ID Telegram Anda: <code>${tgUser.id}</code>

Akun Telegram Anda saat ini <b>belum terhubung</b> dengan akun Web GrockGold Mining.

<b> HUBUNGKAN AKUN UNTUK MEMBUKA FITUR:</b>
1. Auto-login instant ke GrockGold Mini App tanpa password
2. Notifikasi real-time deposit, penarikan & hasil tambang
3. Keamanan ganda dan verifikasi transaksi otomatis

<b> HUBUNGKAN SEKARANG:</b>
• Dapatkan <b>Kode Verifikasi 6-Digit</b> dari menu <i>Pengaturan</i> di Web GrockGold.
• Lalu ketik di chat ini: <code>/link &lt;KODE_6_DIGIT&gt;</code>
• Atau tekan tombol <b>🔗 Hubungkan Akun</b> di bawah.
`.trim();
}

// Keyboard markup for linked user
function getLinkedKeyboard() {
  const webappUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.APP_URL || 'https://grokgold.vercel.app';
  return {
    inline_keyboard: [
      [
        { text: '🚀 Buka GrockGold Mini App', web_app: { url: webappUrl } }
      ],
      [
        { text: '🔄 Refresh Dashboard', callback_data: 'refresh_dashboard' },
        { text: '⚡ Status Mining', callback_data: 'check_mining' }
      ],
      [
        { text: '🌐 Website Resmi', url: webappUrl },
        { text: '📞 Customer Support', url: 'https://t.me/grockgold_support' }
      ]
    ]
  };
}

// Keyboard markup for unlinked user
function getUnlinkedKeyboard() {
  const webappUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.APP_URL || 'https://grokgold.vercel.app';
  return {
    inline_keyboard: [
      [
        { text: '📝 Daftar Akun Baru', web_app: { url: `${webappUrl}?register=true` } },
        { text: '🔗 Hubungkan Akun', callback_data: 'link_account' }
      ],
      [
        { text: '🌐 Buka Website', url: webappUrl },
        { text: '📞 Customer Support', url: 'https://t.me/grockgold_support' }
      ]
    ]
  };
}

// Verify and execute Account Linking via 6-digit code or username
export async function executeLinkAccount(codeOrUsername: string, tgUser: any) {
  const cleanCode = String(codeOrUsername).trim().replace(/^@/, '');
  if (!cleanCode) {
    return { success: false, message: '❌ Kode verifikasi atau username tidak boleh kosong.' };
  }

  // 1. Check code in linking_codes table
  const codeList = await querySupabase(`telegram_linking_codes?code=eq.${encodeURIComponent(cleanCode)}&select=*`);
  let targetUsername = '';

  if (Array.isArray(codeList) && codeList.length > 0 && new Date(codeList[0].expires_at) > new Date()) {
    targetUsername = codeList[0].username;
  } else {
    targetUsername = cleanCode;
  }

  // 2. Fetch target user by username
  const userList = await querySupabase(`users?username=ilike.${encodeURIComponent(targetUsername)}&select=*`);
  if (!Array.isArray(userList) || userList.length === 0) {
    return {
      success: false,
      message: `❌ Kode verifikasi <b>${cleanCode}</b> atau username tidak ditemukan.\n\nSilakan buat kode verifikasi baru di menu <i>Pengaturan</i> Web GrockGold.`
    };
  }

  const targetUser = userList[0];
  const now = new Date().toISOString();
  const updatedSettings = {
    ...(targetUser.settings || {}),
    telegramId: String(tgUser.id)
  };

  // 3. Update user record with Telegram identity
  await querySupabase(`users?username=eq.${encodeURIComponent(targetUser.username)}`, {
    method: 'PATCH',
    body: {
      telegram_user_id: tgUser.id,
      telegram_id: String(tgUser.id),
      telegram_username: tgUser.username || '',
      telegram_first_name: tgUser.first_name || '',
      telegram_last_name: tgUser.last_name || '',
      telegram_linked_at: now,
      settings: updatedSettings
    }
  });

  // 4. Delete used linking code
  await querySupabase(`telegram_linking_codes?code=eq.${encodeURIComponent(cleanCode)}`, {
    method: 'DELETE'
  });

  return {
    success: true,
    user: targetUser,
    message: `🎉 <b>SELAMAT! AKUN BERHASIL TERHUBUNG!</b>\n\nAkun GrockGold <b>@${targetUser.username}</b> telah resmi terhubung dengan Telegram ID <code>${tgUser.id}</code>!`
  };
}

// Main Telegram Webhook Processing Function
export async function processTelegramWebhook(update: any) {
  if (!update) return { status: 'skipped', reason: 'Empty update payload' };

  const updateId = update.update_id || 'N/A';
  const eventType = update.message ? 'message' : update.callback_query ? 'callback_query' : update.edited_message ? 'edited_message' : 'other';
  const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id || update.edited_message?.chat?.id || 'N/A';
  const username = update.message?.from?.username || update.callback_query?.from?.username || update.edited_message?.from?.username || 'N/A';
  const textOrData = update.message?.text || update.callback_query?.data || '';

  console.log(`[TELEGRAM WEBHOOK INCOMING] Update ID: ${updateId} | Event: ${eventType} | Chat ID: ${chatId} | Username: @${username} | Content: "${textOrData}"`);

  try {
    // 1. Handle Incoming Text Messages (Commands / Commands with args / Direct code input)
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const tgUser = msg.from;
      const text = (msg.text || '').trim();

      if (!chatId || !tgUser) return { status: 'skipped', reason: 'Missing chat or user info' };

      // Rate limit check
      if (!checkRateLimit(`chat_${chatId}`)) {
        await callTelegramApi('sendMessage', {
          chat_id: chatId,
          text: '⚠️ <b>Batas Kuota Pesan Terlampaui.</b> Mohon tunggu 1 menit sebelum mencoba kembali.',
          parse_mode: 'HTML'
        });
        return { status: 'rate_limited' };
      }

      // Command: /start or /start <code>
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const startParam = parts[1];

        // If /start includes linking code parameter (e.g. /start 123456)
        if (startParam && /^\d{6}$/.test(startParam)) {
          const linkRes = await executeLinkAccount(startParam, tgUser);
          if (linkRes.success && linkRes.user) {
            const updatedUser = await findUserByTelegramId(tgUser.id);
            await callTelegramApi('sendMessage', {
              chat_id: chatId,
              text: `${linkRes.message}\n\n${formatDashboardMessage(updatedUser || linkRes.user, tgUser)}`,
              parse_mode: 'HTML',
              reply_markup: getLinkedKeyboard()
            });
            return { status: 'linked_via_start_param' };
          }
        }

        // Standard /start check
        const user = await findUserByTelegramId(tgUser.id);
        if (user) {
          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: formatDashboardMessage(user, tgUser),
            parse_mode: 'HTML',
            reply_markup: getLinkedKeyboard()
          });
        } else {
          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: formatUnlinkedWelcomeMessage(tgUser),
            parse_mode: 'HTML',
            reply_markup: getUnlinkedKeyboard()
          });
        }
        return { status: 'processed_start' };
      }

      // Command: /help
      if (text.startsWith('/help')) {
        const helpText = `
<b>📖 PANDUAN PENGGUNAAN GROCKGOLD TELEGRAM BOT</b>

<b>1. CARA MENGHUBUNGKAN AKUN:</b>
• Buka website <a href="${process.env.TELEGRAM_WEBAPP_URL || 'https://grokgold.vercel.app'}">GrockGold Mining</a>
• Masuk ke menu <b>Settings (Pengaturan)</b>
• Klik tombol <b>Buat Kode Verifikasi Bot</b> untuk mendapatkan 6-digit kode
• Masukkan kode di chat bot ini dengan format:
  <code>/link &lt;KODE_6_DIGIT&gt;</code>

<b>2. FITUR TELEGRAM MINI APP:</b>
• Setelah terhubung, klik tombol <b>🚀 Buka GrockGold Mini App</b> untuk masuk tanpa memasukkan password!

<b>3. BANTUAN & DUKUNGAN:</b>
• Hubungi Layanan Pelanggan: @grockgold_support
`.trim();

        await callTelegramApi('sendMessage', {
          chat_id: chatId,
          text: helpText,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{ text: '📞 Hubungi CS', url: 'https://t.me/grockgold_support' }]
            ]
          }
        });
        return { status: 'processed_help' };
      }

      // Command: /link <code>
      if (text.startsWith('/link')) {
        const codeInput = text.replace('/link', '').trim();
        if (!codeInput) {
          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: '⚠️ Format salah. Gunakan: <code>/link &lt;KODE_VERIFIKASI_6_DIGIT&gt;</code>\nContoh: <code>/link 847291</code>',
            parse_mode: 'HTML'
          });
          return { status: 'invalid_link_format' };
        }

        const linkRes = await executeLinkAccount(codeInput, tgUser);
        if (linkRes.success && linkRes.user) {
          const updatedUser = await findUserByTelegramId(tgUser.id);
          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: `${linkRes.message}\n\n${formatDashboardMessage(updatedUser || linkRes.user, tgUser)}`,
            parse_mode: 'HTML',
            reply_markup: getLinkedKeyboard()
          });
        } else {
          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: linkRes.message,
            parse_mode: 'HTML',
            reply_markup: getUnlinkedKeyboard()
          });
        }
        return { status: 'processed_link' };
      }

      // Handle raw 6-digit numeric input directly (Convenience linking)
      if (/^\d{6}$/.test(text)) {
        const linkRes = await executeLinkAccount(text, tgUser);
        if (linkRes.success && linkRes.user) {
          const updatedUser = await findUserByTelegramId(tgUser.id);
          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: `${linkRes.message}\n\n${formatDashboardMessage(updatedUser || linkRes.user, tgUser)}`,
            parse_mode: 'HTML',
            reply_markup: getLinkedKeyboard()
          });
        } else {
          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: linkRes.message,
            parse_mode: 'HTML',
            reply_markup: getUnlinkedKeyboard()
          });
        }
        return { status: 'processed_direct_code' };
      }

      // Fallback response for unhandled text
      const user = await findUserByTelegramId(tgUser.id);
      if (user) {
        await callTelegramApi('sendMessage', {
          chat_id: chatId,
          text: formatDashboardMessage(user, tgUser),
          parse_mode: 'HTML',
          reply_markup: getLinkedKeyboard()
        });
      } else {
        await callTelegramApi('sendMessage', {
          chat_id: chatId,
          text: formatUnlinkedWelcomeMessage(tgUser),
          parse_mode: 'HTML',
          reply_markup: getUnlinkedKeyboard()
        });
      }
      return { status: 'processed_fallback' };
    }

    // 2. Handle Callback Queries (Inline button clicks)
    if (update.callback_query) {
      const cb = update.callback_query;
      const callbackId = cb.id;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const tgUser = cb.from;
      const data = cb.data;

      if (!chatId || !tgUser) return { status: 'skipped', reason: 'Missing callback parameters' };

      // Always answer callback query to release Telegram client spinner
      await callTelegramApi('answerCallbackQuery', { callback_query_id: callbackId });

      const user = await findUserByTelegramId(tgUser.id);

      if (data === 'refresh_dashboard') {
        if (user) {
          await callTelegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: formatDashboardMessage(user, tgUser),
            parse_mode: 'HTML',
            reply_markup: getLinkedKeyboard()
          });
        } else {
          await callTelegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: formatUnlinkedWelcomeMessage(tgUser),
            parse_mode: 'HTML',
            reply_markup: getUnlinkedKeyboard()
          });
        }
        return { status: 'processed_cb_refresh' };
      }

      if (data === 'link_account') {
        const linkPrompt = `
<b>🔗 CARA MENGHUBUNGKAN AKUN GROCKGOLD</b>

1. Buka Web Dashboard GrockGold: <a href="${process.env.TELEGRAM_WEBAPP_URL || 'https://grokgold.vercel.app'}">grokgold.vercel.app</a>
2. Pilih menu <b>Settings</b>
3. Klik tombol <b>Buat Kode Verifikasi Bot</b>
4. Balas chat ini dengan mengetik 6-digit kode tersebut, atau gunakan format:
   <code>/link &lt;KODE_6_DIGIT&gt;</code>
`.trim();

        await callTelegramApi('sendMessage', {
          chat_id: chatId,
          text: linkPrompt,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        });
        return { status: 'processed_cb_link' };
      }

      if (data === 'check_mining') {
        if (user) {
          const activeContracts = Array.isArray(user.contracts)
            ? user.contracts.filter((c: any) => c.status === 'active' || c.status === 'Running')
            : [];
          
          let miningMsg = `<b>⚡ STATUS MESIN TAMBANG (RIG)</b>\n\n`;
          if (activeContracts.length === 0) {
            miningMsg += `<i>Saat ini Anda tidak memiliki kontrak mesin tambang yang aktif.</i>\n\nSilakan sewa Rig tambang melalui Mini App untuk mulai menghasilkan keuntungan harian!`;
          } else {
            miningMsg += `<b>Total Rig Aktif: ${activeContracts.length} Mesin</b>\n\n`;
            activeContracts.forEach((c: any, idx: number) => {
              miningMsg += `<b>${idx + 1}. ${c.plan_name || 'Rig Miner'}</b>\n`;
              miningMsg += `   • Kecepatan: ${c.hashrate || '100 MH/s'}\n`;
              miningMsg += `   • Estimasi Harian: Rp ${Number(c.daily_return || 0).toLocaleString('id-ID')}\n\n`;
            });
          }

          await callTelegramApi('sendMessage', {
            chat_id: chatId,
            text: miningMsg,
            parse_mode: 'HTML',
            reply_markup: getLinkedKeyboard()
          });
        }
        return { status: 'processed_cb_mining' };
      }
    }

    return { status: 'unhandled_update' };
  } catch (err: any) {
    console.error('Fatal error in processTelegramWebhook:', err);
    return { status: 'error', error: err.message || String(err) };
  }
}
