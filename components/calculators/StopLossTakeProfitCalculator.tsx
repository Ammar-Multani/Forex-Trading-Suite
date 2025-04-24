import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
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
import PageHeader from "../ui/PageHeader";
import env from "../../config/env";
import { getCurrencyPairByName } from "../../constants/currencies";
import { Ionicons } from "@expo/vector-icons";
import { fetchForexPairRates } from "../../services/api";

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
  // Add a ref to track if this is the first mount
  const isInitialMount = useRef(true);

  // State for inputs
  const { isDark } = useTheme();
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [entryPrice, setEntryPrice] = useState("1.2000");
  const [stopLossPrice, setStopLossPrice] = useState("1.1950");
  const [takeProfitPrice, setTakeProfitPrice] = useState("1.2100");
  const [positionSize, setPositionSize] = useState("1");
  const [positionType, setPositionType] = useState("long");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // State for exchange rates
  const [exchangeRates, setExchangeRates] = useState<
    Record<string, ExchangeRateData>
  >({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
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

  // First, define updateStopLossTakeProfitPrices
  const updateStopLossTakeProfitPrices = useCallback(
    (entryPriceValue: number) => {
      const pairData = getCurrencyPairByName(currencyPair);
      if (!pairData) return;

      // Get pip decimal places for this currency pair
      const pipDecimalPlaces = getPipDecimalPlaces(pairData.quote);
      const pipSize = Math.pow(10, -pipDecimalPlaces);

      // Default pips for stop loss and take profit
      const defaultStopLossPips = 50; // 50 pips for stop loss
      const defaultTakeProfitPips = 100; // 100 pips for take profit

      let stopLossValue: number;
      let takeProfitValue: number;

      if (positionType === "long") {
        // For long positions: Entry - SL pips, Entry + TP pips
        stopLossValue = entryPriceValue - defaultStopLossPips * pipSize;
        takeProfitValue = entryPriceValue + defaultTakeProfitPips * pipSize;
      } else {
        // For short positions: Entry + SL pips, Entry - TP pips
        stopLossValue = entryPriceValue + defaultStopLossPips * pipSize;
        takeProfitValue = entryPriceValue - defaultTakeProfitPips * pipSize;
      }

      // Update state with formatted values
      setStopLossPrice(stopLossValue.toFixed(5));
      setTakeProfitPrice(takeProfitValue.toFixed(5));
    },
    [currencyPair, positionType]
  );

  // Then define fetchCurrentRate which depends on updateStopLossTakeProfitPrices
  const fetchCurrentRate = useCallback(async () => {
    try {
      setIsRefreshingEntryPrice(true);
      const pairNameForApi = currencyPair.replace("/", "");
      const rates = await fetchForexPairRates([pairNameForApi]);

      if (rates && rates[pairNameForApi]) {
        const currentRate = rates[pairNameForApi];
        setEntryPrice(currentRate.toFixed(5));
        setLastUpdated(new Date());

        // Update stop loss and take profit prices based on the new entry price
        updateStopLossTakeProfitPrices(currentRate);
      }
    } catch (error) {
      console.error("Error fetching current rate:", error);
      // Don't update entry price if fetch fails
    } finally {
      setIsRefreshingEntryPrice(false);
    }
  }, [currencyPair, updateStopLossTakeProfitPrices]);

  // Finally define handleCurrencyPairChange which depends on fetchCurrentRate
  const handleCurrencyPairChange = useCallback(
    (pair: string) => {
      setCurrencyPair(pair);
      // Defer the fetch to the next tick to ensure state is updated
      setTimeout(() => fetchCurrentRate(), 0);
    },
    [fetchCurrentRate]
  );

  // Update stop loss and take profit when position type changes
  useEffect(() => {
    if (entryPrice) {
      updateStopLossTakeProfitPrices(parseFloat(entryPrice));
    }
  }, [positionType, entryPrice, updateStopLossTakeProfitPrices]);

  // In the useEffect with fetchCurrentRate dependency
  useEffect(() => {
    // Only fetch on initial mount or when the dependencies genuinely change
    if (isInitialMount.current) {
      // This is the first time the component mounted
      isInitialMount.current = false;
      fetchCurrentRate();
    }
    // Don't add fetchCurrentRate as dependency to prevent loops
  }, []); // Empty dependency array, will only run once

  // Fetch exchange rate for currency conversion with better error handling
  const fetchExchangeRate = useCallback(
    async (fromCurrency: string, toCurrency: string) => {
      if (fromCurrency === toCurrency) {
        return 1; // Same currency, no conversion needed
      }

      const pairKey = `${fromCurrency}${toCurrency}`;
      const reversePairKey = `${toCurrency}${fromCurrency}`;

      // Check if we already have this rate and it's less than 1 hour old
      const oneHourAgo = Date.now() - 3600000;
      if (
        exchangeRates[pairKey] &&
        !exchangeRates[pairKey].loading &&
        !exchangeRates[pairKey].error &&
        exchangeRates[pairKey].timestamp > oneHourAgo
      ) {
        return exchangeRates[pairKey].rate;
      }

      // Check if we have the reverse rate that's still valid
      if (
        exchangeRates[reversePairKey] &&
        !exchangeRates[reversePairKey].loading &&
        !exchangeRates[reversePairKey].error &&
        exchangeRates[reversePairKey].timestamp > oneHourAgo
      ) {
        return 1 / exchangeRates[reversePairKey].rate;
      }

      // Mark as loading
      setIsLoadingRates(true);
      setExchangeRates((prev) => ({
        ...prev,
        [pairKey]: { rate: 0, timestamp: 0, loading: true },
      }));

      try {
        // First try direct rate API
        const url = `https://marketdata.tradermade.com/api/v1/live?currency=${pairKey}&api_key=${env.traderMadeApiKey}`;
        let response = await fetch(url);
        let data: TraderMadeResponse;

        if (!response.ok) {
          // If direct rate fails, try reverse rate
          const reverseUrl = `https://marketdata.tradermade.com/api/v1/live?currency=${reversePairKey}&api_key=${env.traderMadeApiKey}`;
          response = await fetch(reverseUrl);

          if (!response.ok) {
            throw new Error(
              `API returned ${response.status}: ${response.statusText}`
            );
          }

          data = (await response.json()) as TraderMadeResponse;

          if (data.quotes && data.quotes.length > 0) {
            const quote = data.quotes[0];
            const reverseRate = quote.mid || quote.price || 0;

            if (reverseRate <= 0) {
              throw new Error("Invalid exchange rate returned");
            }

            // Store the rate and return inverse
            const rate = 1 / reverseRate;
            setExchangeRates((prev) => ({
              ...prev,
              [pairKey]: {
                rate,
                timestamp: data.timestamp || Date.now(),
                loading: false,
              },
            }));

            return rate;
          }
        } else {
          data = (await response.json()) as TraderMadeResponse;

          if (data.quotes && data.quotes.length > 0) {
            const quote = data.quotes[0];
            const rate = quote.mid || quote.price || 0;

            if (rate <= 0) {
              throw new Error("Invalid exchange rate returned");
            }

            setExchangeRates((prev) => ({
              ...prev,
              [pairKey]: {
                rate,
                timestamp: data.timestamp || Date.now(),
                loading: false,
              },
            }));

            return rate;
          }
        }

        // If we got here, we didn't get a valid rate
        throw new Error("No exchange rate data available");
      } catch (error) {
        console.error(`Error fetching exchange rate for ${pairKey}:`, error);

        // Try using a fallback approximate rate for common pairs if we have it
        const fallbackRate = getTradingPairFallbackRate(
          fromCurrency,
          toCurrency
        );
        if (fallbackRate > 0) {
          console.log(`Using fallback rate for ${pairKey}: ${fallbackRate}`);
          setUsingFallbackRates(true);
          setExchangeRates((prev) => ({
            ...prev,
            [pairKey]: {
              rate: fallbackRate,
              timestamp: Date.now(),
              loading: false,
              usingFallback: true,
            },
          }));
          return fallbackRate;
        }

        setExchangeRates((prev) => ({
          ...prev,
          [pairKey]: {
            rate: 0,
            timestamp: 0,
            loading: false,
            error:
              error instanceof Error ? error.message : "Failed to fetch rate",
          },
        }));
        return 0;
      } finally {
        setIsLoadingRates(false);
      }
    },
    [exchangeRates]
  );

  // Add this helper function for fallback rates in case API fails
  const getTradingPairFallbackRate = (from: string, to: string): number => {
    // Common exchange rate approximations - these should be updated periodically
    // Only return a value if we have a reasonable approximation
    const fallbackRates: Record<string, number> = {
      EURUSD: 1.08,
      USDJPY: 150.0,
      GBPUSD: 1.27,
      USDCHF: 0.89,
      USDCAD: 1.37,
      AUDUSD: 0.67,
      NZDUSD: 0.61,
      EURGBP: 0.85,
      EURJPY: 162.0,
      GBPJPY: 190.0,
      GBPCAD: 1.74,
    };

    const key = `${from}${to}`;
    if (fallbackRates[key]) {
      return fallbackRates[key];
    }

    // Try reverse rate
    const reverseKey = `${to}${from}`;
    if (fallbackRates[reverseKey]) {
      return 1 / fallbackRates[reverseKey];
    }

    return 0; // No fallback available
  };

  // Fetch required exchange rates when currency pair or account currency changes
  useEffect(() => {
    const fetchRequiredRates = async () => {
      const pairData = getCurrencyPairByName(currencyPair);
      if (!pairData) return;

      const { base, quote } = pairData;

      // Fetch rate for the selected currency pair
      await fetchExchangeRate(base, quote);

      // If account currency is different from quote currency, fetch that rate too
      if (quote !== accountCurrency) {
        await fetchExchangeRate(quote, accountCurrency);
      }
    };

    fetchRequiredRates();
  }, [currencyPair, accountCurrency, fetchExchangeRate]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    accountCurrency,
    currencyPair,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    positionSize,
    positionType,
    exchangeRates,
  ]);

  const calculateResults = async () => {
    setCalculationError(null); // Reset error state

    const entry = parseFloat(entryPrice) || 0;
    const stopLoss = parseFloat(stopLossPrice) || 0;
    const takeProfit = parseFloat(takeProfitPrice) || 0;
    const size = parseFloat(positionSize) || 0;
    const isLong = positionType === "long";

    if (entry <= 0 || stopLoss <= 0 || takeProfit <= 0 || size <= 0) return;

    const pairData = getCurrencyPairByName(currencyPair);
    if (!pairData) return;

    // Get the exchange rate for accurate pip value calculation
    const { base, quote } = pairData;

    // Calculate pip differences based on long/short position
    let stopLossDiff, takeProfitDiff;

    if (isLong) {
      stopLossDiff = entry - stopLoss;
      takeProfitDiff = takeProfit - entry;
    } else {
      stopLossDiff = stopLoss - entry;
      takeProfitDiff = entry - takeProfit;
    }

    // Safety check - ensure differences are positive
    if (stopLossDiff <= 0 || takeProfitDiff <= 0) {
      setCalculationError(
        isLong
          ? "For a Long position, Stop Loss must be below Entry Price and Take Profit must be above Entry Price"
          : "For a Short position, Stop Loss must be above Entry Price and Take Profit must be below Entry Price"
      );
      return;
    }

    // Get pip decimal places for this currency pair
    const pipDecimalPlaces = getPipDecimalPlaces(quote);

    // Calculate pips - use the correct pip factor based on the currency pair's definition
    const pipFactor = Math.pow(10, pipDecimalPlaces);
    const stopLossPipsValue = stopLossDiff * pipFactor;
    const takeProfitPipsValue = takeProfitDiff * pipFactor;

    // Calculate pip value in quote currency
    const lotSize = size * 100000; // Standard lot is 100,000 units
    const pipValueQuote = calculatePipValueInQuoteCurrency(
      { base, quote },
      lotSize,
      1, // for single pip
      pipDecimalPlaces
    );

    // Get exchange rate for converting pip value to account currency if needed
    let quoteToAccountRate = 1;
    if (quote !== accountCurrency) {
      const rateKey = `${quote}${accountCurrency}`;
      const reverseRateKey = `${accountCurrency}${quote}`;

      if (
        exchangeRates[rateKey] &&
        !exchangeRates[rateKey].loading &&
        !exchangeRates[rateKey].error
      ) {
        quoteToAccountRate = exchangeRates[rateKey].rate;
      } else if (
        exchangeRates[reverseRateKey] &&
        !exchangeRates[reverseRateKey].loading &&
        !exchangeRates[reverseRateKey].error
      ) {
        quoteToAccountRate = 1 / exchangeRates[reverseRateKey].rate;
      } else {
        // No valid exchange rate available - ensure we show this in the UI
        console.warn(
          `No exchange rate available for ${quote} to ${accountCurrency}`
        );
        setIsLoadingRates(false);
      }
    }

    // Convert pip value to account currency
    const pipValueAccount = calculatePipValueInAccountCurrency(
      pipValueQuote,
      quote,
      accountCurrency,
      quoteToAccountRate
    );

    // Calculate monetary amounts
    const stopLossAmountValue = stopLossPipsValue * pipValueAccount;
    const takeProfitAmountValue = takeProfitPipsValue * pipValueAccount;

    // Calculate risk/reward ratio
    const riskRewardRatioValue = takeProfitAmountValue / stopLossAmountValue;

    // Update state with calculated values
    setStopLossPips(stopLossPipsValue);
    setTakeProfitPips(takeProfitPipsValue);
    setStopLossAmount(stopLossAmountValue);
    setTakeProfitAmount(takeProfitAmountValue);
    setPipValue(pipValueAccount);
    setRiskRewardRatio(riskRewardRatioValue);
  };

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
            onChange={setAccountCurrency}
          />

          <View
            style={[
              styles.currencyPairSection,
              isRefreshingEntryPrice && styles.loadingSection,
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
                onChangeText={setEntryPrice}
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
                        onPress={fetchCurrentRate}
                        disabled={isRefreshingEntryPrice}
                      >
                        {isRefreshingEntryPrice ? (
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
            label="Stop Loss Price"
            value={stopLossPrice}
            onChangeText={setStopLossPrice}
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
            onChangeText={setTakeProfitPrice}
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

        <Divider style={styles.divider} />

        <View style={styles.resultsContainer}>
          {calculationError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{calculationError}</Text>
            </View>
          ) : isLoadingRates ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>
                Fetching latest exchange rates...
              </Text>
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
                    label="Stop Loss"
                    value={formatCurrency(stopLossAmount, accountCurrency)}
                    color="#FF5252"
                  />
                  <ResultDisplay
                    label="Stop Loss Pips"
                    value={`${stopLossPips.toFixed(1)} pips`}
                    color="#FF5252"
                  />
                </View>

                <View style={styles.resultColumn}>
                  <ResultDisplay
                    label="Take Profit"
                    value={formatCurrency(takeProfitAmount, accountCurrency)}
                    color="#4CAF50"
                  />
                  <ResultDisplay
                    label="Take Profit Pips"
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
  fallbackRateNote: {
    fontSize: 12,
    color: "#FF9800",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
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
});
