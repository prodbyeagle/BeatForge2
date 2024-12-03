import { FolderOpen, Trash2, Palette, ChevronRight, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { themes, Theme } from '../themes';
import { ThemeColorSet } from '../types/Theme.ts';
import { open } from '@tauri-apps/plugin-dialog';
import { LazyStore } from '@tauri-apps/plugin-store';
import { useBeats } from '../contexts/BeatsContext';

const store = new LazyStore('settings.json');

const Settings = () => {
  const [beatFolders, setBeatFolders] = useState<string[]>([]);
  const { currentTheme, setTheme } = useTheme();
  const { refreshBeats } = useBeats();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isClearIndexModalOpen, setIsClearIndexModalOpen] = useState(false);

  useEffect(() => {
    loadBeatFolders();
  }, []);

  const loadBeatFolders = async () => {
    try {
      const folders = await store.get<string[]>('beatFolders') || [];
      setBeatFolders(folders);
    } catch (error) {
      console.error('Error loading beat folders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBeatFolders = async (folders: string[]) => {
    try {
      await store.set('beatFolders', folders);
      await store.save();
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

  const clearBeatIndex = async () => {
    try {
      await store.clear();
      await store.set('beatFolders', beatFolders);
      await store.save();

      const beatStore = new LazyStore('beat-index.json');
      await beatStore.clear();
      await beatStore.save();

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

  const renderColorPalette = (theme: Theme) => {
    const colorSets = [
      { name: 'Background', colors: theme.colors.background },
      { name: 'Surface', colors: theme.colors.surface },
      { name: 'Primary', colors: theme.colors.primary },
      { name: 'Secondary', colors: theme.colors.secondary },
      { name: 'Accent', colors: theme.colors.accent },
      { name: 'Text', colors: theme.colors.text }
    ];

    return (
      <div className="grid grid-cols-2 gap-6">
        {colorSets.map(set => (
          <div key={set.name} className="space-y-2">
            <h4 className="text-sm font-medium opacity-70">{set.name}</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(set.colors).map(([state, color]) => (
                <div 
                  key={state} 
                  className="flex items-center gap-2 p-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface-hover)]"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-[var(--theme-border)]"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs capitalize">{state}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[var(--theme-background)] text-[var(--theme-text)]">
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 transition-all duration-300">Settings</h1>

        <div className="grid gap-6">
          <section className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
            <div className="px-6 py-4 border-b border-[var(--theme-border)]">
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--theme-surface-hover)] transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Theme: {currentTheme.name}</span>
                    <div className="flex gap-1.5">
                      {(['primary', 'secondary', 'accent'] as const).map(name => (
                        <div
                          key={name}
                          className="w-3.5 h-3.5 rounded-full border border-[var(--theme-border)] transition-all duration-300"
                          style={{ 
                            backgroundColor: typeof currentTheme.colors[name] === 'object' 
                              ? (currentTheme.colors[name] as ThemeColorSet).base
                              : currentTheme.colors[name]
                          }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
            </div>
          </section>

          <section className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
            <div className="px-6 py-4 border-b border-[var(--theme-border)]">
              <h2 className="text-xl font-semibold">Beat Folders</h2>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={handleSelectFolder}
                  variant="secondary"
                  className="flex-1 py-3 transition-all duration-300"
                >
                  <FolderOpen className="w-5 h-5 mr-3" />
                  Add Folder
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="quaternary"
                  disabled={beatFolders.length === 0}
                  className="flex-1 py-3 transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Remove All
                </Button>
                <Button
                  onClick={() => setIsClearIndexModalOpen(true)}
                  variant="quaternary"
                  className="flex-1 py-3 transition-all duration-300"
                >
                  <RefreshCcw className="w-5 h-5 mr-3" />
                  Clear Index
                </Button>
                <Button
                  onClick={async () => {
                    setIsIndexing(true);
                    try {
                      await refreshBeats();
                    } finally {
                      setIsIndexing(false);
                    }
                  }}
                  variant="quaternary"
                  className="flex-1 py-3 transition-all duration-300"
                >
                  <RefreshCcw className="w-5 h-5 mr-3" />
                  Re-Index
                </Button>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-[var(--theme-border)]"></div>
                    <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-[var(--theme-accent)] animate-spin"></div>
                  </div>
                  <p className="text-sm text-[var(--theme-text)] opacity-70 animate-pulse">
                    Loading...
                  </p>
                </div>
              ) : beatFolders.length === 0 ? (
                <div className="py-16 text-center rounded-xl border-2 border-dashed border-[var(--theme-border)] transition-all duration-300">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No folders added yet</p>
                  <p className="text-sm opacity-70">Click "Add Folder" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {isIndexing && (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                      <div className="relative w-12 h-12">
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-[var(--theme-border)]"></div>
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-[var(--theme-accent)] animate-spin"></div>
                      </div>
                      <p className="text-sm text-[var(--theme-text)] opacity-70 animate-pulse">
                        Indexing beats...
                      </p>
                    </div>
                  )}
                  {beatFolders.map((folder) => (
                    <div
                      key={folder}
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FolderOpen className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm truncate">{folder}</span>
                      </div>
                      <Button
                        onClick={() => handleDeleteFolder(folder)}
                        variant="secondary"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Modal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        title="Theme Settings"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 max-h-[70vh] overflow-y-auto px-2">
            {themes.map((theme: Theme) => (
              <div
                key={theme.name}
                className={`
                  overflow-hidden rounded-xl border transition-all duration-300
                  ${currentTheme?.name === theme.name
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-surface)]'
                    : 'border-[var(--theme-border)] hover:border-[var(--theme-border)] hover:bg-[var(--theme-background)]'
                  }
                `}
              >
                <div className="p-4 border-b border-[var(--theme-border)]">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{theme.name}</h3>
                      {theme.author && (
                        <p className="text-sm opacity-70">by {theme.author}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {(['primary', 'secondary', 'accent'] as const).map(name => (
                          <div
                            key={name}
                            className="w-6 h-6 rounded-full border-2 border-[var(--theme-surface)]"
                            style={{ 
                              backgroundColor: typeof theme.colors[name] === 'object' 
                                ? (theme.colors[name] as ThemeColorSet).base
                                : theme.colors[name]
                            }}
                            title={name}
                          />
                        ))}
                      </div>
                      {currentTheme.name !== theme.name && (
                        <Button
                          variant="primary"
                          style={{
                            backgroundColor: typeof theme.colors.accent === 'object' 
                              ? theme.colors.accent.base
                              : theme.colors.accent,
                            borderColor: typeof theme.colors.accent === 'object' 
                              ? theme.colors.accent.base
                              : theme.colors.accent,
                            color: typeof theme.colors.text === 'object'
                              ? theme.colors.text.base
                              : theme.colors.text
                          }}
                          onClick={() => {
                            setTheme(theme);
                            setIsThemeModalOpen(false);
                          }}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {renderColorPalette(theme)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove All Folders"
      >
        <div className="p-4">
          <p className="mb-6">Are you sure you want to remove all folders?</p>
          <div className="flex justify-end gap-4">
            <Button
              variant="quaternary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await saveBeatFolders([]);
                setBeatFolders([]);
                setIsDeleteModalOpen(false);
                setIsIndexing(true);
                try {
                  await refreshBeats();
                } finally {
                  setIsIndexing(false);
                }
              }}
            >
              Remove All
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isClearIndexModalOpen}
        onClose={() => setIsClearIndexModalOpen(false)}
        title="Clear Beat Index"
      >
        <div className="p-4">
          <p className="mb-6">Are you sure you want to clear the beat index? This will force a complete re-scan of all folders.</p>
          <div className="flex justify-end gap-4">
            <Button
              variant="quaternary"
              onClick={() => setIsClearIndexModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="text-yellow-500 hover:text-yellow-600"
              onClick={async () => {
                await clearBeatIndex();
                setIsClearIndexModalOpen(false);
              }}
            >
              Clear Index
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
