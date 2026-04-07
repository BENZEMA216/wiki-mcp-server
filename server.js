// Remote MCP Server (HTTP + SSE)
// Exposes BENZEMA's LLM-compiled knowledge base as queryable Agent tools.
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { createWikiTools } from "./wiki-tools.js";
import {
  initTelemetry,
  recordRequest,
  getSummary,
  getRecent,
} from "./telemetry.js";

const PORT = process.env.PORT || 3000;
const VAULT_REPO =
  process.env.VAULT_REPO || "https://github.com/BENZEMA216/vault.git";
const VAULT_DIR = process.env.VAULT_DIR || "/tmp/vault";
const PULL_INTERVAL_MS = parseInt(process.env.PULL_INTERVAL_MS || "600000"); // 10 min

const WIKI_PATH = path.join(VAULT_DIR, "wiki");
const RAW_PATH = path.join(VAULT_DIR, "raw");

// ─── Bootstrap: clone or pull the vault ────────────────────────────────────
let lastSyncAt = null;
let lastSyncStatus = "pending";

function syncVault() {
  try {
    // Detect a broken/empty vault dir (e.g. interrupted clone) and reset it
    const isValidRepo =
      fs.existsSync(path.join(VAULT_DIR, ".git", "HEAD")) &&
      fs.existsSync(path.join(VAULT_DIR, "wiki"));

    // Force git to never prompt for credentials in non-TTY environments
    const gitEnv = {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GIT_ASKPASS: "/bin/echo",
      GCM_INTERACTIVE: "Never",
    };

    if (!isValidRepo) {
      console.log(`[vault] (re)cloning ${VAULT_REPO} → ${VAULT_DIR}`);
      if (fs.existsSync(VAULT_DIR)) {
        fs.rmSync(VAULT_DIR, { recursive: true, force: true });
      }
      execSync(
        `git -c http.extraHeader='User-Agent: wiki-mcp-server' clone --depth 1 ${VAULT_REPO} ${VAULT_DIR}`,
        {
          stdio: "pipe",
          timeout: 120000,
          env: gitEnv,
        }
      );
    } else {
      execSync(`git -C ${VAULT_DIR} pull --ff-only --depth 1`, {
        stdio: "pipe",
        timeout: 60000,
        env: gitEnv,
      });
    }
    lastSyncAt = new Date().toISOString();
    lastSyncStatus = "ok";
    console.log(`[vault] sync ok at ${lastSyncAt}`);
  } catch (err) {
    lastSyncStatus = `error: ${err.message?.slice(0, 200) || "unknown"}`;
    console.error(`[vault] sync failed:`, err.message);
  }
}

// Run first sync asynchronously (don't block server startup)
setTimeout(syncVault, 100);
setInterval(syncVault, PULL_INTERVAL_MS);

// Initialize telemetry (replay existing log to rebuild in-memory stats)
initTelemetry();

// ─── MCP Server setup ───────────────────────────────────────────────────────
const tools = createWikiTools({ wikiPath: WIKI_PATH, rawPath: RAW_PATH });

