/**
 * Integration tests for create-claude-context CLI
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

describe('CLI Integration', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-test-'));

    // Copy Express fixture to temp dir
    const fixtureDir = path.join(__dirname, 'fixtures', 'express-app');
    fs.cpSync(fixtureDir, tempDir, { recursive: true });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should create .claude directory structure', () => {
    const binPath = path.join(__dirname, '../../bin/create-claude-context.js');

    execSync(`node "${binPath}" --yes --static --no-git`, {
      cwd: tempDir,
      stdio: 'pipe'
    });

    expect(fs.existsSync(path.join(tempDir, '.claude'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.claude', 'agents'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.claude', 'commands'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.claude', 'context'))).toBe(true);
  });

  it('should create CLAUDE.md with populated values', () => {
    const binPath = path.join(__dirname, '../../bin/create-claude-context.js');

    execSync(`node "${binPath}" --yes --static --no-git`, {
      cwd: tempDir,
      stdio: 'pipe'
    });

    const claudeMd = fs.readFileSync(path.join(tempDir, 'CLAUDE.md'), 'utf8');

    // Should not have unreplaced placeholders
    expect(claudeMd).not.toMatch(/\{\{[A-Z_]+\}\}/);

    // Should have detected tech stack
    expect(claudeMd.toLowerCase()).toContain('express');
  });

  it('should detect entry points from Express routes', () => {
    const binPath = path.join(__dirname, '../../bin/create-claude-context.js');

    execSync(`node "${binPath}" --yes --static --no-git`, {
      cwd: tempDir,
      stdio: 'pipe'
    });

    const archSnapshot = path.join(tempDir, '.claude', 'context', 'ARCHITECTURE_SNAPSHOT.md');
    if (fs.existsSync(archSnapshot)) {
      const content = fs.readFileSync(archSnapshot, 'utf8');
      expect(content).toContain('Entry Points');
    }
  });

  it('should create INIT_REQUEST.md in AI mode', () => {
    const binPath = path.join(__dirname, '../../bin/create-claude-context.js');

    execSync(`node "${binPath}" --yes --ai --no-git`, {
      cwd: tempDir,
      stdio: 'pipe',
      env: { ...process.env, CLAUDE_CODE_SESSION: 'test-session' }
    });

    expect(fs.existsSync(path.join(tempDir, '.claude', 'INIT_REQUEST.md'))).toBe(true);
  });
});
