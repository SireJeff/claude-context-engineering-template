# Implementation Plan: [Feature/Fix Name]

**Date:** YYYY-MM-DD
**Based on:** `.claude/research/active/[feature]_research.md`
**Status:** DRAFT | APPROVED | IMPLEMENTING | COMPLETE
**Estimated Changes:** X files, ~XXX lines
**Context Budget:** Target <40% of 200k tokens
**Total Chunks:** N (from research)
**Chunk Dependencies:** [See Chunk Dependency Graph]

---

## Research Summary

[Paste 150-word summary from research document]

---

## Chunk Manifest

> **INTER-PHASE CONTRACT:** This manifest is designed for RPI-Implement consumption.
> RPI-Implement will process each chunk's todolist, marking chunks complete as it progresses.

| Chunk ID | From Research | Status | Todos | Dependencies | Ready |
|----------|---------------|--------|-------|--------------|-------|
| CHUNK-P1 | CHUNK-R1 | READY | 4 | None | ✅ |
| CHUNK-P2 | CHUNK-R2 | READY | 5 | CHUNK-P1 | ⏳ |
| CHUNK-P3 | CHUNK-R3 | READY | 3 | CHUNK-P2 | ⏳ |
| CHUNK-P4 | CHUNK-R4 | READY | 2 | None | ✅ |
| CHUNK-P5 | CHUNK-R5 | READY | 6 | CHUNK-P1, P2 | ⏳ |

### Chunk Dependency Graph

```
CHUNK-P1 (API) ─────┬───→ CHUNK-P2 (Logic) ───→ CHUNK-P3 (DB)
                    │              │
CHUNK-P4 (External) │              │
                    │              ↓
                    └───→ CHUNK-P5 (Tests) ←───┘
                         (depends on P1 and P2)
```

**Execution Order:** P1 → P4 (parallel) → P2 → P3 → P5

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

## CHUNK-P1: API/Routes (from CHUNK-R1)

**Status:** DRAFT | READY | IMPLEMENTING | IMPLEMENTED | COMPLETE
**Research Chunk:** CHUNK-R1
**Dependencies:** None
**Update Research Status When Complete:** Mark CHUNK-R1 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | [Action description] | `path/file.ext` | XXX-YYY | LOW | `test_name` | ⏳ |
| 2 | [Action description] | `path/file.ext` | XXX-YYY | MED | `test_name` | ⏳ |
| 3 | [Action description] | `path/file.ext` | XXX-YYY | LOW | `test_name` | ⏳ |
| 4 | [Action description] | `path/file.ext` | XXX-YYY | LOW | `test_name` | ⏳ |

### Todo 1: [Action Name]

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

**Test After:**
```bash
[Test command to run]
```

### Todo 2: [Action Name]
[Same structure...]

### Chunk Completion Criteria
- [ ] All todos in CHUNK-P1 complete
- [ ] All tests passing
- [ ] Update CHUNK-R1 status to IMPLEMENTED
- [ ] Proceed to dependent chunks (CHUNK-P2, CHUNK-P5)

---

## CHUNK-P2: Business Logic (from CHUNK-R2)

**Status:** DRAFT | READY | IMPLEMENTING | IMPLEMENTED | COMPLETE
**Research Chunk:** CHUNK-R2
**Dependencies:** CHUNK-P1
**Update Research Status When Complete:** Mark CHUNK-R2 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | [Action description] | `path/file.ext` | XXX-YYY | LOW | `test_name` | ⏳ |
| 2 | [Action description] | `path/file.ext` | XXX-YYY | HIGH | `test_name` | ⏳ |
| 3 | [Action description] | `path/file.ext` | XXX-YYY | MED | `test_name` | ⏳ |

### Chunk Completion Criteria
- [ ] All todos in CHUNK-P2 complete
- [ ] All tests passing
- [ ] Update CHUNK-R2 status to IMPLEMENTED
- [ ] Proceed to dependent chunks (CHUNK-P3, CHUNK-P5)

