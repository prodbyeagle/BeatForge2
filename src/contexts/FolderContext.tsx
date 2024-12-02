import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event';

interface AudioFile {
  path: string;
  name: string;
  created: number;
  modified: number;
  size: number;
}

interface FolderInfo {
  path: string;
  files: AudioFile[];
}

interface FolderContextType {
  currentFolder: string | null;
  audioFiles: AudioFile[];
  isLoading: boolean;
  selectFolder: () => Promise<void>;
  refreshFolder: () => Promise<void>;
}

const FolderContext = createContext<FolderContextType | null>(null);

export function useFolderContext() {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolderContext must be used within a FolderProvider');
  }
  return context;
}

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [currentFolder, setCurrentFolder] = useState<string | null>(() => {
    const saved = localStorage.getItem('beatforge_folder');
    return saved ? JSON.parse(saved) : null;
  });
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentFolder) {
      localStorage.setItem('beatforge_folder', JSON.stringify(currentFolder));
      refreshFolder();
      setupFolderWatcher();
    }
  }, [currentFolder]);

  async function selectFolder() {
    try {
      const selectedPath = await invoke<string>('select_folder');
      setCurrentFolder(selectedPath);
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  }

  async function refreshFolder() {
    if (!currentFolder) return;

    setIsLoading(true);
    try {
      const info = await invoke<FolderInfo>('scan_folder', { path: currentFolder });
      setAudioFiles(info.files);
    } catch (error) {
      console.error('Failed to scan folder:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function setupFolderWatcher() {
    if (!currentFolder) return;

    try {
      // Start watching the folder
      await invoke('watch_folder', { path: currentFolder });

      // Listen for file system changes
      await listen('folder-change', () => {
        refreshFolder();
      });
    } catch (error) {
      console.error('Failed to setup folder watcher:', error);
    }
  }

  return (
    <FolderContext.Provider
      value={{
        currentFolder,
        audioFiles,
        isLoading,
        selectFolder,
        refreshFolder,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
}
