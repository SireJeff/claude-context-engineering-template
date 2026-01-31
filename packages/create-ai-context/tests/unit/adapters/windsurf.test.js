/**
 * Windsurf Adapter Tests
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const windsurfAdapter = require('../../../lib/adapters/windsurf');

describe('Windsurf Adapter', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'windsurf-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('metadata', () => {
    it('should have correct adapter name', () => {
      expect(windsurfAdapter.name).toBe('windsurf');
    });

    it('should have correct display name', () => {
      expect(windsurfAdapter.displayName).toBe('Windsurf IDE');
    });

    it('should have correct output path', () => {
      expect(windsurfAdapter.outputPath).toBe('.windsurf/rules.md');
    });

    it('should have single-file output type', () => {
      expect(windsurfAdapter.outputType).toBe('single-file');
    });
  });

  describe('getOutputPath()', () => {
    it('should return path to .windsurf/rules.md', () => {
      const outputPath = windsurfAdapter.getOutputPath(tempDir);
      expect(outputPath).toContain('.windsurf');
      expect(outputPath).toContain('rules.md');
    });
  });

  describe('exists()', () => {
    it('should return false when neither file nor directory exists', () => {
      expect(windsurfAdapter.exists(tempDir)).toBe(false);
    });

    it('should return true when .windsurf/rules.md exists', () => {
      const windsurfDir = path.join(tempDir, '.windsurf');
      fs.mkdirSync(windsurfDir, { recursive: true });
      fs.writeFileSync(path.join(windsurfDir, 'rules.md'), '# Rules');
      expect(windsurfAdapter.exists(tempDir)).toBe(true);
    });

    it('should return true when .windsurf/ directory exists (even without rules.md)', () => {
      const windsurfDir = path.join(tempDir, '.windsurf');
      fs.mkdirSync(windsurfDir, { recursive: true });
      expect(windsurfAdapter.exists(tempDir)).toBe(true);
    });
  });

  describe('generate()', () => {
    const mockAnalysis = {
      techStack: { languages: ['TypeScript', 'React', 'Node'] },
      entryPoints: [],
      workflows: [],
      architecture: {}
    };

    const mockConfig = {
      projectName: 'test-project',
      verbose: false
    };

    it('should generate .windsurf/rules.md', async () => {
      const result = await windsurfAdapter.generate(mockAnalysis, mockConfig, tempDir);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].relativePath).toBe('.windsurf/rules.md');
    });

    it('should create .windsurf directory if it does not exist', async () => {
      await windsurfAdapter.generate(mockAnalysis, mockConfig, tempDir);

      const windsurfDir = path.join(tempDir, '.windsurf');
      expect(fs.existsSync(windsurfDir)).toBe(true);
    });

    it('should include project information in generated file', async () => {
      await windsurfAdapter.generate(mockAnalysis, mockConfig, tempDir);

      const rulesPath = windsurfAdapter.getOutputPath(tempDir);
      const content = fs.readFileSync(rulesPath, 'utf-8');
      expect(content).toContain('test-project');
      expect(content).toContain('TypeScript');
    });

    it('should return EXISTS_CUSTOM error when custom file exists and force is false', async () => {
      const windsurfDir = path.join(tempDir, '.windsurf');
      fs.mkdirSync(windsurfDir, { recursive: true });
      const rulesPath = path.join(windsurfDir, 'rules.md');
      fs.writeFileSync(rulesPath, '# Custom rules');

      const result = await windsurfAdapter.generate(mockAnalysis, mockConfig, tempDir);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('EXISTS_CUSTOM');
    });

    it('should regenerate when force is true', async () => {
      const windsurfDir = path.join(tempDir, '.windsurf');
      fs.mkdirSync(windsurfDir, { recursive: true });
      const rulesPath = path.join(windsurfDir, 'rules.md');
      fs.writeFileSync(rulesPath, '# Old rules');

      const result = await windsurfAdapter.generate(mockAnalysis, { ...mockConfig, force: true }, tempDir);

      expect(result.success).toBe(true);
      const content = fs.readFileSync(rulesPath, 'utf-8');
      expect(content).toContain('test-project');
      expect(content).not.toContain('# Old rules');
    });
  });

  describe('validate()', () => {
    it('should return valid when rules.md exists with no placeholders', () => {
      const windsurfDir = path.join(tempDir, '.windsurf');
      fs.mkdirSync(windsurfDir, { recursive: true });
      const rulesPath = path.join(windsurfDir, 'rules.md');
      fs.writeFileSync(rulesPath, '# Valid rules with no placeholders');

      const validation = windsurfAdapter.validate(tempDir);

      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should return invalid when rules.md does not exist', () => {
      const validation = windsurfAdapter.validate(tempDir);

      expect(validation.valid).toBe(false);
      expect(validation.issues).toHaveLength(1);
      expect(validation.issues[0].file).toBe('.windsurf/rules.md');
      expect(validation.issues[0].error).toContain('not found');
    });

    it('should return invalid when rules.md contains placeholders', () => {
      const windsurfDir = path.join(tempDir, '.windsurf');
      fs.mkdirSync(windsurfDir, { recursive: true });
      const rulesPath = path.join(windsurfDir, 'rules.md');
      fs.writeFileSync(rulesPath, '# Rules with {{PLACEHOLDER}}');

      const validation = windsurfAdapter.validate(tempDir);

      expect(validation.valid).toBe(false);
      expect(validation.issues).toHaveLength(1);
      expect(validation.issues[0].error).toContain('1 unreplaced placeholder');
    });
  });
});
