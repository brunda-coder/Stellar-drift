import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';

interface ProfilePageProps {
  setPage: (p: Page) => void;
}

/* ── Pilot data ── */
interface Pilot {
  id: string;
  name: string;
  title: string;
  description: string;
  unlockCost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  glowColor: string;
  tags: string[];
}

const PILOTS: Pilot[] = [
  { id: 'nova',   name: 'NOVA',   title: 'The Drifter',         description: 'A seasoned void-runner who navigated the Cigar nebula solo. Calm under pressure, ruthless when provoked.', unlockCost: 0,     rarity: 'common',    color: '#00ffff', glowColor: 'rgba(0,255,255,0.5)',    tags: ['STARTER', 'BALANCED'] },
  { id: 'vex',    name: 'VEX',    title: 'The Phantom',         description: 'Ghost operative. Sealed in a void-cloak with no visible face. You never see Vex — until it\'s too late.', unlockCost: 2000,  rarity: 'rare',      color: '#d873ff', glowColor: 'rgba(188,0,251,0.5)',    tags: ['STEALTH', 'SPEED'] },
  { id: 'sable',  name: 'SABLE',  title: 'Iron Warden',         description: 'Enforcer-class pilot in reinforced void-iron. Survived 3 black hole events. Zero empathy, pure efficiency.', unlockCost: 5000, rarity: 'rare',      color: '#ff6b9b', glowColor: 'rgba(227,0,113,0.5)',    tags: ['TANK', 'ARMORED'] },
  { id: 'arc',    name: 'ARC',    title: 'Plasma Engineer',     description: 'Ex-weapons engineer turned combat pilot. Modified their exosuit with raw plasma conduits. Volatile.', unlockCost: 8000,    rarity: 'epic',      color: '#ffd060', glowColor: 'rgba(255,192,0,0.5)',    tags: ['TECH', 'FIRE RATE'] },
  { id: 'rift',   name: 'RIFT',   title: 'The Anomaly',         description: 'Origin unknown. Appears during singularity events. Their form warps spacetime. Not entirely human.', unlockCost: 15000,   rarity: 'epic',      color: '#00ff88', glowColor: 'rgba(0,255,136,0.5)',    tags: ['ANOMALY', 'WARP'] },
  { id: 'kairos', name: 'KAIROS', title: 'Temporal Commander',  description: 'Commands a Kinetic Archive strike unit. Neural uplink suits interface directly with ship AI. Undefeated.', unlockCost: 30000, rarity: 'legendary', color: '#ff8c00', glowColor: 'rgba(255,140,0,0.6)',    tags: ['LEGENDARY', 'COMMAND'] },
  { id: 'lyra',   name: 'LYRA',   title: 'Star Weaver',         description: 'Navigator-class pilot who reads stellar drift currents. Leads fleets through unmapped voids. Legend.', unlockCost: 25000, rarity: 'legendary', color: '#c1fffe', glowColor: 'rgba(193,255,254,0.5)',  tags: ['NAVIGATOR', 'SUPPORT'] },
  { id: 'abyss',  name: 'ABYSS',  title: 'Void Sovereign',      description: 'The apex pilot. Survived every galaxy. Suit fused with dark matter. Controls the drift itself.', unlockCost: 99000, rarity: 'legendary', color: '#ff067f', glowColor: 'rgba(255,6,127,0.7)',    tags: ['GODTIER', 'VOID'] },
];

const RARITY_STYLES = {
  common:    { label: 'STANDARD',   border: 'border-white/25',        badge: 'bg-white/12 text-white/75' },
  rare:      { label: 'RARE',       border: 'border-purple-400/50',   badge: 'bg-purple-500/25 text-purple-200' },
  epic:      { label: 'EPIC',       border: 'border-amber-400/60',    badge: 'bg-amber-500/25 text-amber-200' },
  legendary: { label: 'LEGENDARY',  border: 'border-orange-400/60',   badge: 'bg-gradient-to-r from-yellow-600/35 to-orange-600/35 text-yellow-200' },
};

