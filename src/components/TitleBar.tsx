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
      className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between bg-[var(--theme-primary)]/95 backdrop-blur-md z-50 px-3"
    >
      {/* Window Controls (Left Side) */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleClose}
          className="group relative w-2.5 h-2.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/90 transition-colors"
          title="Close"
        >
          <X 
            size={6} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-black transition-opacity" 
          />
        </button>
        <button
          onClick={handleMinimize}
          className="group relative w-2.5 h-2.5 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/90 transition-colors"
          title="Minimize"
        >
          <Minimize2 
            size={6} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-black transition-opacity" 
          />
        </button>
        <button
          onClick={handleMaximize}
          className="group relative w-2.5 h-2.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/90 transition-colors"
          title="Maximize"
        >
          <Maximize2 
            size={6} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-black transition-opacity" 
          />
        </button>
      </div>

      {/* App Title (Center) */}
      <div 
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none"
        data-tauri-drag-region
      >
        <span className="text-xs font-medium text-[var(--theme-tertiary)] opacity-80">BeatForge (WIP)</span>
      </div>

      {/* Right Side Space (for symmetry) */}
      <div className="w-[52px]" />
    </div>
  );
};

export default TitleBar;