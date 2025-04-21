import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  TextInput,
  Text,
  Divider,
  IconButton,
  Button,
  Chip,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { calculatePipDifference } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import { useTheme } from "../../contexts/ThemeContext";

// Common currency pairs for quick selection
const COMMON_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "USD/CHF",
];

export default function PipDifferenceCalculator() {
  const { isDark } = useTheme();

  // State for inputs
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [priceA, setPriceA] = useState("1.2000");
  const [priceB, setPriceB] = useState("1.1950");
  const [showPairSuggestions, setShowPairSuggestions] = useState(false);

  // State for results
  const [pipDifference, setPipDifference] = useState(0);
  const [direction, setDirection] = useState<"up" | "down" | "none">("down");

  // History of calculations
  const [history, setHistory] = useState<
    Array<{
      pair: string;
      priceA: string;
      priceB: string;
      pips: number;
      direction: "up" | "down" | "none";
      timestamp: Date;
    }>
  >([]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [currencyPair, priceA, priceB]);

  const calculateResults = () => {
    const a = parseFloat(priceA) || 0;
    const b = parseFloat(priceB) || 0;

    if (a > 0 && b > 0) {
      const pips = calculatePipDifference(a, b, currencyPair);
      setPipDifference(pips);

      // Determine direction
      if (a > b) {
        setDirection("down");
      } else if (a < b) {
        setDirection("up");
      } else {
        setDirection("none");
      }

      // Add to history (only if values are different)
      if (pips > 0) {
        const newEntry = {
          pair: currencyPair,
          priceA: a.toString(),
          priceB: b.toString(),
          pips,
          direction: a > b ? "down" : a < b ? "up" : "none",
          timestamp: new Date(),
        };

        // Check if this calculation is already in history
        const exists = history.some(
          (item) =>
            item.pair === newEntry.pair &&
            item.priceA === newEntry.priceA &&
            item.priceB === newEntry.priceB
        );

        if (!exists) {
          setHistory((prev) => [newEntry, ...prev].slice(0, 10)); // Keep last 10 entries
        }
      }
    }
  };

  const swapPrices = () => {
    setPriceA(priceB);
    setPriceB(priceA);
  };

  const selectPair = (pair: string) => {
    setCurrencyPair(pair);
    setShowPairSuggestions(false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDirectionIcon = (dir: "up" | "down" | "none") => {
    if (dir === "up") return "arrow-up";
    if (dir === "down") return "arrow-down";
    return "remove";
  };

  const getDirectionColor = (dir: "up" | "down" | "none") => {
    if (dir === "up") return "#4CAF50";
    if (dir === "down") return "#F44336";
    return "#9E9E9E";
  };

  return (
    <View style={styles.container}>
      <CalculatorCard title="Pip Difference Calculator">
        <View style={styles.inputsContainer}>
          <View style={styles.pairSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.pairSelector,
                {
                  backgroundColor: isDark ? "#2A2A2A" : "#f5f5f5",
                  borderColor: isDark ? "#444" : "#ddd",
                },
              ]}
              onPress={() => setShowPairSuggestions(!showPairSuggestions)}
            >
              <Text style={{ color: isDark ? "#fff" : "#000" }}>
                {currencyPair}
              </Text>
              <Ionicons
                name={showPairSuggestions ? "chevron-up" : "chevron-down"}
                size={20}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>

            {showPairSuggestions && (
              <View
                style={[
                  styles.pairSuggestions,
                  {
                    backgroundColor: isDark ? "#2A2A2A" : "#f5f5f5",
                    borderColor: isDark ? "#444" : "#ddd",
                  },
                ]}
              >
                <ScrollView>
                  {COMMON_PAIRS.map((pair) => (
                    <TouchableOpacity
                      key={pair}
                      style={styles.pairOption}
                      onPress={() => selectPair(pair)}
                    >
                      <Text style={{ color: isDark ? "#fff" : "#000" }}>
                        {pair}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.priceInputsContainer}>
            <TextInput
              label="Price A"
              value={priceA}
              onChangeText={setPriceA}
              keyboardType="numeric"
              style={[styles.input, { flex: 1 }]}
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

            <IconButton
              icon="swap-horizontal"
              size={24}
              onPress={swapPrices}
              style={styles.swapButton}
              iconColor="#6200ee"
            />

            <TextInput
              label="Price B"
              value={priceB}
              onChangeText={setPriceB}
              keyboardType="numeric"
              style={[styles.input, { flex: 1 }]}
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

          <View style={styles.chipContainer}>
            <Chip
              icon="information"
              mode="outlined"
              style={{ borderColor: isDark ? "#444" : "#ddd" }}
              textStyle={{ color: isDark ? "#fff" : "#000" }}
            >
              {currencyPair.includes("JPY") ? "1 pip = 0.01" : "1 pip = 0.0001"}
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
              Result
            </Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={calculateResults}
              iconColor={isDark ? "#fff" : "#000"}
            />
          </View>

          <View style={styles.mainResult}>
            <Ionicons
              name={getDirectionIcon(direction)}
              size={24}
              color={getDirectionColor(direction)}
              style={styles.directionIcon}
            />
            <Text
              variant="displaySmall"
              style={{
                color: getDirectionColor(direction),
                fontWeight: "bold",
              }}
            >
              {pipDifference.toFixed(1)}
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: isDark ? "#aaa" : "#666" }}
            >
              pips
            </Text>
          </View>

          <Text
            variant="bodySmall"
            style={{
              color: isDark ? "#aaa" : "#666",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {direction === "up"
              ? "Price increased"
              : direction === "down"
              ? "Price decreased"
              : "No change"}
          </Text>
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
                        {item.pair}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{ color: isDark ? "#aaa" : "#666" }}
                      >
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>

                    <View style={styles.historyItemRight}>
                      <Ionicons
                        name={getDirectionIcon(item.direction)}
                        size={16}
                        color={getDirectionColor(item.direction)}
                      />
                      <Text
                        variant="bodyMedium"
                        style={{
                          color: getDirectionColor(item.direction),
                          fontWeight: "bold",
                        }}
                      >
                        {item.pips.toFixed(1)} pips
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}
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
  pairSelectorContainer: {
    marginBottom: 16,
    position: "relative",
    zIndex: 1000,
  },
  pairSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  pairSuggestions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
  },
  pairOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  priceInputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  swapButton: {
    marginHorizontal: 8,
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
  mainResult: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  directionIcon: {
    marginRight: 8,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
