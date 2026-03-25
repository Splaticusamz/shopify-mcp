import http from "node:http";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./index.js";

export async function startSSE(port: number) {
  const server = createServer();
  let transport: SSEServerTransport | null = null;

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${port}`);

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === "/mcp/sse" && req.method === "GET") {
      transport = new SSEServerTransport("/mcp", res);
      await server.connect(transport);
      return;
    }

    if (url.pathname === "/mcp" && req.method === "POST") {
      if (!transport) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No SSE connection established. Connect to /mcp/sse first." }));
        return;
      }
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", async () => {
        try {
          await transport!.handlePostMessage(req, res, body);
        } catch (err: any) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", transport: "sse" }));
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  httpServer.listen(port, () => {
    console.error(`Shopify MCP SSE server running on http://localhost:${port}`);
    console.error(`  SSE endpoint: GET  http://localhost:${port}/mcp/sse`);
    console.error(`  RPC endpoint: POST http://localhost:${port}/mcp`);
  });

  return httpServer;
}
