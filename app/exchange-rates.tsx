import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  Text,
  Divider,
  ActivityIndicator,
  Card,
  Chip,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useExchangeRates } from "../contexts/ExchangeRateContext";
import { CURRENCY_PAIRS } from "../constants/currencies";
import {
  getCurrencyPairGroups,
  getCurrencyPairsByGroup,
} from "../constants/currencies";
import { useTheme } from "../contexts/ThemeContext";

export default function ExchangeRatesScreen() {
  const router = useRouter();
  const {
    forexPairRates,
    isLoading,
    lastUpdated,
    refreshRates,
    loadCurrencyPairs,
    error,
  } = useExchangeRates();
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([
    "EURUSD",
    "GBPUSD",
    "USDJPY",
  ]);
  const [selectedGroup, setSelectedGroup] = useState<string>("Major");
  const { isDark } = useTheme();

  // Get available currency pair groups
  const groups = getCurrencyPairGroups();

  // Get all pairs in the selected group
  const pairsInGroup = getCurrencyPairsByGroup(selectedGroup);
  const pairCodes = pairsInGroup.map((pair) => pair.name.replace("/", ""));

  // Load all required pairs at once - favorites and currently selected group
  const loadRequiredPairs = useCallback(() => {
    const allRequiredPairs = [...favorites, ...pairCodes];
    loadCurrencyPairs(allRequiredPairs);
  }, [favorites, pairCodes, loadCurrencyPairs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  // Load all required pairs when component mounts
  useEffect(() => {
    loadRequiredPairs();
  }, [loadRequiredPairs]);

  // Update when selected group changes
  useEffect(() => {
    // The loadRequiredPairs callback has dependence on pairCodes
    // which changes when selectedGroup changes
    loadRequiredPairs();
  }, [selectedGroup]);

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleString();
  };

  const toggleFavorite = (pair: string) => {
    const newFavorites = favorites.includes(pair)
      ? favorites.filter((p) => p !== pair)
      : [...favorites, pair];

    setFavorites(newFavorites);

    // Since the API call is debounced in the context
    // we don't need to worry about making unnecessary calls here
    if (!favorites.includes(pair)) {
      loadCurrencyPairs([pair]);
    }
  };

  const getRateChangeIndicator = (pair: string) => {
    // This is a placeholder - in a real app, you would compare with previous rates
    // For now, we'll use a random value for demonstration
    const change = Math.random() > 0.5 ? 1 : -1;
    return {
      direction: change > 0 ? "up" : "down",
      color: change > 0 ? "#4CAF50" : "#F44336",
      icon: change > 0 ? "arrow-up" : "arrow-down",
      value: (Math.random() * 0.5).toFixed(4),
    };
  };

  // Display error if there is one
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshRates}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f6f6f6" },
      ]}
      edges={["bottom"]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text variant="titleLarge">Exchange Rates</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.lastUpdatedContainer}>
          <Text variant="bodySmall">
            Last updated: {formatDate(lastUpdated)}
          </Text>
          <TouchableOpacity onPress={refreshRates} disabled={isLoading}>
            <Ionicons
              name="refresh"
              size={20}
              color="#6200ee"
              style={isLoading ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>

        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text variant="bodySmall" style={{ marginTop: 10 }}>
              Updating exchange rates...
            </Text>
          </View>
        )}

        {favorites.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text
              variant="titleMedium"
              style={{ marginBottom: 12, color: isDark ? "#fff" : "#000" }}
            >
              Favorites
            </Text>
            <View style={styles.favoriteCardsContainer}>
              {favorites.map((pair) => {
                const change = getRateChangeIndicator(pair);
                return (
                  <Card
                    key={pair}
                    style={[
                      styles.favoriteCard,
                      { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
                    ]}
                  >
                    <Card.Content>
                      <View style={styles.favoriteCardHeader}>
                        <Text
                          variant="titleMedium"
                          style={{ color: isDark ? "#fff" : "#000" }}
                        >
                          {pair}
                        </Text>
                        <TouchableOpacity onPress={() => toggleFavorite(pair)}>
                          <Ionicons name="star" size={20} color="#FFC107" />
                        </TouchableOpacity>
                      </View>
                      <Text
                        variant="displaySmall"
                        style={{
                          color: isDark ? "#fff" : "#000",
                          marginVertical: 8,
                        }}
                      >
                        {forexPairRates[pair]
                          ? forexPairRates[pair].toFixed(4)
                          : "—"}
                      </Text>
                      <View style={styles.changeContainer}>
                        <Ionicons
                          name={change.icon}
                          size={16}
                          color={change.color}
                        />
                        <Text style={{ color: change.color, marginLeft: 4 }}>
                          {change.value}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {/* Group selection chips */}
        <View style={styles.groupSelector}>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 12, color: isDark ? "#fff" : "#000" }}
          >
            Currency Groups
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {groups.map((group) => (
              <Chip
                key={group}
                selected={selectedGroup === group}
                onPress={() => setSelectedGroup(group)}
                style={{ marginRight: 8, marginBottom: 8 }}
                mode={selectedGroup === group ? "flat" : "outlined"}
              >
                {group}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Display currency pairs from selected group */}
        <View style={styles.pairsSection}>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 12, color: isDark ? "#fff" : "#000" }}
          >
            {selectedGroup} Pairs
          </Text>
          {pairsInGroup.map((pairObj) => {
            const pair = pairObj.name.replace("/", "");
            const change = getRateChangeIndicator(pair);
            const isFavorite = favorites.includes(pair);

            return (
              <Card
                key={pair}
                style={[
                  styles.pairCard,
                  { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
                ]}
              >
                <Card.Content>
                  <View style={styles.pairCardContent}>
                    <View>
                      <Text
                        variant="titleMedium"
                        style={{ color: isDark ? "#fff" : "#000" }}
                      >
                        {pairObj.name}
                      </Text>
                      <View style={styles.changeContainer}>
                        <Ionicons
                          name={change.icon}
                          size={16}
                          color={change.color}
                        />
                        <Text style={{ color: change.color, marginLeft: 4 }}>
                          {change.value}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.pairCardRight}>
                      <Text
                        variant="titleLarge"
                        style={{ color: isDark ? "#fff" : "#000" }}
                      >
                        {forexPairRates[pair]
                          ? forexPairRates[pair].toFixed(4)
                          : "—"}
                      </Text>
                      <TouchableOpacity onPress={() => toggleFavorite(pair)}>
                        <Ionicons
                          name={isFavorite ? "star" : "star-outline"}
                          size={20}
                          color={
                            isFavorite ? "#FFC107" : isDark ? "#777" : "#999"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    height: 80,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  lastUpdatedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rotating: {
    transform: [{ rotate: "45deg" }],
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  favoritesSection: {
    marginBottom: 24,
  },
  favoriteCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  favoriteCard: {
    width: "48%",
    marginBottom: 12,
    elevation: 2,
  },
  favoriteCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratesContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  rateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2A2A2A",
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rateValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteButton: {
    width: 40,
    alignItems: "center",
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  errorCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#6200ee",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    marginLeft: 8,
  },
  groupSelector: {
    marginBottom: 24,
  },
  pairsSection: {
    marginBottom: 24,
  },
  pairCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  pairCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pairCardRight: {
    flexDirection: "row",
    alignItems: "center",
  },
});
