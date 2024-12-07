import { Search, LayoutGrid, List, ChevronDown, Music2 } from 'lucide-react';
import Button from '../Button';

interface LibraryHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: 'title' | 'artist' | 'album';
  setSortOption: (option: 'title' | 'artist' | 'album') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  isSortDropdownOpen: boolean;
  setIsSortDropdownOpen: (open: boolean) => void;
  settings: any;
  updateSettings: (settings: any) => void;
  handleBulkBPMAnalysis?: () => void;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  sortDirection,
  setSortDirection,
  isSortDropdownOpen,
  setIsSortDropdownOpen,
  settings,
  updateSettings,
  handleBulkBPMAnalysis
}) => {
  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'artist', label: 'Artist' },
    { value: 'album', label: 'Album' }
  ];

  const getSortOptionLabel = () => {
    const currentOption = sortOptions.find(option => option.value === sortOption);
    return currentOption ? currentOption.label : 'Sort';
  };

  return (
    <div className="shrink-0 p-6 border-b border-[var(--theme-border)]">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="flex items-center space-x-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] focus:border-[var(--theme-border)] transition-all duration-300"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 hover:bg-[var(--theme-surface-hover)] h-10 justify-center"
              >
                <ChevronDown size={18} />
                {getSortOptionLabel()}
              </Button>
              
              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--theme-surface)] rounded-lg shadow-lg border border-[var(--theme-border)] py-1 z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className="w-full px-4 py-2 text-left hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)]"
                      onClick={() => {
                        setSortOption(option.value as 'title' | 'artist' | 'album');
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                  <div className="border-t border-[var(--theme-border)] my-1" />
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] flex items-center gap-2"
                    onClick={() => {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
                  </button>
                </div>
              )}
            </div>

            {handleBulkBPMAnalysis && (
              <Button
                variant="secondary"
                onClick={handleBulkBPMAnalysis}
                className="flex items-center gap-2 hover:bg-[var(--theme-surface-hover)] h-10 justify-center"
                title="Analyze BPM for all tracks without BPM"
              >
                <Music2 size={18} />
                Analyze BPM
              </Button>
            )}
            <div className="flex bg-[var(--theme-surface)] rounded-xl p-1 border border-[var(--theme-border)]">
              <Button
                variant={settings.viewMode === 'grid' ? 'secondary' : 'tertiary'}
                onClick={() => updateSettings({ viewMode: 'grid' })}
                className="rounded-xl mr-1 transition-all duration-300"
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button
                variant={settings.viewMode === 'list' ? 'secondary' : 'tertiary'}
                onClick={() => updateSettings({ viewMode: 'list' })}
                className="rounded-lg transition-all duration-300"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryHeader;
