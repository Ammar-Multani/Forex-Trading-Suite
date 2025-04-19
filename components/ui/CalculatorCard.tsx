import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';

interface CalculatorCardProps {
  title: string;
  children: React.ReactNode;
}

export default function CalculatorCard({ title, children }: CalculatorCardProps) {
  return (
    <Surface style={styles.card}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
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
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  titleContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
});