import React from 'react';
import { useParams } from 'react-router-dom';
import { Track } from '../types/Track';
import { useBeats } from '../contexts/BeatsContext';
import type { Beat } from '../contexts/BeatsContext';
import { Play, Pause } from 'lucide-react';
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
      // Wenn der aktuelle Track aus diesem Album ist und spielt, pausieren
      if (isPlaying && currentTrack?.album === albumName) {
        // Stelle sicher, dass currentTrack nicht null ist
        if (currentTrack) {
          onTrackSelect(currentTrack);
        }
      } else {
        // Sonst den ersten Track des Albums abspielen
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

  return (
    <div className="p-8 bg-[var(--theme-background)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="relative group">
            <div
              className="w-48 h-48 bg-cover bg-center rounded-lg shadow-lg"
              style={{
                backgroundImage: `url(${albumTracks[0]?.coverArt || '/default-cover.png'})`
              }}
            />
            <Button
              variant="primary"
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePlayAlbum}
            >
              {isAlbumPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
          </div>
          <div className="ml-8">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mb-2">{albumName}</h1>
              <Button
                variant="primary"
                className="ml-4"
                onClick={handlePlayAlbum}
              >
                {isAlbumPlaying ? 'Pause' : 'Play Album'}
              </Button>
            </div>
            <p className="text-sm text-[var(--theme-text-secondary)]">
              {albumTracks[0]?.artist || 'Unknown Artist'}
            </p>
            <div className="mt-4 text-sm text-[var(--theme-text-secondary)]">
              {albumTracks.length} Tracks • {formatTotalDuration(totalDuration)}
            </div>
          </div>
        </div>

        <div className="bg-[var(--theme-surface)] rounded-lg p-4">
          <ul>
            {albumTracks.map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              const isTrackPlaying = isPlaying && isCurrentTrack;

              return (
                <li
                  key={track.id}
                  className="flex items-center p-2 hover:bg-[var(--theme-surface-hover)] rounded-md transition-colors group"
                >
                  <div className="w-8 mr-4 flex items-center justify-center">
                    <span className="text-[var(--theme-text-secondary)] group-hover:hidden">
                      {index + 1}
                    </span>
                    <Button
                      variant="quaternary"
                      className="hidden group-hover:flex items-center justify-center"
                      onClick={() => handlePlayTrack(track)}
                    >
                      {isTrackPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isCurrentTrack ? 'text-[var(--theme-primary)]' : ''}`}>
                      {track.title}
                    </div>
                    <div className="text-sm text-[var(--theme-text-secondary)]">{track.artist}</div>
                  </div>
                  <span className="text-[var(--theme-text-secondary)]">{track.duration}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
