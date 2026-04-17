import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, AvatarConfig } from './types';
import { SHIPS } from './data';

// Simple deterministic hash — good enough for a game's local profile PIN
function hashPassword(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

interface GameState {
  profile: UserProfile;
  isLoggedIn: boolean;
  // Auth
  register: (username: string, password: string) => { ok: boolean; error?: string };
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  // Credits
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  // Ships / galaxies
  unlockShip: (shipId: string) => void;
  equipShip: (shipId: string) => void;
  unlockGalaxy: (galaxyId: string) => void;
  // Avatar / stats
  updateAvatar: (avatar: Partial<AvatarConfig>) => void;
  updateStats: (kills: number, score: number, flightTime: number) => void;
  claimDailyReward: () => boolean;
}

const blankProfile = (username: string, passwordHash: string): UserProfile => ({
  username,
  passwordHash,
  credits: 500, // starter credits
  currentShipId: SHIPS[0].id,
  unlockedShipIds: [SHIPS[0].id],
  unlockedGalaxies: ['milky_way'],
  avatar: {
    suit: 'standard',
    visor: 'clear',
    accessory: 'none',
    suitColor: '#00e8ff',
  },
  stats: {
    totalKills: 0,
    highScore: 0,
    flightTimeSeconds: 0,
  },
  lastLoginTimestamp: Date.now(),
});

// Storage key per username so multiple pilots can coexist
const profileKey = (username: string) => `stellar-drift-profile-${username.toLowerCase()}`;
const ALL_USERS_KEY = 'stellar-drift-users';

function getAllUsers(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '{}'); }
  catch { return {}; }
}
function saveAllUsers(users: Record<string, string>) {
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
}
function loadProfile(username: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(profileKey(username));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveProfile(profile: UserProfile) {
  localStorage.setItem(profileKey(profile.username), JSON.stringify(profile));
}

// Stub profile for the persist store (overwritten on login)
const STUB_PROFILE: UserProfile = blankProfile('', '');

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      profile: STUB_PROFILE,
      isLoggedIn: false,

      register: (username, password) => {
        const trimmed = username.trim();
        if (trimmed.length < 3) return { ok: false, error: 'Username must be at least 3 characters' };
        if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters' };
        const users = getAllUsers();
        if (users[trimmed.toLowerCase()]) return { ok: false, error: 'Username already taken' };
        const hash = hashPassword(password);
        users[trimmed.toLowerCase()] = hash;
        saveAllUsers(users);
        const profile = blankProfile(trimmed, hash);
        saveProfile(profile);
        set({ profile, isLoggedIn: true });
        return { ok: true };
      },

      login: (username, password) => {
        const trimmed = username.trim();
        const users = getAllUsers();
        const storedHash = users[trimmed.toLowerCase()];
        if (!storedHash) return { ok: false, error: 'Pilot not found — register first' };
        if (storedHash !== hashPassword(password)) return { ok: false, error: 'Incorrect access code' };
        const profile = loadProfile(trimmed) ?? blankProfile(trimmed, storedHash);
        set({ profile, isLoggedIn: true });
        return { ok: true };
      },

      logout: () => {
        const { profile } = get();
        saveProfile(profile); // save before logout
        set({ profile: STUB_PROFILE, isLoggedIn: false });
      },

      addCredits: (amount) => set((state) => {
        const p = { ...state.profile, credits: state.profile.credits + amount };
        saveProfile(p);
        return { profile: p };
      }),

      spendCredits: (amount) => {
        const { profile } = get();
        if (profile.credits >= amount) {
          const p = { ...profile, credits: profile.credits - amount };
          saveProfile(p);
          set({ profile: p });
          return true;
        }
        return false;
      },

      unlockShip: (shipId) => set((state) => {
        if (state.profile.unlockedShipIds.includes(shipId)) return state;
        const p = { ...state.profile, unlockedShipIds: [...state.profile.unlockedShipIds, shipId] };
        saveProfile(p);
        return { profile: p };
      }),

      equipShip: (shipId) => set((state) => {
        if (!state.profile.unlockedShipIds.includes(shipId)) return state;
        const p = { ...state.profile, currentShipId: shipId };
        saveProfile(p);
        return { profile: p };
      }),

      unlockGalaxy: (galaxyId) => set((state) => {
        if (state.profile.unlockedGalaxies.includes(galaxyId)) return state;
        const p = { ...state.profile, unlockedGalaxies: [...state.profile.unlockedGalaxies, galaxyId] };
        saveProfile(p);
        return { profile: p };
      }),

      updateAvatar: (avatarUpdates) => set((state) => {
        const p = { ...state.profile, avatar: { ...state.profile.avatar, ...avatarUpdates } };
        saveProfile(p);
        return { profile: p };
      }),

      updateStats: (kills, score, flightTime) => set((state) => {
        const p = {
          ...state.profile,
          stats: {
            totalKills: state.profile.stats.totalKills + kills,
            highScore: Math.max(state.profile.stats.highScore, score),
            flightTimeSeconds: state.profile.stats.flightTimeSeconds + flightTime,
          },
        };
        saveProfile(p);
        return { profile: p };
      }),

      claimDailyReward: () => {
        const { profile } = get();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - profile.lastLoginTimestamp >= oneDay) {
          const p = { ...profile, credits: profile.credits + 500, lastLoginTimestamp: now };
          saveProfile(p);
          set({ profile: p });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'stellar-drift-auth', // only persist logged-in state
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, profile: state.profile }),
    }
  )
);
