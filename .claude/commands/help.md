---
name: help
version: "1.0.0"
description: "Display help for all available commands and agents"
category: "system"
context_budget_estimate: "5K tokens"
typical_context_usage: "2%"
prerequisites: []
outputs:
  - "Command and agent reference information"
next_commands: []
related_agents: []
examples:
  - command: "/help"
    description: "List all commands and agents"
  - command: "/help commands"
    description: "Detailed command reference"
  - command: "/help agents"
    description: "Agent capability overview"
  - command: "/help rpi"
    description: "RPI workflow deep dive"
  - command: "/help rpi-research"
    description: "Specific command help"
---

# Help Command

Display help and reference information for Claude Context Engineering.

## Syntax

```bash
/help [topic]
```

## Topics

| Topic | Description |
|-------|-------------|
| *(none)* | Overview of all commands and agents |
| `commands` | Detailed command reference |
| `agents` | Agent capabilities and selection guide |
| `rpi` | RPI workflow deep dive |
| `[command-name]` | Specific command help |
| `[agent-name]` | Specific agent help |

---

## Quick Reference

### Available Commands

| Command | Category | Description |
|---------|----------|-------------|
| `/rpi-research [name]` | RPI | Research phase - systematic codebase exploration |
| `/rpi-plan [name]` | RPI | Plan phase - create implementation blueprint |
| `/rpi-implement [name]` | RPI | Implement phase - execute with continuous testing |
| `/verify-docs-current [file]` | Validation | Check documentation accuracy against code |
| `/validate-all` | Validation | Run complete validation suite |
| `/help [topic]` | System | Display this help information |

### Available Agents

| Agent | Domain | Primary Use |
|-------|--------|-------------|
| `@context-engineer` | Initialization | Transform template for any codebase |
| `@core-architect` | Architecture | System design, state machines, high-level planning |
| `@database-ops` | Database | Migrations, schema, query optimization |
| `@api-developer` | API | Endpoints, contracts, API documentation |
| `@integration-hub` | Integration | External services, webhooks, third-party APIs |
| `@deployment-ops` | DevOps | CI/CD, infrastructure, deployment strategies |

---

## Commands Reference

### RPI Workflow Commands

The Research-Plan-Implement workflow prevents cascading errors through structured development.

#### `/rpi-research [feature-name]`

**Purpose:** Systematic, zero-code-modification exploration of the codebase.

**Context Budget:** ~50K tokens (25%)

**What it does:**
1. Launches 3 parallel exploration agents
2. Traces call chains 3 levels deep with file:line references
3. Maps dependencies (internal and external)
4. Identifies test coverage gaps
5. Creates research document in `.claude/research/active/`

**Exit Criteria:**
- [ ] 3-20 relevant files identified
- [ ] Call chains traced with line numbers
- [ ] Dependencies mapped
- [ ] 150-word summary for parent context

**Example:**
```bash
/rpi-research user-authentication
```

---

#### `/rpi-plan [feature-name]`

**Purpose:** Create detailed implementation blueprint with file:line precision.

**Context Budget:** ~35K tokens (17%)

**Prerequisites:** Research document must exist in `.claude/research/active/`

**What it does:**
1. Loads research document
2. Defines scope (in-scope, out-of-scope)
3. Creates modification table with file, lines, change, risk level
4. Designs step-by-step implementation
5. Defines test strategy
6. Requires human approval before proceeding

**Exit Criteria:**
- [ ] All modifications listed with file:line
- [ ] Step-by-step implementation defined
- [ ] Test strategy documented
- [ ] Human approval obtained

**Example:**
```bash
/rpi-plan user-authentication
```

---

#### `/rpi-implement [feature-name]`

**Purpose:** Execute approved plan with atomic changes and continuous testing.

**Context Budget:** ~60K tokens (30%)

**Prerequisites:** Approved plan in `.claude/plans/active/`

**Golden Rule:** ONE CHANGE → ONE TEST → ONE COMMIT

**What it does:**
1. Verifies preconditions (plan approved, clean branch, tests pass)
2. For each step: make change → run test → commit if pass
3. Updates documentation after each change
4. Runs full test suite after completion
5. Archives plan to `.claude/plans/completed/`

**Error Recovery:**
- Syntax error: Fix immediately
- Test failure: Stop, investigate, don't proceed
- 3+ failures: Stop, start fresh session

**Example:**
```bash
/rpi-implement user-authentication
```

---

### Validation Commands

#### `/verify-docs-current [file_path]`

**Purpose:** Validate documentation accuracy against current code.

**Context Budget:** ~20K tokens (10%)

**What it does:**
1. Looks up file in CODE_TO_WORKFLOW_MAP.md
2. Finds all workflows that document this file
3. Verifies line number references (±10 line tolerance)
4. Checks markdown links resolve
5. Generates accuracy report

**Output:** Status per workflow (HEALTHY / NEEDS UPDATE / STALE)

**Example:**
```bash
/verify-docs-current src/services/auth.py
```

---

#### `/validate-all`

**Purpose:** Run complete validation suite.

**Context Budget:** ~40K tokens (20%)

**What it does:**
1. Documentation validation (line numbers, links, CODE_TO_WORKFLOW_MAP)
2. Test validation (unit, integration, coverage threshold)
3. Code quality checks (linting, type checking, security)
4. Configuration validation

