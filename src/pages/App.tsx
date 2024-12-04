import { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { readFile } from "@tauri-apps/plugin-fs";
import Sidebar from "../components/Sidebar";
import Library from "./Library";
import AlbumDetail from "./AlbumDetail";
import AlbumLibrary from "./AlbumLibrary";
import Settings from "./Settings";
import { ThemeProvider } from "../contexts/ThemeContext";
import { BeatsProvider } from "../contexts/BeatsContext";
import { useSettings } from "../contexts/SettingsContext";
import TitleBar from "../components/TitleBar";
import PlayerControls from "../components/PlayerControls";
import { Track } from "../types/Track";

export default function App() {
  const [activePage, setActivePage] = useState<
    "library" | "settings" | "albums"
  >("library");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const { settings, updateSettings } = useSettings();
  const [volume, setVolume] = useState(settings.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(settings.volume);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const debouncedVolume = useDebounce(volume, 500);

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

  const handleTimelineChange = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

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

  const handlePlayPause = async (track?: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track && !currentTrack) return;

    try {
      if (!track || currentTrack?.id === track.id) {
        if (isPlaying) {
          audio.pause();
        } else {
          await audio.play();
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
    } catch (error) {
      console.error("Fehler beim Laden oder Abspielen:", error);
      setIsPlaying(false);
    }
  };

  const handleGoToAlbum = (albumName: string) => {
    setSelectedAlbum(albumName);
    setActivePage("albums");
  };

  return (
    <Router>
      <ThemeProvider>
        <BeatsProvider>
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
                />
              </div>
            </div>
            <audio ref={audioRef} />
          </div>
        </BeatsProvider>
      </ThemeProvider>
    </Router>
  );
}
