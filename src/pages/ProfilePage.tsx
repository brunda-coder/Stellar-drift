import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';

interface ProfilePageProps {
  setPage: (p: Page) => void;
}

/* ── Pilot character data ── */
interface Pilot {
  id: string;
  name: string;
  title: string;
  description: string;
  unlockCost: number; // 0 = free
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  colors: { primary: string; secondary: string; accent: string; glow: string };
  tags: string[];
}

const PILOTS: Pilot[] = [
  {
    id: 'nova',
    name: 'NOVA',
    title: 'The Drifter',
    description: 'A seasoned void-runner who navigated the Cigar nebula solo. Calm under pressure, ruthless when provoked.',
    unlockCost: 0,
    rarity: 'common',
    colors: { primary: '#00ffff', secondary: '#003344', accent: '#00e6e6', glow: 'rgba(0,255,255,0.5)' },
    tags: ['STARTER', 'BALANCED'],
  },
  {
    id: 'vex',
    name: 'VEX',
    title: 'The Phantom',
    description: 'Ghost operative. Wears a pitch-black void suit with a biometric HUD visor. You never see Vex — until it\'s too late.',
    unlockCost: 2000,
    rarity: 'rare',
    colors: { primary: '#d873ff', secondary: '#1a0033', accent: '#bc00fb', glow: 'rgba(188,0,251,0.5)' },
    tags: ['STEALTH', 'SPEED'],
  },
  {
    id: 'sable',
    name: 'SABLE',
    title: 'Iron Warden',
    description: 'Enforcer-class pilot draped in reinforced void-iron. Survived 3 black hole events. Zero empathy, pure efficiency.',
    unlockCost: 5000,
    rarity: 'rare',
    colors: { primary: '#ff6b9b', secondary: '#2a0015', accent: '#e30071', glow: 'rgba(227,0,113,0.5)' },
    tags: ['TANK', 'ARMORED'],
  },
  {
    id: 'arc',
    name: 'ARC',
    title: 'Plasma Engineer',
    description: 'Ex-weapons engineer turned combat pilot. Modified their suit with raw plasma conduits. Dangerous to friend and foe alike.',
    unlockCost: 8000,
    rarity: 'epic',
    colors: { primary: '#ffd060', secondary: '#2a1a00', accent: '#ffc000', glow: 'rgba(255,192,0,0.5)' },
    tags: ['TECH', 'FIRE RATE'],
  },
  {
    id: 'rift',
    name: 'RIFT',
    title: 'The Anomaly',
    description: 'Origin unknown. Appears during singularity events. Their suit seems to warp local spacetime. Not entirely human.',
    unlockCost: 15000,
    rarity: 'epic',
    colors: { primary: '#00ff88', secondary: '#001a0d', accent: '#00cc66', glow: 'rgba(0,255,136,0.5)' },
    tags: ['ANOMALY', 'WARP'],
  },
  {
    id: 'kairos',
    name: 'KAIROS',
    title: 'Temporal Commander',
    description: 'Commands a Kinetic Archive strike unit. Their suit interfaces directly with ship systems via neural uplink. Undefeated.',
    unlockCost: 30000,
    rarity: 'legendary',
    colors: { primary: '#ff8c00', secondary: '#1a0700', accent: '#ff6600', glow: 'rgba(255,140,0,0.6)' },
    tags: ['LEGENDARY', 'COMMAND'],
  },
  {
    id: 'lyra',
    name: 'LYRA',
    title: 'Star Weaver',
    description: 'Navigator-class pilot who can read stellar drift currents. Leads fleets through unmapped voids. A legend in Sector 7.',
    unlockCost: 25000,
    rarity: 'legendary',
    colors: { primary: '#c1fffe', secondary: '#001a1a', accent: '#00f5f5', glow: 'rgba(193,255,254,0.5)' },
    tags: ['NAVIGATOR', 'SUPPORT'],
  },
  {
    id: 'abyss',
    name: 'ABYSS',
    title: 'Void Sovereign',
    description: 'The apex pilot. Survived every galaxy, every anomaly. Suit fused with dark matter. Controls the drift itself.',
    unlockCost: 99000,
    rarity: 'legendary',
    colors: { primary: '#ff067f', secondary: '#1a0010', accent: '#cc0060', glow: 'rgba(255,6,127,0.7)' },
    tags: ['GODTIER', 'VOID'],
  },
];

