import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import { readDir, type DirEntry, readFile } from '@tauri-apps/plugin-fs';
import * as musicMetadata from 'music-metadata';
import { ulid } from 'ulid';

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.aiff', '.m4a', '.ogg'];

/**
 * Represents a directory entry with additional file metadata
 */
interface ExtendedDirEntry extends DirEntry {
  lastModified: number;
  size: number;
  path: string;
}

/**
 * Represents a music beat with its metadata and file information
 */
export interface Beat {
  id: string;
  name: string;
  title: string;
  path: string;
  artist?: string;
  album?: string;
  duration?: string;
  bpm?: number;
  key?: string;
  format: string;
  coverArt?: string;
  size: number;
  lastModified: number;
  isMetadataLoaded: boolean;
}

/**
 * Context interface for managing beats state and operations
 */
interface BeatsContextType {
  beats: Beat[];
  isLoading: boolean;
  error: string | null;
  refreshBeats: () => Promise<void>;
  loadMetadata: (beatId: string) => Promise<void>;
  updateBeat: (updatedBeat: Beat) => Promise<void>;
}

const BeatsContext = createContext<BeatsContextType | undefined>(undefined);
const beatStore = new LazyStore('beat-index.json');
const settingsStore = new LazyStore('settings.json');

const normalizePath = (path: string): string => {
  return path.replace(/\\/g, '/').toLowerCase();
};

/**
 * Extracts and processes metadata from an audio file
 * @param filePath - Absolute path to the audio file
 * @param format - Audio file format extension
 * @returns Promise containing the extracted metadata as a partial Beat object
 */
