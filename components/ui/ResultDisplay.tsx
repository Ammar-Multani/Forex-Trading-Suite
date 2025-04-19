import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { theme } from '../../utils/theme';

interface ResultItem {
  label: string;
  value: string | number;
  color?: string;
  isHighlighted?: boolean;
}

interface ResultDisplayProps {
  title?: string;
  results: ResultItem[];
  style?: ViewStyle;
}

export default function ResultDisplay({
  title = 'Results',
  results,
  style,
}: ResultDisplayProps) {
  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Divider style={styles.divider} />
      
      {results.map((item, index) => (
        <View key={index} style={styles.resultRow}>
          <Text style={styles.label}>{item.label}</Text>
          <Text 
            style={[
              styles.value, 
              item.color ? { color: item.color } : null,
              item.isHighlighted ? styles.highlighted : null,
            ]}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.text,
  },
  highlighted: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
  },
});