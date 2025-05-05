import React, { useState, useEffect, useCallback, useRef } from "react";
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
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CurrencyPair,
  currencyPairs,
  filterCurrencyPairs,
  getCurrencyByCode,
  getCurrencyPairGroups,
  getInclusiveCurrencyPairsByGroup,
  CURRENCIES,
} from "@/constants/currencies";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import env from "@/config/env";

// Interface for API response
interface ExchangeRateResponse {
  endpoint: string;
  quotes: Array<{
    ask: number;
    bid: number;
    mid: number;
    base_currency: string;
    quote_currency: string;
  }>;
  requested_time: string;
  timestamp: number;
}

// Interface for exchange rate data
interface ExchangeRateData {
  bid: number;
  ask: number;
  mid: number;
  timestamp: number;
  loading: boolean;
  error?: string;
}

interface CurrencyPairModalProps {
  onClose: () => void;
  onSelect: (pair: CurrencyPair) => void;
  selectedPair: CurrencyPair;
}

// Helper function to find suggestions
const findSimilarCurrencies = (searchTerm: string): string[] => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const term = searchTerm.toLowerCase();
  const matches = CURRENCIES.filter(
    (code) =>
      code.toLowerCase().includes(term) ||
      getCurrencyByCode(code)?.name.toLowerCase().includes(term)
  );

  return matches.slice(0, 3); // Return top 3 matches
};