const extractMetadata = async (filePath: string, format: string): Promise<Partial<Beat>> => {
  if (!filePath) {
    throw new Error('File path is required for metadata extraction');
  }

  try {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const fileBuffer = await readFile(normalizedPath);

    const mimeTypes: { [key: string]: string } = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.flac': 'audio/flac',
      '.aiff': 'audio/aiff',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg'
    };

    const mimeType = mimeTypes[format.toLowerCase()] || `audio/${format.slice(1)}`;
    const metadata = await musicMetadata.parseBuffer(new Uint8Array(fileBuffer), { mimeType });

    let artist = '';
    if (metadata.common.artist && metadata.common.artist !== '') {
      artist = metadata.common.artist;
    }

    let coverArt = '';
    if (metadata.common.picture?.[0]) {
      const picture = metadata.common.picture[0];
      if (picture.data && picture.data.length > 0) {
        const rawData = picture.data instanceof Uint8Array
          ? picture.data
          : new Uint8Array(picture.data);

        let binary = '';
        rawData.forEach(byte => binary += String.fromCharCode(byte));
        const base64 = btoa(binary);

        if (base64) {
          const format = picture.format.startsWith('image/') ? picture.format : `image/${picture.format}`;
          coverArt = `data:${format};base64,${base64}`;
        }
      }
    }

    const duration = metadata.format.duration || 0;
    const title = metadata.common.title || "no title";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return {
      title,
      artist,
      album: metadata.common.album,
      duration: formattedDuration,
      coverArt
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a beat index entry with basic file information and metadata
 * @param entry - Directory entry containing file information
 * @param existingBeat - Optional existing beat data to preserve
 * @returns Promise containing the created Beat object or null if invalid
 */
const createBeatIndex = async (entry: ExtendedDirEntry, existingBeat?: Beat): Promise<Beat | null> => {
  if (!entry.name || entry.name.toLowerCase().endsWith('.flp')) {
    return null;
  }

  if (!entry.path) {
    return null;
  }

  const format = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(format)) {
    return null;
  }

  try {
    const metadata = await extractMetadata(entry.path, format);

    return {
      id: existingBeat?.id || ulid(),
      name: entry.name,
      title: metadata.title || "no title",
      path: entry.path,
      format: format,
      size: metadata.size || 0,
      lastModified: entry.lastModified || Date.now(),
      isMetadataLoaded: true,
      artist: metadata.artist || 'Unknown Artist',
      album: metadata.album || 'Unknown Album',
      duration: metadata.duration || '0:00',
      bpm: existingBeat?.bpm || 0,
      key: existingBeat?.key,
      coverArt: metadata.coverArt
    };
  } catch (error) {
    console.error(`Failed to extract metadata for ${entry.name}:`, error);
    return {
      id: existingBeat?.id || ulid(),
      name: entry.name,
      title: entry.name.replace(/\.[^/.]+$/, ''),
      path: entry.path,
      format: format,
      size: entry.size || 0,
      lastModified: entry.lastModified || Date.now(),
      isMetadataLoaded: false,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: '0:00',
      bpm: existingBeat?.bpm || 0,
      key: existingBeat?.key,
      coverArt: undefined
    };
  }
};

/**
 * Loads and processes beats from specified folders
 * @param folders - Array of folder paths to scan for beats
 * @returns Promise containing array of loaded Beat objects
 */
const loadBeats = async (folders: string[]): Promise<Beat[]> => {
  let allBeats: Beat[] = [];
  const loadErrors: string[] = [];

  let existingBeats: Beat[] = [];
  try {
    const indexedBeats = await beatStore.get<Beat[]>('beats');
    console.log('Loaded beats from store:', indexedBeats);
    if (indexedBeats && indexedBeats.length > 0) {
      const normalizedFolders = folders.map(f => normalizePath(f));
      existingBeats = indexedBeats.filter(beat =>
        normalizedFolders.some(folder => normalizePath(beat.path).startsWith(folder))
      );
      console.log('Filtered existing beats:', existingBeats);
    }
  } catch (error) {
    console.warn('Could not load beat index:', error);
  }

  const existingBeatsMap = new Map(
    existingBeats.map(beat => [normalizePath(beat.path), beat])
  );

  for (const folder of folders) {
    try {
      let entries: ExtendedDirEntry[];
      try {
        const normalizedPath = folder.replace(/\\/g, '/');
        entries = await readDir(normalizedPath) as ExtendedDirEntry[];
        entries = entries.map(entry => ({
          ...entry,
          path: `${normalizedPath}/${entry.name}`
        }));
      } catch (accessError) {
        console.error(`Cannot access folder ${folder}:`, accessError);
        loadErrors.push(`Cannot access folder ${folder}: ${accessError instanceof Error ? accessError.message : 'Unknown error'}`);
        continue;
      }

      const processEntries = async (entries: ExtendedDirEntry[]) => {
        for (const entry of entries) {
          if (entry.isFile) {
            try {
              const existingBeat = existingBeatsMap.get(normalizePath(entry.path));
              if (existingBeat) {
                allBeats.push({
                  ...existingBeat,
                  size: entry.size || existingBeat.size,
                  lastModified: entry.lastModified || existingBeat.lastModified,
                  bpm: existingBeat.bpm || 0
                });
              } else {
                const beat = await createBeatIndex(entry, existingBeat);
                if (beat) {
                  allBeats.push(beat);
                }
              }
            } catch (error) {
              console.error(`Failed to index beat ${entry.name}:`, error);
            }
          }

          if (entry.isDirectory) {
            try {
              const subEntries = await readDir(entry.path) as ExtendedDirEntry[];
              await processEntries(subEntries);
            } catch (subDirError) {
              console.error(`Cannot access subdirectory ${entry.path}:`, subDirError);
              loadErrors.push(`Cannot access subdirectory ${entry.path}: ${subDirError instanceof Error ? subDirError.message : 'Unknown error'}`);
            }
          }
        }
      };

      await processEntries(entries);
    } catch (error) {
      console.error(`Error processing folder ${folder}:`, error);
      loadErrors.push(`Unexpected error reading folder ${folder}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  try {
    console.log('Saving beats to store:', allBeats);
    await beatStore.set('beats', allBeats);
    await beatStore.save();
    console.log('Beats saved successfully');
  } catch (error) {
    console.error('Could not save beat index:', error);
  }

  if (loadErrors.length > 0) {
    console.error(`Encountered ${loadErrors.length} errors while loading beats:`, loadErrors);
    throw new Error(`Encountered ${loadErrors.length} errors while loading beats:\n${loadErrors.join('\n')}`);
  }

  return allBeats;
};

/**
 * Provider component for managing beats state and operations
 */
export function BeatsProvider({ children }: { children: ReactNode }) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetadata = useCallback(async (beatId: string) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat || beat.isMetadataLoaded) return;

    try {
      const metadata = await extractMetadata(beat.path, beat.format);
      setBeats(prevBeats => prevBeats.map(b =>
        b.id === beatId
          ? { ...b, ...metadata, isMetadataLoaded: true }
          : b
      ));
    } catch (error) {
      console.error(`Error loading metadata for beat ${beat.name}:`, error);
    }
  }, [beats]);

  const refreshBeats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const savedFolders = await settingsStore.get<string[]>('beatFolders') || [];
      const loadedBeats = await loadBeats(savedFolders);
      setBeats(loadedBeats);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unknown error occurred while loading beats';

      console.error('Error during beats refresh:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBeat = useCallback(async (updatedBeat: Beat) => {
    try {
      setBeats(prevBeats =>
        prevBeats.map(beat => beat.id === updatedBeat.id ? updatedBeat : beat)
      );

      const storedBeats = (await beatStore.get('beats')) as Beat[] || [];
      console.log('Current stored beats:', storedBeats);
      
      const updatedStoredBeats = storedBeats.map(beat => 
        beat.id === updatedBeat.id ? updatedBeat : beat
      );

      console.log('Saving updated beat:', updatedBeat);
      console.log('Updated stored beats:', updatedStoredBeats);
      
      await beatStore.set('beats', updatedStoredBeats);
      await beatStore.save();
    } catch (err) {
      console.error('Error updating beat:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    refreshBeats();
  }, [refreshBeats]);

  return (
    <BeatsContext.Provider value={{ beats, isLoading, error, refreshBeats, loadMetadata, updateBeat }}>
      {children}
    </BeatsContext.Provider>
  );
}

/**
 * Hook to access the beats context and its operations
 * @throws Error if used outside of BeatsProvider
 */
export const useBeats = () => {
  const context = useContext(BeatsContext);
  if (context === undefined) {
    throw new Error('useBeats must be used within a BeatsProvider');
  }
  return context;
};
