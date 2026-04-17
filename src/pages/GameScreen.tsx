import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../App';
import NeonButton from '../components/ui/NeonButton';
import { GameEngine } from '../game/GameEngine';

// ── Enemy type definitions for the tutorial legend ──
const ENEMY_LEGEND = [
  { name: 'DRIFTER',  color: '#8b45ff', trait: 'Slow bio-drone. Easiest target.',     wave: 1 },
  { name: 'SWARMER',  color: '#ff3a8c', trait: 'Tiny, fast dart. Comes in packs.',    wave: 1 },
  { name: 'HUNTER',   color: '#ef4444', trait: 'Agile arrowhead. Chases you hard.',   wave: 3 },
  { name: 'ORBITER',  color: '#06b6d4', trait: 'Circles you, fires at range.',         wave: 3 },
  { name: 'PHANTOM',  color: '#ffffff', trait: 'Goes ghost — bullets pass through!',   wave: 5 },
  { name: 'SNIPER',   color: '#34d399', trait: 'Stays far, fires triple spread.',      wave: 7 },
  { name: 'TITAN',    color: '#f59e0b', trait: 'Massive dreadnought. Splits on death!',wave: 6 },
];

const CONTROLS = [
  { key: 'MOUSE', icon: '🖱️', desc: 'Aim & lead the ship' },
  { key: 'Q',     icon: '💥', desc: 'Nova Burst — AoE blast 250px' },
  { key: 'W',     icon: '🛡',  desc: 'Phase Shield — absorbs hits' },
  { key: 'R',     icon: '🌀', desc: 'Warp Pull — attract pickups' },
];

// Small canvas-drawn enemy icon
function EnemyIcon({ color, name }: { color: string; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const cx = c.getContext('2d')!;
    const s = 14;
    cx.clearRect(0, 0, 44, 44);
    cx.save();
    cx.translate(22, 22);
    cx.shadowBlur = 10;
    cx.shadowColor = color;
    cx.strokeStyle = color;
    cx.fillStyle = color;
    cx.lineWidth = 1.5;

    if (name === 'DRIFTER') {
      cx.beginPath(); cx.arc(0,0,s*0.5,0,Math.PI*2); cx.fillStyle='rgba(20,20,30,0.8)'; cx.fill();
      cx.beginPath(); cx.arc(0,0,s*0.28,0,Math.PI*2); cx.fillStyle=color; cx.fill();
      cx.beginPath(); cx.moveTo(s*0.9,0); cx.bezierCurveTo(s*0.4,-s*0.6,-s*0.4,-s*0.4,-s,0);
      cx.bezierCurveTo(-s*0.4,s*0.4,s*0.4,s*0.6,s*0.9,0); cx.strokeStyle=color; cx.stroke();
    } else if (name === 'HUNTER') {
      cx.beginPath(); cx.moveTo(s,0); cx.lineTo(-s,-s*0.9); cx.lineTo(-s*0.4,0); cx.lineTo(-s,s*0.9); cx.closePath();
      cx.fillStyle='rgba(30,10,10,0.8)'; cx.fill(); cx.stroke();
    } else if (name === 'TITAN') {
      cx.beginPath(); cx.moveTo(s,0); cx.lineTo(s*0.4,-s*0.9); cx.lineTo(-s,-s*0.6); cx.lineTo(-s*0.7,0); cx.lineTo(-s,s*0.6); cx.lineTo(s*0.4,s*0.9); cx.closePath();
      const g=cx.createRadialGradient(0,0,0,0,0,s); g.addColorStop(0,color); g.addColorStop(1,'#000'); cx.fillStyle=g; cx.fill(); cx.stroke();
    } else if (name === 'SWARMER') {
      cx.beginPath(); cx.moveTo(s,0); cx.lineTo(-s,-s*0.55); cx.lineTo(-s*0.5,0); cx.lineTo(-s,s*0.55); cx.closePath();
      cx.fillStyle='rgba(20,10,15,0.8)'; cx.fill(); cx.stroke();
      cx.beginPath(); cx.arc(0,0,s*0.2,0,Math.PI*2); cx.fillStyle='rgba(0,232,255,0.9)'; cx.fill();
    } else if (name === 'ORBITER') {
      cx.beginPath(); cx.arc(0,0,s*0.45,0,Math.PI*2); cx.fillStyle='#111'; cx.fill();
      cx.beginPath(); cx.arc(0,0,s*0.85,-Math.PI/4,Math.PI/4); cx.arc(0,0,s*0.85,Math.PI-Math.PI/4,Math.PI+Math.PI/4);
      cx.strokeStyle=color; cx.lineWidth=s*0.22; cx.stroke();
    } else if (name === 'SNIPER') {
      cx.beginPath(); cx.moveTo(s*1.2,-s*0.08); cx.lineTo(s*1.2,s*0.08); cx.lineTo(s*0.4,s*0.3); cx.lineTo(-s*0.8,s*0.45);
      cx.lineTo(-s*0.7,0); cx.lineTo(-s*0.8,-s*0.45); cx.lineTo(s*0.4,-s*0.3); cx.closePath();
      cx.fillStyle='#0f172a'; cx.fill(); cx.strokeStyle=color; cx.stroke();
      cx.beginPath(); cx.moveTo(s*1.2,0); cx.lineTo(s*3,0); cx.strokeStyle='rgba(255,0,0,0.25)'; cx.lineWidth=1; cx.stroke();
    } else if (name === 'PHANTOM') {
      cx.beginPath(); cx.moveTo(s*0.9,0); cx.quadraticCurveTo(0,-s,-s*0.9,-s*0.8);
      cx.quadraticCurveTo(-s*0.4,0,-s*0.9,s*0.8); cx.quadraticCurveTo(0,s,s*0.9,0);
      cx.fillStyle='rgba(255,255,255,0.75)'; cx.fill();
    }
    cx.restore();
  }, [color, name]);
  return <canvas ref={ref} width={44} height={44} />;
}

