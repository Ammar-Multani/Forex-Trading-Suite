import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { currencyPairs } from '../../utils/calculators';
import { theme } from '../../utils/theme';

interface CurrencyPairSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export default function CurrencyPairSelector({
  value,
  onValueChange,
  label = 'Currency Pair',
}: CurrencyPairSelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(currencyPairs);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const newValue = callback(value);
          if (typeof newValue === 'string') {
            onValueChange(newValue);
          }
        }}
        setItems={setItems}
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropDownContainerStyle={styles.dropdownContainer}
        placeholder="Select currency pair"
        searchable={true}
        searchPlaceholder="Search currency pairs..."
        listMode="SCROLLVIEW"
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    zIndex: 1000,
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  dropdownText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
});