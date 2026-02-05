# AI Context

Unified AI context engineering for Claude, GitHub Copilot, Cline, Cursor, Windsurf, Aider, Continue, Antigravity, and Gemini.

## Quick Start

```bash
npm install -g ai-context
ai-context init
```

## Features

- 🧠 **Intelligent Analysis** - OpenRouter-powered codebase analysis with embeddings
- 🔍 **Semantic Search** - Vector database (sqlite-vec) for intelligent code retrieval
- 🔄 **Cross-Tool Sync** - Synchronize context across 9 AI tools
- 📊 **MCP Server** - 10 tools + 6 prompts for Model Context Protocol
- 🛠️ **Complete CLI** - 7 commands for context management
- 💾 **SQLite Storage** - Persistent database with SHA256 change detection

## Commands

```bash
ai-context init           # Initialize with intelligent analysis
ai-context generate       # Generate context files for all AI tools
ai-context sync           # Sync context across tools
ai-context mcp            # Start MCP server
ai-context index          # Index codebase into database
ai-context search <query> # Semantic search
ai-context stats          # Database statistics
```

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md) - Get started in 5 minutes
- [MCP Server Guide](docs/MCP_QUICKSTART.md) - Set up MCP for Claude Desktop
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Migration Guide](docs/MIGRATE_TO_UNIFIED.md) - Migrating from legacy packages

## MCP Server

The built-in MCP server provides 10 tools:

- `search_context` - Semantic search across indexed content
- `get_item` - Retrieve specific context items
- `add_knowledge` - Store insights and facts
- `analyze` - Run intelligent analysis
- `get_tool_configs` - View AI tool configurations
- `query_graph` - Traverse knowledge graph
- `get_stats` - Database statistics
- `add_relation` - Add relationships
- `find_path` - Find paths between items
- `run_drift_check` - Check documentation sync

See [MCP Quick Start](docs/MCP_QUICKSTART.md) for setup instructions.

## Supported AI Tools

| Tool | Sync Support | Notes |
|------|--------------|-------|
| Claude Code | ✅ | Full MCP + CLI support |
| GitHub Copilot | ✅ | `.github/copilot-instructions.md` |
| Cline | ✅ | `.clinerules` |
| Cursor | ✅ | `.cursorrules` |
| Windsurf | ✅ | `.windsurf/rules` |
| Aider | ✅ | `.aider.conf.yml` |
| Continue | ✅ | `.continue/config.json` |
| Antigravity | ✅ | Config file support |
| Gemini | ✅ | Context file support |

## Development

```bash
# Clone and install
git clone https://github.com/SireJeff/ai-context.git
cd ai-context
npm install

# Build
npm run build

# Run tests
npm test

# Link for local testing
npm link
ai-context --help
```

## License

MIT © SireJeff

---

**Repository:** https://github.com/SireJeff/ai-context
**npm Package:** https://www.npmjs.com/package/ai-context
**Issues:** https://github.com/SireJeff/ai-context/issues
