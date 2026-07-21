import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Bell } from 'lucide-react';

interface NotificationsPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  language,
  setCurrentTab,
}) => {
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Notifikasi Sistem' : 'System Notifications'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <span className="text-xs font-bold text-gold-primary uppercase tracking-wider">
            {language === 'id' ? 'Pemberitahuan Terbaru' : 'Recent Bulletins'}
          </span>
          <span className="text-[9px] bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-2 py-0.5 rounded font-black font-mono uppercase">
            {language === 'id' ? 'Aktif' : 'Live'}
          </span>
        </div>

        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
          {bulletins.map((n) => (
            <div key={n.id} className="p-4 bg-black/45 border border-white/5 rounded-2xl flex gap-3 text-left">
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

export default NotificationsPage;
