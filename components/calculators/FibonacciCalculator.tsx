import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Divider, RadioButton } from 'react-native-paper';
import { calculateFibonacciLevels } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';

export default function FibonacciCalculator() {
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1800');
  const [trend, setTrend] = useState('uptrend');
  
  // State for results
  const [retracements, setRetracements] = useState<Array<{ level: number; price: number }>>([]);
  const [extensions, setExtensions] = useState<Array<{ level: number; price: number }>>([]);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, trend]);
  
  const calculateResults = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const isUptrend = trend === 'uptrend';
    
    if (high > 0 && low > 0) {
      const { retracements: retLevels, extensions: extLevels } = calculateFibonacciLevels(
        high,
        low,
        isUptrend
      );
      
      setRetracements(retLevels);
      setExtensions(extLevels);
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };
  
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
          
          <Text style={styles.radioLabel}>Trend Direction</Text>
          <RadioButton.Group onValueChange={value => setTrend(value)} value={trend}>
            <View style={styles.radioContainer}>
              <View style={styles.radioButton}>
                <RadioButton value="uptrend" color="#6200ee" />
                <Text style={styles.radioText}>Uptrend</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton value="downtrend" color="#6200ee" />
                <Text style={styles.radioText}>Downtrend</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Fibonacci Retracement Levels</Text>
          <ScrollView style={styles.levelsContainer}>
            {retracements.map((level, index) => (
              <View key={`ret-${index}`} style={styles.levelRow}>
                <Text style={styles.levelPercent}>{level.level}%</Text>
                <Text style={styles.levelPrice}>{formatPrice(level.price)}</Text>
              </View>
            ))}
          </ScrollView>
          
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Fibonacci Extension Levels</Text>
          <ScrollView style={styles.levelsContainer}>
            {extensions.map((level, index) => (
              <View key={`ext-${index}`} style={styles.levelRow}>
                <Text style={styles.levelPercent}>{level.level}%</Text>
                <Text style={styles.levelPrice}>{formatPrice(level.price)}</Text>
              </View>
            ))}
          </ScrollView>
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
  radioLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioText: {
    color: '#fff',
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
    marginBottom: 8,
  },
  levelsContainer: {
    maxHeight: 200,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelPercent: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  levelPrice: {
    color: '#fff',
  },
});