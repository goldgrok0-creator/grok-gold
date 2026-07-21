import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { GrokAnalysis } from "../templates";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

interface GrokChatProps {
  analysis: GrokAnalysis;
}

const PRESET_PROMPTS = [
  { label: "Headline Copy Hacks", prompt: "Provide 3 high-impact headline copy variations for this website's hero section that would increase conversion. Explain the psychology behind each." },
  { label: "Competitor Battlecard", prompt: "Draft an aggressive competitor battlecard. If I wanted to launch a competitor to this business, what are their 3 core vulnerabilities and how can I exploit them?" },
  { label: "Monetization Audit", prompt: "Analyze their pricing and monetization model. Suggest 2 alternative revenue streams or upselling tactics they are missing." },
  { label: "SEO Quick Wins", prompt: "Based on your understanding of this site, what are 3 major high-impact content ideas or keyword clusters they should build to dominate search results?" }
];

export default function GrokChat({ analysis }: GrokChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chat with a welcome message when website context changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: `Greetings. I have deeply grokked **${analysis.siteName}**. I've extracted its value rails, target buying audience, monetization strategy, and core tech. 
        
How would you like to optimize this business? Ask me to:
- Re-write landing page copywriting to boost clicks
- Devise a 30-day viral growth and distribution sitemap
- Audit their conversion bottlenecks and pitch solutions`,
        timestamp: new Date()
      }
    ]);
    setError(null);
  }, [analysis.siteName]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/grok/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          grokContext: analysis,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with Grok Gold.");
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          text: data.text,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Something went wrong. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0e12] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl" id="grok-chat-terminal">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#0f1115]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm tracking-tight text-white">Grok Strategy Terminal</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 font-mono rounded border border-amber-500/30">Active context</span>
            </div>
            <p className="text-xs text-gray-400 truncate max-w-[220px]">Analyzing: {analysis.siteName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Dual-core AI</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 text-sm scroll-smooth bg-gradient-to-b from-[#0e0f13] to-[#0c0d10]"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 h-9 w-9 flex items-center justify-center ${
              msg.role === "user" 
                ? "bg-amber-500 text-black font-semibold" 
                : "bg-gray-800 text-amber-400 border border-gray-700"
            }`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" 
                  ? "bg-amber-500 text-black font-medium rounded-tr-none" 
                  : "bg-[#14161e] text-gray-200 border border-gray-800/80 rounded-tl-none shadow-md"
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="p-2 rounded-xl h-9 w-9 bg-gray-800 text-amber-400 border border-gray-700 flex items-center justify-center">
              <Bot size={16} className="animate-spin" />
            </div>
            <div className="flex flex-col">
              <div className="px-4 py-3 bg-[#14161e] border border-gray-800 text-gray-400 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-amber-500" />
                <span>Grokking website dynamics...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold">Query Failed</p>
              <p className="text-gray-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Suggestions */}
      <div className="p-3 bg-[#0a0b0e] border-t border-gray-900">
        <p className="text-[10px] text-amber-500/70 font-mono uppercase tracking-wider mb-2 px-1">Pre-computed Analysis Hacks</p>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset.prompt)}
              disabled={loading}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#12141c] hover:bg-amber-500/10 hover:border-amber-500/30 text-xs text-gray-300 hover:text-amber-400 border border-gray-800 rounded-lg transition-all disabled:opacity-50"
            >
              <Sparkles size={11} className="text-amber-500" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-[#0f1115] border-t border-gray-800 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${analysis.siteName}...`}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-[#090a0d] border border-gray-800 focus:border-amber-500 focus:outline-none rounded-xl text-xs text-gray-200 placeholder-gray-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold rounded-xl transition-all flex items-center justify-center"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
