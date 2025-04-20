import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchExchangeRate, fetchAllExchangeRates, getForexPairRates, loadCachedRates } from '../utils/api';
import { CURRENCY_PAIRS, formatPairForApi, parseCurrencyPair } from '../constants/currencies';

interface ExchangeRateContextType {
  isLoading: boolean;
  error: string | null;
  forexPairRates: Record<string, number>;
  getExchangeRate: (fromCurrency: string, toCurrency: string) => Promise<number>;
  refreshRates: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export const ExchangeRateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forexPairRates, setForexPairRates] = useState<Record<string, number>>({});

  // Load cached rates and fetch fresh rates on app start
  useEffect(() => {
    const initializeRates = async () => {
      try {
        // Load cached rates first
        await loadCachedRates();
        
        // Then fetch fresh rates
        await refreshRates();
      } catch (err) {
        console.error('Error initializing exchange rates:', err);
        setError('Failed to load exchange rates. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeRates();
  }, []);

  // Function to refresh all rates
  const refreshRates = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const rates = await getForexPairRates();
      
      // Format rates for display (e.g., "EURUSD" -> "EUR/USD")
      const formattedRates: Record<string, number> = {};
      
      Object.entries(rates).forEach(([pair, rate]) => {
        const formattedPair = `${pair.substring(0, 3)}/${pair.substring(3, 6)}`;
        formattedRates[formattedPair] = rate;
      });
      
      setForexPairRates(formattedRates);
    } catch (err: any) {
      console.error('Error refreshing rates:', err);
      setError(err.message || 'Failed to refresh exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get a specific exchange rate
  const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
    try {
      return await fetchExchangeRate(fromCurrency, toCurrency);
    } catch (err: any) {
      console.error('Error getting exchange rate:', err);
      setError(err.message || 'Failed to get exchange rate');
      throw err;
    }
  };

  const value = {
    isLoading,
    error,
    forexPairRates,
    getExchangeRate,
    refreshRates,
  };

  return (
    <ExchangeRateContext.Provider value={value}>
      {children}
    </ExchangeRateContext.Provider>
  );
};

// Custom hook to use the exchange rate context
export const useExchangeRates = (): ExchangeRateContextType => {
  const context = useContext(ExchangeRateContext);
  if (context === undefined) {
    throw new Error('useExchangeRates must be used within an ExchangeRateProvider');
  }
  return context;
};