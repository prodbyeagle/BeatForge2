import { useState } from 'react';
import { Library, Settings, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  activePage: 'library' | 'settings';
  onNavigate: (page: 'library' | 'settings') => void;
}

const Sidebar = ({ activePage, onNavigate }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: <Library size={24} />, label: 'Library', id: 'library' as const },
    { icon: <Settings size={24} />, label: 'Settings', id: 'settings' as const },
  ];

  const handleNavigate = (pageId: 'library' | 'settings') => {
    onNavigate(pageId);
  };

  return (
    <div
      className={`h-screen bg-[var(--theme-primary)]/30 backdrop-blur-xl border-r-2 border-[var(--theme-tertiary)] transition-all duration-300 flex flex-col ${isCollapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b-2 border-[var(--theme-tertiary)]">
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <div
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--theme-tertiary)] to-[var(--theme-quaternary)] flex items-center justify-center flex-shrink-0 cursor-pointer shadow-md"
            onClick={() => isCollapsed && setIsCollapsed(false)}
          >
            <span className="text-sm font-bold text-[var(--theme-secondary)]">BF</span>
          </div>
          {!isCollapsed && (
            <>
              <span className="font-medium whitespace-nowrap text-[var(--theme-tertiary)]">BeatForge</span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-md hover:bg-[var(--theme-quaternary)]/20 transition-colors ml-auto text-[var(--theme-tertiary)]"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-1 p-2">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={` text-base flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2.5 rounded-lg transition-all duration-200 
                ${isActive
                  ? 'bg-[var(--theme-quaternary)]/10 hover:bg-[var(--theme-quaternary)]/15'
                  : 'hover:bg-[var(--theme-quaternary)]/5 hover:translate-x-1'
                } relative group`}
            >
              <div className={`flex items-center justify-center w-6 transition-transform duration-200 ${isActive
                ? 'text-[var(--theme-tertiary)]'
                : 'text-[var(--theme-tertiary)]/60 group-hover:text-[var(--theme-tertiary)] group-hover:scale-110'
                }`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`text-base font-medium transition-colors duration-200 ${isActive ? 'text-[var(--theme-tertiary)]' : 'text-[var(--theme-tertiary)]/60 group-hover:text-[var(--theme-tertiary)]'
                  }`}>
                  {item.label}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--theme-tertiary)] rounded-r-full shadow-md" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 mb-8 border-t-2 border-[var(--theme-tertiary)]">
          <div className="text-xs text-[var(--theme-tertiary)]/70">
            <p>BeatForge v1.0.0</p>
            <p>Made with ♥ by @prodbyeagle</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
