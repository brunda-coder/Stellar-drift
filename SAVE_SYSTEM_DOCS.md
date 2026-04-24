# Local Save Data Implementation Guide

## Overview

The Stellar Drift game now has a complete local save system that automatically persists game data to the player's browser.

## Architecture

### Components

1. **localStorage.ts** - Core local storage management
   - Handles saving/loading game data
   - Manages 3 backup slots
   - Export/import functionality
   - Settings persistence

2. **saveManager.ts** - Business logic layer
   - High-level operations for backups
   - Import/export operations
   - Reset functionality
   - Storage information retrieval

3. **SaveManager.tsx** - UI Component
   - User-friendly interface for save management
   - Backup slot management
   - File upload/download
   - Storage monitoring

4. **gameStore.ts** - Zustand store with persistence
   - Already configured with `persist` middleware
   - Automatically saves to localStorage
   - No additional code needed

## How Data Persistence Works

### Automatic Saving

```
User Action → Zustand Action → Store Updates → Auto-save to localStorage
```

- Every game action (earning credits, unlocking ships, etc.) updates the Zustand store
- The persist middleware automatically saves to localStorage
- Happens instantly - no noticeable performance impact

### Automatic Loading

```
App Start → Load from localStorage → Restore game state → Ready to play
```

- When the game loads, Zustand checks for existing data in localStorage
- If found, restores the previous game state
- If not found, uses default/initial state

## Storage Details

### Data Structure

```typescript
{
  // Game Profile
  username: string
  credits: number
  currentShipId: string
  unlockedShipIds: string[]
  unlockedGalaxies: string[]
  avatar: AvatarConfig
  stats: {
    totalKills: number
    highScore: number
    flightTimeSeconds: number
  }
  upgrades: {
    hullPlating: number
    energyCore: number
    magnetRange: number
    overchargeDuration: number
    adrenalineDecay: number
  }
  bounties: Bounty[]
  bountiesCompleted: number
  lastLoginTimestamp: number
}
```

### Storage Locations

- **Primary**: `stellar-drift-game-data` (~5-50KB)
- **Backup Slot 1**: `stellar-drift-backup-1`
- **Backup Slot 2**: `stellar-drift-backup-2`
- **Backup Slot 3**: `stellar-drift-backup-3`
- **Settings**: `stellar-drift-settings` (~1KB)

**Total Storage**: Usually <200KB out of 5-10MB available

## Integration Examples

### Using in Components

```typescript
import { SaveManager } from '@/components/SaveManager';

export function ProfilePage() {
  const handleSaveAction = (message: string, success: boolean) => {
    console.log(message);
  };

  return (
    <div>
      <h1>Profile</h1>
      <SaveManager onAction={handleSaveAction} />
    </div>
  );
}
```

### Manual Backup Creation

```typescript
import { createSaveBackup, restoreSaveBackup } from '@/store/saveManager';

// Create backup
const result = createSaveBackup(1); // Slot 1, 2, or 3
if (result.success) {
  console.log('Backup created!');
}

// Restore backup
const restore = restoreSaveBackup(1);
if (restore.success) {
  console.log('Save restored!');
}
```

### Exporting Save Files

```typescript
import { downloadSaveFile, uploadSaveFile } from '@/store/saveManager';

// Export current save
const export_result = downloadSaveFile('my-save.json');

// Import save file
const file: File = ...;
const import_result = await uploadSaveFile(file);
```

## Features

### For Players

✅ **Automatic Saving** - Progress saved after every action
✅ **Multiple Backups** - 3 save slots for different save states
✅ **File Download** - Export save as JSON for external backup
✅ **File Upload** - Restore from previously downloaded save
✅ **Storage Monitoring** - See how much space saves use
✅ **Reset Option** - Start fresh if desired
✅ **Settings Persistence** - Audio/graphics preferences saved

### For Developers

✅ **TypeScript Support** - Full type safety
✅ **Error Handling** - Graceful failures
✅ **Logging** - Console errors for debugging
✅ **Zustand Integration** - Zero additional setup needed
✅ **Modular** - Each function can be used independently

## User Experience Flow

### First Time Playing

1. App loads
2. localStorage checked - no data found
3. Default profile loaded
4. Player starts with starter credits and default ship
5. Every action auto-saves

