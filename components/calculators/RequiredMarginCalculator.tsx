import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider } from 'react-native-paper';
import { calculateMargin, formatCurrency } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../ui/PageHeader';

export default function MarginCalculator() {
  // State for inputs
  const { isDark } = useTheme();
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
    const lev = parseFloat(leverage) || 1;
    
    if (size > 0 && lev > 0) {
      const result = calculateMargin(
        currencyPair,
        accountCurrency,
        size,
        lev
      );
      
      setRequiredMargin(result.requiredMargin);
      setMarginLevel(result.marginLevel);
    }
  };
  
  return (
    <View style={styles.container}>
            <PageHeader
        title="Required Margin Calculator"
        subtitle="Calculate the margin required for a position"
      />
      <CalculatorCard title="Required Margin Calculator">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={setAccountCurrency}
          />
          
          <CurrencyPairSelector
            label="Currency Pair"
            selectedPair={currencyPair}
            onSelect={(pair) => setCurrencyPair(pair)}
          />
          
          <TextInput
            label="Position Size (Lots)"
            value={positionSize}
            onChangeText={setPositionSize}
            keyboardType="numeric"
            style={styles.input}
                mode="outlined"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: isDark ? "#2A2A2A" : "#f5f5f5",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
              />
          
          <TextInput
            label="Leverage"
            value={leverage}
            onChangeText={setLeverage}
            keyboardType="numeric"
            right={<TextInput.Affix text=":1" />}
            style={styles.input}
                mode="outlined"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{
                  colors: {
                    background: isDark ? "#2A2A2A" : "#f5f5f5",
                    onSurfaceVariant: isDark ? "#aaa" : "#666",
                  },
                }}
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
            value={`${marginLevel.toFixed(2)}%`}
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
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
});