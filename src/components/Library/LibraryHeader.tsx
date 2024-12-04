import { Search, LayoutGrid, List, ArrowUpDown, ChevronDown } from 'lucide-react';
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
  updateSettings
}) => {
  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'artist', label: 'Artist' },
    { value: 'album', label: 'Album' }
  ];

  return (
    <div className="shrink-0 p-6 border-b border-[var(--theme-border)]">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text)]" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] focus:border-[var(--theme-border)] transition-all duration-300"
            />
          </div>
          <div className="relative rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)]">
            <Button
              variant="quaternary"
              className="flex items-center gap-2"
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
              }}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>{sortOption}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isSortDropdownOpen && (
              <div
                className="absolute z-10 right-0 mt-1 bg-[var(--theme-surface)] rounded-lg shadow-lg overflow-hidden"
                onBlur={() => setIsSortDropdownOpen(false)}
              >
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-2 transition-all duration-300 cursor-pointer hover:bg-[var(--theme-primary-hover)] ${sortOption === option.value ? 'bg-[var(--theme-border)]' : ''}`}
                    onClick={() => {
                      setSortOption(option.value as any);
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
                <div
                  className="px-4 py-2 transition-all duration-300 cursor-pointer hover:bg-[var(--theme-primary-hover)] border-t border-[var(--theme-primary)]"
                  onClick={() => {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    setIsSortDropdownOpen(false);
                  }}
                >
                  {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
                </div>
              </div>
            )}
          </div>
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
  );
};

export default LibraryHeader;
