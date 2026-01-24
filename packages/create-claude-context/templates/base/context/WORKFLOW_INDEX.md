# Workflow Index - {{PROJECT_NAME}}

**Purpose:** Master catalog of all documented workflows
**Load First:** Always load this file before debugging/implementing
**Size:** ~15k tokens (7.5% of 200k context budget)
**Last Updated:** {{DATE}}

---

## Quick Navigation

| # | Workflow | Complexity | Entry Point | Use When |
|---|----------|------------|-------------|----------|
| 1 | {{WORKFLOW_1}} | HIGH/MED/LOW | [file:line] | [Scenario] |
| 2 | {{WORKFLOW_2}} | HIGH/MED/LOW | [file:line] | [Scenario] |
| 3 | {{WORKFLOW_3}} | HIGH/MED/LOW | [file:line] | [Scenario] |

---

## Workflow Categories

### Category 1: {{CATEGORY_1_NAME}}

**Workflows:** X
**Total Lines:** ~XXX lines
**Primary Agent:** {{AGENT_NAME}}

| Workflow | Lines | Purpose |
|----------|-------|---------|
| [workflow_1.md](./workflows/workflow_1.md) | XXX | [Description] |

**Use This Category For:**
- [Scenario 1]
- [Scenario 2]

---

### Category 2: {{CATEGORY_2_NAME}}

[Same structure...]

---

## Cross-Reference Tables

### External APIs × Workflows

| API | Used By Workflows |
|-----|-------------------|
| {{API_1}} | workflow_1, workflow_2 |
| {{API_2}} | workflow_3 |

### Database Tables × Workflows

| Table | Used By Workflows |
|-------|-------------------|
| {{TABLE_1}} | workflow_1, workflow_4 |
| {{TABLE_2}} | workflow_2, workflow_3 |

### Test Files × Workflows

| Test File | Covers Workflows |
|-----------|------------------|
| `test_workflow_1.ext` | workflow_1 |
| `test_e2e.ext` | workflow_1, workflow_2 |

---

## Issue Triage Quick Reference

| Symptom | Check Workflow | Key File:Line |
|---------|---------------|---------------|
| [Issue type 1] | workflow_1 | file.ext:XXX |
| [Issue type 2] | workflow_2 | file.ext:YYY |
| [Issue type 3] | workflow_3 | file.ext:ZZZ |

---

## Context Engineering Usage

### Loading Strategy

```
Step 1: Load this file (~15k tokens)
Step 2: Identify relevant workflow(s)
Step 3: Load specific workflow file (~20-50k tokens)
Step 4: Read specific code sections as needed

Total: ~50-80k tokens (25-40% of budget)
```

### When to Load Full Workflow

- **Debugging:** Load the affected workflow immediately
- **Feature:** Load 2-3 related workflows
- **Refactoring:** Load primary + dependent workflows

### When NOT to Load Full Workflow

- **Simple fix:** Use this index + grep
- **Configuration change:** Direct file edit
- **Documentation update:** Direct doc edit

---

## Maintenance Schedule

| Task | Frequency | Time Required |
|------|-----------|---------------|
| Spot-check 5 line numbers | Monthly | 15 minutes |
| Re-run 3 discovery agents | Quarterly | 2 hours |
| Full documentation audit | Annually | 4-6 hours |

**Last Verification:** {{DATE}}
**Next Verification:** {{NEXT_DATE}}

---

## See Also

- **Detailed workflows:** [./workflows/](./workflows/)
- **Code organization:** [../indexes/code/CATEGORY_INDEX.md](../indexes/code/CATEGORY_INDEX.md)
- **Agent selection:** [../indexes/agents/CATEGORY_INDEX.md](../indexes/agents/CATEGORY_INDEX.md)
- **Reverse lookup:** [./CODE_TO_WORKFLOW_MAP.md](./CODE_TO_WORKFLOW_MAP.md)

---

**Version:** 1.0
**Total Workflows:** {{WORKFLOWS_COUNT}}
