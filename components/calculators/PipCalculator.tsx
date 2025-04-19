import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
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
    const positionSizeNum = parseFloat(positionSize) || 0;
    const pipsNum = parseFloat(pips) || 0;
    
    const calculatedPipValue = calculatePipValue(
      currencyPair,
      accountCurrency,
      positionSizeNum
    );
    
    setPipValue(calculatedPipValue);
    setTotalValue(calculatedPipValue * pipsNum);
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
            label="Pip Value"
            value={formatCurrency(pipValue, accountCurrency)}
            color="#4CAF50"
            isLarge
          />
          
          <ResultDisplay
            label={`Total Value for ${pips} Pips`}
            value={formatCurrency(totalValue, accountCurrency)}
            color="#2196F3"
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