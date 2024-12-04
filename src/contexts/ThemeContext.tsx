import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import { Theme, defaultTheme, themes, withOpacity, gradient, ThemeColorSet } from '../themes';

/** Context interface for theme management */
interface ThemeContextType {
  /** Currently active theme */
  currentTheme: Theme;
  /** Updates the active theme */
  setTheme: (theme: Theme) => void;
  /** Get a color with opacity */
  getColorWithOpacity: (color: string, opacity: number) => string;
  /** Get a gradient */
  getGradient: (from: string, to: string, direction?: string) => string;
  /** Get a color state from a color set */
  getColorState: (colorSet: ThemeColorSet, state?: 'base' | 'hover' | 'active' | 'disabled') => string;
}

/** Store instance for theme persistence */
const store = new LazyStore('themes.json');

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Provider component for theme management */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);

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
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  /** Persist theme preference to store */
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;

    // Skip the first save after initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const saveTheme = async () => {
      try {
        await store.set('theme', currentTheme);
        await store.save();
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };
    saveTheme();
  }, [currentTheme, isLoading]);

  /** Apply theme colors to CSS custom properties */
  useEffect(() => {
    const root = document.documentElement;

    // Apply basic values
    currentTheme.values.forEach(value => {
      root.style.setProperty(`--theme-${value.name}`, value.color);

      // Apply opacity variants if specified
      if (value.opacity) {
        root.style.setProperty(
          `--theme-${value.name}-alpha`,
          withOpacity(value.color, value.opacity)
        );
      }

      // Apply gradients if specified
      if (value.gradient) {
        root.style.setProperty(
          `--theme-${value.name}-gradient`,
          gradient(value.gradient.from, value.gradient.to, value.gradient.direction)
        );
      }
    });

    // Apply color sets
    Object.entries(currentTheme.colors).forEach(([name, colorSet]) => {
      if (typeof colorSet === 'string') {
        root.style.setProperty(`--theme-${name}`, colorSet);
      } else {
        root.style.setProperty(`--theme-${name}`, colorSet.base);
        if (colorSet.hover) root.style.setProperty(`--theme-${name}-hover`, colorSet.hover);
        if (colorSet.active) root.style.setProperty(`--theme-${name}-active`, colorSet.active);
        if (colorSet.disabled) root.style.setProperty(`--theme-${name}-disabled`, colorSet.disabled);
      }
    });

    // Apply custom properties
    if (currentTheme.custom) {
      Object.entries(currentTheme.custom).forEach(([name, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-custom-${name}`, value);
        } else {
          root.style.setProperty(`--theme-custom-${name}`, value.base);
          if (value.hover) root.style.setProperty(`--theme-custom-${name}-hover`, value.hover);
          if (value.active) root.style.setProperty(`--theme-custom-${name}-active`, value.active);
          if (value.disabled) root.style.setProperty(`--theme-custom-${name}-disabled`, value.disabled);
        }
      });
    }
  }, [currentTheme]);

  const getColorWithOpacity = (color: string, opacity: number) => withOpacity(color, opacity);
  const getGradient = (from: string, to: string, direction?: string) => gradient(from, to, direction);
  const getColorState = (colorSet: ThemeColorSet, state: 'base' | 'hover' | 'active' | 'disabled' = 'base') =>
    colorSet[state] || colorSet.base;

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme: setCurrentTheme,
      getColorWithOpacity,
      getGradient,
      getColorState
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** Hook to access the theme context */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
