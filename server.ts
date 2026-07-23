import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { processTelegramWebhook } from "./src/services/telegramWebhookHandler";
import { registerTelegramWebhook, removeTelegramWebhook } from "./src/services/telegramWebhookRegister";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Simple server-side scrapper
async function scrapeUrl(urlStr: string): Promise<{ text: string; title: string }> {
  try {
    let formattedUrl = urlStr.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Clean body content
    let bodyText = html;
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bodyText = bodyMatch[1];
    }

    let text = bodyText
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: text.substring(0, 15000), // Max 15k characters for efficiency
      title
    };
  } catch (error: any) {
    console.error("Error scraping:", error.message || error);
    throw error;
  }
}

// 1. Analyze Website Endpoint
app.post("/api/grok/analyze", async (req, res) => {
  try {
    const { url, rawContent, focusArea } = req.body;

    if (!ai) {
      return res.status(500).json({ 
        error: "Gemini API Key is not configured in the backend environment. Please set it in Settings > Secrets." 
      });
    }

    let scrapedText = "";
    let scrapedTitle = "";
    let scrapeStatus: "scraped" | "grounding_only" | "manual" = "grounding_only";

    if (rawContent && rawContent.trim().length > 0) {
      scrapedText = rawContent.trim().substring(0, 15000);
      scrapeStatus = "manual";
    } else if (url && url.trim().length > 0) {
      try {
        const scrapeResult = await scrapeUrl(url);
        scrapedText = scrapeResult.text;
        scrapedTitle = scrapeResult.title;
        scrapeStatus = "scraped";
      } catch (err) {
        console.warn("Direct scraping failed, falling back to Google Search grounding.");
        scrapeStatus = "grounding_only";
      }
    } else {
      return res.status(400).json({ error: "Please provide either a URL or raw website content." });
    }

    // Build instruction prompt
    let prompt = `You are Website Grok Gold, an elite web auditor and business intelligence agent. Your job is to deeply analyze a website and extract high-value "gold" insights.
    
    Analyze the following website context:
    URL: ${url || "Manual input"}
    Page Title: ${scrapedTitle || "N/A"}
    Focus Area: ${focusArea || "General Comprehensive Audit"}
    Scrape Method: ${scrapeStatus}
    
    ${scrapedText ? `Direct Website Text Extracted:\n"""\n${scrapedText}\n"""` : `Scraping directly failed or was not possible. Please use Google Search grounding tool to research and look up "${url}" to understand its core design, offerings, landing page copy, value prop, audience, pricing model, and technical profile.`}
    
    Identify valuable, non-obvious strategies this business uses, or major flaws, SEO content gaps, and growth opportunities. 
    Be objective, highly intellectual, and write like an expert.
    
    You must output a single, strictly valid JSON response that matches the schema provided. Do not include markdown wraps like \`\`\`json, just the pure JSON.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        siteName: { type: Type.STRING, description: "Name of the website or business." },
        tagline: { type: Type.STRING, description: "A punchy description or official tagline of the company." },
        overview: { type: Type.STRING, description: "A high-quality 2-3 sentence strategic summary of what this website/business is and why it exists." },
        scores: {
          type: Type.OBJECT,
          properties: {
            valueProp: { type: Type.INTEGER, description: "Score from 0 to 100 on clarity and strength of value proposition." },
            seo: { type: Type.INTEGER, description: "Score from 0 to 100 on SEO standards, headings, search visibility factors." },
            monetization: { type: Type.INTEGER, description: "Score from 0 to 100 on business model efficiency, monetization, or pricing clarity." },
            conversion: { type: Type.INTEGER, description: "Score from 0 to 100 on copywriting strength and conversion optimization." },
            ux: { type: Type.INTEGER, description: "Score from 0 to 100 on user experience, clarity, layout, and visual vibe." },
          },
          required: ["valueProp", "seo", "monetization", "conversion", "ux"]
        },
        goldNuggets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Fascinating, actionable insight name." },
              description: { type: Type.STRING, description: "Deep explanation of the strategy or finding and why it works." },
              type: { type: Type.STRING, description: "Must be one of: Copywriting, Conversion, Monetization, UX, Growth" }
            },
            required: ["title", "description", "type"]
          },
          description: "4-6 premium actionable takeaways or strategic 'gold nuggets' discovered about the landing page/service."
        },
        audience: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING, description: "Primary target buyer profile (e.g., 'SaaS Indie Hackers', 'Enterprise CTOs')." },
            pains: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core user pain points this site attempts to solve." },
            triggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Triggers that compel them to pay/subscribe on this site." },
          },
          required: ["persona", "pains", "triggers"]
        },
        pricingModel: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING, description: "Business model (e.g., 'SaaS Tiered', 'One-time Premium', 'Free-to-Play', 'Ad-funded')." },
            estimate: { type: Type.STRING, description: "Estimates or actual prices parsed (e.g., '$29 - $149/mo' or 'Unknown / Enterprise Quote')." },
            upsellTricks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Upselling tactics or psychological triggers detected (e.g. annual discount, highlight most popular tier)." }
          },
          required: ["strategy", "estimate", "upsellTricks"]
        },
        techStack: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "e.g., Frontend, Styles, Hosting, Analytics, Marketing" },
              name: { type: Type.STRING, description: "Specific tech name (e.g., React, Next.js, Tailwind CSS, Stripe, Google Analytics)." },
            },
            required: ["category", "name"]
          },
          description: "Detected or highly probable developer stack."
        },
        contentGaps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Where the site is failing or missing key materials." },
              description: { type: Type.STRING, description: "Detailed strategy on how they can build this content to win." },
              impact: { type: Type.STRING, description: "High, Medium, Low" }
            },
            required: ["title", "description", "impact"]
          },
          description: "Competitive gaps or opportunities to outrank or beat them."
        },
        designEvaluation: {
          type: Type.OBJECT,
          properties: {
            colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dominant or signature hex colors/palettes." },
            vibe: { type: Type.STRING, description: "Visual mood (e.g., Minimal Swiss, Brutalist Tech, Soft Pastel Warm)." },
            hierarchyFeedback: { type: Type.STRING, description: "Verdict on design layout and content hierarchy." }
          },
          required: ["colors", "vibe", "hierarchyFeedback"]
        }
      },
      required: [
        "siteName", "tagline", "overview", "scores", "goldNuggets", "audience", 
        "pricingModel", "techStack", "contentGaps", "designEvaluation"
      ]
    };

    const isGroundingNeeded = (scrapeStatus === "grounding_only");
    const toolsConfig = isGroundingNeeded ? [{ googleSearch: {} }] : [];

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        tools: toolsConfig as any,
        temperature: 0.2,
      }
    });

    const outputText = result.text;
    if (!outputText) {
      throw new Error("No response received from Gemini.");
    }

    const grokData = JSON.parse(outputText.trim());
    
    // Enrich with metadata
    res.json({
      ...grokData,
      meta: {
        url,
        scraped: scrapeStatus === "scraped",
        groundingUsed: isGroundingNeeded,
        scrapedLength: scrapedText.length,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("Grok error:", error);
    res.status(500).json({ 
      error: "Failed to Grok the website: " + (error.message || error.toString()) 
    });
  }
});

// 2. Chat with Grokked Website Endpoint
app.post("/api/grok/chat", async (req, res) => {
  try {
    const { message, history, grokContext } = req.body;

    if (!ai) {
      return res.status(500).json({ 
        error: "Gemini API Key is not configured in the backend environment." 
      });
    }

    if (!message) {
      return res.status(400).json({ error: "Missing message parameter." });
    }

    // Build conversational context
    const contextStr = JSON.stringify(grokContext);

    const systemInstruction = `You are Website Grok Gold, the elite AI website strategist. You have deeply grokked this website:
    ${contextStr}
    
    Answer the user's questions about this website, its business model, layout, copy, audience, conversion, stack, and SEO strategy.
    
    Guidelines:
    1. Be highly professional, strategic, and practical. Offer tactical suggestions.
    2. Give concrete examples (e.g. if writing headline copy, write 3 powerful headline variations).
    3. Be formatted in beautiful, readable Markdown. Keep explanations concise but high-density.
    4. If asked to write code, provide fully written, responsive, and styled modern components or clean code.
    5. Always speak in your gold-expert strategist persona.`;

    // Map history to Gemini format
    const formattedContents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        formattedContents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
    }
    
    // Add current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: result.text });

  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate chat response: " + (error.message || error.toString()) });
  }
});

// 2. Real-time Server Time Endpoint
app.get("/api/time", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ serverTime: Date.now() });
});

// 3. Telegram Bot Integration Endpoints
// Check if Telegram Bot Token is configured & fetch bot details
app.get("/api/telegram/bot-info", async (req, res) => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return res.json({
        configured: true,
        bot: {
          id: 0,
          username: "trading_sinyal_pro_bot",
          firstName: "GROCKGOLD Bot Resmi",
        }
      });
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();

    if (data.ok && data.result) {
      return res.json({
        configured: true,
        bot: {
          id: data.result.id,
          username: data.result.username || "trading_sinyal_pro_bot",
          firstName: data.result.first_name || "GROCKGOLD Bot Resmi",
        }
      });
    } else {
      return res.json({
        configured: true,
        bot: {
          id: 0,
          username: "trading_sinyal_pro_bot",
          firstName: "GROCKGOLD Bot Resmi",
        }
      });
    }
  } catch (error: any) {
    console.error("Error checking Telegram bot info:", error);
    res.json({
      configured: true,
      bot: {
        id: 0,
        username: "trading_sinyal_pro_bot",
        firstName: "GROCKGOLD Bot Resmi",
      }
    });
  }
});

// Helper to query user in Supabase by telegram_id or settings->>telegramId
async function getUserByTelegramChatId(chatId: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || !chatId) return null;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const users = await res.json();
    if (!Array.isArray(users)) return null;

    const user = users.find((u: any) => 
      String(u.telegram_id || '').trim() === String(chatId).trim() || 
      String(u.settings?.telegramId || '').trim() === String(chatId).trim()
    );

    return user || null;
  } catch (err) {
    console.error("Error in getUserByTelegramChatId:", err);
    return null;
  }
}

// Helper to update user fields in Supabase
async function updateUserInSupabase(username: string, payload: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || !username) return false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(username)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error("Error in updateUserInSupabase:", err);
    return false;
  }
}

// Helper to insert transaction log in Supabase
async function insertTransactionInSupabase(txPayload: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(txPayload)
    });
    return res.ok;
  } catch (err) {
    console.error("Error in insertTransactionInSupabase:", err);
    return false;
  }
}

// Helper to fetch all users from Supabase for Admin Overview
async function getAdminSystemDataFromSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return { users: [], transactions: [] };

  try {
    const [usersRes, txRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      }),
      fetch(`${supabaseUrl}/rest/v1/transactions?select=*&order=created_at.desc`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      })
    ]);

    const users = (await usersRes.json()) || [];
    const transactions = (await txRes.json()) || [];

    return {
      users: Array.isArray(users) ? users : [],
      transactions: Array.isArray(transactions) ? transactions : []
    };
  } catch (err) {
    console.error("Error in getAdminSystemDataFromSupabase:", err);
    return { users: [], transactions: [] };
  }
}

// Helper to update transaction in Supabase
async function updateTransactionInSupabase(txId: string, payload: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || !txId) return false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/transactions?id=eq.${encodeURIComponent(txId)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error("Error in updateTransactionInSupabase:", err);
    return false;
  }
}

// Telegram Inline Keyboard & Submenu Response Generator
async function processTelegramMenuRequest(chatId: string, callbackData?: string, commandText?: string) {
  const user = await getUserByTelegramChatId(chatId);

  if (!user) {
    const notConnectedText = 
      `<b>🛡️ GROCKGOLD BOT</b>\n\n` +
      `⚠️ <b>AKUN BELUM TERHUBUNG</b>\n\n` +
      `Telegram Chat ID Anda (<code>${chatId}</code>) belum terhubung dengan akun GROCKGOLD.\n\n` +
      `<b>Cara Menghubungkan:</b>\n` +
      `1. Login ke aplikasi/web <b>GROCKGOLD</b>\n` +
      `2. Buka menu <b>Pengaturan (Settings)</b>\n` +
      `3. Masukkan Chat ID: <code>${chatId}</code>\n` +
      `4. Klik <b>Simpan & Hubungkan</b>`;

    const NOT_CONNECTED_KEYBOARD = {
      inline_keyboard: [
        [
          { text: "🔄 Cek Status Koneksi", callback_data: "menu_main" }
        ]
      ]
    };

    return { text: notConnectedText, reply_markup: NOT_CONNECTED_KEYBOARD, connected: false };
  }

  // Server-side Role Check
  const isAdmin = (user.role === 'admin' || String(user.username || '').toLowerCase() === 'admin');

  // Keyboards Definition
  const MEMBER_MAIN_MENU_KEYBOARD = {
    inline_keyboard: [
      [
        { text: "💰 Wallet", callback_data: "menu_wallet" },
        { text: "🎁 Daily Reward", callback_data: "menu_daily" }
      ],
      [
        { text: "💳 Deposit", callback_data: "menu_deposit" },
        { text: "💸 Withdraw", callback_data: "menu_withdraw" }
      ],
      [
        { text: "📊 Statistik", callback_data: "menu_stats" },
        { text: "🔔 Notifikasi", callback_data: "menu_notifications" }
      ],
      [
        { text: "⚙️ Pengaturan", callback_data: "menu_settings" }
      ]
    ]
  };

  const ADMIN_MAIN_MENU_KEYBOARD = {
    inline_keyboard: [
      [
        { text: "👑 Admin Control Panel", callback_data: "admin_panel" }
      ],
      [
        { text: "💰 Wallet", callback_data: "menu_wallet" },
        { text: "🎁 Daily Reward", callback_data: "menu_daily" }
      ],
      [
        { text: "💳 Deposit", callback_data: "menu_deposit" },
        { text: "💸 Withdraw", callback_data: "menu_withdraw" }
      ],
      [
        { text: "📊 Statistik", callback_data: "menu_stats" },
        { text: "🔔 Notifikasi", callback_data: "menu_notifications" }
      ],
      [
        { text: "⚙️ Pengaturan", callback_data: "menu_settings" }
      ]
    ]
  };

  const MAIN_MENU_KEYBOARD = isAdmin ? ADMIN_MAIN_MENU_KEYBOARD : MEMBER_MAIN_MENU_KEYBOARD;

  const BACK_TO_MAIN_KEYBOARD = {
    inline_keyboard: [
      [
        { text: "⬅️ Kembali ke Menu Utama", callback_data: "menu_main" }
      ]
    ]
  };

  const BACK_TO_ADMIN_PANEL_KEYBOARD = {
    inline_keyboard: [
      [
        { text: "⬅️ Kembali ke Admin Control Panel", callback_data: "admin_panel" }
      ]
    ]
  };

  const action = callbackData || (commandText?.toLowerCase().startsWith('/admin') ? 'admin_panel' : 'menu_main');

  // STRICT SERVER-SIDE VALIDATION FOR ADMIN ACTIONS
  const isAdminAction = action.startsWith('admin_') || commandText?.toLowerCase().startsWith('/admin');
  if (isAdminAction && !isAdmin) {
    const accessDeniedText =
      `<b>⛔ AKSES DITOLAK (ACCESS DENIED)</b>\n\n` +
      `Maaf @${user.username}, akun Anda terdaftar sebagai <b>Member Regular</b>.\n\n` +
      `Fitur <b>Admin Control Panel</b> dan perintah admin Telegram hanya dapat diakses oleh akun dengan role <b>Admin</b>.\n\n` +
      `<i>Tindakan ini telah diverifikasi dan ditolak oleh server GROCKGOLD.</i>`;

    return { text: accessDeniedText, reply_markup: MEMBER_MAIN_MENU_KEYBOARD, connected: true };
  }

  let responseText = "";
  let replyMarkup = BACK_TO_MAIN_KEYBOARD;

  switch (action) {
    case 'menu_main': {
      responseText =
        `<b>🛡️ GROCKGOLD BOT</b>\n\n` +
        `Selamat datang kembali, <b>${user.full_name || '@' + user.username}</b>!\n\n` +
        `📌 <b>Status Akun:</b> Terhubung (@${user.username}) [${isAdmin ? '👑 ADMIN' : '👤 MEMBER'}]\n` +
        `💳 <b>Saldo Utama:</b> Rp ${Number(user.main_balance || 0).toLocaleString('id-ID')}\n` +
        `⛏️ <b>Kontrak Tambang:</b> ${user.active_contracts || 0} Unit Aktif\n\n` +
        `Silakan pilih menu transaksi & fitur di bawah ini:`;
      replyMarkup = MAIN_MENU_KEYBOARD;
      break;
    }

    case 'menu_wallet': {
      responseText =
        `<b>💰 WALLET & SALDO GROCKGOLD</b>\n\n` +
        `👤 <b>Username:</b> @${user.username}\n` +
        `📛 <b>Nama:</b> ${user.full_name || '-'}\n` +
        `🔰 <b>Role:</b> ${isAdmin ? '👑 Admin System' : '👤 Member'}\n\n` +
        `💳 <b>Saldo Utama:</b> Rp ${Number(user.main_balance || 0).toLocaleString('id-ID')}\n` +
        `⛏️ <b>Pending Reward:</b> Rp ${Number(user.pending_mining_reward || 0).toLocaleString('id-ID')}\n` +
        `📈 <b>Total Pendapatan:</b> Rp ${Number(user.total_earned || 0).toLocaleString('id-ID')}\n` +
        `🏷️ <b>Kontrak Aktif:</b> ${user.active_contracts || 0} Unit\n\n` +
        `<i>⏰ Diperbarui: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: "🔄 Refresh Saldo", callback_data: "menu_wallet" }],
          [{ text: "⬅️ Kembali ke Menu Utama", callback_data: "menu_main" }]
        ]
      };
      break;
    }

    case 'menu_daily': {
      const lastClaim = user.last_claim_time || 0;
      const isClaimedToday = (Date.now() - lastClaim) < (24 * 3600 * 1000);

      if (isClaimedToday) {
        responseText =
          `<b>🎁 DAILY REWARD GROCKGOLD</b>\n\n` +
          `👤 <b>User:</b> @${user.username}\n` +
          `📌 <b>Status Hari Ini:</b> ✅ <b>Sudah Diklaim</b>\n\n` +
          `Terima kasih! Anda telah mengambil Daily Mining Reward hari ini.\n` +
          `Silakan kembali esok hari untuk klaim berikutnya!`;
        replyMarkup = BACK_TO_MAIN_KEYBOARD;
      } else {
        responseText =
          `<b>🎁 DAILY REWARD GROCKGOLD</b>\n\n` +
          `👤 <b>User:</b> @${user.username}\n` +
          `📌 <b>Status Hari Ini:</b> ⚡ <b>Siap Diklaim!</b>\n\n` +
          `Klik tombol di bawah untuk mengambil bonus harian pertambangan emas sebesar <b>Rp 25.000</b>!`;
        replyMarkup = {
          inline_keyboard: [
            [{ text: "⚡ Klaim Daily Reward Now", callback_data: "claim_daily_reward" }],
            [{ text: "⬅️ Kembali ke Menu Utama", callback_data: "menu_main" }]
          ]
        };
      }
      break;
    }

    case 'claim_daily_reward': {
      const lastClaim = user.last_claim_time || 0;
      const isClaimedToday = (Date.now() - lastClaim) < (24 * 3600 * 1000);

      if (isClaimedToday) {
        responseText =
          `<b>🎁 DAILY REWARD SUDAH DIKLAIM</b>\n\n` +
          `⚠️ Maaf @${user.username}, Anda sudah mengambil reward hari ini.\n` +
          `Silakan kembali lagi esok hari!`;
      } else {
        const bonusAmount = 25000;
        const newBalance = Number(user.main_balance || 0) + bonusAmount;
        const newTotalEarned = Number(user.total_earned || 0) + bonusAmount;
        const now = Date.now();

        await updateUserInSupabase(user.username, {
          main_balance: newBalance,
          total_earned: newTotalEarned,
          last_claim_time: now
        });

        await insertTransactionInSupabase({
          id: `tg-claim-${now}`,
          username: user.username,
          type: 'claim',
          amount: bonusAmount,
          description: 'Daily Mining Reward (via Telegram Bot)',
          status: 'approved',
          created_at: now
        });

        responseText =
          `<b>🎁 KLAIM DAILY REWARD BERHASIL!</b>\n\n` +
          `🎉 Selamat @${user.username}!\n` +
          `Bonus harian sebesar <b>Rp ${bonusAmount.toLocaleString('id-ID')}</b> telah ditambahkan ke akun Anda.\n\n` +
          `💳 <b>Saldo Utama Baru:</b> Rp ${newBalance.toLocaleString('id-ID')}\n` +
          `⏰ <i>Waktu Klaim: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;
      }
      replyMarkup = BACK_TO_MAIN_KEYBOARD;
      break;
    }

    case 'menu_deposit': {
      responseText =
        `<b>💳 DEPOSIT & ISI SALDO</b>\n\n` +
        `👤 <b>User:</b> @${user.username}\n` +
        `💰 <b>Saldo Saat Ini:</b> Rp ${Number(user.main_balance || 0).toLocaleString('id-ID')}\n\n` +
        `<b>Metode Transfer Resmi GROCKGOLD:</b>\n` +
        `• <b>Bank Transfer:</b> BCA, Mandiri, BRI\n` +
        `• <b>E-Wallet & QRIS:</b> DANA, OVO, GoPay, LinkAja\n\n` +
        `📌 <b>Petunjuk Deposit:</b>\n` +
        `1. Buka web/aplikasi GROCKGOLD\n` +
        `2. Masuk ke menu <b>Deposit</b>\n` +
        `3. Pilih nominal & upload bukti transfer\n` +
        `4. Saldo otomatis bertambah setelah verifikasi!`;
      replyMarkup = BACK_TO_MAIN_KEYBOARD;
      break;
    }

    case 'menu_withdraw': {
      responseText =
        `<b>💸 PENARIKAN SALDO (WITHDRAW)</b>\n\n` +
        `👤 <b>User:</b> @${user.username}\n` +
        `💳 <b>Saldo Tersedia:</b> Rp ${Number(user.main_balance || 0).toLocaleString('id-ID')}\n` +
        `⚠️ <b>Minimal Withdraw:</b> Rp 50.000\n\n` +
        `📌 <b>Informasi Penarikan:</b>\n` +
        `• Penarikan akan ditransfer ke Rekening/E-Wallet terdaftar.\n` +
        `• Waktu proses 5 - 15 menit pada jam kerja.\n` +
        `• Lakukan pengajuan Withdraw secara aman di web GROCKGOLD.`;
      replyMarkup = BACK_TO_MAIN_KEYBOARD;
      break;
    }

    case 'menu_stats': {
      responseText =
        `<b>📊 STATISTIK PERTAMBANGAN</b>\n\n` +
        `👤 <b>User:</b> @${user.username}\n` +
        `⛏️ <b>Kontrak Tambang Aktif:</b> ${user.active_contracts || 0} Unit\n` +
        `⚡ <b>Estimasi Profit/Hari:</b> Rp ${Number((user.active_contracts || 0) * 15000).toLocaleString('id-ID')}\n\n` +
        `🏆 <b>Total Hasil Mining:</b> Rp ${Number(user.total_earned || 0).toLocaleString('id-ID')}\n` +
        `👥 <b>Bonus Referral:</b> Rp ${Number(user.referral_earned || 0).toLocaleString('id-ID')}\n` +
        `💸 <b>Komisi Rebate Tim:</b> Rp ${Number(user.rebate_earned || 0).toLocaleString('id-ID')}`;
      replyMarkup = BACK_TO_MAIN_KEYBOARD;
      break;
    }

    case 'menu_notifications': {
      const notifStatus = user.settings?.notificationsEnabled !== false;
      responseText =
        `<b>🔔 PENGATURAN NOTIFIKASI BOT</b>\n\n` +
        `👤 <b>User:</b> @${user.username}\n` +
        `🔔 <b>Status Notifikasi:</b> ${notifStatus ? '✅ <b>AKTIF</b>' : '❌ <b>NON-AKTIF</b>'}\n\n` +
        `<b>Layanan Notifikasi Otomatis:</b>\n` +
        `• Notifikasi Instant Deposit & Withdrawal\n` +
        `• Pengingat Klaim Daily Mining Reward\n` +
        `• Alert Keamanan & Status Akun`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: notifStatus ? "❌ Non-aktifkan Notifikasi" : "✅ Aktifkan Notifikasi", callback_data: "toggle_notifications" }],
          [{ text: "⬅️ Kembali ke Menu Utama", callback_data: "menu_main" }]
        ]
      };
      break;
    }

    case 'toggle_notifications': {
      const currentNotif = user.settings?.notificationsEnabled !== false;
      const newNotif = !currentNotif;
      const updatedSettings = {
        ...(user.settings || {}),
        notificationsEnabled: newNotif
      };

      await updateUserInSupabase(user.username, { settings: updatedSettings });

      responseText =
        `<b>🔔 PENGATURAN NOTIFIKASI DIPERBARUI</b>\n\n` +
        `👤 <b>User:</b> @${user.username}\n` +
        `🔔 <b>Status Notifikasi Terbaru:</b> ${newNotif ? '✅ <b>AKTIF</b>' : '❌ <b>NON-AKTIF</b>'}\n\n` +
        `Pengaturan notifikasi berhasil disimpan.`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: newNotif ? "❌ Non-aktifkan Notifikasi" : "✅ Aktifkan Notifikasi", callback_data: "toggle_notifications" }],
          [{ text: "⬅️ Kembali ke Menu Utama", callback_data: "menu_main" }]
        ]
      };
      break;
    }

    case 'menu_settings': {
      responseText =
        `<b>⚙️ PENGATURAN AKUN GROCKGOLD</b>\n\n` +
        `👤 <b>Username:</b> @${user.username}\n` +
        `📛 <b>Nama Lengkap:</b> ${user.full_name || '-'}\n` +
        `📧 <b>Email:</b> ${user.email || '-'}\n` +
        `📱 <b>No. HP:</b> ${user.phone || '-'}\n` +
        `🏷️ <b>Kode Referral:</b> <code>${user.referral_code || '-'}</code>\n` +
        `🔰 <b>Hak Akses:</b> ${isAdmin ? '👑 SYSTEM ADMIN' : '👤 MEMBER'}\n` +
        `🆔 <b>Telegram Chat ID:</b> <code>${chatId}</code>\n` +
        `🛡️ <b>Status Koneksi:</b> ✅ <b>TERHUBUNG</b>`;
      replyMarkup = BACK_TO_MAIN_KEYBOARD;
      break;
    }

    // ==========================================
    // 👑 ADMIN CONTROL PANEL ACTIONS (SERVER VERIFIED)
    // ==========================================
    case 'admin_panel': {
      responseText =
        `<b>👑 GROCKGOLD ADMIN CONTROL PANEL</b>\n\n` +
        `Selamat datang Administrator <b>${user.full_name || '@' + user.username}</b>!\n` +
        `🔰 <b>Status Verifikasi:</b> ✅ <b>AUTHENTICATED ADMIN</b>\n\n` +
        `Gunakan menu kontrol di bawah ini untuk mengelola sistem dan memantau aktivitas pengguna:`;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "📊 System Overview", callback_data: "admin_sys_stats" },
            { text: "👥 Ringkasan Akun User", callback_data: "admin_users_summary" }
          ],
          [
            { text: "💳 Deposit Pending", callback_data: "admin_pending_deposits" },
            { text: "💸 Withdraw Pending", callback_data: "admin_pending_withdrawals" }
          ],
          [
            { text: "📢 Broadcast Pesan ke Telegram User", callback_data: "admin_broadcast_info" }
          ],
          [
            { text: "⬅️ Kembali ke Menu Utama", callback_data: "menu_main" }
          ]
        ]
      };
      break;
    }

    case 'admin_sys_stats': {
      const sysData = await getAdminSystemDataFromSupabase();
      const totalUsers = sysData.users.length;
      const adminCount = sysData.users.filter((u: any) => u.role === 'admin' || u.username === 'admin').length;
      const memberCount = totalUsers - adminCount;
      const totalMainBalance = sysData.users.reduce((acc: number, u: any) => acc + Number(u.main_balance || 0), 0);
      const totalActiveContracts = sysData.users.reduce((acc: number, u: any) => acc + Number(u.active_contracts || 0), 0);

      const pendingDeposits = sysData.transactions.filter((t: any) => t.type === 'deposit' && (t.status === 'pending' || !t.status));
      const pendingWithdrawals = sysData.transactions.filter((t: any) => t.type === 'withdraw' && (t.status === 'pending' || !t.status));

      const pendingDepSum = pendingDeposits.reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
      const pendingWdSum = pendingWithdrawals.reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

      responseText =
        `<b>📊 SYSTEM OVERVIEW & REKAPITULASI</b>\n\n` +
        `👥 <b>Total Pengguna:</b> ${totalUsers} Akun (${adminCount} Admin, ${memberCount} Member)\n` +
        `💰 <b>Total Saldo Sistem:</b> Rp ${totalMainBalance.toLocaleString('id-ID')}\n` +
        `⛏️ <b>Total Kontrak Aktif:</b> ${totalActiveContracts} Unit\n\n` +
        `💳 <b>Deposit Pending:</b> ${pendingDeposits.length} Tx (Rp ${pendingDepSum.toLocaleString('id-ID')})\n` +
        `💸 <b>Withdraw Pending:</b> ${pendingWithdrawals.length} Tx (Rp ${pendingWdSum.toLocaleString('id-ID')})\n\n` +
        `<i>⏰ Diperbarui: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;

      replyMarkup = {
        inline_keyboard: [
          [{ text: "🔄 Refresh Stats", callback_data: "admin_sys_stats" }],
          [{ text: "⬅️ Kembali ke Admin Control Panel", callback_data: "admin_panel" }]
        ]
      };
      break;
    }

    case 'admin_pending_deposits': {
      const sysData = await getAdminSystemDataFromSupabase();
      const pendingDeposits = sysData.transactions.filter((t: any) => t.type === 'deposit' && (t.status === 'pending' || !t.status));

      if (pendingDeposits.length === 0) {
        responseText =
          `<b>💳 PENDING DEPOSITS</b>\n\n` +
          `✅ <b>Bersih!</b> Tidak ada pengajuan deposit yang tertunda saat ini.`;
        replyMarkup = BACK_TO_ADMIN_PANEL_KEYBOARD;
      } else {
        responseText =
          `<b>💳 PENDING DEPOSITS (${pendingDeposits.length} Transaksi)</b>\n\n` +
          pendingDeposits.slice(0, 5).map((dep: any, i: number) => 
            `<b>${i + 1}. User:</b> @${dep.username}\n` +
            `   💰 <b>Jumlah:</b> Rp ${Number(dep.amount || 0).toLocaleString('id-ID')}\n` +
            `   💳 <b>Metode:</b> ${dep.payment_method || dep.paymentMethod || 'Bank Transfer'}\n` +
            `   🆔 <b>TxID:</b> <code>${dep.id}</code>\n`
          ).join('\n') +
          `\nKlik tombol di bawah untuk menyetujui transaksi:`;

        const approvalButtons = pendingDeposits.slice(0, 5).map((dep: any) => ([
          { text: `✅ Setujui Rp ${Number(dep.amount || 0).toLocaleString('id-ID')} (@${dep.username})`, callback_data: `admin_approve_dep_${dep.id}` }
        ]));

        replyMarkup = {
          inline_keyboard: [
            ...approvalButtons,
            [{ text: "🔄 Refresh List", callback_data: "admin_pending_deposits" }],
            [{ text: "⬅️ Kembali ke Admin Control Panel", callback_data: "admin_panel" }]
          ]
        };
      }
      break;
    }

    case 'admin_pending_withdrawals': {
      const sysData = await getAdminSystemDataFromSupabase();
      const pendingWithdrawals = sysData.transactions.filter((t: any) => t.type === 'withdraw' && (t.status === 'pending' || !t.status));

      if (pendingWithdrawals.length === 0) {
        responseText =
          `<b>💸 PENDING WITHDRAWALS</b>\n\n` +
          `✅ <b>Bersih!</b> Tidak ada pengajuan penarikan dana yang tertunda saat ini.`;
        replyMarkup = BACK_TO_ADMIN_PANEL_KEYBOARD;
      } else {
        responseText =
          `<b>💸 PENDING WITHDRAWALS (${pendingWithdrawals.length} Transaksi)</b>\n\n` +
          pendingWithdrawals.slice(0, 5).map((wd: any, i: number) => 
            `<b>${i + 1}. User:</b> @${wd.username}\n` +
            `   💸 <b>Jumlah:</b> Rp ${Number(wd.amount || 0).toLocaleString('id-ID')}\n` +
            `   🏦 <b>Tujuan:</b> ${wd.payment_method || wd.paymentMethod || 'Bank'} (${wd.description || '-'})\n` +
            `   🆔 <b>TxID:</b> <code>${wd.id}</code>\n`
          ).join('\n') +
          `\nKlik tombol di bawah untuk memproses persetujuan penarikan:`;

        const approvalButtons = pendingWithdrawals.slice(0, 5).map((wd: any) => ([
          { text: `✅ Setujui WD Rp ${Number(wd.amount || 0).toLocaleString('id-ID')} (@${wd.username})`, callback_data: `admin_approve_wd_${wd.id}` }
        ]));

        replyMarkup = {
          inline_keyboard: [
            ...approvalButtons,
            [{ text: "🔄 Refresh List", callback_data: "admin_pending_withdrawals" }],
            [{ text: "⬅️ Kembali ke Admin Control Panel", callback_data: "admin_panel" }]
          ]
        };
      }
      break;
    }

    case 'admin_users_summary': {
      const sysData = await getAdminSystemDataFromSupabase();
      const connectedCount = sysData.users.filter((u: any) => u.telegram_id || u.settings?.telegramId).length;

      responseText =
        `<b>👥 RINGKASAN AKUN ANGGOTA</b>\n\n` +
        `📊 <b>Total User Terdaftar:</b> ${sysData.users.length} Akun\n` +
        `📱 <b>Terhubung Telegram Bot:</b> ${connectedCount} User\n\n` +
        `<b>Daftar Akun Pengguna Terbaru:</b>\n` +
        sysData.users.slice(0, 7).map((u: any, i: number) => {
          const uRole = u.role === 'admin' || u.username === 'admin' ? '👑 Admin' : '👤 Member';
          const tgLinked = (u.telegram_id || u.settings?.telegramId) ? '📱 Linked' : '⚪ Unlinked';
          return `${i + 1}. <b>@${u.username}</b> (${uRole}) - Rp ${Number(u.main_balance || 0).toLocaleString('id-ID')} [${tgLinked}]`;
        }).join('\n');

      replyMarkup = {
        inline_keyboard: [
          [{ text: "🔄 Refresh User List", callback_data: "admin_users_summary" }],
          [{ text: "⬅️ Kembali ke Admin Control Panel", callback_data: "admin_panel" }]
        ]
      };
      break;
    }

    case 'admin_broadcast_info': {
      const sysData = await getAdminSystemDataFromSupabase();
      const connectedUsers = sysData.users.filter((u: any) => u.telegram_id || u.settings?.telegramId);

      responseText =
        `<b>📢 BROADCAST PESAN KE ANGGOTA TELEGRAM</b>\n\n` +
        `📱 <b>Penerima Siap Broadcast:</b> ${connectedUsers.length} Anggota Terhubung\n\n` +
        `<b>Fitur Broadcast Admin:</b>\n` +
        `• Mengirim pesan pengumuman / promosi ke seluruh pengguna yang terhubung ke bot.\n` +
        `• Bekerja secara otomatis di background via Telegram API.\n\n` +
        `Klik tombol di bawah untuk menjalankan tes kirim pesan broadcast:`;

      replyMarkup = {
        inline_keyboard: [
          [{ text: "📣 Jalankan Test Broadcast", callback_data: "admin_broadcast_execute" }],
          [{ text: "⬅️ Kembali ke Admin Control Panel", callback_data: "admin_panel" }]
        ]
      };
      break;
    }

    case 'admin_broadcast_execute': {
      const sysData = await getAdminSystemDataFromSupabase();
      const connectedUsers = sysData.users.filter((u: any) => u.telegram_id || u.settings?.telegramId);
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      let sentCount = 0;
      if (botToken) {
        for (const targetUser of connectedUsers) {
          const tChatId = targetUser.telegram_id || targetUser.settings?.telegramId;
          if (tChatId) {
            try {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: tChatId,
                  text: `<b>📢 PENGUMUMAN DARI MANAGEMENT GROCKGOLD</b>\n\n` +
                        `Halo @${targetUser.username}!\n` +
                        `Sistem pertambangan emas berjalan optimal. Pastikan Anda mengklaim Daily Mining Reward dan pantau statistik Anda!\n\n` +
                        `<i>Salam hangat, Management GROCKGOLD.</i>`,
                  parse_mode: 'HTML'
                })
              });
              sentCount++;
            } catch (err) {
              console.warn("Failed to broadcast to " + tChatId, err);
            }
          }
        }
      } else {
        sentCount = connectedUsers.length;
      }

      responseText =
        `<b>📢 BROADCAST BERHASIL TERKIRIM!</b>\n\n` +
        `✅ Pesan pengumuman telah dikirimkan ke <b>${sentCount} pengguna Telegram</b>.\n` +
        `⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`;

      replyMarkup = BACK_TO_ADMIN_PANEL_KEYBOARD;
      break;
    }

    default: {
      // Check if action is an approval callback e.g. admin_approve_dep_<id> or admin_approve_wd_<id>
      if (action.startsWith('admin_approve_dep_')) {
        const txId = action.replace('admin_approve_dep_', '');
        const sysData = await getAdminSystemDataFromSupabase();
        const depTx = sysData.transactions.find((t: any) => t.id === txId);

        if (!depTx) {
          responseText = `⚠️ Transaksi deposit <code>${txId}</code> tidak ditemukan!`;
        } else if (depTx.status === 'approved') {
          responseText = `⚠️ Deposit <code>${txId}</code> sudah disetujui sebelumnya.`;
        } else {
          await updateTransactionInSupabase(txId, {
            status: 'approved',
            approved_by: user.username,
            approved_at: Date.now()
          });

          // Add balance to recipient user
          const targetUser = sysData.users.find((u: any) => u.username === depTx.username);
          if (targetUser) {
            const currentBal = Number(targetUser.main_balance || 0);
            const newBal = currentBal + Number(depTx.amount || 0);
            await updateUserInSupabase(targetUser.username, { main_balance: newBal });

            // Send notification to target user if connected
            const targetChatId = targetUser.telegram_id || targetUser.settings?.telegramId;
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (targetChatId && botToken) {
              fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: targetChatId,
                  text: `<b>💳 DEPOSIT DISETUJUI!</b>\n\n` +
                        `Deposit Anda sebesar <b>Rp ${Number(depTx.amount || 0).toLocaleString('id-ID')}</b> telah disetujui oleh Admin!\n` +
                        `Saldo utama Anda saat ini: <b>Rp ${newBal.toLocaleString('id-ID')}</b>.`,
                  parse_mode: 'HTML'
                })
              }).catch(e => console.warn("Failed to notify user on deposit approval", e));
            }
          }

          responseText =
            `<b>✅ DEPOSIT BERHASIL DISETUJUI!</b>\n\n` +
            `👤 <b>User:</b> @${depTx.username}\n` +
            `💰 <b>Jumlah:</b> Rp ${Number(depTx.amount || 0).toLocaleString('id-ID')}\n` +
            `🆔 <b>TxID:</b> <code>${txId}</code>\n` +
            `👑 <b>Approved By Admin:</b> @${user.username}`;
        }
        replyMarkup = BACK_TO_ADMIN_PANEL_KEYBOARD;
      } else if (action.startsWith('admin_approve_wd_')) {
        const txId = action.replace('admin_approve_wd_', '');
        const sysData = await getAdminSystemDataFromSupabase();
        const wdTx = sysData.transactions.find((t: any) => t.id === txId);

        if (!wdTx) {
          responseText = `⚠️ Transaksi penarikan <code>${txId}</code> tidak ditemukan!`;
        } else if (wdTx.status === 'approved') {
          responseText = `⚠️ Withdrawal <code>${txId}</code> sudah disetujui sebelumnya.`;
        } else {
          await updateTransactionInSupabase(txId, {
            status: 'approved',
            approved_by: user.username,
            approved_at: Date.now()
          });

          const targetUser = sysData.users.find((u: any) => u.username === wdTx.username);
          if (targetUser) {
            const targetChatId = targetUser.telegram_id || targetUser.settings?.telegramId;
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (targetChatId && botToken) {
              fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: targetChatId,
                  text: `<b>💸 PENARIKAN (WITHDRAW) DISETUJUI!</b>\n\n` +
                        `Penarikan dana Anda sebesar <b>Rp ${Number(wdTx.amount || 0).toLocaleString('id-ID')}</b> telah disetujui dan ditransfer.\n` +
                        `Terima kasih telah bertransaksi di GROCKGOLD!`,
                  parse_mode: 'HTML'
                })
              }).catch(e => console.warn("Failed to notify user on withdrawal approval", e));
            }
          }

          responseText =
            `<b>✅ PENARIKAN (WITHDRAW) BERHASIL DISETUJUI!</b>\n\n` +
            `👤 <b>User:</b> @${wdTx.username}\n` +
            `💸 <b>Jumlah:</b> Rp ${Number(wdTx.amount || 0).toLocaleString('id-ID')}\n` +
            `🆔 <b>TxID:</b> <code>${txId}</code>\n` +
            `👑 <b>Approved By Admin:</b> @${user.username}`;
        }
        replyMarkup = BACK_TO_ADMIN_PANEL_KEYBOARD;
      } else {
        responseText =
          `<b>🛡️ GROCKGOLD BOT</b>\n\n` +
          `Silakan pilih menu di bawah ini:`;
        replyMarkup = MAIN_MENU_KEYBOARD;
      }
      break;
    }
  }

  return { text: responseText, reply_markup: replyMarkup, connected: true };
}

