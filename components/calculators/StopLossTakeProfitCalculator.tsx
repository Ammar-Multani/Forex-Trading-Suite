import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider, RadioButton } from 'react-native-paper';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculateStopLossTakeProfit, formatNumber, formatCurrency } from '../../utils/calculators';

export default function StopLossTakeProfitCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [stopLossPrice, setStopLossPrice] = useState('1.0950');
  const [takeProfitPrice, setTakeProfitPrice] = useState('1.1100');
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
    
    if (entry <= 0 || stopLoss <= 0 || takeProfit <= 0 || size <= 0) return;
    
    const {
      riskRewardRatio: ratio,
      stopLossPips: slPips,
      takeProfitPips: tpPips,
      stopLossAmount: slAmount,
      takeProfitAmount: tpAmount,
      pipValue: pValue
    } = calculateStopLossTakeProfit(
      entry,
      stopLoss,
      takeProfit,
      size,
      currencyPair,
      accountCurrency,
      isLong
    );
    
    setRiskRewardRatio(ratio);
    setStopLossPips(slPips);
    setTakeProfitPips(tpPips);
    setStopLossAmount(slAmount);
    setTakeProfitAmount(tpAmount);
    setPipValue(pValue);
  };
  
  const isGoodRiskReward = riskRewardRatio >= 2;
  
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
            value={`1:${formatNumber(riskRewardRatio, 2)}`}
            color={isGoodRiskReward ? '#4CAF50' : '#F44336'}
            isLarge
          />
          
          <View style={styles.resultsRow}>
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Stop Loss (Pips)"
                value={formatNumber(stopLossPips, 1)}
                color="#F44336"
              />
              
              <ResultDisplay
                label="Stop Loss Amount"
                value={formatCurrency(stopLossAmount, accountCurrency)}
                color="#F44336"
              />
            </View>
            
            <View style={styles.resultColumn}>
              <ResultDisplay
                label="Take Profit (Pips)"
                value={formatNumber(takeProfitPips, 1)}
                color="#4CAF50"
              />
              
              <ResultDisplay
                label="Take Profit Amount"
                value={formatCurrency(takeProfitAmount, accountCurrency)}
                color="#4CAF50"
              />
            </View>
          </View>
          
          <ResultDisplay
            label="Per Pip Value"
            value={formatCurrency(pipValue, accountCurrency)}
            color="#2196F3"
          />
          
          <View style={[
            styles.riskRewardIndicator,
            { backgroundColor: isGoodRiskReward ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }
          ]}>
            <Text style={[
              styles.indicatorText,
              { color: isGoodRiskReward ? '#4CAF50' : '#F44336' }
            ]}>
              {isGoodRiskReward 
                ? 'GOOD RISK/REWARD RATIO' 
                : 'POOR RISK/REWARD RATIO'}
            </Text>
            <Text style={styles.indicatorSubtext}>
              {isGoodRiskReward
                ? 'Your potential reward is at least twice your risk.'
                : 'Consider adjusting your take profit or stop loss for a better ratio (2:1 or higher).'}
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
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resultColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  riskRewardIndicator: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  indicatorSubtext: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
});