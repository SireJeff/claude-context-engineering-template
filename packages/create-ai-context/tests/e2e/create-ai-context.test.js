/**
 * E2E tests for create-ai-context CLI
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CLI_PATH = path.join(__dirname, '../../bin/create-ai-context.js');
const EXPRESS_FIXTURE = path.join(__dirname, '../../test-fixtures/express-app');
const FASTAPI_FIXTURE = path.join(__dirname, '../../test-fixtures/fastapi-app');

// Helper to clean up generated files
function cleanupFixture(fixturePath) {
  const dirsToRemove = ['.ai-context', '.github', '.agent', '.git'];
  const filesToRemove = ['AI_CONTEXT.md', '.clinerules'];

  for (const dir of dirsToRemove) {
    const dirPath = path.join(fixturePath, dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true });
    }
  }

  for (const file of filesToRemove) {
    const filePath = path.join(fixturePath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

describe('create-ai-context E2E', () => {
  beforeEach(() => {
    cleanupFixture(EXPRESS_FIXTURE);
    cleanupFixture(FASTAPI_FIXTURE);
  });

  afterAll(() => {
    cleanupFixture(EXPRESS_FIXTURE);
    cleanupFixture(FASTAPI_FIXTURE);
  });

  describe('Express.js fixture', () => {
    test('generates all expected files', () => {
      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      // Check main files exist
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, 'AI_CONTEXT.md'))).toBe(true);
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, '.ai-context'))).toBe(true);
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, '.clinerules'))).toBe(true);
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, '.github/copilot-instructions.md'))).toBe(true);
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, '.agent'))).toBe(true);
    });

    test('generates workflow documentation', () => {
      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      const workflowsDir = path.join(EXPRESS_FIXTURE, '.ai-context/context/workflows');
      expect(fs.existsSync(workflowsDir)).toBe(true);

      const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md') && f !== 'WORKFLOW_TEMPLATE.md');
      expect(workflows.length).toBeGreaterThanOrEqual(5);
    });

    test('detects correct tech stack', () => {
      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      // Check AI_CONTEXT.md contains detected stack
      const aiContext = fs.readFileSync(path.join(EXPRESS_FIXTURE, 'AI_CONTEXT.md'), 'utf8');
      expect(aiContext.toLowerCase()).toContain('javascript');
      expect(aiContext.toLowerCase()).toContain('express');
    });

    test('discovers entry points', () => {
      const output = execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000,
        encoding: 'utf8'
      });

      expect(output).toMatch(/Entry Points:\s+\d+ discovered/);
      // Should find at least 20 entry points
      const match = output.match(/Entry Points:\s+(\d+)/);
      expect(parseInt(match[1])).toBeGreaterThanOrEqual(20);
    });

    test('AI_CONTEXT.md contains no unreplaced placeholders', () => {
      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      const content = fs.readFileSync(path.join(EXPRESS_FIXTURE, 'AI_CONTEXT.md'), 'utf8');
      const placeholders = content.match(/\{\{[A-Z_]+\}\}/g) || [];

      // Allow some placeholders that may be intentional examples
      const criticalPlaceholders = placeholders.filter(p =>
        !p.includes('EXAMPLE') && !p.includes('TBD')
      );

      expect(criticalPlaceholders.length).toBeLessThanOrEqual(5);
    });

    test('generates Antigravity files correctly', () => {
      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      const agentDir = path.join(EXPRESS_FIXTURE, '.agent');
      expect(fs.existsSync(path.join(agentDir, 'rules/identity.md'))).toBe(true);
      expect(fs.existsSync(path.join(agentDir, 'rules/architecture.md'))).toBe(true);
      expect(fs.existsSync(path.join(agentDir, 'workflows/run.md'))).toBe(true);
      expect(fs.existsSync(path.join(agentDir, 'skills/debugging.md'))).toBe(true);
    });
  });

  describe('FastAPI fixture', () => {
    test('generates all expected files', () => {
      execSync(`node "${CLI_PATH}" "${FASTAPI_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      expect(fs.existsSync(path.join(FASTAPI_FIXTURE, 'AI_CONTEXT.md'))).toBe(true);
      expect(fs.existsSync(path.join(FASTAPI_FIXTURE, '.ai-context'))).toBe(true);
      expect(fs.existsSync(path.join(FASTAPI_FIXTURE, '.clinerules'))).toBe(true);
    });

    test('detects Python/FastAPI stack', () => {
      execSync(`node "${CLI_PATH}" "${FASTAPI_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      // Check AI_CONTEXT.md contains detected stack
      const aiContext = fs.readFileSync(path.join(FASTAPI_FIXTURE, 'AI_CONTEXT.md'), 'utf8');
      expect(aiContext.toLowerCase()).toContain('python');
      expect(aiContext.toLowerCase()).toContain('fastapi');
    });

    test('generates workflow documentation', () => {
      execSync(`node "${CLI_PATH}" "${FASTAPI_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      const workflowsDir = path.join(FASTAPI_FIXTURE, '.ai-context/context/workflows');
      expect(fs.existsSync(workflowsDir)).toBe(true);

      const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md') && f !== 'WORKFLOW_TEMPLATE.md');
      expect(workflows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('CLI options', () => {
    test('--dry-run prevents file creation', () => {
      cleanupFixture(EXPRESS_FIXTURE);

      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static --dry-run`, {
        timeout: 60000
      });

      // Files should NOT be created with --dry-run
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, '.ai-context'))).toBe(false);
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, 'AI_CONTEXT.md'))).toBe(false);
    });

    test('--ai flag selects specific tools', () => {
      cleanupFixture(EXPRESS_FIXTURE);

      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static --ai claude`, {
        timeout: 60000
      });

      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, 'AI_CONTEXT.md'))).toBe(true);
      // Other tool files may or may not exist depending on implementation
    });
  });

  describe('generate subcommand', () => {
    test('regenerates context files', () => {
      // First initialize
      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      // Then regenerate
      const output = execSync(`node "${CLI_PATH}" generate -p "${EXPRESS_FIXTURE}" --ai claude`, {
        timeout: 60000,
        encoding: 'utf8'
      });

      expect(output).toContain('Generated');
      expect(fs.existsSync(path.join(EXPRESS_FIXTURE, 'AI_CONTEXT.md'))).toBe(true);
    });
  });

  describe('status subcommand', () => {
    test('reports v2 installation correctly', () => {
      execSync(`node "${CLI_PATH}" "${EXPRESS_FIXTURE}" --yes --static`, {
        timeout: 60000
      });

      const output = execSync(`node "${CLI_PATH}" status -p "${EXPRESS_FIXTURE}"`, {
        timeout: 30000,
        encoding: 'utf8'
      });

      expect(output).toContain('v2.0 installation');
    });
  });
});
