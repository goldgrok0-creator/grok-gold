import React, { useState, useEffect, useRef } from 'react';
import { PricePoint, NewsItem, GameStats } from '../types';
import { Sparkles, Send, TrendingUp, TrendingDown, RefreshCw, BarChart2, Globe, Cpu, Loader2 } from 'lucide-react';

interface GrokMarketDashboardProps {
  stats: GameStats;
}

const FUNNY_NEWS_TEMPLATES: Omit<NewsItem, 'id' | 'timestamp'>[] = [
  {
    title: "Elon Musk tweets 'Grok Gold is literal space energy'—prices spike!",
    impact: 'bullish',
    body: "After a 3-word tweet containing a rocket ship, Mars, and a solid gold CyberTruck, volume on the Grok Gold Exchange skyrocketed 450% within minutes."
  },
  {
    title: "SEC attempts to subpoena Asteroid Psyche-16 for unlicenced mining",
    impact: 'bearish',
    body: "In an unprecedented move, regulatory officers demand space miners pause claw extractions pending a full-scale environmental and celestial audit."
  },
  {
    title: "Localized cosmic radiation storm reported in Sector 4",
    impact: 'neutral',
    body: "Solar winds are causing slight telemetry calibration lags. Planetary regulators advise grounding low-voltage claws temporarily."
  },
  {
    title: "Warp core leak at rival gold operation floods deep space market",
    impact: 'bearish',
    body: "Overproduction of synthetic gold cores in Andromeda leads to temporary supply glut, testing the support levels of G-USD trading bands."
  },
  {
    title: "Grok V3 Core Upgrade solves 5D mining vector math",
    impact: 'bullish',
    body: "Onboard supercomputers successfully optimize quantum mining paths. Claw extraction speeds predicted to reach historical efficiency highs."
  },
  {
    title: "Wrapped Grok Gold (wGG) token launches on Solana, rugs in 3 minutes",
    impact: 'neutral',
    body: "Speculators lost 14 million credits after a meme coin pool named after gold claws vanished. Experts repeat: 'Stick to physical cosmic mining!'"
  }
];

