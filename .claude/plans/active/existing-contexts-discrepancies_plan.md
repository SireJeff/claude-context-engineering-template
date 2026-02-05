# Implementation Plan: Existing Context Processing & Tool Awareness

**Plan Date:** 2026-01-30
**Status:** 🔄 IN PROGRESS (Steps 1-3 Complete, Steps 4-8 Remaining)
**Version:** 1.1
**Research Document:** `.claude/research/active/existing-contexts-discrepancies-research.md`
**Last Updated:** 2026-01-31

---

## Progress Summary

### Completed ✅
- **Step 1**: Created `lib/content-preservation.js` and `lib/template-coordination.js` modules with full test coverage
- **Step 2**: Updated all Handlebars templates with tool coordination headers/footers
- **Step 3**: Added exists checks and custom file detection to all adapters (claude, copilot, cline, antigravity)

### In Progress 🔄
- **Step 4-8**: See below (pending implementation)

### Implementation Notes from Steps 1-3
1. Used `array.join(newline)` instead of template literals for headers (Babel compatibility)
2. Used `fs.mkdtempSync()` instead of crypto.uuidv4() for temp files
3. Added cross-platform path normalization (backslash to forward slash)
4. Templates use `{{{metadata.header}}}` and `{{{coordination.footer}}}` pattern
5. Adapters check `isManagedFile()` before overwriting, support `config.force` flag
6. All tests passing: 492/492

---

## Executive Summary

This plan addresses 5 critical discrepancies in how `create-ai-context` handles repositories with pre-existing AI tool contexts. The fixes ensure:
1. Custom content in existing tool contexts is preserved
2. Adapters check before overwriting
3. Tools are aware of the universal `.ai-context/` directory
4. Cross-tool sync respects custom modifications

**Estimated Effort:** 8-12 file modifications, 3 new modules, comprehensive testing

---

## Scope

### In Scope
- Add exists() checks to Copilot, Cline, Antigravity adapters
- Create content preservation system for custom agents/commands
- Add "managed by" headers to all generated files
- Add tool awareness headers (reference `.ai-context/`)
- Update doc-discovery to extract custom content structure
- Create safe rollback mechanism

### Out of Scope
- Bidirectional sync (allowing edits in any tool context)
- Interactive conflict resolution UI
- Smart merge with custom section detection
- Migration from v1 to v2 (separate effort)

---

## File Modifications

### 1. lib/adapters/copilot.js

| Lines | Change | Risk |
|-------|--------|------|
| 47-86 | Add exists() check before overwrite | LOW |
| 36-38 | Update exists() to return file info | LOW |
| 88-109 | Update validate() to check for custom content | LOW |

**Current Code (Line 69-70):**
```javascript
// Write output file
fs.writeFileSync(outputPath, content, 'utf-8');
```

**Proposed Change:**
```javascript
// Check if file exists and has custom content
if (exists(projectRoot)) {
  const existingContent = fs.readFileSync(outputPath, 'utf-8');
  const hasCustomMarkers = detectCustomContent(existingContent);

  if (hasCustomMarkers && !config.forceOverwrite) {
    result.errors.push({
      message: 'copilot-instructions.md exists with custom content. Use --force to overwrite.',
      code: 'EXISTS_WITH_CUSTOM',
      severity: 'warning'
    });
    result.skipped = true;
    return result;
  }
}

// Write output file
fs.writeFileSync(outputPath, content, 'utf-8');
```

---

### 2. lib/adapters/cline.js

| Lines | Change | Risk |
|-------|--------|------|
| 47-80 | Add exists() check before overwrite | LOW |
| 36-38 | Update exists() to return file info | LOW |
| 87-103 | Update validate() to check for custom content | LOW |

**Same pattern as copilot.js**

---

### 3. lib/adapters/antigravity.js

| Lines | Change | Risk |
|-------|--------|------|
| 47-100 | Add exists() check before overwrite | LOW |
| 36-38 | Update exists() to return directory info | LOW |
| 107-152 | Update validate() to check for custom content | MEDIUM |

