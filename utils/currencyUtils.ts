import { fetchExchangeRate } from "./api";
import { CURRENCY_SYMBOLS } from "../constants/currencies";

// Get currency symbol from the symbol map
export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

// Format currency with proper symbol and decimal places
export const formatCurrency = (
  amount: number,
  currencyCode: string,
  options: {
    showSymbol?: boolean;
    decimalPlaces?: number;
  } = {}
): string => {
  const { showSymbol = true, decimalPlaces = 2 } = options;

  // Get currency symbol
  const symbol = showSymbol ? getCurrencySymbol(currencyCode) : "";

  // Format the number
  const formattedAmount = amount.toFixed(decimalPlaces);

  // Return formatted currency
  return `${symbol}${formattedAmount}`;
};

// Convert amount from one currency to another
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rate = await fetchExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  } catch (error) {
    console.error("Error converting currency:", error);
    throw error;
  }
};

// Parse currency pair string (e.g., "EUR/USD") into base and quote currencies
export const parseCurrencyPair = (
  pair: string
): { base: string; quote: string } => {
  const [base, quote] = pair.split("/");
  return { base, quote };
};

// Get pip value for a currency pair
export const getPipValue = (pair: string): number => {
  // JPY pairs have 2 decimal places (0.01), others have 4 (0.0001)
  const { base, quote } = parseCurrencyPair(pair);
  return base === "JPY" || quote === "JPY" ? 0.01 : 0.0001;
};

// Calculate pip difference between two prices
export const calculatePipDifference = (
  price1: number,
  price2: number,
  pair: string
): number => {
  const pipValue = getPipValue(pair);
  return Math.abs(price1 - price2) / pipValue;
};
