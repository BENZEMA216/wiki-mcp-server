# 🧠 BENZEMA's Personal Knowledge Card

> **Plug your brain into your AI.**

I use Claude every day. But Claude doesn't know who I am.

Every new conversation I'd repeat the same thing: *"I'm a PM working on AI agents. I've researched World Models. I have opinions on Agent Communication. Please consider my background, don't give me generic advice."*

So I built this:

> **A live MCP server that holds my entire research brain — 19,000 lines of agent source-code reviews, 49 indexed World Model papers, 28 wiki concepts, 8 cross-domain connections — and exposes it as a tool any LLM can call.**

Now my Claude knows who I am. Every answer it gives me already takes my background into account. It's the highest-leverage quality-of-life upgrade I've made this year.

**This README shows you how to do the same — for yourself, or by plugging into mine.**

---

## 🎯 Two ways to use this

### 👤 Want my brain in your AI?

Plug BENZEMA's Personal Knowledge Card into your Claude / Cursor / Cline. Useful when:

- You're an **investor** doing 5-min DD on Agent founders
- You're an **agent developer** hitting source-level questions
- You're a **researcher** needing fast cross-domain context
- You're a **content creator** needing citable quotes
- You're a **collaborator** trying to onboard onto someone else's thinking

```bash
curl -fsSL https://benzema-wiki-mcp-production.up.railway.app/install | bash
```

→ See [25 ready-to-use prompts in RECIPES.md](./RECIPES.md)

### 🛠 Want to build your own Personal Knowledge Card?

