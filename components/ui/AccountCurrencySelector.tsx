import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

interface AccountCurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AccountCurrencySelector({ value, onChange }: AccountCurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'US Dollar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'British Pound (GBP)', value: 'GBP' },
    { label: 'Japanese Yen (JPY)', value: 'JPY' },
    { label: 'Swiss Franc (CHF)', value: 'CHF' },
    { label: 'Australian Dollar (AUD)', value: 'AUD' },
    { label: 'Canadian Dollar (CAD)', value: 'CAD' },
    { label: 'New Zealand Dollar (NZD)', value: 'NZD' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account Currency</Text>
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
        zIndex={3000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 3000,
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