/* ── Structurally unique pilot SVGs ── */
const PilotAvatar = ({ pilot, size = 140 }: { pilot: Pilot; size?: number }) => {
  const c = pilot.color;
  const g = pilot.glowColor;

  // Each pilot has a completely distinct silhouette and body structure
  const renderBody = () => {
    switch (pilot.id) {

      case 'nova': // Classic slim hero suit — clean, upright, standard humanoid
        return <>
          {/* Glow */}
          <ellipse cx="50" cy="65" rx="30" ry="38" fill={g} style={{ filter: 'blur(14px)' }} opacity="0.55" />
          {/* Legs */}
          <path d="M38 96 L36 116 L42 116 L44 100 Z" fill={c} fillOpacity="0.35" />
          <path d="M62 96 L64 116 L58 116 L56 100 Z" fill={c} fillOpacity="0.35" />
          <rect x="37" y="113" width="8" height="5" rx="2" fill={c} fillOpacity="0.5" />
          <rect x="55" y="113" width="8" height="5" rx="2" fill={c} fillOpacity="0.5" />
          {/* Torso */}
          <path d="M32 60 Q30 96 38 98 L62 98 Q70 96 68 60 L66 50 Q60 40 50 40 Q40 40 34 50 Z" fill="#080f18" />
          <path d="M32 60 Q30 96 38 98 L62 98 Q70 96 68 60 L66 50 Q60 40 50 40 Q40 40 34 50 Z" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Chest plate details */}
          <path d="M38 58 L62 58 L64 78 L50 82 L36 78 Z" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="0.6" strokeOpacity="0.4" />
          {/* Center stripe */}
          <line x1="50" y1="42" x2="50" y2="96" stroke={c} strokeWidth="0.7" strokeOpacity="0.35" strokeDasharray="4 3" />
          {/* Arc reactor */}
          <circle cx="50" cy="68" r="5.5" fill="#040810" stroke={c} strokeWidth="1.2" />
          <circle cx="50" cy="68" r="3" fill={c} fillOpacity="0.9" />
          <circle cx="50" cy="68" r="1.2" fill="white" />
          {/* Shoulders */}
          <ellipse cx="27" cy="56" rx="7" ry="5.5" fill="#080f18" stroke={c} strokeWidth="0.8" strokeOpacity="0.65" />
          <ellipse cx="73" cy="56" rx="7" ry="5.5" fill="#080f18" stroke={c} strokeWidth="0.8" strokeOpacity="0.65" />
          {/* Arms */}
          <path d="M21 56 Q17 72 19 86" stroke={c} strokeWidth="5" strokeOpacity="0.4" strokeLinecap="round" fill="none" />
          <path d="M79 56 Q83 72 81 86" stroke={c} strokeWidth="5" strokeOpacity="0.4" strokeLinecap="round" fill="none" />
          {/* Gauntlets */}
          <rect x="14" y="82" width="9" height="10" rx="2" fill={c} fillOpacity="0.5" />
          <rect x="77" y="82" width="9" height="10" rx="2" fill={c} fillOpacity="0.5" />
          {/* Neck */}
          <rect x="45" y="34" width="10" height="8" rx="2" fill="#080f18" />
          {/* Helmet — full round */}
          <ellipse cx="50" cy="22" rx="18" ry="20" fill="#080f18" stroke={c} strokeWidth="1.2" strokeOpacity="0.8" />
          {/* Visor — full horizontal band */}
          <path d="M35 18 Q50 11 65 18 L63 26 Q50 32 37 26 Z" fill={c} fillOpacity="0.85" />
          <path d="M38 17 Q45 13 52 14" stroke="white" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
          {/* Helmet fin top */}
          <path d="M44 3 Q50 1 56 3" stroke={c} strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
          {/* Belt */}
          <rect x="35" y="90" width="30" height="4" rx="1" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="0.5" strokeOpacity="0.45" />
          <rect x="47" y="88" width="6" height="8" rx="1" fill={c} fillOpacity="0.55" />
        </>;

      case 'vex': // Hooded cloaked figure — asymmetric, mysterious, no visor
        return <>
          <ellipse cx="50" cy="65" rx="32" ry="40" fill={g} style={{ filter: 'blur(16px)' }} opacity="0.45" />
          {/* Cloak — wide draped shape */}
          <path d="M20 55 Q15 80 18 110 Q35 118 50 116 Q65 118 82 110 Q85 80 80 55 L72 46 Q62 38 50 38 Q38 38 28 46 Z" fill="#0a0010" stroke={c} strokeWidth="0.6" strokeOpacity="0.3" />
          {/* Cloak folds */}
          <path d="M20 60 Q25 85 22 108" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
          <path d="M80 60 Q75 85 78 108" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
          <path d="M35 70 Q30 90 32 112" stroke={c} strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
          <path d="M65 70 Q70 90 68 112" stroke={c} strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
          {/* Asymmetric inner body — only right side visible */}
          <path d="M50 42 Q58 44 64 52 L62 90 L50 94 L42 88 L40 56 Z" fill="#100022" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
          {/* One glowing hand emerging */}
          <circle cx="24" cy="82" r="4" fill={c} fillOpacity="0.3" />
          <path d="M24 78 L22 73 M24 78 L20 75 M24 78 L21 80" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Sigil on chest */}
          <path d="M46 62 L50 56 L54 62 L58 62 L54 67 L56 73 L50 69 L44 73 L46 67 L42 62 Z" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.6" strokeOpacity="0.6" />
          {/* Hood */}
          <path d="M30 36 Q28 20 50 16 Q72 20 70 36 Q62 30 50 29 Q38 30 30 36 Z" fill="#0a0010" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M30 36 Q36 28 50 27 Q64 28 70 36 L68 42 Q60 36 50 35 Q40 36 32 42 Z" fill="#120020" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Hidden face — only two glowing eyes */}
          <circle cx="44" cy="32" r="2" fill={c} fillOpacity="0.9" />
          <circle cx="56" cy="32" r="2" fill={c} fillOpacity="0.9" />
          <ellipse cx="44" cy="32" rx="4" ry="3" fill={c} fillOpacity="0.15" />
          <ellipse cx="56" cy="32" rx="4" ry="3" fill={c} fillOpacity="0.15" />
        </>;

      case 'sable': // Hulking heavy armour — massive pauldrons, squat thick build
        return <>
          <ellipse cx="50" cy="68" rx="36" ry="38" fill={g} style={{ filter: 'blur(16px)' }} opacity="0.45" />
          {/* Stubby thick legs */}
          <rect x="33" y="92" width="13" height="22" rx="3" fill="#0a0005" stroke={c} strokeWidth="0.7" strokeOpacity="0.5" />
          <rect x="54" y="92" width="13" height="22" rx="3" fill="#0a0005" stroke={c} strokeWidth="0.7" strokeOpacity="0.5" />
          {/* Boot armor */}
          <rect x="31" y="108" width="17" height="8" rx="2" fill={c} fillOpacity="0.4" />
          <rect x="52" y="108" width="17" height="8" rx="2" fill={c} fillOpacity="0.4" />
          {/* Barrel chest */}
          <rect x="28" y="50" width="44" height="46" rx="6" fill="#0e0008" />
          <rect x="28" y="50" width="44" height="46" rx="6" fill={c} fillOpacity="0.07" stroke={c} strokeWidth="1" strokeOpacity="0.4" />
          {/* Chest armour plates */}
          <rect x="32" y="54" width="16" height="20" rx="2" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="0.5" strokeOpacity="0.5" />
          <rect x="52" y="54" width="16" height="20" rx="2" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="0.5" strokeOpacity="0.5" />
          {/* Central reactor — bigger */}
          <circle cx="50" cy="72" r="7" fill="#080008" stroke={c} strokeWidth="1.5" />
          <circle cx="50" cy="72" r="4" fill={c} fillOpacity="0.8" />
          <circle cx="50" cy="72" r="1.8" fill="white" />
          {/* MASSIVE shoulder guards */}
          <ellipse cx="17" cy="54" rx="13" ry="10" fill="#0e0008" stroke={c} strokeWidth="1" strokeOpacity="0.6" />
          <ellipse cx="83" cy="54" rx="13" ry="10" fill="#0e0008" stroke={c} strokeWidth="1" strokeOpacity="0.6" />
          <ellipse cx="17" cy="54" rx="9" ry="7" fill={c} fillOpacity="0.12" />
          <ellipse cx="83" cy="54" rx="9" ry="7" fill={c} fillOpacity="0.12" />
          {/* Thick arms */}
          <rect x="4" y="56" width="10" height="30" rx="4" fill="#0e0008" stroke={c} strokeWidth="0.7" strokeOpacity="0.45" />
          <rect x="86" y="56" width="10" height="30" rx="4" fill="#0e0008" stroke={c} strokeWidth="0.7" strokeOpacity="0.45" />
          {/* Armored fists */}
          <rect x="3" y="83" width="12" height="10" rx="3" fill={c} fillOpacity="0.45" />
          <rect x="85" y="83" width="12" height="10" rx="3" fill={c} fillOpacity="0.45" />
          {/* Neck guard */}
          <rect x="41" y="38" width="18" height="14" rx="4" fill="#0e0008" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Squat helmet — wide, low with a T-visor */}
          <rect x="28" y="15" width="44" height="28" rx="8" fill="#0e0008" stroke={c} strokeWidth="1.2" strokeOpacity="0.7" />
          {/* T-visor slit */}
          <rect x="32" y="24" width="36" height="6" rx="1" fill={c} fillOpacity="0.8" />
          <rect x="46" y="20" width="8" height="14" rx="1" fill={c} fillOpacity="0.5" />
          {/* Helmet bolts */}
          <circle cx="33" cy="18" r="1.5" fill={c} fillOpacity="0.6" />
          <circle cx="67" cy="18" r="1.5" fill={c} fillOpacity="0.6" />
          <circle cx="33" cy="38" r="1.5" fill={c} fillOpacity="0.6" />
          <circle cx="67" cy="38" r="1.5" fill={c} fillOpacity="0.6" />
        </>;

      case 'arc': // Exosuit — mechanical conduits/pipes, goggle visor, tech-heavy
        return <>
          <ellipse cx="50" cy="65" rx="30" ry="38" fill={g} style={{ filter: 'blur(14px)' }} opacity="0.5" />
          {/* Legs with mechanical knee joints */}
          <rect x="36" y="90" width="11" height="26" rx="2" fill="#100800" stroke={c} strokeWidth="0.7" strokeOpacity="0.5" />
          <rect x="53" y="90" width="11" height="26" rx="2" fill="#100800" stroke={c} strokeWidth="0.7" strokeOpacity="0.5" />
          {/* Knee joints */}
          <circle cx="41" cy="95" r="4" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="0.8" />
          <circle cx="59" cy="95" r="4" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="0.8" />
          {/* Boots */}
          <rect x="32" y="110" width="18" height="8" rx="2" fill={c} fillOpacity="0.35" />
          <rect x="50" y="110" width="18" height="8" rx="2" fill={c} fillOpacity="0.35" />
          {/* Main torso — technical */}
          <path d="M30 55 L30 94 Q36 98 50 98 Q64 98 70 94 L70 55 L64 44 Q57 38 50 38 Q43 38 36 44 Z" fill="#100c00" />
          <path d="M30 55 L30 94 Q36 98 50 98 Q64 98 70 94 L70 55 L64 44 Q57 38 50 38 Q43 38 36 44 Z" stroke={c} strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
          {/* External conduit pipes on arms */}
          <path d="M20 55 Q16 68 18 84" stroke={c} strokeWidth="3.5" strokeOpacity="0.7" strokeLinecap="round" fill="none" />
          <path d="M80 55 Q84 68 82 84" stroke={c} strokeWidth="3.5" strokeOpacity="0.7" strokeLinecap="round" fill="none" />
          {/* Pipe joints */}
          <circle cx="19" cy="65" r="3" fill={c} fillOpacity="0.6" />
          <circle cx="81" cy="65" r="3" fill={c} fillOpacity="0.6" />
          <circle cx="18" cy="78" r="3" fill={c} fillOpacity="0.6" />
          <circle cx="82" cy="78" r="3" fill={c} fillOpacity="0.6" />
          {/* Arm base */}
          <rect x="8" y="52" width="13" height="34" rx="3" fill="#100c00" stroke={c} strokeWidth="0.7" strokeOpacity="0.35" />
          <rect x="79" y="52" width="13" height="34" rx="3" fill="#100c00" stroke={c} strokeWidth="0.7" strokeOpacity="0.35" />
          {/* Mechanical hands */}
          <rect x="6" y="83" width="15" height="8" rx="2" fill={c} fillOpacity="0.4" />
          <rect x="79" y="83" width="15" height="8" rx="2" fill={c} fillOpacity="0.4" />
          {/* Shoulder epaulettes */}
          <path d="M16 50 L28 46 L30 58 L16 62 Z" fill="#100c00" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M84 50 L72 46 L70 58 L84 62 Z" fill="#100c00" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Chest — exposed tech panel */}
          <rect x="36" y="52" width="28" height="30" rx="3" fill={c} fillOpacity="0.07" stroke={c} strokeWidth="0.7" strokeOpacity="0.4" />
          <rect x="39" y="56" width="10" height="12" rx="1" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.5" strokeOpacity="0.5" />
          <rect x="51" y="56" width="10" height="12" rx="1" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.5" strokeOpacity="0.5" />
          <rect x="39" y="71" width="22" height="6" rx="1" fill={c} fillOpacity="0.2" />
          {/* Core plasma sphere */}
          <circle cx="50" cy="77" r="4" fill={c} fillOpacity="0.8" />
          <circle cx="50" cy="77" r="2" fill="white" fillOpacity="0.9" />
          {/* Neck */}
          <rect x="44" y="33" width="12" height="8" rx="2" fill="#100c00" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Helmet — tech visor, open face style with goggle ring */}
          <ellipse cx="50" cy="21" rx="17" ry="19" fill="#100c00" stroke={c} strokeWidth="1" strokeOpacity="0.7" />
          {/* Circular goggle visor */}
          <circle cx="43" cy="21" r="7" fill="#050300" stroke={c} strokeWidth="1.2" strokeOpacity="0.8" />
          <circle cx="57" cy="21" r="7" fill="#050300" stroke={c} strokeWidth="1.2" strokeOpacity="0.8" />
          <circle cx="43" cy="21" r="5" fill={c} fillOpacity="0.25" />
          <circle cx="57" cy="21" r="5" fill={c} fillOpacity="0.25" />
          <rect x="49" y="20" width="2" height="2" rx="1" fill={c} fillOpacity="0.5" />
          {/* Antenna on helmet */}
          <line x1="50" y1="3" x2="50" y2="11" stroke={c} strokeWidth="1.2" strokeOpacity="0.7" />
          <circle cx="50" cy="3" r="2" fill={c} fillOpacity="0.8" />
        </>;

      case 'rift': // Ethereal anomaly — wavy form, glowing cracks, distorted
        return <>
          <ellipse cx="50" cy="65" rx="34" ry="42" fill={g} style={{ filter: 'blur(20px)' }} opacity="0.5" />
          {/* Distorted lower body — no clear legs, wisps */}
          <path d="M38 90 Q34 100 30 116 Q40 118 50 116 Q60 118 70 116 Q66 100 62 90 Z" fill={c} fillOpacity="0.08" />
          {/* Energy wisps */}
          <path d="M35 95 Q28 105 25 118" stroke={c} strokeWidth="1.2" strokeOpacity="0.35" fill="none" strokeLinecap="round" />
          <path d="M50 98 Q50 108 48 118" stroke={c} strokeWidth="1.2" strokeOpacity="0.45" fill="none" strokeLinecap="round" />
          <path d="M65 95 Q72 105 75 118" stroke={c} strokeWidth="1.2" strokeOpacity="0.35" fill="none" strokeLinecap="round" />
          {/* Torso — slightly wavy/distorted */}
          <path d="M30 58 Q27 80 29 96 Q38 102 50 100 Q62 102 71 96 Q73 80 70 58 Q64 42 50 40 Q36 42 30 58 Z" fill="#001208" fillOpacity="0.85" />
          <path d="M30 58 Q27 80 29 96 Q38 102 50 100 Q62 102 71 96 Q73 80 70 58 Q64 42 50 40 Q36 42 30 58 Z" stroke={c} strokeWidth="0.7" strokeOpacity="0.3" fill="none" />
          {/* Glowing crack lines on body */}
          <path d="M50 44 Q54 52 50 60 Q46 68 50 76 Q54 84 50 92" stroke={c} strokeWidth="1.5" strokeOpacity="0.75" fill="none" />
          <path d="M40 55 Q46 60 44 68 Q42 76 46 82" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
          <path d="M60 55 Q54 60 56 68 Q58 76 54 82" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
          {/* Ethereal glow orb center */}
          <circle cx="50" cy="68" r="8" fill={c} fillOpacity="0.15" />
          <circle cx="50" cy="68" r="5" fill={c} fillOpacity="0.25" />
          <circle cx="50" cy="68" r="2.5" fill={c} fillOpacity="0.85" />
          {/* Wavy arms — more distorted */}
          <path d="M29 58 Q18 68 16 82 Q14 90 18 94" stroke={c} strokeWidth="4.5" strokeOpacity="0.3" strokeLinecap="round" fill="none" />
          <path d="M71 58 Q82 68 84 82 Q86 90 82 94" stroke={c} strokeWidth="4.5" strokeOpacity="0.3" strokeLinecap="round" fill="none" />
          {/* Floating particle trails */}
          <circle cx="14" cy="70" r="1.5" fill={c} fillOpacity="0.5" />
          <circle cx="86" cy="70" r="1.5" fill={c} fillOpacity="0.5" />
          <circle cx="12" cy="82" r="1" fill={c} fillOpacity="0.4" />
          <circle cx="88" cy="82" r="1" fill={c} fillOpacity="0.4" />
          {/* No clear neck — head floats slightly */}
          {/* Head — slightly distorted oval */}
          <ellipse cx="50" cy="24" rx="19" ry="21" fill="#001208" fillOpacity="0.9" />
          <ellipse cx="50" cy="24" rx="19" ry="21" stroke={c} strokeWidth="0.8" strokeOpacity="0.3" fill="none" />
          {/* Crack on face */}
          <path d="M50 10 Q53 16 50 22 Q47 28 50 34" stroke={c} strokeWidth="1.2" strokeOpacity="0.7" fill="none" />
          {/* Glowing eyes — non-human */}
          <ellipse cx="42" cy="22" rx="5" ry="4" fill={c} fillOpacity="0.2" />
          <ellipse cx="58" cy="22" rx="5" ry="4" fill={c} fillOpacity="0.2" />
          <ellipse cx="42" cy="22" rx="3" ry="2" fill={c} fillOpacity="0.7" />
          <ellipse cx="58" cy="22" rx="3" ry="2" fill={c} fillOpacity="0.7" />
          {/* Floating ring above head */}
          <ellipse cx="50" cy="6" rx="12" ry="3" fill="none" stroke={c} strokeWidth="1" strokeOpacity="0.45" />
        </>;

      case 'kairos': // Command throne — regal cape, tall crown helmet, wide stance
        return <>
          <ellipse cx="50" cy="68" rx="35" ry="40" fill={g} style={{ filter: 'blur(16px)' }} opacity="0.5" />
          {/* Flowing cape behind — wide sweep */}
          <path d="M22 46 Q8 70 10 110 L20 112 Q25 85 30 70 L34 54 Z" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
          <path d="M78 46 Q92 70 90 110 L80 112 Q75 85 70 70 L66 54 Z" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
          {/* Cape inner */}
          <path d="M28 50 Q20 80 22 110 L30 110 Q32 82 36 62 Z" fill="#0a0800" stroke={c} strokeWidth="0.4" strokeOpacity="0.2" />
          <path d="M72 50 Q80 80 78 110 L70 110 Q68 82 64 62 Z" fill="#0a0800" stroke={c} strokeWidth="0.4" strokeOpacity="0.2" />
          {/* Stance legs */}
          <rect x="36" y="88" width="12" height="28" rx="3" fill="#0a0800" stroke={c} strokeWidth="0.7" strokeOpacity="0.45" />
          <rect x="52" y="88" width="12" height="28" rx="3" fill="#0a0800" stroke={c} strokeWidth="0.7" strokeOpacity="0.45" />
          {/* Command armour boots */}
          <path d="M33 110 L35 118 L50 118 L50 110 Z" fill={c} fillOpacity="0.4" />
          <path d="M50 110 L50 118 L65 118 L67 110 Z" fill={c} fillOpacity="0.4" />
          {/* Imperial torso */}
          <path d="M30 52 L30 90 Q38 96 50 96 Q62 96 70 90 L70 52 L62 42 Q56 36 50 36 Q44 36 38 42 Z" fill="#0a0800" />
          <path d="M30 52 L30 90 Q38 96 50 96 Q62 96 70 90 L70 52 L62 42 Q56 36 50 36 Q44 36 38 42 Z" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="0.8" strokeOpacity="0.45" />
          {/* Chest medalions */}
          <circle cx="42" cy="62" r="4" fill="#0a0800" stroke={c} strokeWidth="0.8" strokeOpacity="0.7" />
          <circle cx="42" cy="62" r="2" fill={c} fillOpacity="0.5" />
          <circle cx="58" cy="62" r="4" fill="#0a0800" stroke={c} strokeWidth="0.8" strokeOpacity="0.7" />
          <circle cx="58" cy="62" r="2" fill={c} fillOpacity="0.5" />
          {/* Command crest plate */}
          <path d="M38 50 L50 44 L62 50 L62 66 L50 72 L38 66 Z" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M44 52 L50 48 L56 52 L56 64 L50 68 L44 64 Z" fill={c} fillOpacity="0.15" />
          {/* Command star */}
          <path d="M50 54 L51.5 58.5 L56 58.5 L52.5 61 L54 65.5 L50 63 L46 65.5 L47.5 61 L44 58.5 L48.5 58.5 Z" fill={c} fillOpacity="0.7" />
          {/* Wide arms — commanding pose */}
          <ellipse cx="22" cy="54" rx="9" ry="7" fill="#0a0800" stroke={c} strokeWidth="0.9" strokeOpacity="0.6" />
          <ellipse cx="78" cy="54" rx="9" ry="7" fill="#0a0800" stroke={c} strokeWidth="0.9" strokeOpacity="0.6" />
          <path d="M13 54 Q8 66 10 80" stroke={c} strokeWidth="6" strokeOpacity="0.35" strokeLinecap="round" fill="none" />
          <path d="M87 54 Q92 66 90 80" stroke={c} strokeWidth="6" strokeOpacity="0.35" strokeLinecap="round" fill="none" />
          {/* Gauntlets with command ring */}
          <rect x="5" y="76" width="11" height="11" rx="3" fill={c} fillOpacity="0.45" />
          <rect x="84" y="76" width="11" height="11" rx="3" fill={c} fillOpacity="0.45" />
          <circle cx="10" cy="81" r="3" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="0.8" />
          <circle cx="90" cy="81" r="3" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="0.8" />
          {/* Tall crown helmet */}
          <ellipse cx="50" cy="25" rx="17" ry="19" fill="#0a0800" stroke={c} strokeWidth="1" strokeOpacity="0.7" />
          {/* Crown spires */}
          <path d="M50 7 L53 16 L50 14 L47 16 Z" fill={c} fillOpacity="0.8" />
          <path d="M40 10 L42 18 L39 17 L37 19 Z" fill={c} fillOpacity="0.5" />
          <path d="M60 10 L58 18 L61 17 L63 19 Z" fill={c} fillOpacity="0.5" />
          {/* Visor — narrow eye slit */}
          <rect x="36" y="22" width="28" height="5" rx="1" fill={c} fillOpacity="0.85" />
          {/* Helmet decorative band */}
          <path d="M34 32 Q50 36 66 32" stroke={c} strokeWidth="1" strokeOpacity="0.5" fill="none" />
        </>;

      case 'lyra': // Navigator — shoulder wings/sensor fins, sleek, star map motifs
        return <>
          <ellipse cx="50" cy="65" rx="38" ry="40" fill={g} style={{ filter: 'blur(16px)' }} opacity="0.45" />
          {/* Navigation shoulder wings */}
          <path d="M26 50 Q8 40 4 56 Q6 66 20 62 L28 58 Z" fill="#001a1a" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M74 50 Q92 40 96 56 Q94 66 80 62 L72 58 Z" fill="#001a1a" stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Wing detail lines */}
          <path d="M8 52 L20 60" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
          <path d="M8 56 L20 62" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
          <path d="M92 52 L80 60" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
          <path d="M92 56 L80 62" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
          {/* Secondary smaller wings */}
          <path d="M26 60 Q12 55 10 66 L22 68 Z" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="0.5" strokeOpacity="0.35" />
          <path d="M74 60 Q88 55 90 66 L78 68 Z" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="0.5" strokeOpacity="0.35" />
          {/* Sleek legs */}
          <path d="M39 90 L37 116 L44 116 L46 96 Z" fill="#001a1a" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
          <path d="M61 90 L63 116 L56 116 L54 96 Z" fill="#001a1a" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Streamlined boot */}
          <path d="M35 112 Q37 118 46 118 L46 112 Z" fill={c} fillOpacity="0.4" />
          <path d="M65 112 Q63 118 54 118 L54 112 Z" fill={c} fillOpacity="0.4" />
          {/* Slim torso */}
          <path d="M34 55 Q32 86 36 96 Q44 100 50 100 Q56 100 64 96 Q68 86 66 55 L60 42 Q55 36 50 36 Q45 36 40 42 Z" fill="#001a1a" />
          <path d="M34 55 Q32 86 36 96 Q44 100 50 100 Q56 100 64 96 Q68 86 66 55 L60 42 Q55 36 50 36 Q45 36 40 42 Z" fill={c} fillOpacity="0.07" stroke={c} strokeWidth="0.7" strokeOpacity="0.35" />
          {/* Star map pattern on chest */}
          <circle cx="50" cy="68" r="10" fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx="50" cy="68" r="6" fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.25" />
          {/* Nav constellation dots */}
          <circle cx="44" cy="62" r="1" fill={c} fillOpacity="0.7" />
          <circle cx="56" cy="64" r="1" fill={c} fillOpacity="0.7" />
          <circle cx="46" cy="74" r="1" fill={c} fillOpacity="0.7" />
          <circle cx="58" cy="72" r="1" fill={c} fillOpacity="0.7" />
          <circle cx="50" cy="60" r="1.5" fill={c} fillOpacity="0.9" />
          {/* Star lines */}
          <line x1="44" y1="62" x2="50" y2="60" stroke={c} strokeWidth="0.4" strokeOpacity="0.4" />
          <line x1="56" y1="64" x2="50" y2="60" stroke={c} strokeWidth="0.4" strokeOpacity="0.4" />
          <line x1="46" y1="74" x2="58" y2="72" stroke={c} strokeWidth="0.4" strokeOpacity="0.3" />
          {/* Arms */}
          <path d="M26 56 Q22 70 24 84" stroke={c} strokeWidth="5" strokeOpacity="0.35" strokeLinecap="round" fill="none" />
          <path d="M74 56 Q78 70 76 84" stroke={c} strokeWidth="5" strokeOpacity="0.35" strokeLinecap="round" fill="none" />
          <rect x="18" y="80" width="10" height="9" rx="2" fill={c} fillOpacity="0.45" />
          <rect x="72" y="80" width="10" height="9" rx="2" fill={c} fillOpacity="0.45" />
          {/* Neck */}
          <rect x="45" y="33" width="10" height="6" rx="2" fill="#001a1a" />
          {/* Sleek teardrop helmet with navigator fin */}
          <ellipse cx="50" cy="22" rx="16" ry="19" fill="#001a1a" stroke={c} strokeWidth="1" strokeOpacity="0.7" />
          {/* Navigator fin top */}
          <path d="M46 4 L50 2 L54 4 L52 12 L50 14 L48 12 Z" fill={c} fillOpacity="0.6" />
          {/* Curved visor */}
          <path d="M36 20 Q50 14 64 20 L62 27 Q50 32 38 27 Z" fill={c} fillOpacity="0.8" />
          <path d="M39 19 Q46 15 53 16" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
          {/* Side sensor nodes */}
          <circle cx="33" cy="22" r="2.5" fill={c} fillOpacity="0.4" stroke={c} strokeWidth="0.6" />
          <circle cx="67" cy="22" r="2.5" fill={c} fillOpacity="0.4" stroke={c} strokeWidth="0.6" />
        </>;

      case 'abyss': // Void sovereign — upper solid, lower dissolving into dark matter particles
        return <>
          <ellipse cx="50" cy="60" rx="36" ry="44" fill={g} style={{ filter: 'blur(20px)' }} opacity="0.6" />
          {/* Lower body DISSOLVING into void particles */}
          <path d="M35 88 Q30 96 20 108" stroke={c} strokeWidth="2" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
          <path d="M42 92 Q38 100 34 114" stroke={c} strokeWidth="1.5" strokeOpacity="0.25" fill="none" strokeLinecap="round" />
          <path d="M50 94 Q50 104 47 118" stroke={c} strokeWidth="1.5" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
          <path d="M58 92 Q62 100 66 114" stroke={c} strokeWidth="1.5" strokeOpacity="0.25" fill="none" strokeLinecap="round" />
          <path d="M65 88 Q70 96 80 108" stroke={c} strokeWidth="2" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
          {/* Particle scatter */}
          <circle cx="22" cy="112" r="1.5" fill={c} fillOpacity="0.4" />
          <circle cx="30" cy="116" r="1" fill={c} fillOpacity="0.3" />
          <circle cx="40" cy="118" r="1.5" fill={c} fillOpacity="0.35" />
          <circle cx="50" cy="118" r="2" fill={c} fillOpacity="0.3" />
          <circle cx="62" cy="118" r="1" fill={c} fillOpacity="0.3" />
          <circle cx="72" cy="116" r="1.5" fill={c} fillOpacity="0.35" />
          <circle cx="80" cy="112" r="1" fill={c} fillOpacity="0.4" />
          {/* Fade gradient on lower torso */}
          <path d="M32 75 Q30 88 35 95 Q43 100 50 98 Q57 100 65 95 Q70 88 68 75 Z" fill="#10000a" fillOpacity="0.7" />
          {/* Main torso — solid imposing */}
          <path d="M28 50 Q26 76 30 86 Q38 94 50 92 Q62 94 70 86 Q74 76 72 50 L65 38 Q57 30 50 30 Q43 30 35 38 Z" fill="#10000a" />
          <path d="M28 50 Q26 76 30 86 Q38 94 50 92 Q62 94 70 86 Q74 76 72 50 L65 38 Q57 30 50 30 Q43 30 35 38 Z" fill={c} fillOpacity="0.06" stroke={c} strokeWidth="1" strokeOpacity="0.45" />
          {/* Void energy cracks across suit */}
          <path d="M50 34 Q55 44 50 54 Q45 64 50 74 Q55 84 50 90" stroke={c} strokeWidth="2" strokeOpacity="0.8" fill="none" />
          <path d="M38 48 Q44 56 40 64 Q36 72 40 80" stroke={c} strokeWidth="1" strokeOpacity="0.5" fill="none" />
          <path d="M62 48 Q56 56 60 64 Q64 72 60 80" stroke={c} strokeWidth="1" strokeOpacity="0.5" fill="none" />
          {/* Pulsing void core */}
          <circle cx="50" cy="62" r="10" fill={c} fillOpacity="0.07" />
          <circle cx="50" cy="62" r="7" fill={c} fillOpacity="0.12" />
          <circle cx="50" cy="62" r="4.5" fill={c} fillOpacity="0.5" />
          <circle cx="50" cy="62" r="2" fill="white" fillOpacity="0.9" />
          {/* Dark matter arms — ethereal tendrils */}
          <path d="M27 50 Q14 58 10 74 Q8 84 14 90" stroke={c} strokeWidth="5" strokeOpacity="0.35" strokeLinecap="round" fill="none" />
          <path d="M73 50 Q86 58 90 74 Q92 84 86 90" stroke={c} strokeWidth="5" strokeOpacity="0.35" strokeLinecap="round" fill="none" />
          {/* Tendril extensions */}
          <path d="M10 74 Q5 80 8 88" stroke={c} strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" fill="none" />
          <path d="M90 74 Q95 80 92 88" stroke={c} strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" fill="none" />
          {/* Void claws */}
          <circle cx="12" cy="88" r="3" fill={c} fillOpacity="0.3" />
          <circle cx="88" cy="88" r="3" fill={c} fillOpacity="0.3" />
          {/* Neck */}
          <rect x="44" y="26" width="12" height="7" rx="2" fill="#10000a" />
          {/* Imposing helmet — angular crown */}
          <path d="M28 18 L32 4 L50 2 L68 4 L72 18 L72 30 L50 34 L28 30 Z" fill="#10000a" stroke={c} strokeWidth="1.2" strokeOpacity="0.7" />
          {/* Void crack on helmet */}
          <path d="M50 4 Q53 12 50 20 Q47 22 50 28" stroke={c} strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
          {/* Visor — full dark with void eyes */}
          <path d="M32 20 L68 20 L68 28 L32 28 Z" fill="#050005" />
          {/* Two void eyes glowing */}
          <ellipse cx="41" cy="24" rx="5" ry="3" fill={c} fillOpacity="0.9" />
          <ellipse cx="59" cy="24" rx="5" ry="3" fill={c} fillOpacity="0.9" />
          <ellipse cx="41" cy="24" rx="3" ry="2" fill="white" fillOpacity="0.3" />
          <ellipse cx="59" cy="24" rx="3" ry="2" fill="white" fillOpacity="0.3" />
          {/* Crown spikes */}
          <path d="M40 5 L38 0" stroke={c} strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M50 3 L50 0" stroke={c} strokeWidth="1.5" strokeOpacity="0.8" />
          <path d="M60 5 L62 0" stroke={c} strokeWidth="1.5" strokeOpacity="0.6" />
        </>;

      default:
        return <ellipse cx="50" cy="60" rx="20" ry="25" fill={c} fillOpacity="0.3" />;
    }
  };

  return (
    <svg width={size} height={size * 1.22} viewBox="0 0 100 122" fill="none" xmlns="http://www.w3.org/2000/svg">
      {renderBody()}
    </svg>
  );
};

