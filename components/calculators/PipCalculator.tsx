import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useExchangeRates } from "@/contexts/ExchangeRateContext";
import {
  PageHeader,
  CurrencySelector,
  CurrencyModal,
  CurrencyPairSelector,
  CurrencyPairModal,
  LotSizeSelector,
  LotSizeEditorModal,
  PipInput,
  ResultCard,
  CalculatorModal,
} from "@/components";
import {
  currencies,
  currencyPairs,
  Currency,
  CurrencyPair,
} from "@/constants/currencies";
import {
  defaultLotSizes,
  LotSize,
  LotType,
  calculateTotalUnits,
} from "@/constants/lotSizes";
import {
  calculatePipValueInQuoteCurrency,
  calculatePipValueInAccountCurrency,
} from "@/utils/calculators";
import { fetchExchangeRate } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CalculatorScreenNavigationProp } from "@/types";
import CalculatorCard from "../ui/CalculatorCard";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";

// Storage keys
const ACCOUNT_CURRENCY_KEY = "forex-pip-calculator-account-currency";
const CURRENCY_PAIR_KEY = "forex-pip-calculator-currency-pair";
const LOT_SIZES_KEY = "forex-pip-calculator-lot-sizes";
const LOT_TYPE_KEY = "forex-pip-calculator-lot-type";
const LOT_COUNT_KEY = "forex-pip-calculator-lot-count";
const CUSTOM_UNITS_KEY = "forex-pip-calculator-custom-units";
const PIP_COUNT_KEY = "forex-pip-calculator-pip-count";
const PIP_DECIMAL_PLACES_KEY = "forex-pip-calculator-pip-decimal-places";

interface PipCalculatorProps {
  navigation: CalculatorScreenNavigationProp;
}

