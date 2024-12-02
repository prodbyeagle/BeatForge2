import { Play, Pause, Download, Share2, Trash2, Search, LayoutGrid, List, MoreVertical } from 'lucide-react';
import { useState, Dispatch, SetStateAction } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Track } from '../types/Track';
import { useBeats } from '../contexts/BeatsContext';

interface LibraryProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: Dispatch<SetStateAction<Track | null>>;
  onPlayPause: () => void;
}

const Library = ({ currentTrack, isPlaying, onTrackSelect, onPlayPause }: LibraryProps) => {
  const { beats, isLoading, error, refreshBeats } = useBeats();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Convert beats to tracks
  const tracks: Track[] = beats.map(beat => ({
    id: beat.path || `beat-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
    title: beat.name.replace(/\.[^/.]+$/, ''), // Remove file extension
    artist: beat.artist || 'Unknown Artist',
    path: beat.path,
    duration: beat.duration || '0:00',
    bpm: 0, // Could be extracted from audio file later
    key: 'Unknown', // Could be extracted from audio file later
    format: beat.format,
    coverArt: beat.coverArt
  }));

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.artist?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id) {
      onPlayPause();
    } else {
      onTrackSelect(track);
    }
  };

  const handleTrackAction = (track: Track) => {
    setSelectedTrack(track);
    setIsActionModalOpen(true);
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      {filteredTracks.map((track) => (
        <div
          key={track.id}
          className="group relative h-64 rounded-xl overflow-hidden cursor-pointer"
          style={{
            backgroundImage: `url(${track.coverArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onDoubleClick={() => handlePlayPause(track)}
        >
          {/* Blur overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              className="w-16 h-16 rounded-full bg-[var(--theme-tertiary)]/20 hover:bg-[var(--theme-tertiary)]/30 backdrop-blur-xl"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(track);
              }}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Content */}
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

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[var(--theme-secondary)]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );

  const ListView = () => (
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
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--theme-tertiary)]/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Library</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--theme-tertiary)]/50" />
          <input
            type="text"
            placeholder="Search beats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--theme-secondary)]/10 text-[var(--theme-tertiary)] placeholder-[var(--theme-tertiary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-tertiary)]/20"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-[var(--theme-tertiary)]/70">Loading beats...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-[var(--theme-tertiary)]/70">{error}</p>
            <Button onClick={refreshBeats} variant="primary">
              Try Again
            </Button>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <p className="text-[var(--theme-tertiary)]/70">No beats found</p>
            <p className="text-sm text-[var(--theme-tertiary)]/50">
              {searchQuery ? 'Try a different search term' : 'Add some beats to get started'}
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
