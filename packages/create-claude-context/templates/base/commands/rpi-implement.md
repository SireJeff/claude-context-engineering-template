---
name: rpi-implement
version: "1.0.0"
description: "RPI Implement Phase: Execute plan with atomic changes and continuous testing"
category: "rpi-orchestration"
rpi_phase: "implement"
context_budget_estimate: "60K tokens"
typical_context_usage: "30%"
prerequisites:
  - "Plan document exists in .claude/plans/active/"
  - "Plan has been approved by human"
  - "Git branch is clean"
  - "All tests currently passing"
outputs:
  - "Implemented feature/fix"
  - "Updated documentation with new line numbers"
  - "Commits with descriptive messages"
  - "Archived plan in .claude/plans/completed/"
next_commands: ["/verify-docs-current", "/validate-all"]
related_agents: ["core-architect", "database-ops", "api-developer", "deployment-ops"]
examples:
  - command: "/rpi-implement user-authentication"
    description: "Execute the approved authentication plan"
  - command: "/rpi-implement payment-bug-fix"
    description: "Implement the approved bug fix"
exit_criteria:
  - "All plan steps completed"
  - "All tests passing"
  - "Documentation updated"
  - "Changes committed"
  - "Plan archived to completed/"
---

# RPI Implement Phase

**Purpose:** Execute implementation plan atomically

**Syntax:** `/rpi-implement [feature-name]`

**Prerequisites:** Plan must be approved in `.claude/plans/active/`

---

## Golden Rule

```
ONE CHANGE → ONE TEST → ONE COMMIT
```

---

## Execution Steps

### Step 1: Load Plan
Read `.claude/plans/active/[feature]_plan.md`

### Step 2: Verify Preconditions
- [ ] Plan is approved
- [ ] Branch is clean
- [ ] Tests pass before changes

### Step 3: Execute Each Step
For each step in plan:
1. Make the single, atomic change
2. Run step-specific test
3. If pass: commit with descriptive message
4. If fail: stop, investigate, do not proceed

### Step 4: Context Reset (Every 3 Steps)
1. Update progress in plan
2. Re-read plan document
3. Verify scope alignment
4. Compact if >35% context usage

### Step 5: Run Full Test Suite
After all steps complete

### Step 6: Update Documentation (MANDATORY)
1. Check CODE_TO_WORKFLOW_MAP.md
2. Update affected workflow files
3. Update line numbers
4. Run /verify-docs-current

### Step 7: Final Commit
Documentation updates

### Step 8: Archive Plan
Move to `.claude/plans/completed/`

---

## Error Recovery

| Error Type | Action |
|------------|--------|
| Syntax Error | Fix immediately |
| Test Failure | Stop, investigate |
| 3+ Failures | Compact, start new session |

---

## Context Budget

- Plan: 15k tokens
- Active code: 30k tokens
- Test results: 15k tokens
- Total: 60k tokens (30%)

---

## Output

- Completed feature/fix
- Updated documentation
- Plan archived to completed/
