#!/usr/bin/env node
import "dotenv/config";

const args = process.argv.slice(2);

function getArg(name: string, defaultValue: string): string {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return defaultValue;
}

const transport = process.env.TRANSPORT || getArg("transport", "stdio");
const port = parseInt(process.env.PORT || getArg("port", "3000"), 10);

if (!process.env.SHOPIFY_SHOP || !process.env.SHOPIFY_ACCESS_TOKEN) {
  console.error("Error: SHOPIFY_SHOP and SHOPIFY_ACCESS_TOKEN environment variables are required.");
  console.error("Create a .env file or set them in your environment.");
  process.exit(1);
}

async function run() {
  if (transport === "sse") {
    const { startSSE } = await import("./sse.js");
    await startSSE(port);
  } else {
    await import("./index.js");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
