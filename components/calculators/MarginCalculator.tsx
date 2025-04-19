import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import { calculateMargin, formatCurrency } from '../../utils/calculators';

export default function MarginCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [positionSize, setPositionSize] = useState('1');
  const [leverage, setLeverage] = useState('100');
  
  // State for results
  const [requiredMargin, setRequiredMargin] = useState(0);
  const [marginLevel, setMarginLevel] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, positionSize, leverage]);
  
  const calculateResults = () => {
    const positionSizeNum = parseFloat(positionSize) || 0;
    const leverageNum = parseFloat(leverage) || 1;
    
    const { requiredMargin: margin, marginLevel: level } = calculateMargin(
      currencyPair,
      accountCurrency,
      positionSizeNum,
      leverageNum
    );
    
    setRequiredMargin(margin);
    setMarginLevel(level);
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Margin Calculator">
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
            label="Leverage"
            value={leverage}
            onChangeText={setLeverage}
            keyboardType="numeric"
            right={<TextInput.Affix text="x" />}
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
            label="Required Margin"
            value={formatCurrency(requiredMargin, accountCurrency)}
            color="#4CAF50"
            isLarge
          />
          
          <ResultDisplay
            label="Margin Level"
            value={`${formatNumber(marginLevel, 2)}%`}
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

// Helper function to format numbers
function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}