export default function TopNavBar() {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-transparent backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="text-2xl font-black italic tracking-tighter text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] headline-font">STELLAR DRIFT</div>
      <div className="flex gap-6 items-center">
        <button className="text-purple-300/60 hover:text-cyan-300 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] p-2 transition-all active:scale-95 duration-150 ease-out">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="flex items-center gap-3 bg-cyan-500/10 px-4 py-1 border-l-2 border-cyan-400">
          <span className="text-[10px] font-medium font-body tracking-widest uppercase text-cyan-400">PILOT: X-RAY 7</span>
          <span className="material-symbols-outlined text-cyan-400">account_circle</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 h-[2px] w-full"></div>
    </nav>
  );
}
