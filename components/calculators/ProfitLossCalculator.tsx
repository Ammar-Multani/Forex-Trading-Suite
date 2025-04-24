import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Divider, RadioButton, Text } from "react-native-paper";
import { calculateProfitLoss, formatCurrency } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import PageHeader from "../ui/PageHeader";
import { useTheme } from "../../contexts/ThemeContext";
export default function ProfitLossCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [entryPrice, setEntryPrice] = useState("1.2000");
  const [exitPrice, setExitPrice] = useState("1.2050");
  const [positionSize, setPositionSize] = useState("1");
  const [positionType, setPositionType] = useState("long");
  const { isDark } = useTheme();
  // State for results
  const [pips, setPips] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [roi, setRoi] = useState(0);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    accountCurrency,
    currencyPair,
    entryPrice,
    exitPrice,
    positionSize,
    positionType,
  ]);

  const calculateResults = () => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const size = parseFloat(positionSize) || 0;
    const isLong = positionType === "long";

    if (entry > 0 && exit > 0 && size > 0) {
      const result = calculateProfitLoss(
        entry,
        exit,
        size,
        currencyPair,
        accountCurrency,
        isLong
      );

      setPips(result.pips);
      setProfitLoss(result.profitLoss);
      setRoi(result.roi);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="Profit/Loss Calculator"
        subtitle="Calculate the profit/loss, pips, and return on investment for a trade"
      />
      <CalculatorCard title="Profit/Loss Calculator">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={setAccountCurrency}
          />

          <CurrencyPairSelector
            label="Currency Pair"
            selectedPair={currencyPair}
            onSelect={(pair) => setCurrencyPair(pair)}
          />

          <Text style={styles.radioLabel}>Position Type</Text>
          <RadioButton.Group
            onValueChange={(value) => setPositionType(value)}
            value={positionType}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioButton}>
                <RadioButton value="long" color="#6200ee" />
                <Text
                  style={[
                    styles.radioText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  Long
                </Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton value="short" color="#6200ee" />
                <Text
                  style={[
                    styles.radioText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  Long
                </Text>
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Entry Price"
            value={entryPrice}
            onChangeText={setEntryPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor={isDark ? "#444" : "#ddd"}
            activeOutlineColor="#6200ee"
            textColor={isDark ? "#fff" : "#000"}
            theme={{
              colors: {
                background: isDark ? "#2A2A2A" : "#f5f5f5",
                onSurfaceVariant: isDark ? "#aaa" : "#666",
              },
            }}
          />

          <TextInput
            label="Exit Price"
            value={exitPrice}
            onChangeText={setExitPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor={isDark ? "#444" : "#ddd"}
            activeOutlineColor="#6200ee"
            textColor={isDark ? "#fff" : "#000"}
            theme={{
              colors: {
                background: isDark ? "#2A2A2A" : "#f5f5f5",
                onSurfaceVariant: isDark ? "#aaa" : "#666",
              },
            }}
          />

          <TextInput
            label="Position Size (Lots)"
            value={positionSize}
            onChangeText={setPositionSize}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor={isDark ? "#444" : "#ddd"}
            activeOutlineColor="#6200ee"
            textColor={isDark ? "#fff" : "#000"}
            theme={{
              colors: {
                background: isDark ? "#2A2A2A" : "#f5f5f5",
                onSurfaceVariant: isDark ? "#aaa" : "#666",
              },
            }}
          />
        </View>

        <Divider
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#2A2A2A" : "#aaa" },
          ]}
        />

        <View style={styles.resultsContainer}>
          <ResultDisplay
            label="Profit/Loss"
            value={formatCurrency(profitLoss, accountCurrency)}
            color={profitLoss >= 0 ? "#4CAF50" : "#FF5252"}
            isLarge
          />

          <ResultDisplay
            label="Pips"
            value={`${pips.toFixed(1)} pips`}
            color={pips >= 0 ? "#4CAF50" : "#FF5252"}
          />

          <ResultDisplay
            label="Return on Investment"
            value={`${roi.toFixed(2)}%`}
            color={roi >= 0 ? "#4CAF50" : "#FF5252"}
          />
        </View>
      </CalculatorCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputsContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  radioText: {
    color: "#fff",
  },
  divider: {
    marginVertical: 11,
  },
  resultsContainer: {
    marginTop: 8,
  },
});
