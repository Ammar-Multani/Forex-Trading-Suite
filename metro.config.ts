// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add support for importing SVG files
config.resolver.assetExts.push("svg");
config.resolver.sourceExts.push("svg");

// Enable minification and optimization
config.transformer.minifierConfig = {
  compress: {
    // Remove console statements and comments in production
    drop_console: true,
    drop_debugger: true,
  },
  mangle: true,
};

// Disable source maps in production
if (process.env.NODE_ENV === "production") {
  config.transformer.sourceMaps = false;
}

// Enable Reanimated support
const wrappedConfig = wrapWithReanimatedMetroConfig(config);

// Export the Metro configuration
module.exports = wrappedConfig;
