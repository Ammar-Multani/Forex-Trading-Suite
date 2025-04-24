import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { fetchExchangeRate, fetchAllRequiredRates } from "../utils/api";
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
  // Track which currency pairs have been loaded to avoid redundant fetches
  const [loadedPairs, setLoadedPairs] = useState<Set<string>>(new Set());
  // Track pending pairs to load
  const [pendingPairs, setPendingPairs] = useState<Set<string>>(new Set());
  // Debounce timer to batch multiple requests
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Function to get exchange rate between two currencies
  const getExchangeRate = async (
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> => {
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
      setError(null);
      const rate = await fetchExchangeRate(fromCurrency, toCurrency);

      // Update rates cache
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
  };

  // Function to load specific currency pairs - now adds to a queue
  const loadCurrencyPairs = async (pairs: string[]) => {
    if (pairs.length === 0) return;

    // Filter out pairs that are already loaded or pending
    const newPairs = pairs.filter(
      (pair) => !loadedPairs.has(pair) && !pendingPairs.has(pair)
    );

    if (newPairs.length === 0) return;

    // Add to pending pairs
    setPendingPairs((prev) => {
      const newSet = new Set(prev);
      newPairs.forEach((pair) => newSet.add(pair));
      return newSet;
    });

    // Debounce to batch requests
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      fetchPendingPairs();
    }, 300); // 300ms debounce

    setDebounceTimer(timer);
  };

  // Function to fetch all pending pairs
  const fetchPendingPairs = async () => {
    if (pendingPairs.size === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert pending pairs to array
      const pairsToLoad = Array.from(pendingPairs);

      // Essential base currencies for cross rates
      const baseCurrencies = ["USD", "EUR", "GBP"];

      // Fetch all required rates in one operation
      const { crossRates, forexPairs } = await fetchAllRequiredRates(
        baseCurrencies,
        pairsToLoad
      );

      // Update rates
      setRates((prev) => ({ ...prev, ...crossRates }));

      // Update forex pair rates
      setForexPairRates((prev) => ({ ...prev, ...forexPairs }));

      // Mark as loaded
      setLoadedPairs((prev) => {
        const newSet = new Set(prev);
        pairsToLoad.forEach((pair) => newSet.add(pair));
        return newSet;
      });

      // Clear pending pairs
      setPendingPairs(new Set());

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
  };

  // Function to refresh rates - now uses the unified API call
  const refreshRates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Essential base currencies
      const baseCurrencies = ["USD", "EUR", "GBP"];

      // Essential forex pairs
      const essentialPairs = [
        "EURUSD",
        "GBPUSD",
        "USDJPY",
        "USDCHF",
        "USDCAD",
        "AUDUSD",
      ];

      // Fetch all in a single operation
      const { crossRates, forexPairs } = await fetchAllRequiredRates(
        baseCurrencies,
        essentialPairs
      );

      // Update rates
      setRates(crossRates);

      // Update forex pair rates
      setForexPairRates((prev) => ({ ...prev, ...forexPairs }));

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
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

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
        loadCurrencyPairs,
        error,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
};
