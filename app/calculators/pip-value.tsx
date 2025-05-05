import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import PipCalculator from "../../components/calculators/PipCalculator";
import PageHeader from "@/components/ui/PageHeader";

export default function PipCalculatorScreen() {
  const { isDark } = useTheme();


  // Add the pip calculator explanation text
  const pipCalculatorInfoContent = `
  The Forex Pip Calculator helps you determine the value of pips in your trading account currency.

  Key Features:
  • Calculate pip value based on your account currency and trading pair
  • Support for standard, mini, micro, and nano lot sizes
  • Customizable position sizes
  • Support for different pip decimal places (4 or 5 decimals)
  • Instantly see results in both quote currency and account currency

  How It Works:
  The pip value is calculated using the formula:
  Pip Value = (Pip Size × Position Size) / Exchange Rate

  Where:
  - Pip Size is typically 0.0001 for most pairs or 0.01 for JPY pairs
  - Position Size is the number of units being traded
  - Exchange Rate is used to convert to your account currency when needed

  Tips:
  • Standard lot = 100,000 units
  • Mini lot = 10,000 units
  • Micro lot = 1,000 units
  • Nano lot = 100 units
  • JPY pairs have different pip values (2 decimal places)
  • The pip value increases with larger position sizes
  • Always calculate pip value before placing trades to understand potential risk
  `;


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Pip Value"
        subtitle="Calculate pip value"
        infoContent={pipCalculatorInfoContent}
      />
        <PipCalculator />
    </> 
  );
}
