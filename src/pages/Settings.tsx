import { FolderOpen, Trash2, Palette, ChevronRight, Type, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { themes } from '../themes';
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
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [isClearIndexModalOpen, setIsClearIndexModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIndexing, setIsIndexing] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter Tight');

  const fonts = [
    { name: 'Inter Tight', value: 'Inter Tight' },
    { name: 'Inter', value: 'Inter' },
    { name: 'Space Grotesk', value: 'Space Grotesk' },
    { name: 'Space Mono', value: 'Space Mono' },
    { name: 'Geist Mono', value: 'Geist Mono' }
  ];

  useEffect(() => {
    loadBeatFolders();
    loadFont();
  }, []);

  const loadFont = async () => {
    try {
      const savedFont = await store.get<string>('font');
      if (savedFont) {
        setSelectedFont(savedFont);
        document.documentElement.style.fontFamily = `${savedFont}, system-ui, sans-serif`;
      }
    } catch (error) {
      console.error('Error loading font:', error);
    }
  };

  useEffect(() => {
    const saveFont = async () => {
      try {
        await store.set('font', selectedFont);
        await store.save();
        document.documentElement.style.fontFamily = `${selectedFont}, system-ui, sans-serif`;
      } catch (error) {
        console.error('Error saving font:', error);
      }
    };
    saveFont();
  }, [selectedFont]);

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
        
        // Start indexing
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
    
    // Re-index after folder removal
    setIsIndexing(true);
    try {
      await refreshBeats();
    } finally {
      setIsIndexing(false);
    }
  };

  const clearBeatIndex = async () => {
    try {
      await store.clear(); // Clear settings store
      await store.set('beatFolders', beatFolders); // Restore beat folders
      await store.set('font', selectedFont); // Restore font setting
      await store.save();
      
      const beatStore = new LazyStore('beat-index.json');
      await beatStore.clear(); // Clear beat index
      await beatStore.save();
      
      // Re-index after clearing
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
    <div className="bg-[var(--theme-primary)] text-[var(--theme-tertiary)]">
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 transition-all duration-300">Settings</h1>

        <div className="grid gap-6">
          {/* Theme Section */}
          <section className="bg-[var(--theme-secondary)] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
            <div className="px-6 py-4 border-b border-[var(--theme-tertiary)]">
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--theme-tertiary)]/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Theme: {currentTheme.name}</span>
                    <div className="flex gap-1.5">
                      {currentTheme.values.map((value) => (
                        <div
                          key={value.name}
                          className="w-3.5 h-3.5 rounded-full border border-[var(--theme-tertiary)] transition-all duration-300"
                          style={{ backgroundColor: value.color }}
                          title={value.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>

              <button
                onClick={() => setIsFontModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--theme-tertiary)]/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5" />
                  <span className="text-sm font-medium">Font: {selectedFont}</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
            </div>
          </section>

          {/* Folders Section */}
          <section className="bg-[var(--theme-secondary)] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
            <div className="px-6 py-4 border-b border-[var(--theme-tertiary)]">
              <h2 className="text-xl font-semibold">Beat Folders</h2>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={handleSelectFolder}
                  variant="primary"
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
                  <RefreshCw className="w-5 h-5 mr-3" />
                  Clear Index
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-tertiary)]"></div>
                </div>
              ) : beatFolders.length === 0 ? (
                <div className="py-16 text-center rounded-xl border-2 border-dashed border-[var(--theme-tertiary)] transition-all duration-300">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No folders added yet</p>
                  <p className="text-sm opacity-70">Click "Add Folder" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {isIndexing && (
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[var(--theme-secondary)]/80 backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--theme-tertiary)]"></div>
                      <span className="text-sm">Indexing beats...</span>
                    </div>
                  )}
                  {beatFolders.map((folder) => (
                    <div
                      key={folder}
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-secondary)]/80 backdrop-blur-sm hover:bg-[var(--theme-secondary)] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FolderOpen className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm truncate">{folder}</span>
                      </div>
                      <Button
                        onClick={() => handleDeleteFolder(folder)}
                        variant="primary"
                        className="text-red-500 hover:text-red-600 transition-all duration-300"
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

      {/* Theme Selection Modal */}
      <Modal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        title="Select Theme"
      >
        <div className="grid grid-cols-2 gap-2 p-2 max-h-[300px] overflow-y-auto">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                setTheme(theme);
                setIsThemeModalOpen(false);
              }}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(var(--theme-quaternary-rgb),0.25)] ${currentTheme.name === theme.name
                ? 'border-[var(--theme-tertiary)] bg-[var(--theme-secondary)]'
                : 'border-transparent hover:bg-[var(--theme-secondary)]/50'
                }`}
            >
              <div className="flex gap-1.5">
                {theme.values.map((value) => (
                  <div
                    key={value.name}
                    className="w-3.5 h-3.5 rounded-full border border-[var(--theme-tertiary)] transition-all duration-300"
                    style={{ backgroundColor: value.color }}
                    title={value.name}
                  />
                ))}
              </div>
              <span className="text-sm">{theme.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Font Selection Modal */}
      <Modal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
        title="Select Font"
      >
        <div className="grid grid-cols-1 gap-2 p-2 max-h-[300px] overflow-y-auto">
          {fonts.map((font) => (
            <button
              key={font.name}
              onClick={() => {
                setSelectedFont(font.value);
                setIsFontModalOpen(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(var(--theme-quaternary-rgb),0.25)] ${selectedFont === font.value
                ? 'border-[var(--theme-tertiary)] bg-[var(--theme-secondary)]'
                : 'border-transparent hover:bg-[var(--theme-secondary)]/50'
                }`}
              style={{ fontFamily: font.value }}
            >
              <span className="text-lg">Aa</span>
              <span className="text-sm">{font.name}</span>
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
              variant="primary"
              className="text-red-500 hover:text-red-600"
              onClick={async () => {
                await saveBeatFolders([]);
                setBeatFolders([]);
                setIsDeleteModalOpen(false);
                
                // Re-index after removing all folders
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

      {/* Clear Index Confirmation Modal */}
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
