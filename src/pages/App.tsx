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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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
