// List of major currencies and currency pairs
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  countryCode: string; // ISO country code for flags
}

export interface CurrencyPair {
  name: string;
  base: string;
  quote: string;
  pipDecimalPlaces: number;
  group: string;
}

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", countryCode: "US" },
  { code: "EUR", name: "Euro", symbol: "€", countryCode: "EU" },
  { code: "GBP", name: "British Pound", symbol: "£", countryCode: "GB" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", countryCode: "JP" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", countryCode: "AU" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", countryCode: "CA" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", countryCode: "CH" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", countryCode: "NZ" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", countryCode: "CN" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", countryCode: "HK" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", countryCode: "SG" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", countryCode: "SE" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", countryCode: "NO" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", countryCode: "MX" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", countryCode: "IN" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", countryCode: "BR" },
  { code: "ZAR", name: "South African Rand", symbol: "R", countryCode: "ZA" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", countryCode: "RU" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", countryCode: "TR" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", countryCode: "PL" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", countryCode: "KR" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", countryCode: "DK" },
  { code: "THB", name: "Thai Baht", symbol: "฿", countryCode: "TH" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", countryCode: "MY" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", countryCode: "ID" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", countryCode: "PH" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", countryCode: "AE" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", countryCode: "SA" },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪", countryCode: "IL" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", countryCode: "CZ" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", countryCode: "HU" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", countryCode: "RO" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", countryCode: "AR" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", countryCode: "CL" },
  { code: "COP", name: "Colombian Peso", symbol: "$", countryCode: "CO" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", countryCode: "EG" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", countryCode: "MA" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", countryCode: "NG" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", countryCode: "PK" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", countryCode: "TW" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", countryCode: "VN" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", countryCode: "KE" },
  { code: "KMF", name: "Comorian Franc", symbol: "CF", countryCode: "KM" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", countryCode: "KW" },
  {
    code: "KYD",
    name: "Cayman Islands Dollar",
    symbol: "$",
    countryCode: "KY",
  },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", countryCode: "KZ" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "₨", countryCode: "LK" },
  { code: "ALL", name: "Albanian Lek", symbol: "L", countryCode: "AL" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏", countryCode: "AM" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", countryCode: "AO" },
  {
    code: "BAM",
    name: "Bosnia and Herzegovina Convertible Mark",
    symbol: "KM",
    countryCode: "BA",
  },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", countryCode: "BD" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", countryCode: "BG" },
  { code: "BYN", name: "Belarusian Ruble", symbol: "Br", countryCode: "BY" },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$", countryCode: "DO" },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج", countryCode: "DZ" },
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$", countryCode: "FJ" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", countryCode: "GH" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L", countryCode: "HN" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", countryCode: "IQ" },
];

export const currencyPairs: CurrencyPair[] = [
  // Major Pairs
  {
    name: "EUR/USD",
    base: "EUR",
    quote: "USD",
    pipDecimalPlaces: 4,
    group: "Major",
  },
  {
    name: "GBP/USD",
    base: "GBP",
    quote: "USD",
    pipDecimalPlaces: 4,
    group: "Major",
  },
  {
    name: "USD/JPY",
    base: "USD",
    quote: "JPY",
    pipDecimalPlaces: 2,
    group: "Major",
  },
  {
    name: "USD/CHF",
    base: "USD",
    quote: "CHF",
    pipDecimalPlaces: 4,
    group: "Major",
  },
  {
    name: "USD/CAD",
    base: "USD",
    quote: "CAD",
    pipDecimalPlaces: 4,
    group: "Major",
  },
  {
    name: "AUD/USD",
    base: "AUD",
    quote: "USD",
    pipDecimalPlaces: 4,
    group: "Major",
  },
  {
    name: "NZD/USD",
    base: "NZD",
    quote: "USD",
    pipDecimalPlaces: 4,
    group: "Major",
  },

  // EUR Pairs
  {
    name: "EUR/GBP",
    base: "EUR",
    quote: "GBP",
    pipDecimalPlaces: 4,
    group: "EUR",
  },
  {
    name: "EUR/JPY",
    base: "EUR",
    quote: "JPY",
    pipDecimalPlaces: 2,
    group: "EUR",
  },
  {
    name: "EUR/CHF",
    base: "EUR",
    quote: "CHF",
    pipDecimalPlaces: 4,
    group: "EUR",
  },
  {
    name: "EUR/CAD",
    base: "EUR",
    quote: "CAD",
    pipDecimalPlaces: 4,
    group: "EUR",
  },
  {
    name: "EUR/AUD",
    base: "EUR",
    quote: "AUD",
    pipDecimalPlaces: 4,
    group: "EUR",
  },
  {
    name: "EUR/NZD",
    base: "EUR",
    quote: "NZD",
    pipDecimalPlaces: 4,
    group: "EUR",
  },

  // GBP Pairs
  {
    name: "GBP/JPY",
    base: "GBP",
    quote: "JPY",
    pipDecimalPlaces: 2,
    group: "GBP",
  },
  {
    name: "GBP/CHF",
    base: "GBP",
    quote: "CHF",
    pipDecimalPlaces: 4,
    group: "GBP",
  },
  {
    name: "GBP/CAD",
    base: "GBP",
    quote: "CAD",
    pipDecimalPlaces: 4,
    group: "GBP",
  },
  {
    name: "GBP/AUD",
    base: "GBP",
    quote: "AUD",
    pipDecimalPlaces: 4,
    group: "GBP",
  },
  {
    name: "GBP/NZD",
    base: "GBP",
    quote: "NZD",
    pipDecimalPlaces: 4,
    group: "GBP",
  },

  // JPY Pairs
  {
    name: "AUD/JPY",
    base: "AUD",
    quote: "JPY",
    pipDecimalPlaces: 2,
    group: "JPY",
  },
  {
    name: "CAD/JPY",
    base: "CAD",
    quote: "JPY",
    pipDecimalPlaces: 2,
    group: "JPY",
  },
  {
    name: "CHF/JPY",
    base: "CHF",
    quote: "JPY",
    pipDecimalPlaces: 2,
    group: "JPY",
  },
  {
    name: "NZD/JPY",
    base: "NZD",
    quote: "JPY",
    pipDecimalPlaces: 2,
    group: "JPY",
  },

  // Other Pairs
  {
    name: "AUD/CAD",
    base: "AUD",
    quote: "CAD",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "AUD/CHF",
    base: "AUD",
    quote: "CHF",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "AUD/NZD",
    base: "AUD",
    quote: "NZD",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "CAD/CHF",
    base: "CAD",
    quote: "CHF",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "NZD/CAD",
    base: "NZD",
    quote: "CAD",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "NZD/CHF",
    base: "NZD",
    quote: "CHF",
    pipDecimalPlaces: 4,
    group: "Other",
  },

  // Exotic Pairs
  {
    name: "USD/SGD",
    base: "USD",
    quote: "SGD",
    pipDecimalPlaces: 4,
    group: "Exotic",
  },
  {
    name: "USD/HKD",
    base: "USD",
    quote: "HKD",
    pipDecimalPlaces: 4,
    group: "Exotic",
  },
  {
    name: "USD/TRY",
    base: "USD",
    quote: "TRY",
    pipDecimalPlaces: 4,
    group: "Exotic",
  },
  {
    name: "USD/ZAR",
    base: "USD",
    quote: "ZAR",
    pipDecimalPlaces: 4,
    group: "Exotic",
  },
  {
    name: "USD/MXN",
    base: "USD",
    quote: "MXN",
    pipDecimalPlaces: 4,
    group: "Exotic",
  },
  {
    name: "USD/PLN",
    base: "USD",
    quote: "PLN",
    pipDecimalPlaces: 4,
    group: "Exotic",
  },

  // Additional Cross Pairs
  {
    name: "EUR/SEK",
    base: "EUR",
    quote: "SEK",
    pipDecimalPlaces: 4,
    group: "EUR",
  },
  {
    name: "EUR/NOK",
    base: "EUR",
    quote: "NOK",
    pipDecimalPlaces: 4,
    group: "EUR",
  },
  {
    name: "GBP/SEK",
    base: "GBP",
    quote: "SEK",
    pipDecimalPlaces: 4,
    group: "GBP",
  },
  {
    name: "CAD/SGD",
    base: "CAD",
    quote: "SGD",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "CHF/SGD",
    base: "CHF",
    quote: "SGD",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "AUD/SGD",
    base: "AUD",
    quote: "SGD",
    pipDecimalPlaces: 4,
    group: "Other",
  },
  {
    name: "EUR/PLN",
    base: "EUR",
    quote: "PLN",
    pipDecimalPlaces: 4,
    group: "EUR",
  },
  {
    name: "EUR/HUF",
    base: "EUR",
    quote: "HUF",
    pipDecimalPlaces: 2,
    group: "EUR",
  },
];

// Get currency by code
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return currencies.find((currency) => currency.code === code);
};

