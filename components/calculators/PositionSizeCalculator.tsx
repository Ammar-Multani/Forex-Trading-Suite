import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  TextInput,
  Divider,
  SegmentedButtons,
  Switch,
  Text,
  Surface,
  TouchableRipple,
  Portal,
  Modal,
  Button,
  List,
} from "react-native-paper";
import {
  formatCurrency,
  getPipDecimalPlaces,
  calculatePipValueInQuoteCurrency,
  calculatePipValueInAccountCurrency,
} from "../../utils/calculators";
import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import CurrencyPairSelector from "../ui/CurrencyPairSelector";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import PageHeader from "../ui/PageHeader";
import { useTheme } from "../../contexts/ThemeContext";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";
import useApiManager from "../../hooks/useApiManager";
import {
  getCurrencyPairByName,
  CurrencyPair,
} from "../../constants/currencies";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// Lot size constants
const STANDARD_LOT = 100000;
const MINI_LOT = 10000;
const MICRO_LOT = 1000;

// Storage keys for persisting calculator values
const STORAGE_KEYS = {
  ACCOUNT_CURRENCY: "position_calculator_account_currency",
  CURRENCY_PAIR: "position_calculator_currency_pair",
  ACCOUNT_BALANCE: "position_calculator_account_balance",
  RISK_PERCENTAGE: "position_calculator_risk_percentage",
  RISK_AMOUNT: "position_calculator_risk_amount",
  ENTRY_PRICE: "position_calculator_entry_price",
  STOP_LOSS_PIPS: "position_calculator_stop_loss_pips",
  STOP_LOSS_PRICE: "position_calculator_stop_loss_price",
  RISK_INPUT_TYPE: "position_calculator_risk_input_type",
  STOP_LOSS_INPUT_TYPE: "position_calculator_stop_loss_input_type",
  PIP_DECIMAL_PLACES: "position_calculator_pip_decimal_places",
  POSITION_TYPE: "position_calculator_position_type",
};



