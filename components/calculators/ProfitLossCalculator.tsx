import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider, RadioButton, Text } from 'react-native-paper';
import { calculateProfitLoss, formatCurrency } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';

export default function ProfitLossCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.2000');
  const [exitPrice, setExitPrice] = useState('1.2050');
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
    
    if (entry > 0 && exit > 0 && size > 0) {
      const result = calculateProfitLoss(
        entry,
        exit,
        size,
        currencyPair,
        accountCurrency,
        isLong
      );
      
      setPips(result.pips);
      setProfitLoss(result.profitLoss);
      setRoi(result.roi);
    }
  };
  
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
          <RadioButton.Group onValueChange={value => setPositionType(value)} value={positionType}>
            <View style={styles.radioContainer}>
              <View style={styles.radioButton}>
                <RadioButton value="long" color="#6200ee" />
                <Text style={styles.radioText}>Long</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton value="short" color="#6200ee" />
                <Text style={styles.radioText}>Short</Text>
              </View>
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
            color={profitLoss >= 0 ? '#4CAF50' : '#FF5252'}
            isLarge
          />
          
          <ResultDisplay
            label="Pips"
            value={`${pips.toFixed(1)} pips`}
            color={pips >= 0 ? '#4CAF50' : '#FF5252'}
          />
          
          <ResultDisplay
            label="Return on Investment"
            value={`${roi.toFixed(2)}%`}
            color={roi >= 0 ? '#4CAF50' : '#FF5252'}
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
  radioLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioText: {
    color: '#fff',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
});