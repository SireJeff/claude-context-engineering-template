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
  - "Plan document exists in .ai-context/plans/active/"
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
  - "Archived plan in .ai-context/plans/completed/"
  - "Archived research in .ai-context/research/completed/"
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

**Prerequisites:** Plan must be approved in `.ai-context/plans/active/` with chunk manifest

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
│ FOR each CHUNK-Pn in dependency_order:                  │
│   1. Load CHUNK-Pn todolist                             │
│   2. FOR each TODO in CHUNK-Pn:                         │
│      a. Make atomic change                              │
│      b. Run specified test                              │
│      c. If PASS: commit, mark TODO ✅                   │
│      d. If FAIL: STOP, investigate, fix                 │
│   3. Mark CHUNK-Pn as IMPLEMENTED                       │
│   4. Update research CHUNK-Rn to IMPLEMENTED            │
│   5. Context reset if needed                            │
│   6. Proceed to next chunk                              │
│ END LOOP                                                │
└─────────────────────────────────────────────────────────┘
```

---

## Execution Steps

### Step 1: Load Plan
Read `.ai-context/plans/active/[feature]_plan.md` with chunk manifest

### Step 2: Verify Preconditions
- [ ] Plan is approved
- [ ] Branch is clean
- [ ] Tests pass before changes
- [ ] Chunk manifest is present

### Step 3: Execute Each Chunk (in dependency order)

For each CHUNK-Pn:
1. Execute each todo atomically (one change → one test → one commit)
2. Mark CHUNK-Pn as IMPLEMENTED when all todos complete
3. Update CHUNK-Rn status in research to IMPLEMENTED

### Step 4: Context Reset (Every 3 Chunks or 35% Utilization)
1. Update progress in plan
2. Re-read plan document
3. Verify scope alignment
4. Compact if >35% context usage

### Step 5: Run Full Test Suite
After all chunks complete

### Step 6: Update Documentation (MANDATORY)
1. Check CODE_TO_WORKFLOW_MAP.md
2. Update affected workflow files
3. Update line numbers
4. Run /verify-docs-current

### Step 7: Final Commit
Documentation updates

### Step 8: Archive Documents
- Move plan to `.ai-context/plans/completed/`
- Move research to `.ai-context/research/completed/`

---

## Error Recovery

| Error Type | Action |
|------------|--------|
| Syntax Error | Fix immediately in same todo |
| Test Failure | Stop, investigate, fix before proceeding |
| 3+ Failures in chunk | Mark chunk BLOCKED, try next independent chunk |
| 3+ Chunks blocked | STOP. Compact context. Start new session. |

---

## Context Budget

- Plan: 15k tokens
- Active code (per chunk): ~10k tokens
- Test results (per chunk): ~5k tokens
- Max active (3 chunks): ~45k tokens (22.5%)

---

## Output

- Completed feature/fix (implemented chunk by chunk)
- All chunks marked IMPLEMENTED (plan + research)
- Updated documentation per chunk
- Documents archived to completed/
