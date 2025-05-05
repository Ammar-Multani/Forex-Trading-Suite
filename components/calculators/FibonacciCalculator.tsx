import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  TextInput,
  Text,
  Divider,
  IconButton,
  SegmentedButtons,
  Surface,
  Button,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateFibonacciLevels } from "../../utils/calculators";
import { useTheme } from "../../contexts/ThemeContext";
import { brandColors } from "../../utils/theme";
import CalculatorCard from "../ui/CalculatorCard";
import BackButton from "../ui/BackButton";
import PageHeader from "../ui/PageHeader";

const { width } = Dimensions.get("window");

// Storage key for calculator data
const STORAGE_KEY = "fibonacci_calculator_data";

export default function FibonacciCalculator() {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

  // State for inputs
  const [highPrice, setHighPrice] = useState("0");
  const [lowPrice, setLowPrice] = useState("0");
  const [trend, setTrend] = useState("uptrend");

  // State for active tab
  const [activeTab, setActiveTab] = useState("retracement");

  // State for results
  const [retracements, setRetracements] = useState<
    Array<{ level: number; price: number }>
  >([]);
  const [extensions, setExtensions] = useState<
    Array<{ level: number; price: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State to track if data has been loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  // Define theme colors
  const colors = {
    background: isDark ? "#121212" : "#f5f5f5",
    cardBackground: isDark ? "#1e1e1e" : "#ffffff",
    cardHeader: isDark ? "#1a1a1a" : "#f0f0f0",
    accent: brandColors.accent,
    accentLight: isDark
      ? `rgba(${parseInt(brandColors.accent.slice(1, 3), 16)}, ${parseInt(
          brandColors.accent.slice(3, 5),
          16
        )}, ${parseInt(brandColors.accent.slice(5, 7), 16)}, 0.25)`
      : `rgba(${parseInt(brandColors.accent.slice(1, 3), 16)}, ${parseInt(
          brandColors.accent.slice(3, 5),
          16
        )}, ${parseInt(brandColors.accent.slice(5, 7), 16)}, 0.15)`,
    text: isDark ? "#ffffff" : "#000000",
    textSecondary: isDark ? "#aaaaaa" : "#666666",
    border: isDark ? "#444444" : "#dddddd",
    inputBackground: isDark ? "#1e1e1e" : "#ffffff",
    error: "#e53935",
    levelKey: brandColors.accent,
    levelNormal: isDark ? "#444444" : "#dddddd",
  };

  // Load saved calculator data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save calculator data when inputs change
  useEffect(() => {
    if (dataLoaded) {
      saveCalculatorData();
    }
  }, [highPrice, lowPrice, trend, dataLoaded]);

  // Calculate results when inputs change
  useEffect(() => {
    if (dataLoaded) {
      calculateResults();
    }
  }, [highPrice, lowPrice, trend, dataLoaded]);

  const calculateResults = () => {
    setIsLoading(true);

    // Simulate a brief calculation time
    setTimeout(() => {
      const high = parseFloat(highPrice) || 0;
      const low = parseFloat(lowPrice) || 0;
      const isUptrend = trend === "uptrend";

      if (high > 0 && low > 0) {
        const { retracements: retLevels, extensions: extLevels } =
          calculateFibonacciLevels(high, low, isUptrend);

        setRetracements(retLevels);
        setExtensions(extLevels);
      }

      setIsLoading(false);
      setRefreshing(false);
    }, 300);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedData();
    calculateResults();
  };

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setHighPrice(parsedData.highPrice || "0");
        setLowPrice(parsedData.lowPrice || "0");
        setTrend(parsedData.trend || "uptrend");
      }

      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading saved data:", error);
      setDataLoaded(true);
    }
  };

  const saveCalculatorData = async () => {
    try {
      const dataToSave = {
        highPrice,
        lowPrice,
        trend,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving calculator data:", error);
    }
  };

  const formatPrice = (price: number) => {
    // Format with 5 decimal places, but remove trailing zeros
    return price.toFixed(5).replace(/\.?0+$/, "");
  };

  const copyToClipboard = (text: string) => {
    // In a real app, you would use Clipboard.setString(text)
    console.log("Copied to clipboard:", text);
    // Show a toast or some feedback
  };

  const handleNumericInput = (
    text: string,
    setter: (value: string) => void
  ) => {
    // Allow only numeric input with decimal point
    const sanitized = text.replace(/[^0-9.]/g, "");
    setter(sanitized);
  };

  const handleResetAll = async () => {
    // Reset all values to defaults
    setHighPrice("0");
    setLowPrice("0");
    setTrend("uptrend");

    // Save reset values
    try {
      const dataToSave = {
        highPrice: "0",
        lowPrice: "0",
        trend: "uptrend",
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving reset data:", error);
    }

    // Recalculate with default values
    setTimeout(() => {
      calculateResults();
    }, 100);
  };

  const renderKeyLevelCard = (
    level: { level: number; price: number },
    index: number
  ) => {
    const keyLevels = [
      23.6, 38.2, 50, 61.8, 78.6, 100, 123.6, 138.2, 150, 161.8, 200, 261.8,
    ];
    // Use approximate comparison for floating point numbers
    const isKey = keyLevels.some(
      (keyLevel) => Math.abs(level.level - keyLevel) < 0.01
    );

    return (
      <Surface
        key={`level-${index}`}
        style={[
          styles.levelCard,
          {
            backgroundColor: isDark
              ? isKey
                ? "rgba(40, 40, 45, 0.9)"
                : "rgba(30, 30, 35, 0.8)"
              : isKey
              ? "rgba(250, 250, 255, 0.9)"
              : "rgba(245, 245, 250, 0.8)",
            borderWidth: 1,
            borderColor: isDark
              ? isKey
                ? "rgba(80, 80, 90, 0.6)"
                : "rgba(60, 60, 70, 0.4)"
              : isKey
              ? "rgba(200, 200, 210, 0.8)"
              : "rgba(220, 220, 230, 0.6)",
            borderLeftWidth: isKey ? 3 : 1,
            borderLeftColor: isKey
              ? `rgba(${parseInt(
                  brandColors.accent.slice(1, 3),
                  16
                )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
                  brandColors.accent.slice(5, 7),
                  16
                )}, ${isDark ? 0.4 : 0.6})`
              : undefined,
          },
        ]}
        elevation={0}
      >
        <View style={styles.levelRow}>
          <View
            style={[
              styles.levelBadge,
              {
                backgroundColor: isDark
                  ? isKey
                    ? "rgba(60, 60, 70, 0.95)"
                    : "rgba(50, 50, 60, 0.8)"
                  : isKey
                  ? "rgba(230, 230, 240, 0.95)"
                  : "rgba(220, 220, 230, 0.8)",
                borderWidth: 1,
                borderColor: isDark
                  ? isKey
                    ? "rgba(80, 80, 90, 0.4)"
                    : "rgba(70, 70, 80, 0.3)"
                  : isKey
                  ? "rgba(200, 200, 210, 0.6)"
                  : "rgba(210, 210, 220, 0.4)",
              },
            ]}
          >
            <Text
              style={[
                styles.levelBadgeText,
                {
                  color: isDark
                    ? isKey
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.75)"
                    : isKey
                    ? "rgba(30, 30, 40, 0.9)"
                    : "rgba(40, 40, 50, 0.75)",
                  fontWeight: isKey ? "bold" : "500",
                },
              ]}
            >
              {level.level.toFixed(1)}%
            </Text>
          </View>

          <Text
            style={{
              color: isDark
                ? isKey
                  ? "rgba(255, 255, 255, 0.95)"
                  : "rgba(255, 255, 255, 0.8)"
                : isKey
                ? "rgba(30, 30, 40, 0.95)"
                : "rgba(50, 50, 60, 0.8)",
              fontSize: 16,
              fontWeight: isKey ? "600" : "400",
            }}
          >
            {formatPrice(level.price)}
          </Text>

          <TouchableOpacity
            onPress={() => copyToClipboard(level.price.toString())}
            style={[
              styles.copyButton,
              {
                backgroundColor: isDark
                  ? "rgba(50, 50, 60, 0.4)"
                  : "rgba(230, 230, 240, 0.5)",
              },
            ]}
          >
            <Ionicons
              name="copy-outline"
              size={18}
              color={
                isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(50, 50, 60, 0.6)"
              }
            />
          </TouchableOpacity>
        </View>
      </Surface>
    );
  };

  const renderInputSection = () => (
    <View style={styles.inputContent}>
      <View style={styles.inputRow}>
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: brandColors.accent }]}>
            High price
          </Text>
          <TextInput
            value={highPrice}
            onChangeText={(text) => handleNumericInput(text, setHighPrice)}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor={`rgba(${parseInt(
              brandColors.accent.slice(1, 3),
              16
            )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
              brandColors.accent.slice(5, 7),
              16
            )}, 0.3)`}
            activeOutlineColor={brandColors.accent}
            textColor={isDark ? "#ffffff" : "#000000"}
            theme={{
              colors: {
                background: isDark
                  ? "rgba(30, 30, 30, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
                onSurfaceVariant: `rgba(${parseInt(
                  brandColors.accent.slice(1, 3),
                  16
                )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
                  brandColors.accent.slice(5, 7),
                  16
                )}, 0.7)`,
              },
            }}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: brandColors.accent }]}>
            Low price
          </Text>
          <TextInput
            value={lowPrice}
            onChangeText={(text) => handleNumericInput(text, setLowPrice)}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor={`rgba(${parseInt(
              brandColors.accent.slice(1, 3),
              16
            )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
              brandColors.accent.slice(5, 7),
              16
            )}, 0.3)`}
            activeOutlineColor={brandColors.accent}
            textColor={isDark ? "#ffffff" : "#000000"}
            theme={{
              colors: {
                background: isDark
                  ? "rgba(30, 30, 30, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
                onSurfaceVariant: `rgba(${parseInt(
                  brandColors.accent.slice(1, 3),
                  16
                )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
                  brandColors.accent.slice(5, 7),
                  16
                )}, 0.7)`,
              },
            }}
          />
        </View>
      </View>

      <View style={styles.trendSection}>
        <Text style={[styles.inputLabel, { color: brandColors.accent }]}>
          Trend Direction
        </Text>
        <SegmentedButtons
          value={trend}
          onValueChange={setTrend}
          buttons={[
            {
              value: "uptrend",
              label: "Up",
              icon: "arrow-up",
            },
            {
              value: "downtrend",
              label: "Short",
              icon: "arrow-down",
            },
          ]}
          style={styles.segmentedButtons}
          theme={{
            colors: {
              primary: brandColors.accent,
              secondaryContainer: isDark
                ? "rgba(60, 60, 60, 0.8)"
                : "rgba(240, 240, 240, 0.8)",
              onSecondaryContainer: isDark ? "#ffffff" : "#000000",
            },
          }}
        />
      </View>
    </View>
  );

  const renderResultsSection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.accent} />
          <Text style={{ marginTop: 10, color: colors.textSecondary }}>
            Calculating levels...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContent}>
        <View style={styles.resultCategoriesContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("retracement")}
            style={[
              styles.categoryTab,
              {
                backgroundColor: `rgba(${parseInt(
                  brandColors.accent.slice(1, 3),
                  16
                )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
                  brandColors.accent.slice(5, 7),
                  16
                )}, 0.08)`,
                borderColor: `rgba(${parseInt(
                  brandColors.accent.slice(1, 3),
                  16
                )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
                  brandColors.accent.slice(5, 7),
                  16
                )}, 0.1)`,
              },
              activeTab === "retracement"
                ? {
                    backgroundColor: `rgba(${parseInt(
                      brandColors.accent.slice(1, 3),
                      16
                    )}, ${parseInt(
                      brandColors.accent.slice(3, 5),
                      16
                    )}, ${parseInt(brandColors.accent.slice(5, 7), 16)}, 0.2)`,
                    borderColor: `rgba(${parseInt(
                      brandColors.accent.slice(1, 3),
                      16
                    )}, ${parseInt(
                      brandColors.accent.slice(3, 5),
                      16
                    )}, ${parseInt(brandColors.accent.slice(5, 7), 16)}, 0.3)`,
                  }
                : {},
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-bottom-right"
              size={16}
              color={brandColors.accent}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.categoryTitle, { color: brandColors.accent }]}>
              Retracement
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("extension")}
            style={[
              styles.categoryTab,
              {
                backgroundColor: `rgba(${parseInt(
                  brandColors.accent.slice(1, 3),
                  16
                )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
                  brandColors.accent.slice(5, 7),
                  16
                )}, 0.08)`,
                borderColor: `rgba(${parseInt(
                  brandColors.accent.slice(1, 3),
                  16
                )}, ${parseInt(brandColors.accent.slice(3, 5), 16)}, ${parseInt(
                  brandColors.accent.slice(5, 7),
                  16
                )}, 0.1)`,
              },
              activeTab === "extension"
                ? {
                    backgroundColor: `rgba(${parseInt(
                      brandColors.accent.slice(1, 3),
                      16
                    )}, ${parseInt(
                      brandColors.accent.slice(3, 5),
                      16
                    )}, ${parseInt(brandColors.accent.slice(5, 7), 16)}, 0.2)`,
                    borderColor: `rgba(${parseInt(
                      brandColors.accent.slice(1, 3),
                      16
                    )}, ${parseInt(
                      brandColors.accent.slice(3, 5),
                      16
                    )}, ${parseInt(brandColors.accent.slice(5, 7), 16)}, 0.3)`,
                  }
                : {},
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-top-right"
              size={16}
              color={brandColors.accent}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.categoryTitle, { color: brandColors.accent }]}>
              Extension
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.levelsGrid}>
          {activeTab === "retracement" &&
            [...retracements]
              .filter((level) => level.level >= 0 && level.level <= 100)
              .sort((a, b) =>
                // For uptrend, sort by level ascending (0.236 to 0.786)
                // For downtrend, sort by level descending (0.786 to 0.236)
                trend === "uptrend" ? a.level - b.level : b.level - a.level
              )
              .map((level, index) => renderKeyLevelCard(level, index))}

          {activeTab === "extension" &&
            [...extensions]
              .sort((a, b) =>
                // For uptrend, sort by level descending (2.618 to 0.236)
                // For downtrend, sort by level ascending (0.236 to 2.618)
                trend === "uptrend" ? b.level - a.level : a.level - b.level
              )
              .map((level, index) => renderKeyLevelCard(level, index + 100))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CalculatorCard
          title="Price Input"
          icon="chart-bell-curve"
          iconPack="MaterialCommunity"
          elevation={0}
          style={{
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(80, 80, 90, 0.5)"
              : "rgba(220, 220, 230, 0.8)",
            borderRadius: 16,
            marginBottom: 16,
            overflow: "hidden",
            backgroundColor: isDark
              ? "rgba(30, 30, 35, 0.95)"
              : "rgba(250, 250, 255, 0.95)",
          }}
          contentStyle={styles.cardContent}
        >
          {renderInputSection()}
        </CalculatorCard>

        <CalculatorCard
          title="Price Levels"
          icon="chart-line"
          iconPack="MaterialCommunity"
          onRefresh={calculateResults}
          elevation={0}
          style={{
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(80, 80, 90, 0.5)"
              : "rgba(220, 220, 230, 0.8)",
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: isDark
              ? "rgba(30, 30, 35, 0.95)"
              : "rgba(250, 250, 255, 0.95)",
          }}
          contentStyle={styles.cardContent}
        >
          {renderResultsSection()}
        </CalculatorCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    padding: 5,
    paddingBottom: 80,
    paddingTop: 16,
  },
  cardContent: {
    padding: 0,
  },
  inputContent: {
    padding: 16,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputSection: {
    flex: 1,
    marginHorizontal: 6,
  },
  trendSection: {
    marginHorizontal: 6,
    paddingBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    backgroundColor: "transparent",
    fontSize: 16,
  },
  segmentedButtons: {
    backgroundColor: "transparent",
  },
  resultsContent: {
    paddingVertical: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
  },
  headerDivider: {
    height: 3,
    width: 60,
    backgroundColor: "#8A2BE2",
    marginTop: 8,
    borderRadius: 2,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resultCategoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 12,
    borderRadius: 30,
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: "rgba(138, 43, 226, 0.2)",
    borderColor: "rgba(138, 43, 226, 0.3)",
  },
  categoryTitle: {
    fontWeight: "600",
    fontSize: 14,
  },
  levelsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  footerInfo: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "rgba(150, 150, 150, 0.8)",
  },
  levelCard: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  levelBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  levelBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  copyButton: {
    marginLeft: "auto",
    padding: 6,
    backgroundColor: "rgba(200, 200, 200, 0.15)",
    borderRadius: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  resetButton: {
    borderRadius: 8,
  },
});
