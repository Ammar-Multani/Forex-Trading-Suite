import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ForexApiTester from "../components/ForexApiTester";

export default function ForexApiTestPage() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Forex API Test Page</Text>
        <Text style={styles.description}>
          This page demonstrates fetching live currency exchange rates from the
          TraderMade API. Press the button below to test.
        </Text>

        <ForexApiTester />

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            View the console logs for more detailed output.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});
