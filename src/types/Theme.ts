export type ColorValue = string;

export type ThemeColorSet = {
  base: ColorValue;
  hover: ColorValue;
  active?: ColorValue;
  disabled?: ColorValue;
};

export type ThemeColors = {
  background: ThemeColorSet;
  surface: ThemeColorSet;
  primary: ThemeColorSet;
  secondary: ThemeColorSet;
  accent: ThemeColorSet;
  text: ThemeColorSet;
  border: ColorValue;
  divider: ColorValue;
  error: ColorValue;
  info: ColorValue;
  overlay: ColorValue;
  shadow: ColorValue;
  success: ColorValue;
  warning: ColorValue;
};

export type ThemeCustom = {
  beatCard: {
    base: ColorValue;
    hover: ColorValue;
  };
  dropzone: {
    base: ColorValue;
    active: ColorValue;
  };
  scrollbar: ColorValue;
  scrollbarThumb: ColorValue;
  scrollbarThumbHover: ColorValue;
};

export type Theme = {
  name: string;
  author?: string;
  description?: string;
  colors: ThemeColors;
  custom: ThemeCustom;
  values: Array<{
    name: string;
    color: ColorValue;
    opacity: number;
    gradient?: {
      from: ColorValue;
      to: ColorValue;
      direction: string;
    };
  }>;
};
