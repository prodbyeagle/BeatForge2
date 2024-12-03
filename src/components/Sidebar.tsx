import { useState } from 'react';
import { Library, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activePage: 'library' | 'settings';
  onNavigate: (page: 'library' | 'settings') => void;
}

const Sidebar = ({ activePage, onNavigate }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { icon: <Library size={24} />, label: 'Library', id: 'library' as const },
    { icon: <Settings size={24} />, label: 'Settings', id: 'settings' as const },
  ];

  const handleNavigate = (pageId: 'library' | 'settings') => {
    onNavigate(pageId);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        h-screen bg-[var(--theme-primary)]/80 backdrop-blur-2xl
        shadow-[1px_0_20px_rgba(0,0,0,0.1)]
        transition-all duration-300 ease-in-out
        flex flex-col relative
        ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute -right-3 top-20 z-10
          w-6 h-6 rounded-md 
          bg-[var(--theme-secondary)]
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          text-[var(--theme-tertiary)]/70
          hover:text-[var(--theme-tertiary)]
          hover:scale-110
          transition-all duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className="h-16 flex items-center px-5 relative">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--theme-tertiary)]/10 to-transparent" />
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <div
            className={`
              w-8 h-8 rounded-xl
              bg-gradient-to-br from-[var(--theme-tertiary)] to-[var(--theme-quaternary)]
              flex items-center justify-center flex-shrink-0
              cursor-pointer shadow-lg
              hover:shadow-xl hover:scale-105
              transition-all duration-300
            `}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className="text-sm font-bold tracking-wider text-[var(--theme-secondary)]">BF</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold tracking-wide whitespace-nowrap text-[var(--theme-tertiary)]">
              BeatForge
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-1.5 p-3">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`
                text-base flex items-center
                ${isCollapsed ? 'justify-center' : 'gap-3'}
                p-3 rounded-xl
                transition-all duration-200
                group relative
                ${isActive
                  ? 'bg-[var(--theme-quaternary)]/10 hover:bg-[var(--theme-quaternary)]/15'
                  : 'hover:bg-[var(--theme-quaternary)]/5'
                }
                ${!isActive && !isCollapsed && 'hover:translate-x-1.5'}
              `}
            >
              <div className={`
                flex items-center justify-center w-6
                transition-all duration-200
                ${isActive
                  ? 'text-[var(--theme-tertiary)]'
                  : 'text-[var(--theme-tertiary)]/60 group-hover:text-[var(--theme-tertiary)]'
                }
                ${!isActive && 'group-hover:scale-110'}
              `}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`
                  text-base font-medium tracking-wide
                  transition-colors duration-200
                  ${isActive
                    ? 'text-[var(--theme-tertiary)]'
                    : 'text-[var(--theme-tertiary)]/60 group-hover:text-[var(--theme-tertiary)]'
                  }
                `}>
                  {item.label}
                </span>
              )}
              {isActive && (
                <div className="
                  absolute left-0 top-1/2 -translate-y-1/2
                  w-1 h-8 bg-gradient-to-b from-[var(--theme-tertiary)] to-[var(--theme-quaternary)]
                  rounded-r-full shadow-lg
                  animate-pulse
                " />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-5 mb-6 relative">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--theme-tertiary)]/10 to-transparent" />
          <div className="text-xs space-y-1">
            <p className="font-medium text-[var(--theme-tertiary)]/70 hover:text-[var(--theme-tertiary)] transition-colors">
              BeatForge v1.0.0
            </p>
            <p className="font-medium text-[var(--theme-tertiary)]/50 hover:text-[var(--theme-tertiary)]/70 transition-colors">
              Made with ♥ by @prodbyeagle
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
