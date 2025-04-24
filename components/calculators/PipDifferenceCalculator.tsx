import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Text,
  Divider,
  IconButton,
  Button,
  Chip,
  Surface,
  Menu,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { calculatePipDifference } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import { useTheme } from "../../contexts/ThemeContext";
import PageHeader from "../ui/PageHeader";

// Get the screen width for animations
const { width } = Dimensions.get("window");

export default function PipDifferenceCalculator() {
  const { isDark } = useTheme();

  // State for inputs
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [priceA, setPriceA] = useState("1.2000");
  const [priceB, setPriceB] = useState("1.1950");

  // State for results
  const [pipDifference, setPipDifference] = useState(0);
  const [direction, setDirection] = useState<"up" | "down" | "none">("down");

  // State for filter and organization
  const [historyFilterOpen, setHistoryFilterOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "favorites">(
    "all"
  );

  // History of calculations
  const [history, setHistory] = useState<
    Array<{
      pair: string;
      priceA: string;
      priceB: string;
      pips: number;
      direction: "up" | "down" | "none";
      timestamp: Date;
      isFavorite?: boolean;
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
          direction:
            a > b
              ? ("down" as const)
              : a < b
              ? ("up" as const)
              : ("none" as const),
          timestamp: new Date(),
          isFavorite: false,
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

  const clearHistory = () => {
    setHistory([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;

    return formatTime(date);
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

  const deleteHistoryItem = (index: number) => {
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory.splice(index, 1);
      return newHistory;
    });
  };

  const toggleFavorite = (index: number) => {
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory[index] = {
        ...newHistory[index],
        isFavorite: !newHistory[index].isFavorite,
      };
      return newHistory;
    });
  };

  // Filter history based on selected filter
  const filteredHistory =
    historyFilter === "favorites"
      ? history.filter((item) => item.isFavorite)
      : history;

  return (
    <View style={styles.container}>
      <PageHeader
        title="Pip Difference Calculator"
        subtitle="Calculate the difference between two prices in pips"
      />
      <CalculatorCard title="Calculate Pip Difference">
        <View style={styles.inputsContainer}>
          <CurrencyPairSelector
            label="Currency Pair"
            selectedPair={currencyPair}
            onSelect={(pair) => setCurrencyPair(pair)}
          />

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
            <View style={styles.historyActions}>
              <Menu
                visible={historyFilterOpen}
                onDismiss={() => setHistoryFilterOpen(false)}
                contentStyle={{
                  backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
                  top: 60,
                  borderWidth: 1,
                  borderColor: "grey",
                }}
                anchor={
                  <Button
                    mode="text"
                    onPress={() => setHistoryFilterOpen(true)}
                    icon="filter-variant"
                    textColor="#6200ee"
                    compact
                  >
                    {historyFilter === "favorites" ? "Favorites" : "All"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setHistoryFilter("all");
                    setHistoryFilterOpen(false);
                  }}
                  title="All"
                  leadingIcon="format-list-bulleted"
                  trailingIcon={historyFilter === "all" ? "check" : undefined}
                />
                <Menu.Item
                  onPress={() => {
                    setHistoryFilter("favorites");
                    setHistoryFilterOpen(false);
                  }}
                  title="Favorites"
                  leadingIcon="star"
                  trailingIcon={
                    historyFilter === "favorites" ? "check" : undefined
                  }
                />
              </Menu>

              <Button
                mode="text"
                onPress={clearHistory}
                compact
                textColor="#6200ee"
              >
                Clear
              </Button>
            </View>
          </View>

          {filteredHistory.length > 0 ? (
            <ScrollView style={styles.historyList}>
              {filteredHistory.map((item, index) => {
                // Check if this is the first item or if the date is different from the previous item
                const isNewDay =
                  index === 0 ||
                  new Date(item.timestamp).toDateString() !==
                    new Date(
                      filteredHistory[index - 1].timestamp
                    ).toDateString();

                return (
                  <React.Fragment key={index}>
                    {isNewDay && (
                      <Text
                        style={[
                          styles.historyDateHeader,
                          {
                            color: isDark
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(0,0,0,0.6)",
                          },
                        ]}
                      >
                        {new Date(item.timestamp).toLocaleDateString()}
                      </Text>
                    )}
                    <Surface
                      style={[
                        styles.historyItem,
                        index === 0 && styles.historyItemRecent,
                        {
                          backgroundColor:
                            index === 0
                              ? isDark
                                ? "#321b6e"
                                : "#efe5ff"
                              : isDark
                              ? "#1e1e1e"
                              : "#ffffff",
                          borderBottomColor: isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                          borderRadius: 8,
                          marginHorizontal: 0,
                          marginBottom: 6,
                        },
                      ]}
                      elevation={0}
                    >
                      <TouchableOpacity
                        style={styles.historyItemTouchable}
                        onPress={() => {
                          setCurrencyPair(item.pair);
                          setPriceA(item.priceA);
                          setPriceB(item.priceB);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.historyItemLeft}>
                          <View style={styles.historyItemTopRow}>
                            <Text
                              variant="bodyMedium"
                              style={[
                                styles.historyItemPair,
                                { color: isDark ? "#fff" : "#000" },
                              ]}
                            >
                              {item.pair}
                            </Text>
                            {item.isFavorite && (
                              <Ionicons
                                name="star"
                                size={16}
                                color="#6200ee"
                                style={{ marginLeft: 4 }}
                              />
                            )}
                          </View>

                          <View style={styles.historyItemDetails}>
                            <Text
                              variant="bodySmall"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.6)"
                                  : "rgba(0,0,0,0.5)",
                              }}
                            >
                              {item.priceA} → {item.priceB}
                            </Text>
                            <Text
                              variant="bodySmall"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.4)",
                              }}
                            >
                              {getRelativeTime(item.timestamp)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.historyItemRight}>
                          <View style={styles.historyItemActions}>
                            <IconButton
                              icon={item.isFavorite ? "star" : "star-outline"}
                              size={18}
                              onPress={() => toggleFavorite(index)}
                              iconColor={
                                item.isFavorite
                                  ? "#6200ee"
                                  : isDark
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.4)"
                              }
                              style={styles.actionButton}
                            />
                            <IconButton
                              icon="trash-can-outline"
                              size={18}
                              onPress={() => deleteHistoryItem(index)}
                              iconColor={
                                isDark
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.4)"
                              }
                              style={styles.actionButton}
                            />
                          </View>

                          <View style={styles.pipDisplay}>
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
                      </TouchableOpacity>
                    </Surface>
                  </React.Fragment>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons
                name="calculator-outline"
                size={48}
                color={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
              />
              <Text
                style={[
                  styles.emptyHistoryText,
                  {
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  },
                ]}
              >
                {historyFilter === "favorites"
                  ? "No favorite calculations yet"
                  : "No calculations yet"}
              </Text>
              {historyFilter === "favorites" && history.length > 0 && (
                <Button
                  mode="outlined"
                  onPress={() => setHistoryFilter("all")}
                  style={styles.emptyHistoryButton}
                >
                  Show all calculations
                </Button>
              )}
            </View>
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
    paddingTop: 20,
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
    paddingHorizontal: 16,
  },
  historyActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyList: {
    maxHeight: 350,
  },
  historyDateHeader: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  historyItem: {
    borderBottomWidth: 1,
  },
  historyItemTouchable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  historyItemRecent: {
    borderLeftWidth: 4,
    borderLeftColor: "#6200ee",
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyItemPair: {
    fontWeight: "600",
    marginBottom: 2,
  },
  historyItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "70%",
  },
  historyItemRight: {
    alignItems: "flex-end",
  },
  historyItemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 2,
  },
  actionButton: {
    margin: 0,
    padding: 0,
    width: 24,
    height: 24,
  },
  pipDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyHistoryText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  emptyHistoryButton: {
    marginTop: 16,
  },
});
