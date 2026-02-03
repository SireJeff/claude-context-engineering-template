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

**Key Innovation: Parallel Agents with Chunked Todolists**

Each RPI phase inherently utilizes parallel agents and produces chunk-based outputs designed for consumption by the next phase. This creates a self-aware pipeline where:
- RPI-Research outputs chunks knowing RPI-Plan will consume them
- RPI-Plan creates chunk-todolists knowing RPI-Implement will process them
- Each phase loops through chunks, marking completion as it progresses

---

## Phase 1: RESEARCH

### Purpose
Understand the system, locate relevant components, prevent context pollution

### Artifacts
- Research document in `.ai-context/research/active/[feature]_research.md`
- **Chunked Research Sections** (3-7 chunks based on complexity)
- 150-word summary for parent context

### Process
1. Load WORKFLOW_INDEX.md first (saves 100k+ tokens)
2. **Spawn 3-5 parallel Explore agents** (one per research domain)
3. Each agent produces a **Research Chunk** with:
   - Chunk ID (e.g., `CHUNK-R1`, `CHUNK-R2`)
   - Explored files with line numbers
   - Call chains traced
   - Dependencies found
   - Chunk status: `COMPLETE` | `IN_PROGRESS` | `BLOCKED`
4. Aggregate chunks into unified research document
5. Format output specifically for RPI-Plan consumption

### Parallel Agent Strategy
```
┌─────────────────────────────────────────────────────────┐
│ RPI-RESEARCH PARALLEL EXECUTION                         │
├─────────────────────────────────────────────────────────┤
│ Agent 1: API/Route Entry Points        → CHUNK-R1      │
│ Agent 2: Business Logic & Models       → CHUNK-R2      │
│ Agent 3: Database/Storage Layer        → CHUNK-R3      │
│ Agent 4: External Integrations         → CHUNK-R4      │
│ Agent 5: Test Coverage Analysis        → CHUNK-R5      │
└─────────────────────────────────────────────────────────┘
```

### Inter-Phase Awareness
**RPI-Research KNOWS that RPI-Plan will:**
- Read each chunk sequentially
- Generate a planning todolist per chunk
- Mark chunks as `PLANNED` when processed
- Require: chunk IDs, file:line refs, dependency list

### Context Budget
- Starting: Up to 50k tokens for exploration
- Ending: 20k tokens (research doc only)
- Compaction: After each phase

### Exit Criteria
- [ ] Research document created with chunked structure
- [ ] 3-20 relevant files identified per chunk
- [ ] Call chains traced with line numbers
- [ ] Dependencies mapped per chunk
- [ ] 150-word summary generated
- [ ] **Chunk manifest created for RPI-Plan**

---

## Phase 2: PLAN

### Purpose
Design implementation with file:line precision, get human alignment

### Artifacts
- Plan document in `.ai-context/plans/active/[feature]_plan.md`
- **Chunk-Based Todolists** (one per research chunk)
- Step-by-step implementation roadmap

### Process
1. Load research document with chunks
2. **For each Research Chunk (CHUNK-Rn):**
   a. Create corresponding Plan Chunk (CHUNK-Pn)
   b. Generate specific todolist for that chunk
   c. Mark research chunk as `PLANNED`
   d. Record dependencies between plan chunks
3. Reference workflow gotchas
4. Create modification list with exact line numbers
5. Plan testing strategy per chunk
6. Define rollback plan
7. **Loop until all research chunks are processed**

### Chunk-Based Todolist Generation
```
┌─────────────────────────────────────────────────────────┐
│ RPI-PLAN CHUNK PROCESSING LOOP                          │
├─────────────────────────────────────────────────────────┤
│ FOR each CHUNK-Rn in research_chunks:                   │
│   1. Read CHUNK-Rn content                              │
│   2. Create CHUNK-Pn todolist:                          │
│      - [ ] Analyze files from CHUNK-Rn                  │
│      - [ ] Define modifications with line numbers       │
│      - [ ] Specify tests for this chunk                 │
│      - [ ] Document rollback for this chunk             │
│   3. Mark CHUNK-Rn as PLANNED                           │
│   4. Link CHUNK-Pn dependencies                         │
│   5. Proceed to next CHUNK-R(n+1)                       │
│ END LOOP                                                │
│ Generate unified plan document                          │
└─────────────────────────────────────────────────────────┘
```

### Inter-Phase Awareness
**RPI-Plan KNOWS that:**
- RPI-Research structured chunks for sequential processing
- RPI-Implement will read each CHUNK-Pn as an atomic unit
- Each CHUNK-Pn must be independently implementable
- Chunk dependencies must be explicit for proper ordering

### Context Budget
- Research doc: 20k tokens
- Plan creation: 15k tokens
- Total: 35k tokens (17.5%)

### Exit Criteria
- [ ] Plan document created with file:line references
- [ ] **All research chunks marked as PLANNED**
- [ ] **Chunk-todolists created for each chunk**
- [ ] All modifications listed with risk level
- [ ] Test strategy defined per chunk
- [ ] Rollback plan documented
- [ ] Human review completed
- [ ] **Chunk manifest created for RPI-Implement**

---

## Phase 3: IMPLEMENT

### Purpose
Execute atomically with continuous testing

### Golden Rule
```
ONE CHUNK → COMPLETE TODOLIST → MARK DONE → NEXT CHUNK
```

