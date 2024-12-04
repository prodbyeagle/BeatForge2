import Modal from '../../components/Modal';
import Button from '../../components/Button';

interface ClearIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ClearIndexModal = ({
  isOpen,
  onClose,
  onConfirm
}: ClearIndexModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clear Beat Index"
    >
      <div className="p-4">
        <p className="mb-6">Are you sure you want to clear the beat index? This will force a complete re-scan of all folders.</p>
        <div className="flex justify-end gap-4">
          <Button
            variant="quaternary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="text-yellow-500 hover:text-yellow-600"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            Clear Index
          </Button>
        </div>
      </div>
    </Modal>
  );
};
