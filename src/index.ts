#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ShopifyClient } from "./shopify-client.js";
import { getProductsSchema, getProducts } from "./tools/products.js";
import { getOrdersSchema, getOrders } from "./tools/orders.js";
import { getInventorySchema, getInventory } from "./tools/inventory.js";
import { getAnalyticsSchema, getAnalytics } from "./tools/analytics.js";
import { getCustomersSchema, getCustomers } from "./tools/customers.js";

export function createClient(): ShopifyClient {
  const shop = process.env.SHOPIFY_SHOP;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!shop || !accessToken) {
    throw new Error("SHOPIFY_SHOP and SHOPIFY_ACCESS_TOKEN environment variables are required");
  }
  return new ShopifyClient({ shop, accessToken });
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "shopify-mcp",
    version: "0.1.0",
  });

  const client = createClient();

  server.tool("get_products", "Search and list products from your Shopify store", getProductsSchema.shape, (input) => getProducts(client, input as any));
  server.tool("get_orders", "Get recent orders with revenue summary", getOrdersSchema.shape, (input) => getOrders(client, input as any));
  server.tool("get_inventory", "Check inventory levels and flag low-stock items", getInventorySchema.shape, (input) => getInventory(client, input as any));
  server.tool("get_analytics", "Get store analytics derived from order data", getAnalyticsSchema.shape, (input) => getAnalytics(client, input as any));
  server.tool("get_customers", "Get customer data with segmentation", getCustomersSchema.shape, (input) => getCustomers(client, input as any));

  return server;
}

export async function main() {
  const transport = new StdioServerTransport();
  const server = createServer();
  await server.connect(transport);
  console.error("Shopify MCP server running on stdio");
}

main().catch(console.error);
