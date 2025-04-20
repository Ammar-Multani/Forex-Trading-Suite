import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Text, Divider, Button, IconButton, Surface } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { formatCurrency } from '../../utils/calculators';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced compound interest calculation with additional features
function calculateEnhancedCompoundInterest(
  principal: number,
  rate: number,
  frequency: number,
  years: number,
  additionalContributions: number = 0,
  contributionFrequency: number = frequency,
  withdrawals: number = 0,
  withdrawalFrequency: number = frequency,
  taxRate: number = 0,
  compoundingFrequency: number = frequency
) {
  const periods = Math.max(1, Math.floor(frequency * years));
  const ratePerPeriod = rate / 100 / compoundingFrequency;
  
  let balance = principal;
  let totalContributions = principal;
  let totalWithdrawals = 0;
  let totalTaxesPaid = 0;
  let lastEarnings = 0;
  
  const growthData = [{ x: 0, y: principal }];
  const breakdownData = [{ period: 0, earnings: 0, balance: principal }];
  
  for (let i = 1; i <= periods; i++) {
    // Calculate interest for this period
    const interestEarned = balance * ratePerPeriod;
    
    // Apply tax on interest if applicable
    const taxAmount = interestEarned * (taxRate / 100);
    totalTaxesPaid += taxAmount;
    
    // Add interest (minus tax) to balance
    balance += interestEarned - taxAmount;
    
    // Add additional contribution if it's time
    if (additionalContributions > 0 && i % Math.floor(frequency / contributionFrequency) === 0) {
      balance += additionalContributions;
      totalContributions += additionalContributions;
    }
    
    // Subtract withdrawal if it's time
    if (withdrawals > 0 && i % Math.floor(frequency / withdrawalFrequency) === 0) {
      balance = Math.max(0, balance - withdrawals);
      totalWithdrawals += withdrawals;
    }
    
    // Add data point for each year or at the end
    if (i % frequency === 0 || i === periods) {
      const yearsPassed = i / frequency;
      growthData.push({
        x: yearsPassed,
        y: balance
      });
      
      // Save breakdown data for each year
      breakdownData.push({
        period: yearsPassed,
        earnings: interestEarned - taxAmount,
        balance: balance
      });
      
      // Save last period earnings
      if (i === periods) {
        lastEarnings = interestEarned - taxAmount;
      }
    }
  }
  
  const endBalance = balance;
  const totalEarnings = endBalance - totalContributions + totalWithdrawals;
  
  // Calculate time to double investment
  let timeToDouble = 0;
  if (rate > 0) {
    // Using Rule of 72 as an approximation
    timeToDouble = 72 / (rate * (compoundingFrequency / frequency));
  }
  
  // Calculate effective annual rate
  const effectiveAnnualRate = (Math.pow(1 + ratePerPeriod, compoundingFrequency) - 1) * 100;
  
  return {
    endBalance,
    totalEarnings,
    growthData,
    breakdownData,
    totalContributions,
    totalWithdrawals,
    totalTaxesPaid,
    timeToDouble,
    effectiveAnnualRate,
    allTimeRateOfReturn: (totalEarnings / totalContributions) * 100,
    lastEarnings
  };
}

