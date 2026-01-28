# RPI (Research, Plan, Implement) Workflow

**Created:** {{DATE}}
**Platform:** Claude Code
**Context Budget:** 200k tokens max, target <40%
**Output Budget:** 30k tokens max per response

---

## Executive Summary

The RPI workflow prevents the "slop" and "dumb zone" problems in AI-assisted development. By separating research, planning, and implementation into distinct phases, we achieve:

- **90% fewer cascading errors**
- **3× faster feature implementation**
- **5× faster issue resolution**
- **Self-documenting changes**

---

## Phase 1: RESEARCH

### Purpose
Understand the system, locate relevant components, prevent context pollution

### Artifacts
- Research document in `.ai-context/research/active/[feature]_research.md`
- 150-word summary for parent context

### Process
1. Load WORKFLOW_INDEX.md first (saves 100k+ tokens)
2. Use parallel Explore agents (3 simultaneous)
3. Trace call chains with line numbers
4. Map dependencies (internal + external)
5. Identify test coverage gaps
6. Document open questions

### Context Budget
- Starting: Up to 50k tokens for exploration
- Ending: 20k tokens (research doc only)
- Compaction: After each phase

### Exit Criteria
- [ ] Research document created
- [ ] 3-20 relevant files identified
- [ ] Call chains traced with line numbers
- [ ] Dependencies mapped
- [ ] 150-word summary generated

---

## Phase 2: PLAN

### Purpose
Design implementation with file:line precision, get human alignment

### Artifacts
- Plan document in `.ai-context/plans/active/[feature]_plan.md`
- Step-by-step implementation roadmap

### Process
1. Load research document
2. Reference workflow gotchas
3. Create modification list with exact line numbers
4. Plan testing strategy
5. Estimate context budget per step
6. Define rollback plan

### Context Budget
- Research doc: 20k tokens
- Plan creation: 15k tokens
- Total: 35k tokens (17.5%)

### Exit Criteria
- [ ] Plan document created with file:line references
- [ ] All modifications listed with risk level
- [ ] Test strategy defined
- [ ] Rollback plan documented
- [ ] Human review completed

---

## Phase 3: IMPLEMENT

### Purpose
Execute atomically with continuous testing

### Golden Rule
```
ONE CHANGE → ONE TEST → ONE COMMIT
```

### Process
1. Load plan and affected workflow sections
2. Make single, atomic change
3. Run affected tests immediately
4. Commit if tests pass
5. Update documentation
6. Repeat until plan complete

### Context Budget
- Plan: 15k tokens
- Active code: 30k tokens
- Test results: 15k tokens
- Total: 60k tokens (30%)

### Context Reset (Every 3 Steps)
1. Update progress checklist
2. Re-read plan document
3. Verify scope alignment
4. Compact if >35% utilization

### Exit Criteria
- [ ] All plan steps completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changes committed

---

## Template Files

### RESEARCH_TEMPLATE.md

```markdown
# Research: [Feature/Bug Name]

**Date:** YYYY-MM-DD
**Researcher:** Claude Code
**Status:** IN_PROGRESS | COMPLETE | BLOCKED

---

## Objective
[Clear statement of what we're trying to understand]

---

## Relevant Files Explored

| File | Lines | Key Findings |
|------|-------|--------------|
| `path/to/file.py` | 100-200 | Entry point for [feature] |

---

## Code Flow Analysis

[Entry Point] → [Function A] → [Function B] → [Exit Point]

```
entry_function() [file.py:100]
├─ helper_a() [file.py:150]
│  └─ utility() [utils.py:50]
└─ helper_b() [file.py:200]
```

---

## Dependencies Identified

**External:**
- API Name (purpose)

**Internal:**
- service_file.py (purpose)

---

## Test Files & Coverage

**Existing:**
- tests/test_feature.py - Covers main flow

**Gaps:**
- ❌ No test for error scenario

---

## Open Questions

- [ ] Question 1
- [ ] Question 2

---

## Summary (for Plan Phase, 150 words max)

[Concise summary for parent context]
```

---

### PLAN_TEMPLATE.md

```markdown
# Implementation Plan: [Feature/Fix Name]

**Date:** YYYY-MM-DD
**Based on:** research/active/[feature]_research.md
**Status:** DRAFT | APPROVED | IMPLEMENTING | COMPLETE

---

## Research Summary
[From Phase 1 - max 200 words]

---

## Scope Definition

**In Scope:**
- [Explicit list]

**Out of Scope:**
- [What we're NOT touching]

---

## Files to Modify

| File | Lines | Change | Risk |
|------|-------|--------|------|
| `path/file.py` | 100-150 | Add parameter | LOW |

---

## Step-by-Step Implementation

### Step 1: [Action Name]

**File:** `path/to/file.py`
**Lines:** 100-120

**Current:**
```python
def existing_function():
    pass
```

**Proposed:**
```python
def existing_function(new_param: str = "default"):
    pass
```

**Test:** `pytest tests/test_file.py -k test_name`

---

### Step 2: [Action Name]
...

---

## Verification Checklist

- [ ] Syntax check passes
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E test passes

---

## Rollback Plan

- Revert: `git revert HEAD`
- Safe commit: `[hash]`

---

## Documentation Updates Required

- [ ] Workflow file: [name]
- [ ] Agent file: [name]
- [ ] AI_CONTEXT.md section: [name]
```

---

## Error Recovery Protocol

| Error Type | Response |
|------------|----------|
| Syntax Error | STOP. Fix immediately in same session. |
| Import Error | Check file paths, verify imports. |
| Runtime Error | Create research subtask before fixing. |
| Test Failure | Do NOT add more code. Investigate first. |
| 3+ Failures | STOP. Compact context. Start new session. |

---

## Context Management

### Compaction Triggers
- After 5+ file reads without tool use
- Error loop (3+ failed attempts)
- Session > 1 hour
- Context > 35% utilization

### Compaction Actions
1. Save progress to SESSION_HANDOFF.md
2. Archive tool results
3. Keep only essential context
4. Continue or start fresh session

---

## Key Principles

1. **<40% Context Rule:** Performance degrades beyond 40% context utilization
2. **Sub-Agents:** Use parallel Explore agents for context isolation
3. **On-Demand Loading:** Load information as needed, not upfront
4. **Mental Alignment:** Plans align human and AI understanding
5. **Atomic Changes:** Small, testable, reversible modifications

---

**Version:** 1.1
**Status:** TEMPLATE
