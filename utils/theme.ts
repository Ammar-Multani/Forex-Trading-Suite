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
};

// Create light theme
export const lightTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: lightColors,
  dark: false,
  mode: 'exact' as const,
};

// Create dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: darkColors,
  dark: true,
  mode: 'exact' as const,
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
}
