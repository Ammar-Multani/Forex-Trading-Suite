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
  
  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={{ color: isDark ? '#aaa' : '#666' }}>{label}</Text>
      <Text 
        variant={isLarge ? "titleLarge" : "titleMedium"}
        style={{ color: textColor }}
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
});
