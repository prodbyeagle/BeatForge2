import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { Track } from '../types/Track';

interface PlayerControlsProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimelineChange: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  volume: number;
  isMuted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  duration: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlayerControls = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onTimelineChange,
  onVolumeChange,
  onToggleMute,
  volume,
  isMuted,
  audioRef,
  duration
}: PlayerControlsProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const timeDisplayRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const [localVolume, setLocalVolume] = useState(volume);
  const volumeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;

    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 1000; // Update time display every second

    const updateTimeDisplay = () => {
      if (!audioRef.current) return;

      const now = performance.now();
      timeDisplayRef.current = audioRef.current.currentTime;

      if (now - lastUpdateTime >= UPDATE_INTERVAL) {
        setCurrentTime(timeDisplayRef.current);
        lastUpdateTime = now;
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateTimeDisplay);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTimeDisplay);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioRef]);

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onTimelineChange(time);
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    
    // Update audio volume immediately for smooth feedback
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }

    // Debounce the callback to parent to prevent excessive updates
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    volumeTimeoutRef.current = setTimeout(() => {
      onVolumeChange(newVolume);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 px-52">
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-[var(--theme-surface)]/90 backdrop-blur-xl border border-[var(--theme-border)] px-4 py-3 rounded-3xl shadow-lg">
          <div className="px-4 mb-3 flex items-center gap-3">
            <span className="text-xs text-[var(--theme-text)] select-none">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleTimelineChange}
              className="flex-1 h-1 appearance-none bg-[var(--theme-border)] rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--theme-border)] [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
            />
            <span className="text-xs text-[var(--theme-text)] select-none">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 md:gap-8">
            <div className="flex items-center gap-4 w-[240px] lg:w-[280px] min-w-0">
              {currentTrack ? (
                <>
                  <div
                    className={`w-12 h-12 bg-[var(--theme-surface)] rounded-xl flex-shrink-0 bg-cover bg-center border border-[var(--theme-border)] relative`}
                    style={{
                      backgroundImage: currentTrack.coverArt ? `url(${currentTrack.coverArt})` : 'none',
                      backgroundColor: !currentTrack.coverArt ? 'var(--theme-surface)' : 'transparent'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{currentTrack.title || currentTrack.name}</h4>
                    <p className="text-sm text-[var(--theme-text)] truncate">{currentTrack.artist || 'Unknown Artist'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-[var(--theme-surface)] rounded-xl flex-shrink-0 border border-[var(--theme-border)]" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">No track playing</h4>
                    <p className="text-sm text-[var(--theme-text)] truncate">Select a track to play</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
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
            </div>

            <div className="flex items-center gap-2 w-[240px] lg:w-[280px] min-w-0 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={onToggleMute}
                className="flex-shrink-0"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <div className="w-full max-w-[100px]">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 appearance-none bg-[var(--theme-border)] rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--theme-border)] [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
