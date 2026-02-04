<p align="center">
  <img src="ccl_logo.jpg" alt="CCL Logo" width="200" height="200">
</p>

# Universal AI Context Engineering

![npm](https://img.shields.io/npm/v/create-universal-ai-context)
![npm downloads](https://img.shields.io/npm/dm/create-universal-ai-context)
![GitHub Stars](https://img.shields.io/github/stars/SireJeff/claude-context-engineering-template?style=social)
![GitHub License](https://img.shields.io/github/license/SireJeff/claude-context-engineering-template)

**One command to supercharge your AI coding assistant with intelligent context.**

Supports: **Claude Code**, **GitHub Copilot**, **Cline**, **Antigravity**, **Windsurf**, **Aider**, **Continue**

---

## Quick Start

```bash
npx create-universal-ai-context
```

---

## Complete CLI Reference

### Initialization Commands

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-universal-ai-context` | Initialize AI context for your codebase (interactive mode) |
| `npx create-universal-ai-context --yes` | Initialize with defaults, skip all prompts |
| `npx create-universal-ai-context --ai <tools>` | Generate for specific AI tools only (e.g., `--ai claude,copilot`) |
| `npx create-universal-ai-context --static` | Force standalone mode - static analysis only, no AI setup |
| `npx create-universal-ai-context --analyze-only` | Run codebase analysis without installation |
| `npx create-universal-ai-context --stack <preset>` | Use tech stack preset (python-fastapi, node-express, etc.) |
| `npx create-universal-ai-context --mode <mode>` | Handle existing docs: `merge`, `overwrite`, or `interactive` |
| `npx create-universal-ai-context --backup` | Create backup before modifying existing files |
| `npx create-ai-context --fail-on-unreplaced` | Error if any placeholder values remain unreplaced |
| `npx create-universal-ai-context --force` | Force overwrite of existing files (use with caution) |

### Regeneration Commands

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-universal-ai-context generate` | Regenerate AI context files for existing project |
| `npx create-universal-ai-context generate --ai <tools>` | Regenerate for specific AI tools only |
| `npx create-universal-ai-context generate --dryRun` | Show what would be regenerated without making changes |

### Status & Validation Commands

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-universal-ai-context status` | Show current AI context installation status |
| `npx create-universal-ai-context drift` | Check if documentation is out of sync with codebase |
| `npx create-universal-ai-context drift --all` | Check drift for all documents with detailed report |
| `npx create-universal-ai-context validate-all` | Run full validation suite on documentation |

### Synchronization Commands

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-universal-ai-context sync:check` | Check if AI tool contexts are synchronized |
| `npx create-universal-ai-context sync:all` | Synchronize all AI tool contexts from codebase |
| `npx create-universal-ai-context sync:from <tool>` | Propagate context from specific tool to all others |
| `npx create-universal-ai-context sync:resolve --strategy <strategy>` | Resolve conflicts between AI tool contexts |
| `npx create-universal-ai-context sync:history` | Show synchronization history |

### Migration Commands

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-universal-ai-context migrate` | Migrate from v1.x (.claude/) to v2.0 (.ai-context/) |
| `npx create-universal-ai-context migrate --dryRun` | Show migration plan without making changes |
| `npx create-universal-ai-context migrate --backup` | Create backup before migrating |

### Git Integration

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-universal-ai-context hooks:install` | Install git hooks for automatic sync (pre-commit, post-commit) |

### Helper Flags

| Flag | Purpose |
|------|---------|
| `-v, --verbose` | Show detailed output |
| `-n, --dry-run` | Show what would be done without making changes |
| `-f, --force` | Force overwrite of existing files (use with caution) |
| `-p, --path <dir>` | Specify project directory (defaults to current) |
| `--no-git` | Skip git initialization |
| `--no-plugin` | Skip plugin installation |

### MCP Server Commands (Database-Backed Context)

| Command | One-Line Explanation |
|---------|----------------------|
| `npx create-ai-context mcp:init` | Initialize SQLite database and index project context |
| `npx create-ai-context mcp:status` | Show database statistics |
| `npx create-ai-context mcp:start` | Start MCP server for Claude Desktop |
| `npx create-ai-context mcp:watch` | Watch for file changes and auto-sync |
| `npx create-ai-context mcp:migrate` | Migrate file-based context to database |
| `npx create-ai-context mcp:export` | Export database to markdown files |
| `npx create-ai-context mcp:sync` | Export database to all AI tool formats (cross-tool sync) |

---

## MCP Server (Advanced)

The MCP Server provides a **database-backed alternative** to file-based context. Instead of managing multiple `.md` files, it stores everything in a SQLite database with vector search capabilities.

### Features

- **SQLite + sqlite-vec** - Single portable `.ai-context.db` file
- **Semantic Search** - OpenRouter-powered embeddings for intelligent search
- **Knowledge Graph** - 14 typed relationships between context items
- **Cross-Tool Sync** - Export to all AI tools from one source
- **File Watcher** - Auto-sync on file changes

### Quick Start

```bash
# Initialize database from your codebase
npx create-ai-context mcp:init

# Check status
npx create-ai-context mcp:status

# Start MCP server for Claude Desktop
npx create-ai-context mcp:start

# Export to all AI tools
npx create-ai-context mcp:sync --force
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-context": {
      "command": "npx",
      "args": ["create-ai-context", "mcp:start"],
      "env": {
        "OPENROUTER_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

See [MCP Server README](packages/ai-context-mcp-server/README.md) for full documentation.

---

## AI Tools Generated

| Tool | Output File | One-Line Explanation |
|------|-------------|----------------------|
| **Claude Code** | `AI_CONTEXT.md` + `.ai-context/` | Project navigation, workflows, commands, agents |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Tech stack, patterns, conventions for Copilot suggestions |
| **Cline** | `.clinerules` | Architecture, commands, gotchas for Cline autopilot |
| **Antigravity** | `.agent/` (10 files) | Identity, workflows, skills for Cascade AI |
| **Windsurf** | `.windsurf/rules.md` | XML-tagged rules for Windsurf Cascade AI |
| **Aider** | `.aider.conf.yml` | Configuration for terminal-based pair programming |
| **Continue** | `.continue/config.json` | Configuration with slash commands for VS Code autopilot |

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
| `/auto-sync` | Synchronize docs with codebase | Update docs after code changes |
| `/session-save` | Save current Claude Code session state | Preserve work across restarts |
| `/session-resume` | Restore previously saved session | Continue where you left off |
| `/collab` | Handoff context to team members | Transfer knowledge, coordinate work |
| `/analytics` | View context metrics and statistics | Understand usage patterns |
| `/help` | Display all available commands | Discover available tools |

---

## Repository Structure: With vs Without Context Engineering

### ❌ Without Context Engineering

```
my-project/
├── src/
├── package.json
├── README.md
└── .git/

❌ AI has no context about:
   - Project purpose and domain
   - Architecture and patterns
   - Entry points and workflows
   - Team conventions
   - Database schema
   - API routes
   - Testing strategy

→ AI: "Guesses intent, reads everything, asks generic questions"
```

### ✅ With Context Engineering

```
my-project/
├── AI_CONTEXT.md                    ← Universal entry point for AI
├── .ai-context/                     ← Single source of truth
│   ├── agents/                       ← 6 specialized agents
│   │   ├── context-engineer.md
│   │   ├── core-architect.md
│   │   ├── api-developer.md
│   │   ├── database-ops.md
│   │   ├── deployment-ops.md
│   │   └── integration-hub.md
│   ├── commands/                     ← 12 slash commands
│   │   ├── rpi-research.md
│   │   ├── rpi-plan.md
│   │   ├── rpi-implement.md
│   │   ├── context-optimize.md
│   │   ├── verify-docs-current.md
│   │   ├── validate-all.md
│   │   ├── auto-sync.md
│   │   ├── session-save.md
│   │   ├── session-resume.md
│   │   ├── collab.md
│   │   ├── analytics.md
│   │   └── help.md
│   ├── context/workflows/            ← Auto-generated workflow docs
│   │   ├── analytics.md
│   │   ├── api-endpoints.md
│   │   ├── configuration.md
│   │   ├── data-processing.md
│   │   ├── database-operations.md
│   │   ├── search.md
│   │   ├── testing.md
│   │   └── user-authentication.md
│   ├── context/                        ← Core context files
│   │   ├── ARCHITECTURE_SNAPSHOT.md   ← System map
│   │   ├── CODE_TO_WORKFLOW_MAP.md    ← Navigation guide
│   │   ├── KNOWN_GOTCHAS.md           → Common pitfalls
│   │   ├── INTEGRATION_POINTS.md     → External deps
│   │   └── TESTING_MAP.md             → Test strategy
│   └── indexes/                       ← 3-level navigation chain
├── .claude/                          ← Claude Code symlinks to .ai-context/
├── .github/copilot-instructions.md  ← Copilot context
├── .clinerules                       ← Cline context
├── .windsurf/rules.md                ← Windsurf context
├── .aider.conf.yml                  ← Aider context
└── .continue/config.json            ← Continue context

✅ AI has complete context:
   → Knows project purpose, domain, and architecture
   → Understands workflows and entry points
   → Aware of team conventions and gotchas
   → Can ask specific questions using /commands
   → Can delegate work to specialized /agents
```

---

## Tech Stack Presets

| Preset | Framework | Use When |
|--------|-----------|----------|
| `python` | Python (generic) | Pure Python projects |
| `python-django` | Django | Django web applications |
| `python-fastapi` | FastAPI | FastAPI applications |
| `node` | Node.js (generic) | Pure Node projects |
| `node-nestjs` | NestJS | NestJS applications |
| `typescript-remix` | Remix | Remix applications |
| `go` | Go | Go applications |
| `rust` | Rust | Rust applications |
| `ruby` | Ruby (generic) | Pure Ruby projects |
| `java-spring` | Spring Boot | Spring applications |
| `csharp-dotnet` | .NET/C# | .NET applications |
| `php-laravel` | Laravel | Laravel applications |

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

## Installation

```bash
# For new projects
npx create-universal-ai-context

# For existing projects
npx create-universal-ai-context --yes

# For specific AI tools only
npx create-universal-ai-context --ai claude,copilot

# With tech stack preset
npx create-universal-ai-context --stack python-django
```

---

## License

MIT

---

**Version:** 2.5.0 | **Updated:** 2026-01-31
