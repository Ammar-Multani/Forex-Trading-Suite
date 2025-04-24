import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import BackButton from "./BackButton";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const PageHeader = ({
  title,
  subtitle,
  showBackButton = true,
}: PageHeaderProps) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.pageHeader}>
      <View style={styles.headerRow}>
        {showBackButton && <BackButton />}
        <Text
          style={[styles.pageTitle, { color: isDark ? "#ffffff" : "#000000" }]}
        >
          {title}
        </Text>
      </View>
      {subtitle && (
        <Text
          style={[
            styles.pageSubtitle,
            {
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    right: 27,
    
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    left: 15,
  },
});

export default PageHeader;
