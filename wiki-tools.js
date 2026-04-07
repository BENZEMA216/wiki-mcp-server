// Shared wiki tool implementations used by both stdio and HTTP transports
import fs from "fs";
import path from "path";
import { glob } from "glob";

export function createWikiTools({ wikiPath, rawPath }) {
  function readFile(filePath) {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  function listWikiPages() {
    const pages = [];
    for (const dir of ["concepts", "maps", "connections"]) {
      const dirPath = path.join(wikiPath, dir);
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

  return {
    list_topics: async () => {
      const pages = listWikiPages();
      const grouped = { concept: [], map: [], connection: [] };
      for (const p of pages) grouped[p.type]?.push(p);

      let output = `# BENZEMA Knowledge Base\n\n`;
      output += `> LLM-compiled wiki with ${pages.length} pages across AI Agent infrastructure, Harness Engineering, World Models, and Creative AI.\n\n`;

      output += `## Concepts (${grouped.concept.length})\n`;
      for (const p of grouped.concept) {
        output += `- **${p.title}** (\`${p.slug}\`) — ${p.summary}\n`;
      }
      output += `\n## Maps (${grouped.map.length})\n`;
      for (const p of grouped.map) {
        output += `- **${p.title}** (\`${p.slug}\`) — ${p.summary}\n`;
      }
      output += `\n## Connections (${grouped.connection.length})\n`;
      for (const p of grouped.connection) {
        output += `- **${p.title}** (\`${p.slug}\`) — ${p.summary}\n`;
      }
      return output;
    },

    read_page: async ({ slug, type = "concept" }) => {
      const dir = type + "s";
      const filePath = path.join(wikiPath, dir, `${slug}.md`);
      const content = readFile(filePath);
      if (!content) {
        const available = listWikiPages()
          .filter((p) => p.type === type)
          .map((p) => `- ${p.slug}`)
          .join("\n");
        return `Page not found: ${dir}/${slug}.md\n\nAvailable ${type}s:\n${available}`;
      }
      return content;
    },

    search_knowledge: async ({ query, scope = "wiki", max_results = 10 }) => {
      const searchPaths = [];
      if (scope === "wiki" || scope === "all") searchPaths.push(wikiPath);
      if (scope === "raw" || scope === "all") searchPaths.push(rawPath);

      const results = [];
      const queryLower = query.toLowerCase();

      for (const basePath of searchPaths) {
        if (!fs.existsSync(basePath)) continue;
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
            const relPath = path.relative(path.dirname(basePath), fullPath);
            results.push({
              file: relPath,
              matches: matchingLines.length,
              excerpts: matchingLines.slice(0, 3),
            });
          }
        }
      }

      if (results.length === 0) {
        return `No results found for "${query}" in ${scope} scope.`;
      }

      let output = `# Search: "${query}" (${results.length} files matched)\n\n`;
      for (const r of results) {
        output += `## ${r.file} (${r.matches} matches)\n`;
        for (const ex of r.excerpts) {
          output += `\`\`\`\n${ex}\n\`\`\`\n`;
        }
        output += "\n";
      }
      return output;
    },

    get_index: async () => {
      const content = readFile(path.join(wikiPath, "_index.md"));
      return content || "Index not found";
    },

    get_paper_index: async ({ area }) => {
      const paths = {
        "agent-communication": path.join(
          rawPath,
          "articles/agent-communication/paper-index.md"
        ),
        "world-model": path.join(
          rawPath,
          "articles/world-model/paper-index.md"
        ),
        reasoning: path.join(
          rawPath,
          "papers/reasoning/LLM-Reasoning-Paper-Index.md"
        ),
      };
      const content = readFile(paths[area]);
      return content || `Paper index not found for ${area}`;
    },

    get_log: async () => {
      const content = readFile(path.join(wikiPath, "log.md"));
      return content || "Log not found";
    },
  };
}

export const TOOL_DEFINITIONS = [
  {
    name: "list_topics",
    description:
      "List all topics (concepts, maps, connections) in BENZEMA's knowledge base. Call this first to see what knowledge is available.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "read_page",
    description:
      "Read the full content of a specific wiki page. Use the slug from list_topics (e.g. 'agent-communication', 'world-model').",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Page slug, e.g. 'agent-communication'",
        },
        type: {
          type: "string",
          enum: ["concept", "map", "connection"],
          description: "Page type",
          default: "concept",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "search_knowledge",
    description:
      "Search across the knowledge base (wiki and/or raw sources) for a keyword. Returns matching excerpts with file paths.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keyword or phrase" },
        scope: {
          type: "string",
          enum: ["wiki", "raw", "all"],
          default: "wiki",
          description: "Search scope",
        },
        max_results: { type: "number", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "get_index",
    description:
      "Get the master knowledge base index — the catalog of all topics organized by domain. Start here.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_paper_index",
    description:
      "Get the paper index for a research area. Includes citation counts, quality tiers (S/A/B/C), and arXiv URLs.",
    inputSchema: {
      type: "object",
      properties: {
        area: {
          type: "string",
          enum: ["agent-communication", "world-model", "reasoning"],
        },
      },
      required: ["area"],
    },
  },
  {
    name: "get_log",
    description:
      "Get the chronological log of knowledge base operations. Shows recent ingests, queries, and refactors.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];
