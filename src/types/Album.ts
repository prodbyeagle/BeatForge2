import { Track } from './Track';

export interface Album {
  name: string;
  artist: string;
  tracks: Track[];
  coverArt?: string;
  totalTracks: number;
  totalDuration: number;
}
