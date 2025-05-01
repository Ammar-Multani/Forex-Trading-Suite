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

export default function DisclaimerScreen() {
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
              DISCLAIMER
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
              Risk Warning
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              The Forex Calculator Suite is designed to provide tools for forex
              trading calculations. However, please note the following:
            </Text>

            <View style={styles.bulletContainer}>
              <Text
                style={[
                  styles.bulletPoint,
                  { color: isDark ? "#DDDDDD" : "#555555" },
                ]}
              >
                • The calculations provided are estimates only.
              </Text>
              <Text
                style={[
                  styles.bulletPoint,
                  { color: isDark ? "#DDDDDD" : "#555555" },
                ]}
              >
                • This application does not provide financial advice.
              </Text>
              <Text
                style={[
                  styles.bulletPoint,
                  { color: isDark ? "#DDDDDD" : "#555555" },
                ]}
              >
                • Trading forex involves substantial risk of loss.
              </Text>
              <Text
                style={[
                  styles.bulletPoint,
                  { color: isDark ? "#DDDDDD" : "#555555" },
                ]}
              >
                • Past performance is not indicative of future results.
              </Text>
              <Text
                style={[
                  styles.bulletPoint,
                  { color: isDark ? "#DDDDDD" : "#555555" },
                ]}
              >
                • You should consult with a licensed financial advisor before
                making any trading decisions.
              </Text>
            </View>

            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              By using this application, you acknowledge that you understand
              these risks and that you are solely responsible for your trading
              decisions.
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#333333" },
              ]}
            >
              No Liability
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#DDDDDD" : "#555555" },
              ]}
            >
              The creators and developers of this application shall not be held
              liable for any losses, damages, or other liabilities that may
              arise directly or indirectly from the use of this application or
              its calculations.
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
  bulletContainer: {
    marginVertical: 10,
    paddingLeft: 5,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
});
