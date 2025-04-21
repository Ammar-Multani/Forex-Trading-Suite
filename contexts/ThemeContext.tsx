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

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: typeof brandColors; // Export brand colors for direct use
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  themeMode: "system",
  isDark: true,
  setThemeMode: () => {},
  toggleTheme: () => {},
  colors: brandColors,
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
        colors: brandColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
