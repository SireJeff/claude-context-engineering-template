---
description: RPI Implement Phase - Execute plan with atomic changes and continuous testing
---

# Context Engineering: Implement Phase

When invoked, execute the approved implementation plan:

## Prerequisites
- Approved plan at `.claude/plans/active/[feature]_plan.md`
- If not found, run `/context-eng:plan $ARGUMENTS` first

## Golden Rule

```
ONE CHANGE → ONE TEST → ONE COMMIT
```

## Process

1. **Load Plan Document**
   - Read `.claude/plans/active/[feature]_plan.md`
   - Verify plan status is APPROVED

2. **For Each Step in Plan:**
   a. Make the single, atomic change
   b. Run the specified test immediately
   c. If test passes: commit with descriptive message
   d. If test fails: STOP, investigate, fix before proceeding
   e. Update documentation if needed

3. **Documentation Updates (MANDATORY)**
   - Check `CODE_TO_WORKFLOW_MAP.md` for affected workflows
   - Update workflow files with new line numbers
   - Update function signatures if changed

4. **Context Reset (Every 3 Steps)**
   - Update progress checklist in plan
   - Re-read plan document
   - Verify scope alignment
   - Compact if >35% utilization

5. **Finalize**
   - Move plan to `.claude/plans/completed/`
   - Move research to `.claude/research/completed/`
   - Run `/context-eng:validate` to verify

## Error Handling

| Error Type | Response |
|------------|----------|
| Syntax Error | STOP. Fix immediately. |
| Import Error | Check file paths, verify imports. |
| Test Failure | Do NOT add more code. Investigate first. |
| 3+ Failures | STOP. Start new session. |

## Context Budget
- Plan: 15k tokens
- Active code: 30k tokens
- Test results: 15k tokens
- Total: 60k tokens (30%)

## Commit Format
```
feat/fix/refactor(scope): description

- Detail 1
- Detail 2

Implements: [feature]
```
