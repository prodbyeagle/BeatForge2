import { FolderOpen, Trash2, Palette, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import Modal from '../components/Modal';
import { themes } from '../themes';
import { open } from '@tauri-apps/plugin-dialog';
import { LazyStore } from '@tauri-apps/plugin-store';

const store = new LazyStore('settings.json');

const Settings = () => {
  const [beatFolders, setBeatFolders] = useState<string[]>([]);
  const { currentTheme, setTheme } = useTheme();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleDeleteFolder = async (folderToDelete: string) => {
    const newFolders = beatFolders.filter(folder => folder !== folderToDelete);
    setBeatFolders(newFolders);
    await saveBeatFolders(newFolders);
  };

  return (
    <div className="h-full bg-[var(--theme-primary)] text-[var(--theme-tertiary)]">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Theme Section */}
          <section className="bg-[var(--theme-secondary)]/5 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--theme-tertiary)]/10">
              <h2 className="text-lg font-medium">Appearance</h2>
            </div>

            <div className="p-6">
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-[var(--theme-secondary)]/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-[var(--theme-secondary)]/10">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium mb-1">Theme</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[var(--theme-tertiary)]/70">{currentTheme.name}</p>
                      <div className="flex gap-1">
                        {currentTheme.values.map((value) => (
                          <div
                            key={value.name}
                            className="w-3 h-3 rounded-full border border-[var(--theme-tertiary)]/10"
                            style={{ backgroundColor: value.color }}
                            title={value.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--theme-tertiary)]/50 group-hover:text-[var(--theme-tertiary)] transition-colors" />
              </button>
            </div>
          </section>

          {/* Folders Section */}
          <section className="bg-[var(--theme-secondary)]/5 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-[var(--theme-tertiary)]">
              <h2 className="text-lg font-medium">Beat Folders</h2>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={handleSelectFolder}
                  variant="primary"
                  className="flex-1"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Add Folder
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="quaternary"
                  disabled={beatFolders.length === 0}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove All
                </Button>
              </div>

              {isLoading ? (
                <div className="text-sm text-[var(--theme-tertiary)]/70">Loading folders...</div>
              ) : beatFolders.length === 0 ? (
                <div className="py-12 text-center rounded-lg border-2 border-dashed border-[var(--theme-tertiary)]">
                  <p className="text-[var(--theme-tertiary)]/70 mb-2">No folders added yet</p>
                  <p className="text-sm text-[var(--theme-tertiary)]/50">Click "Add Folder" to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {beatFolders.map((folder) => (
                    <div
                      key={folder}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--theme-secondary)]/60 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen size={18} />
                        <span className="text-sm">{folder}</span>
                      </div>
                      <Button
                        onClick={() => handleDeleteFolder(folder)}
                        variant="primary"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Advanced Settings Section */}
          <section className="bg-[var(--theme-secondary)]/5 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--theme-tertiary)]">
              <h2 className="text-lg font-medium">Advanced Settings</h2>
            </div>

            <div className="p-6 mb-12">
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--theme-secondary)]/10 transition-colors">
                <div>
                  <h3 className="font-medium mb-1">Auto-Scan Folders</h3>
                  <p className="text-sm text-[var(--theme-tertiary)]/70">
                    Automatically scan folders for new beats
                  </p>
                </div>
                <Toggle checked={autoScan} onChange={setAutoScan} />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Theme Selection Modal */}
      <Modal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        title="Select Theme"
      >
        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                setTheme(theme);
                setIsThemeModalOpen(false);
              }}
              className={`p-4 rounded-lg transition-all ${theme.name === currentTheme.name
                ? 'ring-2 ring-[var(--theme-tertiary)] bg-[var(--theme-secondary)]/10'
                : 'hover:bg-[var(--theme-secondary)]/5'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{theme.name}</span>
                {theme.warning && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
                    Bright
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {theme.values.map((value) => (
                  <div
                    key={value.name}
                    className="w-full aspect-square rounded-lg"
                    style={{ backgroundColor: value.color }}
                    title={value.name}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove All Folders"
      >
        <div className="space-y-6">
          <p className="text-[var(--theme-tertiary)]/70">
            Are you sure you want to remove all folders? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="tertiary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setBeatFolders([]);
                setIsDeleteModalOpen(false);
              }}
              variant="quaternary"
              className="hover:bg-red-500/10 hover:text-red-500"
            >
              Remove All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
