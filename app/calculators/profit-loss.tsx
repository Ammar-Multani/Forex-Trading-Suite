import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import ProfitLossCalculator from "../../components/calculators/ProfitLossCalculator";
import PageHeader from "@/components/ui/PageHeader";

const profitLossInfoContent = `
The Profit/Loss Calculator helps you determine the potential or actual outcome of a forex trade based on entry price, exit price, and position size.

Key Features:
• Calculate P/L for both long and short positions
• Support for different lot sizes (standard, mini, micro, nano)
• Real-time conversion to your account currency
• Include swap/rollover fees in calculations
• View P/L as both monetary value and percentage of account

How It Works:
The calculator determines the difference between entry and exit prices, multiplied by the position size, to calculate the profit or loss of a trade.

For Long Positions (Buy):
P/L = (Exit Price - Entry Price) × Position Size × Contract Size

For Short Positions (Sell):
P/L = (Entry Price - Exit Price) × Position Size × Contract Size

Where:
- Position Size is the number of lots (standard: 100,000 units, mini: 10,000, micro: 1,000)
- Contract Size is the value of one pip in the quote currency
- The result is converted to your account currency if different

Additional Factors:
• Commission: Fixed or percentage-based fee charged by brokers
• Swap/Rollover: Interest charged/paid for positions held overnight
• Slippage: Difference between expected and executed price

Trading Applications:
• Pre-trade analysis to set appropriate profit targets
• Risk management by comparing potential profit to risk amount
• Performance tracking of completed trades
• Tax reporting and account performance evaluation

Tips:
• Always factor in spread costs when calculating potential profits
• For accurate P/L calculations, include all fees and commissions
• Use consistent position sizing relative to your account balance
• Track your win rate and average P/L to evaluate strategy effectiveness
• Regularly compare actual vs. expected P/L to improve execution
`;

export default function ProfitLossCalculatorScreen() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Profit Loss"
        subtitle="Calculate the profit or loss of a trade"
        infoContent={profitLossInfoContent}
      />
      <ProfitLossCalculator />
    </>
  );
}
