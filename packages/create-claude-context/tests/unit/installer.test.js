/**
 * Tests for file installer
 */

const path = require('path');
const fs = require('fs');
const {
  createDirectoryStructure,
  DIRECTORY_STRUCTURE
} = require('../../lib/installer');

describe('createDirectoryStructure', () => {
  const testDir = path.join(__dirname, 'test-install-dir');

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  test('creates .claude directory', async () => {
    await createDirectoryStructure(testDir, {});
    expect(fs.existsSync(path.join(testDir, '.claude'))).toBe(true);
  });

  test('creates core directories', async () => {
    await createDirectoryStructure(testDir, {});

    const expectedDirs = ['agents', 'commands', 'context', 'indexes', 'plans', 'research'];
    for (const dir of expectedDirs) {
      expect(fs.existsSync(path.join(testDir, '.claude', dir))).toBe(true);
    }
  });

  test('creates nested directories', async () => {
    await createDirectoryStructure(testDir, {});

    expect(fs.existsSync(path.join(testDir, '.claude', 'plans', 'active'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.claude', 'plans', 'completed'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.claude', 'research', 'active'))).toBe(true);
  });

  test('returns count of directories created', async () => {
    const count = await createDirectoryStructure(testDir, {});
    expect(count).toBeGreaterThan(10);
  });

  test('is idempotent (running twice does not fail)', async () => {
    await createDirectoryStructure(testDir, {});
    const count2 = await createDirectoryStructure(testDir, {});
    // Second run should create 0 directories (they already exist)
    expect(count2).toBe(0);
  });

  test('filters out ci-templates when ci feature disabled', async () => {
    await createDirectoryStructure(testDir, { features: { ci: false } });
    expect(fs.existsSync(path.join(testDir, '.claude', 'ci-templates'))).toBe(false);
  });

  test('includes ci-templates when ci feature enabled', async () => {
    await createDirectoryStructure(testDir, { features: { ci: true } });
    expect(fs.existsSync(path.join(testDir, '.claude', 'ci-templates'))).toBe(true);
  });

  test('filters out team when team feature disabled', async () => {
    await createDirectoryStructure(testDir, { features: { team: false } });
    expect(fs.existsSync(path.join(testDir, '.claude', 'team'))).toBe(false);
  });
});

describe('DIRECTORY_STRUCTURE', () => {
  test('is an array', () => {
    expect(Array.isArray(DIRECTORY_STRUCTURE)).toBe(true);
  });

  test('has expected number of directories', () => {
    expect(DIRECTORY_STRUCTURE.length).toBeGreaterThan(20);
  });

  test('includes core directories', () => {
    expect(DIRECTORY_STRUCTURE).toContain('agents');
    expect(DIRECTORY_STRUCTURE).toContain('commands');
    expect(DIRECTORY_STRUCTURE).toContain('context');
    expect(DIRECTORY_STRUCTURE).toContain('indexes');
  });

  test('includes nested paths', () => {
    expect(DIRECTORY_STRUCTURE).toContain('plans/active');
    expect(DIRECTORY_STRUCTURE).toContain('plans/completed');
    expect(DIRECTORY_STRUCTURE).toContain('research/active');
  });

  test('all paths are strings', () => {
    DIRECTORY_STRUCTURE.forEach(dir => {
      expect(typeof dir).toBe('string');
    });
  });
});
