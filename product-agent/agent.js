#!/usr/bin/env node

/**
 * RARE Product Agent
 *
 * Uses the Claude Agent SDK to watch product_designs/ for new images,
 * analyze them with Claude's vision, and create Drupal Commerce products.
 *
 * Usage:
 *   npm start              Process all unprocessed images once
 *   npm run watch          Process + keep watching for new images
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY env variable set
 *   - Docker container "budstore-drupal-1" running
 *   - Product design images in ../rareimagery/product_designs/
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const DESIGNS_DIR = path.resolve(__dirname, "../rareimagery/product_designs");
const PROCESSED_FILE = path.resolve(__dirname, "processed.json");
const PROJECT_ROOT = path.resolve(__dirname, "..");
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

// ═══════════════════════════════════════════════════════════════════
// PROCESSED FILE TRACKING
// ═══════════════════════════════════════════════════════════════════

async function loadProcessed() {
  try {
    return JSON.parse(await fs.readFile(PROCESSED_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function saveProcessed(list) {
  await fs.writeFile(PROCESSED_FILE, JSON.stringify(list, null, 2));
}

async function markProcessed(filenames) {
  const current = await loadProcessed();
  const updated = [...new Set([...current, ...filenames])];
  await saveProcessed(updated);
}

// ═══════════════════════════════════════════════════════════════════
// GET UNPROCESSED IMAGES
// ═══════════════════════════════════════════════════════════════════

async function getNewImages() {
  const processed = await loadProcessed();

  let files;
  try {
    files = await fs.readdir(DESIGNS_DIR);
  } catch (err) {
    console.error(`Cannot read ${DESIGNS_DIR}: ${err.message}`);
    return [];
  }

  return files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTS.includes(ext) && !processed.includes(f);
  });
}

// ═══════════════════════════════════════════════════════════════════
// BUILD AGENT PROMPT
// ═══════════════════════════════════════════════════════════════════

function buildPrompt(imageFiles) {
  const imageList = imageFiles
    .map((f) => `- ${path.join(DESIGNS_DIR, f).replace(/\\/g, "/")}`)
    .join("\n");

  return `You are a product creation agent for the RARE streetwear clothing brand.

TASK: Analyze product design images and create Drupal Commerce clothing products.

═══════════════════════════════════════════
NEW IMAGES TO PROCESS:
${imageList}
═══════════════════════════════════════════

For EACH image above:

STEP 1 — VIEW THE IMAGE
Use the Read tool to open and view the image file.

STEP 2 — ANALYZE THE DESIGN
Based on what you see, determine:

  a) STYLE — Use EXACTLY one of these names:
     Tees:        "Crew Neck Tee" | "V-Neck Tee" | "Long Sleeve Tee" | "Tank Top" | "Raglan"
     Hoodies:     "Pullover Hoodie" | "Zip-Up Hoodie" | "Crewneck Sweatshirt"
     Hats:        "Snapback Hat" | "Fitted Hat" | "Trucker Hat" | "Dad Hat" | "Beanie" | "Bucket Hat"
     Accessories: "Tote Bag" | "Socks" | "Face Mask"

  b) COLORS — Use standard color names:
     Black, White, Heather Gray, Charcoal, Navy, Royal Blue, Red, Burgundy,
     Forest Green, Olive, Tan, Brown, Orange, Yellow, Pink, Purple, Camo, Natural

  c) PRODUCT NAME — Creative RARE brand name (streetwear/urban aesthetic)
     Examples: "Midnight Prowl Snapback", "Ghost Grid Hoodie", "Concrete Jungle Tee"

  d) DESCRIPTION — 1-2 sentences, edgy streetwear copywriting

  e) PRICE — Based on category:
     Tees: $28-35 | Hoodies: $55-65 | Hats: $28-35 | Accessories: $15-25

STEP 3 — CREATE THE PRODUCT
Run this Bash command (note: use MSYS_NO_PATHCONV=1 to prevent Windows path mangling):

MSYS_NO_PATHCONV=1 docker exec budstore-drupal-1 /opt/drupal/vendor/bin/drush --uri=http://localhost:8082 php:script /var/www/html/create-clothing-product.php -- "TITLE" "STYLE" "COLORS" "SIZES" "PRICE" "DESCRIPTION" "IMAGE_FILENAME"

Where:
  - TITLE: Your creative product name
  - STYLE: Exact style name from the list above
  - COLORS: Comma-separated (e.g., "Black,Camo")
  - SIZES: For hats → "One Size"  |  For tees/hoodies → "S,M,L,XL,2XL"
  - PRICE: Number like "32.00"
  - DESCRIPTION: Your product description
  - IMAGE_FILENAME: Just the filename (e.g., "ballcap_camo.jpg"), NOT the full path

STEP 4 — REPORT
After creating each product, summarize what was created.

═══════════════════════════════════════════
RULES:
- Process ALL images listed above
- Brand is always RARE
- If an image is unclear, make your best judgment on the product type
- Keep names creative but concise
- Use MSYS_NO_PATHCONV=1 before every docker command
═══════════════════════════════════════════`;
}

// ═══════════════════════════════════════════════════════════════════
// RUN THE AGENT
// ═══════════════════════════════════════════════════════════════════

async function processImages(imageFiles) {
  if (imageFiles.length === 0) {
    console.log("No new images to process.\n");
    return;
  }

  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  Processing ${imageFiles.length} new image(s)...      ║`);
  console.log(`╚══════════════════════════════════════╝\n`);

  const prompt = buildPrompt(imageFiles);

  try {
    for await (const message of query({
      prompt,
      options: {
        allowedTools: ["Read", "Bash"],
        permissionMode: "default",
        cwd: PROJECT_ROOT,
        maxTurns: imageFiles.length * 5 + 5,
      },
    })) {
      // Stream agent output to console
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          if ("text" in block) {
            console.log(block.text);
          } else if ("name" in block) {
            console.log(`  [Tool: ${block.name}]`);
          }
        }
      } else if (message.type === "result") {
        console.log(`\nAgent finished (${message.subtype})`);
        if (message.duration_ms) {
          console.log(`Duration: ${(message.duration_ms / 1000).toFixed(1)}s`);
        }
      }
    }

    // Mark images as processed
    await markProcessed(imageFiles);
    console.log(`\nMarked ${imageFiles.length} image(s) as processed.`);
  } catch (err) {
    console.error(`\nAgent error: ${err.message}`);
    if (err.message.includes("ANTHROPIC_API_KEY")) {
      console.error("\nSet your API key: export ANTHROPIC_API_KEY=sk-ant-...");
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// FILE WATCHER (--watch mode)
// ═══════════════════════════════════════════════════════════════════

async function startWatcher() {
  // Dynamic import — only needed in watch mode
  const { watch } = await import("chokidar");

  console.log(`\nWatching ${DESIGNS_DIR} for new images...\n`);
  console.log("(Drop images into the folder to auto-create products)\n");

  let pending = [];
  let debounceTimer = null;
  let processing = false;

  const watcher = watch(DESIGNS_DIR, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 500 },
  });

  watcher.on("add", (filePath) => {
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();

    if (!IMAGE_EXTS.includes(ext)) return;

    console.log(`New image detected: ${filename}`);
    pending.push(filename);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (processing) return;
      processing = true;

      const batch = [...pending];
      pending = [];

      await processImages(batch);
      processing = false;
    }, 5000); // Wait 5s for any additional files
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nStopping watcher...");
    watcher.close();
    process.exit(0);
  });

  // Keep the process alive
  await new Promise(() => {});
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║      RARE Product Agent v1.0         ║");
  console.log("║   Claude Agent SDK + Drupal Commerce ║");
  console.log("╚══════════════════════════════════════╝\n");

  // Verify designs directory exists
  try {
    await fs.access(DESIGNS_DIR);
    console.log(`Designs folder: ${DESIGNS_DIR}`);
  } catch {
    console.error(`ERROR: Designs folder not found: ${DESIGNS_DIR}`);
    console.error("Create it or check the path.");
    process.exit(1);
  }

  // Process existing new images
  const newImages = await getNewImages();
  console.log(`Found ${newImages.length} unprocessed image(s)\n`);

  if (newImages.length > 0) {
    await processImages(newImages);
  }

  // Watch mode?
  if (process.argv.includes("--watch")) {
    await startWatcher();
  } else {
    console.log("\nDone. Run with --watch to keep monitoring for new images.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