Fork this repo, point it at your own vault. Your AI will know you. You can share the endpoint with anyone who wants to know you deeper. **See [Self-host section](#-build-your-own-personal-knowledge-card) below.**

---

## 🚀 30-second install (use BENZEMA's Card)

```bash
curl -fsSL https://benzema-wiki-mcp-production.up.railway.app/install | bash
```

Detects Claude Code / Cursor / Cline automatically. Creates `.bak` backups before any edit. Works on macOS and Linux.

→ Or visit the [**install landing page**](https://benzema-wiki-mcp-production.up.railway.app/) with copy buttons.

---

## ⚡ Manual install

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

Or run:

```bash
claude mcp add --transport http benzema-knowledge https://benzema-wiki-mcp-production.up.railway.app/mcp
```

### For Cursor

Add to `~/.cursor/mcp.json`:

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

Any client supporting HTTP / StreamableHTTP transport works. URL:

```
https://benzema-wiki-mcp-production.up.railway.app/mcp
```

**No API keys. No accounts. Just paste and query.**

---

## 🎯 Try these prompts

> **For 25 prompts organized by role, see [RECIPES.md](./RECIPES.md).**

After connecting, paste any of these into your LLM:

**🎩 If you're an investor doing DD on Agent founders:**
```
"What does BENZEMA think the core opportunity in Agent Economy is,
and what's the biggest gap layer they identified?"
```

**👨‍💻 If you're an Agent developer hitting design questions:**
```
"How do kimi-cli and Claude Code differ in tool execution concurrency?
What is sync handle / async future?"
```

**🎓 If you're a researcher needing fast cross-domain context:**
```
"Show me the S-tier papers on World Models with citation counts.
Then explain BENZEMA's analysis of the three definitions and
which benchmark is missing."
```

**📝 If you're a content creator needing citable quotes:**
```
"What is BENZEMA's analysis of Sora's shutdown? Give me quotes
with original sources I can cite."
```

**🤝 If you're a potential collaborator/recruiter:**
```
"What does BENZEMA's research focus on? Give me a topic map.
What products has BENZEMA actually deployed?"
```

The LLM picks the right tools automatically. **No need to learn the schema.**

→ **[See 20 more prompts in RECIPES.md](./RECIPES.md)**

---

## 📚 What's inside BENZEMA's Card

**Owner**: [@BENZEMA216](https://github.com/BENZEMA216) · Source: [BENZEMA216/vault](https://github.com/BENZEMA216/vault) (public, syncs every 10 min)

| Domain | Coverage |
|--------|----------|
| **Agent Infrastructure** | Agent Loop, Memory, Communication (MCP/A2A/ANP), Runtime, Tool Routing, World Models |
| **Harness Engineering** | Karpathy's harness pattern, Self-verification, Safe autonomy, Spec-driven dev, Context engineering |
| **Source-level reviews** | kimi-cli, Claude Code, kosong, agent-vault, OneBot, kimchi, tldr-vscode, pink (~19,000 LOC) |
| **World Models** | 49 indexed papers (citations + tier), 5 architecture lines, Sora's shutdown analysis |
| **Creative AI** | Creative CoWork product, Super-creators, GENUI, Video Agent workflows, Manga drama production |
| **LLM Wiki Pattern** | Karpathy gist + Knowledge Agent Network design + product opportunities |

**Stats**: 28 concepts · 7 maps · 8 connections · ~80 raw sources · 19 deep research reports

This isn't search over notes. It's **LLM-compiled, cross-referenced knowledge** built with [Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

---

## 🛠 6 tools exposed via MCP

| Tool | Purpose |
|------|---------|
| `list_topics` | List all 43 wiki pages (concepts/maps/connections) |
| `read_page` | Read a specific page in full |
| `search_knowledge` | Full-text search wiki + raw sources |
| `get_index` | Master index organized by domain |
| `get_paper_index` | Paper indexes with citations & tiers (`agent-communication`, `world-model`, `reasoning`) |
| `get_log` | Chronological log of research operations |

---

## 📊 Live observability

This server is publicly observable. No PII stored.

- **`/`** — health + usage summary (request count, top tools, top searches)
- **`/stats`** — full aggregate stats (24h timeline, 14d trends)
- **`/stats/recent`** — last N requests (de-identified)

Privacy: IPs hashed, user agents classified into families (claude-code/cursor/cline/curl), search queries truncated to 60-char previews for popularity analysis only.

---

## 🏗 Build your own Personal Knowledge Card

This is where it gets interesting. **You can build your own Card the same way I built mine.**

### Why you might want one

- **For yourself**: Stop reintroducing yourself to ChatGPT every day. Your AI now knows your research, your views, your context.
- **To share**: Put `myname.cards/mcp` in your X bio. Let investors / collaborators / recruiters' AIs ask deep questions about you.
- **To compound**: Every blog post, every research note, every project doc becomes structured knowledge your AI can use forever.

### Quick start (uses BENZEMA's vault as template)

```bash
git clone https://github.com/BENZEMA216/wiki-mcp-server.git
cd wiki-mcp-server
npm install
npm start
# → http://localhost:3000
```

### Point it at YOUR vault

Set environment variables to use your own AK-style LLM Wiki:

```bash
VAULT_REPO=https://github.com/yourname/your-vault.git npm start
```

Don't have an AK-style vault yet? See [LLM Wiki Pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — start by dumping your blog posts / X archive / GitHub READMEs into a `raw/` folder, then let Claude Code compile them into a `wiki/` folder.

### Deploy to Railway (free tier works)

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
| `VAULT_REPO` | BENZEMA's public vault | Your vault repo (must be public) |
| `VAULT_DIR` | `/tmp/vault` | Local clone path |
| `PULL_INTERVAL_MS` | `600000` | Auto sync interval (10 min) |
| `TELEMETRY_PATH` | `/tmp/mcp-access.jsonl` | Where to write access logs |
| `TELEMETRY_SALT` | (default) | Salt for IP hashing |

---

## 🏛 Architecture

```
GitHub: yourname/your-vault
       ↓ git clone --depth 1, auto-pull every 10 min
Railway container (/tmp/vault)
       ↓ wiki-tools.js reads compiled markdown
Express HTTP server (with telemetry)
       ↓ POST /mcp (StreamableHTTP transport)
Any MCP client (Claude / Cursor / Cline)
       ↓
Your LLM uses YOUR knowledge as a tool
```

Push to your vault → reflected in your live endpoint within 10 min, no redeploy needed.

---

## 🌐 The bigger picture

I built this because I wanted my own AI to know me. The fact that you can plug into mine is a side effect.

But every Card built is a node in something bigger:

```
Personal Knowledge Card  →  N Cards in a directory  →  Routing layer
   (self use, today)        (this year)                 (next year)
                                       ↓
                               Expert Network for AI
                                   (terminal state)
```

When 100 people have built their own Cards, plugging into "the network of cards" becomes useful in a way no single Card ever could be. But that's downstream. **Today: just build one for yourself.**

If you do, [open an issue](https://github.com/BENZEMA216/wiki-mcp-server/issues) and tell me about it. I want to know.

---

## 🤝 Feedback

- **Used the install command?** Star this repo so I know.
- **Built your own Card?** Open an issue with your endpoint. I'll add a directory soon.
- **Found an answer wrong / outdated?** [GitHub issue](https://github.com/BENZEMA216/wiki-mcp-server/issues) or DM [@BENZEMA216](https://github.com/BENZEMA216).
- **Want to chat about Agent infra / World Models / Knowledge Agent Network?** I'm always up for it.

## 📜 License

MIT — but please don't use my knowledge base content for commercial training without asking.

---

*Built by [BENZEMA216](https://github.com/BENZEMA216) · Inspired by [Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) · Use it to build your own brain.*
