import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useExchangeRates } from "../../contexts/ExchangeRateContext";
import { Ionicons } from "@expo/vector-icons";
import {
  currencies,
  Currency,
  filterCurrencies,
} from "../../constants/currencies";

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrency?: string;
  title?: string;
}

const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCurrency: propSelectedCurrency,
  title = "Select Currency",
}) => {
  const { isDark, theme, colors } = useTheme();
  const { accountCurrency } = useExchangeRates();
  const [searchQuery, setSearchQuery] = useState("");

  // Add state for favorites
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(["USD", "EUR", "GBP"]);

  // Use the provided selected currency code or default to account currency
  const selectedCurrency = propSelectedCurrency || accountCurrency.code;

  // Reset search when modal is opened
  useEffect(() => {
    if (visible) {
      setSearchQuery("");
    }
  }, [visible]);

  // Filter currencies based on search query
  let filteredCurrencies = searchQuery
    ? filterCurrencies(searchQuery)
    : currencies;

  // Filter by favorites if enabled
  if (showFavorites) {
    filteredCurrencies = filteredCurrencies.filter((currency) =>
      favorites.includes(currency.code)
    );
  }

  // Toggle favorite status
  const toggleFavorite = (currencyCode: string) => {
    if (favorites.includes(currencyCode)) {
      setFavorites(favorites.filter((code) => code !== currencyCode));
    } else {
      setFavorites([...favorites, currencyCode]);
    }
  };

  // Toggle favorites view
  const handleFavoritesToggle = useCallback(() => {
    setShowFavorites(!showFavorites);
  }, [showFavorites]);

  // Render each currency item
  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = selectedCurrency === item.code;
    const isFavorite = favorites.includes(item.code);

    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          { backgroundColor: theme.colors.surface },
          isSelected && {
            backgroundColor: isDark
              ? `${colors.primary}20`
              : `${colors.primary}10`,
            borderColor: colors.primary,
            borderWidth: 1,
          },
        ]}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.currencyItemLeft}>
          <Image
            source={{
              uri: `https://flagcdn.com/w160/${item.countryCode.toLowerCase()}.png`,
            }}
            style={styles.flag}
            resizeMode="cover"
          />
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyCode, { color: theme.colors.text }]}>
              {item.code}
            </Text>
            <Text
              style={[
                styles.currencyName,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.name}
            </Text>
          </View>
        </View>

        <View style={styles.currencyItemRight}>
          <View
            style={[
              styles.symbolContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.surfaceVariant
                  : "#f0f0f0",
                borderColor: isDark ? theme.colors.border : "#ccc",
              },
              isSelected && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.symbolText,
                { color: colors.primary },
                isSelected && { color: "#fff" },
              ]}
            >
              {item.symbol}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleFavorite(item.code)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={20}
              color={
                isFavorite ? colors.primary : theme.colors.onSurfaceVariant
              }
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView
        style={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "light-content"} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: isDark ? "#000" : "#000",
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.onSurfaceVariant}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search currencies..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Favorites Filter */}
        <View
          style={[
            styles.filterContainer,
            {
              borderBottomColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                {
                  backgroundColor: showFavorites
                    ? colors.primary
                    : theme.colors.surface,
                  borderColor: showFavorites
                    ? colors.primary
                    : theme.colors.onSurfaceVariant + "40",
                },
              ]}
              onPress={handleFavoritesToggle}
              activeOpacity={0.6}
            >
              <Ionicons
                name={showFavorites ? "star" : "star-outline"}
                size={16}
                color={showFavorites ? "white" : colors.primary}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: showFavorites ? "white" : theme.colors.text },
                ]}
              >
                Favorites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                {
                  backgroundColor: !showFavorites
                    ? colors.primary
                    : theme.colors.surface,
                  borderColor: !showFavorites
                    ? colors.primary
                    : theme.colors.onSurfaceVariant + "40",
                },
              ]}
              onPress={() => setShowFavorites(false)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: !showFavorites ? "white" : theme.colors.text },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Currency List */}
        <FlatList
          data={filteredCurrencies}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item.code}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    height: 90,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  searchContainer: {
    padding: 18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: "#ccc",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: "center",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    height: 36,
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 18,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 0.3,
    borderColor: "#ccc",
  },
  currencyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 32,
    height: 22,
    borderRadius: 3,
    marginRight: 12,
    borderWidth: 0.3,
    borderColor: "#ccc",
  },
  currencyInfo: {
    flexDirection: "column",
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.3,
    marginRight: 8,
  },
  symbolText: {
    fontSize: 13,
    fontWeight: "600",
  },
  favoriteButton: {
    padding: 4,
  },
});

export default CurrencyPickerModal;
export { Currency };
