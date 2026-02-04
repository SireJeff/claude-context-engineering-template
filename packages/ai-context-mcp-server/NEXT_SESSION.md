# Next Session Kickoff Prompt

Copy and paste this entire prompt to start the next session:

---

## Context

I'm continuing development on the `@ai-context/mcp-server` package - a database-backed MCP server for AI context storage.

### What Was Completed Last Session

1. Created the full MCP server package at `packages/ai-context-mcp-server/`
2. Implemented SQLite + sqlite-vec database schema (7 tables)
3. Implemented OpenRouter embeddings integration
4. Implemented MCP server with stdio transport
5. Implemented 10 MCP tools (search_context, get_item, add_knowledge, etc.)
6. Implemented 6 MCP prompts (context-engineer, core-architect, etc.)
7. Implemented 3 indexers (context, code, git)
8. Implemented knowledge graph with 14 typed relations
9. Implemented shadow file generator for git visibility
10. Added unit tests
11. Fixed security vulnerabilities in dependencies

### Architecture Decisions (Already Made)

- **Embeddings**: OpenRouter API (online-only, requires `OPENROUTER_API_KEY`)
- **Git Visibility**: Shadow .md files auto-generated from DB
- **Index Scope**: Context + Code + Git history
- **Knowledge Graph**: 14 typed relations
- **Multi-Project**: One `.ai-context.db` per project
- **MCP Transport**: stdio only

---

## Task for This Session

**Phase 2: Build & Integration**

### Priority 1: Build & Verify

1. Navigate to `packages/ai-context-mcp-server/`
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile TypeScript
4. Fix any TypeScript compilation errors
5. Run `npm test` to verify tests pass
6. Manually test: `node dist/cli.js` (should start MCP server)

### Priority 2: CLI Integration

1. Open `packages/create-ai-context/bin/create-ai-context.js`
2. Add new commands:
   - `mcp:start` - Start the MCP server
   - `mcp:init` - Initialize database from existing `.ai-context/`
   - `mcp:status` - Show MCP server status

### Priority 3: First-Run Experience

1. Create initialization workflow that:
   - Creates `.ai-context.db` database
   - Indexes existing context documents
   - Indexes source code
   - Indexes git history
   - Generates embeddings
   - Shows progress

---

## Files to Reference

- **Roadmap**: `packages/ai-context-mcp-server/ROADMAP.md`
- **Package**: `packages/ai-context-mcp-server/package.json`
- **Server**: `packages/ai-context-mcp-server/src/server.ts`
- **CLI Entry**: `packages/ai-context-mcp-server/src/cli.ts`
- **Existing CLI**: `packages/create-ai-context/bin/create-ai-context.js`

---

## Expected Outcomes

By end of session:
- [ ] Package builds without errors
- [ ] Tests pass
- [ ] MCP server starts successfully
- [ ] At least one CLI command integrated
- [ ] Can demo: `npx create-ai-context mcp:start`

---

## Commands to Run First

```bash
cd packages/ai-context-mcp-server
npm install
npm run build
npm test
```

---

## Notes

- OpenRouter API key needed for embeddings: `export OPENROUTER_API_KEY=your-key`
- sqlite-vec requires native compilation (may need build tools)
- If native deps fail, consider falling back to pure JS alternatives

---

*Ready to continue from Phase 2!*
