import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';

interface ResultDisplayProps {
  label: string;
  value: string | number;
  color?: string;
  isLarge?: boolean;
}

export default function ResultDisplay({ 
  label, 
  value, 
  color, 
  isLarge = false 
}: ResultDisplayProps) {
  const { isDark } = useTheme();
  
  // Default color based on theme if not provided
  const textColor = color || (isDark ? '#fff' : '#000');
  const labelColor = isDark ? '#aaa' : '#666';
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Text 
        style={[
          styles.value, 
          { color: textColor }, 
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
