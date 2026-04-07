# Wiki MCP Server

> Knowledge Agent Network — Node #1
> Turn an LLM-compiled knowledge base into a remote Agent that any MCP client can query.

## What is this?

A remote MCP server that exposes [BENZEMA216/vault](https://github.com/BENZEMA216/vault) — a personal LLM-compiled knowledge base built with [Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — as queryable Agent tools.

**Search/RAG asks AI to find your notes. This compiles your notes into knowledge that other Agents can call.**

## The Knowledge Source

- **Owner**: [@BENZEMA216](https://github.com/BENZEMA216)
- **Vault repo**: [BENZEMA216/vault](https://github.com/BENZEMA216/vault) (public)
- **Coverage**: AI Agent infrastructure, Harness Engineering, World Models, Agent Communication, Creative AI
- **Stats**: 23 concepts · 6 maps · 6 connections · 69 indexed papers · ~80 raw sources

## Tools

| Tool | Description |
|------|-------------|
| `list_topics` | List all concepts/maps/connections in the knowledge base |
| `read_page` | Read a specific wiki page (concept, map, or connection) |
| `search_knowledge` | Search across wiki and/or raw sources |
| `get_index` | Get the master index organized by domain |
| `get_paper_index` | Get paper indexes (`agent-communication`, `world-model`, `reasoning`) with citation counts and quality tiers |
| `get_log` | Chronological log of knowledge base operations |

## Usage

### Option 1: Remote (recommended) — connect to the hosted node

> **🌐 Live endpoint**: `https://benzema-wiki-mcp-production.up.railway.app/mcp`
>
> **Health check**: https://benzema-wiki-mcp-production.up.railway.app/

Add to your MCP client config:

**Claude Code** (`~/.mcp.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "benzema-knowledge": {
      "type": "http",
      "url": "https://benzema-wiki-mcp-production.up.railway.app/mcp"
    }
  }
}
```

**Other clients**: any MCP-compatible client supporting `StreamableHTTP` transport.

Then ask your LLM:
- "What's in BENZEMA's knowledge base?" → `list_topics`
- "Tell me about Agent Communication protocols" → `read_page agent-communication`
- "Show me World Model papers" → `get_paper_index world-model`
- "Search for JEPA" → `search_knowledge JEPA`

### Option 2: Self-host (run your own node)

```bash
git clone https://github.com/BENZEMA216/wiki-mcp-server.git
cd wiki-mcp-server
npm install
npm start
```

Server runs on port `3000` (or `$PORT`). The vault is auto-cloned to `/tmp/vault` and pulled every 10 minutes.

### Option 3: Local stdio mode (point at your own vault)

```bash
WIKI_PATH=/path/to/your/wiki RAW_PATH=/path/to/your/raw npm run start:stdio
```

Then in `~/.mcp.json`:

```json
{
  "mcpServers": {
    "my-knowledge": {
      "command": "node",
      "args": ["/path/to/wiki-mcp-server/server-stdio.js"],
      "env": {
        "WIKI_PATH": "/path/to/your/wiki",
        "RAW_PATH": "/path/to/your/raw"
      }
    }
  }
}
```

## Deployment

### Railway

```bash
railway login
railway init
railway up
railway domain  # generate public URL
```

The included `railway.json` configures:
- Nixpacks builder
- `npm start` as entry
- `/` as health check
- Auto-restart on failure (3 retries)

### Environment variables

| Var | Default | Description |
|-----|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `VAULT_REPO` | `https://github.com/BENZEMA216/vault.git` | Source vault repo |
| `VAULT_DIR` | `/tmp/vault` | Local clone path |
| `PULL_INTERVAL_MS` | `600000` | Auto pull interval (10 min) |

## Architecture

```
GitHub: BENZEMA216/vault
        ↓ git clone --depth 1
Railway container (/tmp/vault)
        ↓ wiki-tools.js reads markdown
Express HTTP server
        ↓ POST /mcp (StreamableHTTP transport)
MCP client (Claude Code, Cursor, ...)
        ↓
LLM uses wiki as a tool
```

Vault auto-syncs every 10 minutes via `git pull --ff-only --depth 1`.

## Knowledge Agent Network

This is **Node #1** in a Knowledge Agent Network — where each person's LLM-compiled wiki becomes a queryable Agent in an interconnected knowledge graph.

**Vision**: personal wiki → wiki agent → agent network → knowledge economy.

If you're building your own LLM Wiki and want to expose it as a network node, fork this repo and point `VAULT_REPO` at your vault.

## License

MIT — but please don't use my knowledge base content for commercial training without asking.

---

*Built by [BENZEMA216](https://github.com/BENZEMA216) · Inspired by [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)*
