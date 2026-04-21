export type ShipTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Bounty {
  id: string;
  desc: string;
  type: 'kills' | 'graze' | 'survive' | 'pickups' | 'score';
  target: number;
  progress: number;
  reward: number;
}

export interface Ship {
  id: string;
  name: string;
  tier: ShipTier;
  hull: number;
  energy: number;
  speed: number;
  shield: number;
  price: number;
  description: string;
  color: string;
}

export interface Galaxy {
  id: string;
  name: string;
  description: string;
  difficulty: number; // 1 to 5
  unlockCost: number;
  modifiers: {
    enemyHpMultiplier?: number;
    blackHoleFreq?: number;
    enemyFireRate?: number;
    enemySizeDmg?: number;
    cosmicStormDrift?: boolean;
  };
  colors: {
    bg1: string;
    bg2: string;
    star: string;
  };
}

export interface AvatarConfig {
  suit: 'standard' | 'combat' | 'stealth' | 'explorer';
  visor: 'clear' | 'tinted' | 'hud' | 'mirrored';
  accessory: 'none' | 'antenna' | 'jetpack' | 'shoulderpads';
  suitColor: string;
  pilotId?: string; // selected pilot character id
}

export interface UserProfile {
  username: string;
  credits: number;
  currentShipId: string;
  unlockedShipIds: string[];
  unlockedGalaxies: string[];
  avatar: AvatarConfig;
  stats: {
    totalKills: number;
    highScore: number;
    flightTimeSeconds: number;
  };
  upgrades: {
    hullPlating: number;
    energyCore: number;
    magnetRange: number;
    overchargeDuration: number;
    adrenalineDecay: number;
  };
  bounties: Bounty[];
  bountiesCompleted: number;
  lastLoginTimestamp: number;
}
