import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculateMargin, getCurrencySymbol, leverageOptions } from '../../utils/calculators';
import { theme } from '../../utils/theme';
import DropDownPicker from 'react-native-dropdown-picker';
import { lotSizes } from '../../utils/calculators';

export default function MarginCalculator() {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [lotSizeOpen, setLotSizeOpen] = useState(false);
  const [lotSize, setLotSize] = useState(0.1);
  const [lotSizeItems, setLotSizeItems] = useState(lotSizes);
  const [leverageOpen, setLeverageOpen] = useState(false);
  const [leverage, setLeverage] = useState(100);
  const [leverageItems, setLeverageItems] = useState(leverageOptions);
  
  const [requiredMargin, setRequiredMargin] = useState(0);
  const [marginLevel, setMarginLevel] = useState(0);

  useEffect(() => {
    calculateResults();
  }, [accountCurrency, currencyPair, lotSize, leverage]);

  const calculateResults = () => {
    // For simplicity, we're using a price of 1
    // In a real app, you would fetch the current price
    const price = 1;
    
    const margin = calculateMargin(
      currencyPair,
      lotSize,
      leverage,
      price
    );
    
    setRequiredMargin(margin);
    
    // Assuming account balance is 10000 for margin level calculation
    const accountBalance = 10000;
    const marginLevel = (accountBalance / margin) * 100;
    setMarginLevel(marginLevel);
  };

  const currencySymbol = getCurrencySymbol(accountCurrency);

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Margin Calculator" 
        gradientColors={['#08AEEA', '#2AF598']}
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
          zIndex={2000}
        />
        
        <Text style={[styles.label, { marginTop: theme.spacing.md }]}>Leverage</Text>
        <DropDownPicker
          open={leverageOpen}
          value={leverage}
          items={leverageItems}
          setOpen={setLeverageOpen}
          setValue={(callback) => {
            const newValue = callback(leverage);
            if (typeof newValue === 'number') {
              setLeverage(newValue);
            }
          }}
          setItems={setLeverageItems}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={1000}
        />
        
        <ResultDisplay
          title="Margin Results"
          results={[
            {
              label: 'Required Margin',
              value: `${currencySymbol}${requiredMargin.toFixed(2)}`,
              isHighlighted: true,
              color: theme.colors.primary,
            },
            {
              label: 'Leverage',
              value: `1:${leverage}`,
            },
            {
              label: 'Position Size',
              value: `${lotSize} lots (${lotSize * 100000} units)`,
            },
            {
              label: 'Margin Level',
              value: `${marginLevel.toFixed(2)}%`,
              color: marginLevel > 200 ? theme.colors.success :
                     marginLevel > 100 ? theme.colors.warning :
                     theme.colors.error,
            },
          ]}
          style={{ marginTop: theme.spacing.md }}
        />
        
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Understanding Margin</Text>
          <Text style={styles.explanationText}>
            Margin is the amount of money required to open a position in the forex market.
          </Text>
          <Text style={styles.explanationText}>
            Formula: Required Margin = (Position Size × Contract Size) ÷ Leverage
          </Text>
          <Text style={styles.explanationText}>
            Margin Level = (Account Equity ÷ Used Margin) × 100%
          </Text>
          <Text style={styles.explanationText}>
            Margin levels:
            {'\n'}- Above 200%: Safe zone
            {'\n'}- 100-200%: Caution zone
            {'\n'}- Below 100%: Danger zone (may trigger margin call)
            {'\n'}- Below 50%: Stop out level (positions may be automatically closed)
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