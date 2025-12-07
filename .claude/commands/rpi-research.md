---
description: "RPI Research Phase: Systematic codebase exploration for feature/fix analysis"
category: "rpi-orchestration"
rpi_phase: "research"
context_budget_estimate: "50K tokens"
typical_context_usage: "25%"
exit_criteria:
  - "Research document created in .claude/research/active/"
  - "All relevant files identified (3-20 files)"
  - "Call chains traced with line numbers"
  - "Dependencies mapped"
  - "150-word summary generated"
enables_commands: ["/rpi-plan"]
---

# RPI Research Phase

**Purpose:** Systematic, zero-code-modification exploration

**Syntax:** `/rpi-research [feature-name]`

**Example:**
```bash
/rpi-research user-authentication
/rpi-research payment-bug-fix
```

---

## Execution Steps

### Step 1: Initialize Research Document
Create `.claude/research/active/[feature]_research.md` from RESEARCH_TEMPLATE.md

### Step 2: Entry Point Discovery (3 parallel agents)
- Agent 1: API/Route entry points
- Agent 2: Business logic locations
- Agent 3: Database/external integrations

### Step 3: Call Chain Tracing
- Read entry point files
- Trace 3 levels deep
- Record with file:line references

### Step 4: Dependency Mapping
- Internal service dependencies
- External API dependencies

### Step 5: Test Coverage Analysis
- Find existing tests
- Identify gaps

### Step 6: Generate Summary
- 150-word summary for Plan phase

---

## Output

Research document in `.claude/research/active/[feature]_research.md`

---

## Context Budget

- Target: 25% of 200k (50k tokens)
- Compaction: After each major step
- Final: ~20k tokens (research doc only)

---

## Next Step

After completion: `/rpi-plan [feature-name]`