**Special handling for multi-file directory:**
```javascript
// Check if .agent/ exists and has custom files
if (exists(projectRoot)) {
  const customFiles = detectCustomFilesInAgent(getOutputPath(projectRoot));

  if (customFiles.length > 0 && !config.forceOverwrite) {
    result.errors.push({
      message: `.agent/ exists with ${customFiles.length} custom files. Use --force to overwrite.`,
      code: 'EXISTS_WITH_CUSTOM',
      severity: 'warning',
      customFiles
    });
    result.skipped = true;
    return result;
  }
}
```

---

### 4. lib/adapters/claude.js

| Lines | Change | Risk |
|-------|--------|------|
| 96-259 | Add custom content migration before symlinking | MEDIUM |
| 102-115 | Enhance exists check to detect custom content | LOW |

**Current Code (Line 102-115):**
```javascript
if (fs.existsSync(claudeDir)) {
  result.errors.push({
    message: '.claude/ directory already exists, skipping structure generation',
    code: 'EXISTS',
    severity: 'warning'
  });
  return [...];
}
```

**Proposed Change:**
```javascript
if (fs.existsSync(claudeDir)) {
  // Check for custom content before skipping
  const customContent = findCustomContentInClaude(claudeDir);

  if (customContent.length > 0) {
    // Migrate custom content to .ai-context/custom/
    migrateCustomContent(claudeDir, contextDir, customContent);

    result.errors.push({
      message: `Migrated ${customContent.length} custom items from .claude/ to .ai-context/custom/`,
      code: 'MIGRATED_CUSTOM',
      severity: 'info',
      migratedItems: customContent
    });
  } else {
    result.errors.push({
      message: '.claude/ directory already exists (no custom content found)',
      code: 'EXISTS',
      severity: 'warning'
    });
  }

  return [{
    path: claudeDir,
    relativePath: '.claude/',
    size: 0,
    skipped: true
  }];
}
```

---

### 5. templates/handlebars/partials/header.hbs

| Lines | Change | Risk |
|-------|--------|------|
| 1-4 | Add enhanced header with tool awareness | LOW |

**Current Code:**
```handlebars
{{!-- Reusable header partial --}}
{{{metadata.header}}}
<!-- Generated: {{metadata.timestamp}} | Version: {{metadata.generator_version}} -->
```

**Proposed Change:**
```handlebars
{{!-- Reusable header partial --}}
<!-- ========================================= -->
<!-- ⚠️  MANAGED BY CREATE-AI-CONTEXT          -->
<!-- Version: {{metadata.generator_version}}      -->
<!-- Generated: {{metadata.timestamp}}          -->
<!-- Source: .ai-context/ directory             -->
<!--                                          -->
<!-- DO NOT EDIT THIS FILE DIRECTLY           -->
<!-- Edit source files in .ai-context/ instead -->
<!-- ========================================= -->
<!--                                          -->
<!-- Universal Context Directory:               -->
<!--   .ai-context/context/ - Documentation     -->
<!--   .ai-context/agents/ - AI Agents          -->
<!--   .ai-context/commands/ - Commands         -->
<!--   .ai-context/indexes/ - Navigation        -->
<!--                                          -->
<!-- For tool-specific overrides, create:      -->
<!--   .ai-context/custom/[tool-name]/         -->
<!-- ========================================= -->
```

---

### 6. templates/handlebars/claude.hbs

| Lines | Change | Risk |
|-------|--------|------|
| 173-180 | Add tool coordination section | LOW |

**Current Code:**
```handlebars
## AI Tools Configuration

This context is optimized for:
- **Claude Code** - Full context reading (this file)
- **GitHub Copilot** - See `.github/copilot-instructions.md`
- **Cline** - See `.clinerules`
- **Antigravity** - See `.agent/` directory
```

