import { Play, Pause } from 'lucide-react';
import { Track } from '../../types/Track';

interface GridViewProps {
  filteredTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onPlayPause: () => void;
  handleContextMenu: (e: React.MouseEvent, track: Track) => void;
}

const GridView: React.FC<GridViewProps> = ({
  filteredTracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onPlayPause,
  handleContextMenu
}) => {
  return (
    <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 p-6">
      {filteredTracks.map((track) => (
        <div
          key={track.id}
          className={`group relative h-64 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:shadow-xl hover:scale-[1.02] ${
            currentTrack?.id === track.id ? 'ring-2 ring-[var(--theme-secondary)] ring-opacity-50' : ''
          }`}
          onDoubleClick={() => {
            onTrackSelect(track);
            if (!isPlaying) {
              onPlayPause();
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, track)}
        >
          <div 
            className="h-40 w-full bg-cover bg-center relative group-hover:opacity-95 transition-all duration-300"
            style={{
              backgroundImage: `url(${track.coverArt || '/default-cover.png'})`
            }}
          >
            <div className="absolute inset-0 hover:backdrop-blur-2xl bg-gradient-to-b from-black/10 to-black/70 group-hover:from-black/20 group-hover:to-black/80 transition-all duration-300" />
            
            <div 
              className={`absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300 ${
                currentTrack?.id === track.id ? 'bg-black/40' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (currentTrack?.id === track.id) {
                  onPlayPause();
                } else {
                  onTrackSelect(track);
                  if (!isPlaying) {
                    onPlayPause();
                  }
                }
              }}
            >
              <div className={`w-12 h-12 rounded-full bg-[var(--theme-secondary)] flex items-center justify-center transform transition-all duration-300 ${
                currentTrack?.id === track.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
              }`}>
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium backdrop-blur-sm bg-black/30 rounded-full px-3 py-1 w-fit">
                <span>{track.duration}</span>
                {track.bpm !== 0 && (
                  <>
                    <span className="opacity-60">•</span>
                    <span>{track.bpm} BPM</span>
                  </>
                )}
                {track.key !== 'Unknown' && (
                  <>
                    <span className="opacity-60">•</span>
                    <span>{track.key}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <div className="space-y-1">
              <h3 className="text-base font-medium truncate group-hover:text-[var(--theme-secondary)] transition-colors duration-300">
                {track.title}
              </h3>
              <p className="text-sm opacity-70 truncate hover:opacity-100 transition-opacity duration-300">
                {track.artist || 'Unknown Artist'}
              </p>
            </div>
            
            <p className="text-xs opacity-50 truncate group-hover:opacity-70 transition-opacity duration-300">
              {track.album || 'Unknown Album'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridView;
