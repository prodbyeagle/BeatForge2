import { Play, Pause } from 'lucide-react';
import { Track } from '../../types/Track';
import { FixedSizeList as List } from 'react-window';

interface ListViewProps {
  filteredTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onPlayPause: () => void;
  handleContextMenu: (e: React.MouseEvent, track: Track) => void;
  handleTrackAction: (track: Track) => void;
}

const ListView: React.FC<ListViewProps> = ({
  filteredTracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onPlayPause,
  handleContextMenu
}) => {
  const handlePlayPause = (track: Track) => {
    if (!isPlaying) {
      onTrackSelect(track);
    }
    onPlayPause();
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const track = filteredTracks[index];
    const isCurrentTrack = currentTrack?.id === track.id;

    return (
      <div
        style={style}
        className={`group relative flex items-center gap-4 p-3 mx-1.5 rounded-xl transition-all duration-300
          ${isCurrentTrack
            ? 'bg-[var(--theme-surface)] shadow-sm'
            : 'hover:bg-[var(--theme-surface-hover)]'}`}
        onDoubleClick={() => {
          onTrackSelect(track);
          if (!isPlaying) onPlayPause();
        }}
        onContextMenu={(e) => handleContextMenu(e, track)}
      >
        {/* Cover Art + Play Button */}
        <div className="relative">
          <div
            className="transition-all duration-300 bg-center bg-cover rounded-lg w-10 h-10 group-hover:opacity-95 shadow-sm"
            style={{ backgroundImage: `url(${track.coverArt || '/default-cover.png'})` }}
          >
            <div className={`absolute inset-0 rounded-lg flex items-center justify-center
              ${isCurrentTrack ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/40'}
              transition-all duration-300`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(track);
              }}
            >
              <div className={`w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center
                transform transition-all duration-300 hover:scale-105
                ${isCurrentTrack ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0 pr-4">
          <h3 className={`text-sm font-medium truncate mb-0.5
            ${isCurrentTrack ? 'text-[var(--theme-accent)]' : ''}`}>
            {track.title}
          </h3>
          <p className="text-xs truncate transition-opacity duration-300 opacity-60 group-hover:opacity-80">
            {track.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Album */}
        <div className="hidden w-40 md:block">
          <p className="text-xs truncate transition-opacity duration-300 opacity-60 group-hover:opacity-80">
            {track.album || 'Unknown Album'}
          </p>
        </div>

        {/* BPM */}
        <div className="items-center justify-end hidden w-16 lg:flex">
          {track.bpm ? (
            <div className="text-xs px-2 py-1 rounded-full bg-[var(--theme-surface-hover)] font-medium">
              {track.bpm} BPM
            </div>
          ) : null}
        </div>

        {/* Duration */}
        <div className="w-16 text-right">
          <span className="text-xs font-medium opacity-60 group-hover:opacity-80">{track.duration}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-hidden px-1">
      <List
        height={window.innerHeight - 200}
        width="calc(100% - 2px)"
        itemCount={filteredTracks.length}
        itemSize={64}
      >
        {Row}
      </List>
    </div>
  );
};

export default ListView;
