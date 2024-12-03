import { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import { Track } from '../types/Track';
import { convertFileSrc } from '@tauri-apps/api/core';

/** Interface defining the audio cache context methods */
interface AudioCacheContextType {
  /** Preloads a track into the cache for faster playback */
  preloadTrack: (track: Track) => void;
  /** Returns the cached URL for a track if available, otherwise returns the converted file URL */
  getCachedUrl: (track: Track) => string;
}

const AudioCacheContext = createContext<AudioCacheContextType | null>(null);

/** Hook to access the audio cache context */
export const useAudioCache = () => {
  const context = useContext(AudioCacheContext);
  if (!context) {
    throw new Error('useAudioCache must be used within an AudioCacheProvider');
  }
  return context;
};

/** Provider component for audio caching functionality */
export const AudioCacheProvider = ({ children }: { children: React.ReactNode }) => {
  const audioCache = useRef<Map<string, string>>(new Map());

  /** 
   * Preloads a track by fetching its audio data and storing it as a blob URL
   * @param track - The track to preload
   */
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

  /**
   * Returns the cached URL for a track if available
   * @param track - The track to get the URL for
   * @returns The cached blob URL or converted file URL
   */
  const getCachedUrl = useCallback((track: Track) => {
    if (!track.path) return '';
    
    const cachedUrl = audioCache.current.get(track.path);
    if (cachedUrl) return cachedUrl;

    return convertFileSrc(track.path);
  }, []);

  const cleanup = useCallback(() => {
    audioCache.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    audioCache.current.clear();
  }, []);

  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <AudioCacheContext.Provider value={{ preloadTrack, getCachedUrl }}>
      {children}
    </AudioCacheContext.Provider>
  );
};
