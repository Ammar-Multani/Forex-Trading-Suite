# Forex Trading Suite - QA Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [How the App Works](#how-the-app-works)
3. [Technical Implementation](#technical-implementation)
4. [Non-Technical Explanation](#non-technical-explanation)
5. [Input/Output Flow](#inputoutput-flow)
6. [Key Formulas and Algorithms](#key-formulas-and-algorithms)
7. [Testing Guidelines](#testing-guidelines)

## Project Overview

The Forex Trading Suite is a comprehensive mobile application that provides professional forex trading tools for both beginner and experienced traders.

### Core Functionality and Purpose

The app offers a suite of calculators designed to help traders make informed decisions about forex trades, risk management, and technical analysis.

### Primary User Benefits

- Risk management through position sizing and stop-loss calculations
- Technical analysis with Fibonacci levels and pivot points
- Profit/loss projections and compounding calculations
- Quick reference tools for pip values and margin requirements

### Key Features

- Position Size Calculator for risk-based position sizing
- Profit/Loss Calculator for trade outcome projections
- Pip Calculator and Pip Difference Calculator for currency pair analysis
- Fibonacci Calculator for technical analysis
- Pivot Points Calculator for support/resistance identification
- Compounding Calculator for long-term investment planning
- Stop Loss/Take Profit Calculator for risk management
- Required Margin Calculator for leverage analysis

### Target Audience

- Active forex traders
- Technical analysts
- Portfolio managers
- Forex trading students and educators
- Risk management professionals

## How the App Works

### Initial Setup Requirements

1. Download and install the app on a mobile device
2. No account registration is required; the app works offline
3. For live exchange rates, an internet connection is needed
4. App preferences can be customized in Settings

### Step-by-Step Usage Flow

#### General Navigation:

1. Launch the app to access the main dashboard
2. Select a calculator from the grid of available tools
3. Input required data in the calculator form
4. View results displayed immediately as inputs change
5. Adjust inputs to see how results change in real-time
6. Return to dashboard by using the back button

#### Example Flow (Position Size Calculator):

1. Select "Position Size Calculator" from the dashboard
2. Enter account balance and currency
3. Select the forex pair for trading
4. Enter risk percentage or fixed risk amount
5. Input entry price and stop loss levels
6. View calculated position size in lots and units
7. Adjust inputs to optimize risk/reward

### Input Fields and Their Purpose

#### Common Inputs Across Calculators:

- **Currency Pair**: The forex pair being traded (e.g., EUR/USD)
- **Account Currency**: The currency of the trading account
- **Position Size**: Trading volume in lots (standard, mini, micro)
- **Entry Price**: Price at which a position is opened
- **Exit Price/Stop Loss/Take Profit**: Prices at which positions close

#### Specific Calculator Inputs:

- **Position Size Calculator**: Account balance, risk percentage, stop loss
- **Compounding Calculator**: Initial investment, interest rate, time period
- **Fibonacci Calculator**: High and low price points of a trend
- **Pivot Points Calculator**: High, low, and close prices of a period

### Output/Results Presentation

Results are displayed in clear, organized sections with:

- Primary results in highlighted boxes
- Secondary calculations displayed below
- Color-coding for profit (green) and loss (red) values
- Numerical results with appropriate decimal precision
- Unit labels (pips, lots, currency symbols) for clarity

## Technical Implementation

### Key Components and Their Relationships

#### Core Architecture:

- React Native with Expo for cross-platform compatibility
- Context API for global state management (ThemeContext, ExchangeRateContext)
- Custom hooks for business logic and API management
- Component-based UI with Paper and custom components

#### Main Components:

1. **Calculator Components** (`components/calculators/`):

   - Individual calculator implementations with specific logic
   - Example: PositionSizeCalculator, ProfitLossCalculator

2. **UI Components** (`components/ui/`):

   - Reusable UI elements like cards, selectors, and result displays
   - Used by calculator components for consistent presentation

3. **Data Management** (`contexts/`, `services/`, `utils/`):
   - API management for exchange rates
   - Storage utilities for saving calculator values
   - Calculation utilities with core algorithms

### Important Algorithms with Line Citations

#### Position Size Calculation:

```15:35:utils/calculators.ts
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
  // Calculate the risk amount based on the account balance and risk percentage
  const riskAmount = accountBalance * (riskPercentage / 100);

  // Determine pip decimal place based on currency pair
  const pipDecimal = currencyPair.includes("JPY") ? 2 : 4;

  // Calculate the standard pip value for 1 standard lot
  const pipValue = 10 ** -pipDecimal / 100000;

  // Calculate position size
  const positionSize = riskAmount / (stopLossPips * pipValue * 100000);

  return { positionSize, riskAmount, pipValue };
}
```

#### Fibonacci Calculation:

```97:126:utils/calculators.ts
export function calculateFibonacciLevels(
  highPrice: number,
  lowPrice: number,
  isUptrend: boolean
): {
  retracements: Array<{ level: number; price: number }>;
  extensions: Array<{ level: number; price: number }>;
} {
  const diff = highPrice - lowPrice;

  // Fibonacci retracement levels
  const retracementLevels = [0.236, 0.382, 0.5, 0.618, 0.786];
  const retracements = retracementLevels.map((level) => ({
    level: level * 100,
    price: isUptrend
      ? highPrice - diff * level // Uptrend: retrace from high down
      : lowPrice + diff * level, // Downtrend: retrace from low up
  }));

  // Fibonacci extension levels
  const extensionLevels = [
    2.618, 2.0, 1.618, 1.5, 1.382, 1.236, 1.0, 0.786, 0.618, 0.5, 0.382, 0.236,
  ];
  const extensions = extensionLevels.map((level) => ({
    level: level * 100,
    price: isUptrend
      ? lowPrice + diff * (level + 1) // Uptrend: extend beyond high
      : highPrice - diff * (level + 1), // Downtrend: extend below low
  }));

  return { retracements, extensions };
}
```

#### Pivot Point Calculation:

```192:262:utils/calculators.ts
export function calculatePivotPoints(
  high: number,
  low: number,
  close: number,
  method: "standard" | "woodie" | "camarilla" | "demark" | "fibonacci" = "standard",
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
    // Other methods implementation...
  }

  return { pivot, resistance, support };
}
```

### Data Flow Between Components

1. **User Input → Calculator Components**:

   - User enters data in calculator forms
   - Input state is managed within each calculator component
   - AsyncStorage preserves values between sessions

2. **Calculator Components → Utility Functions**:

   - Calculator components call utility functions with input values
   - Utility functions perform calculations and return results
   - Results are stored in component state and displayed

3. **API Data Flow**:
   - ApiManager singleton handles all API requests
   - Components access API through useApiManager hook
   - Exchange rate data is cached and shared across components

### External Services/APIs Integration

The app integrates with external forex rate APIs through the ApiManager singleton:

```1:30:services/api.ts
export class ApiManager {
  private static instance: ApiManager;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private activeComponents: Set<string> = new Set();

  // Methods for API requests with caching, batching, and lifecycle management

  async getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<number> {
    // Implementation of API request with caching
  }

  async getForexPairRate(pairString: string): Promise<number> {
    // Implementation of forex pair API request
  }
}
```

## Non-Technical Explanation

### Position Size Calculator - How It Works

The Position Size Calculator helps you decide how much money to risk on a single trade while following safe risk management practices.

#### What Inputs Are Needed

1. Your account balance (e.g., $10,000)
2. How much of your account you're willing to risk (e.g., 2%)
3. The currency pair you want to trade (e.g., EUR/USD)
4. Your entry price (e.g., 1.1000)
5. Your stop loss level (e.g., 1.0950)

#### Steps the App Takes to Process Them

1. The app calculates how much money you're risking based on your account balance and risk percentage (e.g., 2% of $10,000 = $200)
2. It determines how many pips difference exist between your entry and stop loss (e.g., 1.1000 - 1.0950 = 50 pips)
3. It calculates how much each pip is worth in your account currency
4. It divides your risk amount by the total pip value to determine position size

#### Specific Example with Actual Numbers

Let's say:

- Account balance: $10,000
- Risk percentage: 2% ($200)
- Currency pair: EUR/USD
- Entry price: 1.1000
- Stop loss: 1.0950 (50 pips away)

Calculation:

1. Risk amount: $10,000 × 2% = $200
2. Pip value for 1 standard lot (100,000 units) in EUR/USD ≈ $10 per pip
3. Total risk in pips: 50 pips
4. Maximum loss allowed: $200
5. Position size calculation: $200 ÷ (50 pips × $10) = 0.4 lots
6. Result: You should trade 0.4 lots (40,000 units) of EUR/USD

#### How Different Conditions Change the Results

- If you increase your risk percentage to 3%, your position size would increase to 0.6 lots
- If your stop loss is closer (25 pips), your position size would double to 0.8 lots
- If you're trading a different pair like USD/JPY, the pip value changes, affecting position size
- If your account currency differs from the quote currency, an exchange rate conversion is applied

### Fibonacci Calculator - How It Works

The Fibonacci Calculator helps traders identify potential support and resistance levels during price trends using mathematical ratios derived from the Fibonacci sequence.

#### What Inputs Are Needed

1. A significant high price (e.g., $1.2000)
2. A significant low price (e.g., $1.1000)
3. Whether the trend is up or down

#### Steps the App Takes to Process Them

1. The app calculates the difference between the high and low prices
2. It applies Fibonacci ratios (23.6%, 38.2%, 50%, 61.8%, 78.6%) to this difference
3. For retracements, it subtracts these values from the high price (uptrend) or adds them to the low price (downtrend)
4. For extensions, it projects the levels beyond the trend

#### Specific Example with Actual Numbers

Let's say:

- High price: $1.2000
- Low price: $1.1000
- Trend: Uptrend (price moved from $1.1000 to $1.2000)

Calculation for retracements:

1. Price difference: $1.2000 - $1.1000 = $0.1000
2. 23.6% retracement: $1.2000 - ($0.1000 × 0.236) = $1.1764
3. 38.2% retracement: $1.2000 - ($0.1000 × 0.382) = $1.1618
4. 50.0% retracement: $1.2000 - ($0.1000 × 0.5) = $1.1500
5. 61.8% retracement: $1.2000 - ($0.1000 × 0.618) = $1.1382
6. 78.6% retracement: $1.2000 - ($0.1000 × 0.786) = $1.1214

The calculated levels ($1.1764, $1.1618, $1.1500, $1.1382, $1.1214) represent potential support levels where the price might reverse back up.

#### How Different Conditions Change the Results

- In a downtrend scenario, the calculations would be reversed
- With larger price movements, the Fibonacci levels are more spread out
- Different market conditions might make certain Fibonacci levels more relevant than others

## Input/Output Flow

### Position Size Calculator Flow

```
START
↓
USER INPUT
    → Account Balance Input ($10,000)
    → Risk Percentage Input (2%)
    → Currency Pair Selection (EUR/USD)
    → Entry Price Input (1.1000)
    → Stop Loss Input (50 pips or price 1.0950)
↓
VALIDATION
    → Check if all inputs are valid numbers
    → Verify account balance > 0
    → Ensure risk percentage is between 0.1-100%
    → Confirm entry price and stop loss are valid
↓
DATA PROCESSING
    → Calculate risk amount ($200)
    → Determine pip value ($10 per pip for 1 standard lot)
    → Convert stop loss to pips if entered as price
    → Account for currency conversions if needed
↓
CALCULATION
    → Apply position size formula:
      Position Size = Risk Amount / (Stop Loss Pips × Pip Value)
    → Convert position size to lots/units
↓
RESULT GENERATION
    → Position Size in Lots (0.4)
    → Position Size in Units (40,000)
    → Max Loss Amount ($200)
    → Pip Value for Position ($4 per pip)
↓
ERROR HANDLING
    → If division by zero (no stop loss) → Display error
    → If invalid inputs → Show validation messages
    → If calculation produces extreme values → Show warning
↓
END
```

### Profit/Loss Calculator Flow

```
START
↓
USER INPUT
    → Currency Pair Selection (GBP/USD)
    → Position Size Input (0.5 lots)
    → Entry Price Input (1.2500)
    → Exit Price Input (1.2600)
    → Position Type Selection (Long/Short)
↓
VALIDATION
    → Check if all inputs are valid numbers
    → Verify position size > 0
    → Confirm entry and exit prices are valid
↓
DATA PROCESSING
    → Calculate pip difference (100 pips)
    → Determine pip value ($10 per pip for 1 standard lot)
    → Adjust calculation based on position type
↓
CALCULATION
    → Apply profit/loss formula:
      P/L = Pip Difference × Pip Value × Position Size
    → Calculate ROI percentage
↓
RESULT GENERATION
    → Profit/Loss Amount ($500)
    → Number of Pips (100)
    → Return on Investment (4%)
↓
ERROR HANDLING
    → If invalid inputs → Show validation messages
    → If API rate fetch fails → Show cached/default values
↓
END
```

## Key Formulas and Algorithms

### Position Size Calculation

**Mathematical Formula:**

```
Position Size (in standard lots) = Risk Amount / (Stop Loss in Pips × Pip Value)
```

**Variables:**

- Risk Amount: The amount of money willing to risk (account balance × risk percentage)
- Stop Loss in Pips: Distance from entry to stop loss in pips
- Pip Value: Value of one pip in account currency for 1 standard lot

**Code Implementation:**

```294:322:utils/calculators.ts
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
  // Formula implementation
}
```

**Example Calculation:**

1. Account balance: $10,000
2. Risk percentage: 2%
3. Risk amount: $10,000 × 0.02 = $200
4. Stop loss: 50 pips
5. Pip value for 1 standard lot in EUR/USD: $10
6. Position size: $200 ÷ (50 × $10) = 0.4 lots

### Profit/Loss Calculation

**Mathematical Formula:**

```
Profit/Loss = Pip Difference × Pip Value × Position Size × Direction
```

**Variables:**

- Pip Difference: Number of pips between entry and exit prices
- Pip Value: Value of one pip in account currency
- Position Size: Size of position in standard lots
- Direction: 1 for profitable trade, -1 for losing trade (based on long/short and price movement)

**Code Implementation:**

```323:366:utils/calculators.ts
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
  // Formula implementation
}
```

**Example Calculation:**

1. Entry price: 1.2500
2. Exit price: 1.2600
3. Position size: 0.5 lots
4. Trade direction: Long
5. Pip difference: 100 pips
6. Pip value: $10 per pip for 1 standard lot
7. Profit/Loss: 100 × $10 × 0.5 × 1 = $500

### Pivot Point Calculation (Standard Method)

**Mathematical Formula:**

```
Pivot Point (PP) = (High + Low + Close) / 3
Resistance 1 (R1) = (2 × PP) - Low
Resistance 2 (R2) = PP + (High - Low)
Resistance 3 (R3) = PP + 2 × (High - Low)
Support 1 (S1) = (2 × PP) - High
Support 2 (S2) = PP - (High - Low)
Support 3 (S3) = PP - 2 × (High - Low)
```

**Variables:**

- High: Highest price of the previous period
- Low: Lowest price of the previous period
- Close: Closing price of the previous period
- PP: Pivot Point (central pivot)
- R1, R2, R3: Resistance levels
- S1, S2, S3: Support levels

**Code Implementation:**

```192:211:utils/calculators.ts
// Standard pivot points calculation in the calculatePivotPoints function
case "standard":
  pivot = (high + low + close) / 3;
  resistance[0] = 2 * pivot - low;
  resistance[1] = pivot + (high - low);
  resistance[2] = pivot + 2 * (high - low);
  support[0] = 2 * pivot - high;
  support[1] = pivot - (high - low);
  support[2] = pivot - 2 * (high - low);
  break;
```

**Example Calculation:**

1. Previous period high: 1.3000
2. Previous period low: 1.2800
3. Previous period close: 1.2900
4. Pivot Point: (1.3000 + 1.2800 + 1.2900) / 3 = 1.2900
5. Resistance 1: (2 × 1.2900) - 1.2800 = 1.3000
6. Resistance 2: 1.2900 + (1.3000 - 1.2800) = 1.3100
7. Resistance 3: 1.2900 + 2 × (1.3000 - 1.2800) = 1.3300
8. Support 1: (2 × 1.2900) - 1.3000 = 1.2800
9. Support 2: 1.2900 - (1.3000 - 1.2800) = 1.2700
10. Support 3: 1.2900 - 2 × (1.3000 - 1.2800) = 1.2500

## Testing Guidelines

### Functional Testing Areas

1. **Input Validation Testing**

   - Verify all numeric input fields handle valid and invalid inputs
   - Test boundary conditions (zero, negative, extremely large values)
   - Verify currency pair and account currency selectors load correctly

2. **Calculation Accuracy Testing**

   - Verify all calculator outputs match expected results for known inputs
   - Test all formulas with multiple sample datasets
   - Verify rounding behavior matches requirements

3. **UI/UX Testing**

   - Verify all UI elements are visible and properly aligned
   - Test navigation between calculators and main menu
   - Verify dark/light theme switching
   - Test responsiveness on different screen sizes

4. **Integration Testing**

   - Verify API integration for exchange rates
   - Test offline functionality
   - Verify persistence of calculator values between sessions

5. **Performance Testing**
   - Measure calculation speed for complex operations
   - Test app behavior with large input values
   - Verify smooth scrolling and navigation

### Edge Case Scenarios

1. **Extreme Values**

   - Very large account balances (>$1,000,000)
   - Very small position sizes (<0.01 lots)
   - Very tight stop losses (<5 pips)
   - Very wide stop losses (>1000 pips)

2. **Network Conditions**

   - No internet connection
   - Slow/intermittent connection
   - API rate limiting or failure

3. **User Behavior**

   - Rapid input changes
   - Invalid input sequences
   - Multiple calculator switching

4. **Currency Edge Cases**
   - Cross-currency calculations (e.g., account in EUR, trading GBP/JPY)
   - High volatility pairs
   - Exotic currency pairs

### Specific Test Cases with Expected Results

#### Test Case 1: Position Size Calculator - Standard Use Case

- **Inputs:**
  - Account Currency: USD
  - Currency Pair: EUR/USD
  - Account Balance: $10,000
  - Risk Percentage: 2%
  - Entry Price: 1.1000
  - Stop Loss: 50 pips
- **Expected Output:**
  - Risk Amount: $200
  - Position Size: 0.4 lots (40,000 units)
  - Pip Value: $4 per pip
- **Verification Steps:**
  1. Enter all inputs as specified
  2. Verify risk amount calculation: $10,000 × 2% = $200
  3. Verify pip value calculation: 1 pip for 1 standard lot = $10
  4. Verify position size calculation: $200 ÷ (50 × $10) = 0.4 lots

#### Test Case 2: Profit/Loss Calculator - Long Position Profit

- **Inputs:**
  - Currency Pair: GBP/USD
  - Position Size: 0.5 lots
  - Entry Price: 1.2500
  - Exit Price: 1.2600
  - Position Type: Long
- **Expected Output:**
  - Pip Difference: 100 pips
  - Profit/Loss: $500 profit
  - ROI: ~4%
- **Verification Steps:**
  1. Enter all inputs as specified
  2. Verify pip difference calculation: (1.2600 - 1.2500) × 10,000 = 100 pips
  3. Verify profit calculation: 100 pips × $10 per pip × 0.5 lots = $500
  4. Verify ROI calculation based on margin requirement

#### Test Case 3: Fibonacci Calculator - Uptrend Retracement

- **Inputs:**
  - High Price: 1.2000
  - Low Price: 1.1000
  - Trend: Uptrend
- **Expected Output:**
  - 23.6% Retracement: 1.1764
  - 38.2% Retracement: 1.1618
  - 50.0% Retracement: 1.1500
  - 61.8% Retracement: 1.1382
  - 78.6% Retracement: 1.1214
- **Verification Steps:**
  1. Enter all inputs as specified
  2. Calculate price difference: 1.2000 - 1.1000 = 0.1000
  3. Verify each retracement level:
     - 23.6%: 1.2000 - (0.1000 × 0.236) = 1.1764
     - 38.2%: 1.2000 - (0.1000 × 0.382) = 1.1618
     - etc.

### Performance Considerations

- Calculations should complete within 100ms
- UI should remain responsive during calculations
- API calls should be minimized using the caching mechanism
- Memory usage should remain stable during extended use

### Common Failure Points to Check

- Handling of decimal precision in pip calculations
- Currency conversion accuracy for cross-currency pairs
- Persistence of user settings across app restarts
- API error handling and fallback mechanisms
- Edge case handling for exotic currency pairs
