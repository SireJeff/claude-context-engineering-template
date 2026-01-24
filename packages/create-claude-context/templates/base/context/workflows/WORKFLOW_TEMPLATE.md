# [Workflow Name] Workflow

**Last Updated:** YYYY-MM-DD
**Last Verified Against Code:** YYYY-MM-DD (commit: HASH)
**Complexity:** HIGH / MEDIUM / LOW
**Token Estimate:** ~XX,XXX tokens (X% of 200k context)

---

## Quick Navigation

- [Overview](#overview)
- [Entry Points](#entry-points)
- [Sub-Workflow 1: [Name]](#sub-workflow-1-name)
- [Sub-Workflow 2: [Name]](#sub-workflow-2-name)
- [Database Schema](#database-schema)
- [External APIs](#external-apis)
- [Test Coverage](#test-coverage)
- [Known Gotchas](#known-gotchas)
- [Complete Call Chain](#complete-call-chain)
- [File Reference Table](#file-reference-table)

---

## Overview

**User Journey:**
[Describe what the user experiences from start to finish]

**Key Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Business Logic Summary:**
[2-3 sentences explaining the core business rules]

---

## Entry Points

### Entry Point 1: [Name]

**File:** `path/to/file.ext` [Line XXX]
**Function:** `function_name()` [Lines XXX-YYY]
**Trigger:** [What triggers this entry point - API call, button click, scheduled job, etc.]

```
[Brief code snippet if helpful]
```

---

### Entry Point 2: [Name]

[Same structure as Entry Point 1...]

---

## Sub-Workflow 1: [Name]

**Purpose:** [What this sub-workflow accomplishes]
**Entry Point:** `file.ext:function_name()` [Line XXX]

### Call Chain

```
function_name() [file.ext:XXX]
├─ step_one() [file.ext:YYY]
│  ├─ helper_a() [helper.ext:ZZZ]
│  └─ helper_b() [helper.ext:AAA]
├─ step_two() [file.ext:BBB]
│  └─ database_query() [crud.ext:CCC]
└─ step_three() [file.ext:DDD]
   └─ external_api() [client.ext:EEE]
```

### Database Operations

| Operation | Table | Purpose |
|-----------|-------|---------|
| READ | `table_name` | [Why reading] |
| WRITE | `table_name` | [What writing] |
| UPDATE | `table_name` | [What updating] |

### External APIs

| API | Endpoint | Purpose |
|-----|----------|---------|
| [API Name] | `POST /endpoint` | [What it does] |

### Error Handling

| Error | Handling | Recovery |
|-------|----------|----------|
| [Error type] | [How handled] | [How to recover] |

---

## Sub-Workflow 2: [Name]

[Same structure as Sub-Workflow 1...]

---

## Database Schema

### Tables Involved

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `table_1` | [Purpose] | `field_a`, `field_b` |
| `table_2` | [Purpose] | `field_c`, `field_d` |

### Relationships

```
table_1 ─┬─< table_2 (one-to-many via foreign_key)
         └─< table_3 (one-to-many via other_key)
```

### Schema Notes

[Any important schema considerations, constraints, indexes, etc.]

---

## External APIs

### [API Name 1]

**Base URL:** `https://api.example.com`
**Authentication:** [Method - API Key, OAuth, etc.]
**Rate Limits:** [If applicable]

**Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/endpoint` | POST | [What it does] |

**Error Codes:**
| Code | Meaning | Handling |
|------|---------|----------|
| 400 | [Meaning] | [How handled] |
| 500 | [Meaning] | [How handled] |

---

## Test Coverage

### E2E Tests

| Test File | Test Name | Coverage |
|-----------|-----------|----------|
| `tests/e2e/test_file.ext` | `test_scenario` | Sub-workflows 1-3 |

### Unit Tests

| Test File | Coverage Area |
|-----------|---------------|
| `tests/unit/test_file.ext` | Function X, Function Y |

### Coverage Gaps

- ❌ [Missing test scenario 1]
- ❌ [Missing test scenario 2]
- ⚠️ [Edge case not covered]

### Running Tests

```bash
# Run all tests for this workflow
[test command]

# Run specific test
[specific test command]
```

---

## Known Gotchas

### Gotcha 1: [Title]

**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Symptom:** [What goes wrong]
**Root Cause:** [Why it happens]

**Fix:**
```
[Code or steps to fix]
```

**Prevention:**
- [How to avoid in future]

**Workflow Impact:** Sub-Workflow [X] is affected

---

### Gotcha 2: [Title]

[Same structure as Gotcha 1...]

---

## Complete Call Chain

### End-to-End Flow Diagram

```
[User Action / Trigger]
         │
         ▼
┌─────────────────────┐
│   Entry Point       │ file.ext:XXX
│   function_name()   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Sub-Workflow 1    │
│   [Name]            │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Sub-Workflow 2    │ ──► [External API]
│   [Name]            │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Database          │
│   Operations        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Response/         │
│   Completion        │
└─────────────────────┘
```

### State Transitions (if applicable)

```
[STATE_A] ──event──► [STATE_B] ──event──► [STATE_C]
     │                                        │
     └──────────── error ────────────────────►│
                                              ▼
                                         [STATE_ERROR]
```

---

## File Reference Table

| File | Size | Purpose | Key Functions |
|------|------|---------|---------------|
| `path/file_1.ext` | XX KB | [What it does] | `func_a:XXX`, `func_b:YYY` |
| `path/file_2.ext` | XX KB | [What it does] | `func_c:ZZZ` |
| `path/file_3.ext` | XX KB | [What it does] | `func_d:AAA` |

---

## Maintenance Schedule

| Task | Frequency | Last Done | Next Due |
|------|-----------|-----------|----------|
| Verify line numbers | Monthly | YYYY-MM-DD | YYYY-MM-DD |
| Full audit | Quarterly | YYYY-MM-DD | YYYY-MM-DD |

---

## Related Documentation

- **Parent Index:** [WORKFLOW_INDEX.md](../WORKFLOW_INDEX.md)
- **Related Workflows:** [workflow_2.md](./workflow_2.md)
- **Responsible Agent:** [agent-name.md](../../agents/agent-name.md)

---

## Change Log

| Date | Change | Commit |
|------|--------|--------|
| YYYY-MM-DD | Initial documentation | `hash` |

---

**Version:** 1.0
**Word Count:** ~XXX words
**Token Estimate:** ~XX,XXX tokens
