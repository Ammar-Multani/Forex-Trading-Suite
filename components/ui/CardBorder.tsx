import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface CardBorderProps {
  children: ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  borderRadius?: number;
}

const CardBorder = ({
  children,
  style,
  borderWidth = 1,
  borderRadius = 16,
}: CardBorderProps) => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderWidth,
          borderRadius,
          borderColor: isDark
            ? "rgba(80, 80, 90, 0.5)"
            : "rgba(220, 220, 230, 0.8)",
          backgroundColor: isDark
            ? "rgba(30, 30, 35, 0.95)"
            : "rgba(250, 250, 255, 0.95)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    marginBottom: 16,
  },
});

export default CardBorder;
