import React from 'react';
import { Users, Globe, Tractor, Shield } from 'lucide-react';

interface WelcomeTickerProps {
  memberCount: number;
  isIndonesian: boolean;
}

export default function WelcomeTicker({ memberCount, isIndonesian }: WelcomeTickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {/* CARD 1: GLOBAL COMMUNITY */}
      <div className="bg-[#050212]/90 border border-slate-900/80 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-md hover:border-gold-primary/20 transition duration-300">
        <Users className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[7px] font-black text-[#64748b] tracking-wider uppercase leading-none mb-1">
            GLOBAL COMMUNITY
          </div>
          <div className="text-[11px] font-bold text-white leading-tight font-sans">
            128,540+
          </div>
          <div className="text-[7.5px] text-[#64748b] font-bold leading-none mt-0.5">
            {isIndonesian ? 'Anggota' : 'Members'}
          </div>
        </div>
      </div>

      {/* CARD 2: MINING SITES */}
      <div className="bg-[#050212]/90 border border-slate-900/80 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-md hover:border-gold-primary/20 transition duration-300">
        <Globe className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[7px] font-black text-[#64748b] tracking-wider uppercase leading-none mb-1">
            MINING SITES
          </div>
          <div className="text-[11px] font-bold text-white leading-tight font-sans">
            {isIndonesian ? '4 Negara' : '4 Countries'}
          </div>
          <div className="text-[7.5px] text-[#64748b] font-bold leading-none mt-0.5">
            {isIndonesian ? 'Operasional' : 'Operational'}
          </div>
        </div>
      </div>

      {/* CARD 3: TOTAL FLEET */}
      <div className="bg-[#050212]/90 border border-slate-900/80 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-md hover:border-gold-primary/20 transition duration-300">
        <Tractor className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[7px] font-black text-[#64748b] tracking-wider uppercase leading-none mb-1">
            TOTAL FLEET
          </div>
          <div className="text-[11px] font-bold text-white leading-tight font-sans">
            1,000+
          </div>
          <div className="text-[7.5px] text-[#64748b] font-bold leading-none mt-0.5">
            {isIndonesian ? 'Unit Aktif' : 'Active Units'}
          </div>
        </div>
      </div>

      {/* CARD 4: SECURE & TRANSPARENT */}
      <div className="bg-[#050212]/90 border border-slate-900/80 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-md hover:border-gold-primary/20 transition duration-300">
        <Shield className="w-5 h-5 text-gold-primary filter drop-shadow-[0_0_4px_rgba(251,191,36,0.4)] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[7px] font-black text-gold-primary tracking-wider uppercase leading-none mb-1">
            SECURE ACCESS
          </div>
          <div className="text-[11px] font-bold text-white leading-tight font-sans">
            {isIndonesian ? 'Terproteksi' : 'Secured'}
          </div>
          <div className="text-[7.5px] text-[#64748b] font-bold leading-none mt-0.5">
            SSL 256-Bit
          </div>
        </div>
      </div>
    </div>
  );
}
