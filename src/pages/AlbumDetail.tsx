import React from 'react';
import { useParams } from 'react-router-dom';
import type { Track } from '../types/Track';
import { useBeats } from '../contexts/BeatsContext';
import type { Beat } from '../types/Beat';
import { Play, Pause, Music2, Clock, Activity } from 'lucide-react';
import Button from '../components/Button';

interface AlbumDetailProps {
  albumName?: string;
  onTrackSelect?: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({
  albumName: propAlbumName,
  onTrackSelect,
  currentTrack,
  isPlaying
}) => {
  const { albumName: routeAlbumName } = useParams<{ albumName: string }>();
  const albumName = propAlbumName || routeAlbumName;
  const { beats } = useBeats();

  const albumTracks: Track[] = beats
    .filter((beat: Beat) => beat.album === albumName)
    .map((beat: Beat): Track => ({
      id: beat.id,
      name: beat.name,
      title: beat.title || beat.name.replace(/\.[^/.]+$/, ''),
      artist: beat.artist || 'Unknown Artist',
      album: beat.album || 'Unknown Album',
      path: beat.path,
      duration: beat.duration || '0:00',
      bpm: beat.bpm || 0,
      coverArt: beat.coverArt,
      isMetadataLoaded: true,
      format: '',
      size: 0,
      lastModified: 0
    }));

  const totalDuration = albumTracks.reduce((total, track) => {
    const [minutes, seconds] = (track.duration || '0:00').split(':').map(Number);
    return total + (minutes * 60 + seconds);
  }, 0);

  const formatTotalDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0
      ? `${hours} hr ${minutes} min`
      : `${minutes} min`;
  };

  const handlePlayAlbum = () => {
    if (onTrackSelect && albumTracks.length > 0) {
      if (isPlaying && currentTrack?.album === albumName) {
        if (currentTrack) {
          onTrackSelect(currentTrack);
        }
      } else {
        onTrackSelect(albumTracks[0]);
      }
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (onTrackSelect) {
      onTrackSelect(track);
    }
  };

  const isAlbumPlaying = isPlaying && currentTrack?.album === albumName;
  const hasCoverArt = albumTracks[0]?.coverArt && albumTracks[0]?.coverArt !== '/default-cover.png';

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Album Header */}
        <div className="relative overflow-hidden bg-[var(--theme-surface)] rounded-xl">
          {/* Background Blur */}
          {hasCoverArt && (
            <div
              className="absolute inset-0 opacity-10 blur-2xl scale-110"
              style={{
                backgroundImage: `url(${albumTracks[0]?.coverArt})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}

          {/* Content */}
          <div className="relative flex flex-col md:flex-row gap-8 items-start p-8">
            {/* Album Cover */}
            <div className="relative group">
              <div className="w-56 h-56 bg-[var(--theme-surface-hover)] rounded-xl overflow-hidden shadow-lg">
                {hasCoverArt ? (
                  <img
                    src={albumTracks[0]?.coverArt}
                    alt={albumName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Music2 size={64} className="text-[var(--theme-text-secondary)]" />
                    <span className="text-sm text-[var(--theme-text-secondary)] text-center px-4 font-medium">
                      No Cover Art
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl" />
              </div>

              <Button
                variant="primary"
                className="absolute bottom-4 right-4 shadow-lg hover:scale-110 transition-transform duration-200 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] w-12 h-12 rounded-full flex items-center justify-center"
                onClick={handlePlayAlbum}
              >
                {isAlbumPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} className="ml-1" />
                )}
              </Button>
            </div>

            {/* Album Info */}
            <div className="flex-1 space-y-6 py-2">
              <div>
                <h1 className="text-4xl font-bold mb-3 text-[var(--theme-text)]">{albumName}</h1>
                <p className="text-lg text-[var(--theme-text-secondary)]">
                  {albumTracks[0]?.artist || 'Unknown Artist'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-[var(--theme-surface-hover)] rounded-full px-4 py-1.5">
                  <Music2 size={16} className="text-[var(--theme-text-secondary)]" />
                  <span className="text-[var(--theme-text-secondary)]">{albumTracks.length} tracks</span>
                </div>

                <div className="flex items-center gap-2 bg-[var(--theme-surface-hover)] rounded-full px-4 py-1.5">
                  <Clock size={16} className="text-[var(--theme-text-secondary)]" />
                  <span className="text-[var(--theme-text-secondary)]">{formatTotalDuration(totalDuration)}</span>
                </div>

                {albumTracks.some(track => (track.bpm ?? 0) > 0) && (
                  <div className="flex items-center gap-2 bg-[var(--theme-surface-hover)] rounded-full px-4 py-1.5">
                    <Activity size={16} className="text-[var(--theme-text-secondary)]" />
                    <span className="text-[var(--theme-text-secondary)]">
                      {Math.round(albumTracks.reduce((sum, track) => sum + (track.bpm ?? 0), 0) / albumTracks.filter(track => (track.bpm ?? 0) > 0).length)} BPM avg
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="bg-[var(--theme-surface)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[auto,1fr,auto] gap-4 px-6 py-3 text-sm font-medium text-[var(--theme-text-secondary)] border-b border-[var(--theme-border)]">
            <div className="w-8">#</div>
            <div>TITLE</div>
            <div className="flex items-center gap-8 pr-4">
              <span className="w-16 text-right">TIME</span>
              <span className="w-16 text-right hidden sm:block">BPM</span>
            </div>
          </div>

          {/* Tracks */}
          <div className="divide-y divide-[var(--theme-border)]">
            {albumTracks.map((track, index) => (
              <div
                key={track.id}
                className={`grid grid-cols-[auto,1fr,auto] gap-4 px-6 py-3 hover:bg-[var(--theme-surface-hover)] transition-all duration-200 cursor-pointer group ${
                  currentTrack?.id === track.id ? 'bg-[var(--theme-surface-hover)]' : ''
                }`}
                onClick={() => handlePlayTrack(track)}
              >
                {/* Track Number/Play Icon */}
                <div className="w-8 flex items-center">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                      currentTrack?.id === track.id ? 'opacity-100' : 'group-hover:opacity-0'
                    }`}>
                      {currentTrack?.id === track.id && (
                        <div className={`text-[var(--theme-accent)] ${isPlaying ? 'animate-pulse' : ''}`}>
                          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </div>
                      )}
                      {currentTrack?.id !== track.id && (
                        <span className="text-[var(--theme-text-secondary)]">{index + 1}</span>
                      )}
                    </span>
                    <Play 
                      size={16} 
                      className={`absolute inset-0 m-auto text-[var(--theme-accent)] transition-opacity duration-200 ${
                        currentTrack?.id === track.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Track Info */}
                <div className="min-w-0 flex flex-col justify-center gap-0.5">
                  <p className={`font-medium truncate ${
                    currentTrack?.id === track.id ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-text)] group-hover:text-[var(--theme-text-hover)]'
                  }`}>
                    {track.title}
                  </p>
                  <p className="text-sm text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-text-secondary-hover)] truncate transition-colors duration-200">
                    {track.artist}
                  </p>
                </div>

                {/* Track Metadata */}
                <div className="flex items-center gap-8 text-sm text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-text-secondary-hover)] transition-colors duration-200">
                  <span className="w-16 text-right tabular-nums">{track.duration}</span>
                  <span className="w-16 text-right hidden sm:block tabular-nums">
                    {track.bpm ?? 0 > 0 ? `${track.bpm}` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
