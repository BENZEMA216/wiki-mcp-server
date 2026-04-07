import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { glob } from "glob";

// Configure your wiki path here
const WIKI_PATH =
  process.env.WIKI_PATH ||
  path.join(
    process.env.HOME,
    "Downloads/OBSIDIAN/BENZEMA/wiki"
  );
const RAW_PATH =
  process.env.RAW_PATH ||
  path.join(
    process.env.HOME,
    "Downloads/OBSIDIAN/BENZEMA/raw"
  );

const server = new McpServer({
  name: "knowledge-base",
  version: "0.1.0",
});

// Helper: read file safely
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

// Helper: list all wiki pages
function listWikiPages() {
  const pages = [];
  for (const dir of ["concepts", "maps", "connections"]) {
    const dirPath = path.join(WIKI_PATH, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".md")) continue;
      const content = readFile(path.join(dirPath, file));
      const firstLine = content?.split("\n").find((l) => l.startsWith("# "));
      const quote = content
        ?.split("\n")
        .find((l) => l.startsWith("> ") && !l.includes("LLM"));
      pages.push({
        type: dir.replace(/s$/, ""),
        slug: file.replace(".md", ""),
        title: firstLine?.replace("# ", "") || file,
        summary: quote?.replace("> ", "") || "",
        path: `wiki/${dir}/${file}`,
      });
    }
  }
  return pages;
}

// Tool 1: List all topics in the knowledge base
server.tool(
  "list_topics",
  "List all topics (concepts, maps, connections) in BENZEMA's knowledge base. Call this first to see what knowledge is available.",
  {},
  async () => {
    const pages = listWikiPages();
    const grouped = { concept: [], map: [], connection: [] };
    for (const p of pages) {
      grouped[p.type]?.push(p);
    }

    let output = `# BENZEMA Knowledge Base\n\n`;
    output += `> LLM-compiled wiki with ${pages.length} pages across AI Agent infrastructure, Harness Engineering, World Models, and Creative AI.\n\n`;

    output += `## Concepts (${grouped.concept.length})\n`;
    for (const p of grouped.concept) {
      output += `- **${p.title}** — ${p.summary}\n`;
    }

    output += `\n## Maps (${grouped.map.length})\n`;
    for (const p of grouped.map) {
      output += `- **${p.title}** — ${p.summary}\n`;
    }

    output += `\n## Connections (${grouped.connection.length})\n`;
    for (const p of grouped.connection) {
      output += `- **${p.title}** — ${p.summary}\n`;
    }

    return { content: [{ type: "text", text: output }] };
  }
);

// Tool 2: Read a specific wiki page
server.tool(
  "read_page",
  "Read the full content of a specific wiki page. Use the slug from list_topics (e.g. 'agent-communication', 'world-model', 'harness-engineering').",
  {
    slug: z.string().describe("Page slug, e.g. 'agent-communication'"),
    type: z
      .enum(["concept", "map", "connection"])
      .default("concept")
      .describe("Page type"),
  },
  async ({ slug, type }) => {
    const dir = type + "s";
    const filePath = path.join(WIKI_PATH, dir, `${slug}.md`);
    const content = readFile(filePath);
    if (!content) {
      return {
        content: [
          {
            type: "text",
            text: `Page not found: ${dir}/${slug}.md\n\nAvailable pages:\n${listWikiPages()
              .filter((p) => p.type === type)
              .map((p) => `- ${p.slug}`)
              .join("\n")}`,
          },
        ],
      };
    }
    return { content: [{ type: "text", text: content }] };
  }
);

// Tool 3: Search the knowledge base
server.tool(
  "search_knowledge",
  "Search across the entire knowledge base (wiki + raw sources) for a keyword or topic. Returns matching excerpts with file paths.",
  {
    query: z.string().describe("Search keyword or phrase"),
    scope: z
      .enum(["wiki", "raw", "all"])
      .default("wiki")
      .describe("Search scope"),
    max_results: z.number().default(10).describe("Maximum results to return"),
  },
  async ({ query, scope, max_results }) => {
    const searchPaths = [];
    if (scope === "wiki" || scope === "all") searchPaths.push(WIKI_PATH);
    if (scope === "raw" || scope === "all") searchPaths.push(RAW_PATH);

    const results = [];
    const queryLower = query.toLowerCase();

    for (const basePath of searchPaths) {
      const files = await glob("**/*.md", { cwd: basePath });
      for (const file of files) {
        if (results.length >= max_results) break;
        const fullPath = path.join(basePath, file);
        const content = readFile(fullPath);
        if (!content) continue;

        const lines = content.split("\n");
        const matchingLines = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(queryLower)) {
            const start = Math.max(0, i - 1);
            const end = Math.min(lines.length, i + 2);
            matchingLines.push(lines.slice(start, end).join("\n"));
          }
        }

        if (matchingLines.length > 0) {
          const relPath = path.relative(
            path.dirname(basePath),
            fullPath
          );
          results.push({
            file: relPath,
            matches: matchingLines.length,
            excerpts: matchingLines.slice(0, 3),
          });
        }
      }
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No results found for "${query}" in ${scope} scope.`,
          },
        ],
      };
    }

    let output = `# Search: "${query}" (${results.length} files matched)\n\n`;
    for (const r of results) {
      output += `## ${r.file} (${r.matches} matches)\n`;
      for (const ex of r.excerpts) {
        output += `\`\`\`\n${ex}\n\`\`\`\n`;
      }
      output += "\n";
    }

    return { content: [{ type: "text", text: output }] };
  }
);

// Tool 4: Get the wiki index
server.tool(
  "get_index",
  "Get the full knowledge base index — the master catalog of all topics organized by domain. Start here to understand the knowledge structure.",
  {},
  async () => {
    const content = readFile(path.join(WIKI_PATH, "_index.md"));
    return {
      content: [{ type: "text", text: content || "Index not found" }],
    };
  }
);

// Tool 5: Get paper index (with citations and quality tiers)
server.tool(
  "get_paper_index",
  "Get the paper index for a specific research area. Includes citation counts, quality tiers (S/A/B/C), and arXiv URLs.",
  {
    area: z
      .enum(["agent-communication", "world-model", "reasoning"])
      .describe("Research area"),
  },
  async ({ area }) => {
    const paths = {
      "agent-communication": path.join(
        RAW_PATH,
        "articles/agent-communication/paper-index.md"
      ),
      "world-model": path.join(
        RAW_PATH,
        "articles/world-model/paper-index.md"
      ),
      reasoning: path.join(
        RAW_PATH,
        "papers/reasoning/LLM-Reasoning-Paper-Index.md"
      ),
    };
    const content = readFile(paths[area]);
    return {
      content: [
        {
          type: "text",
          text: content || `Paper index not found for ${area}`,
        },
      ],
    };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