// Get currency pair by name
export const getCurrencyPairByName = (
  name: string
): CurrencyPair | undefined => {
  return currencyPairs.find((pair) => pair.name === name);
};

// Get all currency pair groups
export const getCurrencyPairGroups = (): string[] => {
  return [...new Set(currencyPairs.map((pair) => pair.group))];
};

// Get currency pairs by group
export const getCurrencyPairsByGroup = (group: string): CurrencyPair[] => {
  return currencyPairs.filter((pair) => pair.group === group);
};

// Filter currencies by search term
export const filterCurrencies = (searchTerm: string): Currency[] => {
  const term = searchTerm.toLowerCase();
  return currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(term) ||
      currency.name.toLowerCase().includes(term)
  );
};

// Filter currency pairs by search term
export const filterCurrencyPairs = (searchTerm: string): CurrencyPair[] => {
  const term = searchTerm.toLowerCase();
  return currencyPairs.filter(
    (pair) =>
      pair.name.toLowerCase().includes(term) ||
      pair.base.toLowerCase().includes(term) ||
      pair.quote.toLowerCase().includes(term)
  );
};

// For backward compatibility with existing code
export const CURRENCIES = currencies.map((c) => c.code);
export const CURRENCY_PAIRS = currencyPairs.map((p) => p.name.replace("/", ""));
export const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  currencies.map((c) => [c.code, c.symbol])
);
export const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
  AUD: 2,
  CAD: 2,
  CHF: 2,
  NZD: 2,
  INR: 2,
};
export const PIP_VALUES: Record<string, number> = Object.fromEntries(
  currencyPairs.map((p) => [
    p.name.replace("/", ""),
    p.pipDecimalPlaces === 4 ? 0.0001 : 0.01,
  ])
);
