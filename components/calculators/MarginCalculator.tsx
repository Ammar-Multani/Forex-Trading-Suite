import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider, ProgressBar } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculateMargin, formatCurrency, formatNumber } from '../../utils/calculators';

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
    const size = parseFloat(positionSize) || 0;
    const leverageValue = parseFloat(leverage) || 1;
    
    if (size <= 0 || leverageValue <= 0) return;
    
    const { requiredMargin: margin, marginLevel: level } = calculateMargin(
      currencyPair,
      accountCurrency,
      size,
      leverageValue
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
            right={<TextInput.Affix text=":1" />}
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
          
          <View style={styles.leverageInfo}>
            <Text style={styles.infoTitle}>Leverage Explanation</Text>
            <Text style={styles.infoText}>
              With {leverage}:1 leverage, you need to deposit 1/{leverage} of the position value as margin.
            </Text>
            <Text style={styles.infoText}>
              Higher leverage means higher risk and potential for larger gains or losses.
            </Text>
          </View>
          
          <View style={styles.marginVisualization}>
            <Text style={styles.visualizationLabel}>
              Margin Level: {formatNumber(marginLevel, 0)}%
            </Text>
            <ProgressBar
              progress={Math.min(marginLevel / 200, 1)}
              color={marginLevel < 100 ? '#F44336' : marginLevel < 150 ? '#FFC107' : '#4CAF50'}
              style={styles.progressBar}
            />
            <View style={styles.marginLevels}>
              <Text style={[styles.marginLevel, { color: '#F44336' }]}>Danger</Text>
              <Text style={[styles.marginLevel, { color: '#FFC107' }]}>Warning</Text>
              <Text style={[styles.marginLevel, { color: '#4CAF50' }]}>Safe</Text>
            </View>
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
  leverageInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 4,
  },
  marginVisualization: {
    marginTop: 16,
  },
  visualizationLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  marginLevels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  marginLevel: {
    fontSize: 12,
  },
});