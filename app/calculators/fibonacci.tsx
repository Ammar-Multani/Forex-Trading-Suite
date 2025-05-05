import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import FibonacciCalculator from "../../components/calculators/FibonacciCalculator";
import PageHeader from "@/components/ui/PageHeader";

export default function FibonacciCalculatorScreen() {
  const { isDark } = useTheme();

  const fibonacciInfoContent = `
The Fibonacci Calculator generates retracement and extension levels based on significant price moves, helping traders identify potential support, resistance, and target areas.

Key Features:
• Calculate both Fibonacci retracement and extension levels
• Visualize key levels (23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%, 161.8%, 261.8%)
• Support for both uptrend and downtrend calculations
• Easy input of high and low price points
• Clear display of all key price levels

How It Works:
Fibonacci levels are derived from the Fibonacci sequence, where each number is the sum of the two preceding ones (0, 1, 1, 2, 3, 5, 8, 13, 21...). The key ratios used in trading come from mathematical relationships within this sequence:
- 23.6% (often rounded from 23.6067%)
- 38.2% (ratio of a number to the number two places higher)
- 50% (not a Fibonacci ratio but widely used)
- 61.8% (Golden Ratio, inverse of 38.2%)
- 78.6% (square root of 61.8%)
- 161.8% (extension of 61.8%)
- 261.8% (extension of 161.8%)

Trading Applications:
• Retracements: Find potential reversal points after a strong move
• Extensions: Project potential profit targets beyond the initial move
• Confluence: Identify stronger levels where multiple technical factors align
• Structure: Map market structure using key swing points

For Uptrend Analysis:
1. Select a significant low point and high point
2. Retracement levels measure potential pullback zones
3. Extension levels project potential upside targets

For Downtrend Analysis:
1. Select a significant high point and low point 
2. Retracement levels measure potential bounce zones
3. Extension levels project potential downside targets

Tips:
• The 61.8% (Golden Ratio) is often the most significant retracement level
• Use multiple timeframes for better confirmation
• Combine with trend lines, support/resistance, and candlestick patterns
• Allow for some price flexibility around the exact levels
• Fibonacci works best in trending markets with clear swing highs and lows
`;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Fibonacci"
        subtitle="Visualize Fibonacci sequence"
        infoContent={fibonacciInfoContent}
      />
      <FibonacciCalculator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