### Returning Player

1. App loads
2. localStorage checked - previous save found
3. Previous progress restored
4. Player continues where they left off

### Creating Backup Before Risk

1. Player navigates to profile/settings
2. Clicks "Save" button on backup slot
3. Current progress backed up
4. Can now safely attempt risky purchases/upgrades
5. If something goes wrong, click "Load" to restore

### Emergency Recovery

1. Player accidentally resets or loses progress
2. If they have a backup slot, click "Load" from that slot
3. If all slots empty, they can upload a previously downloaded save
4. Progress restored!

## Browser Compatibility

| Browser | Support | LocalStorage |
|---------|---------|--------------|
| Chrome  | ✅ Full | ~10MB        |
| Firefox | ✅ Full | ~10MB        |
| Safari  | ✅ Full | ~5MB         |
| Edge    | ✅ Full | ~10MB        |
| Mobile  | ✅ Full | Device limit |

**Note**: LocalStorage is disabled in private/incognito mode on some browsers.

## Troubleshooting

### Save not loading on app restart

**Problem**: Player closes browser and reopens, progress is gone.

**Causes**:
- Browser set to clear data on exit
- Private/incognito mode
- LocalStorage disabled
- Browser doesn't support LocalStorage

**Solution**: 
- Use backup export feature
- Download save file for backup

### Storage quota exceeded

**Problem**: Error message about storage limit.

**Cause**: Browser storage is full (rare).

**Solution**:
- Clear browser cache
- Use backup export feature
- Delete old saves

### Import fails with "Invalid file"

**Problem**: Can't upload saved file.

**Causes**:
- File is corrupted
- File is not a valid JSON
- File from different game/version

**Solution**:
- Download save again with export feature
- Check file is valid JSON

## API Reference

### localStorage.ts

```typescript
// Save Operations
saveGameData(profile: UserProfile): boolean
loadGameData(): GameSave | null

// Backup Operations
createBackup(profile: UserProfile, slot: 1|2|3): boolean
restoreFromBackup(slot: 1|2|3): GameSave | null
getBackups(): Array<{slot: number, timestamp: number, exists: boolean}>

// Import/Export
exportGameData(profile: UserProfile): string
importGameData(jsonString: string): GameSave | null

// Management
clearAllGameData(): boolean
clearMainSave(): boolean
getStorageUsed(): string

// Settings
saveSettings(settings: Partial<GameSettings>): boolean
loadSettings(): GameSettings

// Initialization
initializeStorage(): void
```

### saveManager.ts

```typescript
// High-level operations
createSaveBackup(slot?: 1|2|3): SaveOperation
restoreSaveBackup(slot: 1|2|3): SaveOperation
exportCurrentSave(): SaveOperation
importSaveFromJSON(json: string): SaveOperation
resetGameProgress(): SaveOperation

// File operations
downloadSaveFile(filename?: string): SaveOperation
uploadSaveFile(file: File): Promise<SaveOperation>

// Information
getBackupInfo(): Array<{slot: number, timestamp: number, exists: boolean}>
getStorageInfo(): {usedKB: string, backups: Array<...>}
```

## Testing Checklist

- [ ] Game saves after earning credits
- [ ] Game saves after unlocking ship
- [ ] Game saves after completing bounty
- [ ] Game saves after changing settings
- [ ] Backup slot saves correctly
- [ ] Backup slot loads correctly
- [ ] Export creates valid JSON file
- [ ] Import restores valid JSON file
- [ ] Storage info shows correct usage
- [ ] Reset clears all data
- [ ] Progress persists after page refresh
- [ ] Works in different browsers
- [ ] Works on mobile devices

## Future Enhancements

Potential improvements for future versions:

1. **Cloud Sync** - Optional account-based save sync
2. **Auto-Backups** - Automatic daily backups
3. **Save Slots UI** - Visual save preview/thumbnails
4. **Compression** - Compress saves to save space
5. **Encryption** - Encrypt sensitive save data
6. **Version Migration** - Handle game updates to save format
7. **Share Saves** - Share save codes with other players

---

**Implementation Date**: 2024
**Game**: Stellar Drift
**Storage System**: Browser LocalStorage via Zustand Persist Middleware
