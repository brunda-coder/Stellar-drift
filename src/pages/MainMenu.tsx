import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeonButton from '../components/ui/NeonButton';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';

interface MainMenuProps {
  setPage: (p: Page) => void;
}

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
      {/* Background gradients */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_40%_35%,rgba(139,69,255,0.08),transparent_60%),radial-gradient(ellipse_at_72%_75%,rgba(0,232,255,0.055),transparent_50%),#010308]" />

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h1 className="font-oxanium text-[clamp(46px,9vw,92px)] font-extrabold tracking-[10px] leading-none bg-clip-text text-transparent bg-gradient-to-br from-plasma via-violet to-gold filter drop-shadow-[0_0_22px_rgba(0,232,255,0.4)]">
          STELLAR<br/>DRIFT
        </h1>
        <p className="text-[11px] tracking-[8px] text-white/17 uppercase mt-3 text-white/40">
          survive the living galaxy
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <NeonButton onClick={() => setPage('game')} variant="primary" size="lg">
          ▶ LAUNCH MISSION
        </NeonButton>

        <div className="flex gap-4 mt-4">
          <NeonButton onClick={() => setPage('hangar')} variant="secondary" size="md">
            THE HANGAR
          </NeonButton>
          <NeonButton onClick={() => setPage('galaxy')} variant="secondary" size="md">
            GALAXY SELECT
          </NeonButton>
        </div>

        <div className="flex gap-4">
          <NeonButton onClick={() => setPage('profile')} variant="secondary" size="sm">
            PILOT PROFILE
          </NeonButton>
          <NeonButton onClick={handleClaim} variant="safe" size="sm">
            {alreadyClaimedMsg ? 'CLAIMED TODAY' : 'DAILY REWARD'}
          </NeonButton>
        </div>
      </motion.div>

      {/* Footer stats */}
      <div className="absolute bottom-6 w-full text-center font-oxanium text-[10px] text-white/30 tracking-widest flex justify-center gap-12">
        <span>CREDITS: <span className="text-plasma font-bold">💎 {profile.credits.toLocaleString()}</span></span>
        <span>HIGH SCORE: <span className="text-gold font-bold">{profile.stats.highScore.toLocaleString()}</span></span>
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: -60 }}
            exit={{ opacity: 0, scale: 0.8, y: -80 }}
            className="absolute top-1/4 z-50 px-8 py-4 rounded bg-safe/10 border border-safe/40 backdrop-blur-md text-safe font-oxanium flex items-center shadow-[0_0_30px_rgba(0,255,170,0.15)] pointer-events-none"
          >
            <span className="tracking-widest font-bold">LOGIN REWARD CLAIMED</span>
            <span className="ml-4 font-bold text-white text-lg">+500 💎</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
