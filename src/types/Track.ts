export interface Track {
  id: string;
  name: string;  // Original filename
  title: string;
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
