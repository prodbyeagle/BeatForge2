import { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { readFile } from "@tauri-apps/plugin-fs";
import Sidebar from "../components/Sidebar";
import Library from "./Library";
import AlbumDetail from "./AlbumDetail";
import AlbumLibrary from "./AlbumLibrary";
import Settings from "./Settings";
import { ThemeProvider } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";
import { useDiscordRPC } from "../contexts/DiscordRPCContext";
import { useQueue } from '../contexts/QueueContext';
import { useBeats } from '../contexts/BeatsContext';
import TitleBar from "../components/TitleBar";
import PlayerControls from "../components/PlayerControls";
import { Track } from "../types/Track";
import { Beat } from '../types/Beat';

/**
 * Main application component for BeatForge
 * Manages audio playback, navigation, and overall application state
 */
export default function App() {
  /**
   * Currently active page in the application
   */
  const [activePage, setActivePage] = useState<
    "library" | "settings" | "albums"
  >("library");

  /**
   * Discord RPC beat details update function
   */
  const { updateBeatDetails } = useDiscordRPC();

  /**
   * Currently selected music track
   */
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  /**
   * Whether audio is currently playing
   */
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Currently selected album
   */
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  /**
   * Application settings and update function
   */
  const { settings, updateSettings } = useSettings();

  /**
   * Current audio volume
   */
  const [volume, setVolume] = useState(settings.volume);

  /**
   * Whether audio is muted
   */
  const [isMuted, setIsMuted] = useState(false);

  /**
   * Previous volume before muting
   */
  const [prevVolume, setPrevVolume] = useState(settings.volume);

  /**
   * Total duration of current track
   */
  const [duration, setDuration] = useState(0);

  /**
   * Reference to the audio element
   */
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * URL for the current audio blob
   */
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  /**
   * Debounce volume changes to prevent excessive updates
   */
  const debouncedVolume = useDebounce(volume, 500);

  const { beats } = useBeats();
  const { getNextTrack } = useQueue();

  useEffect(() => {
    if (debouncedVolume !== settings.volume) {
      updateSettings({ volume: debouncedVolume });
    }
  }, [debouncedVolume, settings.volume, updateSettings]);

  useEffect(() => {
    if (audioRef.current) {
      const handleDurationChange = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };

      audioRef.current.addEventListener('durationchange', handleDurationChange);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('durationchange', handleDurationChange);
        }
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const initialVolume = Math.max(0, Math.min(1, settings.volume));

    setVolume(initialVolume);
    setPrevVolume(initialVolume);
    setIsMuted(initialVolume === 0);

    if (audioRef.current) {
      audioRef.current.volume = initialVolume;
    }
  }, [settings.volume]);

  /**
   * Debounce a value over a specified delay
   * @param value The value to debounce
   * @param delay Delay in milliseconds
   * @returns Debounced value
   */
  function useDebounce<T>(value: T, delay: number): T {
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
  }

  /**
   * Change the current playback time of the audio
   * @param time New time position in seconds
   */
  const handleTimelineChange = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  /**
   * Update the audio volume
   * @param newVolume Volume level between 0 and 1
   */
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  /**
   * Toggle audio mute/unmute
   */
  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  /**
   * Play or pause the current track
   * @param track Optional track to play
   */
  const handlePlayPause = async (track?: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track && !currentTrack) return;

    try {
      if (!track || currentTrack?.id === track.id) {
        if (isPlaying) {
          audio.pause();
          updateBeatDetails(null);
        } else {
          await audio.play();
          updateBeatDetails(currentTrack ? {
            name: currentTrack.title,
            producer: currentTrack.artist
          } : null);
        }
        setIsPlaying(!isPlaying);
        return;
      }

      const fileData = await readFile(track.path);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const blob = new Blob([fileData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      setCurrentTrack(track);
      audio.src = url;
      await audio.play();
      setIsPlaying(true);

      updateBeatDetails({
        name: track.title,
        producer: track.artist
      });
    } catch (error) {
      console.error("Fehler beim Laden oder Abspielen:", error);
      setIsPlaying(false);
      updateBeatDetails(null);
    }
  };

  /**
   * Navigate to a specific album
   * @param albumName Name of the album to navigate to
   */
  const handleGoToAlbum = (albumName: string) => {
    setSelectedAlbum(albumName);
    setActivePage("albums");
  };

  const handleTrackEnd = () => {
    // First, check if there's a track in the queue
    const queuedTrack = getNextTrack();
    
    if (queuedTrack) {
      // Play the queued track
      handlePlayPause(queuedTrack);
    } else {
      // If no queued track, play the next track in the library
      const currentIndex = beats.findIndex(beat => beat.id === currentTrack?.id);
      const nextTrackIndex = (currentIndex + 1) % beats.length;
      handlePlayPause(convertBeatToTrack(beats[nextTrackIndex]));
    }
  };

  const handleNext = () => {
    // First, check if there's a track in the queue
    const queuedTrack = getNextTrack();
    
    if (queuedTrack) {
      // Play the queued track
      handlePlayPause(queuedTrack);
    } else {
      // If no queued track, play the next track in the library
      const currentIndex = beats.findIndex(beat => beat.id === currentTrack?.id);
      const nextTrackIndex = (currentIndex + 1) % beats.length;
      handlePlayPause(convertBeatToTrack(beats[nextTrackIndex]));
    }
  };

  const handlePrevious = () => {
    const currentIndex = beats.findIndex(beat => beat.id === currentTrack?.id);
    const previousTrackIndex = (currentIndex - 1 + beats.length) % beats.length;
    handlePlayPause(convertBeatToTrack(beats[previousTrackIndex]));
  };

  // Helper function to convert Beat to Track
  const convertBeatToTrack = (beat: Beat): Track => ({
    id: beat.id,
    name: beat.name,
    title: beat.title,
    path: beat.path,
    artist: beat.artist || 'Unknown Artist',
    album: beat.album || 'Unknown Album',
    coverArt: beat.coverArt,
    duration: beat.duration || '0',
    bpm: beat.bpm || 0,
    format: beat.format,
    size: beat.size,
    lastModified: beat.lastModified,
    isMetadataLoaded: beat.isMetadataLoaded
  });

  return (
    <Router>
      <ThemeProvider>
        <div className="pt-8 flex h-screen bg-[var(--theme-background)] text-[var(--theme-text)]">
          <TitleBar />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              activePage={activePage}
              onNavigate={(page) => {
                setActivePage(page);
                if (page !== "albums") {
                  setSelectedAlbum(null);
                }
              }}
            />
            <div className="flex-1 flex flex-col">
              <main className="flex-1 overflow-y-auto pb-28">
                {selectedAlbum ? (
                  <AlbumDetail
                    albumName={selectedAlbum}
                    onTrackSelect={handlePlayPause}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                ) : activePage === "library" ? (
                  <Library
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onTrackSelect={(track) => handlePlayPause(track)}
                    onPlayPause={() => handlePlayPause()}
                    onGoToAlbum={handleGoToAlbum}
                  />
                ) : activePage === "albums" ? (
                  <AlbumLibrary onGoToAlbum={handleGoToAlbum} />
                ) : (
                  <Settings />
                )}
              </main>
              <PlayerControls
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayPause={() => handlePlayPause()}
                onTimelineChange={handleTimelineChange}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                volume={volume}
                isMuted={isMuted}
                audioRef={audioRef}
                duration={duration}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onTrackEnd={handleTrackEnd}
              />
            </div>
          </div>
          <audio ref={audioRef} />
        </div>
      </ThemeProvider>
    </Router>
  );
}
