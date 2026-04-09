import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';
import { StarfieldRenderer, Nebula } from '../game/renderer/StarfieldRenderer';

interface MainMenuProps {
  setPage: (p: Page) => void;
}

/* ── Animated starfield background canvas ── */
const StarCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const sf = new StarfieldRenderer(w, h);
    let nebulas = [new Nebula(w, h), new Nebula(w, h)];
    let mx = w / 2, my = h / 2, dx = 0, dy = 0, px = 0, py = 0;
    const onmm = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onrs = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('mousemove', onmm);
    window.addEventListener('resize', onrs);
    let raf: number, lt = performance.now();
    const draw = (t: number) => {
      const dt = Math.min(t - lt, 50); lt = t;
      const tdx = (mx - w / 2) * 0.004, tdy = (my - h / 2) * 0.004;
      dx += (tdx - dx) * 0.07; dy += (tdy - dy) * 0.07;
      px += dx + 0.3; py += dy;
      ctx.fillStyle = '#000005'; ctx.fillRect(0, 0, w, h);
      sf.draw(ctx, px * 0.5, py * 0.5);
      nebulas.forEach(n => { n.update(dt * 0.25); n.draw(ctx, px * 0.25, py * 0.25); });
      nebulas = nebulas.filter(n => n.age < n.life);
      if (nebulas.length < 2 && Math.random() < 0.004) nebulas.push(new Nebula(w, h));
      // Vignette
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.85);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,8,0.92)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(draw);
    };
    draw(performance.now());
    return () => { window.removeEventListener('mousemove', onmm); window.removeEventListener('resize', onrs); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 z-0 pointer-events-none" />;
};

/* ── Animated spacecraft SVG ── */
const ShipHero = () => (
  <motion.div
    className="relative"
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
  >
    {/* Glow orb behind ship */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="w-64 h-64 rounded-full"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.15, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.35) 0%, rgba(216,115,255,0.15) 50%, transparent 75%)' }}
      />
    </div>

    {/* Ship SVG */}
    <svg width="240" height="220" viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_30px_rgba(0,255,255,0.6)]">
      {/* Engine plumes */}
      <motion.ellipse cx="90" cy="195" rx="12" ry="22" fill="url(#flame1)"
        animate={{ ry: [22, 28, 20, 26, 22], opacity: [0.9, 1, 0.7, 1, 0.9] }}
        transition={{ duration: 0.4, repeat: Infinity }} />
      <motion.ellipse cx="150" cy="195" rx="12" ry="22" fill="url(#flame1)"
        animate={{ ry: [20, 28, 22, 24, 20], opacity: [0.9, 0.7, 1, 0.8, 0.9] }}
        transition={{ duration: 0.35, repeat: Infinity }} />
      <motion.ellipse cx="120" cy="200" rx="18" ry="30" fill="url(#flame2)"
        animate={{ ry: [30, 38, 26, 34, 30], opacity: [1, 0.8, 1, 0.9, 1] }}
        transition={{ duration: 0.45, repeat: Infinity }} />

      {/* Main hull */}
      <path d="M120 10 L165 80 L175 160 L120 175 L65 160 L75 80 Z" fill="url(#hull)" />
      {/* Hull detail lines */}
      <path d="M120 10 L165 80" stroke="#00ffff" strokeWidth="1" strokeOpacity="0.3" />
      <path d="M120 10 L75 80" stroke="#00ffff" strokeWidth="1" strokeOpacity="0.3" />
      <path d="M100 100 L140 100" stroke="#00ffff" strokeWidth="0.5" strokeOpacity="0.4" />
      <path d="M95 120 L145 120" stroke="#00ffff" strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Wings */}
      <path d="M75 80 L20 140 L65 150 L65 160 Z" fill="url(#wing)" />
      <path d="M165 80 L220 140 L175 150 L175 160 Z" fill="url(#wing)" />
      {/* Wing accents */}
      <path d="M75 80 L20 140" stroke="rgba(0,255,255,0.4)" strokeWidth="1.5" />
      <path d="M165 80 L220 140" stroke="rgba(0,255,255,0.4)" strokeWidth="1.5" />
      {/* Cockpit */}
      <ellipse cx="120" cy="70" rx="22" ry="30" fill="url(#cockpit)" />
      <ellipse cx="120" cy="68" rx="14" ry="20" fill="url(#cockpitInner)" />
      {/* Center stripe */}
      <path d="M120 40 L120 160" stroke="url(#stripe)" strokeWidth="3" strokeOpacity="0.6" />
      {/* Engine ports */}
      <rect x="86" y="160" width="20" height="12" rx="2" fill="#0a1a2a" stroke="#00ffff" strokeWidth="0.5" strokeOpacity="0.6" />
      <rect x="134" y="160" width="20" height="12" rx="2" fill="#0a1a2a" stroke="#00ffff" strokeWidth="0.5" strokeOpacity="0.6" />
      <rect x="108" y="162" width="24" height="14" rx="2" fill="#0a1a2a" stroke="#00e6e6" strokeWidth="0.8" strokeOpacity="0.8" />
      {/* Nose detail */}
      <circle cx="120" cy="18" r="4" fill="#00ffff" fillOpacity="0.8" />

      <defs>
        <linearGradient id="hull" x1="120" y1="10" x2="120" y2="175" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a3050" />
          <stop offset="50%" stopColor="#0d1e33" />
          <stop offset="100%" stopColor="#060e1a" />
        </linearGradient>
        <linearGradient id="wing" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#0a1828" />
          <stop offset="100%" stopColor="#162840" />
        </linearGradient>
        <radialGradient id="cockpit" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0066aa" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="cockpitInner" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00aaff" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id="stripe" x1="120" y1="40" x2="120" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#9900ce" />
        </linearGradient>
        <linearGradient id="flame1" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#00e6e6" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#9900ce" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff067f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="flame2" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#00ffff" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#9900ce" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff067f" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>

    {/* Ground glow */}
    <motion.div
      className="w-40 h-4 mx-auto -mt-2 rounded-full blur-xl"
      animate={{ opacity: [0.5, 0.9, 0.5], scaleX: [0.8, 1.1, 0.8] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ background: 'radial-gradient(ellipse, rgba(0,255,255,0.6) 0%, transparent 70%)' }}
    />
  </motion.div>
);

