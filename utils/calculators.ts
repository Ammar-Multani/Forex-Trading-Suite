// Currency pairs with their pip values and decimal places
export const currencyPairs = [
  { label: 'EUR/USD', value: 'EUR/USD', pipDecimalPlace: 4, pipValue: 0.0001 },
  { label: 'GBP/USD', value: 'GBP/USD', pipDecimalPlace: 4, pipValue: 0.0001 },
  { label: 'USD/JPY', value: 'USD/JPY', pipDecimalPlace: 2, pipValue: 0.01 },
  { label: 'USD/CHF', value: 'USD/CHF', pipDecimalPlace: 4, pipValue: 0.0001 },
  { label: 'USD/CAD', value: 'USD/CAD', pipDecimalPlace: 4, pipValue: 0.0001 },
  { label: 'AUD/USD', value: 'AUD/USD', pipDecimalPlace: 4, pipValue: 0.0001 },
  { label: 'NZD/USD', value: 'NZD/USD', pipDecimalPlace: 4, pipValue: 0.0001 },
  { label: 'EUR/GBP', value: 'EUR/GBP', pipDecimalPlace: 4, pipValue: 0.0001 },
  { label: 'EUR/JPY', value: 'EUR/JPY', pipDecimalPlace: 2, pipValue: 0.01 },
  { label: 'GBP/JPY', value: 'GBP/JPY', pipDecimalPlace: 2, pipValue: 0.01 },
];

// Account currencies
export const accountCurrencies = [
  { label: 'USD', value: 'USD', symbol: '$' },
  { label: 'EUR', value: 'EUR', symbol: '€' },
  { label: 'GBP', value: 'GBP', symbol: '£' },
  { label: 'JPY', value: 'JPY', symbol: '¥' },
  { label: 'AUD', value: 'AUD', symbol: 'A$' },
  { label: 'CAD', value: 'CAD', symbol: 'C$' },
  { label: 'CHF', value: 'CHF', symbol: 'Fr' },
  { label: 'NZD', value: 'NZD', symbol: 'NZ$' },
];

// Get pip value for a currency pair
export function getPipValue(currencyPair: string): number {
  const pair = currencyPairs.find(p => p.value === currencyPair);
  return pair ? pair.pipValue : 0.0001;
}

// Get pip decimal place for a currency pair
export function getPipDecimalPlace(currencyPair: string): number {
  const pair = currencyPairs.find(p => p.value === currencyPair);
  return pair ? pair.pipDecimalPlace : 4;
}

// Get currency symbol
export function getCurrencySymbol(currency: string): string {
  const curr = accountCurrencies.find(c => c.value === currency);
  return curr ? curr.symbol : '$';
}

// Calculate pip difference between two prices
export function calculatePipDifference(
  price1: number,
  price2: number,
  currencyPair: string
): number {
  const pipValue = getPipValue(currencyPair);
  const difference = Math.abs(price1 - price2);
  return difference / pipValue;
}

// Calculate pip value in account currency
export function calculatePipValue(
  accountCurrency: string,
  currencyPair: string,
  lotSize: number,
  exchangeRate: number = 1
): number {
  const standardLotSize = 100000; // Standard lot size in forex
  const pipValue = getPipValue(currencyPair);
  
  // Base calculation for pip value
  let pipValueInAccountCurrency = (pipValue * standardLotSize * lotSize);
  
  // Apply exchange rate if needed
  if (currencyPair.startsWith(accountCurrency) || 
      (currencyPair.endsWith(accountCurrency) && !currencyPair.startsWith('USD'))) {
    // No conversion needed
    return pipValueInAccountCurrency;
  } else if (currencyPair.endsWith(accountCurrency)) {
    // Convert using the exchange rate
    return pipValueInAccountCurrency / exchangeRate;
  } else {
    // Need to convert using the exchange rate
    return pipValueInAccountCurrency * exchangeRate;
  }
}

// Calculate position size based on risk parameters
export function calculatePositionSize(
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLossPrice: number,
  currencyPair: string,
  exchangeRate: number = 1
): number {
  const riskAmount = accountBalance * (riskPercentage / 100);
  const pipValue = getPipValue(currencyPair);
  const pipDifference = Math.abs(entryPrice - stopLossPrice) / pipValue;
  
  if (pipDifference === 0) return 0;
  
  const standardLotSize = 100000; // Standard lot size in forex
  const pipValuePerLot = pipValue * standardLotSize * exchangeRate;
  
  const positionSizeInLots = riskAmount / (pipDifference * pipValuePerLot);
  return positionSizeInLots;
}

// Calculate margin requirement
export function calculateMargin(
  currencyPair: string,
  positionSize: number,
  leverage: number,
  price: number = 1
): number {
  const standardLotSize = 100000; // Standard lot size in forex
  const notionalValue = positionSize * standardLotSize * price;
  return notionalValue / leverage;
}

// Calculate profit/loss
export function calculateProfitLoss(
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  currencyPair: string,
  isLong: boolean = true,
  exchangeRate: number = 1
): { pips: number; amount: number; percentage: number } {
  const pipValue = getPipValue(currencyPair);
  const standardLotSize = 100000; // Standard lot size in forex
  
  // Calculate pip difference
  const priceDifference = exitPrice - entryPrice;
  const pipDifference = priceDifference / pipValue;
  
  // Adjust for long/short position
  const adjustedPipDifference = isLong ? pipDifference : -pipDifference;
  
  // Calculate profit/loss amount
  const plAmount = adjustedPipDifference * pipValue * standardLotSize * positionSize * exchangeRate;
  
  // Calculate percentage return
  const investmentValue = positionSize * standardLotSize * entryPrice / leverage;
  const percentage = (plAmount / investmentValue) * 100;
  
  return {
    pips: adjustedPipDifference,
    amount: plAmount,
    percentage: percentage,
  };
}

