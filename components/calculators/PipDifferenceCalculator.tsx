import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider } from 'react-native-paper';

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
    const priceANum = parseFloat(priceA) || 0;
    const priceBNum = parseFloat(priceB) || 0;
    
    const calculatedPipDifference = calculatePipDifference(
      priceANum,
      priceBNum,
      currencyPair
    );
    
    setPipDifference(calculatedPipDifference);
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