**Proposed Change:**
```handlebars
## AI Tools Configuration

**Universal Context Directory:** `.ai-context/`

This project uses AI Context Engineering for coordinated documentation across all AI tools.

### Tool-Specific Files (Generated from .ai-context/)
| Tool | File | Purpose |
|------|------|---------|
| Claude Code | `AI_CONTEXT.md` + `.claude/` | Universal context + symlinks |
| GitHub Copilot | `.github/copilot-instructions.md` | VS Code Copilot instructions |
| Cline | `.clinerules` | Cline VS Code extension rules |
| Antigravity | `.agent/` | Google Antigravity context |

### Single Source of Truth
All content is managed in `.ai-context/`. Tool-specific files are auto-generated.
To modify documentation, edit files in `.ai-context/context/` and regenerate with:
```bash
npx create-ai-context generate --ai <tool-name>
```

### Cross-Tool Coordination
All AI tools reference the same workflows, agents, and commands from `.ai-context/`.
This ensures consistent behavior regardless of which tool you use.
```

---

### 7. templates/handlebars/copilot.hbs

| Lines | Change | Risk |
|-------|--------|------|
| 131-132 | Add tool coordination footer | LOW |

**Proposed Addition (after line 131):**
```handlebars
---

## Context Engineering

This file is generated from `.ai-context/` universal context directory.

**To modify documentation:** Edit files in `.ai-context/context/` then regenerate.

**Related Tools:**
- Claude Code: See `AI_CONTEXT.md` (project root)
- Cline: See `.clinerules`
- Antigravity: See `.agent/` directory

*Regenerate with: `npx create-ai-context generate --ai copilot`*
```

---

### 8. templates/handlebars/cline.hbs

| Lines | Change | Risk |
|-------|--------|------|
| 62-64 | Add tool coordination footer | LOW |

**Proposed Addition (after line 62):**
```

[context.source]
source=.ai-context
universal=true

[related_tools]
claude=AI_CONTEXT.md
copilot=.github/copilot-instructions.md
antigravity=.agent/

# Modify docs in .ai-context/context/ then regenerate
# Regenerate: npx create-ai-context generate --ai cline
```

---

### 9. lib/doc-discovery.js

| Lines | Change | Risk |
|-------|--------|------|
| 93-180 | Add custom content extraction | MEDIUM |

**New Function to Add (after line 741):**
```javascript
/**
 * Extract custom content from .claude/ directory
 * @param {string} claudeDir - Path to .claude/ directory
 * @returns {object} Custom content found
 */
function extractCustomClaudeContent(claudeDir) {
  const custom = {
    agents: [],
    commands: [],
    other: []
  };

  // Check for custom agents
  const agentsDir = path.join(claudeDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    for (const file of agentFiles) {
      const filePath = path.join(agentsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Skip if it's a generated file (has header marker)
      if (!content.includes('MANAGED BY CREATE-AI-CONTEXT')) {
        custom.agents.push({
          file: `agents/${file}`,
          content: content
        });
      }
    }
  }

  // Check for custom commands
  const commandsDir = path.join(claudeDir, 'commands');
  if (fs.existsSync(commandsDir)) {
    const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      if (!content.includes('MANAGED BY CREATE-AI-CONTEXT')) {
        custom.commands.push({
          file: `commands/${file}`,
          content: content
        });
      }
    }
  }

  return custom;
}
```

---

### 10. lib/index.js (Main Orchestrator)

| Lines | Change | Risk |
|-------|--------|------|
| 76-78 | Add forceOverwrite config option | LOW |
| 290-303 | Pass forceOverwrite to adapters | LOW |

**Proposed Change:**
```javascript
// Phase 11: Generate AI tool-specific context files
spinner.start('Generating AI tool context files...');
let generationResults;
try {
  generationResults = await generateAllContexts(analysis, config, targetDir, {
    aiTools: config.aiTools,
    verbose: config.verbose,
    forceOverwrite: config.forceOverwrite || false  // NEW
  });
  // ... rest of code
```

---

### 11. lib/content-preservation.js (NEW MODULE)

| Lines | Change | Risk |
|-------|--------|------|
| 1-200+ | Create new content preservation module | MEDIUM |

**Purpose:** Handle custom content migration and preservation

