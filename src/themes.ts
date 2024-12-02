export interface ThemeValue {
  name: string;
  color: string;
  _comment?: string;
}

export interface Theme {
  name: string;
  description: string;
  author?: string;
  owner?: boolean;
  warning?: boolean;
  values: ThemeValue[];
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
