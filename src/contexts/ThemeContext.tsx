import React, { createContext, useContext, useState, useEffect } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import { Theme, defaultTheme, themes } from '../themes';

/** Context interface for theme management */
interface ThemeContextType {
  /** Currently active theme */
  currentTheme: Theme;
  /** Updates the active theme
   * @param theme - New theme to apply
   */
  setTheme: (theme: Theme) => void;
}

/** Store instance for theme persistence */
const store = new LazyStore('settings.json');

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Provider component for theme management */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * Initialize theme state from store or default
   * Falls back to default theme if stored theme is invalid
   */
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  /** Load theme from store on mount */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await store.get<Theme>('theme');
        if (savedTheme) {
          const foundTheme = themes.find(t => t.name === savedTheme.name);
          if (foundTheme) {
            setCurrentTheme(foundTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme from store:', error);
      }
    };
    loadTheme();
  }, []);

  /** Persist theme preference to store */
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await store.set('theme', currentTheme);
        await store.save();
      } catch (error) {
        console.error('Error saving theme to store:', error);
      }
    };
    saveTheme();
  }, [currentTheme]);

  /** Apply theme colors to CSS custom properties */
  useEffect(() => {
    const root = document.documentElement;
    currentTheme.values.forEach(value => {
      root.style.setProperty(`--theme-${value.name}`, value.color);
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** 
 * Hook to access the theme context
 * @throws Error if used outside of ThemeProvider
 * @returns ThemeContextType containing current theme and setter
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
