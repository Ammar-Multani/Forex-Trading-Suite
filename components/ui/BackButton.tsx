import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

interface BackButtonProps {
  onPress?: () => void;
  title?: string;
}

const BackButton = ({ onPress, title }: BackButtonProps) => {
  const router = useRouter();
  const { isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name="chevron-back"
        size={24}
        color={isDark ? "#FFFFFF" : "#000000"}
      />
      {title && (
        <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default BackButton;
