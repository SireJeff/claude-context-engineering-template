---
name: rpi-implement
version: "2.0.0"
description: "RPI Implement Phase: Execute chunk-based todolists with atomic changes and continuous testing"
category: "rpi-orchestration"
rpi_phase: "implement"
context_budget_estimate: "60K tokens"
typical_context_usage: "30%"
chunk_input: true
loop_based: true
inter_phase_aware: true
prerequisites:
  - "Plan document exists in .claude/plans/active/"
  - "Plan has been approved by human"
  - "Plan contains chunk manifest with chunk-todolists"
  - "Git branch is clean"
  - "All tests currently passing"
outputs:
  - "Implemented feature/fix (chunk by chunk)"
  - "Updated documentation with new line numbers"
  - "Commits with descriptive messages per todo"
  - "All plan chunks marked as IMPLEMENTED"
  - "All research chunks marked as IMPLEMENTED"
  - "Archived plan in .claude/plans/completed/"
  - "Archived research in .claude/research/completed/"
next_commands: ["/verify-docs-current", "/validate-all"]
related_agents: ["core-architect", "database-ops", "api-developer", "deployment-ops"]
examples:
  - command: "/rpi-implement user-authentication"
    description: "Execute approved authentication plan chunk by chunk"
  - command: "/rpi-implement payment-bug-fix"
    description: "Implement approved bug fix processing each chunk's todolist"
exit_criteria:
  - "All chunk-todolists completed"
  - "All plan chunks marked as IMPLEMENTED"
  - "All research chunks marked as IMPLEMENTED"
  - "All tests passing"
  - "Documentation updated per chunk"
  - "Changes committed per todo"
  - "Plan archived to completed/"
  - "Research archived to completed/"
---

# RPI Implement Phase (Enhanced with Chunk-Based Execution)

**Purpose:** Execute implementation plan chunk by chunk, processing each chunk's todolist atomically

**Syntax:** `/rpi-implement [feature-name]`

**Prerequisites:** Plan must be approved in `.claude/plans/active/` with chunk manifest

---

## Key Innovation: Inter-Phase Awareness

RPI-Implement **KNOWS**:
- RPI-Plan structured chunks for atomic implementation
- Each CHUNK-Pn contains a complete, ordered todolist
- Chunk dependencies dictate execution order
- Marking chunks complete updates both plan AND research documents
- Context reset is needed after every 3 chunks or 35% utilization

---

## Golden Rules

```
ONE CHUNK → COMPLETE TODOLIST → MARK DONE → NEXT CHUNK
ONE TODO → ONE CHANGE → ONE TEST → ONE COMMIT
```

---

## Chunk-Based Implementation Loop

```
┌─────────────────────────────────────────────────────────┐
│ RPI-IMPLEMENT CHUNK PROCESSING LOOP                     │
├─────────────────────────────────────────────────────────┤
│ 1. Load plan document                                   │
│ 2. Read chunk manifest and dependency graph             │
│ 3. Verify preconditions                                 │
│                                                         │
│ FOR each CHUNK-Pn in dependency_order:                  │
│   IF CHUNK-Pn.dependencies_complete:                    │
│     a. Load CHUNK-Pn todolist                           │
│                                                         │
│     FOR each TODO in CHUNK-Pn.todolist:                 │
│       i.   Make atomic change                           │
│       ii.  Run todo-specific test                       │
│       iii. If PASS: commit, mark TODO ✅                │
│       iv.  If FAIL: STOP, investigate, fix              │
│     END TODO LOOP                                       │
│                                                         │
│     b. Update chunk documentation                       │
│     c. Mark CHUNK-Pn as IMPLEMENTED                     │
│     d. Update research CHUNK-Rn to IMPLEMENTED          │
│                                                         │
│     IF chunks_processed % 3 == 0 OR context > 35%:      │
│       Context reset (save progress, reload plan)        │
│     END IF                                              │
│                                                         │
│     e. Proceed to next ready CHUNK-P(n+1)               │
│   END IF                                                │
│ END CHUNK LOOP                                          │
│                                                         │
│ 4. Run full test suite                                  │
│ 5. Final documentation update                           │
│ 6. Archive plan and research documents                  │
└─────────────────────────────────────────────────────────┘
```

