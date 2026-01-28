/**
 * Tests for installation validator
 */

const path = require('path');
const fs = require('fs');
const {
  validateInstallation,
  countFiles,
  REQUIRED_STRUCTURE
} = require('../../lib/validate');

describe('validateInstallation', () => {
  const testDir = path.join(__dirname, 'test-validate-dir');

  beforeEach(() => {
    // Clean up and create fresh test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  test('fails for empty directory', async () => {
    const result = await validateInstallation(testDir);
    expect(result.passed).toBe(false);
    expect(result.errors).toBeGreaterThan(0);
  });

  test('returns expected structure', async () => {
    const result = await validateInstallation(testDir);

    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('checks');
    expect(Array.isArray(result.checks)).toBe(true);
  });

  test('checks array contains check details', async () => {
    const result = await validateInstallation(testDir);

    result.checks.forEach(check => {
      expect(check).toHaveProperty('type');
      expect(check).toHaveProperty('path');
      expect(check).toHaveProperty('status');
    });
  });

  test('passes with valid structure', async () => {
    // Create minimal valid structure
    fs.mkdirSync(path.join(testDir, '.ai-context', 'context'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.ai-context', 'research'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.ai-context', 'plans'), { recursive: true });

    fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# AI_CONTEXT.md');
    fs.writeFileSync(path.join(testDir, '.ai-context', 'README.md'), '# README');
    fs.writeFileSync(path.join(testDir, '.ai-context', 'settings.json'), '{}');
    fs.writeFileSync(
      path.join(testDir, '.ai-context', 'context', 'WORKFLOW_INDEX.md'),
      '# Workflow Index'
    );

    const result = await validateInstallation(testDir);
    expect(result.passed).toBe(true);
  });

  test('warns about remaining placeholders', async () => {
    // Create structure with placeholders
    fs.mkdirSync(path.join(testDir, '.ai-context', 'context'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.ai-context', 'research'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.ai-context', 'plans'), { recursive: true });

    fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# {{PROJECT_NAME}}');
    fs.writeFileSync(path.join(testDir, '.ai-context', 'README.md'), '# README');
    fs.writeFileSync(path.join(testDir, '.ai-context', 'settings.json'), '{}');
    fs.writeFileSync(
      path.join(testDir, '.ai-context', 'context', 'WORKFLOW_INDEX.md'),
      '# Workflow Index'
    );

    const result = await validateInstallation(testDir);
    expect(result.warnings).toBeGreaterThan(0);
  });

  test('fails for invalid JSON in settings', async () => {
    fs.mkdirSync(path.join(testDir, '.ai-context', 'context'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.ai-context', 'research'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.ai-context', 'plans'), { recursive: true });

    fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# AI_CONTEXT.md');
    fs.writeFileSync(path.join(testDir, '.ai-context', 'README.md'), '# README');
    fs.writeFileSync(path.join(testDir, '.ai-context', 'settings.json'), 'invalid json');
    fs.writeFileSync(
      path.join(testDir, '.ai-context', 'context', 'WORKFLOW_INDEX.md'),
      '# Workflow Index'
    );

    const result = await validateInstallation(testDir);
    expect(result.passed).toBe(false);
  });
});

describe('countFiles', () => {
  const testDir = path.join(__dirname, 'test-count-dir');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  test('returns 0 for empty directory', () => {
    expect(countFiles(testDir)).toBe(0);
  });

  test('counts files correctly', () => {
    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content');
    fs.writeFileSync(path.join(testDir, 'file2.txt'), 'content');
    expect(countFiles(testDir)).toBe(2);
  });

  test('counts files in subdirectories', () => {
    fs.mkdirSync(path.join(testDir, 'subdir'));
    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content');
    fs.writeFileSync(path.join(testDir, 'subdir', 'file2.txt'), 'content');
    expect(countFiles(testDir)).toBe(2);
  });

  test('returns 0 for non-existent directory', () => {
    expect(countFiles('/non/existent/path')).toBe(0);
  });
});

describe('REQUIRED_STRUCTURE', () => {
  test('has directories array', () => {
    expect(REQUIRED_STRUCTURE).toHaveProperty('directories');
    expect(Array.isArray(REQUIRED_STRUCTURE.directories)).toBe(true);
  });

  test('has files array', () => {
    expect(REQUIRED_STRUCTURE).toHaveProperty('files');
    expect(Array.isArray(REQUIRED_STRUCTURE.files)).toBe(true);
  });

  test('directories include .ai-context', () => {
    expect(REQUIRED_STRUCTURE.directories).toContain('.ai-context');
  });

  test('files include AI_CONTEXT.md', () => {
    expect(REQUIRED_STRUCTURE.files).toContain('AI_CONTEXT.md');
  });
});
