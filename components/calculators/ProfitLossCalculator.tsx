import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider, RadioButton } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculateProfitLoss, formatNumber, formatCurrency } from '../../utils/calculators';

export default function ProfitLossCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [exitPrice, setExitPrice] = useState('1.1050');
  const [positionSize, setPositionSize] = useState('1');
  const [positionType, setPositionType] = useState('long');
  
  // State for results
  const [pips, setPips] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [roi, setRoi] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, entryPrice, exitPrice, positionSize, positionType]);
  
  const calculateResults = () => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const size = parseFloat(positionSize) || 0;
    const isLong = positionType === 'long';
    
    if (entry <= 0 || exit <= 0 || size <= 0) return;
    
    const { pips: pipsDiff, profitLoss: pl, roi: returnOnInvestment } = calculateProfitLoss(
      entry,
      exit,
      size,
      currencyPair,
      accountCurrency,
      isLong
    );
    
    setPips(pipsDiff);
    setProfitLoss(pl);
    setRoi(returnOnInvestment);
  };
  
  const isProfit = profitLoss > 0;
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Profit/Loss Calculator">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={setAccountCurrency}
          />
          
          <CurrencyPairSelector
            value={currencyPair}
            onChange={setCurrencyPair}
          />
          
          <Text style={styles.radioLabel}>Position Type</Text>
          <RadioButton.Group
            onValueChange={value => setPositionType(value)}
            value={positionType}
          >
            <View style={styles.radioContainer}>
              <RadioButton.Item
                label="Long (Buy)"
                value="long"
                color="#6200ee"
                labelStyle={styles.radioLabel}
                style={styles.radioButton}
              />
              <RadioButton.Item
                label="Short (Sell)"
                value="short"
                color="#6200ee"
                labelStyle={styles.radioLabel}
                style={styles.radioButton}
              />
            </View>
          </RadioButton.Group>
          
          <TextInput
            label="Entry Price"
            value={entryPrice}
            onChangeText={setEntryPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Exit Price"
            value={exitPrice}
            onChangeText={setExitPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
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
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <ResultDisplay
            label="Profit/Loss"
            value={formatCurrency(profitLoss, accountCurrency)}
            color={isProfit ? '#4CAF50' : '#F44336'}
            isLarge
          />
          
          <ResultDisplay
            label="Pips"
            value={formatNumber(pips, 1)}
            color={isProfit ? '#4CAF50' : '#F44336'}
          />
          
          <ResultDisplay
            label="Return on Investment"
            value={`${formatNumber(roi, 2)}%`}
            color={isProfit ? '#4CAF50' : '#F44336'}
          />
          
          <View style={[
            styles.resultIndicator,
            { backgroundColor: isProfit ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }
          ]}>
            <Text style={[
              styles.indicatorText,
              { color: isProfit ? '#4CAF50' : '#F44336' }
            ]}>
              {isProfit ? 'PROFIT' : 'LOSS'}
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
  radioLabel: {
    fontSize: 14,
    color: '#fff',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  radioButton: {
    flex: 1,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultIndicator: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});