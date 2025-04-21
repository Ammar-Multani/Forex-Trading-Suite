import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

interface ResultDisplayProps {
  label: string;
  value: string | number;
  color?: string;
  isLarge?: boolean;
  onCopy?: () => void;
}

export default function ResultDisplay({
  label,
  value,
  color,
  isLarge = false,
  onCopy,
}: ResultDisplayProps) {
  const { isDark } = useTheme();

  // Default color based on theme if not provided
  const textColor = color || (isDark ? "#fff" : "#000");

  return (
    <View style={styles.container}>
      <Text
        variant="bodyMedium"
        style={[
          styles.label,
          {
            color: isDark
              ? "rgba(100, 100, 100, 0.9)"
              : "rgba(80, 80, 80, 0.9)",
          },
        ]}
      >
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text
          variant={isLarge ? "titleLarge" : "titleMedium"}
          style={[
            styles.value,
            { color: textColor },
            isLarge && styles.largeValue,
          ]}
        >
          {value}
        </Text>

        {onCopy && (
          <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
            <Ionicons
              name="copy-outline"
              size={16}
              color={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: "500",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    flex: 1,
    fontWeight: "600",
    fontSize: 18,
  },
  largeValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  copyButton: {
    padding: 4,
  },
});
