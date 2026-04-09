import React from 'react';
import { motion } from 'framer-motion';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';
import { GALAXIES } from '../store/data';

interface GalaxyChooserProps {
  setPage: (p: Page) => void;
}

const PageShell = ({ title, subtitle, credits, onBack, children }: {
  title: string; subtitle: string; credits: number; onBack: () => void; children: React.ReactNode;
}) => (
  <div className="w-full h-full flex flex-col relative z-10 overflow-hidden"
    style={{ background: 'radial-gradient(ellipse 70% 50% at 20% 80%, rgba(153,0,206,0.05) 0%, transparent 70%), #000005' }}>
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-cyan-300 transition-colors text-sm headline-font italic tracking-widest uppercase">
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
    <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
  </div>
);

export default function GalaxyChooser({ setPage }: GalaxyChooserProps) {
  const profile = useGameStore(s => s.profile);
  const unlockGalaxy = useGameStore(s => s.unlockGalaxy);
  const spendCredits = useGameStore(s => s.spendCredits);

  const handleUnlock = (id: string, cost: number) => {
    if (profile.credits >= cost && spendCredits(cost)) unlockGalaxy(id);
  };
  const handleSelect = (id: string) => {
    alert(`Expedition launched: ${id}`);
    setPage('game');
  };

  return (
    <PageShell title="GALAXY SELECT" subtitle="Choose your destination sector" credits={profile.credits} onBack={() => setPage('menu')}>
      <div className="h-full overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {GALAXIES.map((galaxy, i) => {
            const isUnlocked = profile.unlockedGalaxies.includes(galaxy.id);
            return (
              <motion.div key={galaxy.id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                <GlassCard className="flex flex-col h-full relative overflow-hidden group py-4 px-4">
                  <div className="absolute top-2 right-2 text-[8px] font-body text-white/20">GAL-{galaxy.id.slice(-4).toUpperCase()}</div>
                  {/* BG tint */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${galaxy.colors.bg1}, ${galaxy.colors.bg2})` }} />
                  <div className="flex items-start justify-between mb-1.5 pr-8">
                    <h3 className="headline-font font-black italic text-sm text-white uppercase tracking-wide leading-tight">{galaxy.name}</h3>
                    <span className="text-yellow-400 text-xs flex-shrink-0">
                      {'★'.repeat(galaxy.difficulty)}{'☆'.repeat(5 - galaxy.difficulty)}
                    </span>
                  </div>
                  <p className="text-white/40 text-[10px] mb-3 flex-1 font-body leading-relaxed">{galaxy.description}</p>
                  {/* Modifiers */}
                  <div className="bg-black/40 p-2 mb-3 text-[9px] space-y-0.5 border-l-2 border-white/10">
                    {Object.keys(galaxy.modifiers).length === 0 ? (
                      <div className="text-cyan-400/60 font-body">Standard conditions</div>
                    ) : (
                      <>
                        {galaxy.modifiers.enemyHpMultiplier && <div className="text-pink-400 font-body">Enemy HP ×{galaxy.modifiers.enemyHpMultiplier}</div>}
                        {galaxy.modifiers.blackHoleFreq && <div className="text-purple-300 font-body">Black holes ×{galaxy.modifiers.blackHoleFreq}</div>}
                        {galaxy.modifiers.enemyFireRate && <div className="text-cyan-400 font-body">Aggression ×{galaxy.modifiers.enemyFireRate}</div>}
                        {galaxy.modifiers.enemySizeDmg && <div className="text-pink-400 font-body">Titanic enemies</div>}
                        {galaxy.modifiers.cosmicStormDrift && <div className="text-yellow-400 font-body">Cosmic storms</div>}
                      </>
                    )}
                  </div>
                  {isUnlocked ? (
                    <button onClick={() => handleSelect(galaxy.id)}
                      className="w-full py-2.5 text-[10px] font-black italic headline-font tracking-widest text-on-primary bg-primary-container hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all active:scale-95">
                      WARP JUMP ▶
                    </button>
                  ) : (
                    <button onClick={() => handleUnlock(galaxy.id, galaxy.unlockCost)}
                      disabled={profile.credits < galaxy.unlockCost}
                      className={`w-full py-2.5 text-[10px] font-black italic headline-font tracking-widest border border-pink-400/50 text-pink-300 hover:bg-pink-500/10 transition-all active:scale-95 ${profile.credits < galaxy.unlockCost ? 'opacity-40 pointer-events-none' : ''}`}>
                      UNLOCK · 💎{galaxy.unlockCost.toLocaleString()}
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
