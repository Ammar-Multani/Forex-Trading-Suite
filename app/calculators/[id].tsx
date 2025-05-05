import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

export default function CalculatorRedirect() {
  const { id } = useLocalSearchParams();
  const calculatorId = Array.isArray(id) ? id[0] : id;
  const { isDark } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the appropriate screen
    if (calculatorId) {
      router.replace(`/calculators/${calculatorId}`);
    }
  }, [calculatorId, router]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f6f6f6" },
      ]}
    >
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
