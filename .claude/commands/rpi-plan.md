---
name: rpi-plan
version: "2.0.0"
description: "RPI Plan Phase: Create chunk-based implementation blueprint with todolists for rpi-implement consumption"
category: "rpi-orchestration"
rpi_phase: "plan"
context_budget_estimate: "35K tokens"
typical_context_usage: "17%"
chunk_input: true
chunk_output: true
inter_phase_aware: true
prerequisites:
  - "Research document exists in .claude/research/active/"
  - "/rpi-research phase completed with chunk manifest"
outputs:
  - "Plan document in .claude/plans/active/[name]_plan.md"
  - "Chunk-based todolists (CHUNK-Pn per CHUNK-Rn)"
  - "Modification table with file:line references per chunk"
  - "Step-by-step implementation guide per chunk"
  - "Test strategy per chunk"
  - "Rollback plan per chunk"
  - "Inter-phase contract for rpi-implement"
next_commands: ["/rpi-implement"]
related_agents: ["core-architect", "database-ops", "api-developer"]
examples:
  - command: "/rpi-plan user-authentication"
    description: "Create chunk-based implementation plan for auth feature"
  - command: "/rpi-plan payment-bug-fix"
    description: "Plan the fix with chunk-todolists for payment issue"
exit_criteria:
  - "Plan document created in .claude/plans/active/"
  - "Chunk manifest created with CHUNK-Pn per CHUNK-Rn"
  - "All research chunks marked as PLANNED"
  - "All file modifications listed with line numbers per chunk"
  - "Chunk-todolists defined with atomic actions"
  - "Test strategy documented per chunk"
  - "Human approval obtained"
  - "Inter-phase contract documented for rpi-implement"
---

# RPI Plan Phase (Enhanced with Chunk-Based Todolists)

**Purpose:** Create detailed implementation blueprint using chunk-based todolists that RPI-Implement will process

**Syntax:** `/rpi-plan [feature-name]`

**Prerequisites:** Research document must exist in `.claude/research/active/` with chunk manifest

---

## Key Innovation: Inter-Phase Awareness

RPI-Plan **KNOWS**:
- RPI-Research structured chunks specifically for sequential processing
- RPI-Implement will read each CHUNK-Pn as an atomic implementation unit
- Each CHUNK-Pn todolist must be independently executable
- Chunk dependencies must be explicit for proper execution ordering

---

## Chunk Processing Loop

```
┌─────────────────────────────────────────────────────────┐
│ RPI-PLAN CHUNK PROCESSING LOOP                          │
├─────────────────────────────────────────────────────────┤
│ 1. Load research document                               │
│ 2. Read chunk manifest from research                    │
│                                                         │
│ FOR each CHUNK-Rn in research_chunks:                   │
│   a. Read CHUNK-Rn content (files, deps, call chains)   │
│   b. Create CHUNK-Pn todolist:                          │
│      - Define atomic action items                       │
│      - Specify file:line for each action                │
│      - Assign test for each action                      │
│      - Document chunk-specific rollback                 │
│   c. Mark CHUNK-Rn status as PLANNED                    │
│   d. Define CHUNK-Pn dependencies                       │
│   e. Proceed to next CHUNK-R(n+1)                       │
│ END LOOP                                                │
│                                                         │
│ 3. Generate chunk dependency graph                      │
│ 4. Create inter-phase contract for rpi-implement        │
│ 5. Request human approval                               │
└─────────────────────────────────────────────────────────┘
```

---

## Execution Steps

### Step 1: Load Research Document
Read `.claude/research/active/[feature]_research.md` and extract:
- Chunk manifest
- Per-chunk file lists with line numbers
- Per-chunk dependencies
- Inter-phase contract from research

### Step 2: Process Each Research Chunk

For each CHUNK-Rn:

1. **Analyze chunk content:**
   - Files explored
   - Code flow analysis
   - Dependencies identified

2. **Create CHUNK-Pn todolist:**
   ```markdown
   ### Todolist
   | # | Action | File | Lines | Risk | Test | Status |
   |---|--------|------|-------|------|------|--------|
   | 1 | [Action] | `file.ext` | XXX | LOW | test_x | ⏳ |
   ```

3. **Define per-todo details:**
   - Current code snippet
   - Proposed change
   - Test to run after

4. **Mark research chunk as PLANNED:**
   - Update CHUNK-Rn status in research document

5. **Document chunk dependencies:**
   - Which chunks must complete before this one
   - Which chunks depend on this one

### Step 3: Define Scope
- In scope (explicit list per chunk)
- Out of scope (what we're NOT touching)

### Step 4: Create Chunk Dependency Graph
```
CHUNK-P1 ───→ CHUNK-P2 ───→ CHUNK-P3
              ↓
CHUNK-P4     CHUNK-P5
```

### Step 5: Plan Testing Strategy (Per Chunk)
- Tests to run after each todo
- Tests to run after chunk completion
- Full test suite after all chunks

### Step 6: Document Rollback Plan (Per Chunk)
- Per-chunk rollback commands
- Safe commits per chunk
- Full rollback if needed

### Step 7: Finalize Inter-Phase Contract

```
EXPECTED_CONSUMER: rpi-implement
CHUNK_PROCESSING_ORDER: dependency-ordered
MARK_AS_IMPLEMENTED_WHEN: all chunk todos complete
UPDATE_RESEARCH_STATUS: true
CONTEXT_RESET_TRIGGER: every 3 chunks or 35% utilization
```

### Step 8: Request Human Approval
Plan requires human review before implementation

---

## Output Format

### Chunk Manifest (Required)
```markdown
| Chunk ID | From Research | Status | Todos | Dependencies | Ready |
|----------|---------------|--------|-------|--------------|-------|
| CHUNK-P1 | CHUNK-R1 | READY | 4 | None | ✅ |
| CHUNK-P2 | CHUNK-R2 | READY | 5 | CHUNK-P1 | ⏳ |
```

### Per-Chunk Structure (Required)
```markdown
## CHUNK-P1: API/Routes (from CHUNK-R1)

**Status:** READY
**Dependencies:** None
**Update Research Status When Complete:** Mark CHUNK-R1 as IMPLEMENTED

### Todolist
| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Add route | `routes.ext` | 100 | LOW | test_route | ⏳ |

### Todo 1: Add route
**File:** `routes.ext`
**Lines:** 100-110
**Current Code:** ...
**Proposed Change:** ...
**Test After:** `npm test routes`

### Chunk Completion Criteria
- [ ] All todos complete
- [ ] Update CHUNK-R1 status
- [ ] Proceed to dependent chunks
```

---

## Context Budget

- Research doc: 20k tokens
- Plan creation: 15k tokens
- Total: 35k tokens (17%)

---

## Next Step

After human approval: `/rpi-implement [feature-name]`

RPI-Implement will:
1. Load chunk manifest and dependency graph
2. Process chunks in dependency order
3. Execute todos atomically per chunk
4. Mark chunks as IMPLEMENTED
5. Update research document status
6. Loop until all chunks complete
