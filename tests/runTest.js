// Simple script to run our pivot point tests
const { exec } = require("child_process");
const path = require("path");

const testFile = path.join(__dirname, "pivotPointsTest.ts");

// Use ts-node to run the TypeScript test file
exec(`npx ts-node ${testFile}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing test: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Test error: ${stderr}`);
    return;
  }

  console.log(stdout);
});
