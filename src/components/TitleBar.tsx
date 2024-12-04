import React from 'react';
import { Window } from '@tauri-apps/api/window';
import { Maximize2, Minimize2, X } from 'lucide-react';

const TitleBar: React.FC = () => {
  const handleMinimize = async () => {
    const appWindow = Window.getCurrent();
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    const appWindow = Window.getCurrent();
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    const appWindow = Window.getCurrent();
    await appWindow.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 h-9 
                flex items-center justify-between 
                bg-[var(--theme-background)] backdrop-blur-md
                z-50 px-3"
    >
      {/* Window Controls (Left Side) */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleClose}
          className="group relative w-3 h-3 rounded-full 
                  bg-[#FF5F57] hover:bg-[#FF5F57]/90 
                  transition-all duration-200
                  hover:ring-4 hover:ring-[#FF5F57]/20"
          title="Close"
        >
          <X
            size={8}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    opacity-0 group-hover:opacity-50 text-black 
                    transition-opacity duration-200"
          />
        </button>
        <button
          onClick={handleMinimize}
          className="group relative w-3 h-3 rounded-full 
                  bg-[#FFBD2E] hover:bg-[#FFBD2E]/90 
                  transition-all duration-200
                  hover:ring-4 hover:ring-[#FFBD2E]/20"
          title="Minimize"
        >
          <Minimize2
            size={8}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    opacity-0 group-hover:opacity-50 text-black 
                    transition-opacity duration-200"
          />
        </button>
        <button
          onClick={handleMaximize}
          className="group relative w-3 h-3 rounded-full 
                  bg-[#28C840] hover:bg-[#28C840]/90 
                  transition-all duration-200
                  hover:ring-4 hover:ring-[#28C840]/20"
          title="Maximize"
        >
          <Maximize2
            size={8}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    opacity-0 group-hover:opacity-50 text-black 
                    transition-opacity duration-200"
          />
        </button>
      </div>

      {/* App Title (Center) */}
      <div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                select-none flex items-center gap-1.5"
        data-tauri-drag-region
      >
        <span className="text-xs font-medium tracking-wide 
                      text-[var(--theme-text)]
                      transition-opacity duration-200
                      hover:opacity-100">
          BeatForge
        </span>
        <span className="text-[10px] font-medium px-1 py-0.5 
                      rounded bg-[var(--theme-surface)] 
                      text-[var(--theme-text)]">
          BETA | 0.4.3
        </span>
      </div>

      {/* Right Side Space (for symmetry) */}
      <div className="w-[52px]" />
    </div>
  );
};

export default TitleBar;