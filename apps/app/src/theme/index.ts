import { lightColors, darkColors, Colors } from './colors';
import { spacing, borderRadius, fontSizes } from './spacing';

export type Theme = {
  colors: Colors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSizes: typeof fontSizes;
  isDark: boolean;
};

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  fontSizes,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  borderRadius,
  fontSizes,
  isDark: true,
};

export * from './colors';
export * from './spacing';
