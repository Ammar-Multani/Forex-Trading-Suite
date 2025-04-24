// Manual test file for pivot point calculations
import { calculatePivotPoints } from "../utils/calculators";

// Test data
const high = 1.2;
const low = 1.19;
const close = 1.195;
const open = 1.192;

// Manual calculations for verification
// Standard method
const stdPP = (high + low + close) / 3; // PP = (H + L + C) / 3
const stdR1 = 2 * stdPP - low; // R1 = 2 * PP - L
const stdR2 = stdPP + (high - low); // R2 = PP + (H - L)
const stdR3 = stdPP + 2 * (high - low); // R3 = PP + 2 * (H - L)
const stdR4 = stdPP + 3 * (high - low); // R4 = PP + 3 * (H - L)
const stdS1 = 2 * stdPP - high; // S1 = 2 * PP - H
const stdS2 = stdPP - (high - low); // S2 = PP - (H - L)
const stdS3 = stdPP - 2 * (high - low); // S3 = PP - 2 * (H - L)
const stdS4 = stdPP - 3 * (high - low); // S4 = PP - 3 * (H - L)

// Woodie's method
const woodiePP = (high + low + 2 * close) / 4; // PP = (H + L + 2*C) / 4
const woodieR1 = 2 * woodiePP - low; // R1 = 2 * PP - L
const woodieR2 = woodiePP + (high - low); // R2 = PP + (H - L)
const woodieR3 = woodiePP + 2 * (high - low); // R3 = PP + 2 * (H - L)
const woodieR4 = woodiePP + 3 * (high - low); // R4 = PP + 3 * (H - L)
const woodieS1 = 2 * woodiePP - high; // S1 = 2 * PP - H
const woodieS2 = woodiePP - (high - low); // S2 = PP - (H - L)
const woodieS3 = woodiePP - 2 * (high - low); // S3 = PP - 2 * (H - L)
const woodieS4 = woodiePP - 3 * (high - low); // S4 = PP - 3 * (H - L)

// Camarilla method
const camPP = (high + low + close) / 3; // PP = (H + L + C) / 3
const camR1 = close + ((high - low) * 1.1) / 12; // R1 = C + ((H - L) * 1.1) / 12
const camR2 = close + ((high - low) * 1.1) / 6; // R2 = C + ((H - L) * 1.1) / 6
const camR3 = close + ((high - low) * 1.1) / 4; // R3 = C + ((H - L) * 1.1) / 4
const camR4 = close + ((high - low) * 1.1) / 2; // R4 = C + ((H - L) * 1.1) / 2
const camS1 = close - ((high - low) * 1.1) / 12; // S1 = C - ((H - L) * 1.1) / 12
const camS2 = close - ((high - low) * 1.1) / 6; // S2 = C - ((H - L) * 1.1) / 6
const camS3 = close - ((high - low) * 1.1) / 4; // S3 = C - ((H - L) * 1.1) / 4
const camS4 = close - ((high - low) * 1.1) / 2; // S4 = C - ((H - L) * 1.1) / 2

// DeMark method
const X = close > open ? high + 2 * low + close : 2 * high + low + close;
const demarkPP = X / 4; // PP = X / 4
const demarkR1 = X / 2 - low; // R1 = X / 2 - L
const demarkS1 = X / 2 - high; // S1 = X / 2 - H

// Test results from our utility function
const standardResult = calculatePivotPoints(high, low, close, "standard");
const woodieResult = calculatePivotPoints(high, low, close, "woodie");
const camarillaResult = calculatePivotPoints(high, low, close, "camarilla");
const demarkResult = calculatePivotPoints(high, low, close, "demark", open);

// Log manual calculations and utility results for comparison
console.log("Standard Method Manual Calculation:");
console.log(`PP: ${stdPP.toFixed(4)}`);
console.log(
  `R1: ${stdR1.toFixed(4)}, R2: ${stdR2.toFixed(4)}, R3: ${stdR3.toFixed(
    4
  )}, R4: ${stdR4.toFixed(4)}`
);
console.log(
  `S1: ${stdS1.toFixed(4)}, S2: ${stdS2.toFixed(4)}, S3: ${stdS3.toFixed(
    4
  )}, S4: ${stdS4.toFixed(4)}`
);
console.log("\nStandard Method Utility Result:");
console.log(`PP: ${standardResult.pivot.toFixed(4)}`);
console.log(
  `R1: ${standardResult.resistance[0].toFixed(
    4
  )}, R2: ${standardResult.resistance[1].toFixed(
    4
  )}, R3: ${standardResult.resistance[2].toFixed(
    4
  )}, R4: ${standardResult.resistance[3].toFixed(4)}`
);
console.log(
  `S1: ${standardResult.support[0].toFixed(
    4
  )}, S2: ${standardResult.support[1].toFixed(
    4
  )}, S3: ${standardResult.support[2].toFixed(
    4
  )}, S4: ${standardResult.support[3].toFixed(4)}`
);

