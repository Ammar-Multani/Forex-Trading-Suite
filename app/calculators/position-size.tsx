import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import PositionSizeCalculator from "../../components/calculators/PositionSizeCalculator";
import PageHeader from "@/components/ui/PageHeader";

export default function PositionSizeCalculatorScreen() {
  const { isDark } = useTheme();

  // Add the position size calculator explanation text
const positionSizeInfoContent = `
The Position Size Calculator helps traders determine the optimal position size based on their risk management parameters.

Key Features:
• Calculate position size based on account balance and risk tolerance
• Choose between percentage risk or fixed amount risk
• Support for different stop loss methods (pips or price)
• Real-time market rates for precise calculations
• Save and load your preferred settings

How It Works:
Position size is calculated using risk management principles:
1. Define your account balance
2. Set your risk tolerance (% of balance or fixed amount)
3. Determine your stop loss (in pips or price)
4. The calculator computes the optimal position size that limits your risk

Formula:
Position Size = Risk Amount / (Stop Loss × Pip Value)

Where:
- Risk Amount is your tolerable loss (% of balance or fixed amount)
- Stop Loss is the distance to your stop loss level (in pips or price)
- Pip Value is the monetary value of one pip for the selected pair

Tips:
• Professional traders typically risk 1-2% of their account per trade
• Always use a stop loss to manage risk effectively
• Larger position sizes increase both potential profit and risk
• Consider market volatility when setting your stop loss distance
`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Position Size"
        subtitle="Calculate the optimal position size based on your risk parameters"
        infoContent={positionSizeInfoContent}
      />
        <PositionSizeCalculator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
