import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import PivotPointsCalculator from "../../components/calculators/PivotPointsCalculator";
import PageHeader from "@/components/ui/PageHeader";

const pivotPointsInfoContent = `
The Pivot Points Calculator generates key support and resistance levels based on previous price data.

Key Features:
• Multiple calculation methods (Standard, Fibonacci, Camarilla, Woodie, DeMark)
• Support for different timeframes (Daily, Weekly, Monthly)
• Real-time visualization of support and resistance levels
• Customizable price inputs (High, Low, Close)

How It Works:
Pivot points use the previous period's high, low, and close prices to calculate potential turning points in the market. The central pivot point (PP) serves as a baseline, with various support (S) and resistance (R) levels extending from it.

Standard Formula:
PP = (High + Low + Close) / 3
R1 = (2 × PP) - Low
R2 = PP + (High - Low)
R3 = High + 2 × (PP - Low)
S1 = (2 × PP) - High
S2 = PP - (High - Low)
S3 = Low - 2 × (High - PP)

Trading Applications:
• Identify potential reversal zones
• Set strategic entry and exit points
• Place stop-loss and take-profit orders
• Recognize range-bound conditions when price oscillates between levels
• Confirm breakouts when price moves decisively through a pivot level

Tips:
• Higher timeframe pivot points (weekly, monthly) are typically stronger
• When multiple calculation methods show similar levels, these are stronger zones
• Pivot points work best in ranging markets but can also signal breakout levels
• Consider combining with other indicators for confirmation
• The closer price is to a pivot level, the higher the probability of interaction
`;

export default function PivotPointsCalculatorScreen() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Pivot Points"
        subtitle="Calculate support and resistance levels for trading"
        infoContent={pivotPointsInfoContent}
      />
      <PivotPointsCalculator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
