import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import CompoundingCalculator from "../../components/calculators/CompoundingCalculator";
import PageHeader from "@/components/ui/PageHeader";

export default function CompoundingCalculatorScreen() {
  const { isDark } = useTheme();
  // Add the compounding calculator explanation text
  const compoundingInfoContent = `
The Compounding Calculator helps forex traders visualize the growth potential of their trading accounts over time based on consistent returns.

Key Features:
• Calculate future account value based on initial balance and trading performance
• Set monthly deposits or withdrawals to simulate realistic account management
• Adjust compounding frequency to match your trading style (daily, weekly, monthly)
• Apply taxes and fees to create accurate projections
• View detailed breakdown with month-by-month or year-by-year growth analysis

How It Works:
Compound growth in forex trading occurs when profits are reinvested into subsequent trades, allowing traders to increase position sizes over time as the account grows.

The calculator uses the formula: A = P(1 + r/n)^(nt) + PMT[(1 + r/n)^(nt) - 1]/(r/n), where:
- A = Final account balance
- P = Initial account balance
- r = Expected monthly/annual return rate (as a decimal)
- n = Compounding frequency (trades per period)
- t = Time period in years
- PMT = Regular contributions or withdrawals

Trading Applications:
• Account Growth Projection: Set realistic goals based on your trading performance
• Withdrawal Planning: Determine sustainable withdrawal rates while maintaining growth
• Position Sizing Strategy: Visualize the impact of gradually increasing position sizes
• Recovery Analysis: Calculate time needed to recover from drawdowns
• Comparison Tool: Compare different trading strategies based on expected returns

Tips for Forex Traders:
• Be conservative with expected return rates (8-15% annually is considered good)
• Account for drawdown periods in your projections
• Reinvest at least part of your profits to benefit from compounding
• Consider scaling position sizes gradually as your account grows
• Remember that past performance doesn't guarantee future results
• The power of compounding becomes more significant over longer time horizons
`;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader
        title="Compounding"
        subtitle="Visualize compound growth"
        infoContent={compoundingInfoContent}
      />
      <CompoundingCalculator />
    </>
  );
}
