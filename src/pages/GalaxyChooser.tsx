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
    // Current game state doesn't track "selected" galaxy outside of what's passed to Play,
    // but in a real app, you could store `selectedGalaxy` in the profile.
    // We'll just transition to the game screen from here for now!
    // For now we just implement the UI. We can set it in local state.
    alert(`Started expedition in ${id}`);
    setPage('game');
  };

  return (
    <div className="w-full h-full p-8 flex flex-col relative z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,232,255,0.05),transparent_60%),#010308]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-oxanium text-3xl font-bold text-plasma tracking-widest uppercase">Galaxy Navigation</h2>
          <p className="text-white/40 text-sm tracking-widest mt-1">Select your destination sector</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8 flex-1 pr-4">
        {GALAXIES.map((galaxy, index) => {
          const isUnlocked = profile.unlockedGalaxies.includes(galaxy.id);
          
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={galaxy.id}
            >
              <GlassCard className="h-full flex flex-col relative overflow-hidden group">
                <div 
                  className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 z-[-1]"
                  style={{
                    background: `linear-gradient(135deg, ${galaxy.colors.bg1}, ${galaxy.colors.bg2})`
                  }}
                />
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-oxanium text-2xl font-bold tracking-widest uppercase">{galaxy.name}</h3>
                  <div className="flex text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < galaxy.difficulty ? 'opacity-100' : 'opacity-20'}>★</span>
                    ))}
                  </div>
                </div>

                <p className="text-white/60 text-sm mb-6 flex-1 h-16">{galaxy.description}</p>
                
                <div className="bg-white/5 rounded p-3 mb-6 font-oxanium text-xs space-y-1 border border-white/5">
                  <div className="text-white/40 uppercase mb-2 tracking-widest text-[10px]">Active Modifiers</div>
                  {Object.keys(galaxy.modifiers).length === 0 ? (
                    <div className="text-safe">Standard combat conditions</div>
                  ) : (
                    <>
                      {galaxy.modifiers.enemyHpMultiplier && <div className="text-rose">Enemy HP x{galaxy.modifiers.enemyHpMultiplier}</div>}
                      {galaxy.modifiers.blackHoleFreq && <div className="text-violet">Black hole anomaly rate x{galaxy.modifiers.blackHoleFreq}</div>}
                      {galaxy.modifiers.enemyFireRate && <div className="text-plasma">Enemy aggression x{galaxy.modifiers.enemyFireRate}</div>}
                      {galaxy.modifiers.enemySizeDmg && <div className="text-rose">Titanic enemy class presence</div>}
                      {galaxy.modifiers.cosmicStormDrift && <div className="text-gold">Class-9 Cosmic Storm interference</div>}
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
                      variant="secondary" 
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
