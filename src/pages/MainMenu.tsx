import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeonButton from '../components/ui/NeonButton';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';

interface MainMenuProps {
  setPage: (p: Page) => void;
}

const MenuBackground = () => (
  <div className="absolute inset-0 z-[-2] overflow-hidden bg-void pointer-events-none">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,232,255,0.04)_0%,rgba(139,69,255,0.02)_60%,transparent_100%)]" />
    
    <motion.div 
      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.45, 0.3], rotate: [0, 3, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute -inset-[50%] bg-[radial-gradient(circle_at_30%_30%,rgba(139,69,255,0.08)_0%,transparent_40%),radial-gradient(circle_at_70%_60%,rgba(0,255,170,0.06)_0%,transparent_50%)]"
    />

    <div className="absolute inset-x-0 bottom-0 h-[60vh] z-[-1]" style={{
      backgroundImage: `linear-gradient(rgba(0, 232, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 232, 255, 0.08) 1px, transparent 1px)`,
      backgroundSize: '50px 50px',
      transform: 'perspective(600px) rotateX(75deg) translateY(50px) translateZ(-200px)',
      opacity: 0.8
    }}>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-void" />
    </div>
    
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full"
        style={{
          width: Math.random() * 2.5 + 'px',
          height: Math.random() * 2.5 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
        }}
        animate={{ opacity: [0, 1, 0], scale: [0, Math.random() * 1.5 + 0.5, 0] }}
        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 5 }}
      />
    ))}
  </div>
);

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
    <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
      <MenuBackground />

      <motion.div
        initial={{ y: 0, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 p-16 md:p-24 rounded-3xl bg-white/[0.015] border border-white/[0.05] shadow-[0_0_80px_rgba(0,232,255,0.06)] backdrop-blur-xl flex flex-col items-center"
      >
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
             <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(0,232,255,0.05)_10deg,transparent_20deg)] animate-[spin_10s_linear_infinite]" />
        </div>

        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-center mb-16 relative">
          <h1 className="font-oxanium text-[clamp(50px,10vw,110px)] font-extrabold tracking-[14px] leading-none bg-clip-text text-transparent bg-gradient-to-br from-plasma via-white to-violet filter drop-shadow-[0_0_25px_rgba(0,232,255,0.4)]">
            STELLAR<br/>DRIFT
          </h1>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-plasma to-transparent" />
          <p className="text-[12px] tracking-[10px] text-plasma/70 uppercase mt-8 font-semibold">
            survive the living galaxy
          </p>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }} className="flex flex-col items-center gap-5 w-full max-w-md relative z-10">
          <NeonButton onClick={() => setPage('game')} variant="primary" size="lg" className="w-full text-center group">
            <span className="flex items-center justify-center gap-3"><span className="group-hover:translate-x-1 transition-transform">▶</span> LAUNCH MISSION</span>
          </NeonButton>

          <div className="flex w-full gap-5 mt-2">
            <NeonButton onClick={() => setPage('hangar')} variant="secondary" size="md" className="flex-1">
              THE HANGAR
            </NeonButton>
            <NeonButton onClick={() => setPage('galaxy')} variant="secondary" size="md" className="flex-1">
              GALAXY SELECT
            </NeonButton>
          </div>

          <div className="flex w-full gap-5">
            <NeonButton onClick={() => setPage('profile')} variant="secondary" size="sm" className="flex-1">
              PILOT PROFILE
            </NeonButton>
            <NeonButton onClick={handleClaim} variant="safe" size="sm" className="flex-1">
              {alreadyClaimedMsg ? 'CLAIMED TODAY' : 'DAILY REWARD'}
            </NeonButton>
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-6 w-full text-center font-oxanium text-[11px] text-white/40 tracking-widest flex justify-center gap-16 bg-void/50 backdrop-blur-md py-3 border-y border-white/5">
        <span>CREDITS: <span className="text-plasma font-bold drop-shadow-[0_0_5px_rgba(0,232,255,0.5)]">💎 {profile.credits.toLocaleString()}</span></span>
        <span>HIGH SCORE: <span className="text-gold font-bold drop-shadow-[0_0_5px_rgba(255,208,96,0.5)]">{profile.stats.highScore.toLocaleString()}</span></span>
      </motion.div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }} animate={{ opacity: 1, scale: 1, y: -60 }} exit={{ opacity: 0, scale: 0.8, y: -80 }}
            className="absolute top-[15%] z-50 px-8 py-4 rounded-xl bg-safe/10 border border-safe/40 backdrop-blur-xl text-safe font-oxanium flex items-center shadow-[0_0_40px_rgba(0,255,170,0.25)] pointer-events-none"
          >
            <span className="tracking-widest font-bold">LOGIN REWARD CLAIMED</span>
            <span className="ml-5 font-extrabold text-white text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">+500 💎</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
