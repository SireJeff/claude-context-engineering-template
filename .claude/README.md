# .claude Configuration - {{PROJECT_NAME}}

This directory contains a comprehensive context engineering system for the {{PROJECT_NAME}} repository.

**Configuration Summary**:
- **Agents**: {{AGENTS_COUNT}} specialized agents (workflow-aligned)
- **Commands**: {{COMMANDS_COUNT}} custom commands
- **Workflows**: {{WORKFLOWS_COUNT}} documented workflows
- **Context Budget**: 200k tokens max, target <40% utilization
- **Output Budget**: 30k tokens max per response
- **Last Updated**: {{DATE}}

**System Benefits**:
- <40% context utilization (vs 60%+ without this system)
- 10× faster issue resolution with pre-computed knowledge
- Self-maintaining documentation (zero drift)
- Proactive bug discovery through validation

---

## Table of Contents

1. [Agent Architecture](#agent-architecture)
2. [Custom Commands](#custom-commands)
3. [Context Documentation](#context-documentation)
4. [RPI Workflow](#rpi-workflow)
5. [Quick Start Guide](#quick-start-guide)
6. [Self-Maintaining Documentation](#self-maintaining-documentation)

---

## Agent Architecture

### Specialized Agents (Workflow-Aligned)

| Agent | Primary Workflows | Use For |
|-------|------------------|---------|
| `context-engineer` | INITIALIZATION | Transform this template for any codebase |
| {{AGENT_TABLE_ROWS}} |

**Agent Location:** `.claude/agents/*.md`

---

## Custom Commands

### RPI Workflow Commands (3)
| Command | Description |
|---------|-------------|
| `/rpi-research` | Research phase - codebase exploration |
| `/rpi-plan` | Plan phase - implementation blueprint |
| `/rpi-implement` | Implement phase - execution with doc updates |

### Validation Commands
| Command | Description |
|---------|-------------|
| `/validate-all` | Complete validation suite |
| `/verify-docs-current` | Documentation freshness validation |

### System Commands (NEW in v1.1)
| Command | Description |
|---------|-------------|
| `/help` | Comprehensive help system |
| `/collab` | Team collaboration (handoffs, sync) |
| `/analytics` | Local usage statistics |

**Command Location:** `.claude/commands/*.md`

---

## Context Documentation

### 3-Level Chain-of-Index Architecture

**Purpose:** Minimize context usage through progressive loading

**Level 1 - Category Indexes (5 files in `indexes/`):**
| Category | Purpose | Load When |
|----------|---------|-----------|
| `workflows/CATEGORY_INDEX.md` | Workflow categories | Starting workflow task |
| `code/CATEGORY_INDEX.md` | Domain × Layer overview | Finding code files |
| `search/CATEGORY_INDEX.md` | Search strategies | Low-level debugging |
| `agents/CATEGORY_INDEX.md` | Agent selection matrix | Choosing agent |
| `routing/CATEGORY_INDEX.md` | Task routing | Classifying task type |

**Level 2 - Domain Indexes:** See `indexes/workflows/*.md`, `indexes/code/*.md`

**Level 3 - Detail Files:** workflows/, agents/, commands/

### Pre-Computed Knowledge

| File | Purpose |
|------|---------|
| `ARCHITECTURE_SNAPSHOT.md` | High-level system map |
| `FILE_OWNERSHIP.md` | What each file does |
| `INTEGRATION_POINTS.md` | External APIs |
| `KNOWN_GOTCHAS.md` | Documented fixes and lessons |
| `TESTING_MAP.md` | Test coverage mapping |

---

## RPI Workflow

**Research-Plan-Implement** methodology for structured development.

### Phases

1. **RESEARCH** (`/rpi-research`)
   - Use sub-agents to investigate
   - Output: Research document in `research/active/`
   - Context budget: 25-30%

2. **PLAN** (`/rpi-plan`)
   - Create implementation blueprint with file:line precision
   - Output: Plan document in `plans/active/`
   - Context budget: 20-25%

3. **IMPLEMENT** (`/rpi-implement`)
   - Execute with atomic changes
   - ONE CHANGE → ONE TEST → ONE COMMIT
   - Update documentation (mandatory)
   - Context budget: 30-40%

### Directory Structure

```
.claude/
├── research/
│   ├── active/           # Current research
│   ├── completed/        # Archived research
│   └── RESEARCH_TEMPLATE.md
├── plans/
│   ├── active/           # Current plans
│   ├── completed/        # Archived plans
│   └── PLAN_TEMPLATE.md
├── context/
│   ├── WORKFLOW_INDEX.md     # Primary entry point
│   ├── CODE_TO_WORKFLOW_MAP.md
│   └── workflows/            # Workflow detail files
├── indexes/
│   ├── workflows/        # Workflow category indexes
│   ├── code/            # Code domain indexes
│   ├── agents/          # Agent selection indexes
│   ├── routing/         # Task routing indexes
│   └── search/          # Search pattern indexes
├── agents/              # Specialized agent definitions
├── commands/            # Custom command definitions
├── tools/               # CLI tooling (NEW v1.1)
├── schemas/             # JSON validation schemas (NEW v1.1)
├── config/              # Environment configurations (NEW v1.1)
├── team/                # Team collaboration config (NEW v1.1)
├── knowledge/           # Shared knowledge base (NEW v1.1)
├── standards/           # Community standards (NEW v1.1)
└── ci-templates/        # CI/CD workflow templates (NEW v1.1)
```

---

## Quick Start Guide

### 1. Session Initialization
```bash
# Load workflow index (~15k tokens)
Read: .claude/context/WORKFLOW_INDEX.md

# Load specific workflows as needed (~20-50k each)
Read: .claude/context/workflows/[relevant_workflow].md
```

### 2. Debugging an Issue
```
1. Scan WORKFLOW_INDEX.md → Find relevant workflow
2. Load workflow file → Get file:line references
3. Fix issue with complete context
4. Update documentation (CODE_TO_WORKFLOW_MAP guides)
5. Run /verify-docs-current
```

### 3. Implementing a Feature
```
1. Run /rpi-research → Explore codebase
2. Run /rpi-plan → Create implementation blueprint
3. Run /rpi-implement → Execute with doc updates
```

---

## Self-Maintaining Documentation

### Automatic Documentation Updates

After every code change, update documentation:

1. Check `CODE_TO_WORKFLOW_MAP.md` for affected workflows
2. Update workflow files with new line numbers
3. Verify function signatures match code
4. Update diagrams if state machine changed
5. Run `/verify-docs-current` for validation
6. Commit documentation updates with code changes

### Post-Implementation Checklist (Embedded in All Agents)

```markdown
## Post-Implementation Checklist

**MANDATORY:** After making ANY code changes, update documentation.

1. Check CODE_TO_WORKFLOW_MAP.md for affected workflows
2. Update workflows with new line numbers
3. Verify function signatures match
4. Run /verify-docs-current
5. Commit doc updates with code changes
```

---

## Context Budget Limits

**Hard Caps (Non-Negotiable):**
- **Maximum Context:** 200,000 tokens
- **Maximum Output:** 30,000 tokens per response
- **Target Utilization:** <40% (80,000 tokens)
- **Compaction Trigger:** 35% (70,000 tokens)

**Budget Allocation:**
```
Workflow Indexes:      ~15k tokens (7.5%)
Workflow Details:      ~40k tokens (20%)
Active Code:           ~30k tokens (15%)
Tool Results:          ~15k tokens (7.5%)
─────────────────────────────────────────
Typical Session:       ~100k tokens (50%)
Buffer:                ~100k tokens (50%)
```

---

## Initialization

To transform this template for your codebase, use:

```bash
@context-engineer "Initialize context engineering for this repository"
```

This agent will:
1. Analyze your codebase structure
2. Identify major workflows (8-15)
3. Create workflow documentation
4. Set up index hierarchy
5. Configure specialized agents
6. Validate the system

---

*Configuration updated: {{DATE}}*
*Version: 1.2.2 (Template)*
