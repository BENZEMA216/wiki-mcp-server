# Wiki MCP Server

> Turn your LLM-compiled knowledge base into a queryable Agent node.

## What is this?

An MCP Server that exposes a personal knowledge base (built with the [AK LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)) as tools that any MCP-compatible LLM client can call.

**Your wiki becomes an Agent that others can query.**

## Tools

| Tool | Description |
|------|-------------|
| `list_topics` | List all concepts, maps, and connections in the knowledge base |
| `read_page` | Read the full content of a specific wiki page |
| `search_knowledge` | Search across wiki and/or raw sources |
| `get_index` | Get the master index organized by domain |
| `get_paper_index` | Get paper indexes with citation counts and quality tiers |

## Setup

```bash
cd wiki-mcp-server
npm install
```

## Usage with Claude Code

Add to your `~/.claude.json` or project `.mcp.json`:

```json
{
  "mcpServers": {
    "benzema-knowledge": {
      "command": "node",
      "args": ["/Users/benzema/wiki-mcp-server/server.js"],
      "env": {
        "WIKI_PATH": "/Users/benzema/Downloads/OBSIDIAN/BENZEMA/wiki",
        "RAW_PATH": "/Users/benzema/Downloads/OBSIDIAN/BENZEMA/raw"
      }
    }
  }
}
```

## Usage with Cursor / other MCP clients

Same config format — add the MCP server entry to your client's MCP configuration.

## What can people ask?

Once connected, users can ask their LLM:

- "What does BENZEMA's knowledge base cover?" → `list_topics`
- "Tell me about Agent Communication protocols" → `read_page`
- "Search for JEPA in the knowledge base" → `search_knowledge`
- "Show me the World Model paper index" → `get_paper_index`
- "What's the relationship between harness engineering and creative AI?" → `read_page` (connection)

## Knowledge Base Stats

- 23 concept articles
- 6 topic maps
- 6 cross-domain connections
- 69 indexed papers (with citations + arXiv URLs)
- ~80 raw source files

## Part of Knowledge Agent Network

This is the first node in a Knowledge Agent Network — where each person's LLM-compiled wiki becomes a queryable Agent in an interconnected knowledge graph.

Vision: personal wiki → wiki agent → agent network → knowledge economy.

---

*Built by [BENZEMA216](https://github.com/BENZEMA216)*