const CurrencyPairModal: React.FC<CurrencyPairModalProps> = ({
  onClose,
  onSelect,
  selectedPair,
}) => {
  const { colors, isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPairs, setFilteredPairs] =
    useState<CurrencyPair[]>(currencyPairs);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "Major"
  );
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Store exchange rates data
  const [exchangeRates, setExchangeRates] = useState<
    Record<string, ExchangeRateData>
  >({});

  // Sample favorites - in a real app, this would be stored in a context or persistence
  const [favorites, setFavorites] = useState<string[]>([
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
    "USD/CHF",
  ]);

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const pairItemStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  };

  // Fetch exchange rates for visible pairs
  const fetchExchangeRates = useCallback(
    async (pairs: CurrencyPair[]) => {
      // Only fetch for up to 10 pairs at a time to avoid API limits
      const pairsToFetch = pairs.slice(0, 10);
      const pairCodes = pairsToFetch.map((pair) => `${pair.base}${pair.quote}`);

      if (pairCodes.length === 0) return;

      // Mark pairs as loading
      const loadingUpdates: Record<string, ExchangeRateData> = {};
      pairCodes.forEach((pairCode) => {
        loadingUpdates[pairCode] = {
          ...exchangeRates[pairCode],
          loading: true,
        };
      });
      setExchangeRates((prev) => ({ ...prev, ...loadingUpdates }));

      try {
        const pairsString = pairCodes.join(",");
        const url = `https://marketdata.tradermade.com/api/v1/live?currency=${pairsString}&api_key=${env.traderMadeApiKey}`;

        console.log(`[CurrencyPairModal] Fetching rates for: ${pairsString}`);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`
          );
        }

        const data: ExchangeRateResponse = await response.json();

        // Update exchange rates with fetched data
        const updates: Record<string, ExchangeRateData> = {};
        data.quotes.forEach((quote) => {
          const pairCode = `${quote.base_currency}${quote.quote_currency}`;
          updates[pairCode] = {
            bid: quote.bid,
            ask: quote.ask,
            mid: quote.mid,
            timestamp: data.timestamp,
            loading: false,
          };
        });

        setExchangeRates((prev) => ({ ...prev, ...updates }));
      } catch (err) {
        console.error("[CurrencyPairModal] Error fetching rates:", err);

        // Mark pairs as error
        const errorUpdates: Record<string, ExchangeRateData> = {};
        pairCodes.forEach((pairCode) => {
          errorUpdates[pairCode] = {
            ...exchangeRates[pairCode],
            loading: false,
            error: err instanceof Error ? err.message : "Failed to fetch rates",
          };
        });
        setExchangeRates((prev) => ({ ...prev, ...errorUpdates }));
      }
    },
    [exchangeRates]
  );

  // Add this new filter for USD-based pairs
  const filterUsdPairs = useCallback((pairs: CurrencyPair[]) => {
    return pairs.filter((pair) => pair.base === "USD" || pair.quote === "USD");
  }, []);

  // Update filtered pairs when search term changes
  useEffect(() => {
    let result = currencyPairs;

    // Apply initial alphabetical sorting for all pairs
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    // Filter by search term
    if (searchTerm.trim() !== "") {
      // Use advanced search to get ranked results
      result = filterCurrencyPairs(searchTerm);

      // Generate suggestions if no results
      if (result.length === 0) {
        setSuggestions(findSimilarCurrencies(searchTerm));
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }

    // Filter by category if no search term or showing favorites
    if (searchTerm.trim() === "" || showFavorites) {
      // Special handling for currency-specific filters
      if (selectedCategory === "USD") {
        // Show all pairs with USD as base or quote
        result = filterUsdPairs(result);
      } else if (selectedCategory === "EUR") {
        // Show all pairs where EUR is base or quote
        result = result.filter(
          (pair) => pair.base === "EUR" || pair.quote === "EUR"
        );
      } else if (selectedCategory === "GBP") {
        // Show all pairs where GBP is base or quote
        result = result.filter(
          (pair) => pair.base === "GBP" || pair.quote === "GBP"
        );
      } else if (selectedCategory === "JPY") {
        // Show all pairs where JPY is base or quote
        result = result.filter(
          (pair) => pair.base === "JPY" || pair.quote === "JPY"
        );
      } else if (selectedCategory) {
        // Standard category filtering
        result = result.filter((pair) => pair.group === selectedCategory);
      }
    }

    // Filter by favorites
    if (showFavorites) {
      result = result.filter((pair) => favorites.includes(pair.name));
    }

    setFilteredPairs(result);

    // Fetch rates for visible pairs if needed
    if (fetchExchangeRates) {
      fetchExchangeRates(result.slice(0, 10));
    }
  }, [
    searchTerm,
    selectedCategory,
    showFavorites,
    favorites,
    fetchExchangeRates,
    filterUsdPairs,
  ]);

  // Handle pair selection
  const handleSelect = (pair: CurrencyPair) => {
    // Make sure we have exchange rate data for this pair
    const pairCode = `${pair.base}${pair.quote}`;
    if (!exchangeRates[pairCode]) {
      fetchExchangeRates([pair]);
    }

    onSelect(pair);
    onClose();
  };

  // Toggle favorite status
  const toggleFavorite = (pairName: string) => {
    if (favorites.includes(pairName)) {
      setFavorites(favorites.filter((name) => name !== pairName));
    } else {
      setFavorites([...favorites, pairName]);
    }
  };

  // Focus on search input
  const focusSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle filter selection with optimized callbacks
  const handleFavoritesToggle = useCallback(() => {
    setShowFavorites(!showFavorites);
    setSelectedCategory(null);
    // Reset search when toggling filters
    setSearchTerm("");
  }, [showFavorites]);

  const handleAllCategoriesSelection = useCallback(() => {
    setSelectedCategory(null);
    setShowFavorites(false);
    // Reset search when toggling filters
    setSearchTerm("");
  }, []);

  const handleCategorySelection = useCallback(
    (group: string) => {
      setSelectedCategory(selectedCategory === group ? null : group);
      setShowFavorites(false);
      // Reset search when toggling filters
      setSearchTerm("");
    },
    [selectedCategory]
  );

  // Create keyboard handler for search shortcut (Ctrl+F/Cmd+F)
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsSearchFocused(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsSearchFocused(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Format rate display
  const formatRate = (
    value: number | undefined,
    decimalPlaces: number
  ): string => {
    if (value === undefined) return "-.----";
    return value.toFixed(decimalPlaces);
  };

  // Get rate display color
  const getRateColor = (rate: number | undefined): string => {
    if (rate === undefined) return colors.text;
    return colors.primary;
  };

  // Function to render the global badge for search results
  const renderGlobalBadge = (pair: CurrencyPair) => {
    // For now we'll only show badges for search results
    if (
      searchTerm.trim() !== "" &&
      selectedCategory &&
      pair.group !== selectedCategory
    ) {
      return (
        <View style={[styles.globalBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.globalBadgeText}>Global</Text>
        </View>
      );
    }
    return null;
  };

  // Handle suggestion selection
  const handleSuggestionPress = (suggestion: string) => {
    setSearchTerm(suggestion);
  };

  // Render each currency pair item
  const renderPairItem = ({ item }: { item: CurrencyPair }) => {
    const isSelected = selectedPair.name === item.name;
    const baseCurrency = getCurrencyByCode(item.base);
    const quoteCurrency = getCurrencyByCode(item.quote);
    const isFavorite = favorites.includes(item.name);

    // Get exchange rate data
    const pairCode = `${item.base}${item.quote}`;
    const rateData = exchangeRates[pairCode];

    return (
      <TouchableOpacity
        style={[
          pairItemStyle,
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
        <View style={styles.flagsContainer}>
          {baseCurrency && (
            <Image
              source={{
                uri: `https://flagcdn.com/w160/${baseCurrency.countryCode.toLowerCase()}.png`,
              }}
              style={[styles.flag, styles.flagFirst]}
              resizeMode="cover"
            />
          )}
          {quoteCurrency && (
            <Image
              source={{
                uri: `https://flagcdn.com/w160/${quoteCurrency.countryCode.toLowerCase()}.png`,
              }}
              style={[styles.flag, styles.flagSecond]}
              resizeMode="cover"
            />
          )}
        </View>
        <View style={styles.pairInfo}>
          <View style={styles.pairNameRow}>
            <Text style={[styles.pairName, { color: colors.text }]}>
              {item.name}
            </Text>
            {renderGlobalBadge(item)}
          </View>
          <Text style={[styles.pairDescription, { color: colors.text + "99" }]}>
            {baseCurrency?.name} / {quoteCurrency?.name}
          </Text>

          {/* Show exchange rate */}
          <View style={styles.rateContainer}>
            {rateData?.loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : rateData?.error ? (
              <Text style={styles.rateError}>Error loading rate</Text>
            ) : (
              <Text
                style={[
                  styles.rateValue,
                  { color: getRateColor(rateData?.mid) },
                ]}
              >
                {formatRate(rateData?.mid, item.pipDecimalPlaces)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.pairRight}>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.name)}
            style={styles.favoriteButton}
          >
            <MaterialIcons
              name={isFavorite ? "star" : "star-outline"}
              size={24}
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
        <Text style={styles.title}>Select Currency Pair</Text>
        <TouchableOpacity
          onPress={focusSearch}
          style={styles.headerSearchButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search mode indicator */}
      {searchTerm.trim() !== "" && (
        <View style={styles.searchModeContainer}>
          <Text style={[styles.searchModeText, { color: colors.primary }]}>
            <MaterialIcons
              name="info"
              size={14}
              color={colors.primary}
              style={styles.infoIcon}
            />{" "}
            Showing global search results across all categories
          </Text>
        </View>
      )}

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          isSearchFocused && {
            borderColor: colors.primary,
            borderWidth: 2,
          },
        ]}
      >
        <TouchableOpacity onPress={focusSearch} style={styles.searchIconButton}>
          <MaterialIcons
            name="search"
            size={24}
            color={
              searchTerm.trim() !== "" ? colors.primary : colors.text + "80"
            }
          />
        </TouchableOpacity>
        <TextInput
          ref={searchInputRef}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search currency pairs..."
          placeholderTextColor={colors.text + "66"}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
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
            <MaterialIcons name="clear" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Show suggestion chips when search has no results */}
      {searchTerm.trim() !== "" &&
        filteredPairs.length === 0 &&
        suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsText, { color: colors.text }]}>
              Did you mean:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScroll}
            >
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={[
                    styles.suggestionChip,
                    {
                      backgroundColor: colors.primary + "20",
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text
                    style={[
                      styles.suggestionChipText,
                      { color: colors.primary },
                    ]}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      {/* No results message */}
      {searchTerm.trim() !== "" &&
        filteredPairs.length === 0 &&
        suggestions.length === 0 && (
          <View style={styles.noResultsContainer}>
            <MaterialIcons
              name="search-off"
              size={48}
              color={colors.text + "40"}
            />
            <Text style={[styles.noResultsText, { color: colors.text }]}>
              No currency pairs found for "{searchTerm}"
            </Text>
            <Text
              style={[styles.noResultsSubtext, { color: colors.text + "80" }]}
            >
              Try different keywords or check your spelling
            </Text>
          </View>
        )}

      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.05)",
          backgroundColor: colors.background,
          opacity: searchTerm.trim() !== "" ? 0.6 : 1, // Dim filters when search is active
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
            disabled={searchTerm.trim() !== ""}
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
                backgroundColor:
                  selectedCategory === null && !showFavorites
                    ? colors.primary
                    : colors.card,
                borderColor:
                  selectedCategory === null && !showFavorites
                    ? colors.primary
                    : colors.border,
              },
            ]}
            onPress={handleAllCategoriesSelection}
            activeOpacity={0.6}
            disabled={searchTerm.trim() !== ""}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    selectedCategory === null && !showFavorites
                      ? "white"
                      : colors.text,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* Use direct currency-based filters for specific currency pairs */}
          {["Major", "USD", "EUR", "GBP", "JPY", "Other", "Exotic"].map(
            (group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      selectedCategory === group ? colors.primary : colors.card,
                    borderColor:
                      selectedCategory === group
                        ? colors.primary
                        : colors.border,
                  },
                  // Special style for currency filters
                  ["USD", "EUR", "GBP", "JPY"].includes(group) &&
                    styles.currencyFilterPill,
                ]}
                onPress={() => handleCategorySelection(group)}
                activeOpacity={0.6}
                disabled={searchTerm.trim() !== ""}
              >
                {["USD", "EUR", "GBP", "JPY"].includes(group) && (
                  <MaterialIcons
                    name="currency-exchange"
                    size={14}
                    color={
                      selectedCategory === group ? "white" : colors.primary
                    }
                    style={styles.filterCurrencyIcon}
                  />
                )}
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: selectedCategory === group ? "white" : colors.text,
                    },
                  ]}
                >
                  {group}
                  {["USD", "EUR", "GBP", "JPY"].includes(group) && " Pairs"}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPairs}
        renderItem={renderPairItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={[
          styles.listContent,
          { marginTop: 8 },
          filteredPairs.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={Platform.OS !== "ios"}
        getItemLayout={(data, index) => ({
          length: 96, // height of item + vertical margin/padding
          offset: 96 * index,
          index,
        })}
        keyboardShouldPersistTaps="handled"
        onEndReached={() => {
          const visiblePairs = filteredPairs.slice(10, 20);
          if (visiblePairs.length > 0 && fetchExchangeRates) {
            fetchExchangeRates(visiblePairs);
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          searchTerm.trim() === "" ? (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                No currency pairs found
              </Text>
            </View>
          ) : null
        }
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
  headerSearchButton: {
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
    paddingBottom: Platform.OS === "ios" ? 40 : 16,
  },
  pairInfo: {
    flex: 1,
  },
  pairName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  pairDescription: {
    fontSize: 13,
    flexWrap: "wrap",
    maxWidth: "100%",
  },
  pairRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginLeft: 4,
  },
  flag: {
    width: 35,
    height: 22,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.15)",
    marginTop: 5,
  },
  flagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
    width: 62,
    height: 36,
  },
  flagFirst: {
    zIndex: 2,
    position: "absolute",
    top: 0,
    left: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  flagSecond: {
    position: "absolute",
    top: 8,
    left: 20,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
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
  },
  rateContainer: {
    marginTop: 5,
    height: 20,
    justifyContent: "center",
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  rateError: {
    fontSize: 12,
    color: "#d32f2f",
  },
  searchModeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchModeText: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  infoIcon: {
    marginRight: 4,
  },
  searchIconButton: {
    padding: 4,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  suggestionsText: {
    fontSize: 14,
    marginBottom: 8,
  },
  suggestionsScroll: {
    paddingBottom: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyListContent: {
    flex: 1,
  },
  pairNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  globalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  globalBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  currencyFilterPill: {
    minWidth: 90,
  },
  filterCurrencyIcon: {
    marginRight: 4,
  },
});

export default CurrencyPairModal;