export default function PositionSizeCalculator() {
  // Add a ref to track if this is the first mount
  const isInitialMount = useRef(true);
  const apiCallInProgress = useRef(false);

  // Initialize the ApiManager hook with component name for tracking
  const {
    getExchangeRate,
    getForexPairRate,
    isLoading: isApiLoading,
    error: apiError,
  } = useApiManager("PositionSizeCalculator");

  // State for inputs
  const { isDark } = useTheme();
  const { accountCurrency: contextCurrency } = useExchangeRates();
  const [accountCurrency, setAccountCurrency] = useState(contextCurrency.code);
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  const [accountBalance, setAccountBalance] = useState("10000");
  const [riskPercentage, setRiskPercentage] = useState("0");
  const [riskAmount, setRiskAmount] = useState("0");
  const [entryPrice, setEntryPrice] = useState("0");
  const [stopLossPips, setStopLossPips] = useState("0");
  const [stopLossPrice, setStopLossPrice] = useState("0");
  const [pipDecimalPlaces, setPipDecimalPlaces] = useState(4);
  const [positionType, setPositionType] = useState("long");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshingEntryPrice, setIsRefreshingEntryPrice] = useState(false);

  // UI state toggles
  const [riskInputType, setRiskInputType] = useState("percentage"); // "percentage" or "amount"
  const [stopLossInputType, setStopLossInputType] = useState("pips"); // "pips" or "price"

  // State for results
  const [positionSize, setPositionSize] = useState(0);
  const [positionSizeUnits, setPositionSizeUnits] = useState(0);
  const [standardLots, setStandardLots] = useState(0);
  const [miniLots, setMiniLots] = useState(0);
  const [microLots, setMicroLots] = useState(0);
  const [calculatedRiskAmount, setCalculatedRiskAmount] = useState(0);
  const [pipValue, setPipValue] = useState(0);
  const [stopLossLevel, setStopLossLevel] = useState(0);
  const [adjustedStopLoss, setAdjustedStopLoss] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1);

  // New state for modal visibility
  const [riskTypeModalVisible, setRiskTypeModalVisible] = useState(false);
  const [stopLossTypeModalVisible, setStopLossTypeModalVisible] =
    useState(false);

  // Add function to fetch current market rate
  const fetchCurrentRate = useCallback(async () => {
    // Prevent multiple API calls simultaneously
    if (apiCallInProgress.current) {
      return;
    }

    apiCallInProgress.current = true;
    setIsRefreshingEntryPrice(true);
    setCalculationError(null);

    try {
      // Check network connectivity first
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please connect to the internet to fetch live exchange rates."
        );
        setIsRefreshingEntryPrice(false);
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

      // Add retry logic to make rate fetching more reliable
      let retries = 0;
      const maxRetries = 2;
      let rate;

      while (retries <= maxRetries) {
        try {
          rate = await getForexPairRate(pairString);
          break; // If successful, exit the retry loop
        } catch (error) {
          retries++;
          if (retries > maxRetries) throw error;
          // Wait briefly before retrying
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!rate || rate <= 0) {
        throw new Error("Received invalid rate from API");
      }

      // Update the entry price field
      setEntryPrice(rate.toFixed(5));
      setLastUpdated(new Date());

      // If using stop loss in pips, update the stop loss price based on the new entry price
      if (stopLossInputType === "pips") {
        const pips = parseFloat(stopLossPips) || 0;
        if (pips > 0) {
          const pipFactor = Math.pow(10, -pipDecimalPlaces);
          const isLongPosition = positionType === "long";
          const newStopLossPrice = isLongPosition
            ? rate - pips * pipFactor
            : rate + pips * pipFactor;
          setStopLossPrice(newStopLossPrice.toFixed(5));
        }
      }

      console.log(`Successfully fetched rate for ${currencyPair}: ${rate}`);
    } catch (error) {
      console.error("Error fetching current rate:", error);
      if (error instanceof Error) {
        setCalculationError(`Failed to fetch rate: ${error.message}`);
      } else {
        setCalculationError("Failed to fetch current exchange rate");
      }
    } finally {
      setIsRefreshingEntryPrice(false);
      apiCallInProgress.current = false;
    }
  }, [
    currencyPair,
    getForexPairRate,
    stopLossInputType,
    stopLossPips,
    pipDecimalPlaces,
    positionType,
  ]);

  // Load calculator values from AsyncStorage
  const loadCalculatorValues = useCallback(async () => {
    try {
      // Load all values from AsyncStorage
      const [
        savedAccountCurrency,
        savedCurrencyPair,
        savedAccountBalance,
        savedRiskPercentage,
        savedRiskAmount,
        savedEntryPrice,
        savedStopLossPips,
        savedStopLossPrice,
        savedRiskInputType,
        savedStopLossInputType,
        savedPipDecimalPlaces,
        savedPositionType,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_CURRENCY),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY_PAIR),
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.RISK_PERCENTAGE),
        AsyncStorage.getItem(STORAGE_KEYS.RISK_AMOUNT),
        AsyncStorage.getItem(STORAGE_KEYS.ENTRY_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.STOP_LOSS_PIPS),
        AsyncStorage.getItem(STORAGE_KEYS.STOP_LOSS_PRICE),
        AsyncStorage.getItem(STORAGE_KEYS.RISK_INPUT_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.STOP_LOSS_INPUT_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.PIP_DECIMAL_PLACES),
        AsyncStorage.getItem(STORAGE_KEYS.POSITION_TYPE),
      ]);

      // Update state with saved values if they exist
      if (savedAccountCurrency) setAccountCurrency(savedAccountCurrency);
      if (savedCurrencyPair) setCurrencyPair(savedCurrencyPair);
      if (savedAccountBalance) setAccountBalance(savedAccountBalance);
      if (savedRiskPercentage) setRiskPercentage(savedRiskPercentage);
      if (savedRiskAmount) setRiskAmount(savedRiskAmount);
      if (savedEntryPrice) setEntryPrice(savedEntryPrice);
      if (savedStopLossPips) setStopLossPips(savedStopLossPips);
      if (savedStopLossPrice) setStopLossPrice(savedStopLossPrice);
      if (savedRiskInputType) setRiskInputType(savedRiskInputType);
      if (savedStopLossInputType) setStopLossInputType(savedStopLossInputType);
      if (savedPipDecimalPlaces)
        setPipDecimalPlaces(parseInt(savedPipDecimalPlaces));
      if (savedPositionType) setPositionType(savedPositionType);

      console.log("Position size calculator values loaded successfully");
    } catch (error) {
      console.error("Error loading position size calculator values:", error);
    }
  }, []);

  // Save calculator values to AsyncStorage
  const saveCalculatorValues = useCallback(async () => {
    try {
      const valuesToSave = {
        [STORAGE_KEYS.ACCOUNT_CURRENCY]: accountCurrency,
        [STORAGE_KEYS.CURRENCY_PAIR]: currencyPair,
        [STORAGE_KEYS.ACCOUNT_BALANCE]: accountBalance,
        [STORAGE_KEYS.RISK_PERCENTAGE]: riskPercentage,
        [STORAGE_KEYS.RISK_AMOUNT]: riskAmount,
        [STORAGE_KEYS.ENTRY_PRICE]: entryPrice,
        [STORAGE_KEYS.STOP_LOSS_PIPS]: stopLossPips,
        [STORAGE_KEYS.STOP_LOSS_PRICE]: stopLossPrice,
        [STORAGE_KEYS.RISK_INPUT_TYPE]: riskInputType,
        [STORAGE_KEYS.STOP_LOSS_INPUT_TYPE]: stopLossInputType,
        [STORAGE_KEYS.PIP_DECIMAL_PLACES]: pipDecimalPlaces.toString(),
        [STORAGE_KEYS.POSITION_TYPE]: positionType,
      };

      // Save each value to AsyncStorage
      await Promise.all(
        Object.entries(valuesToSave).map(([key, value]) =>
          AsyncStorage.setItem(key, value.toString())
        )
      );

      console.log("Position size calculator values saved successfully");
    } catch (error) {
      console.error("Error saving position size calculator values:", error);
    }
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossPips,
    stopLossPrice,
    riskInputType,
    stopLossInputType,
    pipDecimalPlaces,
    positionType,
  ]);

  // When risk input type changes, sync the values
  useEffect(() => {
    if (riskInputType === "percentage") {
      // When switching to percentage, calculate from current risk amount
      const balance = parseFloat(accountBalance) || 0;
      if (balance > 0) {
        const riskAmt = parseFloat(riskAmount) || 0;
        const percentage = (riskAmt / balance) * 100;
        setRiskPercentage(percentage.toFixed(0));
      }
    } else {
      // When switching to amount, calculate from current percentage
      const balance = parseFloat(accountBalance) || 0;
      const percentage = parseFloat(riskPercentage) || 0;
      const amount = balance * (percentage / 100);
      setRiskAmount(amount.toFixed(2));
    }
  }, [riskInputType]);

  // When stop loss input type changes, sync the values
  useEffect(() => {
    if (stopLossInputType === "pips") {
      // When switching to pips, calculate from prices
      const entry = parseFloat(entryPrice) || 0;
      const stopLoss = parseFloat(stopLossPrice) || 0;

      if (entry > 0 && stopLoss > 0) {
        const pipFactor = Math.pow(10, pipDecimalPlaces);
        const pips = Math.abs(entry - stopLoss) * pipFactor;
        setStopLossPips(pips.toFixed(0));
      }

      // When switching to pips mode, set position type to long and fetch latest rate
      setPositionType("long");
      fetchCurrentRate();
    } else {
      // When switching to price, calculate from pips
      const entry = parseFloat(entryPrice) || 0;
      const pips = parseFloat(stopLossPips) || 0;

      if (entry > 0 && pips > 0) {
        const pipFactor = Math.pow(10, -pipDecimalPlaces);
        const stopLoss = entry - pips * pipFactor; // Assuming a long position
        setStopLossPrice(stopLoss.toFixed(5));
      }
    }
  }, [stopLossInputType]);

  // Use API error if available
  useEffect(() => {
    if (apiError) {
      setCalculationError(apiError);
    }
  }, [apiError]);

  // Fetch on initial mount and load saved values
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // First load saved values
      loadCalculatorValues().then(() => {
        // Always fetch current rate on initial load to ensure accuracy
        fetchCurrentRate();
      });
    }
  }, [fetchCurrentRate, loadCalculatorValues]);

  // Update when currency pair changes - fetch new rate to update entry price
  useEffect(() => {
    // Skip on initial render since we'll fetch in the mount effect
    if (isInitialMount.current) {
      return;
    }

    // Fetch rate when currency pair changes
    fetchCurrentRate();
  }, [currencyPair, fetchCurrentRate]);

  // Make sure to fetch when switching to "pips" mode for stop loss
  useEffect(() => {
    if (!isInitialMount.current && stopLossInputType === "pips") {
      // When in pips mode, always refresh the rate to ensure accuracy
      fetchCurrentRate();
    }
  }, [stopLossInputType, fetchCurrentRate]);

  // Save values whenever they change (except on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      saveCalculatorValues();
    }
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossPips,
    stopLossPrice,
    riskInputType,
    stopLossInputType,
    pipDecimalPlaces,
    positionType,
    saveCalculatorValues,
  ]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskInputType,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossInputType,
    stopLossPips,
    stopLossPrice,
    pipDecimalPlaces,
    positionType,
  ]);

  const fetchExchangeRateForPair = useCallback(async () => {
    try {
      // Check network connectivity first
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        throw new Error("No internet connection available");
      }

      const [baseCurrency, quoteCurrency] = currencyPair.split("/");

      // Get currency pair data
      const pairData = getCurrencyPairByName(currencyPair);
      if (!pairData) {
        throw new Error(`Invalid currency pair: ${currencyPair}`);
      }

      // If quote currency is the same as account currency, no need for conversion
      if (quoteCurrency === accountCurrency) {
        return 1;
      }

      // Get the exchange rate from API
      const rate = await getExchangeRate(quoteCurrency, accountCurrency);
      return rate;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      if (error instanceof Error) {
        throw new Error(`Could not fetch exchange rate: ${error.message}`);
      } else {
        throw new Error("Could not fetch exchange rate");
      }
    }
  }, [currencyPair, accountCurrency, getExchangeRate]);

  const calculateResults = useCallback(async () => {
    try {
      setCalculationError(null);
      setIsCalculating(true);

      const balance = parseFloat(accountBalance) || 0;
      const entry = parseFloat(entryPrice) || 0;
      let stopLoss: number;
      let riskAmt: number;

      // Get risk amount based on input type
      if (riskInputType === "percentage") {
        const percentage = parseFloat(riskPercentage) || 0;
        riskAmt = balance * (percentage / 100);
      } else {
        riskAmt = parseFloat(riskAmount) || 0;
      }

      // Get stop loss pips based on input type
      if (stopLossInputType === "pips") {
        stopLoss = parseFloat(stopLossPips) || 0;
      } else {
        const stopLossValue = parseFloat(stopLossPrice) || 0;
        if (entry > 0 && stopLossValue > 0) {
          const pipFactor = Math.pow(10, pipDecimalPlaces);
          stopLoss = Math.abs(entry - stopLossValue) * pipFactor;
        } else {
          stopLoss = 0;
        }
      }

      if (balance > 0 && riskAmt > 0 && entry > 0 && stopLoss > 0) {
        // Extract base and quote currencies
        const [baseCurrency, quoteCurrency] = currencyPair.split("/");

        // Get the currency pair data
        const pairData = getCurrencyPairByName(currencyPair);
        if (!pairData) {
          throw new Error(`Invalid currency pair: ${currencyPair}`);
        }

        // Get pip decimal places for this currency pair
        const pipDecimalPlacesForPair = getPipDecimalPlaces(pairData.quote);

        // Calculate pip size
        const pipSize = Math.pow(10, -pipDecimalPlaces);

        // Get the exchange rate for conversion
        let rate = 1.0;
        try {
          rate = await fetchExchangeRateForPair();
          setExchangeRate(rate);
        } catch (error) {
          console.error("Error getting exchange rate:", error);
          throw new Error("Could not get current exchange rates");
        }

        // Calculate position size in units based on the risk/stop loss method
        const lotSize = STANDARD_LOT; // Standard lot size for calculation

        // Calculate pip value in quote currency
        const pipValueInQuote = calculatePipValueInQuoteCurrency(
          pairData,
          lotSize,
          1, // for single pip
          pipDecimalPlaces
        );

        // Convert to account currency
        const pipValueInAccount = calculatePipValueInAccountCurrency(
          pipValueInQuote,
          pairData.quote,
          accountCurrency,
          rate
        );

        // Calculate position size in units
        const pipValueForOneUnit = pipValueInAccount / STANDARD_LOT;
        const positionSizeInUnits = riskAmt / (stopLoss * pipValueForOneUnit);

        // Calculate total position size in lots
        const totalLots = positionSizeInUnits / STANDARD_LOT;

        // Standard lots, keeping decimals
        const stdLots = positionSizeInUnits / STANDARD_LOT;

        // Calculate mini lots, keeping decimals
        const miniLots = positionSizeInUnits / MINI_LOT;

        // Calculate micro lots, keeping decimals
        const microLots = positionSizeInUnits / MICRO_LOT;

        // Calculate pip value for entire position
        const totalPipValue = pipValueForOneUnit * positionSizeInUnits;

        // Calculate stop loss price level based on position type
        const isLongPosition = positionType === "long";
        const stopLossLevel = isLongPosition
          ? entry - stopLoss * pipSize
          : entry + stopLoss * pipSize;

        // Calculate total stop loss pips (no extra multiplication needed)
        const totalStopLossPips = stopLoss;

        // Update state with all calculated values
        setPositionSize(totalLots);
        setPositionSizeUnits(positionSizeInUnits);
        setStandardLots(stdLots); // Set the raw decimal value
        setMiniLots(miniLots); // Set the raw decimal value
        setMicroLots(microLots); // Set the raw decimal value
        setCalculatedRiskAmount(riskAmt);
        setPipValue(totalPipValue);
        setStopLossLevel(stopLossLevel);
        setAdjustedStopLoss(totalStopLossPips);
      }
    } catch (error) {
      console.error("Calculation error:", error);
      if (error instanceof Error) {
        setCalculationError(error.message);

        // Show alert for connectivity issues
        if (error.message.includes("No internet connection")) {
          Alert.alert(
            "No Internet Connection",
            "Please connect to the internet to fetch live exchange rates."
          );
        }
      } else {
        setCalculationError("An error occurred during calculation");
      }
    } finally {
      setIsCalculating(false);
    }
  }, [
    accountCurrency,
    currencyPair,
    accountBalance,
    riskInputType,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossInputType,
    stopLossPips,
    stopLossPrice,
    pipDecimalPlaces,
    positionType,
    fetchExchangeRateForPair,
  ]);

  // Load saved calculator values
  useEffect(() => {
    const loadSavedValues = async () => {
      try {
        // Load values from AsyncStorage
        const savedAccountCurrency = await AsyncStorage.getItem(
          STORAGE_KEYS.ACCOUNT_CURRENCY
        );
        // Only use saved account currency if it exists, otherwise use the one from context
        if (savedAccountCurrency) {
          setAccountCurrency(savedAccountCurrency);
        } else {
          // Set account currency from context if no saved value
          setAccountCurrency(contextCurrency.code);
        }

        // Load other values...
        const savedCurrencyPair = await AsyncStorage.getItem(
          STORAGE_KEYS.CURRENCY_PAIR
        );
        if (savedCurrencyPair) setCurrencyPair(savedCurrencyPair);

        // Continue loading other values...
        // ...
      } catch (error) {
        console.error("Error loading calculator values:", error);
      }
    };

    loadSavedValues();
  }, [contextCurrency]);

  return (

<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
  <View style={styles.maincardcontainer}>
      <CalculatorCard title="Calculate Position Size">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={setAccountCurrency}
          />

          <CurrencyPairSelector
            label="Financial Instrument"
            selectedPair={currencyPair}
            onSelect={(pair) => setCurrencyPair(pair)}
          />

          <TextInput
            label="Account balance"
            value={accountBalance}
            onChangeText={setAccountBalance}
            keyboardType="numeric"
            left={
              <TextInput.Affix text={accountCurrency === "USD" ? "$" : ""} />
            }
            style={styles.textInput}
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

          {/* Position Type Selector - Only show when stop loss type is price
          {stopLossInputType === "price" && (
            <View style={styles.radioGroup}>
              <Text style={styles.radioLabel}>Position Type</Text>
              <View style={styles.radioButtons}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    positionType === "long" && styles.radioButtonSelected,
                  ]}
                  onPress={() => setPositionType("long")}
                >
                  <Text
                    style={[
                      styles.radioButtonText,
                      positionType === "long" && styles.radioButtonTextSelected,
                    ]}
                  >
                    Long
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    positionType === "short" && styles.radioButtonSelected,
                  ]}
                  onPress={() => setPositionType("short")}
                >
                  <Text
                    style={[
                      styles.radioButtonText,
                      positionType === "short" &&
                        styles.radioButtonTextSelected,
                    ]}
                  >
                    Short
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )} */}

          {/* Risk Type Selector */}
          <View style={styles.riskinputContainer}>
            <TextInput
              label="Risk"
              value={
                riskInputType === "percentage" ? riskPercentage : riskAmount
              }
              onChangeText={
                riskInputType === "percentage"
                  ? setRiskPercentage
                  : setRiskAmount
              }
              keyboardType="numeric"
              style={styles.textInput}
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
                <TextInput.Affix
                  text={riskInputType === "percentage" ? "%" : accountCurrency}
                  textStyle={styles.affixText}
                />
              }
            />
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setRiskTypeModalVisible(true)}
            >
              <View style={styles.selectorContent}>
                <Text style={styles.selectorText}>
                  {riskInputType === "percentage" ? "%" : accountCurrency}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={isDark ? "#aaa" : "#666"}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Entry Price with Refresh Button - Only show when stop loss type is price */}
          {stopLossInputType === "price" && (
            <View style={styles.entryPriceContainer}>
              <TextInput
                label="Entry Price"
                value={entryPrice}
                onChangeText={setEntryPrice}
                keyboardType="numeric"
                style={styles.textInput}
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
                        onPress={() => {
                          if (!isRefreshingEntryPrice) {
                            fetchCurrentRate();
                          }
                        }}
                        disabled={isRefreshingEntryPrice}
                        style={{ padding: 5 }}
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
          )}

          {/* Stop Loss Type Selector */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Stop loss"
              value={
                stopLossInputType === "pips" ? stopLossPips : stopLossPrice
              }
              onChangeText={
                stopLossInputType === "pips"
                  ? setStopLossPips
                  : setStopLossPrice
              }
              keyboardType="numeric"
              style={styles.textInput}
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
                <TextInput.Affix
                  text={stopLossInputType === "pips" ? "Pips" : "Price"}
                  textStyle={styles.affixText}
                />
              }
            />
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setStopLossTypeModalVisible(true)}
            >
              <View style={styles.selectorContent}>
                <Text style={styles.selectorText}>
                  {stopLossInputType === "pips" ? "Pips" : "Price"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={isDark ? "#aaa" : "#666"}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Show pips-mode indicator when in pips mode */}
          {stopLossInputType === "pips" && lastUpdated && (
            <View style={styles.pipsInfoContainer}>
              <Text style={styles.pipsInfoText}>
                Using market rate from {lastUpdated.toLocaleTimeString()} for
                long position
              </Text>
            </View>
          )}
        </View>
        </CalculatorCard>
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
  <CalculatorCard title="Results">
    
  {isCalculating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>Calculating...</Text>
          </View>
        ) : calculationError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{calculationError}</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <ResultDisplay
              label="Position Size - Unit"
              value={`${positionSizeUnits.toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}`}
              color="#4CAF50"
              isLarge
            />

            <ResultDisplay
              label="Standard Lot"
              value={`${standardLots.toFixed(
                3
              )} (${STANDARD_LOT.toLocaleString()} units)`}
              color="#2196F3"
            />

            <ResultDisplay
              label="Mini Lot"
              value={`${miniLots.toFixed(
                3
              )} (${MINI_LOT.toLocaleString()} units)`}
              color="#2196F3"
            />

            <ResultDisplay
              label="Micro Lot"
              value={`${microLots.toFixed(
                3
              )} (${MICRO_LOT.toLocaleString()} units)`}
              color="#2196F3"
            />

            <ResultDisplay
              label="Amount at Risk"
              value={formatCurrency(calculatedRiskAmount, accountCurrency)}
              color="#FF5252"
            />

            {stopLossInputType === "price" ? (
              <ResultDisplay
                label="Stop Loss"
                value={`${adjustedStopLoss.toLocaleString()} Pips`}
                color="#FF9800"
              />
            ) : (
              <ResultDisplay
                label="Stop Loss at"
                value={stopLossLevel.toFixed(5)}
                color="#FF9800"
              />
            )}

            <ResultDisplay
              label="Pip Value"
              value={formatCurrency(
                parseFloat(pipValue.toFixed(3)),
                accountCurrency
              )}
              color="#2196F3"
            />

            <ResultDisplay
              label="Exchange Rate"
              value={`1 ${currencyPair.split("/")[1]} = ${exchangeRate.toFixed(
                5
              )} ${accountCurrency}`}
              color="#8E24AA"
            />
          </View>
        )}


      {/* Risk Type Modal */}
      <Portal>
        <Modal
          visible={riskTypeModalVisible}
          onDismiss={() => setRiskTypeModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: isDark ? "#1E1E1E" : "#f5f5f5" },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            Select Risk Type
          </Text>
          <List.Item
            title="Percentage"
            titleStyle={{ color: isDark ? "#fff" : "#000" }}
            onPress={() => {
              setRiskInputType("percentage");
              setRiskTypeModalVisible(false);
            }}
            right={() =>
              riskInputType === "percentage" ? (
                <Ionicons name="checkmark" size={24} color="#6200ee" />
              ) : null
            }
            style={styles.modalItem}
          />
          <List.Item
            title="Amount"
            titleStyle={{ color: isDark ? "#fff" : "#000" }}
            onPress={() => {
              setRiskInputType("amount");
              setRiskTypeModalVisible(false);
            }}
            right={() =>
              riskInputType === "amount" ? (
                <Ionicons name="checkmark" size={24} color="#6200ee" />
              ) : null
            }
            style={styles.modalItem}
          />
          <Button
            mode="text"
            onPress={() => setRiskTypeModalVisible(false)}
            textColor="#6200ee"
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>

      {/* Stop Loss Type Modal */}
      <Portal>
        <Modal
          visible={stopLossTypeModalVisible}
          onDismiss={() => setStopLossTypeModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: isDark ? "#1E1E1E" : "#f5f5f5" },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            Select Stop Loss Type
          </Text>
          <List.Item
            title="Pips"
            titleStyle={{ color: isDark ? "#fff" : "#000" }}
            onPress={() => {
              setStopLossInputType("pips");
              setStopLossTypeModalVisible(false);
            }}
            right={() =>
              stopLossInputType === "pips" ? (
                <Ionicons name="checkmark" size={24} color="#6200ee" />
              ) : null
            }
            style={styles.modalItem}
          />
          <List.Item
            title="Price"
            titleStyle={{ color: isDark ? "#fff" : "#000" }}
            onPress={() => {
              setStopLossInputType("price");
              setStopLossTypeModalVisible(false);
            }}
            right={() =>
              stopLossInputType === "price" ? (
                <Ionicons name="checkmark" size={24} color="#6200ee" />
              ) : null
            }
            style={styles.modalItem}
          />
          <Button
            mode="text"
            onPress={() => setStopLossTypeModalVisible(false)}
            textColor="#6200ee"
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
  </CalculatorCard>
