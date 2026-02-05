---
name: rpi-research
version: "2.0.0"
description: "RPI Research Phase: Systematic codebase exploration with parallel agents and chunked output for rpi-plan consumption"
category: "rpi-orchestration"
rpi_phase: "research"
context_budget_estimate: "50K tokens"
typical_context_usage: "25%"
parallel_agents: "3-5"
chunk_output: true
inter_phase_aware: true
prerequisites: []
outputs:
  - "Research document in .ai-context/research/active/[name]_research.md"
  - "Chunk manifest with 3-7 research chunks"
  - "File inventory with line references per chunk"
  - "Call chain diagrams per chunk"
  - "Dependency map per chunk"
  - "Inter-phase contract for rpi-plan"
next_commands: ["/rpi-plan"]
related_agents: ["context-engineer", "core-architect"]
examples:
  - command: "/rpi-research user-authentication"
    description: "Research authentication flow with parallel agents creating chunked output"
  - command: "/rpi-research payment-bug-fix"
    description: "Investigate payment processing issue across multiple chunks"
exit_criteria:
  - "Research document created in .ai-context/research/active/"
  - "Chunk manifest created with 3-7 chunks"
  - "All chunks marked as COMPLETE"
  - "All relevant files identified per chunk (3-20 files total)"
  - "Call chains traced with line numbers per chunk"
  - "Dependencies mapped per chunk"
  - "150-word summary generated"
  - "Inter-phase contract documented for rpi-plan"
---

# RPI Research Phase (Enhanced with Parallel Agents & Chunks)

**Purpose:** Systematic, zero-code-modification exploration using parallel agents that produce chunk-structured output for rpi-plan consumption

**Syntax:** `/rpi-research [feature-name]`

**Example:**
```bash
/rpi-research user-authentication
/rpi-research payment-bug-fix
```

---

## Key Innovation: Inter-Phase Awareness

RPI-Research **KNOWS** how RPI-Plan will consume its output:
- Output is structured into research chunks (CHUNK-R1, CHUNK-R2, etc.)
- Each chunk is self-contained with files, dependencies, and status
- RPI-Plan will create a CHUNK-Pn todolist per CHUNK-Rn
- Chunk manifest enables sequential processing by RPI-Plan

---

## Parallel Agent Strategy

Spawn 3-5 parallel Explore agents, each focused on a specific domain:

```
┌─────────────────────────────────────────────────────────┐
│ PARALLEL AGENT DISPATCH                                 │
├─────────────────────────────────────────────────────────┤
│ Agent 1: API/Route Entry Points        → CHUNK-R1      │
│ Agent 2: Business Logic & Models       → CHUNK-R2      │
│ Agent 3: Database/Storage Layer        → CHUNK-R3      │
│ Agent 4: External Integrations         → CHUNK-R4      │
│ Agent 5: Test Coverage Analysis        → CHUNK-R5      │
└─────────────────────────────────────────────────────────┘
```

---

## Execution Steps

### Step 1: Initialize Research Document
Create `.ai-context/research/active/[feature]_research.md` from RESEARCH_TEMPLATE.md

### Step 2: Spawn Parallel Agents (3-5 agents)

Each agent receives:
- Feature name and objective
- Assigned domain (API, Logic, DB, External, Tests)
- Required output format (chunk structure)
- Line number requirement for all file references

### Step 3: Aggregate Chunk Results

Collect outputs from all agents and structure into:
- Chunk Manifest (table of all chunks with status)
- Individual chunk sections with full details
- Inter-phase contract specifying rpi-plan expectations

### Step 4: Generate Summary

Create 150-word summary that:
- References key files from each chunk
- Provides overview of feature implementation
- Recommends approach for planning phase

### Step 5: Finalize Inter-Phase Contract

Document explicitly what RPI-Plan should expect:
```
EXPECTED_CONSUMER: rpi-plan
CHUNK_PROCESSING_ORDER: sequential (R1 → R2 → R3 → R4 → R5)
MARK_AS_PLANNED_WHEN: chunk todolist created
REQUIRED_OUTPUT: CHUNK-Pn per CHUNK-Rn
```

---

## Output Format

### Chunk Manifest (Required)
```markdown
| Chunk ID | Domain | Status | Files | Ready for Planning |
|----------|--------|--------|-------|-------------------|
| CHUNK-R1 | API/Routes | COMPLETE | 3 | ✅ |
| CHUNK-R2 | Business Logic | COMPLETE | 4 | ✅ |
...
```

---

## Context Budget

- Target: 25% of 200k (50k tokens)
- Per-agent budget: ~10k tokens each
- Compaction: After each agent returns
- Final: ~20k tokens (research doc only)

---

## Next Step

After completion: `/rpi-plan [feature-name]`

RPI-Plan will read chunk manifest and create CHUNK-Pn todolist per CHUNK-Rn