---

## CHUNK-P3: Database/Storage (from CHUNK-R3)

**Status:** DRAFT | READY | IMPLEMENTING | IMPLEMENTED | COMPLETE
**Research Chunk:** CHUNK-R3
**Dependencies:** CHUNK-P2
**Update Research Status When Complete:** Mark CHUNK-R3 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | [Action description] | `path/file.ext` | XXX-YYY | MED | `test_name` | ⏳ |
| 2 | [Action description] | `path/file.ext` | XXX-YYY | LOW | `test_name` | ⏳ |

### Chunk Completion Criteria
- [ ] All todos in CHUNK-P3 complete
- [ ] All tests passing
- [ ] Update CHUNK-R3 status to IMPLEMENTED

---

## CHUNK-P4: External Integrations (from CHUNK-R4)

**Status:** DRAFT | READY | IMPLEMENTING | IMPLEMENTED | COMPLETE
**Research Chunk:** CHUNK-R4
**Dependencies:** None (can run parallel with CHUNK-P1)
**Update Research Status When Complete:** Mark CHUNK-R4 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | [Action description] | `path/file.ext` | XXX-YYY | LOW | `test_name` | ⏳ |

### Chunk Completion Criteria
- [ ] All todos in CHUNK-P4 complete
- [ ] All tests passing
- [ ] Update CHUNK-R4 status to IMPLEMENTED

---

## CHUNK-P5: Tests (from CHUNK-R5)

**Status:** DRAFT | READY | IMPLEMENTING | IMPLEMENTED | COMPLETE
**Research Chunk:** CHUNK-R5
**Dependencies:** CHUNK-P1, CHUNK-P2
**Update Research Status When Complete:** Mark CHUNK-R5 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | [Add unit test for X] | `tests/test_x.ext` | NEW | LOW | `test_name` | ⏳ |
| 2 | [Add integration test] | `tests/test_int.ext` | NEW | LOW | `test_name` | ⏳ |

### Chunk Completion Criteria
- [ ] All todos in CHUNK-P5 complete
- [ ] All tests passing
- [ ] Update CHUNK-R5 status to IMPLEMENTED
- [ ] All chunks complete → Run full test suite

---

## Inter-Phase Contract (RPI-Implement Consumption)

```
EXPECTED_CONSUMER: rpi-implement
CHUNK_PROCESSING_ORDER: dependency-ordered (see Chunk Dependency Graph)
MARK_AS_IMPLEMENTED_WHEN: all chunk todos complete
UPDATE_RESEARCH_STATUS: true (mark CHUNK-Rn as IMPLEMENTED)
CONTEXT_RESET_TRIGGER: every 3 chunks or 35% utilization
```

**What RPI-Implement Should Do:**
1. Load chunk manifest and dependency graph
2. Process chunks in dependency order
3. For each chunk:
   a. Execute todos atomically (one change → one test → one commit)
   b. Mark todos complete as they pass
   c. When all todos done, mark chunk IMPLEMENTED
   d. Update corresponding research chunk status
   e. Proceed to next ready chunk
4. Loop until all chunks IMPLEMENTED
5. Run full test suite
6. Archive documents

---

## Workflow Impact Analysis

### Affected Workflows
Check `.claude/context/CODE_TO_WORKFLOW_MAP.md`:

| Workflow | Impact | Update Required |
|----------|--------|-----------------|
| `workflow_name.md` | [How affected] | Yes/No |

### Backward Compatibility
- [ ] No breaking changes to public APIs
- [ ] Database migrations are reversible
- [ ] Configuration changes are backward compatible

---

## Testing Strategy

### Unit Tests (Per Chunk)
| Chunk | Test | Purpose | Command |
|-------|------|---------|---------|
| P1 | `test_file::test_name` | [What it verifies] | `pytest path -k name` |
| P2 | `test_file::test_name` | [What it verifies] | `pytest path -k name` |

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
- [ ] **Chunk manifest understood**

