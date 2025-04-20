import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';

interface CalculatorCardProps {
  title: string;
  children: React.ReactNode;
}

export default function CalculatorCard({ title, children }: CalculatorCardProps) {
  const { isDark } = useTheme();
  
  return (
    <Surface 
      style={[
        styles.card, 
        { 
          backgroundColor: isDark ? '#1E1E1E' : '#ffffff',
          elevation: isDark ? 4 : 2,
        }
      ]}
    >
      <View 
        style={[
          styles.titleContainer, 
          { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }
        ]}
      >
        <Text variant="titleLarge">
          {title}
        </Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    padding: 16,
  },
});
