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
