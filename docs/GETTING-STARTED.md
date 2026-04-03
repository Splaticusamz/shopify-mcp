# Getting Started with Shopify MCP

Connect Claude, Cursor, or any MCP-compatible AI to your Shopify store in 5 minutes.

---

## Prerequisites

- A Shopify store (any plan)
- Node.js 18+ installed
- Claude Desktop, Cursor, or Windsurf

---

## Step 1: Get Your Shopify API Key

1. Go to your Shopify Admin → **Settings** → **Apps and sales channels**
2. Click **Develop apps** at the top right
3. Click **Create an app** → give it any name (e.g. "MCP Integration")
4. Under **Configuration** → **Admin API integration**, click **Configure**
5. Enable these scopes:
   - `read_products`
   - `read_orders`
   - `read_inventory`
   - `read_customers`
   - `read_analytics`
6. Click **Save**, then click **Install app**
7. Copy the **Admin API access token** — you'll need this in Step 3

---

## Step 2: Install shopify-mcp

```bash
npm install -g @botsix/shopify-mcp
```

Verify it installed:

```bash
shopify-mcp --version
```

---

## Step 3: Configure Your AI Client

### Claude Desktop

Open your Claude Desktop config file:
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the following block inside `"mcpServers"`:

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

Replace `your-store.myshopify.com` with your store subdomain and paste your access token.

Restart Claude Desktop. You should see a 🔌 icon showing "shopify" is connected.

### Cursor

In your project, create `.cursor/mcp.json`:

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

### Windsurf

Add the same block to your Windsurf MCP config file at `~/.windsurf/mcp_config.json`.

---

## Step 4: Talk to Your Store

Once connected, open a chat and ask:

> "What are my top 10 products by revenue this month?"

> "Show me orders from the last 7 days"

> "Which products are running low on inventory?"

> "What's my store's conversion rate?"

> "Find customers who've ordered more than 3 times"

---

## What's Available

| Tool | What It Does |
|------|-------------|
| `get_products` | List and search products — filter by title, type, vendor, or status |
| `get_orders` | Recent orders with revenue totals, status breakdown, and line items |
| `get_inventory` | Stock levels across locations, low-stock alerts |
| `get_analytics` | Traffic, conversion rates, top sellers, revenue trends |
| `get_customers` | Segments, repeat buyers, lifetime value |

---

## Troubleshooting

**"MCP server not found"**
Make sure `shopify-mcp` is in your PATH. Run `which shopify-mcp` — if blank, retry `npm install -g @botsix/shopify-mcp`.

**"Unauthorized" or "401"**
Double-check your `SHOPIFY_ACCESS_TOKEN`. Tokens from dev stores start with `shpat_`. Make sure you installed the app in Step 1.

**"Store not found" or "404"**
Your `SHOPIFY_STORE_URL` should be `your-store.myshopify.com` — not the full URL with `https://`.

---

## Upgrade to Pro

The npm package is free and self-hosted forever. If you want a hosted endpoint with no local setup:

**Pro ($19/mo)** — Hosted SSE endpoint, web dashboard, usage analytics, priority support.

Coming soon at [botsix.com](https://github.com/Splaticusamz/shopify-mcp).

---

## Need Help?

Open an issue: [github.com/Splaticusamz/shopify-mcp/issues](https://github.com/Splaticusamz/shopify-mcp/issues)
