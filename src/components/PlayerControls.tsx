import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import Button from './Button';
import { Track } from '../types/Track';
import { useSettings } from '../contexts/SettingsContext';
import { useBeats } from '../contexts/BeatsContext';

interface PlayerControlsProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious?: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PlayerControls = ({
  currentTrack,
  isPlaying,
  onPlayPause,
}: PlayerControlsProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { settings, updateSettings } = useSettings();
  const { loadMetadata } = useBeats();
  const [localVolume, setLocalVolume] = useState(settings.volume);
  const [prevVolume, setPrevVolume] = useState(settings.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasPlayedMusic, setHasPlayedMusic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //TODO: add queue system so its playing the next song after the current one finishes
  //TODO: add shuffle feature
  //TODO: add repeat feature

  const debouncedVolume = useDebounce(localVolume, 500);

  useEffect(() => {
    if (debouncedVolume !== settings.volume) {
      updateSettings({ volume: debouncedVolume });
    }
  }, [debouncedVolume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = localVolume;

      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };

      const handleDurationChange = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };

      const handleEnded = () => {
        return;
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('durationchange', handleDurationChange);
      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('durationchange', handleDurationChange);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [settings.volume, localVolume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      setHasPlayedMusic(true);
      setIsLoading(true);

      if (!currentTrack.isMetadataLoaded) {
        loadMetadata(currentTrack.id);
      }

      const fileUrl = convertFileSrc(currentTrack.path);
      audioRef.current.src = fileUrl;
      setIsLoading(false);
    }
  }, [currentTrack]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setLocalVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(localVolume);
      setLocalVolume(0);
      setIsMuted(true);
    }
  };

  if (!hasPlayedMusic && !currentTrack) {
    return <audio ref={audioRef} />;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 px-52">
      <audio ref={audioRef} />
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
                    className={`w-12 h-12 bg-[var(--theme-surface)] rounded-xl flex-shrink-0 bg-cover bg-center border border-[var(--theme-border)] relative ${isLoading ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundImage: currentTrack.coverArt ? `url(${currentTrack.coverArt})` : 'none',
                      backgroundColor: !currentTrack.coverArt ? 'var(--theme-surface)' : 'transparent'
                    }}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--theme-surface)] backdrop-blur-sm rounded-xl">
                        <div className="w-5 h-5 border-2 border-[var(--theme-border)] border-t-[var(--theme-border)] rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
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

            {/* Playback Controls */}
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
                onClick={toggleMute}
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
}

export default PlayerControls;