// Calculate Fibonacci retracement levels
export function calculateFibonacciLevels(
  highPrice: number,
  lowPrice: number,
  isUptrend: boolean = true
): {
  retracement: { level: number; price: number }[];
  extension: { level: number; price: number }[];
} {
  const priceDifference = highPrice - lowPrice;
  
  // Retracement levels
  const retracementLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  // Extension levels
  const extensionLevels = [1.272, 1.618, 2.618];
  
  let retracement: { level: number; price: number }[] = [];
  let extension: { level: number; price: number }[] = [];
  
  if (isUptrend) {
    // Uptrend: High to Low
    retracement = retracementLevels.map(level => ({
      level: level * 100,
      price: highPrice - (priceDifference * level),
    }));
    
    extension = extensionLevels.map(level => ({
      level: level * 100,
      price: highPrice + (priceDifference * (level - 1)),
    }));
  } else {
    // Downtrend: Low to High
    retracement = retracementLevels.map(level => ({
      level: level * 100,
      price: lowPrice + (priceDifference * level),
    }));
    
    extension = extensionLevels.map(level => ({
      level: level * 100,
      price: lowPrice - (priceDifference * (level - 1)),
    }));
  }
  
  return { retracement, extension };
}

// Calculate pivot points
export function calculatePivotPoints(
  high: number,
  low: number,
  close: number,
  method: 'standard' | 'woodie' | 'camarilla' | 'demark' = 'standard'
): {
  pivot: number;
  resistance: number[];
  support: number[];
} {
  let pivot = 0;
  let resistance: number[] = [];
  let support: number[] = [];
  
  switch (method) {
    case 'standard':
      pivot = (high + low + close) / 3;
      resistance = [
        2 * pivot - low, // R1
        pivot + (high - low), // R2
        pivot + 2 * (high - low), // R3
      ];
      support = [
        2 * pivot - high, // S1
        pivot - (high - low), // S2
        pivot - 2 * (high - low), // S3
      ];
      break;
      
    case 'woodie':
      pivot = (high + low + 2 * close) / 4;
      resistance = [
        2 * pivot - low, // R1
        pivot + (high - low), // R2
      ];
      support = [
        2 * pivot - high, // S1
        pivot - (high - low), // S2
      ];
      break;
      
    case 'camarilla':
      resistance = [
        close + (high - low) * 1.1 / 12, // R1
        close + (high - low) * 1.1 / 6, // R2
        close + (high - low) * 1.1 / 4, // R3
        close + (high - low) * 1.1 / 2, // R4
      ];
      support = [
        close - (high - low) * 1.1 / 12, // S1
        close - (high - low) * 1.1 / 6, // S2
        close - (high - low) * 1.1 / 4, // S3
        close - (high - low) * 1.1 / 2, // S4
      ];
      pivot = (resistance[0] + support[0]) / 2;
      break;
      
    case 'demark':
      const x = close > open ? high + 2 * low + close : 2 * high + low + close;
      pivot = x / 4;
      resistance = [
        x / 2 - low, // R1
      ];
      support = [
        x / 2 - high, // S1
      ];
      break;
  }
  
  return { pivot, resistance, support };
}

// Calculate compound interest
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number,
  frequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually' = 'annually'
): {
  endingBalance: number;
  totalEarnings: number;
  growthData: { year: number; balance: number }[];
} {
  let periodsPerYear = 1;
  
  switch (frequency) {
    case 'monthly':
      periodsPerYear = 12;
      break;
    case 'quarterly':
      periodsPerYear = 4;
      break;
    case 'semi-annually':
      periodsPerYear = 2;
      break;
    case 'annually':
      periodsPerYear = 1;
      break;
  }
  
  const totalPeriods = years * periodsPerYear;
  const ratePerPeriod = rate / 100 / periodsPerYear;
  
  let balance = principal;
  const growthData: { year: number; balance: number }[] = [{ year: 0, balance }];
  
  for (let period = 1; period <= totalPeriods; period++) {
    balance = balance * (1 + ratePerPeriod);
    
    // Record balance at the end of each year
    if (period % periodsPerYear === 0) {
      const year = period / periodsPerYear;
      growthData.push({ year, balance });
    }
  }
  
  const endingBalance = balance;
  const totalEarnings = endingBalance - principal;
  
  return { endingBalance, totalEarnings, growthData };
}

// Standard lot sizes
export const lotSizes = [
  { label: 'Standard (1.0)', value: 1.0 },
  { label: 'Mini (0.1)', value: 0.1 },
  { label: 'Micro (0.01)', value: 0.01 },
  { label: 'Nano (0.001)', value: 0.001 },
];

// Default leverage options
export const leverageOptions = [
  { label: '1:1', value: 1 },
  { label: '1:10', value: 10 },
  { label: '1:20', value: 20 },
  { label: '1:50', value: 50 },
  { label: '1:100', value: 100 },
  { label: '1:200', value: 200 },
  { label: '1:500', value: 500 },
  { label: '1:1000', value: 1000 },
];

// Default leverage value
export const defaultLeverage = 100;