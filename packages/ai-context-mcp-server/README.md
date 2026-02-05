# @ai-context/mcp-server

> **⚠️ DEPRECATION NOTICE**
>
> This package is **deprecated** as of v3.0.0. The MCP server is now included in the unified [`ai-context`](../ai-context/) package.
>
> **Migration:** Use `ai-context mcp` command instead.
>
> **Support:** Functionality is included in `ai-context` v3.0.0+
>
> ---

**MCP Server for AI Context** - A database-backed Model Context Protocol server that replaces file-based `.ai-context/` folders with a SQLite + vector database.

## Features

- **SQLite + sqlite-vec** - Single portable `.ai-context.db` file with vector search
- **OpenRouter Embeddings** - Semantic search powered by OpenRouter API
- **Full Knowledge Graph** - Typed relationships between context items
- **Code + Git Indexing** - Index source code and git history
- **Shadow Files** - Auto-generate .md files for git visibility
- **MCP Protocol** - stdio transport for Claude Desktop compatibility
- **File Watcher** - Auto-sync on file changes with debounce
- **CLI Integration** - Full CLI for init, status, watch, migrate, export

## Quick Start

```bash
# Initialize the database with your project context
npx create-ai-context mcp:init

# Check database status
npx create-ai-context mcp:status

# Start the MCP server
npx create-ai-context mcp:start

# Watch for file changes (auto-sync)
npx create-ai-context mcp:watch
```

## Installation

```bash
npm install @ai-context/mcp-server
```

## Claude Desktop Configuration

### Step 1: Locate Config File

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Step 2: Add MCP Server Configuration

Add the following to your `claude_desktop_config.json`:

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

### Step 3: Initialize Database

Before starting Claude Desktop, initialize the database in your project:

```bash
cd /path/to/your/project
npx create-ai-context mcp:init
```

### Step 4: Restart Claude Desktop

Restart Claude Desktop to load the MCP server. You should see "ai-context" in the server list when you click the MCP icon.

### Step 5: Test the Integration

Try these prompts in Claude Desktop:

- "Search for authentication related code"
- "What workflows are documented in this project?"
- "Show me the knowledge graph for the API module"
- "What changed in the last 10 commits?"

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for embeddings |
| `AI_CONTEXT_PROJECT_ROOT` | No | Project directory (defaults to cwd) |
| `AI_CONTEXT_DB_PATH` | No | Database filename (default: `.ai-context.db`) |

## CLI Commands

### mcp:init

Initialize the MCP database and index existing context.

```bash
npx create-ai-context mcp:init [options]

Options:
  -p, --path <dir>   Project directory (defaults to current)
  --db <path>        Database filename (defaults to .ai-context.db)
  --skip-code        Skip source code indexing
  --skip-git         Skip git history indexing
```

### mcp:status

Show database status and statistics.

```bash
npx create-ai-context mcp:status [options]

Options:
  -p, --path <dir>   Project directory (defaults to current)
  --db <path>        Database filename (defaults to .ai-context.db)
```

### mcp:start

Start the MCP server for Claude Desktop.

```bash
npx create-ai-context mcp:start [options]

Options:
  -p, --path <dir>   Project directory (defaults to current)
  --db <path>        Database filename (defaults to .ai-context.db)
```

### mcp:watch

Watch for file changes and auto-sync to the database.

```bash
npx create-ai-context mcp:watch [options]

Options:
  -p, --path <dir>     Project directory (defaults to current)
  --db <path>          Database filename (defaults to .ai-context.db)
  --debounce <ms>      Debounce delay in milliseconds (default: 500)
  -v, --verbose        Show detailed output
```

### mcp:migrate

Migrate existing file-based AI context to the database.

```bash
npx create-ai-context mcp:migrate [options]

Options:
  -p, --path <dir>   Project directory (defaults to current)
  --db <path>        Database filename (defaults to .ai-context.db)
  --dry-run          Show what would be migrated without making changes
```

### mcp:export

Export database content to markdown files.

```bash
npx create-ai-context mcp:export [options]

Options:
  -p, --path <dir>    Project directory (defaults to current)
  --db <path>         Database filename (defaults to .ai-context.db)
  -o, --output <dir>  Output directory (default: .ai-context-export)
  --format <format>   Export format: shadow (individual files) or single (one file)
```

### mcp:sync

Export database to all AI tool formats (cross-tool sync).

