# Stellar Drift - Deployment Guide

## Permanent Web Address Setup

This guide explains how to deploy Stellar Drift to a permanent web address using GitHub Pages.

### Prerequisites

1. Node.js and npm installed
2. Git installed
3. GitHub account
4. Your Stellar-drift repository on GitHub

### Quick Deployment Steps

#### 1. **Initial Setup (One-time)**

Make sure your `package.json` has the deployment scripts:

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

Install gh-pages if not already installed:
```bash
npm install --save-dev gh-pages
```

#### 2. **Configure GitHub Repository**

- Go to your GitHub repository settings
- Navigate to "Pages" section
- Set the source to "Deploy from a branch"
- Select `gh-pages` branch
- Save

#### 3. **Deploy Your Game**

Run the deployment command:

```bash
npm run deploy
```

This will:
- Build your project with TypeScript and Vite
- Create a `dist` folder with optimized assets
- Push the dist folder contents to the `gh-pages` branch
- Make the game available at: `https://YOUR_USERNAME.github.io/Stellar-drift/`

#### 4. **Verify Deployment**

- Visit `https://YOUR_USERNAME.github.io/Stellar-drift/`
- Test the game functionality
- Check browser console for any errors

### Game Data Persistence

Your game data is automatically saved locally in the user's browser using LocalStorage.

#### How It Works

1. **Automatic Saving**: Game data (credits, ships, progress, stats) is automatically saved to LocalStorage after every action
2. **Automatic Loading**: When the game loads, it restores the user's last saved state
3. **Multiple Backups**: The game supports up to 3 backup slots for manual saves

#### LocalStorage Details

- **Primary Save**: `stellar-drift-game-data`
- **Backup Slots**: `stellar-drift-backup-1`, `stellar-drift-backup-2`, `stellar-drift-backup-3`
- **Settings**: `stellar-drift-settings`
- **Storage Limit**: ~5-10MB (browser dependent)
- **Persistence**: Data persists across browser sessions until user clears browser data

### Data Management Features

#### From Code (For Development)

```typescript
import { 
  saveGameData, 
  loadGameData, 
  createBackup, 
  restoreFromBackup,
  exportGameData,
  importGameData,
  clearAllGameData 
} from '@/store/localStorage';

// Save current profile
saveGameData(profile);

// Create backup
createBackup(profile, 1); // Slot 1, 2, or 3

// Restore from backup
const backup = restoreFromBackup(1);

// Export for download
const json = exportGameData(profile);

// Import from file
const restored = importGameData(jsonString);

// Clear everything
clearAllGameData();
```

#### From UI (Recommended)

Add these features to your profile/settings page:

- **Save Backup**: Create a backup before trying risky upgrades
- **Restore Backup**: Load a previous save from one of 3 slots
- **Export Save**: Download your save as a JSON file
- **Import Save**: Upload a previously exported save file
- **Clear Progress**: Start fresh with default stats

### Custom Domain (Optional)

To use a custom domain instead of github.io:

1. Create a `CNAME` file in the `public` folder with your domain
2. Add the domain to your GitHub Pages settings
3. Update DNS records at your domain registrar to point to GitHub Pages

### Continuous Deployment

For automatic deployments:

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Push to `main` branch - deployment happens automatically

### Troubleshooting

**Game doesn't load assets:**
- Ensure `vite.config.ts` has `base: '/Stellar-drift/'`

**Saves not persisting:**
- Check browser's LocalStorage is enabled
- Clear browser cache and reload
- Check browser console for errors

**Deployment fails:**
- Run `npm run build` locally to check for build errors
- Ensure gh-pages branch exists in GitHub
- Check GitHub Actions for deployment logs

**Custom domain not working:**
- Verify CNAME file is in dist folder after build
- Check DNS propagation (can take up to 24 hours)
- Verify GitHub Pages settings

### Accessing Your Live Game

Your game will be permanently available at:
```
https://YOUR_USERNAME.github.io/Stellar-drift/
```

Share this link with players! Their progress is automatically saved in their browser.

### Storage Space

Monitor your storage usage:
- Primary save: ~5-50KB depending on progress
- Each backup slot: ~5-50KB
- Settings: ~1KB
- Total: Usually under 200KB

### Backup Strategy

Recommended for players:
1. **Before major purchases**: Create backup in slot 1
2. **End of gaming session**: Create backup in slot 2
3. **Weekly**: Export save file to computer for security

### Security Notes

- Game data is stored locally - never transmitted to servers
- Player data is completely private and under their control
- Browser clearing data = game progress lost (use Export feature)
- No accounts or login required

---

**Game Deployment Date**: Deploy whenever ready with `npm run deploy`

**Next Steps**:
1. Test locally: `npm run dev`
2. Build: `npm run build`
3. Deploy: `npm run deploy`
4. Share URL: `https://YOUR_USERNAME.github.io/Stellar-drift/`
