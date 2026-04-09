import type { Page } from '../../App';

interface SideNavBarProps {
  currentPage: Page;
  setPage: (p: Page) => void;
}

export default function SideNavBar({ currentPage, setPage }: SideNavBarProps) {
  const getNavClass = (pageTarget: Page) => {
    const isActive = currentPage === pageTarget;
    if (isActive) {
      return "bg-cyan-500/20 text-cyan-400 border-l-4 border-cyan-400 pl-4 py-3 flex items-center gap-3 headline-font italic uppercase hover:translate-x-1 duration-300 transition-all cursor-pointer";
    }
    return "text-purple-200/40 border-l-4 border-transparent pl-4 py-3 flex items-center gap-3 headline-font italic uppercase hover:bg-purple-500/10 hover:text-purple-200 transition-all hover:translate-x-1 duration-300 cursor-pointer";
  };

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col pt-24 pb-8 w-64 bg-black/60 backdrop-blur-2xl z-40 shadow-[10px_0_30px_rgba(0,255,255,0.05)]">
      <div className="px-6 mb-10">
        <div className="text-[10px] tracking-[0.3em] text-cyan-400/50 headline-font italic">COMMANDER</div>
        <div className="text-xl font-bold italic text-cyan-400 headline-font">SECTOR 7-G</div>
      </div>
      <nav className="flex-1 space-y-2">
        <div className={getNavClass('menu')} onClick={() => setPage('menu')}>
          <span className="material-symbols-outlined">rocket_launch</span>
          <span>Launch</span>
        </div>
        <div className={getNavClass('hangar')} onClick={() => setPage('hangar')}>
          <span className="material-symbols-outlined">precision_manufacturing</span>
          <span>Hangar</span>
        </div>
        <div className={getNavClass('galaxy')} onClick={() => setPage('galaxy')}>
          <span className="material-symbols-outlined">public</span>
          <span>Galaxy Select</span>
        </div>
        <div className={getNavClass('profile')} onClick={() => setPage('profile')}>
          <span className="material-symbols-outlined">assignment</span>
          <span>Pilot Log</span>
        </div>
      </nav>
      <div className="px-4 mt-auto">
        <button className="w-full py-4 bg-primary-container text-on-primary font-black italic headline-font text-lg tracking-widest glow-cyan active:scale-95 transition-transform duration-150">
          OVERDRIVE
        </button>
      </div>
    </aside>
  );
}
