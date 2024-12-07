import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Beat } from '../types/Beat';
import { loadBeats } from '../services/beatLoader';
import { useSettings } from './SettingsContext';

interface BeatsContextType {
  beats: Beat[];
  isLoading: boolean;
  error: string | null;
  indexingProgress: { current: number; total: number; percentage: number } | null;
  isIndexing: boolean;
  refreshBeats: () => Promise<void>;
  loadMetadata: (beatId: string) => Promise<void>;
  updateBeat: (updatedBeat: Beat) => Promise<void>;
  loadBeatsWithProgress: (folders: string[]) => Promise<Beat[]>;
}

const BeatsContext = createContext<BeatsContextType | undefined>(undefined);

export function BeatsProvider({ children }: { children: React.ReactNode }) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexingProgress, setIndexingProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const { settings } = useSettings();

  const refreshBeats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIndexingProgress(null);
    setIsIndexing(true);

    try {
      const beatFolders = settings.beatFolders || [];
      const loadedBeats = await loadBeats(beatFolders, (progress) => {
        setIndexingProgress(progress);
      });

      setBeats(loadedBeats);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred while loading beats';
      setError(errorMessage);
      console.error('Error loading beats:', err);
    } finally {
      setIsLoading(false);
      setIsIndexing(false);
      setIndexingProgress({ current: 1, total: 1, percentage: 100 });
    }
  }, [settings.beatFolders]);

  const loadMetadata = useCallback(async (beatId: string) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat || beat.isMetadataLoaded) return;

    try {
      const updatedBeat = { ...beat, isMetadataLoaded: true };
      await updateBeat(updatedBeat);
    } catch (error) {
      console.error(`Error loading metadata for beat ${beat.name}:`, error);
    }
  }, [beats]);

  const updateBeat = useCallback(async (updatedBeat: Beat) => {
    setBeats(prevBeats => {
      const newBeats = prevBeats.map(beat => 
        beat.id === updatedBeat.id ? updatedBeat : beat
      );
      return newBeats;
    });
  }, []);

  const loadBeatsWithProgress = useCallback(async (folders: string[]) => {
    try {
      setIsIndexing(true);
      setIndexingProgress({ current: 0, total: 1, percentage: 0 });

      const beats = await loadBeats(folders, (progress) => {
        setIndexingProgress(progress);
      });

      setBeats(beats);
      setIsIndexing(false);
      setIndexingProgress({ current: 1, total: 1, percentage: 100 });

      return beats;
    } catch (error) {
      console.error('Error loading beats:', error);
      setIsIndexing(false);
      setIndexingProgress(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    refreshBeats();
  }, [refreshBeats]);

  const contextValue = {
    beats,
    isLoading,
    error,
    indexingProgress,
    isIndexing,
    refreshBeats,
    loadMetadata,
    updateBeat,
    loadBeatsWithProgress
  };

  return (
    <BeatsContext.Provider value={contextValue}>
      {children}
    </BeatsContext.Provider>
  );
}

export function useBeats() {
  const context = useContext(BeatsContext);
  if (context === undefined) {
    throw new Error('useBeats must be used within a BeatsProvider');
  }
  return context;
}
