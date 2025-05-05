/**
 * Image Optimization Script
 *
 * This script optimizes PNG, JPEG, and other image assets to reduce their file size
 * while maintaining acceptable quality.
 */

const fs = require("fs");
const path = require("path");

const ASSETS_DIR = path.join(__dirname, "../assets");
const QUALITY = 80; // Adjust quality as needed (0-100)

// Simple image optimization using Sharp only (avoiding ESM issues with imagemin)
async function run() {
  console.log("Starting asset optimization...");

  try {
    // Dynamic import of Sharp
    const sharp = await import("sharp");

    // Function to optimize a single image
    async function optimizeImage(filePath) {
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      const outputDir = path.dirname(filePath);

      console.log(`Optimizing: ${fileName}`);

      try {
        if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
          // Get image metadata
          const metadata = await sharp.default(filePath).metadata();

          // Only resize if image is larger than 1024px in any dimension
          if (metadata.width > 1024 || metadata.height > 1024) {
            const sharpInstance = sharp.default(filePath).resize({
              width: Math.min(metadata.width, 1024),
              height: Math.min(metadata.height, 1024),
              fit: "inside",
              withoutEnlargement: true,
            });

            // Set format-specific options
            if (ext === ".png") {
              sharpInstance.png({ quality: QUALITY });
            } else {
              sharpInstance.jpeg({ quality: QUALITY });
            }

            // Process and save
            const tempPath = path.join(
              outputDir,
              `${path.parse(fileName).name}_temp${ext}`
            );
            await sharpInstance.toFile(tempPath);

            // Replace original with optimized version
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);

            console.log(`Successfully optimized: ${fileName}`);
          } else {
            // If image is already small enough, just compress it
            const sharpInstance = sharp.default(filePath);
            if (ext === ".png") {
              sharpInstance.png({ quality: QUALITY });
            } else {
              sharpInstance.jpeg({ quality: QUALITY });
            }

            const tempPath = path.join(
              outputDir,
              `${path.parse(fileName).name}_temp${ext}`
            );
            await sharpInstance.toFile(tempPath);

            // Replace original with optimized version
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);

            console.log(`Successfully compressed: ${fileName}`);
          }
        }
        // Skip SVG optimization as it requires imagemin
      } catch (error) {
        console.error(`Failed to optimize ${fileName}:`, error);
      }
    }

    // Function to process a directory recursively
    async function processDirectory(dir) {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          await processDirectory(filePath);
        } else {
          const ext = path.extname(filePath).toLowerCase();
          if ([".png", ".jpg", ".jpeg"].includes(ext)) {
            await optimizeImage(filePath);
          }
        }
      }
    }

    // Start the optimization process
    await processDirectory(ASSETS_DIR);
    console.log("Asset optimization completed successfully.");
  } catch (error) {
    console.error("Asset optimization failed:", error);
  }
}

// Run the optimization
run();