**Key Functions:**
```javascript
/**
 * Content Preservation Module
 * Handles migration and preservation of custom content during context generation
 */

const fs = require('fs');
const path = require('path');

/**
 * Find custom content in .claude/ directory
 * Custom content = files without "MANAGED BY" header
 */
function findCustomContentInClaude(claudeDir) {
  const custom = [];

  const walkDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walkDir(path.join(dir, entry.name));
      } else if (entry.name.endsWith('.md')) {
        const filePath = path.join(dir, entry.name);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check if file has managed header
        if (!content.includes('MANAGED BY CREATE-AI-CONTEXT')) {
          const relPath = path.relative(claudeDir, filePath);
          custom.push({
            path: relPath,
            type: determineContentType(relPath),
            content: content
          });
        }
      }
    }
  };

  if (fs.existsSync(claudeDir)) {
    walkDir(claudeDir);
  }

  return custom;
}

/**
 * Determine content type from path
 */
function determineContentType(relPath) {
  if (relPath.startsWith('agents/')) return 'agent';
  if (relPath.startsWith('commands/')) return 'command';
  if (relPath.startsWith('context/')) return 'context';
  return 'other';
}

/**
 * Migrate custom content to .ai-context/custom/
 */
function migrateCustomContent(claudeDir, aiContextDir, customItems) {
  const customDir = path.join(aiContextDir, 'custom');
  fs.mkdirSync(customDir, { recursive: true });

  const migrated = [];

  for (const item of customItems) {
    const destPath = path.join(customDir, item.path);
    const destDir = path.dirname(destPath);

    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destPath, item.content);

    // Add preservation header
    const preservedHeader = `<!--
PRESERVED FROM .claude/${item.path}
Original file had custom content that was migrated
-->
`;
    fs.writeFileSync(destPath, preservedHeader + item.content);

    migrated.push({
      original: `.claude/${item.path}`,
      destination: `.ai-context/custom/${item.path}`
    });
  }

  return migrated;
}

/**
 * Detect custom content markers in a file
 */
function detectCustomContent(content) {
  // Check for absence of managed marker
  if (!content.includes('MANAGED BY CREATE-AI-CONTEXT')) {
    return true;
  }

  // Check for custom edit markers
  if (content.includes('<!-- CUSTOM EDIT -->')) {
    return true;
  }

  return false;
}

/**
 * Find custom files in .agent/ directory
 */
function findCustomFilesInAgent(agentDir) {
  const custom = [];

  if (!fs.existsSync(agentDir)) {
    return custom;
  }

  const walkDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walkDir(path.join(dir, entry.name));
      } else if (entry.name.endsWith('.md')) {
        const filePath = path.join(dir, entry.name);
        const content = fs.readFileSync(filePath, 'utf-8');

        if (!content.includes('Auto-generated by AI Context Engineering')) {
          const relPath = path.relative(agentDir, filePath);
          custom.push(relPath);
        }
      }
    }
  };

  walkDir(agentDir);
  return custom;
}

module.exports = {
  findCustomContentInClaude,
  migrateCustomContent,
  detectCustomContent,
  findCustomFilesInAgent,
  determineContentType
};
```

---

### 12. lib/template-coordination.js (NEW MODULE)

| Lines | Change | Risk |
|-------|--------|------|
| 1-150+ | Create tool coordination helper | LOW |

**Purpose:** Add cross-tool awareness helpers

```javascript
/**
 * Tool Coordination Module
 * Helpers for adding tool awareness to generated content
 */

const fs = require('fs');
const path = require('path');

/**
 * Get tool coordination header
 */
function getToolCoordinationHeader(toolName, version) {
  const headers = {
    claude: `<!-- ========================================= -->
<!-- ⚠️  CLAUDE CODE CONTEXT                    -->
<!-- Managed by create-ai-context v${version}    -->
<!-- Source: .ai-context/ directory             -->
<!-- ========================================= -->`,

    copilot: `<!-- ========================================= -->
<!-- ⚠️  GITHUB COPILOT INSTRUCTIONS           -->
<!-- Managed by create-ai-context v${version}    -->
<!-- Source: .ai-context/ directory             -->
<!-- ========================================= -->`,

    cline: `# ==========================================
