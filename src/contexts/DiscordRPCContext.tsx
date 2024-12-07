import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettings } from './SettingsContext';

/** Details of the currently playing beat */
interface BeatDetails {
  /** Name of the beat */
  name?: string;
  /** Producer of the beat */
  producer?: string;
}

/** Context for managing Discord Rich Presence */
interface DiscordRPCContextType {
  /** Whether Discord RPC is currently enabled */
  isEnabled: boolean;
  /** Set the enabled state of Discord RPC */
  setIsEnabled: (enabled: boolean) => void;
  /** Custom state text for Discord RPC */
  customState: string;
  /** Set the custom state text */
  setCustomState: (state: string) => void;
  /** Custom details text for Discord RPC */
  customDetails: string;
  /** Set the custom details text */
  setCustomDetails: (details: string) => void;
  /** Large image key for Discord RPC */
  largeImageKey: string;
  /** Set the large image key */
  setLargeImageKey: (key: string) => void;
  /** Small image key for Discord RPC */
  smallImageKey: string;
  /** Set the small image key */
  setSmallImageKey: (key: string) => void;
  /** Current connection status with Discord */
  connectionStatus: 'connected' | 'disconnected' | 'error';
  /** Update the current beat details */
  updateBeatDetails: (beatDetails: BeatDetails | null) => void;
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
  updateBeatDetails: () => {},
});

export const DiscordRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [isEnabled, setIsEnabled] = useState(false);
  const [customState, setCustomState] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [largeImageKey, setLargeImageKey] = useState('beatforge_logo');
  const [smallImageKey, setSmallImageKey] = useState('music_note');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [currentBeatDetails, setCurrentBeatDetails] = useState<BeatDetails | null>(null);

  const initializeDiscord = useCallback(async () => {
    try {
      await invoke('initialize_discord', {
        customClientId: settings.discordRPC.customClientId
      });
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
    }
  }, [settings.discordRPC.customClientId]);

  const disconnectDiscord = useCallback(async () => {
    try {
      await invoke('disconnect_discord');
      setConnectionStatus('disconnected');
    } catch (error) {
      setConnectionStatus('error');
    }
  }, []);

  const updateTimer = useRef<NodeJS.Timeout>();

  const updateActivity = useCallback(async () => {
    if (!isEnabled || connectionStatus !== 'connected') {
      return;
    }

    if (updateTimer.current) {
      clearTimeout(updateTimer.current);
    }

    updateTimer.current = setTimeout(async () => {
      try {
        await invoke('update_activity', {
          state: customState,
          details: customDetails,
          largeImageKey,
          smallImageKey,
          showPlayingBeat: settings.discordRPC.showPlayingBeat,
          beatDetails: currentBeatDetails,
          showBeatDetails: settings.discordRPC.showBeatDetails
        });
      } catch (error) {
        setConnectionStatus('error');
      }
    }, 1000);
  }, [
    isEnabled,
    customState,
    customDetails,
    largeImageKey,
    smallImageKey,
    connectionStatus,
    settings.discordRPC.showPlayingBeat,
    settings.discordRPC.showBeatDetails,
    currentBeatDetails
  ]);

  const updateBeatDetails = useCallback((beatDetails: BeatDetails | null) => {
    setCurrentBeatDetails(beatDetails);
  }, []);

  useEffect(() => {
    if (settings.discordRPC.enabled) {
      setIsEnabled(true);
      initializeDiscord();
    }

    // Cleanup on unmount
    return () => {
      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
      }
      disconnectDiscord();
    };
  }, [settings.discordRPC.enabled, initializeDiscord, disconnectDiscord]);

  useEffect(() => {
    if (isEnabled && connectionStatus === 'connected') {
      updateActivity();
    }
  }, [
    isEnabled, 
    connectionStatus, 
    customState, 
    customDetails, 
    largeImageKey, 
    smallImageKey, 
    currentBeatDetails,
    settings.discordRPC.showPlayingBeat,
    settings.discordRPC.showBeatDetails
  ]);

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
        updateBeatDetails,
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
