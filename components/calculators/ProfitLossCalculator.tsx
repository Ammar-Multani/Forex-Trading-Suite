import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Divider, RadioButton, Text } from "react-native-paper";
import {
  calculateProfitLoss,
  formatCurrency,
  calculatePipDifference,
  calculatePipValue,
} from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import PageHeader from "../ui/PageHeader";
import { useTheme } from "../../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";

// Storage keys for persisting calculator values
const STORAGE_KEYS = {
  ACCOUNT_CURRENCY: "profit_calculator_account_currency",
  CURRENCY_PAIR: "profit_calculator_currency_pair",
  ENTRY_PRICE: "profit_calculator_entry_price",
  EXIT_PRICE: "profit_calculator_exit_price",
  POSITION_SIZE: "profit_calculator_position_size",
  POSITION_TYPE: "profit_calculator_position_type",
};

export default function ProfitLossCalculator() {
  // Add a ref to track if this is the first mount
  const isInitialMount = useRef(true);
  const { accountCurrency: contextCurrency } = useExchangeRates();

  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState(contextCurrency.code);
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [positionType, setPositionType] = useState("long");
  const { isDark } = useTheme();

  // State for results
  const [pips, setPips] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [roi, setRoi] = useState(0);

  // Save calculator values to AsyncStorage
  const saveCalculatorValues = useCallback(async () => {
    try {
      const valuesToSave = {
        [STORAGE_KEYS.ACCOUNT_CURRENCY]: accountCurrency,
        [STORAGE_KEYS.CURRENCY_PAIR]: currencyPair,
        [STORAGE_KEYS.ENTRY_PRICE]: entryPrice,
        [STORAGE_KEYS.EXIT_PRICE]: exitPrice,
        [STORAGE_KEYS.POSITION_SIZE]: positionSize,
        [STORAGE_KEYS.POSITION_TYPE]: positionType,
      };

      // Save each value to AsyncStorage
      await Promise.all(
        Object.entries(valuesToSave).map(([key, value]) =>
          AsyncStorage.setItem(key, value.toString())
        )
      );

      console.log("Profit/Loss calculator values saved successfully");
    } catch (error) {
      console.error("Error saving profit/loss calculator values:", error);
    }
  }, [
    accountCurrency,
    currencyPair,
    entryPrice,
    exitPrice,
    positionSize,
    positionType,
  ]);

  // Load calculator values from AsyncStorage
  const loadCalculatorValues = useCallback(async () => {
    try {
      // Load all values from AsyncStorage
      const [
        savedAccountCurrency,
        savedCurrencyPair,
        savedEntryPrice,
        savedExitPrice,
        savedPositionSize,
        savedPositionType,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_CURRENCY),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY_PAIR),
        AsyncStorage.getItem(STORAGE_KEYS.ENTRY_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.EXIT_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.POSITION_SIZE),
        AsyncStorage.getItem(STORAGE_KEYS.POSITION_TYPE),
      ]);

      // Update state with saved values if they exist
      if (savedAccountCurrency) setAccountCurrency(savedAccountCurrency);
      else setAccountCurrency(contextCurrency.code);

      if (savedCurrencyPair) setCurrencyPair(savedCurrencyPair);
      if (savedEntryPrice) setEntryPrice(savedEntryPrice);
      if (savedExitPrice) setExitPrice(savedExitPrice);
      if (savedPositionSize) setPositionSize(savedPositionSize);
      if (savedPositionType) setPositionType(savedPositionType);

      console.log("Profit/Loss calculator values loaded successfully");
    } catch (error) {
      console.error("Error loading profit/loss calculator values:", error);
    }
  }, [contextCurrency]);

  // Load values on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadCalculatorValues();
    }
  }, [loadCalculatorValues]);

  // When context currency changes, update state if we don't have a saved value
  useEffect(() => {
    if (!isInitialMount.current) {
      const checkSavedCurrency = async () => {
        const savedCurrency = await AsyncStorage.getItem(
          STORAGE_KEYS.ACCOUNT_CURRENCY
        );
        if (!savedCurrency) {
          setAccountCurrency(contextCurrency.code);
        }
      };
      checkSavedCurrency();
    }
  }, [contextCurrency]);

  // Save values whenever they change (except on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      saveCalculatorValues();
    }
  }, [
    accountCurrency,
    currencyPair,
    entryPrice,
    exitPrice,
    positionSize,
    positionType,
    saveCalculatorValues,
  ]);

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
      // Add debugging information
      console.log("===== Calculation Inputs =====");
      console.log(`Entry Price: ${entry}`);
      console.log(`Exit Price: ${exit}`);
      console.log(`Position Size: ${size} lots`);
      console.log(`Position Type: ${isLong ? "Long" : "Short"}`);
      console.log(`Currency Pair: ${currencyPair}`);
      console.log(`Account Currency: ${accountCurrency}`);

      // Get intermediate values for debugging
      const pipDiff = calculatePipDifference(entry, exit, currencyPair);
      const pipValue = calculatePipValue(currencyPair, accountCurrency, size);
      const direction = isLong
        ? exit > entry
          ? 1
          : -1
        : exit < entry
        ? 1
        : -1;
      const rawProfit = direction * pipDiff * pipValue;
      const investment = size * 100000 * entry;
      const rawRoi = (rawProfit / investment) * 100;

      console.log("===== Intermediate Values =====");
      console.log(`Pip Difference: ${pipDiff}`);
      console.log(`Pip Value: ${pipValue}`);
      console.log(`Direction: ${direction}`);
      console.log(`Raw Profit: ${rawProfit}`);
      console.log(`Investment: ${investment}`);
      console.log(`Raw ROI: ${rawRoi}%`);

      // Original calculation
      const result = calculateProfitLoss(
        entry,
        exit,
        size,
        currencyPair,
        accountCurrency,
        isLong
      );

      console.log("===== Final Results =====");
      console.log(`Pips: ${result.pips}`);
      console.log(`Profit/Loss: ${result.profitLoss}`);
      console.log(`ROI: ${result.roi}%`);

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
                  Short
                </Text>
              </View>
            </View>
          </RadioButton.Group>

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
        </View>

        <Divider
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#2A2A2A" : "#aaa" },
          ]}
        />

        <View style={styles.resultsContainer}>
          <ResultDisplay
            label="Net profit"
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
