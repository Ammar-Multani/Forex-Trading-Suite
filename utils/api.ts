import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API key - in a real app, this should be in an environment variable
const API_KEY = 'YOUR_TRADERMADE_API_KEY'; // Replace with your actual API key

// Cache to store recent exchange rates with timestamp
const rateCache: Record<string, { rate: number; timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Check if a cached rate is still valid
const isCacheValid = (key: string): boolean => {
  if (!rateCache[key]) return false;
  const now = Date.now();
  return now - rateCache[key].timestamp < CACHE_EXPIRY;
};

// Load cached rates from AsyncStorage on app start
export const loadCachedRates = async (): Promise<void> => {
  try {
    const cachedRatesJson = await AsyncStorage.getItem('exchangeRateCache');
    if (cachedRatesJson) {
      const cachedRates = JSON.parse(cachedRatesJson);
      Object.assign(rateCache, cachedRates);
      console.log('Loaded cached exchange rates from storage');
    }
  } catch (error) {
    console.error('Error loading cached rates:', error);
  }
};

// Save cached rates to AsyncStorage
const saveCachedRates = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('exchangeRateCache', JSON.stringify(rateCache));
  } catch (error) {
    console.error('Error saving cached rates:', error);
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

    // Make API call to TraderMade
    console.log(`Calling TraderMade API for ${fromCurrency}/${toCurrency}`);

    const response = await fetch(
      `https://marketdata.tradermade.com/api/v1/live?api_key=${API_KEY}&currency=${fromCurrency}${toCurrency}`
    );

    if (!response.ok) {
      throw new Error(
        `TraderMade API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    console.log("TraderMade response:", JSON.stringify(data));

    let rate: number | null = null;

    // Parse the response to get the exchange rate
    if (data && data.quotes && data.quotes.length > 0) {
      const quote = data.quotes[0];
      if (quote && (quote.mid || quote.price)) {
        rate = parseFloat(quote.mid || quote.price);
      }
    }

    if (rate === null) {
      throw new Error("Could not find exchange rate in API response");
    }

    console.log(
      `TraderMade API returned rate: ${rate} for ${fromCurrency}/${toCurrency}`
    );

    // Cache the result
    rateCache[cacheKey] = { rate, timestamp: Date.now() };
    
    // Save to AsyncStorage
    saveCachedRates();

    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    
    // Try to use the last cached value even if expired
    const cacheKey = `${fromCurrency}-${toCurrency}`;
    if (rateCache[cacheKey]) {
      console.log("Using expired cached rate as fallback");
      return rateCache[cacheKey].rate;
    }
    
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

    console.log(`Fetching all rates for ${baseCurrency} from TraderMade`);

    // TraderMade requires a list of currency pairs for live quotes
    const commonCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "AUD",
      "CAD",
      "CHF",
      "NZD",
    ];

    // Remove base currency from the list if it's there
    const quoteCurrencies = commonCurrencies.filter(
      (curr) => curr !== baseCurrency
    );

    // Format pairs for TraderMade API
    const pairs = quoteCurrencies
      .map((curr) => `${baseCurrency}${curr}`)
      .join(",");

    const response = await fetch(
      `https://marketdata.tradermade.com/api/v1/live?api_key=${API_KEY}&currency=${pairs}`
    );

    if (!response.ok) {
      throw new Error(
        `TraderMade API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    console.log("TraderMade response for all rates:", JSON.stringify(data));

    if (!data || !data.quotes || !Array.isArray(data.quotes)) {
      throw new Error("Invalid response format from TraderMade API");
    }

    // Process the response
    const rates: Record<string, number> = {};

    data.quotes.forEach((quote: any) => {
      if (!quote || !quote.currency) return;

      // Extract the target currency from the pair name (e.g., USDEUR -> EUR)
      const quoteCurrency = quote.currency.substring(baseCurrency.length);
      const rate = quote.mid || quote.price;

      if (quoteCurrency && rate) {
        rates[quoteCurrency] = parseFloat(rate);

        // Also cache individual rates
        const cacheKey = `${baseCurrency}-${quoteCurrency}`;
        rateCache[cacheKey] = {
          rate: parseFloat(rate),
          timestamp: Date.now(),
        };
      }
    });

    if (Object.keys(rates).length === 0) {
      throw new Error("No valid exchange rates found in the response");
    }

    // Save to AsyncStorage
    saveCachedRates();

    console.log(
      `Successfully fetched ${
        Object.keys(rates).length
      } rates for ${baseCurrency}`
    );
    return rates;
  } catch (error) {
    console.error("Error fetching all exchange rates:", error);
    throw error;
  }
};

// Get the latest exchange rates for common forex pairs
export const getForexPairRates = async (): Promise<Record<string, number>> => {
  try {
    // Common forex pairs
    const pairs = [
      "EURUSD",
      "GBPUSD",
      "USDJPY",
      "USDCHF",
      "AUDUSD",
      "USDCAD",
      "NZDUSD",
      "EURGBP",
      "EURJPY",
      "GBPJPY"
    ];

    // Check network connectivity
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      throw new Error("No internet connection. Real-time rates unavailable.");
    }

    const response = await fetch(
      `https://marketdata.tradermade.com/api/v1/live?api_key=${API_KEY}&currency=${pairs.join(',')}`
    );

    if (!response.ok) {
      throw new Error(
        `TraderMade API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    console.log("TraderMade response for forex pairs:", JSON.stringify(data));

    if (!data || !data.quotes || !Array.isArray(data.quotes)) {
      throw new Error("Invalid response format from TraderMade API");
    }

    // Process the response
    const rates: Record<string, number> = {};

    data.quotes.forEach((quote: any) => {
      if (!quote || !quote.currency) return;
      
      const pair = quote.currency;
      const rate = quote.mid || quote.price;

      if (pair && rate) {
        rates[pair] = parseFloat(rate);
        
        // Also cache the rate
        const fromCurrency = pair.substring(0, 3);
        const toCurrency = pair.substring(3, 6);
        const cacheKey = `${fromCurrency}-${toCurrency}`;
        
        rateCache[cacheKey] = {
          rate: parseFloat(rate),
          timestamp: Date.now(),
        };
      }
    });

    // Save to AsyncStorage
    saveCachedRates();

    return rates;
  } catch (error) {
    console.error("Error fetching forex pair rates:", error);
    throw error;
  }
};