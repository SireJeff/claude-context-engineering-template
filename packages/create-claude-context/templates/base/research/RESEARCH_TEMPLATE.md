# Research: [Feature/Bug Name]

**Date:** YYYY-MM-DD
**Researcher:** Claude Code
**Status:** IN_PROGRESS | COMPLETE | BLOCKED
**Context Budget Used:** X% of 200k

---

## Objective

[Clear statement of what we're trying to understand - 1-2 sentences]

---

## Relevant Files Explored

| File | Lines | Key Findings |
|------|-------|--------------|
| `path/to/file.ext` | XXX-YYY | [What this file does for the feature] |
| `path/to/other.ext` | XXX-YYY | [What this file does for the feature] |

---

## Code Flow Analysis

**Entry Point → Exit Point Trace:**

```
entry_function() [file.ext:XXX]
├─ step_one() [file.ext:YYY]
│  └─ helper_function() [helper.ext:ZZZ]
├─ step_two() [file.ext:AAA]
│  ├─ database_query() [crud.ext:BBB]
│  └─ external_api_call() [client.ext:CCC]
└─ return_result() [file.ext:DDD]
```

**Decision Points:**
- Line XXX: Condition check (if/else)
- Line YYY: Type routing (switch/match)
- Line ZZZ: Error handling (try/except)

---

## Dependencies Identified

### External Dependencies
| Dependency | Type | Purpose |
|------------|------|---------|
| [API Name] | HTTP API | [What it does] |
| [Library] | Package | [What it provides] |

### Internal Dependencies
| File | Purpose |
|------|---------|
| `service.ext` | [What it provides to this feature] |
| `utils.ext` | [What utilities are used] |

---

## Database Schema Involved

| Table | Operations | Purpose |
|-------|------------|---------|
| `table_name` | READ/WRITE/UPDATE | [What data] |

---

## Test Files & Coverage

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

Check `.claude/context/KNOWN_GOTCHAS.md` for:
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

[Feature/Bug Name] is implemented across [X] files in [system area].

**Entry Points:**
- [Primary entry point with file:line]
- [Secondary entry point if applicable]

**Core Logic:**
[1-2 sentences describing what the feature does]

**Key Files:**
1. [file_path] - [role in feature]
2. [file_path] - [role in feature]
3. [file_path] - [role in feature]

**Dependencies:**
- External: [API names]
- Internal: [Service names]

**Test Coverage:** [Good/Partial/Missing]

**Recommended Approach:**
[1 sentence on how to implement/fix]

**Known Risks:**
[1 sentence on primary risk]

---

## Next Steps

After research completes:
1. ✅ Research document saved in `.claude/research/active/`
2. ⏳ Run `/rpi-plan [feature-name]` to create implementation plan
3. ⏳ Human reviews plan before `/rpi-implement`

---

**Context Usage Report:**
- Files read: X
- Tokens used: ~Xk (X% of 200k)
- Compaction needed: Yes/No
