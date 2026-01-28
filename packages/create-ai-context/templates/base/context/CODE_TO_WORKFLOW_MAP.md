# Code to Workflow Map

**Purpose:** Reverse index - Given a code file, find which workflows document it
**Use:** After modifying any file, look up what documentation needs updating
**Last Updated:** {{DATE}}

---

## How to Use This File

1. **Modified a file?** Search for it below
2. **Find "Documented In" section** for affected workflows
3. **Check "Update After Changing" section** for required updates
4. **Run `/verify-docs-current [file]`** to validate

---

## File → Workflow Mapping

### {{DIRECTORY_1}}/

#### `{{FILE_1}}` [XXX lines]

**Documented In:**
- [workflows/workflow_1.md](./workflows/workflow_1.md) - Section 2
- [workflows/workflow_2.md](./workflows/workflow_2.md) - Section 4

**Update After Changing:**
- Workflow: workflow_1.md (if [specific thing] changes)
- Agent: agent_name.md (if [capability] changes)
- AI_CONTEXT.md (if [architecture] changes)

---

#### `{{FILE_2}}` [XXX lines]

**Documented In:**
- [workflows/workflow_3.md](./workflows/workflow_3.md) - Complete file

**Update After Changing:**
- Workflow: workflow_3.md (always)

---

### {{DIRECTORY_2}}/

[Same structure for each directory...]

---

## Files NOT Currently Documented

These files exist but are not yet in any workflow:

| File | Reason | Priority |
|------|--------|----------|
| `path/file.ext` | [Why not documented] | LOW/MED/HIGH |

---

## Documentation Update Checklist

After ANY code change:

1. [ ] Find modified file in this map
2. [ ] Check all "Documented In" workflows
3. [ ] Update line numbers if code moved
4. [ ] Update function signatures if changed
5. [ ] Update business logic descriptions if changed
6. [ ] Run `/verify-docs-current [file]`
7. [ ] Commit documentation updates with code

---

## Automation

### Quick Lookup Command

```bash
# Find what documents a specific file
grep -l "path/to/file" .ai-context/context/workflows/*.md
```

### Validation Command

```bash
/verify-docs-current path/to/modified/file.ext
```

---

**Version:** 1.0
**Files Tracked:** {{FILES_COUNT}}
**Workflows Linked:** {{WORKFLOWS_COUNT}}
