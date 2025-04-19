import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider, ProgressBar } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculatePositionSize, formatNumber, formatCurrency } from '../../utils/calculators';

export default function PositionSizeCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState('2');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [stopLossPips, setStopLossPips] = useState('50');
  
  // State for results
  const [positionSize, setPositionSize] = useState(0);
  const [riskAmount, setRiskAmount] = useState(0);
  const [pipValue, setPipValue] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, accountBalance, riskPercentage, entryPrice, stopLossPips]);
  
  const calculateResults = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercentage) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const stopLoss = parseFloat(stopLossPips) || 0;
    
    if (balance <= 0 || risk <= 0 || entry <= 0 || stopLoss <= 0) return;
    
    const { positionSize: size, riskAmount: amount, pipValue: value } = calculatePositionSize(
      balance,
      risk,
      entry,
      stopLoss,
      currencyPair,
      accountCurrency
    );
    
    setPositionSize(size);
    setRiskAmount(amount);
    setPipValue(value);
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Position Size Calculator">
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
            label="Account Balance"
            value={accountBalance}
            onChangeText={setAccountBalance}
            keyboardType="numeric"
            left={<TextInput.Affix text={accountCurrency === 'USD' ? '$' : ''} />}
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Risk Percentage"
            value={riskPercentage}
            onChangeText={setRiskPercentage}
            keyboardType="numeric"
            right={<TextInput.Affix text="%" />}
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
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
            label="Stop Loss (in pips)"
            value={stopLossPips}
            onChangeText={setStopLossPips}
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
            label="Recommended Position Size"
            value={`${formatNumber(positionSize, 2)} lots`}
            color="#4CAF50"
            isLarge
          />
          
          <ResultDisplay
            label="Risk Amount"
            value={formatCurrency(riskAmount, accountCurrency)}
            color="#F44336"
          />
          
          <ResultDisplay
            label="Pip Value"
            value={formatCurrency(pipValue, accountCurrency)}
            color="#2196F3"
          />
          
          <View style={styles.riskVisualization}>
            <Text style={styles.visualizationLabel}>
              Risk: {formatNumber(parseFloat(riskPercentage) || 0, 1)}% of account
            </Text>
            <ProgressBar
              progress={parseFloat(riskPercentage) / 100 || 0}
              color={parseFloat(riskPercentage) > 3 ? '#F44336' : '#4CAF50'}
              style={styles.progressBar}
            />
            <View style={styles.riskLevels}>
              <Text style={[styles.riskLevel, { color: '#4CAF50' }]}>Low</Text>
              <Text style={[styles.riskLevel, { color: '#FFC107' }]}>Medium</Text>
              <Text style={[styles.riskLevel, { color: '#F44336' }]}>High</Text>
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
  riskVisualization: {
    marginTop: 24,
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
  riskLevels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  riskLevel: {
    fontSize: 12,
  },
});