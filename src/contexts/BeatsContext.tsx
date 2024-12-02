import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import { readDir, type DirEntry, readFile } from '@tauri-apps/plugin-fs';
import * as musicMetadata from 'music-metadata';
import { ulid } from 'ulid';

// Extend DirEntry type to include path
interface ExtendedDirEntry extends DirEntry {
  lastModified: number;
  size: number;
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
const EXCLUDED_FORMATS = ['.flp'];  // FL Studio project files

const extractMetadata = async (filePath: string, format: string): Promise<Partial<Beat>> => {
  if (!filePath) {
    throw new Error('File path is required for metadata extraction');
  }

  try {
    // Normalize the path to handle Windows paths
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

    // Log full metadata for debugging
    console.log('Raw metadata:', {
      format: {
        duration: metadata.format.duration,
        bitrate: metadata.format.bitrate,
        sampleRate: metadata.format.sampleRate,
        numberOfChannels: metadata.format.numberOfChannels
      },
      common: metadata.common
    });

    // Smart artist detection
    let artist = 'prodbyeagle';  // Default to prodbyeagle since these are your beats

    // If metadata explicitly specifies a different artist, use that instead
    if (metadata.common.artist && metadata.common.artist !== 'prodbyeagle') {
      artist = metadata.common.artist;
    }

    // Extract cover art
    let coverArt = '';

    try {
      if (metadata.common.picture?.[0]) {
        const picture = metadata.common.picture[0];
        
        if (picture.data && picture.data.length > 0) {
          try {
            // Convert to base64
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
          } catch (error) {
            // Silent fail - will use default cover
          }
        }
      }
    } catch (error) {
      // Silent fail - will use default cover
    }

    // Format duration
    const duration = metadata.format.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const result = {
      artist,
      duration: formattedDuration,
      coverArt
    };

    console.log('Processed metadata:', {
      file: normalizedPath.split('/').pop(),
      ...result
    });

    return result;
  } catch (error) {
    throw error;
  }
};

// Type guard to check if entry is a valid audio file
const isValidAudioFile = (entry: ExtendedDirEntry): boolean => {
  if (!entry.name) return false;
  const extension = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
  return SUPPORTED_FORMATS.includes(extension) && !EXCLUDED_FORMATS.includes(extension);
};

const loadBeats = async (folders: string[]): Promise<Beat[]> => {
  const allBeats: Beat[] = [];
  const loadErrors: string[] = [];
  
  for (const folder of folders) {
    try {
      let entries: ExtendedDirEntry[];
      try {
        // Normalize the path to handle spaces and special characters
        const normalizedPath = decodeURIComponent(folder).replace(/\\/g, '/');
        entries = await readDir(normalizedPath) as ExtendedDirEntry[];
      } catch (accessError) {
        const errorMessage = `Cannot access folder ${folder}: ${
          accessError instanceof Error ? accessError.message : 'Unknown error'
        }`;
        
        // Collect detailed error information
        loadErrors.push(errorMessage);
        
        // Skip this folder and continue with others
        continue;
      }
      
      const processEntry = async (entry: ExtendedDirEntry) => {
        // Skip if it's a FL Studio project file
        if (!entry.name || entry.name.toLowerCase().endsWith('.flp')) {
          return;
        }

        // For file entries, construct the full path if missing
        if (entry.isFile && !entry.path) {
          entry.path = `${folder}/${entry.name}`.replace(/\\/g, '/');
        }

        if (isValidAudioFile(entry)) {
          try {
            // Generate unique ID using ULID
            const beatId = ulid();
            
            // Get file format
            const format = entry.name.slice(entry.name.lastIndexOf('.'));
            
            // Extract metadata
            const metadata = await extractMetadata(entry.path, format);
            
            const beat: Beat = {
              id: beatId,
              name: entry.name,
              path: entry.path,
              format: format,
              size: entry.size || 0,
              lastModified: entry.lastModified || Date.now(),
              ...metadata
            };

            allBeats.push(beat);
          } catch (metadataError) {
            const errorMessage = `Could not process beat ${entry.name}: ${
              metadataError instanceof Error ? metadataError.message : 'Unknown error'
            }`;
            loadErrors.push(errorMessage);
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
              const errorMessage = `Cannot access subdirectory ${entry.path}: ${
                subDirError instanceof Error ? subDirError.message : 'Unknown error'
              }`;
              loadErrors.push(errorMessage);
            }
          }
        }
      };

      await processEntries(entries);
    } catch (error) {
      const errorMessage = `Unexpected error reading folder ${folder}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      loadErrors.push(errorMessage);
    }
  }
  
  // If there were any errors, throw them to be handled by the caller
  if (loadErrors.length > 0) {
    throw new Error(`Encountered ${loadErrors.length} errors while loading beats:\n${loadErrors.join('\n')}`);
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
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred while loading beats';
      
      setError(errorMessage);
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
