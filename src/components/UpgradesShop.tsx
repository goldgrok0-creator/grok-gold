import React from 'react';
import { Upgrade, GameStats } from '../types';
import { ProceduralAudio } from './ProceduralAudio';
import { Zap, Activity, Eye, ShieldCheck, Cpu, ArrowUp, ShoppingBag, Sparkles } from 'lucide-react';

interface UpgradesShopProps {
  stats: GameStats;
  upgrades: Upgrade[];
  onBuyUpgrade: (id: string, cost: number) => void;
}

export default function UpgradesShop({ stats, upgrades, onBuyUpgrade }: UpgradesShopProps) {
  
  const getUpgradeIcon = (id: string) => {
    switch (id) {
      case 'engine':
        return <Activity className="w-5 h-5 text-amber-400" />;
      case 'tether':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'laser':
        return <Eye className="w-5 h-5 text-red-400" />;
      case 'recycle':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'oracle':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-slate-400" />;
    }
  };

  const handlePurchase = (upgrade: Upgrade) => {
    if (stats.gold >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
      ProceduralAudio.playUpgrade();
      onBuyUpgrade(upgrade.id, upgrade.cost);
    }
  };

  return (
    <div id="upgrades-shop" className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 shadow-xl select-none flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-500" />
          <h3 className="font-sans font-bold text-amber-100 text-sm tracking-wider uppercase">Command Deck Shop</h3>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">CREDITS: {stats.gold} G-USD</span>
        </div>
      </div>

      {/* Grid of Upgrades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {upgrades.map(upgrade => {
          const isMaxed = upgrade.level >= upgrade.maxLevel;
          const canAfford = stats.gold >= upgrade.cost;
          const percentage = (upgrade.level / upgrade.maxLevel) * 100;

          return (
            <div 
              key={upgrade.id}
              className={`flex flex-col justify-between p-3 rounded-lg border transition-all duration-150 bg-slate-950/60 ${
                isMaxed 
                  ? 'border-emerald-500/20 hover:border-emerald-500/30' 
                  : canAfford 
                    ? 'border-amber-500/15 hover:border-amber-500/30 hover:bg-slate-950/80' 
                    : 'border-slate-800/80'
              }`}
            >
              {/* Top part: Icon, Name, Level */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                    {getUpgradeIcon(upgrade.id)}
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    isMaxed 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    {isMaxed ? 'MAXED' : `LVL ${upgrade.level}/${upgrade.maxLevel}`}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-amber-200 uppercase font-sans mb-1 tracking-wide">{upgrade.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed mb-3 h-[42px] overflow-hidden">{upgrade.description}</p>
              </div>

              {/* Bottom part: Progress indicator and Action Button */}
              <div>
                {/* Visual mini-bar of level progression */}
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mb-3 border border-slate-800/30">
                  <div 
                    className={`h-full transition-all duration-300 ${isMaxed ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {isMaxed ? (
                  <button 
                    disabled 
                    className="w-full py-1.5 bg-emerald-500/5 text-emerald-400 font-bold border border-emerald-500/20 rounded text-[10px] uppercase cursor-not-allowed font-mono"
                  >
                    Systems Calibrated
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePurchase(upgrade)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 rounded text-[10px] font-bold uppercase transition-all duration-100 flex items-center justify-center gap-1 font-mono ${
                      canAfford 
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/5 active:scale-95' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp className="w-3 h-3 flex-shrink-0" />
                    <span>UPGRADE • {upgrade.cost} G-USD</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
