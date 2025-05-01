import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_COMPLETE_KEY } from "./onboarding";

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
  const { isDark } = useTheme();
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

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f6f6f6" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            FX Calculator Suite
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
            Professional trading tools
          </Text>
        </View>
        <TouchableOpacity
          onPress={navigateToSettings}
          style={styles.settingsButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerContent: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 4,
    marginLeft: 16,
  },
  settingsButton: {
    padding: 4,
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