/* ── Side action button ── */
const SideBtn = ({
  icon, label, sublabel, onClick, color = 'cyan', align = 'left'
}: {
  icon: string; label: string; sublabel?: string; onClick: () => void;
  color?: 'cyan' | 'purple' | 'pink'; align?: 'left' | 'right';
}) => {
  const colors = {
    cyan: { border: 'border-cyan-400/50', text: 'text-cyan-400', glow: 'hover:shadow-[0_0_20px_rgba(0,255,255,0.35)]', bg: 'hover:bg-cyan-500/10', icon: 'text-cyan-400' },
    purple: { border: 'border-purple-400/50', text: 'text-purple-300', glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]', bg: 'hover:bg-purple-500/10', icon: 'text-purple-400' },
    pink: { border: 'border-pink-400/50', text: 'text-pink-300', glow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]', bg: 'hover:bg-pink-500/10', icon: 'text-pink-400' },
  }[color];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06, x: align === 'left' ? 4 : -4 }}
      whileTap={{ scale: 0.94 }}
      className={`flex ${align === 'right' ? 'flex-row-reverse' : 'flex-row'} items-center gap-3 px-4 py-3 border ${colors.border} ${colors.bg} ${colors.glow} backdrop-blur-md bg-black/30 transition-all duration-200 group`}
    >
      <span className={`material-symbols-outlined text-2xl ${colors.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <div className={`text-${align === 'right' ? 'right' : 'left'}`}>
        <div className={`text-xs font-black italic tracking-widest uppercase headline-font ${colors.text}`}>{label}</div>
        {sublabel && <div className="text-[10px] text-white/30 tracking-wider font-body">{sublabel}</div>}
      </div>
    </motion.button>
  );
};

export default function MainMenu({ setPage }: MainMenuProps) {
  const profile = useGameStore(s => s.profile);
  const claimDailyReward = useGameStore(s => s.claimDailyReward);
  const [showReward, setShowReward] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (claimDailyReward()) { setShowReward(true); setTimeout(() => setShowReward(false), 3500); }
  }, [claimDailyReward]);

  const handleClaim = () => {
    if (claimDailyReward()) { setShowReward(true); setTimeout(() => setShowReward(false), 3500); }
    else setClaimed(true);
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Starfield */}
      <StarCanvas />

      {/* Subtle mesh gradient overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,255,255,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(153,0,206,0.06) 0%, transparent 70%)' }} />

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3">
        {/* Credits & Score — left */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-cyan-400/20 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-cyan-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-black italic text-base headline-font text-cyan-400">{profile.credits.toLocaleString()}</span>
            <span className="text-[9px] text-white/30 tracking-widest font-body uppercase">Credits</span>
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.18 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-purple-400/20 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-yellow-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <span className="font-black italic text-base headline-font text-white">{profile.stats.highScore.toLocaleString()}</span>
            <span className="text-[9px] text-white/30 tracking-widest font-body uppercase">Best</span>
          </motion.div>
        </div>

        {/* Logo — center */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
          className="absolute left-1/2 -translate-x-1/2"
        >
          <motion.h1
            className="text-2xl font-black italic tracking-tight headline-font text-white leading-none"
            animate={{ textShadow: ['0 0 12px rgba(0,255,255,0.7)', '0 0 22px rgba(216,115,255,0.8)', '0 0 12px rgba(0,255,255,0.7)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            STELLAR <span className="text-cyan-400">DRIFT</span>
          </motion.h1>
          <div className="text-[8px] text-cyan-400/40 tracking-[0.3em] text-center font-body mt-0.5">KINETIC ARCHIVE SYS</div>
        </motion.div>

        {/* Settings & Pilot — right */}
        <motion.div
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <button className="p-2 text-white/40 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
          <button
            onClick={() => setPage('profile')}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-cyan-400/20 backdrop-blur-md hover:border-cyan-400/50 transition-all"
          >
            <span className="material-symbols-outlined text-cyan-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            <span className="text-[10px] font-bold italic tracking-widest headline-font text-cyan-400">PILOT</span>
          </button>
        </motion.div>
      </div>

      {/* ── MAIN STAGE ── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ paddingTop: '52px', paddingBottom: '80px' }}>

        {/* LEFT SIDE BUTTONS */}
        <motion.div
          initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
          className="flex flex-col gap-3 mr-10"
        >
          <SideBtn icon="precision_manufacturing" label="Hangar" sublabel="100 ships" onClick={() => setPage('hangar')} color="cyan" align="left" />
          <SideBtn icon="public" label="Galaxy" sublabel="Select sector" onClick={() => setPage('galaxy')} color="purple" align="left" />
        </motion.div>

        {/* CENTER — Ship + Title + Play */}
        <div className="flex flex-col items-center">
          {/* Ship */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', bounce: 0.35 }}
          >
            <ShipHero />
          </motion.div>

          {/* PLAY BUTTON */}
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
            className="-mt-2"
          >
            <motion.button
              onClick={() => setPage('game')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="relative px-16 py-4 overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #00e6e6 0%, #00aacc 50%, #0066aa 100%)',
                boxShadow: '0 0 30px rgba(0,255,255,0.5), 0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
              <span className="relative z-10 text-[#003344] font-black italic text-xl tracking-[0.2em] headline-font">
                ▶&nbsp;&nbsp;LAUNCH
              </span>
              {/* Corner tag */}
              <div className="absolute top-0.5 right-2 text-[8px] font-body text-[#003344]/50 tracking-widest">MISSION</div>
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <motion.div
          initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
          className="flex flex-col gap-3 ml-10"
        >
          <SideBtn icon="assignment" label="Pilot Log" sublabel="Your record" onClick={() => setPage('profile')} color="purple" align="right" />
          <SideBtn icon="military_tech" label="Daily Reward" sublabel={claimed ? 'Come back tomorrow' : 'Claim now!'} onClick={handleClaim} color="pink" align="right" />
        </motion.div>
      </div>

      {/* ── BOTTOM INFO BAR ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-2.5 bg-black/40 backdrop-blur-md border-t border-white/5"
      >
        <div className="flex items-center gap-2">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-[10px] text-white/30 font-body tracking-widest uppercase">Systems Nominal</span>
        </div>
        <div className="text-[10px] text-white/20 font-body tracking-widest">© 2124 KINETIC ARCHIVE SYSTEMS</div>
        <div className="flex gap-4">
          {['Store', 'Leaderboard', 'Options'].map(l => (
            <button key={l} className="text-[10px] text-purple-500/40 hover:text-cyan-300 font-body tracking-widest transition-colors uppercase">{l}</button>
          ))}
        </div>
      </motion.div>

      {/* ── DAILY REWARD TOAST ── */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-8 py-4 bg-surface-container-lowest border border-primary-dim/60 headline-font pointer-events-none"
            style={{ boxShadow: '0 0 40px rgba(0,230,230,0.35)' }}
          >
            <span className="material-symbols-outlined text-2xl text-cyan-400" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="font-bold italic text-base tracking-widest text-cyan-400">SYSTEM REWARD CLAIMED</span>
            <span className="font-black text-2xl text-white ml-2">+500 💎</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
