import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import PipDifferenceCalculator from "../../components/calculators/PipDifferenceCalculator";
import PageHeader from "@/components/ui/PageHeader";

export default function PipDifferenceCalculatorScreen() {
  const { isDark } = useTheme();
  // Add the pip difference calculator explanation text
  const pipDifferenceInfoContent = `
The Pip Difference Calculator helps you measure the precise distance between two price points, a critical metric for analyzing forex market movements and managing trades.

Key Features:
• Calculate exact pip differences between any two price points
• Support for all major and exotic currency pairs
• Automatic decimal adjustment for JPY pairs (2 decimal places) vs standard pairs (4 decimal places)
• Handle 5-digit pricing (fractional pips)
• Convert pip differences to monetary values

How It Works:
A pip (percentage in point) is the smallest standard unit of price movement in forex trading.
• For most pairs: 1 pip = 0.0001 (4th decimal place)
• For JPY pairs: 1 pip = 0.01 (2nd decimal place)
• Some brokers use fractional pips (5th decimal place for most pairs)

Calculation Method:
For Standard Pairs (non-JPY):
Pip Difference = |Price 1 - Price 2| × 10,000

For JPY Pairs:
Pip Difference = |Price 1 - Price 2| × 100

Trading Applications:
• Measuring Volatility: Determine average daily range in pips
• Setting Stop Losses: Calculate appropriate stop distances based on market conditions
• Measuring Spreads: Evaluate the cost of trading (difference between bid/ask)
• Analyzing Movements: Compare historical price movements
• Calculating Slippage: Measure execution quality (difference between expected and actual execution price)
• Position Sizing: Use pip distance to determine optimal position size based on risk

Tips:
• Average daily pip ranges vary by pair (e.g., EUR/USD: 70-100, GBP/JPY: 100-150)
• Wider pip ranges indicate higher volatility and potentially higher risk/reward
• Lower timeframes show smaller pip movements than higher timeframes
• Economic news releases can cause abnormal pip movements
• Observe typical pip movements for your pairs to develop a feel for normal vs abnormal behavior
• Use pip differences to compare relative volatility between different pairs
  `;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Pip Difference"
        subtitle="Calculate pip difference"
        infoContent={pipDifferenceInfoContent}
      />
      <PipDifferenceCalculator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
