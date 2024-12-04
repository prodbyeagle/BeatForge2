import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Theme } from '../../themes';
import { ThemeColorSet } from '../../types/Theme';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

const renderColorPalette = (theme: Theme) => {
  const colorSets = [
    { name: 'Background', colors: theme.colors.background },
    { name: 'Surface', colors: theme.colors.surface },
    { name: 'Primary', colors: theme.colors.primary },
    { name: 'Secondary', colors: theme.colors.secondary },
    { name: 'Accent', colors: theme.colors.accent },
    { name: 'Text', colors: theme.colors.text }
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {colorSets.map(set => (
        <div key={set.name} className="space-y-2">
          <h4 className="text-sm font-medium opacity-70">{set.name}</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(set.colors).map(([state, color]) => (
              <div 
                key={state} 
                className="flex items-center gap-2 p-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface-hover)]"
              >
                <div
                  className="w-4 h-4 rounded-full border border-[var(--theme-border)]"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs capitalize">{state}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const ThemeModal = ({
  isOpen,
  onClose,
  themes,
  currentTheme,
  onSelectTheme
}: ThemeModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Theme Settings"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 max-h-[70vh] overflow-y-auto px-2">
          {themes.map((theme: Theme) => (
            <div
              key={theme.name}
              className={`
                overflow-hidden rounded-xl border transition-all duration-300
                ${currentTheme?.name === theme.name
                  ? 'border-[var(--theme-primary)] bg-[var(--theme-surface)]'
                  : 'border-[var(--theme-border)] hover:border-[var(--theme-border)] hover:bg-[var(--theme-background)]'
                }
              `}
            >
              <div className="p-4 border-b border-[var(--theme-border)]">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{theme.name}</h3>
                    {theme.author && (
                      <p className="text-sm opacity-70">by {theme.author}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {(['primary', 'secondary', 'accent'] as const).map(name => (
                        <div
                          key={name}
                          className="w-6 h-6 rounded-full border-2 border-[var(--theme-surface)]"
                          style={{ 
                            backgroundColor: typeof theme.colors[name] === 'object' 
                              ? (theme.colors[name] as ThemeColorSet).base
                              : theme.colors[name]
                          }}
                          title={name}
                        />
                      ))}
                    </div>
                    {currentTheme.name !== theme.name && (
                      <Button
                        variant="primary"
                        style={{
                          backgroundColor: typeof theme.colors.accent === 'object' 
                            ? theme.colors.accent.base
                            : theme.colors.accent,
                          borderColor: typeof theme.colors.accent === 'object' 
                            ? theme.colors.accent.base
                            : theme.colors.accent,
                          color: typeof theme.colors.text === 'object'
                            ? theme.colors.text.base
                            : theme.colors.text
                        }}
                        onClick={() => {
                          onSelectTheme(theme);
                          onClose();
                        }}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                {renderColorPalette(theme)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
