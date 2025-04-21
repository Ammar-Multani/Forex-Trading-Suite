import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  TextInput,
  Text,
  Divider,
  IconButton,
  Chip,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { calculatePipValue, formatCurrency } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";
import { useTheme } from "../../contexts/ThemeContext";
import { CURRENCY_PAIRS } from "../../constants/currencies";

// Lot size presets
const LOT_SIZES = [
  { label: "Micro (0.01)", value: "0.01" },
  { label: "Mini (0.1)", value: "0.1" },
  { label: "Standard (1.0)", value: "1" },
  { label: "Custom", value: "custom" },
];

export default function PipCalculator() {
  const { isDark } = useTheme();
  const { forexPairRates, isLoading, lastUpdated, refreshRates, error } =
    useExchangeRates();

  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [positionSize, setPositionSize] = useState("1");
  const [pips, setPips] = useState("10");
  const [selectedLotSize, setSelectedLotSize] = useState("1");
  const [customLotSize, setCustomLotSize] = useState(false);

  // State for results
  const [pipValue, setPipValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // History of calculations
  const [history, setHistory] = useState<
    Array<{
      pair: string;
      size: string;
      pips: string;
      value: number;
      total: number;
      timestamp: Date;
    }>
  >([]);

  // Get current exchange rate for the selected pair
  const getCurrentRate = useCallback(() => {
    if (!currencyPair) return "Loading...";

    // Convert from EUR/USD format to EURUSD format
    const formattedPair = currencyPair.replace("/", "");

    if (forexPairRates && forexPairRates[formattedPair]) {
      return forexPairRates[formattedPair].toFixed(5);
    }

    return "Loading...";
  }, [currencyPair, forexPairRates]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, positionSize, pips]);

  const calculateResults = () => {
    const size = parseFloat(positionSize) || 0;
    const pipCount = parseFloat(pips) || 0;

    if (size > 0) {
      // Convert from EUR/USD format to EURUSD format for calculation
      const formattedPair = currencyPair.replace("/", "");

      const value = calculatePipValue(formattedPair, accountCurrency, size);
      setPipValue(value);
      setTotalValue(value * pipCount);
    }
  };

  const handleLotSizeSelect = (size: string) => {
    if (size === "custom") {
      setCustomLotSize(true);
      // Keep current position size
    } else {
      setCustomLotSize(false);
      setPositionSize(size);
      setSelectedLotSize(size);
    }
  };

  const saveToHistory = () => {
    const newEntry = {
      pair: currencyPair,
      size: positionSize,
      pips,
      value: pipValue,
      total: totalValue,
      timestamp: new Date(),
    };

    setHistory((prev) => [newEntry, ...prev].slice(0, 10)); // Keep last 10 entries
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    calculateResults();
    setRefreshing(false);
  };

  // Display error message if there's an API error
  if (error) {
    return (
      <CalculatorCard title="Pip Calculator">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshRates}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </CalculatorCard>
    );
  }

  return (
    <View style={styles.container}>
      <CalculatorCard title="Pip Calculator">
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.rateContainer}>
            <View style={styles.rateHeader}>
              <Text
                variant="bodyMedium"
                style={{ color: isDark ? "#aaa" : "#666" }}
              >
                Current Rate:
              </Text>
              {isLoading && !refreshing ? (
                <ActivityIndicator
                  size={16}
                  color="#6200ee"
                  style={{ marginLeft: 8 }}
                />
              ) : (
                <IconButton
                  icon="refresh"
                  size={16}
                  onPress={refreshRates}
                  iconColor="#6200ee"
                  style={{ margin: 0 }}
                />
              )}
            </View>
            <View style={styles.rateValue}>
              <Text
                variant="titleMedium"
                style={{ color: isDark ? "#fff" : "#000", fontWeight: "bold" }}
              >
                {currencyPair}: {getCurrentRate()}
              </Text>
              {lastUpdated && (
                <Text
                  variant="bodySmall"
                  style={{ color: isDark ? "#aaa" : "#666" }}
                >
                  Updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.inputsContainer}>
            <AccountCurrencySelector
              value={accountCurrency}
              onChange={setAccountCurrency}
            />

            <CurrencyPairSelector
              value={currencyPair}
              onChange={setCurrencyPair}
            />

            <Text variant="bodySmall" style={{ marginBottom: 8 }}>
              Position Size
            </Text>
            <View style={styles.lotSizeContainer}>
              {LOT_SIZES.map((lot) => (
                <TouchableOpacity
                  key={lot.value}
                  style={[
                    styles.lotSizeButton,
                    {
                      backgroundColor:
                        selectedLotSize === lot.value ||
                        (customLotSize && lot.value === "custom")
                          ? "#6200ee"
                          : isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                  onPress={() => handleLotSizeSelect(lot.value)}
                >
                  <Text
                    style={{
                      color:
                        selectedLotSize === lot.value ||
                        (customLotSize && lot.value === "custom")
                          ? "#fff"
                          : isDark
                          ? "#fff"
                          : "#000",
                      fontSize: 12,
                    }}
                  >
                    {lot.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {customLotSize && (
              <TextInput
                label="Custom Lot Size"
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
            )}

            <TextInput
              label="Number of Pips"
              value={pips}
              onChangeText={setPips}
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
              right={<TextInput.Affix text="pips" />}
            />

            <View style={styles.chipContainer}>
              <Chip
                icon="information"
                mode="outlined"
                style={{ borderColor: isDark ? "#444" : "#ddd" }}
                textStyle={{ color: isDark ? "#fff" : "#000" }}
              >
                {currencyPair.includes("JPY")
                  ? "1 pip = 0.01"
                  : "1 pip = 0.0001"}
              </Chip>
            </View>
          </View>

          <Divider
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          />

          <View style={styles.resultsContainer}>
            <View style={styles.resultHeader}>
              <Text
                variant="titleMedium"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Results
              </Text>
              <View style={styles.resultActions}>
                <IconButton
                  icon="refresh"
                  size={20}
                  onPress={calculateResults}
                  iconColor={isDark ? "#fff" : "#000"}
                />
                <IconButton
                  icon="content-save"
                  size={20}
                  onPress={saveToHistory}
                  iconColor={isDark ? "#fff" : "#000"}
                />
              </View>
            </View>

            <View style={styles.resultCards}>
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={{ color: isDark ? "#aaa" : "#666" }}
                >
                  Pip Value
                </Text>
                <Text
                  variant="titleLarge"
                  style={{ color: "#4CAF50", fontWeight: "bold" }}
                >
                  {formatCurrency(pipValue, accountCurrency)}
                </Text>
              </View>

              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={{ color: isDark ? "#aaa" : "#666" }}
                >
                  Total Value ({pips} pips)
                </Text>
                <Text
                  variant="titleLarge"
                  style={{ color: "#2196F3", fontWeight: "bold" }}
                >
                  {formatCurrency(totalValue, accountCurrency)}
                </Text>
              </View>
            </View>
          </View>

          {history.length > 0 && (
            <>
              <Divider
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  },
                ]}
              />

              <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                  <Text
                    variant="titleMedium"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    Recent Calculations
                  </Text>
                  <Button
                    mode="text"
                    onPress={clearHistory}
                    compact
                    textColor="#6200ee"
                  >
                    Clear
                  </Button>
                </View>

                <ScrollView style={styles.historyList}>
                  {history.map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyItemLeft}>
                        <Text
                          variant="bodyMedium"
                          style={{ color: isDark ? "#fff" : "#000" }}
                        >
                          {item.pair} ({item.size} lots)
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: isDark ? "#aaa" : "#666" }}
                        >
                          {formatTime(item.timestamp)}
                        </Text>
                      </View>

                      <View style={styles.historyItemRight}>
                        <Text
                          variant="bodyMedium"
                          style={{ color: isDark ? "#fff" : "#000" }}
                        >
                          {item.pips} pips
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ color: "#2196F3", fontWeight: "bold" }}
                        >
                          {formatCurrency(item.total, accountCurrency)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </ScrollView>
      </CalculatorCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  rateContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(98, 0, 238, 0.1)",
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rateValue: {
    flexDirection: "column",
  },
  inputsContainer: {
    marginBottom: 16,
  },
  lotSizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  lotSizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  input: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: "row",
  },
  resultCards: {
    flexDirection: "row",
    gap: 12,
  },
  resultCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  historyContainer: {
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemRight: {
    alignItems: "flex-end",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: "#6200ee",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
