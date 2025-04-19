import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { TextInput, Divider, Text } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import { calculateFibonacciLevels, formatNumber } from '../../utils/calculators';

export default function FibonacciCalculator() {
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1000');
  const [isUptrend, setIsUptrend] = useState(true);
  
  // State for results
  const [retracements, setRetracements] = useState<Array<{ level: number; price: number }>>([]);
  const [extensions, setExtensions] = useState<Array<{ level: number; price: number }>>([]);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, isUptrend]);
  
  const calculateResults = () => {
    const highPriceNum = parseFloat(highPrice) || 0;
    const lowPriceNum = parseFloat(lowPrice) || 0;
    
    const { retracements: calculatedRetracements, extensions: calculatedExtensions } = calculateFibonacciLevels(
      highPriceNum,
      lowPriceNum,
      isUptrend
    );
    
    setRetracements(calculatedRetracements);
    setExtensions(calculatedExtensions);
  };
  
  const toggleTrend = () => setIsUptrend(!isUptrend);
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Fibonacci Calculator">
        <View style={styles.inputsContainer}>
          <TextInput
            label="High Price"
            value={highPrice}
            onChangeText={setHighPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Low Price"
            value={lowPrice}
            onChangeText={setLowPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <View style={styles.trendContainer}>
            <Text style={styles.trendLabel}>Trend Direction</Text>
            <View style={styles.switchContainer}>
              <Text style={[styles.trendText, !isUptrend && styles.activeTrend]}>Downtrend</Text>
              <Switch
                value={isUptrend}
                onValueChange={toggleTrend}
                trackColor={{ false: '#767577', true: '#6200ee' }}
                thumbColor="#f4f3f4"
              />
              <Text style={[styles.trendText, isUptrend && styles.activeTrend]}>Uptrend</Text>
            </View>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Fibonacci Retracement Levels</Text>
          <View style={styles.levelsContainer}>
            {retracements.map((level) => (
              <View key={`retracement-${level.level}`} style={styles.levelRow}>
                <Text style={styles.levelPercent}>{level.level}%</Text>
                <Text style={styles.levelPrice}>{formatNumber(level.price, 5)}</Text>
              </View>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Fibonacci Extension Levels</Text>
          <View style={styles.levelsContainer}>
            {extensions.map((level) => (
              <View key={`extension-${level.level}`} style={styles.levelRow}>
                <Text style={styles.levelPercent}>{level.level}%</Text>
                <Text style={styles.levelPrice}>{formatNumber(level.price, 5)}</Text>
              </View>
            ))}
          </View>
        </View>
      </CalculatorCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputsContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2A2A2A',
  },
  trendContainer: {
    marginBottom: 16,
  },
  trendLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendText: {
    marginHorizontal: 8,
    color: '#aaa',
  },
  activeTrend: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  levelsContainer: {
    marginBottom: 16,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelPercent: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  levelPrice: {
    color: '#fff',
  },
});