# CLAUDE.md - Universal AI Context Engineering Template

This file provides guidance to Claude Code when working with code in this repository.

---

## Project Identity

**Platform:** Universal AI Context Engineering - CLI tools and templates for Claude Code, GitHub Copilot, Cline, Antigravity, Cursor, Gemini, and more
**Domain:** https://github.com/SireJeff/claude-context-engineering-template
**Tech Stack:** Node.js, TypeScript, Vitest, npm
**Status:** Active (v3.0.0)

**Quick Reference:**
- **API:** MCP Server for AI tools
- **Repo:** https://github.com/SireJeff/claude-context-engineering-template
- **Deploy:** npm registry

---

## Essential Commands

### Development
```bash
npm install
npm run build
npm test
```

### Testing
```bash
npm test                           # All tests
npm run test:run                   # Run once (no watch)
```

### Database
```bash
# SQLite database at .ai-context.db
npx ai-context stats               # View database stats
npx ai-context index               # Index codebase
```

### Deployment
```bash
npm publish --access public        # Publish to npm
```

### New Package Commands
```bash
npx ai-context init                           # Initialize with intelligent analysis
npx ai-context init --no-intelligent          # Skip OpenRouter analysis
npx ai-context generate                       # Generate context for all AI tools
npx ai-context mcp                            # Start MCP server
npx ai-context sync                           # Sync across AI tools
npx ai-context index                          # Index codebase into database
npx ai-context search <query>                 # Semantic search
npx ai-context stats                          # Database statistics
```

### Legacy Cross-Tool Sync
```bash
npx create-ai-context sync:check              # Check if contexts are synchronized
npx create-ai-context sync:all                # Sync all tools from codebase
npx create-ai-context sync:from <tool>        # Propagate from specific tool
npx create-ai-context sync:resolve            # Resolve conflicts
npx create-ai-context hooks:install           # Install git hooks
```

---

## Navigation Rules

### High-Level Task (Refactoring a Flow)
**Example:** "Refactor the static analyzer to support a new framework"

**Chain:**
1. Start: [.claude/indexes/workflows/CATEGORY_INDEX.md](./.claude/indexes/workflows/CATEGORY_INDEX.md)
2. Find: Relevant category
3. Load: Domain index
4. Detail: Workflow file
5. Code: [.claude/indexes/code/DOMAIN_LAYER_INDEX.md](./.claude/indexes/code/DOMAIN_LAYER_INDEX.md)
6. Implement: Use appropriate specialized agent

**Context Budget:** ~40k tokens (20% of 200k window)

---

### Low-Level Task (Fix Hardcoded Value)
**Example:** "Fix a hardcoded path in the template populator"

**Chain:**
1. Start: Search Patterns section below
2. Pattern: Use grep/find
3. Verify: [.claude/indexes/code/REVERSE_INDEXES.md](./.claude/indexes/code/REVERSE_INDEXES.md)
4. Fix: Direct file edits
5. Validate: Run tests

**Context Budget:** ~15k tokens (7.5% of 200k window)

---

### Feature Task (Add New Feature)
**Example:** "Add support for a new AI tool adapter"

**Chain:**
1. Start: [.claude/indexes/routing/CATEGORY_INDEX.md](./.claude/indexes/routing/CATEGORY_INDEX.md)
2. Route: [.claude/indexes/routing/HIGH_LEVEL_ROUTER.md](./.claude/indexes/routing/HIGH_LEVEL_ROUTER.md)
3. Research: /rpi-research
4. Plan: /rpi-plan
5. Implement: /rpi-implement

**Context Budget:** ~50k tokens (25% of 200k window)

---

## Search Patterns

### Finding Configuration Values

**Environment variables:**
```bash
grep -r "process.env" lib/
```

**Hardcoded URLs/domains:**
```bash
grep -r "https://" src/ --include="*.ts" --include="*.js"
```

---

### Finding Business Logic

**New Package Core Files (TypeScript):**
- `src/analyzer/intelligent-analyzer.ts` - Intelligent codebase analysis
- `src/db/client.ts` - SQLite database operations
- `src/embeddings/openrouter.ts` - OpenRouter API integration
- `src/mcp.ts` - MCP server implementation
- `src/cli/index.ts` - CLI commands

**Legacy Package Core Files (JavaScript):**
- `lib/static-analyzer.js` - Codebase analysis
- `lib/template-populator.js` - Template generation
- `lib/detector.js` - Tech stack detection
- `lib/doc-discovery.js` - Existing docs detection
- `lib/drift-checker.js` - Documentation drift
- `lib/smart-merge.js` - Merge strategies
- `lib/cross-tool-sync/sync-manager.js` - Cross-tool sync logic

---

### Finding Database Schema

**Models:** `src/db/schema.ts`
**Database:** SQLite at `.ai-context.db`

---

### Finding External Integrations

- npm registry (publishing)
- GitHub Actions (CI/CD)
- Git hooks (automatic sync)
- OpenRouter API (embeddings and chat for intelligent analysis)

