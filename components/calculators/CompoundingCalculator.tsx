import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TextInput, Text, Divider } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import AccountCurrencySelector from '../ui/AccountCurrencySelector';
import { calculateCompoundInterest, formatCurrency } from '../../utils/calculators';

export default function CompoundingCalculator() {
  // State for inputs
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [startingBalance, setStartingBalance] = useState('10000');
  const [rateOfReturn, setRateOfReturn] = useState('10');
  const [years, setYears] = useState('5');
  
  // State for frequency dropdown
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [frequency, setFrequency] = useState('12'); // Monthly by default
  const [frequencyItems, setFrequencyItems] = useState([
    { label: 'Monthly', value: '12' },
    { label: 'Quarterly', value: '4' },
    { label: 'Semi-annually', value: '2' },
    { label: 'Annually', value: '1' },
  ]);
  
  // State for results
  const [endingBalance, setEndingBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [growthData, setGrowthData] = useState<Array<{ x: number; y: number }>>([]);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [startingBalance, rateOfReturn, frequency, years]);
  
  const calculateResults = () => {
    const principal = parseFloat(startingBalance) || 0;
    const rate = parseFloat(rateOfReturn) || 0;
    const frequencyNum = parseInt(frequency) || 1;
    const yearsNum = parseFloat(years) || 0;
    
    const { endBalance, totalEarnings: earnings, growthData: data } = calculateCompoundInterest(
      principal,
      rate,
      frequencyNum,
      yearsNum
    );
    
    setEndingBalance(endBalance);
    setTotalEarnings(earnings);
    setGrowthData(data);
  };
  
  // Simple chart rendering
  const renderChart = () => {
    if (growthData.length < 2) return null;
    
    const chartWidth = Dimensions.get('window').width - 64;
    const chartHeight = 200;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const graphWidth = chartWidth - paddingLeft;
    const graphHeight = chartHeight - paddingBottom;
    
    // Find max value for scaling
    const maxValue = Math.max(...growthData.map(d => d.y));
    const minValue = 0;
    
    // Create path for the line
    let path = '';
    growthData.forEach((point, index) => {
      const x = paddingLeft + (point.x / growthData[growthData.length - 1].x) * graphWidth;
      const y = chartHeight - paddingBottom - ((point.y - minValue) / (maxValue - minValue)) * graphHeight;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    // Create x-axis labels
    const xLabels = [];
    for (let i = 0; i < growthData.length; i += Math.max(1, Math.floor(growthData.length / 5))) {
      const point = growthData[i];
      const x = paddingLeft + (point.x / growthData[growthData.length - 1].x) * graphWidth;
      xLabels.push(
        <SvgText
          key={`x-${i}`}
          x={x}
          y={chartHeight - 10}
          fontSize="10"
          fill="#aaa"
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
          fill="#aaa"
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
          stroke="#444"
          strokeWidth="1"
        />
        
        {/* Y-axis */}
        <Line
          x1={paddingLeft}
          y1={0}
          x2={paddingLeft}
          y2={chartHeight - paddingBottom}
          stroke="#444"
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
            stroke="#333"
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
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Rate of Return (%)"
            value={rateOfReturn}
            onChangeText={setRateOfReturn}
            keyboardType="numeric"
            right={<TextInput.Affix text="%" />}
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
            <Text style={styles.dropdownLabel}>Rate Frequency</Text>
            <DropDownPicker
              open={frequencyOpen}
              value={frequency}
              items={frequencyItems}
              setOpen={setFrequencyOpen}
              setValue={setFrequency}
              setItems={setFrequencyItems}
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownList}
              listMode="SCROLLVIEW"
            />
          </View>
          
          <TextInput
            label="Duration (Years)"
            value={years}
            onChangeText={setYears}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <ResultDisplay
            label="Ending Balance"
            value={formatCurrency(endingBalance, accountCurrency)}
            color="#4CAF50"
            isLarge
          />
          
          <ResultDisplay
            label="Total Earnings"
            value={formatCurrency(totalEarnings, accountCurrency)}
            color="#2196F3"
          />
          
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Growth Chart</Text>
            {renderChart()}
          </View>
        </View>
      </CalculatorCard>
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
    backgroundColor: '#2A2A2A',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
    borderRadius: 8,
  },
  dropdownText: {
    color: '#fff',
  },
  dropdownList: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  chartContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
});
