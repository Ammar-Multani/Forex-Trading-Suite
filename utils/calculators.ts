// Utility functions for forex calculations

// Format number with commas and decimal places
export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Format currency with symbol
export function formatCurrency(
  amount: number,
  currency = "USD",
  decimals = 2
): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CHF: "Fr",
    AUD: "A$",
    CAD: "C$",
    NZD: "NZ$",
  };

  const symbol = symbols[currency] || currency;

  // Special case for JPY which typically doesn't use decimal places
  const actualDecimals = currency === "JPY" ? 0 : decimals;

  return `${symbol}${formatNumber(amount, actualDecimals)}`;
}

// Calculate compound interest with enhanced features
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  frequency: number,
  years: number,
  additionalContributions: number = 0,
  contributionFrequency: number = frequency,
  withdrawals: number = 0,
  withdrawalFrequency: number = frequency,
  taxRate: number = 0,
  compoundingFrequency: number = frequency
): {
  endBalance: number;
  totalEarnings: number;
  growthData: Array<{ x: number; y: number }>;
  totalContributions?: number;
  totalWithdrawals?: number;
  totalTaxesPaid?: number;
  effectiveAnnualRate?: number;
} {
  const periods = Math.max(1, Math.floor(frequency * years));
  const ratePerPeriod = rate / 100 / compoundingFrequency;

  let balance = principal;
  let totalContributions = principal;
  let totalWithdrawals = 0;
  let totalTaxesPaid = 0;

  const growthData = [{ x: 0, y: principal }];

  for (let i = 1; i <= periods; i++) {
    // Calculate interest for this period
    const interestEarned = balance * ratePerPeriod;

    // Apply tax on interest if applicable
    const taxAmount = interestEarned * (taxRate / 100);
    totalTaxesPaid += taxAmount;

    // Add interest (minus tax) to balance
    balance += interestEarned - taxAmount;

    // Add additional contribution if it's time
    if (
      additionalContributions > 0 &&
      i % Math.floor(frequency / contributionFrequency) === 0
    ) {
      balance += additionalContributions;
      totalContributions += additionalContributions;
    }

    // Subtract withdrawal if it's time
    if (
      withdrawals > 0 &&
      i % Math.floor(frequency / withdrawalFrequency) === 0
    ) {
      balance = Math.max(0, balance - withdrawals);
      totalWithdrawals += withdrawals;
    }

    // Add data point for each year or at the end
    if (i % frequency === 0 || i === periods) {
      growthData.push({
        x: i / frequency,
        y: balance,
      });
    }
  }

  const endBalance = balance;
  const totalEarnings = endBalance - totalContributions + totalWithdrawals;

  // Calculate effective annual rate
  const effectiveAnnualRate =
    (Math.pow(1 + ratePerPeriod, compoundingFrequency) - 1) * 100;

  return {
    endBalance,
    totalEarnings,
    growthData,
    totalContributions,
    totalWithdrawals,
    totalTaxesPaid,
    effectiveAnnualRate,
  };
}

// Calculate Fibonacci levels
export function calculateFibonacciLevels(
  highPrice: number,
  lowPrice: number,
  isUptrend: boolean
): {
  retracements: Array<{ level: number; price: number }>;
  extensions: Array<{ level: number; price: number }>;
} {
  const diff = isUptrend ? highPrice - lowPrice : lowPrice - highPrice;
  const basePrice = isUptrend ? highPrice : lowPrice;

  // Fibonacci retracement levels
  const retracementLevels = [0.236, 0.382, 0.5, 0.618, 0.786];
  const retracements = retracementLevels.map((level) => ({
    level: level * 100,
    price: isUptrend ? basePrice - diff * level : basePrice + diff * level,
  }));

  // Fibonacci extension levels
  const extensionLevels = [
    2.618, 2.0, 1.618, 1.5, 1.382, 1.236, 1.0, 0.618, 0.5, 0.382, 0.236,
  ];
  const extensions = extensionLevels.map((level) => ({
    level: level * 100,
    price: isUptrend
      ? basePrice + diff * (level - 1)
      : basePrice - diff * (level - 1),
  }));

  return { retracements, extensions };
}

