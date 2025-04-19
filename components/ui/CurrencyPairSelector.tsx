import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

// Common currency pairs
const CURRENCY_PAIRS = [
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'USD/CHF', value: 'USD/CHF' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'NZD/USD', value: 'NZD/USD' },
  { label: 'EUR/GBP', value: 'EUR/GBP' },
  { label: 'EUR/JPY', value: 'EUR/JPY' },
  { label: 'GBP/JPY', value: 'GBP/JPY' },
];

interface CurrencyPairSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function CurrencyPairSelector({ 
  value, 
  onChange,
  label = 'Currency Pair'
}: CurrencyPairSelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(CURRENCY_PAIRS);

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
            onChange(newValue);
          }
        }}
        setItems={setItems}
        searchable={true}
        placeholder="Select a currency pair"
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropDownContainerStyle={styles.dropdownContainer}
        searchContainerStyle={styles.searchContainer}
        searchTextInputStyle={styles.searchInput}
        listMode="SCROLLVIEW"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1000,
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
    borderRadius: 8,
  },
  dropdownText: {
    color: '#fff',
  },
  dropdownContainer: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
  },
  searchContainer: {
    backgroundColor: '#2A2A2A',
    borderBottomColor: '#444',
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#444',
  },
});