const RARITY_STYLES = {
  common:    { label: 'STANDARD', border: 'border-white/20', badge: 'bg-white/10 text-white/60', glow: '' },
  rare:      { label: 'RARE',     border: 'border-purple-400/40', badge: 'bg-purple-500/20 text-purple-300', glow: 'shadow-[0_0_18px_rgba(168,85,247,0.2)]' },
  epic:      { label: 'EPIC',     border: 'border-amber-400/50', badge: 'bg-amber-500/20 text-amber-300', glow: 'shadow-[0_0_18px_rgba(251,191,36,0.25)]' },
  legendary: { label: 'LEGENDARY', border: 'border-red-400/50', badge: 'bg-gradient-to-r from-yellow-600/30 to-red-600/30 text-yellow-300', glow: 'shadow-[0_0_24px_rgba(251,146,60,0.3)]' },
};

/* ── Pilot avatar SVG ── */
const PilotAvatar = ({ pilot, size = 140 }: { pilot: Pilot; size?: number }) => {
  const c = pilot.colors;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glow halo */}
      <ellipse cx="50" cy="60" rx="38" ry="44" fill={c.glow} style={{ filter: 'blur(18px)' }} opacity="0.6" />
      {/* Suit body */}
      <path d="M26 75 Q24 110 50 115 Q76 110 74 75 L74 55 Q70 38 50 36 Q30 38 26 55 Z" fill={c.secondary} />
      {/* Chest plate */}
      <path d="M32 70 Q30 92 50 96 Q70 92 68 70 L68 58 Q65 46 50 44 Q35 46 32 58 Z" fill={c.primary} fillOpacity="0.15" stroke={c.primary} strokeWidth="0.8" strokeOpacity="0.6" />
      {/* Chest arc reactor */}
      <circle cx="50" cy="68" r="6" fill={c.secondary} stroke={c.accent} strokeWidth="1.2" />
      <circle cx="50" cy="68" r="3" fill={c.accent} fillOpacity="0.8" />
      <circle cx="50" cy="68" r="1.5" fill="white" fillOpacity="0.95" />
      {/* Shoulders */}
      <ellipse cx="25" cy="58" rx="8" ry="6" fill={c.secondary} stroke={c.primary} strokeWidth="0.8" strokeOpacity="0.7" />
      <ellipse cx="75" cy="58" rx="8" ry="6" fill={c.secondary} stroke={c.primary} strokeWidth="0.8" strokeOpacity="0.7" />
      {/* Shoulder stripe */}
      <path d="M18 56 Q19 62 25 64" stroke={c.accent} strokeWidth="1.2" strokeOpacity="0.7" />
      <path d="M82 56 Q81 62 75 64" stroke={c.accent} strokeWidth="1.2" strokeOpacity="0.7" />
      {/* Arms */}
      <path d="M18 58 Q14 70 16 85" stroke={c.primary} strokeWidth="5" strokeOpacity="0.3" strokeLinecap="round" />
      <path d="M82 58 Q86 70 84 85" stroke={c.primary} strokeWidth="5" strokeOpacity="0.3" strokeLinecap="round" />
      {/* Gauntlets */}
      <rect x="12" y="82" width="8" height="10" rx="2" fill={c.primary} fillOpacity="0.5" />
      <rect x="80" y="82" width="8" height="10" rx="2" fill={c.primary} fillOpacity="0.5" />
      {/* Neck */}
      <rect x="44" y="32" width="12" height="8" rx="2" fill={c.secondary} />
      {/* Helmet */}
      <ellipse cx="50" cy="24" rx="20" ry="22" fill={c.secondary} stroke={c.primary} strokeWidth="1.2" strokeOpacity="0.8" />
      {/* Visor */}
      <path d="M34 20 Q50 12 66 20 L64 28 Q50 35 36 28 Z" fill={c.accent} fillOpacity="0.85" />
      {/* Visor glare */}
      <path d="M37 19 Q44 14 50 15" stroke="white" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      {/* Helmet top detail */}
      <path d="M42 4 Q50 2 58 4" stroke={c.accent} strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
      {/* Side fins */}
      <path d="M30 20 Q26 22 28 30" stroke={c.accent} strokeWidth="1" strokeOpacity="0.6" />
      <path d="M70 20 Q74 22 72 30" stroke={c.accent} strokeWidth="1" strokeOpacity="0.6" />
      {/* Suit stripe down center */}
      <path d="M50 44 L50 96" stroke={c.accent} strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="3 3" />
      {/* Belt */}
      <rect x="32" y="84" width="36" height="5" rx="1" fill={c.primary} fillOpacity="0.25" stroke={c.accent} strokeWidth="0.6" strokeOpacity="0.5" />
      <rect x="46" y="83" width="8" height="7" rx="1" fill={c.accent} fillOpacity="0.5" />
    </svg>
  );
};

