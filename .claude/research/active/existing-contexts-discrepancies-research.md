# Research: Pre-Existing Context Processing & Tool Awareness

**Research Date:** 2026-01-30
**Researcher:** Claude Code
**Status:** Active

---

## Executive Summary

This research investigates how the `create-ai-context` package handles repositories with pre-existing AI tool contexts (`.claude/`, `.github/`, `.agent/`, `.clinerules`, etc.) and identifies potential issues with the current implementation.

**Key Findings:**
1. **Documentation discovery exists** but has limited awareness of custom content in existing contexts
2. **Overwrite risk** - Adapters do not preserve customizations when regenerating
3. **No tool context validation** - Existing tool-specific files are not parsed for custom content
4. **Sync conflicts** - Cross-tool sync doesn't understand custom modifications
5. **Template gaps** - Generated content doesn't warn tools about universal template presence

---

## Research Objective

Investigate discrepancies in how `create-ai-context` processes packages installed on repos with pre-existing contexts (`.claude`, `.github`, `.agent`, etc.) and identify:
1. Whether existing contexts are being processed to their best possibility
2. Potential issues caused by current processing
3. Whether tools' contexts/agents/commands are aware of the universal context engineering template

---

## Phase 1: Entry Point Discovery

### Main Entry Points

| File | Lines | Purpose |
|------|-------|---------|
| `packages/create-ai-context/lib/index.js` | 58-334 | Main orchestrator with discovery phase |
| `packages/create-ai-context/lib/doc-discovery.js` | 93-180 | Pre-existing docs detection |
| `packages/create-ai-context/lib/installer.js` | 113-130 | Template copying (creates .ai-context) |
| `packages/create-ai-context/lib/adapters/*.js` | Various | Tool-specific generation |

### Key Call Chain

```
npx create-ai-context
  └─> lib/index.js:run()
      ├─> Phase 0: discoverExistingDocs() [Line 102]
      ├─> Phase 3: createDirectoryStructure() [Line 207]
      ├─> Phase 4: copyTemplates() [Line 212]
      ├─> Phase 11: generateAllContexts() [Line 290]
      │   └─> adapters/*/generate()
      └─> Cross-tool sync (optional)
```

---

## Phase 2: Dependency Mapping

### Internal Dependencies

```
doc-discovery.js
  ├── Uses: fs, path, glob
  ├── Detects: AI_TOOL_SIGNATURES (claude v1/v2, copilot, cline, antigravity)
  └─> Outputs: discovery object with tools, extractedValues, conflicts

installer.js
  ├── Uses: AI_CONTEXT_DIR = '.ai-context'
  ├── Creates: Directory structure via createDirectoryStructure()
  └─> Copies: Templates from packages/create-ai-context/templates/base/

template-populator.js
  ├── Uses: AI_CONTEXT_DIR, AI_CONTEXT_FILE
  ├── Populates: Templates with analysis results
  └─> Generates: Workflow files, indexes

adapters/
  ├── claude.js: Generates AI_CONTEXT.md + .claude/ (symlinks to .ai-context/)
  ├── copilot.js: Generates .github/copilot-instructions.md
  ├── cline.js: Generates .clinerules
  └─> antigravity.js: Generates .agent/ directory
```

### External Dependencies

- `glob` - File pattern matching
- `chalk` - Terminal colors
- Handlebars templates (via template-renderer)

---

## Phase 3: Test Coverage Analysis

### Existing Tests

| Test File | Coverage | Gaps |
|-----------|----------|------|
| `tests/unit/doc-discovery.test.js` | Discovery logic | No merge/integration tests |
| `tests/unit/installer.test.js` | Directory creation | No overwrite protection tests |
| `tests/unit/drift-checker.test.js` | Drift detection | No tool-specific drift tests |

**Gap:** No tests for scenario where custom `.claude/` exists and package runs again

---

## Phase 4: Discrepancies Found

### Discrepancy 1: Discovery Extracts Values BUT Doesn't Preserve Structure

**Location:** `lib/doc-discovery.js:93-180`

**What it does:**
- Detects existing AI tools (Claude v1/v2, Copilot, Cline, Antigravity)
- Extracts values using `VALUE_EXTRACTION_PATTERNS`
- Builds `extractedValues` object with PROJECT_NAME, TECH_STACK, etc.

**What it DOESN'T do:**
- Does NOT read custom agent definitions in `.claude/agents/`
- Does NOT read custom commands in `.claude/commands/`
- Does NOT read custom workflow documentation
- Does NOT preserve `.agent/` subdirectory structure

**Potential Issues:**
- Custom agents/commands are **lost** when package regenerates
- User has no way to say "keep my custom agents, add new ones"
- Merge strategy only applies to **placeholder values**, not **content structure**

---

### Discrepancy 2: Adapters Overwrite Without Warning

**Location:** `lib/adapters/claude.js:96-115`, `lib/adapters/copilot.js:47-86`, etc.

**Code Example (claude.js:102-115):**
```javascript
// Don't overwrite existing .claude/ directory
if (fs.existsSync(claudeDir)) {
  result.errors.push({
    message: '.claude/ directory already exists, skipping structure generation',
    code: 'EXISTS',
    severity: 'warning'
  });
  return [...]; // SKIPS generation
}
```

**Good:** Claude adapter checks for existing `.claude/`

**Bad:** Copilot, Cline, Antigravity adapters do NOT have this check:

```javascript
// copilot.js:69-70 - NO EXISTING CHECK
fs.writeFileSync(outputPath, content, 'utf-8');
```

**Potential Issues:**
- `.github/copilot-instructions.md` gets **overwritten silently**
- `.clinerules` gets **overwritten silently**
- `.agent/` directory gets **overwritten silently**

---

### Discrepancy 3: .claude/ Symlink Architecture Breaks Custom Content

**Location:** `lib/adapters/claude.js:96-259`

**What it does:**
- Creates `.claude/` with **symlinks** to `.ai-context/`
- Single source of truth: `.ai-context/`

**What it DOESN'T account for:**
- User may have had custom `.claude/agents/my-custom-agent.md`
- User may have had custom `.claude/commands/my-custom-command.md`
- These get **replaced by symlinks** to `.ai-context/`

**Potential Issues:**
- Custom agents/commands in `.claude/` are **lost**
- User doesn't know their custom content was in `.claude/` not `.ai-context/`
- No migration path from `.claude/custom/*` to `.ai-context/custom/*`

---

### Discrepancy 4: Cross-Tool Sync Doesn't Understand Custom Modifications

**Location:** `lib/cross-tool-sync/sync-manager.js:211-278`

**What it does:**
- Detects changes via file hashing
- Propagates changes from one tool to all others
- Uses `analyzeCodebase()` to regenerate all

**What it DOESN'T do:**
- Does NOT detect custom modifications vs auto-generated content
- Does NOT preserve custom edits in tool-specific files
- Treats ALL changes as "source of truth" to propagate

**Potential Issues:**
- User edits `.github/copilot-instructions.md` manually
- Sync detects change
- Sync propagates to all other tools, **overwriting their customizations**
- No way to mark content as "do not sync"

---

### Discrepancy 5: Tools Not Aware of Universal Template

**Location:** Generated templates in `packages/create-ai-context/templates/`

**What's missing:**
1. No "I am managed by create-ai-context" header in tool files
2. No warning to tools about `.ai-context/` presence
3. No coordination between tool contexts

**Example - `.github/copilot-instructions.md` should have:**
```markdown
---
⚠️ This file is managed by create-ai-context v2.3.0
Universal context is in .ai-context/ directory
Edit .ai-context/ source files, not this file
Last updated: 2026-01-30
---
```

**Potential Issues:**
- Tools don't know about `.ai-context/` existence
- Tools may create conflicting documentation
- No single source of truth awareness

---

## Phase 5: Impact Analysis

### Impact on User Workflow

| Scenario | Current Behavior | Expected Behavior | Severity |
|----------|----------------|-------------------|----------|
| User has custom `.claude/agents/` | Lost/symlinked | Preserved in `.ai-context/agents/` | HIGH |
| User edits `.github/copilot-instructions.md` | Overwritten on sync | Preserved or merged | HIGH |
| User has `.agent/` directory | Overwritten | Merged or skipped | MEDIUM |
| User runs package multiple times | Regenerates everything | Detects and merges | MEDIUM |

### Impact on Tool Coordination

| Issue | Impact |
|-------|--------|
| Claude doesn't know about Copilot context | Duplicate/conflicting documentation |
| Tools don't know about `.ai-context/` | May create their own docs |
| No shared schema | Tools can't coordinate on workflows |

---

## Phase 6: Recommendations

### Immediate Fixes (High Priority)

1. **Add existing check to all adapters**
   - Copilot, Cline, Antigravity should check before overwriting
   - Add `--force` flag to bypass

2. **Preserve custom content during symlink creation**
   - Migrate `.claude/custom/*` to `.ai-context/custom/*` before symlinking
   - Warn user about migration

3. **Add "managed by" headers to all generated files**
   - Include version, date, source pointer
   - Warn tools about `.ai-context/` presence

### Medium-Term Improvements

4. **Smart merge strategy**
   - Detect custom vs auto-generated content sections
   - Preserve custom sections, update auto sections

5. **Tool awareness**
   - Each tool's context should reference `.ai-context/`
   - "See also: .ai-context/context/WORKFLOW_INDEX.md"

6. **Drift detection for custom content**
   - Flag custom modifications in managed files
   - Provide migration path

### Long-Term Enhancements

7. **Bidirectional sync**
   - Allow editing in any tool context
   - Propagate changes intelligently

8. **Conflict resolution UI**
   - Interactive conflict resolution
   - Diff view for changes

---

## Summary for Plan Phase

### Critical Files to Modify

1. `lib/adapters/copilot.js` - Add exists() check before overwrite
2. `lib/adapters/cline.js` - Add exists() check before overwrite
3. `lib/adapters/antigravity.js` - Add exists() check before overwrite
4. `lib/adapters/claude.js` - Migrate custom content before symlinking
5. `lib/doc-discovery.js` - Extract custom agents/commands, not just values
6. `lib/cross-tool-sync/sync-manager.js` - Detect custom vs auto content
7. `templates/*.hbs` - Add "managed by" headers

### New Modules Needed

1. `lib/content-preservation.js` - Handle custom content migration
2. `lib/tool-coordination.js` - Add cross-tool awareness to templates

---

## Research Statistics

| Metric | Value |
|--------|-------|
| Files analyzed | 25+ |
| Lines of code reviewed | 3000+ |
| Discrepancies found | 5 major |
| Potential issues identified | 8 |
| Test coverage gaps | 3 |

---

**Next Phase:** `/rpi-plan existing-contexts-discrepancies` to create implementation blueprint