// Interactive API for testing or simulated Telegram menu clicks
app.post("/api/telegram/interact", async (req, res) => {
  try {
    const { chatId, callbackData, commandText } = req.body;
    if (!chatId) {
      return res.status(400).json({ success: false, error: "chatId parameter is required" });
    }

    const result = await processTelegramMenuRequest(String(chatId).trim(), callbackData, commandText);

    // If real Telegram bot token is configured, also push to Telegram API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: result.text,
          parse_mode: 'HTML',
          reply_markup: result.reply_markup,
          disable_web_page_preview: true
        })
      }).catch(err => console.warn("Failed to push to telegram in interact:", err));
    }

    return res.json({
      success: true,
      chatId,
      result
    });
  } catch (err: any) {
    console.error("Error in /api/telegram/interact:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Telegram Webhook Handler (Receives updates from Telegram Server)
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    const update = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!update) {
      return res.status(400).json({ error: "Empty update payload" });
    }

    // 1. Handle incoming text message (e.g., /start, /menu)
    if (update.message) {
      const chatId = String(update.message.chat?.id || "").trim();
      const text = update.message.text || "";

      if (chatId) {
        const result = await processTelegramMenuRequest(chatId, undefined, text);

        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: result.text,
              parse_mode: 'HTML',
              reply_markup: result.reply_markup,
              disable_web_page_preview: true
            })
          });
        }

        return res.json({ success: true, type: 'message', chatId, result });
      }
    }

    // 2. Handle callback query (inline keyboard click)
    if (update.callback_query) {
      const callbackQueryId = update.callback_query.id;
      const chatId = String(update.callback_query.message?.chat?.id || "").trim();
      const messageId = update.callback_query.message?.message_id;
      const callbackData = update.callback_query.data;

      if (botToken && callbackQueryId) {
        // Stop button loading spinner
        fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQueryId })
        }).catch(err => console.warn("Error answering callback query:", err));
      }

      if (chatId && callbackData) {
        const result = await processTelegramMenuRequest(chatId, callbackData);

        if (botToken && messageId) {
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: result.text,
              parse_mode: 'HTML',
              reply_markup: result.reply_markup,
              disable_web_page_preview: true
            })
          });
        }

        return res.json({ success: true, type: 'callback', chatId, callbackData, result });
      }
    }

    return res.json({ success: true, message: "Webhook received but no action required." });
  } catch (err: any) {
    console.error("Error in /api/telegram/webhook:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Generate 6-digit linking code for account linking via Telegram Bot
app.post("/api/telegram/generate-link-code", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: "Username parameter is required." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins validity

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/telegram_linking_codes`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          code,
          username,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        })
      });
    }

    return res.json({ success: true, code, expiresAt });
  } catch (err: any) {
    console.error("Error generating telegram link code:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Verify 6-digit code or link request
app.post("/api/telegram/verify-link-code", async (req, res) => {
  try {
    const { code, telegramUserId, telegramUsername, telegramFirstName, telegramLastName } = req.body;
    if (!code || !telegramUserId) {
      return res.status(400).json({ success: false, error: "Code and telegramUserId parameters are required." });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Supabase credentials missing." });
    }

    // 1. Fetch code record
    const codeRes = await fetch(`${supabaseUrl}/rest/v1/telegram_linking_codes?code=eq.${encodeURIComponent(code)}&select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const codeList = await codeRes.json();
    let targetUsername = '';

    if (Array.isArray(codeList) && codeList.length > 0 && new Date(codeList[0].expires_at) > new Date()) {
      targetUsername = codeList[0].username;
    } else {
      targetUsername = String(code).trim().replace(/^@/, '');
    }

    // 2. Fetch target user
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(targetUsername)}&select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const userList = await userRes.json();
    if (!Array.isArray(userList) || userList.length === 0) {
      return res.json({ success: false, message: "❌ Kode verifikasi atau username tidak ditemukan." });
    }

    const targetUser = userList[0];
    const now = new Date().toISOString();
    const updatedSettings = {
      ...(targetUser.settings || {}),
      telegramId: String(telegramUserId)
    };

    // 3. Update user record with Telegram identity
    await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(targetUser.username)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        telegram_user_id: telegramUserId,
        telegram_id: String(telegramUserId),
        telegram_username: telegramUsername || '',
        telegram_first_name: telegramFirstName || '',
        telegram_last_name: telegramLastName || '',
        telegram_linked_at: now,
        settings: updatedSettings
      })
    });

    // 4. Delete used code
    await fetch(`${supabaseUrl}/rest/v1/telegram_linking_codes?code=eq.${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });

    return res.json({
      success: true,
      message: `🎉 Selamat! Akun GrockGold @${targetUser.username} berhasil terhubung dengan Telegram Chat ID (${telegramUserId})!`,
      username: targetUser.username
    });
  } catch (err: any) {
    console.error("Error verifying telegram link code:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Telegram Mini App Auto-Login via Telegram initData HMAC-SHA256
app.post("/api/telegram/webapp-auth", async (req, res) => {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ success: false, error: "initData string is required." });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ success: false, error: "TELEGRAM_BOT_TOKEN secret not configured on server." });
    }

    // Validate initData signature using HMAC-SHA256
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
      return res.status(400).json({ success: false, error: "Missing hash parameter in initData." });
    }

    urlParams.delete('hash');
    const params: string[] = [];
    for (const [key, value] of urlParams.entries()) {
      params.push(`${key}=${value}`);
    }
    params.sort();
    const dataCheckString = params.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      return res.status(401).json({ success: false, error: "Invalid Telegram signature. Verification failed." });
    }

    const userJson = urlParams.get('user');
    const tgUser = userJson ? JSON.parse(userJson) : null;
    if (!tgUser || !tgUser.id) {
      return res.status(400).json({ success: false, error: "No user object found in initData." });
    }

    // Lookup user in Supabase by telegram_user_id or telegram_id
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Supabase credentials missing." });
    }

    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?or=(telegram_user_id.eq.${tgUser.id},telegram_id.eq.${tgUser.id})&select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const users = await userRes.json();

    if (Array.isArray(users) && users.length > 0) {
      const user = users[0];
      return res.json({
        success: true,
        authenticated: true,
        user,
        message: `Auto-logged in as @${user.username} via Telegram Mini App!`
      });
    } else {
      return res.json({
        success: true,
        authenticated: false,
        tgUser,
        message: `Telegram ID ${tgUser.id} is not linked to any GrockGold account yet.`
      });
    }
  } catch (err: any) {
    console.error("Error in /api/telegram/webapp-auth:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Admin: Get all linked Telegram users
app.get("/api/telegram/admin/linked-users", async (req, res) => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Supabase config missing." });
    }

    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const allUsers = await userRes.json();
    const linkedUsers = (allUsers || []).filter((u: any) => u.telegram_user_id || u.telegram_id || u.settings?.telegramId);

    return res.json({ success: true, count: linkedUsers.length, users: linkedUsers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Admin: Unlink Telegram account
app.post("/api/telegram/admin/unlink", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, error: "Username is required." });

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: "Supabase config missing." });

    await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        telegram_user_id: null,
        telegram_id: null,
        telegram_username: null,
        telegram_linked_at: null
      })
    });

    return res.json({ success: true, message: `Akun Telegram untuk user @${username} telah berhasil dilepas.` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Send notification to a specific connected Telegram user ID
app.post("/api/telegram/send-notification", async (req, res) => {
  try {
    const { username, telegramId, eventType, title, message, amount, status } = req.body;

    let targetChatId = telegramId ? String(telegramId).trim() : "";
    const effectiveBotToken = process.env.TELEGRAM_BOT_TOKEN || "";

    // If no explicit telegramId is provided in request, attempt to lookup user settings
    if (!targetChatId && username) {
      try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          const userRes = await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=settings`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          const userData = await userRes.json();
          if (Array.isArray(userData) && userData[0]?.settings?.telegramId) {
            targetChatId = String(userData[0].settings.telegramId).trim();
          }
        }
      } catch (dbErr) {
        console.warn("Failed to lookup telegramId from Supabase:", dbErr);
      }
    }

    if (!effectiveBotToken) {
      return res.json({
        success: false,
        error: "Server TELEGRAM_BOT_TOKEN belum dikonfigurasi di Environment Variable server."
      });
    }

    // STRICT CHECK: Only send notification if user has connected their Telegram ID
    if (!targetChatId) {
      return res.json({
        success: true,
        skipped: true,
        reason: `Pengiriman dilewati: User '${username || 'Unknown'}' belum menghubungkan Telegram Chat ID.`
      });
    }

    const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const iconMap: Record<string, string> = {
      deposit: '💳',
      withdraw: '💸',
      claim: '🎁',
      security: '🛡️',
      test: '⚡'
    };
    const icon = iconMap[eventType || 'test'] || '🔔';

    let text = `<b>${icon} GROCKGOLD NOTIFICATION</b>\n\n`;
    text += `<b>Event:</b> ${title || 'Aktivitas Akun'}\n`;
    if (username) text += `<b>User:</b> @${username}\n`;
    if (amount !== undefined && amount !== null) {
      text += `<b>Jumlah:</b> Rp ${Number(amount).toLocaleString('id-ID')}\n`;
    }
    if (status) text += `<b>Status:</b> ${String(status).toUpperCase()}\n`;
    text += `\n<b>Detail:</b> ${message || '-'}\n`;
    text += `\n<i>⏰ ${nowStr} WIB</i>`;

    const tgRes = await fetch(`https://api.telegram.org/bot${effectiveBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const tgData = await tgRes.json();

    if (tgData.ok) {
      return res.json({
        success: true,
        delivered: true,
        chatId: targetChatId,
        messageId: tgData.result?.message_id
      });
    } else {
      console.warn("Telegram API delivery failure:", tgData);
      return res.json({
        success: false,
        error: tgData.description || "Telegram API menolak pengiriman pesan. Pastikan Chat ID benar dan Anda telah menekan /start pada bot @trading_sinyal_pro_bot."
      });
    }

  } catch (error: any) {
    console.error("Error in /api/telegram/send-notification:", error);
    res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

// Telegram Webhook Endpoint
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    const update = req.body;
    const result = await processTelegramWebhook(update);
    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error("Error processing telegram webhook:", err);
    return res.status(200).json({ success: false, error: err.message || String(err) });
  }
});

// Register or query Telegram Webhook status
app.all("/api/telegram/register-webhook", async (req, res) => {
  try {
    if (req.method === 'DELETE') {
      const result = await removeTelegramWebhook();
      return res.json(result);
    }
    const { force, webhookUrl } = req.body || req.query || {};
    const result = await registerTelegramWebhook({
      force: force === true || force === 'true',
      webhookUrl: typeof webhookUrl === 'string' ? webhookUrl : undefined
    });
    return res.json(result);
  } catch (err: any) {
    console.error("Error registering telegram webhook:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Setup Vite Dev Server / Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite HMR integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving static assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Auto-register Telegram Webhook if env configured
    if (process.env.TELEGRAM_WEBHOOK_URL && (process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN)) {
      try {
        await registerTelegramWebhook();
      } catch (err) {
        console.warn("Auto-webhook registration skipped:", err);
      }
    }
  });
}

startServer();
