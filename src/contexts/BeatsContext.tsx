import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import { readDir, type DirEntry, readFile } from '@tauri-apps/plugin-fs';
import * as musicMetadata from 'music-metadata';
import { ulid } from 'ulid';

// Extend DirEntry type to include path
interface ExtendedDirEntry extends DirEntry {
  path: string;
}

interface Beat {
  id: string;
  name: string;
  path: string;
  format: string;
  size: number;
  lastModified: number;
  artist?: string;
  duration?: string;
  coverArt?: string;
}

interface BeatsContextType {
  beats: Beat[];
  isLoading: boolean;
  error: string | null;
  refreshBeats: () => Promise<void>;
}

const BeatsContext = createContext<BeatsContextType | undefined>(undefined);

const store = new LazyStore('settings.json');

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.aiff', '.m4a', '.ogg'];

const extractMetadata = async (filePath: string, format: string): Promise<Partial<Beat>> => {
  try {
    const fileBuffer = await readFile(filePath);
    const metadata = await musicMetadata.parseBuffer(new Uint8Array(fileBuffer), { mimeType: format });
    
    // Extract cover art
    let coverArt = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&q=80';
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      coverArt = `data:${pic.format};base64,${Buffer.from(pic.data).toString('base64')}`;
    }

    return {
      artist: metadata.common.artist || 'Unknown Artist',
      duration: metadata.format.duration ? 
        `${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}` 
        : '0:00',
      coverArt
    };
  } catch (error) {
    console.warn(`Could not extract metadata for ${filePath}:`, error);
    return {
      artist: 'Unknown Artist',
      duration: '0:00',
      coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&q=80'
    };
  }
};

// Type guard to check if entry is a valid audio file
const isValidAudioFile = (entry: ExtendedDirEntry): boolean => {
  if (!entry.name) return false;
  const extension = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
  return SUPPORTED_FORMATS.includes(extension);
};

const loadBeats = async (folders: string[]): Promise<Beat[]> => {
  const allBeats: Beat[] = [];
  
  for (const folder of folders) {
    try {
      let entries: ExtendedDirEntry[];
      try {
        entries = await readDir(folder) as ExtendedDirEntry[];
      } catch (accessError) {
        console.warn(`Cannot access folder ${folder}:`, accessError);
        // Skip this folder and continue with others
        continue;
      }
      
      const processEntry = async (entry: ExtendedDirEntry) => {
        // Ensure entry has a name and is a valid audio file
        if (isValidAudioFile(entry)) {
          try {
            // Generate unique ID using ULID
            const beatId = ulid();
            
            // Extract metadata
            const metadata = await extractMetadata(entry.path, entry.name.slice(entry.name.lastIndexOf('.')));
            
            allBeats.push({
              id: beatId,
              name: entry.name,
              path: entry.path,
              format: entry.name.slice(entry.name.lastIndexOf('.')),
              size: 0, // TODO: Add file size when available
              lastModified: Date.now(),
              ...metadata // Spread extracted metadata
            });
          } catch (metadataError) {
            console.warn(`Could not process beat ${entry.name}:`, metadataError);
          }
        }
      };

      // Process all entries recursively
      const processEntries = async (entries: ExtendedDirEntry[]) => {
        for (const entry of entries) {
          await processEntry(entry);
          
          // If entry is a directory, recursively process its contents
          if (entry.isDirectory) {
            try {
              const subEntries = await readDir(entry.path) as ExtendedDirEntry[];
              await processEntries(subEntries);
            } catch (subDirError) {
              console.warn(`Cannot access subdirectory ${entry.path}:`, subDirError);
            }
          }
        }
      };

      await processEntries(entries);
    } catch (error) {
      console.error(`Unexpected error reading folder ${folder}:`, error);
    }
  }
  
  return allBeats;
};

export function BeatsProvider({ children }: { children: ReactNode }) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBeats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const savedFolders = await store.get<string[]>('beatFolders') || [];
      const loadedBeats = await loadBeats(savedFolders);
      setBeats(loadedBeats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBeats();
  }, [refreshBeats]);

  return (
    <BeatsContext.Provider value={{ beats, isLoading, error, refreshBeats }}>
      {children}
    </BeatsContext.Provider>
  );
}

export const useBeats = () => {
  const context = useContext(BeatsContext);
  if (context === undefined) {
    throw new Error('useBeats must be used within a BeatsProvider');
  }
  return context;
};
