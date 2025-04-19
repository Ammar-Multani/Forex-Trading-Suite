import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { Svg, Rect, Line, Text as SvgText, Circle } from 'react-native-svg';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculateCompoundInterest, getCurrencySymbol } from '../../utils/calculators';
import { theme } from '../../utils/theme';

export default function CompoundingCalculator() {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [startingBalance, setStartingBalance] = useState('10000');
  const [rateOfReturn, setRateOfReturn] = useState('10');
  const [rateFrequency, setRateFrequency] = useState('annually');
  const [duration, setDuration] = useState('5');
  
  const [results, setResults] = useState({
    endingBalance: 0,
    totalEarnings: 0,
    growthData: [{ year: 0, balance: 0 }],
  });

  useEffect(() => {
    calculateResults();
  }, [accountCurrency, startingBalance, rateOfReturn, rateFrequency, duration]);

  const calculateResults = () => {
    const principal = parseFloat(startingBalance) || 0;
    const rate = parseFloat(rateOfReturn) || 0;
    const years = parseFloat(duration) || 0;
    
    const result = calculateCompoundInterest(
      principal,
      rate,
      years,
      rateFrequency as 'monthly' | 'quarterly' | 'semi-annually' | 'annually'
    );
    
    setResults(result);
  };

  const currencySymbol = getCurrencySymbol(accountCurrency);

  // Format currency values
  const formatCurrency = (value: number) => {
    return `${currencySymbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Prepare chart data
  const chartData = results.growthData;
  const maxBalance = Math.max(...chartData.map(d => d.balance));
  const minBalance = Math.min(...chartData.map(d => d.balance));
  const chartHeight = 200;
  const chartWidth = 300;
  const paddingX = 40;
  const paddingY = 30;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingY * 2;

  // Scale values for the chart
  const scaleX = (year: number) => {
    const maxYear = parseFloat(duration) || 5;
    return paddingX + (year / maxYear) * availableWidth;
  };

  const scaleY = (balance: number) => {
    const range = maxBalance - minBalance;
    if (range === 0) return paddingY;
    return chartHeight - paddingY - ((balance - minBalance) / range) * availableHeight;
  };

  return (
    <ScrollView style={styles.container}>
      <CalculatorCard 
        title="Compounding Calculator" 
        gradientColors={['#4158D0', '#C850C0']}
      >
        <AccountCurrencySelector
          value={accountCurrency}
          onValueChange={setAccountCurrency}
        />
        
        <TextInput
          label="Starting Balance"
          value={startingBalance}
          onChangeText={setStartingBalance}
          keyboardType="numeric"
          left={<TextInput.Affix text={currencySymbol} />}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <TextInput
          label="Rate of Return (%)"
          value={rateOfReturn}
          onChangeText={setRateOfReturn}
          keyboardType="numeric"
          right={<TextInput.Affix text="%" />}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <Text style={styles.label}>Rate Frequency</Text>
        <SegmentedButtons
          value={rateFrequency}
          onValueChange={setRateFrequency}
          buttons={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'semi-annually', label: 'Semi-Annual' },
            { value: 'annually', label: 'Annual' },
          ]}
          style={styles.segmentedButtons}
        />
        
        <TextInput
          label="Duration (Years)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          right={<TextInput.Affix text="years" />}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        
        <ResultDisplay
          title="Compounding Results"
          results={[
            {
              label: 'Starting Balance',
              value: formatCurrency(parseFloat(startingBalance) || 0),
            },
            {
              label: 'Ending Balance',
              value: formatCurrency(results.endingBalance),
              isHighlighted: true,
              color: theme.colors.primary,
            },
            {
              label: 'Total Earnings',
              value: formatCurrency(results.totalEarnings),
              color: theme.colors.success,
            },
            {
              label: 'Growth Rate',
              value: `${rateOfReturn}% (${rateFrequency})`,
            },
            {
              label: 'Time Period',
              value: `${duration} years`,
            },
          ]}
        />
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Growth Chart</Text>
          
          <Svg height={chartHeight} width={chartWidth}>
            {/* X-axis */}
            <Line
              x1={paddingX}
              y1={chartHeight - paddingY}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingY}
              stroke={theme.colors.border}
              strokeWidth="1"
            />
            
            {/* Y-axis */}
            <Line
              x1={paddingX}
              y1={paddingY}
              x2={paddingX}
              y2={chartHeight - paddingY}
              stroke={theme.colors.border}
              strokeWidth="1"
            />
            
            {/* X-axis labels */}
            {Array.from({ length: parseInt(duration) + 1 }).map((_, i) => (
              <React.Fragment key={`x-label-${i}`}>
                <Line
                  x1={scaleX(i)}
                  y1={chartHeight - paddingY}
                  x2={scaleX(i)}
                  y2={chartHeight - paddingY + 5}
                  stroke={theme.colors.border}
                  strokeWidth="1"
                />
                <SvgText
                  x={scaleX(i)}
                  y={chartHeight - paddingY + 15}
                  fontSize="10"
                  fill={theme.colors.textSecondary}
                  textAnchor="middle"
                >
                  {i}
                </SvgText>
              </React.Fragment>
            ))}
            
            {/* Chart line and points */}
            {chartData.map((point, index) => {
              if (index === 0) return null;
              
              const prevPoint = chartData[index - 1];
              return (
                <React.Fragment key={`line-${index}`}>
                  <Line
                    x1={scaleX(prevPoint.year)}
                    y1={scaleY(prevPoint.balance)}
                    x2={scaleX(point.year)}
                    y2={scaleY(point.balance)}
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                  />
                  <Circle
                    cx={scaleX(point.year)}
                    cy={scaleY(point.balance)}
                    r="4"
                    fill={theme.colors.primary}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
          
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>Years</Text>
            <Text style={[styles.chartLabel, styles.balanceLabel]}>Balance</Text>
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
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  chartLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  balanceLabel: {
    transform: [{ rotate: '270deg' }],
    position: 'absolute',
    left: -30,
    top: 100,
  },
});