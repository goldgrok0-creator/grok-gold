import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Users, UserCheck, Cpu, Award, Network
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useNetwork } from '../hooks/useNetwork';
import { CONFIG } from '../types';
import { TRANSLATIONS } from '../translations';

const NetworkPage: React.FC = () => {
  const {
    state,
    language,
    setCurrentTab
  } = useAppState();

  const {
    downlines
  } = useNetwork();

  const t = TRANSLATIONS[language];

  // Helper arrays for calculating metrics
  const l1List = downlines.direct || [];
  const l2List = downlines.l2 || [];
  const l3List = downlines.l3 || [];

  const l1Count = l1List.length;
  const l2Count = l2List.length;
  const l3Count = l3List.length;

  const totalDownlinesCount = l1Count + l2Count + l3Count;

  const activeDownlinesCount = useMemo(() => {
    const l1Active = l1List.filter(u => (u.state?.activeContracts || 0) > 0).length;
    const l2Active = l2List.filter(u => (u.state?.activeContracts || 0) > 0).length;
    const l3Active = l3List.filter(u => (u.state?.activeContracts || 0) > 0).length;
    return l1Active + l2Active + l3Active;
  }, [l1List, l2List, l3List]);

  const totalDownlineContracts = useMemo(() => {
    const l1Contracts = l1List.reduce((acc, u) => acc + (u.state?.activeContracts || 0), 0);
    const l2Contracts = l2List.reduce((acc, u) => acc + (u.state?.activeContracts || 0), 0);
    const l3Contracts = l3List.reduce((acc, u) => acc + (u.state?.activeContracts || 0), 0);
    return l1Contracts + l2Contracts + l3Contracts;
  }, [l1List, l2List, l3List]);

  const teamVolumeValue = totalDownlineContracts * CONFIG.PRICE_PER_UNIT;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 text-left"
      >
        <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
          <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
          <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">{t.network}</h2>
        </div>

        {/* High-Tech Grid Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-purple-500/10 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Users className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.totalMember}</span>
            </div>
            <div className="text-lg font-black text-white pl-0.5">
              {totalDownlinesCount} <span className="text-[9px] text-slate-500 font-bold uppercase">{language === 'id' ? 'Mitra' : 'Members'}</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-emerald-500/10 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.activeHolder}</span>
            </div>
            <div className="text-lg font-black text-emerald-400 pl-0.5 font-mono">
              {activeDownlinesCount} <span className="text-[9px] text-slate-500 font-bold uppercase">{language === 'id' ? 'Aktif' : 'Active'}</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.totalContracts}</span>
            </div>
            <div className="text-lg font-black text-white pl-0.5 font-mono">
              {totalDownlineContracts} <span className="text-[9px] text-slate-500 font-bold uppercase">Unit</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-yellow-500/10 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <Network className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.teamVolume}</span>
            </div>
            <div className="text-base font-black text-gold-primary pl-0.5 truncate font-mono">
              Rp {teamVolumeValue.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Structure Panel */}
        <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase flex items-center gap-2 border-b border-white/5 pb-2">
            <Network className="w-4 h-4 text-purple-400" />
            {t.downlineStructure}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <div className="flex flex-col">
                  <span className="text-slate-100 font-extrabold text-xs">Level 1 (Direct)</span>
                  <span className="text-[9px] text-slate-400 font-bold">{language === 'id' ? 'Komisi Referral 10%' : '10% Referral Commission'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-400 font-mono">{l1Count} {language === 'id' ? 'Mitra' : 'Partners'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                <div className="flex flex-col">
                  <span className="text-slate-100 font-extrabold text-xs">Level 2 (Indirect)</span>
                  <span className="text-[9px] text-slate-400 font-bold">{language === 'id' ? 'Komisi Referral 3%' : '3% Referral Commission'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-400 font-mono">{l2Count} {language === 'id' ? 'Mitra' : 'Partners'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.5)]" />
                <div className="flex flex-col">
                  <span className="text-slate-100 font-extrabold text-xs">Level 3 (Community)</span>
                  <span className="text-[9px] text-slate-400 font-bold">{language === 'id' ? 'Komisi Referral 2%' : '2% Referral Commission'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-fuchsia-400 font-mono">{l3Count} {language === 'id' ? 'Mitra' : 'Partners'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NetworkPage;