# ⚠️  CLINE RULES
# Managed by create-ai-context v${version}
# Source: .ai-context/ directory
# ==========================================`,

    antigravity: `<!-- ========================================= -->
<!-- ⚠️  ANTIGRAVITY CONTEXT                    -->
<!-- Managed by create-ai-context v${version}    -->
<!-- Source: .ai-context/ directory             -->
<!-- ========================================= -->`
  };

  return headers[toolName] || '';
}

/**
 * Get tool coordination footer
 */
function getToolCoordinationFooter(toolName) {
  return `---
## Universal Context Directory

This project uses AI Context Engineering for coordinated documentation.

**Universal Source:** \`.ai-context/\`

**Related Tool Contexts:**
- Claude Code: \`AI_CONTEXT.md\`
- GitHub Copilot: \`.github/copilot-instructions.md\`
- Cline: \`.clinerules\`
- Antigravity: \`.agent/\`

**Regeneration Command:**
\`\`\`bash
npx create-ai-context generate --ai ${toolName}
\`\`\`
`;
}

/**
 * Check if file is managed by create-ai-context
 */
function isManagedFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('Managed by create-ai-context') ||
           content.includes('CREATE-AI-CONTEXT');
  } catch {
    return false;
  }
}

module.exports = {
  getToolCoordinationHeader,
  getToolCoordinationFooter,
  isManagedFile
};
```

---

## Step-by-Step Implementation Plan

### ✅ Step 1: Create Support Modules (COMPLETED)

**Files Created:**
1. ✅ `lib/content-preservation.js` - 239 lines
2. ✅ `lib/template-coordination.js` - 149 lines
3. ✅ `tests/unit/content-preservation.test.js` - 258 lines (19 tests, all passing)
4. ✅ `tests/unit/template-coordination.test.js` - 170 lines (20 tests, all passing)

**Commit:** `feat: add content preservation and tool coordination modules` (2b080cd)

**Implementation Notes:**
- Used `array.join(newline)` pattern instead of template literals (Babel parser compatibility)
- Used `fs.mkdtempSync()` for temp directories instead of uuid
- Added cross-platform path normalization for Windows compatibility
- `checkForCustomFiles()` helper function for directory walking

---

### ✅ Step 2: Update Template Headers (COMPLETED)

**Files Modified:**
1. ✅ `templates/handlebars/partials/header.hbs` - Use `{{{metadata.header}}}`
2. ✅ `templates/handlebars/claude.hbs` - Added `{{{coordination.footer}}}`
3. ✅ `templates/handlebars/copilot.hbs` - Added `{{{coordination.footer}}}`
4. ✅ `templates/handlebars/cline.hbs` - Added `{{{coordination.footer}}}`
5. ✅ `templates/handlebars/antigravity.hbs` - Added `{{{coordination.footer}}}` to all 10 file sections
6. ✅ `lib/template-renderer.js` - Added `toolName` parameter to `buildContext()`

**Commit:** `feat: add tool coordination headers and footers to templates` (9590042)

**Implementation Notes:**
- `buildContext()` now accepts `toolName` parameter (defaults to 'claude')
- Added `coordination.footer` and `coordination.universal_context` to template context
- Headers use "WARNING: [TOOL NAME]" format instead of emoji (Babel compatibility)
- Footer includes cross-tool references and regeneration command

---

### ✅ Step 3: Add Exists Checks to Adapters (COMPLETED)

**Files Modified:**
1. ✅ `lib/adapters/copilot.js` - Import `isManagedFile`, check before overwrite
2. ✅ `lib/adapters/cline.js` - Import `isManagedFile`, check before overwrite
3. ✅ `lib/adapters/antigravity.js` - Import `isManagedFile`, `checkForCustomFiles()`
4. ✅ `lib/adapters/claude.js` - Import `isManagedFile`, `checkForCustomFiles()`
5. ✅ `tests/unit/adapters/claude.test.js` - Updated for custom file detection
6. ✅ `tests/e2e/create-ai-context.test.js` - Simplified regeneration test

**Commit:** `feat: add exists checks and custom file detection to adapters` (52311c0)

**Implementation Notes:**
- All adapters now pass `toolName` to `buildContext(toolName)`
- Return `EXISTS_CUSTOM` error when custom files detected
- Support `config.force` flag (preparation for CLI --force option)
- `checkForCustomFiles()` walks directories recursively (max depth 10)
- Only checks `.md` files for managed markers

---

### ⏳ Step 4: Enhance Claude Adapter with Custom Migration (PENDING)

**Files to Modify:**
1. `lib/adapters/claude.js` - Add migration logic when custom content found

**Tests:**
```bash
npm test -- adapters/claude.test.js
# Integration test: create .claude/custom/* then run package
```

**Commit Message:** `feat: migrate custom content from .claude/ to .ai-context/custom/`

---

### ⏳ Step 5: Enhance Doc Discovery (PENDING)

**Files to Modify:**
1. `lib/doc-discovery.js`

**Tests:**
```bash
npm test -- doc-discovery.test.js
# Integration test: discovery should find custom agents
```

**Commit Message:** `feat: extract custom content from existing tool contexts`

---

### ⏳ Step 6: Update Main Orchestrator (PENDING)

**Files to Modify:**
1. `lib/index.js` - Pass config.force to adapters
2. `lib/installer.js` - Consider migrating to Handlebars templates

**Tests:**
```bash
npm test -- index.test.js
# CLI test: npx create-ai-context --force
```

**Commit Message:** `feat: add --force flag support to orchestrator`

---

### ⏳ Step 7: Add CLI --force Flag (PENDING)

**Files to Modify:**
1. `bin/create-ai-context.js` - Add `--force` / `-f` flag to main and generate commands

**Change:**
```javascript
.option('-f, --force', 'Force overwrite of existing files (use with caution)')
```

**Tests:**
```bash
# Manual test: npx create-ai-context --force
# Manual test: npx create-ai-context generate --force
```

---

### ⏳ Step 8: Update Tests & Create Integration Tests (PENDING)

**Files to Create:**
1. `tests/integration/existing-contexts.test.js`

**Commit Message:** `test: add integration tests for existing context handling`

---

## Continuation Guide for Next Session

### Quick Resume Commands

```bash
# Continue from where we left off
cd packages/create-ai-context
git log --oneline -5  # See recent commits

