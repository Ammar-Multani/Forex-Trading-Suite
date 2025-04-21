import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text, RadioButton, Divider, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type ThemeItemIcon = "sunny-outline" | "moon-outline" | "settings-outline";

export default function AppearanceScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDark, theme, colors } = useTheme();

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: "sunny-outline" as ThemeItemIcon,
      description: "Classic light theme with white backgrounds",
      preview: {
        background: "#f6f6f6",
        surface: "#ffffff",
        text: "#000000",
        primary: colors.primary,
      },
    },
    {
      value: "dark",
      label: "Dark",
      icon: "moon-outline" as ThemeItemIcon,
      description: "Dark theme with reduced brightness for night use",
      preview: {
        background: "#121212",
        surface: "#1E1E1E",
        text: "#ffffff",
        primary: colors.primaryLight,
      },
    },
    {
      value: "system",
      label: "System Default",
      icon: "settings-outline" as ThemeItemIcon,
      description: "Follow your device appearance settings",
      preview: {
        background: isDark ? "#121212" : "#f6f6f6",
        surface: isDark ? "#1E1E1E" : "#ffffff",
        text: isDark ? "#ffffff" : "#000000",
        primary: isDark ? colors.primaryLight : colors.primary,
      },
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <View
        style={[styles.header, { borderBottomColor: theme.colors.outline }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={{ color: theme.colors.text }}>
          Appearance
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.text, marginBottom: 16 }}
        >
          Theme
        </Text>

        {themes.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.themeOption,
              {
                backgroundColor: theme.colors.surface,
                borderColor:
                  themeMode === item.value
                    ? theme.colors.primary
                    : theme.colors.outline,
                borderWidth: themeMode === item.value ? 2 : 1,
              },
            ]}
            onPress={() =>
              setThemeMode(item.value as "light" | "dark" | "system")
            }
            activeOpacity={0.7}
          >
            <View style={styles.themeHeader}>
              <View style={styles.themeInfo}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        themeMode === item.value
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={
                      themeMode === item.value
                        ? "white"
                        : theme.colors.onSurfaceVariant
                    }
                  />
                </View>
                <View>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.text, marginBottom: 4 }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {item.description}
                  </Text>
                </View>
              </View>

              <RadioButton
                value={item.value}
                status={themeMode === item.value ? "checked" : "unchecked"}
                onPress={() =>
                  setThemeMode(item.value as "light" | "dark" | "system")
                }
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.themePreview}>
              <View
                style={[
                  styles.previewContainer,
                  { backgroundColor: item.preview.background },
                ]}
              >
                <View
                  style={[
                    styles.previewHeader,
                    { backgroundColor: item.preview.primary },
                  ]}
                >
                  <View style={styles.previewStatusBar} />
                </View>
                <View style={styles.previewContent}>
                  <View
                    style={[
                      styles.previewCard,
                      { backgroundColor: item.preview.surface },
                    ]}
                  >
                    <View style={styles.previewCardLine} />
                    <View style={[styles.previewCardLine, { width: "60%" }]} />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {Platform.OS === "android" && (
          <Text
            variant="bodySmall"
            style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
          >
            Your status bar and navigation bar appearance will also be updated
            to match your theme.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    height: 90,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 25,
  },
  themeOption: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  themeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  themeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  themePreview: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  previewContainer: {
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  previewHeader: {
    height: 24,
  },
  previewStatusBar: {
    height: 6,
  },
  previewContent: {
    flex: 1,
    padding: 8,
  },
  previewCard: {
    borderRadius: 6,
    padding: 8,
    height: 50,
    justifyContent: "center",
  },
  previewCardLine: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(127, 127, 127, 0.2)",
    borderRadius: 3,
    marginVertical: 4,
  },
  note: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
});
