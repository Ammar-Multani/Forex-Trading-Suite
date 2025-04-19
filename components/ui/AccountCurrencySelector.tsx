import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

// Common account currencies
const ACCOUNT_CURRENCIES = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'JPY (¥)', value: 'JPY' },
  { label: 'CHF (Fr)', value: 'CHF' },
  { label: 'AUD (A$)', value: 'AUD' },
  { label: 'CAD (C$)', value: 'CAD' },
  { label: 'NZD (NZ$)', value: 'NZD' },
];

interface AccountCurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function AccountCurrencySelector({ 
  value, 
  onChange,
  label = 'Account Currency'
}: AccountCurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(ACCOUNT_CURRENCIES);

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
        placeholder="Select account currency"
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropDownContainerStyle={styles.dropdownContainer}
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
});