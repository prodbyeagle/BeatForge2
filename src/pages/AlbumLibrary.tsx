import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  Music2,
} from "lucide-react";
import { useBeats } from "../contexts/BeatsContext";
import { Track } from "../types/Track";
import { Album } from "../types/Album";
import Button from "../components/Button";

interface AlbumLibraryProps {
  onGoToAlbum: (albumName: string) => void;
}

const AlbumLibrary: React.FC<AlbumLibraryProps> = ({ onGoToAlbum }) => {
  const { beats } = useBeats();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"name" | "artist">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between bg-[var(--theme-surface)] p-3 sm:p-4 rounded-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--theme-text)]">Albums</h1>
          
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
    </div>
  );
};

export default AlbumLibrary;
