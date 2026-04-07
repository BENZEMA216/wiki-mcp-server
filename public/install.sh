#!/usr/bin/env bash
#
# BENZEMA's Knowledge MCP — one-line installer
#
# Usage:
#   curl -fsSL https://benzema-wiki-mcp-production.up.railway.app/install | bash
#
# What it does:
#   1. Detects which MCP clients you have installed (Claude Code, Cursor, Cline)
#   2. Adds benzema-knowledge to each one's config (with .bak backups)
#   3. Prints test prompts you can paste right away
#
# Source: https://github.com/BENZEMA216/wiki-mcp-server/blob/main/public/install.sh

set -euo pipefail

ENDPOINT="https://benzema-wiki-mcp-production.up.railway.app/mcp"
NAME="benzema-knowledge"

# ─── Pretty printing ────────────────────────────────────────────────────────
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_CYAN='\033[36m'
  C_GREEN='\033[32m'
  C_YELLOW='\033[33m'
  C_RED='\033[31m'
  C_DIM='\033[2m'
  C_BOLD='\033[1m'
  C_RESET='\033[0m'
else
  C_CYAN= C_GREEN= C_YELLOW= C_RED= C_DIM= C_BOLD= C_RESET=
fi

say() { printf '%b\n' "$*"; }

say ""
say "${C_BOLD}${C_CYAN}🧠 BENZEMA's Knowledge MCP — installer${C_RESET}"
say "${C_DIM}   Endpoint: ${ENDPOINT}${C_RESET}"
say ""

# ─── Dependency check ───────────────────────────────────────────────────────
if ! command -v python3 >/dev/null 2>&1; then
  say "${C_RED}✗${C_RESET} python3 is required but not found."
  say "  Install python3 first, then re-run this script."
  exit 1
fi

# ─── Helper: merge MCP config into a JSON file ──────────────────────────────
# Args:
#   $1 = JSON file path
#   $2 = "with-type" if Claude Code style ({type: http, url}), "url-only" otherwise
merge_config() {
  local file="$1"
  local style="$2"

  mkdir -p "$(dirname "$file")"

  ENDPOINT="$ENDPOINT" NAME="$NAME" CONFIG_FILE="$file" STYLE="$style" python3 - <<'PYEOF'
import json
import os
import sys

path = os.environ["CONFIG_FILE"]
name = os.environ["NAME"]
endpoint = os.environ["ENDPOINT"]
style = os.environ["STYLE"]

# Load existing config (or empty dict)
try:
    with open(path) as f:
        config = json.load(f)
except FileNotFoundError:
    config = {}
except json.JSONDecodeError as e:
    print(f"ERROR: existing file at {path} is not valid JSON: {e}", file=sys.stderr)
    sys.exit(2)

if not isinstance(config, dict):
    print(f"ERROR: existing config at {path} is not a JSON object", file=sys.stderr)
    sys.exit(2)

if "mcpServers" not in config or not isinstance(config.get("mcpServers"), dict):
    config["mcpServers"] = {}

if style == "with-type":
    server_config = {"type": "http", "url": endpoint}
else:
    server_config = {"url": endpoint}

already = config["mcpServers"].get(name)
config["mcpServers"][name] = server_config

with open(path, "w") as f:
    json.dump(config, f, indent=2)
    f.write("\n")

if already == server_config:
    print("UNCHANGED")
elif already is None:
    print("ADDED")
else:
    print("UPDATED")
PYEOF
}

# ─── Backup helper ──────────────────────────────────────────────────────────
backup_if_exists() {
  local file="$1"
  if [ -f "$file" ]; then
    cp "$file" "${file}.bak"
    say "  ${C_DIM}backed up to ${file}.bak${C_RESET}"
  fi
}

INSTALLED_TARGETS=()

# ─── 1. Claude Code ─────────────────────────────────────────────────────────
# Prefer the official CLI if present, otherwise edit ~/.claude.json directly
say "${C_CYAN}→${C_RESET} Looking for Claude Code..."
CLAUDE_INSTALLED=false

if command -v claude >/dev/null 2>&1; then
  if claude mcp add --transport http "$NAME" "$ENDPOINT" >/tmp/claude-mcp-add.log 2>&1; then
    say "  ${C_GREEN}✓${C_RESET} added via ${C_BOLD}claude mcp add${C_RESET}"
    INSTALLED_TARGETS+=("claude-code (CLI)")
    CLAUDE_INSTALLED=true
  elif grep -q "already exists" /tmp/claude-mcp-add.log 2>/dev/null; then
    say "  ${C_GREEN}✓${C_RESET} already configured in claude CLI"
    INSTALLED_TARGETS+=("claude-code (CLI)")
    CLAUDE_INSTALLED=true
  else
    say "  ${C_YELLOW}⚠${C_RESET} CLI failed, will try direct file edit"
  fi
