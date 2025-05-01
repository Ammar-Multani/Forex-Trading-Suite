import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";

export default function TermsScreen() {
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
              TERMS OF SERVICE
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
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              1. Introduction
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              Welcome to the Forex Calculator Suite. By using our application,
              you agree to these Terms of Service. Please read them carefully.
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              2. Use of the Application
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              The Forex Calculator Suite provides tools for forex trading
              calculations. These tools are for informational purposes only and
              should not be considered as financial advice.
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              3. Disclaimer
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              The calculations provided by this application are estimates and
              should not be the sole basis for any trading decisions. Trading
              forex involves substantial risk and is not suitable for all
              investors.
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              4. Limitation of Liability
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              We shall not be liable for any losses, damages, or injuries
              arising from the use of this application or reliance on the
              information provided.
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              5. Changes to Terms
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              We reserve the right to modify these terms at any time. Your
              continued use of the app after such changes constitutes your
              acceptance of the new terms.
            </Text>

            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555", marginTop: 20 },
              ]}
            >
              Last updated: June 2024
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
  },
  contentContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  contentGradient: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
});
