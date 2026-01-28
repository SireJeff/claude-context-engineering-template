/**
 * Integration tests for create-ai-context CLI
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

const BIN_PATH = path.join(__dirname, '../../bin/create-ai-context.js');
const EXPRESS_FIXTURE = path.join(__dirname, '../../test-fixtures/express-app');

describe('CLI Integration', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-context-test-'));

    // Copy Express fixture to temp dir
    fs.cpSync(EXPRESS_FIXTURE, tempDir, { recursive: true });

    // Clean up any existing generated files
    const dirsToRemove = ['.ai-context', '.github', '.agent', '.git'];
    const filesToRemove = ['AI_CONTEXT.md', '.clinerules'];

    for (const dir of dirsToRemove) {
      const dirPath = path.join(tempDir, dir);
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true });
      }
    }

    for (const file of filesToRemove) {
      const filePath = path.join(tempDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should create .ai-context directory structure', () => {
    execSync(`node "${BIN_PATH}" "${tempDir}" --yes --static`, {
      stdio: 'pipe',
      timeout: 60000
    });

    expect(fs.existsSync(path.join(tempDir, '.ai-context'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.ai-context', 'agents'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.ai-context', 'commands'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.ai-context', 'context'))).toBe(true);
  });

  it('should create AI_CONTEXT.md with populated values', () => {
    execSync(`node "${BIN_PATH}" "${tempDir}" --yes --static`, {
      stdio: 'pipe',
      timeout: 60000
    });

    const aiContextMd = fs.readFileSync(path.join(tempDir, 'AI_CONTEXT.md'), 'utf8');

    // Should have detected tech stack
    expect(aiContextMd.toLowerCase()).toContain('javascript');
  });

  it('should detect entry points from Express routes', () => {
    execSync(`node "${BIN_PATH}" "${tempDir}" --yes --static`, {
      stdio: 'pipe',
      timeout: 60000
    });

    const archSnapshot = path.join(tempDir, '.ai-context', 'context', 'ARCHITECTURE_SNAPSHOT.md');
    if (fs.existsSync(archSnapshot)) {
      const content = fs.readFileSync(archSnapshot, 'utf8');
      expect(content).toContain('Entry Points');
    }
  });

  it('should create INIT_REQUEST.md in AI mode', () => {
    execSync(`node "${BIN_PATH}" "${tempDir}" --yes --force-ai`, {
      stdio: 'pipe',
      timeout: 60000
    });

    expect(fs.existsSync(path.join(tempDir, '.ai-context', 'INIT_REQUEST.md'))).toBe(true);
  });

  it('should generate workflow documentation', () => {
    execSync(`node "${BIN_PATH}" "${tempDir}" --yes --static`, {
      stdio: 'pipe',
      timeout: 60000
    });

    const workflowsDir = path.join(tempDir, '.ai-context/context/workflows');
    expect(fs.existsSync(workflowsDir)).toBe(true);

    const workflows = fs.readdirSync(workflowsDir).filter(f =>
      f.endsWith('.md') && f !== 'WORKFLOW_TEMPLATE.md'
    );
    expect(workflows.length).toBeGreaterThan(0);
  });

  it('should generate all AI tool outputs', () => {
    execSync(`node "${BIN_PATH}" "${tempDir}" --yes --static`, {
      stdio: 'pipe',
      timeout: 60000
    });

    // Claude
    expect(fs.existsSync(path.join(tempDir, 'AI_CONTEXT.md'))).toBe(true);

    // Copilot
    expect(fs.existsSync(path.join(tempDir, '.github/copilot-instructions.md'))).toBe(true);

    // Cline
    expect(fs.existsSync(path.join(tempDir, '.clinerules'))).toBe(true);

    // Antigravity
    expect(fs.existsSync(path.join(tempDir, '.agent'))).toBe(true);
  });
});
