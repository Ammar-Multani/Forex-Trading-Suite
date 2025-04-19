import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Divider, Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import { calculatePivotPoints, formatNumber } from '../../utils/calculators';

export default function PivotPointsCalculator() {
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1800');
  const [closePrice, setClosePrice] = useState('1.1900');
  
  // State for method dropdown
  const [methodOpen, setMethodOpen] = useState(false);
  const [method, setMethod] = useState('standard');
  const [methodItems, setMethodItems] = useState([
    { label: 'Standard', value: 'standard' },
    { label: "Woodie's", value: 'woodie' },
    { label: 'Camarilla', value: 'camarilla' },
    { label: 'DeMark', value: 'demark' },
  ]);
  
  // State for results
  const [pivot, setPivot] = useState(0);
  const [resistance, setResistance] = useState<number[]>([0, 0, 0]);
  const [support, setSupport] = useState<number[]>([0, 0, 0]);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, method]);
  
  const calculateResults = () => {
    const highPriceNum = parseFloat(highPrice) || 0;
    const lowPriceNum = parseFloat(lowPrice) || 0;
    const closePriceNum = parseFloat(closePrice) || 0;
    
    const { pivot: calculatedPivot, resistance: calculatedResistance, support: calculatedSupport } = calculatePivotPoints(
      highPriceNum,
      lowPriceNum,
      closePriceNum,
      method as 'standard' | 'woodie' | 'camarilla' | 'demark'
    );
    
    setPivot(calculatedPivot);
    setResistance(calculatedResistance);
    setSupport(calculatedSupport);
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
          
          <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
            <Text style={styles.dropdownLabel}>Calculation Method</Text>
            <DropDownPicker
              open={methodOpen}
              value={method}
              items={methodItems}
              setOpen={setMethodOpen}
              setValue={setMethod}
              setItems={setMethodItems}
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownList}
              listMode="SCROLLVIEW"
            />
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.resultsContainer}>
          <ResultDisplay
            label="Pivot Point (PP)"
            value={formatNumber(pivot, 5)}
            color="#6200ee"
            isLarge
          />
          
          <Divider style={styles.smallDivider} />
          
          <Text style={styles.sectionTitle}>Resistance Levels</Text>
          <View style={styles.levelsContainer}>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>R1</Text>
              <Text style={styles.levelValue}>{formatNumber(resistance[0], 5)}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>R2</Text>
              <Text style={styles.levelValue}>{formatNumber(resistance[1], 5)}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>R3</Text>
              <Text style={styles.levelValue}>{formatNumber(resistance[2], 5)}</Text>
            </View>
          </View>
          
          <Divider style={styles.smallDivider} />
          
          <Text style={styles.sectionTitle}>Support Levels</Text>
          <View style={styles.levelsContainer}>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>S1</Text>
              <Text style={styles.levelValue}>{formatNumber(support[0], 5)}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>S2</Text>
              <Text style={styles.levelValue}>{formatNumber(support[1], 5)}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>S3</Text>
              <Text style={styles.levelValue}>{formatNumber(support[2], 5)}</Text>
            </View>
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
  smallDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
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
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelLabel: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  levelValue: {
    color: '#fff',
  },
});