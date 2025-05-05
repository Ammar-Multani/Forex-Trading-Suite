/**
 * Bundle Analyzer Script
 *
 * This script helps identify large dependencies and code that might be contributing
 * to a large app size.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Preparing for bundle analysis...");

try {
  // Create a directory for the bundle analysis
  const analysisDir = path.join(__dirname, "../analysis");
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir);
  }

  // Generate the production bundle to analyze its size
  console.log("Generating bundle for analysis...");
  execSync(
    "npx react-native bundle --dev false --platform android --entry-file index.ts --bundle-output analysis/bundle.js --sourcemap-output analysis/bundle.js.map",
    { stdio: "inherit" }
  );

  // Get the file size
  const bundleStats = fs.statSync(
    path.join(__dirname, "../analysis/bundle.js")
  );
  const bundleSizeMB = (bundleStats.size / (1024 * 1024)).toFixed(2);

  console.log(`\nBundle size: ${bundleSizeMB} MB`);

  // Install source-map-explorer if needed
  try {
    execSync("npx source-map-explorer --version", { stdio: "ignore" });
  } catch (e) {
    console.log("Installing source-map-explorer...");
    execSync("yarn add source-map-explorer --dev", { stdio: "inherit" });
  }

  // Analyze the bundle using source-map-explorer
  console.log("\nAnalyzing bundle with source-map-explorer...");
  execSync(
    "npx source-map-explorer analysis/bundle.js analysis/bundle.js.map --html analysis/bundle-analysis.html",
    { stdio: "inherit" }
  );

  console.log(
    "\nBundle analysis complete. Results saved to analysis/bundle-analysis.html"
  );
  console.log("\nRecommendations for reducing app size:");
  console.log(
    "1. Review analysis/bundle-analysis.html to identify large dependencies"
  );
  console.log(
    "2. Consider implementing code splitting and lazy loading for non-critical screens"
  );
  console.log("3. Remove unused dependencies from package.json");
  console.log("4. Optimize image assets using the optimize-assets script");
  console.log("5. Check for and remove unused imports and dead code");
  console.log("6. Consider using dynamic imports for rarely used features");
} catch (error) {
  console.error("Bundle analysis failed:", error);
}