### Process
1. Load plan document with chunk-todolists
2. **For each Plan Chunk (CHUNK-Pn):**
   a. Load chunk-specific todolist
   b. Execute each todo item atomically:
      - Make single change
      - Run chunk-specific test
      - Commit if pass, stop if fail
   c. Update documentation for this chunk
   d. Mark CHUNK-Pn as `IMPLEMENTED`
   e. Mark corresponding CHUNK-Rn in research as `COMPLETE`
   f. Proceed to next CHUNK-P(n+1)
3. **Loop until all plan chunks are processed**
4. Run full test suite after all chunks complete

### Chunk-Based Implementation Loop
```
┌─────────────────────────────────────────────────────────┐
│ RPI-IMPLEMENT CHUNK PROCESSING LOOP                     │
├─────────────────────────────────────────────────────────┤
│ FOR each CHUNK-Pn in plan_chunks:                       │
│   1. Load CHUNK-Pn todolist                             │
│   2. FOR each TODO item in CHUNK-Pn:                    │
│      a. Make atomic change                              │
│      b. Run specified test                              │
│      c. If PASS: commit, mark TODO complete             │
│      d. If FAIL: stop, investigate, fix                 │
│   3. Update chunk documentation                         │
│   4. Mark CHUNK-Pn as IMPLEMENTED                       │
│   5. Update research CHUNK-Rn status to COMPLETE        │
│   6. Context reset if >35% utilization                  │
│   7. Proceed to CHUNK-P(n+1)                            │
│ END LOOP                                                │
│ Run full test suite                                     │
│ Archive plan and research documents                     │
└─────────────────────────────────────────────────────────┘
```

### Inter-Phase Awareness
**RPI-Implement KNOWS that:**
- RPI-Plan structured chunks for atomic implementation
- Each CHUNK-Pn contains a complete, ordered todolist
- Chunk dependencies dictate execution order
- Marking chunks updates both plan and research documents

### Context Budget
- Plan: 15k tokens
- Active code: 30k tokens
- Test results: 15k tokens
- Total: 60k tokens (30%)

### Context Reset (Every 3 Chunks or 35% Utilization)
1. Update progress checklist
2. Re-read plan document
3. Verify scope alignment
4. Compact if >35% utilization

### Exit Criteria
- [ ] **All plan chunks marked as IMPLEMENTED**
- [ ] **All research chunks marked as COMPLETE**
- [ ] All tests passing
- [ ] Documentation updated per chunk
- [ ] Changes committed

---

## Inter-Phase Communication Protocol

The key innovation of the enhanced RPI workflow is **inter-phase awareness**. Each phase produces output specifically formatted for the next phase's consumption.

### Research → Plan Communication
```
CHUNK_MANIFEST:
├── CHUNK-R1: (status, files, dependencies, ready_for_planning)
├── CHUNK-R2: (status, files, dependencies, ready_for_planning)
└── CHUNK-Rn: ...

INTER_PHASE_CONTRACT:
├── expected_consumer: "rpi-plan"
├── chunk_processing_order: "sequential"
├── mark_as_planned_when: "chunk_todolist_created"
└── required_output: "CHUNK-Pn per CHUNK-Rn"
```

### Plan → Implement Communication
```
CHUNK_MANIFEST:
├── CHUNK-P1: (todolist, tests, rollback, dependencies)
├── CHUNK-P2: (todolist, tests, rollback, dependencies)
└── CHUNK-Pn: ...

INTER_PHASE_CONTRACT:
├── expected_consumer: "rpi-implement"
├── chunk_processing_order: "dependency-ordered"
├── mark_as_implemented_when: "all_todos_complete"
└── update_research_status: true
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
| **Chunk Failure** | Mark chunk as BLOCKED, proceed to independent chunks, revisit later. |

---

## Context Management

### Compaction Triggers
- After 5+ file reads without tool use
- Error loop (3+ failed attempts)
- Session > 1 hour
- Context > 35% utilization
- **After every 3 chunks processed**

### Compaction Actions
1. Save progress to SESSION_HANDOFF.md
2. Archive tool results
3. Keep only essential context
4. Continue or start fresh session
5. **Preserve chunk manifest with current status**

---

## Key Principles

1. **<40% Context Rule:** Performance degrades beyond 40% context utilization
2. **Parallel Sub-Agents:** Use 3-5 parallel Explore agents for context isolation
3. **Chunk-Based Processing:** All phases produce and consume chunk-structured data
4. **Inter-Phase Awareness:** Each phase knows how the next phase reads its output
5. **Atomic Changes:** Small, testable, reversible modifications per todo item
6. **Loop-Based Completion:** Process chunks in loops, marking progress explicitly
7. **Bidirectional Status Updates:** Implement updates plan AND research status

---

## Quick Reference: Chunk Status Flow

```
RESEARCH CHUNKS                 PLAN CHUNKS
┌─────────────────┐            ┌─────────────────┐
│ CHUNK-R1        │            │ CHUNK-P1        │
│ Status: FOUND   │────────────│ Status: READY   │
│ → COMPLETE      │            │ → IMPLEMENTING  │
│ → PLANNED       │←───────────│ → IMPLEMENTED   │
│ → IMPLEMENTED   │←───────────│ → COMPLETE      │
└─────────────────┘            └─────────────────┘
```

**Status Transitions:**
- Research: `FOUND` → `COMPLETE` → `PLANNED` → `IMPLEMENTED`
- Plan: `DRAFT` → `READY` → `IMPLEMENTING` → `IMPLEMENTED` → `COMPLETE`

---

**Version:** 2.0 (Enhanced with Parallel Agents & Chunked Todolists)
**Status:** TEMPLATE
