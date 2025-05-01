import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar as RNStatusBar,
  Modal,
  Platform,
  Alert,
  Share,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
// Define a type for MaterialIcons names we use in this file
type IconName =
  | "palette"
  | "description"
  | "warning"
  | "security"
  | "help-outline"
  | "share"
  | "bug-report"
  | "delete"
  | "chevron-right"
  | "arrow-back"
  | "brightness-6"
  | "wb-sunny"
  | "nightlight-round"
  | "settings-suggest"
  | "close"
  | "check-circle"
  | "thumb-up";

// Theme option type
interface ThemeOption {
  id: string;
  name: string;
  value: "light" | "dark" | "system";
  icon: IconName;
}

// Theme options
const themeOptions: ThemeOption[] = [
  {
    id: "light",
    name: "Light Theme",
    value: "light",
    icon: "wb-sunny",
  },
  {
    id: "dark",
    name: "Dark Theme",
    value: "dark",
    icon: "nightlight-round",
  },
  {
    id: "system",
    name: "System Default",
    value: "system",
    icon: "settings-suggest",
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, colors, theme, setThemeMode, themeMode } = useTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out this amazing Forex Trading Suite app!",
      });
    } catch (error) {
      console.error("Could not open share dialog", error);
    }
  };

  const handleRateApp = () => {
    Linking.openURL(
      "https://play.google.com/store/apps/details?id=com.example.app"
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSubmitBugReport = () => {
    Linking.openURL("mailto:support@example.com?subject=Bug%20Report%20of%20Forex%20Trading%20Suite");
  };

  const handleThemePress = () => {
    setThemeModalVisible(true);
  };

  const handleCloseThemeModal = () => {
    setThemeModalVisible(false);
  };

  const handleThemeSelect = (themeValue: "light" | "dark" | "system") => {
    setThemeMode(themeValue);
    setThemeModalVisible(false);
  };

  const handleEraseContent = async () => {
    Alert.alert(
      "Erase All Content",
      "Are you sure you want to erase all content and settings? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Erase",
          onPress: async () => {
            try {
              const themeMode = await AsyncStorage.getItem("themeMode");
              await AsyncStorage.clear();
              if (themeMode) {
                await AsyncStorage.setItem("themeMode", themeMode);
              }
              Alert.alert("Content Erased", "All content has been erased.");
            } catch (error) {
              console.error("Error erasing content", error);
              Alert.alert("Error", "Failed to clear data");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: IconName,
    title: string,
    onPress: () => void,
    showChevron = true,
    rightContent?: React.ReactNode,
    color?: string
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          borderBottomColor: isDark
            ? "rgba(80, 80, 80, 0.5)"
            : "rgba(220, 220, 220, 0.8)",
          borderBottomWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={rightContent ? 1 : 0.6}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={icon}
            size={22}
            color={color || colors.primary || (isDark ? "#fff" : "#000")}
          />
        </View>
        <Text
          style={[
            styles.settingItemText,
            { color: color || (isDark ? "#FFFFFF" : "#212121") },
          ]}
        >
          {title}
        </Text>
      </View>
      {rightContent ||
        (showChevron && (
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={isDark ? "#AAAAAA" : "#757575"}
          />
        ))}
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <>
      <Text
        style={[styles.sectionTitle, { color: isDark ? "#AAAAAA" : "#757575" }]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.section,
          {
            backgroundColor: isDark ? "#1E1E1E" : "white",
            borderColor: isDark
              ? "rgba(80, 80, 80, 0.5)"
              : "rgba(220, 220, 220, 0.8)",
            borderWidth: 1,
            borderRadius: 20,
            marginBottom: 16,
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(40, 40, 40, 0.7)", "rgba(30, 30, 30, 0.5)"]
              : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 255, 0.85)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionGradient}
        >
          {children}
        </LinearGradient>
      </View>
    </>
  );

  // Function to get theme option name
  const getThemeOptionName = () => {
    const option = themeOptions.find((opt) => opt.value === themeMode);
    return option ? option.name : "System Default";
  };



  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#F8F9FA" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <RNStatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent={true}
      />

      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            borderBottomColor: isDark
              ? "rgba(75, 75, 75, 0.3)"
              : "rgba(230, 230, 230, 0.8)",
            borderBottomWidth: 1,
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(40, 40, 40, 0.8)", "rgba(30, 30, 30, 0.8)"]
              : ["rgba(255, 255, 255, 1)", "rgba(250, 250, 250, 0.95)"]
          }
          style={styles.headerGradient}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.primary || (isDark ? "#fff" : "#000")}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text
              style={[
                styles.headerTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              SETTINGS
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSection(
          "APPEARANCE",
          <>
            {renderSettingItem(
              "palette",
              "Theme",
              handleThemePress,
              true,
              <View style={styles.themePreviewContainer}>
                <Text style={{ color: isDark ? "#AAAAAA" : "#757575" }}>
                  {getThemeOptionName()}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={isDark ? "#AAAAAA" : "#757575"}
                />
              </View>
            )}
          </>
        )}

        {renderSection(
          "LEGAL",
          <>
            {renderSettingItem("description", "Terms of service", () =>
              handleNavigation("/terms")
            )}
            {renderSettingItem("warning", "Disclaimer", () =>
              handleNavigation("/disclaimer")
            )}
          </>
        )}

        {renderSection(
          "PRIVACY",
          <>
            {renderSettingItem("security", "Privacy policy", () =>
              handleNavigation("/privacy")
            )}
          </>
        )}

        {renderSection(
          "FOREX TRADING SUITE",
          <>
            {renderSettingItem("help-outline", "Manual", () =>
              handleNavigation("/manual")
            )}
            {renderSettingItem("share", "Share this app", handleShare)}
            {renderSettingItem("thumb-up", "Rate this app", handleRateApp, false)}
          </>
        )}

        {renderSection(
          "CUSTOMER SERVICE",
          <>
            {renderSettingItem(
              "bug-report",
              "Report a bug",
              handleSubmitBugReport
            )}
          </>
        )}

        {renderSection(
          "ABOUT",
          <>
            <View style={styles.aboutContainer}>
              <Text
                style={[
                  styles.appName,
                  { color: isDark ? "#FFFFFF" : "#212121" },
                ]}
              >
                Forex Trading Suite
              </Text>
              <Text
                style={[
                  styles.appVersion,
                  { color: isDark ? "#AAAAAA" : "#757575" },
                ]}
              >
                Version 1.0.0
              </Text>
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark
                      ? "rgba(80, 80, 80, 0.5)"
                      : "rgba(220, 220, 220, 0.8)",
                  },
                ]}
              />
              <Text
                style={[
                  styles.appDescription,
                  { color: isDark ? "#AAAAAA" : "#757575" },
                ]}
              >
                A professional-grade calculator suite for forex traders, with
                multiple tools for accurate trading calculations.
              </Text>
            </View>
          </>
        )}

        {/* <View style={styles.dangerSection}>
          <LinearGradient
            colors={
              isDark
                ? ["rgba(40, 40, 40, 0.7)", "rgba(30, 30, 30, 0.5)"]
                : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 255, 0.85)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.dangerSectionGradient,
              {
                borderColor: isDark
                  ? "rgba(75, 75, 75, 0.2)"
                  : "rgba(230, 230, 230, 0.8)",
                borderWidth: 1,
                borderRadius: 20,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.dangerButton,
                {
                  borderColor: isDark
                    ? "rgba(75, 75, 75, 0.2)"
                    : "rgba(230, 230, 230, 0.8)",
                  borderWidth: 1,
                  borderRadius: 20,
                },
              ]}
              onPress={handleEraseContent}
            >
              <View style={styles.dangerButtonContent}>
                <MaterialIcons name="delete" size={24} color="#F44336" />
                <Text style={[styles.dangerButtonText, { color: "#F44336" }]}>
                  Erase All Content
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isDark ? "#AAAAAA" : "#757575"}
              />
            </TouchableOpacity>
          </LinearGradient>
        </View> */}

        <View style={styles.footer}>
          <LinearGradient
            colors={
              isDark
                ? ["rgba(40, 40, 40, 0.5)", "rgba(30, 30, 30, 0.3)"]
                : ["rgba(247, 247, 247, 0.5)", "rgba(255, 255, 255, 0.3)"]
            }
            style={[
              styles.versionContainer,
              {
                borderColor: isDark
                  ? "rgba(75, 75, 75, 0.2)"
                  : "rgba(230, 230, 230, 0.8)",
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.footerText,
                { color: isDark ? "#AAAAAA" : "#9E9E9E" },
              ]}
            >
              Version 1.0.0
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseThemeModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.themeModalContainer,
              {
                backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(75, 75, 75, 0.3)"
                  : "rgba(230, 230, 230, 0.8)",
              },
            ]}
          >
            <View style={styles.themeModalHeader}>
              <Text
                style={[
                  styles.themeModalTitle,
                  { color: isDark ? "#FFFFFF" : "#212121" },
                ]}
              >
                Select Theme
              </Text>
              <TouchableOpacity onPress={handleCloseThemeModal}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={isDark ? "#FFFFFF" : "#212121"}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.themeOptionsContainer}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isDark ? "#2A2A2A" : "#F8F9FA",
                      borderColor:
                        themeMode === option.value
                          ? colors.primary || (isDark ? "#FFFFFF" : "#212121")
                          : isDark
                          ? "rgba(75, 75, 75, 0.3)"
                          : "rgba(230, 230, 230, 0.8)",
                      borderWidth: themeMode === option.value ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleThemeSelect(option.value)}
                >
                  <View
                    style={[
                      styles.themeIconContainer,
                      {
                        backgroundColor:
                          (colors.primary || (isDark ? "#555555" : "#E0E0E0")) +
                          "15",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={option.icon}
                      size={24}
                      color={colors.primary || (isDark ? "#FFFFFF" : "#212121")}
                    />
                  </View>
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: isDark ? "#FFFFFF" : "#212121" },
                    ]}
                  >
                    {option.name}
                  </Text>
                  {themeMode === option.value && (
                    <MaterialIcons
                      name="check-circle"
                      size={22}
                      color={colors.primary || (isDark ? "#FFFFFF" : "#212121")}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    height: Platform.OS === "ios" ? 100 : 90,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionGradient: {
    borderRadius: 20,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dangerSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  dangerSectionGradient: {
    overflow: "hidden",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  dangerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  aboutContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 15,
    marginBottom: 16,
  },
  divider: {
    height: 2,
    width: "40%",
    marginBottom: 16,
    borderRadius: 1,
  },
  appDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  themePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  themeModalContainer: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
  },
  themeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  themeModalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  themeOptionsContainer: {
    marginTop: 10,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  footer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  versionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
