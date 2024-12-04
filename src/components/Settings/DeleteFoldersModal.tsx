import Modal from '../../components/Modal';
import Button from '../../components/Button';

interface DeleteFoldersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteFoldersModal = ({
  isOpen,
  onClose,
  onConfirm
}: DeleteFoldersModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove All Folders"
    >
      <div className="p-4">
        <p className="mb-6">Are you sure you want to remove all folders?</p>
        <div className="flex justify-end gap-4">
          <Button
            variant="quaternary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            Remove All
          </Button>
        </div>
      </div>
    </Modal>
  );
};
