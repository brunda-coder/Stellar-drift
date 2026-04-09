import { useGameStore } from '../../store/gameStore';

export default function Footer() {
  const profile = useGameStore(s => s.profile);

  return (
    <footer className="fixed bottom-0 w-full z-50 pointer-events-none">
      <div className="max-w-6xl mx-auto px-10 pb-8 flex justify-between items-end child-pointer-events-auto">
        <div className="glass-panel border-t border-r border-cyan-400/30 p-4 min-w-[300px] flex items-center gap-8 pointer-events-auto">
          <div>
            <div className="text-[10px] font-medium font-body tracking-[0.2em] text-cyan-400/50 uppercase">Credits</div>
            <div className="text-2xl font-black italic headline-font text-primary-container flex items-center gap-1">
              <span className="material-symbols-outlined text-primary-container text-[18px]">diamond</span>
              {profile.credits.toLocaleString()}
            </div>
          </div>
          <div className="w-[1px] h-10 bg-outline-variant/30"></div>
          <div>
            <div className="text-[10px] font-medium font-body tracking-[0.2em] text-cyan-400/50 uppercase">High Score</div>
            <div className="text-2xl font-black italic headline-font text-on-surface">
              {profile.stats.highScore.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="text-right pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex gap-6 mb-2">
            <a className="text-[10px] font-body font-medium tracking-[0.2em] text-purple-500/50 hover:text-cyan-300 transition-colors duration-500 uppercase" href="#">Store</a>
            <a className="text-[10px] font-body font-medium tracking-[0.2em] text-purple-500/50 hover:text-cyan-300 transition-colors duration-500 uppercase" href="#">Leaderboard</a>
            <a className="text-[10px] font-body font-medium tracking-[0.2em] text-purple-500/50 hover:text-cyan-300 transition-colors duration-500 uppercase" href="#">Options</a>
          </div>
          <div className="text-[10px] font-body font-medium tracking-[0.2em] text-purple-400/50 uppercase">© 2124 KINETIC ARCHIVE SYSTEMS</div>
        </div>
      </div>
    </footer>
  );
}
