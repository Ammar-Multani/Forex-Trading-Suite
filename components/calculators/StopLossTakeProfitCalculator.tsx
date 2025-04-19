import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { TextInput, Divider, Text } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import { calculateStopLossTakeProfit, formatCurrency, formatNumber } from '../../utils/calculators';

export default function StopLossTakeProfitCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [stopLossPrice, setStopLossPrice] = useState('1.0950');
  const [takeProfitPrice, setTakeProfitPrice] = useState('1.1100');
  const [positionSize, setPositionSize] = useState('1');
  const [isLong, setIsLong] = useState(true);
  
  // State for results
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);
  const [stopLossPips, setStopLossPips] = useState(0);
  const [takeProfitPips, setTakeProfitPips] = useState(0);
  const [stopLossAmount, setStopLossAmount] = useState(0);
  const [takeProfitAmount, setTakeProfitAmount] = useState(0);
  const [pipValue, setPipValue] = useState(0);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, entryPrice, stopLossPrice, takeProfitPrice, positionSize, isLong]);
  
  const calculateResults = () => {
    const entryPriceNum = parseFloat(entryPrice) || 0;
    const stopLossPriceNum = parseFloat(stopLossPrice) || 0;
    const takeProfitPriceNum = parseFloat(takeProfitPrice) || 0;
    const positionSizeNum = parseFloat(positionSize) || 0;
    
    const { 
      riskRewardRatio: calculatedRatio,
      stopLossPips: calculatedSLPips,
      takeProfitPips: calculatedTPPips,
      stopLossAmount: calculatedSLAmount,
      takeProfitAmount: calculatedTPAmount,
      pipValue: calculatedPipValue
    } = calculateStopLossTakeProfit(
      entryPriceNum,
      stopLossPriceNum,
      takeProfitPriceNum,
      positionSizeNum,
      currencyPair,
      accountCurrency,
      isLong
    );
    
    setRiskRewardRatio(calculatedRatio);
    setStopLossPips(calculatedSLPips);
    setTakeProfitPips(calculatedTPPips);
    setStopLossAmount(calculatedSLAmount);
    setTakeProfitAmount(calculatedTPAmount);
    setPipValue(calculatedPipValue);
  };
  
  const togglePosition = () => setIsLong(!isLong);
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Stop Loss/Take Profit Calculator">
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
            label="Stop Loss Price"
            value={stopLossPrice}
            onChangeText={setStopLossPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#F44336"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Take Profit Price"
            value={takeProfitPrice}
            onChangeText={setTakeProfitPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#4CAF50"
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
            label="Risk/Reward Ratio"
            value={`1:${formatNumber(riskRewardRatio, 2)}`}
            color={riskRewardRatio >= 1 ? '#4CAF50' : '#F44336'}
            isLarge
          />
          
          <View style={styles.resultsRow}>
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Stop Loss (Pips)"
                value={formatNumber(stopLossPips, 1)}
                color="#F44336"
              />
            </View>
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Take Profit (Pips)"
                value={formatNumber(takeProfitPips, 1)}
                color="#4CAF50"
              />
            </View>
          </View>
          
          <View style={styles.resultsRow}>
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Stop Loss Amount"
                value={formatCurrency(stopLossAmount, accountCurrency)}
                color="#F44336"
              />
            </View>
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Take Profit Amount"
                value={formatCurrency(takeProfitAmount, accountCurrency)}
                color="#4CAF50"
              />
            </View>
          </View>
          
          <ResultDisplay
            label="Pip Value"
            value={formatCurrency(pipValue, accountCurrency)}
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
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultColumn: {
    width: '48%',
  },
});