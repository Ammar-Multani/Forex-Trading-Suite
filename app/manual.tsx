import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ManualScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Manual</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Forex Calculator Suite Manual</Text>
        
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.paragraph}>
          The Forex Calculator Suite provides a collection of essential tools for forex traders. From the home screen, simply tap on any calculator to access its features.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Compounding Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate how your investment will grow over time with compound interest. Enter your starting balance, rate of return, frequency, and duration to see projected results.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Fibonacci Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate Fibonacci retracement and extension levels based on high and low prices. Select uptrend or downtrend to get the appropriate levels.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Pip Difference Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate the number of pips between two price points for any currency pair.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Pip Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate the value of a pip for your position size in your account currency.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Pivot Points Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate pivot points using various methods (Standard, Woodie's, Camarilla, DeMark) based on previous high, low, and close prices.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Position Size Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate the optimal position size based on your account balance, risk percentage, and stop loss in pips.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Profit/Loss Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate potential profit or loss for a trade based on entry price, exit price, and position size.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Margin Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate the required margin for a position based on position size and leverage.
        </Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Stop Loss/Take Profit Calculator</Text>
        <Text style={styles.paragraph}>
          Calculate stop loss and take profit levels, along with risk/reward ratio for your trades.
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
});