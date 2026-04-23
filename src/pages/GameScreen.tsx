import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../App';
import NeonButton from '../components/ui/NeonButton';
import { GameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { saveRun, getRunHistory, type RunRecord } from '../store/runHistory';

// ─────────────────────────────────────────────────────────────────────────────
// TUTORIAL DATA — each step is a tooltip card with a screen-region anchor
// ─────────────────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '🚀 Welcome, Pilot!',
    body: 'Move your mouse to steer the ship. Your ship auto-fires toward the cursor.',
    anchorX: '50%', anchorY: '45%',
    tipSide: 'bottom' as const,
    bg: '#0a1a2a',
    accent: '#00e8ff',
  },
  {
    id: 'enemies',
    title: '⚠ ENEMY TYPES',
    body: null, // rendered as a list below
    anchorX: '50%', anchorY: '50%',
    tipSide: 'center' as const,
    bg: '#1a0a0a',
    accent: '#ef4444',
  },
  {
    id: 'hud_hp',
    title: '♥ Hull · ⚡ Energy · ◈ Shield',
    body: 'Your three vitals are shown top-left. Collect ♥ orbs to heal. ⚡ orbs refuel abilities.',
    anchorX: '12%', anchorY: '12%',
    tipSide: 'right' as const,
    bg: '#0a1510',
    accent: '#00ffaa',
  },
  {
    id: 'hud_score',
    title: '🏆 Score & Combo',
    body: 'Score is top-right. Kill enemies rapidly to build a COMBO multiplier — up to 10×!',
    anchorX: '88%', anchorY: '10%',
    tipSide: 'left' as const,
    bg: '#1a1000',
    accent: '#ffd060',
  },
  {
    id: 'abilities',
    title: '⬡ ABILITIES — Q · W · R',
    body: 'Press Q (Nova Burst), W (Phase Shield), R (Warp Pull). Each has a cooldown shown at the bottom.',
    anchorX: '50%', anchorY: '88%',
    tipSide: 'top' as const,
    bg: '#0d0a1a',
    accent: '#8b45ff',
  },
  {
    id: 'pickups',
    title: '💎 PICKUPS',
    body: '⭐ Star = +30 pts  ·  ♥ Heal  ·  ⚡ Energy  ·  💎 MEGA = +200 pts + big heal. Move over them to collect!',
    anchorX: '50%', anchorY: '50%',
    tipSide: 'center' as const,
    bg: '#0a100a',
    accent: '#ffd060',
  },
  {
    id: 'blackhole',
    title: '🌀 BLACK HOLES',
    body: 'Black holes appear later and PULL your ship in. Graze their edge for bonus points — enter them and you take damage!',
    anchorX: '50%', anchorY: '50%',
    tipSide: 'center' as const,
    bg: '#0d001a',
    accent: '#d873ff',
  },
];