// Calculate pip difference
export function calculatePipDifference(
  priceA: number,
  priceB: number,
  currencyPair: string
): number {
  // Determine pip decimal place based on currency pair
  const pipDecimal = currencyPair.includes("JPY") ? 2 : 4;
  const pipFactor = Math.pow(10, pipDecimal);

  // Calculate pip difference
  return Math.abs((priceA - priceB) * pipFactor);
}

// Calculate pip value
export function calculatePipValue(
  currencyPair: string,
  accountCurrency: string,
  lotSize: number
): number {
  // Standard lot size is 100,000 units
  const standardLot = 100000;
  const actualSize = lotSize * standardLot;

  // Extract base and quote currencies
  const [baseCurrency, quoteCurrency] = currencyPair.split("/");

  // Determine pip decimal place based on currency pair
  const pipDecimal = currencyPair.includes("JPY") ? 2 : 4;
  const pipSize = Math.pow(10, -pipDecimal);

  // Calculate pip value in quote currency
  let pipValue = actualSize * pipSize;

  // Convert to account currency if needed
  if (quoteCurrency !== accountCurrency) {
    // This is a simplified conversion - in a real app, you would use current exchange rates
    // For now, we'll use a placeholder conversion rate of 1
    const conversionRate = 1;
    pipValue = pipValue * conversionRate;
  }

  return pipValue;
}

// Calculate pivot points
export function calculatePivotPoints(
  high: number,
  low: number,
  close: number,
  method:
    | "standard"
    | "woodie"
    | "camarilla"
    | "demark"
    | "fibonacci" = "standard",
  open?: number
): {
  pivot: number;
  resistance: number[];
  support: number[];
} {
  let pivot = 0;
  let resistance = [0, 0, 0];
  let support = [0, 0, 0];

  switch (method) {
    case "standard":
      pivot = (high + low + close) / 3;
      resistance[0] = 2 * pivot - low;
      resistance[1] = pivot + (high - low);
      resistance[2] = pivot + 2 * (high - low);
      support[0] = 2 * pivot - high;
      support[1] = pivot - (high - low);
      support[2] = pivot - 2 * (high - low);
      break;

    case "woodie":
      pivot = (high + low + 2 * close) / 4;
      resistance[0] = 2 * pivot - low;
      resistance[1] = pivot + (high - low);
      resistance[2] = pivot + 2 * (high - low);
      support[0] = 2 * pivot - high;
      support[1] = pivot - (high - low);
      support[2] = pivot - 2 * (high - low);
      break;

    case "camarilla":
      resistance[0] = close + ((high - low) * 1.1) / 12;
      resistance[1] = close + ((high - low) * 1.1) / 6;
      resistance[2] = close + ((high - low) * 1.1) / 4;
      pivot = (high + low + close) / 3;
      support[0] = close - ((high - low) * 1.1) / 12;
      support[1] = close - ((high - low) * 1.1) / 6;
      support[2] = close - ((high - low) * 1.1) / 4;
      break;

    case "fibonacci":
      pivot = (high + low + close) / 3;
      // Fibonacci ratios: 0.382, 0.618, 1.000
      const range = high - low;
      resistance[0] = pivot + 0.382 * range;
      resistance[1] = pivot + 0.618 * range;
      resistance[2] = pivot + 1.0 * range;
      support[0] = pivot - 0.382 * range;
      support[1] = pivot - 0.618 * range;
      support[2] = pivot - 1.0 * range;
      break;

    case "demark":
      // Make sure open price is available for DeMark method
      if (open === undefined) {
        open = close; // Fallback if open price is not provided
      }
      const x = close > open ? high + 2 * low + close : 2 * high + low + close;
      pivot = x / 4;
      resistance[0] = x / 2 - low;
      support[0] = x / 2 - high;
      // Demark only has one level of support/resistance
      resistance[1] = resistance[0];
      resistance[2] = resistance[0];
      support[1] = support[0];
      support[2] = support[0];
      break;
  }

  return { pivot, resistance, support };
}

