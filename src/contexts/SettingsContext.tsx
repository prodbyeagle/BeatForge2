import { createContext, useContext, useEffect, useState } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';

/** Application settings interface */
interface Settings {
  /** Audio playback volume (0-1) */
  volume: number;
  /** Display mode for the beats list */
  viewMode: 'grid' | 'list';
  /** Sidebar collapsed state */
  isCollapsed: boolean;
  /** Beat folders for indexing */
  beatFolders?: string[];
  /** Discord Rich Presence settings */
  discordRPC: {
    /** Whether Discord RPC is enabled */
    enabled: boolean;
    /** Custom status text */
    status: string;
    /** Custom details text */
    details: string;
    /** Large image key for Discord RPC */
    largeImageKey: string;
    /** Small image key for Discord RPC */
    smallImageKey: string;
    /** Optional custom Discord Application Client ID */
    customClientId?: string;
    /** Whether to show currently playing beat */
    showPlayingBeat: boolean;
    /** Beat details to show in Discord RPC */
    showBeatDetails: {
      /** Show beat name */
      name: boolean;
      /** Show producer name */
      producer: boolean;
    };
  };
}

/** Context interface for settings management */
interface SettingsContextType {
  /** Current application settings */
  settings: Settings;
  /** Updates partial or complete settings
   * @param newSettings - Partial settings to update
   * @throws Error if settings update fails
   */
  updateSettings: (newSettings: Partial<Settings>) => Promise<Settings>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const store = new LazyStore('settings.json');

/** Provider component for application settings */
export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    volume: 0.5,
    viewMode: 'grid',
    isCollapsed: false,
    beatFolders: [],
    discordRPC: {
      enabled: false,
      status: 'Making beats',
      details: 'Using BeatForge',
      largeImageKey: 'beatforge_logo',
      smallImageKey: 'music_note',
      customClientId: undefined,
      showPlayingBeat: true,
      showBeatDetails: {
        name: true,
        producer: true,
      },
    },
  });

  /** Loads saved settings from persistent storage */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Lade beide möglichen Speicherorte
        const savedSettings = await store.get('settings') as Settings | null;
        const rootBeatFolders = await store.get('beatFolders') as string[] | null;

        if (savedSettings) {
          // Wenn es Root-Level beatFolders gibt, migriere sie
          if (rootBeatFolders) {
            savedSettings.beatFolders = rootBeatFolders;
            // Lösche die Root-Level beatFolders
            await store.delete('beatFolders');
          }

          // Ensure volume is within valid range
          const validVolume = savedSettings.volume !== undefined 
            ? Math.max(0, Math.min(1, savedSettings.volume)) 
            : 0.5;

          const updatedSettings = {
            ...savedSettings,
            volume: validVolume
          };

          setSettings(updatedSettings);
          // Speichere die konsolidierten Einstellungen
          await store.set('settings', updatedSettings);
          await store.save();
        } else {
          // Speichere Standardeinstellungen, wenn keine gespeicherten Einstellungen gefunden werden
          await store.set('settings', settings);
          await store.save();
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fallback to default settings
        await store.set('settings', settings);
        await store.save();
      }
    };
    loadSettings();
  }, []);

  /**
   * Updates application settings and persists them
   * @param newSettings - Partial settings to update
   * @throws Error if settings update or persistence fails
   */
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      // Speichere nur im settings-Objekt
      await store.set('settings', updatedSettings);
      // Stelle sicher, dass keine Root-Level beatFolders existieren
      await store.delete('beatFolders');
      await store.save();
      return updatedSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

/** Hook to access the settings context
 * @throws Error if used outside of SettingsProvider
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
