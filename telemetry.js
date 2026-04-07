// Lightweight telemetry for MCP access observability.
// Goal: know WHO is using the endpoint, WHAT tools they call, and WHICH queries
// are popular — without storing PII.
//
// Privacy model:
// - IPs are hashed (sha256 prefix) — you see "same user" but not "who"
// - User agents are truncated to 80 chars
// - search_knowledge queries are stored as 60-char previews (for popularity analysis)
// - read_page args are stored as slug only (public info)
// - tools/list requests record no args
//
// Persistence:
// - JSONL append-only file at TELEMETRY_PATH
// - In-memory aggregates rebuilt on startup from the file
// - Railway /tmp is ephemeral — use a persistent volume in production if needed
import fs from "fs";
import path from "path";
import crypto from "crypto";

const TELEMETRY_PATH =
  process.env.TELEMETRY_PATH || "/tmp/mcp-access.jsonl";
const MAX_RECENT = 500; // keep last 500 records in memory for /stats/recent
const TELEMETRY_SALT =
  process.env.TELEMETRY_SALT || "benzema-wiki-mcp-default-salt-2026";

// ─── In-memory state ────────────────────────────────────────────────────────
const state = {
  totalRequests: 0,
  byTool: {},
  byMethod: {},
  byHour: {}, // "2026-04-07T10" → count
  byDay: {}, // "2026-04-07" → count
  uniqueIpHashes: new Set(),
  uniqueIpsByDay: {}, // day → Set of ip_hash
  topSearches: {}, // normalized query → count
  topReads: {}, // slug → count
  byUserAgentFamily: {}, // "claude-code", "cursor", "curl", "other"
  errors: 0,
  firstRequestAt: null,
  lastRequestAt: null,
  recent: [], // newest first
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function hashIp(ip) {
  if (!ip) return "unknown";
  const h = crypto
    .createHash("sha256")
    .update(TELEMETRY_SALT + ":" + ip)
    .digest("hex");
  return h.slice(0, 8);
}

function classifyUserAgent(ua = "") {
  const lower = ua.toLowerCase();
  if (lower.includes("claude-code") || lower.includes("claude code"))
    return "claude-code";
  if (lower.includes("cursor")) return "cursor";
  if (lower.includes("cline")) return "cline";
  if (lower.includes("zed")) return "zed";
  if (lower.includes("continue")) return "continue";
  if (lower.includes("python") || lower.includes("httpx")) return "python-sdk";
  if (lower.includes("node-fetch") || lower.includes("undici")) return "node";
  if (lower.includes("curl")) return "curl";
  if (lower.includes("postman")) return "postman";
  if (lower.includes("mozilla") || lower.includes("chrome") || lower.includes("safari"))
    return "browser";
  if (lower.includes("mcp")) return "mcp-client";
  return ua ? "other" : "unknown";
}

function extractClientIp(req) {
  // Railway / most proxies set x-forwarded-for
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function normalizeQuery(q) {
  return (q || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

// ─── Ingest one request ─────────────────────────────────────────────────────
function ingestRecord(record, { persist = true } = {}) {
  state.totalRequests++;

  // byMethod
  const method = record.method || "unknown";
  state.byMethod[method] = (state.byMethod[method] || 0) + 1;

  // byTool (only for tools/call)
  if (record.tool) {
    state.byTool[record.tool] = (state.byTool[record.tool] || 0) + 1;
  }

  // Time buckets
  const d = new Date(record.ts || Date.now());
  const hourKey = d.toISOString().slice(0, 13); // "2026-04-07T10"
  const dayKey = d.toISOString().slice(0, 10); // "2026-04-07"
  state.byHour[hourKey] = (state.byHour[hourKey] || 0) + 1;
  state.byDay[dayKey] = (state.byDay[dayKey] || 0) + 1;

  // Unique IPs
  if (record.ip_hash) {
    state.uniqueIpHashes.add(record.ip_hash);
    if (!state.uniqueIpsByDay[dayKey])
      state.uniqueIpsByDay[dayKey] = new Set();
    state.uniqueIpsByDay[dayKey].add(record.ip_hash);
  }

  // User agent family
  const family = record.ua_family || "unknown";
  state.byUserAgentFamily[family] =
    (state.byUserAgentFamily[family] || 0) + 1;

  // Top searches
  if (record.tool === "search_knowledge" && record.query_preview) {
    const norm = normalizeQuery(record.query_preview);
    if (norm) state.topSearches[norm] = (state.topSearches[norm] || 0) + 1;
  }

  // Top reads
  if (record.tool === "read_page" && record.slug) {
    state.topReads[record.slug] = (state.topReads[record.slug] || 0) + 1;
  }

  // Errors
  if (record.status === "error") state.errors++;

  // Timestamps
  if (!state.firstRequestAt) state.firstRequestAt = record.ts;
  state.lastRequestAt = record.ts;

  // Recent ring buffer
  state.recent.unshift(record);
  if (state.recent.length > MAX_RECENT) state.recent.length = MAX_RECENT;

  // Persist
  if (persist) {
    try {
      fs.appendFileSync(TELEMETRY_PATH, JSON.stringify(record) + "\n");
    } catch (err) {
      // Don't crash on telemetry failure
      console.error("[telemetry] persist failed:", err.message);
    }
  }
}

// ─── Replay on startup ──────────────────────────────────────────────────────
function replayFromDisk() {
  if (!fs.existsSync(TELEMETRY_PATH)) {
    console.log(`[telemetry] no existing log at ${TELEMETRY_PATH}`);
    return;
  }
  try {
    const content = fs.readFileSync(TELEMETRY_PATH, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim());
    let replayed = 0;
    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        ingestRecord(record, { persist: false });
        replayed++;
      } catch {
        // Skip malformed lines
      }
    }
    console.log(`[telemetry] replayed ${replayed} records from ${TELEMETRY_PATH}`);
  } catch (err) {
    console.error("[telemetry] replay failed:", err.message);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────
export function initTelemetry() {
  replayFromDisk();
  console.log(
    `[telemetry] initialized · path=${TELEMETRY_PATH} · current=${state.totalRequests} records`
  );
}

/**
 * Record one MCP request. Call this from the /mcp handler after request processing.
 *
 * @param {object} params
 * @param {object} params.req - Express request object
 * @param {object} params.body - Parsed JSON-RPC body (with method, params)
 * @param {number} params.durationMs - Response time in ms
 * @param {boolean} params.ok - Whether request succeeded
 */
export function recordRequest({ req, body, durationMs, ok = true }) {
  try {
    const ip = extractClientIp(req);
    const ua = String(req.headers["user-agent"] || "").slice(0, 200);
    const method = body?.method || "unknown";

    let tool = null;
    let queryPreview = null;
    let slug = null;
    let pageType = null;
    let paperArea = null;
    let scope = null;

    // Extract per-tool details from tools/call
    if (method === "tools/call" && body?.params) {
      tool = body.params.name || null;
      const args = body.params.arguments || {};

      switch (tool) {
        case "search_knowledge":
          // Keep preview for popularity analysis — truncated to 60 chars
          if (args.query) queryPreview = String(args.query).slice(0, 60);
          if (args.scope) scope = String(args.scope);
          break;
        case "read_page":
          // Slug is public info (from list_topics)
          if (args.slug) slug = String(args.slug).slice(0, 100);
          if (args.type) pageType = String(args.type);
          break;
        case "get_paper_index":
          if (args.area) paperArea = String(args.area);
          break;
        // list_topics, get_index, get_log take no args
      }
    }

    const record = {
      ts: new Date().toISOString(),
      ip_hash: hashIp(ip),
      ua_family: classifyUserAgent(ua),
      ua_preview: ua.slice(0, 80),
      method,
      tool,
      slug,
      page_type: pageType,
      paper_area: paperArea,
      scope,
      query_preview: queryPreview,
      duration_ms: Math.round(durationMs || 0),
      status: ok ? "ok" : "error",
    };

    ingestRecord(record);
  } catch (err) {
    console.error("[telemetry] record failed:", err.message);
  }
}

// ─── Aggregate views ────────────────────────────────────────────────────────
export function getSummary() {
  // Top N searches
  const topSearches = Object.entries(state.topSearches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }));

  // Top N reads
  const topReads = Object.entries(state.topReads)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([slug, count]) => ({ slug, count }));

  // Last 24 hours bucketed by hour
  const now = new Date();
  const last24h = {};
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const key = d.toISOString().slice(0, 13);
    last24h[key] = state.byHour[key] || 0;
  }

  // Last 14 days bucketed by day
  const last14d = {};
  const last14dUnique = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400 * 1000);
    const key = d.toISOString().slice(0, 10);
    last14d[key] = state.byDay[key] || 0;
    last14dUnique[key] = state.uniqueIpsByDay[key]
      ? state.uniqueIpsByDay[key].size
      : 0;
  }

  return {
    total_requests: state.totalRequests,
    errors: state.errors,
    unique_ips: state.uniqueIpHashes.size,
    first_request_at: state.firstRequestAt,
    last_request_at: state.lastRequestAt,
    by_method: state.byMethod,
    by_tool: state.byTool,
    by_user_agent: state.byUserAgentFamily,
    last_24h_by_hour: last24h,
    last_14d_by_day: last14d,
    last_14d_unique_ips: last14dUnique,
    top_searches: topSearches,
    top_reads: topReads,
  };
}

export function getRecent(limit = 50) {
  // Public view: strip ip_hash and ua_preview for extra privacy
  return state.recent.slice(0, Math.min(limit, MAX_RECENT)).map((r) => ({
    ts: r.ts,
    ua_family: r.ua_family,
    method: r.method,
    tool: r.tool,
    slug: r.slug,
    page_type: r.page_type,
    paper_area: r.paper_area,
    scope: r.scope,
    query_preview: r.query_preview,
    duration_ms: r.duration_ms,
    status: r.status,
  }));
}
