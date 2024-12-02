import { Play, Pause, Download, Share2, Trash2, Search, LayoutGrid, List, MoreVertical, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Track } from '../types/Track';
import { useBeats } from '../contexts/BeatsContext';

interface LibraryProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onPlayPause: () => void;
}

const Library = ({ currentTrack, isPlaying, onTrackSelect, onPlayPause }: LibraryProps) => {
  const { beats, isLoading, error, refreshBeats } = useBeats();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [sortOption, setSortOption] = useState<'title' | 'artist'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Memoized tracks conversion for better performance
  const tracks: Track[] = useMemo(() => beats.map(beat => ({
    id: beat.path || `beat-${Math.random().toString(36).substr(2, 9)}`,
    title: beat.name.replace(/\.[^/.]+$/, ''),
    artist: beat.artist || 'Unknown Artist',
    path: beat.path || '',
    duration: beat.duration || '0:00',
    bpm: 0, // Default value since Beat type doesn't have bpm
    key: 'Unknown', // Default value since Beat type doesn't have key
    format: beat.format,
    coverArt: beat.coverArt
  })), [beats]);

  // Memoized filtered and sorted tracks
  const filteredTracks = useMemo(() => {
    // First filter
    const filtered = tracks.filter(track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      { value: 'duration', label: 'Duration' }
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
      className="h-full overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6"
    >
      {filteredTracks.map((track) => (
        <div
          key={track.id}
          className="group relative h-64 rounded-xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1"
          style={{
            backgroundImage: `url(${track.coverArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onDoubleClick={() => handlePlayPause(track)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          </div>

          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium mb-1">{track.title}</h3>
                <p className="text-sm text-[var(--theme-tertiary)]/70">{track.artist}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleTrackAction(track)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 text-sm text-[var(--theme-tertiary)]/70">
              <span>{track.bpm} BPM</span>
              <span>•</span>
              <span>{track.key}</span>
              <span>•</span>
              <span>{track.duration}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div ref={listRef} className="h-full overflow-y-auto">
      <div className="divide-y divide-[var(--theme-tertiary)]/10">
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center justify-between p-4 hover:bg-[var(--theme-secondary)]/10 transition-colors group cursor-pointer"
            onDoubleClick={() => handlePlayPause(track)}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${track.coverArt})` }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-black/40 backdrop-blur-sm"
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
                <span>{track.bpm} BPM</span>
                <span>•</span>
                <span>{track.key}</span>
                <span>•</span>
                <span>{track.duration}</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-64 rounded-xl overflow-hidden bg-[var(--theme-secondary)]/10 animate-pulse"
        />
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-6 border-b border-[var(--theme-tertiary)]/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Library</h1>
          <div className="flex items-center gap-2">
            <div className="relative mr-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-tertiary)]/50" />
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-[var(--theme-secondary)]/10 focus:bg-[var(--theme-secondary)]/20 transition-colors"
              />
            </div>
            <SortDropdown />
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('grid')}
              className="transition-colors"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
              className="transition-colors"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h3 className="text-xl font-medium mb-2">Error Loading Library</h3>
            <p className="text-[var(--theme-tertiary)]/70 mb-4">{error}</p>
            <Button onClick={refreshBeats}>Try Again</Button>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[var(--theme-tertiary)]/70 mb-2">No tracks found</p>
            <p className="text-sm text-[var(--theme-tertiary)]/50">
              {searchQuery ? 'Try a different search term' : 'Add some tracks to get started'}
            </p>
          </div>
        ) : (
          viewMode === 'grid' ? <GridView /> : <ListView />
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={selectedTrack?.title}
      >
        <div className="space-y-2">
          <div className="pb-4 mb-4 border-b border-[var(--theme-secondary)]/20">
            <div className="text-sm opacity-60">Details</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <div className="text-xs opacity-60">BPM</div>
                <div>{selectedTrack?.bpm}</div>
              </div>
              <div>
                <div className="text-xs opacity-60">Key</div>
                <div>{selectedTrack?.key}</div>
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            leftIcon={<Download size={18} />}
            className="w-full justify-start hover:translate-y-[-2px] transition-transform"
          >
            Download
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Share2 size={18} />}
            className="w-full justify-start hover:translate-y-[-2px] transition-transform"
          >
            Share
          </Button>
          <Button
            variant="quaternary"
            leftIcon={<Trash2 size={18} />}
            className="w-full justify-start hover:translate-y-[-2px] transition-transform"
            onClick={() => {
              setIsActionModalOpen(false);
              setIsDeleteModalOpen(true);
            }}
          >
            Delete
          </Button>
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
              variant="quaternary"
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