**Output:** Report with PASS/FAIL per category, overall READY/NOT READY

**Example:**
```bash
/validate-all
```

---

## Agents Reference

### Agent Selection Guide

```
START
  │
  ├── Is this initialization/setup? → @context-engineer
  │
  ├── Does it involve external APIs/webhooks? → @integration-hub
  │
  ├── Does it involve database changes? → @database-ops
  │
  ├── Does it involve API endpoints? → @api-developer
  │
  ├── Does it involve deployment/CI/CD? → @deployment-ops
  │
  └── Is it architecture/system design? → @core-architect
```

### Agent Details

#### `@context-engineer`

**Type:** Initialization Agent
**Complexity:** Very High
**Context Usage:** Up to 80K tokens (40%)

**Capabilities:**
- Tech stack detection
- Workflow discovery (8-15 workflows)
- Template population
- System validation
- Documentation generation

**Invocation:**
```bash
@context-engineer "Initialize context engineering for this repository"
@context-engineer "Document workflow: [name]"
@context-engineer "Refresh workflow: [name]"
```

---

#### `@core-architect`

**Type:** Architecture Specialist
**Complexity:** High
**Context Usage:** ~50K tokens (25%)

**Capabilities:**
- System architecture design
- State machine analysis
- Dependency mapping
- Scalability planning
- High-level design patterns

**Invocation:**
```bash
@core-architect "Document system architecture"
@core-architect "Analyze state transitions in [component]"
@core-architect "Identify scalability bottlenecks"
```

---

#### `@database-ops`

**Type:** Database Specialist
**Complexity:** Medium-High
**Context Usage:** ~40K tokens (20%)

**Capabilities:**
- Schema design and validation
- Migration planning and execution
- Query optimization
- Data integrity checks
- Performance tuning

**Invocation:**
```bash
@database-ops "Document database schema"
@database-ops "Analyze query performance for [query]"
@database-ops "Plan migration for [change]"
```

---

#### `@api-developer`

**Type:** API Specialist
**Complexity:** Medium
**Context Usage:** ~35K tokens (17%)

**Capabilities:**
- API design (REST, GraphQL)
- Contract definition
- Endpoint documentation
- API testing strategies
- Version management

**Invocation:**
```bash
@api-developer "Document API endpoints for [resource]"
@api-developer "Validate API contracts"
@api-developer "Generate OpenAPI spec"
```

---

#### `@integration-hub`

**Type:** Integration Specialist
**Complexity:** Medium-High
**Context Usage:** ~40K tokens (20%)

**Capabilities:**
- Third-party API integration
- Webhook handling
- Authentication management
- Rate limiting implementation
- Error handling for external services

**Invocation:**
```bash
@integration-hub "Document integration with [service]"
@integration-hub "Analyze webhook endpoints"
@integration-hub "Review authentication flows"
```

---

#### `@deployment-ops`

**Type:** DevOps Specialist
**Complexity:** High
**Context Usage:** ~45K tokens (22%)

**Capabilities:**
- CI/CD pipeline design
- Infrastructure as code
- Deployment strategies (blue-green, canary)
- Environment management
- Monitoring and rollback

**Invocation:**
```bash
@deployment-ops "Document deployment pipeline"
@deployment-ops "Review infrastructure configuration"
@deployment-ops "Plan rollback strategy"
```

---

## RPI Workflow Deep Dive

### Philosophy

The Research-Plan-Implement methodology prevents "slop" (degraded output quality) by:

1. **Separating concerns:** Research loads context, Plan uses it, Implement executes
2. **Human checkpoints:** Approval required between Plan and Implement
3. **Atomic changes:** Small, testable, reversible modifications
4. **Context discipline:** Each phase has a budget, compacts before next phase

### Token Budget Strategy

| Phase | Budget | Cumulative |
|-------|--------|------------|
| Research | 50K | 50K (25%) |
| Plan | 35K | 85K (42%) |
| Implement | 60K | 145K (72%) |
| Buffer | 55K | 200K (100%) |

### Workflow Diagram

```
User Request
     │
     ▼
┌─────────────────┐
│  /rpi-research  │ → .claude/research/active/[name]_research.md
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   /rpi-plan     │ → .claude/plans/active/[name]_plan.md
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ APPROVE │ ← Human Review
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ /rpi-implement  │ → Code changes + Doc updates
└────────┬────────┘
         │
         ▼
  .claude/plans/completed/[name]_plan.md
```

---

## CLI Tools

In addition to slash commands, CLI tools are available:

```bash
# Validate setup
npx claude-context validate

# Run diagnostics
npx claude-context diagnose

# Initialize (partial - requires agent for full init)
npx claude-context init

# View configuration
npx claude-context config
```

---

## Quick Tips

1. **Start with indexes:** Load CATEGORY_INDEX.md before detail files
2. **Use progressive loading:** 5K → 15K → 40K tokens as needed
3. **After code changes:** Always run `/verify-docs-current`
4. **For complex features:** Full RPI cycle prevents errors
5. **When stuck:** Use `@context-engineer "help with [problem]"`

---

## Getting More Help

- **Quick Start:** See `docs/QUICK_START_5MIN.md`
- **Troubleshooting:** See `docs/TROUBLESHOOTING.md`
- **Full Documentation:** See `.claude/README.md`
- **RPI Details:** See `.claude/RPI_WORKFLOW_PLAN.md`
