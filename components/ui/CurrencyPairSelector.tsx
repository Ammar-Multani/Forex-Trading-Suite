import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { useExchangeRates } from '../../contexts/ExchangeRateContext';
import { CURRENCY_PAIRS } from '../../constants/currencies';
import { useTheme } from '../../contexts/ThemeContext';

interface CurrencyPairSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CurrencyPairSelector({ value, onChange }: CurrencyPairSelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    CURRENCY_PAIRS.map(pair => ({ label: pair, value: pair }))
  );
  
  const { forexPairRates } = useExchangeRates();
  const { isDark } = useTheme();
  
  useEffect(() => {
    if (Object.keys(forexPairRates).length > 0) {
      const updatedItems = CURRENCY_PAIRS.map(pair => {
        const rate = forexPairRates[pair];
        const label = rate ? `${pair} (${rate.toFixed(4)})` : pair;
        return { label, value: pair };
      });
      setItems(updatedItems);
    }
  }, [forexPairRates]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#aaa' : '#666' }]}>Currency Pair</Text>
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
    marginBottom: 8,
  },
  dropdown: {
    borderRadius: 8,
  },
  dropdownText: {
  },
  dropdownList: {
  },
});