</View>
    </ScrollView>

  );
}

// Helper function to format numbers with commas
const formatNumber = (num: number) => {
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputsContainer: {
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  divider: {
    marginVertical: 16,
  },
  maincardcontainer: {
    marginTop: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  inputSurface: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#6200ee",
  },
  surfaceLabel: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 8,
  },
  surfaceInput: {
    backgroundColor: "transparent",
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
  // New selector styles
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  selectorContainer: {
    overflow: "hidden",
  },
  riskinputContainer: {
    marginBottom: 16,
    marginTop: 16,
    position: "relative",
  },
  inputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  textInput: {
    marginBottom: 0,
  },
  selectorButton: {
    position: "absolute",
    right: 12,
    top: 11.5,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
    minWidth: 60,
    zIndex: 1,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6200ee",
    marginRight: 4,
    textTransform: "capitalize",
  },
  affixText: {
    fontSize: 14,
    color: "#6200ee",
    fontWeight: "500",
    opacity: 0, // Hide the actual affix since we show it in the button
  },
  // Modal styles
  modalContainer: {
    margin: 20,
    borderRadius: 10,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  modalButton: {
    marginTop: 16,
  },
  // New styles for position type radio buttons
  radioGroup: {
    marginBottom: 16,
    marginTop: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 8,
  },
  radioButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "rgba(98, 0, 238, 0.1)",
  },
  radioButtonSelected: {
    backgroundColor: "#6200ee",
  },
  radioButtonText: {
    color: "#6200ee",
    fontWeight: "500",
  },
  radioButtonTextSelected: {
    color: "#fff",
  },
  entryPriceContainer: {
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
    fontStyle: "italic",
  },
  pipsInfoContainer: {
    backgroundColor: "rgba(98, 0, 238, 0.08)",
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  pipsInfoText: {
    fontSize: 12,
    color: "#6200ee",
    fontStyle: "italic",
  },
});
