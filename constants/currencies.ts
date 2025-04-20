export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
];

export const CURRENCY_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
];

// Helper function to get currency symbol by code
export const getCurrencySymbol = (code: string): string => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency ? currency.symbol : '';
};

// Helper function to format currency pair for API
export const formatPairForApi = (pair: string): string => {
  return pair.replace('/', '');
};

// Helper function to parse currency pair
export const parseCurrencyPair = (pair: string): { base: string; quote: string } => {
  const [base, quote] = pair.split('/');
  return { base, quote };
};