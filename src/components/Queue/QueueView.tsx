import React from 'react';
import { X, Music, List } from 'lucide-react';
import { useQueue } from '../../contexts/QueueContext';
import { Track } from '../../types/Track';
import Button from '../Button';

interface QueueViewProps {
  onClose: () => void;
  currentTrack?: Track | null;
}

export const QueueView: React.FC<QueueViewProps> = ({ onClose, currentTrack }) => {
  const { queue, removeFromQueue, clearQueue } = useQueue();

  return (
    <div className="fixed bottom-28 left-0 right-0 p-4 px-52">
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-[var(--theme-surface)]/90 backdrop-blur-xl border border-[var(--theme-border)] px-4 py-2 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-2 px-4">
            <div className="flex items-center gap-3">
              <List className="w-4 h-4 text-[var(--theme-text-secondary)]" />
              <h2 className="text-base font-semibold">Queue</h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-8 h-8 rounded-full"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="max-h-[40vh] overflow-y-auto">
            {currentTrack && (
              <div className="px-4 py-1 border-b border-[var(--theme-border)]">
                <div className="text-xs text-[var(--theme-text-secondary)] mb-1">Now Playing</div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg bg-center bg-cover flex-shrink-0 border border-[var(--theme-border)]" 
                    style={{ backgroundImage: `url(${currentTrack.coverArt || '/default-cover.png'})` }} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{currentTrack.title}</div>
                    <div className="text-xs text-[var(--theme-text-secondary)] truncate">
                      {currentTrack.artist || 'Unknown Artist'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 py-1">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-[var(--theme-text-secondary)]">Next Up</div>
                {queue.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={clearQueue}
                    className="text-xs text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)] h-6"
                  >
                    Clear Queue
                  </Button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center text-[var(--theme-text-secondary)]">
                  <Music className="w-8 h-8 mb-1 opacity-60" />
                  <p className="text-xs">No tracks in queue</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((track, index) => (
                    <div
                      key={`${track.id}-${index}`}
                      className="flex items-center gap-3 group hover:bg-[var(--theme-surface-hover)] rounded-xl p-1.5 duration-300 transition-all"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg bg-center bg-cover flex-shrink-0 border border-[var(--theme-border)]" 
                        style={{ backgroundImage: `url(${track.coverArt || '/default-cover.png'})` }} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{track.title}</div>
                        <div className="text-xs text-[var(--theme-text-secondary)] truncate">
                          {track.artist || 'Unknown Artist'}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100"
                        onClick={() => removeFromQueue(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
