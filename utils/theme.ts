import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { ColorSchemeName } from 'react-native';

// Adapt navigation themes
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Custom colors for light theme
const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#6200ee',
  secondary: '#03dac6',
  background: '#f6f6f6',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#000000',
  border: '#e0e0e0',
  notification: '#f50057',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FB8C00',
  info: '#2196F3',
  onSurface: '#000000',
  onBackground: '#000000',
  onPrimary: '#ffffff',
  onSecondary: '#000000',
  surfaceVariant: '#f0f0f0',
  onSurfaceVariant: '#666666',
};

// Custom colors for dark theme
const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#bb86fc',
  secondary: '#03dac6',
  background: '#121212',
  surface: '#1E1E1E',
  card: '#1E1E1E',
  text: '#ffffff',
  border: '#2c2c2c',
  notification: '#cf6679',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FB8C00',
  info: '#2196F3',
  onSurface: '#ffffff',
  onBackground: '#ffffff',
  onPrimary: '#000000',
  onSecondary: '#000000',
  surfaceVariant: '#2A2A2A',
  onSurfaceVariant: '#aaaaaa',
};

// Create custom font configuration
const fontConfig = {
  fontFamily: 'System',
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

// Create light theme
export const lightTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: lightColors,
  dark: false,
  mode: 'exact' as const,
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.regular,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.regular,
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.regular,
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.medium,
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.medium,
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.medium,
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.bold,
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.bold,
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.bold,
    },
  },
};

// Create dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: darkColors,
  dark: true,
  mode: 'exact' as const,
  fonts: {
    ...MD3DarkTheme.fonts,
    bodyLarge: {
      ...MD3DarkTheme.fonts.bodyLarge,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.regular,
    },
    bodyMedium: {
      ...MD3DarkTheme.fonts.bodyMedium,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.regular,
    },
    bodySmall: {
      ...MD3DarkTheme.fonts.bodySmall,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.regular,
    },
    labelLarge: {
      ...MD3DarkTheme.fonts.labelLarge,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.medium,
    },
    labelMedium: {
      ...MD3DarkTheme.fonts.labelMedium,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.medium,
    },
    labelSmall: {
      ...MD3DarkTheme.fonts.labelSmall,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.medium,
    },
    titleLarge: {
      ...MD3DarkTheme.fonts.titleLarge,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.bold,
    },
    titleMedium: {
      ...MD3DarkTheme.fonts.titleMedium,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.bold,
    },
    titleSmall: {
      ...MD3DarkTheme.fonts.titleSmall,
      fontFamily: fontConfig.fontFamily,
      fontWeight: fontConfig.fontWeight.bold,
    },
  },
};

// Get theme based on scheme
export const getTheme = (scheme: ColorSchemeName) => {
  return scheme === 'dark' ? darkTheme : lightTheme;
};

// Theme interface
export interface AppTheme {
  dark: boolean;
  colors: typeof darkColors;
  mode: 'exact';
  fonts: typeof darkTheme.fonts;
}
