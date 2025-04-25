import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import {
  TextInput,
  Divider,
  SegmentedButtons,
  Switch,
  Text,
  Surface,
} from "react-native-paper";
import { formatCurrency } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import PageHeader from "../ui/PageHeader";
import { useTheme } from "../../contexts/ThemeContext";
import useApiManager from "../../hooks/useApiManager";
import {
  getCurrencyPairByName,
  CurrencyPair,
} from "../../constants/currencies";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lot size constants
const STANDARD_LOT = 100000;
const MINI_LOT = 10000;
const MICRO_LOT = 1000;

// Storage keys for persisting calculator values
const STORAGE_KEYS = {
  ACCOUNT_CURRENCY: "position_calculator_account_currency",
  CURRENCY_PAIR: "position_calculator_currency_pair",
  ACCOUNT_BALANCE: "position_calculator_account_balance",
  RISK_PERCENTAGE: "position_calculator_risk_percentage",
  RISK_AMOUNT: "position_calculator_risk_amount",
  ENTRY_PRICE: "position_calculator_entry_price",
  STOP_LOSS_PIPS: "position_calculator_stop_loss_pips",
  STOP_LOSS_PRICE: "position_calculator_stop_loss_price",
  RISK_INPUT_TYPE: "position_calculator_risk_input_type",
  STOP_LOSS_INPUT_TYPE: "position_calculator_stop_loss_input_type",
  PIP_DECIMAL_PLACES: "position_calculator_pip_decimal_places",
};