---

## System Architecture Mini-Map

```
ai-context/
├── bin/                    # CLI entry point
├── src/                    # TypeScript source
│   ├── cli/                # CLI commands
│   ├── db/                 # SQLite database client
│   ├── embeddings/         # OpenRouter integration
│   ├── analyzer/           # Intelligent codebase analysis
│   └── mcp.ts              # MCP server
├── agents/                 # Agent definitions
├── skills/                 # RPI workflow skills
├── templates/              # Output templates
├── tests/                  # Vitest tests
├── docs/                   # Documentation
└── .claude/                # Claude Code development context
```

---

## Index Directory

**3-Level Chain:** CLAUDE.md → Category (5) → Domain (15) → Detail (53)

**Level 1 - Categories:** [.claude/indexes/*/CATEGORY_INDEX.md](./.claude/indexes/)
- Workflows, Code, Search, Agents, Routing

**Level 2 - Domains:** [.claude/indexes/workflows/*.md](./.claude/indexes/workflows/)
- 5 workflow domains, 4 code domains

**Level 3 - Details:** [.claude/context/workflows/](./.claude/context/workflows/), [.claude/agents/](./.claude/agents/), [.claude/commands/](./.claude/commands/)
- 8 workflows, 6 agents, 11 commands

---

## Critical Constants

### Domain & URLs
- npm package (new): `ai-context`
- npm package (legacy): `create-universal-ai-context`
- GitHub: `SireJeff/claude-context-engineering-template`

### Business Constants
- Supported AI tools: Claude Code, GitHub Copilot, Cline, Antigravity, Windsurf, Aider, Continue, Cursor, Gemini
- Node.js minimum: 18.0.0
- Database file: `.ai-context.db`
- Sync state stored in: `.ai-context/sync-state.json`
- Git hooks location: `.claude/automation/hooks/`
- OpenRouter API key: `OPENROUTER_API_KEY` environment variable

---

## Quick Reference

**Understanding:** [ARCHITECTURE_SNAPSHOT.md](./.claude/context/ARCHITECTURE_SNAPSHOT.md), [workflows/CATEGORY_INDEX.md](./.claude/indexes/workflows/CATEGORY_INDEX.md), [KNOWN_GOTCHAS.md](./.claude/context/KNOWN_GOTCHAS.md)

**Implementing:** [workflows/*.md](./.claude/context/workflows/), [CODE_TO_WORKFLOW_MAP.md](./.claude/context/CODE_TO_WORKFLOW_MAP.md)

**Debugging:** Check Jest output, review lib/ modules

---

## Agent & Command Routing

**Agents:** @context-engineer (setup), @core-architect (design), @api-developer (endpoints), @database-ops (schema), @integration-hub (external), @deployment-ops (CI/CD)
**Full matrix:** [.claude/indexes/agents/router.md](./.claude/indexes/agents/router.md)

**Commands:** /rpi-research, /rpi-plan, /rpi-implement, /context-optimize, /verify-docs-current, /validate-all, /help, /collab, /analytics
**All commands:** [.claude/commands/](./.claude/commands/)

---

## Gotcha Quick Reference

### Testing
- Integration tests require test fixtures in `tests/fixtures/`
- Run unit tests separately: `npm test -- tests/unit/`

### Publishing
- Version must be bumped before npm publish
- CI/CD publishes automatically on GitHub release

**Full gotchas:** [.claude/context/KNOWN_GOTCHAS.md](./.claude/context/KNOWN_GOTCHAS.md)

---

## Documentation System

**Navigation:** 3-level chain (CLAUDE.md → Category → Domain → Detail)
**Self-maintaining:** CODE_TO_WORKFLOW_MAP.md guides updates after code changes
**Validation:** Run /verify-docs-current [file_path] after modifications
**RPI Workflow:** /rpi-research → /rpi-plan → /rpi-implement

**See:** [.claude/RPI_WORKFLOW_PLAN.md](./.claude/RPI_WORKFLOW_PLAN.md), [.claude/README.md](./.claude/README.md)

---

## Production

**Platform:** npm registry
**Services:** GitHub Actions CI/CD
**Monitoring:** npm download stats, GitHub issues

---

## Key Constraints

**Migrations:** N/A
**Testing:** All PRs must pass Jest tests
**Security:** No secrets in templates, validate user input paths

---

## Maintenance

**After changes:** Check CODE_TO_WORKFLOW_MAP.md → Update workflows → Run /verify-docs-current
**Docs hub:** [.claude/README.md](./.claude/README.md)
**RPI:** [.claude/RPI_WORKFLOW_PLAN.md](./.claude/RPI_WORKFLOW_PLAN.md)

---

## Contact

- GitHub Issues: https://github.com/SireJeff/claude-context-engineering-template/issues
- Author: SireJeff

---

**Version:** 3.0.0 | **Last Updated:** 2026-02-05 | **Context Target:** 200k
**Architecture:** 3-Level Chain-of-Index | **Index Files:** 20
