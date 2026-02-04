# Next Session Kickoff Prompt

Copy and paste this entire prompt to start the next session:

---

## Context

I'm continuing development on the `@ai-context/mcp-server` package - a database-backed MCP server for AI context storage.

### What Was Completed (Phase 1, 2 & 3 ✅)

**Phase 1: Core MCP Server**
- Full MCP server package at `packages/ai-context-mcp-server/`
- SQLite + sqlite-vec database schema (7 tables)
- OpenRouter embeddings integration
- MCP server with stdio transport (10 tools, 6 prompts)
- 3 indexers (context, code, git)
- Knowledge graph with 14 typed relations
- Shadow file generator for git visibility
- Unit tests (102 passing)

**Phase 2: Build & Integration**
- Fixed TypeScript build for MCP SDK v1.26.0
- All tests passing
- CLI integration complete

**Phase 3: Advanced Features**
- File watcher for auto-sync with debounce (FileWatcher class)
- SyncService for orchestrating re-indexing
- CLI commands: `mcp:watch`, `mcp:migrate`, `mcp:export`
- Claude Desktop configuration guide in README

### CLI Commands Available

- `npx create-ai-context mcp:init` - Initialize database & index content
- `npx create-ai-context mcp:status` - Show database statistics
- `npx create-ai-context mcp:start` - Start MCP server
- `npx create-ai-context mcp:watch` - Watch for file changes (auto-sync)
- `npx create-ai-context mcp:migrate` - Migrate file-based context to DB
- `npx create-ai-context mcp:export` - Export database to files

### Architecture Decisions (Already Made)

- **Embeddings**: OpenRouter API (online-only, requires `OPENROUTER_API_KEY`)
- **Git Visibility**: Shadow .md files auto-generated from DB
- **Index Scope**: Context + Code + Git history
- **Knowledge Graph**: 14 typed relations
- **Multi-Project**: One `.ai-context.db` per project
- **MCP Transport**: stdio only

---

## Task for This Session

**Phase 4: Cross-Tool Sync** or **Phase 5: Documentation & Release**

### Phase 4: Cross-Tool Sync

1. Export to Copilot format (`.github/copilot-instructions.md`)
2. Export to Cline format (`.clinerules`)
3. Export to other AI tools
4. Sync state management

### Phase 5: Documentation & Release

1. Update main README with MCP server info
2. Create troubleshooting guide
3. Add API reference for all tools
4. Publish to npm as `@ai-context/mcp-server`

---

## Files to Reference

- **Roadmap**: `packages/ai-context-mcp-server/ROADMAP.md`
- **Server**: `packages/ai-context-mcp-server/src/server.ts`
- **Watcher**: `packages/ai-context-mcp-server/src/watcher/`
- **CLI**: `packages/create-ai-context/bin/create-ai-context.js`
- **README**: `packages/ai-context-mcp-server/README.md`

---

## Commands to Run First

```bash
# Verify build still works
cd packages/ai-context-mcp-server
npm run build
npm test

# Test the CLI
npx create-ai-context mcp:status
```

---

## Notes

- OpenRouter API key needed for embeddings: `export OPENROUTER_API_KEY=your-key`
- MCP SDK is v1.26.0 with McpServer class for tool/prompt registration
- Database file is `.ai-context.db` in project root
- Shadow files go to `.ai-context/*.md`

---

*Ready for Phase 4 or 5!*
