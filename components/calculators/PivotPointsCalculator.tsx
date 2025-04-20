import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Text, Divider, IconButton, Chip, SegmentedButtons, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { calculatePivotPoints } from '../../utils/calculators';
import CalculatorCard from '../ui/CalculatorCard';
import { useTheme } from '../../contexts/ThemeContext';

type PivotMethod = 'standard' | 'woodie' | 'camarilla' | 'demark';

// Method descriptions for information
const METHOD_INFO = {
  standard: 'Classic formula using (H+L+C)/3 as the pivot point.',
  woodie: 'Gives more weight to the closing price with (H+L+2C)/4.',
  camarilla: 'Uses more levels with tighter ranges for day trading.',
  demark: 'Based on whether close is higher or lower than open price.'
};

export default function PivotPointsCalculator() {
  const { isDark } = useTheme();
  
  // State for inputs
  const [highPrice, setHighPrice] = useState('1.2000');
  const [lowPrice, setLowPrice] = useState('1.1900');
  const [closePrice, setClosePrice] = useState('1.1950');
  const [openPrice, setOpenPrice] = useState('1.1920');
  const [method, setMethod] = useState<PivotMethod>('standard');
  const [showMethodInfo, setShowMethodInfo] = useState(false);
  
  // State for results
  const [pivot, setPivot] = useState(0);
  const [resistance, setResistance] = useState<number[]>([0, 0, 0, 0]);
  const [support, setSupport] = useState<number[]>([0, 0, 0, 0]);
  
  // History of calculations
  const [history, setHistory] = useState<Array<{
    method: PivotMethod;
    high: string;
    low: string;
    close: string;
    pivot: number;
    timestamp: Date;
  }>>([]);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [highPrice, lowPrice, closePrice, openPrice, method]);
  
  const calculateResults = useCallback(() => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;
    const open = parseFloat(openPrice) || 0;
    
    if (high > 0 && low > 0 && close > 0) {
      const result = calculatePivotPoints(high, low, close, method, open);
      
      setPivot(result.pivot);
      setResistance(result.resistance);
      setSupport(result.support);
    }
  }, [highPrice, lowPrice, closePrice, openPrice, method]);
  
  const saveToHistory = () => {
    const newEntry = {
      method,
      high: highPrice,
      low: lowPrice,
      close: closePrice,
      pivot,
      timestamp: new Date()
    };
    
    setHistory(prev => [newEntry, ...prev].slice(0, 5)); // Keep last 5 entries
  };
  
  const clearHistory = () => {
    setHistory([]);
  };
  
  const formatPrice = (price: number) => {
    // Format with 5 decimal places, but remove trailing zeros
    return price.toFixed(5).replace(/\.?0+$/, '');
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const copyToClipboard = (text: string) => {
    // In a real app, you would use Clipboard.setString(text)
    console.log('Copied to clipboard:', text);
    // Show a toast or some feedback
  };
  
  const getMethodLabel = (methodName: PivotMethod) => {
    switch (methodName) {
      case 'standard': return 'Standard';
      case 'woodie': return "Woodie's";
      case 'camarilla': return 'Camarilla';
      case 'demark': return 'DeMark';
      default: return methodName;
    }
  };
  
  return (
    <View style={styles.container}>
      <CalculatorCard title="Pivot Points Calculator">
        <ScrollView style={styles.scrollView}>
          <View style={styles.methodSelectorContainer}>
            <View style={styles.methodHeader}>
              <Text variant="bodySmall" style={{ marginBottom: 8, color: isDark ? '#aaa' : '#666' }}>
                Calculation Method
              </Text>
              <IconButton
                icon="information-outline"
                size={20}
                onPress={() => setShowMethodInfo(!showMethodInfo)}
                iconColor={isDark ? '#fff' : '#000'}
              />
            </View>
            
            <SegmentedButtons
              value={method}
              onValueChange={(value) => setMethod(value as PivotMethod)}
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
                  label: "Woodie's",
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
            
            {showMethodInfo && (
              <View style={[
                styles.methodInfoContainer, 
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
              ]}>
                <Text variant="bodySmall" style={{ color: isDark ? '#fff' : '#000' }}>
                  {METHOD_INFO[method]}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.inputsContainer}>
            <View style={styles.inputRow}>
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
            
            <View style={styles.inputRow}>
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
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>Results</Text>
              <View style={styles.resultActions}>
                <IconButton
                  icon="refresh"
                  size={20}
                  onPress={calculateResults}
                  iconColor={isDark ? '#fff' : '#000'}
                />
                <IconButton
                  icon="content-save"
                  size={20}
                  onPress={saveToHistory}
                  iconColor={isDark ? '#fff' : '#000'}
                />
              </View>
            </View>
            
            <View style={[
              styles.pivotContainer, 
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
            ]}>
              <Text variant="bodyMedium" style={{ color: isDark ? '#aaa' : '#666' }}>Pivot Point (PP)</Text>
              <View style={styles.pivotValueContainer}>
                <Text variant="headlineSmall" style={{ color: '#FFC107', fontWeight: 'bold' }}>
                  {formatPrice(pivot)}
                </Text>
                <TouchableOpacity onPress={() => copyToClipboard(pivot.toString())}>
                  <Ionicons name="copy-outline" size={18} color={isDark ? '#aaa' : '#666'} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.levelsContainer}>
              <Card style={[styles.levelCard, { backgroundColor: isDark ? '#1E1E1E' : '#f5f5f5' }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: '#F44336', marginBottom: 12, textAlign: 'center' }}>
                    Resistance
                  </Text>
                  <View style={styles.levelsList}>
                    {resistance.map((level, index) => (
                      level !== 0 && (
                        <View key={`r${index + 1}`} style={styles.levelRow}>
                          <Text variant="bodyMedium" style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>
                            R{index + 1}
                          </Text>
                          <View style={styles.levelValueContainer}>
                            <Text variant="bodyLarge" style={{ color: '#F44336', fontWeight: 'bold' }}>
                              {formatPrice(level)}
                            </Text>
                            <TouchableOpacity onPress={() => copyToClipboard(level.toString())}>
                              <Ionicons name="copy-outline" size={16} color={isDark ? '#aaa' : '#666'} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                    ))}
                  </View>
                </Card.Content>
              </Card>
              
              <Card style={[styles.levelCard, { backgroundColor: isDark ? '#1E1E1E' : '#f5f5f5' }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: '#4CAF50', marginBottom: 12, textAlign: 'center' }}>
                    Support
                  </Text>
                  <View style={styles.levelsList}>
                    {support.map((level, index) => (
                      level !== 0 && (
                        <View key={`s${index + 1}`} style={styles.levelRow}>
                          <Text variant="bodyMedium" style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>
                            S{index + 1}
                          </Text>
                          <View style={styles.levelValueContainer}>
                            <Text variant="bodyLarge" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {formatPrice(level)}
                            </Text>
                            <TouchableOpacity onPress={() => copyToClipboard(level.toString())}>
                              <Ionicons name="copy-outline" size={16} color={isDark ? '#aaa' : '#666'} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </View>
            
            <View style={styles.infoContainer}>
              <Chip 
                icon="information" 
                mode="outlined" 
                style={{ borderColor: isDark ? '#444' : '#ddd' }}
                textStyle={{ color: isDark ? '#fff' : '#000' }}
              >
                Tap any value to copy to clipboard
              </Chip>
            </View>
          </View>
          
          {history.length > 0 && (
            <>
              <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
              
              <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                  <Text variant="titleMedium" style={{ color: isDark ? '#fff' : '#000' }}>Recent Calculations</Text>
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={{ color: '#6200ee' }}>Clear</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.historyList}>
                  {history.map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyItemLeft}>
                        <Text variant="bodyMedium" style={{ color: isDark ? '#fff' : '#000' }}>
                          {getMethodLabel(item.method)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: isDark ? '#aaa' : '#666' }}>
                          {formatTime(item.timestamp)}
                        </Text>
                      </View>
                      
                      <View style={styles.historyItemRight}>
                        <Text variant="bodySmall" style={{ color: isDark ? '#aaa' : '#666' }}>
                          H: {item.high} L: {item.low} C: {item.close}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: '#FFC107', fontWeight: 'bold' }}>
                          PP: {formatPrice(item.pivot)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
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
  methodSelectorContainer: {
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
  methodInfoContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  inputsContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
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
  resultActions: {
    flexDirection: 'row',
  },
  pivotContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  pivotValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  levelCard: {
    flex: 1,
  },
  levelsList: {
    gap: 8,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  historyContainer: {
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
});