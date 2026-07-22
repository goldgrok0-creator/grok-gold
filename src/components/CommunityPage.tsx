import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, MessageCircle, Send, MessageSquare, 
  Users, Activity, Sparkles, ExternalLink, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { supabase } from '../supabase';

export interface CommunityMessage {
  id: string;
  user_id?: string | null;
  username: string;
  avatar_url?: string | null;
  message: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'grockgold_community_messages_v1';

const SEED_MESSAGES: CommunityMessage[] = [
  {
    id: 'seed-1',
    username: 'andi_wijaya',
    message: 'Mantap gan! Hashing hashrate saya hari ini tembus +12% profit harian.',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'seed-2',
    username: 'sari_grock',
    message: 'Ada yang tahu min WD hari ini berapa ya?',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'seed-3',
    username: 'm_ikbal',
    message: 'Min WD cuma Rp 100.000 saja kak, prosesnya super instan langsung masuk!',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'seed-4',
    username: 'admin',
    message: 'Selamat bergabung semuanya! Silakan hubungi Telegram Group untuk panduan claim welcome bonus 1.8M.',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  }
];

function getLocalStoredMessages(): CommunityMessage[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveLocalMessage(msg: CommunityMessage) {
  try {
    const existing = getLocalStoredMessages();
    const updated = [...existing.filter(m => m.id !== msg.id), msg].slice(-100);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export const CommunityPage: React.FC = () => {
  const { state, currentAccount, language, setCurrentTab, triggerModal } = useAppState();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [activeMembers, setActiveMembers] = useState<number>(0);
  const [totalContracts, setTotalContracts] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Social Community Links configured via env or fallbacks
  const waUrl = (import.meta as any).env?.VITE_COMMUNITY_WA_URL || '';
  const telegramUrl = (import.meta as any).env?.VITE_COMMUNITY_TELEGRAM_URL || '';
  const discordUrl = (import.meta as any).env?.VITE_COMMUNITY_DISCORD_URL || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial real-time community messages
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setLoading(true);
      const localMsgs = getLocalStoredMessages();
      let combined: CommunityMessage[] = [...SEED_MESSAGES, ...localMsgs];

      try {
        // Fetch messages from Supabase
        const { data, error } = await supabase
          .from('community_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100);

        if (!error && data && Array.isArray(data) && data.length > 0) {
          const remoteMsgs = data as CommunityMessage[];
          // Merge remote + local + seed deduplicating by ID
          const existingIds = new Set(remoteMsgs.map(m => m.id));
          const localOnly = combined.filter(m => !existingIds.has(m.id));
          combined = [...remoteMsgs, ...localOnly];
        }

        // Fetch Total Members from Supabase users table (strictly exclude admin accounts)
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .neq('username', 'admin')
          .neq('role', 'admin');

        if (typeof usersCount === 'number' && isMounted) {
          setTotalMembers(usersCount);
        } else if (isMounted) {
          setTotalMembers(state.holders?.length || 1);
        }

        // Fetch Active Members (users with active contracts or balance, strictly exclude admin)
        const { count: activeCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .neq('username', 'admin')
          .neq('role', 'admin')
          .gt('active_contracts', 0);

        if (typeof activeCount === 'number' && isMounted) {
          setActiveMembers(activeCount);
        } else if (isMounted) {
          const countFromHolders = state.holders?.filter(h => h.contracts > 0).length || 0;
          setActiveMembers(countFromHolders);
        }

        // Fetch Total Active Mining Units across system
        const { count: contractsCount } = await supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true });

        if (typeof contractsCount === 'number' && isMounted) {
          setTotalContracts(contractsCount);
        } else if (isMounted) {
          const units = state.holders?.reduce((acc, h) => acc + (h.contracts || 0), 0) || state.activeContracts || 0;
          setTotalContracts(units);
        }

      } catch (err) {
        console.error('Failed to fetch community data:', err);
      } finally {
        if (isMounted) {
          // Deduplicate combined messages strictly by ID
          const seenIds = new Set<string>();
          const deduplicated: CommunityMessage[] = [];
          for (const m of combined) {
            const mId = m.id || `msg-${Math.random().toString(36).substring(2, 7)}`;
            if (!seenIds.has(mId)) {
              seenIds.add(mId);
              deduplicated.push({ ...m, id: mId });
            }
          }
          // Sort chronologically
          deduplicated.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          setMessages(deduplicated);
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    // 1. Subscribe to real-time inserts on community_messages table with a unique channel name
    const chatChannelName = `community_messages_${Math.random().toString(36).substring(2, 9)}`;
    const chatChannel = supabase
      .channel(chatChannelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          if (!isMounted) return;
          const newMsg = payload.new as CommunityMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    // 2. Supabase Realtime Presence for Online Users Count
    const currentKey = state.username || `guest_${Math.random().toString(36).substring(2, 7)}`;
    const presenceChannelName = `community_presence_${Math.random().toString(36).substring(2, 9)}`;
    const presenceChannel = supabase.channel(presenceChannelName, {
      config: { presence: { key: currentKey } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        if (!isMounted) return;
        const presenceState = presenceChannel.presenceState();
        const count = Object.keys(presenceState).length;
        setOnlineCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            username: state.username || 'guest',
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [state.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getActiveUsername = (): string => {
    if (currentAccount?.username) return currentAccount.username;
    if (state.username && state.username.trim() !== '') return state.username;
    const stored = localStorage.getItem('grockgold_logged_in_username_v4');
    if (stored && stored.trim() !== '') return stored;
    
    let guest = localStorage.getItem('grockgold_guest_username');
    if (!guest) {
      guest = 'Member_' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('grockgold_guest_username', guest);
    }
    return guest;
  };

  const activeUsername = getActiveUsername();

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = chatInput.trim();
    if (!trimmed) return;

    if (trimmed.length > 500) {
      triggerModal(
        language === 'id' 
          ? 'Pesan terlalu panjang (maksimal 500 karakter).' 
          : 'Message too long (maximum 500 characters).',
        'error'
      );
      return;
    }

    setSending(true);
    try {
      // Get authenticated user ID from Supabase auth if available
      let authUserId: string | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (user?.id && uuidRegex.test(user.id)) {
          authUserId = user.id;
        } else if (state.userId && uuidRegex.test(state.userId)) {
          authUserId = state.userId;
        }
      } catch (e) {
        console.warn('Could not fetch supabase auth user:', e);
      }

      const activeUser = activeUsername;

      const newMsgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newMsg: CommunityMessage = {
        id: newMsgId,
        user_id: authUserId,
        username: activeUser,
        avatar_url: state.profileImage || null,
        message: trimmed,
        created_at: new Date().toISOString()
      };

      // 1. Optimistically append & save locally right away
      setMessages((prev) => [...prev, newMsg]);
      saveLocalMessage(newMsg);
      setChatInput('');

      // 2. Fire Supabase insert in background
      const payload: Record<string, any> = {
        username: newMsg.username,
        avatar_url: newMsg.avatar_url,
        message: newMsg.message,
        created_at: newMsg.created_at
      };
      if (newMsg.user_id) {
        payload.user_id = newMsg.user_id;
      }

      const { data, error } = await supabase
        .from('community_messages')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase message sync notice (saved locally):', error.message);
      } else if (data) {
        // Replace temp msg with real database record
        setMessages((prev) => prev.map((m) => (m.id === newMsgId ? (data as CommunityMessage) : m)));
        saveLocalMessage(data as CommunityMessage);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Helper to open social URLs safely
  const openSocialLink = (url: string, name: string) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      triggerModal(
        language === 'id' 
          ? `Grup ${name} segera hadir! Link resmi akan dipublikasikan oleh tim administrator.` 
          : `${name} group coming soon! Official link will be published by admins.`,
        'info'
      );
    }
  };

  // Format time display
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
        <div className="flex items-center gap-2">
          <ChevronLeft 
            className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" 
            onClick={() => setCurrentTab('home')} 
          />
          <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-orbitron">
            {language === 'id' ? 'KOMUNITAS RESMI' : 'OFFICIAL COMMUNITY'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[9px] font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME CONNECTED</span>
        </div>
      </div>

      {/* Member & Network Stats (Real Data Only) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
          <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">
            {language === 'id' ? 'Total Anggota' : 'Total Members'}
          </span>
          <span className="text-xs font-black text-emerald-400 font-mono">
            {totalMembers.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
          <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">
            {language === 'id' ? 'Member Aktif' : 'Active Members'}
          </span>
          <span className="text-xs font-black text-cyan-400 font-mono">
            {activeMembers.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
          <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">
            {language === 'id' ? 'Kontrak Mining' : 'Mining Units'}
          </span>
          <span className="text-xs font-black text-amber-400 font-mono">
            {totalContracts.toLocaleString('id-ID')} Unit
          </span>
        </div>
      </div>

      {/* Social Groups Grid */}
      <div className="bg-[#0b0519] border border-emerald-500/15 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>{language === 'id' ? 'Gabung Komunitas Kami' : 'Join Our Communities'}</span>
          <span className="text-[8px] text-slate-400 font-semibold">{language === 'id' ? 'Saluran Resmi' : 'Official Channels'}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 font-sans">
          {/* WhatsApp Button */}
          <button
            onClick={() => openSocialLink(waUrl, 'WhatsApp VVIP Lounge')}
            className="w-full p-3 rounded-2xl bg-[#091f14] border border-emerald-500/20 hover:border-emerald-400/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white leading-none">WhatsApp VVIP Lounge</div>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">
                  {waUrl ? (language === 'id' ? 'Grup WhatsApp Resmi' : 'Official WhatsApp Group') : (language === 'id' ? 'Segera Hadir / Coming Soon' : 'Coming Soon')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-black group-hover:translate-x-1 transition-transform">
              <span>{waUrl ? 'JOIN' : 'INFO'}</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </button>

          {/* Telegram Button */}
          <button
            onClick={() => openSocialLink(telegramUrl, 'Telegram Official')}
            className="w-full p-3 rounded-2xl bg-[#0a1829] border border-blue-500/20 hover:border-blue-400/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Send className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white leading-none">Telegram GrockGold Indo</div>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">
                  {telegramUrl ? (language === 'id' ? 'Channel Telegram Resmi' : 'Official Telegram Channel') : (language === 'id' ? 'Segera Hadir / Coming Soon' : 'Coming Soon')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-black group-hover:translate-x-1 transition-transform">
              <span>{telegramUrl ? 'JOIN' : 'INFO'}</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </button>

          {/* Discord Button */}
          <button
            onClick={() => openSocialLink(discordUrl, 'Discord Global Server')}
            className="w-full p-3 rounded-2xl bg-[#110e24] border border-indigo-500/20 hover:border-indigo-400/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white leading-none">Discord Global Server</div>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">
                  {discordUrl ? (language === 'id' ? 'Server Discord Resmi' : 'Official Discord Server') : (language === 'id' ? 'Segera Hadir / Coming Soon' : 'Coming Soon')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-indigo-400 font-black group-hover:translate-x-1 transition-transform">
              <span>{discordUrl ? 'JOIN' : 'INFO'}</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      {/* Chatroom Live Discussion */}
      <div className="bg-[#0b0519] border border-purple-500/10 rounded-3xl p-4 shadow-xl space-y-3 flex flex-col h-[380px]">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-1 flex justify-between items-center font-sans">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            {language === 'id' ? 'Obrolan Komunitas (Real-time Supabase)' : 'Community Chat (Supabase Realtime)'}
          </span>
          <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {onlineCount.toLocaleString('id-ID')} ONLINE
          </span>
        </div>

        {/* Chat Messages Scrolling viewport */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin text-left">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>{language === 'id' ? 'Memuat pesan komunitas...' : 'Loading community chat...'}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Sparkles className="w-8 h-8 text-purple-400/40 mb-2" />
              <p className="text-xs font-bold text-slate-300">
                {language === 'id' ? 'Belum ada pesan' : 'No messages yet'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[220px]">
                {language === 'id' 
                  ? 'Jadilah anggota pertama yang menyapa anggota komunitas!' 
                  : 'Be the first member to start the conversation!'}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSelf = Boolean(
                activeUsername && 
                msg.username && 
                msg.username.toLowerCase() === activeUsername.toLowerCase()
              );
              const initials = (msg.username || 'U').slice(0, 2).toUpperCase();
              const formattedTime = formatTime(msg.created_at);
              const itemKey = msg.id ? `${msg.id}-${idx}` : `msg-${idx}`;

              return (
                <div key={itemKey} className={`flex items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar or Initials */}
                  {msg.avatar_url ? (
                    <img 
                      src={msg.avatar_url} 
                      alt={msg.username} 
                      className="w-7.5 h-7.5 rounded-full object-cover border border-purple-500/30" 
                    />
                  ) : (
                    <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0 ${
                      isSelf 
                        ? 'bg-gradient-to-r from-yellow-300 to-amber-500 border-yellow-400 text-black' 
                        : 'bg-purple-900/45 text-purple-200 border-purple-800/30'
                    }`}>
                      {initials}
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[75%] ${isSelf ? 'items-end' : 'items-start'} font-sans`}>
                    <span className="text-[8px] font-black text-slate-400 mb-0.5 flex items-center gap-1">
                      @{msg.username}
                      {msg.username.toLowerCase() === 'admin' && (
                        <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1 rounded text-[7px] font-bold">
                          STAFF
                        </span>
                      )}
                    </span>
                    <div className={`p-2.5 rounded-2xl text-[10px] font-semibold leading-normal break-words ${
                      isSelf 
                        ? 'bg-purple-800/25 text-yellow-300 border border-purple-500/30 rounded-tr-none' 
                        : 'bg-white/[0.03] text-slate-200 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                    {formattedTime && (
                      <span className="text-[7.5px] text-slate-500 mt-1 font-mono">{formattedTime}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-white/5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={sending}
            placeholder={
              language === 'id' 
                ? `Ketik pesan Anda (@${activeUsername})...` 
                : `Type message (@${activeUsername})...`
            }
            className="flex-1 bg-black/55 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/40 disabled:opacity-50 font-sans"
          />
          <button
            type="submit"
            disabled={sending || !chatInput.trim()}
            className="px-4 bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 hover:brightness-110 active:scale-95 text-black font-extrabold rounded-xl text-xs uppercase cursor-pointer disabled:opacity-40 transition flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
