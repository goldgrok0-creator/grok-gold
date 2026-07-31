import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// CORS headers for cross-origin production API access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

const FALLBACK_SERVER_SUPABASE_URL = 'https://qoqahhublvisnmvfaqvj.supabase.co';
const FALLBACK_SERVER_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcWFoaHVibHZpc25tdmZhcXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTc5NjcsImV4cCI6MjA5OTkzMzk2N30.wUXTs7X0-KaJoKFe6qF1bXYI_o13nDrijs4368tsAxQ';

function getSupabaseConfig() {
  let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  let key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    url = FALLBACK_SERVER_SUPABASE_URL;
  }
  if (!key || typeof key !== 'string' || key.length < 20) {
    key = FALLBACK_SERVER_SUPABASE_KEY;
  }
  return { supabaseUrl: url, supabaseKey: key };
}

// Helper to insert transaction log in Supabase
async function insertTransactionInSupabase(txPayload: any) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
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
    console.warn("Notice in insertTransactionInSupabase:", err);
    return false;
  }
}

// Helper to verify admin role in Supabase
async function verifyAdminRoleInSupabase(username: string): Promise<boolean> {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey || !username) return false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(username)}&select=role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0].role === 'admin';
    }
    return false;
  } catch (err) {
    console.warn("Notice verifying admin role:", err);
    return false;
  }
}

// Helper to fetch all users from Supabase for Admin Overview
async function getAdminSystemDataFromSupabase() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
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
    console.warn("Notice in getAdminSystemDataFromSupabase:", err);
    return { users: [], transactions: [] };
  }
}

// Helper to update transaction in Supabase
async function updateTransactionInSupabase(txId: string, payload: any) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
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

// ==========================================
// LUCKY SPIN & SALDO FREE SPIN API ENDPOINTS
// ==========================================
const MAX_DAILY_SPINS = 3;

const memoryUserStore = new Map<string, any>();
const activeSpinLocks = new Set<string>();

const LUCKY_SPIN_PRIZES = [
  { index: 0, label: 'Rp 500', value: 500, type: 'cash', weight: 30 },
  { index: 1, label: 'Coba Lagi', value: 0, type: 'zonk', weight: 25 },
  { index: 2, label: 'Rp 1.000', value: 1000, type: 'cash', weight: 20 },
  { index: 3, label: 'Rp 2.000', value: 2000, type: 'cash', weight: 12 },
  { index: 4, label: 'Rp 5.000', value: 5000, type: 'cash', weight: 8 },
  { index: 5, label: 'ZONK', value: 0, type: 'zonk', weight: 25 },
  { index: 6, label: 'Rp 1.000', value: 1000, type: 'cash', weight: 20 },
  { index: 7, label: 'Rp 500', value: 500, type: 'cash', weight: 30 },
];

function selectWeightedPrize(availableFreeSpinBalance: number) {
  const validPrizes = LUCKY_SPIN_PRIZES.filter(p => p.type === 'zonk' || p.value <= availableFreeSpinBalance);
  const totalWeight = validPrizes.reduce((sum, p) => sum + p.weight, 0);
  let randomNum = Math.random() * totalWeight;
  for (const prize of validPrizes) {
    if (randomNum < prize.weight) {
      return prize;
    }
    randomNum -= prize.weight;
  }
  return validPrizes.find(p => p.type === 'zonk') || validPrizes[0];
}

