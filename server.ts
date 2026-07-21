import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

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
  res.json({ serverTime: Date.now() });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
