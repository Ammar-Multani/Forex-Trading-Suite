import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CHF"
  | "AUD"
  | "CAD"
  | "NZD"
  | "CNY"
  | "HKD"
  | "SGD"
  | "INR";

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  countryCode: string;
}

interface CurrencySelectorProps {
  label: string;
  selectedCurrency: Currency;
  onPress: () => void;
}

// Currency data mapping
const currencyData: Record<CurrencyCode, Currency> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    countryCode: "us",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    countryCode: "eu",
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    countryCode: "gb",
  },
  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    countryCode: "jp",
  },
  CHF: {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "Fr",
    countryCode: "ch",
  },
  AUD: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    countryCode: "au",
  },
  CAD: {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    countryCode: "ca",
  },
  NZD: {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    countryCode: "nz",
  },
  CNY: {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    countryCode: "cn",
  },
  HKD: {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    countryCode: "hk",
  },
  SGD: {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    countryCode: "sg",
  },
  INR: {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    countryCode: "in",
  },
};

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  label,
  selectedCurrency,
  onPress,
}) => {
  const { isDark } = useTheme();

  // Define colors based on theme
  const colors = {
    text: isDark ? "#fff" : "#000",
    subtext: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
    card: isDark ? "#2A2A2A" : "#fff",
    border: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
    primary: "#6200ee",
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.flagContainer}>
            <Image
              source={{
                uri: `https://flagcdn.com/w160/${selectedCurrency.countryCode.toLowerCase()}.png`,
              }}
              style={styles.flag}
              resizeMode="cover"
            />
          </View>
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyCode, { color: colors.text }]}>
              {selectedCurrency.code}
            </Text>
            <Text style={[styles.currencyName, { color: colors.subtext }]}>
              {selectedCurrency.name}
            </Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.symbolContainer,
              {
                backgroundColor: colors.primary + "15",
                borderColor: "rgba(0,0,0,0.1)",
              },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: colors.primary }]}>
              {selectedCurrency.symbol}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
    borderRadius: 10,
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
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CurrencySelector;
export { currencyData };
