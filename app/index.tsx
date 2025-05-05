import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_COMPLETE_KEY } from "./onboarding";
import { IconButton } from "react-native-paper";

// Currency constants
const ACCOUNT_CURRENCY_KEY = "forex-trading-suite-account-currency";

// Calculator cards data
const calculators = [
  {
    id: "compounding",
    name: "Compounding Calculator",
    icon: "trending-up",
    description: "Calculate compound growth over time",
    color: ["#4158D0", "#C850C0"],
  },
  {
    id: "fibonacci",
    name: "Fibonacci Calculator",
    icon: "git-network",
    description: "Calculate Fibonacci retracement levels",
    color: ["#0093E9", "#80D0C7"],
  },
  {
    id: "pip-difference",
    name: "Pip Difference Calculator",
    icon: "swap-horizontal",
    description: "Calculate pip difference between prices",
    color: ["#8EC5FC", "#E0C3FC"],
  },
  {
    id: "pip-value",
    name: "Pip Calculator",
    icon: "calculator",
    description: "Calculate pip value in account currency",
    color: ["#FF9A8B", "#FF6A88"],
  },
  {
    id: "pivot-points",
    name: "Pivot Points Calculator",
    icon: "analytics",
    description: "Calculate pivot points using various methods",
    color: ["#FEE140", "#4ECDC4"],
  },
  {
    id: "position-size",
    name: "Position Size Calculator",
    icon: "resize",
    description: "Calculate optimal position size based on risk",
    color: ["#21D4FD", "#B721FF"],
  },
  {
    id: "profit-loss",
    name: "Profit/Loss Calculator",
    icon: "stats-chart",
    description: "Calculate potential profit or loss",
    color: ["#FA8BFF", "#2BD2FF"],
  },
  {
    id: "margin",
    name: "Required Margin Calculator",
    icon: "wallet",
    description: "Calculate required margin for positions",
    color: ["#08AEEA", "#2AF598"],
  },
  {
    id: "stop-loss",
    name: "Stop Loss/Take Profit Calculator",
    icon: "options",
    description: "Calculate stop loss and take profit levels",
    color: ["#FEE140", "#FA709A"],
  },
];

export default function Home() {
  const router = useRouter();
  const { isDark, setThemeMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // Check if onboarding is completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem(
          ONBOARDING_COMPLETE_KEY
        );
        if (onboardingCompleted !== "true") {
          // Redirect to onboarding if not completed
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [router]);

  // Don't render the main content while checking onboarding status
  if (isLoading) {
    return null;
  }

  const navigateToCalculator = (id: string) => {
    router.push(`/calculators/${id}`);
  };

  const navigateToSettings = () => {
    router.push("/settings");
  };

  const navigateToExchangeRates = () => {
    router.push("/exchange-rates");
  };

  const handleThemeToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setThemeMode(newTheme);
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f6f6f6" },
      ]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        translucent={true}
        backgroundColor="transparent"
      />
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            borderBottomColor: isDark
              ? "rgba(75, 75, 75, 0.3)"
              : "rgba(244, 238, 255, 0.8)",
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
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={styles.logoImageContainer}>
                <Image
                  source={
                    isDark
                      ? require("@/assets/adaptive-icon-dark.png")
                      : require("@/assets/adaptive-icon-light.png")
                  }
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
              
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleThemeToggle}
              hitSlop={{ top: 10, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.iconButtonInner}>
                <MaterialIcons
                  name={isDark ? "light-mode" : "dark-mode"}
                  size={24}
                  color={isDark ? "#ffff" : "#242424"}
                />
              </View>
            </TouchableOpacity>

            <IconButton
              icon="cog"
              size={24}
              iconColor={isDark ? "#ffff" : "#242424"}
              style={styles.headerIcon}
              onPress={navigateToSettings}
            />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calculatorsGrid}>
          {calculators.map((calculator) => (
            <TouchableOpacity
              key={calculator.id}
              style={styles.calculatorCard}
              onPress={() => navigateToCalculator(calculator.id)}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.cardBlur}>
                <LinearGradient
                  colors={calculator.color as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={calculator.icon as any}
                      size={28}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.calculatorName}>{calculator.name}</Text>
                  <Text style={styles.calculatorDescription}>
                    {calculator.description}
                  </Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    height: 95,
    paddingBottom: 17,
    borderBottomWidth: 1,
    elevation: 3,
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
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: "column",
    paddingTop: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImageContainer: {
    width: 98,
    height: 58,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 212,
    height: 212,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    paddingTop: 16,
    left: 15,
  },
  headerIcon: {
    marginLeft: 8,
  },
  iconButton: {
    width: 30,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 0,
    paddingTop: 2,
  },
  iconButtonInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  calculatorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  calculatorCard: {
    width: "48%",
    height: 180,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  cardBlur: {
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 0.3,
    borderColor: "#ccc",
  },
  calculatorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  calculatorDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
