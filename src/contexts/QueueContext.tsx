import React, { createContext, useContext, useState } from 'react';
import { Track } from '../types/Track';

interface QueueContextType {
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  getNextTrack: () => Track | null;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Track[]>([]);

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const getNextTrack = () => {
    if (queue.length === 0) return null;
    const nextTrack = queue[0];
    removeFromQueue(0);
    return nextTrack;
  };

  return (
    <QueueContext.Provider value={{ queue, addToQueue, removeFromQueue, clearQueue, getNextTrack }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
