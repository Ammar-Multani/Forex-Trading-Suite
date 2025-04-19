import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6200ee',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#CF6679',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
  },
};

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#000000',
    error: '#B00020',
    onBackground: '#000000',
    onSurface: '#000000',
  },
};

// Common styles
export const commonStyles = {
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
};