export interface Track {
  id: string;
  title: string;
  name: string;  // Original filename
  artist?: string;
  album?: string;
  path: string;
  duration?: string;
  bpm?: number;
  key?: string;
  coverArt?: string;
  format: string;
  size: number;
  lastModified: number;
  isMetadataLoaded: boolean;
}
