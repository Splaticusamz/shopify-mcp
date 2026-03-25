# Architecture

## Overview

Shopify MCP is a Model Context Protocol server that bridges AI agents with Shopify's Admin GraphQL API.

## Components

### 1. MCP Server (`src/index.ts`)
Entry point. Registers tools, handles transport (stdio for local, SSE for hosted).

### 2. Shopify Client (`src/shopify/client.ts`)
GraphQL client wrapper for Shopify Admin API. Handles authentication, rate limiting, and pagination.

### 3. Tools (`src/tools/`)
Each tool is a self-contained module:
- `products.ts` — Product listing and search
- `orders.ts` — Order history and revenue
- `inventory.ts` — Stock level monitoring
- `analytics.ts` — Store performance metrics
- `customers.ts` — Customer data and segments

### 4. Schema Validation (`src/schemas/`)
Zod schemas for input validation on all tool parameters.

## Data Flow

```
Client Request → MCP SDK → Tool Handler → Shopify GraphQL → Response → MCP SDK → Client
```

## Transport Modes

- **stdio** (default): For local MCP clients (Claude Desktop, Cursor)
- **SSE**: For hosted/remote connections (Pro tier)

## Rate Limiting

Shopify Admin API: 2 requests/second (leaky bucket). The client implements automatic throttling and retry with backoff.
