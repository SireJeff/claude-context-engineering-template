# Research: [Feature/Bug Name]

**Date:** YYYY-MM-DD
**Researcher:** Claude Code
**Status:** IN_PROGRESS | COMPLETE | BLOCKED
**Context Budget Used:** X% of 200k
**Total Chunks:** N
**Parallel Agents Used:** N (3 minimum, up to 5 for complex features)

---

## Objective

[Clear statement of what we're trying to understand - 1-2 sentences]

---

## Chunk Manifest

> **INTER-PHASE CONTRACT:** This manifest is designed for RPI-Plan consumption.
> RPI-Plan will process each chunk sequentially, creating a CHUNK-Pn todolist per CHUNK-Rn.

| Chunk ID | Domain | Status | Files | Ready for Planning |
|----------|--------|--------|-------|-------------------|
| CHUNK-R1 | API/Routes | COMPLETE | 3 | ✅ |
| CHUNK-R2 | Business Logic | COMPLETE | 4 | ✅ |
| CHUNK-R3 | Database/Storage | COMPLETE | 2 | ✅ |
| CHUNK-R4 | External Integrations | COMPLETE | 1 | ✅ |
| CHUNK-R5 | Test Coverage | COMPLETE | 3 | ✅ |

---

## CHUNK-R1: API/Routes

**Status:** FOUND | COMPLETE | PLANNED | IMPLEMENTED
**Parallel Agent:** Agent 1
**Ready for Planning:** Yes/No

### Files Explored

| File | Lines | Key Findings |
|------|-------|--------------|
| `path/to/route.ext` | XXX-YYY | [Entry point for feature] |
| `path/to/handler.ext` | XXX-YYY | [Request handling logic] |

### Code Flow Analysis

```
entry_function() [file.ext:XXX]
├─ validate_request() [file.ext:YYY]
└─ route_to_handler() [file.ext:ZZZ]
```

### Dependencies (This Chunk)
- **External:** [API Name]
- **Internal:** [service.ext]

---

## CHUNK-R2: Business Logic

**Status:** FOUND | COMPLETE | PLANNED | IMPLEMENTED
**Parallel Agent:** Agent 2
**Ready for Planning:** Yes/No

### Files Explored

| File | Lines | Key Findings |
|------|-------|--------------|
| `path/to/service.ext` | XXX-YYY | [Core business logic] |
| `path/to/model.ext` | XXX-YYY | [Data models] |

### Code Flow Analysis

```
process_request() [service.ext:XXX]
├─ validate_data() [service.ext:YYY]
├─ apply_rules() [rules.ext:ZZZ]
└─ persist_result() [model.ext:AAA]
```

### Dependencies (This Chunk)
- **External:** [None]
- **Internal:** [crud.ext, utils.ext]

---

## CHUNK-R3: Database/Storage

**Status:** FOUND | COMPLETE | PLANNED | IMPLEMENTED
**Parallel Agent:** Agent 3
**Ready for Planning:** Yes/No

### Files Explored

| File | Lines | Key Findings |
|------|-------|--------------|
| `path/to/crud.ext` | XXX-YYY | [Database operations] |
| `path/to/schema.ext` | XXX-YYY | [Schema definitions] |

### Database Schema Involved

| Table | Operations | Purpose |
|-------|------------|---------|
| `table_name` | READ/WRITE/UPDATE | [What data] |

### Dependencies (This Chunk)
- **External:** [Database driver]
- **Internal:** [config.ext]

---

## CHUNK-R4: External Integrations

**Status:** FOUND | COMPLETE | PLANNED | IMPLEMENTED
**Parallel Agent:** Agent 4
**Ready for Planning:** Yes/No

### Files Explored

| File | Lines | Key Findings |
|------|-------|--------------|
| `path/to/client.ext` | XXX-YYY | [External API client] |

### External Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| [API Name] | HTTP API | [What it does] |
| [Library] | Package | [What it provides] |

---

## CHUNK-R5: Test Coverage

**Status:** FOUND | COMPLETE | PLANNED | IMPLEMENTED
**Parallel Agent:** Agent 5
**Ready for Planning:** Yes/No

### Existing Tests

| Test File | Coverage Area |
|-----------|---------------|
| `tests/test_feature.ext` | [What scenarios] |

### Coverage Gaps
- ❌ [Missing test scenario 1]
- ❌ [Missing test scenario 2]
- ⚠️ [Edge case not covered]

---

## Known Gotchas

Check `.ai-context/context/KNOWN_GOTCHAS.md` for:
- [ ] Similar past issues
- [ ] Related workarounds
- [ ] Anti-patterns to avoid

**Found Gotchas:**
1. [Gotcha 1 if applicable]
2. [Gotcha 2 if applicable]

---

## Open Questions

### Technical Questions
- [ ] [Question about implementation detail]
- [ ] [Question about architecture choice]

### Business Logic Questions
- [ ] [Question about requirements]
- [ ] [Question about edge cases]

---

## Summary (for Plan Phase)

**Word Count Target: 150 words max**

[Feature/Bug Name] is implemented across [X] files in [system area], organized into [N] research chunks.

**Entry Points:**
- [Primary entry point with file:line]
- [Secondary entry point if applicable]

**Core Logic:**
[1-2 sentences describing what the feature does]

**Key Files by Chunk:**
1. CHUNK-R1 (API): [file_path:line]
2. CHUNK-R2 (Logic): [file_path:line]
3. CHUNK-R3 (DB): [file_path:line]

**Dependencies:**
- External: [API names]
- Internal: [Service names]

**Test Coverage:** [Good/Partial/Missing]

**Recommended Approach:**
[1 sentence on how to implement/fix]

**Known Risks:**
[1 sentence on primary risk]

---

## Inter-Phase Contract (RPI-Plan Consumption)

```
EXPECTED_CONSUMER: rpi-plan
CHUNK_PROCESSING_ORDER: sequential (R1 → R2 → R3 → R4 → R5)
MARK_AS_PLANNED_WHEN: chunk todolist created
REQUIRED_OUTPUT: CHUNK-Pn per CHUNK-Rn
STATUS_UPDATE_FIELD: "Status" in each chunk section
```

**What RPI-Plan Should Do:**
1. Read each CHUNK-Rn in order
2. Create corresponding CHUNK-Pn with todolist
3. Mark CHUNK-Rn status as `PLANNED`
4. Proceed to next chunk
5. Loop until all chunks are PLANNED

---

## Next Steps

After research completes:
1. ✅ Research document saved in `.ai-context/research/active/`
2. ✅ All chunks marked as COMPLETE
3. ⏳ Run `/rpi-plan [feature-name]` to create implementation plan
4. ⏳ RPI-Plan will process chunks and create todolists
5. ⏳ Human reviews plan before `/rpi-implement`

---

**Context Usage Report:**
- Files read: X
- Tokens used: ~Xk (X% of 200k)
- Parallel agents spawned: 3-5
- Chunks created: N
- Compaction needed: Yes/No
