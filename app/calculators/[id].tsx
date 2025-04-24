import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

// Import calculator components
import CompoundingCalculator from "../../components/calculators/CompoundingCalculator";
import FibonacciCalculator from "../../components/calculators/FibonacciCalculator";
import PipDifferenceCalculator from "../../components/calculators/PipDifferenceCalculator";
import PipCalculator from "../../components/calculators/PipCalculator";
import PivotPointsCalculator from "../../components/calculators/PivotPointsCalculator";
import PositionSizeCalculator from "../../components/calculators/PositionSizeCalculator";
import ProfitLossCalculator from "../../components/calculators/ProfitLossCalculator";
import MarginCalculator from "../../components/calculators/RequiredMarginCalculator";
import StopLossTakeProfitCalculator from "../../components/calculators/StopLossTakeProfitCalculator";

export default function CalculatorScreen() {
  const { id } = useLocalSearchParams();
  const calculatorId = Array.isArray(id) ? id[0] : id;
  const { isDark } = useTheme();

  // Render the appropriate calculator based on the ID
  const renderCalculator = () => {
    switch (calculatorId) {
      case "compounding":
        return <CompoundingCalculator />;
      case "fibonacci":
        return <FibonacciCalculator />;
      case "pip-difference":
        return <PipDifferenceCalculator />;
      case "pip-value":
        return <PipCalculator />;
      case "pivot-points":
        return <PivotPointsCalculator />;
      case "position-size":
        return <PositionSizeCalculator />;
      case "profit-loss":
        return <ProfitLossCalculator />;
      case "margin":
        return <MarginCalculator />;
      case "stop-loss":
        return <StopLossTakeProfitCalculator />;
      default:
        return <View style={styles.notFound}></View>;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#121212" : "#f6f6f6" },
        ]}
        edges={["bottom"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCalculator()}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
