import React, { useEffect, useState } from "react";
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
import { useTheme } from "../contexts/ThemeContext";

export default function ExchangeRatesScreen() {
  const router = useRouter();
  const { forexPairRates, isLoading, lastUpdated, refreshRates, error } =
    useExchangeRates();
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([
    "EURUSD",
    "GBPUSD",
    "USDJPY",
  ]);
  const { isDark } = useTheme();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleString();
  };

  const toggleFavorite = (pair: string) => {
    if (favorites.includes(pair)) {
      setFavorites(favorites.filter((p) => p !== pair));
    } else {
      setFavorites([...favorites, pair]);
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

        <View
          style={[
            styles.ratesContainer,
            { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
          ]}
        >
          <View
            style={[
              styles.rateHeader,
              { backgroundColor: isDark ? "#2A2A2A" : "#f0f0f0" },
            ]}
          >
            <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
              Currency Pair
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
              Rate
            </Text>
            <Text
              variant="bodyMedium"
              style={{ fontWeight: "bold", width: 40 }}
            >
              Fav
            </Text>
          </View>
          <Divider
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          />

          {CURRENCY_PAIRS.map((pair) => {
            const formattedPair = pair.replace("/", "");
            const change = getRateChangeIndicator(formattedPair);
            return (
              <View key={formattedPair}>
                <View style={styles.rateRow}>
                  <Text variant="bodyMedium">{formattedPair}</Text>
                  <View style={styles.rateValueContainer}>
                    <Text
                      variant="bodyMedium"
                      style={{ color: "#6200ee", fontWeight: "bold" }}
                    >
                      {forexPairRates[formattedPair]
                        ? forexPairRates[formattedPair].toFixed(4)
                        : "Loading..."}
                    </Text>
                    <Ionicons
                      name={change.icon}
                      size={12}
                      color={change.color}
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(formattedPair)}
                  >
                    <Ionicons
                      name={
                        favorites.includes(formattedPair)
                          ? "star"
                          : "star-outline"
                      }
                      size={20}
                      color={
                        favorites.includes(formattedPair)
                          ? "#FFC107"
                          : isDark
                          ? "#aaa"
                          : "#666"
                      }
                    />
                  </TouchableOpacity>
                </View>
                <Divider
                  style={[
                    styles.divider,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.infoContainer}>
          <Chip icon="information" style={{ marginBottom: 8 }}>
            Pull down to refresh rates
          </Chip>
          <Text
            variant="bodySmall"
            style={{ color: isDark ? "#aaa" : "#666", textAlign: "center" }}
          >
            Exchange rates are updated every 15 minutes. Tap the star icon to
            add or remove from favorites.
          </Text>
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
});
