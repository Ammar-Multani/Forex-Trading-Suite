import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import { calculatePipDifference, formatNumber } from '../../utils/calculators';

export default function PipDifferenceCalculator() {
  // State for inputs
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [priceA, setPriceA] = useState('1.1000');
  const [priceB, setPriceB] = useState('1.1050');
  
  // State for results
  const [pipDifference, setPipDifference] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [currencyPair, priceA, priceB]);
  
  const calculateResults = () => {
    const priceAValue = parseFloat(priceA) || 0;
    const priceBValue = parseFloat(priceB) || 0;
    
    if (priceAValue <= 0 || priceBValue <= 0) return;
    
    const pips = calculatePipDifference(priceAValue, priceBValue, currencyPair);
    setPipDifference(pips);
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Pip Difference Calculator">
        <View style={styles.inputsContainer}>
          <CurrencyPairSelector
            value={currencyPair}
            onChange={setCurrencyPair}
          />
          
          <TextInput
            label="Price A"
            value={priceA}
            onChangeText={setPriceA}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Price B"
            value={priceB}
            onChangeText={setPriceB}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <ResultDisplay
            label="Pip Difference"
            value={formatNumber(pipDifference, 1)}
            color="#4CAF50"
            isLarge
          />
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              For {currencyPair}, 1 pip = {currencyPair.includes('JPY') ? '0.01' : '0.0001'}
            </Text>
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
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    color: '#2196F3',
    fontSize: 14,
  },
});