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
  - "Research document exists in .ai-context/research/active/"
  - "/rpi-research phase completed with chunk manifest"
outputs:
  - "Plan document in .ai-context/plans/active/[name]_plan.md"
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
  - "Plan document created in .ai-context/plans/active/"
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

**Prerequisites:** Research document must exist in `.ai-context/research/active/` with chunk manifest

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
│ FOR each research_chunk (CHUNK-R1 to CHUNK-RN):         │
│   1. Read research_chunk content                        │
│   2. Create corresponding CHUNK-Pn todolist:            │
│      - Define atomic action items                       │
│      - Specify file:line for each action                │
│      - Assign test for each action                      │
│      - Document chunk-specific rollback                 │
│   3. Mark research_chunk status as PLANNED              │
│   4. Define CHUNK-Pn dependencies                       │
│   5. Proceed to next research chunk                     │
│ END LOOP                                                │
└─────────────────────────────────────────────────────────┘
```

---

## Execution Steps

### Step 1: Load Research Document
Read `.ai-context/research/active/[feature]_research.md` and extract chunk manifest

### Step 2: Process Each Research Chunk

For each CHUNK-Rn:
1. Analyze chunk content (files, deps, call chains)
2. Create CHUNK-Pn todolist with atomic actions
3. Mark CHUNK-Rn status as PLANNED
4. Document chunk dependencies

### Step 3: Define Scope
- In scope (explicit list per chunk)
- Out of scope (what we're NOT touching)

### Step 4: Create Chunk Dependency Graph
```
CHUNK-P1 ───→ CHUNK-P2 ───→ CHUNK-P3
```

### Step 5: Plan Testing Strategy (Per Chunk)
- Tests to run after each todo
- Tests to run after chunk completion

### Step 6: Document Rollback Plan (Per Chunk)
- Per-chunk rollback commands
- Safe commits per chunk

### Step 7: Finalize Inter-Phase Contract
```
EXPECTED_CONSUMER: rpi-implement
CHUNK_PROCESSING_ORDER: dependency-ordered
MARK_AS_IMPLEMENTED_WHEN: all chunk todos complete
UPDATE_RESEARCH_STATUS: true
```

### Step 8: Request Human Approval
Plan requires human review before implementation

---

## Output

Plan document in `.ai-context/plans/active/[feature]_plan.md` with:
- Chunk manifest
- Per-chunk todolists
- Inter-phase contract for RPI-Implement

---

## Context Budget

- Research doc: 20k tokens
- Plan creation: 15k tokens
- Total: 35k tokens (17%)

---

## Next Step

After human approval: `/rpi-implement [feature-name]`

RPI-Implement will process chunks in dependency order, executing todos atomically
