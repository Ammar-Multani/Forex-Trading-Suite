import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Appearance, StatusBar, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme, AppTheme, brandColors } from "../utils/theme";
import * as NavigationBar from "expo-navigation-bar";

type ThemeMode = "light" | "dark" | "system";

// Storage key for theme mode
const THEME_MODE_STORAGE_KEY = "@forex_calculator_theme_mode";

// Gradient configurations for different components
type GradientType = "card" | "button" | "header" | "background";

// Function to get gradient based on component type and theme
const getGradientConfig = (type: GradientType, isDark: boolean) => {
  switch (type) {
    case "card":
      return {
        colors: isDark
          ? ["rgba(30, 30, 30, 0.8)", "rgba(20, 20, 20, 0.9)"]
          : ["rgba(255, 255, 255, 0.9)", "rgba(245, 245, 245, 0.8)"],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
    case "button":
      return {
        colors: [brandColors.primary, brandColors.primaryDark],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
      };
    case "header":
      return {
        colors: isDark ? ["#1a1a1a", "#121212"] : ["#ffffff", "#f6f6f6"],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
      };
    case "background":
      return {
        colors: isDark ? ["#121212", "#0a0a0a"] : ["#f6f6f6", "#ffffff"],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
      };
    default:
      return {
        colors: isDark
          ? ["rgba(30, 30, 30, 0.8)", "rgba(20, 20, 20, 0.9)"]
          : ["rgba(255, 255, 255, 0.9)", "rgba(245, 245, 245, 0.8)"],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
  }
};

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: typeof lightTheme.colors; // Export full theme colors
  getGradient: (type: GradientType) => {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  themeMode: "system",
  isDark: true,
  setThemeMode: () => {},
  toggleTheme: () => {},
  colors: darkTheme.colors,
  getGradient: () => ({
    colors: ["#000", "#000"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  }),
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use Appearance API directly for more reliable system theme detection
  const [systemColorScheme, setSystemColorScheme] = useState(
    Appearance.getColorScheme() || "light"
  );
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoading, setIsLoading] = useState(true);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || "light");
    });

    return () => {
      // Using optional chaining for backward compatibility
      subscription?.remove?.();
    };
  }, []);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(
          THEME_MODE_STORAGE_KEY
        );
        if (
          savedThemeMode &&
          ["light", "dark", "system"].includes(savedThemeMode)
        ) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Update system UI (status bar and navigation bar)
  const updateSystemUI = useCallback(async (isDarkMode: boolean) => {
    if (Platform.OS === "android") {
      // Update status bar
      StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
      StatusBar.setBackgroundColor("transparent");
      StatusBar.setTranslucent(true);

      // Update navigation bar
      await NavigationBar.setBackgroundColorAsync(
        isDarkMode ? darkTheme.colors.background : lightTheme.colors.background
      );
      await NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
    }
  }, []);

  // Save theme preference when it changes
  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      try {
        await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
        setThemeModeState(mode);

        // Determine if dark mode should be used
        const isDarkMode =
          mode === "dark" ||
          (mode === "system" && systemColorScheme === "dark");

        // Update system UI
        updateSystemUI(isDarkMode);
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    },
    [systemColorScheme, updateSystemUI]
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  // Determine if dark mode should be used
  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  // Get the appropriate theme
  const theme = isDark ? darkTheme : lightTheme;

  // Function to get gradient for components
  const getGradient = useCallback(
    (type: GradientType) => getGradientConfig(type, isDark),
    [isDark]
  );

  // Apply system UI styling on initial load or when isDark changes
  useEffect(() => {
    updateSystemUI(isDark);
  }, [isDark, updateSystemUI]);

  // Don't render until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
        colors: theme.colors,
        getGradient,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
