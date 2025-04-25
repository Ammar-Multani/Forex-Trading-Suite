import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { Alert } from "react-native";
import {
  fetchExchangeRate,
  fetchAllRequiredRates,
  apiManager,
} from "../services/api";
import { CURRENCY_PAIRS } from "../constants/currencies";

interface ExchangeRateContextType {
  getExchangeRate: (
    fromCurrency: string,
    toCurrency: string
  ) => Promise<number>;
  rates: Record<string, Record<string, number>>;
  forexPairRates: Record<string, number>;
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
  loadCurrencyPairs: (pairs: string[]) => Promise<void>;
  error: string | null;
}

const ExchangeRateContext = createContext<ExchangeRateContextType>({
  getExchangeRate: async () => 1,
  rates: {},
  forexPairRates: {},
  isLoading: false,
  lastUpdated: null,
  refreshRates: async () => {},
  loadCurrencyPairs: async () => {},
  error: null,
});

export const useExchangeRates = () => useContext(ExchangeRateContext);

interface ExchangeRateProviderProps {
  children: ReactNode;
}

export const ExchangeRateProvider: React.FC<ExchangeRateProviderProps> = ({
  children,
}) => {
  const [rates, setRates] = useState<Record<string, Record<string, number>>>(
    {}
  );
  const [forexPairRates, setForexPairRates] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPairs, setLoadedPairs] = useState<Set<string>>(new Set());

  // Component ID for ApiManager registration
  const componentId = useRef(`exchange-rate-provider-${Date.now()}`).current;

  // Function to get exchange rate between two currencies
  const getExchangeRate = useCallback(
    async (fromCurrency: string, toCurrency: string): Promise<number> => {
      try {
        // If same currency, return 1
        if (fromCurrency === toCurrency) {
          return 1;
        }

        // Try to get from cached rates first
        if (rates[fromCurrency] && rates[fromCurrency][toCurrency]) {
          return rates[fromCurrency][toCurrency];
        }

        // Use the ApiManager to fetch the rate
        setError(null);
        const rate = await apiManager.requestCurrencyPair(
          fromCurrency,
          toCurrency
        );

        // Update our local cache state
        setRates((prevRates) => ({
          ...prevRates,
          [fromCurrency]: {
            ...(prevRates[fromCurrency] || {}),
            [toCurrency]: rate,
          },
        }));

        return rate;
      } catch (error) {
        console.error("Error in getExchangeRate:", error);
        const errorMessage = `Unable to get exchange rate for ${fromCurrency}/${toCurrency}. Please try again later.`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [rates]
  );

  // Function to load specific currency pairs - using ApiManager for batching
  const loadCurrencyPairs = useCallback(
    async (pairs: string[]) => {
      if (pairs.length === 0) return;

      // Filter out pairs that are already loaded
      const newPairs = pairs.filter((pair) => !loadedPairs.has(pair));
      if (newPairs.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        // Format pairs for ApiManager
        const parsedPairs = newPairs.map((pair) => ({
          base: pair.substring(0, 3),
          quote: pair.substring(3, 6),
        }));

        // Request all pairs at once through ApiManager
        const newRates = await apiManager.requestMultiplePairs(parsedPairs);

        // Update forex pair rates
        setForexPairRates((prev) => ({ ...prev, ...newRates }));

        // Mark pairs as loaded
        setLoadedPairs((prev) => {
          const newSet = new Set(prev);
          newPairs.forEach((pair) => newSet.add(pair));
          return newSet;
        });

        // Update last updated timestamp
        setLastUpdated(new Date());
      } catch (error: any) {
        console.error("Error loading currency pairs:", error);
        const errorMessage =
          error.message ||
          "Failed to load currency pairs. Please check your internet connection and try again.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [loadedPairs]
  );

  // Function to refresh rates using ApiManager
  const refreshRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use ApiManager to refresh all rates at once
      await apiManager.refreshAllRates();

      // We need to refresh our local state after the global refresh
      // First, reload the essential forex pairs
      const essentialPairs = [
        "EURUSD",
        "GBPUSD",
        "USDJPY",
        "USDCHF",
        "USDCAD",
        "AUDUSD",
      ];

      // Format pairs for ApiManager
      const parsedPairs = essentialPairs.map((pair) => ({
        base: pair.substring(0, 3),
        quote: pair.substring(3, 6),
      }));

      // Get the latest rates from ApiManager
      const newRates = await apiManager.requestMultiplePairs(parsedPairs);

      // Update our local state
      setForexPairRates((prev) => ({ ...prev, ...newRates }));

      // Update cross rates for USD, EUR, GBP
      const baseCurrencies = ["USD", "EUR", "GBP"];
      const crossRates: Record<string, Record<string, number>> = {};

      for (const base of baseCurrencies) {
        crossRates[base] = {};
        for (const quote of baseCurrencies) {
          if (base !== quote) {
            crossRates[base][quote] = await apiManager.requestCurrencyPair(
              base,
              quote
            );
          }
        }
      }

      // Update rates
      setRates((prev) => ({ ...prev, ...crossRates }));

      // Mark pairs as loaded
      setLoadedPairs((prev) => {
        const newSet = new Set(prev);
        essentialPairs.forEach((pair) => newSet.add(pair));
        return newSet;
      });

      // Update last updated timestamp
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Error refreshing rates:", error);
      const errorMessage =
        error.message ||
        "Failed to update exchange rates. Please check your internet connection and try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register with ApiManager when the context is mounted
  useEffect(() => {
    apiManager.registerComponent(componentId);

    // Clean up on unmount
    return () => {
      apiManager.unregisterComponent(componentId);
    };
  }, [componentId]);

  // Initial load
  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  return (
    <ExchangeRateContext.Provider
      value={{
        getExchangeRate,
        rates,
        forexPairRates,
        isLoading,
        lastUpdated,
        refreshRates,
        loadCurrencyPairs,
        error,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
};