// Helper to query and enforce server-side 24h rolling reset spin counts & countdown in Supabase
async function getSpinWindowState(username: string, user: any, supabaseUrl?: string, supabaseKey?: string): Promise<{
  todaySpins: number;
  lastSpinResetAt: number;
  nextResetAt: number;
  resetSecondsRemaining: number;
  userUpdated: boolean;
}> {
  const now = Date.now();
  const PERIOD_MS = 24 * 60 * 60 * 1000;

  const memoryUser = memoryUserStore.get(username) || memoryUserStore.get(username.toLowerCase());
  let lastReset = user?.settings?.lastSpinResetAt || memoryUser?.settings?.lastSpinResetAt || user?.last_spin_reset_at || 0;

  // Use history from user.settings or memoryUser.settings (prefer user.settings)
  const userHistory = Array.isArray(user?.settings?.luckySpinHistory)
    ? user.settings.luckySpinHistory
    : (Array.isArray(memoryUser?.settings?.luckySpinHistory) ? memoryUser.settings.luckySpinHistory : []);

  let userUpdated = false;

  // Filter valid spin history (excluding bonus/test items)
  const historySet = new Set<string>();
  const validSpins: any[] = [];
  userHistory.forEach((item: any) => {
    if (!item) return;
    if (item.id === '1' || item.id === '2' || item.id === '3' || item.prize === 'Boost 5x') return;
    const key = item.id || `${item.date}-${item.prize}`;
    if (!historySet.has(key)) {
      historySet.add(key);
      validSpins.push(item);
    }
  });

  // Safeguard: If user has 0 spins OR current batch is not exhausted (validSpins.length % MAX_DAILY_SPINS !== 0),
  // then lastReset must be 0 so new users or users with remaining spins are never locked.
  if (validSpins.length === 0 || validSpins.length % MAX_DAILY_SPINS !== 0) {
    if (lastReset !== 0) {
      lastReset = 0;
      userUpdated = true;
      if (user?.settings) user.settings.lastSpinResetAt = 0;
      if (memoryUser?.settings) memoryUser.settings.lastSpinResetAt = 0;
      if (supabaseUrl && supabaseKey) {
        const updatedSettings = {
          ...(user?.settings || memoryUser?.settings || {}),
          lastSpinResetAt: 0
        };
        fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(username)}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ settings: updatedSettings })
        }).catch(() => {});
      }
    }
  }

  if (lastReset && typeof lastReset === 'number' && !isNaN(lastReset) && lastReset > 0) {
    const nextResetAt = lastReset + PERIOD_MS;

    if (now >= nextResetAt) {
      // 24 hours have elapsed since tickets were exhausted: RESET LOCK!
      lastReset = 0;
      userUpdated = true;
      if (user?.settings) user.settings.lastSpinResetAt = 0;
      if (memoryUser?.settings) memoryUser.settings.lastSpinResetAt = 0;

      if (supabaseUrl && supabaseKey) {
        const updatedSettings = {
          ...(user?.settings || memoryUser?.settings || {}),
          lastSpinResetAt: 0
        };
        fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(username)}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ settings: updatedSettings })
        }).catch(() => {});
      }

      return {
        todaySpins: 0,
        lastSpinResetAt: 0,
        nextResetAt: 0,
        resetSecondsRemaining: 0,
        userUpdated: true
      };
    } else {
      // Still locked within 24h of finishing tickets
      const resetSecondsRemaining = Math.max(0, Math.floor((nextResetAt - now) / 1000));
      return {
        todaySpins: MAX_DAILY_SPINS,
        lastSpinResetAt: lastReset,
        nextResetAt,
        resetSecondsRemaining,
        userUpdated
      };
    }
  }

  // If lastReset is 0/null (unlocked): count spins done in the current uncompleted batch
  const currentBatchSpins = validSpins.length % MAX_DAILY_SPINS;

  return {
    todaySpins: currentBatchSpins,
    lastSpinResetAt: 0,
    nextResetAt: 0,
    resetSecondsRemaining: 0,
    userUpdated
  };
}

// Helper to retrieve authenticated user from Supabase Auth token
async function getAuthUserFromRequest(req: any, supabaseUrl: string, supabaseKey: string) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token || token === supabaseKey) {
    return null;
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    const authUser = await res.json();
    if (authUser && authUser.id) {
      return authUser;
    }
  } catch (err) {
    console.warn("Error verifying Supabase auth token:", err);
  }
  return null;
}

