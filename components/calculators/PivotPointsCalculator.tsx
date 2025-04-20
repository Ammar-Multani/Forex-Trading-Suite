import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { TextInput, Divider, Text, SegmentedButtons, IconButton, Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { calculatePivotPoints } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import { useTheme } from '../../contexts/ThemeContext';

// Pivot point methods with descriptions
const PIVOT_METHODS = [
  { 
    value: 'standard', 
    label: 'Standard',
    description: 'Classic formula using (H+L+C)/3 as the pivot point.'
  },
  { 
    value: 'woodie', 
    label: "Woodie's",
    description: 'Gives more weight to the closing price using (H+L+2C)/4.'
  },
  { 
    value: 'camarilla', 
    label: 'Camarilla',
    description: 'Uses Fibonacci-like ratios to calculate support and resistance levels.'
  },
  { 
    value: 'demark', 
    label: 'DeMark',
    description: 'Considers whether the close is above or below the open price.'
  },
];

export default function PivotPointsCalculator() {
  const { isDark } = useTheme();
  
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1900');
  const [closePrice, setClosePrice] = useState('1.1950');
  const [openPrice, setOpenPrice] = useState('1.1920');
  const [method, setMethod] = useState('standard');
  const [showMethodInfo, setShowMethodInfo] = useState(false);
  
  // State for results
  const [pivot, setPivot] = useState(0);
  const [resistance, setResistance] = useState<number[]>([0, 0, 0]);
  const [support, setSupport] = useState<number[]>([0, 0, 0]);
  
  // Animation for pivot point highlight
  const pivotHighlight = useRef(new Animated.Value(0)).current;
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, openPrice, method]);
  
  // Animate pivot highlight when it changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(pivotHighlight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(pivotHighlight, {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
      }),
    ]).start();
  }, [pivot]);
  
  const calculateResults = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;
    const open = parseFloat(openPrice) || 0;
    
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
  
  const getMethodDescription = () => {
    return PIVOT_METHODS.find(m => m.value === method)?.description || '';
  };
  
  const highlightColor = pivotHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.1)', 
                  isDark ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.3)'],
  });
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Pivot Points Calculator">
        <ScrollView style={styles.scrollView}>
          <View style={styles.inputsContainer}>
            <View style={styles.priceInputsContainer}>
              <TextInput
                label="High"
                value={highPrice}
                onChangeText={setHighPrice}
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
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
                label="Low"
                value={lowPrice}
                onChangeText={setLowPrice}
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
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
            
            <View style={styles.priceInputsContainer}>
              <TextInput
                label="Close"
                value={closePrice}
                onChangeText={setClosePrice}
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
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
              
              {method === 'demark' && (
                <TextInput
                  label="Open"
                  value={openPrice}
                  onChangeText={setOpenPrice}
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1 }]}
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
              )}
            </View>
            
            <View style={styles.methodContainer}>
              <View style={styles.methodHeader}>
                <Text variant="bodySmall" style={{ marginBottom: 8, color: isDark ? '#aaa' : '#666' }}>
                  Calculation Method
                </Text>
                <TouchableOpacity onPress={() => setShowMethodInfo(!showMethodInfo)}>
                  <Ionicons 
                    name={showMethodInfo ? "information-circle" : "information-circle-outline"} 
                    size={20} 
                    color="#6200ee" 
                  />
                </TouchableOpacity>
              </View>
              
              <SegmentedButtons
                value={method}
                onValueChange={setMethod}
                buttons={PIVOT_METHODS.map(m => ({
                  value: m.value,
                  label: m.label,
                  style: { 
                    backgroundColor: method === m.value 
                      ? '#6200ee' 
                      : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                }))}
                style={styles.segmentedButtons}
              />
              
              {showMethodInfo && (
                <View style={[
                  styles.methodInfo, 
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
                ]}>
                  <Text variant="bodySmall" style={{ color: isDark ? '#fff' : '#000' }}>
                    {getMethodDescription()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          
          <View style={styles.resultsContainer}>
            <View style={styles.resultHeader}>
              <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>Results</Text>
              <IconButton
                icon="refresh"
                size={20}
                onPress={calculateResults}
                iconColor={isDark ? '#fff' : '#000'}
              />
            </View>
            
            <Animated.View style={[
              styles.pivotContainer, 
              { 
                backgroundColor: highlightColor,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
              }
            ]}>
              <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>Pivot Point (PP)</Text>
              <Text variant="headlineSmall" style={{ color: '#FFC107', fontWeight: 'bold' }}>
                {formatPrice(pivot)}
              </Text>
            </Animated.View>
            
            <View style={styles.levelsContainer}>
              <Card style={[
                styles.levelCard, 
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
              ]}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: '#F44336' }]}>
                    Resistance
                  </Text>
                  <Divider style={[styles.cardDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
                  
                  {resistance.map((level, index) => (
                    <View key={`r${index + 1}`} style={styles.levelRow}>
                      <Chip 
                        mode="outlined" 
                        style={[
                          styles.levelChip,
                          { borderColor: isDark ? '#444' : '#ddd' }
                        ]}
                      >
                        R{index + 1}
                      </Chip>
                      <Text variant="bodyLarge" style={{ color: '#F44336', fontWeight: 'bold' }}>
                        {formatPrice(level)}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
              
              <Card style={[
                styles.levelCard, 
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
              ]}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: '#4CAF50' }]}>
                    Support
                  </Text>
                  <Divider style={[styles.cardDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
                  
                  {support.map((level, index) => (
                    <View key={`s${index + 1}`} style={styles.levelRow}>
                      <Chip 
                        mode="outlined" 
                        style={[
                          styles.levelChip,
                          { borderColor: isDark ? '#444' : '#ddd' }
                        ]}
                      >
                        S{index + 1}
                      </Chip>
                      <Text variant="bodyLarge" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {formatPrice(level)}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            </View>
            
            <View style={styles.infoContainer}>
              <Chip 
                icon="information" 
                mode="outlined" 
                style={{ borderColor: isDark ? '#444' : '#ddd', marginBottom: 8 }}
                textStyle={{ color: isDark ? '#fff' : '#000' }}
              >
                Based on previous period's price data
              </Chip>
              <Text variant="bodySmall" style={{ color: isDark ? '#aaa' : '#666', textAlign: 'center' }}>
                Pivot points help identify potential support and resistance levels for the current trading period.
              </Text>
            </View>
          </View>
        </ScrollView>
      </CalculatorCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  inputsContainer: {
    marginBottom: 16,
  },
  priceInputsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  methodContainer: {
    marginBottom: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  methodInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pivotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  levelsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  levelCard: {
    flex: 1,
    borderRadius: 8,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cardDivider: {
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelChip: {
    minWidth: 40,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
});