```bash
npx create-ai-context mcp:sync [options]

Options:
  -p, --path <dir>   Project directory (defaults to current)
  --db <path>        Database filename (defaults to .ai-context.db)
  --tools <tools>    Comma-separated list of tools (copilot,cline,antigravity,windsurf,aider,continue,all)
  -f, --force        Force overwrite of existing non-managed files
  --status           Show sync status without exporting
  -v, --verbose      Show detailed output
```

Supported tools:
- **GitHub Copilot** → `.github/copilot-instructions.md`
- **Cline** → `.clinerules`
- **Antigravity** → `.agent/context.md`
- **Windsurf** → `.windsurf/rules.md`
- **Aider** → `.aider.conf.yml` and `.aiderignore`
- **Continue** → `.continue/config.json`

## MCP Tools

| Tool | Description |
|------|-------------|
| `search_context` | Semantic search across all indexed content |
| `get_item` | Get specific context item by ID or path |
| `add_knowledge` | Store new insight or relationship |
| `query_graph` | Traverse knowledge graph relationships |
| `run_drift_check` | Check if context matches codebase |
| `reindex` | Re-index codebase and git history |
| `export_shadow` | Regenerate shadow .md files for git |

## MCP Resources

| URI Pattern | Description |
|-------------|-------------|
| `context://workflows/{name}` | Workflow documentation |
| `context://agents/{name}` | Agent definitions |
| `context://commands/{name}` | Command documentation |
| `context://code/{path}` | Indexed source code |
| `context://commits/{sha}` | Git commit information |

## Database Schema

The server uses SQLite with sqlite-vec for vector operations:

```sql
-- Core context storage
CREATE TABLE context_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  file_path TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Vector embeddings
CREATE VIRTUAL TABLE embeddings USING vec0(
  context_id TEXT,
  embedding FLOAT[1536]
);

-- Knowledge graph
CREATE TABLE knowledge_graph (
  id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  metadata JSON
);
```

## Relation Types

The knowledge graph supports these relationship types:

| Relation | Description |
|----------|-------------|
| `uses` | X uses Y (library, function, etc.) |
| `implements` | X implements Y (interface, pattern) |
| `depends_on` | X depends on Y |
| `references` | X references Y |
| `tests` | X tests Y |
| `documents` | X documents Y |
| `extends` | X extends Y |
| `contains` | X contains Y |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode (watch)
npm run dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Context Server                           │
├─────────────────────────────────────────────────────────────────┤
│  Transport: stdio                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐    ┌───────────────┐    ┌────────────────┐  │
│  │   Resources   │    │    Tools      │    │    Prompts     │  │
│  │   (context)   │    │  (commands)   │    │   (agents)     │  │
│  └───────┬───────┘    └───────┬───────┘    └───────┬────────┘  │
│          └────────────────────┼─────────────────────┘           │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              SQLite + sqlite-vec Database                   ││
│  │  • context_items    • embeddings    • knowledge_graph       ││
│  │  • sync_state       • git_commits                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                ▼
                     .ai-context.db (portable)
                              ↓
                     .ai-context/*.md (shadow files for git)
```

## Troubleshooting

### "OPENROUTER_API_KEY not set"

The MCP server requires an OpenRouter API key for generating embeddings. 

```bash
# Set environment variable
export OPENROUTER_API_KEY="your-key-here"

# Or add to Claude Desktop config
{
  "mcpServers": {
    "ai-context": {
      "env": {
        "OPENROUTER_API_KEY": "your-key-here"
      }
    }
  }
}
```

Get an API key at [openrouter.ai](https://openrouter.ai/).

### "Database not found"

Run `mcp:init` first to create the database:

```bash
npx create-ai-context mcp:init
```

### "MCP server package not found"

The MCP server package may need to be installed or built:

```bash
cd packages/ai-context-mcp-server
npm install
npm run build
```

### MCP Server Not Appearing in Claude Desktop

1. Verify config file location:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Validate JSON syntax in the config file

3. Restart Claude Desktop after changes

4. Check Claude Desktop logs for connection errors

### Embeddings Not Working

If semantic search returns no results:

1. Verify OpenRouter API key is valid
2. Check if embeddings were generated: `npx create-ai-context mcp:status`
3. Re-index with: `npx create-ai-context mcp:init --force`

### Cross-Tool Sync Conflicts

If files exist that aren't managed by the MCP server:

```bash
# Show which files would conflict
npx create-ai-context mcp:sync --status

# Force overwrite existing files
npx create-ai-context mcp:sync --force
```

### Database Locked

If you see "database is locked" errors:

1. Stop any running `mcp:watch` processes
2. Close other applications accessing the database
3. Check for `.ai-context.db-journal` file (delete if exists)

## License

MIT