console.log("\nWoodie Method Manual Calculation:");
console.log(`PP: ${woodiePP.toFixed(4)}`);
console.log(
  `R1: ${woodieR1.toFixed(4)}, R2: ${woodieR2.toFixed(
    4
  )}, R3: ${woodieR3.toFixed(4)}, R4: ${woodieR4.toFixed(4)}`
);
console.log(
  `S1: ${woodieS1.toFixed(4)}, S2: ${woodieS2.toFixed(
    4
  )}, S3: ${woodieS3.toFixed(4)}, S4: ${woodieS4.toFixed(4)}`
);
console.log("\nWoodie Method Utility Result:");
console.log(`PP: ${woodieResult.pivot.toFixed(4)}`);
console.log(
  `R1: ${woodieResult.resistance[0].toFixed(
    4
  )}, R2: ${woodieResult.resistance[1].toFixed(
    4
  )}, R3: ${woodieResult.resistance[2].toFixed(
    4
  )}, R4: ${woodieResult.resistance[3].toFixed(4)}`
);
console.log(
  `S1: ${woodieResult.support[0].toFixed(
    4
  )}, S2: ${woodieResult.support[1].toFixed(
    4
  )}, S3: ${woodieResult.support[2].toFixed(
    4
  )}, S4: ${woodieResult.support[3].toFixed(4)}`
);

console.log("\nCamarilla Method Manual Calculation:");
console.log(`PP: ${camPP.toFixed(4)}`);
console.log(
  `R1: ${camR1.toFixed(4)}, R2: ${camR2.toFixed(4)}, R3: ${camR3.toFixed(
    4
  )}, R4: ${camR4.toFixed(4)}`
);
console.log(
  `S1: ${camS1.toFixed(4)}, S2: ${camS2.toFixed(4)}, S3: ${camS3.toFixed(
    4
  )}, S4: ${camS4.toFixed(4)}`
);
console.log("\nCamarilla Method Utility Result:");
console.log(`PP: ${camarillaResult.pivot.toFixed(4)}`);
console.log(
  `R1: ${camarillaResult.resistance[0].toFixed(
    4
  )}, R2: ${camarillaResult.resistance[1].toFixed(
    4
  )}, R3: ${camarillaResult.resistance[2].toFixed(
    4
  )}, R4: ${camarillaResult.resistance[3].toFixed(4)}`
);
console.log(
  `S1: ${camarillaResult.support[0].toFixed(
    4
  )}, S2: ${camarillaResult.support[1].toFixed(
    4
  )}, S3: ${camarillaResult.support[2].toFixed(
    4
  )}, S4: ${camarillaResult.support[3].toFixed(4)}`
);

console.log("\nDeMark Method Manual Calculation:");
console.log(`X: ${X.toFixed(4)}`);
console.log(`PP: ${demarkPP.toFixed(4)}`);
console.log(`R1: ${demarkR1.toFixed(4)}`);
console.log(`S1: ${demarkS1.toFixed(4)}`);
console.log("\nDeMark Method Utility Result:");
console.log(`PP: ${demarkResult.pivot.toFixed(4)}`);
console.log(`R1: ${demarkResult.resistance[0].toFixed(4)}`);
console.log(`S1: ${demarkResult.support[0].toFixed(4)}`);

// Simple validation - return true if passed, false if failed
function isClose(a: number, b: number, tolerance = 0.0001): boolean {
  return Math.abs(a - b) < tolerance;
}

const standardPassed =
  isClose(stdPP, standardResult.pivot) &&
  isClose(stdR1, standardResult.resistance[0]) &&
  isClose(stdR2, standardResult.resistance[1]) &&
  isClose(stdR3, standardResult.resistance[2]) &&
  isClose(stdR4, standardResult.resistance[3]) &&
  isClose(stdS1, standardResult.support[0]) &&
  isClose(stdS2, standardResult.support[1]) &&
  isClose(stdS3, standardResult.support[2]) &&
  isClose(stdS4, standardResult.support[3]);

const woodiePassed =
  isClose(woodiePP, woodieResult.pivot) &&
  isClose(woodieR1, woodieResult.resistance[0]) &&
  isClose(woodieR2, woodieResult.resistance[1]) &&
  isClose(woodieR3, woodieResult.resistance[2]) &&
  isClose(woodieR4, woodieResult.resistance[3]) &&
  isClose(woodieS1, woodieResult.support[0]) &&
  isClose(woodieS2, woodieResult.support[1]) &&
  isClose(woodieS3, woodieResult.support[2]) &&
  isClose(woodieS4, woodieResult.support[3]);

const camarillaPassed =
  isClose(camPP, camarillaResult.pivot) &&
  isClose(camR1, camarillaResult.resistance[0]) &&
  isClose(camR2, camarillaResult.resistance[1]) &&
  isClose(camR3, camarillaResult.resistance[2]) &&
  isClose(camR4, camarillaResult.resistance[3]) &&
  isClose(camS1, camarillaResult.support[0]) &&
  isClose(camS2, camarillaResult.support[1]) &&
  isClose(camS3, camarillaResult.support[2]) &&
  isClose(camS4, camarillaResult.support[3]);

const demarkPassed =
  isClose(demarkPP, demarkResult.pivot) &&
  isClose(demarkR1, demarkResult.resistance[0]) &&
  isClose(demarkS1, demarkResult.support[0]);

console.log("\nValidation Results:");
console.log(`Standard Method: ${standardPassed ? "PASSED" : "FAILED"}`);
console.log(`Woodie Method: ${woodiePassed ? "PASSED" : "FAILED"}`);
console.log(`Camarilla Method: ${camarillaPassed ? "PASSED" : "FAILED"}`);
console.log(`DeMark Method: ${demarkPassed ? "PASSED" : "FAILED"}`);

if (standardPassed && woodiePassed && camarillaPassed && demarkPassed) {
  console.log("\n✅ All pivot point calculations are working correctly!");
} else {
  console.log("\n❌ Some pivot point calculations have issues!");
}
