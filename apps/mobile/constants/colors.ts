/**
 * OmniValue AI colour palette.
 * Reference colours via the useColors() hook — never hardcode hex in components.
 */

const palette = {
  // Brand
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4B44CC',

  // Neutrals
  black: '#0A0A0A',
  grey900: '#111111',
  grey800: '#1C1C1E',
  grey700: '#2C2C2E',
  grey600: '#3A3A3C',
  grey400: '#636366',
  grey200: '#AEAEB2',
  grey100: '#E5E5EA',
  white: '#FFFFFF',

  // Semantic
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#0A84FF',
} as const;

export const Colors = {
  light: {
    background: palette.white,
    surface: palette.grey100,
    border: palette.grey100,
    text: palette.black,
    textSecondary: palette.grey400,
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
  },
  dark: {
    background: palette.black,
    surface: palette.grey800,
    border: palette.grey700,
    text: palette.white,
    textSecondary: palette.grey200,
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ColorScheme];
