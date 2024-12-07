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

import themesJson from './themes.json';
const themesData = themesJson as ThemesData;
export const themes: Theme[] = themesData.themes;
export const defaultTheme: Theme = themes[0];
export const cssVar = (name: string) => `var(--theme-${name})`;

export const withOpacity = (color: string, opacity: number) => {
  const rgb = hexToRgb(color);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : color;
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const gradient = (from: string, to: string, direction = '45deg') =>
  `linear-gradient(${direction}, ${from}, ${to})`;
