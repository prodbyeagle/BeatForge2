export interface Track {
  id: string;
  title: string;
  artist?: string;
  path: string;
  duration?: string;
  bpm?: number;
  key?: string;
  coverArt?: string;
  format?: string;
}
