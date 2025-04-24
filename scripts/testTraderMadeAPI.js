// Simple script to test TraderMade API directly
// Run with: node scripts/testTraderMadeAPI.js
require("dotenv").config();

const apiKey = process.env.EXPO_PUBLIC_TRADER_MADE_API_KEY;

if (!apiKey) {
  console.error(
    "Error: TraderMade API key not found. Please check your .env file."
  );
  process.exit(1);
}

async function testTraderMadeAPI() {
  try {
    console.log("Testing TraderMade API...");

    // Test with multiple currency pairs
    const currencyPairs = "EURUSD,GBPUSD,USDJPY";
    const url = `https://marketdata.tradermade.com/api/v1/live?currency=${currencyPairs}&api_key=${apiKey}`;

    console.log(`Fetching from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("\nAPI Response:");
    console.log(JSON.stringify(data, null, 2));

    // Display in a more readable format
    if (data && data.quotes && Array.isArray(data.quotes)) {
      console.log("\nParsed Exchange Rates:");
      data.quotes.forEach((quote) => {
        console.log(
          `${quote.base_currency}/${quote.quote_currency}: Bid=${quote.bid} Ask=${quote.ask} Mid=${quote.mid}`
        );
      });
    }

    console.log(
      "\nTimestamp:",
      new Date(data.timestamp * 1000).toLocaleString()
    );
    console.log("Server time:", data.requested_time);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the test
testTraderMadeAPI();
