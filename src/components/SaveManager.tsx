import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard';
import NeonButton from './ui/NeonButton';
import {
  createSaveBackup,
  restoreSaveBackup,
  exportCurrentSave,
  downloadSaveFile,
  uploadSaveFile,
  resetGameProgress,
  getBackupInfo,
  getStorageInfo,
} from '../store/saveManager';

interface SaveManagerProps {
  onAction?: (message: string, success: boolean) => void;
}

export const SaveManager: React.FC<SaveManagerProps> = ({ onAction }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backups, setBackups] = useState(getBackupInfo());
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());

  const showMessage = (msg: string, success: boolean = true) => {
    setMessage(msg);
    onAction?.(msg, success);
  };

  const handleCreateBackup = (slot: 1 | 2 | 3) => {
    setLoading(true);
    try {
      const result = createSaveBackup(slot);
      showMessage(result.message, result.success);
      setBackups(getBackupInfo());
      setStorageInfo(getStorageInfo());
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = (slot: 1 | 2 | 3) => {
    if (!confirm(`Restore from backup slot ${slot}? This will overwrite your current progress.`)) {
      return;
    }

    setLoading(true);
    try {
      const result = restoreSaveBackup(slot);
      showMessage(result.message, result.success);
      setBackups(getBackupInfo());
    } finally {
      setLoading(false);
    }
  };

  const handleExportSave = () => {
    setLoading(true);
    try {
      const result = downloadSaveFile();
      showMessage(result.message, result.success);
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showMessage('Please select a valid JSON save file', false);
      return;
    }

    setLoading(true);
    try {
      const result = await uploadSaveFile(file);
      showMessage(result.message, result.success);
      setBackups(getBackupInfo());
      setStorageInfo(getStorageInfo());
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetProgress = () => {
    if (!confirm('Are you sure? This will delete all your progress and cannot be undone! Consider creating a backup first.')) {
      return;
    }

    setLoading(true);
    try {
      const result = resetGameProgress();
      showMessage(result.message, result.success);
      setBackups(getBackupInfo());
      setStorageInfo(getStorageInfo());
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'No backup';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-3 rounded-lg text-sm ${
            message.includes('success') || message.includes('successfully')
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Storage Info */}
      <GlassCard className="p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">Storage Info</h3>
        <div className="text-sm text-gray-300">
          <p>Used: <span className="text-cyan-300">{storageInfo.usedKB} KB</span></p>
          <p className="text-xs text-gray-400 mt-1">Browser LocalStorage: ~5-10MB available</p>
        </div>
      </GlassCard>

      {/* Backup Slots */}
      <GlassCard className="p-4">
        <h3 className="text-cyan-400 font-semibold mb-3">Backup Slots</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((slot) => {
            const backup = backups.find((b) => b.slot === slot);
            const exists = backup?.exists;

            return (
              <div key={slot} className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    Slot {slot}: <span className="text-xs text-gray-400">{formatDate(backup?.timestamp || 0)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <NeonButton
                    size="sm"
                    onClick={() => handleCreateBackup(slot as 1 | 2 | 3)}
                    disabled={loading}
                    className="!px-2 !py-1 !text-xs"
                  >
                    Save
                  </NeonButton>
                  {exists && (
                    <NeonButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRestoreBackup(slot as 1 | 2 | 3)}
                      disabled={loading}
                      className="!px-2 !py-1 !text-xs"
                    >
                      Load
                    </NeonButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Import/Export */}
      <GlassCard className="p-4">
        <h3 className="text-cyan-400 font-semibold mb-3">Save File Management</h3>
        <div className="space-y-2">
          <NeonButton
            onClick={handleExportSave}
            disabled={loading}
            className="w-full !text-sm"
          >
            📥 Download Save File
          </NeonButton>

          <NeonButton
            onClick={handleImportClick}
            disabled={loading}
            variant="secondary"
            className="w-full !text-sm"
          >
            📤 Upload Save File
          </NeonButton>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelected}
            className="hidden"
          />

          <p className="text-xs text-gray-400 mt-2">
            💡 Tip: Download your save regularly as a backup!
          </p>
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="p-4 border-red-500/30 bg-red-500/10">
        <h3 className="text-red-400 font-semibold mb-3">Danger Zone</h3>
        <NeonButton
          onClick={handleResetProgress}
          disabled={loading}
          className="w-full !bg-red-600/80 hover:!bg-red-500 !text-sm"
        >
          🗑️ Reset All Progress
        </NeonButton>
        <p className="text-xs text-red-300/70 mt-2">
          This will delete all your progress. Create a backup first if you change your mind.
        </p>
      </GlassCard>
    </motion.div>
  );
};

export default SaveManager;
