import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider, Text } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import DropDownPicker from 'react-native-dropdown-picker';

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
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              height={250}
              padding={{ top: 10, bottom: 40, left: 60, right: 40 }}
            >
              <VictoryAxis
                tickFormat={(t) => `${t}yr`}
                style={{
                  axis: { stroke: '#ccc' },
                  tickLabels: { fill: '#ccc', fontSize: 10 },
                  grid: { stroke: 'rgba(255,255,255,0.1)' },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${accountCurrency}${Math.round(t / 1000)}k`}
                style={{
                  axis: { stroke: '#ccc' },
                  tickLabels: { fill: '#ccc', fontSize: 10 },
                  grid: { stroke: 'rgba(255,255,255,0.1)' },
                }}
              />
              <VictoryLine
                data={growthData}
                style={{
                  data: { stroke: '#6200ee', strokeWidth: 3 },
                }}
                animate={{
                  duration: 500,
                  onLoad: { duration: 500 },
                }}
              />
            </VictoryChart>
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
  },
  chartTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
});