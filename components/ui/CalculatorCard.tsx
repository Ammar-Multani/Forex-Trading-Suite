import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../utils/theme';

interface CalculatorCardProps {
  title: string;
  children: React.ReactNode;
  gradientColors?: string[];
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export default function CalculatorCard({
  title,
  children,
  gradientColors = ['#4158D0', '#C850C0'],
  style,
  titleStyle,
}: CalculatorCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Card.Title
          title={title}
          titleStyle={[styles.title, titleStyle]}
          titleVariant="titleLarge"
        />
      </LinearGradient>
      <Card.Content style={styles.content}>
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  headerGradient: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    paddingVertical: theme.spacing.md,
  },
});