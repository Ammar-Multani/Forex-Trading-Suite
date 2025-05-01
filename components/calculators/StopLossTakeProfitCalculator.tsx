import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { TextInput, Divider, RadioButton, Text } from "react-native-paper";
import {
  calculateStopLossTakeProfit,
  formatCurrency,
  getPipDecimalPlaces,
  calculatePipValueInQuoteCurrency,
  calculatePipValueInAccountCurrency,
} from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import { useTheme } from "../../contexts/ThemeContext";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";
import PageHeader from "../ui/PageHeader";
import env from "../../config/env";
import {
  getCurrencyPairByName,
  CurrencyPair,
} from "../../constants/currencies";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import useApiManager from "../../hooks/useApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys for persisting calculator values
const STORAGE_KEYS = {
  ACCOUNT_CURRENCY: "sltp_account_currency",
  CURRENCY_PAIR: "sltp_currency_pair",
  ENTRY_PRICE: "sltp_entry_price",
  STOP_LOSS_PRICE: "sltp_stop_loss_price",
  TAKE_PROFIT_PRICE: "sltp_take_profit_price",
  POSITION_SIZE: "sltp_position_size",
  POSITION_TYPE: "sltp_position_type",
};

// Exchange rate data interface
interface ExchangeRateData {
  rate: number;
  timestamp: number;
  loading: boolean;
  error?: string;
  usingFallback?: boolean;
}

// Add an interface for the TraderMade API response type
interface TraderMadeResponse {
  quotes?: Array<{
    mid?: number;
    price?: number;
  }>;
  timestamp?: number;
}

