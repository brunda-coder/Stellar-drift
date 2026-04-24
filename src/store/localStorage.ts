/**
 * Local Storage Management for Stellar Drift
 * Handles saving, loading, and managing game data persistence
 */

import type { UserProfile } from './types';

const STORAGE_KEYS = {
  GAME_DATA: 'stellar-drift-game-data',
  BACKUP_SLOT_1: 'stellar-drift-backup-1',
  BACKUP_SLOT_2: 'stellar-drift-backup-2',
  BACKUP_SLOT_3: 'stellar-drift-backup-3',
  SETTINGS: 'stellar-drift-settings',
} as const;

export interface GameSave {
  timestamp: number;
  version: string;
  profile: UserProfile;
}

export interface GameSettings {
  volume: number;
  masterVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
}

const DEFAULT_SETTINGS: GameSettings = {
  volume: 0.7,
  masterVolume: 0.8,
  musicEnabled: true,
  sfxEnabled: true,
  graphicsQuality: 'high',
};

/**
 * Save game data to primary storage location
 */
export const saveGameData = (profile: UserProfile): boolean => {
  try {
    const save: GameSave = {
      timestamp: Date.now(),
      version: '1.0.0',
      profile,
    };
    localStorage.setItem(STORAGE_KEYS.GAME_DATA, JSON.stringify(save));
    return true;
  } catch (error) {
    console.error('Failed to save game data:', error);
    return false;
  }
};

/**
 * Load game data from primary storage location
 */
export const loadGameData = (): GameSave | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_DATA);
    if (!data) return null;
    return JSON.parse(data) as GameSave;
  } catch (error) {
    console.error('Failed to load game data:', error);
    return null;
  }
};

/**
 * Create a backup of current game data to one of three backup slots
 */
export const createBackup = (profile: UserProfile, slotNumber: 1 | 2 | 3 = 1): boolean => {
  try {
    const slotKey = STORAGE_KEYS[`BACKUP_SLOT_${slotNumber}`];
    const save: GameSave = {
      timestamp: Date.now(),
      version: '1.0.0',
      profile,
    };
    localStorage.setItem(slotKey, JSON.stringify(save));
    return true;
  } catch (error) {
    console.error(`Failed to create backup slot ${slotNumber}:`, error);
    return false;
  }
};

/**
 * Restore game data from a backup slot
 */
export const restoreFromBackup = (slotNumber: 1 | 2 | 3): GameSave | null => {
  try {
    const slotKey = STORAGE_KEYS[`BACKUP_SLOT_${slotNumber}`];
    const data = localStorage.getItem(slotKey);
    if (!data) return null;
    return JSON.parse(data) as GameSave;
  } catch (error) {
    console.error(`Failed to restore from backup slot ${slotNumber}:`, error);
    return null;
  }
};

/**
 * Get all available backups with metadata
 */
export const getBackups = (): Array<{ slot: number; timestamp: number; exists: boolean }> => {
  return [1, 2, 3].map((slot) => {
    const slotKey = STORAGE_KEYS[`BACKUP_SLOT_${slot}`];
    const data = localStorage.getItem(slotKey);
    if (!data) {
      return { slot, timestamp: 0, exists: false };
    }
    try {
      const save = JSON.parse(data) as GameSave;
      return { slot, timestamp: save.timestamp, exists: true };
    } catch {
      return { slot, timestamp: 0, exists: false };
    }
  });
};

/**
 * Export game data as JSON file (for download)
 */
export const exportGameData = (profile: UserProfile): string => {
  const save: GameSave = {
    timestamp: Date.now(),
    version: '1.0.0',
    profile,
  };
  return JSON.stringify(save, null, 2);
};

/**
 * Import game data from JSON
 */
export const importGameData = (jsonString: string): GameSave | null => {
  try {
    const data = JSON.parse(jsonString) as GameSave;
    // Validate basic structure
    if (!data.profile || !data.timestamp) {
      throw new Error('Invalid save file format');
    }
    return data;
  } catch (error) {
    console.error('Failed to import game data:', error);
    return null;
  }
};

/**
 * Clear all game data including main save and backups
 */
export const clearAllGameData = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_DATA);
    localStorage.removeItem(STORAGE_KEYS.BACKUP_SLOT_1);
    localStorage.removeItem(STORAGE_KEYS.BACKUP_SLOT_2);
    localStorage.removeItem(STORAGE_KEYS.BACKUP_SLOT_3);
    return true;
  } catch (error) {
    console.error('Failed to clear game data:', error);
    return false;
  }
};

/**
 * Clear only the main game save
 */
export const clearMainSave = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_DATA);
    return true;
  } catch (error) {
    console.error('Failed to clear main save:', error);
    return false;
  }
};

/**
 * Get total storage used by Stellar Drift
 */
export const getStorageUsed = (): string => {
  let totalSize = 0;
  Object.values(STORAGE_KEYS).forEach((key) => {
    const item = localStorage.getItem(key);
    if (item) {
      totalSize += item.length;
    }
  });
  // Convert to KB
  return (totalSize / 1024).toFixed(2);
};

/**
 * Save game settings
 */
export const saveSettings = (settings: Partial<GameSettings>): boolean => {
  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

/**
 * Load game settings
 */
export const loadSettings = (): GameSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Initialize local storage - called on app startup
 */
export const initializeStorage = (): void => {
  try {
    // Check if storage is available
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
  } catch (error) {
    console.warn('Local Storage is not available:', error);
  }
};
