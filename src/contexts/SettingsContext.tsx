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
    volume: 1,
    viewMode: 'grid',
    isCollapsed: false,
    beatFolders: [],
    discordRPC: {
      enabled: false,
      status: 'Making beats',
      details: 'Using BeatForge',
      largeImageKey: 'beatforge_logo',
      smallImageKey: 'music_note',
    },
  });

  /** Loads saved settings from persistent storage */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await store.get('settings');
        if (savedSettings) {
          setSettings(savedSettings as Settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        throw error;
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
      await store.set('settings', updatedSettings);
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
