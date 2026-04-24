import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, AvatarConfig, Bounty } from './types';
import { SHIPS, GALAXIES } from './data';

interface GameState {
  profile: UserProfile;
  
  // Actions
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  equipShip: (shipId: string) => void;
  unlockShip: (shipId: string) => void;
  unlockGalaxy: (galaxyId: string) => void;
  updateAvatar: (avatar: Partial<AvatarConfig>) => void;
  updateStats: (kills: number, score: number, flightTime: number) => void;
  claimDailyReward: () => boolean;
  buyUpgrade: (upgradeId: keyof UserProfile['upgrades'], cost: number) => boolean;
  
  // Bounties
  updateBountyProgress: (progressUpdates: Partial<Record<Bounty['type'], number>>) => void;
  replaceBounty: (bountyId: string) => void;
  skipBounty: (bountyId: string) => boolean;
}

const generateBounty = (completedCount: number): Bounty => {
  const types: Bounty['type'][] = ['kills', 'graze', 'survive', 'pickups', 'score'];
  const type = types[Math.floor(Math.random() * types.length)];
  const scale = 1 + (completedCount * 0.1);
  
  let target = 0;
  let reward = 0;
  let desc = '';
  
  if (type === 'kills') { target = Math.floor(50 * scale); reward = Math.floor(200 * scale); desc = `Destroy ${target} enemy ships`; }
  else if (type === 'graze') { target = Math.floor(100 * scale); reward = Math.floor(250 * scale); desc = `Earn ${target} Graze points`; }
  else if (type === 'survive') { target = Math.floor(60 * scale); reward = Math.floor(300 * scale); desc = `Survive for ${target} seconds`; }
  else if (type === 'pickups') { target = Math.floor(15 * scale); reward = Math.floor(250 * scale); desc = `Collect ${target} pickups`; }
  else if (type === 'score') { target = Math.floor(5000 * scale); reward = Math.floor(400 * scale); desc = `Earn ${target.toLocaleString()} score`; }
  
  return {
    id: `bty_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    type, desc, target, progress: 0, reward
  };
};

const DEFAULT_PROFILE: UserProfile = {
  username: 'Pilot',
  credits: 500, // starter credits
  currentShipId: SHIPS[0].id,
  unlockedShipIds: [SHIPS[0].id],
  unlockedGalaxies: ['milky_way'],
  avatar: {
    suit: 'standard',
    visor: 'clear',
    accessory: 'none',
    suitColor: '#00e8ff',
    pilotId: 'nova'
  },
  stats: {
    totalKills: 0,
    highScore: 0,
    flightTimeSeconds: 0,
  },
  upgrades: {
    hullPlating: 0,
    energyCore: 0,
    magnetRange: 0,
    overchargeDuration: 0,
    adrenalineDecay: 0,
  },
  bounties: [generateBounty(0), generateBounty(0), generateBounty(0)],
  bountiesCompleted: 0,
  lastLoginTimestamp: 0,
};

// Export default profile for use in other modules
export { DEFAULT_PROFILE };

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,

      addCredits: (amount) => set((state) => ({
        profile: { ...state.profile, credits: state.profile.credits + amount }
      })),

      spendCredits: (amount) => {
        const { profile } = get();
        if (profile.credits >= amount) {
          set({ profile: { ...profile, credits: profile.credits - amount } });
          return true;
        }
        return false;
      },

      equipShip: (shipId) => set((state) => ({
        profile: { ...state.profile, currentShipId: shipId }
      })),

      unlockShip: (shipId) => set((state) => {
        if (state.profile.unlockedShipIds.includes(shipId)) return state;
        return { profile: { ...state.profile, unlockedShipIds: [...state.profile.unlockedShipIds, shipId] } };
      }),

      unlockGalaxy: (galaxyId) => set((state) => {
        if (state.profile.unlockedGalaxies.includes(galaxyId)) return state;
        return { profile: { ...state.profile, unlockedGalaxies: [...state.profile.unlockedGalaxies, galaxyId] } };
      }),

      updateAvatar: (avatarUpdates) => set((state) => ({
        profile: { ...state.profile, avatar: { ...state.profile.avatar, ...avatarUpdates } }
      })),

      updateStats: (kills, score, flightTime) => set((state) => ({
        profile: {
          ...state.profile,
          stats: {
            totalKills: state.profile.stats.totalKills + kills,
            highScore: Math.max(state.profile.stats.highScore, score),
            flightTimeSeconds: state.profile.stats.flightTimeSeconds + flightTime,
          },
        }
      })),

      claimDailyReward: () => {
        const { profile } = get();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - profile.lastLoginTimestamp >= oneDay) {
          set({ profile: { ...profile, credits: profile.credits + 500, lastLoginTimestamp: now } });
          return true;
        }
        return false;
      },

      buyUpgrade: (upgradeId, cost) => {
        const { profile } = get();
        if (profile.credits >= cost) {
          set({ 
            profile: { 
              ...profile, 
              credits: profile.credits - cost,
              upgrades: {
                ...profile.upgrades,
                [upgradeId]: (profile.upgrades[upgradeId] || 0) + 1
              }
            } 
          });
          return true;
        }
        return false;
      },

      updateBountyProgress: (updates) => set((state) => {
        const { profile } = state;
        let creditsGained = 0;
        let completedCount = profile.bountiesCompleted;
        
        const newBounties = profile.bounties.map(b => {
          if (b.progress >= b.target) return b; // already complete
          
          const added = updates[b.type];
          if (added) {
            const newProgress = Math.min(b.target, b.progress + added);
            if (newProgress >= b.target && b.progress < b.target) {
              // Just completed!
              creditsGained += b.reward;
              completedCount++;
            }
            return { ...b, progress: newProgress };
          }
          return b;
        });

        // Replace completed bounties automatically
        const replacedBounties = newBounties.map(b => {
          if (b.progress >= b.target) return generateBounty(completedCount);
          return b;
        });

        if (creditsGained > 0 || updates) {
          return {
            profile: {
              ...profile,
              credits: profile.credits + creditsGained,
              bounties: replacedBounties,
              bountiesCompleted: completedCount
            }
          };
        }
        return state;
      }),

      replaceBounty: (bountyId) => set((state) => {
        const bounties = state.profile.bounties.map(b => 
          b.id === bountyId ? generateBounty(state.profile.bountiesCompleted) : b
        );
        return { profile: { ...state.profile, bounties } };
      }),

      skipBounty: (bountyId) => {
        const { profile } = get();
        const skipCost = 500;
        if (profile.credits >= skipCost) {
          set({
            profile: {
              ...profile,
              credits: profile.credits - skipCost,
              bounties: profile.bounties.map(b => 
                b.id === bountyId ? generateBounty(profile.bountiesCompleted) : b
              )
            }
          });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'stellar-drift-game-data', // zustand native persist
    }
  )
);
