import {
  fontSize,
  fontWeight,
  radius,
  shadow,
  spacing,
  zIndex,
} from '@/constants/theme';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

const palette = {
  // Primary
  blue: {
    50: '#E6F1FF',
    100: '#CCE4FF',
    200: '#99C9FF',
    300: '#66ADFF',
    400: '#3392FF',
    500: '#0077FF', // Primary color
    600: '#005FCC',
    700: '#004799',
    800: '#003066',
    900: '#001833',
  },

  // Success (Income)
  green: {
    50: '#E6F9F1',
    100: '#CCF3E3',
    200: '#99E6C7',
    300: '#66DAAB',
    400: '#33CD8F',
    500: '#00C173', // Success color
    600: '#009A5C',
    700: '#007445',
    800: '#004D2E',
    900: '#002717',
  },

  // Error (Expense)
  red: {
    50: '#FCE8E8',
    100: '#F9D1D1',
    200: '#F2A3A3',
    300: '#EC7575',
    400: '#E54747',
    500: '#DF1919', // Error color
    600: '#B21414',
    700: '#860F0F',
    800: '#590A0A',
    900: '#2D0505',
  },

  // Warning
  yellow: {
    50: '#FFF9E6',
    100: '#FFF3CC',
    200: '#FFE799',
    300: '#FFDB66',
    400: '#FFCF33',
    500: '#FFC300', // Warning color
    600: '#CC9C00',
    700: '#997500',
    800: '#664E00',
    900: '#332700',
  },

  // Neutral
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Define theme colors
export const darkTheme = {
  // Brand Colors
  primary: '#a3e635', // Lime Green
  primaryLight: '#0ea5e9', // Sky Blue
  primaryDark: '#0369a1', // Dark Cyan

  background: palette.gray[900],

  // Text
  text: palette.gray[50],
  textLight: '#e5e5e5', // Light Gray
  textLighter: '#d4d4d4', // Lighter Gray
  border: '#2D3235',

  // Base Colors
  white: '#fff',
  black: '#000',
  rose: '#ef4444', // Rose Red
  green: '#16a34a', // Green
  error: '#ef4444', // Same as rose

  card: palette.gray[800],
  textSecondary: palette.gray[300],

  // Neutral Scale (Grayscale)
  neutral50: '#fafafa', // Gray 50
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

export const lightTheme = {
  // Brand Colors
  primary: '#4f46e5', // Indigo (vibrant on light bg)
  primaryLight: '#93c5fd', // Light Blue
  primaryDark: '#1e3a8a', // Dark Blue

  background: palette.gray[50],

  // Text
  text: palette.gray[900],
  textLight: '#334155', // Slate-700
  textLighter: '#64748b', // Slate-500
  textSecondary: palette.gray[600],
  border: '#E9EDF5',
  // Base Colors
  white: '#ffffff',
  black: '#000000',
  rose: '#dc2626', // Red-600
  green: '#15803d', // Green-700
  error: '#dc2626',

  card: '#ffffff',

  // Neutral Scale (Grayscale)
  neutral50: '#f9fafb', // Gray 50
  neutral100: '#f3f4f6',
  neutral200: '#e5e7eb',
  neutral300: '#d1d5db',
  neutral350: '#cbd5e1',
  neutral400: '#9ca3af',
  neutral500: '#6b7280',
  neutral600: '#4b5563',
  neutral700: '#374151',
  neutral800: '#1f2937',
  neutral900: '#0f172a',
};

type ThemeContextType = {
  colors: typeof lightTheme | typeof darkTheme;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  shadow: typeof shadow;
  zIndex: typeof zIndex;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Get system color scheme
  const colorScheme = useColorScheme();
  console.log('🎨 colorScheme from system:', colorScheme);

  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  // Update theme when system preferences change
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const toggleTheme = () => {
    setIsDark((prevIsDark) => !prevIsDark);
  };

  const theme = {
    colors: isDark ? darkTheme : lightTheme,
    // colors: darkTheme,
    spacing,
    radius,
    fontSize,
    fontWeight,
    shadow,
    zIndex,
    isDark,
    toggleTheme,
  };

  console.log('theme', theme);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  try {
    const context = useContext(ThemeContext);
    if (!context) {
      console.error('❌ useTheme() was called outside ThemeProvider');
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
  } catch (e) {
    console.error('🔥 useTheme() call stack:', new Error().stack);
    throw e;
  }
};
