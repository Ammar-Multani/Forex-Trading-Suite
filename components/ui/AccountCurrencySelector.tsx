import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from '../../contexts/ThemeContext';

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
  
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={{ marginBottom: 8 }}>Account Currency</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={onChange}
        setItems={setItems}
        style={[
          styles.dropdown, 
          { 
            backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
            borderColor: isDark ? '#444' : '#ddd',
          }
        ]}
        textStyle={[
          styles.dropdownText,
          { color: isDark ? '#fff' : '#000' }
        ]}
        dropDownContainerStyle={[
          styles.dropdownList,
          {
            backgroundColor: isDark ? '#2A2A2A' : '#f5f5f5',
            borderColor: isDark ? '#444' : '#ddd',
          }
        ]}
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
  dropdown: {
    borderRadius: 8,
  },
  dropdownText: {
  },
  dropdownList: {
  },
});
