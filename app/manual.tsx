import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from "react-native";
import { Text, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";

export default function ManualScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

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
        translucent
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
              USER MANUAL
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
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: isDark ? "#1E1E1E" : "white",
              borderColor: isDark
                ? "rgba(80, 80, 80, 0.5)"
                : "rgba(220, 220, 220, 0.8)",
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
            style={styles.contentGradient}
          >
            <Text
              style={[styles.title, { color: isDark ? "#FFFFFF" : "#333333" }]}
            >
              Forex Trading Suite Manual
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Navigation
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • Home Screen: The main dashboard displays all available calculators. Tap any card to access that specific calculator.
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • Settings: Access app settings by tapping the gear icon in the top-right corner of the home screen. Here you can change theme preferences and access legal information.
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • Back Navigation: Use the back arrow in the top-left corner to return to the previous screen.
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Theme Settings
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              The app supports Light, Dark, and System Default themes. To change your theme:
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              1. Go to Settings > Appearance
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              2. Select your preferred theme option
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              3. The app will immediately apply your selected theme
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Compounding Calculator
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              Calculate how your investment will grow over time with compound interest:
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              1. Enter your starting balance (initial investment)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              2. Set your expected rate of return (annual percentage)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              3. Choose the compounding frequency (daily, weekly, monthly, quarterly, or annually)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              4. Enter the investment duration in years
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              5. The calculator will display your final balance, total interest earned, and a growth chart
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Fibonacci Calculator
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              Determine key Fibonacci retracement and extension levels:
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              1. Select the trend direction (uptrend or downtrend)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              2. Enter the high price and low price points
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              3. The calculator will generate common Fibonacci retracement levels (23.6%, 38.2%, 50%, 61.8%, 78.6%) and extension levels (127.2%, 161.8%, 261.8%)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              4. Use these levels to identify potential support and resistance areas
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Pip Difference Calculator
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              Calculate the exact number of pips between two price points:
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              1. Select your currency pair from the dropdown
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              2. Enter the entry price and exit price
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              3. The calculator automatically determines the pip value based on the currency pair (standard 4 or 2 decimal places, or 5/3 for JPY pairs)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              4. View the calculated pip difference and percentage change
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Pip Value Calculator
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              Determine the monetary value of a pip for your specific position size:
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              1. Select your account currency
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              2. Choose the currency pair you're trading
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              3. Enter your position size (in lots or units)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              4. The calculator will display the value of one pip in your account currency
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              5. This helps you understand your exact risk exposure per pip movement
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Pivot Points Calculator
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              Calculate key support and resistance levels using different pivot point methods:
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              1. Enter the previous period's high, low, and close prices
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              2. Select the calculation method (Standard, Woodie's, Camarilla, or DeMark)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              3. The calculator generates the pivot point (PP) and corresponding support (S1, S2, S3) and resistance (R1, R2, R3) levels
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              4. Use these levels to identify potential turning points in the market
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              Position Size Calculator
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              Determine the optimal position size based on your risk management rules:
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              1. Enter your account balance and currency
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              2. Set your risk percentage (how much of your balance you're willing to risk on this trade)
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              3. Select the currency pair and enter your stop loss in pips
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              4. The calculator will determine the appropriate position size in lots/units that aligns with your risk parameters
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              5. It also displays the monetary risk amount and required margin (if leverage is specified)
            </Text>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              General Tips
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • Use the calculator's reset button to quickly clear all input fields
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • Recent calculations are saved automatically for easy reference
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • All calculations are performed locally on your device and are not transmitted externally
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • For support or to report bugs, use the "Report a bug" option in the Settings menu
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              • Remember that all calculator results are for informational purposes only and should not be considered as financial advice
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 16,
    height: 90,
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
    paddingTop: 18,
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
    padding: 16,
    paddingBottom: 30,
  },
  contentContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  contentGradient: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  divider: {
    marginVertical: 15,
  },
});
