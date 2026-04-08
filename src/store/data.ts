import type { Ship, ShipTier, Galaxy } from './types';

// Helper to generate a tier of ships
const createShipsForTier = (tier: ShipTier, basePrice: number, baseStats: Partial<Ship>, count: number = 10): Ship[] => {
  const tiersClasses = ['Scout', 'Patrol', 'Assault', 'Heavy', 'Recon', 'Vanguard', 'Phantom', 'Nova', 'Titan', 'Legendary'];
  const colors = ['#00e8ff', '#ff5c1a', '#ffd060', '#8b45ff', '#ff3a8c', '#00ffaa', '#ffffff', '#ef4444', '#f59e0b', '#3b82f6'];
  const ships: Ship[] = [];
  
  for (let i = 1; i <= count; i++) {
    const statVar = () => (Math.random() * 0.4 + 0.8); // 0.8x to 1.2x variance
    
    ships.push({
      id: `ship_t${tier}_${i}`,
      name: `T${tier} ${tiersClasses[tier - 1]} Mk.${i}`,
      tier,
      hull: Math.round((baseStats.hull || 100) * statVar()),
      energy: Math.round((baseStats.energy || 100) * statVar()),
      speed: Number(((baseStats.speed || 5) * statVar()).toFixed(1)),
      shield: Math.round((baseStats.shield || 0) * statVar()),
      price: i === 1 && tier === 1 ? 0 : Math.round(basePrice * Math.pow(1.2, i-1)),
      description: `A reliable Tier ${tier} ${tiersClasses[tier - 1]} class vessel.`,
      color: colors[(tier + i) % colors.length]
    });
  }
  return ships;
};

export const SHIPS: Ship[] = [
  ...createShipsForTier(1, 0, { hull: 100, energy: 100, speed: 5, shield: 0 }),
  ...createShipsForTier(2, 500, { hull: 150, energy: 120, speed: 5.5, shield: 20 }),
  ...createShipsForTier(3, 2000, { hull: 220, energy: 150, speed: 6.0, shield: 50 }),
  ...createShipsForTier(4, 8000, { hull: 350, energy: 200, speed: 5.0, shield: 120 }),
  ...createShipsForTier(5, 20000, { hull: 250, energy: 300, speed: 7.5, shield: 80 }),
  ...createShipsForTier(6, 50000, { hull: 450, energy: 250, speed: 6.5, shield: 200 }),
  ...createShipsForTier(7, 100000, { hull: 300, energy: 400, speed: 8.5, shield: 150 }),
  ...createShipsForTier(8, 200000, { hull: 600, energy: 350, speed: 7.0, shield: 350 }),
  ...createShipsForTier(9, 400000, { hull: 1000, energy: 300, speed: 5.5, shield: 500 }),
  ...createShipsForTier(10, 1000000, { hull: 800, energy: 600, speed: 9.0, shield: 800 })
];

export const GALAXIES: Galaxy[] = [
  {
    id: 'milky_way',
    name: 'Milky Way',
    description: 'The starting zone. Balanced enemy encounters and moderate black hole activity.',
    difficulty: 1,
    unlockCost: 0,
    modifiers: {},
    colors: { bg1: 'rgba(139,69,255,0.033)', bg2: 'rgba(0,232,255,0.022)', star: 'rgba(255,248,225,' }
  },
  {
    id: 'andromeda',
    name: 'Andromeda',
    description: 'A harsh frontier. Enemies are larger and take more damage.',
    difficulty: 2,
    unlockCost: 5000,
    modifiers: { enemyHpMultiplier: 1.2 },
    colors: { bg1: 'rgba(255,92,26,0.03)', bg2: 'rgba(255,208,96,0.02)', star: 'rgba(255,200,180,' }
  },
  {
    id: 'sombrero',
    name: 'Sombrero',
    description: 'Dense galactic core. Gravitational anomalies pull you in. Black holes appear twice as often.',
    difficulty: 3,
    unlockCost: 15000,
    modifiers: { blackHoleFreq: 2.0 },
    colors: { bg1: 'rgba(0,255,170,0.03)', bg2: 'rgba(0,232,255,0.02)', star: 'rgba(200,255,240,' }
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool',
    description: 'Volatile energy zone. Enemies attack with much greater ferocity and speed.',
    difficulty: 4,
    unlockCost: 40000,
    modifiers: { enemyFireRate: 1.4 },
    colors: { bg1: 'rgba(255,58,140,0.04)', bg2: 'rgba(139,69,255,0.03)', star: 'rgba(255,200,220,' }
  },
  {
    id: 'black_eye',
    name: 'Black Eye',
    description: 'A terrifying dark space. Enemies are massive and hit incredibly hard.',
    difficulty: 5,
    unlockCost: 100000,
    modifiers: { enemySizeDmg: 1.5 },
    colors: { bg1: 'rgba(20,0,40,0.06)', bg2: 'rgba(255,58,140,0.02)', star: 'rgba(180,180,255,' }
  },
  {
    id: 'cigar',
    name: 'Cigar (M82)',
    description: 'A continuous cosmic storm. Your ship will constantly drift due to intense gravitational waves.',
    difficulty: 5,
    unlockCost: 250000,
    modifiers: { cosmicStormDrift: true, enemyHpMultiplier: 1.5 },
    colors: { bg1: 'rgba(255,208,96,0.04)', bg2: 'rgba(255,92,26,0.04)', star: 'rgba(255,255,255,' }
  }
];
