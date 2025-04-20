import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { useExchangeRates } from '../../contexts/ExchangeRateContext';
import { CURRENCY_PAIRS } from '../../constants/currencies';

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
