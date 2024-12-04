import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface DiscordRPCContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  customState: string;
  setCustomState: (state: string) => void;
  customDetails: string;
  setCustomDetails: (details: string) => void;
  largeImageKey: string;
  setLargeImageKey: (key: string) => void;
  smallImageKey: string;
  setSmallImageKey: (key: string) => void;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

const DiscordRPCContext = createContext<DiscordRPCContextType>({
  isEnabled: false,
  setIsEnabled: () => {},
  customState: '',
  setCustomState: () => {},
  customDetails: '',
  setCustomDetails: () => {},
  largeImageKey: '',
  setLargeImageKey: () => {},
  smallImageKey: '',
  setSmallImageKey: () => {},
  connectionStatus: 'disconnected',
});

export const DiscordRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [customState, setCustomState] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [largeImageKey, setLargeImageKey] = useState('beatforge_logo');
  const [smallImageKey, setSmallImageKey] = useState('music_note');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  const initializeDiscord = useCallback(async () => {
    try {
      await invoke('initialize_discord');
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to initialize Discord RPC:', error);
      setConnectionStatus('error');
      console.error('Could not connect to Discord', {
        description: 'Make sure Discord is running and try again.',
      });
    }
  }, []);

  const disconnectDiscord = useCallback(async () => {
    try {
      await invoke('disconnect_discord');
      setConnectionStatus('disconnected');
    } catch (error) {
      console.error('Failed to disconnect Discord RPC:', error);
    }
  }, []);

  const updateActivity = useCallback(async () => {
    if (!isEnabled || connectionStatus !== 'connected') return;

    try {
      await invoke('update_activity', {
        state: customState,
        details: customDetails,
        largeImageKey,
        smallImageKey,
      });
    } catch (error) {
      console.error('Error updating Discord presence:', error);
      setConnectionStatus('error');
      console.error('Could not update Discord presence', {
        description: 'Ensure Discord is running and the app is connected.',
      });
    }
  }, [isEnabled, customState, customDetails, largeImageKey, smallImageKey, connectionStatus]);

  // Auto-initialize and update activity when enabled
  useEffect(() => {
    if (isEnabled) {
      initializeDiscord();
    } else {
      disconnectDiscord();
    }
  }, [isEnabled, initializeDiscord, disconnectDiscord]);

  // Update activity when relevant details change
  useEffect(() => {
    if (isEnabled && connectionStatus === 'connected') {
      updateActivity();
    }
  }, [isEnabled, customState, customDetails, largeImageKey, smallImageKey, connectionStatus, updateActivity]);

  return (
    <DiscordRPCContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        customState,
        setCustomState,
        customDetails,
        setCustomDetails,
        largeImageKey,
        setLargeImageKey,
        smallImageKey,
        setSmallImageKey,
        connectionStatus,
      }}
    >
      {children}
    </DiscordRPCContext.Provider>
  );
};

export const useDiscordRPC = () => {
  const context = useContext(DiscordRPCContext);
  if (!context) {
    throw new Error('useDiscordRPC must be used within a DiscordRPCProvider');
  }
  return context;
};
