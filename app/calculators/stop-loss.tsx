import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import StopLossTakeProfitCalculator from "../../components/calculators/StopLossTakeProfitCalculator";
import { PageHeader } from "@/components";

const stopLossTakeProfitInfoContent = `
The Stop Loss/Take Profit Calculator helps you determine optimal exit points for your trades based on risk management principles and technical analysis.

Key Features:
• Calculate stop loss and take profit levels based on entry price
• Support for both price-based and pip-based calculations
• Risk-to-reward ratio visualization
• Currency conversion to your account currency
• Percentage risk calculator integrated

How It Works:
Stop Loss (SL) is a predetermined exit point to limit losses, while Take Profit (TP) is a predetermined exit point to secure profits. Both can be set as either:
• Fixed price levels
• Distance in pips from entry
• Percentage of account risk

Risk-to-Reward Calculation:
R:R Ratio = Potential Reward (Pips to TP) ÷ Potential Risk (Pips to SL)

Professional traders typically aim for:
• Minimum R:R of 1:1 (equal risk and reward)
• Optimal R:R of 1:2 or higher (reward at least twice the risk)

Stop Loss Placement Strategies:
• Support/Resistance: Place SL beyond key support (long) or resistance (short) levels
• Volatility-Based: Use ATR or standard deviation to set appropriate distance
• Swing High/Low: Place SL beyond recent swing points
• Moving Average: Use dynamic MAs as trailing stop loss references
• Percentage-Based: Risk a fixed percentage of account on each trade

Take Profit Placement Strategies:
• Key Resistance/Support: Target established levels on the chart
• Fibonacci Extensions: Use 1.618, 2.618, etc. as profit targets
• Previous Highs/Lows: Target prior swing points
• Round Numbers: Psychological levels often act as resistance/support
• Chart Patterns: Use measured moves from patterns

Tips:
• Never trade without a stop loss
• Consider widening stops during high volatility
• Avoid placing stops at obvious levels where many others might place theirs
• Use trailing stops to lock in profits on strongly trending moves
• Consider your win rate when determining appropriate R:R ratios
• Adjust SL/TP based on market conditions and volatility
`;

export default function StopLossTakeProfitCalculatorScreen() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Stop Loss Take Profit"
        subtitle="Calculate the stop loss and take profit of a trade"
        infoContent={stopLossTakeProfitInfoContent}
      />
      <StopLossTakeProfitCalculator />
    </>
  );
}
