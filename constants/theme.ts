// src/constants/theme.ts
import { scale, verticalScale } from '@/utils/styling';

// COLORS
export const colors = {
  primary: '#a3e635',
  primaryLight: '#0ea5e9',
  primaryDark: '#0369a1',
  text: '#fff',
  textLight: '#e5e5e5',
  textLighter: '#d4d4d4',
  white: '#fff',
  black: '#000',
  rose: '#ef4444',
  green: '#16a34a',
  error: '#ef4444',
  neutral50: '#fafafa',
  neutral100: '#f5f5f5',
  neutral200: '#e5e5e5',
  neutral300: '#d4d4d4',
  neutral350: '#CCCCCC',
  neutral400: '#a3a3a3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',
};

// SPACING
const baseX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

const baseY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const spacing = {
  x: baseX,
  y: baseY,
  default: baseY._10,
  lg: baseY._20,
};

// RADIUS
export const radius = {
  sm: verticalScale(3),
  md: verticalScale(10),
  lg: verticalScale(20),
  pill: 9999,
};

// FONT SIZES
export const fontSize = {
  xs: scale(10),
  sm: scale(12),
  base: scale(14),
  md: scale(16),
  lg: scale(18),
  xl: scale(20),
  '2xl': scale(24),
  '3xl': scale(30),
};

// FONT WEIGHTS
export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  bold: '700',
  black: '900',
} as const;

// SHADOWS
export const shadow = {
  base: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Z-INDEX
export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  modal: 100,
  toast: 1000,
  overlay: 9999,
};

// THEME EXPORT
export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  shadow,
  zIndex,
};
