import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExchangeRates } from '../contexts/ExchangeRateContext';
import { CURRENCY_PAIRS } from '../constants/currencies';
import { useTheme } from '../contexts/ThemeContext';

export default function ExchangeRatesScreen() {
  const router = useRouter();
  const { forexPairRates, isLoading, lastUpdated, refreshRates } = useExchangeRates();
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f6f6f6' }]} edges={['bottom']}>
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Exchange Rates</Text>
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
          <Text style={[styles.lastUpdatedText, { color: isDark ? '#aaa' : '#666' }]}>
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
            <Text style={[styles.loadingText, { color: isDark ? '#aaa' : '#666' }]}>Updating exchange rates...</Text>
          </View>
        )}

        <View style={[styles.ratesContainer, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          <View style={[styles.rateHeader, { backgroundColor: isDark ? '#2A2A2A' : '#f0f0f0' }]}>
            <Text style={[styles.pairHeaderText, { color: isDark ? '#fff' : '#000' }]}>Currency Pair</Text>
            <Text style={[styles.rateHeaderText, { color: isDark ? '#fff' : '#000' }]}>Rate</Text>
          </View>
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          
          {CURRENCY_PAIRS.map((pair) => (
            <View key={pair}>
              <View style={styles.rateRow}>
                <Text style={[styles.pairText, { color: isDark ? '#fff' : '#000' }]}>{pair}</Text>
                <Text style={styles.rateText}>
                  {forexPairRates[pair] 
                    ? forexPairRates[pair].toFixed(4) 
                    : 'Loading...'}
                </Text>
              </View>
              <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#aaa',
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#aaa',
  },
  ratesContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2A2A2A',
  },
  pairHeaderText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  rateHeaderText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pairText: {
    color: '#fff',
  },
  rateText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