export default function GrokMarketDashboard({ stats }: GrokMarketDashboardProps) {
  // Live fluctuating price state
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1420);
  const [priceChange, setPriceChange] = useState(2.4);
  const [activeNews, setActiveNews] = useState<NewsItem[]>([]);
  
  // Chat state with Grok API
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'grok'; text: string }[]>([
    { 
      sender: 'grok', 
      text: "Onboard Grok Oracle v3.5 online. I see you've got some mining credit. Want to know why cosmic gold is crushing traditional fiat, or need my expert advice on steering your quantum claw? Ask away." 
    }
  ]);
  const [isAskingGrok, setIsAskingGrok] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Price Chart and News
  useEffect(() => {
    // Generate initial history (30 points)
    let startPrice = 1380;
    const history: PricePoint[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const pointTime = new Date(now.getTime() - i * 60000);
      const vol = Math.floor(100 + Math.random() * 300);
      const change = (Math.random() - 0.48) * 15;
      startPrice = Math.max(800, startPrice + change);
      
      history.push({
        time: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        price: Math.round(startPrice),
        volume: vol
      });
    }
    
    setPricePoints(history);
    setCurrentPrice(Math.round(startPrice));

    // Generate initial news items
    const initialNews: NewsItem[] = [
      {
        id: '1',
        timestamp: '14:52',
        title: "Mining Federation approves Claw Upgrade Subsidies",
        impact: 'bullish',
        body: "All certified pilots can claim a 15% discount on titanium cable structures starting this fiscal cycle."
      },
      {
        id: '2',
        timestamp: '14:15',
        title: "Gold-dense asteroid cluster spotted near Jupiter",
        impact: 'neutral',
        body: "A high-density stellar swarm is drifting near Sector 9. High-vantage claws are setting up orbital traps."
      }
    ];
    setActiveNews(initialNews);
  }, []);

  // Price Tick Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPricePoints(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        
        // Random price fluctuation
        const drift = 0.5; // slight upward drift
        const change = (Math.random() - 0.5 + drift / 10) * 12;
        const nextPrice = Math.max(500, Math.round(last.price + change));
        const vol = Math.floor(120 + Math.random() * 250);
        
        const now = new Date();
        const nextPoint: PricePoint = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: nextPrice,
          volume: vol
        };
        
        setCurrentPrice(nextPrice);
        
        // Calculate percentage change compared to the start of history
        const initial = prev[0].price;
        const pct = ((nextPrice - initial) / initial) * 100;
        setPriceChange(parseFloat(pct.toFixed(2)));

        // Keep last 30 points
        const sliced = prev.slice(1);
        return [...sliced, nextPoint];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // News ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random funny news item
      const template = FUNNY_NEWS_TEMPLATES[Math.floor(Math.random() * FUNNY_NEWS_TEMPLATES.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newNews: NewsItem = {
        id: Math.random().toString(),
        timestamp: timeStr,
        ...template
      };

      // Slide-in news and slightly bump price according to news impact
      setActiveNews(prev => [newNews, ...prev.slice(0, 4)]);

      // Price jump based on impact
      setPricePoints(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        let priceShift = 0;
        if (newNews.impact === 'bullish') priceShift = Math.random() * 25 + 10;
        else if (newNews.impact === 'bearish') priceShift = -(Math.random() * 25 + 10);
        
        const nextPrice = Math.max(500, Math.round(last.price + priceShift));
        const updated = [...prev];
        updated[updated.length - 1].price = nextPrice;
        setCurrentPrice(nextPrice);
        return updated;
      });

    }, 18000); // news every 18 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isAskingGrok]);

  // Handle Grok Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAskingGrok) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsAskingGrok(true);

    try {
      const response = await fetch('/api/grok/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          stats: {
            level: stats.level,
            gold: stats.gold,
            targetGold: stats.targetGold,
            upgradesCount: stats.upgradesCount,
            multiplier: stats.multiplier
          }
        })
      });

      const data = await response.json();
      setChatLog(prev => [...prev, { sender: 'grok', text: data.text || 'Error communicating with AI core. Subroutines disrupted.' }]);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { sender: 'grok', text: "🚨 Connection throttled by galactic grid. Ensure local API keys are properly configured!" }]);
    } finally {
      setIsAskingGrok(false);
    }
  };

  // Quick prompt presets for user
  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

  // Render SVG Chart paths
  const renderChartSvg = () => {
    if (pricePoints.length === 0) return null;
    
    const width = 500;
    const height = 180;
    const padding = 15;
    
    const prices = pricePoints.map(p => p.price);
    const minPrice = Math.min(...prices) * 0.99;
    const maxPrice = Math.max(...prices) * 1.01;
    const priceRange = maxPrice - minPrice;

    // Map coordinates
    const coords = pricePoints.map((p, index) => {
      const x = padding + (index / (pricePoints.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p.price - minPrice) / priceRange) * (height - padding * 2);
      return { x, y };
    });

    // Make SVG line path
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      d += ` L ${coords[i].x} ${coords[i].y}`;
    }

    // Area path for gradient fill under the line
    const areaD = `${d} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

    const isBullish = priceChange >= 0;

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isBullish ? '#10B981' : '#EF4444'} stopOpacity="0.25" />
            <stop offset="100%" stopColor={isBullish ? '#10B981' : '#EF4444'} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((ratio, i) => {
          const y = padding + ratio * (height - padding * 2);
          const gridVal = Math.round(maxPrice - ratio * priceRange);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(245, 158, 11, 0.04)" strokeWidth="1" />
              <text x={padding + 5} y={y - 4} fill="rgba(245, 158, 11, 0.35)" fontSize="9" fontFamily="monospace">
                {gridVal} G-USD
              </text>
            </g>
          );
        })}

        {/* The Area fill */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* The Line */}
        <path d={d} fill="none" stroke={isBullish ? '#10B981' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive glow at current end coordinate */}
        {coords.length > 0 && (
          <g>
            <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="5" fill={isBullish ? '#10B981' : '#EF4444'} className="animate-ping" style={{ transformOrigin: `${coords[coords.length - 1].x}px ${coords[coords.length - 1].y}px` }} />
            <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3.5" fill={isBullish ? '#34D399' : '#F87171'} stroke="#0F172A" strokeWidth="1" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div id="grok-market-dashboard" className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      
      {/* LEFT PANEL: GGE Trading Terminal (Chart & News) */}
      <div className="flex flex-col bg-slate-900 border border-amber-500/20 rounded-xl p-4 shadow-xl select-none">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-sans font-bold text-amber-100 text-sm tracking-wider uppercase">Grok Gold Exchange (GGE)</h3>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-500 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">LIVE GGE FEED</span>
          </div>
        </div>

        {/* Spot Price Display */}
        <div className="flex items-end justify-between bg-slate-950/50 rounded-lg p-3 border border-amber-500/5 mb-3 font-mono">
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">GGE SPOT PRICE</div>
            <div className="text-2xl font-bold text-amber-400 font-sans tracking-tight">
              {currentPrice.toLocaleString()} <span className="text-xs text-slate-400">G-USD/oz</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">24H ORBIT FLUX</div>
            <div className={`text-sm font-bold flex items-center justify-end gap-1 ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`}</span>
            </div>
          </div>
        </div>

        {/* Simulated Technical Chart */}
        <div className="bg-slate-950 rounded-lg p-2 border border-slate-800/80 h-[190px] relative flex items-center justify-center">
          {pricePoints.length > 0 ? (
            renderChartSvg()
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500 font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Calibrating GGE Spot Feed...</span>
            </div>
          )}
        </div>

        {/* Dynamic Space Ticker News */}
        <div className="mt-4 flex-grow flex flex-col min-h-[140px]">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
            <Cpu className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Interstellar Press Wire</span>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-2 max-h-[160px] pr-1 scrollbar-thin">
            {activeNews.map(news => (
              <div key={news.id} className="p-2 bg-slate-950/40 rounded border border-slate-800/80 hover:border-slate-800 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{news.timestamp}</span>
                  <span className="text-slate-200 text-[11px] font-semibold leading-snug">{news.title}</span>
                  <span className={`text-[9px] font-mono uppercase px-1 py-0.5 rounded flex-shrink-0 font-bold border ${
                    news.impact === 'bullish' 
                      ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                      : news.impact === 'bearish'
                        ? 'bg-red-500/5 text-red-400 border-red-500/10'
                        : 'bg-slate-800 text-slate-400 border-slate-700/50'
                  }`}>
                    {news.impact}
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] mt-1 font-mono leading-relaxed">{news.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Grok Oracle Consulting Console */}
      <div className="flex flex-col bg-slate-900 border border-amber-500/20 rounded-xl p-4 shadow-xl">
        
        {/* Console Header */}
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-sans font-bold text-amber-100 text-sm tracking-wider uppercase">Onboard Grok Oracle</h3>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            ORACLE ONLINE
          </span>
        </div>

        {/* Chat Output Feed */}
        <div className="flex-grow bg-slate-950 rounded-lg p-3 border border-slate-800/80 overflow-y-auto h-[260px] flex flex-col space-y-3 scrollbar-thin">
          {chatLog.map((log, i) => (
            <div 
              key={i} 
              className={`flex flex-col max-w-[85%] ${log.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <span className="text-[8px] font-mono text-slate-500 mb-0.5 uppercase font-bold">
                {log.sender === 'user' ? 'Miner Pilot' : 'Grok Oracle'}
              </span>
              <div className={`p-2.5 rounded-lg text-xs leading-relaxed font-mono ${
                log.sender === 'user' 
                  ? 'bg-amber-500/10 border border-amber-500/35 text-amber-300' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
              }`}>
                {log.text}
              </div>
            </div>
          ))}
          
          {isAskingGrok && (
            <div className="self-start flex items-center gap-2 text-slate-500 font-mono text-xs p-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span>Grok AI is running vector path predictions...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick query tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button 
            type="button"
            onClick={() => handleQuickPrompt("Analyze my current mining statistics.")}
            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 rounded px-2 py-1 transition-all"
          >
            📊 Stat Analysis
          </button>
          <button 
            type="button"
            onClick={() => handleQuickPrompt("What's the current state of Psyche-16 space gold speculation?")}
            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 rounded px-2 py-1 transition-all"
          >
            ☄️ Psyche-16 Speculation
          </button>
          <button 
            type="button"
            onClick={() => handleQuickPrompt("Give me a motivational space mining slogan.")}
            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 rounded px-2 py-1 transition-all"
          >
            ⚡ Slogan
          </button>
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Query Grok AI Oracle..."
            className="flex-grow bg-slate-950 border border-slate-800 rounded-lg p-2 px-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim() || isAskingGrok}
            className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="Query Grok"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
