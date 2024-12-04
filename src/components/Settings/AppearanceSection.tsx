import { Palette, ChevronRight } from 'lucide-react';
import { Theme } from '../../themes';
import { ThemeColorSet } from '../../types/Theme';

interface AppearanceSectionProps {
  currentTheme: Theme;
  onOpenThemeModal: () => void;
}

export const AppearanceSection = ({ currentTheme, onOpenThemeModal }: AppearanceSectionProps) => {
  return (
    <section className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
      <div className="px-6 py-4 border-b border-[var(--theme-border)]">
        <h2 className="text-xl font-semibold">Appearance</h2>
      </div>

      <div className="p-4 space-y-2">
        <button
          onClick={onOpenThemeModal}
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
  );
};
