import { motion } from 'framer-motion';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';
import { GALAXIES } from '../store/data';

interface GalaxyChooserProps {
  setPage: (p: Page) => void;
}

export default function GalaxyChooser({ setPage }: GalaxyChooserProps) {
  const profile = useGameStore(s => s.profile);
  const unlockGalaxy = useGameStore(s => s.unlockGalaxy);
  const spendCredits = useGameStore(s => s.spendCredits);

  const handleUnlock = (id: string, cost: number) => {
    if (profile.credits >= cost) {
      if (spendCredits(cost)) unlockGalaxy(id);
    }
  };

  const handleSelect = (id: string) => {
    alert(`Started expedition in ${id}`);
    setPage('game');
  };

  return (
    <div className="w-full h-full p-8 flex flex-col relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="headline-font text-3xl font-bold italic text-primary-container tracking-widest uppercase">Galaxy Navigation</h2>
          <p className="text-on-surface-variant text-sm tracking-widest mt-1 font-body">Select your destination sector</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-8 flex-1 pr-2">
        {GALAXIES.map((galaxy, index) => {
          const isUnlocked = profile.unlockedGalaxies.includes(galaxy.id);

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.07 }}
              key={galaxy.id}
            >
              <GlassCard className="h-full flex flex-col relative overflow-hidden group">
                {/* Unit ID badge */}
                <div className="absolute top-2 right-3 text-[9px] font-body text-on-surface-variant/50 tracking-widest">
                  GAL-{galaxy.id.slice(-4).toUpperCase()}
                </div>

                {/* BG accent */}
                <div
                  className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${galaxy.colors.bg1}, ${galaxy.colors.bg2})` }}
                />

                <div className="flex justify-between items-start mb-2 pr-16">
                  <h3 className="headline-font text-xl font-black italic tracking-widest uppercase text-on-surface">{galaxy.name}</h3>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < galaxy.difficulty ? 'opacity-100' : 'opacity-20'}>★</span>
                    ))}
                  </div>
                </div>

                <p className="text-on-surface-variant text-sm mb-5 flex-1 font-body">{galaxy.description}</p>

                {/* Modifiers block */}
                <div className="bg-surface-container-lowest/80 p-3 mb-5 border border-outline-variant/20 text-xs space-y-1">
                  <div className="text-on-surface-variant uppercase mb-2 tracking-widest text-[10px] headline-font">Active Modifiers</div>
                  {Object.keys(galaxy.modifiers).length === 0 ? (
                    <div className="text-primary-dim font-body">Standard combat conditions</div>
                  ) : (
                    <>
                      {galaxy.modifiers.enemyHpMultiplier && <div className="text-tertiary font-body">Enemy HP x{galaxy.modifiers.enemyHpMultiplier}</div>}
                      {galaxy.modifiers.blackHoleFreq && <div className="text-secondary font-body">Black hole anomaly rate x{galaxy.modifiers.blackHoleFreq}</div>}
                      {galaxy.modifiers.enemyFireRate && <div className="text-primary-container font-body">Enemy aggression x{galaxy.modifiers.enemyFireRate}</div>}
                      {galaxy.modifiers.enemySizeDmg && <div className="text-tertiary font-body">Titanic enemy class presence</div>}
                      {galaxy.modifiers.cosmicStormDrift && <div className="text-yellow-400 font-body">Class-9 Cosmic Storm interference</div>}
                    </>
                  )}
                </div>

                <div className="mt-auto">
                  {isUnlocked ? (
                    <NeonButton className="w-full" variant="primary" size="md" onClick={() => handleSelect(galaxy.id)}>
                      INITIATE WARP JUMP
                    </NeonButton>
                  ) : (
                    <NeonButton
                      className={`w-full ${profile.credits < galaxy.unlockCost ? 'opacity-50' : ''}`}
                      variant="danger"
                      onClick={() => handleUnlock(galaxy.id, galaxy.unlockCost)}
                      disabled={profile.credits < galaxy.unlockCost}
                    >
                      UNLOCK ROUTE (💎 {galaxy.unlockCost.toLocaleString()})
                    </NeonButton>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
