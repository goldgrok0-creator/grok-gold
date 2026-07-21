import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, MessageCircle, Send, MessageSquare, Bell, AlertTriangle, 
  Terminal, RefreshCw, HelpCircle, Info, Download, ArrowDown, Gift, ArrowUp
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useAdmin } from '../hooks/useAdmin';
import { CONFIG } from '../types';
import { TRANSLATIONS } from '../translations';

// ==========================================
// 👥 COMMUNITY PAGE
// ==========================================
export const CommunityPage: React.FC = () => {
  const { state, language, setCurrentTab, triggerModal } = useAppState();
  const [chatInput, setChatInput] = useState('');
  const [communityMessages, setCommunityMessages] = useState([
    {
      id: '1',
      user: 'reza_gold',
      text: 'Baru gabung kemarin langsung lancar WD Rp 150.000, mantap PT GrockGold!',
      time: '12:34',
      initials: 'RG',
      isSelf: false
    },
    {
      id: '2',
      user: 'admin',
      text: 'Halo @reza_gold! Selamat bergabung di platform penambangan terdesentralisasi kami. Happy Mining!',
      time: '12:40',
      initials: 'AD',
      isSelf: false
    },
    {
      id: '3',
      user: 'dewi_sari',
      text: 'Booster EXC-700 nambah speed hashrate beneran kerasa 1.5x lebih kencang.',
      time: '13:01',
      initials: 'DS',
      isSelf: false
    }
  ]);

  const t = TRANSLATIONS[language];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg = {
      id: Date.now().toString(),
      user: state.username.toLowerCase(),
      text: chatInput,
      time: timeStr,
      initials: state.username.slice(0, 2).toUpperCase(),
      isSelf: true
    };
    setCommunityMessages(prev => [...prev, newMsg]);
    setChatInput('');
    
    // Auto Response Simulation
    setTimeout(() => {
      const botNames = ['andi_wijaya', 'sari_grock', 'm_ikbal', 'admin'];
      const botInitials = ['AW', 'SG', 'MI', 'AD'];
      const botResponses = [
        'Mantap gan! Hashing hashrate saya hari ini tembus 12% profit harian.',
        'Ada yang tahu min WD hari ini berapa ya?',
        'Min WD cuma Rp 100.000 saja kak, prosesnya super instan langsung masuk!',
        'Selamat bergabung semuanya! Silakan hubungi Telegram Group untuk panduan claim welcome bonus 1.8M.'
      ];
      const idx = Math.floor(Math.random() * botResponses.length);
      setCommunityMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        user: botNames[idx],
        text: botResponses[idx],
        time: timeStr,
        initials: botInitials[idx],
        isSelf: false
      }]);
    }, 2000);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-orbitron">
          {language === 'id' ? 'KOMUNITAS RESMI' : 'OFFICIAL COMMUNITY'}
        </h2>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
          <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">{language === 'id' ? 'Anggota' : 'Members'}</span>
          <span className="text-xs font-black text-emerald-400 font-mono">124.8K</span>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
          <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">{language === 'id' ? 'Aktif' : 'Active'}</span>
          <span className="text-xs font-black text-cyan-400 font-mono">42.9K</span>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 text-center">
          <span className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">Hashrate</span>
          <span className="text-xs font-black text-yellow-500 font-mono">4.82 EH/s</span>
        </div>
      </div>

      {/* Social Groups Grid */}
      <div className="bg-[#0b0519] border border-emerald-500/15 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
          {language === 'id' ? 'Gabung Komunitas Kami' : 'Join Our Communities'}
        </div>

        <div className="grid grid-cols-1 gap-2 font-sans">
          <button
            onClick={() => {
              triggerModal(language === 'id' ? '🎉 Berhasil terhubung ke WhatsApp VIP Lounge!' : '🎉 Connected to WhatsApp VIP Lounge!', 'success');
            }}
            className="w-full p-3 rounded-2xl bg-[#091f14] border border-emerald-500/20 hover:border-emerald-400/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white leading-none">WhatsApp VVIP Lounge</div>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">{language === 'id' ? 'Khusus Deposit Premium' : 'Premium Depositors Only'}</span>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-black group-hover:translate-x-1 transition-transform">JOIN ➔</span>
          </button>

          <button
            onClick={() => {
              triggerModal(language === 'id' ? '🎉 Berhasil terhubung ke Telegram GrockGold Official!' : '🎉 Connected to Telegram GrockGold Official!', 'success');
            }}
            className="w-full p-3 rounded-2xl bg-[#0a1829] border border-blue-500/20 hover:border-blue-400/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Send className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white leading-none">Telegram GrockGold Indo</div>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">48,203 Active Subscribers</span>
              </div>
            </div>
            <span className="text-xs text-blue-400 font-black group-hover:translate-x-1 transition-transform">JOIN ➔</span>
          </button>

          <button
            onClick={() => {
              triggerModal(language === 'id' ? '🎉 Berhasil terhubung ke Discord Server Hub!' : '🎉 Connected to Discord Server Hub!', 'success');
            }}
            className="w-full p-3 rounded-2xl bg-[#110e24] border border-indigo-500/20 hover:border-indigo-400/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white leading-none">Discord Global Server</div>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">12,410 Online Hashing Leaders</span>
              </div>
            </div>
            <span className="text-xs text-indigo-400 font-black group-hover:translate-x-1 transition-transform">JOIN ➔</span>
          </button>
        </div>
      </div>

      {/* Chatroom Live Discussion */}
      <div className="bg-[#0b0519] border border-purple-500/10 rounded-3xl p-4 shadow-xl space-y-3 flex flex-col h-[320px]">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-1 flex justify-between items-center font-sans">
          <span>💬 {language === 'id' ? 'Obrolan Komunitas (Live)' : 'Community Chat (Live)'}</span>
          <span className="text-[8px] text-emerald-400 animate-pulse">● 4,921 ONLINE</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin text-left">
          {communityMessages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-2.5 ${msg.isSelf ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] font-black border ${msg.isSelf ? 'bg-gradient-to-r from-yellow-300 to-gold-primary border-yellow-400 text-black' : 'bg-purple-900/45 text-purple-200 border-purple-800/30'}`}>
                {msg.initials}
              </div>
              <div className={`flex flex-col max-w-[70%] ${msg.isSelf ? 'items-end' : 'items-start'} font-sans`}>
                <span className="text-[8px] font-black text-slate-400 mb-0.5 flex items-center gap-1">
                  @{msg.user}
                  {msg.user === 'admin' && <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1 rounded text-[7px]">STAFF</span>}
                </span>
                <div className={`p-2.5 rounded-2xl text-[10px] font-semibold leading-normal ${msg.isSelf ? 'bg-purple-800/20 text-yellow-300 border border-purple-500/20 rounded-tr-none' : 'bg-white/[0.02] text-slate-200 border border-white/5 rounded-tl-none'}`}>
                  {msg.text}
                </div>
                <span className="text-[7.5px] text-slate-500 mt-1 font-mono">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Field Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-white/5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={language === 'id' ? 'Ketik pesan Anda...' : 'Type message here...'}
            className="flex-1 bg-black/55 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/40 font-sans"
          />
          <button
            type="submit"
            className="px-4 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-xs uppercase cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 🗃️ TRANSACTIONS HISTORY PAGE
// ==========================================
export const TransactionsPage: React.FC = () => {
  const { state, language, setCurrentTab } = useAppState();
  const [txFilter, setTxFilter] = useState('all');
  const t = TRANSLATIONS[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Riwayat Transaksi' : 'Transaction History'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex gap-2">
          {['all', 'deposit', 'withdraw', 'reward'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTxFilter(filter)}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                txFilter === filter
                  ? 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black shadow-md shadow-gold-primary/10'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {filter === 'all' ? (language === 'id' ? 'Semua' : 'All') : filter}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {state.transactions.filter(t => txFilter === 'all' || t.type === txFilter).length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-semibold font-sans">
              {t.emptyTx}
            </div>
          ) : (
            state.transactions
              .filter(t => txFilter === 'all' || t.type === txFilter)
              .map((tx) => (
                <div key={tx.id} className="p-3 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${
                      tx.type === 'deposit' || tx.type === 'reward'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : tx.type === 'reward' ? (
                        <Gift className="w-4 h-4" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-left font-sans">
                      <span className="text-xs font-extrabold text-white uppercase block leading-tight">
                        {tx.type}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block mt-0.5">
                        {new Date(tx.date).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-black font-mono ${
                    tx.type === 'deposit' || tx.type === 'reward' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// 🔔 SYSTEM NOTIFICATIONS PAGE
// ==========================================
export const NotificationsPage: React.FC = () => {
  const { language, setCurrentTab } = useAppState();

  const bulletins = [
    {
      id: 1,
      title: language === 'id' ? 'Sistem Cloud Penambangan Stabil' : 'Cloud Mining Fleets Stabilized',
      desc: language === 'id' ? 'Semua unit ekskavator di Randgold West Africa beroperasi dengan efisiensi puncak 98.4%.' : 'All excavator fleets in Randgold West Africa are operating at peak efficiency of 98.4%.',
      time: '14 Jul 2026, 10:24',
      type: 'success'
    },
    {
      id: 2,
      title: language === 'id' ? 'Kemitraan Emas Randgold Resources' : 'Randgold Resources Partnership Active',
      desc: language === 'id' ? 'GrockGold Mining mengesahkan audit sertifikat kepemilikan kuartal ini untuk keandalan penarikan.' : 'GrockGold Mining verified this quarter’s certificate audit to ensure flawless and secure liquidity withdrawals.',
      time: '13 Jul 2026, 08:12',
      type: 'info'
    },
    {
      id: 3,
      title: language === 'id' ? 'Keamanan Enkripsi Lapis Dua Berjalan' : 'Two-Factor Secure Tunnel Enforced',
      desc: language === 'id' ? 'Akses sistem diamankan penuh secara real-time. Hubungi admin untuk keluhan kode OTP.' : 'Terminal access is fully encrypted in real-time. Contact official admins for any access issues.',
      time: '12 Jul 2026, 15:45',
      type: 'info'
    },
    {
      id: 4,
      title: language === 'id' ? 'Program Welcome Bonus Deposit' : 'New Member Welcome Bonus Open',
      desc: language === 'id' ? 'Dapatkan Rp 1.800.000 dengan mengumpulkan 80 mitra aktif di struktur jaringan penambangan Anda.' : 'Claim Rp 1,800,000 by accumulating 80 active depositors with at least 1 Stock Contract in your networks.',
      time: '10 Jul 2026, 09:00',
      type: 'warning'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 text-left"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Notifikasi Sistem' : 'System Notifications'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 font-sans">
          <span className="text-xs font-bold text-gold-primary uppercase tracking-wider">
            {language === 'id' ? 'Pemberitahuan Terbaru' : 'Recent Bulletins'}
          </span>
          <span className="text-[9px] bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-2 py-0.5 rounded font-black font-mono uppercase">
            {language === 'id' ? 'Aktif' : 'Live'}
          </span>
        </div>

        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
          {bulletins.map((n) => (
            <div key={n.id} className="p-4 bg-black/45 border border-white/5 rounded-2xl flex gap-3 text-left font-sans">
              <div className="mt-0.5 shrink-0">
                <div className={`p-1.5 rounded-lg border ${
                  n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-purple-500/10 border-purple-500/20 text-cyan-400'
                }`}>
                  <Bell className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-xs font-extrabold text-white block leading-tight">{n.title}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-relaxed">{n.desc}</span>
                <span className="text-[8px] font-mono font-bold text-slate-600 uppercase block mt-2">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// 🛡️ SYSTEM DIAGNOSTICS & LOGS (ERROR HISTORY)
// ==========================================
export const ErrorHistoryPage: React.FC = () => {
  const { state, language, setCurrentTab } = useAppState();
  const [errorFilter, setErrorFilter] = useState<'all' | 'active' | 'critical' | 'resolved'>('all');

  const {
    runDiagnostics,
    resolveError,
    isScanning,
    scanProgress,
    scanLog,
    resolvingId
  } = useAdmin();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase font-orbitron">
          {language === 'id' ? 'SISTEM DIAGNOSTIK & LOG' : 'SYSTEM DIAGNOSTICS & LOGS'}
        </h2>
      </div>

      {/* DIAGNOSTIC SCAN CONTROL PANEL */}
      <div className="bg-[#0e061c] border border-purple-500/10 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-center border-b border-white/5 pb-3 font-sans">
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-orbitron flex items-center gap-1.5">
              {language === 'id' ? 'DIAGNOSTIK EKOSISTEM' : 'ECOSYSTEM DIAGNOSTICS'}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'id' ? 'Deteksi error real-time & kesehatan unit hashing.' : 'Real-time error detection & hashing unit health monitors.'}
            </p>
          </div>
          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black font-mono uppercase">
            {language === 'id' ? 'SINKRON' : 'SYNCED'}
          </span>
        </div>

        {/* Telemetry Status Cards */}
        <div className="grid grid-cols-3 gap-2.5 font-sans">
          <div className="bg-black/35 border border-white/5 rounded-2xl p-3 text-center">
            <span className="text-[8px] font-bold text-slate-400 block uppercase mb-1">
              {language === 'id' ? 'INTEGRITAS' : 'INTEGRITY'}
            </span>
            <span className={`text-sm font-black font-orbitron ${
              (state.systemErrors || []).filter(e => !e.resolved && e.severity === 'critical').length > 0
                ? 'text-rose-500'
                : (state.systemErrors || []).filter(e => !e.resolved).length > 0
                  ? 'text-amber-500'
                  : 'text-emerald-400'
            }`}>
              {(() => {
                const activeCrit = (state.systemErrors || []).filter(e => !e.resolved && e.severity === 'critical').length;
                const activeWarn = (state.systemErrors || []).filter(e => !e.resolved && e.severity === 'warning').length;
                if (activeCrit > 0) return '84.2%';
                if (activeWarn > 0) return '94.8%';
                return '99.8%';
              })()}
            </span>
          </div>
          <div className="bg-black/35 border border-white/5 rounded-2xl p-3 text-center">
            <span className="text-[8px] font-bold text-slate-400 block uppercase mb-1">
              {language === 'id' ? 'AKTIF' : 'ACTIVE ERRORS'}
            </span>
            <span className={`text-sm font-black font-orbitron ${
              (state.systemErrors || []).filter(e => !e.resolved).length > 0 ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {(state.systemErrors || []).filter(e => !e.resolved).length}
            </span>
          </div>
          <div className="bg-black/35 border border-white/5 rounded-2xl p-3 text-center">
            <span className="text-[8px] font-bold text-slate-400 block uppercase mb-1">
              {language === 'id' ? 'TERSELESAIKAN' : 'RESOLVED'}
            </span>
            <span className="text-sm font-black font-orbitron text-emerald-400">
              {(state.systemErrors || []).filter(e => e.resolved).length}
            </span>
          </div>
        </div>

        {/* Scan Button & Progress */}
        <div className="pt-2">
          {isScanning ? (
            <div className="space-y-3 bg-black/45 border border-purple-500/20 rounded-2xl p-4 font-sans">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                <span className="flex items-center gap-1.5 font-orbitron">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  {language === 'id' ? 'MEMINDAI DRIVER & KONEKSI...' : 'SCANNING TELEMETRY & DRIVERS...'}
                </span>
                <span className="font-mono text-amber-400">{scanProgress}%</span>
              </div>
              <div className="h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="bg-black/60 border border-white/5 p-2.5 rounded-xl font-mono text-[8.5px] leading-relaxed text-slate-400 space-y-1 h-[80px] overflow-y-auto max-h-[80px]">
                {scanLog.map((log, i) => (
                  <div key={i} className="flex gap-1">
                    <span className="text-amber-500 select-none">&gt;</span>
                    <span className={log.includes('WARN') || log.includes('GLITCH') ? 'text-amber-400 font-extrabold' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={runDiagnostics}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-900 to-[#1e103c] hover:from-purple-800 hover:to-[#2b1754] border border-purple-500/25 hover:border-purple-500/50 active:scale-[0.99] transition duration-300 flex items-center justify-center gap-2 shadow-lg text-slate-200 hover:text-white cursor-pointer font-orbitron font-extrabold text-xs tracking-wider"
            >
              {language === 'id' ? 'MULAI DIAGNOSTIK KESELURUHAN' : 'RUN COMPREHENSIVE DIAGNOSTICS'}
            </button>
          )}
        </div>
      </div>

      {/* ERROR LOG HISTORY LIST */}
      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <span className="text-xs font-black text-gold-primary uppercase tracking-wider font-sans">
            {language === 'id' ? 'RIWAYAT ERROR TERKINI' : 'RECENT ERROR REGISTRY'}
          </span>

          {/* Filters */}
          <div className="flex gap-1 bg-black/45 border border-white/5 p-1 rounded-lg">
            {(['all', 'active', 'critical', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setErrorFilter(f)}
                className={`px-2 py-1 rounded text-[8.5px] font-black uppercase font-sans transition cursor-pointer ${
                  errorFilter === f
                    ? 'bg-gold-primary/10 border border-gold-primary/30 text-gold-primary'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {f === 'all' ? (language === 'id' ? 'SEMUA' : 'ALL') :
                 f === 'active' ? (language === 'id' ? 'AKTIF' : 'ACTIVE') :
                 f === 'critical' ? (language === 'id' ? 'KRITIS' : 'CRITICAL') :
                 (language === 'id' ? 'SELESAI' : 'RESOLVED')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {(() => {
            const filtered = (state.systemErrors || []).filter(err => {
              if (errorFilter === 'active') return !err.resolved;
              if (errorFilter === 'critical') return !err.resolved && err.severity === 'critical';
              if (errorFilter === 'resolved') return err.resolved;
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-wider font-sans">
                  {language === 'id' ? '🚫 Tidak ada log error ditemukan' : '🚫 No matching system errors'}
                </div>
              );
            }

            return filtered.map((err) => (
              <div
                key={err.id}
                className={`p-4 bg-black/45 border rounded-2xl flex gap-3 text-left transition duration-300 relative overflow-hidden font-sans ${
                  err.resolved
                    ? 'border-white/5'
                    : err.severity === 'critical'
                      ? 'border-rose-500/25 shadow-[0_0_12px_rgba(239,68,68,0.02)]'
                      : 'border-amber-500/20'
                }`}
              >
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  err.resolved
                    ? 'bg-emerald-500/40'
                    : err.severity === 'critical'
                      ? 'bg-rose-500 animate-pulse'
                      : 'bg-amber-400'
                }`} />

                <div className="mt-0.5 shrink-0 pl-1">
                  <div className={`p-1.5 rounded-lg border ${
                    err.resolved
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : err.severity === 'critical'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-tight bg-slate-800/40 px-1.5 py-0.5 rounded border border-white/5">
                        {err.errorCode}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        @{err.node}
                      </span>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      err.resolved
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : err.severity === 'critical'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                          : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {err.resolved
                        ? (language === 'id' ? 'TERATASI' : 'RESOLVED')
                        : err.severity === 'critical'
                          ? (language === 'id' ? 'KRITIS' : 'CRITICAL')
                          : (language === 'id' ? 'PERINGATAN' : 'WARNING')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-200 font-semibold block mt-2 leading-relaxed">
                    {err.message}
                  </p>

                  <div className="flex justify-between items-center mt-3.5 pt-2.5 border-t border-white/5">
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">
                      {new Date(err.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>

                    {!err.resolved && (
                      <button
                        onClick={() => resolveError(err.id)}
                        disabled={resolvingId === err.id}
                        className="px-2.5 py-1 rounded bg-[#170a2f] border border-purple-500/20 hover:border-purple-400/40 text-[9px] font-black uppercase text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {resolvingId === err.id ? (
                          <>
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
                            {language === 'id' ? 'MEMERIKSA...' : 'FIXING...'}
                          </>
                        ) : (
                          <>
                            <Terminal className="w-2.5 h-2.5 text-amber-400" />
                            {language === 'id' ? 'DEBUGIN' : 'DEBUG'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// ❓ HELP & FAQ PAGE
// ==========================================
export const HelpPage: React.FC = () => {
  const { language, setCurrentTab, triggerModal } = useAppState();

  const faqs = [
    {
      q: language === 'id' ? 'Bagaimana cara membeli Kontrak Emas?' : 'How do I purchase Gold Contracts?',
      a: language === 'id' ? 'Anda dapat menyetor dana Anda di menu Wallet -> Deposit. Setelah itu, buka menu Kontrak, tentukan jumlah unit yang diinginkan, lalu ketuk tombol "Beli Sekarang". Kontrak langsung aktif berproduksi.' : 'First top up your balance via Wallet -> Deposit. Once your balance is loaded, navigate to the Contracts page, input your desired unit quantity, and click "Buy Now".'
    },
    {
      q: language === 'id' ? 'Berapa persentase hasil harian?' : 'What is the daily mining yield rate?',
      a: language === 'id' ? `Setiap kontrak aktif memberikan tingkat hasil harian sebesar ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% langsung ke saldo reward Anda sampai mencapai batas capping penambangan 250%.` : `Each active contract guarantees a premium ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% daily yield credited straight to your Reward Balance, running continuously until reaching 250% capping.`
    },
    {
      q: language === 'id' ? 'Apa yang dimaksud batas Capping 250%?' : 'What is the 250% capping limit?',
      a: language === 'id' ? 'Capping adalah batas maksimal pendapatan kontrak Anda (2.5 kali modal beli). Jika Anda membeli kontrak senilai Rp 1.000.000, penambangan otomatis berhenti saat total hasil mencapai Rp 2.500.000.' : 'Capping is the maximum lifetime earning capacity of your contract (2.5x principal). For instance, a Rp 1,000,000 contract produces up to Rp 2,500,000 in total mining yields.'
    },
    {
      q: language === 'id' ? 'Bagaimana sistem komisi MLM / Network?' : 'How does the network MLM system work?',
      a: language === 'id' ? 'Sistem kami menggunakan struktur bertingkat: Komisi Sponsor Utama (10%), Rebate Level 1 (5%), dan Level 2 (2%). Komisi langsung masuk ke saldo tunai dan meningkatkan progress capping Anda.' : 'We operate a multi-level referral hierarchy: Direct Sponsor incentives (10%), Generation Level 1 rebates (5%), and Level 2 rebates (2%). Commissions directly load to your balance.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left font-sans"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Pusat Bantuan' : 'Help Center'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
          <HelpCircle className="w-4 h-4 text-gold-primary" />
          {language === 'id' ? 'Pertanyaan Umum (FAQ)' : 'Frequently Asked Questions'}
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {faqs.map((faq, i) => (
            <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-2xl text-left space-y-1.5">
              <span className="text-xs font-black text-gold-primary block">Q: {faq.q}</span>
              <span className="text-[10px] text-slate-300 font-medium block leading-relaxed">A: {faq.a}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={() => triggerModal('💬 Layanan Pelanggan GROCKGOLD Telegram Support:<br><b>@GrockGold_Support_Bot</b><br><br>Email: support@grockgold.com<br>Waktu Respons: 24/7 Live.', 'info')}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gold-primary font-bold rounded-2xl text-xs uppercase transition flex items-center justify-center gap-2 cursor-pointer"
          >
            HUBUNGI CUSTOMER SERVICE
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// ℹ️ ABOUT US PAGE
// ==========================================
export const AboutPage: React.FC = () => {
  const { language, setCurrentTab } = useAppState();

  const [goldPrice, setGoldPrice] = React.useState(1458200);
  const [priceChange, setPriceChange] = React.useState(4200);
  const [priceChangePercent, setPriceChangePercent] = React.useState(0.29);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.48) * 1200; // slight positive drift
      setGoldPrice(prev => {
        const newVal = Math.round(prev + change);
        const original = 1458200;
        const diff = newVal - original;
        setPriceChange(diff);
        setPriceChangePercent((diff / original) * 100);
        return newVal;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left font-sans"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Tentang Kami' : 'About Us'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-gold-primary/25 rounded-3xl p-5 shadow-xl space-y-5">
        {/* 🏆 GOLD RATES & LIVE HARGA EMAS (IDR) */}
        <div className="bg-black/45 border border-yellow-500/35 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-yellow-500 tracking-[0.15em] uppercase font-mono">
              {language === 'id' ? 'HARGA EMAS LIVE (IDR)' : 'LIVE GOLD PRICE (IDR)'}
            </span>
            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE FEED
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="text-2xl font-black text-gradient-gold font-orbitron tracking-wide text-yellow-400">
              Rp {goldPrice.toLocaleString('id-ID')}
            </div>
            <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider block">
              {language === 'id' ? 'PER GRAM EMAS MURNI 24K' : 'PER GRAM PURE 24K GOLD'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[10.5px] font-black pt-2 border-t border-white/5">
            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded ${priceChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {priceChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {priceChange >= 0 ? '+' : ''}Rp {priceChange.toLocaleString('id-ID')}
            </span>
            <span className={priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {priceChangePercent >= 0 ? '▲' : '▼'} {priceChangePercent.toFixed(2)}% (24H)
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
