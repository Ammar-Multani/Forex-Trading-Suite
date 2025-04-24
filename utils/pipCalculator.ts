import { CurrencyPair } from "@/constants/currencies";

/**
 * Calculate pip value in quote currency
 * This follows standard forex pip calculation used by professional trading platforms
 */
export const calculatePipValueInQuoteCurrency = (
  currencyPair: CurrencyPair,
  positionSize: number,
  pipCount: number,
  pipDecimalPlaces: number = 4
): number => {
  // For JPY pairs, pip value is different by default, but can be overridden
  const isJpyPair = currencyPair.quote === "JPY";

  // If pipDecimalPlaces is provided, use that, otherwise use default for the currency
  let pipValue: number;

  if (isJpyPair && pipDecimalPlaces === 4) {
    // Default for JPY pairs is 2nd decimal place if user is using default setting
    pipValue = 0.01;
  } else if (pipDecimalPlaces === 0) {
    // Special case for 0th decimal place (whole units)
    pipValue = 1;
  } else {
    // For all other decimal places, calculate dynamically
    pipValue = Math.pow(10, -pipDecimalPlaces);
  }

  // Calculate pip value in quote currency for a single pip
  const singlePipValue = positionSize * pipValue;

  // Return single pip value (we handle multiplying by pip count elsewhere)
  return singlePipValue;
};

/**
 * Calculate pip value in account currency
 * Handles all possible currency pair and account currency combinations
 * Updated to match reference app calculation logic
 */
export const calculatePipValueInAccountCurrency = (
  pipValueInQuoteCurrency: number,
  quoteCurrency: string,
  accountCurrency: string,
  exchangeRate: number
): number => {
  // If quote currency is the same as account currency, no conversion needed
  if (quoteCurrency === accountCurrency) {
    return pipValueInQuoteCurrency;
  }

  // Use direct multiplication - this is how most forex calculators work
  // Professional trading platforms use direct multiplication by the exchange rate
  return pipValueInQuoteCurrency * exchangeRate;
};

/**
 * Get the number of decimal places to use for a specific currency in pip calculations
 */
export const getPipDecimalPlaces = (currencyCode: string): number => {
  // JPY has 2 decimal places for pips by default, everything else has 4
  return currencyCode === "JPY" ? 2 : 4;
};

/**
 * Format currency value for display with proper precision
 */
export const formatCurrencyValue = (
  value: number,
  currencyCode: string,
  currencySymbol: string
): string => {
  // Format with appropriate decimal places based on currency
  let decimalPlaces = currencyCode === "JPY" ? 0 : 2;

  // For very large values from 0th decimal place calculations, reduce decimal places
  if (value > 10000) {
    decimalPlaces = Math.min(decimalPlaces, 0);
  }

  // Format with commas for thousands while preserving decimal places
  return `${currencySymbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}`;
};

/**
 * Format pip value for display with proper precision
 */
export const formatPipValue = (
  value: number,
  currencyCode: string,
  currencySymbol: string
): string => {
  // Format with appropriate precision for pip values
  let decimalPlaces = currencyCode === "JPY" ? 0 : 2;

  // For very large values from 0th decimal place calculations, reduce decimal places
  if (value > 10000) {
    decimalPlaces = Math.min(decimalPlaces, 0);
  } else if (value < 0.01 && value > 0) {
    // For very small values, show more decimal places
    decimalPlaces = 4;
  }

  // Format with commas for thousands while preserving decimal places
  return `${currencySymbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}`;
};
