# MCP Server Development Roadmap

## Project Overview

**Goal**: Replace file-based `.ai-context/` folders with a SQLite + vector database exposed via MCP protocol.

**Current Status**: Phase 4 Complete ✅

---

## Phase 1: Core MCP Server ✅ COMPLETE

### Completed Items

- [x] Package structure (`packages/ai-context-mcp-server/`)
- [x] SQLite + sqlite-vec database schema (7 tables)
- [x] OpenRouter embeddings integration
- [x] MCP server with stdio transport
- [x] 10 MCP tools implemented
- [x] 6 MCP prompts (agents)
- [x] Context docs indexer
- [x] Source code indexer (9 languages)
- [x] Git history indexer
- [x] Knowledge graph (14 typed relations)
- [x] Shadow file generator for git visibility
- [x] Unit tests
- [x] Security vulnerabilities fixed

---

## Phase 2: Build & Integration ✅ COMPLETE

### 2.1 Build & Verify ✅
- [x] Run `npm install` in the package directory
- [x] Run `npm run build` to compile TypeScript
- [x] Run tests with `npm test` (89 tests passing)
- [x] Fix any TypeScript compilation errors (updated for MCP SDK v1.26.0)
- [x] Manually test MCP server startup

### 2.2 CLI Integration ✅
- [x] Add `mcp:start` command to `create-ai-context` CLI
- [x] Add `mcp:init` command to initialize database from existing `.ai-context/`
- [x] Add `mcp:status` command to show database statistics
- [x] Add `mcp:migrate` command to migrate file-based context to database
- [x] Add `mcp:export` command to export database to files
- [x] Update CLI help text and documentation

### 2.3 Initial Indexing ✅
- [x] Implement first-run indexing workflow (via mcp:init)
- [x] Add progress indicators for indexing
- [x] Handle large codebases gracefully (--skip-code, --skip-git flags)
- [x] Implement incremental indexing (only changed files) - via SyncService

---

## Phase 3: Advanced Features ✅ COMPLETE

### 3.1 Auto-Sync ✅
- [x] File watcher for real-time updates (FileWatcher class)
- [x] Debounced re-indexing on file changes (configurable debounce)
- [x] `mcp:watch` CLI command for auto-sync
- [ ] Git hooks integration (pre-commit, post-merge) - Deferred

### 3.2 Enhanced Knowledge Graph
- [ ] Auto-detect relationships from code analysis
- [ ] Import/export graph in DOT or JSON format
- [ ] Visualization endpoint (optional)

### 3.3 Performance Optimization
- [ ] Connection pooling for database
- [ ] Batch embedding requests
- [ ] Caching layer for frequent queries
- [ ] Lazy loading for large content

---

## Phase 4: Cross-Tool Sync ✅ COMPLETE

### 4.1 Multi-Tool Export ✅
- [x] Export to Copilot format (`.github/copilot-instructions.md`)
- [x] Export to Cline format (`.clinerules`)
- [x] Export to Antigravity format (`.agent/`)
- [x] Export to Windsurf format (`.windsurf/rules.md`)
- [x] Export to Aider format (`.aider.conf.yml`)
- [x] Export to Continue format (`.continue/config.json`)

### 4.2 Sync State Management ✅
- [x] Track which tools are synced
- [x] Detect managed vs. unmanaged files
- [x] `mcp:sync` CLI command with --force option

---

## Phase 5: Documentation & Release ✅ MOSTLY COMPLETE

### 5.1 Documentation ✅
- [x] Update main README with MCP server info
- [x] Add Claude Desktop configuration guide
- [x] Add troubleshooting guide
- [x] Add mcp:sync command documentation
- [x] Add API reference for all tools

### 5.2 Release (Pending)
- [ ] Publish to npm as `@ai-context/mcp-server`
- [ ] Update `create-universal-ai-context` to reference MCP server
- [ ] Create release notes
- [ ] Announce on GitHub

---

## Architecture Decisions (Locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Embeddings | OpenRouter API | User preference, better quality |
| Git Visibility | Shadow .md files | Enables git diffs |
| Index Scope | Context + Code + Git | Full coverage |
| Knowledge Graph | 14 typed relations | Full ontology |
| Multi-Project | One DB per project | Isolation, portability |
| MCP Transport | stdio only | Claude Desktop compatible |

---

## File Structure

```
packages/ai-context-mcp-server/
├── package.json              # npm package (v1.0.0)
├── tsconfig.json             # TypeScript config
├── vitest.config.ts          # Test config
├── README.md                 # Documentation
├── src/
│   ├── index.ts              # Package exports
│   ├── server.ts             # MCP server entry
│   ├── cli.ts                # CLI entry point
│   ├── db/
│   │   ├── schema.ts         # 7 tables
│   │   ├── client.ts         # CRUD operations
│   │   └── embeddings.ts     # Vector operations
│   ├── embeddings/
│   │   └── openrouter.ts     # OpenRouter client
│   ├── indexers/
│   │   ├── context.ts        # .md files indexer
│   │   ├── code.ts           # Source code indexer
│   │   └── git.ts            # Git history indexer
│   ├── graph/
│   │   ├── relations.ts      # 14 relation types
│   │   └── traversal.ts      # Graph queries
│   ├── shadow/
│   │   └── generator.ts      # Shadow file generator
│   ├── tools/
│   │   └── handlers.ts       # 10 MCP tools
│   ├── resources/
│   │   └── handlers.ts       # MCP resources
│   └── prompts/
│       └── handlers.ts       # 6 agent prompts
└── tests/
    ├── schema.test.ts
    ├── relations.test.ts
    ├── openrouter.test.ts
    ├── tools.test.ts
    └── prompts.test.ts
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @modelcontextprotocol/sdk | ^1.26.0 | MCP protocol |
| better-sqlite3 | ^11.0.0 | SQLite database |
| sqlite-vec | ^0.1.0 | Vector search |
| glob | ^10.5.0 | File patterns |
| simple-git | ^3.22.0 | Git operations |
| zod | ^3.22.4 | Schema validation |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for embeddings |
| `AI_CONTEXT_PROJECT_ROOT` | No | Project directory (defaults to cwd) |
| `AI_CONTEXT_DB_PATH` | No | Database filename (defaults to `.ai-context.db`) |

---

## Next Session Priority

1. **Manual Testing** - Test with Claude Desktop
2. **Advanced Features** - Auto-sync, file watchers
3. **Cross-Tool Sync** - Export to other AI tools

---

*Last Updated: 2026-02-04*
