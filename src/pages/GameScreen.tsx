import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Page } from '../App';
import NeonButton from '../components/ui/NeonButton';
import { GameEngine } from '../game/GameEngine';

interface GameScreenProps {
  setPage: (p: Page) => void;
}

export default function GameScreen({ setPage }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const [gameOver, setGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({ score: 0, kills: 0, time: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const engine = new GameEngine(
      canvasRef.current, 
      (stats) => {
        setGameStats(stats);
        setGameOver(true);
        // Show cursor when game is over
        document.body.classList.remove('game-active');
      }
    );
    engineRef.current = engine;
    
    // Hide default cursor
    document.body.classList.add('game-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && !gameOver) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
      engine.setMousePos(e.clientX, e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      engine.handleKeyDown(e.key.toLowerCase());
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
  }, [gameOver]);

  const handleRestart = () => {
    setGameOver(false);
    // engine will re-init
  };

  const handleExit = () => {
    setPage('menu');
  };

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ cursor: gameOver ? 'auto' : 'none' }}>
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      
      {!gameOver && (
        <div 
          ref={cursorRef} 
          className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-[22px] h-[22px] border-[1.5px] border-plasma rounded-full absolute opacity-70" />
          <div className="w-[4px] h-[4px] bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* The engine will draw HUD on canvas, or we can use React overlaid. We'll use Canvas HUD for performance to match the prototype, 
          but for abilities CD we could use React or Canvas. We'll stick to a full Canvas approach for gameplay for max perf. */}

      {/* GAME OVER SCREEN */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1),transparent_60%),#010308/90] backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="text-[9px] tracking-[7px] text-rose/50 uppercase mb-2 animate-pulse">◆ SHIP DESTROYED ◆</div>
            <div className="font-oxanium text-[68px] font-extrabold text-white text-shadow-[0_0_48px_rgba(0,232,255,0.5)] leading-none my-2">
              {Math.floor(gameStats.score).toLocaleString()}
            </div>
            <div className="text-[10px] tracking-[5px] text-white/20 mb-4">STELLAR POINTS</div>

            <div className="flex gap-7 my-6 p-4 px-8 border border-white/5 rounded-lg bg-white/5 backdrop-blur-md">
              <div className="text-center">
                <div className="font-oxanium text-xl font-bold text-plasma">{gameStats.kills}</div>
                <div className="text-[9px] tracking-[3px] text-white/20 uppercase mt-1">KILLS</div>
              </div>
              <div className="text-center">
                <div className="font-oxanium text-xl font-bold text-plasma">
                  {Math.floor(gameStats.time / 60)}m {gameStats.time % 60}s
                </div>
                <div className="text-[9px] tracking-[3px] text-white/20 uppercase mt-1">SURVIVED</div>
              </div>
            </div>

            <div className="flex gap-4">
              <NeonButton onClick={handleRestart} variant="primary" size="md">↺ DRIFT AGAIN</NeonButton>
              <NeonButton onClick={handleExit} variant="secondary" size="md">MAIN MENU</NeonButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
