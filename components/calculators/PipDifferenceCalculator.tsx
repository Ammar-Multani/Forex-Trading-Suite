import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  Share,
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { calculatePipDifference } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import { useTheme } from "../../contexts/ThemeContext";
import PageHeader from "../ui/PageHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get the screen width for animations
const { width } = Dimensions.get("window");

// Storage keys
const CURRENCY_PAIR_KEY = "pip-diff-calculator-currency-pair";
const PRICE_A_KEY = "pip-diff-calculator-price-a";
const PRICE_B_KEY = "pip-diff-calculator-price-b";
const PIP_DECIMAL_PLACES_KEY = "pip-diff-calculator-pip-decimal-places";
const ADVANCED_OPTIONS_KEY = "pip-diff-calculator-advanced-options";

export default function PipDifferenceCalculator() {
  const { isDark } = useTheme();

  // State for inputs
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [priceA, setPriceA] = useState("1.2000");
  const [priceB, setPriceB] = useState("1.1950");
  const [pipDecimalPlaces, setPipDecimalPlaces] = useState(4);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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
      pipDecimalPlaces: number;
    }>
  >([]);

  // State for expandable history
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load currency pair
        const savedCurrencyPair = await AsyncStorage.getItem(CURRENCY_PAIR_KEY);
        if (savedCurrencyPair) {
          setCurrencyPair(savedCurrencyPair);
        }

        // Load price A
        const savedPriceA = await AsyncStorage.getItem(PRICE_A_KEY);
        if (savedPriceA) {
          setPriceA(savedPriceA);
        }

        // Load price B
        const savedPriceB = await AsyncStorage.getItem(PRICE_B_KEY);
        if (savedPriceB) {
          setPriceB(savedPriceB);
        }

        // Load pip decimal places
        const savedPipDecimalPlaces = await AsyncStorage.getItem(
          PIP_DECIMAL_PLACES_KEY
        );
        if (savedPipDecimalPlaces) {
          setPipDecimalPlaces(parseInt(savedPipDecimalPlaces));
        }

        // Load advanced options state
        const savedAdvancedOptions = await AsyncStorage.getItem(
          ADVANCED_OPTIONS_KEY
        );
        if (savedAdvancedOptions) {
          setShowAdvancedOptions(savedAdvancedOptions === "true");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    const savePreferences = async () => {
      try {
        await AsyncStorage.setItem(CURRENCY_PAIR_KEY, currencyPair);
        await AsyncStorage.setItem(PRICE_A_KEY, priceA);
        await AsyncStorage.setItem(PRICE_B_KEY, priceB);
        await AsyncStorage.setItem(
          PIP_DECIMAL_PLACES_KEY,
          pipDecimalPlaces.toString()
        );
        await AsyncStorage.setItem(
          ADVANCED_OPTIONS_KEY,
          showAdvancedOptions.toString()
        );
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    };

    savePreferences();
  }, [currencyPair, priceA, priceB, pipDecimalPlaces, showAdvancedOptions]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [currencyPair, priceA, priceB, pipDecimalPlaces]);

  const calculateResults = () => {
    const a = parseFloat(priceA) || 0;
    const b = parseFloat(priceB) || 0;

    if (a > 0 && b > 0) {
      const pips = calculatePipDifference(a, b, currencyPair, pipDecimalPlaces);
      setPipDifference(pips);

      // Determine direction
      if (a > b) {
        setDirection("down");
      } else if (a < b) {
        setDirection("up");
      } else {
        setDirection("none");
      }

      // Remove automatic saving to history - we'll use the save button instead
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

  const copyToClipboard = (text: string) => {
   
  };

  const shareResult = async () => {
    try {
      const message = `Forex Pip Difference Calculation
Currency Pair: ${currencyPair}
Price A: ${priceA} 
Price B: ${priceB}
Pip Difference: ${pipDifference.toFixed(1)} pips
Direction: ${
        direction === "up"
          ? "Increased"
          : direction === "down"
          ? "Decreased"
          : "No Change"
      }
`;

      await Share.share({
        message,
        title: "Pip Difference Calculation",
      });
    } catch (error) {
      console.error("Error sharing calculation:", error);
      Alert.alert("Error", "Failed to share calculation");
    }
  };

  const saveToHistory = () => {
    const a = parseFloat(priceA) || 0;
    const b = parseFloat(priceB) || 0;

    if (a > 0 && b > 0) {
      const pips = calculatePipDifference(a, b, currencyPair, pipDecimalPlaces);

      if (pips > 0) {
        const newEntry = {
          pair: currencyPair,
          priceA: a.toString(),
          priceB: b.toString(),
          pips,
          pipDecimalPlaces, // Include decimal places in the history entry
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
        // Also consider decimal places when checking for duplicates
        const exists = history.some(
          (item) =>
            item.pair === newEntry.pair &&
            item.priceA === newEntry.priceA &&
            item.priceB === newEntry.priceB &&
            item.pipDecimalPlaces === newEntry.pipDecimalPlaces
        );

        if (!exists) {
          const newHistory = [newEntry, ...history].slice(0, 10); // Keep last 10 entries
          setHistory(newHistory);

          // Show success message
          Alert.alert(
            "Saved",
            "Calculation saved to history",
            [{ text: "OK" }],
            {
              cancelable: true,
            }
          );
        } else {
          // Show already exists message
          Alert.alert(
            "Already Saved",
            "This calculation already exists in your history",
            [{ text: "OK" }],
            { cancelable: true }
          );
        }
      } else {
        // Show invalid pip difference message
        Alert.alert(
          "Invalid Calculation",
          "Cannot save calculations with zero pip difference",
          [{ text: "OK" }],
          { cancelable: true }
        );
      }
    } else {
      // Show invalid input message
      Alert.alert(
        "Invalid Input",
        "Please enter valid price values before saving",
        [{ text: "OK" }],
        { cancelable: true }
      );
    }
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

  // Get the denominator suffix (st, nd, rd, th)
  const getDenominator = (places: number): string => {
    if (places === 0) return "";
    if (places === 1) return "st";
    if (places === 2) return "nd";
    if (places === 3) return "rd";
    return "th";
  };

  // Generate example for the current decimal place selection
  const getDecimalPlaceExample = (places: number): string => {
    if (places === 0) return "1";
    return `0.${"0".repeat(places - 1)}1`;
  };

  // Array of available decimal places
  const decimalPlaceOptions = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

  // Render each decimal place option
  const renderDecimalPlaceOption = ({ item }: { item: number }) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.decimalPlaceOption,
        {
          backgroundColor:
            pipDecimalPlaces === item
              ? "#6200ee"
              : isDark
              ? "#2A2A2A"
              : "#f5f5f5",
          borderColor: isDark ? "#444" : "#ddd",
        },
      ]}
      onPress={() => setPipDecimalPlaces(item)}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
          color: pipDecimalPlaces === item ? "white" : isDark ? "#fff" : "#000",
        }}
      >
        {item}
        {getDenominator(item)}
      </Text>
    </TouchableOpacity>
  );

  // Filter history based on selected filter
  const filteredHistory =
    historyFilter === "favorites"
      ? history.filter((item) => item.isFavorite)
      : history;

  // Format price with appropriate decimal places based on currency pair
  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "0";

    // JPY pairs typically have 2-3 decimal places, others have 4-5
    const decimalPlaces = currencyPair.includes("JPY") ? 3 : 5;

    // Format with commas for thousands and appropriate decimal places
    return numPrice.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: decimalPlaces,
    });
  };

  // Format pip value with appropriate decimal places
  const formatPipValue = (pips: number): string => {
    if (pips === 0) return "0";

    // Small values get more precision, larger values less
    let decimalPlaces = 1;
    if (pips < 10) decimalPlaces = 1;
    if (pips >= 1000) decimalPlaces = 0;

    return pips.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  // Get a descriptive text for the price movement
  const getMovementDescription = (): string => {
    const a = parseFloat(priceA) || 0;
    const b = parseFloat(priceB) || 0;

    if (a === 0 || b === 0) return "Enter valid prices";
    if (a === b) return "No price change";

    const percentChange = ((b - a) / a) * 100;
    const absPercentChange = Math.abs(percentChange);
    let description = "";

    if (b > a) {
      description = `Price increased by ${absPercentChange.toFixed(2)}%`;
    } else {
      description = `Price decreased by ${absPercentChange.toFixed(2)}%`;
    }

    return description;
  };

  // Get the history to display based on expansion state
  const displayedHistory = isHistoryExpanded
    ? filteredHistory
    : filteredHistory.slice(0, 3); // Show only first 3 items when collapsed

  const shareHistoryItem = async (item: any) => {
    try {
      const message = `Forex Pip Difference Calculation
Currency Pair: ${item.pair}
Price A: ${item.priceA} 
Price B: ${item.priceB}
Pip Difference: ${formatPipValue(item.pips)} pips
Direction: ${
        item.direction === "up"
          ? "Increased"
          : item.direction === "down"
          ? "Decreased"
          : "No Change"
      }
`;

      await Share.share({
        message,
        title: "Pip Difference Calculation",
      });
    } catch (error) {
      console.error("Error sharing calculation:", error);
      Alert.alert("Error", "Failed to share calculation");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard title="Calculate Pip Difference">
        <View style={styles.inputsContainer}>
          <CurrencyPairSelector
            label="Financial Instrument"
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

          {/* Advanced Options Button */}
          <TouchableOpacity
            style={styles.advancedOptionsButton}
            onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Text
              style={{
                fontSize: 14,
                marginRight: 5,
                fontWeight: "500",
                color: "#6200ee",
              }}
            >
              {showAdvancedOptions
                ? "Hide Advanced Options"
                : "Show Advanced Options"}
            </Text>
            <MaterialIcons
              name={showAdvancedOptions ? "expand-less" : "expand-more"}
              size={20}
              color="#6200ee"
            />
          </TouchableOpacity>

          {/* Advanced Options Section */}
          {showAdvancedOptions && (
            <View
              style={[
                styles.advancedOptionsContainer,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 8,
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                }}
              >
                Pip Decimal Places:
              </Text>

              <FlatList
                data={decimalPlaceOptions}
                renderItem={renderDecimalPlaceOption}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.decimalPlacesScrollContainer}
              />

              <View
                style={[
                  styles.decimalPlaceExampleContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.02)",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontStyle: "italic",
                    textAlign: "center",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                  }}
                >
                  {pipDecimalPlaces === 0
                    ? "1 pip = 1 (whole unit)"
                    : `1 pip = ${getDecimalPlaceExample(
                        pipDecimalPlaces
                      )} (${pipDecimalPlaces}${getDenominator(
                        pipDecimalPlaces
                      )} decimal place)`}
                </Text>
              </View>
            </View>
          )}
          </View>
          </CalculatorCard>
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
<CalculatorCard title="Results">
        <View style={styles.resultsContainer}>


            <View style={styles.resultActions}>
              <IconButton
                icon="refresh"
                size={20}
                onPress={calculateResults}
                iconColor={isDark ? "#fff" : "#000"}
              />
              <IconButton
                icon="share-variant"
                size={20}
                onPress={shareResult}
                iconColor={isDark ? "#fff" : "#000"}
              />
              <IconButton
                icon="content-save"
                size={20}
                onPress={saveToHistory}
                iconColor={isDark ? "#fff" : "#000"}
              />
            </View>


          <View
            style={[
              styles.pipResultContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.07)"
                  : "rgba(0, 0, 0, 0.05)",
                borderWidth: 0.5,
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
                borderRadius: 8,
                marginTop: 0,
              },
            ]}
          >
            <View style={styles.resultLabelRow}>
              <Text
                style={{
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                }}
              >
                Pip Difference
              </Text>
            </View>

            <View style={styles.pipValueContainer}>
              <View style={styles.directionIconWrapper}>
                <Ionicons
                  name={getDirectionIcon(direction)}
                  size={24}
                  color={getDirectionColor(direction)}
                />
              </View>
              <Text
                variant="headlineMedium"
                style={{
                  color: getDirectionColor(direction),
                  fontWeight: "bold",
                }}
              >
                {formatPipValue(pipDifference)}
              </Text>
              <Text
                variant="bodyLarge"
                style={{ color: isDark ? "#aaa" : "#666" }}
              >
                pips
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(formatPipValue(pipDifference))}
                style={{ marginLeft: 8 }}
              >
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.pipScaleContainer}>
              <View style={styles.pipScaleTrack}>
                <View
                  style={[
                    styles.pipScaleFill,
                    {
                      width: `${Math.min(100, (pipDifference / 100) * 100)}%`,
                      backgroundColor: getDirectionColor(direction),
                    },
                  ]}
                />
              </View>
            </View>
            <Text
              style={{
                color: getDirectionColor(direction),
                textAlign: "center",
                marginTop: 18,
                marginBottom: 6,
                fontStyle: "italic",
                fontSize: 14,
              }}
            >
              {getMovementDescription()}
            </Text>
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
                disabled={filteredHistory.length === 0}
              >
                Clear
              </Button>
            </View>
          </View>

          {filteredHistory.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              {displayedHistory.map((item, index) => {
                // Check if this is the first item or if the date is different from the previous item
                const isNewDay =
                  index === 0 ||
                  new Date(item.timestamp).toDateString() !==
                    new Date(
                      displayedHistory[index - 1].timestamp
                    ).toDateString();

                return (
                  <React.Fragment key={index}>
                    {isNewDay && (
                      <Text
                        style={[
                          {
                            fontSize: 12,
                            marginTop: 8,
                            marginBottom: 4,
                            paddingHorizontal: 16,
                            fontWeight: "500",
                            color: isDark
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(0,0,0,0.6)",
                            paddingBottom: 4,
                          },
                        ]}
                      >
                        {new Date(item.timestamp).toLocaleDateString()}
                      </Text>
                    )}
                    <Surface
                      style={[
                        {
                          borderBottomWidth: 1,
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
                        index === 0 && {
                          borderLeftWidth: 4,
                          borderLeftColor: "#6200ee",
                        },
                      ]}
                      elevation={0}
                    >
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                        }}
                        onPress={() => {
                          setCurrencyPair(item.pair);
                          setPriceA(item.priceA);
                          setPriceB(item.priceB);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              variant="bodyMedium"
                              style={[
                                {
                                  fontWeight: "600",
                                  marginBottom: 2,
                                  color: isDark ? "#fff" : "#000",
                                },
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

                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "70%",
                            }}
                          >
                            <Text
                              variant="bodySmall"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.6)"
                                  : "rgba(0,0,0,0.5)",
                              }}
                            >
                              {formatPrice(item.priceA)} →{" "}
                              {formatPrice(item.priceB)}
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

                        <View style={{ alignItems: "flex-end" }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              marginBottom: 2,
                            }}
                          >
                            <IconButton
                              icon={item.isFavorite ? "star" : "star-outline"}
                              size={18}
                              onPress={(e) => {
                                e.stopPropagation();
                                toggleFavorite(filteredHistory.indexOf(item));
                              }}
                              iconColor={
                                item.isFavorite
                                  ? "#6200ee"
                                  : isDark
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.4)"
                              }
                              style={{
                                margin: 0,
                                padding: 0,
                                width: 24,
                                height: 24,
                              }}
                            />
                            <IconButton
                              icon="share-variant"
                              size={18}
                              onPress={(e) => {
                                e.stopPropagation();
                                shareHistoryItem(item);
                              }}
                              iconColor={
                                isDark
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.4)"
                              }
                              style={{
                                margin: 0,
                                padding: 0,
                                width: 24,
                                height: 24,
                              }}
                            />
                            <IconButton
                              icon="trash-can-outline"
                              size={18}
                              onPress={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(
                                  filteredHistory.indexOf(item)
                                );
                              }}
                              iconColor={
                                isDark
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.4)"
                              }
                              style={{
                                margin: 0,
                                padding: 0,
                                width: 24,
                                height: 24,
                              }}
                            />
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
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
                              {formatPipValue(item.pips)} pips
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Surface>
                  </React.Fragment>
                );
              })}

              {filteredHistory.length > 3 && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 8,
                    marginBottom: 8,
                    paddingVertical: 8,
                    backgroundColor: "rgba(98, 0, 238, 0.05)",
                    borderRadius: 8,
                    marginHorizontal: 16,
                    borderWidth: 1,
                    borderColor: "rgba(98, 0, 238, 0.2)",
                  }}
                  onPress={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: "#6200ee",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {isHistoryExpanded
                      ? `Show Less (${filteredHistory.length} items total)`
                      : `Show ${filteredHistory.length - 3} More Items...`}
                  </Text>
                  <Ionicons
                    name={isHistoryExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#6200ee"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              )}
            </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  divider: {
    marginVertical: 16,
  },
  swapButton: {
    marginHorizontal: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  resultsContainer: {
    marginTop: 15,
    marginBottom: 17,
  },
  resultActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    bottom: 95,
    marginBottom: -46,
  },
  resultCardContainer: {
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  priceDetail: {
    alignItems: "center",
    width: "40%",
  },
  directionIndicator: {
    position: "relative",
    width: 50,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  trendLine: {
    position: "absolute",
    height: 3,
    width: 40,
    borderRadius: 1.5,
  },
  pipResultContainer: {
    padding: 16,
    alignItems: "center",
  },
  resultLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  pipValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  directionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  pipScaleContainer: {
    width: "100%",
    marginTop: 4,
  },
  pipScaleTrack: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  pipScaleFill: {
    height: "100%",
    borderRadius: 3,
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
  infoContainer: {
    alignItems: "center",
    marginTop: 8,
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
  historyListContainer: {
    marginBottom: 16,
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
  advancedOptionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  advancedOptionsContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  decimalPlacesScrollContainer: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  decimalPlaceOption: {
    width: 45,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  decimalPlaceExampleContainer: {
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: "rgba(98, 0, 238, 0.05)",
    borderRadius: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(98, 0, 238, 0.2)",
  },
});
