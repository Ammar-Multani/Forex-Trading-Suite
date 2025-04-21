import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

interface CalculatorCardProps {
  title: string;
  children: React.ReactNode;
}

export default function CalculatorCard({
  title,
  children,
}: CalculatorCardProps) {
  const { isDark } = useTheme();

  return (
    <Surface
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? "rgba(30, 30, 30, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
        },
      ]}
    >
      <View
        style={[
          styles.titleContainer,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
            borderBottomColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
          },
        ]}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleIconContainer}>
            <Ionicons
              name="calculator-outline"
              size={24}
              color={isDark ? "#9370DB" : "#6200EE"}
            />
          </View>
          <Text
            variant="titleLarge"
            style={{
              fontWeight: "700",
              letterSpacing: 0.5,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            {title}
          </Text>
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  titleContainer: {
    padding: 20,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(147, 112, 219, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    padding: 0,
  },
});
