import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  CurrencyPair,
  getCurrencyByCode,
  getCurrencyPairByName,
} from "../../constants/currencies";
import CurrencyPairPickerModal from "./CurrencyPairPickerModal";

interface CurrencyPairSelectorProps {
  label: string;
  selectedPair: string;
  onSelect: (pairName: string) => void;
}

const CurrencyPairSelector: React.FC<CurrencyPairSelectorProps> = ({
  label,
  selectedPair,
  onSelect,
}) => {
  const { isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Get the currency pair object from the selected pair name
  const currencyPair = getCurrencyPairByName(selectedPair);

  // Get currency objects for base and quote
  const baseCurrency = currencyPair
    ? getCurrencyByCode(currencyPair.base)
    : undefined;
  const quoteCurrency = currencyPair
    ? getCurrencyByCode(currencyPair.quote)
    : undefined;

  // Define colors based on theme
  const colors = {
    text: isDark ? "#fff" : "#000",
    subtext: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
    card: isDark ? "#2A2A2A" : "#fff",
    border: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
    primary: "#6200ee",
  };

  const handleSelect = (pair: CurrencyPair) => {
    onSelect(pair.name);
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
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          {baseCurrency && quoteCurrency && (
            <>
              <View style={styles.flagsContainer}>
                <Image
                  source={{
                    uri: `https://flagcdn.com/w160/${baseCurrency.countryCode.toLowerCase()}.png`,
                  }}
                  style={styles.flagFirst}
                  resizeMode="cover"
                />
                <Image
                  source={{
                    uri: `https://flagcdn.com/w160/${quoteCurrency.countryCode.toLowerCase()}.png`,
                  }}
                  style={styles.flagSecond}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.pairInfo}>
                <Text style={[styles.pairCode, { color: colors.text }]}>
                  {currencyPair?.name}
                </Text>
                <Text style={[styles.pairDesc, { color: colors.subtext }]}>
                  {baseCurrency.name} / {quoteCurrency.name}
                </Text>
              </View>
            </>
          )}
        </View>
        <Ionicons name="chevron-down" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Currency Pair Picker Modal */}
      <CurrencyPairPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelect}
        selectedPair={selectedPair}
        title="Select Currency Pair"
      />
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
  flagsContainer: {
    position: "relative",
    width: 55,
    height: 30,
    marginRight: 15,
  },
  flagFirst: {
    width: 35,
    height: 22,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.15)",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  flagSecond: {
    width: 35,
    height: 22,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.15)",
    position: "absolute",
    top: 8,
    left: 20,
    zIndex: 1,
  },
  pairInfo: {
    flexDirection: "column",
  },
  pairCode: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  pairDesc: {
    fontSize: 14,
    opacity: 0.8,
  },
});

export default CurrencyPairSelector;
