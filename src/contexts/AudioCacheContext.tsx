import { createContext, useContext, useRef, useCallback } from 'react';
import { Track } from '../types/Track';
import { convertFileSrc } from '@tauri-apps/api/core';

interface AudioCacheContextType {
  preloadTrack: (track: Track) => void;
  getCachedUrl: (track: Track) => string;
}

const AudioCacheContext = createContext<AudioCacheContextType | null>(null);

export const useAudioCache = () => {
  const context = useContext(AudioCacheContext);
  if (!context) {
    throw new Error('useAudioCache must be used within an AudioCacheProvider');
  }
  return context;
};

export const AudioCacheProvider = ({ children }: { children: React.ReactNode }) => {
  // Use a Map to store blob URLs
  const audioCache = useRef<Map<string, string>>(new Map());

  const preloadTrack = useCallback(async (track: Track) => {
    if (!track.path || audioCache.current.has(track.path)) return;

    try {
      const fileUrl = convertFileSrc(track.path);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      audioCache.current.set(track.path, blobUrl);
    } catch (error) {
      console.error('Error preloading track:', error);
    }
  }, []);

  const getCachedUrl = useCallback((track: Track) => {
    if (!track.path) return '';
    
    // Return cached blob URL if available
    const cachedUrl = audioCache.current.get(track.path);
    if (cachedUrl) return cachedUrl;

    // Return converted file URL as fallback
    return convertFileSrc(track.path);
  }, []);

  // Clean up blob URLs when component unmounts
  useCallback(() => {
    audioCache.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    audioCache.current.clear();
  }, []);

  return (
    <AudioCacheContext.Provider value={{ preloadTrack, getCachedUrl }}>
      {children}
    </AudioCacheContext.Provider>
  );
};