const ENEMY_LEGEND = [
  { name: 'DRIFTER',  color: '#8b45ff', shape: '◉', trait: 'Slow bio-drone. Easiest target.' },
  { name: 'SWARMER',  color: '#ff3a8c', shape: '▶', trait: 'Tiny dart. Comes in packs.' },
  { name: 'HUNTER',   color: '#ef4444', shape: '▲', trait: 'Agile arrowhead. Chases fast.' },
  { name: 'ORBITER',  color: '#06b6d4', shape: '⊕', trait: 'Circles you, fires at range.' },
  { name: 'PHANTOM',  color: '#ffffff', shape: '✦', trait: 'Goes ghost — bullets pass through!' },
  { name: 'SNIPER',   color: '#34d399', shape: '⊸', trait: 'Stays far, fires triple spread.' },
  { name: 'TITAN',    color: '#f59e0b', shape: '⬡', trait: 'Huge dreadnought. Splits on death!' },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEP-BY-STEP TUTORIAL POPUP
// ─────────────────────────────────────────────────────────────────────────────
function TutorialPopup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const total = TUTORIAL_STEPS.length;
  const s = TUTORIAL_STEPS[step];
  const isLast = step === total - 1;

  const tipCardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${s.bg}ee 0%, #040810f0 100%)`,
    border: `1.5px solid ${s.accent}55`,
    boxShadow: `0 0 40px ${s.accent}30, 0 8px 32px rgba(0,0,0,0.7)`,
  };

  return (
    <motion.div
      key="tutorial-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40"
      style={{ background: 'rgba(0,0,5,0.82)', backdropFilter: 'blur(3px)' }}
    >
      {/* Progress dots */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {TUTORIAL_STEPS.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ background: i <= step ? s.accent : 'rgba(255,255,255,0.2)', transform: i === step ? 'scale(1.4)' : 'scale(1)' }} />
        ))}
      </div>

      {/* Skip button */}
      <button onClick={onClose}
        className="absolute top-5 right-6 z-50 text-xs font-bold tracking-widest text-white/40 hover:text-white/80 transition-colors uppercase"
        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        SKIP ✕
      </button>

      {/* Anchor dot (pointing to the UI zone) */}
      {s.tipSide !== 'center' && (
        <motion.div
          key={s.id + '-dot'}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute w-5 h-5 rounded-full border-2 z-40"
          style={{
            left: s.anchorX, top: s.anchorY,
            transform: 'translate(-50%,-50%)',
            borderColor: s.accent,
            background: `${s.accent}33`,
            boxShadow: `0 0 0 6px ${s.accent}18`,
          }}
        >
          {/* Pulsing ring */}
          <motion.div className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: s.accent }}
            animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }} />
        </motion.div>
      )}

      {/* Connector line from anchor to card */}
      {s.tipSide !== 'center' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" style={{ overflow: 'visible' }}>
          <line
            x1={s.anchorX} y1={s.anchorY}
            x2={s.tipSide === 'right' ? '28%' : s.tipSide === 'left' ? '72%' : '50%'}
            y2={s.tipSide === 'top' ? '65%' : s.tipSide === 'bottom' ? '35%' : '50%'}
            stroke={s.accent} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 4"
          />
        </svg>
      )}

      {/* Main tooltip card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
            className="relative pointer-events-auto rounded-none p-6 w-full max-w-lg mx-4"
            style={tipCardStyle}
          >
            {/* Top coloured accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />

            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold tracking-[3px] uppercase" style={{ color: s.accent, fontFamily: 'Rajdhani, sans-serif' }}>
                STEP {step + 1} / {total}
              </div>
              <div className="text-[10px] text-white/40 tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>MISSION BRIEF</div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-black italic mb-3 text-white" style={{ fontFamily: 'Oxanium, sans-serif', textShadow: `0 0 16px ${s.accent}80` }}>
              {s.title}
            </h3>

            {/* Body or enemy list */}
            {s.id === 'enemies' ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {ENEMY_LEGEND.map(e => (
                  <div key={e.name} className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{ background: `${e.color}12`, border: `1px solid ${e.color}40` }}>
                    <span className="text-xl flex-shrink-0" style={{ color: e.color }}>{e.shape}</span>
                    <div>
                      <div className="text-xs font-black italic" style={{ color: e.color, fontFamily: 'Oxanium' }}>{e.name}</div>
                      <div className="text-[10px] text-white/70 leading-tight" style={{ fontFamily: 'Rajdhani' }}>{e.trait}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/85 mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {s.body}
              </p>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 mt-2">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="px-5 py-2.5 text-xs font-black italic tracking-widest border text-white/60 hover:text-white/90 transition-all"
                  style={{ fontFamily: 'Oxanium', borderColor: 'rgba(255,255,255,0.15)' }}>
                  ◀ PREV
                </button>
              )}
              <button
                onClick={() => isLast ? onClose() : setStep(s => s + 1)}
                className="flex-1 py-2.5 text-xs font-black italic tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  fontFamily: 'Oxanium',
                  background: isLast ? `linear-gradient(135deg, ${s.accent}, ${s.accent}99)` : s.accent,
                  color: isLast ? '#fff' : '#001122',
                  boxShadow: `0 0 20px ${s.accent}40`,
                }}>
                {isLast ? '▶ ENGAGE MISSION' : 'NEXT ▶'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PILOT CHARACTER PORTRAIT (face-based, not suit) for game over screen
// ─────────────────────────────────────────────────────────────────────────────
function PilotPortrait({ pilotId }: { pilotId: string }) {
  // Character face portraits — each is a distinct person, not a suit
  const portraits: Record<string, { color: string; glow: string; face: React.ReactNode }> = {
    nova: {
      color: '#00ffff', glow: 'rgba(0,255,255,0.5)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Face */}
          <circle cx="40" cy="38" r="24" fill="#C8A882" />
          {/* Hair — short swept */}
          <path d="M18 28 Q20 12 40 10 Q60 12 62 28 Q55 20 40 18 Q25 20 18 28 Z" fill="#1a0a00" />
          <path d="M18 28 Q16 36 18 42" fill="#1a0a00" />
          {/* Eyes */}
          <ellipse cx="33" cy="36" rx="4" ry="4.5" fill="#1a1a3a" />
          <ellipse cx="47" cy="36" rx="4" ry="4.5" fill="#1a1a3a" />
          <circle cx="34.5" cy="34.5" r="1.5" fill="white" />
          <circle cx="48.5" cy="34.5" r="1.5" fill="white" />
          {/* Eyebrow */}
          <path d="M29 30 Q33 28 37 30" stroke="#5a3a20" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M43 30 Q47 28 51 30" stroke="#5a3a20" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Nose */}
          <path d="M40 38 Q38 43 40 44 Q42 43 40 38" stroke="#a07850" strokeWidth="0.8" fill="none" />
          {/* Mouth — determined */}
          <path d="M34 50 Q40 54 46 50" stroke="#a07850" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Suit collar */}
          <path d="M20 60 Q30 56 40 58 Q50 56 60 60 L65 80 L15 80 Z" fill="#00e8ff" fillOpacity="0.4" />
          <path d="M20 60 Q30 56 40 58 Q50 56 60 60" stroke="#00e8ff" strokeWidth="1" fill="none" />
          {/* Visor glint on forehead */}
          <path d="M28 22 Q35 18 42 20" stroke="rgba(0,232,255,0.5)" strokeWidth="1" fill="none" />
        </svg>
      ),
    },
    vex: {
      color: '#d873ff', glow: 'rgba(188,0,251,0.5)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Dark hood */}
          <path d="M12 30 Q14 10 40 8 Q66 10 68 30 Q62 22 40 20 Q18 22 12 30 Z" fill="#0a0010" />
          <path d="M12 30 Q10 42 14 55 L18 62 Q28 56 40 56 Q52 56 62 62 L66 55 Q70 42 68 30" fill="#120020" />
          {/* Face — pale, angular */}
          <ellipse cx="40" cy="40" rx="20" ry="22" fill="#c8b8e0" />
          {/* Glowing eyes — purple */}
          <ellipse cx="33" cy="37" rx="4" ry="4" fill="#200030" />
          <ellipse cx="47" cy="37" rx="4" ry="4" fill="#200030" />
          <ellipse cx="33" cy="37" rx="2.5" ry="2.5" fill="#bc00fb" />
          <ellipse cx="47" cy="37" rx="2.5" ry="2.5" fill="#bc00fb" />
          <circle cx="34" cy="36" r="1" fill="white" fillOpacity="0.5" />
          <circle cx="48" cy="36" r="1" fill="white" fillOpacity="0.5" />
          {/* Thin mouth — eerie smile */}
          <path d="M34 50 Q40 56 46 50" stroke="#800099" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* Mask line across nose */}
          <path d="M26 44 L54 44" stroke="#bc00fb" strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Collar */}
          <path d="M22 62 Q31 58 40 60 Q49 58 58 62 L63 80 L17 80 Z" fill="#bc00fb" fillOpacity="0.3" />
        </svg>
      ),
    },
    sable: {
      color: '#ff6b9b', glow: 'rgba(227,0,113,0.5)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Militaristic short hair */}
          <circle cx="40" cy="38" r="24" fill="#8B6050" />
          <rect x="16" y="18" width="48" height="18" rx="4" fill="#1a0808" />
          {/* Scar on cheek */}
          <path d="M50 42 L54 48" stroke="#ff6b9b" strokeWidth="1.2" strokeOpacity="0.6" />
          {/* Hard set eyes */}
          <rect x="29" y="33" width="9" height="6" rx="1" fill="#1a0808" />
          <rect x="42" y="33" width="9" height="6" rx="1" fill="#1a0808" />
          <rect x="30.5" y="34.5" width="6" height="3" rx="0.5" fill="#ff6b9b" fillOpacity="0.7" />
          <rect x="43.5" y="34.5" width="6" height="3" rx="0.5" fill="#ff6b9b" fillOpacity="0.7" />
          {/* Heavy brows */}
          <rect x="28" y="30" width="12" height="3" rx="1" fill="#3a1a10" />
          <rect x="40" y="30" width="12" height="3" rx="1" fill="#3a1a10" />
          {/* Firm mouth */}
          <path d="M33 50 L47 50" stroke="#7a4030" strokeWidth="2" strokeLinecap="round" />
          {/* Armour collar */}
          <rect x="15" y="60" width="50" height="24" rx="2" fill="#1a0808" />
          <rect x="22" y="62" width="36" height="4" rx="1" fill="#ff6b9b" fillOpacity="0.5" />
        </svg>
      ),
    },
    arc: {
      color: '#ffd060', glow: 'rgba(255,192,0,0.5)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Technical goggles pushed up on forehead */}
          <circle cx="40" cy="40" r="24" fill="#D4A060" />
          {/* Messy engineer hair */}
          <path d="M16 28 Q18 10 40 8 Q55 9 62 18 L64 28 Q58 18 40 16 Q24 17 16 28" fill="#201000" />
          {/* Goggles on forehead */}
          <rect x="26" y="18" width="12" height="8" rx="3" fill="#0a0800" stroke="#ffd060" strokeWidth="1" />
          <rect x="42" y="18" width="12" height="8" rx="3" fill="#0a0800" stroke="#ffd060" strokeWidth="1" />
          <path d="M38 22 L42 22" stroke="#ffd060" strokeWidth="1.5" />
          {/* Bright curious eyes */}
          <circle cx="33" cy="38" r="5" fill="#0a0800" />
          <circle cx="47" cy="38" r="5" fill="#0a0800" />
          <circle cx="33" cy="38" r="3" fill="#ffc000" />
          <circle cx="47" cy="38" r="3" fill="#ffc000" />
          <circle cx="34.2" cy="36.8" r="1.2" fill="white" />
          <circle cx="48.2" cy="36.8" r="1.2" fill="white" />
          {/* Smirk */}
          <path d="M34 50 Q40 55 48 49" stroke="#a07030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Tech collar with conduits */}
          <path d="M18 62 Q28 58 40 60 Q52 58 62 62 L66 80 L14 80 Z" fill="#ffd060" fillOpacity="0.25" />
          <circle cx="25" cy="65" r="2" fill="#ffd060" fillOpacity="0.6" />
          <circle cx="55" cy="65" r="2" fill="#ffd060" fillOpacity="0.6" />
        </svg>
      ),
    },
    rift: {
      color: '#00ff88', glow: 'rgba(0,255,136,0.5)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Glitch distorted face */}
          <ellipse cx="40" cy="40" rx="22" ry="24" fill="#1a3a2a" />
          {/* Cracked / glitched skin overlay */}
          <path d="M40 18 Q43 26 40 34 Q37 42 40 50 Q43 58 40 62" stroke="#00ff88" strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
          {/* Non-human eyes — elongated */}
          <ellipse cx="33" cy="36" rx="6" ry="3.5" fill="#001a10" />
          <ellipse cx="47" cy="36" rx="6" ry="3.5" fill="#001a10" />
          <ellipse cx="33" cy="36" rx="4" ry="2.2" fill="#00ff88" fillOpacity="0.85" />
          <ellipse cx="47" cy="36" rx="4" ry="2.2" fill="#00ff88" fillOpacity="0.85" />
          <ellipse cx="33" cy="36" rx="1.5" ry="1" fill="white" fillOpacity="0.4" />
          {/* No clear mouth, just a faint energy line */}
          <path d="M33 50 L47 50" stroke="#00ff88" strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Floating particles around head */}
          <circle cx="20" cy="32" r="1.5" fill="#00ff88" fillOpacity="0.5" />
          <circle cx="60" cy="38" r="1" fill="#00ff88" fillOpacity="0.4" />
          <circle cx="22" cy="52" r="1" fill="#00ff88" fillOpacity="0.3" />
          {/* Collar — wisps */}
          <path d="M22 62 Q31 56 40 58 Q49 56 58 62" stroke="#00ff88" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
        </svg>
      ),
    },
    kairos: {
      color: '#ff8c00', glow: 'rgba(255,140,0,0.6)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Imperial face — older, commanding */}
          <circle cx="40" cy="40" r="24" fill="#C89060" />
          {/* Crown on head */}
          <path d="M20 22 L20 16 L28 20 L34 12 L40 18 L46 12 L52 20 L60 16 L60 22 Z" fill="#ff8c00" />
          {/* Silver temples/hair */}
          <path d="M16 30 Q16 20 20 22 L20 35" fill="#c0c0c0" />
          <path d="M64 30 Q64 20 60 22 L60 35" fill="#c0c0c0" />
          {/* Strong eyes */}
          <ellipse cx="33" cy="38" rx="5" ry="4" fill="#1a0800" />
          <ellipse cx="47" cy="38" rx="5" ry="4" fill="#1a0800" />
          <ellipse cx="33" cy="38" rx="3" ry="2.5" fill="#ff8c00" fillOpacity="0.8" />
          <ellipse cx="47" cy="38" rx="3" ry="2.5" fill="#ff8c00" fillOpacity="0.8" />
          <circle cx="34.5" cy="37" r="1.2" fill="white" fillOpacity="0.5" />
          <circle cx="48.5" cy="37" r="1.2" fill="white" fillOpacity="0.5" />
          {/* Command beard */}
          <path d="M33 52 Q40 58 47 52 Q46 56 40 59 Q34 56 33 52 Z" fill="#7a4010" />
          {/* Serious mouth */}
          <path d="M34 50 Q40 53 46 50" stroke="#7a4010" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Royal collar */}
          <path d="M16 62 Q26 56 40 58 Q54 56 64 62 L68 80 L12 80 Z" fill="#ff8c00" fillOpacity="0.3" />
          <rect x="30" y="62" width="20" height="4" rx="1" fill="#ff8c00" fillOpacity="0.5" />
        </svg>
      ),
    },
    lyra: {
      color: '#c1fffe', glow: 'rgba(193,255,254,0.5)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Navigator — serene, young */}
          <ellipse cx="40" cy="40" rx="22" ry="24" fill="#E8C8A0" />
          {/* Long flowing hair */}
          <path d="M18 30 Q16 50 18 65 Q22 58 20 40" fill="#4a2a80" />
          <path d="M62 30 Q64 50 62 65 Q58 58 60 40" fill="#4a2a80" />
          <path d="M18 28 Q20 10 40 8 Q60 10 62 28 Q55 20 40 18 Q25 20 18 28" fill="#4a2a80" />
          {/* Star-gazing eyes — large */}
          <circle cx="33" cy="37" r="6" fill="#0a0520" />
          <circle cx="47" cy="37" r="6" fill="#0a0520" />
          <circle cx="33" cy="37" r="4" fill="#8060ff" fillOpacity="0.8" />
          <circle cx="47" cy="37" r="4" fill="#8060ff" fillOpacity="0.8" />
          <circle cx="34" cy="35.5" r="1.8" fill="white" fillOpacity="0.7" />
          <circle cx="48" cy="35.5" r="1.8" fill="white" fillOpacity="0.7" />
          {/* Small star pupils */}
          <circle cx="33" cy="37" r="1.5" fill="#c1fffe" fillOpacity="0.6" />
          <circle cx="47" cy="37" r="1.5" fill="#c1fffe" fillOpacity="0.6" />
          {/* Gentle smile */}
          <path d="M34 50 Q40 55 46 50" stroke="#a07050" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Star mark on cheek */}
          <path d="M52 44 L53 42 L54 44 L56 44 L54.5 45.5 L55 48 L53 46.5 L51 48 L51.5 45.5 L50 44 Z"
            fill="#c1fffe" fillOpacity="0.6" />
          {/* Navigator collar */}
          <path d="M20 62 Q30 58 40 60 Q50 58 60 62 L64 80 L16 80 Z" fill="#c1fffe" fillOpacity="0.2" />
        </svg>
      ),
    },
    abyss: {
      color: '#ff067f', glow: 'rgba(255,6,127,0.7)',
      face: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Void sovereign — dark, imposing */}
          <ellipse cx="40" cy="40" rx="24" ry="26" fill="#1a0010" />
          {/* Dark matter wisps around head */}
          <path d="M16 32 Q10 26 14 20 Q18 28 20 34" fill="#ff067f" fillOpacity="0.2" />
          <path d="M64 32 Q70 26 66 20 Q62 28 60 34" fill="#ff067f" fillOpacity="0.2" />
          {/* Hair — black tendrils */}
          <path d="M16 28 Q20 10 40 8 Q60 10 64 28 Q56 18 40 16 Q24 18 16 28" fill="#050005" />
          {/* Void eyes — intense */}
          <ellipse cx="33" cy="37" rx="6" ry="5" fill="#050005" />
          <ellipse cx="47" cy="37" rx="6" ry="5" fill="#050005" />
          <ellipse cx="33" cy="37" rx="4" ry="3.5" fill="#ff067f" />
          <ellipse cx="47" cy="37" rx="4" ry="3.5" fill="#ff067f" />
          <ellipse cx="33" cy="37" rx="1.5" ry="1.5" fill="white" fillOpacity="0.3" />
          {/* Crack under one eye */}
          <path d="M47 40 Q50 44 48 48" stroke="#ff067f" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
          {/* Cruel smirk */}
          <path d="M34 50 Q38 53 42 51 Q46 49 47 52" stroke="#aa0050" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Dark energy collar */}
          <path d="M16 62 Q26 55 40 58 Q54 55 64 62 L70 80 L10 80 Z" fill="#ff067f" fillOpacity="0.2" />
          <path d="M16 62 Q26 55 40 58 Q54 55 64 62" stroke="#ff067f" strokeWidth="1" fill="none" strokeOpacity="0.6" />
          {/* Void particle above head */}
          <circle cx="20" cy="20" r="2" fill="#ff067f" fillOpacity="0.4" />
          <circle cx="60" cy="18" r="1.5" fill="#ff067f" fillOpacity="0.3" />
        </svg>
      ),
    },
  };

  const p = portraits[pilotId] || portraits['nova'];

  return (
    <div className="relative flex flex-col items-center">
      {/* Portrait frame */}
      <div className="w-20 h-20 rounded-full relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${p.glow.replace('0.5','0.2')} 0%, #0a0a15 100%)`,
          border: `2px solid ${p.color}66`,
          boxShadow: `0 0 20px ${p.glow}, 0 0 40px ${p.glow.replace('0.5', '0.2')}`,
        }}>
        {p.face}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAUSE OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function PauseOverlay({ onResume, onExit }: { onResume: () => void; onExit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="flex flex-col items-center gap-6 p-10 border"
        style={{
          background: 'linear-gradient(135deg, rgba(5,10,25,0.98) 0%, rgba(2,4,16,1) 100%)',
          border: '1.5px solid rgba(0,232,255,0.25)',
          boxShadow: '0 0 60px rgba(0,232,255,0.1)',
          minWidth: 320,
        }}
      >
        <div>
          <div className="text-[10px] tracking-[6px] text-cyan-400/60 uppercase text-center mb-1"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            MISSION SUSPENDED
          </div>
          <h2 className="text-4xl font-black italic text-white text-center"
            style={{ fontFamily: 'Oxanium, sans-serif', textShadow: '0 0 24px rgba(0,232,255,0.5)' }}>
            PAUSED
          </h2>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <motion.button
            onClick={onResume}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="w-full py-4 font-black italic tracking-widest text-sm"
            style={{
              fontFamily: 'Oxanium, sans-serif',
              background: 'linear-gradient(135deg, #00e6e6, #0066aa)',
              color: '#001a22',
              boxShadow: '0 0 25px rgba(0,232,255,0.4)',
            }}>
            ▶ RESUME MISSION
          </motion.button>
          <motion.button
            onClick={onExit}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            className="w-full py-3 font-black italic tracking-widest text-sm border text-white/70 hover:text-white transition-colors"
            style={{
              fontFamily: 'Oxanium, sans-serif',
              borderColor: 'rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.04)',
            }}>
            ✕ ABORT MISSION
          </motion.button>
        </div>

        <div className="text-[10px] text-white/35 text-center" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Press <span className="text-cyan-400 font-bold">ESC</span> to resume
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GAME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
interface GameScreenProps {
  setPage: (p: Page) => void;
}

export default function GameScreen({ setPage }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const profile = useGameStore(s => s.profile);

  const [gameOver, setGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({ score: 0, kills: 0, time: 0 });
  const [showTutorial, setShowTutorial] = useState(true);
  const [paused, setPaused] = useState(false);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);

  const pilotId = profile.avatar.pilotId ?? 'nova';

  const handleResume = useCallback(() => {
    engineRef.current?.resume();
    setPaused(false);
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.pause();
    setPaused(true);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      (stats) => {
        setGameStats(stats);
        setGameOver(true);
        document.body.classList.remove('game-active');
        // Save this run to persistent localStorage history
        saveRun({
          score: Math.floor(stats.score),
          kills: stats.kills,
          timeSec: stats.time,
          pilotId: profile.avatar.pilotId ?? 'nova',
          shipId: profile.currentShipId,
        });
        setRunHistory(getRunHistory());
      }
    );
    engineRef.current = engine;
    document.body.classList.add('game-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && !gameOver && !paused) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
      engine.setMousePos(e.clientX, e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showTutorial) return;
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (engine.isPaused) {
          engine.resume(); setPaused(false);
        } else {
          engine.pause(); setPaused(true);
        }
        return;
      }
      if (!engine.isPaused) engine.handleKeyDown(e.key.toLowerCase());
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    engine.start();

    return () => {
      document.body.classList.remove('game-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      engine.stop();
    };
  }, [gameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRestart = () => { setGameOver(false); setShowTutorial(true); setPaused(false); };
  const handleExit = () => setPage('menu');

  return (
    <div ref={containerRef} className="w-full h-full relative"
      style={{ cursor: (gameOver || showTutorial || paused) ? 'auto' : 'none' }}>
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Custom crosshair cursor */}
      {!gameOver && !showTutorial && !paused && (
        <div ref={cursorRef} className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 border-[1.5px] border-cyan-400 rounded-full absolute opacity-80" />
          <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* PAUSE BUTTON (top-right, appears during live gameplay) */}
      {!gameOver && !showTutorial && (
        <button
          onClick={paused ? handleResume : handlePause}
          className="absolute top-4 right-5 z-30 flex items-center gap-2 px-4 py-2 text-xs font-black italic tracking-widest transition-all hover:scale-105"
          style={{
            fontFamily: 'Oxanium, sans-serif',
            background: 'rgba(0,0,0,0.65)',
            border: '1px solid rgba(0,232,255,0.3)',
            color: '#00e8ff',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 12px rgba(0,232,255,0.1)',
          }}>
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      )}

      {/* TUTORIAL — stepped popup style */}
      <AnimatePresence>
        {showTutorial && !gameOver && (
          <TutorialPopup onClose={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>

      {/* PAUSE OVERLAY */}
      <AnimatePresence>
        {paused && !gameOver && !showTutorial && (
          <PauseOverlay onResume={handleResume} onExit={handleExit} />
        )}
      </AnimatePresence>

      {/* GAME OVER SCREEN */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, rgba(1,3,8,0.96) 60%)' }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="flex flex-col items-center gap-0 w-full max-w-sm mx-4"
            >
              {/* Destroyed label */}
              <div className="text-[10px] tracking-[6px] uppercase text-red-400/70 mb-3 animate-pulse"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                ◆ SHIP DESTROYED ◆
              </div>

              {/* Pilot portrait + score side by side */}
              <div className="flex items-center gap-6 mb-4 px-8 py-6 w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(10,10,24,0.95), rgba(4,6,16,0.98))',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                {/* Left: pilot portrait */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <PilotPortrait pilotId={pilotId} />
                  <div className="text-[10px] font-black italic text-white/60 tracking-widest uppercase"
                    style={{ fontFamily: 'Oxanium, sans-serif' }}>
                    {pilotId.toUpperCase()}
                  </div>
                </div>

                {/* Right: score */}
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] tracking-[4px] text-white/40 uppercase mb-1"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    FINAL SCORE
                  </div>
                  <div className="font-black text-5xl text-white leading-none"
                    style={{
                      fontFamily: 'Oxanium, sans-serif',
                      textShadow: '0 0 30px rgba(0,232,255,0.5)',
                    }}>
                    {Math.floor(gameStats.score).toLocaleString()}
                  </div>
                  <div className="text-[10px] tracking-[3px] text-cyan-400/60 mt-1"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    STELLAR POINTS
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex w-full"
                style={{ border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none' }}>
                {[
                  { label: 'KILLS', val: gameStats.kills.toString() },
                  { label: 'SURVIVED', val: `${Math.floor(gameStats.time / 60)}m ${gameStats.time % 60}s` },
                ].map((stat, i) => (
                  <div key={stat.label}
                    className="flex-1 flex flex-col items-center py-4"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}>
                    <div className="font-black text-2xl text-white" style={{ fontFamily: 'Oxanium, sans-serif' }}>
                      {stat.val}
                    </div>
                    <div className="text-[9px] tracking-[3px] text-white/40 uppercase mt-1"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Run History */}
              {runHistory.length > 1 && (
                <div className="w-full mt-4"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.5)' }}>
                  <div className="px-4 py-2 border-b text-[9px] tracking-[4px] text-white/40 uppercase"
                    style={{ fontFamily: 'Rajdhani, sans-serif', borderColor: 'rgba(255,255,255,0.06)' }}>
                    ◆ PAST RUNS
                  </div>
                  <div className="max-h-28 overflow-y-auto">
                    {runHistory.slice(0, 8).map((r, i) => (
                      <div key={r.id}
                        className="flex items-center justify-between px-4 py-1.5 border-b last:border-0"
                        style={{
                          borderColor: 'rgba(255,255,255,0.04)',
                          background: i === 0 ? 'rgba(0,232,255,0.06)' : 'transparent',
                        }}>
                        <span className="text-[10px] text-white/50" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {i === 0 ? '▶ ' : ''}{new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[11px] font-black text-white/80" style={{ fontFamily: 'Oxanium, sans-serif' }}>
                          {r.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-white/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {r.kills}k · {Math.floor(r.timeSec / 60)}m{r.timeSec % 60}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-5 w-full">
                <NeonButton onClick={handleRestart} variant="primary" size="md" className="flex-1">
                  ↺ RETRY
                </NeonButton>
                <NeonButton onClick={handleExit} variant="secondary" size="md" className="flex-1">
                  MENU
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
