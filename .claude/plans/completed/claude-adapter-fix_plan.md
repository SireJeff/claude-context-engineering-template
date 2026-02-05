# Plan: Fix Claude Adapter .claude/ Directory Generation

## Research Summary

**Problem:** The Claude adapter only generates `AI_CONTEXT.md` at project root. It doesn't create the `.claude/` directory structure (agents/, commands/, indexes/, etc.) that Claude Code actually uses.

**Root Cause:** The installer copies templates to `.ai-context/` (universal), but nothing generates the full `.claude/` directory structure.

**Current Flow:**
```
CLI → installer.js → .ai-context/ directory (from templates/base/)
                ↓
         ai-context-generator.js → Adapters:
           - Claude → AI_CONTEXT.md only [MISSING: .claude/ structure]
           - Copilot → .github/copilot-instructions.md
           - Cline → .clinerules
           - Antigravity → .agent/ directory
```

---

## Scope

### In Scope
- Modify Claude adapter to generate full `.claude/` directory structure
- Copy relevant templates from `templates/base/` to `.claude/`
- Ensure backward compatibility (don't overwrite if exists)
- Add validation for `.claude/` structure

### Out of Scope
- Changing other adapters (Copilot, Cline, Antigravity) - they work fine
- Modifying `.ai-context/` generation
- Changes to AI_CONTEXT.md generation

---

## File Modifications

| File | Lines | Change | Risk |
|------|-------|--------|------|
| `lib/adapters/claude.js` | 48-81 | Add `.claude/` directory generation | Medium |
| `lib/installer.js` | 320-403 | Extract template copy logic for reuse | Low |
| `tests/unit/adapters/claude.test.js` | New | Add tests for `.claude/` generation | Low |

---

## Implementation Plan

### Step 1: Extract Template Copy Logic in installer.js

**Current code** (lines 132-161):
```javascript
async function copyDirectory(src, dest) {
  let count = 0;
  if (!fs.existsSync(src)) { return count; }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      count += await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}
```

**Change:** Export this function so adapters can use it.

```javascript
// Export for use by adapters
module.exports = {
  createDirectoryStructure,
  copyTemplates,
  createAiContextMd,
  createClaudeMd,
  DIRECTORY_STRUCTURE,
  AI_CONTEXT_DIR,
  AI_CONTEXT_FILE,
  copyDirectory,  // NEW - export for adapters
};
```

**Test:** Run existing unit tests - should pass without changes.

---

### Step 2: Enhance Claude Adapter to Generate .claude/ Directory

**Current code** (`lib/adapters/claude.js` lines 48-81):
```javascript
async function generate(analysis, config, projectRoot) {
  const result = {
    success: false,
    adapter: adapter.name,
    files: [],
    errors: []
  };

  try {
    // Build context from analysis
    const context = buildContext(analysis, config);

    // Render template
    const content = renderTemplateByName('claude', context);

    // Write output file
    const outputPath = getOutputPath(projectRoot);
    fs.writeFileSync(outputPath, content, 'utf-8');

    result.success = true;
    result.files.push({
      path: outputPath,
      relativePath: 'AI_CONTEXT.md',
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
```

**Proposed change:**
```javascript
async function generate(analysis, config, projectRoot) {
  const result = {
    success: false,
    adapter: adapter.name,
    files: [],
    errors: []
  };

  try {
    // 1. Generate AI_CONTEXT.md at project root (existing behavior)
    const context = buildContext(analysis, config);
    const content = renderTemplateByName('claude', context);
    const outputPath = getOutputPath(projectRoot);
    fs.writeFileSync(outputPath, content, 'utf-8');
    result.files.push({
      path: outputPath,
      relativePath: 'AI_CONTEXT.md',
      size: content.length
    });

    // 2. Generate .claude/ directory structure (NEW)
    const claudeDir = await generateClaudeDirectory(projectRoot, context, result);
    if (claudeDir) {
      result.files.push(...claudeDir);
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack
    });
  }

  return result;
}

/**
 * Generate .claude/ directory with full structure
 * @param {string} projectRoot - Project root directory
 * @param {object} context - Template context
 * @param {object} result - Result object to track files/errors
 * @returns {Array} List of generated files
 */
async function generateClaudeDirectory(projectRoot, context, result) {
  const { copyDirectory } = require('../installer');
  const templatesDir = path.join(__dirname, '..', '..', 'templates', 'base');
  const claudeDir = path.join(projectRoot, '.claude');

  // Don't overwrite existing .claude/ directory
  if (fs.existsSync(claudeDir)) {
    result.errors.push({
      message: '.claude/ directory already exists, skipping structure generation',
      code: 'EXISTS'
    });
    return null;
  }

  try {
    // Create .claude/ directory
    fs.mkdirSync(claudeDir, { recursive: true });

    // Copy relevant subdirectories from templates/base to .claude/
    const subdirsToCopy = [
      'agents',
      'commands',
      'indexes',
      'context',
      'schemas',
      'standards',
      'tools'  // Optional: only if CLI tools are desired
    ];

    let filesCopied = 0;
    for (const subdir of subdirsToCopy) {
      const srcPath = path.join(templatesDir, subdir);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(claudeDir, subdir);
        fs.mkdirSync(destPath, { recursive: true });
        const count = await copyDirectory(srcPath, destPath);
        filesCopied += count;
      }
    }

    // Create minimal .claude/settings.json
    const settingsPath = path.join(claudeDir, 'settings.json');
    const settings = {
      '$schema': './schemas/settings.schema.json',
      version: '2.1.0',
      project: {
        name: context.project.name,
        tech_stack: context.project.tech_stack
      },
      agents: {
        context_engineer: 'enabled',
        core_architect: 'enabled',
        api_developer: 'enabled',
        database_ops: 'enabled',
        integration_hub: 'enabled',
        deployment_ops: 'enabled'
      },
      commands: {
        rpi_workflow: 'enabled',
        validation: 'enabled'
      }
    };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    filesCopied++;

    // Create .claude/README.md
    const readmePath = path.join(claudeDir, 'README.md');
    const readme = `# .claude Configuration - ${context.project.name}

This directory contains Claude Code-specific context engineering files.

## Quick Start

1. Load agents: \`@context-engineer\`
2. Use commands: \`/rpi-research\`, \`/rpi-plan\`, \`/rpi-implement\`
3. Validate: \`/verify-docs-current\`

## Universal Context

See \`AI_CONTEXT.md\` at project root for universal AI context (works with all tools).

## Claude-Specific Files

- **agents/** - Specialized agents for different tasks
- **commands/** - Custom slash commands
- **indexes/** - 3-level navigation system
- **context/** - Workflow documentation

*Generated by create-universal-ai-context v${context.version || '2.1.0'}*
`;
    fs.writeFileSync(readmePath, readme);
    filesCopied++;

    return [{
      path: claudeDir,
      relativePath: '.claude/',
      size: filesCopied
    }];

  } catch (error) {
    result.errors.push({
      message: `Failed to generate .claude/ directory: ${error.message}`,
      stack: error.stack
    });
    return null;
  }
}
```

**Test:** Run unit tests, then manual test on a fresh project.

---

### Step 3: Update Claude Adapter validate() Function

**Current code** (lines 88-114):
```javascript
function validate(projectRoot) {
  const outputPath = getOutputPath(projectRoot);

  if (!fs.existsSync(outputPath)) {
    return {
      valid: false,
      error: 'AI_CONTEXT.md not found'
    };
  }

  const content = fs.readFileSync(outputPath, 'utf-8');

  // Check for unreplaced placeholders
  const placeholderMatch = content.match(/\{\{[A-Z_]+\}\}/g);
  if (placeholderMatch && placeholderMatch.length > 0) {
    return {
      valid: false,
      error: `Found ${placeholderMatch.length} unreplaced placeholders`,
      placeholders: placeholderMatch
    };
  }

  return {
    valid: true,
    size: content.length
  };
}
```

**Proposed change:**
```javascript
function validate(projectRoot) {
  const issues = [];

  // 1. Validate AI_CONTEXT.md
  const outputPath = getOutputPath(projectRoot);
  if (!fs.existsSync(outputPath)) {
    issues.push({ file: 'AI_CONTEXT.md', error: 'not found' });
  } else {
    const content = fs.readFileSync(outputPath, 'utf-8');
    const placeholderMatch = content.match(/\{\{[A-Z_]+\}\}/g);
    if (placeholderMatch && placeholderMatch.length > 0) {
      issues.push({
        file: 'AI_CONTEXT.md',
        error: `Found ${placeholderMatch.length} unreplaced placeholders`
      });
    }
  }

  // 2. Validate .claude/ directory (optional, warn if missing)
  const claudeDir = path.join(projectRoot, '.claude');
  if (!fs.existsSync(claudeDir)) {
    issues.push({
      file: '.claude/',
      error: 'directory not found (optional but recommended)',
      severity: 'warning'
    });
  } else {
    // Check for critical files
    const criticalFiles = [
      'settings.json',
      'README.md',
      'agents/context-engineer.md'
    ];
    for (const file of criticalFiles) {
      if (!fs.existsSync(path.join(claudeDir, file))) {
        issues.push({
          file: `.claude/${file}`,
          error: 'missing',
          severity: 'warning'
        });
      }
    }
  }

  return {
    valid: issues.filter(i => i.severity !== 'warning').length === 0,
    issues,
    warnings: issues.filter(i => i.severity === 'warning').length
  };
}
```

---

### Step 4: Add Unit Tests

**New test file:** `tests/unit/adapters/claude.test.js`

```javascript
const fs = require('fs');
const path = require('path');
const claudeAdapter = require('../../../lib/adapters/claude');
const { rimraf } = require('rimraf');

