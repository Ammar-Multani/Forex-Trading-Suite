// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add support for importing SVG files
config.resolver.assetExts.push('svg');
config.resolver.sourceExts.push('svg');

// Enable Reanimated support
const wrappedConfig = wrapWithReanimatedMetroConfig(config);

// Export the Metro configuration
module.exports = wrappedConfig;
