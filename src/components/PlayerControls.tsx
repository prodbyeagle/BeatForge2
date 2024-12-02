import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import Button from './Button';
import { Track } from '../types/Track';

interface PlayerControlsProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
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
  onPrevious,
  onNext,
}: PlayerControlsProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle track change
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      // Use Tauri's convertFileSrc to get a proper URL for local files
      const fileUrl = convertFileSrc(currentTrack.path);
      audioRef.current.src = fileUrl;
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;

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
        if (onNext) {
          onNext();
        }
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
  }, [volume, onNext]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
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
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 px-24">
      <audio ref={audioRef} />
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-[var(--theme-secondary)]/60 backdrop-blur-xl border border-[var(--theme-tertiary)] px-4 py-3 rounded-3xl shadow-lg">
          {/* Timeline */}
          <div className="px-4 mb-3 flex items-center gap-3">
            <span className="text-xs text-[var(--theme-tertiary)]/70 select-none">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleTimelineChange}
              className="flex-1 h-1 appearance-none bg-[var(--theme-tertiary)]/10 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--theme-tertiary)] [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
            />
            <span className="text-xs text-[var(--theme-tertiary)]/70 select-none">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Track Info */}
            <div className="flex items-center gap-4 w-[240px] lg:w-[280px] min-w-0">
              {currentTrack ? (
                <>
                  <div 
                    className="w-12 h-12 bg-[var(--theme-secondary)] rounded-xl flex-shrink-0 bg-cover bg-center border border-[var(--theme-tertiary)]/10"
                    style={{ 
                      backgroundImage: currentTrack.coverArt ? `url(${currentTrack.coverArt})` : 'none',
                      backgroundColor: !currentTrack.coverArt ? 'var(--theme-secondary)' : 'transparent'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{currentTrack.title}</h4>
                    <p className="text-sm text-[var(--theme-tertiary)]/70 truncate">{currentTrack.artist}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-[var(--theme-secondary)] rounded-xl flex-shrink-0 border border-[var(--theme-tertiary)]/10" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">No track playing</h4>
                    <p className="text-sm text-[var(--theme-tertiary)]/70 truncate">Select a track to play</p>
                  </div>
                </>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 appearance-none bg-[var(--theme-tertiary)]/10 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--theme-tertiary)] [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
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
