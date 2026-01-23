# CLAUDE.md - {{PROJECT_NAME}}

This file provides guidance to Claude Code when working with code in this repository.

---

## Project Identity

**Platform:** {{PROJECT_DESCRIPTION}}
**Domain:** {{PRODUCTION_URL}}
**Tech Stack:** {{TECH_STACK}}
**Status:** {{PROJECT_STATUS}}

**Quick Reference:**
- **API:** {{API_URL}}
- **Repo:** {{REPO_URL}}
- **Deploy:** {{DEPLOYMENT_PLATFORM}}

---

## Essential Commands

### Development
```bash
{{INSTALL_COMMAND}}
{{DEV_START_COMMAND}}
```

### Testing
```bash
{{TEST_COMMAND}}                    # All tests
{{TEST_E2E_COMMAND}}               # E2E only
{{TEST_COVERAGE_COMMAND}}          # With coverage
```

### Database
```bash
{{MIGRATION_CREATE_COMMAND}}
{{MIGRATION_RUN_COMMAND}}
```

### Deployment
```bash
{{DEPLOY_COMMAND}}
```

---

## Navigation Rules

### High-Level Task (Refactoring a Flow)
**Example:** "{{EXAMPLE_REFACTOR_TASK}}"

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
**Example:** "{{EXAMPLE_LOWLEVEL_TASK}}"

**Chain:**
1. Start: Search Patterns section below
2. Pattern: Use grep/find
3. Verify: [.claude/indexes/code/REVERSE_INDEXES.md](./.claude/indexes/code/REVERSE_INDEXES.md)
4. Fix: Direct file edits
5. Validate: Run tests

**Context Budget:** ~15k tokens (7.5% of 200k window)

---

### Feature Task (Add New Feature)
**Example:** "{{EXAMPLE_FEATURE_TASK}}"

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
{{CONFIG_SEARCH_PATTERN}}
```

**Hardcoded URLs/domains:**
```bash
{{URL_SEARCH_PATTERN}}
```

---

### Finding Business Logic

**Core Files:**
{{CORE_FILES_LIST}}

---

### Finding Database Schema

**Models:** {{MODELS_PATH}}
**Migrations:** {{MIGRATIONS_PATH}}

---

### Finding External Integrations

{{EXTERNAL_INTEGRATIONS_LIST}}

---

## System Architecture Mini-Map

{{ARCHITECTURE_DIAGRAM}}

---

## Index Directory

**3-Level Chain:** CLAUDE.md → Category (5) → Domain (15) → Detail (53)

**Level 1 - Categories:** [.claude/indexes/*/CATEGORY_INDEX.md](./.claude/indexes/)
- Workflows, Code, Search, Agents, Routing

**Level 2 - Domains:** [.claude/indexes/workflows/*.md](./.claude/indexes/workflows/)
- {{WORKFLOW_DOMAINS_COUNT}} workflow domains, {{CODE_DOMAINS_COUNT}} code domains

**Level 3 - Details:** [.claude/context/workflows/](./.claude/context/workflows/), [.claude/agents/](./.claude/agents/), [.claude/commands/](./.claude/commands/)
- {{WORKFLOWS_COUNT}} workflows, {{AGENTS_COUNT}} agents, {{COMMANDS_COUNT}} commands

---

## Critical Constants

### Domain & URLs
{{CRITICAL_URLS}}

### Business Constants
{{BUSINESS_CONSTANTS}}

---

## Quick Reference

**Understanding:** [ARCHITECTURE_SNAPSHOT.md](./.claude/context/ARCHITECTURE_SNAPSHOT.md), [workflows/CATEGORY_INDEX.md](./.claude/indexes/workflows/CATEGORY_INDEX.md), [KNOWN_GOTCHAS.md](./.claude/context/KNOWN_GOTCHAS.md)

**Implementing:** [workflows/*.md](./.claude/context/workflows/), [CODE_TO_WORKFLOW_MAP.md](./.claude/context/CODE_TO_WORKFLOW_MAP.md)

**Debugging:** {{DEBUGGING_QUICK_REFS}}

---

## Agent & Command Routing

**Agents:** {{AGENT_ROUTING_TABLE}}
**Full matrix:** [.claude/indexes/agents/router.md](./.claude/indexes/agents/router.md)

**Commands:** /rpi-research, /rpi-plan, /rpi-implement, /verify-docs-current, /validate-all, /help, /collab, /analytics
**All commands:** [.claude/commands/](./.claude/commands/)

---

## Gotcha Quick Reference

### {{GOTCHA_CATEGORY_1}}
{{GOTCHA_1_ITEMS}}

### {{GOTCHA_CATEGORY_2}}
{{GOTCHA_2_ITEMS}}

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

**Platform:** {{PRODUCTION_PLATFORM}}
**Services:** {{PRODUCTION_SERVICES}}
**Monitoring:** {{MONITORING_COMMANDS}}

---

## Key Constraints

**Migrations:** {{MIGRATION_CONSTRAINTS}}
**Testing:** {{TESTING_CONSTRAINTS}}
**Security:** {{SECURITY_CONSTRAINTS}}

---

## Maintenance

**After changes:** Check CODE_TO_WORKFLOW_MAP.md → Update workflows → Run /verify-docs-current
**Docs hub:** [.claude/README.md](./.claude/README.md)
**RPI:** [.claude/RPI_WORKFLOW_PLAN.md](./.claude/RPI_WORKFLOW_PLAN.md)

---

## Contact

{{CONTACT_INFO}}

---

**Version:** 1.1 | **Last Updated:** {{DATE}} | **Context Target:** 200k
**Architecture:** 3-Level Chain-of-Index | **Index Files:** {{INDEX_FILES_COUNT}}
