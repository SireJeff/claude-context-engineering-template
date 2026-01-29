# CLAUDE.md - Universal AI Context Engineering Template

This file provides guidance to Claude Code when working with code in this repository.

---

## Project Identity

**Platform:** Universal AI Context Engineering - CLI tools and templates for Claude Code, GitHub Copilot, Cline, and Antigravity
**Domain:** https://github.com/SireJeff/claude-context-engineering-template
**Tech Stack:** Node.js, JavaScript, Jest, npm
**Status:** Active (v2.1.0)

**Quick Reference:**
- **API:** N/A (CLI tool)
- **Repo:** https://github.com/SireJeff/claude-context-engineering-template
- **Deploy:** npm registry

---

## Essential Commands

### Development
```bash
cd packages/create-ai-context && npm install
npm test
```

### Testing
```bash
npm test                           # All tests
npm run test:coverage              # With coverage
```

### Database
```bash
# N/A - No database in this project
```

### Deployment
```bash
npm publish --access public        # Publish to npm
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
grep -r "process.env" packages/create-ai-context/lib/
```

**Hardcoded URLs/domains:**
```bash
grep -r "https://" packages/ --include="*.js"
```

---

### Finding Business Logic

**Core Files:**
- `packages/create-ai-context/lib/static-analyzer.js` - Codebase analysis
- `packages/create-ai-context/lib/template-populator.js` - Template generation
- `packages/create-ai-context/lib/detector.js` - Tech stack detection
- `packages/create-ai-context/lib/doc-discovery.js` - Existing docs detection
- `packages/create-ai-context/lib/drift-checker.js` - Documentation drift
- `packages/create-ai-context/lib/smart-merge.js` - Merge strategies

---

### Finding Database Schema

**Models:** N/A
**Migrations:** N/A

---

### Finding External Integrations

- npm registry (publishing)
- GitHub Actions (CI/CD)

---

## System Architecture Mini-Map

```
packages/
├── create-ai-context/          # Main CLI package
│   ├── bin/                    # CLI entry point
│   ├── lib/                    # Core modules
│   │   ├── static-analyzer.js  # Codebase analysis
│   │   ├── detector.js         # Tech detection
│   │   ├── installer.js        # File generation
│   │   └── adapters/           # AI tool adapters
│   ├── templates/              # Output templates
│   └── tests/                  # Jest tests
└── claude-context-plugin/      # Claude Code plugin
    └── skills/                 # RPI workflow skills
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
- npm package: `create-universal-ai-context`
- GitHub: `SireJeff/claude-context-engineering-template`

### Business Constants
- Supported AI tools: Claude Code, GitHub Copilot, Cline, Antigravity
- Node.js minimum: 18.0.0

---

## Quick Reference

**Understanding:** [ARCHITECTURE_SNAPSHOT.md](./.claude/context/ARCHITECTURE_SNAPSHOT.md), [workflows/CATEGORY_INDEX.md](./.claude/indexes/workflows/CATEGORY_INDEX.md), [KNOWN_GOTCHAS.md](./.claude/context/KNOWN_GOTCHAS.md)

**Implementing:** [workflows/*.md](./.claude/context/workflows/), [CODE_TO_WORKFLOW_MAP.md](./.claude/context/CODE_TO_WORKFLOW_MAP.md)

**Debugging:** Check Jest output, review lib/ modules

---

## Agent & Command Routing

**Agents:** @context-engineer (setup), @core-architect (design), @api-developer (endpoints), @database-ops (schema), @integration-hub (external), @deployment-ops (CI/CD)
**Full matrix:** [.claude/indexes/agents/router.md](./.claude/indexes/agents/router.md)

**Commands:** /rpi-research, /rpi-plan, /rpi-implement, /verify-docs-current, /validate-all, /help, /collab, /analytics
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

**Version:** 2.1.0 | **Last Updated:** 2026-01-29 | **Context Target:** 200k
**Architecture:** 3-Level Chain-of-Index | **Index Files:** 20
