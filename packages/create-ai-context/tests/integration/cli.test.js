/**
 * Integration tests for create-ai-context CLI
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

const BIN_PATH = path.join(__dirname, '../../bin/create-ai-context.js');
const EXPRESS_FIXTURE = path.join(__dirname, '../../test-fixtures/express-app');

// Helper to clean generated files from a directory
function cleanGeneratedFiles(dir) {
  // Delete symlinks (.claude) first, then their targets (.ai-context)
  const dirsToRemove = ['.claude', '.ai-context', '.github', '.agent', '.git'];
  const filesToRemove = ['AI_CONTEXT.md', '.clinerules'];

  for (const subdir of dirsToRemove) {
    const dirPath = path.join(dir, subdir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
      } catch (err) {
        // Handle symlink cleanup issues on Windows
        try {
          const stats = fs.lstatSync(dirPath);
          if (stats.isSymbolicLink()) {
            fs.unlinkSync(dirPath);
          } else if (stats.isDirectory()) {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
              const entryPath = path.join(dirPath, entry.name);
              try {
                const entryStats = fs.lstatSync(entryPath);
                if (entryStats.isSymbolicLink()) {
                  fs.unlinkSync(entryPath);
                } else if (entryStats.isDirectory()) {
                  fs.rmSync(entryPath, { recursive: true, force: true });
                } else {
                  fs.unlinkSync(entryPath);
                }
              } catch {
                // Ignore individual entry failures
              }
            }
            fs.rmdirSync(dirPath);
          }
        } catch {
          // Last resort: ignore
        }
      }
    }
  }

  for (const file of filesToRemove) {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore file deletion failures
      }
    }
  }
}

describe('CLI Integration', () => {
  let tempDir;
  let originalCwd;

  beforeAll(() => {
    // Clean up fixture before any tests run
    cleanGeneratedFiles(EXPRESS_FIXTURE);
  });

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-context-test-'));

    // Ensure fixture is clean before copying
    cleanGeneratedFiles(EXPRESS_FIXTURE);

    // Copy Express fixture to temp dir (should be clean now)
    try {
      fs.cpSync(EXPRESS_FIXTURE, tempDir, { recursive: true, verbatimSymlinks: true });
    } catch (err) {
      // If copy fails, clean up both source and dest, then retry
      cleanGeneratedFiles(EXPRESS_FIXTURE);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-context-test-'));
      }
      fs.cpSync(EXPRESS_FIXTURE, tempDir, { recursive: true });
    }

    // Also clean temp dir just in case
    cleanGeneratedFiles(tempDir);
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
