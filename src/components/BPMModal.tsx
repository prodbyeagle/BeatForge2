import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Track } from '../types/Track';

interface BPMModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack: Track | null;
  onManualBPMEntry: (bpm: number) => void;
}

const BPMModal: React.FC<BPMModalProps> = ({
  isOpen,
  onClose,
  selectedTrack,
  onManualBPMEntry
}) => {
  const [bpmInput, setBPMInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTrack) {
      setBPMInput(selectedTrack.bpm && selectedTrack.bpm > 0 ? selectedTrack.bpm.toString() : '');
    }
  }, [selectedTrack, isOpen]);

  const handleBPMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBPMInput(value);

    // Validate input
    const numValue = parseFloat(value);
    if (value === '' || (numValue > 0 && numValue <= 300)) {
      setError(null);
    } else {
      setError('BPM must be a number between 1 and 300');
    }
  };

  const handleSubmit = () => {
    const numValue = parseFloat(bpmInput);
    if (numValue > 0 && numValue <= 300) {
      onManualBPMEntry(numValue);
      setError(null);
    } else {
      setError('Invalid BPM value');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit BPM for ${selectedTrack?.title || 'Track'}`}
      description="Enter the correct Beats Per Minute (BPM) for this track"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="bpm-input" className="block text-sm mb-1">BPM</label>
            <input
              id="bpm-input"
              type="number"
              value={bpmInput}
              onChange={handleBPMChange}
              placeholder="Enter BPM"
              min="1"
              max="300"
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg 
                        bg-[var(--theme-surface)] text-[var(--theme-text)] 
                        focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!!error || bpmInput === ''}
          >
            Save BPM
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BPMModal;
