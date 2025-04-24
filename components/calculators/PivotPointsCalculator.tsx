import React, { useState, useEffect, useCallback } from "react";
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
  Chip,
  SegmentedButtons,
  Card,
  Button,
  Surface,
  Menu,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { calculatePivotPoints } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import { useTheme } from "../../contexts/ThemeContext";
import PageHeader from "../ui/PageHeader";
import { LinearGradient } from "expo-linear-gradient";

// Get the screen width for animations
const { width } = Dimensions.get("window");

type PivotMethod = "standard" | "woodie" | "camarilla" | "demark";

// Method descriptions for information
const METHOD_INFO = {
  standard: "Classic formula using (H+L+C)/3 as the pivot point.",
  woodie: "Gives more weight to the closing price with (H+L+2C)/4.",
  camarilla: "Uses more levels with tighter ranges for day trading.",
  demark: "Based on whether close is higher or lower than open price.",
};

export default function PivotPointsCalculator() {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

  // State for inputs
  const [highPrice, setHighPrice] = useState("1.2000");
  const [lowPrice, setLowPrice] = useState("1.1900");
  const [closePrice, setClosePrice] = useState("1.1950");
  const [openPrice, setOpenPrice] = useState("1.1920");
  const [method, setMethod] = useState<PivotMethod>("standard");
  const [showMethodInfo, setShowMethodInfo] = useState(false);

  // Define theme colors for 2025 design
  const colors = {
    primary: "#6200ee",
    secondary: "#03DAC6",
    error: "#CF6679",
    accent: "#8F44FD",
    accentLight: isDark
      ? "rgba(143, 68, 253, 0.15)"
      : "rgba(143, 68, 253, 0.08)",
    success: "#00C853",
    warning: "#FFD600",
    surface: isDark ? "#121212" : "#FFFFFF",
    surfaceVariant: isDark ? "#1E1E1E" : "#F5F5F5",
    surfaceElevated: isDark ? "#242424" : "#FFFFFF",
    cardGradient: isDark ? ["#1E1E1E", "#242424"] : ["#FFFFFF", "#F5F5F5"],
    text: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
    textTertiary: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.38)",
    border: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
    divider: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
  };

  // State for results
  const [pivot, setPivot] = useState(0);
  const [resistance, setResistance] = useState<number[]>([0, 0, 0, 0]);
  const [support, setSupport] = useState<number[]>([0, 0, 0, 0]);

  // State for filter and organization
  const [historyFilterOpen, setHistoryFilterOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "favorites">(
    "all"
  );

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

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, openPrice, method]);

  const calculateResults = useCallback(() => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;
    const open = parseFloat(openPrice) || 0;

    if (high > 0 && low > 0 && close > 0) {
      const result = calculatePivotPoints(high, low, close, method, open);

      setPivot(result.pivot);
      setResistance(result.resistance);
      setSupport(result.support);

      // Add to history (only if values are valid)
      if (result.pivot > 0) {
        const newEntry = {
          method,
          high: highPrice,
          low: lowPrice,
          close: closePrice,
          pivot: result.pivot,
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
          setHistory((prev) => [newEntry, ...prev].slice(0, 10)); // Keep last 10 entries
        }
      }
    }
  }, [highPrice, lowPrice, closePrice, openPrice, method, history]);

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
        setHistory((prev) => [newEntry, ...prev].slice(0, 10)); // Keep last 10 entries
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
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
    // Show a toast or some feedback
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
      default:
        return methodName;
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

  const deleteHistoryItem = (index: number) => {
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory.splice(index, 1);
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
        title="Pivot Points Calculator"
        subtitle="Calculate support and resistance levels for trading"
      />
      <CalculatorCard title="Calculate Pivot Points">
        <ScrollView style={styles.scrollView}>
          <View style={styles.methodSelectorContainer}>
            <View style={styles.methodHeader}>
              <Text
                variant="labelLarge"
                style={{
                  color: colors.textSecondary,
                  letterSpacing: 0.5,
                }}
              >
                CALCULATION METHOD
              </Text>
              <IconButton
                icon="information-outline"
                size={20}
                onPress={() => setShowMethodInfo(!showMethodInfo)}
                iconColor={colors.accent}
                style={{
                  backgroundColor: colors.accentLight,
                  borderRadius: 12,
                }}
              />
            </View>

            <View style={styles.methodButtonsContainer}>
              {(
                ["standard", "woodie", "camarilla", "demark"] as PivotMethod[]
              ).map((methodType) => (
                <TouchableOpacity
                  key={methodType}
                  onPress={() => setMethod(methodType)}
                  style={[
                    styles.methodButton,
                    {
                      backgroundColor:
                        method === methodType
                          ? colors.accentLight
                          : isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.03)",
                      borderColor:
                        method === methodType ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.methodButtonText,
                      {
                        color:
                          method === methodType
                            ? colors.accent
                            : colors.textSecondary,
                        fontWeight: method === methodType ? "bold" : "normal",
                      },
                    ]}
                  >
                    {getMethodLabel(methodType)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {showMethodInfo && (
              <View
                style={[
                  styles.methodInfoContainer,
                  {
                    backgroundColor: colors.accentLight,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.accent,
                  },
                ]}
              >
                <Text style={{ color: colors.textSecondary }}>
                  {METHOD_INFO[method]}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputsContainer}>
            <Text
              variant="labelLarge"
              style={{
                color: colors.textSecondary,
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              PRICE VALUES
            </Text>
            <View style={styles.inputRow}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  High
                </Text>
                <TextInput
                  value={highPrice}
                  onChangeText={setHighPrice}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceVariant,
                      color: colors.text,
                    },
                  ]}
                  mode="flat"
                  activeUnderlineColor={colors.accent}
                  underlineColor={colors.divider}
                  textColor={colors.text}
                  theme={{
                    colors: {
                      background: colors.surfaceVariant,
                      onSurfaceVariant: colors.textSecondary,
                    },
                  }}
                />
              </View>

              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 12 }]}>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Low
                </Text>
                <TextInput
                  value={lowPrice}
                  onChangeText={setLowPrice}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceVariant,
                      color: colors.text,
                    },
                  ]}
                  mode="flat"
                  activeUnderlineColor={colors.accent}
                  underlineColor={colors.divider}
                  textColor={colors.text}
                  theme={{
                    colors: {
                      background: colors.surfaceVariant,
                      onSurfaceVariant: colors.textSecondary,
                    },
                  }}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Close
                </Text>
                <TextInput
                  value={closePrice}
                  onChangeText={setClosePrice}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceVariant,
                      color: colors.text,
                    },
                  ]}
                  mode="flat"
                  activeUnderlineColor={colors.accent}
                  underlineColor={colors.divider}
                  textColor={colors.text}
                  theme={{
                    colors: {
                      background: colors.surfaceVariant,
                      onSurfaceVariant: colors.textSecondary,
                    },
                  }}
                />
              </View>

              {method === "demark" && (
                <View
                  style={[styles.inputWrapper, { flex: 1, marginLeft: 12 }]}
                >
                  <Text
                    style={[styles.inputLabel, { color: colors.textSecondary }]}
                  >
                    Open
                  </Text>
                  <TextInput
                    value={openPrice}
                    onChangeText={setOpenPrice}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surfaceVariant,
                        color: colors.text,
                      },
                    ]}
                    mode="flat"
                    activeUnderlineColor={colors.accent}
                    underlineColor={colors.divider}
                    textColor={colors.text}
                    theme={{
                      colors: {
                        background: colors.surfaceVariant,
                        onSurfaceVariant: colors.textSecondary,
                      },
                    }}
                  />
                </View>
              )}
            </View>
          </View>

          <Divider
            style={[styles.divider, { backgroundColor: colors.divider }]}
          />

          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text
                variant="titleMedium"
                style={{
                  color: colors.text,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                Results
              </Text>
              <View style={styles.resultActions}>
                <IconButton
                  icon="refresh"
                  size={22}
                  onPress={calculateResults}
                  iconColor={colors.accent}
                  style={{
                    backgroundColor: colors.accentLight,
                    borderRadius: 12,
                  }}
                />
                <IconButton
                  icon="content-save"
                  size={22}
                  onPress={saveToHistory}
                  iconColor={colors.accent}
                  style={{
                    marginLeft: 8,
                    backgroundColor: colors.accentLight,
                    borderRadius: 12,
                  }}
                />
              </View>
            </View>

            <Surface
              style={[
                styles.pivotContainer,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 16,
                  elevation: 2,
                  overflow: "hidden",
                },
              ]}
            >
              <LinearGradient
                colors={colors.cardGradient}
                style={styles.pivotGradient}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    color: colors.textSecondary,
                    fontWeight: "500",
                  }}
                >
                  Pivot Point (PP)
                </Text>
                <View style={styles.pivotValueContainer}>
                  <Text
                    variant="headlineSmall"
                    style={{
                      color: colors.warning,
                      fontWeight: "bold",
                      letterSpacing: 0.5,
                    }}
                  >
                    {formatPrice(pivot)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(pivot.toString())}
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Surface>

            <View style={styles.levelsContainer}>
              <Surface
                style={[
                  styles.levelCard,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    elevation: 2,
                    overflow: "hidden",
                  },
                ]}
              >
                <LinearGradient
                  colors={colors.cardGradient}
                  style={styles.levelCardGradient}
                >
                  <Text
                    variant="titleMedium"
                    style={{
                      color: colors.error,
                      marginBottom: 12,
                      textAlign: "center",
                      fontWeight: "600",
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
                                borderBottomColor: colors.divider,
                                borderBottomWidth:
                                  index < resistance.length - 1 ? 1 : 0,
                              },
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={{
                                color: colors.text,
                                fontWeight: "bold",
                              }}
                            >
                              R{index + 1}
                            </Text>
                            <View style={styles.levelValueContainer}>
                              <Text
                                variant="bodyLarge"
                                style={{
                                  color: colors.error,
                                  fontWeight: "bold",
                                }}
                              >
                                {formatPrice(level)}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  copyToClipboard(level.toString())
                                }
                                style={{
                                  padding: 4,
                                }}
                              >
                                <Ionicons
                                  name="copy-outline"
                                  size={16}
                                  color={colors.textTertiary}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        )
                    )}
                  </View>
                </LinearGradient>
              </Surface>

              <Surface
                style={[
                  styles.levelCard,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    elevation: 2,
                    overflow: "hidden",
                  },
                ]}
              >
                <LinearGradient
                  colors={colors.cardGradient}
                  style={styles.levelCardGradient}
                >
                  <Text
                    variant="titleMedium"
                    style={{
                      color: colors.success,
                      marginBottom: 12,
                      textAlign: "center",
                      fontWeight: "600",
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
                                borderBottomColor: colors.divider,
                                borderBottomWidth:
                                  index < support.length - 1 ? 1 : 0,
                              },
                            ]}
                          >
                            <Text
                              variant="bodyMedium"
                              style={{
                                color: colors.text,
                                fontWeight: "bold",
                              }}
                            >
                              S{index + 1}
                            </Text>
                            <View style={styles.levelValueContainer}>
                              <Text
                                variant="bodyLarge"
                                style={{
                                  color: colors.success,
                                  fontWeight: "bold",
                                }}
                              >
                                {formatPrice(level)}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  copyToClipboard(level.toString())
                                }
                                style={{
                                  padding: 4,
                                }}
                              >
                                <Ionicons
                                  name="copy-outline"
                                  size={16}
                                  color={colors.textTertiary}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        )
                    )}
                  </View>
                </LinearGradient>
              </Surface>
            </View>

            <View style={styles.infoContainer}>
              <Chip
                icon="information-outline"
                mode="outlined"
                style={{
                  borderColor: colors.divider,
                  backgroundColor: colors.accentLight,
                }}
                textStyle={{
                  color: colors.textSecondary,
                }}
              >
                Tap any value to copy to clipboard
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

          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text
                variant="titleMedium"
                style={{
                  color: colors.text,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                Recent Calculations
              </Text>
              <View style={styles.historyActions}>
                <Menu
                  visible={historyFilterOpen}
                  onDismiss={() => setHistoryFilterOpen(false)}
                  contentStyle={{
                    backgroundColor: colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    marginTop: 40,
                  }}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setHistoryFilterOpen(true)}
                      icon="filter-variant"
                      textColor={colors.accent}
                      style={{
                        borderColor: colors.accent,
                        borderRadius: 20,
                      }}
                      labelStyle={{
                        fontSize: 13,
                      }}
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
                    title="All calculations"
                    leadingIcon="format-list-bulleted"
                    titleStyle={{ color: colors.text }}
                    trailingIcon={historyFilter === "all" ? "check" : undefined}
                  />
                  <Menu.Item
                    onPress={() => {
                      setHistoryFilter("favorites");
                      setHistoryFilterOpen(false);
                    }}
                    title="Favorites only"
                    leadingIcon="star"
                    titleStyle={{ color: colors.text }}
                    trailingIcon={
                      historyFilter === "favorites" ? "check" : undefined
                    }
                  />
                </Menu>

                <Button
                  mode="text"
                  onPress={clearHistory}
                  icon="trash-can-outline"
                  textColor={colors.textSecondary}
                  style={{ marginLeft: 8 }}
                  compact
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
                              color: colors.textSecondary,
                              backgroundColor: isDark
                                ? "rgba(255, 255, 255, 0.03)"
                                : "rgba(0, 0, 0, 0.02)",
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
                                  ? "rgba(143, 68, 253, 0.2)"
                                  : "rgba(143, 68, 253, 0.05)"
                                : colors.surfaceVariant,
                            borderBottomColor: colors.divider,
                            borderRadius: 12,
                            marginHorizontal: 8,
                            marginBottom: 8,
                            elevation: index === 0 ? 2 : 0,
                          },
                        ]}
                        elevation={index === 0 ? 2 : 0}
                      >
                        <TouchableOpacity
                          style={styles.historyItemTouchable}
                          onPress={() => {
                            setMethod(item.method);
                            setHighPrice(item.high);
                            setLowPrice(item.low);
                            setClosePrice(item.close);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.historyItemLeft}>
                            <View style={styles.historyItemTopRow}>
                              <Text
                                variant="bodyMedium"
                                style={[
                                  styles.historyItemMethod,
                                  { color: colors.text },
                                ]}
                              >
                                {getMethodLabel(item.method)}
                              </Text>
                              {item.isFavorite && (
                                <Ionicons
                                  name="star"
                                  size={16}
                                  color={colors.warning}
                                  style={{ marginLeft: 4 }}
                                />
                              )}
                            </View>

                            <View style={styles.historyItemDetails}>
                              <Text
                                variant="bodySmall"
                                style={{
                                  color: colors.textSecondary,
                                }}
                              >
                                H: {item.high} L: {item.low} C: {item.close}
                              </Text>
                              <Text
                                variant="bodySmall"
                                style={{
                                  color: colors.textTertiary,
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
                                    ? colors.warning
                                    : colors.textTertiary
                                }
                                style={styles.actionButton}
                              />
                              <IconButton
                                icon="trash-can-outline"
                                size={18}
                                onPress={() => deleteHistoryItem(index)}
                                iconColor={colors.textTertiary}
                                style={styles.actionButton}
                              />
                            </View>

                            <View style={styles.pivotDisplay}>
                              <Text
                                variant="bodyMedium"
                                style={{
                                  color: colors.warning,
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
              </ScrollView>
            ) : (
              <Surface
                style={[
                  styles.emptyHistory,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 12,
                    margin: 16,
                  },
                ]}
              >
                <Ionicons
                  name="calculator-outline"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text
                  style={[
                    styles.emptyHistoryText,
                    {
                      color: colors.textSecondary,
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
                    style={[
                      styles.emptyHistoryButton,
                      { borderColor: colors.accent },
                    ]}
                    textColor={colors.accent}
                  >
                    Show all calculations
                  </Button>
                )}
              </Surface>
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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  methodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  methodButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  methodButton: {
    flex: 1,
    minWidth: 80,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  methodButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  methodInfoContainer: {
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  inputsContainer: {
    paddingTop: 6,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 24,
    height: 1,
  },
  resultsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
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
    marginBottom: 24,
    alignItems: "center",
  },
  pivotValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  pivotGradient: {
    width: "100%",
    height: "100%",
    padding: 16,
    alignItems: "center",
  },
  levelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  },
  levelCard: {
    flex: 1,
    overflow: "hidden",
  },
  levelCardGradient: {
    width: "100%",
    height: "100%",
    padding: 16,
  },
  levelsList: {
    gap: 8,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  levelValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  historyContainer: {
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  historyActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyList: {
    maxHeight: 350,
    paddingHorizontal: 8,
  },
  historyDateHeader: {
    fontSize: 12,
    padding: 8,
    paddingHorizontal: 16,
    fontWeight: "500",
    marginVertical: 4,
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
    borderLeftColor: "#8F44FD",
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
    borderRadius: 20,
  },
});
