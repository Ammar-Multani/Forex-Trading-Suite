import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Divider, Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { calculatePivotPoints } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';

export default function PivotPointsCalculator() {
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1900');
  const [closePrice, setClosePrice] = useState('1.1950');
  
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
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;
    
    if (high > 0 && low > 0 && close > 0) {
      const result = calculatePivotPoints(
        high,
        low,
        close,
        method as 'standard' | 'woodie' | 'camarilla' | 'demark'
      );
      
      setPivot(result.pivot);
      setResistance(result.resistance);
      setSupport(result.support);
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toFixed(5);
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
          <View style={styles.pivotContainer}>
            <Text style={styles.sectionTitle}>Pivot Point</Text>
            <Text style={styles.pivotValue}>{formatPrice(pivot)}</Text>
          </View>
          
          <View style={styles.levelsContainer}>
            <View style={styles.levelColumn}>
              <Text style={styles.columnTitle}>Resistance</Text>
              {resistance.map((level, index) => (
                <View key={`r${index + 1}`} style={styles.levelRow}>
                  <Text style={styles.levelLabel}>{`R${index + 1}`}</Text>
                  <Text style={[styles.levelValue, { color: '#FF5252' }]}>
                    {formatPrice(level)}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.levelColumn}>
              <Text style={styles.columnTitle}>Support</Text>
              {support.map((level, index) => (
                <View key={`s${index + 1}`} style={styles.levelRow}>
                  <Text style={styles.levelLabel}>{`S${index + 1}`}</Text>
                  <Text style={[styles.levelValue, { color: '#4CAF50' }]}>
                    {formatPrice(level)}
                  </Text>
                </View>
              ))}
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
  resultsContainer: {
    marginTop: 8,
  },
  pivotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  pivotValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#aaa',
    marginBottom: 8,
    textAlign: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelLabel: {
    fontWeight: 'bold',
    color: '#fff',
  },
  levelValue: {
    fontWeight: 'bold',
  },
});