// This script can be run with 'npx expo-cli run:web' in the background
import env from "../config/env";

async function testForexAPI() {
  try {
    console.log("Testing Forex API...");

    // Use the TraderMade API directly for this test
    const pairString = "EURUSD";
    const url = `https://marketdata.tradermade.com/api/v1/live?api_key=${env.traderMadeApiKey}&currency=${pairString}`;

    console.log(`Fetching from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    if (
      data &&
      data.quotes &&
      Array.isArray(data.quotes) &&
      data.quotes.length > 0
    ) {
      const quote = data.quotes[0];
      console.log(
        `Current ${quote.currency} Rate: ${quote.mid || quote.price}`
      );
    } else {
      console.log("No quotes found in the response");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Export the function so it can be imported and run in the app
export default testForexAPI;
