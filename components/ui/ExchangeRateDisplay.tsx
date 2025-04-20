import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Card } from 'react-native-paper';
import { useExchangeRates } from '../../contexts/ExchangeRateContext';
import { Ionicons } from '@expo/vector-icons';

interface ExchangeRateDisplayProps {
  onSelectPair?: (pair: string) => void;
}

export default function ExchangeRateDisplay({ onSelectPair }: ExchangeRateDisplayProps) {
  const { isLoading, error, forexPairRates, refreshRates } = useExchangeRates();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  // Format the rate with appropriate decimal places
  const formatRate = (rate: number): string => {
    if (rate >= 100) {
      return rate.toFixed(2);
    } else {
      return rate.toFixed(4);
    }
  };

  const renderRateItem = ({ item }: { item: [string, number] }) => {
    const [pair, rate] = item;
    
    return (
      <TouchableOpacity 
        style={styles.rateItem}
        onPress={() => onSelectPair && onSelectPair(pair)}
      >
        <View style={styles.pairContainer}>
          <Text style={styles.pairText}>{pair}</Text>
        </View>
        <Text style={styles.rateText}>{formatRate(rate)}</Text>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <Card style={styles.errorCard}>
        <Card.Content>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshRates}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Exchange Rates</Text>
        <TouchableOpacity onPress={refreshRates} disabled={isLoading}>
          <Ionicons 
            name="refresh" 
            size={20} 
            color={isLoading ? "#666" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      
      {isLoading && Object.keys(forexPairRates).length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading exchange rates...</Text>
        </View>
      ) : (
        <FlatList
          data={Object.entries(forexPairRates)}
          renderItem={renderRateItem}
          keyExtractor={(item) => item[0]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6200ee"
              colors={["#6200ee"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No exchange rates available</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#aaa',
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  pairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  rateText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    color: '#aaa',
  },
  errorCard: {
    backgroundColor: '#2A2A2A',
    marginVertical: 8,
  },
  errorText: {
    color: '#FF5252',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#6200ee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    marginLeft: 6,
  },
});