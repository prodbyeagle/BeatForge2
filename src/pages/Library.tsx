import { Play, Pause, Trash2, Search, LayoutGrid, List, MoreVertical, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Track } from '../types/Track';
import { useBeats } from '../contexts/BeatsContext';
import { useSettings } from '../contexts/SettingsContext';

interface LibraryProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onPlayPause: () => void;
}

const Library = ({ currentTrack, isPlaying, onTrackSelect, onPlayPause }: LibraryProps) => {
  const { beats, isLoading, error, refreshBeats } = useBeats();
  const { settings, updateSettings } = useSettings();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'title' | 'artist' | 'album'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Memoized tracks conversion for better performance
  const tracks: Track[] = useMemo(() => beats.map(beat => ({
    id: beat.id,
    name: beat.name,
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

  // Memoized filtered and sorted tracks
  const filteredTracks = useMemo(() => {
    // First filter
    const filtered = tracks.filter(track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.album || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then sort
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

  const handlePlayPause = (track: Track) => {
    if (!isPlaying) {
      onTrackSelect(track);
    }
    onPlayPause();
  };

  const handleTrackAction = (track: Track) => {
    setSelectedTrack(track);
    setIsActionModalOpen(true);
  };

  const SortDropdown = () => {
    const sortOptions = [
      { value: 'title', label: 'Title' },
      { value: 'artist', label: 'Artist' },
      { value: 'album', label: 'Album' }
    ];

    return (
      <div className="relative">
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={() => {
            setIsSortDropdownOpen(!isSortDropdownOpen);
          }}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>{sortOption}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
        </Button>
        {isSortDropdownOpen && (
          <div
            className="absolute z-10 right-0 mt-1 bg-[var(--theme-secondary)] rounded-lg shadow-lg overflow-hidden"
            onBlur={() => setIsSortDropdownOpen(false)}
          >
            {sortOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-[var(--theme-tertiary)]/10 ${sortOption === option.value ? 'bg-[var(--theme-tertiary)]/20' : ''}`}
                onClick={() => {
                  setSortOption(option.value as any);
                  setIsSortDropdownOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
            <div
              className="px-4 py-2 cursor-pointer hover:bg-[var(--theme-tertiary)]/10 border-t border-[var(--theme-tertiary)]/10"
              onClick={() => {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                setIsSortDropdownOpen(false);
              }}
            >
              {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
            </div>
          </div>
        )}
      </div>
    );
  };

  const GridView = () => (
    <div
      ref={gridRef}
      className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-6"
    >
      {filteredTracks.map((track) => (
        <div
          key={track.id}
          className="group relative h-52 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(var(--theme-quaternary-rgb),0.25)]"
          style={{
            backgroundImage: `url(${track.coverArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onDoubleClick={() => {
            onTrackSelect(track);
            if (!isPlaying) {
              onPlayPause();
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[2px]" />

          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium mb-1 truncate">{track.title}</h3>
                <p className="text-sm text-[var(--theme-tertiary)]/80 truncate">{track.artist}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[var(--theme-secondary)]/80 backdrop-blur-sm hover:bg-[var(--theme-secondary)]"
                onClick={() => handleTrackAction(track)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-[var(--theme-tertiary)]/80 mb-3">
                <span>{track?.album || 'Unknown Album'}</span>
                <span className="text-[var(--theme-tertiary)]/40">•</span>
                <span>{track.key}</span>
                <span className="text-[var(--theme-tertiary)]/40">•</span>
                <span>{track.duration}</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[var(--theme-secondary)]/80 backdrop-blur-sm hover:bg-[var(--theme-secondary)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause(track);
                }}
              >
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause className="w-5 h-5 mr-2" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div ref={listRef} className="overflow-y-auto p-6">
      <div className="divide-y divide-[var(--theme-tertiary)]">
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center justify-between py-4 hover:bg-[var(--theme-secondary)]/5 transition-all duration-300 group cursor-pointer rounded-xl px-4 -mx-4"
            onDoubleClick={() => {
              onTrackSelect(track);
              if (!isPlaying) {
                onPlayPause();
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${track.coverArt})` }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl bg-black/40 backdrop-blur-sm hover:bg-black/60"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(track);
                  }}
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
              </div>
              <div>
                <h3 className="font-medium mb-1">{track.title}</h3>
                <p className="text-sm text-[var(--theme-tertiary)]/70">{track.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 text-sm text-[var(--theme-tertiary)]/70">
                <span>{track?.album || 'Unknown Album'}</span>
                <span className="text-[var(--theme-tertiary)]/40">•</span>
                <span>{track.key}</span>
                <span className="text-[var(--theme-tertiary)]/40">•</span>
                <span>{track.duration}</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[var(--theme-secondary)]/80 backdrop-blur-sm hover:bg-[var(--theme-secondary)]"
                onClick={() => handleTrackAction(track)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 p-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="group relative bg-[var(--theme-secondary)] rounded-xl overflow-hidden backdrop-blur-xl border border-[var(--theme-tertiary)]/10"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="aspect-square w-full bg-[var(--theme-tertiary)] animate-pulse" />
          <div className="p-3 space-y-3">
            <div className="h-5 w-3/4 bg-[var(--theme-tertiary)] rounded-full animate-pulse" 
                 style={{ animationDelay: `${i * 100 + 100}ms` }} />

            <div className="h-4 w-1/2 bg-[var(--theme-tertiary)] rounded-full animate-pulse"
                 style={{ animationDelay: `${i * 100 + 200}ms` }} />

            <div className="flex items-center gap-2">
              <div className="h-3 w-12 bg-[var(--theme-tertiary)] rounded-full animate-pulse"
                   style={{ animationDelay: `${i * 100 + 300}ms` }} />
              <div className="h-3 w-12 bg-[var(--theme-tertiary)] rounded-full animate-pulse"
                   style={{ animationDelay: `${i * 100 + 400}ms` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Save scroll position when scrolling
  useEffect(() => {
    const currentRef = settings.viewMode === 'grid' ? gridRef.current : listRef.current;

    const handleScroll = () => {
      if (currentRef) {
        updateSettings({ scrollPosition: currentRef.scrollTop });
      }
    };

    currentRef?.addEventListener('scroll', handleScroll);
    return () => currentRef?.removeEventListener('scroll', handleScroll);
  }, [settings.viewMode]);

  // Restore scroll position after track selection or view mode change
  useEffect(() => {
    const currentRef = settings.viewMode === 'grid' ? gridRef.current : listRef.current;
    if (currentRef) {
      currentRef.scrollTop = settings.scrollPosition;
    }
  }, [currentTrack, settings.viewMode, settings.scrollPosition]);

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-6 border-b border-[var(--theme-tertiary)]">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-3xl font-bold">Library</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-tertiary)]/50" />
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-[var(--theme-secondary)] border border-[var(--theme-tertiary)]/10 focus:border-[var(--theme-tertiary)] transition-all duration-300"
              />
            </div>
            <SortDropdown />
            <div className="flex bg-[var(--theme-secondary)] rounded-xl p-1 border border-[var(--theme-tertiary)]">
              <Button
                variant={settings.viewMode === 'grid' ? 'primary' : 'secondary'}
                onClick={() => updateSettings({ viewMode: 'grid' })}
                className="rounded-lg transition-all duration-300"
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button
                variant={settings.viewMode === 'list' ? 'primary' : 'secondary'}
                onClick={() => updateSettings({ viewMode: 'list' })}
                className="rounded-lg transition-all duration-300"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--theme-primary)]">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h3 className="text-xl font-medium mb-2">Error Loading Library</h3>
            <p className="text-[var(--theme-tertiary)]/70 mb-4">{error}</p>
            <Button onClick={refreshBeats} className="transition-all duration-300 hover:-translate-y-0.5">Try Again</Button>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[var(--theme-tertiary)]/70 mb-2">No tracks found</p>
            <p className="text-sm text-[var(--theme-tertiary)]/50">
              {searchQuery ? 'Try a different search term' : 'Add some tracks to get started'}
            </p>
          </div>
        ) : (
          settings.viewMode === 'grid' ? <GridView /> : <ListView />
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={selectedTrack?.title}
      >
        <div className="space-y-4">
          {/* Cover Art and Basic Info */}
          <div className="flex gap-4">
            <div
              className="w-24 h-24 rounded-xl bg-cover bg-center bg-[var(--theme-secondary)] border border-[var(--theme-tertiary)]/10"
              style={{ backgroundImage: selectedTrack?.coverArt ? `url(${selectedTrack?.coverArt})` : 'none' }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-1">{selectedTrack?.title}</h3>
              <p className="text-sm text-[var(--theme-tertiary)]/70 mb-3">{selectedTrack?.artist}</p>
              <div className="flex items-center gap-3 text-sm text-[var(--theme-tertiary)]/70">
                <span>{selectedTrack?.format?.toUpperCase()}</span>
                <span>•</span>
                <span>{selectedTrack?.duration}</span>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--theme-secondary)]/10">
            <div>
              <div className="text-xs text-[var(--theme-tertiary)]/70 mb-1">BPM</div>
              <div className="font-medium">{selectedTrack?.bpm || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--theme-tertiary)]/70 mb-1">Key</div>
              <div className="font-medium">{selectedTrack?.key || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--theme-tertiary)]/70 mb-1">File Size</div>
              <div className="font-medium">
                {selectedTrack?.size ? `${Math.round(selectedTrack.size / 1024 / 1024 * 100) / 100} MB` : 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--theme-tertiary)]/70 mb-1">Location</div>
              <div className="font-medium truncate" title={selectedTrack?.path}>
                {selectedTrack?.path.split('/').slice(-2).join('/')}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <Button
              variant="primary"
              leftIcon={<Trash2 size={18} />}
              className="w-full justify-start hover:translate-y-[-2px] transition-transform"
              onClick={() => {
                setIsActionModalOpen(false);
                setIsDeleteModalOpen(true);
              }}
            >
              Delete Beat
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Beat"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete "{selectedTrack?.title}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Delete track
                setIsDeleteModalOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Library;
