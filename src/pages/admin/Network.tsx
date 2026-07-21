import React, { useState, useMemo } from 'react';
import { UserAccount } from '../../types';

interface NetworkProps {
  accounts: UserAccount[];
  language: 'id' | 'en';
}

export default function Network({ accounts, language }: NetworkProps) {
  const [networkSearch, setNetworkSearch] = useState('');

  // --- NETWORK TREE COMPUTATION ---
  const networkData = useMemo(() => {
    if (!networkSearch) return null;
    const targetUser = accounts.find(acc => acc.username.toLowerCase() === networkSearch.toLowerCase());
    if (!targetUser) return null;

    // Find level 1
    const level1 = accounts.filter(acc => acc.invitedBy?.toLowerCase() === targetUser.username.toLowerCase());
    
    // Find level 2
    const level1Usernames = level1.map(acc => acc.username.toLowerCase());
    const level2 = accounts.filter(acc => acc.invitedBy && level1Usernames.includes(acc.invitedBy.toLowerCase()));

    // Find level 3
    const level2Usernames = level2.map(acc => acc.username.toLowerCase());
    const level3 = accounts.filter(acc => acc.invitedBy && level2Usernames.includes(acc.invitedBy.toLowerCase()));

    return {
      user: targetUser,
      level1,
      level2,
      level3
    };
  }, [accounts, networkSearch]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase mb-2">
        {language === 'id' ? 'STRUKTUR JALUR REFERRAL USER' : 'MULTI-LEVEL NETWORK AUDIT'}
      </h3>

      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          placeholder={language === 'id' ? 'Masukkan username target...' : 'Enter target username...'}
          value={networkSearch}
          onChange={(e) => setNetworkSearch(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-xs font-medium focus:outline-none focus:border-rose-500 text-slate-200"
        />
        <button 
          onClick={() => setNetworkSearch(networkSearch)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl uppercase transition shrink-0 cursor-pointer"
        >
          Audit
        </button>
      </div>

      {networkData ? (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Target Account Profile</div>
            <h4 className="text-sm font-black text-slate-200">{networkData.user.username} ({networkData.user.fullName})</h4>
            <p className="text-xs text-slate-400 mt-1">Invited By: <span className="text-purple-400 font-mono">{networkData.user.invitedBy || 'DIRECT/SYSTEM'}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LEVEL 1 */}
            <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-xl">
              <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
                Generation 1 (L1 - 10%)
              </div>
              <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                {networkData.level1.map(acc => (
                  <div key={acc.username} className="text-xs py-1.5 px-2 bg-slate-900/60 rounded border border-slate-800/40 flex justify-between items-center">
                    <span className="font-bold text-slate-300">{acc.username}</span>
                    <span className="font-mono text-[10px] text-purple-400">{acc.state?.activeContracts || 0} Unit</span>
                  </div>
                ))}
                {networkData.level1.length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-4">No L1 downlines</div>
                )}
              </div>
            </div>

            {/* LEVEL 2 */}
            <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-xl">
              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
                Generation 2 (L2 - 3%)
              </div>
              <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                {networkData.level2.map(acc => (
                  <div key={acc.username} className="text-xs py-1.5 px-2 bg-slate-900/60 rounded border border-slate-800/40 flex justify-between items-center">
                    <span className="font-bold text-slate-300">{acc.username}</span>
                    <span className="text-[10px] text-slate-500 font-mono">By {acc.invitedBy}</span>
                  </div>
                ))}
                {networkData.level2.length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-4">No L2 downlines</div>
                )}
              </div>
            </div>

            {/* LEVEL 3 */}
            <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-xl">
              <div className="text-[9px] font-bold text-pink-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
                Generation 3 (L3 - 2%)
              </div>
              <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                {networkData.level3.map(acc => (
                  <div key={acc.username} className="text-xs py-1.5 px-2 bg-slate-900/60 rounded border border-slate-800/40 flex justify-between items-center">
                    <span className="font-bold text-slate-300">{acc.username}</span>
                    <span className="text-[10px] text-slate-500 font-mono">By {acc.invitedBy}</span>
                  </div>
                ))}
                {networkData.level3.length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-4">No L3 downlines</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        networkSearch && (
          <div className="text-xs text-rose-400 bg-rose-950/10 p-3 rounded-xl border border-rose-900/30 animate-fade-in">
            {language === 'id' ? 'Akun tidak ditemukan. Silakan masukkan username yang tepat.' : 'Target member not found.'}
          </div>
        )
      )}
    </div>
  );
}