export default function CompoundingCalculator() {
  const { isDark } = useTheme();
  
  // Basic inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [startingBalance, setStartingBalance] = useState('10000');
  const [rateOfReturn, setRateOfReturn] = useState('10');
  const [years, setYears] = useState('5');
  
  // Frequency dropdowns
  const [returnFrequencyOpen, setReturnFrequencyOpen] = useState(false);
  const [returnFrequency, setReturnFrequency] = useState('12'); // Monthly by default
  const [returnFrequencyItems, setReturnFrequencyItems] = useState([
    { label: 'Monthly', value: '12' },
    { label: 'Quarterly', value: '4' },
    { label: 'Semi-annually', value: '2' },
    { label: 'Annually', value: '1' },
  ]);
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [compoundingFrequencyOpen, setCompoundingFrequencyOpen] = useState(false);
  const [compoundingFrequency, setCompoundingFrequency] = useState('12'); // Monthly by default
  const [compoundingFrequencyItems, setCompoundingFrequencyItems] = useState([
    { label: 'Monthly', value: '12' },
    { label: 'Quarterly', value: '4' },
    { label: 'Semi-annually', value: '2' },
    { label: 'Annually', value: '1' },
    { label: 'Daily', value: '365' },
  ]);
  
  const [additionalContributions, setAdditionalContributions] = useState('0');
  
  const [contributionFrequencyOpen, setContributionFrequencyOpen] = useState(false);
  const [contributionFrequency, setContributionFrequency] = useState('12'); // Monthly by default
  const [contributionFrequencyItems, setContributionFrequencyItems] = useState([
    { label: 'Monthly', value: '12' },
    { label: 'Quarterly', value: '4' },
    { label: 'Semi-annually', value: '2' },
    { label: 'Annually', value: '1' },
  ]);
  
  const [withdrawals, setWithdrawals] = useState('0');
  
  const [withdrawalFrequencyOpen, setWithdrawalFrequencyOpen] = useState(false);
  const [withdrawalFrequency, setWithdrawalFrequency] = useState('12'); // Monthly by default
  const [withdrawalFrequencyItems, setWithdrawalFrequencyItems] = useState([
    { label: 'Monthly', value: '12' },
    { label: 'Quarterly', value: '4' },
    { label: 'Semi-annually', value: '2' },
    { label: 'Annually', value: '1' },
  ]);
  
  const [taxRate, setTaxRate] = useState('0');
  
  // Results
  const [results, setResults] = useState({
    endBalance: 0,
    totalEarnings: 0,
    growthData: [{ x: 0, y: 0 }],
    breakdownData: [{ period: 0, earnings: 0, balance: 0 }],
    totalContributions: 0,
    totalWithdrawals: 0,
    totalTaxesPaid: 0,
    timeToDouble: 0,
    effectiveAnnualRate: 0,
    allTimeRateOfReturn: 0,
    lastEarnings: 0
  });
  
  // UI state
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    startingBalance, 
    rateOfReturn, 
    returnFrequency, 
    years, 
    compoundingFrequency, 
    additionalContributions, 
    contributionFrequency, 
    withdrawals, 
    withdrawalFrequency, 
    taxRate
  ]);
  
  const calculateResults = () => {
    const principal = parseFloat(startingBalance) || 0;
    const rate = parseFloat(rateOfReturn) || 0;
    const returnFrequencyNum = parseInt(returnFrequency) || 1;
    const yearsNum = parseFloat(years) || 0;
    const compoundingFrequencyNum = parseInt(compoundingFrequency) || returnFrequencyNum;
    const additionalContributionsNum = parseFloat(additionalContributions) || 0;
    const contributionFrequencyNum = parseInt(contributionFrequency) || returnFrequencyNum;
    const withdrawalsNum = parseFloat(withdrawals) || 0;
    const withdrawalFrequencyNum = parseInt(withdrawalFrequency) || returnFrequencyNum;
    const taxRateNum = parseFloat(taxRate) || 0;
    
    const calculatedResults = calculateEnhancedCompoundInterest(
      principal,
      rate,
      returnFrequencyNum,
      yearsNum,
      additionalContributionsNum,
      contributionFrequencyNum,
      withdrawalsNum,
      withdrawalFrequencyNum,
      taxRateNum,
      compoundingFrequencyNum
    );
    
    setResults(calculatedResults);
  };
  
  // Simple chart rendering
  const renderChart = () => {
    if (results.growthData.length < 2) return null;
    
    const chartWidth = Dimensions.get('window').width - 64;
    const chartHeight = 200;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const graphWidth = chartWidth - paddingLeft;
    const graphHeight = chartHeight - paddingBottom;
    
    // Find max value for scaling
    const maxValue = Math.max(...results.growthData.map(d => d.y));
    const minValue = 0;
    
    // Create path for the line
    let path = '';
    results.growthData.forEach((point, index) => {
      const x = paddingLeft + (point.x / results.growthData[results.growthData.length - 1].x) * graphWidth;
      const y = chartHeight - paddingBottom - ((point.y - minValue) / (maxValue - minValue)) * graphHeight;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    // Create x-axis labels
    const xLabels = [];
    for (let i = 0; i < results.growthData.length; i += Math.max(1, Math.floor(results.growthData.length / 5))) {
      const point = results.growthData[i];
      const x = paddingLeft + (point.x / results.growthData[results.growthData.length - 1].x) * graphWidth;
      xLabels.push(
        <SvgText
          key={`x-${i}`}
          x={x}
          y={chartHeight - 10}
          fontSize="10"
          fill={isDark ? "#aaa" : "#666"}
          textAnchor="middle"
        >
          {`${point.x}yr`}
        </SvgText>
      );
    }
    
    // Create y-axis labels
    const yLabels = [];
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
      const value = minValue + (i / numYLabels) * (maxValue - minValue);
      const y = chartHeight - paddingBottom - (i / numYLabels) * graphHeight;
      yLabels.push(
        <SvgText
          key={`y-${i}`}
          x={paddingLeft - 5}
          y={y + 4}
          fontSize="10"
          fill={isDark ? "#aaa" : "#666"}
          textAnchor="end"
        >
          {value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value)}
        </SvgText>
      );
    }
    
    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* X-axis */}
        <Line
          x1={paddingLeft}
          y1={chartHeight - paddingBottom}
          x2={chartWidth}
          y2={chartHeight - paddingBottom}
          stroke={isDark ? "#444" : "#ccc"}
          strokeWidth="1"
        />
        
        {/* Y-axis */}
        <Line
          x1={paddingLeft}
          y1={0}
          x2={paddingLeft}
          y2={chartHeight - paddingBottom}
          stroke={isDark ? "#444" : "#ccc"}
          strokeWidth="1"
        />
        
        {/* Grid lines */}
        {Array.from({ length: numYLabels + 1 }).map((_, i) => (
          <Line
            key={`grid-${i}`}
            x1={paddingLeft}
            y1={chartHeight - paddingBottom - (i / numYLabels) * graphHeight}
            x2={chartWidth}
            y2={chartHeight - paddingBottom - (i / numYLabels) * graphHeight}
            stroke={isDark ? "#333" : "#eee"}
            strokeWidth="1"
          />
        ))}
        
        {/* Line chart */}
        <Path
          d={path}
          fill="none"
          stroke="#6200ee"
          strokeWidth="2"
        />
        
        {/* X-axis labels */}
        {xLabels}
        
        {/* Y-axis labels */}
        {yLabels}
      </Svg>
    );
  };
  
  // Render breakdown table
  const renderBreakdown = () => {
    if (!showBreakdown) return null;
    
    return (
      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownHeader}>
          <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>Breakdown</Text>
          <IconButton
            icon="close"
            size={20}
            onPress={() => setShowBreakdown(false)}
            iconColor={isDark ? '#fff' : '#000'}
          />
        </View>
        
        <View style={[styles.breakdownTableHeader, { backgroundColor: isDark ? '#2A2A2A' : '#f0f0f0' }]}>
          <Text variant="bodyMedium" style={[styles.breakdownHeaderCell, { flex: 0.5 }]}>#</Text>
          <Text variant="bodyMedium" style={styles.breakdownHeaderCell}>Earnings</Text>
          <Text variant="bodyMedium" style={styles.breakdownHeaderCell}>Ending Balance</Text>
        </View>
        
        <ScrollView style={styles.breakdownTable}>
          {results.breakdownData.map((item, index) => (
            <View 
              key={`breakdown-${index}`} 
              style={[
                styles.breakdownRow, 
                { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
              ]}
            >
              <Text variant="bodyMedium" style={[styles.breakdownCell, { flex: 0.5 }]}>{index}</Text>
              <Text variant="bodyMedium" style={styles.breakdownCell}>
                {formatCurrency(item.earnings, accountCurrency)}
              </Text>
              <Text variant="bodyMedium" style={styles.breakdownCell}>
                {formatCurrency(item.balance, accountCurrency)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Compounding Calculator">
        <View style={styles.inputsContainer}>
          <AccountCurrencySelector
            value={accountCurrency}
            onChange={setAccountCurrency}
          />
          
          <TextInput
            label="Starting Balance"
            value={startingBalance}
            onChangeText={setStartingBalance}
            keyboardType="numeric"
            left={<TextInput.Affix text={accountCurrency === 'USD' ? '$' : ''} />}
            style={styles.input}
            mode="outlined"
            outlineColor={isDark ? "#444" : "#ddd"}
            activeOutlineColor="#6200ee"
            textColor={isDark ? "#fff" : "#000"}
            theme={{ 
              colors: { 
                background: isDark ? '#2A2A2A' : '#f5f5f5',
                onSurfaceVariant: isDark ? '#aaa' : '#666'
              } 
            }}
          />
          
          <TextInput
            label="Rate of Return"
            value={rateOfReturn}
            onChangeText={setRateOfReturn}
            keyboardType="numeric"
            right={<TextInput.Affix text="%" />}
            style={styles.input}
            mode="outlined"
            outlineColor={isDark ? "#444" : "#ddd"}
            activeOutlineColor="#6200ee"
            textColor={isDark ? "#fff" : "#000"}
            theme={{ 
              colors: { 
                background: isDark ? '#2A2A2A' : '#f5f5f5',
                onSurfaceVariant: isDark ? '#aaa' : '#666'
              } 
            }}
          />
          
          <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
            <Text variant="bodySmall" style={{ marginBottom: 8 }}>Return Frequency</Text>
            <DropDownPicker
              open={returnFrequencyOpen}
              value={returnFrequency}
              items={returnFrequencyItems}
              setOpen={setReturnFrequencyOpen}
              setValue={setReturnFrequency}
              setItems={setReturnFrequencyItems}
              style={[
                styles.dropdown, 
                { 
                  backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                  borderColor: isDark ? '#444' : '#ddd',
                }
              ]}
              textStyle={[
                styles.dropdownText,
                { color: isDark ? '#fff' : '#000' }
              ]}
              dropDownContainerStyle={[
                styles.dropdownList,
                {
                  backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                  borderColor: isDark ? '#444' : '#ddd',
                }
              ]}
              listMode="SCROLLVIEW"
            />
          </View>
          
          <TextInput
            label="Duration in Years"
            value={years}
            onChangeText={setYears}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor={isDark ? "#444" : "#ddd"}
            activeOutlineColor="#6200ee"
            textColor={isDark ? "#fff" : "#000"}
            theme={{ 
              colors: { 
                background: isDark ? '#2A2A2A' : '#f5f5f5',
                onSurfaceVariant: isDark ? '#aaa' : '#666'
              } 
            }}
          />
          
          <TouchableOpacity 
            style={[
              styles.advancedButton, 
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
            ]} 
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text variant="bodyMedium" style={{ color: isDark ? '#fff' : '#000' }}>ADVANCED</Text>
            <Ionicons 
              name={showAdvanced ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={isDark ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
          
          {showAdvanced && (
            <View style={styles.advancedOptions}>
              <View style={[styles.dropdownContainer, { zIndex: 2900 }]}>
                <Text variant="bodySmall" style={{ marginBottom: 8 }}>Compounding Frequency</Text>
                <DropDownPicker
                  open={compoundingFrequencyOpen}
                  value={compoundingFrequency}
                  items={compoundingFrequencyItems}
                  setOpen={setCompoundingFrequencyOpen}
                  setValue={setCompoundingFrequency}
                  setItems={setCompoundingFrequencyItems}
                  style={[
                    styles.dropdown, 
                    { 
                      backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                      borderColor: isDark ? '#444' : '#ddd',
                    }
                  ]}
                  textStyle={[
                    styles.dropdownText,
                    { color: isDark ? '#fff' : '#000' }
                  ]}
                  dropDownContainerStyle={[
                    styles.dropdownList,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                      borderColor: isDark ? '#444' : '#ddd',
                    }
                  ]}
                  listMode="SCROLLVIEW"
                />
              </View>
              
              <TextInput
                label="Additional Contributions"
                value={additionalContributions}
                onChangeText={setAdditionalContributions}
                keyboardType="numeric"
                left={<TextInput.Affix text={accountCurrency === 'USD' ? '$' : ''} />}
                style={styles.input}
                mode="outlined"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{ 
                  colors: { 
                    background: isDark ? '#2A2A2A' : '#f5f5f5',
                    onSurfaceVariant: isDark ? '#aaa' : '#666'
                  } 
                }}
              />
              
              <View style={[styles.dropdownContainer, { zIndex: 2800 }]}>
                <Text variant="bodySmall" style={{ marginBottom: 8 }}>Contribution Frequency</Text>
                <DropDownPicker
                  open={contributionFrequencyOpen}
                  value={contributionFrequency}
                  items={contributionFrequencyItems}
                  setOpen={setContributionFrequencyOpen}
                  setValue={setContributionFrequency}
                  setItems={setContributionFrequencyItems}
                  style={[
                    styles.dropdown, 
                    { 
                      backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                      borderColor: isDark ? '#444' : '#ddd',
                    }
                  ]}
                  textStyle={[
                    styles.dropdownText,
                    { color: isDark ? '#fff' : '#000' }
                  ]}
                  dropDownContainerStyle={[
                    styles.dropdownList,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                      borderColor: isDark ? '#444' : '#ddd',
                    }
                  ]}
                  listMode="SCROLLVIEW"
                />
              </View>
              
              <TextInput
                label="Withdrawals Amount"
                value={withdrawals}
                onChangeText={setWithdrawals}
                keyboardType="numeric"
                left={<TextInput.Affix text={accountCurrency === 'USD' ? '$' : ''} />}
                style={styles.input}
                mode="outlined"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{ 
                  colors: { 
                    background: isDark ? '#2A2A2A' : '#f5f5f5',
                    onSurfaceVariant: isDark ? '#aaa' : '#666'
                  } 
                }}
              />
              
              <View style={[styles.dropdownContainer, { zIndex: 2700 }]}>
                <Text variant="bodySmall" style={{ marginBottom: 8 }}>Withdrawals Frequency</Text>
                <DropDownPicker
                  open={withdrawalFrequencyOpen}
                  value={withdrawalFrequency}
                  items={withdrawalFrequencyItems}
                  setOpen={setWithdrawalFrequencyOpen}
                  setValue={setWithdrawalFrequency}
                  setItems={setWithdrawalFrequencyItems}
                  style={[
                    styles.dropdown, 
                    { 
                      backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                      borderColor: isDark ? '#444' : '#ddd',
                    }
                  ]}
                  textStyle={[
                    styles.dropdownText,
                    { color: isDark ? '#fff' : '#000' }
                  ]}
                  dropDownContainerStyle={[
                    styles.dropdownList,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
                      borderColor: isDark ? '#444' : '#ddd',
                    }
                  ]}
                  listMode="SCROLLVIEW"
                />
              </View>
              
              <TextInput
                label="Tax Rate"
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="numeric"
                right={<TextInput.Affix text="%" />}
                style={styles.input}
                mode="outlined"
                outlineColor={isDark ? "#444" : "#ddd"}
                activeOutlineColor="#6200ee"
                textColor={isDark ? "#fff" : "#000"}
                theme={{ 
                  colors: { 
                    background: isDark ? '#2A2A2A' : '#f5f5f5',
                    onSurfaceVariant: isDark ? '#aaa' : '#666'
                  } 
                }}
              />
            </View>
          )}
        </View>
        
        <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
        
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>Results</Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={calculateResults}
              iconColor={isDark ? '#fff' : '#000'}
            />
          </View>
          
          <ResultDisplay
            label="Ending Balance"
            value={formatCurrency(results.endBalance, accountCurrency)}
            color="#4CAF50"
            isLarge
          />
          
          <ResultDisplay
            label="Total Earnings"
            value={formatCurrency(results.totalEarnings, accountCurrency)}
            color="#2196F3"
          />
          
          <ResultDisplay
            label="All-time Rate of Return"
            value={`${results.allTimeRateOfReturn.toFixed(2)}%`}
            color="#FF9800"
          />
          
          <ResultDisplay
            label="Effective Annual Rate"
            value={`${results.effectiveAnnualRate.toFixed(2)}%`}
            color="#9C27B0"
          />
          
          <ResultDisplay
            label="Last Earnings"
            value={formatCurrency(results.lastEarnings, accountCurrency)}
            color="#00BCD4"
          />
          
          <ResultDisplay
            label="Duration to Double Investment"
            value={`${results.timeToDouble.toFixed(1)} months`}
            color="#FF5722"
          />
          
          <View style={styles.chartContainer}>
            <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000', marginBottom: 8 }}>Growth Chart</Text>
            {renderChart()}
          </View>
          
          <Button 
            mode="outlined" 
            onPress={() => setShowBreakdown(true)} 
            style={[styles.breakdownButton, { borderColor: isDark ? '#444' : '#ddd' }]}
            textColor={isDark ? '#fff' : '#000'}
          >
            View Detailed Breakdown
          </Button>
        </View>
      </CalculatorCard>
      
      {renderBreakdown()}
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
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    borderRadius: 8,
  },
  dropdownText: {
  },
  dropdownList: {
  },
  divider: {
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  advancedButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  advancedOptions: {
    marginTop: 8,
  },
  breakdownButton: {
    marginTop: 24,
    marginBottom: 8,
  },
  breakdownContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
    zIndex: 9999,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  breakdownTableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  breakdownHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  breakdownTable: {
    maxHeight: '80%',
  },
  breakdownRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  breakdownCell: {
    flex: 1,
  },
});