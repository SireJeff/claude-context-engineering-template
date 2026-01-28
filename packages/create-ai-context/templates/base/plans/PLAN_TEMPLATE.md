# Implementation Plan: [Feature/Fix Name]

**Date:** YYYY-MM-DD
**Based on:** `.ai-context/research/active/[feature]_research.md`
**Status:** DRAFT | APPROVED | IMPLEMENTING | COMPLETE
**Estimated Changes:** X files, ~XXX lines
**Context Budget:** Target <40% of 200k tokens

---

## Research Summary

[Paste 150-word summary from research document]

---

## Scope Definition

### In Scope
- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2]
- [ ] [Specific deliverable 3]

### Out of Scope
- [What we are NOT touching]
- [Related but deferred work]
- [Future enhancements]

---

## Files to Modify

**CRITICAL:** All file references MUST include explicit line numbers

| File | Lines | Change Description | Risk Level | Test Required |
|------|-------|-------------------|------------|---------------|
| `path/file.ext` | XXX-YYY | [What changes] | LOW/MED/HIGH | `test_name` |
| `path/other.ext` | XXX-YYY | [What changes] | LOW/MED/HIGH | `test_name` |

---

## Step-by-Step Implementation

### Step 1: [Action Name]

**Priority:** 1 of N
**File:** `path/to/file.ext`
**Lines:** XXX-YYY
**Risk:** LOW/MEDIUM/HIGH

**Current Code:**
```
[Existing code that will be changed]
```

**Proposed Change:**
```
[New code after modification]
```

**Rationale:**
[Why this change is needed - 1-2 sentences]

**Test After:**
```bash
[Test command to run]
```

**Success Criteria:**
- [ ] [What should work after this step]

---

### Step 2: [Action Name]

**Priority:** 2 of N
**File:** `path/to/file.ext`
**Lines:** XXX-YYY
**Risk:** LOW/MEDIUM/HIGH

[Same structure as Step 1...]

---

## Workflow Impact Analysis

### Affected Workflows
Check `.ai-context/context/CODE_TO_WORKFLOW_MAP.md`:

| Workflow | Impact | Update Required |
|----------|--------|-----------------|
| `workflow_name.md` | [How affected] | Yes/No |

### Backward Compatibility
- [ ] No breaking changes to public APIs
- [ ] Database migrations are reversible
- [ ] Configuration changes are backward compatible

---

## Testing Strategy

### Unit Tests
| Test | Purpose | Command |
|------|---------|---------|
| `test_file::test_name` | [What it verifies] | `pytest path -k name` |

### Integration Tests
| Test | Purpose | Command |
|------|---------|---------|
| `test_file::test_name` | [What it verifies] | `pytest path -k name` |

### E2E Tests (if applicable)
| Scenario | Purpose | Command |
|----------|---------|---------|
| [User flow] | [What it verifies] | `pytest path -k name` |

---

## Verification Checklist

### Before Starting
- [ ] Research document reviewed
- [ ] Plan approved by human
- [ ] Current branch is clean (`git status`)
- [ ] Tests passing before changes (`pytest`)

### After Each Step
- [ ] Syntax check passes
- [ ] Step-specific test passes
- [ ] Commit created with descriptive message

### After All Steps
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Documentation updated (see below)
- [ ] No linting errors

---

## Documentation Updates Required

**MANDATORY:** Update after code changes

### Workflow Files
- [ ] `.ai-context/context/workflows/[name].md` - Update line numbers
- [ ] Update function signatures if changed

### Index Files
- [ ] `.ai-context/context/CODE_TO_WORKFLOW_MAP.md` - Add new files if created

### Agent Files
- [ ] `.ai-context/agents/[name].md` - Update if capabilities changed

### AI_CONTEXT.md
- [ ] Update if architecture changed
- [ ] Update if new commands added

### Validation
```bash
/verify-docs-current [modified_file]
```

---

## Rollback Plan

### Quick Rollback
```bash
git revert HEAD~N  # Revert last N commits
```

### Safe State
- **Commit:** `[hash]`
- **Description:** Last known working state before changes

### Recovery Steps
1. [Step to recover if rollback needed]
2. [Step to verify recovery]

---

## Context Budget Estimate

| Phase | Tokens | Percentage |
|-------|--------|------------|
| Plan Loading | ~15k | 7.5% |
| Active Code | ~30k | 15% |
| Test Results | ~15k | 7.5% |
| **Total** | **~60k** | **30%** |

**Compaction Strategy:**
- After Step 3: Archive completed step results
- After Step 6: Full compaction, reload plan
- On 35% trigger: Save progress, compact, continue

---

## Human Review Required

**Before approval, human should verify:**

1. **Scope Check:** Are we solving the right problem?
2. **Impact Analysis:** What else might break?
3. **Prior Art:** Did we check KNOWN_GOTCHAS.md?
4. **Testing Strategy:** Is coverage adequate?
5. **Rollback Path:** Can we undo safely?

**Human Notes:**
```
[Space for human reviewer notes]
```

**Approved:** [ ] Yes / [ ] No / [ ] With modifications
**Approved by:** [Name]
**Date:** YYYY-MM-DD

---

## Execution Log

### Step Progress

| Step | Status | Commit | Notes |
|------|--------|--------|-------|
| 1 | ⏳ Pending | - | - |
| 2 | ⏳ Pending | - | - |
| 3 | ⏳ Pending | - | - |

### Issues Encountered

| Step | Issue | Resolution |
|------|-------|------------|
| - | - | - |

---

## Next Steps After Completion

1. ✅ All steps completed
2. ⏳ Run full test suite
3. ⏳ Update documentation
4. ⏳ Run `/verify-docs-current`
5. ⏳ Move plan to `.ai-context/plans/completed/`
6. ⏳ Create PR/merge to main

---

**Plan Version:** 1.0
**Last Updated:** YYYY-MM-DD
