import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { open } from '@tauri-apps/plugin-dialog';
import { useBeats } from '../contexts/BeatsContext';
import { useDiscordRPC } from '../contexts/DiscordRPCContext';
import { useSettings } from '../contexts/SettingsContext';
import { themes } from '../themes';
import {
  AppearanceSection,
  BeatFoldersSection,
  DiscordRPCSection,
  ThemeModal,
  DeleteFoldersModal,
  ClearIndexModal
} from '../components/Settings/index';

const Settings = () => {
  const [beatFolders, setBeatFolders] = useState<string[]>([]);
  const { currentTheme, setTheme } = useTheme();
  const { refreshBeats } = useBeats();
  const { settings, updateSettings } = useSettings();
  const { setIsEnabled, setCustomState, setCustomDetails, setLargeImageKey, setSmallImageKey, connectionStatus } = useDiscordRPC();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isClearIndexModalOpen, setIsClearIndexModalOpen] = useState(false);

  useEffect(() => {
    loadBeatFolders();
  }, []);

  useEffect(() => {
    if (settings.beatFolders) {
      setBeatFolders(settings.beatFolders);
    }
  }, [settings.beatFolders]);

  useEffect(() => {
    if (!settings.discordRPC) {
      updateSettings({
        discordRPC: {
          enabled: false,
          status: 'Making beats',
          details: 'Using BeatForge',
          largeImageKey: 'beatforge_logo',
          smallImageKey: 'music_note',
          customClientId: undefined,
          showPlayingBeat: false,
          showBeatDetails: {
            name: false,
            producer: false,
          }
        },
      });
    }
  }, [settings, updateSettings]);

  useEffect(() => {
    if (settings.discordRPC) {
      setIsEnabled(settings.discordRPC.enabled);
      setCustomState(settings.discordRPC.status);
      setCustomDetails(settings.discordRPC.details);
      setLargeImageKey(settings.discordRPC.largeImageKey);
      setSmallImageKey(settings.discordRPC.smallImageKey);
    }
  }, [settings.discordRPC, setIsEnabled, setCustomState, setCustomDetails, setLargeImageKey, setSmallImageKey]);

  const loadBeatFolders = async () => {
    try {
      setIsLoading(true);
      const currentSettings = await updateSettings({});
      if (currentSettings.beatFolders) {
        setBeatFolders(currentSettings.beatFolders);
      }
    } catch (error) {
      console.error('Error loading beat folders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBeatFolders = async (folders: string[]) => {
    try {
      await updateSettings({ beatFolders: folders });
      setBeatFolders(folders);
    } catch (error) {
      console.error('Error saving beat folders:', error);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Beat Folder'
      });

      if (selected && !beatFolders.includes(selected as string)) {
        const newFolders = [...beatFolders, selected as string];
        setBeatFolders(newFolders);
        await saveBeatFolders(newFolders);

        setIsIndexing(true);
        try {
          await refreshBeats();
        } finally {
          setIsIndexing(false);
        }
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleDeleteFolder = async (folderToDelete: string) => {
    const newFolders = beatFolders.filter(folder => folder !== folderToDelete);
    setBeatFolders(newFolders);
    await saveBeatFolders(newFolders);

    setIsIndexing(true);
    try {
      await refreshBeats();
    } finally {
      setIsIndexing(false);
    }
  };

  const handleDeleteAllFolders = async () => {
    await saveBeatFolders([]);
    setBeatFolders([]);
    setIsIndexing(true);
    try {
      await refreshBeats();
    } finally {
      setIsIndexing(false);
    }
  };

  const clearBeatIndex = async () => {
    try {
      await updateSettings({ beatFolders: [] });
      setIsIndexing(true);
      try {
        await refreshBeats();
      } finally {
        setIsIndexing(false);
      }
    } catch (error) {
      console.error('Error clearing beat index:', error);
    }
  };

  return (
    <div className="bg-[var(--theme-background)] text-[var(--theme-text)]">
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 transition-all duration-300">Settings</h1>

        <div className="grid gap-6">
          <AppearanceSection
            currentTheme={currentTheme}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
          />

          <DiscordRPCSection
            settings={settings}
            connectionStatus={connectionStatus}
            onUpdateSettings={updateSettings}
            onSetEnabled={(enabled) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  enabled,
                },
              });
            }}
            onSetCustomState={(state) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  status: state,
                },
              });
            }}
            onSetCustomDetails={(details) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  details,
                },
              });
            }}
            onSetLargeImageKey={(key) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  largeImageKey: key,
                },
              });
            }}
            onSetSmallImageKey={(key) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  smallImageKey: key,
                },
              });
            }}
            onSetCustomClientId={(clientId) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  customClientId: clientId,
                },
              });
            }}
            onSetShowPlayingBeat={(showPlayingBeat) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  showPlayingBeat,
                },
              });
            }}
            onSetShowBeatDetails={(showBeatDetails) => {
              updateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  showBeatDetails,
                },
              });
            }}
          />

          <BeatFoldersSection
            isLoading={isLoading}
            isIndexing={isIndexing}
            onSelectFolder={handleSelectFolder}
            onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
            onOpenClearIndexModal={() => setIsClearIndexModalOpen(true)}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>
      </div>

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themes={themes}
        currentTheme={currentTheme}
        onSelectTheme={setTheme}
      />

      <DeleteFoldersModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAllFolders}
      />

      <ClearIndexModal
        isOpen={isClearIndexModalOpen}
        onClose={() => setIsClearIndexModalOpen(false)}
        onConfirm={clearBeatIndex}
      />
    </div>
  );
};

export default Settings;