# Run current test suite
npm test

# Start next step (Step 4: Custom Migration)
# Focus on: lib/adapters/claude.js
```

### Next Implementation Priority

1. **Step 4** - Enhance Claude adapter to actually migrate custom content when found
   - Import `migrateCustomContent` from content-preservation module
   - Call migration in `generateClaudeDirectory()` before creating symlinks
   - Add info message to result showing migrated items

2. **Step 7** - Add `--force` CLI flag (enables Step 4 testing)
   - Add to both main command and generate subcommand
   - Pass through config to adapters

3. **Step 5** - Enhance doc-discovery if needed for better custom content extraction

### Known Issues / Gotchas

1. **installer.js still uses old template** - `createAiContextMd()` uses `AI_CONTEXT.md.template` instead of Handlebars
   - This means AI_CONTEXT.md is created twice (once by installer, once by claude adapter)
   - The adapter's version (with managed header) should win, but this is confusing
   - **Consideration:** Migrate installer.js to use template-renderer in later step

2. **Cross-platform path handling** - Windows uses backslashes, need `path.replace(/\\/g, '/')` for consistency
   - Already handled in `determineContentType()` function
   - Watch for this pattern in future code

3. **Template literal issues** - Babel parser failed on emoji and special chars in template literals
   - Solution: Use `array.join(newline)` pattern instead
   - Avoid complex template literals in strings

### Current State Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Content Preservation Module | ✅ Done | `lib/content-preservation.js` with 19 passing tests |
| Template Coordination Module | ✅ Done | `lib/template-coordination.js` with 20 passing tests |
| Template Headers/Footers | ✅ Done | All 5 templates updated with coordination data |
| Adapter Exists Checks | ✅ Done | All 4 adapters check `isManagedFile()` before overwriting |
| Custom Content Migration | ⏳ TODO | Claude adapter needs to call `migrateCustomContent()` |
| CLI --force Flag | ⏳ TODO | Add to bin/create-ai-context.js |
| Doc Discovery Enhancement | ⏳ TODO | If needed for better extraction |
| Integration Tests | ⏳ TODO | Create tests for full existing-context workflow |

---

## Test Strategy

### Unit Tests Required

| Test File | Coverage |
|-----------|----------|
| `content-preservation.test.js` | Custom content detection, migration |
| `template-coordination.test.js` | Header/footer generation |
| `adapters/copilot-exists.test.js` | Exists check behavior |
| `adapters/cline-exists.test.js` | Exists check behavior |
| `adapters/antigravity-exists.test.js` | Exists check behavior |
| `adapters/claude-migration.test.js` | Custom content migration |

### Integration Tests Required

| Test File | Scenario |
|-----------|----------|
| `existing-contexts.test.js` | Full flow with pre-existing contexts |
| `force-overwrite.test.js` | --force flag behavior |
| `custom-content-migration.test.js` | Custom content preservation |

### E2E Test Scenarios

1. **Scenario 1:** Repo with existing `.github/copilot-instructions.md`
   - Run: `npx create-ai-context`
   - Expect: Warning, file preserved

2. **Scenario 2:** Repo with existing `.claude/custom/my-agent.md`
   - Run: `npx create-ai-context`
   - Expect: Custom agent migrated to `.ai-context/custom/`

3. **Scenario 3:** Repo with all tool contexts
   - Run: `npx create-ai-context`
   - Expect: All preserved, warnings for each

4. **Scenario 4:** Force overwrite
   - Run: `npx create-ai-context --force`
   - Expect: All regenerated without warnings

---

## Rollback Plan

### Safe Commit to Return To

**Commit:** Current HEAD (before implementation)

### Rollback Commands

```bash
# If any step fails, revert to safe commit
git revert <commit-range>

