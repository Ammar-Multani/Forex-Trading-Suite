import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, SegmentedButtons } from 'react-native-paper';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculatePipDifference, calculatePipValue, getCurrencySymbol } from '../../utils/calculators';
import { theme } from '../../utils/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import { lotSizes } from '../../utils/calculators';

export default function StopLossTakeProfitCalculator() {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [stopLossPrice, setStopLossPrice] = useState('1.0950');
  const [takeProfitPrice, setTakeProfitPrice] = useState('1.1100');
  const [lotSizeOpen, setLotSizeOpen] = useState(false);
  const [lotSize, setLotSize] = useState(0.1);
  const [lotSizeItems, setLotSizeItems] = useState(lotSizes);
  const [positionType, setPositionType] = useState('long');
  
  const [stopLossPips, setStopLossPips] = useState(0);
  const [takeProfitPips, setTakeProfitPips] = useState(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [pipValue, setPipValue] = useState(0);

  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, entryPrice, stopLossPrice, takeProfitPrice, lotSize, positionType]);

  const calculateResults = () => {
    const entry = parseFloat(entryPrice) || 0;
    const stopLoss = parseFloat(stopLossPrice) || 0;
    const takeProfit = parseFloat(takeProfitPrice) || 0;
    
    if (entry <= 0 || stopLoss <= 0 || takeProfit <= 0) return;
    
    // Calculate pip differences
    const slPips = calculatePipDifference(entry, stopLoss, currencyPair);
    const tpPips = calculatePipDifference(entry, takeProfit, currencyPair);
    
    setStopLossPips(slPips);
    setTakeProfitPips(tpPips);
    
    // Calculate risk/reward ratio
    const ratio = tpPips / slPips;
    setRiskRewardRatio(ratio);
    
    // For simplicity, we're using an exchange rate of 1
    // In a real app, you would fetch the current exchange rate
    const exchangeRate = 1;
    
    // Calculate pip value
    const pipVal = calculatePipValue(
      accountCurrency,
      currencyPair,
      lotSize,
      exchangeRate
    );
    
    setPipValue(pipVal);
    
    // Calculate potential profit/loss
    const isLong = positionType === 'long';
    const isStopLossBelow = stopLoss < entry;
    
    // For long positions, stop loss should be below entry and take profit above
    // For short positions, stop loss should be above entry and take profit below
    const isValidStopLoss = (isLong && isStopLossBelow) || (!isLong && !isStopLossBelow);
    const isValidTakeProfit = (isLong && takeProfit > entry) || (!isLong && takeProfit < entry);
    
    if (isValidStopLoss && isValidTakeProfit) {
      setPotentialLoss(pipVal * slPips);
      setPotentialProfit(pipVal * tpPips);
    } else {
      // Handle invalid configuration
      setPotentialLoss(0);
      setPotentialProfit(0);
    }
  };

  const currencySymbol = getCurrencySymbol(accountCurrency);

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Stop Loss/Take Profit Calculator" 
        gradientColors={['#FEE140', '#FA709A']}
      >
        <AccountCurrencySelector
          value={accountCurrency}
          onValueChange={setAccountCurrency}
        />
        
        <CurrencyPairSelector
          value={currencyPair}
          onValueChange={setCurrencyPair}
        />
        
        <Text style={styles.label}>Position Type</Text>
        <SegmentedButtons
          value={positionType}
          onValueChange={setPositionType}
          buttons={[
            { value: 'long', label: 'Long (Buy)' },
            { value: 'short', label: 'Short (Sell)' },
          ]}
          style={styles.segmentedButtons}
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
          label="Stop Loss Price"
          value={stopLossPrice}
          onChangeText={setStopLossPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.error}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Take Profit Price"
          value={takeProfitPrice}
          onChangeText={setTakeProfitPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.success}
          textColor={theme.colors.text}
        />
        
        <Text style={styles.label}>Position Size</Text>
        <DropDownPicker
          open={lotSizeOpen}
          value={lotSize}
          items={lotSizeItems}
          setOpen={setLotSizeOpen}
          setValue={(callback) => {
            const newValue = callback(lotSize);
            if (typeof newValue === 'number') {
              setLotSize(newValue);
            }
          }}
          setItems={setLotSizeItems}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={1000}
        />
        
        <ResultDisplay
          title="Stop Loss/Take Profit Results"
          results={[
            {
              label: 'Risk/Reward Ratio',
              value: `1:${riskRewardRatio.toFixed(2)}`,
              isHighlighted: true,
              color: riskRewardRatio >= 2 ? theme.colors.success :
                     riskRewardRatio >= 1 ? theme.colors.warning :
                     theme.colors.error,
            },
            {
              label: 'Stop Loss Distance',
              value: `${stopLossPips.toFixed(1)} pips`,
              color: theme.colors.error,
            },
            {
              label: 'Take Profit Distance',
              value: `${takeProfitPips.toFixed(1)} pips`,
              color: theme.colors.success,
            },
            {
              label: 'Potential Loss',
              value: `${currencySymbol}${potentialLoss.toFixed(2)}`,
              color: theme.colors.error,
            },
            {
              label: 'Potential Profit',
              value: `${currencySymbol}${potentialProfit.toFixed(2)}`,
              color: theme.colors.success,
            },
            {
              label: 'Pip Value',
              value: `${currencySymbol}${pipValue.toFixed(2)} per pip`,
            },
          ]}
          style={{ marginTop: theme.spacing.md }}
        />
        
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Risk/Reward Guidelines</Text>
          <Text style={styles.explanationText}>
            A good risk/reward ratio is typically 1:2 or higher, meaning your potential profit is at least twice your potential loss.
          </Text>
          <Text style={styles.explanationText}>
            For long positions:
            {'\n'}- Stop Loss should be below entry price
            {'\n'}- Take Profit should be above entry price
          </Text>
          <Text style={styles.explanationText}>
            For short positions:
            {'\n'}- Stop Loss should be above entry price
            {'\n'}- Take Profit should be below entry price
          </Text>
          <Text style={styles.explanationText}>
            Formula: Risk/Reward Ratio = Take Profit Pips ÷ Stop Loss Pips
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
  label: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  segmentedButtons: {
    marginBottom: theme.spacing.md,
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  dropdownText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
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