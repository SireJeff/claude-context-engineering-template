---
name: auto-sync
description: Automatically synchronize documentation with code
version: 1.0.0
category: sync
context_budget: 15000
outputs:
  - context/CODE_TO_WORKFLOW_MAP.md (regenerated)
  - sync/anchors.json (updated)
  - sync/hashes.json (updated)
  - sync/staleness.json (updated)
---

# /auto-sync

Automatically synchronize all documentation with the current code state.

## Syntax

```
/auto-sync [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--check` | Check for drift without making changes |
| `--fix` | Auto-fix shifted line numbers and anchors |
| `--rebuild-map` | Force rebuild CODE_TO_WORKFLOW_MAP |
| `--update-hashes` | Update file content hashes |
| `--report` | Generate detailed drift report |
| `--dry-run` | Preview changes without writing |

## What It Does

1. **Scans Workflows** - Extracts all file:line references from documentation
2. **Resolves Anchors** - Converts semantic anchors to current line numbers
3. **Detects Drift** - Compares documented references with actual code
4. **Updates Tracking** - Refreshes hashes and staleness timestamps
5. **Regenerates Map** - Rebuilds CODE_TO_WORKFLOW_MAP.md

## Examples

### Check for Drift
```
/auto-sync --check
```

Output:
```
DRIFT CHECK REPORT

Workflows Checked: 8
  ✓ authentication.md - HEALTHY
  ⚠ user-management.md - NEEDS UPDATE (3 line shifts)
  ✗ payment.md - STALE (file deleted)

Summary:
  Healthy: 6
  Needs Update: 1
  Stale: 1
```

### Auto-Fix Issues
```
/auto-sync --fix
```
Automatically updates line numbers that have shifted.

### Full Rebuild
```
/auto-sync --rebuild-map
```
Regenerates CODE_TO_WORKFLOW_MAP.md from scratch.

## Drift Levels

| Level | Meaning | Action |
|-------|---------|--------|
| HEALTHY | Documentation matches code | None needed |
| LOW | Line numbers shifted slightly | Auto-fixable |
| MEDIUM | Function moved or renamed | Review required |
| HIGH | Logic changed significantly | Manual update needed |
| CRITICAL | File deleted or major restructure | Full re-documentation |

## Integration

### With Git Hooks
The pre-commit hook can run `--check` automatically:
```bash
npx claude-context hooks install
```

### With CI/CD
Add to your pipeline:
```yaml
- name: Check documentation drift
  run: npx claude-context sync --check --strict
```

## Process

```
1. Load workflow files from context/workflows/

2. For each workflow:
   a. Extract file:line references
   b. Extract semantic anchors (file::function())
   c. Resolve current locations
   d. Compare with documented locations

3. Generate drift report

4. If --fix:
   a. Update shifted line numbers
   b. Update broken anchors where possible
   c. Flag unfixable issues

5. If --rebuild-map:
   a. Scan all workflows for references
   b. Build reverse index
   c. Write CODE_TO_WORKFLOW_MAP.md

6. Update tracking files:
   - sync/hashes.json
   - sync/staleness.json
   - sync/anchors.json
```

## Output Files

### CODE_TO_WORKFLOW_MAP.md
```markdown
## File Mappings

### src/auth.py

**Documented In:**
- workflows/authentication.md
- workflows/session.md

**Update After Changing:**
- [ ] authentication.md (lines 45, 78, 120)
- [ ] session.md (line 33)
```

### sync/staleness.json
```json
{
  "workflows": {
    "authentication.md": {
      "lastVerified": "2025-01-24T10:30:00Z",
      "status": "verified"
    }
  }
}
```

## Related Commands

- `/verify-docs-current [file]` - Check specific file
- `/validate-all` - Full validation suite
- `/session-save` - Save session state

## CLI Equivalent

```bash
npx claude-context sync --check
npx claude-context sync --fix
npx claude-context generate --code-map
```
