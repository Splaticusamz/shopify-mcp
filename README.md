# 🛍️ Shopify MCP Server

> Connect AI agents (Claude, Cursor, Windsurf) to your Shopify store data via the Model Context Protocol.

[![npm](https://img.shields.io/npm/v/@botsix/shopify-mcp)](https://www.npmjs.com/package/@botsix/shopify-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What It Does

Shopify MCP gives AI assistants real-time access to your Shopify store — products, orders, inventory, analytics, and customers — through the [Model Context Protocol](https://modelcontextprotocol.io).

**Ask your AI assistant things like:**
- "What are my top 10 selling products this month?"
- "Show me orders from the last 7 days"
- "Which products are low on stock?"
- "What's my conversion rate this week?"
- "Find repeat customers who spent over $500"

## Architecture

```
┌──────────────┐     MCP Protocol     ┌──────────────────┐     GraphQL     ┌──────────┐
│  AI Agent    │ ◄──────────────────► │  shopify-mcp     │ ◄────────────► │ Shopify  │
│  (Claude,    │   stdio / SSE        │  server          │   Admin API    │ Store    │
│   Cursor)    │                      │                  │                │          │
└──────────────┘                      └──────────────────┘                └──────────┘
```

## Quick Start

### Option 1: npm (Self-Hosted)

```bash
npm install -g @botsix/shopify-mcp
```

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "shopify": {
      "command": "shopify-mcp",
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_your_token_here"
      }
    }
  }
}
```

### Option 2: Hosted (Coming Soon)

$19/mo — No setup, no API keys to manage. Just connect and go.

## Available Tools

| Tool | Description |
|------|-------------|
| `get_products` | List/search products with filters (title, type, vendor, status) |
| `get_orders` | Recent orders with revenue summaries and status breakdown |
| `get_inventory` | Stock levels across locations, low-stock alerts |
| `get_analytics` | Traffic, conversion rates, top sellers, revenue trends |
| `get_customers` | Customer segments, repeat buyers, lifetime value stats |

## Setup: Getting Your Shopify API Key

1. Go to your Shopify admin → **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Configure **Admin API scopes**: `read_products`, `read_orders`, `read_inventory`, `read_customers`, `read_analytics`
4. Install the app and copy the **Admin API access token**

## Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | npm package, self-host, all 5 tools |
| **Pro** | $19/mo | Hosted SSE endpoint, dashboard, priority support |
| **Enterprise** | Custom | Multi-store, custom tools, SLA |

## Tech Stack

- **TypeScript** — Type-safe from API to tools
- **@modelcontextprotocol/sdk** — Official MCP SDK
- **Shopify Admin API** — GraphQL for efficient data fetching
- **Zod** — Runtime validation for all inputs

## Development

```bash
git clone https://github.com/botsix-workspace/shopify-mcp.git
cd shopify-mcp
npm install
cp .env.example .env  # Add your Shopify credentials
npm run dev
```

## License

MIT © botsix
