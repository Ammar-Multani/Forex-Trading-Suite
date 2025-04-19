import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, SegmentedButtons } from 'react-native-paper';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculatePipValue, getCurrencySymbol, lotSizes } from '../../utils/calculators';
import { theme } from '../../utils/theme';
import DropDownPicker from 'react-native-dropdown-picker';

export default function PipCalculator() {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [lotSizeOpen, setLotSizeOpen] = useState(false);
  const [lotSize, setLotSize] = useState(0.1);
  const [lotSizeItems, setLotSizeItems] = useState(lotSizes);
  const [pips, setPips] = useState('10');
  const [pipValue, setPipValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, lotSize, pips]);

  const calculateResults = () => {
    const numPips = parseFloat(pips) || 0;
    
    // For simplicity, we're using an exchange rate of 1
    // In a real app, you would fetch the current exchange rate
    const exchangeRate = 1;
    
    const singlePipValue = calculatePipValue(
      accountCurrency,
      currencyPair,
      lotSize,
      exchangeRate
    );
    
    setPipValue(singlePipValue);
    setTotalValue(singlePipValue * numPips);
  };

  const currencySymbol = getCurrencySymbol(accountCurrency);

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Pip Calculator" 
        gradientColors={['#FF9A8B', '#FF6A88']}
      >
        <AccountCurrencySelector
          value={accountCurrency}
          onValueChange={setAccountCurrency}
        />
        
        <CurrencyPairSelector
          value={currencyPair}
          onValueChange={setCurrencyPair}
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
        
        <TextInput
          label="Number of Pips"
          value={pips}
          onChangeText={setPips}
          keyboardType="numeric"
          mode="outlined"
          style={[styles.input, { marginTop: theme.spacing.md }]}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <ResultDisplay
          title="Pip Value Results"
          results={[
            {
              label: 'Currency Pair',
              value: currencyPair,
            },
            {
              label: 'Position Size',
              value: `${lotSize} lots`,
            },
            {
              label: 'Value per Pip',
              value: `${currencySymbol}${pipValue.toFixed(2)}`,
              isHighlighted: true,
            },
            {
              label: `Total Value (${pips} pips)`,
              value: `${currencySymbol}${totalValue.toFixed(2)}`,
              color: totalValue >= 0 ? theme.colors.success : theme.colors.error,
            },
          ]}
        />
        
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Understanding Pip Value</Text>
          <Text style={styles.explanationText}>
            A pip (percentage in point) is the smallest price movement in a trading pair.
          </Text>
          <Text style={styles.explanationText}>
            For most currency pairs, a pip is 0.0001 of the quoted price. For pairs involving JPY, a pip is 0.01.
          </Text>
          <Text style={styles.explanationText}>
            The pip value depends on:
            {'\n'}- Your position size (lot size)
            {'\n'}- The currency pair you're trading
            {'\n'}- Your account's base currency
          </Text>
          <Text style={styles.explanationText}>
            Standard lot = 100,000 units
            {'\n'}Mini lot = 10,000 units
            {'\n'}Micro lot = 1,000 units
            {'\n'}Nano lot = 100 units
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
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
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