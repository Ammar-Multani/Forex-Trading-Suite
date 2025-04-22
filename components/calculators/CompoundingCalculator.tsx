import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import {
  TextInput,
  Text,
  Divider,
  Button,
  IconButton,
  Surface,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import Svg, { Path, Line, Text as SvgText, Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CalculatorCard from "../ui/CalculatorCard";
import ResultDisplay from "../ui/ResultDisplay";
import AccountCurrencySelector from "../ui/AccountCurrencySelector";
import { formatCurrency } from "../../utils/calculators";
import { useTheme } from "../../contexts/ThemeContext";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";
import { CURRENCIES } from "../../constants/currencies";
import { CurrencyCode, currencyData } from "../ui/CurrencyPickerModal";

// Type definition for calculation results
type CalculationResults = {
  endBalance: number;
  totalEarnings: number;
  growthData: { x: number; y: number }[];
  breakdownData: { period: number; earnings: number; balance: number }[];
  monthlyBreakdown: { period: number; earnings: number; balance: number }[];
  totalContributions: number;
  totalWithdrawals: number;
  totalTaxesPaid: number;
  timeToDouble: number;
  effectiveAnnualRate: number;
  allTimeRateOfReturn: number;
  lastEarnings: number;
  totalInterestEarned: number;
};

// Enhanced compound interest calculation with additional features
function calculateEnhancedCompoundInterest(
  principal: number,
  monthlyRate: number, // Now treating this as a monthly rate
  frequency: number,
  years: number,
  additionalContributions: number = 0,
  contributionFrequency: number = frequency,
  withdrawals: number = 0,
  withdrawalFrequency: number = frequency,
  taxRate: number = 0,
  compoundingFrequency: number = frequency
): CalculationResults {
  // Safety checks for all input parameters without rounding intermediary values
  principal = isNaN(principal) ? 0 : principal;
  monthlyRate = isNaN(monthlyRate) ? 0 : monthlyRate;
  frequency = isNaN(frequency) || frequency < 1 ? 1 : Math.round(frequency);
  years = isNaN(years) ? 0 : years;
  additionalContributions = isNaN(additionalContributions)
    ? 0
    : additionalContributions;
  contributionFrequency =
    isNaN(contributionFrequency) || contributionFrequency < 1
      ? frequency
      : Math.round(contributionFrequency);
  withdrawals = isNaN(withdrawals) ? 0 : withdrawals;
  withdrawalFrequency =
    isNaN(withdrawalFrequency) || withdrawalFrequency < 1
      ? frequency
      : Math.round(withdrawalFrequency);
  taxRate = isNaN(taxRate) ? 0 : taxRate;
  compoundingFrequency =
    isNaN(compoundingFrequency) || compoundingFrequency < 1
      ? frequency
      : Math.round(compoundingFrequency);

  // Calculate annualized rate for certain calculations (from monthly rate)
  const annualizedRate = monthlyRate * 12;

  // Early exit condition with appropriate return values
  if (
    years <= 0 ||
    (monthlyRate === 0 && additionalContributions === 0 && withdrawals === 0)
  ) {
    return {
      endBalance: principal,
      totalEarnings: 0,
      growthData: [
        { x: 0, y: principal },
        { x: 1, y: principal },
      ],
      breakdownData: [{ period: 0, earnings: 0, balance: principal }],
      monthlyBreakdown: [{ period: 0, earnings: 0, balance: principal }],
      totalContributions: principal,
      totalWithdrawals: 0,
      totalTaxesPaid: 0,
      timeToDouble: 0,
      effectiveAnnualRate: 0,
      allTimeRateOfReturn: 0,
      lastEarnings: 0,
      totalInterestEarned: 0,
    };
  }

  // Ensure we're calculating with the same approach as the reference app
  // For precision, calculate exact number of periods
  const periods = Math.max(1, Math.round(frequency * years));

  // Handle case where compounding frequency is higher than main frequency
  const periodsPerCompound =
    compoundingFrequency > frequency
      ? 1 / Math.round(compoundingFrequency / frequency)
      : Math.max(1, Math.round(frequency / compoundingFrequency));

  // Calculate rate per period - this is critical for matching reference app
  const ratePerPeriod = monthlyRate / 100; // Monthly rate as decimal

  // Initialize tracking variables
  let balance = principal;
  let totalContributions = principal;
  let totalWithdrawals = 0;
  let totalInterestEarned = 0;
  let lastEarnings = 0;
  let totalTaxesPaid = 0; // Initialize tax tracker

  // Initialize data arrays with initial values
  const growthData = [{ x: 0, y: principal }];
  const breakdownData = [{ period: 0, earnings: 0, balance: principal }];
  const monthlyBreakdown = [{ period: 0, earnings: 0, balance: principal }];

  // Main calculation loop - improved precision
  for (let i = 1; i <= periods; i++) {
    // Initialize interestEarned for this period
    let interestEarned = 0;

    // Calculate interest for this period - exact algorithm to match reference
    // For a monthly rate of 12%, we calculate as 0.12 (12% as decimal)
    interestEarned = balance * (monthlyRate / 100);
    totalInterestEarned += interestEarned;

    // Add interest to balance
    balance += interestEarned;

    // Apply tax on interest earnings
    const taxAmount = interestEarned * (taxRate / 100);
    totalTaxesPaid += taxAmount;
    balance -= taxAmount;

    // Add additional contribution if it's time and contributions are non-zero
    if (
      additionalContributions > 0 &&
      contributionFrequency > 0 &&
      i % Math.max(1, Math.round(frequency / contributionFrequency)) === 0
    ) {
      balance += additionalContributions;
      totalContributions += additionalContributions;
    }

    // Subtract withdrawal if it's time and withdrawals are non-zero
    if (
      withdrawals > 0 &&
      withdrawalFrequency > 0 &&
      i % Math.max(1, Math.round(frequency / withdrawalFrequency)) === 0
    ) {
      // Prevent negative balance
      const actualWithdrawal = Math.min(withdrawals, balance);
      balance -= actualWithdrawal;
      totalWithdrawals += actualWithdrawal;

      // If we couldn't withdraw the full amount, log a warning
      if (actualWithdrawal < withdrawals) {
        console.warn(
          `Withdrawal limited at period ${i} due to insufficient balance`
        );
      }
    }

    // Add to monthly breakdown for detailed view
    monthlyBreakdown.push({
      period: i,
      earnings: interestEarned,
      balance: balance,
    });

    // Add data point for each year or at the end
    if (i % frequency === 0 || i === periods) {
      const yearsPassed = i / frequency;
      growthData.push({
        x: yearsPassed,
        y: balance,
      });

      // Save breakdown data for each year
      breakdownData.push({
        period: yearsPassed,
        earnings: interestEarned,
        balance: balance,
      });

      // Save last period earnings
      if (i === periods) {
        lastEarnings = interestEarned;
      }
    }
  }

  // Calculate total earnings before tax
  const totalEarningsBeforeTax =
    balance - totalContributions + totalWithdrawals;

  // No need to calculate or apply tax at the end anymore since it's done periodically
  // We'll use the totalTaxesPaid that has been accumulating during the calculation

  // Final calculations without rounding intermediate values
  const endBalance = balance;
  const totalEarnings = endBalance - totalContributions + totalWithdrawals;

  // Calculate time to double investment (using Rule of 72)
  let timeToDouble = 0;
  if (monthlyRate > 0) {
    // Calculate months to double based on monthly rate
    timeToDouble = 72 / monthlyRate;
  }

  // Calculate effective annual rate (from monthly rate)
  let effectiveAnnualRate = 0;
  if (monthlyRate > 0) {
    effectiveAnnualRate = (Math.pow(1 + ratePerPeriod, 12) - 1) * 100;
  }

  // Calculate all-time rate of return
  let allTimeRateOfReturn = 0;
  if (totalContributions > 0 && totalEarnings !== 0) {
    allTimeRateOfReturn = (totalEarnings / totalContributions) * 100;
  }

  // Format final result values for display - only round at the very end
  return {
    endBalance: endBalance,
    totalEarnings: totalEarnings,
    growthData,
    breakdownData,
    monthlyBreakdown,
    totalContributions: totalContributions,
    totalWithdrawals: totalWithdrawals,
    totalTaxesPaid: totalTaxesPaid,
    timeToDouble: timeToDouble,
    effectiveAnnualRate: effectiveAnnualRate,
    allTimeRateOfReturn: allTimeRateOfReturn,
    lastEarnings: lastEarnings,
    totalInterestEarned: totalInterestEarned,
  };
}

// Custom modal-based frequency selector component
type FrequencyOption = { label: string; value: string };

const FrequencySelector = ({
  label,
  value,
  options,
  onChange,
  zIndex = 1000,
  disabled = false,
}: {
  label: string;
  value: string;
  options: FrequencyOption[];
  onChange: (value: string) => void;
  zIndex?: number;
  disabled?: boolean;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const dropdownButtonRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Find the selected label
  const selectedLabel =
    options.find((option) => option.value === value)?.label || "";

  // Reset value if not in options
  useEffect(() => {
    if (
      options.length > 0 &&
      !options.some((option) => option.value === value)
    ) {
      onChange(options[0].value);
    }
  }, [options, value, onChange]);

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

  // Close modal when options change
  useEffect(() => {
    setModalVisible(false);
  }, [options]);

  // Toggle dropdown with animation
  const openModal = () => {
    if (!disabled) {
      measureDropdownButton();
      setModalVisible(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeModal = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    closeModal();
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

  return (
    <View style={[styles.dropdownContainer, { zIndex }]}>
      <Text
        variant="bodySmall"
        style={{
          marginBottom: 8,
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          fontWeight: "500",
        }}
      >
        {label}
      </Text>

      {/* Dropdown-like button */}
      <TouchableOpacity
        style={[
          styles.customDropdown,
          {
            backgroundColor: isDark
              ? "rgba(42, 42, 52, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(0, 0, 0, 0.1)",
            borderWidth: 1.5,
            borderRadius: 16,
            shadowColor: isDark ? "#000" : "#5D4777",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={openModal}
        disabled={disabled}
        ref={dropdownButtonRef}
      >
        <Text
          style={{
            color: isDark ? "#fff" : "#000",
            fontWeight: "500",
            fontSize: 16,
            flex: 1,
          }}
        >
          {selectedLabel}
        </Text>
        <Ionicons
          name={modalVisible ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? "#B39DDB" : "#673AB7"}
        />
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark
                    ? "rgba(42, 42, 52, 0.98)"
                    : "rgba(255, 255, 255, 0.98)",
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
                  borderWidth: 1.5,
                  borderRadius: 16,
                  shadowColor: isDark ? "#000" : "#5D4777",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 5,
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  position: "absolute",
                  opacity: dropdownOpacity,
                  transform: [
                    { scale: dropdownScale },
                    { translateY: dropdownTranslateY },
                  ],
                },
              ]}
            >
              <ScrollView style={{ maxHeight: 300 }} bounces={false}>
                {options.map((option: FrequencyOption) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      value === option.value && {
                        backgroundColor: isDark
                          ? "rgba(138, 43, 226, 0.15)"
                          : "rgba(138, 43, 226, 0.08)",
                      },
                    ]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isDark ? "#fff" : "#000",
                          fontWeight: value === option.value ? "700" : "500",
                        },
                        value === option.value && {
                          color: isDark ? "#B39DDB" : "#673AB7",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={isDark ? "#B39DDB" : "#673AB7"}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default function CompoundingCalculator() {
  const { isDark } = useTheme();
  const { isLoading, lastUpdated, refreshRates, error } = useExchangeRates();

  // Basic inputs
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [startingBalance, setStartingBalance] = useState("0.00");
  const [rateOfReturn, setRateOfReturn] = useState("0");
  const [years, setYears] = useState("0");
  const [refreshing, setRefreshing] = useState(false);

  // Frequency dropdowns
  const [returnFrequencyOpen, setReturnFrequencyOpen] = useState(false);
  const [returnFrequency, setReturnFrequency] = useState("12"); // Monthly by default
  const [returnFrequencyItems, setReturnFrequencyItems] = useState([
    { label: "Monthly", value: "12" },
    { label: "Quarterly", value: "4" },
    { label: "Semi-annually", value: "2" },
    { label: "Annually", value: "1" },
  ]);

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [compoundingFrequencyOpen, setCompoundingFrequencyOpen] =
    useState(false);
  const [compoundingFrequency, setCompoundingFrequency] = useState("12"); // Monthly by default
  const [compoundingFrequencyItems, setCompoundingFrequencyItems] = useState([
    { label: "Monthly", value: "12" },
    { label: "Quarterly", value: "4" },
    { label: "Semi-annually", value: "2" },
    { label: "Annually", value: "1" },
    { label: "Daily", value: "365" },
  ]);

  const [additionalContributions, setAdditionalContributions] = useState("0");

  const [contributionFrequencyOpen, setContributionFrequencyOpen] =
    useState(false);
  const [contributionFrequency, setContributionFrequency] = useState("12"); // Monthly by default
  const [contributionFrequencyItems, setContributionFrequencyItems] = useState([
    { label: "Monthly", value: "12" },
    { label: "Quarterly", value: "4" },
    { label: "Semi-annually", value: "2" },
    { label: "Annually", value: "1" },
  ]);

  const [withdrawals, setWithdrawals] = useState("0");

  const [withdrawalFrequencyOpen, setWithdrawalFrequencyOpen] = useState(false);
  const [withdrawalFrequency, setWithdrawalFrequency] = useState("12"); // Monthly by default
  const [withdrawalFrequencyItems, setWithdrawalFrequencyItems] = useState([
    { label: "Monthly", value: "12" },
    { label: "Quarterly", value: "4" },
    { label: "Semi-annually", value: "2" },
    { label: "Annually", value: "1" },
  ]);

  const [taxRate, setTaxRate] = useState("0");

  // State to track if data has been loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  // Storage key for calculator data
  const STORAGE_KEY = "compounding_calculator_data";

  // Base frequency options for all dropdowns
  const baseFrequencyOptions = [
    { label: "Monthly", value: "12" },
    { label: "Quarterly", value: "4" },
    { label: "Semi-annually", value: "2" },
    { label: "Annually", value: "1" },
  ];

  // Special compounding options that include Daily
  const baseCompoundingOptions = [
    ...baseFrequencyOptions,
    { label: "Daily", value: "365" },
  ];

  // Effect to update available frequency options based on return frequency
  useEffect(() => {
    // Parse return frequency
    const returnFreqValue = parseInt(returnFrequency);

    // Filter options based on return frequency
    const filterFrequencyOptions = (
      options: FrequencyOption[]
    ): FrequencyOption[] => {
      // For monthly (12), all options are available
      if (returnFreqValue === 12) return options;

      // For quarterly (4), only quarterly, semi-annual, and annual are available
      if (returnFreqValue === 4) {
        return options.filter((item: FrequencyOption) =>
          ["4", "2", "1"].includes(item.value)
        );
      }

      // For semi-annually (2), only semi-annual and annual are available
      if (returnFreqValue === 2) {
        return options.filter((item: FrequencyOption) =>
          ["2", "1"].includes(item.value)
        );
      }

      // For annually (1), only annual is available
      if (returnFreqValue === 1) {
        return options.filter((item: FrequencyOption) =>
          ["1"].includes(item.value)
        );
      }

      return options;
    };

    // Update compounding frequency options - use 'Daily' only for monthly return frequency
    let newCompoundingOptions;
    if (returnFreqValue === 12) {
      newCompoundingOptions = [...baseCompoundingOptions];
    } else {
      newCompoundingOptions = filterFrequencyOptions(baseFrequencyOptions);
    }
    setCompoundingFrequencyItems(newCompoundingOptions);

    // Update contribution frequency options
    const newContributionOptions = filterFrequencyOptions(baseFrequencyOptions);
    setContributionFrequencyItems(newContributionOptions);

    // Update withdrawal frequency options
    const newWithdrawalOptions = filterFrequencyOptions(baseFrequencyOptions);
    setWithdrawalFrequencyItems(newWithdrawalOptions);

    // Ensure selected values are still valid
    const validateFrequency = (
      currentValue: string,
      options: FrequencyOption[]
    ): string => {
      // Check if current value is in available options
      const isValid = options.some(
        (option: FrequencyOption) => option.value === currentValue
      );

      if (!isValid && options.length > 0) {
        // Find the closest lower frequency or use the highest available
        const currentValueNum = parseInt(currentValue);

        // Sort options by value in descending order (higher frequency first)
        const sortedOptions = [...options].sort(
          (a, b) => parseInt(b.value) - parseInt(a.value)
        );

        // Try to find a value that's <= the current value
        for (const option of sortedOptions) {
          const optionValue = parseInt(option.value);
          if (optionValue <= currentValueNum) {
            return option.value;
          }
        }

        // If no suitable option found, use the first (highest) option
        return sortedOptions[0].value;
      }

      return currentValue;
    };

    // Update selected values if they're no longer valid
    const validCompoundingFreq = validateFrequency(
      compoundingFrequency,
      newCompoundingOptions
    );
    if (validCompoundingFreq !== compoundingFrequency) {
      setCompoundingFrequency(validCompoundingFreq);
    }

    const validContributionFreq = validateFrequency(
      contributionFrequency,
      newContributionOptions
    );
    if (validContributionFreq !== contributionFrequency) {
      setContributionFrequency(validContributionFreq);
    }

    const validWithdrawalFreq = validateFrequency(
      withdrawalFrequency,
      newWithdrawalOptions
    );
    if (validWithdrawalFreq !== withdrawalFrequency) {
      setWithdrawalFrequency(validWithdrawalFreq);
    }
  }, [returnFrequency]);

  // Load saved calculator data
  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Set all the state values from saved data
        if (parsedData.currency) setCurrency(parsedData.currency);
        if (parsedData.startingBalance)
          setStartingBalance(parsedData.startingBalance);
        if (parsedData.rateOfReturn) setRateOfReturn(parsedData.rateOfReturn);
        if (parsedData.years) setYears(parsedData.years);
        if (parsedData.returnFrequency)
          setReturnFrequency(parsedData.returnFrequency);
        if (parsedData.showAdvanced !== undefined)
          setShowAdvanced(parsedData.showAdvanced);
        if (parsedData.compoundingFrequency)
          setCompoundingFrequency(parsedData.compoundingFrequency);
        if (parsedData.additionalContributions)
          setAdditionalContributions(parsedData.additionalContributions);
        if (parsedData.contributionFrequency)
          setContributionFrequency(parsedData.contributionFrequency);
        if (parsedData.withdrawals) setWithdrawals(parsedData.withdrawals);
        if (parsedData.withdrawalFrequency)
          setWithdrawalFrequency(parsedData.withdrawalFrequency);
        if (parsedData.taxRate) setTaxRate(parsedData.taxRate);

        console.log("Calculator data loaded from storage");
      }
    } catch (error) {
      console.error("Error loading calculator data:", error);
    } finally {
      setDataLoaded(true);
    }
  };

  // Save calculator data
  const saveCalculatorData = async () => {
    // Only save if data has been loaded first to prevent overwriting with defaults
    if (!dataLoaded) return;

    try {
      const dataToSave = {
        currency,
        startingBalance,
        rateOfReturn,
        years,
        returnFrequency,
        showAdvanced,
        compoundingFrequency,
        additionalContributions,
        contributionFrequency,
        withdrawals,
        withdrawalFrequency,
        taxRate,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("Calculator data saved to storage");
    } catch (error) {
      console.error("Error saving calculator data:", error);
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save data whenever input values change
  useEffect(() => {
    saveCalculatorData();
  }, [
    currency,
    startingBalance,
    rateOfReturn,
    years,
    returnFrequency,
    showAdvanced,
    compoundingFrequency,
    additionalContributions,
    contributionFrequency,
    withdrawals,
    withdrawalFrequency,
    taxRate,
    dataLoaded, // Include dataLoaded to avoid saving before loading
  ]);

  // Results
  const [results, setResults] = useState({
    endBalance: 0,
    totalEarnings: 0,
    growthData: [{ x: 0, y: 0 }],
    breakdownData: [{ period: 0, earnings: 0, balance: 0 }],
    monthlyBreakdown: [{ period: 0, earnings: 0, balance: 0 }],
    totalContributions: 0,
    totalWithdrawals: 0,
    totalTaxesPaid: 0,
    timeToDouble: 0,
    effectiveAnnualRate: 0,
    allTimeRateOfReturn: 0,
    lastEarnings: 0,
    totalInterestEarned: 0,
  });

  // UI state
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Handle refreshing rates
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    startingBalance,
    rateOfReturn,
    returnFrequency,
    years,
    compoundingFrequency,
    additionalContributions,
    contributionFrequency,
    withdrawals,
    withdrawalFrequency,
    taxRate,
  ]);

  // Calculate results function with completely robust handling of zeros and empty values
  const calculateResults = () => {
    try {
      // Handle empty inputs and zero values explicitly
      // Parse all numeric values without rounding intermediate steps
      const principal =
        startingBalance === "" ? 0 : parseFloat(startingBalance);
      const rateOfReturnValue =
        rateOfReturn === "" ? 0 : parseFloat(rateOfReturn);
      const returnFrequencyNum =
        returnFrequency === "" ? 1 : Number(returnFrequency);
      const yearsNum = years === "" ? 0 : parseFloat(years);

      // Handle the rest of the inputs similarly without rounding
      const compoundingFrequencyNum =
        compoundingFrequency === ""
          ? returnFrequencyNum
          : Number(compoundingFrequency);

      const additionalContributionsNum =
        additionalContributions === ""
          ? 0
          : parseFloat(additionalContributions);

      const contributionFrequencyNum =
        contributionFrequency === ""
          ? returnFrequencyNum
          : Number(contributionFrequency);

      const withdrawalsNum = withdrawals === "" ? 0 : parseFloat(withdrawals);

      const withdrawalFrequencyNum =
        withdrawalFrequency === ""
          ? returnFrequencyNum
          : Number(withdrawalFrequency);

      const taxRateNum = taxRate === "" ? 0 : parseFloat(taxRate);

      // Critical fix: The reference app uses the input rate directly
      // regardless of frequency (e.g., 2% monthly means 2% each month)
      const periodicRate = rateOfReturnValue;

      // Special handling for unreasonable inputs to prevent calculation errors
      if (rateOfReturnValue < 0 || rateOfReturnValue > 1000) {
        console.warn(
          "Annual rate out of reasonable bounds:",
          rateOfReturnValue
        );
      }

      if (yearsNum < 0 || yearsNum > 200) {
        console.warn("Years out of reasonable bounds:", yearsNum);
      }

      // Calculate total number of periods
      const periods = Math.round(yearsNum * returnFrequencyNum);

      // Input validation
      if (
        isNaN(principal) ||
        isNaN(periodicRate) ||
        isNaN(yearsNum) ||
        periods <= 0
      ) {
        console.warn("Invalid input values detected");
        setResults({
          endBalance: 0,
          totalEarnings: 0,
          growthData: [{ x: 0, y: 0 }],
          breakdownData: [{ period: 0, earnings: 0, balance: 0 }],
          monthlyBreakdown: [{ period: 0, earnings: 0, balance: 0 }],
          totalContributions: principal,
          totalWithdrawals: 0,
          totalTaxesPaid: 0,
          timeToDouble: 0,
          effectiveAnnualRate: 0,
          allTimeRateOfReturn: 0,
          lastEarnings: 0,
          totalInterestEarned: 0,
        });
        return;
      }

      // Initialize tracking variables - use exact precision, no rounding
      let balance = principal;
      let totalInterestEarned = 0;
      let totalContributions = principal; // Include initial principal
      let totalWithdrawals = 0;
      let lastPeriodInterest = 0;
      let totalTaxesPaid = 0; // Initialize tax tracker

      // Track growth for charting
      const growthData = [{ x: 0, y: principal }];
      const breakdownData = [{ period: 0, earnings: 0, balance: principal }];
      const monthlyBreakdown = [{ period: 0, earnings: 0, balance: principal }];

      // Debug logging to verify calculation inputs
      console.log("Starting calculation with:", {
        principal,
        periodicRate,
        returnFrequencyNum,
        yearsNum,
        periods,
        compoundingFrequencyNum,
        additionalContributionsNum,
        contributionFrequencyNum,
        withdrawalsNum,
        withdrawalFrequencyNum,
        taxRateNum,
      });

      // Calculate interest for each period with exact precision
      for (let i = 0; i < periods; i++) {
        // Initialize interestEarned for this period
        let interestEarned = 0;

        // Check if this is a compounding period
        const isCompoundingPeriod =
          compoundingFrequencyNum >= returnFrequencyNum ||
          (i + 1) % Math.round(returnFrequencyNum / compoundingFrequencyNum) ===
            0;

        // First process contributions (start of period)
        if (additionalContributionsNum > 0 && contributionFrequencyNum > 0) {
          const contributionPeriod = Math.round(
            returnFrequencyNum / contributionFrequencyNum
          );
          if ((i + 1) % contributionPeriod === 0) {
            balance += additionalContributionsNum;
            totalContributions += additionalContributionsNum;
          }
        }

        // Then process withdrawals (middle of period)
        if (withdrawalsNum > 0 && withdrawalFrequencyNum > 0) {
          const withdrawalPeriod = Math.round(
            returnFrequencyNum / withdrawalFrequencyNum
          );
          if ((i + 1) % withdrawalPeriod === 0) {
            const actualWithdrawal = Math.min(withdrawalsNum, balance);
            balance -= actualWithdrawal;
            totalWithdrawals += actualWithdrawal;
          }
        }

        // Finally calculate interest for compounding periods only
        if (isCompoundingPeriod) {
          // For quarterly compounding (4 times a year)
          if (compoundingFrequencyNum === 4 && returnFrequencyNum === 12) {
            // Special case: Quarterly compounding with monthly return frequency
            // Calculate 3 months of interest at once
            const monthlyRateDecimal = periodicRate / 100; // Convert to decimal
            const quarterlyRate = monthlyRateDecimal * 3; // Simple quarterly rate without compounding
            interestEarned = balance * quarterlyRate;
          } else {
            // Regular rate calculation for other frequencies
            const rateDecimal = periodicRate / 100; // Convert to decimal

            // Calculate effective rate for the period
            const periodsPerCompound = Math.round(
              returnFrequencyNum / compoundingFrequencyNum
            );
            const effectiveRate =
              periodsPerCompound > 1
                ? rateDecimal * periodsPerCompound // Simple multiplication for less frequent compounding
                : rateDecimal; // Regular rate for normal compounding

            interestEarned = balance * effectiveRate;
          }

          // Add interest to balance
          balance += interestEarned;
          totalInterestEarned += interestEarned;
          lastPeriodInterest = interestEarned;

          // Apply tax on this period's interest earnings
          const taxAmount = interestEarned * (taxRateNum / 100);
          balance -= taxAmount;
          // Keep track of the taxes paid
          totalTaxesPaid += taxAmount;
        }

        // Store breakdown data for this period
        monthlyBreakdown.push({
          period: i + 1,
          earnings: interestEarned,
          balance: balance,
        });

        // Track yearly progress for chart
        if ((i + 1) % returnFrequencyNum === 0 || i === periods - 1) {
          const yearsPassed = (i + 1) / returnFrequencyNum;
          growthData.push({
            x: yearsPassed,
            y: balance,
          });

          breakdownData.push({
            period: yearsPassed,
            earnings: interestEarned,
            balance: balance,
          });
        }
      }

      // Calculate earnings (tax is already applied periodically)
      const earningsBeforeTax = balance - totalContributions + totalWithdrawals;

      // No need to calculate or apply tax at the end anymore since it's done periodically
      // We'll use the totalTaxesPaid that has been accumulating during the calculation

      // Final calculations
      const totalEarnings = balance - totalContributions + totalWithdrawals;

      // Calculate the final metrics with precise formulas

      // Effective annual rate calculation
      // For monthly 2% returns, this should be (1 + 0.02)^12 - 1 = 26.82% annually
      const effectiveAnnualRate =
        Math.pow(1 + periodicRate / 100, returnFrequencyNum) * 100 - 100;

      // Time to double using the rule of 72 with the effective annual rate
      const timeToDouble = 72 / (periodicRate * (returnFrequencyNum / 12));

      // All-time rate of return as percentage of contributions
      const allTimeRateOfReturn =
        totalContributions > 0 ? (totalEarnings / totalContributions) * 100 : 0;

      // Set final results with all calculated values
      setResults({
        endBalance: balance,
        totalEarnings,
        growthData,
        breakdownData,
        monthlyBreakdown,
        totalContributions,
        totalWithdrawals,
        totalTaxesPaid,
        timeToDouble,
        effectiveAnnualRate,
        allTimeRateOfReturn,
        lastEarnings: lastPeriodInterest,
        totalInterestEarned,
      });
    } catch (error) {
      // Comprehensive error handling
      console.error("Calculation error:", error);
      const defaultResults: CalculationResults = {
        endBalance: 0,
        totalEarnings: 0,
        growthData: [{ x: 0, y: 0 }],
        breakdownData: [{ period: 0, earnings: 0, balance: 0 }],
        monthlyBreakdown: [{ period: 0, earnings: 0, balance: 0 }],
        totalContributions: 0,
        totalWithdrawals: 0,
        totalTaxesPaid: 0,
        timeToDouble: 0,
        effectiveAnnualRate: 0,
        allTimeRateOfReturn: 0,
        lastEarnings: 0,
        totalInterestEarned: 0,
      };
      setResults(defaultResults);
    }
  };

  // Improved text input handler to properly handle "0" inputs
  const handleNumericInput = (
    text: string,
    setter: (value: string) => void
  ) => {
    // Special handling for empty string and "0"
    if (text === "" || text === "0") {
      setter(text);
      return;
    }

    // Allow valid decimal numbers (including leading decimal point)
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (numericRegex.test(text)) {
      // Remove leading zeros if not a decimal (e.g., "01" becomes "1")
      if (text.length > 1 && text[0] === "0" && text[1] !== ".") {
        setter(text.replace(/^0+/, ""));
      } else {
        setter(text);
      }
    }
  };

  // Simple chart rendering with improved appearance for 2025 UI standards
  const renderChart = () => {
    // Ensure we have valid data and more than one point
    if (results.growthData.length < 2) return null;

    // Check if all values are zero or near-zero
    const hasNonZeroValues = results.growthData.some((point) => point.y > 0.01);
    if (!hasNonZeroValues) {
      // Return a placeholder chart with a "No Data" message
      return (
        <View
          style={{
            height: 260,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark
              ? "rgba(30, 30, 40, 0.2)"
              : "rgba(245, 245, 250, 0.5)",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            padding: 20,
          }}
        >
          <Ionicons
            name="analytics-outline"
            size={48}
            color={isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)"}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Enter non-zero values to see growth chart
          </Text>
        </View>
      );
    }

    const chartWidth = Dimensions.get("window").width - 104;
    const chartHeight = 260; // Increased height
    const paddingLeft = 50; // Increased left padding
    const paddingBottom = 40;
    const paddingTop = 20; // Added top padding
    const paddingRight = 20; // Added right padding
    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingBottom - paddingTop;

    // Find max value for scaling, with a minimum to prevent zero division
    const maxValue = Math.max(0.01, ...results.growthData.map((d) => d.y));
    const minValue = 0;

    // Create path for the line
    let path = "";
    results.growthData.forEach((point, index) => {
      // Prevent NaN in path
      if (isNaN(point.x) || isNaN(point.y)) {
        return;
      }

      // Calculate positions - adding safeguards against NaN
      const xDivisor = results.growthData[results.growthData.length - 1].x || 1; // Prevent divide by zero
      const x = paddingLeft + ((point.x || 0) / xDivisor) * graphWidth;

      const y =
        chartHeight -
        paddingBottom -
        (((point.y || 0) - minValue) / (maxValue - minValue || 1)) *
          graphHeight;

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    // Check if path is empty or invalid
    if (!path || path === "M NaN NaN" || path.includes("NaN")) {
      path = `M ${paddingLeft} ${chartHeight - paddingBottom} L ${
        paddingLeft + graphWidth
      } ${chartHeight - paddingBottom}`;
    }

    // Create area fill path with safety checks
    let areaPath =
      path +
      ` L ${paddingLeft + graphWidth} ${
        chartHeight - paddingBottom
      } L ${paddingLeft} ${chartHeight - paddingBottom} Z`;

    // Create x-axis labels
    const xLabels = [];
    for (
      let i = 0;
      i < results.growthData.length;
      i += Math.max(1, Math.floor(results.growthData.length / 5))
    ) {
      const point = results.growthData[i];
      const x =
        paddingLeft +
        (point.x / results.growthData[results.growthData.length - 1].x) *
          graphWidth;
      xLabels.push(
        <SvgText
          key={`x-${i}`}
          x={x}
          y={chartHeight - 10}
          fontSize="11"
          fontWeight="500"
          fill={isDark ? "#aaa" : "#666"}
          textAnchor="middle"
        >
          {`${point.x}yr`}
        </SvgText>
      );
    }

    // Create y-axis labels with better positioning
    const yLabels = [];
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
      const value = minValue + (i / numYLabels) * (maxValue - minValue);
      const y = chartHeight - paddingBottom - (i / numYLabels) * graphHeight;
      yLabels.push(
        <SvgText
          key={`y-${i}`}
          x={paddingLeft - 8} // Increased spacing from axis
          y={y + 4}
          fontSize="10"
          fontWeight="500"
          fill={isDark ? "#aaa" : "#666"}
          textAnchor="end"
        >
          {value >= 1000000
            ? `${Math.round(value / 1000000)}M`
            : value >= 1000
            ? `${Math.round(value / 1000)}k`
            : Math.round(value)}
        </SvgText>
      );
    }

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Background grid */}
        {Array.from({ length: numYLabels + 1 }).map((_, i) => (
          <Line
            key={`grid-${i}`}
            x1={paddingLeft}
            y1={chartHeight - paddingBottom - (i / numYLabels) * graphHeight}
            x2={paddingLeft + graphWidth}
            y2={chartHeight - paddingBottom - (i / numYLabels) * graphHeight}
            stroke={
              isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"
            }
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Area fill with solid color instead of gradient */}
        <Path
          d={areaPath}
          fill={isDark ? "#9370DB" : "#C3B1E1"}
          fillOpacity="0.2"
        />

        {/* X-axis */}
        <Line
          x1={paddingLeft}
          y1={chartHeight - paddingBottom}
          x2={paddingLeft + graphWidth}
          y2={chartHeight - paddingBottom}
          stroke={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}
          strokeWidth="1"
        />

        {/* Y-axis */}
        <Line
          x1={paddingLeft}
          y1={paddingTop}
          y2={chartHeight - paddingBottom}
          x2={paddingLeft}
          stroke={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}
          strokeWidth="1"
        />

        {/* Line chart */}
        <Path
          d={path}
          fill="none"
          stroke={isDark ? "#9370DB" : "#7B68EE"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data point circles */}
        {results.growthData.map((point, index) => {
          // Skip invalid points
          if (isNaN(point.x) || isNaN(point.y)) {
            return null;
          }

          // Safe calculation with fallbacks
          const xDivisor =
            results.growthData[results.growthData.length - 1].x || 1;
          const x = paddingLeft + ((point.x || 0) / xDivisor) * graphWidth;

          const y =
            chartHeight -
            paddingBottom -
            (((point.y || 0) - minValue) / (maxValue - minValue || 1)) *
              graphHeight;

          // Skip rendering points with invalid coordinates
          if (isNaN(x) || isNaN(y)) {
            return null;
          }

          return (
            <Circle
              key={`point-${index}`}
              cx={x}
              cy={y}
              r={index === results.growthData.length - 1 ? 6 : 4}
              fill={
                index === results.growthData.length - 1
                  ? "#fff"
                  : isDark
                  ? "#9370DB"
                  : "#7B68EE"
              }
              stroke={isDark ? "#9370DB" : "#7B68EE"}
              strokeWidth={index === results.growthData.length - 1 ? 3 : 2}
            />
          );
        })}

        {/* X-axis labels */}
        {xLabels}

        {/* Y-axis labels */}
        {yLabels}
      </Svg>
    );
  };

  // Custom formatted currency display to match reference exactly
  const formatCurrencyWithSymbol = (value: number, currency: CurrencyCode) => {
    // Handle NaN, undefined, invalid values, or explicitly zero
    if (isNaN(value) || value === undefined) {
      return `${currencyData[currency]?.symbol || ""}0.00`;
    }

    // Get currency symbol from currencyData
    const symbol = currencyData[currency]?.symbol || "";

    // Special case for zero to prevent formatting issues
    if (value === 0) {
      return `${symbol}0.00`;
    }

    // Format with commas and proper decimal places to match reference
    try {
      // For large numbers, avoid scientific notation
      let formattedValue;
      if (value >= 1e12) {
        // Trillion or more
        formattedValue = value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          notation: "standard",
        });
      } else {
        formattedValue = value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      return `${symbol}${formattedValue}`;
    } catch (error) {
      console.error("Formatting error:", error, "Value:", value);
      // Fallback if formatting fails
      return `${symbol}${value.toString()}`;
    }
  };

  // Show modal
  const showModal = () => {
    setShowBreakdown(true);
  };

  // Hide modal
  const hideModal = () => {
    setShowBreakdown(false);
  };

  // Render breakdown table with modern 2025 UI standards
  const renderBreakdown = () => {
    if (!showBreakdown) return null;

    return (
      <Modal
        visible={showBreakdown}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.breakdownModal,
              {
                backgroundColor: isDark
                  ? "rgba(45, 45, 55, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(200, 200, 220, 0.8)",
                shadowColor: isDark ? "#000" : "#5D4777",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text
                variant="headlineSmall"
                style={{
                  color: isDark ? "#fff" : "#000",
                  fontWeight: "700",
                  textAlign: "left",
                  flex: 1,
                }}
              >
                Detailed Breakdown
              </Text>
              <TouchableOpacity
                onPress={hideModal}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.breakdownSummary}>
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: isDark
                      ? "rgba(80, 70, 180, 0.3)"
                      : "rgba(230, 230, 250, 0.9)",
                    borderColor: isDark
                      ? "rgba(100, 80, 255, 0.3)"
                      : "rgba(180, 180, 250, 0.5)",
                  },
                ]}
              >
                <Text
                  style={{
                    color: isDark ? "#B39DDB" : "#673AB7",
                    fontSize: 14,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  FINAL BALANCE
                </Text>
                <Text
                  style={{
                    color: isDark ? "#B39DDB" : "#673AB7",
                    fontSize: 20,
                    fontWeight: "500",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  {formatCurrencyWithSymbol(results.endBalance, currency)}
                </Text>
              </View>

              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 150, 136, 0.3)"
                      : "rgba(200, 250, 240, 0.9)",
                    borderColor: isDark
                      ? "rgba(0, 200, 180, 0.3)"
                      : "rgba(100, 220, 200, 0.5)",
                  },
                ]}
              >
                <Text
                  style={{
                    color: isDark ? "#80CBC4" : "#00796B",
                    fontSize: 14,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  TOTAL EARNINGS
                </Text>
                <Text
                  style={{
                    color: isDark ? "#80CBC4" : "#00796B",
                    fontSize: 20,
                    fontWeight: "400",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  {formatCurrencyWithSymbol(results.totalEarnings, currency)}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.tableContainer,
                {
                  backgroundColor: isDark
                    ? "rgba(30, 30, 40, 0.7)"
                    : "rgba(250, 250, 255, 0.9)",
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(200, 200, 220, 0.5)",
                },
              ]}
            >
              <View
                style={[
                  styles.breakdownTableHeader,
                  {
                    backgroundColor: isDark
                      ? "rgba(60, 60, 75, 0.9)"
                      : "rgba(245, 245, 250, 0.9)",
                    borderBottomWidth: 2,
                    borderBottomColor: isDark
                      ? "rgba(100, 100, 140, 0.3)"
                      : "rgba(180, 180, 220, 0.5)",
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.breakdownHeaderCell,
                    {
                      flex: 0.6,
                      color: isDark ? "#B39DDB" : "#673AB7",
                      fontWeight: "400",
                      fontSize: 12,
                      textAlign: "center",
                    },
                  ]}
                >
                  PERIOD
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.breakdownHeaderCell,
                    {
                      color: isDark ? "#81D4FA" : "#2196F3",
                      fontWeight: "400",
                      fontSize: 12,
                      textAlign: "center",
                    },
                  ]}
                >
                  EARNINGS
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.breakdownHeaderCell,
                    {
                      color: isDark ? "#A5D6A7" : "#4CAF50",
                      fontWeight: "400",
                      fontSize: 12,
                      textAlign: "right",
                    },
                  ]}
                >
                  ENDING BALANCE
                </Text>
              </View>

              <ScrollView
                style={styles.breakdownTable}
                showsVerticalScrollIndicator={true}
                indicatorStyle={isDark ? "white" : "black"}
              >
                {results.monthlyBreakdown.map((item, index) => {
                  if (index === 0) return null; // Skip the initial period with 0 earnings

                  return (
                    <View
                      key={`breakdown-${index}`}
                      style={[
                        styles.breakdownRow,
                        {
                          backgroundColor:
                            index % 2 === 0
                              ? isDark
                                ? "rgba(45, 45, 55, 0.6)"
                                : "rgba(248, 248, 248, 0.8)"
                              : isDark
                              ? "rgba(55, 55, 65, 0.6)"
                              : "rgba(255, 255, 255, 0.8)",
                          borderBottomColor: isDark
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                          borderBottomWidth: 1,
                          paddingVertical: 8,
                        },
                      ]}
                    >
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.breakdownCell,
                          {
                            flex: 0.2,
                            fontWeight: "500",
                            color: isDark
                              ? "rgba(255, 255, 255, 0.9)"
                              : "rgba(0, 0, 0, 0.9)",
                            textAlign: "center",
                            fontSize: 14,
                          },
                        ]}
                      >
                        {index}
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.breakdownCell,
                          {
                            color: isDark ? "#81D4FA" : "#2196F3",
                            fontWeight: "500",
                            textAlign: "right",
                            fontSize: 14,
                          },
                        ]}
                      >
                        {formatCurrencyWithSymbol(item.earnings, currency)}
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.breakdownCell,
                          {
                            color: isDark ? "#A5D6A7" : "#4CAF50",
                            fontWeight: "500",
                            textAlign: "right",
                            fontSize: 14,
                          },
                        ]}
                      >
                        {formatCurrencyWithSymbol(item.balance, currency)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Dynamic glassmorphism styles that depend on theme
  const glassmorphismStyle = {
    backgroundColor: isDark
      ? "rgba(30, 30, 40, 0.25)"
      : "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: isDark
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(226, 226, 226, 0.8)",
    shadowColor: isDark ? "#000" : "#5D4777",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  };

  // Other theme-dependent styles with proper typing
  const metricLabelStyle = {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 8,
    color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
  };

  // Display error if there is one
  if (error) {
    return (
      <CalculatorCard title="Compounding Calculator">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshRates}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </CalculatorCard>
    );
  }

  // Reset all values and clear saved data
  const handleResetAll = async () => {
    try {
      // Remove saved data
      await AsyncStorage.removeItem(STORAGE_KEY);

      // Reset all form values to defaults
      setCurrency("USD");
      setStartingBalance("0.00");
      setRateOfReturn("0");
      setYears("0");
      setReturnFrequency("12");
      setShowAdvanced(false);
      setCompoundingFrequency("12");
      setAdditionalContributions("0");
      setContributionFrequency("12");
      setWithdrawals("0");
      setWithdrawalFrequency("12");
      setTaxRate("0");

      // Recalculate with default values
      calculateResults();

      console.log("Calculator data reset successfully");
    } catch (error) {
      console.error("Error resetting calculator data:", error);
    }
  };

  // Add a reset button to the UI
  const renderResetButton = () => (
    <View style={styles.resetButtonContainer}>
      <TouchableOpacity
        style={[
          styles.resetButton,
          {
            backgroundColor: isDark
              ? "rgba(244, 67, 54, 0.2)"
              : "rgba(244, 67, 54, 0.1)",
            borderColor: isDark
              ? "rgba(244, 67, 54, 0.4)"
              : "rgba(244, 67, 54, 0.2)",
          },
        ]}
        onPress={handleResetAll}
      >
        <Ionicons
          name="refresh-circle-outline"
          size={18}
          color={isDark ? "#EF5350" : "#D32F2F"}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: isDark ? "#EF5350" : "#D32F2F",
            fontWeight: "600",
            fontSize: 13,
          }}
        >
          Reset Calculator
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Currency setup section */}
        <View style={[styles.sectionContainer, glassmorphismStyle]}>
          <View style={styles.sectionHeaderRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDark
                    ? "rgba(138, 43, 226, 0.25)"
                    : "rgba(138, 43, 226, 0.15)",
                },
              ]}
            >
              <Ionicons name="cash-outline" size={22} color="#9370DB" />
            </View>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              Currency
            </Text>
          </View>

          <AccountCurrencySelector value={currency} onChange={setCurrency} />
        </View>

        {/* Basic inputs section */}
        <View style={[styles.sectionContainer, glassmorphismStyle]}>
          <View style={styles.sectionHeaderRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDark
                    ? "rgba(138, 43, 226, 0.25)"
                    : "rgba(138, 43, 226, 0.15)",
                },
              ]}
            >
              <Ionicons name="calculator-outline" size={22} color="#9370DB" />
            </View>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              Investment Details
            </Text>
          </View>

          <TextInput
            label="Starting Balance"
            value={startingBalance}
            onChangeText={(text) =>
              handleNumericInput(text, setStartingBalance)
            }
            keyboardType="numeric"
            left={
              <TextInput.Affix text={currencyData[currency]?.symbol || ""} />
            }
            style={[styles.input, styles.modernInput]}
            mode="outlined"
            outlineColor={
              isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
            }
            activeOutlineColor="#9370DB"
            textColor={isDark ? "#fff" : "#000"}
            theme={{
              colors: {
                background: isDark
                  ? "rgba(42, 42, 42, 0.7)"
                  : "rgba(245, 245, 245, 0.7)",
                onSurfaceVariant: isDark ? "#aaa" : "#666",
              },
            }}
          />

          <TextInput
            label="Monthly Rate of Return"
            value={rateOfReturn}
            onChangeText={(text) => handleNumericInput(text, setRateOfReturn)}
            keyboardType="numeric"
            right={<TextInput.Affix text="%" />}
            style={[styles.input, styles.modernInput]}
            mode="outlined"
            outlineColor={
              isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
            }
            activeOutlineColor="#9370DB"
            textColor={isDark ? "#fff" : "#000"}
            theme={{
              colors: {
                background: isDark
                  ? "rgba(42, 42, 42, 0.7)"
                  : "rgba(245, 245, 245, 0.7)",
                onSurfaceVariant: isDark ? "#aaa" : "#666",
              },
            }}
          />

          <FrequencySelector
            label="Return Frequency"
            value={returnFrequency}
            options={returnFrequencyItems}
            onChange={setReturnFrequency}
            zIndex={3000}
          />

          <TextInput
            label="Duration in Years"
            value={years}
            onChangeText={(text) => handleNumericInput(text, setYears)}
            keyboardType="numeric"
            style={[styles.input, styles.modernInput]}
            mode="outlined"
            outlineColor={
              isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
            }
            activeOutlineColor="#9370DB"
            textColor={isDark ? "#fff" : "#000"}
            theme={{
              colors: {
                background: isDark
                  ? "rgba(42, 42, 42, 0.7)"
                  : "rgba(245, 245, 245, 0.7)",
                onSurfaceVariant: isDark ? "#aaa" : "#666",
              },
            }}
          />

          <TouchableOpacity
            style={[
              styles.advancedButton,
              styles.modernAdvancedButton,
              {
                backgroundColor: isDark
                  ? "rgba(138, 43, 226, 0.15)"
                  : "rgba(138, 43, 226, 0.08)",
                borderColor: isDark
                  ? "rgba(138, 43, 226, 0.3)"
                  : "rgba(138, 43, 226, 0.2)",
              },
            ]}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text
              variant="bodyMedium"
              style={{
                color: isDark ? "#E6E6FA" : "#483D8B",
                fontWeight: "600",
              }}
            >
              ADVANCED
            </Text>
            <Ionicons
              name={showAdvanced ? "chevron-up" : "chevron-down"}
              size={20}
              color={isDark ? "#E6E6FA" : "#483D8B"}
            />
          </TouchableOpacity>

          {showAdvanced && (
            <View style={styles.advancedOptions}>
              <FrequencySelector
                label="Compounding Frequency"
                value={compoundingFrequency}
                options={compoundingFrequencyItems}
                onChange={setCompoundingFrequency}
                zIndex={2900}
              />

              <View style={styles.advancedSectionHeader}>
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color={isDark ? "#B39DDB" : "#673AB7"}
                />
                <Text
                  style={[
                    styles.advancedSectionTitle,
                    { color: isDark ? "#B39DDB" : "#673AB7" },
                  ]}
                >
                  Contributions
                </Text>
              </View>

              <TextInput
                label="Additional Contributions"
                value={additionalContributions}
                onChangeText={(text) =>
                  handleNumericInput(text, setAdditionalContributions)
                }
                keyboardType="numeric"
                left={
                  <TextInput.Affix
                    text={currencyData[currency]?.symbol || ""}
                  />
                }
                style={[styles.input, styles.modernInput]}
                mode="outlined"
                outlineColor={
                  isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
                }
                activeOutlineColor="#9370DB"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: isDark
                      ? "rgba(42, 42, 42, 0.7)"
                      : "rgba(245, 245, 245, 0.7)",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />

              <FrequencySelector
                label="Contribution Frequency"
                value={contributionFrequency}
                options={contributionFrequencyItems}
                onChange={setContributionFrequency}
                zIndex={2800}
                disabled={Number(additionalContributions) === 0}
              />

              {Number(additionalContributions) > 0 && (
                <View style={styles.impactIndicator}>
                  <Text
                    style={{
                      color: isDark ? "#A5D6A7" : "#4CAF50",
                      fontSize: 13,
                    }}
                  >
                    {`+${formatCurrencyWithSymbol(
                      Number(additionalContributions) *
                        (Number(years) * Number(contributionFrequency)),
                      currency
                    )} over entire period`}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.divider,
                  {
                    marginVertical: 20,
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                ]}
              />

              <View style={styles.advancedSectionHeader}>
                <Ionicons
                  name="remove-circle-outline"
                  size={18}
                  color={isDark ? "#EF9A9A" : "#F44336"}
                />
                <Text
                  style={[
                    styles.advancedSectionTitle,
                    { color: isDark ? "#EF9A9A" : "#F44336" },
                  ]}
                >
                  Withdrawals
                </Text>
              </View>

              <TextInput
                label="Withdrawals Amount"
                value={withdrawals}
                onChangeText={(text) =>
                  handleNumericInput(text, setWithdrawals)
                }
                keyboardType="numeric"
                left={
                  <TextInput.Affix
                    text={currencyData[currency]?.symbol || ""}
                  />
                }
                style={[styles.input, styles.modernInput]}
                mode="outlined"
                outlineColor={
                  isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
                }
                activeOutlineColor="#9370DB"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: isDark
                      ? "rgba(42, 42, 42, 0.7)"
                      : "rgba(245, 245, 245, 0.7)",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />

              <FrequencySelector
                label="Withdrawals Frequency"
                value={withdrawalFrequency}
                options={withdrawalFrequencyItems}
                onChange={setWithdrawalFrequency}
                zIndex={2700}
                disabled={Number(withdrawals) === 0}
              />

              {Number(withdrawals) > 0 && (
                <View style={styles.impactIndicator}>
                  <Text
                    style={{
                      color: isDark ? "#EF9A9A" : "#F44336",
                      fontSize: 13,
                    }}
                  >
                    {`-${formatCurrencyWithSymbol(
                      Number(withdrawals) *
                        (Number(years) * Number(withdrawalFrequency)),
                      currency
                    )} over entire period`}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.divider,
                  {
                    marginVertical: 20,
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                ]}
              />

              <View style={styles.advancedSectionHeader}>
                <Ionicons
                  name="calculator-outline"
                  size={18}
                  color={isDark ? "#81D4FA" : "#2196F3"}
                />
                <Text
                  style={[
                    styles.advancedSectionTitle,
                    { color: isDark ? "#81D4FA" : "#2196F3" },
                  ]}
                >
                  Tax Calculation
                </Text>
              </View>

              <TextInput
                label="Tax Rate"
                value={taxRate}
                onChangeText={(text) => handleNumericInput(text, setTaxRate)}
                keyboardType="numeric"
                right={<TextInput.Affix text="%" />}
                style={[styles.input, styles.modernInput]}
                mode="outlined"
                outlineColor={
                  isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
                }
                activeOutlineColor="#9370DB"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: isDark
                      ? "rgba(42, 42, 42, 0.7)"
                      : "rgba(245, 245, 245, 0.7)",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />

              {Number(taxRate) > 0 && (
                <View style={styles.impactIndicator}>
                  <Text
                    style={{
                      color: isDark ? "#81D4FA" : "#2196F3",
                      fontSize: 13,
                    }}
                  >
                    {`Estimated tax: ${formatCurrencyWithSymbol(
                      results.totalTaxesPaid,
                      currency
                    )}`}
                  </Text>
                </View>
              )}

              <View style={styles.advancedSummary}>
                <Text
                  style={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Advanced Settings Summary:
                </Text>
                <View style={styles.summaryItem}>
                  <Text
                    style={{ color: isDark ? "#fff" : "#000", fontSize: 13 }}
                  >
                    Compounding:{" "}
                    {compoundingFrequencyItems.find(
                      (item) => item.value === compoundingFrequency
                    )?.label || "Monthly"}
                  </Text>
                </View>
                {Number(additionalContributions) > 0 && (
                  <View style={styles.summaryItem}>
                    <Text
                      style={{ color: isDark ? "#fff" : "#000", fontSize: 13 }}
                    >
                      Adding{" "}
                      {formatCurrencyWithSymbol(
                        Number(additionalContributions),
                        currency
                      )}{" "}
                      {contributionFrequencyItems
                        .find((item) => item.value === contributionFrequency)
                        ?.label.toLowerCase()}
                    </Text>
                  </View>
                )}
                {Number(withdrawals) > 0 && (
                  <View style={styles.summaryItem}>
                    <Text
                      style={{ color: isDark ? "#fff" : "#000", fontSize: 13 }}
                    >
                      Withdrawing{" "}
                      {formatCurrencyWithSymbol(Number(withdrawals), currency)}{" "}
                      {withdrawalFrequencyItems
                        .find((item) => item.value === withdrawalFrequency)
                        ?.label.toLowerCase()}
                    </Text>
                  </View>
                )}
                {Number(taxRate) > 0 && (
                  <View style={styles.summaryItem}>
                    <Text
                      style={{ color: isDark ? "#fff" : "#000", fontSize: 13 }}
                    >
                      Tax rate: {taxRate}% on earnings
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.advancedSectionNote}>
                <Text
                  style={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.5)",
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  Note: All calculations use {Number(rateOfReturn).toFixed(2)}%
                  monthly rate (equivalent to{" "}
                  {results.effectiveAnnualRate.toFixed(2)}% annual when
                  compounded)
                </Text>
              </View>
            </View>
          )}
        </View>

        <Divider
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
            },
          ]}
        />

        {/* Results section with improved clarity and organization */}
        <View
          style={[
            styles.sectionContainer,
            styles.resultsSection,
            glassmorphismStyle,
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDark
                    ? "rgba(138, 43, 226, 0.25)"
                    : "rgba(138, 43, 226, 0.15)",
                },
              ]}
            >
              <Ionicons name="stats-chart" size={22} color="#9370DB" />
            </View>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              Results
            </Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={calculateResults}
              iconColor={isDark ? "#9370DB" : "#6200EE"}
            />
          </View>

          {/* Main result highlight */}
          <View style={styles.mainResultWrapper}>
            <View
              style={[
                styles.mainResultBox,
                {
                  backgroundColor: isDark
                    ? "rgba(63, 81, 181, 0.4)"
                    : "rgba(123, 104, 238, 0.25)",
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(123, 104, 238, 0.3)",
                },
              ]}
            >
              <Text
                style={[
                  styles.mainResultLabel,
                  { color: isDark ? "white" : "#4527A0" },
                ]}
              >
                Final Balance
              </Text>
              <View style={styles.mainResultContainer}>
                <View style={styles.mainResultValue}>
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: isDark ? "#ffffff" : "#4527A0" },
                    ]}
                  >
                    {currencyData[currency]?.symbol || ""}
                  </Text>
                  <Text
                    style={[
                      styles.mainResultText,
                      { color: isDark ? "#ffffff" : "#4527A0" },
                    ]}
                  >
                    {isNaN(results.endBalance)
                      ? "0.00"
                      : formatCurrencyWithSymbol(
                          results.endBalance,
                          currency
                        ).replace(/[€$£¥]/g, "")}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.resultCurrency,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(123, 104, 238, 0.3)",
                      color: isDark ? "#fff" : "#4527A0",
                    },
                  ]}
                >
                  {currency}
                </Text>
              </View>
            </View>
          </View>

          {/* Key metrics grid */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, glassmorphismStyle]}>
              <Text style={metricLabelStyle}>Total Earnings</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#2196F3" : "#1565C0" },
                ]}
              >
                {formatCurrencyWithSymbol(results.totalEarnings, currency)}
              </Text>
            </View>

            <View style={[styles.metricCard, glassmorphismStyle]}>
              <Text style={metricLabelStyle}>Overall Return</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#FF9800" : "#E65100" },
                ]}
              >
                {results.allTimeRateOfReturn.toFixed(2)}%
              </Text>
            </View>

            <View style={[styles.metricCard, glassmorphismStyle]}>
              <Text style={metricLabelStyle}>Monthly Rate</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#FF9800" : "#E65100" },
                ]}
              >
                {Number(rateOfReturn).toFixed(2)}%
              </Text>
            </View>

            <View style={[styles.metricCard, glassmorphismStyle]}>
              <Text style={metricLabelStyle}>Effective Annual Rate</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#9C27B0" : "#6A1B9A" },
                ]}
              >
                {results.effectiveAnnualRate.toFixed(2)}%
              </Text>
              <Text
                style={{ fontSize: 11, color: isDark ? "#B39DDB" : "#673AB7" }}
              >
                (compounded monthly)
              </Text>
            </View>

            {results.totalContributions > 0 && (
              <View style={[styles.metricCard, glassmorphismStyle]}>
                <Text style={metricLabelStyle}>Total Contributions</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? "#A5D6A7" : "#4CAF50" },
                  ]}
                >
                  {formatCurrencyWithSymbol(
                    results.totalContributions,
                    currency
                  )}
                </Text>
              </View>
            )}

            {results.totalWithdrawals > 0 && (
              <View style={[styles.metricCard, glassmorphismStyle]}>
                <Text style={metricLabelStyle}>Total Withdrawals</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? "#EF9A9A" : "#F44336" },
                  ]}
                >
                  {formatCurrencyWithSymbol(results.totalWithdrawals, currency)}
                </Text>
              </View>
            )}

            {Number(taxRate) > 0 && (
              <View style={[styles.metricCard, glassmorphismStyle]}>
                <Text style={metricLabelStyle}>Total Tax Paid</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? "#81D4FA" : "#2196F3" },
                  ]}
                >
                  {formatCurrencyWithSymbol(results.totalTaxesPaid, currency)}
                </Text>
              </View>
            )}

            {Number(rateOfReturn) > 0 && (
              <View style={[styles.metricCard, glassmorphismStyle]}>
                <Text style={metricLabelStyle}>Time to Double</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? "#FF5722" : "#D84315" },
                  ]}
                >
                  {results.timeToDouble.toFixed(1)} months
                </Text>
              </View>
            )}

            <View style={[styles.metricCard, glassmorphismStyle]}>
              <Text style={metricLabelStyle}>Last Period Earnings</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#00BCD4" : "#00838F" },
                ]}
              >
                {formatCurrencyWithSymbol(results.lastEarnings, currency)}
              </Text>
            </View>
          </View>

          {/* Advanced calculation summary (shows only when advanced options are used) */}
          {showAdvanced &&
            (Number(additionalContributions) > 0 ||
              Number(withdrawals) > 0 ||
              Number(taxRate) > 0) && (
              <View
                style={[styles.advancedResultsOverview, glassmorphismStyle]}
              >
                <Text
                  style={{
                    color: isDark ? "#fff" : "#4527A0",
                    marginBottom: 12,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Advanced Options Impact
                </Text>

                <View style={styles.advancedResultsRow}>
                  {Number(additionalContributions) > 0 && (
                    <View style={styles.advancedResultItem}>
                      <Ionicons
                        name="add-circle-outline"
                        size={16}
                        color={isDark ? "#A5D6A7" : "#4CAF50"}
                      />
                      <Text
                        style={{
                          color: isDark ? "#A5D6A7" : "#4CAF50",
                          fontSize: 14,
                          marginLeft: 4,
                        }}
                      >
                        Contributions: +
                        {Math.round(
                          (results.totalContributions / results.endBalance) *
                            100
                        )}
                        %
                      </Text>
                    </View>
                  )}

                  {Number(withdrawals) > 0 && (
                    <View style={styles.advancedResultItem}>
                      <Ionicons
                        name="remove-circle-outline"
                        size={16}
                        color={isDark ? "#EF9A9A" : "#F44336"}
                      />
                      <Text
                        style={{
                          color: isDark ? "#EF9A9A" : "#F44336",
                          fontSize: 14,
                          marginLeft: 4,
                        }}
                      >
                        Withdrawals: -
                        {Math.round(
                          (results.totalWithdrawals /
                            results.totalContributions) *
                            100
                        )}
                        %
                      </Text>
                    </View>
                  )}

                  {Number(taxRate) > 0 && (
                    <View style={styles.advancedResultItem}>
                      <Ionicons
                        name="calculator-outline"
                        size={16}
                        color={isDark ? "#81D4FA" : "#2196F3"}
                      />
                      <Text
                        style={{
                          color: isDark ? "#81D4FA" : "#2196F3",
                          fontSize: 14,
                          marginLeft: 4,
                        }}
                      >
                        Tax impact: -
                        {Math.round(
                          (results.totalTaxesPaid /
                            results.totalInterestEarned) *
                            100
                        )}
                        %
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

          {/* Chart with title */}
          <View style={[styles.chartSection, glassmorphismStyle]}>
            <Text
              variant="titleMedium"
              style={{
                color: isDark ? "#fff" : "#4527A0",
                marginBottom: 16,
                fontWeight: "600",
              }}
            >
              Growth Chart
            </Text>
            <View style={{ marginHorizontal: -8, paddingVertical: 10 }}>
              {renderChart()}
            </View>
          </View>

          {/* Breakdown button */}
          <TouchableOpacity
            onPress={showModal}
            style={[
              styles.breakdownButton,
              {
                backgroundColor: isDark
                  ? "rgba(63, 81, 181, 0.4)"
                  : "rgba(123, 104, 238, 0.25)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(123, 104, 238, 0.3)",
              },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={isDark ? "#E6E6FA" : "#4527A0"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: isDark ? "#E6E6FA" : "#4527A0",
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              View Detailed Breakdown
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderBreakdown()}

      {/* Add reset button at the bottom */}
      {renderResetButton()}
    </View>
  );
}

// Enhanced styles without theme-dependent properties
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backdropFilter: "blur(5px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  inputsContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 20,
  },
  modernInput: {
    borderRadius: 16,
    height: 60,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdown: {
    borderRadius: 16,
    height: 60,
  },
  modernDropdown: {
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownList: {
    borderRadius: 16,
    borderWidth: 1,
  },
  divider: {
    marginVertical: 24,
    height: 1,
  },

  // Results section styles
  resultsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  mainResultWrapper: {
    marginVertical: 16,
  },
  mainResultBox: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  mainResultLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  metricsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    rowGap: 12,
  },
  metricCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  chartSection: {
    marginTop: 10,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  // Original styles
  mainResultContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  mainResultValue: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 10,
    marginRight: 4,
  },
  mainResultText: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  resultCurrency: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    letterSpacing: 1,
  },

  // Functional styles
  advancedButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  modernAdvancedButton: {
    borderWidth: 1,
    borderColor: "rgba(98, 0, 238, 0.15)",
    backgroundColor: "rgba(98, 0, 238, 0.05)",
  },
  advancedOptions: {
    marginTop: 12,
  },
  breakdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backdropFilter: "blur(5px)",
    borderWidth: 1,
  },
  fullWidthMetric: {
    width: "100%",
  },

  // New modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.07)",
  },
  breakdownModal: {
    width: "92%",
    maxHeight: "90%",
    borderRadius: 28,
    padding: 20,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  breakdownHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tableContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  breakdownTableHeader: {
    flexDirection: "row",
    paddingVertical: 1,
    paddingHorizontal: 11,
  },
  breakdownTable: {
    maxHeight: 470,
  },
  breakdownRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  breakdownCell: {
    flex: 1,
    fontSize: 15,
    padding: 4,
  },
  breakdownHeaderCell: {
    flex: 1,
    fontWeight: "semibold",
    letterSpacing: 0.5,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  breakdownFooter: {
    marginTop: 10,
    alignItems: "center",
  },
  closeButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  currencySelectionContainer: {
    marginBottom: 16,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  exchangeRateContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(98, 0, 238, 0.1)",
    backdropFilter: "blur(5px)",
    borderWidth: 1,
    borderColor: "rgba(98, 0, 238, 0.2)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#FF5252",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(98, 0, 238, 0.8)",
    backdropFilter: "blur(5px)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  retryButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  customDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    height: 52,
  },
  modalContent: {
    maxHeight: 280,
    borderWidth: 1.5,
    padding: 8,
    overflow: "hidden",
    marginTop: 3,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 16,
  },
  advancedSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 12,
  },
  advancedSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  impactIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  advancedSummary: {
    marginTop: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
  },
  summaryItem: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  advancedResultsOverview: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  advancedResultsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  advancedResultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginRight: 12,
  },
  resetButtonContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  advancedSectionNote: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
});
