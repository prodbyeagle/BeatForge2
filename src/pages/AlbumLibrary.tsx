import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  Music2,
  PlusCircle,
} from "lucide-react";
import { useBeats } from "../contexts/BeatsContext";
import { Track } from "../types/Track";
import { Album } from "../types/Album";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { open } from '@tauri-apps/plugin-dialog';

interface AlbumLibraryProps {
  onGoToAlbum: (albumName: string) => void;
}

const AlbumLibrary: React.FC<AlbumLibraryProps> = ({ onGoToAlbum }) => {
  const { beats } = useBeats();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"name" | "artist">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumArtist, setNewAlbumArtist] = useState("");
  const [newAlbumCoverArt, setNewAlbumCoverArt] = useState<string | null>(null);
  const [selectedTracksForAlbum, setSelectedTracksForAlbum] = useState<Track[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const albums: Album[] = useMemo(() => {
    const albumMap = new Map<string, Album>();

    beats.forEach((beat) => {
      const albumName = beat.album || "Unknown Album";

      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, {
          name: albumName,
          artist: beat.artist || "Unknown Artist",
          tracks: [],
          coverArt: beat.coverArt || "/default-cover.png",
          totalTracks: 0,
          totalDuration: 0,
        });
      }

      const album = albumMap.get(albumName)!;

      const track: Track = {
        id: beat.id,
        name: beat.name,
        title: beat.title || beat.name.replace(/\.[^/.]+$/, ""),
        artist: beat.artist || "Unknown Artist",
        album: albumName,
        path: beat.path,
        duration: beat.duration || "0:00",
        bpm: beat.bpm || 0,
        coverArt: beat.coverArt,
        isMetadataLoaded: true,
        format: beat.format || "",
        size: beat.size || 0,
        lastModified: beat.lastModified || 0,
      };

      album.tracks.push(track);
      album.totalTracks++;

      if (track.duration) {
        const [minutes, seconds] = track.duration.split(":").map(Number);
        album.totalDuration += minutes * 60 + seconds;
      }
    });

    return Array.from(albumMap.values());
  }, [beats]);

  const unassignedTracks = useMemo(() => {
    const tracks = beats.filter(beat => 
      !beat.album || beat.album.toLowerCase() === "unknown album"
    ).map(beat => ({
      id: beat.id,
      name: beat.name,
      title: beat.title || beat.name.replace(/\.[^/.]+$/, ""),
      artist: beat.artist || "Unknown Artist",
      album: "",
      path: beat.path,
      duration: beat.duration || "0:00",
      bpm: beat.bpm || 0,
      coverArt: beat.coverArt,
      isMetadataLoaded: true,
      format: beat.format || "",
      size: beat.size || 0,
      lastModified: beat.lastModified || 0,
    }));

    console.log('Unassigned Tracks Debug:', {
      totalBeats: beats.length,
      unassignedTracksCount: tracks.length,
      unassignedTracks: tracks,
      beatsWithAlbum: beats.filter(beat => beat.album && beat.album.toLowerCase() !== "unknown album"),
      beatsWithoutAlbum: beats.filter(beat => !beat.album || beat.album.toLowerCase() === "unknown album")
    });

    return tracks;
  }, [beats]);

  const filteredAlbums = useMemo(() => {
    const filtered = albums.filter(
      (album) =>
        album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "artist":
          comparison = a.artist.localeCompare(b.artist);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [albums, searchQuery, sortOption, sortDirection]);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  };

  const handleSelectCoverArt = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Image',
          extensions: ['png', 'jpeg', 'jpg', 'webp']
        }]
      });

      if (selected) {
        setNewAlbumCoverArt(selected as string);
      }
    } catch (error) {
      console.error('Error selecting cover art:', error);
    }
  };

  const handleCreateAlbum = () => {
    if (!newAlbumName) {
      // TODO: Add proper error handling/toast
      console.error('Album name is required');
      return;
    }

    // TODO: Implement actual album creation logic
    console.log('Creating album:', {
      name: newAlbumName,
      artist: newAlbumArtist,
      coverArt: newAlbumCoverArt,
      tracks: selectedTracksForAlbum
    });

    // Reset modal state
    setIsCreateAlbumModalOpen(false);
    setNewAlbumName("");
    setNewAlbumArtist("");
    setNewAlbumCoverArt(null);
    setSelectedTracksForAlbum([]);
  };

  const toggleTrackSelection = (track: Track) => {
    setSelectedTracksForAlbum(prev => 
      prev.includes(track) 
        ? prev.filter(t => t.id !== track.id)
        : [...prev, track]
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between bg-[var(--theme-surface)] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--theme-text)]">Albums</h1>
            <Button 
              variant="secondary" 
              onClick={() => setIsCreateAlbumModalOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Create Album
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[240px] md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text-secondary)]" size={18} />
              <input
                type="text"
                placeholder="Search albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-background)] text-[var(--theme-text)] placeholder-[var(--theme-text-secondary)] focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative sm:self-stretch">
              <Button
                variant="secondary"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 hover:bg-[var(--theme-surface-hover)] h-10 w-full sm:w-auto justify-center"
              >
                <ArrowUpDown size={18} />
                <ChevronDown size={18} />
              </Button>
              
              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--theme-surface)] rounded-lg shadow-lg border border-[var(--theme-border)] py-1 z-10">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)]"
                    onClick={() => {
                      setSortOption("name");
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    Sort by Name
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)]"
                    onClick={() => {
                      setSortOption("artist");
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    Sort by Artist
                  </button>
                  <div className="border-t border-[var(--theme-border)] my-1" />
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)]"
                    onClick={() => {
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    {sortDirection === "asc" ? "Ascending" : "Descending"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Albums Grid */}
        <div ref={gridRef} className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredAlbums.map((album) => (
            <div
              key={album.name}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:shadow-xl hover:scale-[1.02]"
              onClick={() => onGoToAlbum(album.name)}
            >
              <div className="w-full h-full relative">
                {album.coverArt && album.coverArt !== "/default-cover.png" ? (
                  <img
                    src={album.coverArt}
                    alt={album.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--theme-surface-hover)] gap-3">
                    <Music2 size={48} className="text-[var(--theme-text-secondary)]" />
                    <div className="text-sm text-[var(--theme-text-secondary)] text-center px-4">
                      <span className="font-medium">{album.name}</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 group-hover:from-black/20 group-hover:to-black/80 transition-all duration-300" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
                  <div className="text-white">
                    <h3 className="font-semibold text-lg truncate mb-0.5">{album.name}</h3>
                    <p className="text-sm text-white/80 truncate">{album.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/90 font-medium backdrop-blur-sm bg-black/30 rounded-full px-3 py-1 w-fit">
                    <span>{album.totalTracks} tracks</span>
                    <span className="opacity-60">•</span>
                    <span>{formatDuration(album.totalDuration)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Album Modal */}
      <Modal
        isOpen={isCreateAlbumModalOpen}
        onClose={() => setIsCreateAlbumModalOpen(false)}
        title="Create New Album"
        description="Add details for your new album"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Album Name</label>
            <input 
              type="text" 
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter album name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Artist</label>
            <input 
              type="text" 
              value={newAlbumArtist}
              onChange={(e) => setNewAlbumArtist(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter artist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Art</label>
            <div className="flex items-center gap-4">
              <Button 
                variant="secondary" 
                onClick={handleSelectCoverArt}
              >
                Select Cover Art
              </Button>
              {newAlbumCoverArt && (
                <img 
                  src={newAlbumCoverArt} 
                  alt="Album Cover" 
                  className="w-20 h-20 object-cover rounded-md" 
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Add Tracks</h3>
            <div className="max-h-64 overflow-y-auto border rounded-md">
              {unassignedTracks.map(track => (
                <div 
                  key={track.id} 
                  className={`flex items-center p-2 border-b hover:bg-[var(--theme-surface-hover)] cursor-pointer ${
                    selectedTracksForAlbum.includes(track) ? 'bg-[var(--theme-accent)] bg-opacity-20' : ''
                  }`}
                  onClick={() => toggleTrackSelection(track)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedTracksForAlbum.includes(track)}
                    onChange={() => toggleTrackSelection(track)}
                    className="mr-3"
                  />
                  <div className="flex-1 flex items-center">
                    <div className="flex-1">
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-[var(--theme-text-secondary)]">
                        {track.artist} • {track.duration}
                      </div>
                    </div>
                    <div className="text-xs text-[var(--theme-text-secondary)] ml-4">
                      {track.format.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button 
              variant="secondary" 
              onClick={() => setIsCreateAlbumModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateAlbum}
              disabled={!newAlbumName}
            >
              Create Album
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlbumLibrary;
