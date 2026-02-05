<p align="center">
  <img src="ccl_logo.jpg" alt="CCL Logo" width="200" height="200">
</p>

# AI Context Engineering

![npm](https://img.shields.io/npm/v/ai-context)
![npm downloads](https://img.shields.io/npm/dm/ai-context)
![GitHub Stars](https://img.shields.io/github/stars/SireJeff/claude-context-engineering-template?style=social)
![GitHub License](https://img.shields.io/github/license/SireJeff/claude-context-engineering-template)

**One command to supercharge your AI coding assistant with intelligent context.**

Supports: **Claude Code**, **GitHub Copilot**, **Cline**, **Antigravity**, **Windsurf**, **Aider**, **Continue**, **Cursor**, **Gemini**

---

## 🚀 Quick Start

```bash
# Set your OpenRouter API key for intelligent analysis
export OPENROUTER_API_KEY="your-key-here"

# Install globally
npm install -g ai-context

# Initialize with intelligent analysis
ai-context init

# Start MCP server
ai-context mcp

# Generate context for all AI tools
ai-context generate
```

---

## 📦 Packages

### Primary Package

| Package | Version | Description |
|---------|---------|-------------|
| [`ai-context`](./packages/ai-context/) | **3.0.0** | **Unified AI context package** with OpenRouter-powered analysis, MCP server, and cross-tool sync |

### Legacy Packages ⚠️

> **⚠️ Deprecated:** The following packages are **deprecated** as of v3.0.0. Users should migrate to the unified `ai-context` package.

| Package | Status | Migration Guide |
|---------|--------|-----------------|
| [`create-ai-context`](./packages/create-ai-context/) | ⚠️ Deprecated | [Migrate to ai-context](./docs/MIGRATE_TO_UNIFIED.md) |
| [`ai-context-mcp-server`](./packages/ai-context-mcp-server/) | ⚠️ Deprecated | Included in `ai-context` |
| [`claude-context-plugin`](./packages/claude-context-plugin/) | ⚠️ Deprecated | Use `ai-context` skills |

### Support Timeline

- **v2.x LTS:** Security updates only until **2026-06-01**
- **v1.x:** End of life - no updates

---

## 📁 Repository Structure

```
ai-context-monorepo/
├── packages/
│   ├── ai-context/              ← Primary package (v3.0.0)
│   │   ├── src/
│   │   │   ├── analyzer/        # Intelligent analysis (595 lines)
│   │   │   ├── cli/             # Unified CLI (481 lines)
│   │   │   ├── db/              # SQLite database (935 lines)
│   │   │   ├── embeddings/      # OpenRouter integration (367 lines)
│   │   │   └── mcp.ts           # MCP server (354 lines)
│   │   ├── agents/              # Agent definitions
│   │   ├── skills/              # RPI workflow skills
│   │   └── tests/               # Test suite
│   │
│   ├── create-ai-context/       ⚠️ Legacy (v2.5.0)
│   ├── ai-context-mcp-server/   ⚠️ Legacy (v1.0.0)
│   └── claude-context-plugin/   ⚠️ Legacy (v2.1.4)
│
├── docs/                        # Documentation
│   ├── MIGRATE_TO_UNIFIED.md    # Migration guide
│   ├── QUICK_START_5MIN.md
│   └── TROUBLESHOOTING.md
│
├── .claude/                     # Claude Code context
│   ├── commands/                # RPI commands
│   ├── agents/                  # Agent definitions
│   └── skills/                  # RPI skills
│
└── README.md                    # This file
```

---

## Complete CLI Reference

### Primary Package Commands (`ai-context`)

| Command | One-Line Explanation |
|---------|----------------------|
| `ai-context init` | Initialize with intelligent OpenRouter-powered analysis |
| `ai-context init --no-intelligent` | Initialize with basic static analysis only |
| `ai-context generate` | Generate context files for all AI tools |
| `ai-context sync` | Synchronize context across all AI tools |
| `ai-context mcp` | Start MCP server for AI tools to connect |
| `ai-context index` | Index codebase into the database |
| `ai-context search <query>` | Semantic search across indexed content |
| `ai-context stats` | Show database statistics |

### Legacy Commands (Deprecated)

> ⚠️ These commands still work but are deprecated. Please migrate to `ai-context`.

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-universal-ai-context` | Initialize AI context (use `ai-context init` instead) |
| `npx create-universal-ai-context generate` | Regenerate AI context files |
| `npx create-universal-ai-context sync:check` | Check if AI tool contexts are synchronized |
| `npx create-universal-ai-context sync:all` | Synchronize all AI tool contexts |
| `npx create-universal-ai-context status` | Show current AI context installation status |

---

## MCP Server

The unified `ai-context` package includes a complete MCP server for AI assistant integration.

### Features

- **SQLite + sqlite-vec** - Single portable `.ai-context.db` file
- **Semantic Search** - OpenRouter-powered embeddings for intelligent search
- **Knowledge Graph** - 14 typed relationships between context items
- **Cross-Tool Sync** - Export to all AI tools from one source
- **Intelligent Analysis** - OpenRouter-powered codebase understanding
- **Automatic Discovery** - Scans docs, code, and tool configs automatically

### Quick Start

```bash
# Set OpenRouter API key
export OPENROUTER_API_KEY="your-key"

# Initialize with intelligent analysis
ai-context init

# Start MCP server
ai-context mcp

# Check stats
ai-context stats
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-context": {
      "command": "node",
      "args": ["/path/to/ai-context/dist/mcp.js"],
      "env": {
        "OPENROUTER_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

See [MCP Quick Start](./packages/ai-context/docs/MCP_QUICKSTART.md) for full documentation.

---

## AI Tools Supported

| Tool | Output File | One-Line Explanation |
|------|-------------|----------------------|
| **Claude Code** | `AI_CONTEXT.md` + `.ai-context/` | Project navigation, workflows, commands, agents |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Tech stack, patterns, conventions for Copilot suggestions |
| **Cline** | `.clinerules` | Architecture, commands, gotchas for Cline autopilot |
| **Antigravity** | `.agent/` (10 files) | Identity, workflows, skills for Cascade AI |
| **Windsurf** | `.windsurf/rules.md` | XML-tagged rules for Windsurf Cascade AI |
| **Aider** | `.aider.conf.yml` | Configuration for terminal-based pair programming |
| **Continue** | `.continue/config.json` | Configuration with slash commands for VS Code autopilot |
| **Cursor** | `.cursor/`, `.cursorrules` | Rules and settings for Cursor AI |
| **Gemini** | `.gemini/` | Configuration for Google Gemini |

---

## AI Agents & Commands (Claude Code)

### Available Agents

| Agent | Capacity | When to Use |
|-------|----------|-------------|
| `@context-engineer` | Initialize system, setup project structure | First-time setup, major reconfiguration |
| `@core-architect` | Design system architecture, plan structure | New features, refactoring, tech decisions |
| `@api-developer` | Design and implement API endpoints | REST/GraphQL APIs, route handlers |
| `@database-ops` | Design database schemas, migrations | Database changes, data modeling |
| `@deployment-ops` | Plan deployments, CI/CD pipelines | Infrastructure, deployment strategies |
| `@integration-hub` | Design external service integrations | Third-party APIs, webhooks |

### Available Commands

| Command | Capacity | One-Line Explanation |
|---------|----------|----------------------|
| `/rpi-research` | Explore codebase, create research document | Deep dive into unknown code, investigate features |
| `/rpi-plan` | Create implementation plan from research | Design step-by-step implementation strategy |
| `/rpi-implement` | Execute plan with atomic commits | Build feature with validation between steps |
| `/context-optimize` | Orchestrate context optimization | Generate RPI TODO list with interactive scoping |
| `/verify-docs-current` | Validate documentation accuracy | Check doc line references against code |
| `/validate-all` | Run validation suite on documentation | Check completeness, consistency, accuracy |
| `/help` | Display all available commands | Discover available tools |

---

## Advanced Features

### 🔀 Automatic Codebase Analysis
Detects languages, frameworks, entry points, workflows, and architecture automatically.

### 🔄 Cross-Tool Synchronization
Edit once, sync everywhere. Changes to `.ai-context/` propagate to all AI tools automatically.

### 📊 Drift Detection
Automatically detects when documentation falls out of sync with codebase.

### 💾 Session Persistence
Save and restore Claude Code sessions across restarts.

### 🪝 Git Hooks
Auto-sync on commits ensures docs stay up-to-date.

---

## Documentation

- [Quick Start Guide](./docs/QUICK_START_5MIN.md) - Get started in 5 minutes
- [Migration Guide](./docs/MIGRATE_TO_UNIFIED.md) - Migrate from legacy packages
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - 61 error codes with solutions
- [MCP Quick Start](./packages/ai-context/docs/MCP_QUICKSTART.md) - MCP server setup

---

## License

MIT

---

**Version:** 3.0.0 | **Updated:** 2026-02-05 | **Primary Package:** `ai-context`
