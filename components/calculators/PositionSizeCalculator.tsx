import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, ProgressBar } from 'react-native-paper';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculatePositionSize, calculatePipValue, getCurrencySymbol } from '../../utils/calculators';
import { theme } from '../../utils/theme';

export default function PositionSizeCalculator() {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState('2');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [stopLossPips, setStopLossPips] = useState('50');
  
  const [positionSize, setPositionSize] = useState(0);
  const [riskAmount, setRiskAmount] = useState(0);
  const [pipValue, setPipValue] = useState(0);

  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, accountBalance, riskPercentage, entryPrice, stopLossPips]);

  const calculateResults = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercentage) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const stopLoss = parseFloat(stopLossPips) || 0;
    
    if (balance <= 0 || risk <= 0 || entry <= 0 || stopLoss <= 0) return;
    
    // For simplicity, we're using an exchange rate of 1
    // In a real app, you would fetch the current exchange rate
    const exchangeRate = 1;
    
    // Calculate stop loss price from pips
    const pipValue = calculatePipValue(accountCurrency, currencyPair, 1, exchangeRate);
    setPipValue(pipValue);
    
    // Calculate risk amount
    const riskAmt = balance * (risk / 100);
    setRiskAmount(riskAmt);
    
    // Calculate position size
    const stopLossPrice = entry - (stopLoss * 0.0001); // Assuming 4 decimal places
    const posSize = calculatePositionSize(
      balance,
      risk,
      entry,
      stopLossPrice,
      currencyPair,
      exchangeRate
    );
    
    setPositionSize(posSize);
  };

  const currencySymbol = getCurrencySymbol(accountCurrency);

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Position Size Calculator" 
        gradientColors={['#21D4FD', '#B721FF']}
      >
        <AccountCurrencySelector
          value={accountCurrency}
          onValueChange={setAccountCurrency}
        />
        
        <CurrencyPairSelector
          value={currencyPair}
          onValueChange={setCurrencyPair}
        />
        
        <TextInput
          label="Account Balance"
          value={accountBalance}
          onChangeText={setAccountBalance}
          keyboardType="numeric"
          left={<TextInput.Affix text={currencySymbol} />}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Risk Percentage"
          value={riskPercentage}
          onChangeText={setRiskPercentage}
          keyboardType="numeric"
          right={<TextInput.Affix text="%" />}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Entry Price"
          value={entryPrice}
          onChangeText={setEntryPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Stop Loss (in pips)"
          value={stopLossPips}
          onChangeText={setStopLossPips}
          keyboardType="numeric"
          right={<TextInput.Affix text="pips" />}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <View style={styles.riskVisualization}>
          <Text style={styles.riskLabel}>Risk Visualization</Text>
          <ProgressBar
            progress={parseFloat(riskPercentage) / 100}
            color={
              parseFloat(riskPercentage) <= 1 ? theme.colors.success :
              parseFloat(riskPercentage) <= 2 ? theme.colors.info :
              parseFloat(riskPercentage) <= 5 ? theme.colors.warning :
              theme.colors.error
            }
            style={styles.progressBar}
          />
          <View style={styles.riskLegend}>
            <Text style={styles.riskLegendText}>0%</Text>
            <Text style={[styles.riskLegendText, { color: theme.colors.error }]}>10%</Text>
          </View>
        </View>
        
        <ResultDisplay
          title="Position Size Results"
          results={[
            {
              label: 'Recommended Position Size',
              value: `${positionSize.toFixed(2)} lots`,
              isHighlighted: true,
              color: theme.colors.primary,
            },
            {
              label: 'Risk Amount',
              value: `${currencySymbol}${riskAmount.toFixed(2)}`,
              color: theme.colors.warning,
            },
            {
              label: 'Pip Value',
              value: `${currencySymbol}${pipValue.toFixed(2)} per pip`,
            },
            {
              label: 'Stop Loss Distance',
              value: `${stopLossPips} pips`,
            },
          ]}
        />
        
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Position Sizing Guide</Text>
          <Text style={styles.explanationText}>
            Proper position sizing is crucial for risk management in forex trading.
          </Text>
          <Text style={styles.explanationText}>
            The recommended risk per trade is 1-2% of your account balance.
          </Text>
          <Text style={styles.explanationText}>
            Formula: Position Size = (Account Balance × Risk %) ÷ (Stop Loss in pips × Pip Value)
          </Text>
          <Text style={styles.explanationText}>
            Always adjust your position size based on your risk tolerance and trading strategy.
          </Text>
        </View>
      </CalculatorCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  riskVisualization: {
    marginBottom: theme.spacing.lg,
  },
  riskLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 10,
    borderRadius: theme.borderRadius.sm,
  },
  riskLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  riskLegendText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  explanationContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
  },
  explanationTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  explanationText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
});