describe('Claude Adapter', () => {
  const testDir = path.join(__dirname, '../../fixtures/claude-test');

  beforeEach(async () => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      await rimraf(testDir);
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up
    if (fs.existsSync(testDir)) {
      await rimraf(testDir);
    }
  });

  describe('generate()', () => {
    it('should generate AI_CONTEXT.md at project root', async () => {
      const analysis = {
        projectName: 'test-project',
        techStack: 'Node.js',
        workflows: [],
        entryPoints: []
      };
      const config = { projectName: 'test-project' };

      const result = await claudeAdapter.generate(analysis, config, testDir);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2); // AI_CONTEXT.md + .claude/ directory
      expect(fs.existsSync(path.join(testDir, 'AI_CONTEXT.md'))).toBe(true);
    });

    it('should generate .claude/ directory structure', async () => {
      const analysis = { projectName: 'test-project', workflows: [] };
      const config = { projectName: 'test-project' };

      const result = await claudeAdapter.generate(analysis, config, testDir);

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'agents'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'commands'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'indexes'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'settings.json'))).toBe(true);
    });

    it('should not overwrite existing .claude/ directory', async () => {
      // Create existing .claude/
      const existingClaudeDir = path.join(testDir, '.claude');
      fs.mkdirSync(existingClaudeDir, { recursive: true });
      fs.writeFileSync(path.join(existingClaudeDir, 'existing.txt'), 'existing content');

      const analysis = { projectName: 'test-project', workflows: [] };
      const config = { projectName: 'test-project' };

      const result = await claudeAdapter.generate(analysis, config, testDir);

      // Should have error about existing directory
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('EXISTS');
      // Existing file should still be there
      expect(fs.existsSync(path.join(existingClaudeDir, 'existing.txt'))).toBe(true);
    });
  });

  describe('validate()', () => {
    it('should return valid when all files exist', async () => {
      // Create expected files
      fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# Test');
      fs.mkdirSync(path.join(testDir, '.claude'), { recursive: true });
      fs.writeFileSync(path.join(testDir, '.claude', 'settings.json'), '{}');

      const result = claudeAdapter.validate(testDir);
      expect(result.valid).toBe(true);
    });

    it('should return warning when .claude/ is missing', async () => {
      fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# Test');

      const result = claudeAdapter.validate(testDir);
      expect(result.valid).toBe(true); // Still valid, just warning
      expect(result.warnings).toBeGreaterThan(0);
    });
  });
});
```

---

## Test Strategy

### Unit Tests
- `tests/unit/adapters/claude.test.js` - Test Claude adapter generation
- Test AI_CONTEXT.md generation
- Test .claude/ directory creation
- Test existing directory handling
- Test validation function

### Integration Tests
- `tests/integration/claude-adapter.test.js` - Full flow test
- Test complete generate() call with real analysis data
- Verify all expected files are created

### Manual Test
```bash
cd /tmp
mkdir test-project && cd test-project
npm init -y
npx create-universal-ai-context

# Verify:
ls -la .claude/
ls -la .claude/agents/
ls -la .claude/commands/
cat .claude/settings.json
```

---

## Rollback Plan

**Safe commit:** Current HEAD (`daf4119`)

**To revert:**
```bash
git revert HEAD
# Or
git reset --hard daf4119
```

**Rollback if:**
- Tests fail after implementation
- Manual testing shows broken behavior
- User reports issues

---

## Approval Required

This plan modifies core adapter behavior. Please review:

1. ✓ Should `.claude/` be generated by default or opt-in?
2. ✓ What to do when `.claude/` already exists? (Plan: skip with warning)
3. ✓ Should we copy all templates or filter? (Plan: copy agents, commands, indexes, context, schemas, standards, tools)
4. ✓ Is the current `.ai-context/` vs `.claude/` distinction clear?

---

**Ready to implement after approval.**
