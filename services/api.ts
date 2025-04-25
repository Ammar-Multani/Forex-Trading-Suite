import { Currency } from "../constants/currencies";
import NetInfo from "@react-native-community/netinfo";
import env from "../config/env";

// ===== TYPES =====
interface ExchangeRateCache {
  [key: string]: {
    rate: number;
    timestamp: number;
  };
}

interface PendingRequest {
  fromCurrency: string;
  toCurrency: string;
  resolve: (rate: number) => void;
  reject: (error: Error) => void;
}

interface BatchRequestResult {
  pairs: Set<string>;
  data: Record<string, number>;
}

// ===== CONFIGURATION =====
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const BATCH_DELAY = 50; // Milliseconds to wait before sending a batch
const MAX_PAIRS_PER_REQUEST = 20; // TraderMade limit per API call

// ===== SINGLETON API CLIENT =====
class ForexApiClient {
  private static instance: ForexApiClient;
  private rateCache: ExchangeRateCache = {};
  private pendingRequests: PendingRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isProcessingBatch = false;

  private constructor() {}

  public static getInstance(): ForexApiClient {
    if (!ForexApiClient.instance) {
      ForexApiClient.instance = new ForexApiClient();
    }
    return ForexApiClient.instance;
  }

  // Check if a rate is cached and still valid
  private isCacheValid(key: string): boolean {
    if (!this.rateCache[key]) return false;
    const now = Date.now();
    return now - this.rateCache[key].timestamp < CACHE_EXPIRY;
  }

  // Get a rate from cache
  private getCachedRate(
    fromCurrency: string,
    toCurrency: string
  ): number | null {
    // Check direct pair
    const directKey = `${fromCurrency}-${toCurrency}`;
    if (this.isCacheValid(directKey)) {
      return this.rateCache[directKey].rate;
    }

    // Check reverse pair (1/rate)
    const reverseKey = `${toCurrency}-${fromCurrency}`;
    if (this.isCacheValid(reverseKey)) {
      return 1 / this.rateCache[reverseKey].rate;
    }

    return null;
  }

