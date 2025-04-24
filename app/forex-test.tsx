import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { fetchExchangeRate } from "../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForexTestScreen() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const fetchRate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch EUR/USD exchange rate
      const currentRate = await fetchExchangeRate("EUR", "USD");

      setRate(currentRate);
      setTimestamp(new Date().toLocaleTimeString());

      // Log to console as well
      console.log("[FOREX TEST] EUR/USD Rate:", currentRate);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("[FOREX TEST] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on initial load
  useEffect(() => {
    fetchRate();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Forex API Test</Text>

      <View style={styles.card}>
        <Text style={styles.label}>EUR/USD Exchange Rate:</Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.rate}>{rate?.toFixed(4)}</Text>
            {timestamp && (
              <Text style={styles.timestamp}>Last updated: {timestamp}</Text>
            )}
          </>
        )}
      </View>

      <Button
        mode="contained"
        onPress={fetchRate}
        loading={loading}
        style={styles.button}
      >
        Refresh Rate
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 24,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  rate: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  button: {
    marginTop: 16,
  },
});
