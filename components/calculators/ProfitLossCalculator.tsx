import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { TextInput, Divider, Text } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import { calculateProfitLoss, formatCurrency, formatNumber } from '../../utils/calculators';

export default function ProfitLossCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [exitPrice, setExitPrice] = useState('1.1050');
  const [positionSize, setPositionSize] = useState('1');
  const [isLong, setIsLong] = useState(true);
  
  // State for results
  const [pips, setPips] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [roi, setRoi] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, entryPrice, exitPrice, positionSize, isLong]);
  
  const calculateResults = () => {
    const entryPriceNum = parseFloat(entryPrice) || 0;
    const exitPriceNum = parseFloat(exitPrice) || 0;
    const positionSizeNum = parseFloat(positionSize) || 0;
    
    const { pips: calculatedPips, profitLoss: calculatedPL, roi: calculatedRoi } = calculateProfitLoss(
      entryPriceNum,
      exitPriceNum,
      positionSizeNum,
      currencyPair,
      accountCurrency,
      isLong
    );
    
    setPips(calculatedPips);
    setProfitLoss(calculatedPL);
    setRoi(calculatedRoi);
  };
  
  const togglePosition = () => setIsLong(!isLong);
  
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
          
          <View style={styles.positionTypeContainer}>
            <Text style={styles.positionTypeLabel}>Position Type</Text>
            <View style={styles.switchContainer}>
              <Text style={[styles.positionTypeText, !isLong && styles.activePositionType]}>Short</Text>
              <Switch
                value={isLong}
                onValueChange={togglePosition}
                trackColor={{ false: '#767577', true: '#6200ee' }}
                thumbColor="#f4f3f4"
              />
              <Text style={[styles.positionTypeText, isLong && styles.activePositionType]}>Long</Text>
            </View>
          </View>
          
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
            color={profitLoss >= 0 ? '#4CAF50' : '#F44336'}
            isLarge
          />
          
          <ResultDisplay
            label="Pips"
            value={formatNumber(pips, 1)}
            color={pips >= 0 ? '#4CAF50' : '#F44336'}
          />
          
          <ResultDisplay
            label="Return on Investment"
            value={`${formatNumber(roi, 2)}%`}
            color={roi >= 0 ? '#4CAF50' : '#F44336'}
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
  positionTypeContainer: {
    marginBottom: 16,
  },
  positionTypeLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionTypeText: {
    marginHorizontal: 8,
    color: '#aaa',
  },
  activePositionType: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
});