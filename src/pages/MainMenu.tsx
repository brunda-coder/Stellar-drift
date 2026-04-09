import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeonButton from '../components/ui/NeonButton';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';
import { StarfieldRenderer, Nebula } from '../game/renderer/StarfieldRenderer';

interface MainMenuProps {
  setPage: (p: Page) => void;
}

const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const starfield = new StarfieldRenderer(w, h);
    let nebulas = [new Nebula(w, h), new Nebula(w, h), new Nebula(w, h)];

    let mouseX = w / 2;
    let mouseY = h / 2;
    let driftX = 0;
    let driftY = 0;
    let posX = 0;
    let posY = 0;

    const handleMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    const handleResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;
      const targetDx = (mouseX - w / 2) * 0.006;
      const targetDy = (mouseY - h / 2) * 0.006;
      driftX += (targetDx - driftX) * 0.08;
      driftY += (targetDy - driftY) * 0.08;
      posX += driftX + 0.5;
      posY += driftY;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      starfield.draw(ctx, posX * 0.5, posY * 0.5);
      nebulas.forEach(n => { n.update(dt * 0.3); n.draw(ctx, posX * 0.3, posY * 0.3); });
      nebulas = nebulas.filter(n => n.age < n.life);
      if (nebulas.length < 3 && Math.random() < 0.005) nebulas.push(new Nebula(w, h));

      // Vignette
      const grd = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[-1] pointer-events-none" />;
};

export default function MainMenu({ setPage }: MainMenuProps) {
  const profile = useGameStore(s => s.profile);
  const claimDailyReward = useGameStore(s => s.claimDailyReward);

  const [showReward, setShowReward] = useState(false);
  const [alreadyClaimedMsg, setAlreadyClaimedMsg] = useState(false);

  useEffect(() => {
    if (claimDailyReward()) {
      setShowReward(true);
      setTimeout(() => setShowReward(false), 4000);
    }
  }, [claimDailyReward]);

  const handleClaim = () => {
    if (claimDailyReward()) {
      setShowReward(true);
      setTimeout(() => setShowReward(false), 4000);
    } else {
      setAlreadyClaimedMsg(true);
      setTimeout(() => setAlreadyClaimedMsg(false), 2000);
    }
  };

  return (
    <div className="w-full h-full flex relative overflow-hidden">
      {/* Interactive Starfield Canvas */}
      <InteractiveBackground />

      {/* Decorative tactical overlay elements */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 opacity-20 hidden xl:flex flex-col items-center gap-4 pointer-events-none">
        <div className="w-[2px] h-32 bg-cyan-400"></div>
        <div className="text-[10px] headline-font font-bold text-cyan-400 tracking-widest" style={{ writingMode: 'vertical-rl' }}>
          POSITION_X: 44.02
        </div>
      </div>
      <div className="absolute bottom-32 right-8 opacity-20 hidden xl:flex flex-col items-end gap-2 pointer-events-none">
        <div className="text-[10px] headline-font font-bold text-cyan-400 tracking-widest">SYSTEMS_NOMINAL</div>
        <div className="w-48 h-[1px] bg-cyan-400"></div>
      </div>

      {/* Center Hero */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        {/* Ambient glow behind title */}
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="text-center mb-14 relative"
        >
          <motion.h1
            animate={{ textShadow: ['0px 0px 20px rgba(0,255,255,0.6)', '0px 0px 50px rgba(216,115,255,0.7)', '0px 0px 20px rgba(0,255,255,0.6)'] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="text-[clamp(70px,11vw,130px)] headline-font font-black italic tracking-tighter text-white leading-none"
          >
            STELLAR <span className="text-cyan-400">DRIFT</span>
          </motion.h1>
          <div className="mt-3 text-cyan-400/50 tracking-[1.4em] text-[11px] uppercase font-bold ml-[1.4em] font-body">
            KINETIC ARCHIVE SYSTEMS V.2.1.24
          </div>
        </motion.div>

        {/* Button cluster */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          {/* Primary CTA */}
          <button
            onClick={() => setPage('game')}
            className="group relative py-6 bg-surface-container-high border-2 border-primary-container text-primary-container headline-font font-black italic text-2xl tracking-widest glow-cyan overflow-hidden hover:bg-primary-container hover:text-on-primary transition-all duration-300 active:scale-95"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
            LAUNCH MISSION
            <div className="absolute top-1 right-2 text-[8px] font-body text-cyan-400/50">SECURED_LINK // 01</div>
          </button>

          {/* Secondary row */}
          <div className="grid grid-cols-2 gap-4">
            <NeonButton onClick={() => setPage('hangar')} variant="secondary" size="md" className="w-full justify-center flex items-center gap-2">
              <span className="material-symbols-outlined text-sm not-italic">precision_manufacturing</span>
              THE HANGAR
            </NeonButton>
            <NeonButton onClick={() => setPage('galaxy')} variant="secondary" size="md" className="w-full justify-center flex items-center gap-2">
              <span className="material-symbols-outlined text-sm not-italic">public</span>
              GALAXY SELECT
            </NeonButton>
          </div>

          {/* Tertiary row */}
          <NeonButton onClick={() => setPage('profile')} variant="secondary" size="md" className="w-full justify-center flex items-center gap-2">
            <span className="material-symbols-outlined text-sm not-italic">assignment</span>
            PILOT LOG
          </NeonButton>

          {/* System Reward */}
          <button
            onClick={handleClaim}
            className="group relative py-5 bg-tertiary-container/10 border-2 border-tertiary-container text-tertiary-container headline-font font-black italic tracking-[0.2em] glow-pink hover:bg-tertiary-container hover:text-on-tertiary transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl not-italic" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            {alreadyClaimedMsg ? 'CLAIMED TODAY' : 'SYSTEM REWARD'}
            {!alreadyClaimedMsg && (
              <span className="ml-2 px-2 py-0.5 bg-tertiary-container text-on-tertiary text-[10px] not-italic font-body">DAILY READY</span>
            )}
          </button>
        </motion.div>
      </div>

      {/* Daily Reward Toast */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="absolute top-[18%] z-50 px-10 py-5 bg-surface-container-lowest border-2 border-primary-dim text-primary-dim headline-font flex items-center shadow-[0_0_50px_rgba(0,230,230,0.4)] pointer-events-none"
          >
            <span className="tracking-[8px] font-bold text-lg">SYSTEM REWARD CLAIMED</span>
            <span className="ml-6 font-extrabold text-white text-3xl">+500 💎</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
