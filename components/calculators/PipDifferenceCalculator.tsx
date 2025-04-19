import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import CurrencyPairSelector from '../ui/CurrencyPairSelector';
import { calculatePipDifference, getPipValue } from '../../utils/calculators';
import { theme } from '../../utils/theme';

export default function PipDifferenceCalculator() {
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [priceA, setPriceA] = useState('1.1000');
  const [priceB, setPriceB] = useState('1.1050');
  const [pipDifference, setPipDifference] = useState(0);
  const [pipValue, setPipValue] = useState(0);

  useEffect(() => {
    calculateResults();
  }, [currencyPair, priceA, priceB]);

  const calculateResults = () => {
    const price1 = parseFloat(priceA) || 0;
    const price2 = parseFloat(priceB) || 0;
    
    if (price1 <= 0 || price2 <= 0) return;
    
    const pips = calculatePipDifference(price1, price2, currencyPair);
    setPipDifference(pips);
    setPipValue(getPipValue(currencyPair));
  };

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Pip Difference Calculator" 
        gradientColors={['#8EC5FC', '#E0C3FC']}
      >
        <CurrencyPairSelector
          value={currencyPair}
          onValueChange={setCurrencyPair}
        />
        
        <TextInput
          label="Price A"
          value={priceA}
          onChangeText={setPriceA}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Price B"
          value={priceB}
          onChangeText={setPriceB}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <ResultDisplay
          title="Pip Difference Results"
          results={[
            {
              label: 'Currency Pair',
              value: currencyPair,
            },
            {
              label: 'Price A',
              value: priceA,
            },
            {
              label: 'Price B',
              value: priceB,
            },
            {
              label: 'Pip Value',
              value: pipValue.toFixed(5),
            },
            {
              label: 'Pip Difference',
              value: pipDifference.toFixed(1),
              isHighlighted: true,
              color: theme.colors.primary,
            },
          ]}
        />
        
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>How It Works</Text>
          <Text style={styles.explanationText}>
            The pip difference calculator measures the number of pips between two price points for a given currency pair.
          </Text>
          <Text style={styles.explanationText}>
            For most currency pairs, a pip is the fourth decimal place (0.0001). For pairs involving JPY, a pip is the second decimal place (0.01).
          </Text>
          <Text style={styles.explanationText}>
            The formula used is: |Price A - Price B| ÷ Pip Value
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