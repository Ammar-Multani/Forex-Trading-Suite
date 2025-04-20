// List of currencies
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'INR'
];

// List of common forex pairs
export const CURRENCY_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 
  'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'
];

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  NZD: 'NZ$',
  INR: '₹'
};

// Currency decimal places
export const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
  AUD: 2,
  CAD: 2,
  CHF: 2,
  NZD: 2,
  INR: 2
};

// Pip values for different currency pairs
export const PIP_VALUES: Record<string, number> = {
  EURUSD: 0.0001,
  GBPUSD: 0.0001,
  USDJPY: 0.01,
  AUDUSD: 0.0001,
  USDCAD: 0.0001,
  USDCHF: 0.0001,
  NZDUSD: 0.0001,
  EURGBP: 0.0001,
  EURJPY: 0.01,
  GBPJPY: 0.01
};