fi

if ! $CLAUDE_INSTALLED; then
  CLAUDE_CONFIG="$HOME/.claude.json"
  if [ -f "$CLAUDE_CONFIG" ] || command -v claude >/dev/null 2>&1; then
    backup_if_exists "$CLAUDE_CONFIG"
    if result=$(merge_config "$CLAUDE_CONFIG" "with-type"); then
      say "  ${C_GREEN}✓${C_RESET} $(echo "$result" | tr '[:upper:]' '[:lower:]') in ${CLAUDE_CONFIG}"
      INSTALLED_TARGETS+=("claude-code (file)")
      CLAUDE_INSTALLED=true
    else
      say "  ${C_RED}✗${C_RESET} failed to update ${CLAUDE_CONFIG}"
    fi
  fi
fi

if ! $CLAUDE_INSTALLED; then
  say "  ${C_DIM}not detected, skipping${C_RESET}"
fi

# ─── 2. Cursor ──────────────────────────────────────────────────────────────
say "${C_CYAN}→${C_RESET} Looking for Cursor..."
CURSOR_CONFIG="$HOME/.cursor/mcp.json"
CURSOR_INSTALLED=false

if [ -d "$HOME/.cursor" ] || command -v cursor >/dev/null 2>&1; then
  backup_if_exists "$CURSOR_CONFIG"
  if result=$(merge_config "$CURSOR_CONFIG" "url-only"); then
    say "  ${C_GREEN}✓${C_RESET} $(echo "$result" | tr '[:upper:]' '[:lower:]') in ${CURSOR_CONFIG}"
    INSTALLED_TARGETS+=("cursor")
    CURSOR_INSTALLED=true
  else
    say "  ${C_RED}✗${C_RESET} failed to update ${CURSOR_CONFIG}"
  fi
fi

if ! $CURSOR_INSTALLED; then
  say "  ${C_DIM}not detected, skipping${C_RESET}"
fi

# ─── 3. Cline (VSCode extension, macOS path) ────────────────────────────────
say "${C_CYAN}→${C_RESET} Looking for Cline (VSCode)..."
CLINE_DIR="$HOME/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings"
CLINE_CONFIG="$CLINE_DIR/cline_mcp_settings.json"
CLINE_INSTALLED=false

if [ -d "$CLINE_DIR" ] || [ -f "$CLINE_CONFIG" ]; then
  backup_if_exists "$CLINE_CONFIG"
  if result=$(merge_config "$CLINE_CONFIG" "url-only"); then
    say "  ${C_GREEN}✓${C_RESET} $(echo "$result" | tr '[:upper:]' '[:lower:]') in ${CLINE_CONFIG}"
    INSTALLED_TARGETS+=("cline")
    CLINE_INSTALLED=true
  else
    say "  ${C_RED}✗${C_RESET} failed to update ${CLINE_CONFIG}"
  fi
fi

if ! $CLINE_INSTALLED; then
  say "  ${C_DIM}not detected, skipping${C_RESET}"
fi

# ─── Result ─────────────────────────────────────────────────────────────────
say ""

if [ ${#INSTALLED_TARGETS[@]} -eq 0 ]; then
  say "${C_RED}✗ No supported MCP clients detected.${C_RESET}"
  say ""
  say "Manually add this to your MCP config:"
  say ""
  say "  ${C_CYAN}For Claude Code (~/.claude.json):${C_RESET}"
  say '    {"mcpServers": {"benzema-knowledge": {"type": "http", "url": "'"$ENDPOINT"'"}}}'
  say ""
  say "  ${C_CYAN}For Cursor (~/.cursor/mcp.json):${C_RESET}"
  say '    {"mcpServers": {"benzema-knowledge": {"url": "'"$ENDPOINT"'"}}}'
  say ""
  exit 1
fi

say "${C_GREEN}${C_BOLD}✓ Installed for:${C_RESET} ${INSTALLED_TARGETS[*]}"
say ""
say "${C_BOLD}${C_CYAN}🚀 Try one of these prompts in your LLM:${C_RESET}"
say ""
say "  ${C_YELLOW}1.${C_RESET} What's in BENZEMA's knowledge base?"
say "  ${C_YELLOW}2.${C_RESET} Show me the top World Model papers with citation counts."
say "  ${C_YELLOW}3.${C_RESET} How do kimi-cli and Claude Code differ in tool execution concurrency?"
say ""
say "${C_DIM}📖 25 more prompts by role: https://github.com/BENZEMA216/wiki-mcp-server/blob/main/RECIPES.md${C_RESET}"
say ""
