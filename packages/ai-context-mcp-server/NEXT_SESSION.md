# Next Session Kickoff Prompt

Copy and paste this entire prompt to start the next session:

---

## Context

I'm continuing development on the `@ai-context/mcp-server` package - a database-backed MCP server for AI context storage.

### What Was Completed (Phase 1 & 2 ✅)

**Phase 1: Core MCP Server**
- Full MCP server package at `packages/ai-context-mcp-server/`
- SQLite + sqlite-vec database schema (7 tables)
- OpenRouter embeddings integration
- MCP server with stdio transport (10 tools, 6 prompts)
- 3 indexers (context, code, git)
- Knowledge graph with 14 typed relations
- Shadow file generator for git visibility
- Unit tests (89 passing)
- Security vulnerabilities fixed

**Phase 2: Build & Integration**
- Fixed TypeScript build for MCP SDK v1.26.0
- All 89 tests passing
- CLI integration complete:
  - `npx create-ai-context mcp:init` - Initialize database & index content
  - `npx create-ai-context mcp:status` - Show database statistics
  - `npx create-ai-context mcp:start` - Start MCP server

### Architecture Decisions (Already Made)

- **Embeddings**: OpenRouter API (online-only, requires `OPENROUTER_API_KEY`)
- **Git Visibility**: Shadow .md files auto-generated from DB
- **Index Scope**: Context + Code + Git history
- **Knowledge Graph**: 14 typed relations
- **Multi-Project**: One `.ai-context.db` per project
- **MCP Transport**: stdio only

---

## Task for This Session

**Phase 3: Advanced Features**

### Priority 1: Claude Desktop Testing

1. Configure Claude Desktop to use the MCP server:
   ```json
   {
     "mcpServers": {
       "ai-context": {
         "command": "npx",
         "args": ["create-ai-context", "mcp:start"],
         "env": {
           "OPENROUTER_API_KEY": "your-key"
         }
       }
     }
   }
   ```
2. Test semantic search with real queries
3. Test knowledge graph traversal
4. Verify tool responses are correct

### Priority 2: Auto-Sync (File Watcher)

1. Implement file watcher for real-time updates
2. Debounce re-indexing on file changes
3. Add git hooks integration (pre-commit, post-merge)

### Priority 3: Remaining CLI Commands

1. Add `mcp:migrate` command to migrate file-based context to database
2. Add `mcp:export` command to export database to files
3. Implement incremental indexing (only changed files)

---

## Files to Reference

- **Roadmap**: `packages/ai-context-mcp-server/ROADMAP.md`
- **Server**: `packages/ai-context-mcp-server/src/server.ts`
- **Indexers**: `packages/ai-context-mcp-server/src/indexers/`
- **CLI**: `packages/create-ai-context/bin/create-ai-context.js`
- **Shadow Generator**: `packages/ai-context-mcp-server/src/shadow/generator.ts`

---

## Expected Outcomes

By end of session:
- [ ] MCP server tested with Claude Desktop
- [ ] File watcher implemented for auto-sync
- [ ] `mcp:migrate` command working
- [ ] `mcp:export` command working
- [ ] Incremental indexing implemented

---

## Commands to Run First

```bash
# Verify build still works
cd packages/ai-context-mcp-server
npm run build
npm test

# Initialize a test database
cd ../.. 
npx create-ai-context mcp:init

# Check status
npx create-ai-context mcp:status
```

---

## Notes

- OpenRouter API key needed for embeddings: `export OPENROUTER_API_KEY=your-key`
- MCP SDK is v1.26.0 with McpServer class for tool/prompt registration
- Database file is `.ai-context.db` in project root
- Shadow files go to `.ai-context/*.md`

---

*Ready to continue with Phase 3: Advanced Features!*
