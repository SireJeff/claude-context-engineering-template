---
name: rpi-plan
version: "1.0.0"
description: "RPI Plan Phase: Create implementation blueprint with file:line precision"
category: "rpi-orchestration"
rpi_phase: "plan"
context_budget_estimate: "35K tokens"
typical_context_usage: "17%"
prerequisites:
  - "Research document exists in .claude/research/active/"
  - "/rpi-research phase completed"
outputs:
  - "Plan document in .claude/plans/active/[name]_plan.md"
  - "Modification table with file:line references"
  - "Step-by-step implementation guide"
  - "Test strategy"
  - "Rollback plan"
next_commands: ["/rpi-implement"]
related_agents: ["core-architect", "database-ops", "api-developer"]
examples:
  - command: "/rpi-plan user-authentication"
    description: "Create implementation plan for auth feature"
  - command: "/rpi-plan payment-bug-fix"
    description: "Plan the fix for payment issue"
exit_criteria:
  - "Plan document created in .claude/plans/active/"
  - "All file modifications listed with line numbers"
  - "Step-by-step implementation defined"
  - "Test strategy documented"
  - "Human approval obtained"
---

# RPI Plan Phase

**Purpose:** Create detailed implementation blueprint

**Syntax:** `/rpi-plan [feature-name]`

**Prerequisites:** Research document must exist in `.claude/research/active/`

---

## Execution Steps

### Step 1: Load Research Document
Read `.claude/research/active/[feature]_research.md`

### Step 2: Define Scope
- In scope (explicit list)
- Out of scope (what we're NOT touching)

### Step 3: List File Modifications
| File | Lines | Change | Risk |
|------|-------|--------|------|
Each modification with exact line numbers

### Step 4: Create Step-by-Step Plan
For each step:
- Current code
- Proposed change
- Test to run after

### Step 5: Define Test Strategy
- Unit tests required
- Integration tests required
- E2E tests if applicable

### Step 6: Document Rollback Plan
- How to revert
- Safe commit to return to

### Step 7: Request Human Approval
Plan requires human review before implementation

---

## Output

Plan document in `.claude/plans/active/[feature]_plan.md`

---

## Context Budget

- Research doc: 20k tokens
- Plan creation: 15k tokens
- Total: 35k tokens (17%)

---

## Next Step

After human approval: `/rpi-implement [feature-name]`
