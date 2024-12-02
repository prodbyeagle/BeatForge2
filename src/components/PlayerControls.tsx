import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import Button from './Button';
import { Track } from '../types/Track';

interface PlayerControlsProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const PlayerControls = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
}: PlayerControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 px-24">
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-[var(--theme-secondary)]/60 backdrop-blur-xl border border-[var(--theme-tertiary)] px-4 py-3 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-[240px]">
              {currentTrack ? (
                <>
                  <div 
                    className="w-12 h-12 bg-[var(--theme-secondary)] rounded-full flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentTrack.coverArt})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{currentTrack.title}</h4>
                    <p className="text-sm text-[var(--theme-tertiary)]/70 truncate">{currentTrack.artist}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-[var(--theme-secondary)] rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">No track playing</h4>
                    <p className="text-sm text-[var(--theme-tertiary)]/70 truncate">Select a track to play</p>
                  </div>
                </>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onPrevious}
                disabled={!currentTrack}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-10 h-10 rounded-full"
                onClick={onPlayPause}
                disabled={!currentTrack}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onNext}
                disabled={!currentTrack}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 min-w-[240px] justify-end">
              <Button variant="secondary" size="sm">
                <Volume2 className="w-4 h-4" />
              </Button>
              <div className="w-24 h-1 bg-[var(--theme-tertiary)]/10 rounded-full">
                <div className="w-1/2 h-full bg-[var(--theme-tertiary)] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;
