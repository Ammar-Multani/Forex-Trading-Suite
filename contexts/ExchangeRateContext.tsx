import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { fetchExchangeRate, fetchAllExchangeRates, fetchForexPairRates, getFallbackRate, getFallbackForexPairRates } from '../utils/api';

interface ExchangeRateContextType {
  getExchangeRate: (fromCurrency: string, toCurrency: string) => Promise<number>;
  rates: Record<string, Record<string, number>>;
  forexPairRates: Record<string, number>;
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextType>({
  getExchangeRate: async () => 1,
  rates: {},
  forexPairRates: {},
  isLoading: false,
  lastUpdated: null,
  refreshRates: async () => {},
});

export const useExchangeRates = () => useContext(ExchangeRateContext);

interface ExchangeRateProviderProps {
  children: ReactNode;
}

export const ExchangeRateProvider: React.FC<ExchangeRateProviderProps> = ({ children }) => {
  const [rates, setRates] = useState<Record<string, Record<string, number>>>({});
  const [forexPairRates, setForexPairRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to get exchange rate between two currencies
  const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
    try {
      // If same currency, return 1
      if (fromCurrency === toCurrency) {
        return 1;
      }

      // Try to get from cached rates first
      if (rates[fromCurrency] && rates[fromCurrency][toCurrency]) {
        return rates[fromCurrency][toCurrency];
      }

      // Fetch from API
      const rate = await fetchExchangeRate(fromCurrency, toCurrency);
      
      // Update rates cache
      setRates(prevRates => ({
        ...prevRates,
        [fromCurrency]: {
          ...(prevRates[fromCurrency] || {}),
          [toCurrency]: rate
        }
      }));
      
      return rate;
    } catch (error) {
      console.error('Error in getExchangeRate:', error);
      
      // Use fallback rate
      return getFallbackRate(fromCurrency, toCurrency);
    }
  };

  // Function to refresh all rates
  const refreshRates = async () => {
    setIsLoading(true);
    
    try {
      // Fetch common currency rates
      const baseCurrencies = ['USD', 'EUR', 'GBP'];
      const newRates: Record<string, Record<string, number>> = {};
      
      for (const base of baseCurrencies) {
        try {
          const currencyRates = await fetchAllExchangeRates(base);
          newRates[base] = currencyRates;
        } catch (error) {
          console.error(`Error fetching rates for ${base}:`, error);
        }
      }
      
      // Fetch forex pair rates
      let pairRates: Record<string, number> = {};
      try {
        pairRates = await fetchForexPairRates();
      } catch (error) {
        console.error('Error fetching forex pair rates:', error);
        pairRates = getFallbackForexPairRates();
      }
      
      setRates(newRates);
      setForexPairRates(pairRates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing rates:', error);
      Alert.alert(
        'Error',
        'Failed to update exchange rates. Using cached or fallback rates.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of rates
  useEffect(() => {
    refreshRates();
    
    // Set up periodic refresh (every 15 minutes)
    const intervalId = setInterval(refreshRates, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ExchangeRateContext.Provider
      value={{
        getExchangeRate,
        rates,
        forexPairRates,
        isLoading,
        lastUpdated,
        refreshRates,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
};