import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import CurrencyPickerModal, {
  currencyData,
  CurrencyCode,
} from "./CurrencyPickerModal";

interface AccountCurrencySelectorProps {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
  label?: string;
}

export default function AccountCurrencySelector({
  value,
  onChange,
  label = "Account Currency",
}: AccountCurrencySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();

  // Get country code for flag
  const getCountryCode = (currencyCode: string): string => {
    return (currencyData as any)[currencyCode]?.countryCode || "us";
  };

  // Get currency name
  const getCurrencyName = (currencyCode: string): string => {
    return (currencyData as any)[currencyCode]?.name || "US Dollar";
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    return (currencyData as any)[currencyCode]?.symbol || "$";
  };

  const handleCurrencySelect = (currency: CurrencyCode) => {
    onChange(currency);
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
                uri: `https://flagcdn.com/w160/${getCountryCode(
                  value
                ).toLowerCase()}.png`,
              }}
              style={styles.flag}
              resizeMode="cover"
            />
          </View>
          <View style={styles.currencyInfo}>
            <Text
              style={[styles.currencyCode, { color: isDark ? "#fff" : "#000" }]}
            >
              {value}
            </Text>
            <Text
              style={[
                styles.currencyName,
                { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" },
              ]}
            >
              {getCurrencyName(value)}
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
              {getCurrencySymbol(value)}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={24} color="#6200ee" />
        </View>
      </TouchableOpacity>

      <CurrencyPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleCurrencySelect}
        selectedCurrency={value}
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