export default function StopLossTakeProfitCalculator() {
  // Initialize the ApiManager hook with component name for tracking
  const {
    getExchangeRate,
    getForexPairRate,
    isLoading: isApiLoading,
    error: apiError,
  } = useApiManager("StopLossTakeProfitCalculator");

  // Add a ref to track if this is the first mount
  const isInitialMount = useRef(true);
  const apiCallInProgress = useRef(false);

  // State for inputs
  const { isDark } = useTheme();
  const { accountCurrency: contextCurrency } = useExchangeRates();
  const [accountCurrency, setAccountCurrency] = useState(contextCurrency.code);
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [entryPrice, setEntryPrice] = useState("0");
  const [stopLossPrice, setStopLossPrice] = useState("0");
  const [takeProfitPrice, setTakeProfitPrice] = useState("0");
  const [positionSize, setPositionSize] = useState("1");
  const [positionType, setPositionType] = useState("long");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // State for exchange rates
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isRefreshingEntryPrice, setIsRefreshingEntryPrice] = useState(false);

  // State for calculation errors
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Add a state to track if we're using fallback rates
  const [usingFallbackRates, setUsingFallbackRates] = useState(false);

  // State for results
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);
  const [stopLossPips, setStopLossPips] = useState(0);
  const [takeProfitPips, setTakeProfitPips] = useState(0);
  const [stopLossAmount, setStopLossAmount] = useState(0);
  const [takeProfitAmount, setTakeProfitAmount] = useState(0);
  const [pipValue, setPipValue] = useState(0);

  // Save calculator values to AsyncStorage
  const saveCalculatorValues = useCallback(async () => {
    try {
      const valuesToSave = {
        [STORAGE_KEYS.ACCOUNT_CURRENCY]: accountCurrency,
        [STORAGE_KEYS.CURRENCY_PAIR]: currencyPair,
        [STORAGE_KEYS.ENTRY_PRICE]: entryPrice,
        [STORAGE_KEYS.STOP_LOSS_PRICE]: stopLossPrice,
        [STORAGE_KEYS.TAKE_PROFIT_PRICE]: takeProfitPrice,
        [STORAGE_KEYS.POSITION_SIZE]: positionSize,
        [STORAGE_KEYS.POSITION_TYPE]: positionType,
      };

      // Save each value to AsyncStorage
      await Promise.all(
        Object.entries(valuesToSave).map(([key, value]) =>
          AsyncStorage.setItem(key, value.toString())
        )
      );

      console.log("Calculator values saved successfully");
    } catch (error) {
      console.error("Error saving calculator values:", error);
    }
  }, [
    accountCurrency,
    currencyPair,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
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
        savedStopLossPrice,
        savedTakeProfitPrice,
        savedPositionSize,
        savedPositionType,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_CURRENCY),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY_PAIR),
        AsyncStorage.getItem(STORAGE_KEYS.ENTRY_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.STOP_LOSS_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.TAKE_PROFIT_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.POSITION_SIZE),
        AsyncStorage.getItem(STORAGE_KEYS.POSITION_TYPE),
      ]);

      // Update state with saved values if they exist
      if (savedAccountCurrency) setAccountCurrency(savedAccountCurrency);
      if (savedCurrencyPair) setCurrencyPair(savedCurrencyPair);
      if (savedEntryPrice) setEntryPrice(savedEntryPrice);
      if (savedStopLossPrice) setStopLossPrice(savedStopLossPrice);
      if (savedTakeProfitPrice) setTakeProfitPrice(savedTakeProfitPrice);
      if (savedPositionSize) setPositionSize(savedPositionSize);
      if (savedPositionType) setPositionType(savedPositionType);

      console.log("Calculator values loaded successfully");
    } catch (error) {
      console.error("Error loading calculator values:", error);
    }
  }, []);

  // Calculate results function
  const calculateResults = useCallback(async () => {
    try {
      setCalculationError(null);

      const entry = parseFloat(entryPrice) || 0;
      const stopLoss = parseFloat(stopLossPrice) || 0;
      const takeProfit = parseFloat(takeProfitPrice) || 0;
      const size = parseFloat(positionSize) || 0;
      const isLong = positionType === "long";

      if (entry <= 0 || stopLoss <= 0 || takeProfit <= 0 || size <= 0) {
        return;
      }

      const pairData = getCurrencyPairByName(currencyPair);
      if (!pairData) {
        return;
      }

      // Calculate pip differences based on long/short position
      let stopLossDiff, takeProfitDiff;

      if (isLong) {
        stopLossDiff = entry - stopLoss;
        takeProfitDiff = takeProfit - entry;
      } else {
        stopLossDiff = stopLoss - entry;
        takeProfitDiff = entry - takeProfit;
      }

      // Get pip decimal places for this currency pair
      const pipDecimalPlaces = getPipDecimalPlaces(pairData.quote);

      // Calculate pips - use the correct pip factor based on the currency pair's definition
      const pipFactor = Math.pow(10, pipDecimalPlaces);

      // Use absolute values for pip calculations to allow any configuration
      const stopLossPipsValue = Math.abs(stopLossDiff) * pipFactor;
      const takeProfitPipsValue = Math.abs(takeProfitDiff) * pipFactor;

      // Calculate pip value in quote currency
      const lotSize = size * 100000; // Standard lot is 100,000 units
      const pipValueQuote = calculatePipValueInQuoteCurrency(
        pairData as CurrencyPair,
        lotSize,
        1, // for single pip
        pipDecimalPlaces
      );

      // Get exchange rate for converting pip value to account currency if needed
      let quoteToAccountRate = 1;
      if (pairData.quote !== accountCurrency) {
        try {
          // Use the hook's getExchangeRate which handles caching correctly
          quoteToAccountRate = await getExchangeRate(
            pairData.quote,
            accountCurrency
          );
        } catch (error) {
          console.error(`Error fetching exchange rate: ${error}`);
          setCalculationError("Could not fetch exchange rate for calculation");
          return;
        }
      }

      // Convert pip value to account currency
      const pipValueAccount = calculatePipValueInAccountCurrency(
        pipValueQuote,
        pairData.quote,
        accountCurrency,
        quoteToAccountRate
      );

      // Calculate monetary amounts using absolute values
      const stopLossAmountValue = stopLossPipsValue * pipValueAccount;
      const takeProfitAmountValue = takeProfitPipsValue * pipValueAccount;

      // Calculate risk/reward ratio - handle case where values are not in recommended positions
      let riskRewardRatioValue;

      // Show warning instead of error if SL/TP are in non-standard positions
      if (
        (isLong && (stopLossDiff <= 0 || takeProfitDiff <= 0)) ||
        (!isLong && (stopLossDiff <= 0 || takeProfitDiff <= 0))
      ) {
        // Display a warning instead of an error
        setCalculationError(
          isLong
            ? "For optimal Long position, Stop Loss should be below Entry Price and Take Profit above Entry Price"
            : "For optimal Short position, Stop Loss should be above Entry Price and Take Profit below Entry Price"
        );

        // Still calculate a ratio but use 0 for display
        riskRewardRatioValue = 0;
      } else {
        // Normal calculation when values are in expected positions
        riskRewardRatioValue = takeProfitAmountValue / stopLossAmountValue;
      }

      // Update state with calculated values
      setStopLossPips(stopLossPipsValue);
      setTakeProfitPips(takeProfitPipsValue);
      setStopLossAmount(stopLossAmountValue);
      setTakeProfitAmount(takeProfitAmountValue);
      setPipValue(pipValueAccount);
      setRiskRewardRatio(riskRewardRatioValue);
      setExchangeRate(quoteToAccountRate);
    } catch (error) {
      console.error("Calculation error:", error);
      if (error instanceof Error) {
        setCalculationError(error.message);
      } else {
        setCalculationError("An error occurred during calculation");
      }
    }
  }, [
    accountCurrency,
    currencyPair,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    positionSize,
    positionType,
    getExchangeRate,
  ]);

  // Simple function to fetch current exchange rate and ONLY update entry price
  const fetchCurrentRate = useCallback(async () => {
    // Prevent multiple API calls simultaneously
    if (apiCallInProgress.current) {
      return;
    }

    apiCallInProgress.current = true;
    setIsRefreshingEntryPrice(true);
    setCalculationError(null);

    try {
      // Check network connectivity first
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please connect to the internet to fetch live exchange rates."
        );
        setIsRefreshingEntryPrice(false);
        apiCallInProgress.current = false;
        return;
      }

      // Format the currency pair for API
      const pairData = getCurrencyPairByName(currencyPair);
      if (!pairData) {
        throw new Error(`Invalid currency pair: ${currencyPair}`);
      }

      // Use the pairString (e.g., "EURUSD") for the API call
      const pairString = currencyPair.replace("/", "");
      const rate = await getForexPairRate(pairString);

      // ONLY update the entry price field - no other fields
      setEntryPrice(rate.toFixed(5));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching current rate:", error);
      if (error instanceof Error) {
        setCalculationError(`Failed to fetch rate: ${error.message}`);
      } else {
        setCalculationError("Failed to fetch current exchange rate");
      }
    } finally {
      setIsRefreshingEntryPrice(false);
      apiCallInProgress.current = false;
    }
  }, [currencyPair, getForexPairRate]);

  // Handle currency pair change
  const handleCurrencyPairChange = useCallback((pair: string) => {
    setCurrencyPair(pair);
    // When currency pair changes, we'll fetch the rate to update entry price only
  }, []);

  // Handle account currency change
  const handleAccountCurrencyChange = useCallback((currency: string) => {
    setAccountCurrency(currency);
  }, []);

  // Handle text input changes with save functionality
  const handleEntryPriceChange = useCallback((text: string) => {
    setEntryPrice(text);
  }, []);

  const handleStopLossPriceChange = useCallback((text: string) => {
    setStopLossPrice(text);
  }, []);

  const handleTakeProfitPriceChange = useCallback((text: string) => {
    setTakeProfitPrice(text);
  }, []);

  const handlePositionSizeChange = useCallback((text: string) => {
    setPositionSize(text);
  }, []);

  const handlePositionTypeChange = useCallback((value: string) => {
    setPositionType(value);
  }, []);

  // Update when currency pair changes - fetch new rate to update entry price
  useEffect(() => {
    // Skip on initial render since we'll fetch in the mount effect
    if (isInitialMount.current) {
      return;
    }

    // Fetch rate when currency pair changes
    fetchCurrentRate();
  }, [currencyPair, fetchCurrentRate]);

  // Fetch on initial mount and load saved values
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // First load saved values
      loadCalculatorValues().then(() => {
        // Only fetch current rate if we don't have a saved entry price
        // or if the saved entry price is 0
        const entryPriceValue = parseFloat(entryPrice);
        if (entryPriceValue <= 0) {
          fetchCurrentRate();
        }
      });
    }
  }, [fetchCurrentRate, loadCalculatorValues, entryPrice]);

  // Save values whenever they change
  useEffect(() => {
    if (!isInitialMount.current) {
      saveCalculatorValues();
    }
  }, [
    accountCurrency,
    currencyPair,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    positionSize,
    positionType,
    saveCalculatorValues,
  ]);

  // Calculate results when inputs change
  useEffect(() => {
    if (
      !isInitialMount.current &&
      parseFloat(entryPrice) > 0 &&
      parseFloat(stopLossPrice) > 0 &&
      parseFloat(takeProfitPrice) > 0
    ) {
      // Only calculate if all required fields have values
      calculateResults();
    }
  }, [
    accountCurrency,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    positionSize,
    positionType,
    calculateResults,
  ]);

  // Use API error if available
  useEffect(() => {
    if (apiError) {
      setCalculationError(apiError);
    }
  }, [apiError]);

  // Combine loading states
  const isLoading = isRefreshingEntryPrice || isApiLoading;

  return (
    <View style={styles.container}>
      <PageHeader
        title="Stop Loss/Take Profit"
        subtitle="Calculate the risk/reward ratio, stop loss pips, take profit pips, stop loss amount, and take profit amount"
      />
      <CalculatorCard title="Stop Loss/Take Profit Calculator">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={handleAccountCurrencyChange}
          />

          <View
            style={[
              styles.currencyPairSection,
              isLoading && styles.loadingSection,
            ]}
          >
            <CurrencyPairSelector
              label="Currency Pair"
              selectedPair={currencyPair}
              onSelect={handleCurrencyPairChange}
            />

            <View style={styles.entryPriceContainer}>
              <TextInput
                label="Entry Price"
                value={entryPrice}
                onChangeText={handleEntryPriceChange}
                keyboardType="numeric"
                style={styles.entryPriceInput}
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
                right={
                  <TextInput.Icon
                    icon={() => (
                      <TouchableOpacity
                        onPress={() => {
                          if (!isLoading) {
                            fetchCurrentRate();
                          }
                        }}
                        disabled={isLoading}
                        style={{ padding: 5 }}
                      >
                        {isLoading ? (
                          <ActivityIndicator size={20} color="#6200ee" />
                        ) : (
                          <Ionicons name="refresh" size={20} color="#6200ee" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                }
              />
              {lastUpdated && (
                <Text style={styles.lastUpdatedText}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.radioLabel}>Position Type</Text>
          <RadioButton.Group
            onValueChange={handlePositionTypeChange}
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
            label="Stop Loss Price"
            value={stopLossPrice}
            onChangeText={handleStopLossPriceChange}
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
            label="Take Profit Price"
            value={takeProfitPrice}
            onChangeText={handleTakeProfitPriceChange}
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
            onChangeText={handlePositionSizeChange}
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

        <Divider style={styles.divider} />

        <View style={styles.resultsContainer}>
          {calculationError && !isLoading ? (
            <>
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{calculationError}</Text>
              </View>

              {/* Only show risk/reward ratio and pip value when there's an error/warning */}
              <ResultDisplay
                label="Risk/Reward Ratio"
                value={`1:${riskRewardRatio.toFixed(2)}`}
                color="#FFC107"
                isLarge
              />

              <ResultDisplay
                label="Pip Value"
                value={formatCurrency(pipValue, accountCurrency)}
                color="#2196F3"
              />

              {usingFallbackRates && (
                <Text style={styles.fallbackRateNote}>
                  * Using approximate exchange rates. Latest rates unavailable.
                </Text>
              )}
            </>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>Calculating...</Text>
            </View>
          ) : (
            <>
              <ResultDisplay
                label="Risk/Reward Ratio"
                value={`1:${riskRewardRatio.toFixed(2)}`}
                color="#FFC107"
                isLarge
              />

              <View style={styles.resultsRow}>
                <View style={styles.resultColumn}>
                  <ResultDisplay
                    label="Amount at risk"
                    value={formatCurrency(stopLossAmount, accountCurrency)}
                    color="#FF5252"
                  />
                  <ResultDisplay
                    label="Stop Loss"
                    value={`${stopLossPips.toFixed(1)} pips`}
                    color="#FF5252"
                  />
                </View>

                <View style={styles.resultColumn}>
                  <ResultDisplay
                    label="Take Profit Amount"
                    value={formatCurrency(takeProfitAmount, accountCurrency)}
                    color="#4CAF50"
                  />
                  <ResultDisplay
                    label="Take Profit"
                    value={`${takeProfitPips.toFixed(1)} pips`}
                    color="#4CAF50"
                  />
                </View>
              </View>

              <ResultDisplay
                label="Pip Value"
                value={formatCurrency(pipValue, accountCurrency)}
                color="#2196F3"
              />

              {usingFallbackRates && (
                <Text style={styles.fallbackRateNote}>
                  * Using approximate exchange rates. Latest rates unavailable.
                </Text>
              )}
            </>
          )}
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
  entryPriceContainer: {
    marginBottom: 16,
  },
  entryPriceInput: {
    flex: 1,
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  resultColumn: {
    flex: 1,
    marginHorizontal: 4,
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
  warningContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  warningText: {
    color: "#FFC107",
    textAlign: "center",
    fontSize: 13,
    fontStyle: "italic",
  },
  currencyPairSection: {
    marginBottom: 16,
  },
  loadingSection: {
    opacity: 0.7,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
    fontStyle: "italic",
  },
  fallbackRateNote: {
    fontSize: 12,
    color: "#FF9800",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
});
