import { type DirEntry } from '@tauri-apps/plugin-fs';
import * as musicMetadata from 'music-metadata';
import { readFile } from '@tauri-apps/plugin-fs';
import { Beat } from '../types/Beat';
import { ulid } from 'ulid';

export const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.aiff', '.m4a', '.ogg'];

export interface ExtendedDirEntry extends DirEntry {
  lastModified: number;
  size: number;
  path: string;
}

export const normalizePath = (path: string): string => {
  return path.replace(/\\/g, '/').toLowerCase();
};

export const extractMetadata = async (filePath: string, format: string): Promise<Partial<Beat>> => {
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
    const fileName = filePath.split('/').pop() || '';
    const title = metadata.common.title || fileName.replace(/\.[^/.]+$/, '');
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

export const createBeatIndex = async (entry: ExtendedDirEntry, existingBeat?: Beat): Promise<Beat | null> => {
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
      title: metadata.title || entry.name.replace(/\.[^/.]+$/, ''),
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