---

## Execution Steps

### Step 1: Load Plan
Read `.claude/plans/active/[feature]_plan.md` and extract:
- Chunk manifest
- Chunk dependency graph
- Per-chunk todolists
- Inter-phase contract

### Step 2: Verify Preconditions
- [ ] Plan is approved
- [ ] Branch is clean
- [ ] Tests pass before changes
- [ ] Chunk manifest is present

### Step 3: Determine Execution Order
Based on chunk dependency graph:
```
Independent chunks first (parallel capable)
  ↓
Dependent chunks in order
  ↓
Final chunks (e.g., test additions)
```

### Step 4: Execute Each Chunk

For each CHUNK-Pn (in dependency order):

1. **Check dependencies:**
   - Are all dependent chunks complete?
   - If not, skip to next ready chunk

2. **Load chunk todolist:**
   ```markdown
   | # | Action | File | Lines | Risk | Test | Status |
   |---|--------|------|-------|------|------|--------|
   | 1 | Add route | routes.ext | 100 | LOW | test_route | ⏳ |
   ```

3. **Execute each todo atomically:**
   - Make single change
   - Run specified test
   - If pass: commit with message `feat(chunk-P1): Todo 1 - Add route`
   - If fail: STOP, investigate, do not proceed

4. **After all todos complete:**
   - Update CHUNK-Pn status to IMPLEMENTED
   - Update CHUNK-Rn status in research to IMPLEMENTED
   - Commit chunk documentation updates

5. **Context management:**
   - After every 3 chunks: reload plan, verify scope
   - If >35% utilization: save progress, compact, continue

### Step 5: Run Full Test Suite
After all chunks complete:
```bash
npm test  # or equivalent
```

### Step 6: Update Documentation (MANDATORY)
Per chunk, update:
1. Check CODE_TO_WORKFLOW_MAP.md
2. Update affected workflow files
3. Update line numbers
4. Run /verify-docs-current

### Step 7: Final Commit
All documentation updates

### Step 8: Archive Documents
- Move plan to `.claude/plans/completed/`
- Move research to `.claude/research/completed/`

---

## Chunk Status Tracking

### Update Plan Document
```markdown
| Chunk | Status | Todos Done | Commit | Research Updated |
|-------|--------|------------|--------|------------------|
| P1 | ✅ IMPLEMENTED | 4/4 | abc123 | ✅ R1 |
| P2 | ▶️ IMPLEMENTING | 2/5 | - | - |
| P3 | ⏳ Pending | 0/3 | - | - |
```

### Update Research Document
Mark each CHUNK-Rn status as research chunk gets implemented:
- FOUND → COMPLETE → PLANNED → **IMPLEMENTED**

---

## Error Recovery

| Error Type | Action |
|------------|--------|
| Syntax Error | Fix immediately in same todo |
| Test Failure | Stop, investigate, fix before proceeding |
| 3+ Failures in chunk | Mark chunk BLOCKED, try next independent chunk |
| Chunk blocked by dependency | Skip, revisit after dependency completes |
| 3+ Chunks blocked | STOP. Compact context. Start new session. |

---

## Context Budget

- Plan: 15k tokens
- Active code (per chunk): ~10k tokens
- Test results (per chunk): ~5k tokens
- Per chunk total: ~15k tokens
- Max active (3 chunks): ~45k tokens (22.5%)

### Context Reset Triggers
- After every 3 chunks processed
- Context utilization >35%
- Error loop (3+ failed attempts)

### Context Reset Actions
1. Save chunk progress to plan document
2. Archive tool results
3. Reload plan document
4. Continue with next chunk

---

## Commit Format

Per-todo commits:
```
feat/fix/refactor(chunk-Pn): Todo N - description

- Specific change made
- Test result

Implements: [feature] chunk N
```

Per-chunk completion:
```
feat(chunk-Pn): Complete chunk - [domain]

- All N todos complete
- Chunk tests passing
- Research status updated

Completes: CHUNK-Pn, Updates: CHUNK-Rn
```

---

## Output

- Completed feature/fix (implemented chunk by chunk)
- All chunks marked IMPLEMENTED (plan + research)
- Updated documentation per chunk
- Plan archived to completed/
- Research archived to completed/
