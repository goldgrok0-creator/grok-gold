import React from 'react';
import { motion } from 'motion/react';
import { Users, UserCheck, Cpu, Award, Network, Wallet, Trophy, ChevronLeft } from 'lucide-react';
import { AppState } from '../types';

interface NetworkPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  t: any;
  totalDownlinesCount: number;
  activeDownlinesCount: number;
  totalDownlineContracts: number;
  teamVolumeValue: number;
  l1Count: number;
  l2Count: number;
  l3Count: number;
  state: AppState;
  leaderboardData: any[];
}

export const NetworkPage: React.FC<NetworkPageProps> = ({
  language,
  setCurrentTab,
  t,
  totalDownlinesCount,
  activeDownlinesCount,
  totalDownlineContracts,
  teamVolumeValue,
  l1Count,
  l2Count,
  l3Count,
  state,
  leaderboardData,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
        <ChevronLeft
          className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition"
          onClick={() => setCurrentTab('home')}
        />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">
          {t.network}
        </h2>
      </div>

      {/* High-Tech Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-purple-500/10 transition-all duration-300" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Users className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {t.totalMember}
            </span>
          </div>
          <div className="text-lg font-black text-white pl-0.5">
            {totalDownlinesCount}{' '}
            <span className="text-[9px] text-slate-500 font-bold uppercase">
              {language === 'id' ? 'Mitra' : 'Members'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {t.activeHolder}
            </span>
          </div>
          <div className="text-lg font-black text-emerald-400 pl-0.5">
            {activeDownlinesCount}{' '}
            <span className="text-[9px] text-slate-500 font-bold uppercase">
              {language === 'id' ? 'Aktif' : 'Active'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-cyan-500/10 transition-all duration-300" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {t.totalContracts}
            </span>
          </div>
          <div className="text-lg font-black text-white pl-0.5">
            {totalDownlineContracts}{' '}
            <span className="text-[9px] text-slate-500 font-bold uppercase">Unit</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl -mr-4 -mt-4 group-hover:bg-yellow-500/10 transition-all duration-300" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {t.teamVolume}
            </span>
          </div>
          <div className="text-base font-black text-gold-primary pl-0.5 truncate">
            Rp {teamVolumeValue.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Structure Panel */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
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
                <span className="text-[9px] text-slate-400 font-bold">
                  {language === 'id' ? 'Komisi Referral 10%' : '10% Referral Commission'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-400">
                {l1Count} {language === 'id' ? 'Mitra' : 'Partners'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <div className="flex flex-col">
                <span className="text-slate-100 font-extrabold text-xs">Level 2 (Indirect)</span>
                <span className="text-[9px] text-slate-400 font-bold">
                  {language === 'id' ? 'Komisi Referral 3%' : '3% Referral Commission'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-amber-400">
                {l2Count} {language === 'id' ? 'Mitra' : 'Partners'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/45 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.5)]" />
              <div className="flex flex-col">
                <span className="text-slate-100 font-extrabold text-xs">Level 3 (Community)</span>
                <span className="text-[9px] text-slate-400 font-bold">
                  {language === 'id' ? 'Komisi Referral 2%' : '2% Referral Commission'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-fuchsia-400">
                {l3Count} {language === 'id' ? 'Mitra' : 'Partners'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Commissions Split */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-purple-400" />
          {t.referralCommission}
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-semibold">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="text-lg font-black text-emerald-400">10%</div>
            <span className="text-[8px] text-slate-400 font-bold block mb-1">LEVEL 1</span>
            <div className="text-[10px] font-bold text-white truncate">
              Rp{' '}
              {(state.referralEarned * 0.65).toLocaleString('id-ID', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="text-lg font-black text-amber-400">3%</div>
            <span className="text-[8px] text-slate-400 font-bold block mb-1">LEVEL 2</span>
            <div className="text-[10px] font-bold text-white truncate">
              Rp{' '}
              {(state.referralEarned * 0.25).toLocaleString('id-ID', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/10">
            <div className="text-lg font-black text-fuchsia-400">2%</div>
            <span className="text-[8px] text-slate-400 font-bold block mb-1">LEVEL 3</span>
            <div className="text-[10px] font-bold text-white truncate">
              Rp{' '}
              {(state.referralEarned * 0.1).toLocaleString('id-ID', {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        <div className="bg-purple-950/25 border border-purple-500/15 rounded-2xl p-4 text-center mt-4">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            {t.totalCommission}
          </span>
          <div className="text-xl font-black bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron mt-1">
            Rp {state.referralEarned.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* LEADERBOARD PREVIEW CARD */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4.5 h-4.5 text-yellow-400" />
            {language === 'id' ? 'Peringkat Penambang' : 'Mining Leaderboard'}
          </div>
          <button
            onClick={() => setCurrentTab('leaderboard')}
            className="text-[9.5px] text-yellow-400 hover:text-white font-extrabold transition uppercase tracking-wider active:scale-95 cursor-pointer bg-transparent border-none p-0 outline-none"
          >
            {language === 'id' ? 'Lihat Semua ➔' : 'View All ➔'}
          </button>
        </div>

        <div className="divide-y divide-white/5 space-y-1.5">
          {leaderboardData.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 font-medium">
              {language === 'id' ? 'Belum ada data leaderboard' : 'No leaderboard data available yet'}
            </div>
          ) : (
            leaderboardData.slice(0, 3).map((entry, index) => {
              const rank = index + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
              const goldVal = entry.goldAllTime;

              return (
                <div
                  key={entry.username}
                  onClick={() => setCurrentTab('leaderboard')}
                  className="flex items-center justify-between py-2 hover:bg-white/5 px-1.5 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{medal}</span>
                    <span className="text-xs font-bold text-slate-100">{entry.username}</span>
                    {entry.vipLevel > 0 && (
                      <span className="text-[7.5px] bg-yellow-600/10 text-yellow-400 border border-yellow-500/20 px-1 py-0.5 rounded leading-none font-bold">
                        VIP {entry.vipLevel}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-gold-primary font-mono">
                    {goldVal.toFixed(4)} GLD
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
