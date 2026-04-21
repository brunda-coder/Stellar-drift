import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';

interface BlackMarketProps {
  setPage: (p: Page) => void;
}

const UPGRADE_TYPES = [
  { id: 'hullPlating', name: 'HULL PLATING', desc: 'Increases Maximum HP per level.', color: '#ff3a8c', icon: 'shield', baseCost: 500, maxLevel: 5 },
  { id: 'energyCore', name: 'ENERGY CORE', desc: 'Increases Maximum EP for abilities.', color: '#00e8ff', icon: 'bolt', baseCost: 500, maxLevel: 5 },
  { id: 'magnetRange', name: 'MAGNET RANGE', desc: 'Expands the pull radius for pickups.', color: '#ffd060', icon: 'all_out', baseCost: 800, maxLevel: 5 },
  { id: 'overchargeDuration', name: 'OVERCHARGE EXTENSION', desc: 'Increases duration of weapon power-ups.', color: '#ff0055', icon: 'electric_meter', baseCost: 1000, maxLevel: 5 },
  { id: 'adrenalineDecay', name: 'ADRENALINE STABILIZER', desc: 'Slows down Adrenaline gauge decay.', color: '#8b45ff', icon: 'timelapse', baseCost: 1200, maxLevel: 5 },
] as const;

export default function BlackMarket({ setPage }: BlackMarketProps) {
  const profile = useGameStore(s => s.profile);
  const buyUpgrade = useGameStore(s => s.buyUpgrade);

  const handlePurchase = (id: any, cost: number) => {
    buyUpgrade(id, cost);
  };

  return (
    <div className="w-full h-full flex flex-col relative z-10 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 70% 50% at 80% 20%, rgba(216,115,255,0.06) 0%, transparent 70%), #000005' }}>
      
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setPage('menu')}
            className="flex items-center gap-1.5 text-white/40 hover:text-cyan-300 transition-colors text-sm headline-font italic tracking-widest uppercase">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div>
            <h2 className="headline-font font-black italic text-xl text-white tracking-wider leading-tight">BLACK MARKET</h2>
            <p className="text-[10px] text-white/30 font-body tracking-widest">Permanent ship modifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-cyan-400/20">
          <span className="material-symbols-outlined text-cyan-400 text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          <span className="font-black italic headline-font text-cyan-400 text-sm">{profile.credits.toLocaleString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {UPGRADE_TYPES.map((upg, i) => {
            const currentLevel = (profile.upgrades as any)[upg.id] || 0;
            const isMaxed = currentLevel >= upg.maxLevel;
            const cost = upg.baseCost * (currentLevel + 1);
            const canAfford = profile.credits >= cost;

            return (
              <motion.div key={upg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <GlassCard active={false} className="flex flex-col md:flex-row items-center justify-between p-4 px-6 border-l-4" style={{ borderLeftColor: upg.color }}>
                  
                  {/* Icon & Details */}
                  <div className="flex items-center gap-5 mb-4 md:mb-0">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border" style={{ borderColor: `${upg.color}40`, color: upg.color, boxShadow: `0 0 15px ${upg.color}30` }}>
                      <span className="material-symbols-outlined text-2xl">{upg.icon}</span>
                    </div>
                    <div>
                      <h3 className="headline-font font-black italic text-lg leading-tight" style={{ color: upg.color, textShadow: `0 0 10px ${upg.color}40` }}>{upg.name}</h3>
                      <p className="text-white/40 text-xs font-body tracking-wide">{upg.desc}</p>
                    </div>
                  </div>

                  {/* Progress & Buy Button */}
                  <div className="flex items-center gap-8 w-full md:w-auto">
                    {/* Level Blocks */}
                    <div className="flex gap-1.5">
                      {Array.from({ length: upg.maxLevel }).map((_, levelIndex) => {
                        const isActive = levelIndex < currentLevel;
                        return (
                          <div key={levelIndex} className="w-5 h-5 border"
                            style={{
                              borderColor: isActive ? upg.color : 'rgba(255,255,255,0.1)',
                              background: isActive ? `${upg.color}80` : 'rgba(255,255,255,0.05)',
                              boxShadow: isActive ? `0 0 8px ${upg.color}60` : 'none',
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Button */}
                    <div className="w-32">
                      {isMaxed ? (
                        <div className="w-full py-2.5 text-center text-[11px] font-black italic headline-font tracking-widest border border-white/20 text-white/40 bg-black/50">
                          MAX LEVEL
                        </div>
                      ) : (
                        <button onClick={() => handlePurchase(upg.id, cost)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-black italic headline-font tracking-widest transition-all active:scale-95 ${canAfford ? 'border text-white hover:bg-white/10' : 'border border-white/10 text-white/20 pointer-events-none'}`}
                          style={{ borderColor: canAfford ? upg.color : undefined, boxShadow: canAfford ? `0 0 10px ${upg.color}30` : 'none' }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: canAfford ? '#00e8ff' : '' }}>diamond</span>
                          {cost.toLocaleString()}
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
