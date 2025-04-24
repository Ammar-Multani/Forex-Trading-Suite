import RNHTMLtoPDF from "react-native-html-to-pdf";
import Share from "react-native-share";
import { Platform } from "react-native";
import { Currency, CurrencyPair } from "../constants/currencies";
import { formatCurrencyValue, formatPipValue } from "./pipCalculator";

interface GeneratePdfOptions {
  accountCurrency: Currency;
  currencyPair: CurrencyPair;
  pipValueInQuoteCurrency: number;
  pipValueInAccountCurrency: number;
  totalValueInQuoteCurrency: number;
  totalValueInAccountCurrency: number;
  exchangeRate: number;
  pipCount: number;
  positionSize: number;
  lotType: string;
  lotCount: number;
  pipDecimalPlaces?: number;
}

/**
 * Generate PDF with calculation results
 */
export const generatePdf = async (
  options: GeneratePdfOptions
): Promise<string | null> => {
  const {
    accountCurrency,
    currencyPair,
    pipValueInQuoteCurrency,
    pipValueInAccountCurrency,
    totalValueInQuoteCurrency,
    totalValueInAccountCurrency,
    exchangeRate,
    pipCount,
    positionSize,
    lotType,
    lotCount,
    pipDecimalPlaces = 4,
  } = options;

  // Format pip decimal place information
  const getDecimalPlaceText = (places: number): string => {
    if (places === 0) return "0th (whole unit)";
    if (places === 1) return "1st";
    if (places === 2) return "2nd";
    if (places === 3) return "3rd";
    return `${places}th`;
  };

  // Get pip decimal place example
  const getPipExample = (places: number): string => {
    if (places === 0) return "1";
    return `0.${"0".repeat(places - 1)}1`;
  };

  // Get quote currency details
  const quoteCurrencyCode = currencyPair.quote;
  const quoteCurrencySymbol =
    quoteCurrencyCode === "JPY"
      ? "¥"
      : quoteCurrencyCode === "USD"
      ? "$"
      : quoteCurrencyCode === "EUR"
      ? "€"
      : quoteCurrencyCode === "GBP"
      ? "£"
      : quoteCurrencyCode === "INR"
      ? "₹"
      : "";

  // Determine exchange rate display text
  let exchangeRateText = "";

  if (quoteCurrencyCode === accountCurrency.code) {
    // Same currency case
    exchangeRateText = `Same currency (${quoteCurrencyCode})`;
  } else {
    // Direct rate display matching professional trading platforms
    exchangeRateText = `1 ${quoteCurrencyCode} = ${
      accountCurrency.symbol
    }${exchangeRate.toFixed(6)} ${accountCurrency.code}`;
  }

  // Generate timestamp
  const now = new Date();
  const formattedDate = now.toLocaleDateString();
  const formattedTime = now.toLocaleTimeString();

  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3a7bd5;
            margin-bottom: 5px;
          }
          .timestamp {
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
          }
          .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .summary-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #3a7bd5;
          }
          .summary-value {
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
            color: #3a7bd5;
          }
          .summary-details {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            flex-wrap: wrap;
          }
          .detail-group {
            margin-bottom: 10px;
            flex-basis: 48%;
          }
          .detail-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
          }
          .detail-value {
            font-size: 14px;
            font-weight: bold;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          .result-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .result-label {
            font-size: 14px;
            color: #555;
          }
          .result-value {
            font-size: 14px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Forex Pip Calculator</div>
          <div class="timestamp">Generated on ${formattedDate} at ${formattedTime}</div>
        </div>
        
        <div class="summary">
          <div class="summary-title">Calculation Summary</div>
          <div class="summary-value">${
            accountCurrency.symbol
          }${totalValueInAccountCurrency.toFixed(2)} ${
    accountCurrency.code
  }</div>
          <div class="summary-details">
            <div class="detail-group">
              <div class="detail-label">Currency Pair</div>
              <div class="detail-value">${currencyPair.name}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Pip Count</div>
              <div class="detail-value">${pipCount} pip${
    pipCount !== 1 ? "s" : ""
  }</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Position Size</div>
              <div class="detail-value">${lotCount} ${lotType} lot${
    lotCount !== 1 ? "s" : ""
  } (${positionSize} units)</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Account Currency</div>
              <div class="detail-value">${accountCurrency.code}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Pip Value</div>
          <div class="result-row">
            <div class="result-label">Per Pip in ${quoteCurrencyCode}</div>
            <div class="result-value">${formatPipValue(
              pipValueInQuoteCurrency / (pipCount || 1),
              quoteCurrencyCode,
              quoteCurrencySymbol
            )}</div>
          </div>
          <div class="result-row">
            <div class="result-label">Per Pip in ${accountCurrency.code}</div>
            <div class="result-value">${formatPipValue(
              pipValueInAccountCurrency / (pipCount || 1),
              accountCurrency.code,
              accountCurrency.symbol
            )}</div>
          </div>
          <div class="result-row">
            <div class="result-label">Pip Decimal Place</div>
            <div class="result-value">${getDecimalPlaceText(
              pipDecimalPlaces
            )} (1 pip = ${getPipExample(pipDecimalPlaces)})</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Total Value (${pipCount} pips)</div>
          <div class="result-row">
            <div class="result-label">Total in ${quoteCurrencyCode}</div>
            <div class="result-value">${formatCurrencyValue(
              totalValueInQuoteCurrency,
              quoteCurrencyCode,
              quoteCurrencySymbol
            )}</div>
          </div>
          <div class="result-row">
            <div class="result-label">Total in ${accountCurrency.code}</div>
            <div class="result-value">${formatCurrencyValue(
              totalValueInAccountCurrency,
              accountCurrency.code,
              accountCurrency.symbol
            )}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Exchange Rate</div>
          <div class="result-row">
            <div class="result-label">Conversion Rate</div>
            <div class="result-value">${exchangeRateText}</div>
          </div>
        </div>
        
        <div class="footer">
          Created with Forex Pip Calculator App
        </div>
      </body>
    </html>
  `;

  try {
    // Generate PDF
    const options = {
      html: htmlContent,
      fileName: `Forex_Calculation_${formattedDate.replace(
        /\//g,
        "-"
      )}_${now.getTime()}`,
      directory: Platform.OS === "ios" ? "Documents" : "Downloads",
      width: 612, // Standard letter width in points (8.5 inches)
      height: 792, // Standard letter height in points (11 inches)
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};

/**
 * Share PDF with other apps
 */
export const sharePdf = async (filePath: string): Promise<void> => {
  try {
    const shareOptions = {
      title: "Share Forex Calculation Results",
      message: "Check out my forex pip calculation results",
      url: Platform.OS === "android" ? `file://${filePath}` : filePath,
      type: "application/pdf",
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.error("Error sharing PDF:", error);
  }
};
