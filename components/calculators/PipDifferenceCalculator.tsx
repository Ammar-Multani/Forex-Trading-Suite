import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider } from 'react-native-paper';
import { calculatePipDifference } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';

export default function PipDifferenceCalculator() {
  // State for inputs
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [priceA, setPriceA] = useState('1.2000');
  const [priceB, setPriceB] = useState('1.1950');
  
  // State for results
  const [pipDifference, setPipDifference] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [currencyPair, priceA, priceB]);
  
  const calculateResults = () => {
    const a = parseFloat(priceA) || 0;
    const b = parseFloat(priceB) || 0;
    
    if (a > 0 && b > 0) {
      const pips = calculatePipDifference(a, b, currencyPair);
      setPipDifference(pips);
    }
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
            value={pipDifference.toFixed(1)}
            color="#4CAF50"
            isLarge
          />
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
});