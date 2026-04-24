/**
 * Game Save Management Utilities Component
 * Provides functions for backup, restore, export, and import operations
 */

import { useGameStore, DEFAULT_PROFILE } from './gameStore';
import { 
  createBackup, 
  restoreFromBackup, 
  exportGameData, 
  importGameData,
  clearMainSave,
  getBackups,
  getStorageUsed
} from './localStorage';

export interface SaveOperation {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Create a backup of current game state
 */
export const createSaveBackup = (slotNumber: 1 | 2 | 3 = 1): SaveOperation => {
  const { profile } = useGameStore.getState();
  const success = createBackup(profile, slotNumber);
  
  return {
    success,
    message: success 
      ? `Backup created in slot ${slotNumber}` 
      : `Failed to create backup in slot ${slotNumber}`,
  };
};

/**
 * Restore game from a backup slot
 */
export const restoreSaveBackup = (slotNumber: 1 | 2 | 3): SaveOperation => {
  const save = restoreFromBackup(slotNumber);
  
  if (!save) {
    return {
      success: false,
      message: `No backup found in slot ${slotNumber}`,
    };
  }

  try {
    // Restore the profile to the game store
    const { profile: currentProfile } = useGameStore.getState();
    useGameStore.setState({ profile: save.profile });
    
    return {
      success: true,
      message: `Restored from backup slot ${slotNumber}`,
      data: save,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to restore from backup slot ${slotNumber}`,
    };
  }
};

/**
 * Export current game save as JSON string
 */
export const exportCurrentSave = (): SaveOperation => {
  try {
    const { profile } = useGameStore.getState();
    const json = exportGameData(profile);
    
    return {
      success: true,
      message: 'Save exported successfully',
      data: json,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to export save',
    };
  }
};

/**
 * Import game save from JSON string
 */
export const importSaveFromJSON = (jsonString: string): SaveOperation => {
  try {
    const save = importGameData(jsonString);
    
    if (!save) {
      return {
        success: false,
        message: 'Invalid save file format',
      };
    }

    // Restore the profile
    useGameStore.setState({ profile: save.profile });
    
    return {
      success: true,
      message: 'Save imported successfully',
      data: save,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import save file',
    };
  }
};

/**
 * Reset game progress (dangerous operation - should require confirmation)
 */
export const resetGameProgress = (): SaveOperation => {
  try {
    const success = clearMainSave();
    
    if (success) {
      // Reset store to default state
      useGameStore.setState({ 
        profile: DEFAULT_PROFILE
      });
      
      return {
        success: true,
        message: 'Game progress reset successfully',
      };
    }
    
    return {
      success: false,
      message: 'Failed to reset game progress',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error resetting game progress',
    };
  }
};

/**
 * Download save file to user's computer
 */
export const downloadSaveFile = (filename: string = 'stellar-drift-save.json'): SaveOperation => {
  try {
    const { profile } = useGameStore.getState();
    const json = exportGameData(profile);
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: `Save file downloaded as ${filename}`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to download save file',
    };
  }
};

/**
 * Upload and import save file from user's computer
 */
export const uploadSaveFile = (file: File): Promise<SaveOperation> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const save = importGameData(content);
          
          if (!save) {
            resolve({
              success: false,
              message: 'Invalid save file format',
            });
            return;
          }

          useGameStore.setState({ profile: save.profile });
          
          resolve({
            success: true,
            message: 'Save file imported successfully',
            data: save,
          });
        } catch (error) {
          resolve({
            success: false,
            message: 'Error reading save file',
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read file',
        });
      };
      
      reader.readAsText(file);
    } catch (error) {
      resolve({
        success: false,
        message: 'Error uploading save file',
      });
    }
  });
};

/**
 * Get information about all backups
 */
export const getBackupInfo = () => {
  return getBackups();
};

/**
 * Get storage usage information
 */
export const getStorageInfo = () => {
  return {
    usedKB: getStorageUsed(),
    backups: getBackups(),
  };
};
