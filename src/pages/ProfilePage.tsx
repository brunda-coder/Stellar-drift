import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';

interface ProfilePageProps {
  setPage: (p: Page) => void;
}

const PageShell = ({ title, subtitle, onBack, children }: {
  title: string; subtitle: string; onBack: () => void; children: React.ReactNode;
}) => (
  <div className="w-full h-full flex flex-col relative z-10 overflow-hidden"
    style={{ background: 'radial-gradient(ellipse 70% 50% at 20% 30%, rgba(255,6,127,0.04) 0%, transparent 70%), #000005' }}>
    <div className="flex items-center gap-4 px-6 py-3 border-b border-white/5 flex-shrink-0">
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-cyan-300 transition-colors text-sm headline-font italic tracking-widest uppercase">
        <span className="material-symbols-outlined text-lg">arrow_back</span> Back
      </button>
      <div className="w-px h-5 bg-white/10" />
      <div>
        <h2 className="headline-font font-black italic text-xl text-white tracking-wider leading-tight">{title}</h2>
        <p className="text-[10px] text-white/30 font-body tracking-widest">{subtitle}</p>
      </div>
    </div>
    <div className="flex-1 min-h-0 overflow-hidden p-4">{children}</div>
  </div>
);

const colors = ['#00ffff', '#ff067f', '#d873ff', '#00e6e6', '#c1fffe', '#ff6b9b', '#9900ce', '#ffffff'];

export default function ProfilePage({ setPage }: ProfilePageProps) {
  const profile = useGameStore(s => s.profile);
  const updateAvatar = useGameStore(s => s.updateAvatar);

  return (
    <PageShell title="PILOT PROFILE" subtitle="Personnel records & outfitting" onBack={() => setPage('menu')}>
      <div className="flex gap-4 h-full">

        {/* Stats */}
        <div className="w-56 flex flex-col gap-3 flex-shrink-0">
          <GlassCard className="py-4 px-4">
            <div className="text-[9px] text-white/30 headline-font italic tracking-[0.3em] mb-3 uppercase">Service Record</div>
            <div className="space-y-4">
              <StatRow label="Total Kills" value={profile.stats.totalKills.toLocaleString()} color="#ff067f" />
              <StatRow label="High Score" value={profile.stats.highScore.toLocaleString()} color="#d873ff" />
              <StatRow label="Flight Time" value={`${Math.floor(profile.stats.flightTimeSeconds / 60)}m ${profile.stats.flightTimeSeconds % 60}s`} color="#00ffff" />
              <StatRow label="Credits" value={`💎 ${profile.credits.toLocaleString()}`} color="#00e6e6" />
            </div>
          </GlassCard>
          <GlassCard className="py-4 px-4 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-body text-white/20">PILOT-001</div>
            <AvatarPreview avatar={profile.avatar} />
            <div className="text-[8px] text-white/20 font-body tracking-widest mt-2">// PREVIEW //</div>
          </GlassCard>
        </div>

        {/* Outfitting */}
        <GlassCard className="flex-1 py-4 px-4 flex flex-col overflow-y-auto">
          <div className="text-[9px] text-white/30 headline-font italic tracking-[0.3em] mb-4 uppercase">Outfitting</div>
          <div className="space-y-4 flex-1">
            <Selector label="Base Suit" options={['standard', 'combat', 'stealth', 'explorer']} current={profile.avatar.suit} onChange={(v: any) => updateAvatar({ suit: v })} />
            <Selector label="Visor Type" options={['clear', 'tinted', 'hud', 'mirrored']} current={profile.avatar.visor} onChange={(v: any) => updateAvatar({ visor: v })} />
            <Selector label="Add-on Module" options={['none', 'antenna', 'jetpack', 'shoulderpads']} current={profile.avatar.accessory} onChange={(v: any) => updateAvatar({ accessory: v })} />
            <div>
              <p className="text-[9px] text-white/30 tracking-widest uppercase mb-2 font-body">Suit Color</p>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button key={c} onClick={() => updateAvatar({ suitColor: c })}
                    className={`w-7 h-7 transition-all border-2 ${profile.avatar.suitColor === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: c, boxShadow: profile.avatar.suitColor === c ? `0 0 12px ${c}` : 'none' }} />
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </PageShell>
  );
}

const StatRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div>
    <div className="text-[9px] text-white/30 tracking-widest uppercase font-body">{label}</div>
    <div className="headline-font font-black italic text-lg leading-tight" style={{ color }}>{value}</div>
  </div>
);

const AvatarPreview = ({ avatar }: { avatar: any }) => (
  <div className="relative w-28 h-40">
    <div className="absolute bottom-0 w-full h-24 rounded-t-[30px] border-4 transition-colors"
      style={{ backgroundColor: avatar.suitColor, borderColor: '#fff5' }}>
      {avatar.suit === 'combat' && <div className="absolute inset-x-3 top-3 h-8 bg-black/40 rounded" />}
      {avatar.suit === 'stealth' && <div className="absolute inset-0 bg-black/60 rounded-t-[30px]" />}
      {avatar.suit === 'explorer' && <div className="absolute inset-x-1 top-4 h-12 border-2 border-white/30 rounded" />}
    </div>
    {avatar.accessory === 'jetpack' && <div className="absolute bottom-6 -left-4 -right-4 h-12 bg-gray-600 rounded -z-10" />}
    {avatar.accessory === 'shoulderpads' && <div className="absolute bottom-16 -left-1 -right-1 h-6 bg-white/70 rounded-t z-10" />}
    {avatar.accessory === 'antenna' && <div className="absolute top-1 right-6 w-1.5 h-12 rounded-full rotate-12 -z-10" style={{ background: '#00ffff', boxShadow: '0 0 8px #00ffff' }} />}
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-20 bg-black rounded-full border-4 border-white/30 overflow-hidden">
      {avatar.visor === 'clear' && <div className="absolute inset-1 bg-blue-100/20 rounded-full" />}
      {avatar.visor === 'tinted' && <div className="absolute inset-1 bg-black/80 rounded-full" />}
      {avatar.visor === 'hud' && <div className="absolute inset-1 border border-cyan-400/50 rounded-full" />}
      {avatar.visor === 'mirrored' && <div className="absolute inset-1 bg-gradient-to-tr from-white to-gray-300 rounded-full" />}
    </div>
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
      style={{ background: avatar.suitColor, boxShadow: `0 0 10px ${avatar.suitColor}` }} />
  </div>
);

const Selector = ({ label, options, current, onChange }: any) => (
  <div>
    <p className="text-[9px] text-white/30 tracking-widest uppercase mb-1.5 font-body">{label}</p>
    <div className="grid grid-cols-4 gap-1.5">
      {options.map((opt: string) => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`px-2 py-1.5 text-[9px] font-black italic headline-font tracking-widest uppercase border transition-all ${
            current === opt
              ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.4)]'
              : 'bg-transparent text-white/30 border-white/10 hover:border-white/30 hover:text-white/60'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  </div>
);
