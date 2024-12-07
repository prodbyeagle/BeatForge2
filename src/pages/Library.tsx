import { useState, useMemo } from 'react';
import { Track } from '../types/Track';
import { useBeats } from '../contexts/BeatsContext';
import { useSettings } from '../contexts/SettingsContext';
import * as realtimeBpm from 'realtime-bpm-analyzer';
import { readFile } from '@tauri-apps/plugin-fs';

import LibraryHeader from '../components/Library/LibraryHeader';
import GridView from '../components/Library/GridView';
import ListView from '../components/Library/ListView';
import LoadingSkeleton from '../components/Library/LoadingSkeleton';
import TrackActionModal from '../components/Library/TrackActionModal';
import DeleteConfirmationModal from '../components/Library/DeleteConfirmationModal';
import ContextMenu from '../components/ContextMenu';
import Button from '../components/Button';
import BPMModal from '../components/BPMModal'; // Assuming you have a BPMModal component

interface LibraryProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onPlayPause: () => void;
  onGoToAlbum?: (album: string) => void;
}

const Library: React.FC<LibraryProps> = ({
  currentTrack,
  isPlaying,
  onTrackSelect,
  onPlayPause,
  onGoToAlbum
}) => {
  const { beats, isLoading, error, refreshBeats, updateBeat } = useBeats();
  const { settings, updateSettings } = useSettings();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'title' | 'artist' | 'album'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; track: Track } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [isBPMModalOpen, setIsBPMModalOpen] = useState(false);
  const [selectedTrackForBPM, setSelectedTrackForBPM] = useState<Track | null>(null);

  const tracks: Track[] = useMemo(() => beats.map(beat => ({
    id: beat.id,
    name: beat.name || beat.name.replace(/\.[^/.]+$/, ''),
    title: beat.title || beat.name.replace(/\.[^/.]+$/, ''),
    artist: beat.artist || 'Unknown Artist',
    album: beat.album || 'Unknown Album',
    path: beat.path,
    duration: beat.duration || '0:00',
    bpm: beat.bpm || 0,
    key: beat.key || 'Unknown',
    format: beat.format,
    coverArt: beat.coverArt,
    size: beat.size,
    lastModified: beat.lastModified,
    isMetadataLoaded: beat.isMetadataLoaded
  })), [beats]);

  const filteredTracks = useMemo(() => {
    const filtered = tracks.filter(track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.album || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'artist':
          comparison = (a.artist || '').localeCompare(b.artist || '');
          break;
        case 'album':
          comparison = (a.album || '').localeCompare(b.album || '');
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tracks, searchQuery, sortOption, sortDirection]);

  const analyzeBPM = async (track: Track) => {
    if (track.bpm !== 0 || isAnalyzing) return;

    try {
      setIsAnalyzing(track.id);
      
      const audioContext = new AudioContext();
      const fileData = await readFile(track.path);
      const arrayBuffer = fileData.buffer;
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const result = await realtimeBpm.analyzeFullBuffer(audioBuffer);
      
      if (result && result.length > 0) {
        const detectedBPM = Math.round(result[0].tempo);
        
        await updateBeat({
          ...track,
          bpm: detectedBPM
        });
      }
    } catch (error) {
      console.error('Error analyzing BPM:', error);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleAnalyzeBPM = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    await analyzeBPM(track);
  };

  const handleTrackAction = (track: Track) => {
    setSelectedTrack(track);
    setIsActionModalOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      track
    });
  };

  const handleEditTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsActionModalOpen(true);
  };

  const handleManualBPMEntry = async (bpm: number) => {
    if (selectedTrackForBPM) {
      try {
        await updateBeat({
          ...selectedTrackForBPM,
          bpm: bpm
        });
        setIsBPMModalOpen(false);
        setSelectedTrackForBPM(null);
      } catch (error) {
        console.error('Error updating BPM:', error);
      }
    }
  };

  const handleBulkBPMAnalysis = async () => {
    try {
      setIsAnalyzing('bulk');
      for (const track of tracks) {
        if (track.bpm === 0) {
          await analyzeBPM(track);
        }
      }
    } catch (error) {
      console.error('Error in bulk BPM analysis:', error);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const openBPMModal = (track: Track) => {
    setSelectedTrackForBPM(track);
    setIsBPMModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <LibraryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        isSortDropdownOpen={isSortDropdownOpen}
        setIsSortDropdownOpen={setIsSortDropdownOpen}
        settings={settings}
        updateSettings={updateSettings}
        handleBulkBPMAnalysis={handleBulkBPMAnalysis}
      />

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h3 className="text-xl font-medium mb-2">Error Loading Library</h3>
            <p className="text-[var(--theme-text)] mb-4">{error}</p>
            <Button onClick={refreshBeats} className="transition-all duration-300 hover:-translate-y-0.5">Try Again</Button>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[var(--theme-text)] mb-2">No tracks found</p>
            <p className="text-sm text-[var(--theme-text)]">
              {searchQuery ? 'Try a different search term' : 'Add some tracks to get started'}
            </p>
          </div>
        ) : (
          settings.viewMode === 'grid' ? (
            <GridView
              filteredTracks={filteredTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTrackSelect={onTrackSelect}
              onPlayPause={onPlayPause}
              handleContextMenu={handleContextMenu}
            />
          ) : (
            <ListView
              filteredTracks={filteredTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTrackSelect={onTrackSelect}
              onPlayPause={onPlayPause}
              handleContextMenu={handleContextMenu}
              handleTrackAction={handleTrackAction}
            />
          )
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          track={contextMenu.track}
          onClose={() => setContextMenu(null)}
          onEdit={handleEditTrack}
          onPlay={(track) => {
            onTrackSelect(track);
            if (!isPlaying) {
              onPlayPause();
            }
          }}
          onAnalyzeBPM={contextMenu.track.bpm === 0 ? handleAnalyzeBPM : undefined}
          isAnalyzing={isAnalyzing === contextMenu.track.id}
          onGoToAlbum={onGoToAlbum}
          openBPMModal={openBPMModal}
        />
      )}

      <TrackActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        selectedTrack={selectedTrack}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        selectedTrack={selectedTrack}
      />

      <BPMModal
        isOpen={isBPMModalOpen}
        onClose={() => setIsBPMModalOpen(false)}
        selectedTrack={selectedTrackForBPM}
        onManualBPMEntry={handleManualBPMEntry}
      />
    </div>
  );
};

export default Library;