// Calculate position size
export function calculatePositionSize(
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLossPips: number,
  currencyPair: string,
  accountCurrency: string
): {
  positionSize: number;
  riskAmount: number;
  pipValue: number;
} {
  // Calculate risk amount
  const riskAmount = accountBalance * (riskPercentage / 100);

  // Calculate pip value
  const pipValue = calculatePipValue(currencyPair, accountCurrency, 1);

  // Calculate position size in lots
  const positionSize = riskAmount / (stopLossPips * pipValue);

  return {
    positionSize: Math.min(positionSize, 100), // Cap at 100 lots for safety
    riskAmount,
    pipValue,
  };
}

// Calculate profit/loss
export function calculateProfitLoss(
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  currencyPair: string,
  accountCurrency: string,
  isLong: boolean = true
): {
  pips: number;
  profitLoss: number;
  roi: number;
} {
  // Calculate pip difference
  const pipDiff = calculatePipDifference(entryPrice, exitPrice, currencyPair);

  // Calculate pip value
  const pipValue = calculatePipValue(
    currencyPair,
    accountCurrency,
    positionSize
  );

  // Calculate profit/loss
  const direction = isLong
    ? exitPrice > entryPrice
      ? 1
      : -1
    : exitPrice < entryPrice
    ? 1
    : -1;
  const profitLoss = direction * pipDiff * pipValue;

  // Calculate ROI (Return on Investment)
  const investment = positionSize * 100000 * entryPrice;
  const roi = (profitLoss / investment) * 100;

  return {
    pips: direction * pipDiff,
    profitLoss,
    roi,
  };
}

// Calculate margin
export function calculateMargin(
  currencyPair: string,
  accountCurrency: string,
  positionSize: number,
  leverage: number
): {
  requiredMargin: number;
  marginLevel: number;
} {
  // Extract base and quote currencies
  const [baseCurrency, quoteCurrency] = currencyPair.split("/");

  // Standard lot size is 100,000 units
  const standardLot = 100000;
  const actualSize = positionSize * standardLot;

  // For simplicity, we'll use a placeholder exchange rate of 1
  // In a real app, you would use current exchange rates
  const exchangeRate = 1;

  // Calculate position value in account currency
  const positionValue = actualSize * exchangeRate;

  // Calculate required margin
  const requiredMargin = positionValue / leverage;

  // Calculate margin level (assuming no other positions)
  const marginLevel = 100; // 100% if this is the only position

  return {
    requiredMargin,
    marginLevel,
  };
}

// Calculate stop loss and take profit
export function calculateStopLossTakeProfit(
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number,
  positionSize: number,
  currencyPair: string,
  accountCurrency: string,
  isLong: boolean = true
): {
  riskRewardRatio: number;
  stopLossPips: number;
  takeProfitPips: number;
  stopLossAmount: number;
  takeProfitAmount: number;
  pipValue: number;
} {
  // Calculate pip differences
  const stopLossPips = calculatePipDifference(
    entryPrice,
    stopLossPrice,
    currencyPair
  );
  const takeProfitPips = calculatePipDifference(
    entryPrice,
    takeProfitPrice,
    currencyPair
  );

  // Calculate pip value
  const pipValue = calculatePipValue(
    currencyPair,
    accountCurrency,
    positionSize
  );

  // Calculate monetary values
  const stopLossAmount = stopLossPips * pipValue;
  const takeProfitAmount = takeProfitPips * pipValue;

  // Calculate risk/reward ratio
  const riskRewardRatio = takeProfitAmount / stopLossAmount;

  return {
    riskRewardRatio,
    stopLossPips,
    takeProfitPips,
    stopLossAmount,
    takeProfitAmount,
    pipValue,
  };
}

/**
 * Calculate pip value in quote currency
 * This follows standard forex pip calculation used by professional trading platforms
 */
export const calculatePipValueInQuoteCurrency = (
  currencyPair: any,
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
