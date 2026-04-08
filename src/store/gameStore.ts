import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, AvatarConfig } from './types';
import { SHIPS } from './data';

interface GameState {
  profile: UserProfile;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  unlockShip: (shipId: string) => void;
  equipShip: (shipId: string) => void;
  unlockGalaxy: (galaxyId: string) => void;
  updateAvatar: (avatar: Partial<AvatarConfig>) => void;
  updateStats: (kills: number, score: number, flightTime: number) => void;
  claimDailyReward: () => boolean; // returns true if claimed
}

const DEFAULT_PROFILE: UserProfile = {
  credits: 0,
  currentShipId: SHIPS[0].id,
  unlockedShipIds: [SHIPS[0].id],
  unlockedGalaxies: ['milky_way'],
  avatar: {
    suit: 'standard',
    visor: 'clear',
    accessory: 'none',
    suitColor: '#00e8ff'
  },
  stats: {
    totalKills: 0,
    highScore: 0,
    flightTimeSeconds: 0
  },
  lastLoginTimestamp: 0
};

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

      unlockShip: (shipId) => set((state) => {
        if (state.profile.unlockedShipIds.includes(shipId)) return state;
        return {
          profile: {
            ...state.profile,
            unlockedShipIds: [...state.profile.unlockedShipIds, shipId]
          }
        };
      }),

      equipShip: (shipId) => set((state) => {
        if (!state.profile.unlockedShipIds.includes(shipId)) return state;
        return { profile: { ...state.profile, currentShipId: shipId } };
      }),

      unlockGalaxy: (galaxyId) => set((state) => {
        if (state.profile.unlockedGalaxies.includes(galaxyId)) return state;
        return {
          profile: {
            ...state.profile,
            unlockedGalaxies: [...state.profile.unlockedGalaxies, galaxyId]
          }
        };
      }),

      updateAvatar: (avatarUpdates) => set((state) => ({
        profile: {
          ...state.profile,
          avatar: { ...state.profile.avatar, ...avatarUpdates }
        }
      })),

      updateStats: (kills, score, flightTime) => set((state) => ({
        profile: {
          ...state.profile,
          stats: {
            totalKills: state.profile.stats.totalKills + kills,
            highScore: Math.max(state.profile.stats.highScore, score),
            flightTimeSeconds: state.profile.stats.flightTimeSeconds + flightTime
          }
        }
      })),

      claimDailyReward: () => {
        const { profile } = get();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - profile.lastLoginTimestamp >= oneDay) {
          set({
            profile: {
              ...profile,
              credits: profile.credits + 500,
              lastLoginTimestamp: now
            }
          });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'stellar-drift-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
