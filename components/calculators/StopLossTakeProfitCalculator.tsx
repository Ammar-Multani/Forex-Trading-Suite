import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider, RadioButton, Text } from 'react-native-paper';
import { calculateStopLossTakeProfit, formatCurrency } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';

export default function StopLossTakeProfitCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.2000');
  const [stopLossPrice, setStopLossPrice] = useState('1.1950');
  const [takeProfitPrice, setTakeProfitPrice] = useState('1.2100');
  const [positionSize, setPositionSize] = useState('1');
  const [positionType, setPositionType] = useState('long');
  
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
  }, [accountCurrency, currencyPair, entryPrice, stopLossPrice, takeProfitPrice, positionSize, positionType]);
  
  const calculateResults = () => {
    const entry = parseFloat(entryPrice) || 0;
    const stopLoss = parseFloat(stopLossPrice) || 0;
    const takeProfit = parseFloat(takeProfitPrice) || 0;
    const size = parseFloat(positionSize) || 0;
    const isLong = positionType === 'long';
    
    if (entry > 0 && stopLoss > 0 && takeProfit > 0 && size > 0) {
      const result = calculateStopLossTakeProfit(
        entry,
        stopLoss,
        takeProfit,
        size,
        currencyPair,
        accountCurrency,
        isLong
      );
      
      setRiskRewardRatio(result.riskRewardRatio);
      setStopLossPips(result.stopLossPips);
      setTakeProfitPips(result.takeProfitPips);
      setStopLossAmount(result.stopLossAmount);
      setTakeProfitAmount(result.takeProfitAmount);
      setPipValue(result.pipValue);
    }
  };
  
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
            label="Stop Loss Price"
            value={stopLossPrice}
            onChangeText={setStopLossPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
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
            label="Risk/Reward Ratio"
            value={`1:${riskRewardRatio.toFixed(2)}`}
            color="#FFC107"
            isLarge
          />
          
          <View style={styles.resultsRow}>
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Stop Loss"
                value={formatCurrency(stopLossAmount, accountCurrency)}
                color="#FF5252"
              />
              <ResultDisplay
                label="Stop Loss Pips"
                value={`${stopLossPips.toFixed(1)} pips`}
                color="#FF5252"
              />
            </View>
            
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Take Profit"
                value={formatCurrency(takeProfitAmount, accountCurrency)}
                color="#4CAF50"
              />
              <ResultDisplay
                label="Take Profit Pips"
                value={`${takeProfitPips.toFixed(1)} pips`}
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
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resultColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
});