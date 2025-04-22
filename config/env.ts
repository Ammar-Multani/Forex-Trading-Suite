// Environment configuration with type safety
// Don't use Node.js dotenv in React Native
// Instead, directly access environment variables

// Environment variable types
interface EnvironmentConfig {
  traderMadeApiKey: string;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

// For React Native, define your environment variables directly
// You'll need to add these to your build process or use a different approach
const TRADER_MADE_API_KEY = process.env.EXPO_PUBLIC_TRADER_MADE_API_KEY;
const NODE_ENV = process.env.EXPO_PUBLIC_NODE_ENV || "development";

// Validate required environment variables
const validateEnv = (envVar: string | undefined, name: string): string => {
  if (!envVar) {
    // In development, provide warning but don't crash
    if (NODE_ENV === "development") {
      console.warn(`Missing environment variable: ${name}`);
      return "DEVELOPMENT_PLACEHOLDER";
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return envVar;
};

// Create and validate environment configuration
const createEnvironmentConfig = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    traderMadeApiKey: validateEnv(
      TRADER_MADE_API_KEY,
      "EXPO_PUBLIC_TRADER_MADE_API_KEY"
    ),
    nodeEnv: NODE_ENV,
    isDevelopment: NODE_ENV === "development",
    isProduction: NODE_ENV === "production",
    isTest: NODE_ENV === "test",
  };

  return config;
};

// Export the environment configuration
const env: EnvironmentConfig = createEnvironmentConfig();

export default env;
