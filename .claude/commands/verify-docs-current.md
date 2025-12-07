---
description: "Verify documentation accuracy against current code"
category: "validation"
context_budget_estimate: "20K tokens"
typical_context_usage: "10%"
---

# Verify Documentation Currency

**Purpose:** Validate that documentation matches current code

**Syntax:** `/verify-docs-current [file_path]`

**Example:**
```bash
/verify-docs-current src/services/payment.py
```

---

## What This Command Does

1. Look up modified file in CODE_TO_WORKFLOW_MAP.md
2. Find all workflows that document this file
3. For each workflow:
   - Extract [Line XXX] references
   - Read actual code at those lines
   - Verify function/logic still exists (±10 lines tolerance)
4. Check all markdown links resolve
5. Generate accuracy report

---

## Output Format

```
VERIFICATION REPORT

File: [path/to/file]
Affected Workflows: X

[workflow_1.md]:
  ✅ Line XXX (function_name) - Accurate
  ⚠️ Line YYY (other_func) - Shifted to line ZZZ
  ❌ Line AAA (deleted_func) - NOT FOUND

Links: X/Y valid (Z%)
Overall: HEALTHY / NEEDS UPDATE / STALE
```

---

## Actions Based on Result

| Status | Action Required |
|--------|-----------------|
| HEALTHY | No action needed |
| NEEDS UPDATE | Update line numbers |
| STALE | Re-document workflow section |

---

## When to Run

- After ANY code modification
- Before deploying
- Monthly as maintenance check