### After Each Chunk
- [ ] All chunk todos complete
- [ ] Chunk tests passing
- [ ] Commit created with descriptive message
- [ ] Research chunk status updated
- [ ] **Context reset if needed**

### After All Chunks
- [ ] All chunks marked IMPLEMENTED
- [ ] All research chunks marked IMPLEMENTED
- [ ] Full test suite passes
- [ ] Documentation updated
- [ ] No linting errors

---

## Documentation Updates Required

**MANDATORY:** Update after code changes

### Workflow Files
- [ ] `.claude/context/workflows/[name].md` - Update line numbers
- [ ] Update function signatures if changed

### Index Files
- [ ] `.claude/context/CODE_TO_WORKFLOW_MAP.md` - Add new files if created

### Agent Files
- [ ] `.claude/agents/[name].md` - Update if capabilities changed

### CLAUDE.md
- [ ] Update if architecture changed
- [ ] Update if new commands added

### Validation
```bash
/verify-docs-current [modified_file]
```

---

## Rollback Plan

### Per-Chunk Rollback
| Chunk | Rollback Command | Safe Commit |
|-------|------------------|-------------|
| P1 | `git revert [hash]` | `[hash]` |
| P2 | `git revert [hash]` | `[hash]` |

### Full Rollback
```bash
git revert HEAD~N  # Revert last N commits
```

### Recovery Steps
1. [Step to recover if rollback needed]
2. [Step to verify recovery]

---

## Context Budget Estimate

| Phase | Tokens | Percentage |
|-------|--------|------------|
| Plan Loading | ~15k | 7.5% |
| Active Code (per chunk) | ~10k | 5% |
| Test Results (per chunk) | ~5k | 2.5% |
| **Per Chunk Total** | **~15k** | **7.5%** |
| **Max Active (3 chunks)** | **~45k** | **22.5%** |

**Compaction Strategy:**
- After Chunk 3: Reset context, reload plan
- After Chunk 6: Full compaction
- On 35% trigger: Save progress, compact, continue

---

## Human Review Required

**Before approval, human should verify:**

1. **Scope Check:** Are we solving the right problem?
2. **Chunk Structure:** Are chunks properly ordered?
3. **Dependencies:** Are chunk dependencies correct?
4. **Impact Analysis:** What else might break?
5. **Prior Art:** Did we check KNOWN_GOTCHAS.md?
6. **Testing Strategy:** Is coverage adequate per chunk?
7. **Rollback Path:** Can we undo each chunk safely?

**Human Notes:**
```
[Space for human reviewer notes]
```

**Approved:** [ ] Yes / [ ] No / [ ] With modifications
**Approved by:** [Name]
**Date:** YYYY-MM-DD

---

## Execution Log

### Chunk Progress

| Chunk | Status | Todos Done | Commit | Research Updated |
|-------|--------|------------|--------|------------------|
| P1 | ⏳ Pending | 0/4 | - | - |
| P2 | ⏳ Pending | 0/5 | - | - |
| P3 | ⏳ Pending | 0/3 | - | - |
| P4 | ⏳ Pending | 0/2 | - | - |
| P5 | ⏳ Pending | 0/6 | - | - |

### Issues Encountered

| Chunk | Issue | Resolution |
|-------|-------|------------|
| - | - | - |

---

## Next Steps After Completion

1. ✅ All chunks IMPLEMENTED
2. ✅ All research chunks IMPLEMENTED
3. ⏳ Run full test suite
4. ⏳ Update documentation
5. ⏳ Run `/verify-docs-current`
6. ⏳ Move plan to `.claude/plans/completed/`
7. ⏳ Move research to `.claude/research/completed/`
8. ⏳ Create PR/merge to main

---

**Plan Version:** 2.0 (Chunk-Based with Inter-Phase Awareness)
**Last Updated:** YYYY-MM-DD
