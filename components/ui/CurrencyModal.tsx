import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Currency, currencies, filterCurrencies } from "@/constants/currencies";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchExchangeRate } from "@/services/api";

interface CurrencyModalProps {
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrency: Currency;
  baseCurrency?: Currency; // Optional base currency to show rates against
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
  onClose,
  onSelect,
  selectedCurrency,
  baseCurrency,
}) => {
  const { colors, isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] =
    useState<Currency[]>(currencies);
  const [rateCache, setRateCache] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(false);
  // Add favorites state
  const [favorites, setFavorites] = useState<string[]>([
    "USD",
    "EUR",
    "GBP",
    "JPY",
  ]);
  const [showFavorites, setShowFavorites] = useState(false);

  const itemStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  };

  // Update filtered currencies when search term or favorites filter changes
  useEffect(() => {
    let result = currencies;

    if (searchTerm.trim() !== "") {
      result = filterCurrencies(searchTerm);
    }

    // Filter by favorites if showFavorites is true
    if (showFavorites) {
      result = result.filter((curr) => favorites.includes(curr.code));
    }

    setFilteredCurrencies(result);
  }, [searchTerm, showFavorites, favorites]);

  // Preload exchange rates if baseCurrency is provided
  useEffect(() => {
    if (!baseCurrency) return;

    const loadRates = async () => {
      if (filteredCurrencies.length === 0) return;

      setLoadingRates(true);

      try {
        // Prepare batch of currency pairs to fetch
        const currenciesToFetch = filteredCurrencies
          .filter((c) => c.code !== baseCurrency.code)
          .slice(0, 15); // Limit initial load to 15 currencies

        // Create an array of promises for exchange rates
        const ratePromises = currenciesToFetch.map(async (currency) => {
          try {
            const rate = await fetchExchangeRate(
              baseCurrency.code,
              currency.code
            );
            return { currency: currency.code, rate };
          } catch (error) {
            console.error(
              `Error fetching rate for ${baseCurrency.code}/${currency.code}:`,
              error
            );
            return { currency: currency.code, rate: null };
          }
        });

        // Wait for all rates to be fetched (batched behind the scenes)
        const results = await Promise.all(ratePromises);

        // Update rate cache
        const newRateCache = { ...rateCache };
        results.forEach((result) => {
          if (result.rate !== null) {
            newRateCache[result.currency] = result.rate;
          }
        });

        setRateCache(newRateCache);
      } catch (error) {
        console.error("Error loading currency rates:", error);
      } finally {
        setLoadingRates(false);
      }
    };

    loadRates();
  }, [
    baseCurrency,
    filteredCurrencies
      .slice(0, 15)
      .map((c) => c.code)
      .join(),
  ]);

  // Handle currency selection
  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    onClose();
  };

  // Toggle favorite status
  const toggleFavorite = (currencyCode: string) => {
    if (favorites.includes(currencyCode)) {
      setFavorites(favorites.filter((code) => code !== currencyCode));
    } else {
      setFavorites([...favorites, currencyCode]);
    }
  };

  // Handle favorites toggle with optimized callback
  const handleFavoritesToggle = useCallback(() => {
    setShowFavorites(!showFavorites);
  }, [showFavorites]);

  // Render each currency item
  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = selectedCurrency.code === item.code;
    const showRate = baseCurrency && baseCurrency.code !== item.code;
    const rate = showRate ? rateCache[item.code] : null;
    const isFavorite = favorites.includes(item.code);

    return (
      <TouchableOpacity
        style={[
          itemStyle,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          isSelected && {
            backgroundColor: colors.primary + "15",
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.flagContainer}>
          <Image
            source={{
              uri: `https://flagcdn.com/w160/${item.countryCode.toLowerCase()}.png`,
            }}
            style={styles.flag}
            resizeMode="cover"
          />
        </View>
        <View style={styles.currencyInfo}>
          <Text style={[styles.currencyCode, { color: colors.text }]}>
            {item.code}
          </Text>
          <Text style={[styles.currencyName, { color: colors.text + "99" }]}>
            {item.name}
          </Text>

          {showRate && (
            <View style={styles.rateContainer}>
              <Text style={[styles.rateText, { color: colors.primary }]}>
                {rate
                  ? `1 ${baseCurrency.code} = ${rate.toFixed(4)} ${item.code}`
                  : "Loading rate..."}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.currencyRight}>
          <View
            style={[
              styles.symbolContainer,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: colors.primary }]}>
              {item.symbol}
            </Text>
          </View>

          {/* Favorite button */}
          <TouchableOpacity
            onPress={() => toggleFavorite(item.code)}
            style={styles.favoriteButton}
          >
            <MaterialIcons
              name={isFavorite ? "star" : "star-outline"}
              size={22}
              color={isFavorite ? colors.primary : colors.text + "66"}
            />
          </TouchableOpacity>

          {isSelected && (
            <MaterialIcons
              name="check"
              size={24}
              color={colors.primary}
              style={styles.checkIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={["#6366F1", "#4F46E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header]}
      >
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Currency</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialIcons name="search" size={24} color={colors.primary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search currencies..."
          placeholderTextColor={colors.text + "66"}
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchTerm("")}
            activeOpacity={0.7}
            style={styles.clearButton}
          >
            <MaterialIcons name="cancel" size={20} color={colors.text + "66"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Favorites filter */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.05)",
          backgroundColor: colors.background,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          snapToAlignment="center"
          decelerationRate="fast"
          bounces={false}
          removeClippedSubviews={false}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: showFavorites ? colors.primary : colors.card,
                borderColor: showFavorites ? colors.primary : colors.border,
              },
            ]}
            onPress={handleFavoritesToggle}
            activeOpacity={0.6}
          >
            <MaterialIcons
              name={showFavorites ? "star" : "star-outline"}
              size={16}
              color={showFavorites ? "white" : colors.primary}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                { color: showFavorites ? "white" : colors.text },
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: !showFavorites ? colors.primary : colors.card,
                borderColor: !showFavorites ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setShowFavorites(false)}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.filterText,
                { color: !showFavorites ? "white" : colors.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loadingRates && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text + "99" }]}>
            Loading rates...
          </Text>
        </View>
      )}

      <FlatList
        data={filteredCurrencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={10}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "white",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 4,
  },
  clearButton: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 40 : 16,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyInfo: {
    flex: 1,
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
  currencyRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  symbolContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: 8,
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
  rateContainer: {
    marginTop: 4,
  },
  rateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  loadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  // New styles for favorites feature
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    height: 52,
    justifyContent: "center",
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
    elevation: 1,
    marginVertical: 8,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  favoriteButton: {
    padding: 4,
    marginRight: 4,
  },
});

export default CurrencyModal;