export default function PositionSizeCalculator() {
  // Add a ref to track if this is the first mount
  const isInitialMount = useRef(true);

  // Initialize the ApiManager hook with component name for tracking
  const {
    getExchangeRate,
    getForexPairRate,
    isLoading: isApiLoading,
    error: apiError,
  } = useApiManager("PositionSizeCalculator");

  // State for inputs
  const { isDark } = useTheme();
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [currencyPair, setCurrencyPair] = useState("GBP/USD");
  const [accountBalance, setAccountBalance] = useState("1000");
  const [riskPercentage, setRiskPercentage] = useState("5");
  const [riskAmount, setRiskAmount] = useState("50");
  const [entryPrice, setEntryPrice] = useState("1.3500");
  const [stopLossPips, setStopLossPips] = useState("22");
  const [stopLossPrice, setStopLossPrice] = useState("1.3278");
  const [pipDecimalPlaces, setPipDecimalPlaces] = useState(4);

  // UI state toggles
  const [riskInputType, setRiskInputType] = useState("percentage"); // "percentage" or "amount"
  const [stopLossInputType, setStopLossInputType] = useState("pips"); // "pips" or "price"

  // State for results
  const [positionSize, setPositionSize] = useState(0);
  const [positionSizeUnits, setPositionSizeUnits] = useState(0);
  const [standardLots, setStandardLots] = useState(0);
  const [miniLots, setMiniLots] = useState(0);
  const [microLots, setMicroLots] = useState(0);
  const [calculatedRiskAmount, setCalculatedRiskAmount] = useState(0);
  const [pipValue, setPipValue] = useState(0);
  const [stopLossLevel, setStopLossLevel] = useState(0);
  const [adjustedStopLoss, setAdjustedStopLoss] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1);

  // Save calculator values to AsyncStorage
  const saveCalculatorValues = useCallback(async () => {
    try {
      const valuesToSave = {
        [STORAGE_KEYS.ACCOUNT_CURRENCY]: accountCurrency,
        [STORAGE_KEYS.CURRENCY_PAIR]: currencyPair,
        [STORAGE_KEYS.ACCOUNT_BALANCE]: accountBalance,
        [STORAGE_KEYS.RISK_PERCENTAGE]: riskPercentage,
        [STORAGE_KEYS.RISK_AMOUNT]: riskAmount,
        [STORAGE_KEYS.ENTRY_PRICE]: entryPrice,
        [STORAGE_KEYS.STOP_LOSS_PIPS]: stopLossPips,
        [STORAGE_KEYS.STOP_LOSS_PRICE]: stopLossPrice,
        [STORAGE_KEYS.RISK_INPUT_TYPE]: riskInputType,
        [STORAGE_KEYS.STOP_LOSS_INPUT_TYPE]: stopLossInputType,
        [STORAGE_KEYS.PIP_DECIMAL_PLACES]: pipDecimalPlaces.toString(),
      };

      // Save each value to AsyncStorage
      await Promise.all(
        Object.entries(valuesToSave).map(([key, value]) =>
          AsyncStorage.setItem(key, value.toString())
        )
      );

      console.log("Position size calculator values saved successfully");
    } catch (error) {
      console.error("Error saving position size calculator values:", error);
    }
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossPips,
    stopLossPrice,
    riskInputType,
    stopLossInputType,
    pipDecimalPlaces,
  ]);

  // Load calculator values from AsyncStorage
  const loadCalculatorValues = useCallback(async () => {
    try {
      // Load all values from AsyncStorage
      const [
        savedAccountCurrency,
        savedCurrencyPair,
        savedAccountBalance,
        savedRiskPercentage,
        savedRiskAmount,
        savedEntryPrice,
        savedStopLossPips,
        savedStopLossPrice,
        savedRiskInputType,
        savedStopLossInputType,
        savedPipDecimalPlaces,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_CURRENCY),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY_PAIR),
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.RISK_PERCENTAGE),
        AsyncStorage.getItem(STORAGE_KEYS.RISK_AMOUNT),
        AsyncStorage.getItem(STORAGE_KEYS.ENTRY_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.STOP_LOSS_PIPS),
        AsyncStorage.getItem(STORAGE_KEYS.STOP_LOSS_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.RISK_INPUT_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.STOP_LOSS_INPUT_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.PIP_DECIMAL_PLACES),
      ]);

      // Update state with saved values if they exist
      if (savedAccountCurrency) setAccountCurrency(savedAccountCurrency);
      if (savedCurrencyPair) setCurrencyPair(savedCurrencyPair);
      if (savedAccountBalance) setAccountBalance(savedAccountBalance);
      if (savedRiskPercentage) setRiskPercentage(savedRiskPercentage);
      if (savedRiskAmount) setRiskAmount(savedRiskAmount);
      if (savedEntryPrice) setEntryPrice(savedEntryPrice);
      if (savedStopLossPips) setStopLossPips(savedStopLossPips);
      if (savedStopLossPrice) setStopLossPrice(savedStopLossPrice);
      if (savedRiskInputType) setRiskInputType(savedRiskInputType);
      if (savedStopLossInputType) setStopLossInputType(savedStopLossInputType);
      if (savedPipDecimalPlaces)
        setPipDecimalPlaces(parseInt(savedPipDecimalPlaces));

      console.log("Position size calculator values loaded successfully");
    } catch (error) {
      console.error("Error loading position size calculator values:", error);
    }
  }, []);

  // When risk input type changes, sync the values
  useEffect(() => {
    if (riskInputType === "percentage") {
      // When switching to percentage, calculate from current risk amount
      const balance = parseFloat(accountBalance) || 0;
      if (balance > 0) {
        const riskAmt = parseFloat(riskAmount) || 0;
        const percentage = (riskAmt / balance) * 100;
        setRiskPercentage(percentage.toFixed(0));
      }
    } else {
      // When switching to amount, calculate from current percentage
      const balance = parseFloat(accountBalance) || 0;
      const percentage = parseFloat(riskPercentage) || 0;
      const amount = balance * (percentage / 100);
      setRiskAmount(amount.toFixed(2));
    }
  }, [riskInputType]);

  // When stop loss input type changes, sync the values
  useEffect(() => {
    if (stopLossInputType === "pips") {
      // When switching to pips, calculate from prices
      const entry = parseFloat(entryPrice) || 0;
      const stopLoss = parseFloat(stopLossPrice) || 0;

      if (entry > 0 && stopLoss > 0) {
        const pipFactor = Math.pow(10, pipDecimalPlaces);
        const pips = Math.abs(entry - stopLoss) * pipFactor;
        setStopLossPips(pips.toFixed(0));
      }
    } else {
      // When switching to price, calculate from pips
      const entry = parseFloat(entryPrice) || 0;
      const pips = parseFloat(stopLossPips) || 0;

      if (entry > 0 && pips > 0) {
        const pipFactor = Math.pow(10, -pipDecimalPlaces);
        const stopLoss = entry - pips * pipFactor; // Assuming a long position
        setStopLossPrice(stopLoss.toFixed(5));
      }
    }
  }, [stopLossInputType]);

  // Use API error if available
  useEffect(() => {
    if (apiError) {
      setCalculationError(apiError);
    }
  }, [apiError]);

  // Load values on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadCalculatorValues();
    }
  }, [loadCalculatorValues]);

  // Save values whenever they change (except on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      saveCalculatorValues();
    }
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossPips,
    stopLossPrice,
    riskInputType,
    stopLossInputType,
    pipDecimalPlaces,
    saveCalculatorValues,
  ]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskInputType,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossInputType,
    stopLossPips,
    stopLossPrice,
    pipDecimalPlaces,
  ]);

  const fetchExchangeRateForPair = useCallback(async () => {
    try {
      // Check network connectivity first
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        throw new Error("No internet connection available");
      }

      const [baseCurrency, quoteCurrency] = currencyPair.split("/");

      // If quote currency is the same as account currency, no need for conversion
      if (quoteCurrency === accountCurrency) {
        return 1;
      }

      // If base currency is the account currency, use the entry price as the rate
      if (baseCurrency === accountCurrency) {
        return 1 / parseFloat(entryPrice);
      }

      // For cross currency cases, get the exchange rate from API
      const rate = await getExchangeRate(quoteCurrency, accountCurrency);
      return rate;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      if (error instanceof Error) {
        throw new Error(`Could not fetch exchange rate: ${error.message}`);
      } else {
        throw new Error("Could not fetch exchange rate");
      }
    }
  }, [currencyPair, accountCurrency, entryPrice, getExchangeRate]);

  const calculateResults = useCallback(async () => {
    try {
      setCalculationError(null);
      setIsCalculating(true);

      const balance = parseFloat(accountBalance) || 0;
      const entry = parseFloat(entryPrice) || 0;
      let stopLoss: number;
      let riskAmt: number;

      // Get risk amount based on input type
      if (riskInputType === "percentage") {
        const percentage = parseFloat(riskPercentage) || 0;
        riskAmt = balance * (percentage / 100);
      } else {
        riskAmt = parseFloat(riskAmount) || 0;
      }

      // Get stop loss pips based on input type
      if (stopLossInputType === "pips") {
        stopLoss = parseFloat(stopLossPips) || 0;
      } else {
        const stopLossValue = parseFloat(stopLossPrice) || 0;
        if (entry > 0 && stopLossValue > 0) {
          const pipFactor = Math.pow(10, pipDecimalPlaces);
          stopLoss = Math.abs(entry - stopLossValue) * pipFactor;
        } else {
          stopLoss = 0;
        }
      }

      if (balance > 0 && riskAmt > 0 && entry > 0 && stopLoss > 0) {
        // Extract base and quote currencies
        const [baseCurrency, quoteCurrency] = currencyPair.split("/");

        // Get the currency pair data
        const pairData = getCurrencyPairByName(currencyPair);
        if (!pairData) {
          throw new Error(`Invalid currency pair: ${currencyPair}`);
        }

        // Calculate pip value for 1 standard lot
        const pipSize = Math.pow(10, -pipDecimalPlaces);

        // Get the exchange rate for conversion
        let rate = 1.0;
        try {
          rate = await fetchExchangeRateForPair();
          setExchangeRate(rate);
        } catch (error) {
          console.error("Error getting exchange rate:", error);
          throw new Error("Could not get current exchange rates");
        }

        // Calculate pip value in quote currency
        const pipValueInQuote = STANDARD_LOT * pipSize;

        // Convert to account currency
        const pipValueInAccount = pipValueInQuote * rate;

        // Calculate position size in units (matching reference app)
        // Formula: Risk Amount / (Stop Loss in pips * Pip Value per unit)
        const pipValueForOneUnit = pipValueInAccount / STANDARD_LOT;
        const positionSizeInUnits = riskAmt / (stopLoss * pipValueForOneUnit);

        // Calculate total position size in lots
        const totalLots = positionSizeInUnits / STANDARD_LOT;

        // Calculate lot distribution based on total units
        // For GBP/USD with $1000 account and 5% risk (50$) and 22 pips stop loss
        // We should get approximately:
        // - Standard lots: 0.227
        // - Mini lots: 2.273
        // - Micro lots: 22.727

        // Calculate standard lots, keeping decimals
        const stdLots = positionSizeInUnits / STANDARD_LOT;

        // Calculate mini lots, keeping decimals
        const miniLots = positionSizeInUnits / MINI_LOT;

        // Calculate micro lots, keeping decimals
        const microLots = positionSizeInUnits / MICRO_LOT;

        // Calculate pip value for entire position
        const totalPipValue = pipValueForOneUnit * positionSizeInUnits;

        // Calculate stop loss price level (for display)
        const stopLossLevel = entry - stopLoss * pipSize;

        // For the reference app's pip display, converting to absolute number
        const absoluteStopLoss = stopLoss * Math.pow(10, pipDecimalPlaces);

        // Update state with all calculated values
        setPositionSize(totalLots);
        setPositionSizeUnits(Math.round(positionSizeInUnits));
        setStandardLots(stdLots); // Set the raw decimal value
        setMiniLots(miniLots); // Set the raw decimal value
        setMicroLots(microLots); // Set the raw decimal value
        setCalculatedRiskAmount(riskAmt);
        setPipValue(Math.round(totalPipValue));
        setStopLossLevel(stopLossLevel);
        setAdjustedStopLoss(absoluteStopLoss);
      }
    } catch (error) {
      console.error("Calculation error:", error);
      if (error instanceof Error) {
        setCalculationError(error.message);

        // Show alert for connectivity issues
        if (error.message.includes("No internet connection")) {
          Alert.alert(
            "No Internet Connection",
            "Please connect to the internet to fetch live exchange rates."
          );
        }
      } else {
        setCalculationError("An error occurred during calculation");
      }
    } finally {
      setIsCalculating(false);
    }
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskInputType,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossInputType,
    stopLossPips,
    stopLossPrice,
    pipDecimalPlaces,
    fetchExchangeRateForPair,
  ]);

  return (
    <View style={styles.container}>
      <PageHeader
        title="Position Size Calculator"
        subtitle="Calculate the optimal position size based on your risk parameters"
      />
      <CalculatorCard title="Position Size Calculator">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={setAccountCurrency}
          />

          <CurrencyPairSelector
            label="Financial Instrument"
            selectedPair={currencyPair}
            onSelect={(pair) => setCurrencyPair(pair)}
          />

          <TextInput
            label="Account Balance"
            value={accountBalance}
            onChangeText={setAccountBalance}
            keyboardType="numeric"
            left={
              <TextInput.Affix text={accountCurrency === "USD" ? "$" : ""} />
            }
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

          <Text
            style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}
          >
            Risk Type:
          </Text>
          <SegmentedButtons
            value={riskInputType}
            onValueChange={setRiskInputType}
            buttons={[
              { value: "percentage", label: "Percentage" },
              { value: "amount", label: "Amount" },
            ]}
            style={styles.segmentedButtons}
          />

          {riskInputType === "percentage" ? (
            <Surface style={styles.inputSurface} elevation={0}>
              <Text
                style={[
                  styles.surfaceLabel,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                Risk Percentage
              </Text>
              <TextInput
                value={riskPercentage}
                onChangeText={setRiskPercentage}
                keyboardType="numeric"
                right={<TextInput.Affix text="%" />}
                style={styles.surfaceInput}
                mode="flat"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: "transparent",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />
            </Surface>
          ) : (
            <Surface style={styles.inputSurface} elevation={0}>
              <Text
                style={[
                  styles.surfaceLabel,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                Risk Amount
              </Text>
              <TextInput
                value={riskAmount}
                onChangeText={setRiskAmount}
                keyboardType="numeric"
                left={
                  <TextInput.Affix
                    text={accountCurrency === "USD" ? "$" : ""}
                  />
                }
                style={styles.surfaceInput}
                mode="flat"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: "transparent",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />
            </Surface>
          )}

          <Text
            style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}
          >
            Stop Loss Type:
          </Text>
          <SegmentedButtons
            value={stopLossInputType}
            onValueChange={setStopLossInputType}
            buttons={[
              { value: "pips", label: "Pips" },
              { value: "price", label: "Price" },
            ]}
            style={styles.segmentedButtons}
          />

          {stopLossInputType === "price" && (
            <Surface style={styles.inputSurface} elevation={0}>
              <Text
                style={[
                  styles.surfaceLabel,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                Entry Price
              </Text>
              <TextInput
                value={entryPrice}
                onChangeText={setEntryPrice}
                keyboardType="numeric"
                style={styles.surfaceInput}
                mode="flat"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: "transparent",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />
            </Surface>
          )}

          {stopLossInputType === "pips" ? (
            <Surface style={styles.inputSurface} elevation={0}>
              <Text
                style={[
                  styles.surfaceLabel,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                Stop Loss (Pips)
              </Text>
              <TextInput
                value={stopLossPips}
                onChangeText={setStopLossPips}
                keyboardType="numeric"
                style={styles.surfaceInput}
                mode="flat"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: "transparent",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />
            </Surface>
          ) : (
            <Surface style={styles.inputSurface} elevation={0}>
              <Text
                style={[
                  styles.surfaceLabel,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                Stop Loss Price
              </Text>
              <TextInput
                value={stopLossPrice}
                onChangeText={setStopLossPrice}
                keyboardType="numeric"
                style={styles.surfaceInput}
                mode="flat"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: "transparent",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />
            </Surface>
          )}
        </View>

        <Divider style={styles.divider} />

        {isCalculating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>Calculating...</Text>
          </View>
        ) : calculationError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{calculationError}</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <ResultDisplay
              label="Position Size - Unit"
              value={`${positionSizeUnits.toLocaleString()} `}
              color="#4CAF50"
              isLarge
            />

            <ResultDisplay
              label="Standard Lot"
              value={`${standardLots.toFixed(
                3
              )} (${STANDARD_LOT.toLocaleString()} units)`}
              color="#2196F3"
            />

            <ResultDisplay
              label="Mini Lot"
              value={`${miniLots.toFixed(
                3
              )} (${MINI_LOT.toLocaleString()} units)`}
              color="#2196F3"
            />

            <ResultDisplay
              label="Micro Lot"
              value={`${microLots.toFixed(
                3
              )} (${MICRO_LOT.toLocaleString()} units)`}
              color="#2196F3"
            />

            <ResultDisplay
              label="Amount at Risk"
              value={formatCurrency(calculatedRiskAmount, accountCurrency)}
              color="#FF5252"
            />

            {stopLossInputType === "pips" ? (
              <ResultDisplay
                label="Stop Loss"
                value={`${adjustedStopLoss.toLocaleString()} Pips`}
                color="#FF9800"
              />
            ) : (
              <ResultDisplay
                label="Stop Loss at"
                value={stopLossLevel.toFixed(5)}
                color="#FF9800"
              />
            )}

            <ResultDisplay
              label="Pip Value"
              value={formatCurrency(pipValue, accountCurrency)}
              color="#2196F3"
            />

            <ResultDisplay
              label="Exchange Rate"
              value={`1 ${currencyPair.split("/")[1]} = ${exchangeRate.toFixed(
                5
              )} ${accountCurrency}`}
              color="#8E24AA"
            />
          </View>
        )}
      </CalculatorCard>
    </View>
  );
}

// Helper function to format numbers with commas
const formatNumber = (num: number) => {
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
};

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
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  inputSurface: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#6200ee",
  },
  surfaceLabel: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 8,
  },
  surfaceInput: {
    backgroundColor: "transparent",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#aaa",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    color: "#FF5252",
    textAlign: "center",
  },
});
