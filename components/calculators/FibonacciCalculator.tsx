import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Divider, RadioButton } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryScatter } from 'victory-native';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import { calculateFibonacciLevels, formatNumber } from '../../utils/calculators';

export default function FibonacciCalculator() {
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1800');
  const [trendDirection, setTrendDirection] = useState('uptrend');
  
  // State for results
  const [retracements, setRetracements] = useState<Array<{ level: number; price: number }>>([]);
  const [extensions, setExtensions] = useState<Array<{ level: number; price: number }>>([]);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, trendDirection]);
  
  const calculateResults = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const isUptrend = trendDirection === 'uptrend';
    
    if (high <= 0 || low <= 0 || high === low) return;
    
    const { retracements: retracementLevels, extensions: extensionLevels } = calculateFibonacciLevels(
      high,
      low,
      isUptrend
    );
    
    setRetracements(retracementLevels);
    setExtensions(extensionLevels);
  };
  
  // Prepare chart data
  const getChartData = () => {
    const allLevels = [...retracements, ...extensions];
    if (allLevels.length === 0) return [];
    
    // Sort by price
    return allLevels.sort((a, b) => a.price - b.price).map(level => ({
      x: 1,
      y: level.price,
      level: level.level
    }));
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Fibonacci Calculator">
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
          
          <Text style={styles.radioLabel}>Trend Direction</Text>
          <RadioButton.Group
            onValueChange={value => setTrendDirection(value)}
            value={trendDirection}
          >
            <View style={styles.radioContainer}>
              <RadioButton.Item
                label="Uptrend"
                value="uptrend"
                color="#6200ee"
                labelStyle={styles.radioLabel}
                style={styles.radioButton}
              />
              <RadioButton.Item
                label="Downtrend"
                value="downtrend"
                color="#6200ee"
                labelStyle={styles.radioLabel}
                style={styles.radioButton}
              />
            </View>
          </RadioButton.Group>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Fibonacci Retracement Levels</Text>
          <View style={styles.levelsContainer}>
            {retracements.map((level, index) => (
              <View key={`retracement-${index}`} style={styles.levelRow}>
                <Text style={styles.levelPercent}>{level.level}%</Text>
                <Text style={styles.levelPrice}>{formatNumber(level.price, 5)}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Fibonacci Extension Levels</Text>
          <View style={styles.levelsContainer}>
            {extensions.map((level, index) => (
              <View key={`extension-${index}`} style={styles.levelRow}>
                <Text style={styles.levelPercent}>{level.level}%</Text>
                <Text style={styles.levelPrice}>{formatNumber(level.price, 5)}</Text>
              </View>
            ))}
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
                      if (datum.level === 0 || datum.level === 100) return '#FFC107';
                      if (datum.level < 100) return '#4CAF50';
                      return '#F44336';
                    }
                  }
                }}
                labels={({ datum }) => `${datum.level}% - ${formatNumber(datum.y, 5)}`}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  levelsContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelPercent: {
    color: '#aaa',
    fontWeight: 'bold',
  },
  levelPrice: {
    color: '#fff',
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