import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronDown,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search albums..."
              className="w-64 pl-10 pr-4 py-2 rounded-md bg-[var(--theme-surface)] border border-[var(--theme-border)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text-secondary)]"
              size={20}
            />
          </div>

          <div className="relative">
            <Button
              variant="quaternary"
              size="sm"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center"
            >
              Sort by {sortOption} <ChevronDown size={16} className="ml-1" />
            </Button>
            {isSortDropdownOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-[var(--theme-surface)] rounded-md shadow-lg">
                <div
                  className="px-4 py-2 hover:bg-[var(--theme-surface-hover)] cursor-pointer"
                  onClick={() => {
                    setSortOption("name");
                    setIsSortDropdownOpen(false);
                  }}
                >
                  Album Name
                </div>
                <div
                  className="px-4 py-2 hover:bg-[var(--theme-surface-hover)] cursor-pointer"
                  onClick={() => {
                    setSortOption("artist");
                    setIsSortDropdownOpen(false);
                  }}
                >
                  Artist
                </div>
              </div>
            )}
          </div>

          <Button
            variant="quaternary"
            onClick={toggleSortDirection}
            className={`transition-transform ${sortDirection === "desc" ? "rotate-180" : ""
              }`}
          >
            <ArrowUpDown size={20} />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "quaternary"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={20} />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "quaternary"}
            onClick={() => setViewMode("list")}
          >
            <List size={20} />
          </Button>
        </div>
      </div>

      <div
        ref={gridRef}
        className={`
          ${viewMode === "grid"
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            : "grid grid-cols-1 gap-2"
          }
        `}
      >
        {filteredAlbums.map((album) => (
          <div
            key={album.name}
            className={`
              bg-[var(--theme-surface)] rounded-lg p-4 group relative
              ${viewMode === "list" ? "flex items-center space-x-4" : ""}
            `}
          >
            <div
              className={`
                ${viewMode === "grid" ? "h-48 w-full mb-4" : "h-24 w-24"} 
                bg-cover bg-center rounded-lg cursor-pointer
              `}
              style={{ backgroundImage: `url(${album.coverArt})` }}
              onClick={() => onGoToAlbum(album.name)}
            >
              <div className="absolute inset-0 rounded-lg" />
            </div>

            <div className={viewMode === "list" ? "flex-1" : ""}>
              <h3 className="text-lg font-semibold truncate">{album.name}</h3>
              <p className="text-sm text-[var(--theme-text-secondary)] truncate">
                {album.artist}
              </p>
              <div className="text-xs text-[var(--theme-text-secondary)] mt-1">
                {album.totalTracks} Tracks •{" "}
                {formatDuration(album.totalDuration)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumLibrary;