/* ── Stat row ── */
const StatRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div>
    <div className="text-[9px] text-white/30 tracking-widest uppercase font-body">{label}</div>
    <div className="headline-font font-black italic text-base leading-tight" style={{ color }}>{value}</div>
  </div>
);

export default function ProfilePage({ setPage }: ProfilePageProps) {
  const profile = useGameStore(s => s.profile);
  const updateAvatar = useGameStore(s => s.updateAvatar);
  const spendCredits = useGameStore(s => s.spendCredits);

  const activePilotId = profile.avatar.pilotId ?? 'nova';
  const [selectedPilot, setSelectedPilot] = useState<Pilot>(
    PILOTS.find(p => p.id === activePilotId) ?? PILOTS[0]
  );

  // In a real game you'd store unlocked pilots; here we use credits as the gate
  const unlockedPilots = new Set(
    ['nova', ...(profile.avatar as any).unlockedPilots ?? []]
  );

  const handleSelectPilot = (pilot: Pilot) => {
    setSelectedPilot(pilot);
    if (unlockedPilots.has(pilot.id)) {
      updateAvatar({ pilotId: pilot.id });
    }
  };

  const handleUnlock = (pilot: Pilot) => {
    if (spendCredits(pilot.unlockCost)) {
      // Store unlocked pilots list in avatar as extra field
      const existing = (profile.avatar as any).unlockedPilots ?? [];
      updateAvatar({ pilotId: pilot.id, unlockedPilots: [...existing, pilot.id] } as any);
      unlockedPilots.add(pilot.id);
    }
  };

  const r = RARITY_STYLES[selectedPilot.rarity];

  return (
    <div className="w-full h-full flex flex-col relative z-10 overflow-hidden"
      style={{ background: `radial-gradient(ellipse 60% 50% at 30% 40%, ${selectedPilot.colors.glow.replace('0.5', '0.06')} 0%, transparent 65%), #000005` }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setPage('menu')}
            className="flex items-center gap-1.5 text-white/40 hover:text-cyan-300 transition-colors text-sm headline-font italic tracking-widest uppercase">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div>
            <h2 className="headline-font font-black italic text-xl text-white tracking-wider leading-tight">PILOT PROFILE</h2>
            <p className="text-[10px] text-white/30 font-body tracking-widest">Select and equip your pilot</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-cyan-400/20">
          <span className="material-symbols-outlined text-cyan-400 text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          <span className="font-black italic headline-font text-cyan-400 text-sm">{profile.credits.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── LEFT: Pilot grid selector ── */}
        <div className="w-56 flex-shrink-0 border-r border-white/5 overflow-y-auto p-2 flex flex-col gap-1.5">
          {PILOTS.map(pilot => {
            const isUnlocked = unlockedPilots.has(pilot.id);
            const isActive = pilot.id === activePilotId;
            const isSelected = pilot.id === selectedPilot.id;
            const rs = RARITY_STYLES[pilot.rarity];
            return (
              <motion.button
                key={pilot.id}
                onClick={() => handleSelectPilot(pilot)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 border transition-all duration-200 text-left ${
                  isSelected
                    ? `border-l-4 bg-black/60 ${rs.border}`
                    : 'border-transparent border-l-4 border-l-transparent hover:bg-white/5'
                }`}
                style={isSelected ? { borderLeftColor: pilot.colors.primary } : {}}
              >
                {/* mini avatar */}
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <PilotAvatar pilot={pilot} size={32} />
                </div>
                <div className="min-w-0">
                  <div className="font-black italic headline-font text-xs leading-tight" style={{ color: isSelected ? pilot.colors.primary : 'rgba(255,255,255,0.7)' }}>
                    {pilot.name}
                  </div>
                  <div className="text-[8px] text-white/30 font-body tracking-wider truncate">{pilot.title}</div>
                </div>
                {/* Indicators */}
                <div className="ml-auto flex flex-col items-end gap-1 flex-shrink-0">
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #00ffff' }} />}
                  {!isUnlocked && <span className="material-symbols-outlined text-white/20 text-[14px]">lock</span>}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── CENTER: Big pilot preview ── */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center relative border-r border-white/5 py-4">
          {/* Ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              key={selectedPilot.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-64 h-64 rounded-full"
              style={{ background: `radial-gradient(circle, ${selectedPilot.colors.glow} 0%, transparent 65%)`, filter: 'blur(30px)' }}
            />
          </div>

          {/* Pilot avatar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPilot.id}
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                <PilotAvatar pilot={selectedPilot} size={150} />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Name + title */}
          <AnimatePresence mode="wait">
            <motion.div key={selectedPilot.id + '_label'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mt-3">
              <div className="headline-font font-black italic text-3xl tracking-tight leading-tight" style={{ color: selectedPilot.colors.primary, textShadow: `0 0 20px ${selectedPilot.colors.glow}` }}>
                {selectedPilot.name}
              </div>
              <div className="text-[10px] tracking-[0.25em] text-white/40 font-body uppercase mt-0.5">{selectedPilot.title}</div>
              {/* Rarity badge */}
              <div className={`inline-block mt-2 px-3 py-0.5 text-[9px] font-black italic headline-font tracking-widest ${r.badge}`}>
                {r.label}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Pilot details + stats ── */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto">

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.div key={selectedPilot.id + '_desc'} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <GlassCard className="py-4 px-4">
                <div className="text-[9px] text-white/25 headline-font italic tracking-[0.3em] mb-2 uppercase">Intel Report</div>
                <p className="text-white/60 text-xs font-body leading-relaxed">{selectedPilot.description}</p>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {selectedPilot.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-2 py-0.5 headline-font italic tracking-widest border"
                      style={{ color: selectedPilot.colors.primary, borderColor: `${selectedPilot.colors.primary}44`, background: `${selectedPilot.colors.primary}11` }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Combat record */}
          <GlassCard className="py-4 px-4">
            <div className="text-[9px] text-white/25 headline-font italic tracking-[0.3em] mb-3 uppercase">Combat Record</div>
            <div className="grid grid-cols-2 gap-3">
              <StatRow label="Total Kills" value={profile.stats.totalKills.toLocaleString()} color="#ff067f" />
              <StatRow label="High Score" value={profile.stats.highScore.toLocaleString()} color="#d873ff" />
              <StatRow label="Flight Time" value={`${Math.floor(profile.stats.flightTimeSeconds / 60)}m`} color="#00ffff" />
              <StatRow label="Credits" value={`💎 ${profile.credits.toLocaleString()}`} color="#00e6e6" />
            </div>
          </GlassCard>

          {/* Action button */}
          <AnimatePresence mode="wait">
            <motion.div key={selectedPilot.id + '_btn'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {activePilotId === selectedPilot.id ? (
                <div className="w-full py-3 text-center text-[10px] font-black italic headline-font tracking-widest border"
                  style={{ color: selectedPilot.colors.primary, borderColor: `${selectedPilot.colors.primary}44`, background: `${selectedPilot.colors.primary}11` }}>
                  ✓ ACTIVE PILOT
                </div>
              ) : unlockedPilots.has(selectedPilot.id) ? (
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${selectedPilot.colors.glow}` }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => updateAvatar({ pilotId: selectedPilot.id })}
                  className="w-full py-3 text-[11px] font-black italic headline-font tracking-widest transition-all"
                  style={{ background: selectedPilot.colors.primary, color: '#000' }}
                >
                  EQUIP {selectedPilot.name}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleUnlock(selectedPilot)}
                  disabled={profile.credits < selectedPilot.unlockCost}
                  className={`w-full py-3 text-[10px] font-black italic headline-font tracking-widest border transition-all ${
                    profile.credits >= selectedPilot.unlockCost ? 'hover:bg-white/5' : 'opacity-40 pointer-events-none'
                  }`}
                  style={{ borderColor: selectedPilot.colors.primary + '66', color: selectedPilot.colors.primary }}
                >
                  UNLOCK · 💎 {selectedPilot.unlockCost.toLocaleString()}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
