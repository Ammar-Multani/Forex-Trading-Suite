import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { TextInput, Divider } from "react-native-paper";
import { calculateMargin, formatCurrency } from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import LotSizeSelector from "../ui/LotSizeSelector";
import LotSizeEditorModal from "../ui/LotSizeEditorModal";
import { useTheme } from "../../contexts/ThemeContext";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";
import {
  LotType,
  defaultLotSizes,
  calculateTotalUnits,
  LotSize,
} from "../../constants/lotSizes";
import { getCurrencyPairByName } from "../../constants/currencies";
import useApiManager from "../../hooks/useApiManager";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";

export default function MarginCalculator() {
  // Initialize the ApiManager hook for fetching rates
  const {
    getExchangeRate,
    getForexPairRate,
    isLoading: isApiLoading,
    error: apiError,
  } = useApiManager("MarginCalculator");

  // Add ref to track if this is the first mount and if API call is in progress
  const isInitialMount = useRef(true);
  const apiCallInProgress = useRef(false);

  // State for inputs
  const { isDark } = useTheme();
  const { accountCurrency: contextCurrency } = useExchangeRates();
  const [accountCurrency, setAccountCurrency] = useState(contextCurrency.code);
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [leverage, setLeverage] = useState("100");
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number | null>(
    null
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Create a custom ordered lot sizes object to ensure Unit appears in the UI
  const customOrderedLotSizes = {
    Standard: defaultLotSizes.Standard,
    Mini: defaultLotSizes.Mini,
    Micro: defaultLotSizes.Micro,
    Nano: defaultLotSizes.Nano,
    Unit: defaultLotSizes.Unit,
    Custom: defaultLotSizes.Custom,
  };

  // Lot size state
  const [lotSizes, setLotSizes] = useState(customOrderedLotSizes);
  const [lotType, setLotType] = useState<LotType>("Standard");
  const [lotCount, setLotCount] = useState(1);
  const [customUnits, setCustomUnits] = useState(1);
  const [lotSizeEditorVisible, setLotSizeEditorVisible] = useState(false);

  // State for results
  const [requiredMargin, setRequiredMargin] = useState(0);
  const [marginLevel, setMarginLevel] = useState(0);

  // Update when context currency changes
  useEffect(() => {
    setAccountCurrency(contextCurrency.code);
  }, [contextCurrency]);

  // Fetch current exchange rate
  const fetchCurrentRate = useCallback(async () => {
    // Prevent multiple API calls simultaneously
    if (apiCallInProgress.current) {
      return;
    }

    apiCallInProgress.current = true;
    setIsRefreshingRate(true);
    setCalculationError(null);

    try {
      // Check network connectivity first
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please connect to the internet to fetch live exchange rates."
        );
        setIsRefreshingRate(false);
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

      // Update the current exchange rate state
      setCurrentExchangeRate(rate);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching current rate:", error);
      if (error instanceof Error) {
        setCalculationError(`Failed to fetch rate: ${error.message}`);
      } else {
        setCalculationError("Failed to fetch current exchange rate");
      }
    } finally {
      setIsRefreshingRate(false);
      apiCallInProgress.current = false;
    }
  }, [currencyPair, getForexPairRate]);

  // Handle currency pair change - fetch new rate
  const handleCurrencyPairChange = useCallback((pair: string) => {
    setCurrencyPair(pair);
    // Fetch the new rate when currency pair changes
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCurrentRate();
    }
  }, [fetchCurrentRate]);

  // Update exchange rate when currency pair changes
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchCurrentRate();
    }
  }, [currencyPair, fetchCurrentRate]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    accountCurrency,
    currencyPair,
    lotType,
    lotCount,
    customUnits,
    leverage,
    currentExchangeRate,
  ]);

  // Use API error if available
  useEffect(() => {
    if (apiError) {
      setCalculationError(apiError);
    }
  }, [apiError]);

  const calculateResults = () => {
    try {
      setCalculationError(null);
      const lev = parseFloat(leverage) || 1;

      // Calculate position size based on lot type
      const positionSize = calculateTotalUnits(
        lotType,
        lotCount,
        customUnits,
        lotSizes
      );

      // Get the exchange rate (use 1 if not available yet)
      const rate = currentExchangeRate || 1;

      if (positionSize > 0 && lev > 0) {
        // Calculate the position value using the exchange rate
        const positionValue = positionSize * rate;

        // Calculate required margin
        const requiredMarginValue = positionValue / lev;

        // Set the results
        setRequiredMargin(requiredMarginValue);
        setMarginLevel(100); // 100% if this is the only position
      }
    } catch (error) {
      console.error("Calculation error:", error);
      if (error instanceof Error) {
        setCalculationError(error.message);
      } else {
        setCalculationError("An error occurred during calculation");
      }
    }
  };

  // Handle lot sizes save
  const handleLotSizesSave = (newLotSizes: Record<string, LotSize>) => {
    // Make sure to maintain our custom order when updating lot sizes
    const updatedLotSizes = {
      Standard: newLotSizes.Standard,
      Mini: newLotSizes.Mini,
      Micro: newLotSizes.Micro,
      Nano: newLotSizes.Nano,
      Unit: newLotSizes.Unit,
      Custom: newLotSizes.Custom,
    };
    setLotSizes(updatedLotSizes);
  };

  // Combine loading states
  const isLoading = isRefreshingRate || isApiLoading;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.maincardcontainer}>
        <CalculatorCard title="Calculate Margin">
          <View style={styles.inputsContainer}>
            <AccountCurrencySelector
              value={accountCurrency}
              onChange={setAccountCurrency}
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

              {currentExchangeRate && (
                <View style={styles.rateContainer}>
                  <Text
                    style={[
                      styles.rateLabel,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    Current Rate:
                  </Text>
                  <View style={styles.rateValueContainer}>
                    <Text
                      style={[
                        styles.rateValue,
                        { color: isDark ? "#fff" : "#000" },
                      ]}
                    >
                      {currentExchangeRate.toFixed(5)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (!isLoading) {
                          fetchCurrentRate();
                        }
                      }}
                      disabled={isLoading}
                      style={styles.refreshButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator size={16} color="#6200ee" />
                      ) : (
                        <Ionicons name="refresh" size={16} color="#6200ee" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {lastUpdated && (
                <Text style={styles.lastUpdatedText}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </View>

            <LotSizeSelector
              label="Position Size"
              lotType={lotType}
              lotCount={lotCount}
              customUnits={customUnits}
              lotSizes={lotSizes}
              onLotTypeChange={setLotType}
              onLotCountChange={setLotCount}
              onCustomUnitsChange={setCustomUnits}
              onEditPress={() => setLotSizeEditorVisible(true)}
            />

            <TextInput
              label="Leverage"
              value={leverage}
              onChangeText={setLeverage}
              keyboardType="numeric"
              right={<TextInput.Affix text=":1" />}
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
            {calculationError && !isLoading ? (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{calculationError}</Text>
              </View>
            ) : isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Calculating...</Text>
              </View>
            ) : (
              <>
                <ResultDisplay
                  label="Required Margin"
                  value={formatCurrency(requiredMargin, accountCurrency)}
                  color="#4CAF50"
                  isLarge
                />

                <ResultDisplay
                  label="Margin Level"
                  value={`${marginLevel.toFixed(2)}%`}
                  color="#2196F3"
                />

                <ResultDisplay
                  label="Position Value"
                  value={formatCurrency(
                    requiredMargin * parseFloat(leverage),
                    accountCurrency
                  )}
                  color="#FF9800"
                />
              </>
            )}
          </CalculatorCard>
        </View>
      </View>

      {/* Lot Size Editor Modal */}
      <Modal
        visible={lotSizeEditorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLotSizeEditorVisible(false)}
      >
        <LotSizeEditorModal
          lotSizes={lotSizes}
          onSave={handleLotSizesSave}
          onClose={() => setLotSizeEditorVisible(false)}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  maincardcontainer: {
    marginTop: 16,
  },
  inputsContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  rateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  rateValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  refreshButton: {
    padding: 5,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginBottom: 12,
    fontStyle: "italic",
  },
  currencyPairSection: {
    marginBottom: 16,
  },
  loadingSection: {
    opacity: 0.7,
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
});
