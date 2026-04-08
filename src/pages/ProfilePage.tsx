
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
  
  const colors = ['#00e8ff', '#ff3a8c', '#ffd060', '#8b45ff', '#00ffaa', '#ef4444', '#f59e0b', '#ffffff'];
  
  return (
    <div className="w-full h-full p-8 flex flex-col relative z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(255,58,140,0.05),transparent_60%),#010308]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-oxanium text-3xl font-bold text-plasma tracking-widest uppercase">Pilot Profile</h2>
          <p className="text-white/40 text-sm tracking-widest mt-1">Personnel records and aesthetic outfitting</p>
        </div>
        <NeonButton variant="secondary" size="sm" onClick={() => setPage('menu')}>
          BACK TO MENU
        </NeonButton>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        
        {/* Stats Column */}
        <div className="w-1/3 flex flex-col gap-6">
          <GlassCard>
            <h3 className="font-oxanium text-xl font-bold tracking-widest mb-6 border-b border-white/10 pb-2">SERVICE RECORD</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-white/50 tracking-widest uppercase">Total Confirmed Kills</p>
                <p className="font-oxanium text-3xl font-bold text-rose">{profile.stats.totalKills.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 tracking-widest uppercase">Maximum Score Reached</p>
                <p className="font-oxanium text-3xl font-bold text-gold">{profile.stats.highScore.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 tracking-widest uppercase">Flight Time Registered</p>
                <p className="font-oxanium text-3xl font-bold text-plasma">
                  {Math.floor(profile.stats.flightTimeSeconds / 60)}m {profile.stats.flightTimeSeconds % 60}s
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Avatar Builder Column */}
        <div className="w-2/3 flex gap-6">
          <GlassCard className="w-1/2 flex items-center justify-center relative overflow-hidden bg-gradient-to-t from-white/5 to-transparent">
            {/* Simple CSS-based mock avatar renderer for now */}
            <div className="relative w-48 h-64">
              {/* Body */}
              <div 
                className="absolute bottom-0 w-full h-40 rounded-t-[40px] border-4 transition-colors"
                style={{ backgroundColor: profile.avatar.suitColor, borderColor: '#fff' }}
              >
                {/* Suit accents */}
                {profile.avatar.suit === 'combat' && <div className="absolute inset-x-4 top-4 h-12 bg-black/40 rounded-lg" />}
                {profile.avatar.suit === 'stealth' && <div className="absolute inset-0 bg-black/60 rounded-t-[40px]" />}
                {profile.avatar.suit === 'explorer' && <div className="absolute inset-x-2 top-8 h-20 border-4 border-white/40 rounded-lg" />}
              </div>
              
              {/* Accessory */}
              {profile.avatar.accessory === 'jetpack' && <div className="absolute bottom-10 -left-6 -right-6 h-20 bg-gray-600 rounded-lg -z-10" />}
              {profile.avatar.accessory === 'shoulderpads' && <div className="absolute bottom-28 -left-2 -right-2 h-10 bg-white/80 rounded-t-lg z-10" />}
              {profile.avatar.accessory === 'antenna' && <div className="absolute top-2 right-12 w-2 h-20 bg-plasma shadow-[0_0_10px_#00e8ff] rotate-12 -z-10" />}
              
              {/* Helmet */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-black rounded-full border-4 border-white overflow-hidden">
                {profile.avatar.visor === 'clear' && <div className="absolute inset-2 bg-blue-100/20 rounded-full" />}
                {profile.avatar.visor === 'tinted' && <div className="absolute inset-2 bg-black/80 rounded-full" />}
                {profile.avatar.visor === 'hud' && <div className="absolute inset-2 border-2 border-plasma/50 rounded-full grid grid-cols-2 gap-1 p-2"><div className="border border-plasma/30 w-full h-2"></div></div>}
                {profile.avatar.visor === 'mirrored' && <div className="absolute inset-2 bg-gradient-to-tr from-white to-gray-400 rounded-full" />}
              </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full text-center text-xs tracking-widest text-white/30 uppercase">
              // PREVIEW //
            </div>
          </GlassCard>

          <GlassCard className="flex-1 flex flex-col overflow-y-auto">
            <h3 className="font-oxanium text-xl font-bold tracking-widest mb-6 border-b border-white/10 pb-2">OUTFITTING</h3>
            
            <div className="space-y-6 flex-1">
              <Selector 
                label="Base Suit" 
                options={['standard', 'combat', 'stealth', 'explorer']} 
                current={profile.avatar.suit} 
                onChange={(v: any) => updateAvatar({ suit: v as any })} 
              />
              <Selector 
                label="Visor Type" 
                options={['clear', 'tinted', 'hud', 'mirrored']} 
                current={profile.avatar.visor} 
                onChange={(v: any) => updateAvatar({ visor: v as any })} 
              />
              <Selector 
                label="Add-on Module" 
                options={['none', 'antenna', 'jetpack', 'shoulderpads']} 
                current={profile.avatar.accessory} 
                onChange={(v: any) => updateAvatar({ accessory: v as any })} 
              />

              <div>
                <p className="text-[10px] text-white/50 tracking-widest uppercase mb-3">Suit Custom Color</p>
                <div className="flex gap-3 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => updateAvatar({ suitColor: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${profile.avatar.suitColor === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
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

const Selector = ({ label, options, current, onChange }: any) => (
  <div>
    <p className="text-[10px] text-white/50 tracking-widest uppercase mb-2">{label}</p>
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt: string) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-2 text-[11px] font-oxanium tracking-widest uppercase border rounded transition-colors text-left ${current === opt ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white/50'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);
