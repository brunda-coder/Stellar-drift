import { useState } from 'react';
import { motion } from 'framer-motion';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';
import { SHIPS } from '../store/data';

interface HangarProps {
  setPage: (p: Page) => void;
}

const PageShell = ({ title, subtitle, credits, onBack, children }: {
  title: string; subtitle: string; credits: number; onBack: () => void; children: React.ReactNode;
}) => (
  <div className="w-full h-full flex flex-col relative z-10 overflow-hidden"
    style={{ background: 'radial-gradient(ellipse 70% 50% at 80% 20%, rgba(0,255,255,0.04) 0%, transparent 70%), #000005' }}>
    {/* Top bar */}
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-white/40 hover:text-cyan-300 transition-colors text-sm headline-font italic tracking-widest uppercase">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Back
        </button>
        <div className="w-px h-5 bg-white/10" />
        <div>
          <h2 className="headline-font font-black italic text-xl text-white tracking-wider leading-tight">{title}</h2>
          <p className="text-[10px] text-white/30 font-body tracking-widest">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-cyan-400/20">
        <span className="material-symbols-outlined text-cyan-400 text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
        <span className="font-black italic headline-font text-cyan-400 text-sm">{credits.toLocaleString()}</span>
      </div>
    </div>
    {/* Content */}
    <div className="flex-1 min-h-0 overflow-hidden">
      {children}
    </div>
  </div>
);

export default function Hangar({ setPage }: HangarProps) {
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const profile = useGameStore(s => s.profile);
  const equipShip = useGameStore(s => s.equipShip);
  const unlockShip = useGameStore(s => s.unlockShip);
  const spendCredits = useGameStore(s => s.spendCredits);

  const shipsInTier = SHIPS.filter(s => s.tier === selectedTier);

  const handlePurchase = (shipId: string, price: number) => {
    if (profile.credits >= price && spendCredits(price)) unlockShip(shipId);
  };

  return (
    <PageShell title="THE HANGAR" subtitle="Acquire and equip new vessels" credits={profile.credits} onBack={() => setPage('menu')}>
      <div className="flex h-full">
        {/* Tier sidebar */}
        <div className="w-36 flex flex-col border-r border-white/5 overflow-y-auto flex-shrink-0">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tier => (
            <motion.button key={tier} whileHover={{ x: 3 }} onClick={() => setSelectedTier(tier)}
              className={`px-4 py-3 text-left text-xs font-black italic headline-font tracking-widest uppercase transition-all border-l-2 ${
                selectedTier === tier
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                  : 'border-transparent text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}>
              TIER {tier}
            </motion.button>
          ))}
        </div>

        {/* Ships grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {shipsInTier.map((ship, i) => {
              const isUnlocked = profile.unlockedShipIds.includes(ship.id);
              const isEquipped = profile.currentShipId === ship.id;
              return (
                <motion.div key={ship.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard active={isEquipped} className="flex flex-col h-full relative py-4 px-4">
                    <div className="absolute top-2 right-2 text-[8px] font-body text-white/20 tracking-widest">UNIT-{ship.id.slice(-4).toUpperCase()}</div>
                    <div className="flex items-start justify-between mb-2 pr-8">
                      <h3 className="headline-font font-black italic text-sm leading-tight" style={{ color: ship.color }}>{ship.name}</h3>
                      {isEquipped && <span className="text-[8px] px-1.5 py-0.5 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 headline-font">LIVE</span>}
                    </div>
                    <p className="text-white/35 text-[10px] mb-3 flex-1 font-body leading-relaxed">{ship.description}</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      <Stat row="Hull" val={ship.hull} max={1200} color="#ff067f" />
                      <Stat row="Energy" val={ship.energy} max={800} color="#00ffff" />
                      <Stat row="Speed" val={ship.speed} max={10} color="#d873ff" format={(v: number) => v.toFixed(1)} />
                      <Stat row="Shield" val={ship.shield} max={1000} color="#00e6e6" />
                    </div>
                    {isEquipped ? (
                      <div className="text-center text-[9px] headline-font italic text-cyan-400/60 tracking-widest py-1.5 border border-cyan-400/20">CURRENT SHIP</div>
                    ) : isUnlocked ? (
                      <button onClick={() => equipShip(ship.id)}
                        className="w-full py-2 text-[10px] font-black italic headline-font tracking-widest text-on-primary bg-primary-container hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all active:scale-95">
                        EQUIP
                      </button>
                    ) : (
                      <button onClick={() => handlePurchase(ship.id, ship.price)}
                        disabled={profile.credits < ship.price}
                        className={`w-full py-2 text-[10px] font-black italic headline-font tracking-widest border border-pink-400/50 text-pink-300 hover:bg-pink-500/10 transition-all active:scale-95 ${profile.credits < ship.price ? 'opacity-40 pointer-events-none' : ''}`}>
                        💎 {ship.price.toLocaleString()}
                      </button>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

const Stat = ({ row, val, max, color, format = (v: any) => String(v) }: any) => {
  const pct = Math.min(100, Math.max(0, (val / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[9px] headline-font text-white/40 uppercase mb-1">
        <span>{row}</span><span style={{ color }}>{format(val)}</span>
      </div>
      <div className="h-[3px] bg-white/5">
        <div className="h-full" style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}88, ${color})` }} />
      </div>
    </div>
  );
};
