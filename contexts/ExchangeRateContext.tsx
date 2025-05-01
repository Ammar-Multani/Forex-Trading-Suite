import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Currency, currencies } from "../constants/currencies";

// API constants
const EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/";
const FOREX_API_URL = "https://api.exchangerate-api.com/v4/latest/";

// Storage keys
const EXCHANGE_RATES_STORAGE_KEY = "forex-app-exchange-rates";
const LAST_UPDATED_STORAGE_KEY = "forex-app-rates-last-updated";
const ACCOUNT_CURRENCY_KEY = "forex-trading-suite-account-currency";

// Types
interface ExchangeRates {
  [key: string]: number;
}

interface ForexPairRate {
  pair: string;
  rate: number;
}

interface ExchangeRateContextType {
  rates: ExchangeRates;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  fetchRates: (baseCurrency?: string) => Promise<void>;
  getExchangeRate: (from: string, to: string) => number;
  getForexPairRate: (pair: string) => number;
  accountCurrency: Currency;
  setAccountCurrency: (currency: Currency) => Promise<void>;
}

// Create the context
const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(
  undefined
);

export const useExchangeRates = () => {
  const context = useContext(ExchangeRateContext);
  if (!context) {
    throw new Error(
      "useExchangeRates must be used within an ExchangeRateProvider"
    );
  }
  return context;
};

interface ExchangeRateProviderProps {
  children: ReactNode;
}

export const ExchangeRateProvider: React.FC<ExchangeRateProviderProps> = ({
  children,
}) => {
  // State
  const [rates, setRates] = useState<ExchangeRates>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountCurrency, setAccountCurrencyState] = useState<Currency>(
    currencies.find((c) => c.code === "USD") || currencies[0]
  );

  // Load account currency from storage on mount
  useEffect(() => {
    const loadAccountCurrency = async () => {
      try {
        const storedCurrency = await AsyncStorage.getItem(ACCOUNT_CURRENCY_KEY);
        if (storedCurrency) {
          const parsedCurrency = JSON.parse(storedCurrency) as Currency;
          setAccountCurrencyState(parsedCurrency);
        }
      } catch (error) {
        console.error("Error loading account currency:", error);
      }
    };

    loadAccountCurrency();
  }, []);

  // Save account currency to storage when it changes
  const setAccountCurrency = async (currency: Currency) => {
    try {
      await AsyncStorage.setItem(
        ACCOUNT_CURRENCY_KEY,
        JSON.stringify(currency)
      );
      setAccountCurrencyState(currency);
    } catch (error) {
      console.error("Error saving account currency:", error);
    }
  };

  // Load rates from storage on mount
  useEffect(() => {
    const loadStoredRates = async () => {
      try {
        const storedRates = await AsyncStorage.getItem(
          EXCHANGE_RATES_STORAGE_KEY
        );
        const storedDate = await AsyncStorage.getItem(LAST_UPDATED_STORAGE_KEY);

        if (storedRates && storedDate) {
          setRates(JSON.parse(storedRates));
          setLastUpdated(new Date(storedDate));
        } else {
          // If no stored rates, fetch them
          fetchRates();
        }
      } catch (error) {
        console.error("Error loading stored exchange rates:", error);
        setError("Failed to load stored exchange rates");
      }
    };

    loadStoredRates();
  }, []);

  // Check if we need to refresh rates (if older than 24 hours)
  useEffect(() => {
    if (lastUpdated) {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      const hoursDiff = diff / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        fetchRates();
      }
    }
  }, [lastUpdated]);

  // Fetch rates from API
  const fetchRates = async (baseCurrency = "USD") => {
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      if (Object.keys(rates).length === 0) {
        setError("No internet connection and no cached rates available");
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${EXCHANGE_API_URL}${baseCurrency}`);
      const data = await response.json();

      if (data && data.rates) {
        setRates(data.rates);
        const now = new Date();
        setLastUpdated(now);

        // Save to storage
        await AsyncStorage.setItem(
          EXCHANGE_RATES_STORAGE_KEY,
          JSON.stringify(data.rates)
        );
        await AsyncStorage.setItem(LAST_UPDATED_STORAGE_KEY, now.toISOString());
      } else {
        throw new Error("Invalid response from exchange rate API");
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      setError(
        "Failed to fetch exchange rates. Using cached rates if available."
      );

      // Show alert only if we don't have cached rates
      if (Object.keys(rates).length === 0) {
        Alert.alert(
          "Error",
          "Failed to fetch exchange rates. Check your internet connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get exchange rate between two currencies
  const getExchangeRate = (from: string, to: string): number => {
    if (from === to) return 1;

    if (!rates || Object.keys(rates).length === 0) {
      return 1; // Default if no rates available
    }

    // If base is USD, we can directly access the rates
    if (from === "USD") {
      return rates[to] || 1;
    }

    // If target is USD, we need to invert the rate
    if (to === "USD") {
      return 1 / (rates[from] || 1);
    }

    // For cross rates, convert via USD
    const fromToUSD = 1 / (rates[from] || 1);
    const usdToTarget = rates[to] || 1;

    return fromToUSD * usdToTarget;
  };

  // Get rate for a forex pair (e.g., "EUR/USD")
  const getForexPairRate = (pair: string): number => {
    const [base, quote] = pair.split("/");
    return getExchangeRate(base, quote);
  };

  return (
    <ExchangeRateContext.Provider
      value={{
        rates,
        lastUpdated,
        isLoading,
        error,
        fetchRates,
        getExchangeRate,
        getForexPairRate,
        accountCurrency,
        setAccountCurrency,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
};