export default function PipCalculator() {
  const { colors, isDark } = useTheme();
  const { accountCurrency } = useExchangeRates();
  const [currencyPair, setCurrencyPair] = useState("EUR/USD");
  // Initialize currency with account currency from context
  const [currency, setCurrency] = useState<string>(accountCurrency.code);
  // State for currency selection
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(
    currencyPairs[0]
  );

  // Update currencyPair when selectedPair changes
  useEffect(() => {
    if (selectedPair) {
      setCurrencyPair(selectedPair.name);
    }
  }, [selectedPair]);

  // Update selectedPair when currencyPair changes
  useEffect(() => {
    const pair = currencyPairs.find((p) => p.name === currencyPair);
    if (pair) {
      setSelectedPair(pair);
    }
  }, [currencyPair]);

  // State for modals
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [pairModalVisible, setPairModalVisible] = useState(false);
  const [lotSizeEditorVisible, setLotSizeEditorVisible] = useState(false);
  const [pipCalculatorVisible, setPipCalculatorVisible] = useState(false);

  // State for lot size
  const [lotSizes, setLotSizes] =
    useState<Record<string, LotSize>>(defaultLotSizes);
  const [lotType, setLotType] = useState<LotType>("Standard");
  const [lotCount, setLotCount] = useState(1);
  const [customUnits, setCustomUnits] = useState(1);

  // State for pip input
  const [pipCount, setPipCount] = useState("10");
  const [pipDecimalPlaces, setPipDecimalPlaces] = useState(4);

  // State for calculation results and errors
  const [pipValueInQuoteCurrency, setPipValueInQuoteCurrency] = useState(0);
  const [pipValueInAccountCurrency, setPipValueInAccountCurrency] = useState(0);
  const [totalValueInQuoteCurrency, setTotalValueInQuoteCurrency] = useState(0);
  const [totalValueInAccountCurrency, setTotalValueInAccountCurrency] =
    useState(0);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for refresh control
  const [refreshing, setRefreshing] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load currency pair
        const savedCurrencyPair = await AsyncStorage.getItem(CURRENCY_PAIR_KEY);
        if (savedCurrencyPair) {
          const parsedPair = JSON.parse(savedCurrencyPair);
          setSelectedPair(parsedPair);
        }

        // Load lot sizes
        const savedLotSizes = await AsyncStorage.getItem(LOT_SIZES_KEY);
        if (savedLotSizes) {
          const parsedLotSizes = JSON.parse(savedLotSizes);
          setLotSizes(parsedLotSizes);
        }

        // Load lot type
        const savedLotType = await AsyncStorage.getItem(LOT_TYPE_KEY);
        if (savedLotType) {
          setLotType(savedLotType as LotType);
        }

        // Load lot count
        const savedLotCount = await AsyncStorage.getItem(LOT_COUNT_KEY);
        if (savedLotCount) {
          setLotCount(parseInt(savedLotCount));
        }

        // Load custom units
        const savedCustomUnits = await AsyncStorage.getItem(CUSTOM_UNITS_KEY);
        if (savedCustomUnits) {
          setCustomUnits(parseInt(savedCustomUnits));
        }

        // Load pip count
        const savedPipCount = await AsyncStorage.getItem(PIP_COUNT_KEY);
        if (savedPipCount) {
          setPipCount(savedPipCount);
        }

        // Load pip decimal places
        const savedPipDecimalPlaces = await AsyncStorage.getItem(
          PIP_DECIMAL_PLACES_KEY
        );
        if (savedPipDecimalPlaces) {
          setPipDecimalPlaces(parseInt(savedPipDecimalPlaces));
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
        await AsyncStorage.setItem(
          CURRENCY_PAIR_KEY,
          JSON.stringify(selectedPair)
        );

        await AsyncStorage.setItem(LOT_SIZES_KEY, JSON.stringify(lotSizes));

        await AsyncStorage.setItem(LOT_TYPE_KEY, lotType);

        await AsyncStorage.setItem(LOT_COUNT_KEY, lotCount.toString());

        await AsyncStorage.setItem(CUSTOM_UNITS_KEY, customUnits.toString());

        await AsyncStorage.setItem(PIP_COUNT_KEY, pipCount);

        await AsyncStorage.setItem(
          PIP_DECIMAL_PLACES_KEY,
          pipDecimalPlaces.toString()
        );
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    };

    savePreferences();
  }, [
    selectedPair,
    lotSizes,
    lotType,
    lotCount,
    customUnits,
    pipCount,
    pipDecimalPlaces,
  ]);

  // Calculate pip values when inputs change
  useEffect(() => {
    calculatePipValues();
  }, [
    accountCurrency,
    selectedPair,
    lotType,
    lotCount,
    customUnits,
    pipCount,
    pipDecimalPlaces,
  ]);

  // Calculate pip values
  const calculatePipValues = async () => {
    try {
      // Reset error message
      setErrorMessage(null);

      // Get position size
      const positionSize = calculateTotalUnits(
        lotType,
        lotCount,
        customUnits,
        lotSizes
      );

      // Get pip count as number
      const pipCountNum = parseFloat(pipCount) || 0;

      // Get currency pair object for calculations
      const currencyPairObj = currencyPairs.find(
        (p) => p.name === currencyPair
      );
      if (!currencyPairObj) {
        throw new Error(`Invalid currency pair: ${currencyPair}`);
      }

      // Calculate pip value in quote currency with the selected decimal place
      const pipValueQuote = calculatePipValueInQuoteCurrency(
        currencyPairObj,
        positionSize,
        pipCountNum,
        pipDecimalPlaces
      );
      setPipValueInQuoteCurrency(pipValueQuote);

      try {
        // Get exchange rate between quote currency and account currency
        // Professional trading platforms use this direct approach

        // If quote currency is the same as account currency
        if (currencyPairObj.quote === accountCurrency.code) {
          const rate = 1;
          setExchangeRate(rate);

          const pipValueAccount = calculatePipValueInAccountCurrency(
            pipValueQuote,
            currencyPairObj.quote,
            accountCurrency.code,
            rate
          );
          setPipValueInAccountCurrency(pipValueAccount);
          setTotalValueInQuoteCurrency(pipValueQuote * pipCountNum);
          setTotalValueInAccountCurrency(pipValueAccount * pipCountNum);
        }
        // For all other cases, get direct rate from quote to account currency
        else {
          // Get direct exchange rate from quote currency to account currency
          // This matches professional trading platforms' calculation logic
          const rate = await fetchExchangeRate(
            currencyPairObj.quote,
            accountCurrency.code
          );
          setExchangeRate(rate);

          const pipValueAccount = calculatePipValueInAccountCurrency(
            pipValueQuote,
            currencyPairObj.quote,
            accountCurrency.code,
            rate
          );
          setPipValueInAccountCurrency(pipValueAccount);
          setTotalValueInQuoteCurrency(pipValueQuote * pipCountNum);
          setTotalValueInAccountCurrency(pipValueAccount * pipCountNum);
        }
      } catch (error) {
        // Handle specific API errors
        if (error instanceof Error) {
          setErrorMessage(error.message);

          // If no internet, show alert
          if (error.message.includes("No internet connection")) {
            Alert.alert(
              "No Internet Connection",
              "Trading requires real-time exchange rates. Please connect to the internet."
            );
          } else if (
            error.message.includes("All forex data sources unavailable")
          ) {
            Alert.alert(
              "Exchange Rate Unavailable",
              "Unable to fetch accurate exchange rates at this time. Please try again later."
            );
          }
        } else {
          setErrorMessage(
            "Failed to fetch exchange rates. Please try again later."
          );
        }

        // Don't use cached rates for trading app - require fresh data
        throw new Error("Real-time rates required for accurate calculations");
      }
    } catch (error) {
      console.error("Error calculating pip values:", error);

      if (!errorMessage) {
        setErrorMessage(
          "Unable to perform calculation with real-time rates. Please try again."
        );
      }
    }
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await calculatePipValues();
    setRefreshing(false);
  }, [
    accountCurrency,
    selectedPair,
    lotType,
    lotCount,
    customUnits,
    pipCount,
    pipDecimalPlaces,
  ]);

  // Handle currency pair selection
  const handleCurrencyPairSelect = (pair: CurrencyPair) => {
    setSelectedPair(pair);
  };

  // Handle lot type change
  const handleLotTypeChange = (type: LotType) => {
    setLotType(type);
  };

  // Handle lot count change
  const handleLotCountChange = (count: number) => {
    setLotCount(count);
  };

  // Handle custom units change
  const handleCustomUnitsChange = (units: number) => {
    setCustomUnits(units);
  };

  // Handle lot sizes save
  const handleLotSizesSave = (newLotSizes: Record<string, LotSize>) => {
    setLotSizes(newLotSizes);
  };

  // Handle pip count change
  const handlePipCountChange = (text: string) => {
    // Allow only numbers and decimal point
    const filtered = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = filtered.split(".");
    if (parts.length > 2) {
      return;
    }

    setPipCount(filtered);
  };

  // Handle pip value from calculator
  const handlePipValueFromCalculator = (value: number) => {
    setPipCount(value.toString());
    setPipCalculatorVisible(false);
  };

  // Handle pip decimal places change
  const handlePipDecimalPlacesChange = (places: number) => {
    setPipDecimalPlaces(places);
  };

  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency.code);
  };





  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Currency Setup Card */}
          <CalculatorCard
            title="Currency Setup"
            subtitle="Select your account currency and currency pair"
          >
            <View>
              <AccountCurrencySelector
                value={currency}
                onChange={setCurrency}
              />

              <CurrencyPairSelector
                label="Currency Pair"
                selectedPair={currencyPair}
                onSelect={(pair) => setCurrencyPair(pair)}
              />
            </View>
          </CalculatorCard>

          {/* Position Size Card */}
          <CalculatorCard
            title="Position Size"
            subtitle="Set your position size"
          >
            <LotSizeSelector
              label="Position Size"
              lotType={lotType}
              lotCount={lotCount}
              customUnits={customUnits}
              lotSizes={lotSizes}
              onLotTypeChange={handleLotTypeChange}
              onLotCountChange={handleLotCountChange}
              onCustomUnitsChange={handleCustomUnitsChange}
              onEditPress={() => setLotSizeEditorVisible(true)}
            />
          </CalculatorCard>

          {/* Pip Input Card */}
          <CalculatorCard title="Pip Input" subtitle="Enter the number of pips">
            <PipInput
              value={pipCount}
              onChange={handlePipCountChange}
              onCalculatorPress={() => setPipCalculatorVisible(true)}
              pipDecimalPlaces={pipDecimalPlaces}
              onPipDecimalPlacesChange={handlePipDecimalPlacesChange}
            />
          </CalculatorCard>

          {/* Error Message */}
          {errorMessage && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: isDark
                    ? "rgba(220, 53, 69, 0.12)"
                    : "rgba(255, 235, 238, 0.9)",
                  borderColor: colors.error + "40",
                  borderWidth: 1,
                  borderRadius: 16,
                  ...Platform.select({
                    ios: {
                      shadowColor: colors.error + "30",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 2,
                    },
                  }),
                },
              ]}
            >
              <View style={styles.errorIconContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={20}
                  color={colors.error}
                />
              </View>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Results */}
          <View style={[styles.resultContainer]}>
            <ResultCard
              accountCurrency={accountCurrency}
              currencyPair={currencyPair}
              pipValueInQuoteCurrency={pipValueInQuoteCurrency}
              pipValueInAccountCurrency={pipValueInAccountCurrency}
              totalValueInQuoteCurrency={totalValueInQuoteCurrency}
              totalValueInAccountCurrency={totalValueInAccountCurrency}
              exchangeRate={exchangeRate}
              pipCount={parseFloat(pipCount) || 0}
              onRefresh={onRefresh}
              isRefreshing={refreshing}
              lotType={lotType}
              lotCount={lotCount}
              positionSize={calculateTotalUnits(
                lotType,
                lotCount,
                customUnits,
                lotSizes
              )}
              pipDecimalPlaces={pipDecimalPlaces}
              onHistorySaved={() => {
                // Display toast or subtle notification
                // You could add a visual feedback here if desired
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <CurrencyModal
          onClose={() => setCurrencyModalVisible(false)}
          onSelect={handleCurrencySelect}
          selectedCurrency={accountCurrency}
        />
      </Modal>

      <Modal
        visible={pairModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPairModalVisible(false)}
      >
        <CurrencyPairModal
          onClose={() => setPairModalVisible(false)}
          onSelect={handleCurrencyPairSelect}
          selectedPair={selectedPair}
        />
      </Modal>

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

      {/* Calculator Modal for Pip Value */}
      <Modal
        visible={pipCalculatorVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setPipCalculatorVisible(false)}
      >
        <CalculatorModal
          onClose={() => setPipCalculatorVisible(false)}
          onSubmit={handlePipValueFromCalculator}
          initialValue={pipCount}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 25,
    paddingTop: 16,
  },
  content: {},
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  calculateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  errorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(220, 53, 69, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    fontWeight: "500",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  infoBannerText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  card: {
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardContent: {
    padding: 17,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 4,
  },
  resultContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
  historyButton: {
    height: 40,
    width: 38,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 0,
  },
  historyButtonInner: {
    height: 38,
    width: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
});


