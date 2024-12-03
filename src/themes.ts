export interface ThemeValue {
  name: string;
  color: string;
  opacity?: number;
  gradient?: {
    from: string;
    to: string;
    direction?: string;
  };
  _comment?: string;
}

export interface ThemeColorSet {
  base: string;
  hover?: string;
  active?: string;
  disabled?: string;
}

export interface Theme {
  name: string;
  description: string;
  author?: string;
  owner?: boolean;
  warning?: boolean;
  values: ThemeValue[];
  colors: {
    background: ThemeColorSet;
    surface: ThemeColorSet;
    primary: ThemeColorSet;
    secondary: ThemeColorSet;
    accent: ThemeColorSet;
    text: ThemeColorSet;
    border: string;
    divider: string;
    shadow: string;
    overlay: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  custom?: {
    [key: string]: string | ThemeColorSet;
  };
}

interface ThemesData {
  themes: Theme[];
}

// Import themes from JSON file
import themesJson from './themes.json';
const themesData = themesJson as ThemesData;

// Export themes array
export const themes: Theme[] = themesData.themes;

// Export default theme (first theme in the array)
export const defaultTheme: Theme = themes[0];

// Helper function to generate CSS variable name
export const cssVar = (name: string) => `var(--theme-${name})`;

// Helper function to generate opacity variant
export const withOpacity = (color: string, opacity: number) => {
  const rgb = hexToRgb(color);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : color;
};

// Helper function to convert hex to rgb
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Helper function to generate gradient
export const gradient = (from: string, to: string, direction = '45deg') => 
  `linear-gradient(${direction}, ${from}, ${to})`;
