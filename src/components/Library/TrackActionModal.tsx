import Modal from '../Modal';
import { Track } from '../../types/Track';

interface TrackActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack: Track | null;
}

const TrackActionModal: React.FC<TrackActionModalProps> = ({
  isOpen,
  onClose,
  selectedTrack
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedTrack?.title}
    >
      <div className="space-y-4">
        {/* Cover Art and Basic Info */}
        <div className="flex gap-4">
          <div
            className="w-24 h-24 rounded-xl bg-cover bg-center bg-[var(--theme-surface)] border border-[var(--theme-border)]"
            style={{ backgroundImage: selectedTrack?.coverArt ? `url(${selectedTrack?.coverArt})` : 'none' }}
          />
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-1">{selectedTrack?.title}</h3>
            <p className="text-sm text-[var(--theme-text)] mb-3">{selectedTrack?.artist}</p>
            <div className="flex items-center gap-3 text-sm text-[var(--theme-text)]">
              <span>{selectedTrack?.format}</span>
              <span>•</span>
              <span>{selectedTrack?.duration}</span>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="grid grid-cols-2 p-2 gap-4 bg-[var(--theme-surface)]">
          <div>
            <div className="text-xs text-[var(--theme-text)] mb-1">BPM</div>
            <div className="font-medium">{selectedTrack?.bpm || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--theme-text)] mb-1">Key</div>
            <div className="font-medium">{selectedTrack?.key || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--theme-text)] mb-1">File Size</div>
            <div className="font-medium">
              {selectedTrack?.size ? `${Math.round(selectedTrack.size / 1024 / 1024 * 100) / 100} MB` : 'Unknown'}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--theme-text)] mb-1">Location</div>
            <div className="font-medium truncate" title={selectedTrack?.path}>
              {selectedTrack?.path.split('/').slice(-2).join('/')}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TrackActionModal;
