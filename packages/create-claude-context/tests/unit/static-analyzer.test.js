/**
 * Unit tests for static-analyzer.js
 */

const path = require('path');
const fs = require('fs');

// Mock dependencies
jest.mock('fs');
jest.mock('glob', () => ({
  glob: jest.fn()
}));

const { glob } = require('glob');
const {
  analyzeCodebase,
  findSourceFiles,
  discoverEntryPoints,
  discoverWorkflows,
  mapArchitecture,
  extractDependencies,
  countLinesOfCode,
  ENTRY_PATTERNS,
  WORKFLOW_HEURISTICS,
  SOURCE_EXTENSIONS,
  EXCLUDED_DIRS
} = require('../../lib/static-analyzer');

describe('static-analyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('');
    fs.readdirSync.mockReturnValue([]);
    glob.mockResolvedValue([]);
  });

  describe('findSourceFiles', () => {
    it('should find JavaScript files', async () => {
      glob.mockResolvedValue(['src/index.js', 'src/app.js']);

      const result = await findSourceFiles('/project', ['javascript']);

      expect(glob).toHaveBeenCalled();
      expect(result).toEqual(['src/index.js', 'src/app.js']);
    });

    it('should find all source files when no languages specified', async () => {
      glob.mockResolvedValue(['src/index.js', 'src/main.py']);

      const result = await findSourceFiles('/project');

      expect(result).toEqual(['src/index.js', 'src/main.py']);
    });

    it('should exclude node_modules and other excluded dirs', async () => {
      const result = await findSourceFiles('/project');

      const globCall = glob.mock.calls[0];
      expect(globCall[1].ignore).toContain('**/node_modules/**');
    });
  });

  describe('discoverEntryPoints', () => {
    it('should discover Express routes', async () => {
      const sourceFiles = ['routes/api.js'];
      const techStack = { frameworks: ['express'] };

      fs.readFileSync.mockReturnValue(`
        app.get('/users', getUsers);
        app.post('/users', createUser);
      `);

      const result = await discoverEntryPoints('/project', sourceFiles, techStack);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('file');
      expect(result[0]).toHaveProperty('line');
    });

    it('should deduplicate entry points by file:line', async () => {
      const sourceFiles = ['routes/api.js'];
      const techStack = { frameworks: ['express'] };

      fs.readFileSync.mockReturnValue(`app.get('/users', getUsers);`);

      const result = await discoverEntryPoints('/project', sourceFiles, techStack);

      const uniqueKeys = new Set(result.map(ep => `${ep.file}:${ep.line}`));
      expect(uniqueKeys.size).toBe(result.length);
    });

    it('should handle files that cannot be read', async () => {
      const sourceFiles = ['routes/api.js'];
      const techStack = { frameworks: ['express'] };

      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const result = await discoverEntryPoints('/project', sourceFiles, techStack);

      expect(result).toEqual([]);
    });
  });

  describe('discoverWorkflows', () => {
    it('should discover authentication workflow', async () => {
      const sourceFiles = ['auth/login.js', 'auth/logout.js'];

      fs.readFileSync.mockReturnValue('login logout session token jwt');

      const result = await discoverWorkflows('/project', sourceFiles);

      const authWorkflow = result.find(w => w.type === 'authentication');
      expect(authWorkflow).toBeDefined();
      expect(authWorkflow.name).toBe('User Authentication');
    });

    it('should calculate confidence scores', async () => {
      const sourceFiles = ['auth/login.js'];

      fs.readFileSync.mockReturnValue('login logout session token jwt password');

      const result = await discoverWorkflows('/project', sourceFiles);

      const authWorkflow = result.find(w => w.type === 'authentication');
      expect(authWorkflow.confidence).toBeGreaterThan(0);
    });

    it('should sort workflows by priority and confidence', async () => {
      const sourceFiles = ['auth/login.js', 'api/routes.js'];

      fs.readFileSync.mockReturnValue('login logout api endpoint route');

      const result = await discoverWorkflows('/project', sourceFiles);

      // Lower priority number = higher priority
      for (let i = 1; i < result.length; i++) {
        if (result[i].priority === result[i - 1].priority) {
          expect(result[i].confidence).toBeLessThanOrEqual(result[i - 1].confidence);
        }
      }
    });
  });

  describe('mapArchitecture', () => {
    it('should identify architectural layers', async () => {
      fs.readdirSync.mockReturnValue([
        { name: 'src', isDirectory: () => true },
        { name: 'controllers', isDirectory: () => true },
        { name: 'models', isDirectory: () => true },
        { name: 'package.json', isDirectory: () => false }
      ]);

      const result = await mapArchitecture('/project');

      expect(result.directories).toContain('src');
      expect(result.directories).toContain('controllers');
      expect(result.directories).toContain('models');
      expect(result.layers.length).toBeGreaterThan(0);
    });

    it('should exclude hidden directories', async () => {
      fs.readdirSync.mockReturnValue([
        { name: '.git', isDirectory: () => true },
        { name: 'src', isDirectory: () => true }
      ]);

      const result = await mapArchitecture('/project');

      expect(result.directories).not.toContain('.git');
      expect(result.directories).toContain('src');
    });

    it('should build directory tree', async () => {
      fs.readdirSync.mockReturnValue([
        { name: 'src', isDirectory: () => true }
      ]);

      const result = await mapArchitecture('/project');

      expect(result.directoryTree).toBeDefined();
    });
  });

  describe('extractDependencies', () => {
    it('should extract npm dependencies from package.json', async () => {
      fs.existsSync.mockImplementation(p => p.includes('package.json'));
      fs.readFileSync.mockReturnValue(JSON.stringify({
        dependencies: { express: '^4.18.0' },
        devDependencies: { jest: '^29.0.0' }
      }));

      const result = await extractDependencies('/project');

      expect(result.find(d => d.name === 'express')).toBeDefined();
      expect(result.find(d => d.name === 'jest')).toBeDefined();
      expect(result.find(d => d.name === 'jest').type).toBe('dev');
    });

    it('should extract pip dependencies from requirements.txt', async () => {
      fs.existsSync.mockImplementation(p => p.includes('requirements.txt'));
      fs.readFileSync.mockReturnValue('flask==2.0.0\nrequests>=2.28.0');

      const result = await extractDependencies('/project');

      expect(result.find(d => d.name === 'flask')).toBeDefined();
      expect(result.find(d => d.name === 'requests')).toBeDefined();
    });

    it('should handle missing dependency files', async () => {
      fs.existsSync.mockReturnValue(false);

      const result = await extractDependencies('/project');

      expect(result).toEqual([]);
    });
  });

  describe('countLinesOfCode', () => {
    it('should count lines in source files', async () => {
      const sourceFiles = ['src/index.js', 'src/app.js'];

      fs.readFileSync.mockReturnValue('line1\nline2\nline3\n');

      const result = await countLinesOfCode('/project', sourceFiles);

      expect(result.total).toBeGreaterThan(0);
      expect(result.byFile['src/index.js']).toBe(3);
    });

    it('should handle empty files', async () => {
      const sourceFiles = ['src/empty.js'];

      fs.readFileSync.mockReturnValue('');

      const result = await countLinesOfCode('/project', sourceFiles);

      expect(result.byFile['src/empty.js']).toBe(0);
    });
  });

  describe('analyzeCodebase', () => {
    it('should return complete analysis structure', async () => {
      glob.mockResolvedValue(['src/index.js']);
      fs.readFileSync.mockReturnValue('');
      fs.readdirSync.mockReturnValue([]);

      const result = await analyzeCodebase('/project', { techStack: {} });

      expect(result).toHaveProperty('sourceFiles');
      expect(result).toHaveProperty('entryPoints');
      expect(result).toHaveProperty('workflows');
      expect(result).toHaveProperty('architecture');
      expect(result).toHaveProperty('dependencies');
      expect(result).toHaveProperty('linesOfCode');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('analyzedAt');
    });

    it('should include summary statistics', async () => {
      glob.mockResolvedValue(['src/index.js']);
      fs.readFileSync.mockReturnValue('');
      fs.readdirSync.mockReturnValue([]);

      const result = await analyzeCodebase('/project', {});

      expect(result.summary).toHaveProperty('totalFiles');
      expect(result.summary).toHaveProperty('entryPointCount');
      expect(result.summary).toHaveProperty('workflowCount');
    });
  });

  describe('constants', () => {
    it('should have entry patterns for common frameworks', () => {
      expect(ENTRY_PATTERNS.express).toBeDefined();
      expect(ENTRY_PATTERNS.fastapi).toBeDefined();
      expect(ENTRY_PATTERNS.nextjs).toBeDefined();
      expect(ENTRY_PATTERNS.django).toBeDefined();
    });

    it('should have workflow heuristics defined', () => {
      expect(WORKFLOW_HEURISTICS.authentication).toBeDefined();
      expect(WORKFLOW_HEURISTICS.payments).toBeDefined();
      expect(WORKFLOW_HEURISTICS.apiEndpoints).toBeDefined();
    });

    it('should have source extensions for common languages', () => {
      expect(SOURCE_EXTENSIONS.javascript).toContain('.js');
      expect(SOURCE_EXTENSIONS.python).toContain('.py');
      expect(SOURCE_EXTENSIONS.typescript).toContain('.ts');
    });

    it('should exclude common non-source directories', () => {
      expect(EXCLUDED_DIRS).toContain('node_modules');
      expect(EXCLUDED_DIRS).toContain('.git');
      expect(EXCLUDED_DIRS).toContain('dist');
    });
  });
});
