import { CURRENCIES, CURRENCY_PAIRS } from "../constants/currencies";
import NetInfo from "@react-native-community/netinfo";
import env from "../config/env";

// Cache to store recent exchange rates with timestamp
const rateCache: Record<string, { rate: number; timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Check if a cached rate is still valid
const isCacheValid = (key: string): boolean => {
  if (!rateCache[key]) return false;
  const now = Date.now();
  return now - rateCache[key].timestamp < CACHE_EXPIRY;
};

// Maximum number of pairs per API call (TraderMade limit)
const MAX_PAIRS_PER_REQUEST = 20;

// Fetch all required rates in a single logical operation (may use multiple API calls if needed)
export const fetchAllRequiredRates = async (
  baseCurrencies: string[] = ["USD", "EUR", "GBP"],
  specificPairs: string[] = []
): Promise<{
  crossRates: Record<string, Record<string, number>>;
  forexPairs: Record<string, number>;
}> => {
  try {
    // Check network connectivity
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      throw new Error("No internet connection. Real-time rates unavailable.");
    }

    // First, check if all required data is in cache
    const crossRates: Record<string, Record<string, number>> = {};
    const forexPairs: Record<string, number> = {};
    let allCached = true;

    // Check if cross rates are cached
    for (const base of baseCurrencies) {
      crossRates[base] = {};
      const quoteCurrencies = CURRENCIES.filter((curr) => curr !== base);

      for (const quote of quoteCurrencies) {
        const cacheKey = `${base}-${quote}`;
        if (isCacheValid(cacheKey)) {
          crossRates[base][quote] = rateCache[cacheKey].rate;
        } else {
          allCached = false;
          break;
        }
      }

      if (!allCached) break;
    }

    // Check if specific forex pairs are cached
    for (const pair of specificPairs) {
      if (isCacheValid(pair)) {
        forexPairs[pair] = rateCache[pair].rate;
      } else {
        allCached = false;
        break;
      }
    }

    // If everything is cached, return the cached data
    if (allCached) {
      return { crossRates, forexPairs };
    }

    // Prepare all pairs we need to fetch
    const allPairsToFetch: string[] = [];

    // Add cross rates pairs
    for (const base of baseCurrencies) {
      const quoteCurrencies = CURRENCIES.filter((curr) => curr !== base);
      for (const quote of quoteCurrencies) {
        allPairsToFetch.push(`${base}${quote}`);
      }
    }

    // Add specific forex pairs
    specificPairs.forEach((pair) => {
      if (!allPairsToFetch.includes(pair)) {
        allPairsToFetch.push(pair);
      }
    });

    // Deduplicate pairs
    const uniquePairs = [...new Set(allPairsToFetch)];

    // Batch API calls (TraderMade has a limit per request)
    const responses: Record<string, number> = {};

    for (let i = 0; i < uniquePairs.length; i += MAX_PAIRS_PER_REQUEST) {
      const pairsBatch = uniquePairs.slice(i, i + MAX_PAIRS_PER_REQUEST);
      const pairsString = pairsBatch.join(",");

      const response = await fetch(
        `https://marketdata.tradermade.com/api/v1/live?api_key=${env.traderMadeApiKey}&currency=${pairsString}`
      );

      if (!response.ok) {
        throw new Error(
          `TraderMade API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data || !data.quotes || !Array.isArray(data.quotes)) {
        throw new Error("Invalid response format from TraderMade API");
      }

      // Process the response
      data.quotes.forEach((quote: any) => {
        if (quote && quote.base_currency && quote.quote_currency && quote.mid) {
          const pair = `${quote.base_currency}${quote.quote_currency}`;
          const rate = parseFloat(quote.mid.toString());

          responses[pair] = rate;

          // Update cache
          rateCache[pair] = { rate, timestamp: Date.now() };

          // Also update the cross-rate cache key
          const cacheKey = `${quote.base_currency}-${quote.quote_currency}`;
          rateCache[cacheKey] = { rate, timestamp: Date.now() };
        }
      });
    }

    // Organize response data
    for (const base of baseCurrencies) {
      crossRates[base] = {};
      const quoteCurrencies = CURRENCIES.filter((curr) => curr !== base);

      for (const quote of quoteCurrencies) {
        const pair = `${base}${quote}`;
        if (responses[pair]) {
          crossRates[base][quote] = responses[pair];
        }
      }
    }

    for (const pair of specificPairs) {
      if (responses[pair]) {
        forexPairs[pair] = responses[pair];
      }
    }

    return { crossRates, forexPairs };
  } catch (error) {
    console.error("Error fetching all required rates:", error);
    throw error;
  }
};

// Fetch exchange rate from API
export const fetchExchangeRate = async (
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  try {
    // Check network connectivity
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      throw new Error("No internet connection. Real-time rates unavailable.");
    }

    // If same currency, return 1
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Check cache first
    const cacheKey = `${fromCurrency}-${toCurrency}`;
    if (isCacheValid(cacheKey)) {
      return rateCache[cacheKey].rate;
    }

    const response = await fetch(
      `https://marketdata.tradermade.com/api/v1/live?api_key=${env.traderMadeApiKey}&currency=${fromCurrency}${toCurrency}`
    );

    if (!response.ok) {
      throw new Error(
        `TraderMade API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    let rate: number | null = null;

    // Parse the response to get the exchange rate
    if (data && data.quotes && data.quotes.length > 0) {
      const quote = data.quotes[0];
      // Check for mid value, which is the average of bid and ask
      if (quote && quote.mid) {
        rate = parseFloat(quote.mid.toString());
      }
    }

    if (rate === null) {
      throw new Error("Could not find exchange rate in API response");
    }

    // Cache the result
    rateCache[cacheKey] = { rate, timestamp: Date.now() };

    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw error;
  }
};

// Fetch all exchange rates for a base currency
export const fetchAllExchangeRates = async (
  baseCurrency: string
): Promise<Record<string, number>> => {
  try {
    // Check network connectivity
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      throw new Error("No internet connection. Real-time rates unavailable.");
    }

    // Use the predefined list of currencies
    const quoteCurrencies = CURRENCIES.filter((curr) => curr !== baseCurrency);

    // Format pairs for TraderMade API
    const pairs = quoteCurrencies
      .map((curr) => `${baseCurrency}${curr}`)
      .join(",");

    const response = await fetch(
      `https://marketdata.tradermade.com/api/v1/live?api_key=${env.traderMadeApiKey}&currency=${pairs}`
    );

    if (!response.ok) {
      throw new Error(
        `TraderMade API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data || !data.quotes || !Array.isArray(data.quotes)) {
      throw new Error("Invalid response format from TraderMade API");
    }

    // Process the response
    const rates: Record<string, number> = {};

    data.quotes.forEach((quote: any) => {
      // Check for quote_currency and mid value
      if (quote && quote.quote_currency && quote.mid) {
        const quoteCurrency = quote.quote_currency;
        const rate = parseFloat(quote.mid.toString());

        rates[quoteCurrency] = rate;

        // Also cache individual rates
        const cacheKey = `${baseCurrency}-${quoteCurrency}`;
        rateCache[cacheKey] = {
          rate,
          timestamp: Date.now(),
        };
      }
    });

    if (Object.keys(rates).length === 0) {
      throw new Error("No valid exchange rates found in the response");
    }

    return rates;
  } catch (error) {
    console.error("Error fetching all exchange rates:", error);
    throw error;
  }
};

// Fetch exchange rates for common forex pairs
export const fetchForexPairRates = async (
  pairsString?: string
): Promise<Record<string, number>> => {
  try {
    // Check network connectivity
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      throw new Error("No internet connection. Real-time rates unavailable.");
    }

    // Use provided pairs or default to predefined list
    const forexPairsString = pairsString || CURRENCY_PAIRS.join(",");

    const response = await fetch(
      `https://marketdata.tradermade.com/api/v1/live?api_key=${env.traderMadeApiKey}&currency=${forexPairsString}`
    );

    if (!response.ok) {
      throw new Error(
        `TraderMade API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data || !data.quotes || !Array.isArray(data.quotes)) {
      throw new Error("Invalid response format from TraderMade API");
    }

    // Process the response
    const rates: Record<string, number> = {};

    data.quotes.forEach((quote: any) => {
      // Check for base_currency, quote_currency and mid value
      if (quote && quote.base_currency && quote.quote_currency && quote.mid) {
        // Create pair name from base and quote currencies (e.g., EURUSD)
        const pair = `${quote.base_currency}${quote.quote_currency}`;
        const rate = parseFloat(quote.mid.toString());

        rates[pair] = rate;

        // Also cache individual rates
        rateCache[pair] = {
          rate,
          timestamp: Date.now(),
        };
      }
    });

    if (Object.keys(rates).length === 0) {
      throw new Error("No valid forex pair rates found in the response");
    }

    return rates;
  } catch (error) {
    console.error("Error fetching forex pair rates:", error);
    throw error;
  }
};
