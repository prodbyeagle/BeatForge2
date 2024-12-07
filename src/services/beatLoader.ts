import { readDir } from '@tauri-apps/plugin-fs';
import { Beat } from '../types/Beat';
import { ExtendedDirEntry, createBeatIndex, normalizePath } from '../utils/beatUtils';
import { LazyStore } from '@tauri-apps/plugin-store';

export const beatStore = new LazyStore('beat-index.json');

interface LoadStats {
  totalBeats: number;
  processedBeats: number;
  cachedBeats: number;
  newBeats: number;
  errors: number;
  startTime: number;
  batchTimes: number[];
  folderSizes: { [key: string]: number };
}

// Worker für parallele Verarbeitung
const createWorker = (entries: ExtendedDirEntry[], existingBeatsMap: Map<string, Beat>) => {
  return new Promise<Beat[]>(async (resolve) => {
    const processedBeats: Beat[] = [];

    for (const entry of entries) {
      if (entry.isFile) {
        const existingBeat = existingBeatsMap.get(normalizePath(entry.path));
        if (existingBeat) {
          processedBeats.push({
            ...existingBeat,
            size: entry.size || existingBeat.size,
            lastModified: entry.lastModified || existingBeat.lastModified,
            bpm: existingBeat.bpm || 0
          });
        } else {
          const beat = await createBeatIndex(entry, existingBeat);
          if (beat) {
            processedBeats.push(beat);
          }
        }
      }
    }

    resolve(processedBeats);
  });
};

export const loadBeats = async (
  folders: string[], 
  onProgress?: (progress: { current: number; total: number; percentage: number }) => void
): Promise<Beat[]> => {
  const stats: LoadStats = {
    totalBeats: 0,
    processedBeats: 0,
    cachedBeats: 0,
    newBeats: 0,
    errors: 0,
    startTime: performance.now(),
    batchTimes: [],
    folderSizes: {}
  };

  // Lade existierende Beats parallel zum Ordner-Scan
  const existingBeatsPromise = beatStore.get<Beat[]>('beats');
  let existingBeats: Beat[] = [];

  try {
    existingBeats = (await existingBeatsPromise) || [];
    const normalizedFolders = folders.map(f => normalizePath(f));
    existingBeats = existingBeats.filter(beat =>
      normalizedFolders.some(folder => normalizePath(beat.path).startsWith(folder))
    );
  } catch (error) {
    console.warn('Could not load beat index:', error);
  }

  const existingBeatsMap = new Map(
    existingBeats.map(beat => [normalizePath(beat.path), beat])
  );

  const BATCH_SIZE = 50;
  let allBeats: Beat[] = [];
  const loadErrors: string[] = [];

  // Calculate total number of files to process
  const totalFiles = await Promise.all(
    folders.map(async (folder) => {
      const normalizedPath = folder.replace(/\\/g, '/');
      const entries = await readDir(normalizedPath) as ExtendedDirEntry[];
      return entries.length;
    })
  );

  const totalFilesCount = totalFiles.reduce((a, b) => a + b, 0);
  let processedFilesCount = 0;

  // Parallele Verarbeitung der Ordner
  const folderPromises = folders.map(async (folder) => {
    try {
      const normalizedPath = folder.replace(/\\/g, '/');
      const entries = await readDir(normalizedPath) as ExtendedDirEntry[];
      const mappedEntries = entries.map(entry => ({
        ...entry,
        path: `${normalizedPath}/${entry.name}`
      }));

      stats.folderSizes[folder] = mappedEntries.length;

      // Teile Einträge in Batches
      const batches: ExtendedDirEntry[][] = [];
      for (let i = 0; i < mappedEntries.length; i += BATCH_SIZE) {
        batches.push(mappedEntries.slice(i, i + BATCH_SIZE));
      }

      // Verarbeite Batches parallel
      const batchResults = await Promise.all(
        batches.map(async (batch) => {
          const result = await createWorker(batch, existingBeatsMap);
          processedFilesCount += batch.length;
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress({
              current: processedFilesCount,
              total: totalFilesCount,
              percentage: Math.round((processedFilesCount / totalFilesCount) * 100)
            });
          }
          
          return result;
        })
      );

      return batchResults.flat();
    } catch (error) {
      console.error(`Error processing folder ${folder}:`, error);
      loadErrors.push(`Error processing folder ${folder}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  });

  // Warte auf alle Ordner-Verarbeitungen
  const folderResults = await Promise.all(folderPromises);
  allBeats = folderResults.flat();

  // Speichere Beat-Index im Hintergrund
  const savePromise = (async () => {
    try {
      const currentBeats = await beatStore.get<Beat[]>('beats') || [];
      if (JSON.stringify(currentBeats) !== JSON.stringify(allBeats)) {
        await beatStore.set('beats', allBeats);
        await beatStore.save();
      }
    } catch (error) {
      console.error('Could not save beat index:', error);
    }
  })();

  // Warte auf Speicherung, bevor wir zurückkehren
  await savePromise;

  if (loadErrors.length > 0) {
    console.error(`Encountered ${loadErrors.length} errors while loading beats:`, loadErrors);
  }

  return allBeats;
};