  // Add a rate to cache
  private cacheRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number
  ): void {
    const key = `${fromCurrency}-${toCurrency}`;
    this.rateCache[key] = {
      rate,
      timestamp: Date.now(),
    };
  }

  // Create a currency pair string for the API (e.g., EURUSD)
  private getPairString(fromCurrency: string, toCurrency: string): string {
    return `${fromCurrency}${toCurrency}`;
  }

  // Queue a request and process in batch
  public fetchExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    // Same currency case
    if (fromCurrency === toCurrency) {
      return Promise.resolve(1);
    }

    // Check cache first
    const cachedRate = this.getCachedRate(fromCurrency, toCurrency);
    if (cachedRate !== null) {
      return Promise.resolve(cachedRate);
    }

    // Create a promise that will be resolved when the batch is processed
    return new Promise<number>((resolve, reject) => {
      // Add request to pending queue
      this.pendingRequests.push({
        fromCurrency,
        toCurrency,
        resolve,
        reject,
      });

      // Schedule a batch if not already scheduled
      this.scheduleBatch();
    });
  }

  // Schedule a batch processing with debounce
  private scheduleBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, BATCH_DELAY);
  }

  // Process all pending requests in batches
  private async processBatch(): Promise<void> {
    if (this.isProcessingBatch || this.pendingRequests.length === 0) {
      return;
    }

    this.isProcessingBatch = true;
    this.batchTimer = null;

    try {
      // Check network connectivity
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        throw new Error("No internet connection. Real-time rates unavailable.");
      }

      // Check if API key is available
      if (!env.traderMadeApiKey) {
        throw new Error(
          "TraderMade API key is not configured. Please add it in the settings."
        );
      }

      // Copy current pending requests and clear the queue
      const requests = [...this.pendingRequests];
      this.pendingRequests = [];

      // Collect all unique currency pairs needed
      const allPairs = new Set<string>();
      for (const request of requests) {
        // Skip pairs we already have in cache
        if (
          this.getCachedRate(request.fromCurrency, request.toCurrency) !== null
        ) {
          continue;
        }

        allPairs.add(
          this.getPairString(request.fromCurrency, request.toCurrency)
        );
      }

      if (allPairs.size === 0) {
        // All requests can be fulfilled from cache
        this.resolveRequestsFromCache(requests);
        return;
      }

      // Fetch all required rates in batches (respecting API limits)
      const results = await this.fetchRatesInBatches(allPairs);

      // Cache all results
      for (const [pair, rate] of Object.entries(results.data)) {
        const baseCurrency = pair.substring(0, 3);
        const quoteCurrency = pair.substring(3, 6);
        this.cacheRate(baseCurrency, quoteCurrency, rate);
      }

      // Resolve all pending requests
      for (const request of requests) {
        try {
          const rate = this.getCachedRate(
            request.fromCurrency,
            request.toCurrency
          );
          if (rate !== null) {
            request.resolve(rate);
          } else {
            // This shouldn't happen if our code is correct
            request.reject(
              new Error(
                `Could not find rate for ${request.fromCurrency}/${request.toCurrency}`
              )
            );
          }
        } catch (error) {
          request.reject(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    } catch (error) {
      // Reject all pending requests with the same error
      for (const request of this.pendingRequests) {
        request.reject(
          error instanceof Error ? error : new Error(String(error))
        );
      }
      this.pendingRequests = [];
    } finally {
      this.isProcessingBatch = false;

      // If more requests came in while processing, schedule another batch
      if (this.pendingRequests.length > 0) {
        this.scheduleBatch();
      }
    }
  }

  // Resolve requests that can be fulfilled from cache
  private resolveRequestsFromCache(requests: PendingRequest[]): void {
    for (const request of requests) {
      const rate = this.getCachedRate(request.fromCurrency, request.toCurrency);
      if (rate !== null) {
        request.resolve(rate);
      } else {
        // Re-queue any requests that couldn't be fulfilled from cache
        this.pendingRequests.push(request);
      }
    }
  }

  // Fetch rates in batches to respect API limits
  private async fetchRatesInBatches(
    pairs: Set<string>
  ): Promise<BatchRequestResult> {
    const pairsArray = Array.from(pairs);
    const data: Record<string, number> = {};

    // Split into batches of MAX_PAIRS_PER_REQUEST
    for (let i = 0; i < pairsArray.length; i += MAX_PAIRS_PER_REQUEST) {
      const batchPairs = pairsArray.slice(i, i + MAX_PAIRS_PER_REQUEST);
      const batchResult = await this.fetchBatch(batchPairs);

      // Merge results
      Object.assign(data, batchResult);
    }

    return {
      pairs,
      data,
    };
  }

  // Fetch a single batch of currency pairs
  private async fetchBatch(pairs: string[]): Promise<Record<string, number>> {
    const pairsString = pairs.join(",");

    console.log(
      `[ForexAPI] Fetching batch of ${pairs.length} pairs: ${pairsString}`
    );

    const response = await fetch(
      `https://marketdata.tradermade.com/api/v1/live?currency=${pairsString}&api_key=${env.traderMadeApiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `TraderMade API request failed with status ${response.status}${
          errorText ? ": " + errorText : ""
        }`
      );
    }

    const data = await response.json();

    if (!data || !data.quotes || !Array.isArray(data.quotes)) {
      throw new Error("Invalid response format from TraderMade API");
    }

    // Process the response
    const rates: Record<string, number> = {};

    data.quotes.forEach((quote: any) => {
      if (quote && quote.base_currency && quote.quote_currency && quote.mid) {
        const pair = `${quote.base_currency}${quote.quote_currency}`;
        rates[pair] = quote.mid;
      }
    });

    return rates;
  }

  // Clear cache (useful for testing or manual refresh)
  public clearCache(): void {
    this.rateCache = {};
  }
}

// ===== GLOBAL API MANAGER =====

/**
 * Global API Manager for centralized request handling,
 * advanced caching, and request batching across the entire app
 */
export class ApiManager {
  private static instance: ApiManager;
  private lastFullRefresh: number = 0;
  private pendingRequests: Set<string> = new Set();
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private readonly DEBOUNCE_TIME = 250; // 250ms for batching requests
  private refreshQueue: Array<() => void> = [];
  private isRefreshing = false;

  // Track which screens/components have registered for updates
  private activeComponents: Set<string> = new Set();

  private constructor() {
    // Schedule periodic refresh
    this.schedulePeriodicRefresh();
  }

  public static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  /**
   * Register a component as active (e.g., when mounted)
   * This helps in tracking which components need exchange rates
   */
  public registerComponent(componentId: string): void {
    this.activeComponents.add(componentId);

    // Refresh data if it's stale (over 15 minutes) when a new component registers
    const now = Date.now();
    if (now - this.lastFullRefresh > this.REFRESH_INTERVAL) {
      this.refreshAllRates();
    }
  }

  /**
   * Unregister a component (e.g., when unmounted)
   */
  public unregisterComponent(componentId: string): void {
    this.activeComponents.delete(componentId);
  }

  /**
   * Schedule a full refresh of all exchange rates
   */
  private schedulePeriodicRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      // Only refresh if there are active components
      if (this.activeComponents.size > 0) {
        this.refreshAllRates();
      }
    }, this.REFRESH_INTERVAL);
  }

  /**
   * Refresh all exchange rates at once
   * This fetches all commonly used rates in one batch
   */
  public async refreshAllRates(): Promise<void> {
    // Prevent multiple simultaneous refreshes
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      // Use the existing forex API client to refresh rates
      // This automatically updates the central cache
      const forexClient = ForexApiClient.getInstance();
      forexClient.clearCache();

      // Essential base currencies
      const baseCurrencies = ["USD", "EUR", "GBP"];

      // Common currency pairs that most calculations rely on
      const commonPairs = [
        "EURUSD",
        "GBPUSD",
        "USDJPY",
        "USDCHF",
        "USDCAD",
        "AUDUSD",
        "EURGBP",
        "EURJPY",
        "GBPJPY",
      ];

      // Create batch requests for all pairs
      const batchRequests = [];

      // Add requests for all base currencies against each other
      for (const base of baseCurrencies) {
        for (const quote of baseCurrencies) {
          if (base !== quote) {
            batchRequests.push(fetchExchangeRate(base, quote));
          }
        }
      }

      // Add requests for common forex pairs
      for (const pair of commonPairs) {
        const base = pair.substring(0, 3);
        const quote = pair.substring(3, 6);
        batchRequests.push(fetchExchangeRate(base, quote));
      }

      // Execute all requests in parallel
      // The fetchExchangeRate function will handle batching internally
      await Promise.all(batchRequests);

      this.lastFullRefresh = Date.now();
    } catch (error) {
      console.error("Error refreshing all rates:", error);
      // Don't throw, just log the error
    } finally {
      this.isRefreshing = false;

      // Resolve any pending promises
      while (this.refreshQueue.length > 0) {
        const resolve = this.refreshQueue.shift();
        if (resolve) resolve();
      }
    }
  }

  /**
   * Request a specific currency pair rate
   * If multiple requests for the same pair happen in quick succession,
   * they will be batched together
   */
  public async requestCurrencyPair(
    baseCurrency: string,
    quoteCurrency: string
  ): Promise<number> {
    const pairKey = `${baseCurrency}${quoteCurrency}`;

    // Add to pending requests
    this.pendingRequests.add(pairKey);

    // Return promise that will be resolved when the batch is processed
    return new Promise<number>((resolve, reject) => {
      // Use the existing forex API client which has built-in batching
      setTimeout(async () => {
        try {
          const rate = await fetchExchangeRate(baseCurrency, quoteCurrency);
          resolve(rate);
        } catch (error) {
          reject(error);
        } finally {
          this.pendingRequests.delete(pairKey);
        }
      }, this.DEBOUNCE_TIME);
    });
  }

  /**
   * Request multiple currency pairs at once
   * More efficient than requesting them individually
   */
  public async requestMultiplePairs(
    pairs: Array<{ base: string; quote: string }>
  ): Promise<Record<string, number>> {
    // Convert to array of pair strings
    const pairStrings = pairs.map((p) => `${p.base}${p.quote}`);

    try {
      // Create request promises
      const requests = pairs.map((pair) =>
        this.requestCurrencyPair(pair.base, pair.quote).then((rate) => ({
          pair: `${pair.base}${pair.quote}`,
          rate,
        }))
      );

      // Execute all requests in parallel
      const results = await Promise.all(requests);

      // Format the results
      const ratesMap: Record<string, number> = {};
      for (const result of results) {
        ratesMap[result.pair] = result.rate;
      }

      return ratesMap;
    } catch (error) {
      console.error("Error requesting multiple pairs:", error);
      throw error;
    }
  }
}

// Create and export the singleton instance
export const apiManager = ApiManager.getInstance();

// ===== PUBLIC API =====

// Get the singleton instance
const forexApiClient = ForexApiClient.getInstance();

// Public API for fetching exchange rates
export const fetchExchangeRate = async (
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  try {
    return await forexApiClient.fetchExchangeRate(fromCurrency, toCurrency);
  } catch (error) {
    console.error(
      `Error fetching exchange rate from ${fromCurrency} to ${toCurrency}:`,
      error
    );
    throw error;
  }
};

// Get all exchange rates for a base currency against a list of quote currencies
export const fetchAllExchangeRates = async (
  baseCurrency: string,
  quoteCurrencies: string[] = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "NZD",
    "INR",
  ]
): Promise<Record<string, number>> => {
  try {
    // Remove base currency if it's in the list
    const filteredQuoteCurrencies = quoteCurrencies.filter(
      (curr) => curr !== baseCurrency
    );

    // Create an array of promises for all currency pairs
    const promises = filteredQuoteCurrencies.map((quoteCurrency) =>
      fetchExchangeRate(baseCurrency, quoteCurrency).then((rate) => ({
        currency: quoteCurrency,
        rate,
      }))
    );

    // Wait for all requests to complete - they'll be batched behind the scenes
    const results = await Promise.all(promises);

    // Format the results
    const rates: Record<string, number> = {};
    for (const result of results) {
      rates[result.currency] = result.rate;
    }

    return rates;
  } catch (error) {
    console.error(
      `Error fetching all exchange rates for ${baseCurrency}:`,
      error
    );
    throw error;
  }
};

// Fetch rates for a specific list of currency pairs
export const fetchForexPairRates = async (
  pairs: string[]
): Promise<Record<string, number>> => {
  try {
    // Create an array of promises for all currency pairs
    const promises = pairs.map((pair) => {
      const baseCurrency = pair.substring(0, 3);
      const quoteCurrency = pair.substring(3, 6);

      return fetchExchangeRate(baseCurrency, quoteCurrency).then((rate) => ({
        pair,
        rate,
      }));
    });

    // Wait for all requests to complete - they'll be batched behind the scenes
    const results = await Promise.all(promises);

    // Format the results
    const rates: Record<string, number> = {};
    for (const result of results) {
      rates[result.pair] = result.rate;
    }

    return rates;
  } catch (error) {
    console.error("Error fetching forex pair rates:", error);
    throw error;
  }
};

// Clear the exchange rate cache (for manual refresh)
export const clearExchangeRateCache = (): void => {
  forexApiClient.clearCache();
};
