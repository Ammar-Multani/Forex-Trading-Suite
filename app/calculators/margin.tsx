import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import MarginCalculator from "../../components/calculators/RequiredMarginCalculator";
import PageHeader from "@/components/ui/PageHeader";

export default function MarginCalculatorScreen() {
  const { isDark } = useTheme();

  const marginInfoContent = `
The Margin Calculator helps you determine the amount of collateral required to open and maintain a forex position.

Key Features:
• Calculate required margin based on lot size and leverage
• Support for standard, mini, micro, and nano lot sizes
• Account for different currency pairs and their margin requirements
• Convert margin amounts to your account currency
• Real-time updates based on current exchange rates

How It Works:
Margin is essentially a good faith deposit required to maintain open positions. It is not a fee or transaction cost but a portion of your account equity set aside and allocated as a margin deposit.

Formula:
Required Margin = (Position Size × Exchange Rate) / Leverage

Where:
- Position Size is the trade size in base currency (e.g., 100,000 units for 1 standard lot)
- Exchange Rate is the current market rate for the pair (in account currency)
- Leverage is the ratio provided by your broker (e.g., 1:100)

Important Concepts:
• Initial Margin: The amount required to open a position
• Maintenance Margin: The minimum equity required to keep a position open
• Margin Call: When your account equity falls below the maintenance margin level
• Stop Out: When positions are automatically closed due to insufficient margin

Tips:
• Higher leverage reduces margin requirements but increases risk
• Always keep sufficient free margin as a buffer (at least 50% of your margin requirement)
• Monitor your margin level regularly, especially during volatile market conditions
• Reduce position size or increase account equity to improve margin levels
• Some brokers have different margin requirements for different pairs or during weekends
  `;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Margin"
        subtitle="Calculate required margin"
        infoContent={marginInfoContent}
      />
      <MarginCalculator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
