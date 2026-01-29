/**
 * Unit tests for Claude Adapter
 */

const fs = require('fs');
const path = require('path');
const claudeAdapter = require('../../../lib/adapters/claude');

describe('Claude Adapter', () => {
  const testDir = path.join(__dirname, '../../fixtures/claude-adapter-test');

  beforeEach(async () => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('metadata', () => {
    it('should have correct adapter name', () => {
      expect(claudeAdapter.name).toBe('claude');
    });

    it('should have correct display name', () => {
      expect(claudeAdapter.displayName).toBe('Claude Code');
    });

    it('should have multi-file output type', () => {
      expect(claudeAdapter.outputType).toBe('multi-file');
    });

    it('should have correct output path', () => {
      expect(claudeAdapter.outputPath).toBe('.claude/');
    });
  });

  describe('getOutputPath()', () => {
    it('should return path to AI_CONTEXT.md', () => {
      const result = claudeAdapter.getOutputPath('/test/project');
      // Normalize path for cross-platform compatibility
      expect(result).toContain('AI_CONTEXT.md');
      expect(path.basename(result)).toBe('AI_CONTEXT.md');
    });
  });

  describe('exists()', () => {
    it('should return false when neither file nor directory exists', () => {
      const result = claudeAdapter.exists(testDir);
      expect(result).toBe(false);
    });

    it('should return true when AI_CONTEXT.md exists', () => {
      fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# Test');
      const result = claudeAdapter.exists(testDir);
      expect(result).toBe(true);
    });

    it('should return true when .claude/ directory exists', () => {
      fs.mkdirSync(path.join(testDir, '.claude'), { recursive: true });
      const result = claudeAdapter.exists(testDir);
      expect(result).toBe(true);
    });
  });

  describe('generate()', () => {
    const mockAnalysis = {
      projectName: 'test-project',
      techStack: 'Node.js',
      workflows: [],
      entryPoints: []
    };
    const mockConfig = { projectName: 'test-project' };

    it('should generate AI_CONTEXT.md at project root', async () => {
      const result = await claudeAdapter.generate(mockAnalysis, mockConfig, testDir);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(testDir, 'AI_CONTEXT.md'))).toBe(true);
    });

    it('should generate .claude/ directory structure', async () => {
      const result = await claudeAdapter.generate(mockAnalysis, mockConfig, testDir);

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'agents'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'commands'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'indexes'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', 'settings.json'))).toBe(true);
    });

    it('should generate .claude/settings.json with correct structure', async () => {
      await claudeAdapter.generate(mockAnalysis, mockConfig, testDir);

      const settingsPath = path.join(testDir, '.claude', 'settings.json');
      expect(fs.existsSync(settingsPath)).toBe(true);

      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      expect(settings.version).toBe('2.1.0');
      expect(settings.project.name).toBe('test-project');
      expect(settings.agents.context_engineer).toBe('enabled');
      expect(settings.commands.rpi_workflow).toBe('enabled');
    });

    it('should generate .claude/README.md', async () => {
      await claudeAdapter.generate(mockAnalysis, mockConfig, testDir);

      const readmePath = path.join(testDir, '.claude', 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);

      const readme = fs.readFileSync(readmePath, 'utf-8');
      expect(readme).toContain('.claude Configuration');
      expect(readme).toContain('@context-engineer');
    });

    it('should not overwrite existing .claude/ directory', async () => {
      // Create existing .claude/ with custom content
      const existingClaudeDir = path.join(testDir, '.claude');
      fs.mkdirSync(existingClaudeDir, { recursive: true });
      const existingFile = path.join(existingClaudeDir, 'existing.txt');
      fs.writeFileSync(existingFile, 'existing content');

      const result = await claudeAdapter.generate(mockAnalysis, mockConfig, testDir);

      // Should have warning about existing directory
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('EXISTS');
      // Existing file should still be there
      expect(fs.existsSync(existingFile)).toBe(true);
      expect(fs.readFileSync(existingFile, 'utf-8')).toBe('existing content');
    });

    it('should still generate AI_CONTEXT.md even when .claude/ exists', async () => {
      // Create existing .claude/
      fs.mkdirSync(path.join(testDir, '.claude'), { recursive: true });

      const result = await claudeAdapter.generate(mockAnalysis, mockConfig, testDir);

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'AI_CONTEXT.md'))).toBe(true);
    });
  });

  describe('validate()', () => {
    it('should return valid when all files exist', () => {
      // Create expected files
      fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# Test Project\n\nThis is a test.');
      fs.mkdirSync(path.join(testDir, '.claude'), { recursive: true });
      fs.writeFileSync(path.join(testDir, '.claude', 'settings.json'), '{}');
      fs.writeFileSync(path.join(testDir, '.claude', 'README.md'), '# Claude Config');

      const result = claudeAdapter.validate(testDir);
      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('should return invalid when AI_CONTEXT.md is missing', () => {
      const result = claudeAdapter.validate(testDir);
      expect(result.valid).toBe(false);
      expect(result.issues).toBeDefined();
      expect(result.issues.some(i => i.file === 'AI_CONTEXT.md')).toBe(true);
    });

    it('should return warning when .claude/ is missing but AI_CONTEXT.md exists', () => {
      fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# Test');

      const result = claudeAdapter.validate(testDir);
      expect(result.valid).toBe(true); // Still valid, just warning
      expect(result.warnings).toBeGreaterThan(0);
      expect(result.issues.some(i => i.file === '.claude/')).toBe(true);
    });

    it('should detect unreplaced placeholders in AI_CONTEXT.md', () => {
      fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# {{PROJECT_NAME}}\n\nTech: {{TECH_STACK}}');

      const result = claudeAdapter.validate(testDir);
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.error.includes('unreplaced placeholders'))).toBe(true);
    });

    it('should warn when .claude/settings.json is missing', () => {
      fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# Test');
      fs.mkdirSync(path.join(testDir, '.claude'), { recursive: true });

      const result = claudeAdapter.validate(testDir);
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeGreaterThan(0);
    });
  });
});
