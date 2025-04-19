import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

interface CurrencyPairSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CurrencyPairSelector({ value, onChange }: CurrencyPairSelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
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
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Currency Pair</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={onChange}
        setItems={setItems}
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropDownContainerStyle={styles.dropdownList}
        listMode="SCROLLVIEW"
        searchable={true}
        searchPlaceholder="Search currency pair..."
        zIndex={2000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 2000,
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
  dropdownList: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
  },
});