// Helper function for fast targeted user lookup in Lucky Spin
async function findUserForLuckySpin(reqUsername: string, authUser: any, supabaseUrl: string, supabaseKey: string) {
  let user: any = null;

  // 1. Direct query by username if specified
  if (reqUsername) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(reqUsername)}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          user = rows[0];
        }
      }
    } catch (e) {
      console.warn("[LUCKY-SPIN] Direct user query by username failed:", e);
    }

    if (!user) {
      user = memoryUserStore.get(reqUsername) || memoryUserStore.get(reqUsername.toLowerCase());
    }
  }

  // 2. Fallback search by email ONLY if reqUsername was NOT provided
  if (!user && !reqUsername && authUser?.email) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/users?email=ilike.${encodeURIComponent(authUser.email)}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          user = rows[0];
        }
      }
    } catch (e) {
      console.warn("[LUCKY-SPIN] Direct user query by email failed:", e);
    }
  }

  // 3. Fallback search in recent rows if reqUsername was specified
  if (!user && reqUsername) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/users?select=*&order=created_at.desc&limit=50`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          user = rows.find((u: any) => u.username?.toLowerCase() === reqUsername.toLowerCase());
        }
      }
    } catch (e) {
      console.warn("[LUCKY-SPIN] Fallback user search failed:", e);
    }
  }

  // 4. Emergency auto-synthesis for requested username so new accounts are NEVER given another user's data
  if (!user && reqUsername) {
    user = {
      username: reqUsername,
      full_name: reqUsername,
      email: `${reqUsername}@user.local`,
      main_balance: 0,
      reward_balance: 0,
      settings: {
        freeSpinBalance: 1000000,
        bonusSpinBalance: 0,
        rewardSpinWallet: 0,
        luckySpinHistory: [],
        lastSpinResetAt: 0
      }
    };
    memoryUserStore.set(reqUsername, user);
    memoryUserStore.set(reqUsername.toLowerCase(), user);
  }

  return user;
}

// GET /api/lucky-spin/info?username=...
app.get("/api/lucky-spin/info", async (req, res) => {
  try {
    const { username } = req.query;
    console.log(`[LUCKY-SPIN GET /info] Received request for username: "${username}"`);

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Koneksi Supabase tidak tersedia." });
    }

    const authUser = await getAuthUserFromRequest(req, supabaseUrl, supabaseKey);
    const reqUsername = typeof username === 'string' ? username.trim() : '';

    const user = await findUserForLuckySpin(reqUsername, authUser, supabaseUrl, supabaseKey);

    if (!user) {
      return res.status(404).json({ success: false, error: "Akun tidak ditemukan. Silakan login terlebih dahulu." });
    }

    const memUserInfo = memoryUserStore.get(user.username) || (typeof username === 'string' ? memoryUserStore.get(username) : null);
    if (memUserInfo && memUserInfo.settings) {
      const memHistory = memUserInfo.settings.luckySpinHistory || [];
      const dbHistory = user.settings?.luckySpinHistory || [];
      if (memHistory.length >= dbHistory.length) {
        user.settings = { ...user.settings, ...memUserInfo.settings };
        if (memUserInfo.main_balance !== undefined) {
          user.main_balance = memUserInfo.main_balance;
        }
      }
    }

    // Safely save authUserId into user.settings if not present yet
    if (authUser && user.settings?.authUserId !== authUser.id) {
      const newSettings = {
        ...(user.settings || {}),
        authUserId: authUser.id,
        auth_user_id: authUser.id
      };
      user.settings = newSettings;
      fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(user.username)}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: newSettings })
      }).catch(() => {});
    }

    const history = (user.settings?.luckySpinHistory || []).filter((item: any) => item && item.id !== '1' && item.id !== '2' && item.id !== '3' && item.prize !== 'Boost 5x');
    const totalWonFromHistory = history.reduce((sum: number, item: any) => {
      if (item && (item.success || item.type === 'cash' || (item.value && item.value > 0)) && typeof item.value === 'number') {
        return sum + item.value;
      }
      return sum;
    }, 0);

    // Consolidated spin balances from spin_balances table (PRIMARY SOURCE OF TRUTH)
    let freeSpinFromSb: number | undefined = undefined;
    let bonusSpinFromSb: number | undefined = undefined;

    try {
      const sbRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?username=ilike.${encodeURIComponent(user.username)}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (sbRes.ok) {
        const spinRows = await sbRes.json();
        if (Array.isArray(spinRows) && spinRows.length > 0) {
          const freeRow = spinRows.find((r: any) => r.type === 'free');
          const bonusRow = spinRows.find((r: any) => r.type === 'bonus');
          if (freeRow && freeRow.amount !== undefined && freeRow.amount !== null) freeSpinFromSb = Number(freeRow.amount);
          if (bonusRow && bonusRow.amount !== undefined && bonusRow.amount !== null) bonusSpinFromSb = Number(bonusRow.amount);
        }
      }
    } catch (sbErr) {
      console.warn("Non-fatal error reading spin_balances in /info:", sbErr);
    }

    let freeSpinBalance = freeSpinFromSb !== undefined
      ? freeSpinFromSb
      : (typeof user.settings?.freeSpinBalance === 'number'
          ? user.settings.freeSpinBalance
          : (user.free_spin_balance !== undefined && user.free_spin_balance !== null ? Number(user.free_spin_balance) : 1000000));

    // Auto-reconcile any missing referral Free Spin bonuses (+Rp 50.000 per invited member)
    try {
      const invCode = user.referral_code || '';
      const refRes1 = await fetch(`${supabaseUrl}/rest/v1/users?invited_by=ilike.${encodeURIComponent(user.username)}&select=username`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      let refList1: any[] = [];
      if (refRes1.ok) refList1 = await refRes1.json();

      let refList2: any[] = [];
      if (invCode) {
        const refRes2 = await fetch(`${supabaseUrl}/rest/v1/users?invited_by=ilike.${encodeURIComponent(invCode)}&select=username`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (refRes2.ok) refList2 = await refRes2.json();
      }

      const uniqueRefUsernames = new Set<string>();
      if (Array.isArray(refList1)) refList1.forEach(r => r.username && uniqueRefUsernames.add(r.username.toLowerCase()));
      if (Array.isArray(refList2)) refList2.forEach(r => r.username && uniqueRefUsernames.add(r.username.toLowerCase()));

      const totalReferralCount = uniqueRefUsernames.size;
      if (totalReferralCount > 0) {
        const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?username=ilike.${encodeURIComponent(user.username)}&type=eq.referral_spin_bonus&select=id`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        let txList: any[] = [];
        if (txRes.ok) txList = await txRes.json();
        const awardedCount = Array.isArray(txList) ? txList.length : 0;
        const missingBonusCount = totalReferralCount - awardedCount;

        if (missingBonusCount > 0) {
          const bonusToAdd = missingBonusCount * 50000;
          freeSpinBalance = (freeSpinBalance || 1000000) + bonusToAdd;

          // Upsert updated freeSpinBalance into spin_balances table
          await fetch(`${supabaseUrl}/rest/v1/spin_balances?on_conflict=username,type`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify([
              { username: user.username, type: 'free', amount: freeSpinBalance, updated_at: new Date().toISOString() }
            ])
          }).catch(() => {});

          // Update users settings
          const updatedSettings = {
            ...(user.settings || {}),
            freeSpinBalance: freeSpinBalance
          };
          user.settings = updatedSettings;
          await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(user.username)}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ settings: updatedSettings })
          }).catch(() => {});

          // Log transaction entries
          for (let i = 0; i < missingBonusCount; i++) {
            await fetch(`${supabaseUrl}/rest/v1/transactions`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: 'REF-SPIN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                username: user.username,
                type: 'referral_spin_bonus',
                amount: 50000,
                description: `Bonus Free Spin Referral (+Rp 50.000) dari pendaftaran member baru`,
                created_at: Date.now()
              })
            }).catch(() => {});
          }
        }
      }
    } catch (refAuditErr) {
      console.warn("Non-fatal referral spin audit error in /info:", refAuditErr);
    }

    const bonusSpinBalance = bonusSpinFromSb !== undefined
      ? bonusSpinFromSb
      : Number(user.settings?.bonusSpinBalance ?? 0);

    const mainBalance = Number(user.main_balance || 0);

    const windowState = await getSpinWindowState(user.username, user, supabaseUrl, supabaseKey);

    return res.json({
      success: true,
      authUserId: user.settings?.authUserId || authUser?.id || null,
      username: user.username,
      freeSpinBalance,
      bonusSpinBalance,
      rewardSpinWallet: bonusSpinBalance,
      mainBalance,
      todaySpins: windowState.todaySpins,
      maxDailySpins: MAX_DAILY_SPINS,
      lastSpinResetAt: windowState.lastSpinResetAt,
      nextResetAt: windowState.nextResetAt,
      resetSecondsRemaining: windowState.resetSecondsRemaining,
      serverTime: Date.now(),
      history
    });
  } catch (err: any) {
    console.error("Error in /api/lucky-spin/info:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// POST /api/lucky-spin/spin
app.post("/api/lucky-spin/spin", async (req, res) => {
  try {
    const { username } = req.body;
    console.log(`[LUCKY-SPIN POST /spin] Received spin request for username: "${username}"`);

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Koneksi Supabase tidak tersedia." });
    }

    const authUser = await getAuthUserFromRequest(req, supabaseUrl, supabaseKey);
    const reqUsername = typeof username === 'string' ? username.trim() : '';

    const user = await findUserForLuckySpin(reqUsername, authUser, supabaseUrl, supabaseKey);

    if (!user) {
      return res.status(404).json({ success: false, error: "Akun tidak ditemukan. Silakan login terlebih dahulu." });
    }

    const lockKey = user.username.toLowerCase();
    if (activeSpinLocks.has(lockKey)) {
      return res.status(429).json({ success: false, error: "Spin sedang diproses. Mohon tunggu sejenak..." });
    }
    activeSpinLocks.add(lockKey);

    try {
      const memUserSpin = memoryUserStore.get(user.username) || (typeof username === 'string' ? memoryUserStore.get(username) : null);
      if (memUserSpin && memUserSpin.settings) {
        const memHistory = memUserSpin.settings.luckySpinHistory || [];
        const dbHistory = user.settings?.luckySpinHistory || [];
        if (memHistory.length >= dbHistory.length) {
          user.settings = { ...user.settings, ...memUserSpin.settings };
          if (memUserSpin.main_balance !== undefined) {
            user.main_balance = memUserSpin.main_balance;
          }
        }
      }

      // Safety check: verify auth token match if present (with fallback for stale tokens on active user session)
      if (authUser && user.email && authUser.email && user.email.toLowerCase() !== authUser.email.toLowerCase()) {
        if (reqUsername && user.username.toLowerCase() === reqUsername.toLowerCase()) {
          console.warn(`[LUCKY-SPIN] Stale token (${authUser.email}) detected for active user (${user.username}/${user.email}). Proceeding with active user account.`);
        } else {
          return res.status(403).json({ success: false, error: "Akses ditolak. Anda tidak memiliki izin memutar spin untuk akun lain." });
        }
      }

      const history = (user.settings?.luckySpinHistory || []).filter((item: any) => item && item.id !== '1' && item.id !== '2' && item.id !== '3' && item.prize !== 'Boost 5x');
      const totalWonFromHistory = history.reduce((sum: number, item: any) => {
        if (item && (item.success || item.type === 'cash' || (item.value && item.value > 0)) && typeof item.value === 'number') {
          return sum + item.value;
        }
        return sum;
      }, 0);

      let freeSpinFromSbSpin: number | undefined = undefined;
      let bonusSpinFromSbSpin: number | undefined = undefined;

      try {
        const sbRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?username=ilike.${encodeURIComponent(user.username)}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (sbRes.ok) {
          const spinRows = await sbRes.json();
          if (Array.isArray(spinRows) && spinRows.length > 0) {
            const freeRow = spinRows.find((r: any) => r.type === 'free');
            const bonusRow = spinRows.find((r: any) => r.type === 'bonus');
            if (freeRow && freeRow.amount !== undefined && freeRow.amount !== null) freeSpinFromSbSpin = Number(freeRow.amount);
            if (bonusRow && bonusRow.amount !== undefined && bonusRow.amount !== null) bonusSpinFromSbSpin = Number(bonusRow.amount);
          }
        }
      } catch (sbErr) {
        console.warn("Non-fatal error reading spin_balances in /spin:", sbErr);
      }

      let currentFreeSpinBalance = freeSpinFromSbSpin !== undefined
        ? freeSpinFromSbSpin
        : (typeof user.settings?.freeSpinBalance === 'number'
            ? user.settings.freeSpinBalance
            : (user.free_spin_balance !== undefined && user.free_spin_balance !== null ? Number(user.free_spin_balance) : 1000000));

      let currentBonusSpinBalance = bonusSpinFromSbSpin !== undefined
        ? bonusSpinFromSbSpin
        : Math.max(
            user.settings?.bonusSpinBalance ?? 0,
            user.settings?.rewardSpinWallet ?? 0,
            totalWonFromHistory
          );

      const currentMainBalance = Number(user.main_balance || 0);

      const windowState = await getSpinWindowState(user.username, user, supabaseUrl, supabaseKey);

      if (windowState.todaySpins >= MAX_DAILY_SPINS) {
        const hours = String(Math.floor(windowState.resetSecondsRemaining / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((windowState.resetSecondsRemaining % 3600) / 60)).padStart(2, '0');
        const seconds = String(windowState.resetSecondsRemaining % 60).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;

        return res.json({
          success: false,
          todaySpins: windowState.todaySpins,
          maxDailySpins: MAX_DAILY_SPINS,
          lastSpinResetAt: windowState.lastSpinResetAt,
          nextResetAt: windowState.nextResetAt,
          resetSecondsRemaining: windowState.resetSecondsRemaining,
          serverTime: Date.now(),
          error: `Limit spin harian tercapai (${windowState.todaySpins}/${MAX_DAILY_SPINS} kali). Otomatis reset dalam ${timeStr}.`
        });
      }

      if (currentFreeSpinBalance <= 0) {
        return res.json({
          success: false,
          error: `Saldo Free Spin Anda telah habis (Rp 0). Tambah Saldo Free Spin Anda dengan mengundang member baru (+Rp 50.000 per referral)!`
        });
      }

      const prize = selectWeightedPrize(currentFreeSpinBalance);

      const isZonk = prize.type === 'zonk' || prize.value === 0;
      const wonAmount = isZonk ? 0 : prize.value;
      // Deduction rule: Free Spin Baru = Free Spin Lama - Nilai Reward yang Didapat (Zonk / Reward = 0 -> Deduction = 0)
      const deduction = isZonk ? 0 : Math.min(currentFreeSpinBalance, prize.value);

      const newFreeSpinBalance = Math.max(0, currentFreeSpinBalance - deduction);
      const newBonusSpinBalance = currentBonusSpinBalance + wonAmount;
      const currentRewardBalance = Number(user.reward_balance || 0);
      const newRewardBalance = currentRewardBalance + wonAmount;
      const newMainBalance = currentMainBalance; // Main Balance remains UNCHANGED!

    const newSpinRecord = {
      id: `SPN-${Date.now()}`,
      prize: prize.label,
      date: Date.now(),
      success: !isZonk,
      value: prize.value,
      type: prize.type,
      deduction: deduction,
      balanceBefore: currentFreeSpinBalance,
      balanceAfter: newFreeSpinBalance
    };

    const newTodaySpins = windowState.todaySpins + 1;
    const isExhausted = newTodaySpins >= MAX_DAILY_SPINS;

    const PERIOD_MS = 24 * 60 * 60 * 1000;
    let finalLastSpinResetAt = 0;
    let finalNextResetAt = 0;
    let finalResetSecondsRemaining = 0;

    if (isExhausted) {
      finalLastSpinResetAt = Date.now();
      finalNextResetAt = finalLastSpinResetAt + PERIOD_MS;
      finalResetSecondsRemaining = PERIOD_MS / 1000;
    }

    const updatedHistory = [newSpinRecord, ...history];
    const updatedSettings = {
      ...(user.settings || {}),
      authUserId: authUser?.id || user.settings?.authUserId,
      auth_user_id: authUser?.id || user.settings?.auth_user_id,
      luckySpinHistory: updatedHistory,
      freeSpinBalance: newFreeSpinBalance,
      bonusSpinBalance: newBonusSpinBalance,
      rewardSpinWallet: newBonusSpinBalance,
      lastSpinResetAt: finalLastSpinResetAt
    };

    const updatedUser = {
      ...user,
      main_balance: newMainBalance,
      reward_balance: newRewardBalance,
      free_spin_balance: newFreeSpinBalance,
      bonus_spin_balance: newBonusSpinBalance,
      settings: updatedSettings
    };
    memoryUserStore.set(user.username, updatedUser);

    const patchBody: any = {
      main_balance: newMainBalance,
      reward_balance: newRewardBalance,
      free_spin_balance: newFreeSpinBalance,
      bonus_spin_balance: newBonusSpinBalance,
      settings: updatedSettings
    };

    try {
      await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(user.username)}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchBody)
      });
    } catch (dbErr) {
      console.warn("Non-fatal Supabase update error during spin:", dbErr);
    }

    // Atomically persist to consolidated spin_balances table
    try {
      await fetch(`${supabaseUrl}/rest/v1/spin_balances?on_conflict=username,type`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify([
          { username: user.username, type: 'free', amount: newFreeSpinBalance, updated_at: new Date().toISOString() },
          { username: user.username, type: 'bonus', amount: newBonusSpinBalance, updated_at: new Date().toISOString() }
        ])
      });
    } catch (sbUpdateErr) {
      console.warn("Non-fatal error writing spin_balances in /spin:", sbUpdateErr);
    }

    if (wonAmount > 0) {
      const txPayload = {
        id: `TX-SPIN-${Date.now()}`,
        username: user.username,
        type: 'lucky_spin_reward',
        amount: wonAmount,
        description: `Hadiah Lucky Spin: ${prize.label} (Potong Free Spin Rp ${deduction.toLocaleString('id-ID')})`,
        created_at: Date.now()
      };
      await fetch(`${supabaseUrl}/rest/v1/transactions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(txPayload)
      }).catch(() => {});
    }

    const prizeIndex = LUCKY_SPIN_PRIZES.findIndex(p => p.label === prize.label);

    return res.json({
      success: true,
      authUserId: updatedSettings.authUserId || null,
      username: user.username,
      prizeIndex: prizeIndex >= 0 ? prizeIndex : 1,
      prize: prize,
      newFreeSpinBalance: newFreeSpinBalance,
      newBonusSpinBalance: newBonusSpinBalance,
      newRewardBalance: newRewardBalance,
      newMainBalance: newMainBalance,
      todaySpins: newTodaySpins,
      maxDailySpins: MAX_DAILY_SPINS,
      spinHistory: updatedHistory,
      lastSpinResetAt: finalLastSpinResetAt,
      nextResetAt: finalNextResetAt,
      resetSecondsRemaining: finalResetSecondsRemaining,
      serverTime: Date.now()
    });
    } catch (err: any) {
      console.error("Error in /api/lucky-spin/spin:", err);
      return res.status(500).json({ success: false, error: err.message || String(err) });
    } finally {
      activeSpinLocks.delete(lockKey);
    }
  } catch (err: any) {
    console.error("Fatal error in /api/lucky-spin/spin:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Admin update spin configuration
app.post("/api/lucky-spin/admin/config", async (req, res) => {
  try {
    const { requesterUsername } = req.body;
    const isAdmin = await verifyAdminRoleInSupabase(requesterUsername);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Akses ditolak: Hanya akun role 'admin' yang diizinkan." });
    }
    return res.json({ success: true, message: "Pengaturan Lucky Spin aktif." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Admin Lucky Spin: Fetch all spin balances, users, stats, and audit logs
app.get("/api/lucky-spin/admin/data", async (req, res) => {
  try {
    const requesterUsername = typeof req.query.requesterUsername === 'string' ? req.query.requesterUsername.trim() : '';
    const isAdmin = await verifyAdminRoleInSupabase(requesterUsername);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Akses ditolak: Hanya admin yang diizinkan." });
    }

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Koneksi Supabase tidak tersedia." });
    }

    // 1. Fetch all users
    const usersRes = await fetch(`${supabaseUrl}/rest/v1/users?select=id,username,full_name,email,role,created_at`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const users = usersRes.ok ? await usersRes.json() : [];

    // 2. Fetch all spin_balances
    const sbRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const spinBalances = sbRes.ok ? await sbRes.json() : [];

    // 3. Fetch spin-related transactions
    const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?or=(type.eq.lucky_spin_reward,type.eq.spin_reward,type.eq.spin_zonk,type.eq.admin_spin_ticket_grant,type.eq.admin_spin_bonus_grant)&order=created_at.desc&limit=300`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const history = txRes.ok ? await txRes.json() : [];

    // Non-admin members list
    const memberUsers = (users || []).filter((u: any) => u.role !== 'admin' && u.username?.toLowerCase() !== 'admin');

    // Calculate metrics
    let totalAvailableFreeSpin = 0;
    let totalBonusBalanceAvailable = 0;

    (spinBalances || []).forEach((sb: any) => {
      const isMember = memberUsers.some((u: any) => u.username?.toLowerCase() === sb.username?.toLowerCase());
      if (isMember) {
        if (sb.type === 'free') totalAvailableFreeSpin += Number(sb.amount) || 0;
        if (sb.type === 'bonus') totalBonusBalanceAvailable += Number(sb.amount) || 0;
      }
    });

    const totalSpinsPlayed = (history || []).filter((t: any) => 
      t.type === 'lucky_spin_reward' || t.type === 'spin_reward' || t.type === 'spin_zonk'
    ).length;

    const totalRewardsDistributed = (history || []).reduce((sum: number, t: any) => {
      if ((t.type === 'lucky_spin_reward' || t.type === 'spin_reward') && Number(t.amount) > 0) {
        return sum + (Number(t.amount) || 0);
      }
      return sum;
    }, 0);

    return res.json({
      success: true,
      users: memberUsers,
      spinBalances: spinBalances || [],
      history: history || [],
      stats: {
        totalAvailableFreeSpin,
        totalBonusBalanceAvailable,
        totalSpinsPlayed,
        totalRewardsDistributed
      }
    });
  } catch (err: any) {
    console.error("Error in /api/lucky-spin/admin/data:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Admin Lucky Spin: Adjust user balance (free or bonus) with atomic audit logging
app.post("/api/lucky-spin/admin/adjust-balance", async (req, res) => {
  try {
    const { requesterUsername, targetUserId, targetUsername, type, mode, amount, note } = req.body;

    const isAdmin = await verifyAdminRoleInSupabase(requesterUsername);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Akses ditolak: Hanya admin yang diizinkan." });
    }

    if (!targetUsername || !type || !mode) {
      return res.status(400).json({ success: false, error: "Parameter tidak lengkap." });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || (mode === 'add' && numAmount <= 0) || (mode === 'set' && numAmount < 0)) {
      return res.status(400).json({ success: false, error: "Jumlah nominal tidak valid." });
    }

    if (type !== 'free' && type !== 'bonus') {
      return res.status(400).json({ success: false, error: "Tipe saldo spin harus 'free' atau 'bonus'." });
    }

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Koneksi Supabase tidak tersedia." });
    }

    // Get current balance from spin_balances
    const getRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?username=ilike.${encodeURIComponent(targetUsername)}&type=eq.${type}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });

    let currentBal = 0;
    if (getRes.ok) {
      const rows = await getRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        currentBal = Number(rows[0].amount) || 0;
      }
    }

    const newAmount = mode === 'add' ? Math.max(0, currentBal + numAmount) : Math.max(0, numAmount);

    // Upsert spin_balances
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?on_conflict=username,type`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify([{
        username: targetUsername,
        type: type,
        amount: newAmount,
        updated_at: new Date().toISOString()
      }])
    });

    if (!upsertRes.ok) {
      const errText = await upsertRes.text();
      console.warn("Upsert spin_balances via on_conflict failed, trying fallback patch/post:", errText);
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?username=ilike.${encodeURIComponent(targetUsername)}&type=eq.${type}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      const checkRows = checkRes.ok ? await checkRes.json() : [];
      if (Array.isArray(checkRows) && checkRows.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/spin_balances?username=ilike.${encodeURIComponent(targetUsername)}&type=eq.${type}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: newAmount,
            updated_at: new Date().toISOString()
          })
        });
      } else {
        await fetch(`${supabaseUrl}/rest/v1/spin_balances`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{
            username: targetUsername,
            type: type,
            amount: newAmount,
            updated_at: new Date().toISOString()
          }])
        });
      }
    }

    // Sync users table & memoryUserStore
    try {
      const userRes = await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(targetUsername)}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      if (userRes.ok) {
        const uRows = await userRes.json();
        if (Array.isArray(uRows) && uRows.length > 0) {
          const u = uRows[0];
          const settings = typeof u.settings === 'object' && u.settings !== null ? u.settings : {};
          const updatedSettings = {
            ...settings,
            ...(type === 'free' ? { freeSpinBalance: newAmount } : { bonusSpinBalance: newAmount, rewardSpinWallet: newAmount })
          };
          const updateBody: any = {
            settings: updatedSettings,
            ...(type === 'free' ? { free_spin_balance: newAmount } : { bonus_spin_balance: newAmount })
          };

          await fetch(`${supabaseUrl}/rest/v1/users?username=ilike.${encodeURIComponent(targetUsername)}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateBody)
          });

          const memU = memoryUserStore.get(targetUsername);
          if (memU) {
            memU.settings = { ...(memU.settings || {}), ...updatedSettings };
            if (type === 'free') memU.free_spin_balance = newAmount;
            if (type === 'bonus') memU.bonus_spin_balance = newAmount;
            memoryUserStore.set(targetUsername, memU);
          }
        }
      }
    } catch (uErr) {
      console.warn("Failed updating users table for spin balance adjust:", uErr);
    }

    // Create Audit Log in transactions table
    const txId = `SPN-ADM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const txType = type === 'free' ? 'admin_spin_ticket_grant' : 'admin_spin_bonus_grant';
    const txDesc = `[AUDIT ADMIN] Admin @${requesterUsername} ${mode === 'add' ? `menambahkan +${numAmount}` : `menyetel menjadi ${newAmount}`} ${type === 'free' ? 'Saldo Spin' : 'Bonus Spin'} [User ID: ${targetUserId || 'N/A'}]. ${note ? `Catatan: ${note}` : ''}`;

    await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        id: txId,
        username: targetUsername,
        type: txType,
        amount: numAmount,
        description: txDesc,
        approved_by: requesterUsername,
        status: 'approved',
        created_at: new Date().toISOString()
      }])
    }).catch(e => console.warn("Transaction audit log error:", e));

    return res.json({
      success: true,
      targetUsername,
      targetUserId,
      type,
      mode,
      oldAmount: currentBal,
      newAmount,
      txId
    });
  } catch (err: any) {
    console.error("Error in /api/lucky-spin/admin/adjust-balance:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Admin Lucky Spin: Atomic Mass Gift spin tickets to all members
app.post("/api/lucky-spin/admin/mass-gift", async (req, res) => {
  try {
    const { requesterUsername, type, amount, note } = req.body;

    const isAdmin = await verifyAdminRoleInSupabase(requesterUsername);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Akses ditolak: Hanya admin yang diizinkan." });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: "Jumlah nominal massal tidak valid (minimal 1)." });
    }

    const targetType = type === 'bonus' ? 'bonus' : 'free';

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Koneksi Supabase tidak tersedia." });
    }

    // Fetch all active member users (role != 'admin')
    const usersRes = await fetch(`${supabaseUrl}/rest/v1/users?select=id,username,role`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    if (!usersRes.ok) {
      return res.status(500).json({ success: false, error: "Gagal mengambil daftar pengguna dari database." });
    }
    const allUsers = await usersRes.json();
    const memberUsers = (allUsers || []).filter((u: any) => u.role !== 'admin' && u.username?.toLowerCase() !== 'admin');

    if (memberUsers.length === 0) {
      return res.status(400).json({ success: false, error: "Tidak ada member aktif untuk dibagikan tiket." });
    }

    // Fetch existing spin_balances for targetType
    const sbRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?type=eq.${targetType}&select=username,amount`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const sbRows = sbRes.ok ? await sbRes.json() : [];
    const sbMap = new Map<string, number>();
    (sbRows || []).forEach((row: any) => {
      if (row.username) sbMap.set(row.username.toLowerCase(), Number(row.amount) || 0);
    });

    // Build atomic bulk payloads
    const nowIso = new Date().toISOString();
    const sbUpsertPayload: any[] = [];
    const txInsertPayload: any[] = [];

    memberUsers.forEach((u: any) => {
      const username = u.username;
      const currentAmt = sbMap.get(username.toLowerCase()) ?? 0;
      const newAmt = currentAmt + numAmount;

      sbUpsertPayload.push({
        username: username,
        type: targetType,
        amount: newAmt,
        updated_at: nowIso
      });

      const txId = `SPN-MASS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      txInsertPayload.push({
        id: txId,
        username: username,
        type: targetType === 'free' ? 'admin_spin_ticket_grant' : 'admin_spin_bonus_grant',
        amount: numAmount,
        description: `[MASS GIFT ADMIN] Admin @${requesterUsername} membagikan +${numAmount} ${targetType === 'free' ? 'Tiket/Saldo Spin' : 'Bonus Spin'} ke seluruh member. ${note ? `Catatan: ${note}` : ''}`,
        approved_by: requesterUsername,
        status: 'approved',
        created_at: nowIso
      });
    });

    // Execute atomic bulk upsert to spin_balances
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/spin_balances?on_conflict=username,type`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(sbUpsertPayload)
    });

    if (!upsertRes.ok) {
      const errText = await upsertRes.text();
      console.error("Mass gift upsert failed:", errText);
      return res.status(500).json({ success: false, error: "Gagal memproses pembagian massal di database." });
    }

    // Insert audit transactions in bulk
    await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(txInsertPayload)
    }).catch(e => console.warn("Mass gift transaction audit error:", e));

    return res.json({
      success: true,
      recipientCount: memberUsers.length,
      amountPerUser: numAmount,
      totalDistributed: memberUsers.length * numAmount
    });
  } catch (err: any) {
    console.error("Error in /api/lucky-spin/admin/mass-gift:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Admin Lucky Spin: Fetch history directly from database transactions table
app.get("/api/lucky-spin/admin/history", async (req, res) => {
  try {
    const requesterUsername = typeof req.query.requesterUsername === 'string' ? req.query.requesterUsername.trim() : '';
    const isAdmin = await verifyAdminRoleInSupabase(requesterUsername);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Akses ditolak: Hanya admin yang diizinkan." });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: "Koneksi Supabase tidak tersedia." });
    }

    const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?or=(type.eq.lucky_spin_reward,type.eq.spin_reward,type.eq.spin_zonk,type.eq.admin_spin_ticket_grant,type.eq.admin_spin_bonus_grant)&order=created_at.desc&limit=300`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });

    const history = txRes.ok ? await txRes.json() : [];
    return res.json({ success: true, history: history || [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Setup Vite Dev Server / Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite HMR integration...");
    const { createServer: createViteServer } = await import("vite");
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
  });
}

export default app;

if (process.env.VERCEL !== '1' && process.env.NOW_BUILD !== '1' && !process.env.VERCEL_ENV) {
  startServer();
}
