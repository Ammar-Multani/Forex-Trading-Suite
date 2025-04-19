import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, SegmentedButtons } from 'react-native-paper';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculatePipDifference, getCurrencySymbol, calculatePipValue } from '../../utils/calculators';
import { theme } from '../../utils/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import { lotSizes } from '../../utils/calculators';

export default function ProfitLossCalculator() {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [exitPrice, setExitPrice] = useState('1.1050');
  const [lotSizeOpen, setLotSizeOpen] = useState(false);
  const [lotSize, setLotSize] = useState(0.1);
  const [lotSizeItems, setLotSizeItems] = useState(lotSizes);
  const [positionType, setPositionType] = useState('long');
  
  const [pipDifference, setPipDifference] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [returnPercentage, setReturnPercentage] = useState(0);

  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, entryPrice, exitPrice, lotSize, positionType]);

  const calculateResults = () => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    
    if (entry <= 0 || exit <= 0) return;
    
    // Calculate pip difference
    const pips = calculatePipDifference(entry, exit, currencyPair);
    setPipDifference(pips);
    
    // For simplicity, we're using an exchange rate of 1
    // In a real app, you would fetch the current exchange rate
    const exchangeRate = 1;
    
    // Calculate pip value
    const pipValue = calculatePipValue(
      accountCurrency,
      currencyPair,
      lotSize,
      exchangeRate
    );
    
    // Calculate profit/loss
    const isLong = positionType === 'long';
    const direction = isLong ? 1 : -1;
    const priceDirection = exit > entry ? 1 : -1;
    
    const pl = pipValue * pips * direction * priceDirection;
    setProfitLoss(pl);
    
    // Calculate return percentage (simplified)
    const investment = lotSize * 100000 * entry / 100; // Assuming 1:100 leverage
    const returnPct = (pl / investment) * 100;
    setReturnPercentage(returnPct);
  };

  const currencySymbol = getCurrencySymbol(accountCurrency);

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Profit/Loss Calculator" 
        gradientColors={['#FA8BFF', '#2BD2FF']}
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
          label="Exit Price"
          value={exitPrice}
          onChangeText={setExitPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
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
          title="Profit/Loss Results"
          results={[
            {
              label: 'Pip Difference',
              value: `${pipDifference.toFixed(1)} pips`,
            },
            {
              label: 'Profit/Loss',
              value: `${currencySymbol}${Math.abs(profitLoss).toFixed(2)}`,
              isHighlighted: true,
              color: profitLoss >= 0 ? theme.colors.success : theme.colors.error,
            },
            {
              label: 'Result',
              value: profitLoss >= 0 ? 'Profit' : 'Loss',
              color: profitLoss >= 0 ? theme.colors.success : theme.colors.error,
            },
            {
              label: 'Return on Investment',
              value: `${returnPercentage.toFixed(2)}%`,
              color: returnPercentage >= 0 ? theme.colors.success : theme.colors.error,
            },
          ]}
          style={{ marginTop: theme.spacing.md }}
        />
        
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Understanding P/L Calculation</Text>
          <Text style={styles.explanationText}>
            For a long position (buy):
            {'\n'}- Profit when exit price > entry price
            {'\n'}- Loss when exit price < entry price
          </Text>
          <Text style={styles.explanationText}>
            For a short position (sell):
            {'\n'}- Profit when exit price < entry price
            {'\n'}- Loss when exit price > entry price
          </Text>
          <Text style={styles.explanationText}>
            The profit or loss is calculated by multiplying the pip difference by the pip value and the position size.
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