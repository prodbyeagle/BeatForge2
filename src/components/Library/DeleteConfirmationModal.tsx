import Modal from '../Modal';
import Button from '../Button';
import { Track } from '../../types/Track';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack: Track | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  selectedTrack
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Beat"
    >
      <div className="space-y-4">
        <p>Are you sure you want to delete "{selectedTrack?.title}"? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // TODO: Delete track
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
