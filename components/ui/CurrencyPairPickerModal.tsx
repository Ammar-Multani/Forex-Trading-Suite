import React, { useState, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import {
  currencyPairs,
  getCurrencyByCode,
  CurrencyPair,
  filterCurrencyPairs,
  getCurrencyPairGroups,
} from "../../constants/currencies";

interface CurrencyPairPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currencyPair: CurrencyPair) => void;
  selectedPair: string;
  title?: string;
}

const CurrencyPairPickerModal: React.FC<CurrencyPairPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedPair,
  title = "Select Currency Pair",
}) => {
  const { isDark, theme, colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // State for category filtering
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // State for favorites
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
  ]);

  // Filter currency pairs based on search, category, and favorites
  let filteredPairs = searchQuery
    ? filterCurrencyPairs(searchQuery)
    : currencyPairs;

  // Apply category filter if selected
  if (selectedCategory) {
    filteredPairs = filteredPairs.filter(
      (pair) => pair.group === selectedCategory
    );
  }

  // Filter by favorites if enabled
  if (showFavorites) {
    filteredPairs = filteredPairs.filter((pair) =>
      favorites.includes(pair.name)
    );
  }

  // Get all unique currency pair groups
  const allCategories = ["Major", "EUR", "GBP", "JPY", "Other", "Exotic"];

  // Handle category selection with optimized callbacks
  const handleFavoritesToggle = useCallback(() => {
    setShowFavorites(!showFavorites);
    setSelectedCategory(null);
  }, [showFavorites]);

  const handleAllCategoriesSelection = useCallback(() => {
    setSelectedCategory(null);
    setShowFavorites(false);
  }, []);

  const handleCategorySelection = useCallback(
    (group: string) => {
      setSelectedCategory(selectedCategory === group ? null : group);
      setShowFavorites(false);
    },
    [selectedCategory]
  );

  // Toggle favorite status
  const toggleFavorite = (pairName: string) => {
    if (favorites.includes(pairName)) {
      setFavorites(favorites.filter((name) => name !== pairName));
    } else {
      setFavorites([...favorites, pairName]);
    }
  };

  // Render each currency pair item
  const renderCurrencyPairItem = ({ item }: { item: CurrencyPair }) => {
    const isSelected = selectedPair === item.name;
    const baseCurrency = getCurrencyByCode(item.base);
    const quoteCurrency = getCurrencyByCode(item.quote);
    const isFavorite = favorites.includes(item.name);

    if (!baseCurrency || !quoteCurrency) return null;

    return (
      <TouchableOpacity
        style={[
          styles.pairItem,
          { backgroundColor: theme.colors.surface },
          isSelected && {
            backgroundColor: isDark
              ? `${colors.primary}20`
              : `${colors.primary}10`,
            borderColor: colors.primary,
            borderWidth: 1,
          },
        ]}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.pairItemLeft}>
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
            <Text style={[styles.pairName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text
              style={[
                styles.pairDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {baseCurrency.name} / {quoteCurrency.name}
            </Text>
          </View>
        </View>

        <View style={styles.pairDetails}>
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
              style={{ paddingLeft: 16 }}
            />
          )}
          <TouchableOpacity
            onPress={() => toggleFavorite(item.name)}
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
      transparent={false}
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
              placeholder="Search currency pairs..."
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

        {/* Category Filters */}
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
                  backgroundColor:
                    !selectedCategory && !showFavorites
                      ? colors.primary
                      : theme.colors.surface,
                  borderColor:
                    !selectedCategory && !showFavorites
                      ? colors.primary
                      : theme.colors.onSurfaceVariant + "40",
                },
              ]}
              onPress={handleAllCategoriesSelection}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      !selectedCategory && !showFavorites
                        ? "white"
                        : theme.colors.text,
                  },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {allCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      selectedCategory === category
                        ? colors.primary
                        : theme.colors.surface,
                    borderColor:
                      selectedCategory === category
                        ? colors.primary
                        : theme.colors.onSurfaceVariant + "40",
                  },
                ]}
                onPress={() => handleCategorySelection(category)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedCategory === category
                          ? "white"
                          : theme.colors.text,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Currency Pair List */}
        <FlatList
          data={filteredPairs}
          renderItem={renderCurrencyPairItem}
          keyExtractor={(item) => item.name}
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
    paddingBottom: 12,
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
  pairItem: {
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
  pairItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagsContainer: {
    position: "relative",
    width: 55,
    height: 30,
    marginRight: 12,
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
  pairName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  pairDescription: {
    fontSize: 14,
  },
  pairDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  pipValue: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  favoriteButton: {
    padding: 4,
  },
});

export default CurrencyPairPickerModal;
export { CurrencyPair };
