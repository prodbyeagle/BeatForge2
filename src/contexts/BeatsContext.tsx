import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import { readDir, type DirEntry, readFile } from '@tauri-apps/plugin-fs';
import * as musicMetadata from 'music-metadata';
import { ulid } from 'ulid';

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.aiff', '.m4a', '.ogg'];

/**
 * Extended DirEntry interface with additional file metadata
 */
interface ExtendedDirEntry extends DirEntry {
  lastModified: number;
  size: number;
  path: string;
}

/**
 * Represents a music beat with its metadata
 */
interface Beat {
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
 * Context interface for managing beats
 */
interface BeatsContextType {
  beats: Beat[];
  isLoading: boolean;
  error: string | null;
  refreshBeats: () => Promise<void>;
  loadMetadata: (beatId: string) => Promise<void>;
}

const BeatsContext = createContext<BeatsContextType | undefined>(undefined);
const beatStore = new LazyStore('beat-index.json');
const settingsStore = new LazyStore('settings.json');

/**
 * Extracts metadata from an audio file
 * @param filePath - Path to the audio file
 * @param format - Audio file format
 * @returns Partial Beat object containing extracted metadata
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

    let artist = 'prodbyeagle';
    if (metadata.common.artist && metadata.common.artist !== 'prodbyeagle') {
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
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return {
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
 * Creates a lightweight index of beats with basic information
 */
const createBeatIndex = async (entry: ExtendedDirEntry): Promise<Beat | null> => {
  console.log(`🔍 Processing file: ${entry.name}`);
  
  if (!entry.name || entry.name.toLowerCase().endsWith('.flp')) {
    console.log(`⏭️ Skipping ${entry.name}: FLP file or no name`);
    return null;
  }

  if (!entry.path) {
    console.log(`⏭️ Skipping ${entry.name}: No path`);
    return null;
  }

  const format = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(format)) {
    console.log(`⏭️ Skipping ${entry.name}: Unsupported format ${format}`);
    return null;
  }

  console.log(`✅ Creating index for ${entry.name} with path ${entry.path}`);
  
  try {
    const metadata = await extractMetadata(entry.path, format);
    console.log(`📝 Extracted metadata for ${entry.name}`);
    
    return {
      id: ulid(),
      name: entry.name,
      title: entry.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      path: entry.path,
      format: format,
      size: entry.size || 0,
      lastModified: entry.lastModified || Date.now(),
      isMetadataLoaded: true,
      artist: metadata.artist || 'prodbyeagle',
      album: metadata.album || 'Unknown Album',
      duration: metadata.duration || '0:00',
      bpm: undefined,
      key: undefined,
      coverArt: metadata.coverArt
    };
  } catch (error) {
    console.error(`❌ Failed to extract metadata for ${entry.name}:`, error);
    // Still create the beat, but without metadata
    return {
      id: ulid(),
      name: entry.name,
      title: entry.name.replace(/\.[^/.]+$/, ''),
      path: entry.path,
      format: format,
      size: entry.size || 0,
      lastModified: entry.lastModified || Date.now(),
      isMetadataLoaded: false,
      artist: 'prodbyeagle',
      album: 'Unknown Album',
      duration: '0:00',
      bpm: undefined,
      key: undefined,
      coverArt: undefined
    };
  }
};

/**
 * Loads beats from specified folders
 */
