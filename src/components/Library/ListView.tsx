import { Play, Pause, MoreVertical } from 'lucide-react';
import Button from '../Button';
import { Track } from '../../types/Track';
import { useRef } from 'react';
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
  handleContextMenu,
  handleTrackAction
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 64; // Reduzierte Höhe für kompakteres Layout
  
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
        className={`flex items-center justify-between py-2 px-3 hover:bg-[var(--theme-surface)] transition-all duration-200 group cursor-pointer rounded-lg ${isCurrentTrack ? 'bg-[var(--theme-surface)]' : ''}`}
        onDoubleClick={() => {
          onTrackSelect(track);
          if (!isPlaying) {
            onPlayPause();
          }
        }}
        onContextMenu={(e) => handleContextMenu(e, track)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative group shrink-0">
            <div
              className="w-8 h-8 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${track.coverArt})` }}
            />
            <Button
              variant="secondary"
              size="sm"
              className={`w-8 h-8 rounded-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${!isCurrentTrack ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity bg-black/50 backdrop-blur-sm hover:bg-black/60`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(track);
              }}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-medium truncate ${isCurrentTrack ? 'text-[var(--theme-accent)]' : ''}`}>{track.title}</h3>
            <p className="text-sm text-[var(--theme-text)] truncate">{track.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-[var(--theme-text)] shrink-0">
          <span className="w-32 truncate">{track?.album || 'Unknown Album'}</span>
          <span className="w-20 text-center">{track.bpm ? `${track.bpm} BPM` : '-'}</span>
          <span className="w-16 text-right">{track.duration}</span>
          
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[var(--theme-surface-hover)]"
            onClick={() => handleTrackAction(track)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div ref={listRef} className="p-4">
      <List
        height={750}
        width="100%"
        itemCount={filteredTracks.length}
        itemSize={ITEM_HEIGHT}
        className="scrollbar-thin scrollbar-thumb-[var(--theme-surface)] scrollbar-track-transparent"
      >
        {Row}
      </List>
    </div>
  );
};

export default ListView;
