# 🧠 BENZEMA's Knowledge MCP

> **Plug another person's brain into your AI.**
> A live MCP server that lets your Claude / Cursor / Cline query a deeply researched knowledge base on AI Agents, Harness Engineering, World Models, and more.

---

## ⚡ One-click install

### For Claude Code

Add to `~/.claude.json` or your project's `.mcp.json`:

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

Or run this one-liner:

```bash
claude mcp add --transport http benzema-knowledge https://benzema-wiki-mcp-production.up.railway.app/mcp
```

### For Cursor

Add to `~/.cursor/mcp.json` (or project `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "benzema-knowledge": {
      "url": "https://benzema-wiki-mcp-production.up.railway.app/mcp"
    }
  }
}
```

### For Cline / other MCP clients

Any client that supports HTTP / StreamableHTTP transport works. Use the URL:

```
https://benzema-wiki-mcp-production.up.railway.app/mcp
```

**No API keys. No install. No accounts. Just paste and query.**

---

## 🎯 Try these queries

After connecting, ask your LLM:

```
What's in BENZEMA's knowledge base?
→ list_topics

最近半年 World Model 领域有什么变化？
→ search_knowledge "world model" + read_page world-model

Show me the S-tier papers on Agent Communication
→ get_paper_index agent-communication

Compare JEPA and autoregressive world models
→ search_knowledge JEPA + read_page world-model

What is Harness Engineering and how does it relate to Creative AI?
→ read_page harness-engineering + read_page harness-to-creative
```

The LLM will pick the right tools automatically.

---

## 📚 What's in this knowledge base?

**Owner**: [@BENZEMA216](https://github.com/BENZEMA216) · Source: [BENZEMA216/vault](https://github.com/BENZEMA216/vault) (public, syncs every 10 min)

| Domain | Coverage |
|--------|----------|
| **Agent Infrastructure** | Agent Loop, Memory, Communication (MCP/A2A/ANP), Runtime, Tool Routing, World Models |
| **Harness Engineering** | Karpathy's harness pattern, Self-verification, Safe autonomy, Spec-driven dev, Context engineering |
| **Creative AI** | Creative CoWork product, Super-creators, GENUI, Init mechanism, Video Agent workflows, Manga drama production |
| **Research papers** | 69 indexed papers with arXiv URLs, citation counts, S/A/B/C quality tiers |

**35 wiki pages** · **23 concepts** · **6 maps** · **6 connections** · **~80 raw sources**

This isn't search over notes — it's **LLM-compiled, cross-referenced knowledge** built with [Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

---

## 🛠 Tools exposed

| Tool | What it does |
|------|--------------|
| `list_topics` | List all 35 concepts/maps/connections |
| `read_page` | Read a specific wiki page |
| `search_knowledge` | Full-text search across wiki and/or raw sources |
| `get_index` | Master index organized by domain |
| `get_paper_index` | Paper indexes with citations: `agent-communication`, `world-model`, `reasoning` |
| `get_log` | Chronological log of knowledge base operations |

---

## 🌐 Knowledge Agent Network — Node #1

This is the first node in a vision: **every person's LLM-compiled wiki becomes a queryable Agent in an interconnected knowledge graph.**

```
Personal Wiki → Wiki Agent → Agent Network → Knowledge Economy
```

If you've built your own AK-style LLM Wiki and want to expose it as a network node, **fork this repo** and point `VAULT_REPO` at your vault. Submit a PR to add your node to the directory below.

### Active Nodes

| Node | Owner | Domain | Endpoint |
|------|-------|--------|----------|
| #1 | [@BENZEMA216](https://github.com/BENZEMA216) | AI Agents, Harness, World Models, Creative AI | https://benzema-wiki-mcp-production.up.railway.app/mcp |

---

## 🏗 Self-host your own node

### Quick start (uses BENZEMA's vault)

```bash
git clone https://github.com/BENZEMA216/wiki-mcp-server.git
cd wiki-mcp-server
npm install
npm start
# → http://localhost:3000
```

### Point at your own vault

Set environment variables:

```bash
VAULT_REPO=https://github.com/yourname/your-vault.git npm start
```

Or local stdio mode (no HTTP, direct fs access):

```bash
WIKI_PATH=/path/to/wiki RAW_PATH=/path/to/raw npm run start:stdio
```

### Deploy to Railway

```bash
railway login
railway init
railway up
railway domain  # generate public URL
```

The included `railway.json` configures Nixpacks build, healthcheck, and auto-restart.

### Environment variables

| Var | Default | Description |
|-----|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `VAULT_REPO` | `https://github.com/BENZEMA216/vault.git` | Source vault repo (must be public) |
| `VAULT_DIR` | `/tmp/vault` | Local clone path |
| `PULL_INTERVAL_MS` | `600000` | Auto pull interval (10 min) |

---

## 🏛 Architecture

```
                    GitHub: BENZEMA216/vault
                           ↓ git clone --depth 1
                    Railway container (/tmp/vault)
                           ↓ wiki-tools.js reads markdown
                    Express HTTP server
                           ↓ POST /mcp (StreamableHTTP transport)
                    Your MCP client (Claude / Cursor / Cline)
                           ↓
                    Your LLM uses the wiki as a tool
```

Vault auto-syncs every 10 minutes. Push to `BENZEMA216/vault` → reflected in the live endpoint within 10 min, no redeploy needed.

---

## 🤝 Contributing & feedback

- **Found this useful?** Star [BENZEMA216/vault](https://github.com/BENZEMA216/vault) (the source) or this repo.
- **Want to add a node?** PR to the Active Nodes table above.
- **Building your own LLM Wiki?** I'd love to hear about it — open an issue or DM [@BENZEMA216](https://github.com/BENZEMA216).
- **Bugs / feature requests?** Issues welcome.

## 📜 License

MIT — but please don't use my knowledge base content for commercial training without asking.

---

*Built by [BENZEMA216](https://github.com/BENZEMA216) · Inspired by [Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)*
