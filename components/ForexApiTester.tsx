import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Button, Card, Divider } from "react-native-paper";
import env from "../config/env";

interface Quote {
  ask: number;
  bid: number;
  mid: number;
  base_currency: string;
  quote_currency: string;
}

interface ApiResponse {
  endpoint: string;
  quotes: Quote[];
  requested_time: string;
  timestamp: number;
}

export default function ForexApiTester() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test with multiple common currency pairs
      const currencyPairs = "EURUSD,GBPUSD,USDJPY";
      const url = `https://marketdata.tradermade.com/api/v1/live?currency=${currencyPairs}&api_key=${env.traderMadeApiKey}`;

      console.log("[Forex API Test] Fetching rates from TraderMade API...");

      const apiResponse = await fetch(url);

      if (!apiResponse.ok) {
        throw new Error(
          `API returned ${apiResponse.status}: ${apiResponse.statusText}`
        );
      }

      const data = await apiResponse.json();
      setResponse(data);

      // Log the result to console
      console.log("[Forex API Test] Response:", JSON.stringify(data, null, 2));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("[Forex API Test] Error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="TraderMade Forex API Tester" />
        <Card.Content>
          <Text style={styles.description}>
            Tests the TraderMade API by fetching live rates for EUR/USD,
            GBP/USD, and USD/JPY
          </Text>
          <Button
            mode="contained"
            onPress={testApi}
            loading={loading}
            style={styles.button}
          >
            Fetch Live Rates
          </Button>

          {error && <Text style={styles.error}>{error}</Text>}

          {response && (
            <ScrollView style={styles.responseContainer}>
              <Text style={styles.responseTitle}>Live Exchange Rates:</Text>
              <Divider style={styles.divider} />

              {response.quotes.map((quote) => (
                <View
                  key={`${quote.base_currency}${quote.quote_currency}`}
                  style={styles.quoteItem}
                >
                  <Text style={styles.currencyPair}>
                    {quote.base_currency}/{quote.quote_currency}
                  </Text>
                  <View style={styles.ratesRow}>
                    <Text style={styles.rateLabel}>
                      Bid:{" "}
                      <Text style={styles.rateValue}>
                        {quote.bid.toFixed(4)}
                      </Text>
                    </Text>
                    <Text style={styles.rateLabel}>
                      Ask:{" "}
                      <Text style={styles.rateValue}>
                        {quote.ask.toFixed(4)}
                      </Text>
                    </Text>
                    <Text style={styles.rateLabel}>
                      Mid:{" "}
                      <Text style={styles.rateValue}>
                        {quote.mid.toFixed(4)}
                      </Text>
                    </Text>
                  </View>
                  <Divider style={styles.divider} />
                </View>
              ))}

              <Text style={styles.timestamp}>
                Timestamp:{" "}
                {new Date(response.timestamp * 1000).toLocaleString()}
              </Text>
              <Text style={styles.timestamp}>
                Server time: {response.requested_time}
              </Text>
            </ScrollView>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    marginVertical: 10,
  },
  description: {
    marginBottom: 15,
    fontSize: 14,
    color: "#555",
  },
  button: {
    marginVertical: 15,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  responseContainer: {
    marginTop: 15,
    maxHeight: 300,
  },
  responseTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  quoteItem: {
    marginBottom: 10,
  },
  currencyPair: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  ratesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  rateLabel: {
    fontSize: 14,
  },
  rateValue: {
    fontWeight: "bold",
    color: "#2e7d32",
  },
  divider: {
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
});
