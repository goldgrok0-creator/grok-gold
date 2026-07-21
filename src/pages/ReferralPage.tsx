import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Users,
  UserCheck,
  UserPlus,
  Send,
  Check,
  Search,
  Filter,
  Calendar,
  Layers,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useNetwork } from '../hooks/useNetwork';
import { CONFIG } from '../types';

const ReferralPage: React.FC = () => {
  const {
    state,
    language,
    accounts,
    currentAccount,
    setCurrentTab
  } = useAppState();

  const {
    downlines,
    copiedLink,
    copiedCode,
    copyReferralLink,
    copyReferralCode
  } = useNetwork();

  const [tableSearch, setTableSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');

  // Localized Dictionary
  const dict = {
    id: {
      referralDashboard: 'UNDANG TEMAN',
      totalReferral: 'Total Referral',
      activeReferral: 'Referral Aktif',
      pendingReferral: 'Menunggu Aktivasi',
      refCode: 'Kode Referral Anda',
      refLink: 'Tautan Referral Resmi',
      sponsorUplink: 'Sponsor Uplink',
      noSponsor: 'Tanpa Sponsor (Pendaftaran Langsung)',
      joinDate: 'Tanggal Bergabung',
      shareRef: 'BAGIKAN REFERRAL',
      searchPlaceholder: 'Cari username mitra...',
      allLevels: 'Semua Level',
      levelX: 'Level {x}',
      allStatus: 'Semua Status',
      active: 'Aktif',
      pending: 'Belum Aktif',
      bonusGen: 'Bonus Dihasilkan',
      noDownlines: 'Belum ada mitra di jaringan Anda. Bagikan tautan referral untuk mulai membangun tim Anda!',
      partners: 'Mitra',
      copiedText: 'Teks berbagi disalin ke clipboard!',
      referralList: 'Daftar Mitra Jaringan',
    },
    en: {
      referralDashboard: 'INVITE FRIENDS',
      totalReferral: 'Total Referrals',
      activeReferral: 'Active Referrals',
      pendingReferral: 'Pending Activation',
      refCode: 'Your Referral Code',
      refLink: 'Official Referral Link',
      sponsorUplink: 'Sponsor Uplink',
      noSponsor: 'No Sponsor (Direct Registration)',
      joinDate: 'Joined Date',
      shareRef: 'SHARE REFERRAL',
      searchPlaceholder: 'Search partner username...',
      allLevels: 'All Levels',
      levelX: 'Level {x}',
      allStatus: 'All Status',
      active: 'Active',
      pending: 'Pending',
      bonusGen: 'Bonus Generated',
      noDownlines: 'No partners in your network yet. Share your referral link to start building your team!',
      partners: 'Partners',
      copiedText: 'Share text copied to clipboard!',
      referralList: 'Network Partners List',
    }
  };

  const t = dict[language];

  // Downline calculations
  const directList = downlines.direct || [];
  const l2List = downlines.l2 || [];
  const l3List = downlines.l3 || [];

  const l1Count = directList.length;
  const l2Count = l2List.length;
  const l3Count = l3List.length;
  const totalReferrals = l1Count + l2Count + l3Count;

  const activeL1 = directList.filter(u => (u.state?.activeContracts || 0) > 0).length;
  const activeL2 = l2List.filter(u => (u.state?.activeContracts || 0) > 0).length;
  const activeL3 = l3List.filter(u => (u.state?.activeContracts || 0) > 0).length;
  const activeReferrals = activeL1 + activeL2 + activeL3;

  const pendingReferrals = totalReferrals - activeReferrals;

  // Sponsor uplink
  const sponsor = useMemo(() => {
    if (!currentAccount?.invitedBy) return null;
    return accounts.find(acc => acc.username.toLowerCase() === currentAccount.invitedBy?.toLowerCase()) || null;
  }, [accounts, currentAccount]);

  // Downline list
  const allDownlineList = useMemo(() => {
    const list: Array<{
      username: string;
      fullName: string;
      level: number;
      createdAt: number;
      active: boolean;
      activeContracts: number;
      bonusGenerated: number;
    }> = [];

    directList.forEach(acc => {
      const activeContracts = acc.state?.activeContracts || 0;
      const bonusGenerated = activeContracts * CONFIG.PRICE_PER_UNIT * 0.10;
      list.push({
        username: acc.username,
        fullName: acc.fullName,
        level: 1,
        createdAt: acc.createdAt || (Date.now() - 3 * 24 * 60 * 60 * 1000),
        active: activeContracts > 0,
        activeContracts,
        bonusGenerated
      });
    });

    l2List.forEach(acc => {
      const activeContracts = acc.state?.activeContracts || 0;
      const bonusGenerated = activeContracts * CONFIG.PRICE_PER_UNIT * 0.03;
      list.push({
        username: acc.username,
        fullName: acc.fullName,
        level: 2,
        createdAt: acc.createdAt || (Date.now() - 6 * 24 * 60 * 60 * 1000),
        active: activeContracts > 0,
        activeContracts,
        bonusGenerated
      });
    });

    l3List.forEach(acc => {
      const activeContracts = acc.state?.activeContracts || 0;
      const bonusGenerated = activeContracts * CONFIG.PRICE_PER_UNIT * 0.02;
      list.push({
        username: acc.username,
        fullName: acc.fullName,
        level: 3,
        createdAt: acc.createdAt || (Date.now() - 9 * 24 * 60 * 60 * 1000),
        active: activeContracts > 0,
        activeContracts,
        bonusGenerated
      });
    });

    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [directList, l2List, l3List]);

  const filteredDownlineList = useMemo(() => {
    return allDownlineList.filter(item => {
      const matchesSearch = item.username.toLowerCase().includes(tableSearch.toLowerCase()) || 
                            item.fullName.toLowerCase().includes(tableSearch.toLowerCase());
      const matchesLevel = levelFilter === 'all' ? true : item.level === parseInt(levelFilter);
      const matchesStatus = statusFilter === 'all' ? true : 
                            statusFilter === 'active' ? item.active : !item.active;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [allDownlineList, tableSearch, levelFilter, statusFilter]);

  return (
    <div className="space-y-4 text-left pb-20">
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">{t.referralDashboard}</h2>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-xl p-3 text-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t.totalReferral}</div>
          <div className="text-sm font-black text-white">{totalReferrals}</div>
        </div>
        <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-xl p-3 text-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t.activeReferral}</div>
          <div className="text-sm font-black text-emerald-400">{activeReferrals}</div>
        </div>
        <div className="bg-gradient-to-b from-[#110724] to-[#0a0414] border border-purple-500/15 rounded-xl p-3 text-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t.pendingReferral}</div>
          <div className="text-sm font-black text-yellow-500">{pendingReferrals}</div>
        </div>
      </div>

      {/* REFERRAL LINKS SECTION */}
      <div className="bg-gradient-to-br from-[#0f0620] to-[#080312] border border-purple-500/20 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Referral Code */}
        <div className="relative space-y-1.5">
          <span className="text-[10px] font-black text-gold-primary uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t.refCode}
          </span>
          <div className="bg-black/45 border border-purple-900/35 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-100 flex items-center justify-between">
            <span>{currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase())}</span>
            <button
              onClick={copyReferralCode}
              className="text-gold-primary hover:text-yellow-300 transition text-xs font-extrabold flex items-center gap-1 cursor-pointer active:scale-95"
            >
              {copiedCode ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>COPIED</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">📋 <span className="text-[10px]">COPY</span></span>
              )}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-[#120824] border border-purple-500/15 rounded-2xl p-4 relative overflow-hidden shadow-inner">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest block">
              {t.refLink}
            </span>
            <button
              onClick={copyReferralLink}
              className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-90 flex items-center gap-1 ${
                copiedLink 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-gradient-to-r from-yellow-400 via-gold-primary to-yellow-600 text-black shadow-md hover:brightness-110'
              }`}
            >
              <span>📋</span>
              <span>{copiedLink ? 'COPIED ✓' : 'COPY LINK'}</span>
            </button>
          </div>

          <div className="mt-4 pt-1">
            <div className="w-full bg-black/50 border border-purple-950/40 rounded-xl px-3 py-2.5 text-[10px] font-mono text-slate-300 break-all select-all leading-relaxed pr-16 shadow-inner">
              {`${window.location.origin}/register?ref=${currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase())}`}
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={() => {
            const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
            const shareUrl = `${window.location.origin}/register?ref=${refCodeStr}`;
            const shareText = language === 'id' 
              ? `Bergabunglah dengan sistem penambangan PT GrockGold menggunakan kode ${refCodeStr} dan hasilkan yield harian hingga ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%! ${shareUrl}`
              : `Join the PT GrockGold mining system with code ${refCodeStr} and earn up to ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% daily contract yield! ${shareUrl}`;
            
            if (navigator.share) {
              navigator.share({
                title: 'GrockGold Mining',
                text: shareText,
                url: shareUrl,
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(shareText);
              alert(t.copiedText);
            }
          }}
          className="w-full py-3 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-2xl text-xs tracking-wider uppercase transition shadow-lg hover:brightness-110 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t.shareRef}</span>
        </button>

        {/* Sponsor Uplink */}
        <div className="border-t border-purple-500/10 pt-3 mt-1.5">
          <div className="flex items-center gap-2 text-gold-primary text-[10px] font-extrabold uppercase tracking-widest mb-2">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.sponsorUplink}</span>
          </div>

          {sponsor ? (
            <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-base font-bold text-yellow-400">
                  👤
                </div>
                <div>
                  <div className="font-extrabold text-slate-100 flex items-center gap-1.5">
                    <span>{sponsor.fullName}</span>
                    <span className="text-[8px] bg-purple-900/40 text-purple-300 border border-purple-500/20 px-1 py-0.5 rounded leading-none font-bold">UPLINE</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">@{sponsor.username}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-500 block uppercase font-bold">{t.joinDate}</span>
                <span className="text-[9px] text-slate-300 font-bold">
                  {sponsor.createdAt 
                    ? new Date(sponsor.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '12 Jan 2026'
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-purple-950/10 border border-purple-900/10 rounded-xl p-3 text-center text-[10px] text-slate-400 font-semibold leading-relaxed">
              🌍 {t.noSponsor}
            </div>
          )}
        </div>
      </div>

      {/* PARTNER LIST TABLE */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4.5 h-4.5 text-purple-400" />
            <span>{t.referralList}</span>
          </div>
          <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full leading-none font-bold">
            {allDownlineList.length} Total
          </span>
        </div>

        {/* Filters */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-black/45 border border-purple-900/30 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition duration-300 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
            <div className="flex items-center gap-1.5 bg-black/45 border border-purple-900/25 rounded-xl px-2 py-1.5">
              <Filter className="w-3 h-3 text-purple-400 shrink-0" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#0f0620]">{t.allLevels}</option>
                <option value="1" className="bg-[#0f0620]">{t.levelX.replace('{x}', '1')}</option>
                <option value="2" className="bg-[#0f0620]">{t.levelX.replace('{x}', '2')}</option>
                <option value="3" className="bg-[#0f0620]">{t.levelX.replace('{x}', '3')}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-black/45 border border-purple-900/25 rounded-xl px-2 py-1.5">
              <Users className="w-3 h-3 text-purple-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-slate-300 w-full focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#0f0620]">{t.allStatus}</option>
                <option value="active" className="bg-[#0f0620]">{t.active}</option>
                <option value="pending" className="bg-[#0f0620]">{t.pending}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table/List */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
          {filteredDownlineList.length === 0 ? (
            <div className="text-center py-10 px-4 bg-black/25 border border-white/5 rounded-2xl">
              <div className="text-2xl mb-2 text-slate-600">👥</div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                {tableSearch || levelFilter !== 'all' || statusFilter !== 'all' 
                  ? (language === 'id' ? 'Tidak ada hasil pencarian.' : 'No results found.')
                  : t.noDownlines
                }
              </p>
            </div>
          ) : (
            filteredDownlineList.map((partner) => (
              <div
                key={partner.username}
                className="p-3 bg-black/35 hover:bg-black/60 border border-white/5 rounded-xl transition duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    partner.level === 1 ? 'bg-emerald-500/10 text-emerald-400' :
                    partner.level === 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-fuchsia-500/10 text-fuchsia-400'
                  }`}>
                    L{partner.level}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-200">
                      {partner.fullName}
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-mono">@{partner.username}</div>
                    <div className="text-[8px] text-slate-500 flex items-center gap-1 mt-0.5 font-bold">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>
                        {new Date(partner.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase mb-1 leading-none ${
                    partner.active 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {partner.active ? t.active : t.pending}
                  </span>
                  <div className="text-[10px] font-black text-slate-100 font-sans">
                    Rp {partner.bonusGenerated.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[7.5px] text-slate-500 font-bold block uppercase">{t.bonusGen}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* REFERRAL CLICKS LOG */}
      <div className="bg-gradient-to-b from-[#0f0620] to-[#080312] border border-purple-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-xs font-black text-gold-primary tracking-widest mb-4 uppercase border-b border-white/5 pb-2 flex items-center justify-between font-orbitron">
          <div className="flex items-center gap-1.5">
            <ExternalLink className="w-4.5 h-4.5 text-purple-400" />
            <span>{language === 'id' ? 'RIWAYAT KLIK REFERRAL' : 'REFERRAL CLICKS LOG'}</span>
          </div>
          <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full leading-none font-bold font-mono">
            {currentAccount?.state?.referralClicks?.length || 0}
          </span>
        </div>

        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
          {!currentAccount?.state?.referralClicks || currentAccount.state.referralClicks.length === 0 ? (
            <div className="text-center py-8 px-4 bg-black/25 border border-white/5 rounded-2xl">
              <div className="text-xl mb-1 text-slate-600">🖱️</div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                {language === 'id' ? 'Belum ada data klik referral yang tercatat di database.' : 'No referral click data recorded in the database yet.'}
              </p>
            </div>
          ) : (
            [...currentAccount.state.referralClicks]
              .sort((a: any, b: any) => b.clicked_at - a.clicked_at)
              .map((click: any) => (
                <div
                  key={click.id}
                  className="p-3 bg-black/35 border border-white/5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-slate-300">
                      🖱️
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-200 uppercase tracking-wide">
                        {click.source === 'landing_page_url' ? (language === 'id' ? 'Tautan URL Landing' : 'Landing URL Link') : click.source}
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">ID: {click.id}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-300 font-mono block font-semibold">
                      {new Date(click.clicked_at).toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold block uppercase mt-0.5">
                      {new Date(click.clicked_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
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

export default ReferralPage;
