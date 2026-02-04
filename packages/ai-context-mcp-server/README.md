# @ai-context/mcp-server

**MCP Server for AI Context** - A database-backed Model Context Protocol server that replaces file-based `.ai-context/` folders with a SQLite + vector database.

## Features

- **SQLite + sqlite-vec** - Single portable `.ai-context.db` file with vector search
- **OpenRouter Embeddings** - Semantic search powered by OpenRouter API
- **Full Knowledge Graph** - Typed relationships between context items
- **Code + Git Indexing** - Index source code and git history
- **Shadow Files** - Auto-generate .md files for git visibility
- **MCP Protocol** - stdio transport for Claude Desktop compatibility

## Installation

```bash
npm install @ai-context/mcp-server
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-context": {
      "command": "npx",
      "args": ["@ai-context/mcp-server"],
      "env": {
        "OPENROUTER_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for embeddings |
| `AI_CONTEXT_DB_PATH` | No | Custom database path (default: `.ai-context.db`) |
| `AI_CONTEXT_SHADOW_DIR` | No | Shadow files output directory (default: `.ai-context/`) |

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

## License

MIT
