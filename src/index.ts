#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "shopify-mcp",
  version: "0.1.0",
});

// Tools will be registered here
// server.tool("get_products", ...);
// server.tool("get_orders", ...);
// server.tool("get_inventory", ...);
// server.tool("get_analytics", ...);
// server.tool("get_customers", ...);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shopify MCP server running on stdio");
}

main().catch(console.error);
