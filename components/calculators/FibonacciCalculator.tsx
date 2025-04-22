import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Platform,
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
import { BlurView } from "expo-blur";
import { calculateFibonacciLevels } from "../../utils/calculators";
import { useTheme } from "../../contexts/ThemeContext";

const { width } = Dimensions.get("window");

// Storage key for calculator data
const STORAGE_KEY = "fibonacci_calculator_data";

export default function FibonacciCalculator() {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

  // State for inputs
  const [highPrice, setHighPrice] = useState("21");
  const [lowPrice, setLowPrice] = useState("15");
  const [trend, setTrend] = useState("uptrend");

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
    cardBackground: isDark
      ? "rgba(45, 45, 45, 0.75)"
      : "rgba(255, 255, 255, 0.75)",
    cardHeader: isDark ? "rgba(35, 35, 35, 0.9)" : "rgba(240, 240, 240, 0.9)",
    accent: "#6200ee",
    accentLight: isDark ? "rgba(98, 0, 238, 0.15)" : "rgba(98, 0, 238, 0.1)",
    text: isDark ? "#ffffff" : "#000000",
    textSecondary: isDark ? "#aaaaaa" : "#666666",
    border: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    inputBackground: isDark
      ? "rgba(30, 30, 30, 0.8)"
      : "rgba(255, 255, 255, 0.8)",
    error: "#e53935",
    levelKey: "#6200ee",
    levelNormal: isDark ? "rgba(68, 68, 68, 0.7)" : "rgba(221, 221, 221, 0.7)",
    levelCardBackground: isDark
      ? "rgba(40, 40, 40, 0.7)"
      : "rgba(250, 250, 250, 0.7)",
    levelCardBackgroundKey: isDark
      ? "rgba(98, 0, 238, 0.15)"
      : "rgba(98, 0, 238, 0.08)",
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
        setHighPrice(parsedData.highPrice || "21");
        setLowPrice(parsedData.lowPrice || "15");
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
    setHighPrice("21");
    setLowPrice("15");
    setTrend("uptrend");

    // Save reset values
    try {
      const dataToSave = {
        highPrice: "21",
        lowPrice: "15",
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
    const keyLevels = [0, 23.6, 38.2, 50, 61.8, 100, 161.8, 200, 261.8];
    const isKey = keyLevels.includes(level.level);

    return (
      <View
        key={`level-${index}`}
        style={[
          styles.levelCard,
          {
            backgroundColor: isKey
              ? colors.levelCardBackgroundKey
              : colors.levelCardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        {Platform.OS === "ios" && (
          <BlurView
            intensity={30}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={styles.levelRow}>
          <View
            style={[
              styles.levelBadge,
              {
                backgroundColor: isKey ? colors.accent : colors.levelNormal,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.levelBadgeText}>{level.level.toFixed(1)}%</Text>
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: isKey ? "bold" : "normal",
            }}
          >
            {formatPrice(level.price)}
          </Text>

          <TouchableOpacity
            onPress={() => copyToClipboard(level.price.toString())}
            style={styles.copyButton}
          >
            <Ionicons
              name="copy-outline"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const CardSection = ({ children, style }) => (
    <View style={[styles.cardWrapper, style]}>
      {Platform.OS === "ios" && (
        <BlurView
          intensity={20}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CardSection
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          }}
        >
          <View
            style={[styles.cardHeader, { backgroundColor: colors.cardHeader }]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color="#fff"
              />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Currency
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              High price
            </Text>
            <TextInput
              value={highPrice}
              onChangeText={(text) => handleNumericInput(text, setHighPrice)}
              keyboardType="numeric"
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground },
              ]}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.accent}
              textColor={colors.text}
              theme={{
                colors: {
                  background: colors.inputBackground,
                  onSurfaceVariant: colors.textSecondary,
                },
              }}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Low price
            </Text>
            <TextInput
              value={lowPrice}
              onChangeText={(text) => handleNumericInput(text, setLowPrice)}
              keyboardType="numeric"
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground },
              ]}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.accent}
              textColor={colors.text}
              theme={{
                colors: {
                  background: colors.inputBackground,
                  onSurfaceVariant: colors.textSecondary,
                },
              }}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
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
                  primary: colors.accent,
                  secondaryContainer: isDark
                    ? "rgba(50, 50, 50, 0.8)"
                    : "rgba(240, 240, 240, 0.8)",
                  onSecondaryContainer: colors.text,
                },
              }}
            />
          </View>
        </CardSection>

        <CardSection
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          }}
        >
          <View
            style={[styles.cardHeader, { backgroundColor: colors.cardHeader }]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="chart-line"
                size={20}
                color="#fff"
              />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Results
            </Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={calculateResults}
              iconColor={colors.text}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={{ marginTop: 10, color: colors.textSecondary }}>
                Calculating levels...
              </Text>
            </View>
          ) : (
            <View>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  Retracement Levels
                </Text>
              </View>

              <View style={styles.levelsContainer}>
                {retracements
                  .filter((level) => level.level >= 0 && level.level <= 100)
                  .map((level, index) => renderKeyLevelCard(level, index))}
              </View>

              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  Extension Levels
                </Text>
              </View>

              <View style={styles.levelsContainer}>
                {extensions
                  .filter((level) => level.level > 100)
                  .map((level, index) =>
                    renderKeyLevelCard(level, index + 100)
                  )}
              </View>

              <Text
                style={[styles.legendText, { color: colors.textSecondary }]}
              >
                Key Fibonacci levels highlighted in purple
              </Text>
            </View>
          )}
        </CardSection>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleResetAll}
          buttonColor={colors.error}
          icon="refresh"
          style={styles.resetButton}
        >
          Reset Calculator
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 5,
    paddingBottom: 80,
  },
  cardWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  inputSection: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 50,
  },
  segmentedButtons: {
    backgroundColor: "transparent",
    paddingBottom: 16,
  },
  resultsCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  levelsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  levelCard: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  levelBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 16,
    borderWidth: 1,
  },
  levelBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  copyButton: {
    marginLeft: "auto",
    padding: 4,
  },
  legendText: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 16,
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
