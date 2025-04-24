import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text, IconButton } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface CalculatorCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconPack?: "Ionicons" | "MaterialCommunity";
  onRefresh?: () => void;
  children: React.ReactNode;
  elevation?: number;
  style?: object;
  headerStyle?: object;
  contentStyle?: object;
}

export default function CalculatorCard({
  title,
  subtitle,
  icon = "calculator-outline",
  iconPack = "Ionicons",
  onRefresh,
  children,
  elevation = 0,
  style,
  headerStyle,
  contentStyle,
}: CalculatorCardProps) {
  const { isDark } = useTheme();

  // Define theme colors - these match the CompoundingCalculator
  const colors = {
    background: isDark ? "rgba(30, 30, 30, 0.85)" : "rgba(255, 255, 255, 0.95)",
    headerBackground: isDark
      ? "rgba(26, 26, 26, 0.9)"
      : "rgba(245, 245, 245, 0.9)",
    border: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    accent: isDark ? "#9370DB" : "#6200EE",
    accentLight: "rgba(147, 112, 219, 0.1)",
    textPrimary: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "#aaaaaa" : "#666666",
  };

  const renderIcon = () => {
    if (iconPack === "Ionicons") {
      return <Ionicons name={icon as any} size={24} color={colors.accent} />;
    } else {
      return (
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={colors.accent}
        />
      );
    }
  };

  return (
    <Surface
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
        },
        elevation > 0 ? { elevation } : null,
        style,
      ]}
    >
      <View
        style={[
          styles.titleContainer,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
          headerStyle,
        ]}
      >
        <View style={styles.titleRow}>
          <View
            style={[
              styles.titleIconContainer,
              { backgroundColor: colors.accentLight },
            ]}
          >
            {renderIcon()}
          </View>
          <View style={styles.titleTextContainer}>
            <Text
              variant={subtitle ? "titleMedium" : "titleMedium"}
              style={{
                fontWeight: "bold",
                color: colors.textPrimary,
                letterSpacing: 0.3,
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                variant="bodySmall"
                style={{
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {onRefresh && (
            <IconButton
              icon="refresh"
              size={22}
              onPress={onRefresh}
              iconColor={colors.textPrimary}
              style={styles.refreshButton}
            />
          )}
        </View>
      </View>
      <View style={[styles.content, contentStyle,         {
          backgroundColor: colors.background}]}>{children}</View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    marginHorizontal: 2
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  titleTextContainer: {
    flex: 1,
  },
  refreshButton: {
    margin: 0,
  },
  content: {
    padding: 20,
  },
});
