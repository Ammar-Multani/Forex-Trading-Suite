import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Text, Divider, IconButton, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { calculateFibonacciLevels } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import ResultDisplay from '../ui/ResultDisplay';
import { useTheme } from '../../contexts/ThemeContext';

export default function FibonacciCalculator() {
  // State for inputs
  const [highPrice, setHighPrice] = useState('21');
  const [lowPrice, setLowPrice] = useState('15');
  const [trend, setTrend] = useState('uptrend');
  
  // State for results
  const [retracements, setRetracements] = useState<Array<{ level: number; price: number }>>([]);
  const [extensions, setExtensions] = useState<Array<{ level: number; price: number }>>([]);
  
  const { isDark } = useTheme();
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, trend]);
  
  const calculateResults = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const isUptrend = trend === 'uptrend';
    
    if (high > 0 && low > 0) {
      const { retracements: retLevels, extensions: extLevels } = calculateFibonacciLevels(
        high,
        low,
        isUptrend
      );
      
      setRetracements(retLevels);
      setExtensions(extLevels);
    }
  };
  
  const formatPrice = (price: number) => {
    // Format with 5 decimal places, but remove trailing zeros
    return price.toFixed(5).replace(/\.?0+$/, '');
  };
  
  const copyToClipboard = (text: string) => {
    // In a real app, you would use Clipboard.setString(text)
    console.log('Copied to clipboard:', text);
    // Show a toast or some feedback
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Fibonacci Calculator">
        <View style={styles.inputsContainer}>
          <TextInput
            label="High price"
            value={highPrice}
            onChangeText={setHighPrice}
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
          
          <TextInput
            label="Low price"
            value={lowPrice}
            onChangeText={setLowPrice}
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
          
          <Text variant="bodySmall" style={{ marginBottom: 8 }}>Trend</Text>
          <SegmentedButtons
            value={trend}
            onValueChange={setTrend}
            buttons={[
              {
                value: 'uptrend',
                label: 'Up',
                style: { 
                  backgroundColor: trend === 'uptrend' 
                    ? '#6200ee' 
                    : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }
              },
              {
                value: 'downtrend',
                label: 'Short',
                style: { 
                  backgroundColor: trend === 'downtrend' 
                    ? '#6200ee' 
                    : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }
              },
            ]}
            style={styles.segmentedButtons}
          />
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
          
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#666' }]}>Retracement</Text>
          
          <ScrollView style={styles.levelsContainer}>
            {retracements.filter(level => level.level > 0 && level.level < 100).map((level, index) => (
              <View key={`ret-${index}`} style={styles.levelRow}>
                <Text variant="bodyLarge" style={styles.levelPercent}>{level.level.toFixed(1)}%</Text>
                <View style={styles.priceContainer}>
                  <Text variant="bodyLarge" style={{ color: isDark ? '#fff' : '#000' }}>
                    {formatPrice(level.price)}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(level.price.toString())}>
                    <Ionicons name="copy-outline" size={18} color={isDark ? '#aaa' : '#666'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#666', marginTop: 16 }]}>Extension</Text>
          
          <ScrollView style={styles.levelsContainer}>
            {extensions.map((level, index) => (
              <View key={`ext-${index}`} style={styles.levelRow}>
                <Text variant="bodyLarge" style={styles.levelPercent}>{level.level.toFixed(1)}%</Text>
                <View style={styles.priceContainer}>
                  <Text variant="bodyLarge" style={{ color: isDark ? '#fff' : '#000' }}>
                    {formatPrice(level.price)}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(level.price.toString())}>
                    <Ionicons name="copy-outline" size={18} color={isDark ? '#aaa' : '#666'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
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
  },
  segmentedButtons: {
    marginBottom: 16,
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
  sectionTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  levelsContainer: {
    maxHeight: 200,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelPercent: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});