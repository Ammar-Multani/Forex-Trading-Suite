import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculatePipValue, formatCurrency } from '../../utils/calculators';

export default function PipCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [positionSize, setPositionSize] = useState('1');
  const [pips, setPips] = useState('10');
  
  // State for results
  const [pipValue, setPipValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, positionSize, pips]);
  
  const calculateResults = () => {
    const positionSizeValue = parseFloat(positionSize) || 0;
    const pipsValue = parseFloat(pips) || 0;
    
    if (positionSizeValue <= 0) return;
    
    const singlePipValue = calculatePipValue(currencyPair, accountCurrency, positionSizeValue);
    setPipValue(singlePipValue);
    setTotalValue(singlePipValue * pipsValue);
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Pip Calculator">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={setAccountCurrency}
          />
          
          <CurrencyPairSelector
            value={currencyPair}
            onChange={setCurrencyPair}
          />
          
          <TextInput
            label="Position Size (Lots)"
            value={positionSize}
            onChangeText={setPositionSize}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Number of Pips"
            value={pips}
            onChangeText={setPips}
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
            label="Value per Pip"
            value={formatCurrency(pipValue, accountCurrency, 2)}
            color="#4CAF50"
          />
          
          <ResultDisplay
            label={`Total Value for ${pips} Pips`}
            value={formatCurrency(totalValue, accountCurrency, 2)}
            color="#2196F3"
            isLarge
          />
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              1 Standard Lot = 100,000 units
            </Text>
            <Text style={styles.infoText}>
              1 Mini Lot = 10,000 units
            </Text>
            <Text style={styles.infoText}>
              1 Micro Lot = 1,000 units
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
    marginBottom: 4,
  },
});