const loadBeats = async (folders: string[]): Promise<Beat[]> => {
  let allBeats: Beat[] = [];
  const loadErrors: string[] = [];

  console.log('🎵 Starting beat indexing process...');
  console.log(`📂 Folders to scan: ${folders.length}`, folders);

  // Try to load from index first
  let existingBeats: Beat[] = [];
  try {
    console.log('📑 Attempting to load from existing index...');
    const indexedBeats = await beatStore.get<Beat[]>('beats');
    if (indexedBeats && indexedBeats.length > 0) {
      console.log(`✅ Successfully loaded ${indexedBeats.length} beats from index`);
      // Only keep beats from current folders
      existingBeats = indexedBeats.filter(beat => 
        folders.some(folder => beat.path.startsWith(folder))
      );
      console.log(`📊 Kept ${existingBeats.length} beats from current folders`);
    }
  } catch (error) {
    console.warn('⚠️ Could not load beat index:', error);
  }

  // Always scan folders to find new beats
  console.log('🔍 Scanning folders for new beats...');
  const existingPaths = new Set(existingBeats.map(beat => beat.path));

  for (const folder of folders) {
    console.log(`📂 Processing folder: ${folder}`);
    try {
      let entries: ExtendedDirEntry[];
      try {
        // Normalize Windows paths for Tauri
        const normalizedPath = folder
          .replace(/\\/g, '/'); // Replace backslashes with forward slashes

        console.log(`🔍 Original path: ${folder}`);
        console.log(`🔍 Normalized path: ${normalizedPath}`);
        entries = await readDir(normalizedPath) as ExtendedDirEntry[];
        entries = entries.map(entry => ({
          ...entry,
          path: `${normalizedPath}/${entry.name}`
        }));
        entries.forEach(entry => {
          console.log('🔹 Entry:', entry);
        });
      } catch (accessError) {
        console.error(`❌ Cannot access folder ${folder}:`, accessError);
        loadErrors.push(`Cannot access folder ${folder}: ${accessError instanceof Error ? accessError.message : 'Unknown error'
          }`);
        continue;
      }

      const processEntries = async (entries: ExtendedDirEntry[]) => {
        console.log(`📂 Processing ${entries.length} entries`);
        for (const entry of entries) {
          if (entry.isFile) {
            try {
              console.log(`📄 Processing file: ${entry.name}`);
              const beat = await createBeatIndex(entry);
              if (beat && !existingPaths.has(beat.path)) {
                console.log(`✅ Successfully indexed beat: ${beat.name}`);
                allBeats.push(beat);
              } else {
                console.log(`⏭️ Skipped file: ${entry.name}`);
              }
            } catch (error) {
              console.error(`❌ Failed to index beat ${entry.name}:`, error);
            }
          }

          if (entry.isDirectory) {
            try {
              console.log(`📂 Entering subdirectory: ${entry.path}`);
              const subEntries = await readDir(entry.path) as ExtendedDirEntry[];
              await processEntries(subEntries);
            } catch (subDirError) {
              console.error(`❌ Cannot access subdirectory ${entry.path}:`, subDirError);
              loadErrors.push(`Cannot access subdirectory ${entry.path}: ${subDirError instanceof Error ? subDirError.message : 'Unknown error'
                }`);
            }
          }
        }
      };

      await processEntries(entries);
      console.log(`✅ Finished processing folder: ${folder}`);
    } catch (error) {
      console.error(`❌ Error processing folder ${folder}:`, error);
      loadErrors.push(`Unexpected error reading folder ${folder}: ${error instanceof Error ? error.message : 'Unknown error'
        }`);
    }
  }

  // Merge existing beats with new ones
  allBeats = [...existingBeats, ...allBeats];

  // Save to index
  try {
    console.log(`💾 Saving ${allBeats.length} beats to index...`);
    await beatStore.set('beats', allBeats);
    await beatStore.save();
    console.log('✅ Successfully saved beat index');
  } catch (error) {
    console.error('❌ Could not save beat index:', error);
  }

  if (loadErrors.length > 0) {
    console.error(`❌ Encountered ${loadErrors.length} errors while loading beats:`, loadErrors);
    throw new Error(`Encountered ${loadErrors.length} errors while loading beats:\n${loadErrors.join('\n')}`);
  }

  console.log(`🎉 Beat indexing complete! Found ${allBeats.length} beats`);
  return allBeats;
};

/**
 * Provider component for beats management
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
    console.log('🔄 Starting beats refresh...');
    setIsLoading(true);
    setError(null);
    try {
      const savedFolders = await settingsStore.get<string[]>('beatFolders') || [];
      console.log('📂 Retrieved saved folders from settings:', savedFolders);
      const loadedBeats = await loadBeats(savedFolders);
      console.log(`✅ Successfully loaded ${loadedBeats.length} beats`);
      setBeats(loadedBeats);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unknown error occurred while loading beats';

      console.error('❌ Error during beats refresh:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('🏁 Beats refresh complete');
    }
  }, []);

  useEffect(() => {
    refreshBeats();
  }, [refreshBeats]);

  return (
    <BeatsContext.Provider value={{ beats, isLoading, error, refreshBeats, loadMetadata }}>
      {children}
    </BeatsContext.Provider>
  );
}

/**
 * Hook to access the beats context
 */
export const useBeats = () => {
  const context = useContext(BeatsContext);
  if (context === undefined) {
    throw new Error('useBeats must be used within a BeatsProvider');
  }
  return context;
};
