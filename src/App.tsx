import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainMenu from './pages/MainMenu';
import GameScreen from './pages/GameScreen';
import Hangar from './pages/Hangar';
import GalaxyChooser from './pages/GalaxyChooser';
import ProfilePage from './pages/ProfilePage';

export type Page = 'menu' | 'game' | 'hangar' | 'galaxy' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu');
  const isGame = currentPage === 'game';

  return (
    <div className="w-screen h-screen overflow-hidden bg-surface-container-lowest relative font-body text-white">
      <AnimatePresence mode="wait">
        {currentPage === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.35 }} className="absolute inset-0">
            <MainMenu setPage={setCurrentPage} />
          </motion.div>
        )}
        {currentPage === 'game' && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <GameScreen setPage={setCurrentPage} />
          </motion.div>
        )}
        {currentPage === 'hangar' && (
          <motion.div key="hangar" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="absolute inset-0">
            <Hangar setPage={setCurrentPage} />
          </motion.div>
        )}
        {currentPage === 'galaxy' && (
          <motion.div key="galaxy" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }} className="absolute inset-0">
            <GalaxyChooser setPage={setCurrentPage} />
          </motion.div>
        )}
        {currentPage === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.3 }} className="absolute inset-0">
            <ProfilePage setPage={setCurrentPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