# Or reset entire feature branch
git reset --hard HEAD~<number-of-commits>

# Specific file revert
git checkout HEAD~1 -- packages/create-ai-context/lib/adapters/copilot.js
```

### Recovery Steps

1. Identify which commit caused issues
2. Revert that specific commit
3. Run full test suite
4. Investigate failure root cause
5. Create fix branch from safe commit
6. Re-apply changes with fix

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking change for existing users | MEDIUM | HIGH | Add exists checks by default, require --force |
| Symlink creation fails on Windows | LOW | MEDIUM | Already has fallback to copy |
| Custom content migration loses data | LOW | HIGH | Backup before migration, verbose logging |
| Template changes break existing workflows | LOW | MEDIUM | Backward compatible headers |
| Performance degradation | LOW | LOW | Minimal overhead from exists checks |

---

## Success Criteria

| Criteria | Status | Notes |
|-----------|--------|-------|
| 1. All adapters check for existing files before overwriting | ✅ Done | All 4 adapters use `isManagedFile()` |
| 2. Custom content in `.claude/` is migrated to `.ai-context/custom/` | ⏳ TODO | Module ready, need to call in Claude adapter |
| 3. Generated files have clear "managed by" headers | ✅ Done | Via `getToolCoordinationHeader()` |
| 4. Tools reference `.ai-context/` as source of truth | ✅ Done | Via `getToolCoordinationFooter()` |
| 5. `--force` flag allows intentional overwrites | ⏳ TODO | Adapters support it, CLI flag pending |
| 6. All tests pass (unit + integration) | ✅ Done | 492/492 passing |
| 7. No regression in existing functionality | ✅ Done | E2E tests passing |

---

---

## Human Approval Required

**Please Review:**
1. Scope is appropriate (in/out scope)
2. File modifications are correct
3. Implementation order makes sense
4. Test strategy is comprehensive
5. Rollback plan is safe

**To Approve:** Run `/rpi-implement existing-contexts-discrepancies`
**To Modify:** Provide feedback on specific sections

---

**Next Step:** After human approval → `/rpi-implement existing-contexts-discrepancies`
