import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';
import type { Page } from '../App';
import { useGameStore } from '../store/gameStore';

interface ProfilePageProps {
  setPage: (p: Page) => void;
}

export default function ProfilePage({ setPage }: ProfilePageProps) {
  const profile = useGameStore(s => s.profile);
  const updateAvatar = useGameStore(s => s.updateAvatar);

  const colors = ['#00ffff', '#ff067f', '#d873ff', '#00e6e6', '#c1fffe', '#ff6b9b', '#9900ce', '#ffffff'];

  return (
    <div className="w-full h-full p-8 flex flex-col relative z-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="headline-font text-3xl font-bold italic text-primary-container tracking-widest uppercase">Pilot Profile</h2>
          <p className="text-on-surface-variant text-sm tracking-widest mt-1 font-body">Personnel records and outfitting</p>
        </div>
        <NeonButton variant="secondary" size="sm" onClick={() => setPage('menu')}>
          ← BACK
        </NeonButton>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">

        {/* Stats Column */}
        <div className="w-72 flex flex-col gap-5">
          <GlassCard>
            <h3 className="headline-font text-sm font-bold italic tracking-[0.2em] mb-5 text-on-surface-variant uppercase border-b border-outline-variant/20 pb-2">
              SERVICE RECORD
            </h3>
            <div className="space-y-6">
              <StatBlock label="Total Confirmed Kills" value={profile.stats.totalKills.toLocaleString()} color="#ff067f" />
              <StatBlock label="Maximum Score Reached" value={profile.stats.highScore.toLocaleString()} color="#d873ff" />
              <StatBlock
                label="Flight Time Registered"
                value={`${Math.floor(profile.stats.flightTimeSeconds / 60)}m ${profile.stats.flightTimeSeconds % 60}s`}
                color="#00ffff"
              />
            </div>
          </GlassCard>
        </div>

        {/* Avatar Builder Column */}
        <div className="flex flex-1 gap-5 min-h-0">
          <GlassCard className="w-[260px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-3 text-[9px] font-body text-on-surface-variant/50 tracking-widest">PILOT-001</div>
            <div className="relative w-44 h-60">
              {/* Body */}
              <div
                className="absolute bottom-0 w-full h-36 rounded-t-[40px] border-4 transition-colors"
                style={{ backgroundColor: profile.avatar.suitColor, borderColor: '#fff' }}
              >
                {profile.avatar.suit === 'combat' && <div className="absolute inset-x-4 top-4 h-10 bg-black/40 rounded-lg" />}
                {profile.avatar.suit === 'stealth' && <div className="absolute inset-0 bg-black/60 rounded-t-[40px]" />}
                {profile.avatar.suit === 'explorer' && <div className="absolute inset-x-2 top-6 h-16 border-4 border-white/40 rounded-lg" />}
              </div>
              {/* Accessories */}
              {profile.avatar.accessory === 'jetpack' && <div className="absolute bottom-8 -left-6 -right-6 h-16 bg-gray-600 rounded-lg -z-10" />}
              {profile.avatar.accessory === 'shoulderpads' && <div className="absolute bottom-24 -left-1 -right-1 h-8 bg-white/80 rounded-t-lg z-10" />}
              {profile.avatar.accessory === 'antenna' && <div className="absolute top-2 right-10 w-2 h-16 rounded-full rotate-12 -z-10" style={{ background: '#00ffff', boxShadow: '0 0 10px #00ffff' }} />}
              {/* Helmet */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-28 bg-black rounded-full border-4 border-white overflow-hidden">
                {profile.avatar.visor === 'clear' && <div className="absolute inset-2 bg-blue-100/20 rounded-full" />}
                {profile.avatar.visor === 'tinted' && <div className="absolute inset-2 bg-black/80 rounded-full" />}
                {profile.avatar.visor === 'hud' && <div className="absolute inset-2 border-2 border-cyan-400/50 rounded-full grid grid-cols-2 gap-1 p-2"><div className="border border-cyan-400/30 w-full h-2"></div></div>}
                {profile.avatar.visor === 'mirrored' && <div className="absolute inset-2 bg-gradient-to-tr from-white to-gray-300 rounded-full" />}
              </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full text-center text-[9px] tracking-widest text-on-surface-variant/30 uppercase font-body">// PREVIEW //</div>
          </GlassCard>

          <GlassCard className="flex-1 flex flex-col overflow-y-auto">
            <h3 className="headline-font text-sm font-bold italic tracking-[0.2em] mb-5 text-on-surface-variant uppercase border-b border-outline-variant/20 pb-2">
              OUTFITTING
            </h3>
            <div className="space-y-5 flex-1">
              <Selector label="Base Suit" options={['standard', 'combat', 'stealth', 'explorer']} current={profile.avatar.suit} onChange={(v: any) => updateAvatar({ suit: v })} />
              <Selector label="Visor Type" options={['clear', 'tinted', 'hud', 'mirrored']} current={profile.avatar.visor} onChange={(v: any) => updateAvatar({ visor: v })} />
              <Selector label="Add-on Module" options={['none', 'antenna', 'jetpack', 'shoulderpads']} current={profile.avatar.accessory} onChange={(v: any) => updateAvatar({ accessory: v })} />

              <div>
                <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-3 font-body">Suit Custom Color</p>
                <div className="flex gap-3 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => updateAvatar({ suitColor: c })}
                      className={`w-8 h-8 transition-all border-2 ${profile.avatar.suitColor === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: c, boxShadow: profile.avatar.suitColor === c ? `0 0 15px ${c}` : 'none' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

const StatBlock = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div>
    <p className="text-[10px] text-on-surface-variant tracking-widest uppercase font-body">{label}</p>
    <p className="headline-font text-2xl font-black italic mt-1" style={{ color }}>{value}</p>
  </div>
);

const Selector = ({ label, options, current, onChange }: any) => (
  <div>
    <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-2 font-body">{label}</p>
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt: string) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-2 text-[11px] headline-font italic tracking-widest uppercase border transition-all text-left ${
            current === opt
              ? 'bg-primary-container text-on-primary border-primary-container shadow-[0_0_10px_rgba(0,255,255,0.3)]'
              : 'bg-transparent text-on-surface-variant border-outline-variant/30 hover:border-primary-dim/50 hover:text-on-surface'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);
