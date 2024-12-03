import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event';
import { LazyStore } from '@tauri-apps/plugin-store';

/** Represents an audio file with its metadata */
interface AudioFile {
  path: string;
  name: string;
  created: number;
  modified: number;
  size: number;
}

/** Information about a folder containing audio files */
interface FolderInfo {
  path: string;
  files: AudioFile[];
}

/** Context interface for folder management */
interface FolderContextType {
  /** Currently selected folder path */
  currentFolder: string | null;
  /** List of audio files in the current folder */
  audioFiles: AudioFile[];
  /** Loading state for folder operations */
  isLoading: boolean;
  /** Opens a folder selection dialog */
  selectFolder: () => Promise<void>;
  /** Refreshes the current folder's content */
  refreshFolder: () => Promise<void>;
}

/** Store instance for folder persistence */
const store = new LazyStore('settings.json');

const FolderContext = createContext<FolderContextType | null>(null);

/** Hook to access the folder context */
export function useFolderContext() {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolderContext must be used within a FolderProvider');
  }
  return context;
}

/** Provider component for folder management */
export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /** Load saved folder on mount */
  useEffect(() => {
    const loadSavedFolder = async () => {
      try {
        const savedFolder = await store.get<string>('folder');
        if (savedFolder) {
          setCurrentFolder(savedFolder);
        }
      } catch (error) {
        console.error('Failed to load saved folder:', error);
      }
    };
    loadSavedFolder();
  }, []);

  /** Save folder when it changes */
  useEffect(() => {
    const saveFolder = async () => {
      try {
        await store.set('folder', currentFolder);
        await store.save();
      } catch (error) {
        console.error('Failed to save folder:', error);
      }
    };

    if (currentFolder) {
      saveFolder();
      refreshFolder();
      setupFolderWatcher();
    }
  }, [currentFolder]);

  /**
   * Opens a native folder selection dialog and updates the current folder
   * @throws Error if folder selection fails
   */
  async function selectFolder() {
    try {
      const selectedPath = await invoke<string>('select_folder');
      setCurrentFolder(selectedPath);
    } catch (error) {
      console.error('Failed to select folder:', error);
      throw error;
    }
  }

  /**
   * Refreshes the content of the current folder
   * @throws Error if folder scanning fails
   */
  async function refreshFolder() {
    if (!currentFolder) return;

    setIsLoading(true);
    try {
      const info = await invoke<FolderInfo>('scan_folder', { path: currentFolder });
      setAudioFiles(info.files);
    } catch (error) {
      console.error('Failed to scan folder:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Sets up a file system watcher for the current folder
   * @throws Error if watcher setup fails
   */
  async function setupFolderWatcher() {
    if (!currentFolder) return;

    try {
      await invoke('watch_folder', { path: currentFolder });
      await listen('folder-change', () => {
        refreshFolder();
      });
    } catch (error) {
      console.error('Failed to setup folder watcher:', error);
      throw error;
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
