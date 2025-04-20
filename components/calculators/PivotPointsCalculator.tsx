import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { TextInput, Divider, Text, IconButton, SegmentedButtons, Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { calculatePivotPoints } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import { useTheme } from '../../contexts/ThemeContext';

// Method descriptions for info tooltips
const METHOD_DESCRIPTIONS = {
  standard: 'The Standard method uses the previous period\'s high, low, and close to calculate pivot points. It is the most commonly used method.',
  woodie: 'Woodie\'s method places more emphasis on the closing price, giving it twice the weight of the high and low prices.',
  camarilla: 'Camarilla pivot points use more complex calculations to create tighter levels that are closer to the previous close.',
  demark: 'DeMark\'s method considers whether the close was higher or lower than the open, creating asymmetric support and resistance levels.'
};

export default function PivotPointsCalculator() {
  const { isDark } = useTheme();
  
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1900');
  const [closePrice, setClosePrice] = useState('1.1950');
  const [openPrice, setOpenPrice] = useState('1.1920'); // Only used for DeMark method
  
  // State for method selection
  const [method, setMethod] = useState('standard');
  const [showMethodInfo, setShowMethodInfo] = useState(false);
  
  // State for results
  const [pivot, setPivot] = useState(0);
  const [resistance, setResistance] = useState<number[]>([0, 0, 0]);
  const [support, setSupport] = useState<number[]>([0, 0, 0]);
  
  // Animation for method info
  const infoOpacity = useRef(new Animated.Value(0)).current;
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, openPrice, method]);
  
  // Animation for method info
  useEffect(() => {
    Animated.timing(infoOpacity, {
      toValue: showMethodInfo ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMethodInfo]);
  
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
    // Format with 5 decimal places, but remove trailing zeros
    return price.toFixed(5).replace(/\.?0+$/, '');
  };
  
  const toggleMethodInfo = () => {
    setShowMethodInfo(!showMethodInfo);
  };
  
  const copyToClipboard = (text: string) => {
    // In a real app, you would use Clipboard.setString(text)
    console.log('Copied to clipboard:', text);
    // Show a toast or some feedback
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Pivot Points Calculator">
        <ScrollView style={styles.scrollView}>
          <View style={styles.methodContainer}>
            <View style={styles.methodHeader}>
              <Text variant="bodyMedium" style={{ color: isDark ? '#aaa' : '#666' }}>Calculation Method</Text>
              <IconButton
                icon="information-outline"
                size={20}
                onPress={toggleMethodInfo}
                iconColor="#6200ee"
              />
            </View>
            
            <SegmentedButtons
              value={method}
              onValueChange={setMethod}
              buttons={[
                {
                  value: 'standard',
                  label: 'Standard',
                  style: { 
                    backgroundColor: method === 'standard' 
                      ? '#6200ee' 
                      : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                },
                {
                  value: 'woodie',
                  label: 'Woodie',
                  style: { 
                    backgroundColor: method === 'woodie' 
                      ? '#6200ee' 
                      : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                },
                {
                  value: 'camarilla',
                  label: 'Camarilla',
                  style: { 
                    backgroundColor: method === 'camarilla' 
                      ? '#6200ee' 
                      : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                },
                {
                  value: 'demark',
                  label: 'DeMark',
                  style: { 
                    backgroundColor: method === 'demark' 
                      ? '#6200ee' 
                      : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                },
              ]}
              style={styles.segmentedButtons}
            />
            
            <Animated.View 
              style={[
                styles.methodInfo, 
                { 
                  opacity: infoOpacity,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  display: showMethodInfo ? 'flex' : 'none'
                }
              ]}
            >
              <Text style={{ color: isDark ? '#fff' : '#000' }}>
                {METHOD_DESCRIPTIONS[method as keyof typeof METHOD_DESCRIPTIONS]}
              </Text>
            </Animated.View>
          </View>
          
          <View style={styles.inputsContainer}>
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
              Previous Period Data
            </Text>
            
            <View style={styles.priceInputsRow}>
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
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
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
            
            <View style={styles.priceInputsRow}>
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
                  style={[styles.input, { flex: 1, marginLeft: 8 }]}
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
            
            <View style={styles.chipContainer}>
              <Chip 
                icon="information" 
                mode="outlined" 
                style={{ borderColor: isDark ? '#444' : '#ddd' }}
                textStyle={{ color: isDark ? '#fff' : '#000' }}
              >
                {method === 'demark' ? 'DeMark requires Open price' : 'Using previous period data'}
              </Chip>
            </View>
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>Pivot Points</Text>
              <IconButton
                icon="refresh"
                size={20}
                onPress={calculateResults}
                iconColor={isDark ? '#fff' : '#000'}
              />
            </View>
            
            <Card style={[styles.pivotCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <Card.Content style={styles.pivotCardContent}>
                <Text variant="bodyMedium" style={{ color: isDark ? '#aaa' : '#666' }}>Pivot Point (PP)</Text>
                <View style={styles.pivotValueContainer}>
                  <Text variant="headlineSmall" style={{ color: '#FFC107', fontWeight: 'bold' }}>
                    {formatPrice(pivot)}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(pivot.toString())}>
                    <Ionicons name="copy-outline" size={18} color={isDark ? '#aaa' : '#666'} />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
            
            <View style={styles.levelsContainer}>
              <View style={styles.levelColumn}>
                <Text variant="titleSmall" style={[styles.columnTitle, { color: isDark ? '#aaa' : '#666' }]}>
                  Resistance Levels
                </Text>
                
                {resistance.map((level, index) => (
                  <Card 
                    key={`r${index + 1}`} 
                    style={[
                      styles.levelCard, 
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
                    ]}
                  >
                    <Card.Content style={styles.levelCardContent}>
                      <View style={styles.levelLabelContainer}>
                        <Ionicons name="arrow-up" size={16} color="#FF5252" />
                        <Text variant="bodyMedium" style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>
                          R{index + 1}
                        </Text>
                      </View>
                      <View style={styles.levelValueContainer}>
                        <Text variant="bodyLarge" style={{ color: '#FF5252', fontWeight: 'bold' }}>
                          {formatPrice(level)}
                        </Text>
                        <TouchableOpacity onPress={() => copyToClipboard(level.toString())}>
                          <Ionicons name="copy-outline" size={16} color={isDark ? '#aaa' : '#666'} />
                        </TouchableOpacity>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
              
              <View style={styles.levelColumn}>
                <Text variant="titleSmall" style={[styles.columnTitle, { color: isDark ? '#aaa' : '#666' }]}>
                  Support Levels
                </Text>
                
                {support.map((level, index) => (
                  <Card 
                    key={`s${index + 1}`} 
                    style={[
                      styles.levelCard, 
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
                    ]}
                  >
                    <Card.Content style={styles.levelCardContent}>
                      <View style={styles.levelLabelContainer}>
                        <Ionicons name="arrow-down" size={16} color="#4CAF50" />
                        <Text variant="bodyMedium" style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>
                          S{index + 1}
                        </Text>
                      </View>
                      <View style={styles.levelValueContainer}>
                        <Text variant="bodyLarge" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {formatPrice(level)}
                        </Text>
                        <TouchableOpacity onPress={() => copyToClipboard(level.toString())}>
                          <Ionicons name="copy-outline" size={16} color={isDark ? '#aaa' : '#666'} />
                        </TouchableOpacity>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </View>
            
            <View style={styles.infoContainer}>
              <Text variant="bodySmall" style={{ color: isDark ? '#aaa' : '#666', textAlign: 'center' }}>
                Tap on any value to copy it to clipboard. Pivot points are calculated based on the previous period's data.
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
  methodContainer: {
    marginBottom: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  methodInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  inputsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  priceInputsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
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
  pivotCard: {
    marginBottom: 16,
  },
  pivotCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pivotValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  levelColumn: {
    flex: 1,
  },
  columnTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  levelCard: {
    marginBottom: 8,
  },
  levelCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  levelLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});