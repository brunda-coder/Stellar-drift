import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainMenu from './pages/MainMenu';
import GameScreen from './pages/GameScreen';
import Hangar from './pages/Hangar';
import GalaxyChooser from './pages/GalaxyChooser';
import ProfilePage from './pages/ProfilePage';
import TopNavBar from './components/layout/TopNavBar';
import SideNavBar from './components/layout/SideNavBar';
import Footer from './components/layout/Footer';

export type Page = 'menu' | 'game' | 'hangar' | 'galaxy' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu');

  const isGame = currentPage === 'game';

  return (
    <div className="w-screen h-screen overflow-hidden bg-surface-container-lowest relative font-body text-white">
      
      {/* GLOBAL BACKGROUND ELEMENTS (visible when not in game) */}
      {!isGame && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
          <div className="perspective-grid opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest opacity-80"></div>
          <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>
        </div>
      )}

      {!isGame && <TopNavBar />}
      {!isGame && <SideNavBar currentPage={currentPage} setPage={setCurrentPage} />}

      {/* MAIN CONTENT AREA adjusts if nav is present */}
      <main className={`relative z-10 w-full h-full flex flex-col ${!isGame ? 'ml-64 pt-24 pb-20' : ''}`}>
        <AnimatePresence mode="wait">
          {currentPage === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <MainMenu setPage={setCurrentPage} />
            </motion.div>
          )}
          {currentPage === 'game' && (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <GameScreen setPage={setCurrentPage} />
            </motion.div>
          )}
          {currentPage === 'hangar' && (
            <motion.div key="hangar" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="absolute inset-0">
              <Hangar setPage={setCurrentPage} />
            </motion.div>
          )}
          {currentPage === 'galaxy' && (
            <motion.div key="galaxy" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="absolute inset-0">
              <GalaxyChooser setPage={setCurrentPage} />
            </motion.div>
          )}
          {currentPage === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="absolute inset-0">
              <ProfilePage setPage={setCurrentPage} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isGame && <Footer />}
    </div>
  );
}

export default App;

