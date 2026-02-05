# Implementation Plan: Issues & Edge Cases Fixes

**Date:** 2026-01-31
**Based on:** `.claude/research/active/issues-and-edge-cases-research.md`
**Status:** Ready for review

---

## Executive Summary

This plan addresses the highest-priority issues identified in research:
- **Phase 1:** Quick wins (error logging, path utilities, permission context) - ~4 hours
- **Phase 3:** Add 3 new AI tool adapters (Windsurf, Aider, Continue) - ~6-9 hours

Total estimated time: 10-13 hours for all phases.

---

## Scope Definition

### In Scope
1. **Error handling improvements**
   - Add logging to empty catch blocks
   - Add context to permission errors
   - Create path normalization utility

2. **New AI tool adapters**
   - Windsurf adapter (#10)
   - Aider adapter (#11)
   - Continue adapter (#12)

3. **Test coverage**
   - Tests for new error handling
   - Tests for new adapters
   - Edge case tests (permissions, unicode paths)

### Out of Scope
- Dashboard (#19) - Future feature
- VS Code extension (#18) - Future feature
- Universal schema (#17) - Future consideration
- Scoped packages (#15) - Requires user feedback
- Tool-specific plugins (#14) - Requires use case documentation
- File watcher race conditions (#2.3) - Requires deeper architecture work
- Resource limits (#2.4) - Requires performance testing
- Sync state backup (#2.5) - Requires data loss risk assessment
- Concurrent execution protection (#3.3) - Requires lock file design
- Disk space checking (#3.4) - Platform-specific complexity
- Monorepo improvements (#3.8) - Requires separate RFC

---

## File Modifications

### Phase 1: Error Handling & Utilities

| File | Lines | Change | Risk |
|------|-------|--------|------|
| `lib/utils/path-utils.js` | NEW | Create path normalization utility | LOW |
| `lib/ai-orchestrator.js` | 306 | Add error logging to catch block | LOW |
| `lib/content-preservation.js` | 115, 208, 228 | Add error logging to catch blocks | LOW |
| `lib/installer.js` | 102, 151 | Wrap fs operations with error context (WARNING) | MEDIUM |
| `lib/adapters/claude.js` | 164, 189 | Wrap fs operations with error context (WARNING) | MEDIUM |
| `lib/template-populator.js` | 61, 98 | Wrap fs operations with error context (WARNING) | MEDIUM |
| `lib/placeholder.js` | 200 | Add failOnUnreplaced flag support | LOW |
| `lib/index.js` | existing | Pass failOnUnreplaced through config | LOW |
| `bin/create-ai-context.js` | existing | Add --fail-on-unreplaced CLI flag | LOW |
| `tests/unit/utils/path-utils.test.js` | NEW | Test path normalization | LOW |
| `tests/unit/content-preservation.test.js` | existing | Add error logging tests | LOW |

### Phase 3: New Adapters

| File | Lines | Change | Risk |
|------|-------|--------|------|
| `lib/adapters/windsurf.js` | NEW | Create Windsurf adapter | LOW |
| `lib/adapters/aider.js` | NEW | Create Aider adapter | LOW |
| `lib/adapters/continue.js` | NEW | Create Continue adapter | LOW |
| `templates/windsurf/.windsurfrules.template` | NEW | Windsurf template | LOW |
| `templates/aider/CONVENTIONS.md.template` | NEW | Aider conventions template | LOW |
| `templates/aider/.aider.conf.yml.template` | NEW | Aider config template | LOW |
| `templates/continue/config.json.template` | NEW | Continue config template | LOW |
| `lib/adapters/index.js` | existing | Register new adapters | LOW |
| `tests/unit/adapters/windsurf.test.js` | NEW | Test Windsurf adapter | LOW |
| `tests/unit/adapters/aider.test.js` | NEW | Test Aider adapter | LOW |
| `tests/unit/adapters/continue.test.js` | NEW | Test Continue adapter | LOW |

---

## Step-by-Step Implementation Plan

### Phase 1.1: Create Path Utility Module

**File:** `lib/utils/path-utils.js` (NEW)

**Implementation:**
```javascript
/**
 * Path Utilities
 *
 * Cross-platform path handling utilities
 */

const path = require('path');

/**
 * Normalize path separators to forward slashes for consistency
 * @param {string} filePath - Path to normalize
 * @returns {string} Normalized path
 */
function normalizePath(filePath) {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/');
}

/**
 * Get relative path with normalized separators
 * @param {string} from - Source path
 * @param {string} to - Destination path
 * @returns {string} Normalized relative path
 */
function relativePath(from, to) {
  const rel = path.relative(from, to);
  return normalizePath(rel);
}

/**
 * Join path segments and normalize
 * @param {...string} segments - Path segments
 * @returns {string} Normalized joined path
 */
function joinPath(...segments) {
  return normalizePath(path.join(...segments));
}

/**
 * Check if path is absolute (cross-platform)
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
function isAbsolute(filePath) {
  // Windows paths can start with drive letter (C:\) or UNC (\\)
  if (/^[a-zA-Z]:\\/.test(filePath) || /^\\\\/.test(filePath)) {
    return true;
  }
  return path.isAbsolute(filePath);
}

module.exports = {
  normalizePath,
  relativePath,
  joinPath,
  isAbsolute
};
```

**Tests to create:**
```javascript
// tests/unit/utils/path-utils.test.js
describe('Path Utils', () => {
  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(normalizePath('foo\\bar\\baz')).toBe('foo/bar/baz');
    });
    it('should handle mixed separators', () => {
      expect(normalizePath('foo/bar\\baz')).toBe('foo/bar/baz');
    });
    it('should handle empty string', () => {
      expect(normalizePath('')).toBe('');
    });
  });
  // ... more tests
});
```

**Test command:** `npm test -- tests/unit/utils/path-utils.test.js`

---

### Phase 1.2: Update Empty Catch Blocks

#### 1.2a: ai-orchestrator.js

**File:** `lib/ai-orchestrator.js`
**Line:** 302-306

**Current code:**
```javascript
try {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return pkg.version || '1.0.0';
} catch {
  return '1.0.0';
}
```

**Proposed change:**
```javascript
try {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return pkg.version || '1.0.0';
} catch (error) {
  // Silently fall back to default version
  return '1.0.0';
}
```

**Test command:** `npm test -- tests/unit/ai-orchestrator.test.js`

---

#### 1.2b: content-preservation.js (3 locations)

**File:** `lib/content-preservation.js`
**Lines:** 113-116, 205-210, 224-230

**Location 1 (line 113-116):**
```javascript
// Current:
} catch (err) {
  // Skip unreadable files
}

// Proposed:
} catch (err) {
  // Skip unreadable files
  if (process.env.AI_CONTEXT_DEBUG) {
    console.warn(`Failed to read ${item.path}: ${err.message}`);
  }
}
```

**Location 2 (line 205-210):**
```javascript
// Current:
try {
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
} catch (err) {
  return null;
}

// Proposed:
try {
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
} catch (err) {
  console.warn(`Failed to create backup of ${filePath}: ${err.message}`);
  return null;
}
```

**Location 3 (line 224-230):**
```javascript
// Current:
try {
  fs.copyFileSync(backupPath, originalPath);
  fs.unlinkSync(backupPath);
  return true;
} catch (err) {
  return false;
}

// Proposed:
try {
  fs.copyFileSync(backupPath, originalPath);
  fs.unlinkSync(backupPath);
  return true;
} catch (err) {
  console.warn(`Failed to restore from backup ${backupPath}: ${err.message}`);
  return false;
}
```

**Test command:** `npm test -- tests/unit/content-preservation.test.js`

---

### Phase 1.3: Add Permission Error Context (WARNING level)

**User decision:** Permission errors should be warnings, not fatal

Create a utility function for wrapping filesystem operations:

**File:** `lib/utils/fs-wrapper.js` (NEW)

```javascript
/**
 * Filesystem Operation Wrapper
 *
 * Adds context to filesystem errors (WARNING level, not fatal)
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Wrap sync file write with better error messages
 * Returns warning object instead of throwing (non-fatal)
 * @param {string} filePath - File path
 * @param {string} content - Content to write
 * @param {object} options - Write options
 * @returns {object} { success: boolean, warning?: string }
 */
function writeFileSyncWithContext(filePath, content, options = {}) {
  try {
    fs.writeFileSync(filePath, content, options);
    return { success: true };
  } catch (error) {
    let message;
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      message = `Permission denied writing to ${filePath}. Check file permissions.`;
    } else if (error.code === 'ENOENT') {
      message = `Directory does not exist: ${path.dirname(filePath)}. Ensure parent directory exists.`;
    } else if (error.code === 'ENOSPC') {
      message = `No space left on device while writing ${filePath}. Free up disk space.`;
    } else {
      message = `Failed to write ${filePath}: ${error.message}`;
    }
    return { success: false, warning: message, error };
  }
}

/**
 * Wrap sync directory creation with better error messages
 * Returns warning object instead of throwing (non-fatal)
 * @param {string} dirPath - Directory path
 * @param {object} options - mkdir options
 * @returns {object} { success: boolean, warning?: string }
 */
function mkdirSyncWithContext(dirPath, options = {}) {
  try {
    fs.mkdirSync(dirPath, options);
    return { success: true };
  } catch (error) {
    let message;
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      message = `Permission denied creating directory ${dirPath}. Check directory permissions.`;
    } else {
      message = `Failed to create directory ${dirPath}: ${error.message}`;
    }
    return { success: false, warning: message, error };
  }
}

/**
 * Log a warning message if verbose mode is enabled
 * @param {object} result - Result from writeFileSyncWithContext or mkdirSyncWithContext
 * @param {boolean} verbose - Whether to log warnings
 */
function logWarning(result, verbose = false) {
  if (!result.success && result.warning && verbose) {
    console.warn(chalk.yellow(`⚠ ${result.warning}`));
  }
}

module.exports = {
  writeFileSyncWithContext,
  mkdirSyncWithContext,
  logWarning
};
```

**Update files to use wrapper (WARNING level handling):**

**installer.js line 102:**
```javascript
// Before:
fs.mkdirSync(fullPath, { recursive: true });

// After:
const { mkdirSyncWithContext, logWarning } = require('../utils/fs-wrapper');
const result = mkdirSyncWithContext(fullPath, { recursive: true });
if (!result.success) {
  logWarning(result, config.verbose);
  // Continue - non-fatal warning
}
```

**template-populator.js line 61:**
```javascript
// Before:
fs.writeFileSync(filePath, content);

// After:
const { writeFileSyncWithContext, logWarning } = require('../utils/fs-wrapper');
const result = writeFileSyncWithContext(filePath, content);
if (!result.success) {
  logWarning(result, config.verbose);
  results.errors.push({ file: filePath, warning: result.warning });
  // Continue - non-fatal warning
}
```

**Test command:** `npm test -- tests/unit/installer.test.js tests/unit/template-populator.test.js`

---

### Phase 1.4: Add Placeholder Validation & CLI Flag

**User decision:** Add `--fail-on-unreplaced` CLI flag (YES)

#### 1.4a: Update placeholder.js

**File:** `lib/placeholder.js`
**Line:** ~200 (in replacePlaceholders function)

**Add parameter:**
```javascript
/**
 * Replace all placeholders in all files
 * @param {string} targetDir - Target directory
 * @param {object} options - Options
 * @param {boolean} options.failOnUnreplaced - Throw if placeholders remain
 * @returns {object} Results
 */
async function replacePlaceholders(targetDir, options = {}) {
  const { failOnUnreplaced = false, verbose = false } = options;
  // ... existing code ...

  if (failOnUnreplaced && unreplacedCount > 0) {
    const details = unreplacedDetails.map(u => u.placeholder).join(', ');
    throw new Error(
      `${unreplacedCount} placeholders were not replaced: ${details}. ` +
      `Run with --verbose to see file locations.`
    );
  }

  if (verbose && unreplacedCount > 0) {
    console.warn(`Warning: ${unreplacedCount} placeholders were not replaced`);
  }

  return { unreplacedCount, unreplacedDetails };
}
```

#### 1.4b: Add CLI flag

**File:** `bin/create-ai-context.js`
**Line:** ~91 (main command options)

**Add option:**
```javascript
.option('--fail-on-unreplaced', 'Error if any placeholders remain unreplaced')
```

**Pass to config (line ~121):**
```javascript
await run({
  // ... existing options
  failOnUnreplaced: options.failOnUnreplaced || false
});
```

#### 1.4c: Update orchestrator

**File:** `lib/index.js`
**Line:** ~58-81 (default options)

**Add to options:**
```javascript
const {
  // ... existing options
  failOnUnreplaced = false
} = options;
```

**Pass to replacePlaceholders (line ~267):**
```javascript
const placeholdersReplaced = await replacePlaceholders(targetDir, {
  ...config,
  techStack,
  analysis,
  failOnUnreplaced: config.failOnUnreplaced
});
```

**Test command:** `npm test -- tests/unit/placeholder.test.js`

---

### Phase 3.1: Add Windsurf Adapter

**Research complete:** Windsurf uses `.windsurf/rules/*.md` (modern) or `.windsurfrules` (legacy).

**File format:**
- Modern: `.windsurf/rules/*.md` (multiple markdown files)
- Legacy: `.windsurfrules` (single file at root)
- Format: Markdown with optional XML-style tags
- Limit: 12,000 characters per file

**Sources:**
- [Official Documentation](https://docs.windsurf.com/windsurf/cascade/memories)
- [Community Examples](https://github.com/SchneiderSam/awesome-windsurfrules)

**File:** `lib/adapters/windsurf.js` (NEW)

```javascript
/**
 * Windsurf Adapter
 *
 * Generates .windsurfrules file for Windsurf IDE
 */

const fs = require('fs');
const path = require('path');
const { renderTemplateByName, buildContext } = require('../template-renderer');
const { isManagedFile } = require('../template-coordination');

const adapter = {
  name: 'windsurf',
  displayName: 'Windsurf IDE',
  description: 'Project rules for Windsurf IDE',
  outputType: 'single-file',
  outputPath: '.windsurfrules'
};

function getOutputPath(projectRoot) {
  return path.join(projectRoot, '.windsurfrules');
}

function exists(projectRoot) {
  return fs.existsSync(getOutputPath(projectRoot));
}

async function generate(analysis, config, projectRoot) {
  const result = {
    success: false,
    adapter: adapter.name,
    files: [],
    errors: []
  };

  try {
    const outputPath = getOutputPath(projectRoot);

    if (fs.existsSync(outputPath) && !config.force) {
      if (!isManagedFile(outputPath)) {
        result.errors.push({
          message: '.windsurfrules exists and appears to be custom. Use --force to overwrite.',
          code: 'EXISTS_CUSTOM',
          severity: 'error'
        });
        return result;
      }
    }

    const context = buildContext(analysis, config, 'windsurf');
    const content = renderTemplateByName('windsurf', context);

    fs.writeFileSync(outputPath, content, 'utf-8');

    result.success = true;
    result.files.push({
      path: outputPath,
      relativePath: '.windsurfrules',
      size: content.length
    });
  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack
    });
  }

  return result;
}

function validate(projectRoot) {
  const issues = [];
  const outputPath = getOutputPath(projectRoot);

  if (!fs.existsSync(outputPath)) {
    issues.push({ file: '.windsurfrules', error: 'not found' });
  } else {
    const content = fs.readFileSync(outputPath, 'utf-8');
    const placeholderMatch = content.match(/\{\{[A-Z_]+\}\}/g);
    if (placeholderMatch && placeholderMatch.length > 0) {
      issues.push({
        file: '.windsurfrules',
        error: `Found ${placeholderMatch.length} unreplaced placeholders`
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

module.exports = {
  ...adapter,
  getOutputPath,
  exists,
  generate,
  validate
};
```

**Template:** `templates/windsurf/rules.md.template`

```markdown
# {{PROJECT_NAME}} - Windsurf Cascade Rules

**Tech Stack:** {{TECH_STACK}}
**Status:** {{PROJECT_STATUS}}

<communication>
- Speak to me in a professional, technical manner
- Provide clear explanations for code changes
- Reference specific files and line numbers when discussing changes
</communication>

<filesystem>
- Key project files: {{CORE_FILES_LIST}}
- Models directory: {{MODELS_PATH}}
- Migrations directory: {{MIGRATIONS_PATH}}
</filesystem>

<coding>
- Primary language: {{PRIMARY_LANGUAGE}}
- Framework: {{FRAMEWORK}}
- Testing framework: {{TEST_FRAMEWORK}}
- Follow existing code style and patterns
- Add type hints/annotations for all functions
- Write tests for new functionality (target: {{TEST_COVERAGE_TARGET}}% coverage)
- Use early returns when possible
</coding>

<commands>
| Command | Purpose |
|---------|---------|
| {{INSTALL_COMMAND}} | Install dependencies |
| {{DEV_START_COMMAND}} | Start development server |
| {{TEST_COMMAND}} | Run tests |
| {{TEST_COVERAGE_COMMAND}} | Run tests with coverage |
| {{DEPLOY_COMMAND}} | Deploy to production |
</commands>

<architecture>
{{PROJECT_DESCRIPTION}}

Key patterns:
- {{ARCHITECTURE_PATTERNS}}
</architecture>

---
*Generated by create-universal-ai-context v{{VERSION}}*
```

**Register adapter:** Add to `lib/adapters/index.js`

**Test command:** `npm test -- tests/unit/adapters/windsurf.test.js`

---

### Phase 3.2: Add Aider Adapter

**Research complete:** Aider uses `CONVENTIONS.md` (coding conventions) and `.aider.conf.yml` (configuration).

**Sources:**
- [Conventions Documentation](https://aider.chat/docs/usage/conventions.html)
- [Config Documentation](https://aider.chat/docs/config/aider_conf.html)
- [Options Reference](https://aider.chat/docs/config/options.html)
- [Community Conventions](https://github.com/Aider-AI/conventions)

**File locations:**
- `CONVENTIONS.md` - Project root (markdown with natural language)
- `.aider.conf.yml` - Project root or home directory (YAML config)

**Key .aider.conf.yml options:**
- `model` - AI model to use
- `read` - Files to read on startup (e.g., `CONVENTIONS.md`)
- `editor` - Editor model settings
- `lint-cmd` - Lint command
- `test-cmd` - Test command
- `commit` - Auto-commit settings
- `map-tokens` - Context window size

**File:** `lib/adapters/aider.js` (NEW)

```javascript
/**
 * Aider Adapter
 *
 * Generates CONVENTIONS.md and .aider.conf.yml for Aider
 */

const fs = require('fs');
const path = require('path');
const { renderTemplateByName, buildContext } = require('../template-renderer');
const { isManagedFile } = require('../template-coordination');

const adapter = {
  name: 'aider',
  displayName: 'Aider',
  description: 'Terminal-based AI coding assistant',
  outputType: 'multi-file',
  outputPath: 'CONVENTIONS.md'
};

function getOutputPaths(projectRoot) {
  return [
    path.join(projectRoot, 'CONVENTIONS.md'),
    path.join(projectRoot, '.aider.conf.yml')
  ];
}

function exists(projectRoot) {
  return fs.existsSync(path.join(projectRoot, 'CONVENTIONS.md')) ||
         fs.existsSync(path.join(projectRoot, '.aider.conf.yml'));
}

async function generate(analysis, config, projectRoot) {
  const result = {
    success: false,
    adapter: adapter.name,
    files: [],
    errors: []
  };

  try {
    const conventionsPath = path.join(projectRoot, 'CONVENTIONS.md');
    const configPath = path.join(projectRoot, '.aider.conf.yml');

    // Check for existing custom files
    if (fs.existsSync(conventionsPath) && !config.force) {
      if (!isManagedFile(conventionsPath)) {
        result.errors.push({
          message: 'CONVENTIONS.md exists and appears to be custom. Use --force to overwrite.',
          code: 'EXISTS_CUSTOM',
          severity: 'error'
        });
        return result;
      }
    }

    const context = buildContext(analysis, config, 'aider');

    // Generate CONVENTIONS.md
    const conventionsContent = renderTemplateByName('aider-conventions', context);
    fs.writeFileSync(conventionsPath, conventionsContent, 'utf-8');
    result.files.push({
      path: conventionsPath,
      relativePath: 'CONVENTIONS.md',
      size: conventionsContent.length
    });

    // Generate .aider.conf.yml
    const configContent = renderTemplateByName('aider-config', context);
    fs.writeFileSync(configPath, configContent, 'utf-8');
    result.files.push({
      path: configPath,
      relativePath: '.aider.conf.yml',
      size: configContent.length
    });

    result.success = true;
  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack
    });
  }

  return result;
}

function validate(projectRoot) {
  const issues = [];
  const conventionsPath = path.join(projectRoot, 'CONVENTIONS.md');
  const configPath = path.join(projectRoot, '.aider.conf.yml');

  if (!fs.existsSync(conventionsPath)) {
    issues.push({ file: 'CONVENTIONS.md', error: 'not found' });
  }
  if (!fs.existsSync(configPath)) {
    issues.push({ file: '.aider.conf.yml', error: 'not found', severity: 'warning' });
  }

  return {
    valid: issues.filter(i => i.severity !== 'warning').length === 0,
    issues
  };
}

module.exports = {
  ...adapter,
  getOutputPaths,
  exists,
  generate,
  validate
};
```

**Templates:** `templates/aider/CONVENTIONS.md.template`, `templates/aider/.aider.conf.yml.template`

**CONVENTIONS.md.template:**
```markdown
# {{PROJECT_NAME}} - Coding Conventions

## Project Overview

{{PROJECT_DESCRIPTION}}

## Tech Stack

- Languages: {{TECH_STACK}}
- Framework: {{FRAMEWORK}}
- Testing: {{TEST_FRAMEWORK}}

## Coding Standards

### Code Style
- Follow {{CODE_STYLE_GUIDE}} guidelines
- Use {{LINTER}} for linting
- Maximum line length: {{MAX_LINE_LENGTH}} characters

### Code Organization
- Models in: {{MODELS_PATH}}
- Controllers in: {{CONTROLLERS_PATH}}
- Utilities in: {{UTILS_PATH}}
- Tests mirror source structure

### Best Practices
- Add type hints/annotations to all functions
- Write docstrings for public methods
- Keep functions focused and small (<{{MAX_FUNCTION_LENGTH}} lines)
- Use dependency injection for services

### Testing
- Test file names: {{TEST_FILE_PATTERN}}
- Aim for {{TEST_COVERAGE_TARGET}}% code coverage
- Mock external dependencies
- Use fixtures for common test data

### Git Conventions
- Commit message format: {{COMMIT_FORMAT}}
- Branch naming: {{BRANCH_NAMING}}
- Create PRs for all changes

## Library Preferences

### HTTP Clients
- Use {{HTTP_CLIENT}} instead of alternatives

### Database
- ORM: {{ORM_NAME}}
- Query builder: {{QUERY_BUILDER}}

## Files to Avoid Modifying

{{PROTECTED_FILES}}

---
*Generated by create-universal-ai-context v{{VERSION}}*
```

**.aider.conf.yml.template:**
```yaml
# Aider configuration for {{PROJECT_NAME}}
# Generated by create-universal-ai-context v{{VERSION}}

# Model configuration
model: {{AIDER_MODEL}}
editor-model: {{AIDER_EDITOR_MODEL}}

# Context window
map-tokens: {{AIDER_MAP_TOKENS}}

# Files to read on startup
read:
  - CONVENTIONS.md
  - README.md
  {{AIDER_EXTRA_READS}}

# Auto-commit settings
auto-commits: {{AIDER_AUTO_COMMITS}}
commit: {{AIDER_COMMIT_PROMPT}}

# Commands
lint-cmd: {{LINT_COMMAND}}
test-cmd: {{TEST_COMMAND}}
run-cmd: {{DEV_START_COMMAND}}

# Git settings
gitignore: {{AIDER_GITIGNORE}}
```

**Test command:** `npm test -- tests/unit/adapters/aider.test.js`

---

### Phase 3.3: Add Continue Adapter

**Research complete:** Continue uses `.continue/config.json` with context providers support.

**Sources:**
- [Context Providers Documentation](https://docs.continue.dev/customize/custom-providers)
- [Config Schema](https://github.com/continuedev/continue/blob/main/extensions/vscode/config_schema.json)
- [Deep Dive](https://docs.continue.dev/customize/deep-dives/custom-providers)

**File location:**
- `.continue/config.json` - Project root (JSON configuration)

**Key config.json options:**
- `contextProviders` - List of context providers (@ mentions)
- `rules` - Custom rules/guidelines
- `disableSessionPersistence` - Session management
- `allowTelemetry` - Telemetry setting
- `slashCommands` - Custom slash commands

**Built-in context providers:**
- `@File` - Single file reference
- `@Files` - Multiple file reference
- `@Directory` - Directory reference
- `@Issue` - GitHub issue reference
- `@GitDiff` - Git diff
- `@Terminal` - Terminal output

**File:** `lib/adapters/continue.js` (NEW)

```javascript
/**
 * Continue Adapter
 *
 * Generates .continue/config.json for Continue VS Code extension
 */

const fs = require('fs');
const path = require('path');
const { renderTemplateByName, buildContext } = require('../template-renderer');
const { isManagedFile } = require('../template-coordination');

const adapter = {
  name: 'continue',
  displayName: 'Continue',
  description: 'VS Code/JetBrains AI extension',
  outputType: 'multi-file',
  outputPath: '.continue/'
};

function getOutputPath(projectRoot) {
  return path.join(projectRoot, '.continue', 'config.json');
}

function exists(projectRoot) {
  const continueDir = path.join(projectRoot, '.continue');
  return fs.existsSync(continueDir);
}

async function generate(analysis, config, projectRoot) {
  const result = {
    success: false,
    adapter: adapter.name,
    files: [],
    errors: []
  };

  try {
    const continueDir = path.join(projectRoot, '.continue');
    const configPath = path.join(continueDir, 'config.json');

    if (fs.existsSync(continueDir) && !config.force) {
      const hasCustom = checkForCustomFiles(continueDir);
      if (hasCustom) {
        result.errors.push({
          message: '.continue/ directory exists and contains custom files. Use --force to overwrite.',
          code: 'EXISTS_CUSTOM',
          severity: 'warning'
        });
        return result;
      }
    }

    fs.mkdirSync(continueDir, { recursive: true });

    const context = buildContext(analysis, config, 'continue');
    const configContent = renderTemplateByName('continue-config', context);

    fs.writeFileSync(configPath, configContent, 'utf-8');

    result.success = true;
    result.files.push({
      path: configPath,
      relativePath: '.continue/config.json',
      size: configContent.length
    });
  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack
    });
  }

  return result;
}

function checkForCustomFiles(dir) {
  if (!fs.existsSync(dir)) return false;
  const entries = fs.readdirSync(dir);
  return entries.some(entry => {
    const filePath = path.join(dir, entry);
    return fs.statSync(filePath).isFile() && !isManagedFile(filePath);
  });
}

function validate(projectRoot) {
  const issues = [];
  const configPath = path.join(projectRoot, '.continue', 'config.json');

  if (!fs.existsSync(configPath)) {
    issues.push({ file: '.continue/config.json', error: 'not found' });
  } else {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      JSON.parse(content); // Validate JSON
    } catch (error) {
      issues.push({
        file: '.continue/config.json',
        error: `Invalid JSON: ${error.message}`
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

module.exports = {
  ...adapter,
  getOutputPath,
  exists,
  generate,
  validate
};
```

**Template:** `templates/continue/config.json.template`

```json
{
  "$schema": "https://docs.continue.dev/reference/config-schema.json",
  "rules": [
    {
      "pattern": ".*",
      "description": "{{PROJECT_NAME}} Project Context"
    }
  ],
  "contextProviders": [
    {
      "name": "ai-context",
      "description": "AI Context Engineering documentation",
      "getContextItems": {
        "providerId": "ai-context"
      }
    },
    {
      "name": "docs",
      "description": "Project documentation",
      "getContextItems": {
        "providerId": "file",
        "params": {
          "directory": "{{DOCS_PATH}}"
        }
      }
    }
  ],
  "slashCommands": [
    {
      "name": "test",
      "description": "Run tests"
    },
    {
      "name": "lint",
      "description": "Run linter"
    },
    {
      "name": "build",
      "description": "Build the project"
    }
  ],
  "disableSessionPersistence": false,
  "allowTelemetry": false,
  "userGroupName": "{{PROJECT_NAME}}"
}
```

**Test command:** `npm test -- tests/unit/adapters/continue.test.js`

---

## Test Strategy

### Unit Tests

| Test File | Coverage |
|-----------|----------|
| `tests/unit/utils/path-utils.test.js` | Path normalization, join, relative |
| `tests/unit/utils/fs-wrapper.test.js` | Error context for filesystem ops (WARNING level) |
| `tests/unit/adapters/windsurf.test.js` | Windsurf adapter full flow |
| `tests/unit/adapters/aider.test.js` | Aider adapter full flow |
| `tests/unit/adapters/continue.test.js` | Continue adapter full flow |
| `tests/unit/placeholder-flag.test.js` | fail-on-unreplaced flag behavior |

### Integration Tests

| Test File | Coverage |
|-----------|----------|
| `tests/integration/error-handling.test.js` | Permission errors, empty catch logging |
| `tests/integration/new-adapters.test.js` | All 3 new adapters in real project |

### Test Execution

After each phase:
```bash
npm test                                    # All tests
npm test -- tests/unit/utils/              # New utils
npm test -- tests/unit/adapters/windsurf.test.js
npm test -- tests/unit/adapters/aider.test.js
npm test -- tests/unit/adapters/continue.test.js
```

---

## Rollback Plan

### Safe Commit Point
Current commit: `cc02223` (feat: add --force flag and custom content migration)

### Rollback Commands

If issues arise:
```bash
# View recent commits
git log --oneline -5

# Reset to safe commit
git reset --hard cc02223

# Or revert specific commits
git revert HEAD  # Revert most recent
git revert HEAD~2  # Revert 3 commits back
```

### Per-Phase Rollback

- **Phase 1:** Can be rolled back independently
- **Phase 3:** Each adapter can be rolled back independently

---

## Approval Required

**User Decisions:**
1. ~~Should we add `--fail-on-unreplaced` CLI flag?~~ **YES - Add the flag**
2. ~~Should permission errors be fatal or warnings?~~ **WARNING - Not fatal**
3. ~~Do we want to research Windsurf/Aider/Continue requirements more deeply?~~ **YES - Research complete**

Please review and approve:

- [ ] Phase 1.1: Path utility module
- [ ] Phase 1.2: Error logging improvements
- [ ] Phase 1.3: Permission error context (WARNING level)
- [ ] Phase 1.4: Add `--fail-on-unreplaced` CLI flag
- [ ] Phase 3.1: Windsurf adapter (based on research)
- [ ] Phase 3.2: Aider adapter (based on research)
- [ ] Phase 3.3: Continue adapter (based on research)

---

## Next Steps

**Plan approved with decisions:**
1. Add `--fail-on-unreplaced` CLI flag ✓
2. Permission errors as WARNINGS (not fatal) ✓
3. Deep research on adapters complete ✓

Execute with:
```
/rpi-implement issues-and-edge-cases-fixes
```

Or implement specific phases:
```
/rpi-implement issues-and-edge-cases-fixes --phase 1
/rpi-implement issues-and-edge-cases-fixes --phase 3
```
