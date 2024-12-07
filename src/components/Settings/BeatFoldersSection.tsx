import { FolderOpen, Trash2, RefreshCcw } from 'lucide-react';
import Button from '../Button';
import { useSettings } from '../../contexts/SettingsContext';
import { useBeats } from '../../contexts/BeatsContext';
import { useEffect, useState } from 'react';

interface BeatFoldersSectionProps {
  isLoading: boolean;
  isIndexing: boolean;
  onSelectFolder: () => void;
  onOpenDeleteModal: () => void;
  onOpenClearIndexModal: () => void;
  onDeleteFolder: (folder: string) => void;
  indexingProgress?: {
    current: number;
    total: number;
  };
}

export const BeatFoldersSection = ({
  isLoading,
  isIndexing,
  onSelectFolder,
  onOpenDeleteModal,
  onOpenClearIndexModal,
  onDeleteFolder,
  indexingProgress
}: BeatFoldersSectionProps) => {
  const { settings } = useSettings();
  const { refreshBeats: refreshBeatsFromContext } = useBeats();
  const [beatFolders, setBeatFolders] = useState<string[]>([]);

  useEffect(() => {
    if (settings.beatFolders) {
      setBeatFolders(settings.beatFolders);
    }
  }, [settings.beatFolders]);

  return (
    <section className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
      <div className="px-6 py-4 border-b border-[var(--theme-border)]">
        <h2 className="text-xl font-semibold">Beat Folders</h2>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={onSelectFolder}
            variant="secondary"
            className="flex-1 py-3 transition-all duration-300"
          >
            <FolderOpen className="w-5 h-5 mr-3" />
            Add Folder
          </Button>
          <Button
            onClick={onOpenDeleteModal}
            variant="quaternary"
            disabled={beatFolders.length === 0}
            className="flex-1 py-3 transition-all duration-300"
          >
            <Trash2 className="w-5 h-5 mr-3" />
            Remove All
          </Button>
          <Button
            onClick={onOpenClearIndexModal}
            variant="quaternary"
            className="flex-1 py-3 transition-all duration-300"
          >
            <RefreshCcw className="w-5 h-5 mr-3" />
            Clear Index
          </Button>
          <Button
            onClick={async () => {
              try {
                await refreshBeatsFromContext();
              } catch (error) {
                console.error('Error refreshing beats:', error);
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
                  {indexingProgress 
                    ? `Indexing ${indexingProgress.current} of ${indexingProgress.total} Beats (${Math.round((indexingProgress.current / indexingProgress.total) * 100)}%)`
                    : 'Indexing beats...'}
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
                  onClick={() => onDeleteFolder(folder)}
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
  );
};
