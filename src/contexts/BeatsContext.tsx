import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Beat } from '../types/Beat';
import { loadBeats } from '../services/beatLoader';
import { useSettings } from './SettingsContext';

interface BeatsContextType {
  beats: Beat[];
  isLoading: boolean;
  error: string | null;
  refreshBeats: () => Promise<void>;
  loadMetadata: (beatId: string) => Promise<void>;
  updateBeat: (updatedBeat: Beat) => Promise<void>;
}

const BeatsContext = createContext<BeatsContextType | undefined>(undefined);

export function BeatsProvider({ children }: { children: React.ReactNode }) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const refreshBeats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const beatFolders = settings.beatFolders || [];
      const loadedBeats = await loadBeats(beatFolders);
      setBeats(loadedBeats);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unknown error occurred while loading beats';
      setError(errorMessage);
      console.error('Error loading beats:', err);
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    refreshBeats();
  }, [refreshBeats]);

  const contextValue = {
    beats,
    isLoading,
    error,
    refreshBeats,
    loadMetadata,
    updateBeat
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
