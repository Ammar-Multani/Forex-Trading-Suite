import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, Divider, RadioButton } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryScatter } from 'victory-native';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import { calculatePivotPoints, formatNumber } from '../../utils/calculators';

export default function PivotPointsCalculator() {
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1800');
  const [closePrice, setClosePrice] = useState('1.1900');
  const [method, setMethod] = useState('standard');
  
  // State for results
  const [pivotPoint, setPivotPoint] = useState(0);
  const [resistanceLevels, setResistanceLevels] = useState<number[]>([]);
  const [supportLevels, setSupportLevels] = useState<number[]>([]);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, method]);
  
  const calculateResults = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;
    
    if (high <= 0 || low <= 0 || close <= 0) return;
    
    const { pivot, resistance, support } = calculatePivotPoints(
      high,
      low,
      close,
      method as 'standard' | 'woodie' | 'camarilla' | 'demark'
    );
    
    setPivotPoint(pivot);
    setResistanceLevels(resistance);
    setSupportLevels(support);
  };
  
  // Prepare chart data
  const getChartData = () => {
    if (!pivotPoint) return [];
    
    const allLevels = [
      { name: 'R3', value: resistanceLevels[2], type: 'resistance' },
      { name: 'R2', value: resistanceLevels[1], type: 'resistance' },
      { name: 'R1', value: resistanceLevels[0], type: 'resistance' },
      { name: 'PP', value: pivotPoint, type: 'pivot' },
      { name: 'S1', value: supportLevels[0], type: 'support' },
      { name: 'S2', value: supportLevels[1], type: 'support' },
      { name: 'S3', value: supportLevels[2], type: 'support' },
    ];
    
    // Sort by price (descending)
    return allLevels.sort((a, b) => b.value - a.value).map(level => ({
      x: 1,
      y: level.value,
      name: level.name,
      type: level.type
    }));
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Pivot Points Calculator">
        <View style={styles.inputsContainer}>
          <TextInput
            label="High Price"
            value={highPrice}
            onChangeText={setHighPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Low Price"
            value={lowPrice}
            onChangeText={setLowPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <TextInput
            label="Close Price"
            value={closePrice}
            onChangeText={setClosePrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#444"
            activeOutlineColor="#6200ee"
            textColor="#fff"
            theme={{ colors: { background: '#2A2A2A' } }}
          />
          
          <Text style={styles.radioLabel}>Calculation Method</Text>
          <RadioButton.Group
            onValueChange={value => setMethod(value)}
            value={method}
          >
            <View style={styles.radioContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <RadioButton.Item
                  label="Standard"
                  value="standard"
                  color="#6200ee"
                  labelStyle={styles.radioLabel}
                  style={styles.radioButton}
                />
                <RadioButton.Item
                  label="Woodie's"
                  value="woodie"
                  color="#6200ee"
                  labelStyle={styles.radioLabel}
                  style={styles.radioButton}
                />
                <RadioButton.Item
                  label="Camarilla"
                  value="camarilla"
                  color="#6200ee"
                  labelStyle={styles.radioLabel}
                  style={styles.radioButton}
                />
                <RadioButton.Item
                  label="DeMark"
                  value="demark"
                  color="#6200ee"
                  labelStyle={styles.radioLabel}
                  style={styles.radioButton}
                />
              </ScrollView>
            </View>
          </RadioButton.Group>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <ResultDisplay
            label="Pivot Point (PP)"
            value={formatNumber(pivotPoint, 5)}
            color="#FFC107"
            isLarge
          />
          
          <View style={styles.levelsContainer}>
            <View style={styles.levelSection}>
              <Text style={styles.sectionTitle}>Resistance Levels</Text>
              {resistanceLevels.map((level, index) => (
                <View key={`resistance-${index}`} style={styles.levelRow}>
                  <Text style={styles.levelName}>R{index + 1}</Text>
                  <Text style={[styles.levelValue, { color: '#F44336' }]}>
                    {formatNumber(level, 5)}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.levelSection}>
              <Text style={styles.sectionTitle}>Support Levels</Text>
              {supportLevels.map((level, index) => (
                <View key={`support-${index}`} style={styles.levelRow}>
                  <Text style={styles.levelName}>S{index + 1}</Text>
                  <Text style={[styles.levelValue, { color: '#4CAF50' }]}>
                    {formatNumber(level, 5)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Price Levels</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              height={300}
              padding={{ top: 10, bottom: 40, left: 60, right: 40 }}
              domain={{ x: [0, 2] }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: 'transparent' },
                  tickLabels: { fill: 'transparent' },
                  grid: { stroke: 'transparent' },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: '#ccc' },
                  tickLabels: { fill: '#ccc', fontSize: 10 },
                  grid: { stroke: 'rgba(255,255,255,0.1)' },
                }}
              />
              <VictoryScatter
                data={getChartData()}
                size={6}
                style={{
                  data: {
                    fill: ({ datum }) => {
                      if (datum.type === 'pivot') return '#FFC107';
                      if (datum.type === 'resistance') return '#F44336';
                      return '#4CAF50';
                    }
                  }
                }}
                labels={({ datum }) => `${datum.name} - ${formatNumber(datum.y, 5)}`}
                labelComponent={
                  <VictoryScatter
                    labelComponent={
                      <Text style={{ fontSize: 10, color: '#fff' }} />
                    }
                  />
                }
              />
              <VictoryLine
                data={getChartData()}
                style={{
                  data: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 },
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
  radioLabel: {
    fontSize: 14,
    color: '#fff',
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioButton: {
    paddingHorizontal: 8,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  levelSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelName: {
    color: '#aaa',
    fontWeight: 'bold',
  },
  levelValue: {
    fontWeight: 'bold',
  },
  chartContainer: {
    marginTop: 24,
  },
  chartTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
});