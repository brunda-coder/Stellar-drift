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
      if (spendCredits(price)) unlockShip(shipId);
    }
  };

  return (
    <div className="w-full h-full p-8 flex flex-col relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="headline-font text-3xl font-bold italic text-primary-container tracking-widest uppercase">The Hangar</h2>
          <p className="text-on-surface-variant text-sm tracking-widest mt-1 font-body">Acquire and equip new vessels — Unit IDs classified</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="glass-panel px-4 py-2 border-l-2 border-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[18px]">diamond</span>
            <span className="headline-font italic font-bold text-primary-container">{profile.credits.toLocaleString()}</span>
          </div>
          <NeonButton variant="secondary" size="sm" onClick={() => setPage('menu')}>
            ← BACK
          </NeonButton>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Sidebar Tiers */}
        <div className="w-52 flex flex-col gap-1 overflow-y-auto pr-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tier => (
            <motion.button
              key={tier}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedTier(tier)}
              className={`text-left p-3 font-bold italic headline-font tracking-widest uppercase transition-all duration-200 text-sm ${
                selectedTier === tier
                  ? 'bg-primary-container/10 text-primary-container border-l-4 border-primary-container shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                  : 'text-on-surface-variant border-l-4 border-transparent hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              TIER {tier}
            </motion.button>
          ))}
        </div>

        {/* Ship Grid */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-8 pr-2">
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
                <GlassCard active={isEquipped} className="h-full flex flex-col relative">
                  {/* Unit ID badge */}
                  <div className="absolute top-2 right-3 text-[9px] font-body text-on-surface-variant/50 tracking-widest uppercase">
                    UNIT-{ship.id.slice(-4).toUpperCase()}
                  </div>
                  <div className="flex items-center justify-between mb-3 pr-16">
                    <h3 className="headline-font font-bold italic text-base" style={{ color: ship.color }}>{ship.name}</h3>
                    {isEquipped && (
                      <span className="bg-primary-container/20 text-primary-container text-[9px] px-2 py-1 border border-primary-container/30 headline-font">
                        EQUIPPED
                      </span>
                    )}
                  </div>

                  <p className="text-on-surface-variant text-xs mb-4 flex-1 font-body">{ship.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <Stat row="Hull" val={ship.hull} max={1200} color="#ff067f" />
                    <Stat row="Energy" val={ship.energy} max={800} color="#00ffff" />
                    <Stat row="Speed" val={ship.speed} max={10} color="#d873ff" format={(v: number) => v.toFixed(1)} />
                    <Stat row="Shield" val={ship.shield} max={1000} color="#00e6e6" />
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
                        variant="danger"
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
      <div className="flex justify-between text-[10px] headline-font text-on-surface-variant uppercase tracking-wider">
        <span>{row}</span>
        <span style={{ color }}>{format(val)}</span>
      </div>
      <div className="h-[3px] bg-surface-container-highest overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}aa, ${color})` }} />
      </div>
    </div>
  );
};
