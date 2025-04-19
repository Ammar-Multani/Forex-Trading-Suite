import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { Svg, Rect, Line, Text as SvgText } from 'react-native-svg';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import { calculateFibonacciLevels } from '../../utils/calculators';
import { theme } from '../../utils/theme';

export default function FibonacciCalculator() {
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1800');
  const [trendDirection, setTrendDirection] = useState('uptrend');
  
  const [results, setResults] = useState({
    retracement: [] as { level: number; price: number }[],
    extension: [] as { level: number; price: number }[],
  });

  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, trendDirection]);

  const calculateResults = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const isUptrend = trendDirection === 'uptrend';
    
    if (high <= 0 || low <= 0 || high <= low) return;
    
    const result = calculateFibonacciLevels(high, low, isUptrend);
    setResults(result);
  };

  // Format price values
  const formatPrice = (value: number) => {
    return value.toFixed(5);
  };

  // Prepare chart data
  const allLevels = [...results.retracement, ...results.extension];
  const maxPrice = Math.max(...allLevels.map(l => l.price));
  const minPrice = Math.min(...allLevels.map(l => l.price));
  const range = maxPrice - minPrice;
  
  const chartHeight = 300;
  const chartWidth = 300;
  const paddingX = 100;
  const paddingY = 20;
  const availableHeight = chartHeight - paddingY * 2;

  // Scale values for the chart
  const scaleY = (price: number) => {
    if (range === 0) return paddingY;
    return chartHeight - paddingY - ((price - minPrice) / range) * availableHeight;
  };

  // Colors for different Fibonacci levels
  const getLevelColor = (level: number) => {
    if (level === 0) return theme.colors.success;
    if (level === 100) return theme.colors.error;
    if (level < 100) return theme.colors.info;
    return theme.colors.warning;
  };

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Fibonacci Calculator" 
        gradientColors={['#0093E9', '#80D0C7']}
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
        
        <Text style={styles.label}>Trend Direction</Text>
        <SegmentedButtons
          value={trendDirection}
          onValueChange={setTrendDirection}
          buttons={[
            { value: 'uptrend', label: 'Uptrend' },
            { value: 'downtrend', label: 'Downtrend' },
          ]}
          style={styles.segmentedButtons}
        />
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Fibonacci Levels</Text>
          
          <Svg height={chartHeight} width={chartWidth}>
            {/* Price axis */}
            <Line
              x1={paddingX}
              y1={paddingY}
              x2={paddingX}
              y2={chartHeight - paddingY}
              stroke={theme.colors.border}
              strokeWidth="1"
            />
            
            {/* Retracement levels */}
            {results.retracement.map((level, index) => {
              const y = scaleY(level.price);
              const color = getLevelColor(level.level);
              
              return (
                <React.Fragment key={`retracement-${index}`}>
                  <Line
                    x1={paddingX - 5}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray={level.level === 0 || level.level === 100 ? "none" : "5,5"}
                  />
                  <SvgText
                    x={paddingX - 10}
                    y={y + 4}
                    fontSize="12"
                    fill={color}
                    textAnchor="end"
                  >
                    {level.level}%
                  </SvgText>
                  <SvgText
                    x={chartWidth - paddingX + 10}
                    y={y + 4}
                    fontSize="12"
                    fill={color}
                    textAnchor="start"
                  >
                    {formatPrice(level.price)}
                  </SvgText>
                </React.Fragment>
              );
            })}
            
            {/* Extension levels */}
            {results.extension.map((level, index) => {
              const y = scaleY(level.price);
              const color = getLevelColor(level.level);
              
              return (
                <React.Fragment key={`extension-${index}`}>
                  <Line
                    x1={paddingX - 5}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                  <SvgText
                    x={paddingX - 10}
                    y={y + 4}
                    fontSize="12"
                    fill={color}
                    textAnchor="end"
                  >
                    {level.level}%
                  </SvgText>
                  <SvgText
                    x={chartWidth - paddingX + 10}
                    y={y + 4}
                    fontSize="12"
                    fill={color}
                    textAnchor="start"
                  >
                    {formatPrice(level.price)}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
        
        <View style={styles.resultsContainer}>
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Retracement Levels</Text>
            {results.retracement.map((level, index) => (
              <View key={`retracement-result-${index}`} style={styles.resultRow}>
                <Text style={[styles.resultLevel, { color: getLevelColor(level.level) }]}>
                  {level.level}%
                </Text>
                <Text style={styles.resultPrice}>{formatPrice(level.price)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Extension Levels</Text>
            {results.extension.map((level, index) => (
              <View key={`extension-result-${index}`} style={styles.resultRow}>
                <Text style={[styles.resultLevel, { color: getLevelColor(level.level) }]}>
                  {level.level}%
                </Text>
                <Text style={styles.resultPrice}>{formatPrice(level.price)}</Text>
              </View>
            ))}
          </View>
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
  chartContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
  },
  chartTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  resultsContainer: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultSection: {
    flex: 1,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  resultSectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  resultLevel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  resultPrice: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
});