function createMcpServer() {
  const server = new McpServer({
    name: "benzema-knowledge",
    version: "0.2.0",
  });

  server.tool(
    "list_topics",
    "List all topics (concepts, maps, connections) in BENZEMA's knowledge base. Call this first to see what knowledge is available.",
    {},
    async () => ({
      content: [{ type: "text", text: await tools.list_topics() }],
    })
  );

  server.tool(
    "read_page",
    "Read the full content of a specific wiki page. Use the slug from list_topics.",
    {
      slug: z.string().describe("Page slug, e.g. 'agent-communication'"),
      type: z
        .enum(["concept", "map", "connection"])
        .default("concept")
        .describe("Page type"),
    },
    async ({ slug, type }) => ({
      content: [{ type: "text", text: await tools.read_page({ slug, type }) }],
    })
  );

  server.tool(
    "search_knowledge",
    "Search across the knowledge base for a keyword. Returns matching excerpts with file paths.",
    {
      query: z.string().describe("Search keyword or phrase"),
      scope: z
        .enum(["wiki", "raw", "all"])
        .default("wiki")
        .describe("Search scope"),
      max_results: z.number().default(10),
    },
    async ({ query, scope, max_results }) => ({
      content: [
        {
          type: "text",
          text: await tools.search_knowledge({ query, scope, max_results }),
        },
      ],
    })
  );

  server.tool(
    "get_index",
    "Get the master knowledge base index. Start here to understand the knowledge structure.",
    {},
    async () => ({
      content: [{ type: "text", text: await tools.get_index() }],
    })
  );

  server.tool(
    "get_paper_index",
    "Get the paper index for a research area with citation counts and quality tiers.",
    {
      area: z.enum(["agent-communication", "world-model", "reasoning"]),
    },
    async ({ area }) => ({
      content: [{ type: "text", text: await tools.get_paper_index({ area }) }],
    })
  );

  server.tool(
    "get_log",
    "Get the chronological log of knowledge base operations.",
    {},
    async () => ({ content: [{ type: "text", text: await tools.get_log() }] })
  );

  return server;
}

// ─── HTTP Server ────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  const wikiReady =
    fs.existsSync(WIKI_PATH) && fs.existsSync(path.join(WIKI_PATH, "_index.md"));
  const summary = getSummary();
  res.json({
    name: "BENZEMA Knowledge MCP Server",
    version: "0.3.0",
    status: wikiReady ? "ready" : "syncing",
    description:
      "Remote MCP server exposing BENZEMA's LLM-compiled knowledge base as queryable Agent tools",
    vault_repo: VAULT_REPO,
    vault_synced: wikiReady,
    last_sync_at: lastSyncAt,
    last_sync_status: lastSyncStatus,
    mcp_endpoint: "/mcp",
    tools: [
      "list_topics",
      "read_page",
      "search_knowledge",
      "get_index",
      "get_paper_index",
      "get_log",
    ],
    usage: {
      total_requests: summary.total_requests,
      unique_ips: summary.unique_ips,
      by_tool: summary.by_tool,
      by_client: summary.by_user_agent,
      last_request_at: summary.last_request_at,
      first_request_at: summary.first_request_at,
      stats_url: "/stats",
      recent_url: "/stats/recent",
    },
    docs: "https://github.com/BENZEMA216/wiki-mcp-server",
    owner: "BENZEMA216",
    owner_github: "https://github.com/BENZEMA216",
    network: "Knowledge Agent Network — node #1",
  });
});

// MCP endpoint (stateless mode for simplicity — each request is independent)
app.post("/mcp", async (req, res) => {
  const startedAt = Date.now();
  let ok = true;

  try {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    res.on("close", () => {
      transport.close();
      server.close();
      // Record telemetry when the response closes (covers both success and
      // client disconnects mid-stream). We read `req.body` which Express
      // already parsed before handing off to the MCP transport.
      recordRequest({
        req,
        body: req.body,
        durationMs: Date.now() - startedAt,
        ok,
      });
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    ok = false;
    console.error("[mcp] error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed. Use POST for MCP requests.",
    },
    id: null,
  });
});

// ─── Observability endpoints ────────────────────────────────────────────────
// Aggregate stats (no PII, safe to expose publicly)
app.get("/stats", (_req, res) => {
  res.json(getSummary());
});

// Recent request log (last N entries, already stripped of IP/UA details)
app.get("/stats/recent", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  res.json({ limit, records: getRecent(limit) });
});

app.listen(PORT, () => {
  console.log(`[server] BENZEMA Knowledge MCP listening on :${PORT}`);
  console.log(`[server] MCP endpoint: POST /mcp`);
  console.log(`[server] Health: GET /`);
});
