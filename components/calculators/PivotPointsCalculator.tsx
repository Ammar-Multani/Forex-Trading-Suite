import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, SegmentedButtons } from 'react-native-paper';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import { calculatePivotPoints } from '../../utils/calculators';
import { theme } from '../../utils/theme';

export default function PivotPointsCalculator() {
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1800');
  const [closePrice, setClosePrice] = useState('1.1900');
  const [method, setMethod] = useState('standard');
  
  const [results, setResults] = useState({
    pivot: 0,
    resistance: [] as number[],
    support: [] as number[],
  });

  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, method]);

  const calculateResults = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;
    
    if (high <= 0 || low <= 0 || close <= 0) return;
    
    const result = calculatePivotPoints(
      high,
      low,
      close,
      method as 'standard' | 'woodie' | 'camarilla' | 'demark'
    );
    
    setResults(result);
  };

  // Format price values
  const formatPrice = (value: number) => {
    return value.toFixed(5);
  };

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Pivot Points Calculator" 
        gradientColors={['#A9C9FF', '#FFBBEC']}
      >
        <TextInput
          label="High Price"
          value={highPrice}
          onChangeText={setHighPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Low Price"
          value={lowPrice}
          onChangeText={setLowPrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Close Price"
          value={closePrice}
          onChangeText={setClosePrice}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <Text style={styles.label}>Calculation Method</Text>
        <SegmentedButtons
          value={method}
          onValueChange={setMethod}
          buttons={[
            { value: 'standard', label: 'Standard' },
            { value: 'woodie', label: 'Woodie' },
            { value: 'camarilla', label: 'Camarilla' },
            { value: 'demark', label: 'DeMark' },
          ]}
          style={styles.segmentedButtons}
        />
        
        <View style={styles.resultsContainer}>
          <View style={styles.pivotContainer}>
            <Text style={styles.pivotLabel}>Pivot Point</Text>
            <Text style={styles.pivotValue}>{formatPrice(results.pivot)}</Text>
          </View>
          
          <View style={styles.levelsContainer}>
            <View style={styles.levelColumn}>
              <Text style={styles.levelColumnTitle}>Resistance Levels</Text>
              {results.resistance.map((level, index) => (
                <View key={`resistance-${index}`} style={styles.levelRow}>
                  <Text style={styles.levelLabel}>R{index + 1}</Text>
                  <Text style={[styles.levelValue, { color: theme.colors.error }]}>
                    {formatPrice(level)}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.levelColumn}>
              <Text style={styles.levelColumnTitle}>Support Levels</Text>
              {results.support.map((level, index) => (
                <View key={`support-${index}`} style={styles.levelRow}>
                  <Text style={styles.levelLabel}>S{index + 1}</Text>
                  <Text style={[styles.levelValue, { color: theme.colors.success }]}>
                    {formatPrice(level)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>About Pivot Points</Text>
          <Text style={styles.explanationText}>
            Pivot points are technical indicators used to determine potential support and resistance levels in the market.
          </Text>
          <Text style={styles.explanationText}>
            They are calculated using the previous period's high, low, and close prices.
          </Text>
          <Text style={styles.explanationText}>
            Different calculation methods:
            {'\n'}- Standard: The most common method
            {'\n'}- Woodie: Places more emphasis on the closing price
            {'\n'}- Camarilla: Creates more levels for intraday trading
            {'\n'}- DeMark: Adapts based on the relationship between open and close
          </Text>
          <Text style={styles.explanationText}>
            Traders use pivot points to identify potential entry and exit points, as well as to set stop-loss and take-profit levels.
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
  resultsContainer: {
    marginTop: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  pivotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  pivotLabel: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.primary,
  },
  pivotValue: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text,
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelColumn: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  levelColumnTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  levelLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.textSecondary,
  },
  levelValue: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium as any,
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