import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Library from './Library';
import Settings from './Settings';
import { ThemeProvider } from '../contexts/ThemeContext';
import { BeatsProvider } from '../contexts/BeatsContext';
import TitleBar from '../components/TitleBar';
import PlayerControls from '../components/PlayerControls';
import { Track } from '../types/Track';

export default function App() {
  const [activePage, setActivePage] = useState<'library' | 'settings'>('library');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = (track?: Track) => {
    if (track) {
      if (currentTrack?.id === track.id) {
        setIsPlaying(!isPlaying);
      } else {
        setCurrentTrack(track);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <ThemeProvider>
      <BeatsProvider>
        <div className="pt-8 flex h-screen bg-[var(--theme-primary)] text-[var(--theme-tertiary)]">
          <TitleBar />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              activePage={activePage}
              onNavigate={(page: 'library' | 'settings') => setActivePage(page)}
            />
            <main className="flex-1 overflow-y-auto pb-28">
              {activePage === 'library' ? (
                <Library
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onTrackSelect={setCurrentTrack}
                  onPlayPause={() => handlePlayPause()}
                />
              ) : (
                <Settings />
              )}
            </main>
          </div>
          <PlayerControls
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={() => handlePlayPause()}
          />
        </div>
      </BeatsProvider>
    </ThemeProvider>
  );
}