import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ResultDisplayProps {
  label: string;
  value: string | number;
  color?: string;
  isLarge?: boolean;
}

export default function ResultDisplay({ 
  label, 
  value, 
  color = '#fff',
  isLarge = false 
}: ResultDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text 
        style={[
          styles.value, 
          { color }, 
          isLarge && styles.largeValue
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  largeValue: {
    fontSize: 24,
  },
});