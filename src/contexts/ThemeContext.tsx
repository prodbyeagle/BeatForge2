import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, defaultTheme, themes } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = 'beatforge-theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      try {
        // Find the theme in our themes array by name
        const parsedTheme = JSON.parse(savedTheme);
        const foundTheme = themes.find(t => t.name === parsedTheme.name);
        if (foundTheme) {
          return foundTheme;
        }
      } catch (error) {
        console.error('Error loading theme from localStorage:', error);
      }
    }
    return defaultTheme;
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(currentTheme));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [currentTheme]);

  // Apply theme colors to CSS variables
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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