/* ── Stat row ── */
const StatRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div>
    <div className="text-[10px] text-white/50 tracking-widest uppercase mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{label}</div>
    <div className="font-black italic text-base leading-tight" style={{ color, fontFamily: 'Oxanium, sans-serif' }}>{value}</div>
  </div>
);

export default function ProfilePage({ setPage }: ProfilePageProps) {
  const profile = useGameStore(s => s.profile);
  const updateAvatar = useGameStore(s => s.updateAvatar);
  const spendCredits = useGameStore(s => s.spendCredits);
  const logout = useGameStore(s => s.logout);

  const activePilotId = profile.avatar.pilotId ?? 'nova';
  const [selectedPilot, setSelectedPilot] = useState<Pilot>(
    PILOTS.find(p => p.id === activePilotId) ?? PILOTS[0]
  );

  const unlockedPilots = new Set(
    ['nova', ...((profile.avatar as any).unlockedPilots ?? [])]
  );

  const handleSelectPilot = (pilot: Pilot) => {
    setSelectedPilot(pilot);
    if (unlockedPilots.has(pilot.id)) {
      updateAvatar({ pilotId: pilot.id });
    }
  };

  const handleUnlock = (pilot: Pilot) => {
    if (spendCredits(pilot.unlockCost)) {
      const existing = (profile.avatar as any).unlockedPilots ?? [];
      updateAvatar({ pilotId: pilot.id, unlockedPilots: [...existing, pilot.id] } as any);
      unlockedPilots.add(pilot.id);
    }
  };

  const r = RARITY_STYLES[selectedPilot.rarity];

  return (
    <div className="w-full h-full flex flex-col relative z-10 overflow-hidden"
      style={{ background: `radial-gradient(ellipse 60% 50% at 30% 40%, ${selectedPilot.glowColor.replace('0.5', '0.07')} 0%, transparent 65%), #03040a` }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => setPage('menu')}
            className="flex items-center gap-2 text-white/60 hover:text-cyan-300 transition-colors text-sm font-black italic tracking-widest uppercase"
            style={{ fontFamily: 'Oxanium, sans-serif' }}>
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back
          </button>
          <div className="w-px h-6 bg-white/15" />
          <div>
            <h2 className="font-black italic text-xl text-white tracking-wider leading-tight" style={{ fontFamily: 'Oxanium, sans-serif' }}>PILOT PROFILE</h2>
            <p className="text-[11px] text-white/55 tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Select and equip your pilot</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Credits */}
          <div className="flex items-center gap-2 px-3 py-2 border border-cyan-400/25" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <span className="material-symbols-outlined text-cyan-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-black italic text-cyan-400 text-sm" style={{ fontFamily: 'Oxanium, sans-serif' }}>{profile.credits.toLocaleString()}</span>
          </div>
          {/* Username pill */}
          <div className="flex items-center gap-2 px-3 py-2 border border-white/15" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <span className="material-symbols-outlined text-white/60 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            <span className="font-bold text-white/80 text-sm" style={{ fontFamily: 'Oxanium, sans-serif' }}>{profile.username || 'PILOT'}</span>
          </div>
          {/* Logout */}
          <button onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 text-white/40 hover:text-red-400 border border-white/10 hover:border-red-400/30 transition-all text-xs font-black italic tracking-widest"
            style={{ fontFamily: 'Oxanium, sans-serif' }}>
            <span className="material-symbols-outlined text-[15px]">logout</span>
            LOG OUT
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── LEFT: Pilot list ── */}
        <div className="w-72 flex-shrink-0 border-r border-white/10 overflow-y-auto p-2 flex flex-col gap-1.5"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          {PILOTS.map(pilot => {
            const isUnlocked = unlockedPilots.has(pilot.id);
            const isActive = pilot.id === activePilotId;
            const isSelected = pilot.id === selectedPilot.id;
            const rs = RARITY_STYLES[pilot.rarity];
            return (
              <motion.button
                key={pilot.id}
                onClick={() => handleSelectPilot(pilot)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 px-4 py-3 border-l-4 transition-all duration-200 text-left ${isSelected
                    ? `bg-black/70 ${rs.border}`
                    : 'border-l-transparent hover:bg-white/5 border-transparent'
                  }`}
                style={isSelected ? { borderLeftColor: pilot.color } : {}}
              >
                {/* Mini avatar in profile frame */}
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center overflow-hidden rounded border"
                  style={{
                    background: `radial-gradient(circle, ${pilot.glowColor.replace('0.5','0.12')} 0%, rgba(0,0,0,0.7) 100%)`,
                    borderColor: isSelected ? `${pilot.color}55` : 'rgba(255,255,255,0.08)'
                  }}>
                  <PilotAvatar pilot={pilot} size={38} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black italic text-sm leading-tight"
                    style={{ color: isSelected ? pilot.color : 'rgba(255,255,255,0.85)', fontFamily: 'Oxanium, sans-serif' }}>
                    {pilot.name}
                  </div>
                  <div className="text-[10px] text-white/50 tracking-wider truncate" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{pilot.title}</div>
                  <div className="mt-1">
                    <span className={`text-[8px] px-1.5 py-0.5 font-bold tracking-widest ${rs.badge}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {rs.label}
                    </span>
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1 flex-shrink-0">
                  {isActive && <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #00ffff' }} />}
                  {!isUnlocked && <span className="material-symbols-outlined text-white/30 text-[14px]">lock</span>}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── CENTER: Big pilot preview ── */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center relative border-r border-white/10 py-6">
          {/* Ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              key={selectedPilot.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-80 h-80 rounded-full"
              style={{ background: `radial-gradient(circle, ${selectedPilot.glowColor} 0%, transparent 65%)`, filter: 'blur(40px)' }}
            />
          </div>

          {/* Pilot avatar — framed in a circle */}
          <div className="relative mb-4">
            {/* Outer decorative ring */}
            <div className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${selectedPilot.color}44, transparent, ${selectedPilot.color}44)`,
                padding: '2px',
                borderRadius: '9999px',
              }}
            />
            <div className="w-52 h-52 rounded-full flex items-center justify-center overflow-hidden relative"
              style={{
                background: `radial-gradient(circle at 40% 35%, ${selectedPilot.glowColor.replace('0.5','0.15')} 0%, rgba(5,8,15,0.92) 100%)`,
                border: `2px solid ${selectedPilot.color}44`,
                boxShadow: `0 0 40px ${selectedPilot.glowColor}, inset 0 0 20px rgba(0,0,0,0.6)`
              }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPilot.id}
                  initial={{ opacity: 0, scale: 0.75, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
                >
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <PilotAvatar pilot={selectedPilot} size={170} />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Name + title */}
          <AnimatePresence mode="wait">
            <motion.div key={selectedPilot.id + '_label'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <div className="font-black italic text-4xl tracking-tight leading-tight"
                style={{ color: selectedPilot.color, textShadow: `0 0 24px ${selectedPilot.glowColor}`, fontFamily: 'Oxanium, sans-serif' }}>
                {selectedPilot.name}
              </div>
              <div className="text-sm tracking-[0.22em] text-white/60 mt-1 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{selectedPilot.title}</div>
              <div className={`inline-block mt-2 px-4 py-1 text-[10px] font-black italic tracking-widest ${r.badge}`} style={{ fontFamily: 'Oxanium, sans-serif' }}>
                {r.label}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Details + stats ── */}
        <div className="w-96 flex-shrink-0 flex flex-col gap-4 p-5 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.25)' }}>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.div key={selectedPilot.id + '_desc'} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <GlassCard className="py-5 px-5">
                <div className="text-[10px] text-white/40 font-black italic tracking-[0.3em] mb-2 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Intel Report</div>
                <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{selectedPilot.description}</p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {selectedPilot.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-2.5 py-1 font-black italic tracking-widest border"
                      style={{ color: selectedPilot.color, borderColor: `${selectedPilot.color}55`, background: `${selectedPilot.color}14`, fontFamily: 'Oxanium, sans-serif' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Combat record */}
          <GlassCard className="py-5 px-5">
            <div className="text-[10px] text-white/40 font-black italic tracking-[0.3em] mb-4 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Combat Record</div>
            <div className="grid grid-cols-2 gap-4">
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
                <div className="w-full py-4 text-center text-sm font-black italic tracking-widest border"
                  style={{ color: selectedPilot.color, borderColor: `${selectedPilot.color}55`, background: `${selectedPilot.color}0f`, fontFamily: 'Oxanium, sans-serif' }}>
                  ✓ ACTIVE PILOT
                </div>
              ) : unlockedPilots.has(selectedPilot.id) ? (
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${selectedPilot.glowColor}` }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => updateAvatar({ pilotId: selectedPilot.id })}
                  className="w-full py-4 text-sm font-black italic tracking-widest transition-all"
                  style={{ background: selectedPilot.color, color: '#000', fontFamily: 'Oxanium, sans-serif' }}
                >
                  EQUIP {selectedPilot.name}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleUnlock(selectedPilot)}
                  disabled={profile.credits < selectedPilot.unlockCost}
                  className={`w-full py-4 text-sm font-black italic tracking-widest border transition-all ${profile.credits >= selectedPilot.unlockCost ? 'hover:bg-white/5' : 'opacity-40 pointer-events-none'}`}
                  style={{ borderColor: selectedPilot.color + '66', color: selectedPilot.color, fontFamily: 'Oxanium, sans-serif' }}
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
