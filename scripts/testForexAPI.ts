import { fetchExchangeRate } from "../services/api";

// Test function to log a live currency pair exchange rate
async function testForexAPI() {
  try {
    // Fetch EUR/USD exchange rate
    const rate = await fetchExchangeRate("EUR", "USD");

    console.log("===== FOREX API TEST =====");
    console.log(`Current EUR/USD exchange rate: ${rate}`);
    console.log("=========================");

    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw error;
  }
}

// Run the test
testForexAPI()
  .then(() => console.log("Test completed successfully"))
  .catch((err) => console.error("Test failed:", err));
