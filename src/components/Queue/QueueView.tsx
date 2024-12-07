import React from 'react';
import { X, Music } from 'lucide-react';
import { useQueue } from '../../contexts/QueueContext';
import { Track } from '../../types/Track';

interface QueueViewProps {
  onClose: () => void;
  currentTrack: Track | null;
}

export const QueueView: React.FC<QueueViewProps> = ({ onClose, currentTrack }) => {
  const { queue, removeFromQueue } = useQueue();

  return (
    <div className="absolute bottom-24 right-4 w-80 bg-[var(--theme-surface)] rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
        <h2 className="text-lg font-semibold">Queue</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--theme-surface-hover)] rounded-lg transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {currentTrack && (
          <div className="p-4 border-b border-[var(--theme-border)]">
            <div className="text-sm opacity-60 mb-2">Now Playing</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-center bg-cover flex-shrink-0" 
                style={{ backgroundImage: `url(${currentTrack.coverArt || '/default-cover.png'})` }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{currentTrack.title}</div>
                <div className="text-xs opacity-60 truncate">
                  {currentTrack.artist || 'Unknown Artist'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="text-sm opacity-60 mb-2">Next Up</div>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
              <Music className="w-12 h-12 mb-2" />
              <p className="text-sm">No tracks in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-center bg-cover flex-shrink-0" 
                    style={{ backgroundImage: `url(${track.coverArt || '/default-cover.png'})` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{track.title}</div>
                    <div className="text-xs opacity-60 truncate">
                      {track.artist || 'Unknown Artist'}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[var(--theme-surface-hover)] rounded-lg transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
