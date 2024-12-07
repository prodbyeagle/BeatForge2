import React, { useEffect, useRef } from 'react';
import { Track } from '../types/Track';
import { useQueue } from '../contexts/QueueContext';

/**
 * Props for the ContextMenu component
 * @interface ContextMenuProps
 */
interface ContextMenuProps {
  /** X coordinate for menu positioning */
  x: number;
  /** Y coordinate for menu positioning */
  y: number;
  /** Track object containing song information */
  track: Track;
  /** Callback function to close the context menu */
  onClose: () => void;
  /** Optional callback function to handle track editing */
  onEdit?: (track: Track) => void;
  /** Optional callback function to handle track playback */
  onPlay?: (track: Track) => void;
  /** Optional callback function to analyze track BPM */
  onAnalyzeBPM?: (track: Track, e: React.MouseEvent) => void;
  /** Flag indicating if BPM analysis is in progress */
  isAnalyzing?: boolean;
  /** Optional callback function to navigate to album view */
  onGoToAlbum?: (album: string) => void;
  /** Optional callback function to open BPM modal */
  openBPMModal?: (track: Track) => void;
}

/**
 * ContextMenu Component
 * 
 * Displays a context menu with various actions for a track including
 * play, edit, BPM analysis, and navigation options.
 * 
 * @param props - Component props of type ContextMenuProps
 * @returns React component
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  track,
  onClose,
  onEdit,
  onPlay,
  onAnalyzeBPM,
  isAnalyzing,
  onGoToAlbum,
  openBPMModal,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToQueue } = useQueue();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg shadow-lg p-1 min-w-[200px]"
      style={menuStyle}
    >
      <ul className="text-sm">
        {onAnalyzeBPM && (
          <li>
            <button
              onClick={(e) => {
                onAnalyzeBPM(track, e);
                onClose();
              }}
              disabled={isAnalyzing}
              className="w-full px-4 py-2 text-left hover:bg-[var(--theme-border)] rounded-md transition-all duration-300 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing BPM...</span>
                </>
              ) : (
                'Analyze BPM'
              )}
            </button>
          </li>
        )}

        {openBPMModal && track.bpm !== 0 && (
          <li>
            <button
              onClick={() => {
                openBPMModal(track);
                onClose();
              }}
              className="w-full px-4 py-2 text-left hover:bg-[var(--theme-border)] rounded-md transition-all duration-300"
            >
              Edit BPM Manual
            </button>
          </li>
        )}

        <li>
          <button
            onClick={() => {
              onPlay?.(track);
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-[var(--theme-border)] rounded-md transition-all duration-300"
          >
            Play Song
          </button>
        </li>

        <li>
          <button
            onClick={() => {
              onEdit?.(track);
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-[var(--theme-border)] rounded-md transition-all duration-300"
          >
            Edit Song
          </button>
        </li>

        <li>
          <button
            onClick={() => {
              addToQueue(track);
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-[var(--theme-border)] rounded-md transition-all duration-300"
          >
            Add to Queue
          </button>
        </li>

        {onGoToAlbum && (
          <li>
            <button
              onClick={() => {
                onGoToAlbum(track.album || 'Unknown Album');
                onClose();
              }}
              className="w-full px-4 py-2 text-left hover:bg-[var(--theme-border)] rounded-md transition-all duration-300"
            >
              Go to Album
            </button>
          </li>
        )}

        <li>
          <button
            disabled
            className="w-full px-4 py-2 text-left text-[var(--theme-text)] opacity-50 cursor-default"
          >
            Go to Artist
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
