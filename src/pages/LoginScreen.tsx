import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { StarfieldRenderer } from '../game/renderer/StarfieldRenderer';

interface LoginScreenProps {
  onLoggedIn: () => void;
}

// Animated starfield canvas
function StarBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const sf = new StarfieldRenderer(w, h);
    let px = 0, py = 0;
    const onrs = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', onrs);
    let raf: number, lt = performance.now();
    const draw = (t: number) => {
      const dt = Math.min(t - lt, 50); lt = t;
      px += 0.25; py += 0.1;
      ctx.fillStyle = '#000008'; ctx.fillRect(0, 0, w, h);
      sf.draw(ctx, px * 0.4, py * 0.4);
      // Vignette
      const vg = ctx.createRadialGradient(w/2, h/2, h*0.1, w/2, h/2, h*0.85);
      vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(0,0,12,0.95)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(draw);
    };
    draw(performance.now());
    return () => { window.removeEventListener('resize', onrs); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 z-0 pointer-events-none" />;
}

export default function LoginScreen({ onLoggedIn }: LoginScreenProps) {
  const register = useGameStore(s => s.register);
  const login = useGameStore(s => s.login);

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 320)); // brief loading feel
    
    if (!mounted.current) return;

    const result = tab === 'register'
      ? register(username, password)
      : login(username, password);

    if (result.ok) {
      onLoggedIn();
    } else {
      setLoading(false);
      setError(result.error ?? 'Unknown error');
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <StarBg />

      {/* Ambient glow orbs */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,232,255,0.07) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,69,255,0.07) 0%, transparent 60%)', filter: 'blur(40px)' }} />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-black italic tracking-tight text-white leading-none mb-1"
            style={{ fontFamily: 'Oxanium, sans-serif', textShadow: '0 0 30px rgba(0,232,255,0.7)' }}
            animate={{ textShadow: ['0 0 20px rgba(0,232,255,0.6)', '0 0 35px rgba(200,100,255,0.7)', '0 0 20px rgba(0,232,255,0.6)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            STELLAR <span style={{ color: '#00e8ff' }}>DRIFT</span>
          </motion.h1>
          <div className="text-xs tracking-[0.4em] text-cyan-400/50 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Kinetic Archive System
          </div>
        </div>

        {/* Card */}
        <div className="rounded-none border border-white/10 backdrop-blur-xl"
          style={{ background: 'linear-gradient(135deg, rgba(10,15,30,0.92) 0%, rgba(5,8,20,0.96) 100%)', boxShadow: '0 0 60px rgba(0,232,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-4 text-xs font-black italic tracking-widest uppercase transition-all relative"
                style={{
                  fontFamily: 'Oxanium, sans-serif',
                  color: tab === t ? '#00e8ff' : 'rgba(255,255,255,0.35)',
                  background: tab === t ? 'rgba(0,232,255,0.05)' : 'transparent',
                }}
              >
                {t === 'login' ? '⬢ Returning Pilot' : '✦ New Pilot'}
                {tab === t && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, transparent, #00e8ff, transparent)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-[11px] tracking-[0.25em] text-cyan-400/70 uppercase mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Pilot Callsign
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your callsign..."
                autoComplete="username"
                className="w-full px-4 py-3 text-white text-sm outline-none transition-all"
                style={{
                  fontFamily: 'Oxanium, sans-serif',
                  background: 'rgba(0,232,255,0.04)',
                  border: '1px solid rgba(0,232,255,0.2)',
                  boxShadow: username ? '0 0 12px rgba(0,232,255,0.1) inset' : 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,232,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,232,255,0.2)'}
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.25em] text-cyan-400/70 uppercase mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Access Code
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter access code..."
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  className="w-full px-4 py-3 pr-12 text-white text-sm outline-none transition-all"
                  style={{
                    fontFamily: 'Oxanium, sans-serif',
                    background: 'rgba(0,232,255,0.04)',
                    border: '1px solid rgba(0,232,255,0.2)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,232,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,232,255,0.2)'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors text-xs"
                  style={{ fontFamily: 'Oxanium' }}>
                  {showPass ? '◉' : '○'}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-4 py-2 text-xs text-red-300 border border-red-500/30"
                  style={{ background: 'rgba(239,68,68,0.08)', fontFamily: 'Rajdhani, sans-serif' }}
                >
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !username || !password}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 text-sm font-black italic tracking-widest uppercase transition-all mt-2 disabled:opacity-40 disabled:pointer-events-none"
              style={{
                fontFamily: 'Oxanium, sans-serif',
                background: loading
                  ? 'rgba(0,232,255,0.2)'
                  : 'linear-gradient(135deg, #00e6e6 0%, #0088aa 100%)',
                color: loading ? 'rgba(0,232,255,0.7)' : '#001a22',
                boxShadow: loading ? 'none' : '0 0 25px rgba(0,232,255,0.35)',
              }}
            >
              {loading
                ? '— AUTHENTICATING —'
                : tab === 'login' ? '▶ ACCESS GRANTED' : '✦ CREATE PILOT'}
            </motion.button>

            <p className="text-center text-[10px] text-white/25 leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {tab === 'login'
                ? 'Profiles are stored locally on this device.'
                : 'Your pilot profile will be saved on this device.'}
            </p>
          </form>
        </div>

        {/* Decorative bottom bar */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-400/20" />
          <span className="text-[9px] tracking-[4px] text-white/20 uppercase" style={{ fontFamily: 'Rajdhani' }}>
            ver 2124.1
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/20" />
        </div>
      </motion.div>
    </div>
  );
}
