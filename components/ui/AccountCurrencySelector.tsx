import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  StatusBar,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";
import { Ionicons } from "@expo/vector-icons";
import CurrencyPickerModal from "./CurrencyPickerModal";
import { Currency, getCurrencyByCode } from "../../constants/currencies";

interface AccountCurrencySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function AccountCurrencySelector({
  value,
  onChange,
  label = "Account Currency",
}: AccountCurrencySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();
  const { accountCurrency } = useExchangeRates();

  // Use account currency from context if no value is provided
  const currentCurrencyCode = value || accountCurrency.code;

  // Get currency details for the current value
  const currencyDetails = getCurrencyByCode(currentCurrencyCode) || {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    countryCode: "US",
  };

  const handleCurrencySelect = (currency: Currency) => {
    onChange(currency.code);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" },
        ]}
      >
        {label}
      </Text>

      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: isDark ? "#2A2A2A" : "#fff",
            borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.flagContainer}>
            <Image
              source={{
                uri: `https://flagcdn.com/w160/${currencyDetails.countryCode.toLowerCase()}.png`,
              }}
              style={styles.flag}
              resizeMode="cover"
            />
          </View>
          <View style={styles.currencyInfo}>
            <Text
              style={[styles.currencyCode, { color: isDark ? "#fff" : "#000" }]}
            >
              {currentCurrencyCode}
            </Text>
            <Text
              style={[
                styles.currencyName,
                { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" },
              ]}
            >
              {currencyDetails.name}
            </Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.symbolContainer,
              {
                backgroundColor: isDark
                  ? "rgba(98,0,238,0.15)"
                  : "rgba(98,0,238,0.1)",
              },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: "#6200ee" }]}>
              {currencyDetails.symbol}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={24} color="#6200ee" />
        </View>
      </TouchableOpacity>

      <CurrencyPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleCurrencySelect}
        selectedCurrency={currentCurrencyCode}
        title="Select Currency"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 3000,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagContainer: {
    marginRight: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  flag: {
    width: 35,
    height: 22,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.15)",
  },
  currencyInfo: {
    flexDirection: "column",
    marginLeft: 4,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    opacity: 0.8,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  symbolContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
  },
});
