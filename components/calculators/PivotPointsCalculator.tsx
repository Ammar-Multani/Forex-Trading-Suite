import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  Modal,
  FlatList,
  Animated,
} from "react-native";
import {
  TextInput,
  Text,
  Divider,
  IconButton,
  Chip,
  SegmentedButtons,
  Card,
  Button,
  Surface,
  Menu,
  Portal,
  Dialog,
} from "react-native-paper";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { calculatePivotPoints } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import { useTheme } from "../../contexts/ThemeContext";
import PageHeader from "../ui/PageHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get the screen width for animations
const { width } = Dimensions.get("window");

type PivotMethod = "standard" | "woodie" | "camarilla" | "demark" | "fibonacci";

// Method descriptions for information
const METHOD_INFO = {
  standard: "Classic formula using (H+L+C)/3 as the pivot point.",
  woodie: "Gives more weight to the closing price with (H+L+2C)/4.",
  camarilla: "Uses more levels with tighter ranges for day trading.",
  demark: "Based on whether close is higher or lower than open price.",
  fibonacci:
    "Uses Fibonacci ratios (0.382, 0.618, 1.000, 1.618) to calculate support and resistance levels.",
};

export default function PivotPointsCalculator() {
  const { isDark } = useTheme();

  // State for inputs
  const [highPrice, setHighPrice] = useState("1.2000");
  const [lowPrice, setLowPrice] = useState("1.1900");
  const [closePrice, setClosePrice] = useState("1.1950");
  const [openPrice, setOpenPrice] = useState("1.1920");
  const [method, setMethod] = useState<PivotMethod>("standard");
  const [showMethodInfo, setShowMethodInfo] = useState(false);

  // State for results
  const [pivot, setPivot] = useState(0);
  const [resistance, setResistance] = useState<number[]>([0, 0, 0]);
  const [support, setSupport] = useState<number[]>([0, 0, 0]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // State for filter and organization
  const [historyFilterOpen, setHistoryFilterOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "favorites">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);

  // History of calculations
  const [history, setHistory] = useState<
    Array<{
      method: PivotMethod;
      high: string;
      low: string;
      close: string;
      pivot: number;
      timestamp: Date;
      isFavorite?: boolean;
    }>
  >([]);

  // Add a state for expanded history
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // New state for dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Load history from storage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const savedHistory = await AsyncStorage.getItem("pivotPointsHistory");
      if (savedHistory) {
        // Parse the saved history and convert timestamp strings back to Date objects
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      // Show error alert
      Alert.alert(
        "Error",
        "Failed to load calculation history. Your previous calculations may not be available.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save history to storage
  const saveHistoryToStorage = async (newHistory: any[]) => {
    try {
      await AsyncStorage.setItem(
        "pivotPointsHistory",
        JSON.stringify(newHistory)
      );
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  };

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, openPrice, method]);

  const calculateResults = useCallback(() => {
    try {
      setIsCalculating(true);
      setCalculationError(null);

      const high = parseFloat(highPrice) || 0;
      const low = parseFloat(lowPrice) || 0;
      const close = parseFloat(closePrice) || 0;
      const open = parseFloat(openPrice) || 0;

      // Validate inputs
      if (high <= 0 || low <= 0 || close <= 0) {
        return; // Silent return for empty/invalid inputs
      }

      if (high < low) {
        setCalculationError("High price must be greater than low price");
        return;
      }

      const result = calculatePivotPoints(high, low, close, method, open);

      setPivot(result.pivot);
      setResistance(result.resistance);
      setSupport(result.support);
    } catch (error) {
      console.error("Error calculating pivot points:", error);
      setCalculationError(
        "Failed to calculate pivot points. Please check your inputs."
      );
    } finally {
      setIsCalculating(false);
    }
  }, [highPrice, lowPrice, closePrice, openPrice, method]);

  const saveToHistory = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;

    if (high > 0 && low > 0 && close > 0) {
      const newEntry = {
        method,
        high: highPrice,
        low: lowPrice,
        close: closePrice,
        pivot,
        timestamp: new Date(),
        isFavorite: false,
      };

      // Check if this calculation is already in history
      const exists = history.some(
        (item) =>
          item.method === newEntry.method &&
          item.high === newEntry.high &&
          item.low === newEntry.low &&
          item.close === newEntry.close
      );

      if (!exists) {
        const newHistory = [newEntry, ...history].slice(0, 20); // Keep last 20 entries
        setHistory(newHistory);
        saveHistoryToStorage(newHistory);

        // Show success message
        Alert.alert("Saved", "Calculation saved to history", [{ text: "OK" }], {
          cancelable: true,
        });
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
      // Show invalid input message
      Alert.alert(
        "Invalid Input",
        "Please enter valid price values before saving",
        [{ text: "OK" }],
        { cancelable: true }
      );
    }
  };

  const clearHistory = () => {
    // Show confirmation before clearing
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all calculation history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setHistory([]);
            saveHistoryToStorage([]);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatPrice = (price: number) => {
    // Format with 5 decimal places, but remove trailing zeros
    return price.toFixed(5).replace(/\.?0+$/, "");
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

  const copyToClipboard = (text: string) => {
    // In a real app, you would use Clipboard.setString(text)
    console.log("Copied to clipboard:", text);
  };

  const getMethodLabel = (methodName: PivotMethod) => {
    switch (methodName) {
      case "standard":
        return "Standard";
      case "woodie":
        return "Woodie's";
      case "camarilla":
        return "Camarilla";
      case "demark":
        return "DeMark";
      case "fibonacci":
        return "Fibonacci";
      default:
        return methodName;
    }
  };

  const toggleFavorite = (index: number) => {
    const newHistory = [...history];
    newHistory[index] = {
      ...newHistory[index],
      isFavorite: !newHistory[index].isFavorite,
    };
    setHistory(newHistory);
    saveHistoryToStorage(newHistory);
  };

  const deleteHistoryItem = (index: number) => {
    // Show confirmation before deleting
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this calculation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const newHistory = [...history];
            newHistory.splice(index, 1);
            setHistory(newHistory);
            saveHistoryToStorage(newHistory);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Load a saved calculation
  const loadCalculation = (item: any) => {
    setMethod(item.method);
    setHighPrice(item.high);
    setLowPrice(item.low);
    setClosePrice(item.close);

    // Scroll to top of calculator
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const scrollViewRef = React.useRef<ScrollView>(null);

  // Filter history based on selected filter and expansion state
  const filteredHistory =
    historyFilter === "favorites"
      ? history.filter((item) => item.isFavorite)
      : history;

  // Get the history to display based on expansion state
  const displayedHistory = isHistoryExpanded
    ? filteredHistory
    : filteredHistory.slice(0, 3); // Show only first 3 items when collapsed

  // New function to share calculation
  const shareCalculation = async (item: any) => {
    try {
      const method = getMethodLabel(item.method);
      const message = `Forex Pivot Points (${method})
High: ${item.high}
Low: ${item.low} 
Close: ${item.close}
Pivot: ${formatPrice(item.pivot)}
R1: ${formatPrice(resistance[0])}
S1: ${formatPrice(support[0])}
`;

      await Share.share({
        message,
        title: "Pivot Points Calculation",
      });
    } catch (error) {
      console.error("Error sharing calculation:", error);
      Alert.alert("Error", "Failed to share calculation");
    }
  };

  // New function to share the current calculation
  const shareCurrentCalculation = async () => {
    try {
      const message = `Forex Pivot Points (${getMethodLabel(method)})
High: ${highPrice}
Low: ${lowPrice} 
Close: ${closePrice}
Pivot: ${formatPrice(pivot)}
R1: ${formatPrice(resistance[0])}
S1: ${formatPrice(support[0])}
R2: ${formatPrice(resistance[1])}
S2: ${formatPrice(support[1])}
R3: ${formatPrice(resistance[2])}
S3: ${formatPrice(support[2])}
`;

      await Share.share({
        message,
        title: "Pivot Points Calculation",
      });
    } catch (error) {
      console.error("Error sharing calculation:", error);
      Alert.alert("Error", "Failed to share calculation");
    }
  };

  // Measure dropdown button position
  const measureDropdownButton = () => {
    if (dropdownButtonRef.current) {
      dropdownButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height,
          left: pageX,
          width: width,
        });
      });
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      measureDropdownButton();
      setIsDropdownOpen(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsDropdownOpen(false);
      });
    }
  };

  const closeDropdown = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDropdownOpen(false);
    });
  };

  const selectMethod = (selectedMethod: PivotMethod) => {
    setMethod(selectedMethod);
    closeDropdown();
  };

  // Animations
  const dropdownOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const dropdownScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  const dropdownTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  // Available methods
  const methodOptions: PivotMethod[] = [
    "standard",
    "woodie",
    "camarilla",
    "demark",
    "fibonacci",
  ];

  // Render dropdown item
  const renderDropdownItem = ({ item }: { item: PivotMethod }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        item === method && {
          backgroundColor: isDark
            ? "rgba(98, 0, 238, 0.2)"
            : "rgba(98, 0, 238, 0.1)",
        },
      ]}
      onPress={() => selectMethod(item)}
    >
      <Text
        style={[
          styles.dropdownItemText,
          { color: isDark ? "#fff" : "#000" },
          item === method && {
            color: "#6200ee",
            fontWeight: "bold",
          },
        ]}
      >
        {getMethodLabel(item)}
      </Text>
      {item === method && (
        <MaterialIcons name="check" color="#6200ee" size={18} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PageHeader
        title="Pivot Points Calculator"
        subtitle="Calculate support and resistance levels for trading"
      />
      <CalculatorCard title="Calculate Pivot Points">
        <ScrollView style={styles.scrollView} ref={scrollViewRef}>
          <View style={styles.methodSelectorContainer}>
            <View style={styles.methodHeader}>
              <Text
                variant="titleSmall"
                style={{
                  marginBottom: 0,
                  color: isDark ? "#aaa" : "#666",
                  fontWeight: "600",
                  left: 5,
                }}
              >
                Calculation Method
              </Text>
              <IconButton
                icon="information-outline"
                size={20}
                onPress={() => setShowMethodInfo(!showMethodInfo)}
                iconColor={isDark ? "#fff" : "#000"}
              />
            </View>

            <View style={styles.inputsContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  label="High"
                  value={highPrice}
                  onChangeText={setHighPrice}
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

                <TextInput
                  label="Low"
                  value={lowPrice}
                  onChangeText={setLowPrice}
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1, marginLeft: 12 }]}
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

              <View style={styles.inputRow}>
                <TextInput
                  label="Close"
                  value={closePrice}
                  onChangeText={setClosePrice}
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

                {method === "demark" && (
                  <TextInput
                    label="Open"
                    value={openPrice}
                    onChangeText={setOpenPrice}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1, marginLeft: 12 }]}
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
              </View>
            </View>

            <View style={styles.dropdownContainer}>
              <Text
                variant="titleSmall"
                style={{
                  marginBottom: 8,
                  left: 5,
                  color: isDark ? "#aaa" : "#666",
                  fontWeight: "600",
                }}
              >
                Pivot Points
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.dropdownButton,
                  {
                    backgroundColor: isDark ? "#1E1E1E" : "#f5f5f5",
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  },
                ]}
                onPress={toggleDropdown}
                ref={dropdownButtonRef}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {getMethodLabel(method)}
                </Text>
                <MaterialIcons
                  name={
                    isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  color="#6200ee"
                  size={24}
                />
              </TouchableOpacity>

              {isDropdownOpen && (
                <Modal
                  visible={isDropdownOpen}
                  transparent={true}
                  animationType="none"
                  statusBarTranslucent={true}
                  onRequestClose={closeDropdown}
                >
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={closeDropdown}
                  >
                    <Animated.View
                      style={[
                        styles.dropdownListContainer,
                        {
                          backgroundColor: isDark ? "#1E1E1E" : "#fff",
                          borderColor: isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          width: dropdownPosition.width,
                          opacity: dropdownOpacity,
                          transform: [
                            { scale: dropdownScale },
                            { translateY: dropdownTranslateY },
                          ],
                        },
                      ]}
                    >
                      <FlatList
                        data={methodOptions}
                        renderItem={renderDropdownItem}
                        keyExtractor={(item) => item}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.dropdownList}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>

            {showMethodInfo && (
              <View
                style={[
                  styles.methodInfoContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                    borderLeftWidth: 3,
                    borderLeftColor: "#6200ee",
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  {METHOD_INFO[method]}
                </Text>
              </View>
            )}
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
            <View style={styles.resultsHeader}>
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
                  disabled={isCalculating}
                />
                <IconButton
                  icon="share-variant"
                  size={20}
                  onPress={shareCurrentCalculation}
                  iconColor={isDark ? "#fff" : "#000"}
                  disabled={isCalculating || pivot === 0}
                />
                <IconButton
                  icon="content-save"
                  size={20}
                  onPress={saveToHistory}
                  iconColor={isDark ? "#fff" : "#000"}
                  disabled={isCalculating || pivot === 0}
                />
              </View>
            </View>

            {calculationError && (
              <View style={styles.errorContainer}>
                <Text style={{ color: "#F44336", textAlign: "center" }}>
                  {calculationError}
                </Text>
              </View>
            )}

            {isCalculating ? (
              <View style={styles.loadingContainer}>
                <Text
                  style={{
                    color: isDark ? "#aaa" : "#666",
                    textAlign: "center",
                  }}
                >
                  Calculating...
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={[
                    styles.pivotContainer,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.05)",
                      borderWidth: 0.5,
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    },
                  ]}
                >
                  <Text
                    variant="bodyMedium"
                    style={{ color: isDark ? "#aaa" : "#666" }}
                  >
                    Pivot Point (PP)
                  </Text>
                  <View style={styles.pivotValueContainer}>
                    <Text
                      variant="headlineSmall"
                      style={{ color: "#FFC107", fontWeight: "bold" }}
                    >
                      {formatPrice(pivot)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(pivot.toString())}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color={isDark ? "#aaa" : "#666"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.levelsContainer}>
                  <Surface
                    style={[
                      styles.levelCard,
                      {
                        backgroundColor: isDark ? "#1E1E1E" : "#f5f5f5",
                        borderRadius: 12,
                        borderWidth: 0.5,
                        borderColor: isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                      },
                    ]}
                    elevation={0}
                  >
                    <View style={styles.levelCardContent}>
                      <Text
                        variant="titleMedium"
                        style={{
                          color: "#F44336",
                          marginBottom: 5,
                          textAlign: "center",
                        }}
                      >
                        Resistance
                      </Text>
                      <View style={styles.levelsList}>
                        {resistance.map(
                          (level, index) =>
                            level !== 0 && (
                              <View
                                key={`r${index + 1}`}
                                style={[
                                  styles.levelRow,
                                  {
                                    borderBottomColor: isDark
                                      ? "rgba(255, 255, 255, 0.05)"
                                      : "rgba(0, 0, 0, 0.05)",
                                  },
                                ]}
                              >
                                <Text
                                  variant="bodyMedium"
                                  style={{
                                    color: isDark ? "#fff" : "#000",
                                    fontWeight: "bold",
                                  }}
                                >
                                  R{resistance.length - index}
                                </Text>
                                <View style={styles.levelValueContainer}>
                                  <Text
                                    variant="bodyLarge"
                                    style={{
                                      color: "#F44336",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {formatPrice(level)}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() =>
                                      copyToClipboard(level.toString())
                                    }
                                  >
                                    <Ionicons
                                      name="copy-outline"
                                      size={16}
                                      color={isDark ? "#aaa" : "#666"}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )
                        )}
                      </View>
                    </View>
                  </Surface>

                  <Surface
                    style={[
                      styles.levelCard,
                      {
                        backgroundColor: isDark ? "#1E1E1E" : "#f5f5f5",
                        borderRadius: 12,
                        borderWidth: 0.5,
                        borderColor: isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                      },
                    ]}
                    elevation={0}
                  >
                    <View style={styles.levelCardContent}>
                      <Text
                        variant="titleMedium"
                        style={{
                          color: "#4CAF50",
                          marginBottom: 5,
                          textAlign: "center",
                        }}
                      >
                        Support
                      </Text>
                      <View style={styles.levelsList}>
                        {support.map(
                          (level, index) =>
                            level !== 0 && (
                              <View
                                key={`s${index + 1}`}
                                style={[
                                  styles.levelRow,
                                  {
                                    borderBottomColor: isDark
                                      ? "rgba(255, 255, 255, 0.05)"
                                      : "rgba(0, 0, 0, 0.05)",
                                  },
                                ]}
                              >
                                <Text
                                  variant="bodyMedium"
                                  style={{
                                    color: isDark ? "#fff" : "#000",
                                    fontWeight: "bold",
                                  }}
                                >
                                  S{index + 1}
                                </Text>
                                <View style={styles.levelValueContainer}>
                                  <Text
                                    variant="bodyLarge"
                                    style={{
                                      color: "#4CAF50",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {formatPrice(level)}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() =>
                                      copyToClipboard(level.toString())
                                    }
                                  >
                                    <Ionicons
                                      name="copy-outline"
                                      size={16}
                                      color={isDark ? "#aaa" : "#666"}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )
                        )}
                      </View>
                    </View>
                  </Surface>
                </View>

                <View style={styles.infoContainer}>
                  <Chip
                    icon="information"
                    mode="outlined"
                    style={{ borderColor: isDark ? "#444" : "#ddd" }}
                    textStyle={{ color: isDark ? "#fff" : "#000" }}
                  >
                    Tap any value to copy to clipboard
                  </Chip>
                </View>
              </>
            )}
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
                    borderColor: "lightgrey",
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
                  disabled={history.length === 0}
                >
                  Clear
                </Button>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.emptyHistory}>
                <Text style={{ color: isDark ? "#aaa" : "#666" }}>
                  Loading history...
                </Text>
              </View>
            ) : filteredHistory.length > 0 ? (
              <View style={styles.historyListContainer}>
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
                            styles.historyDateHeader,
                            {
                              color: isDark
                                ? "rgba(255,255,255,0.7)"
                                : "rgba(0,0,0,0.6)",
                              paddingBottom: 12,
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
                            marginBottom: 6,
                          },
                        ]}
                        elevation={0}
                      >
                        <TouchableOpacity
                          style={styles.historyItemTouchable}
                          onPress={() => loadCalculation(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.historyItemLeft}>
                            <View style={styles.historyItemTopRow}>
                              <Text
                                variant="bodyMedium"
                                style={[
                                  styles.historyItemMethod,
                                  { color: isDark ? "#fff" : "#000" },
                                ]}
                              >
                                {getMethodLabel(item.method)}
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
                                H: {item.high} L: {item.low} C: {item.close}
                              </Text>
                              <Text
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.5)"
                                    : "rgba(0,0,0,0.4)",
                                  fontSize: 10,
                                  paddingLeft: 5,
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
                                style={styles.actionButton}
                              />
                              <IconButton
                                icon="share-variant"
                                size={18}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  shareCalculation(item);
                                }}
                                iconColor={
                                  isDark
                                    ? "rgba(255,255,255,0.5)"
                                    : "rgba(0,0,0,0.4)"
                                }
                                style={styles.actionButton}
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
                                style={styles.actionButton}
                              />
                            </View>

                            <View style={styles.pivotDisplay}>
                              <Text
                                variant="bodyMedium"
                                style={{
                                  color: "#FFC107",
                                  fontWeight: "bold",
                                }}
                              >
                                PP: {formatPrice(item.pivot)}
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
                    style={styles.showMoreButton}
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
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.5)",
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
  methodSelectorContainer: {
    marginBottom: 16,
  },
  methodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  segmentedButtons: {
    marginBottom: 8,
    height: 40,
  },
  methodInfoContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  inputsContainer: {
    paddingTop: 6,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  divider: {
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: "row",
  },
  pivotContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  pivotValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  levelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  levelCard: {
    flex: 1,
    overflow: "hidden",
  },
  levelCardContent: {
    padding: 12,
  },
  levelsList: {
    gap: 8,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  levelValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  historyItemMethod: {
    fontWeight: "600",
    marginBottom: 2,
  },
  historyItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
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
  pivotDisplay: {
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
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#FFEBEB",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  loadingContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#EBF5FF",
    borderWidth: 1,
    borderColor: "#6200ee",
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
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  dropdownListContainer: {
    position: "absolute",
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: 300,
    zIndex: 1001,
  },
  dropdownList: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    padding: 0,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
  },
});
