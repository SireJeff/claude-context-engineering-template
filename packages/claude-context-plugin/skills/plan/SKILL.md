---
description: RPI Plan Phase - Create implementation blueprint with file:line precision
---

# Context Engineering: Plan Phase

When invoked, create a detailed implementation plan:

## Prerequisites
- Research document exists at `.claude/research/active/[feature]_research.md`
- If not found, run `/context-eng:research $ARGUMENTS` first

## Process

1. **Load Research Document**
   - Read the research document for $ARGUMENTS
   - Extract relevant files and line numbers

2. **Design Implementation**
   - For each change required:
     - Specify exact file and line numbers
     - Show current code snippet
     - Show proposed change
     - Assign risk level (LOW/MEDIUM/HIGH)

3. **Plan Test Strategy**
   - Identify which tests to run after each change
   - Note any new tests needed

4. **Document Rollback Plan**
   - Safe commit to revert to
   - Commands to undo changes

5. **Create Plan Document**
   - Save to `.claude/plans/active/[feature]_plan.md`
   - Include verification checklist

## Plan Format

```markdown
# Implementation Plan: [Feature]

## Files to Modify
| File | Lines | Change | Risk |
|------|-------|--------|------|

## Step-by-Step
### Step 1: [Action]
**File:** path/to/file.ext
**Lines:** X-Y
**Current:** [code block]
**Proposed:** [code block]
**Test:** [command]

## Rollback
- Safe commit: [hash]
- Command: git revert HEAD
```

## Context Budget
- Research doc: 20k tokens
- Plan creation: 15k tokens
- Total: 35k tokens (17.5%)

## Next Step
After approval, run `/context-eng:implement $ARGUMENTS`
