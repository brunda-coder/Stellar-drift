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

export default function Hangar({ setPage }: HangarProps) {
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const profile = useGameStore(s => s.profile);
  const equipShip = useGameStore(s => s.equipShip);
  const unlockShip = useGameStore(s => s.unlockShip);
  const spendCredits = useGameStore(s => s.spendCredits);

  const shipsInTier = SHIPS.filter(s => s.tier === selectedTier);

  const handlePurchase = (shipId: string, price: number) => {
    if (profile.credits >= price) {
      if (spendCredits(price)) {
        unlockShip(shipId);
      }
    }
  };

  return (
    <div className="w-full h-full p-8 flex flex-col relative z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(139,69,255,0.05),transparent_60%),#010308]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-oxanium text-3xl font-bold text-plasma tracking-widest uppercase">The Hangar</h2>
          <p className="text-white/40 text-sm tracking-widest mt-1">Acquire and equip new vessels</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="font-oxanium text-lg text-white">
            CREDITS: <span className="text-plasma font-bold ml-2">💎 {profile.credits.toLocaleString()}</span>
          </div>
          <NeonButton variant="secondary" size="sm" onClick={() => setPage('menu')}>
            BACK TO MENU
          </NeonButton>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Sidebar - Tiers */}
        <div className="w-64 flex flex-col gap-2 overflow-y-auto pr-4 pointer-events-auto">
          {[1,2,3,4,5,6,7,8,9,10].map(tier => (
            <motion.button
              key={tier}
              whileHover={{ x: 5 }}
              onClick={() => setSelectedTier(tier)}
              className={`text-left p-4 border rounded-lg font-oxanium tracking-widest transition-all ${
                selectedTier === tier 
                  ? 'border-plasma bg-plasma/10 text-plasma shadow-[0_0_15px_rgba(0,232,255,0.2)]'
                  : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              TIER {tier}
            </motion.button>
          ))}
        </div>

        {/* Content - Ships */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8 pointer-events-auto pr-4">
          {shipsInTier.map((ship, index) => {
            const isUnlocked = profile.unlockedShipIds.includes(ship.id);
            const isEquipped = profile.currentShipId === ship.id;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={ship.id}
              >
                <GlassCard active={isEquipped} className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-oxanium font-bold text-lg" style={{ color: ship.color }}>{ship.name}</h3>
                    {isEquipped && <span className="bg-safe/20 text-safe text-[10px] px-2 py-1 rounded border border-safe/30">EQUIPPED</span>}
                  </div>
                  
                  <p className="text-white/40 text-xs mb-4 flex-1">{ship.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <Stat row="Hull" val={ship.hull} max={1200} color="#ff3a8c" />
                    <Stat row="Energy" val={ship.energy} max={800} color="#00e8ff" />
                    <Stat row="Speed" val={ship.speed} max={10} color="#ffd060" format={(v: number) => v.toFixed(1)} />
                    <Stat row="Shield" val={ship.shield} max={1000} color="#00ffaa" />
                  </div>

                  <div className="mt-auto">
                    {isEquipped ? (
                      <NeonButton className="w-full pointer-events-none opacity-50" variant="safe" size="sm">
                        CURRENT SHIP
                      </NeonButton>
                    ) : isUnlocked ? (
                      <NeonButton className="w-full" variant="primary" size="sm" onClick={() => equipShip(ship.id)}>
                        EQUIP SHIP
                      </NeonButton>
                    ) : (
                      <NeonButton 
                        className={`w-full ${profile.credits < ship.price ? 'opacity-50' : ''}`}
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handlePurchase(ship.id, ship.price)}
                        disabled={profile.credits < ship.price}
                      >
                        💎 {ship.price.toLocaleString()}
                      </NeonButton>
                    )}
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

const Stat = ({ row, val, max, color, format = (v: any) => v.toString() }: any) => {
  const pct = Math.min(100, Math.max(0, (val / max) * 100));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-oxanium text-white/50 uppercase tracking-wider">
        <span>{row}</span>
        <span style={{ color }}>{format(val)}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};
