import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { ColorSchemeName } from "react-native";

// Adapt navigation themes
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Primary brand colors
const brandColors = {
  primary: "#6366F1", // Indigo
  primaryDark: "#4F46E5",
  primaryLight: "#818CF8",
  secondary: "#06B6D4", // Cyan
  secondaryDark: "#0891B2",
  secondaryLight: "#22D3EE",
  accent: "#8B5CF6", // Violet
  accentDark: "#7C3AED",
  accentLight: "#A78BFA",
};

// Custom colors for light theme
const lightColors = {
  ...MD3LightTheme.colors,
  primary: brandColors.primary,
  primaryContainer: brandColors.primaryLight,
  secondary: brandColors.secondary,
  secondaryContainer: brandColors.secondaryLight,
  background: "#f6f6f6",
  surface: "#ffffff",
  surfaceVariant: "#f0f0f0",
  card: "#ffffff",
  text: "#000000",
  border: "#e0e0e0",
  notification: "#f50057",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  onSurface: "#000000",
  onBackground: "#000000",
  onPrimary: "#ffffff",
  onSecondary: "#000000",
  onSurfaceVariant: "#666666",
  outline: "rgba(0, 0, 0, 0.1)",
  elevation: {
    level0: "transparent",
    level1: "rgba(0, 0, 0, 0.05)",
    level2: "rgba(0, 0, 0, 0.08)",
    level3: "rgba(0, 0, 0, 0.1)",
    level4: "rgba(0, 0, 0, 0.12)",
    level5: "rgba(0, 0, 0, 0.14)",
  },
};

// Custom colors for dark theme
const darkColors = {
  ...MD3DarkTheme.colors,
  primary: brandColors.primaryLight,
  primaryContainer: brandColors.primary,
  secondary: brandColors.secondaryLight,
  secondaryContainer: brandColors.secondary,
  background: "#121212",
  surface: "#1E1E1E",
  surfaceVariant: "#2A2A2A",
  card: "#1E1E1E",
  text: "#ffffff",
  border: "#2c2c2c",
  notification: "#cf6679",
  error: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  info: "#60A5FA",
  onSurface: "#ffffff",
  onBackground: "#ffffff",
  onPrimary: "#000000",
  onSecondary: "#000000",
  onSurfaceVariant: "#aaaaaa",
  outline: "rgba(255, 255, 255, 0.15)",
  elevation: {
    level0: "transparent",
    level1: "rgba(0, 0, 0, 0.05)",
    level2: "rgba(0, 0, 0, 0.08)",
    level3: "rgba(0, 0, 0, 0.1)",
    level4: "rgba(0, 0, 0, 0.12)",
    level5: "rgba(0, 0, 0, 0.14)",
  },
};

// Create custom font configuration
const fontConfig = {
  fontFamily: "System",
  fontWeight: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
};

// Create light theme
export const lightTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: lightColors,
  dark: false,
  mode: "exact" as const,
  roundness: 12,
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
  mode: "exact" as const,
  roundness: 12,
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
  return scheme === "dark" ? darkTheme : lightTheme;
};

// Export brand colors
export { brandColors };

// Theme interface
export interface AppTheme {
  dark: boolean;
  colors: typeof darkColors;
  mode: "exact";
  fonts: typeof darkTheme.fonts;
  roundness: number;
}
