# AI Context

Unified AI Context Engineering package for all AI coding assistants.

## Features

- **Intelligent Initialization**: Uses OpenRouter API for intelligent codebase analysis
- **Database-Backed Storage**: SQLite + sqlite-vec for context storage and semantic search
- **MCP Server**: Model Context Protocol server for AI tools to connect
- **Cross-Tool Sync**: Synchronize context across Claude, Copilot, Cline, and more
- **Automatic Discovery**: Scans docs, markdown files, code, and tool folders

## Installation

```bash
npm install -g ai-context
# or
npx ai-context init
```

## Quick Start

```bash
# Set your OpenRouter API key for intelligent analysis
export OPENROUTER_API_KEY="your-key"

# Initialize context in your project
ai-context init

# Start the MCP server
ai-context mcp

# Generate context files for all AI tools
ai-context generate

# Sync across tools
ai-context sync
```

## Commands

### `ai-context init [project-name]`

Initialize AI context for a project with intelligent analysis.

Options:
- `-y, --yes`: Skip prompts and use defaults
- `--ai <tools>`: Generate for specific AI tools (comma-separated)
- `-v, --verbose`: Show detailed output
- `--no-intelligent`: Skip OpenRouter-powered analysis

### `ai-context mcp`

Start the MCP server for AI tools to connect.

Options:
- `--db <path>`: Database file path (default: `.ai-context.db`)
- `--stdio`: Use stdio transport (default)

### `ai-context generate`

Generate or regenerate context files for AI tools.

Options:
- `--ai <tools>`: Generate for specific tools
- `--force`: Force regenerate

### `ai-context sync`

Synchronize context across all AI tools.

Options:
- `--check`: Only check status
- `--from <tool>`: Sync from specific tool
- `--to <tool>`: Sync to specific tool

### `ai-context index`

Index codebase content into the database.

Options:
- `--docs`: Index documentation only
- `--code`: Index source code only
- `--tools`: Index AI tool configs only
- `--all`: Index everything (default)

### `ai-context search <query>`

Semantic search across indexed content.

Options:
- `-t, --type <type>`: Filter by type
- `-l, --limit <n>`: Maximum results

### `ai-context stats`

Show database and indexing statistics.

## Supported AI Tools

- Claude Code (`.claude/`, `CLAUDE.md`, `AI_CONTEXT.md`)
- GitHub Copilot (`.github/copilot-instructions.md`)
- Cline (`.clinerules`, `.cline/`)
- Antigravity (`.agent/`)
- Windsurf (`.windsurf/`)
- Aider (`.aider/`, `.aider.conf.yml`)
- Continue (`.continue/`)
- Cursor (`.cursor/`, `.cursorrules`)
- Gemini (`.gemini/`)

## MCP Server

The unified `ai-context` package includes a complete MCP server for AI assistant integration.

### Quick Start

```bash
# Start the MCP server
ai-context mcp

# Or with stdio transport (default for Claude Desktop)
ai-context mcp --stdio
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-context": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\AppData\\Roaming\\npm\\node_modules\\ai-context\\dist\\mcp.js"],
      "env": {
        "OPENROUTER_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Available Tools

- `search_context` - Semantic search across indexed content
- `get_item` - Retrieve specific context items by ID or path
- `add_knowledge` - Store new insights and facts
- `analyze` - Run intelligent analysis using OpenRouter
- `get_tool_configs` - View AI tool configurations
- `query_graph` - Traverse knowledge graph relationships
- `get_stats` - Database statistics
- `add_relation` - Add relationships between context items
- `find_path` - Find paths between context items
- `run_drift_check` - Check documentation sync

### Available Prompts

- `context-engineer` - Initialize and configure AI context system
- `core-architect` - Design system architecture
- `api-developer` - Design API endpoints
- `database-ops` - Database schema design
- `deployment-ops` - Deployment planning
- `integration-hub` - External service integration

### Features

- **SQLite + sqlite-vec** - Single portable `.ai-context.db` file
- **Semantic Search** - Vector embeddings enable intelligent search
- **Knowledge Graph** - 14 typed relations between context items
- **Auto-Sync** - Real-time file watching ensures context stays current
- **Multi-Tool Support** - Export to 9 different AI tools

## Environment Variables

- `OPENROUTER_API_KEY`: Required for intelligent analysis
- `OPENROUTER_EMBEDDING_MODEL`: Embedding model (default: `openai/text-embedding-3-small`)
- `OPENROUTER_CHAT_MODEL`: Chat model (default: `anthropic/claude-3-haiku`)
- `AI_CONTEXT_PROJECT_ROOT`: Project root for MCP server
- `AI_CONTEXT_DB_PATH`: Database path for MCP server

## License

MIT