// ── Tutorial overlay component ──
function TutorialOverlay({ onClose }: { onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(8);
  useEffect(() => {
    const iv = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(iv); onClose(); } return t - 1; }), 1000);
    return () => clearInterval(iv);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, rgba(0,10,30,0.97) 60%, rgba(0,0,10,0.99) 100%)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.3 }}
        className="w-full max-w-3xl px-4 py-5"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[9px] tracking-[6px] text-cyan-400/50 uppercase mb-1">MISSION BRIEFING</div>
          <h2 className="text-2xl font-black italic tracking-widest text-white" style={{ fontFamily: 'Oxanium, monospace', textShadow: '0 0 20px rgba(0,232,255,0.6)' }}>
            FIELD GUIDE
          </h2>
          <div className="text-[10px] text-white/30 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Know your enemies. Know your weapons.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Enemy Legend */}
          <div>
            <div className="text-[8px] tracking-[4px] text-cyan-400/60 uppercase mb-2 px-1">⬡ ENEMY TYPES</div>
            <div className="space-y-1.5">
              {ENEMY_LEGEND.map(e => (
                <div key={e.name}
                  className="flex items-center gap-3 px-3 py-2 rounded"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${e.color}22` }}
                >
                  <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
                    <EnemyIcon color={e.color} name={e.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black italic" style={{ fontFamily: 'Oxanium', color: e.color }}>{e.name}</div>
                    <div className="text-[10px] text-white/50 leading-tight" style={{ fontFamily: 'Rajdhani' }}>{e.trait}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[8px] text-white/25" style={{ fontFamily: 'Rajdhani' }}>SECTOR</div>
                    <div className="text-xs font-bold" style={{ color: e.color, fontFamily: 'Oxanium' }}>{e.wave}+</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls + Tips */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[8px] tracking-[4px] text-cyan-400/60 uppercase mb-2 px-1">⌖ CONTROLS</div>
              <div className="space-y-1.5">
                {CONTROLS.map(c => (
                  <div key={c.key}
                    className="flex items-center gap-3 px-3 py-2 rounded"
                    style={{ background: 'rgba(0,232,255,0.04)', border: '1px solid rgba(0,232,255,0.12)' }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded text-sm font-black flex-shrink-0"
                      style={{ background: 'rgba(0,232,255,0.15)', border: '1px solid rgba(0,232,255,0.4)', fontFamily: 'Oxanium', color: '#00e8ff' }}>
                      {c.key === 'MOUSE' ? c.icon : c.key}
                    </div>
                    <div>
                      <div className="text-[10px] text-white/80" style={{ fontFamily: 'Rajdhani' }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <div className="text-[8px] tracking-[4px] text-yellow-400/60 uppercase mb-2 px-1">💡 TIPS</div>
              <div className="space-y-1.5">
                {[
                  ['⭐', 'Gold stars = bonus points. Collect them!'],
                  ['♥',  'Red orbs restore hull. Prioritise when low HP.'],
                  ['⚡', 'Blue orbs recharge ability energy (Q/W/R).'],
                  ['💎', 'Rainbow MEGA drop: points + big heal!'],
                  ['🔥', 'Kill fast to build COMBO multiplier.'],
                ].map(([icon, tip]) => (
                  <div key={tip as string} className="flex items-start gap-2 px-3 py-1.5 rounded"
                    style={{ background: 'rgba(255,208,96,0.03)', border: '1px solid rgba(255,208,96,0.08)' }}>
                    <span className="text-sm flex-shrink-0">{icon}</span>
                    <span className="text-[10px] text-white/50 leading-tight" style={{ fontFamily: 'Rajdhani' }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <button onClick={onClose}
            className="px-10 py-2.5 font-black italic tracking-widest text-sm transition-all hover:scale-105 active:scale-95"
            style={{ fontFamily: 'Oxanium', background: 'linear-gradient(135deg,#00e6e6,#0066aa)', color: '#002233', boxShadow: '0 0 20px rgba(0,232,255,0.4)' }}
          >
            ▶ ENGAGE — auto in {timeLeft}s
          </button>
          <div className="text-[9px] text-white/20 mt-2" style={{ fontFamily: 'Rajdhani' }}>or click anywhere to dismiss</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  const [showTutorial, setShowTutorial] = useState(true);  // show on every launch

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const engine = new GameEngine(
      canvasRef.current, 
      (stats) => {
        setGameStats(stats);
        setGameOver(true);
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
      // Don't forward keys while tutorial is shown
      if (showTutorial) return;
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
    setShowTutorial(true);  // show tutorial again on restart
  };

  const handleExit = () => {
    setPage('menu');
  };

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ cursor: (gameOver || showTutorial) ? 'auto' : 'none' }}>
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      
      {!gameOver && !showTutorial && (
        <div 
          ref={cursorRef} 
          className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-[22px] h-[22px] border-[1.5px] border-plasma rounded-full absolute opacity-70" />
          <div className="w-[4px] h-[4px] bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* TUTORIAL OVERLAY — shown at start of every game */}
      <AnimatePresence>
        {showTutorial && !gameOver && (
          <TutorialOverlay onClose={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>

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
