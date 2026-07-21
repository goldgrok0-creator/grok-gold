import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useAppState, SPIN_ITEMS } from '../AppContext';
import { Transaction } from '../types';

export const LuckySpinPage: React.FC = () => {
  const { language, setCurrentTab, triggerModal, updateState, setBoostTimeLeft } = useAppState();

  const [spinTickets, setSpinTickets] = useState(5);
  const [spinRotation, setSpinRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinPrizeIndex, setSpinPrizeIndex] = useState<number | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [luckySpinHistory, setLuckySpinHistory] = useState<any[]>([]);

  const handleStartSpin = () => {
    if (isSpinning) return;
    if (spinTickets <= 0) {
      triggerModal(
        language === 'id'
          ? '❌ TIKET HABIS\n\nTiket Lucky Spin Anda sudah habis. Silakan tunggu hitung mundur atau selesaikan misi harian untuk mendapatkan lebih banyak tiket spin gratis!'
          : '❌ OUT OF TICKETS\n\nYour Lucky Spin tickets have run out. Please wait for the countdown or complete missions to get more free spin tickets!',
        'warning'
      );
      return;
    }

    const randomIndex = Math.floor(Math.random() * SPIN_ITEMS.length);
    const degreePerSegment = 360 / SPIN_ITEMS.length;
    const extraSpins = 6;
    const targetRotation = spinRotation + (extraSpins * 360) + (360 - (randomIndex * degreePerSegment)) - (spinRotation % 360);

    setIsSpinning(true);
    setSpinRotation(targetRotation);
    setSpinPrizeIndex(randomIndex);
    setSpinTickets(prev => prev - 1);
    setSpinCount(prev => prev + 1);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SPIN_ITEMS[randomIndex];
      
      const newHistoryItem = {
        id: Date.now().toString(),
        prize: prize.label,
        date: Date.now(),
        success: prize.type !== 'zonk'
      };
      setLuckySpinHistory(prev => [newHistoryItem, ...prev]);

      if (prize.type === 'cash') {
        const newTx: Transaction = {
          id: 'SPN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          type: 'reward',
          amount: prize.value,
          date: Date.now(),
          description: language === 'id' ? `Hadiah Lucky Spin Wheel` : `Lucky Spin Wheel Prize`,
        };
        
        updateState(prev => ({
          ...prev,
          mainBalance: prev.mainBalance + prize.value,
          totalEarned: prev.totalEarned + prize.value,
          transactions: [newTx, ...prev.transactions],
        }), true);

        triggerModal(
          language === 'id'
            ? `🎉 SELAMAT!\n\nAnda memenangkan Saldo sebesar Rp ${prize.value.toLocaleString('id-ID')} dari Lucky Spin Wheel!\n\nHadiah telah ditambahkan ke Saldo Utama Anda.`
            : `🎉 CONGRATULATIONS!\n\nYou won a Balance of Rp ${prize.value.toLocaleString('id-ID')} from the Lucky Spin Wheel!\n\nThe prize has been added to your Main Balance.`,
          'success'
        );
      } else if (prize.type === 'boost') {
        setBoostTimeLeft(300);
        triggerModal(
          language === 'id'
            ? `⚡ BOOSTER AKTIF!\n\nAnda memenangkan Booster Kecepatan Tambang ${prize.value}x selama 5 menit!\n\nKecepatan penambangan kontrak Anda meningkat secara masif!`
            : `⚡ BOOSTER ACTIVE!\n\nYou won a ${prize.value}x Mining Speed Booster for 5 minutes!\n\nYour mining speed has increased massively!`,
          'success'
        );
      } else {
        triggerModal(
          language === 'id'
            ? `😢 ZONK!\n\nSayang sekali, putaran Anda mendarat di Zonk. Jangan menyerah, silakan coba lagi!`
            : `😢 ZONK!\n\nBad luck! Your spin landed on Zonk. Don't give up, try again!`,
          'info'
        );
      }
    }, 3600);
  };

  return (
    <div className="space-y-4 text-left font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 bg-clip-text text-transparent font-orbitron">
          {language === 'id' ? 'RODA BERHADIAH' : 'LUCKY SPIN WHEEL'}
        </h2>
      </div>

      {/* Free Spin Timer / Ticket Counter */}
      <div className="bg-gradient-to-br from-[#1b082e] to-[#0a0314] border border-fuchsia-500/20 rounded-3xl p-4 shadow-xl flex justify-between items-center">
        <div>
          <span className="text-[8.5px] font-black tracking-widest text-fuchsia-400 block uppercase mb-1">{language === 'id' ? 'TIKET PUTARAN' : 'AVAILABLE SPINS'}</span>
          <div className="text-xl font-black text-white font-orbitron flex items-center gap-1.5 leading-none">
            🎟️ {spinTickets} <span className="text-[9.5px] text-slate-500 font-sans font-extrabold uppercase">Tickets</span>
          </div>
        </div>
        <div className="bg-black/55 border border-white/5 rounded-2xl px-3.5 py-2.5 text-right">
          <span className="text-[7.5px] text-slate-500 font-bold block uppercase mb-0.5">{language === 'id' ? 'TIKET GRATIS BERIKUTNYA' : 'NEXT FREE SPIN'}</span>
          <span className="text-[11px] font-mono font-black text-amber-400 animate-pulse">02:45:12</span>
        </div>
      </div>

      {/* Physical Rotating Wheel Canvas Area */}
      <div className="bg-[#0b0519] border border-purple-500/10 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Glowing outer ring */}
        <div className="relative w-56 h-56 rounded-full border-4 border-yellow-500 bg-[#120735] shadow-[0_0_25px_rgba(234,179,8,0.45)] flex items-center justify-center overflow-hidden mb-6 z-10"
          style={{ 
            transform: `rotate(${spinRotation}deg)`,
            transition: isSpinning ? 'transform 3.6s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
          }}
        >
          {/* Outer Ring Circle details */}
          <div className="absolute inset-0 border-8 border-purple-900/40 pointer-events-none z-20" />
          
          {/* segments */}
          {SPIN_ITEMS.map((item, idx) => {
            const angle = idx * 45;
            return (
              <div 
                key={idx}
                className="absolute inset-0 origin-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                {/* Line separator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-1/2 bg-yellow-500/25 origin-bottom z-10" />
                
                {/* Segment text label */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase text-center"
                  style={{ 
                    transform: 'rotate(22.5deg)',
                    color: item.type === 'zonk' ? '#94a3b8' : item.type === 'boost' ? '#38bdf8' : '#facc15'
                  }}
                >
                  <div>{item.label}</div>
                  <div className="text-[6px] opacity-40 leading-none mt-0.5">{item.type === 'zonk' ? '❌' : '💰'}</div>
                </div>
              </div>
            );
          })}

          {/* Golden Spinner Center Pin Hub */}
          <div className="absolute w-12 h-12 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-full border-2 border-white/90 z-30 shadow-2xl flex items-center justify-center font-black text-black text-[9px] tracking-wide uppercase leading-none">
            GGM
          </div>
        </div>

        {/* Wheel pointer at the top */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />

        {/* SPIN TRIGGER BUTTON */}
        <button
          onClick={handleStartSpin}
          disabled={isSpinning || spinTickets <= 0}
          className={`w-full max-w-[200px] py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer ${isSpinning ? 'bg-purple-950 border border-white/5 text-slate-500 cursor-not-allowed' : spinTickets === 0 ? 'bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-500 text-black hover:brightness-110 active:scale-95 shadow-yellow-500/20'}`}
        >
          {isSpinning ? (language === 'id' ? 'MEMUTAR...' : 'SPINNING...') : spinTickets === 0 ? (language === 'id' ? 'TIKET HABIS' : 'OUT OF TICKETS') : (language === 'id' ? 'PUTAR SEKARANG' : 'SPIN NOW')}
        </button>
      </div>

      {/* Available Prizes Odds list */}
      <div className="bg-[#0b0519] border border-white/5 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{language === 'id' ? 'Daftar Hadiah Tersedia' : 'Available Prizes & Odds'}</div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{language === 'id' ? 'Rp 50.000 Tunai' : 'Rp 50,000 Cash'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>{language === 'id' ? 'Boost Tambang 10x' : '10x Mine Boost'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{language === 'id' ? 'Rp 25.000 Tunai' : 'Rp 25,000 Cash'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
            <span>{language === 'id' ? 'Boost Tambang 5x' : '5x Mine Boost'}</span>
          </div>
        </div>
      </div>

      {/* Spin Result History */}
      <div className="bg-[#0b0519] border border-white/5 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{language === 'id' ? 'Riwayat Putaran Anda' : 'Your Spin History'}</div>
        
        <div className="space-y-2">
          {luckySpinHistory.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-semibold">
              {language === 'id' ? 'Belum ada riwayat putaran' : 'No spin history yet'}
            </div>
          ) : (
            luckySpinHistory.map((item, idx) => (
              <div key={item.id} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🎟️</span>
                  <span className="text-[10px] font-black text-white">{language === 'id' ? 'Putaran Berhasil' : 'Successful Spin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black ${item.success ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {item.prize}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">
                    {new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default LuckySpinPage;
