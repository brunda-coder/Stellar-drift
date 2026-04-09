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

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;

      // Calculate distance from center to control parallax shift velocity
      const targetDx = (mouseX - w / 2) * 0.006;
      const targetDy = (mouseY - h / 2) * 0.006;

      // Smooth interp
      driftX += (targetDx - driftX) * 0.08;
      driftY += (targetDy - driftY) * 0.08;

      // Continual auto-pan
      posX += driftX + 0.5; 
      posY += driftY;

      ctx.fillStyle = '#010308';
      ctx.fillRect(0, 0, w, h);

      // Deep space scanner grid
      const gridOffset = (time * 0.05) % 60;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 232, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = -60; i < w + 60; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, -gridOffset); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = -60; i < h + 60; i += 60) {
        ctx.beginPath(); ctx.moveTo(0, i + gridOffset); ctx.lineTo(w, i + gridOffset); ctx.stroke();
      }
      ctx.restore();

      // Render actual engine stars & nebulas (simulate parallax camera)
      starfield.draw(ctx, posX * 0.5, posY * 0.5);

      nebulas.forEach(n => {
        n.update(dt * 0.3); // Slow down nebula life on menu
        n.draw(ctx, posX * 0.3, posY * 0.3);
      });

      nebulas = nebulas.filter(n => n.age < n.life);
      if (nebulas.length < 3 && Math.random() < 0.005) {
        nebulas.push(new Nebula(w, h));
      }

      // Add a subtle vignette targeting the center
      const grd = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(1,3,8,0.85)');
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

  return <canvas ref={canvasRef} className="absolute inset-0 z-[-2] pointer-events-none" />;
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
    <div className="w-full h-full flex flex-col items-center justify-center relative z-10 overflow-hidden bg-void">
      {/* Dynamic Native Gamified Engine Canvas */}
      <InteractiveBackground />

      <motion.div
        initial={{ y: 50, opacity: 0, rotateX: 30 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 p-16 md:p-24 flex flex-col items-center"
        style={{ perspective: 1000 }}
      >
        <motion.div 
          animate={{ textShadow: ["0px 0px 20px rgba(0,232,255,0.8)", "0px 0px 40px rgba(139,69,255,0.9)", "0px 0px 20px rgba(0,232,255,0.8)"] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-center mb-20 relative"
        >
          <h1 className="font-oxanium text-[clamp(60px,12vw,140px)] font-extrabold tracking-[18px] leading-none text-white italic" style={{ WebkitTextStroke: '2px rgba(0,232,255,0.5)' }}>
            STELLAR<br/>DRIFT
          </h1>
          <div className="absolute top-1/2 left-0 w-full h-2 bg-white/20 blur-sm mix-blend-overlay rotate-[-2deg]" />
          <p className="text-[14px] tracking-[16px] text-plasma uppercase mt-6 font-bold drop-shadow-[0_0_10px_rgba(0,232,255,1)]">
            survive the living galaxy
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-6 w-full max-w-lg relative z-10">
          <NeonButton onClick={() => setPage('game')} variant="primary" size="lg" className="w-full text-center py-5 text-xl bg-plasma/10 border-2 border-plasma">
            ▶ INITIATE MISSION
          </NeonButton>

          <div className="flex w-full gap-6">
            <NeonButton onClick={() => setPage('hangar')} variant="secondary" size="md" className="flex-1 bg-white/5 border-2 border-white/20">
              THE HANGAR
            </NeonButton>
            <NeonButton onClick={() => setPage('galaxy')} variant="secondary" size="md" className="flex-1 bg-white/5 border-2 border-white/20">
              GALAXY SELECT
            </NeonButton>
          </div>

          <div className="flex w-full gap-6 mt-4">
            <NeonButton onClick={() => setPage('profile')} variant="secondary" size="sm" className="flex-1">
              PILOT LOG
            </NeonButton>
            <NeonButton onClick={handleClaim} variant="safe" size="sm" className="flex-1 border-safe text-safe">
              {alreadyClaimedMsg ? 'CLAIMED TODAY' : 'SYSTEM REWARD'}
            </NeonButton>
          </div>
        </div>
      </motion.div>

      {/* Cyber/Arcade Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-0 w-full border-t border-plasma/30 bg-plasma/5 pt-4 pb-6 backdrop-blur-sm flex justify-center gap-16 font-oxanium text-sm text-plasma tracking-[6px] shadow-[0_-15px_30px_rgba(0,232,255,0.05)]">
        <span>CREDITS <span className="text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ml-2">💎 {profile.credits.toLocaleString()}</span></span>
        <span>HIGH SCORE <span className="text-white font-black drop-shadow-[0_0_8px_rgba(255,208,96,0.8)] ml-2">{profile.stats.highScore.toLocaleString()}</span></span>
      </motion.div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -40, rotateX: 90 }} 
            animate={{ opacity: 1, scale: 1, y: -80, rotateX: 0 }} 
            exit={{ opacity: 0, scale: 1.2, y: -100, filter: 'blur(10px)' }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute top-[20%] z-50 px-10 py-5 rounded bg-void border-2 border-safe text-safe font-oxanium flex items-center shadow-[0_0_50px_rgba(0,255,170,0.4)] pointer-events-none"
          >
            <span className="tracking-[8px] font-bold text-lg">SYSTEM REWARD CLAIMED</span>
            <span className="ml-6 font-extrabold text-white text-3xl">+500 💎</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
