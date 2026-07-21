export interface ScoreProfile {
  valueProp: number;
  seo: number;
  monetization: number;
  conversion: number;
  ux: number;
}

export interface GoldNugget {
  title: string;
  description: string;
  type: "Copywriting" | "Conversion" | "Monetization" | "UX" | "Growth";
}

export interface AudienceProfile {
  persona: string;
  pains: string[];
  triggers: string[];
}

export interface PricingModel {
  strategy: string;
  estimate: string;
  upsellTricks: string[];
}

export interface TechItem {
  category: string;
  name: string;
}

export interface ContentGap {
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
}

export interface DesignEvaluation {
  colors: string[];
  vibe: string;
  hierarchyFeedback: string;
}

export interface GrokAnalysis {
  siteName: string;
  tagline: string;
  overview: string;
  scores: ScoreProfile;
  goldNuggets: GoldNugget[];
  audience: AudienceProfile;
  pricingModel: PricingModel;
  techStack: TechItem[];
  contentGaps: ContentGap[];
  designEvaluation: DesignEvaluation;
  meta: {
    url: string;
    scraped: boolean;
    groundingUsed: boolean;
    scrapedLength: number;
    analyzedAt: string;
  };
}

export const PRELOADED_SITES: Record<string, GrokAnalysis> = {
  "stripe.com": {
    siteName: "Stripe",
    tagline: "Financial infrastructure for the internet",
    overview: "Stripe is the gold standard of payment processing software and APIs. It is designed to let businesses of all sizes accept payments, send payouts, and manage their businesses online with unparalleled developer experience and global scale.",
    scores: {
      valueProp: 98,
      seo: 92,
      monetization: 96,
      conversion: 95,
      ux: 99
    },
    goldNuggets: [
      {
        title: "Developer-First Copywriting",
        description: "By lead-targeting developers ('Start integration in minutes'), Stripe converts the engineers who influence executive technology-procurement decisions, creating a bottom-up adoption model.",
        type: "Copywriting"
      },
      {
        title: "The Iconic 'Stripe Glow' Layout",
        description: "Uses a custom multi-layered interactive gradient background on the canvas to represent fluid financial transactions, elevating the landing page from boring enterprise to modern elite design.",
        type: "UX"
      },
      {
        title: "Pre-Integrated One-Click Checkout (Link)",
        description: "Stripe natively loads 'Link', saving customers' payment details globally across the internet, reducing mobile checkout friction and driving transaction volumes up to 10-15% higher.",
        type: "Conversion"
      },
      {
        title: "Hidden Premium Monetization Rails",
        description: "While advertising flat-rate transaction pricing, Stripe makes its highest margins on premium add-ons (Atlas, Radar, Tax, Billing) which act as vendor lock-ins with high gross margins.",
        type: "Monetization"
      },
      {
        title: "Adaptive Content Personalization",
        description: "The site auto-detects the visitor's location and business size to emphasize country-specific payment methods (e.g., iDEAL, SEPA, WeChat Pay) and custom enterprise pricing.",
        type: "Growth"
      }
    ],
    audience: {
      persona: "Product Builders & Engineering Leaders",
      pains: [
        "Complex compliance (PCI-DSS, multi-currency VAT).",
        "Legacy payment gateways with poor API documentation.",
        "High churn due to rigid billing and expired cards."
      ],
      triggers: [
        "Launching a new SaaS product and needing payment setups today.",
        "Scaling globally and struggling with local bank rails.",
        "Getting hit by credit card fraud attacks."
      ]
    },
    pricingModel: {
      strategy: "Transactional Commission + Premium Add-ons",
      estimate: "2.9% + $0.30 per transaction (custom volume discounts)",
      upsellTricks: [
        "Atlas company incorporation bundles ($500 one-time).",
        "Billing & Tax automation charged as additional basis points.",
        "Radar advanced fraud detection at $0.02 per transaction."
      ]
    },
    techStack: [
      { category: "Frontend Framework", name: "Next.js / React" },
      { category: "Styles & Layout", name: "Custom CSS / WebGL" },
      { category: "Hosting / CDN", name: "AWS / Custom Cloud Ingress" },
      { category: "Analytics & DB", name: "Segment, Google Tag Manager" },
      { category: "Customer Support", name: "Intercom, Marketo" }
    ],
    contentGaps: [
      {
        title: "Interactive Pricing Calculator",
        description: "Build an interactive slider showing total cost savings of Stripe's automated tax/billing compared to hiring a developer to handle multi-state taxes manually.",
        impact: "High"
      },
      {
        title: "Direct Competitor Comparison Guides",
        description: "Provide direct objective comparisons with Adyen and Braintree, positioning Stripe as the superior option for developer-led startups.",
        impact: "Medium"
      }
    ],
    designEvaluation: {
      colors: ["#635BFF (Stripe Violet)", "#0A2540 (Deep Navy)", "#00D4B2 (Teal)"],
      vibe: "Sleek, High-Tech, Fluid, Ultra-Premium",
      hierarchyFeedback: "Flawless hierarchy. Starts with dynamic mock code blocks alongside the primary value statement, proving technical utility instantly prior to any text explanations."
    },
    meta: {
      url: "stripe.com",
      scraped: true,
      groundingUsed: false,
      scrapedLength: 14205,
      analyzedAt: "2026-07-18T06:00:00Z"
    }
  },
  "linear.app": {
    siteName: "Linear",
    tagline: "The issue tracker you don't hate",
    overview: "Linear is a revolutionary project management tool that focuses on speed, performance, keyboard-shortcuts, and clean design. It is adored by high-performing tech startups and product-led development companies globally.",
    scores: {
      valueProp: 96,
      seo: 88,
      monetization: 92,
      conversion: 90,
      ux: 100
    },
    goldNuggets: [
      {
        title: "Obsessive Speed-First Pitching",
        description: "Linear communicates its core values (Performance, Keyboard Shortcuts, Offline Support) as structural benefits rather than simple visual features, showing instead of telling.",
        type: "Copywriting"
      },
      {
        title: "Liquid Ambient Dark Mode",
        description: "An incredible deep grey/obsidian canvas offset with bright high-contrast glowing neon gridlines and smooth physics-based vector canvas visual accents.",
        type: "UX"
      },
      {
        title: "The Shortcut Experience Playground",
        description: "Interactive UI overlay mockup on the landing page that responds directly to keyboard presses, demonstrating the app's real UX instantly to visitors.",
        type: "Conversion"
      },
      {
        title: "Low Barrier To Entry Freemium",
        description: "Fully featured free plan for teams up to 10 users, generating massive developer-advocacy loops that easily force bottom-up corporate transitions to paid tiers.",
        type: "Monetization"
      }
    ],
    audience: {
      persona: "Product Managers & Software Engineers",
      pains: [
        "Bloated, slow, and overly customizable legacy PM tools (Jira).",
        "Losing focus due to excessive page reloads and context switching.",
        "Clunky workflow setups that block speed-of-release."
      ],
      triggers: [
        "Frustration with Jira loading spinners during standup.",
        "Setting up a new Y-Combinator startup from scratch.",
        "Desire to build a highly aligned and rapid product team."
      ]
    },
    pricingModel: {
      strategy: "Freemium SaaS Tiered Subscription",
      estimate: "Free / $8 / $14 per user per month",
      upsellTricks: [
        "Unlimited history blockages on the Free Tier.",
        "Enterprise tier focusing on SAML/SSO compliance locks.",
        "Highlighting 'Most Popular' pricing package with subtle golden glowing borders."
      ]
    },
    techStack: [
      { category: "Frontend Framework", name: "React, Next.js" },
      { category: "Styles & Animation", name: "Tailwind CSS, Framer Motion" },
      { category: "State & Realtime", name: "Yjs, WebSockets, IndexedDB" },
      { category: "Hosting / Ingress", name: "Vercel, AWS" }
    ],
    contentGaps: [
      {
        title: "Direct 'Migrate from Jira' Auto-Importer",
        description: "An interactive UI preview detailing how easy it is to upload a Jira backup and import and format everything in under 60 seconds.",
        impact: "High"
      }
    ],
    designEvaluation: {
      colors: ["#121214 (Obsidian)", "#FFFFFF (Paper White)", "#F5A623 (Glowing Gold)"],
      vibe: "Minimal, Brutalist Precision, Kinetic, Performance-First",
      hierarchyFeedback: "Outstanding spacing rhythm. Extreme margins, crisp 1px borders, and generous breathing room. Uses custom keyboard shortcut tags as secondary visual accents."
    },
    meta: {
      url: "linear.app",
      scraped: true,
      groundingUsed: false,
      scrapedLength: 11042,
      analyzedAt: "2026-07-18T06:15:00Z"
    }
  },
  "airbnb.com": {
    siteName: "Airbnb",
    tagline: "Book unique places to stay and things to do",
    overview: "Airbnb is a peer-to-peer marketplace for lodging, primary homestays, and tourism experiences. It focuses on beautiful travel imagery, reviews, localized experiences, and massive consumer trust.",
    scores: {
      valueProp: 94,
      seo: 95,
      monetization: 97,
      conversion: 96,
      ux: 95
    },
    goldNuggets: [
      {
        title: "Double-Sided Value Copywriting",
        description: "Natively speaks to both travelers (desiring unique, homey stays) and hosts (desiring extra passive income), cleanly segmenting marketing rails.",
        type: "Copywriting"
      },
      {
        title: "Immersive Map-Based Searching",
        description: "Locks search listings and real-time interactive mapping side-by-side, allowing users to scroll geographically and visually audit prices simultaneously.",
        type: "UX"
      },
      {
        title: "Progressive Booking Flow",
        description: "Hides additional fees, cleaning charges, and tax costs until the final review screen to maximize session length, checkout interest, and deposit commits.",
        type: "Conversion"
      },
      {
        title: "Two-Way Feedback Loop Trust",
        description: "Enforces mutual rating systems between hosts and travelers to ensure safety and behavioral standards, solving the peer-to-peer trust gap.",
        type: "Growth"
      }
    ],
    audience: {
      persona: "Leisure Travelers & Property Investors",
      pains: [
        "Sterile, overpriced, and uniform traditional hotels.",
        "Unreliable tourist listings and scam sites.",
        "Underutilized properties draining host mortgages."
      ],
      triggers: [
        "Planning a summer family vacation or remote work trip.",
        "Wanting to stay like a local in a major international city.",
        "Needing a passive income strategy for a spare room."
      ]
    },
    pricingModel: {
      strategy: "Double-Sided Service Commissions",
      estimate: "Host Fee (~3%) + Guest Service Fee (~14.2%)",
      upsellTricks: [
        "Highlighted Host Cover insurance (AirCover) upsell.",
        "Experiences and Co-Hosting recommendations during lodging checkouts."
      ]
    },
    techStack: [
      { category: "Frontend Framework", name: "React, Next.js" },
      { category: "Design Language", name: "DLS (Design Language System)" },
      { category: "Maps / Location", name: "Google Maps Platform APIs" },
      { category: "Hosting / Infrastructure", name: "AWS, Chef" }
    ],
    contentGaps: [
      {
        title: "Live Host ROI Calculator widget",
        description: "Interactive slider where users enter their city and bedroom count, instantly visualizing average monthly earnings based on regional historical Airbnb rates.",
        impact: "High"
      }
    ],
    designEvaluation: {
      colors: ["#FF5A5F (Rausch Red)", "#484848 (Dark Charcoal)", "#FFFFFF"],
      vibe: "Warm, Trustworthy, Friendly, Travel-Immersive",
      hierarchyFeedback: "Heavy reliance on image density and custom rounded corners. Typography is thick and easy to read, optimized for instant recognition of prices and stars."
    },
    meta: {
      url: "airbnb.com",
      scraped: true,
      groundingUsed: true,
      scrapedLength: 9530,
      analyzedAt: "2026-07-18T06:22:00Z"
    }
  }
};
