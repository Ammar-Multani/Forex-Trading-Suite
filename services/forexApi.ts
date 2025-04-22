import env from "../config/env";

// Types
interface ExchangeRate {
  rate: number;
  timestamp: number;
}

interface ApiResponse {
  quotes: Array<{
    currency: string;
    mid?: number;
    price?: number;
  }>;
}

// Error types
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// Cache configuration
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const rateCache = new Map<string, ExchangeRate>();

// API rate limiting
class ApiRateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  async enqueue<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const nextCall = this.queue.shift();
      if (nextCall) {
        try {
          await nextCall();
        } catch (error) {
          console.error("Error in API queue:", error);
        }
        // Add delay between calls to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    this.isProcessing = false;
  }
}

const rateLimiter = new ApiRateLimiter();

// API class
export class ForexApi {
  private static instance: ForexApi;
  private baseUrl = "https://marketdata.tradermade.com/api/v1";

  private constructor() {}

  static getInstance(): ForexApi {
    if (!ForexApi.instance) {
      ForexApi.instance = new ForexApi();
    }
    return ForexApi.instance;
  }

  private getCacheKey(fromCurrency: string, toCurrency: string): string {
    return `${fromCurrency}-${toCurrency}`;
  }

  private isCacheValid(key: string): boolean {
    const cached = rateCache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_EXPIRY;
  }

  private async makeApiCall<T>(endpoint: string): Promise<T> {
    if (!env.traderMadeApiKey) {
      throw new ApiError("TraderMade API key is not configured");
    }

    const url = `${this.baseUrl}/${endpoint}`;
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new NetworkError("Failed to fetch exchange rate");
    }
  }

  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    const cacheKey = this.getCacheKey(fromCurrency, toCurrency);
    if (this.isCacheValid(cacheKey)) {
      return rateCache.get(cacheKey)!.rate;
    }

    return rateLimiter.enqueue(async () => {
      const endpoint = `live?api_key=${env.traderMadeApiKey}&currency=${fromCurrency}${toCurrency}`;
      const data = await this.makeApiCall<ApiResponse>(endpoint);

      if (!data.quotes?.[0]) {
        throw new ApiError("Invalid API response format");
      }

      const rate = data.quotes[0].mid || data.quotes[0].price;
      if (!rate) {
        throw new ApiError("No rate found in response");
      }

      rateCache.set(cacheKey, {
        rate: Number(rate),
        timestamp: Date.now(),
      });

      return Number(rate);
    });
  }

  async getAllExchangeRates(
    baseCurrency: string
  ): Promise<Record<string, number>> {
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
    const quoteCurrencies = commonCurrencies.filter(
      (curr) => curr !== baseCurrency
    );
    const pairs = quoteCurrencies
      .map((curr) => `${baseCurrency}${curr}`)
      .join(",");

    return rateLimiter.enqueue(async () => {
      const endpoint = `live?api_key=${env.traderMadeApiKey}&currency=${pairs}`;
      const data = await this.makeApiCall<ApiResponse>(endpoint);

      const rates: Record<string, number> = {};
      data.quotes.forEach((quote) => {
        const quoteCurrency = quote.currency.substring(baseCurrency.length);
        const rate = quote.mid || quote.price;
        if (rate) {
          rates[quoteCurrency] = Number(rate);
          // Update cache
          rateCache.set(this.getCacheKey(baseCurrency, quoteCurrency), {
            rate: Number(rate),
            timestamp: Date.now(),
          });
        }
      });

      return rates;
    });
  }
}

// Export singleton instance
export const forexApi = ForexApi.getInstance();
