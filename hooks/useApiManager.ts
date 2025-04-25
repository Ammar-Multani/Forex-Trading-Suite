import { useState, useEffect, useRef, useCallback } from "react";
import { apiManager } from "../services/api";

/**
 * Custom hook for using the ApiManager in components
 * Provides a simplified interface for getting exchange rates
 * and manages component registration with ApiManager
 */
export function useApiManager(componentName?: string) {
  // Generate a unique ID for this component instance
  const componentId = useRef(
    `${componentName || "component"}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`
  ).current;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register component with ApiManager
  useEffect(() => {
    apiManager.registerComponent(componentId);

    return () => {
      apiManager.unregisterComponent(componentId);
    };
  }, [componentId]);

  /**
   * Get the exchange rate for a currency pair
   */
  const getExchangeRate = useCallback(
    async (baseCurrency: string, quoteCurrency: string): Promise<number> => {
      if (baseCurrency === quoteCurrency) return 1;

      setIsLoading(true);
      setError(null);

      try {
        const rate = await apiManager.requestCurrencyPair(
          baseCurrency,
          quoteCurrency
        );
        return rate;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch exchange rate";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get multiple exchange rates at once
   */
  const getMultipleRates = useCallback(
    async (
      pairs: Array<{ base: string; quote: string }>
    ): Promise<Record<string, number>> => {
      if (pairs.length === 0) return {};

      setIsLoading(true);
      setError(null);

      try {
        const rates = await apiManager.requestMultiplePairs(pairs);
        return rates;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch exchange rates";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get current exchange rate for a forex pair (e.g., "EURUSD")
   */
  const getForexPairRate = useCallback(
    async (pairString: string): Promise<number> => {
      if (pairString.length !== 6) {
        throw new Error(
          'Invalid forex pair format. Must be exactly 6 characters (e.g., "EURUSD")'
        );
      }

      const baseCurrency = pairString.substring(0, 3);
      const quoteCurrency = pairString.substring(3, 6);

      return getExchangeRate(baseCurrency, quoteCurrency);
    },
    [getExchangeRate]
  );

  /**
   * Manually refresh all exchange rates
   */
  const refreshRates = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiManager.refreshAllRates();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh exchange rates";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getExchangeRate,
    getMultipleRates,
    getForexPairRate,
    refreshRates,
    isLoading,
    error,
  };
}

export default useApiManager;
