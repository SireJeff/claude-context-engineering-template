/**
 * Unit tests for template-populator.js
 */

const path = require('path');
const fs = require('fs');

jest.mock('fs');
jest.mock('glob', () => ({
  glob: jest.fn()
}));

const { glob } = require('glob');
const {
  populateAllTemplates,
  populateClaudeMd,
  generateArchitectureSnapshot,
  generateWorkflowIndex,
  generateCodeToWorkflowMap,
  generateWorkflowFile,
  updateCategoryIndexes,
  slugify
} = require('../../lib/template-populator');

describe('template-populator', () => {
  const mockClaudeDir = '/project/.claude';
  const mockAnalysis = {
    sourceFiles: 100,
    entryPoints: [{ file: 'api.js', line: 10, route: '/users', method: 'GET' }],
    workflows: [
      { type: 'authentication', name: 'User Authentication', category: 'security', complexity: 'HIGH', files: ['auth.js'], fileCount: 1, confidence: 80 }
    ],
    architecture: {
      directories: ['src', 'lib'],
      layers: [{ name: 'api', directories: ['routes'], purpose: 'API endpoints' }],
      directoryTree: 'src/\nlib/'
    },
    dependencies: [{ name: 'express', version: '4.18.0', ecosystem: 'npm' }],
    linesOfCode: { total: 5000 },
    techStack: { summary: 'Node.js, Express', languages: ['javascript'], frameworks: ['express'] }
  };
  const mockConfig = { projectName: 'test-project' };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('{{PROJECT_NAME}} {{TECH_STACK}}');
    fs.writeFileSync.mockImplementation(() => {});
    fs.mkdirSync.mockImplementation(() => {});
    glob.mockResolvedValue([]);
  });

  describe('slugify', () => {
    it('should convert string to slug', () => {
      expect(slugify('User Authentication')).toBe('user-authentication');
      expect(slugify('API Endpoints')).toBe('api-endpoints');
      expect(slugify('Data Processing')).toBe('data-processing');
    });

    it('should handle special characters', () => {
      expect(slugify('User & Auth')).toBe('user-auth');
      expect(slugify('Test (Beta)')).toBe('test-beta');
    });

    it('should trim leading/trailing dashes', () => {
      expect(slugify('--test--')).toBe('test');
    });
  });

  describe('generateArchitectureSnapshot', () => {
    it('should generate valid markdown', () => {
      const result = generateArchitectureSnapshot(mockAnalysis, mockConfig);

      expect(result).toContain('# Architecture Snapshot');
      expect(result).toContain('test-project');
      expect(result).toContain('Technology Stack');
    });

    it('should include tech stack table', () => {
      const result = generateArchitectureSnapshot(mockAnalysis, mockConfig);

      expect(result).toContain('javascript');
      expect(result).toContain('express');
    });

    it('should include directory structure', () => {
      const result = generateArchitectureSnapshot(mockAnalysis, mockConfig);

      expect(result).toContain('Directory Structure');
    });

    it('should include key metrics', () => {
      const result = generateArchitectureSnapshot(mockAnalysis, mockConfig);

      expect(result).toContain('100'); // sourceFiles
      expect(result).toContain('5000'); // LOC
    });
  });

  describe('generateWorkflowIndex', () => {
    it('should generate valid markdown', () => {
      const result = generateWorkflowIndex(mockAnalysis, mockConfig);

      expect(result).toContain('# Workflow Index');
      expect(result).toContain('Quick Navigation');
    });

    it('should include workflow table', () => {
      const result = generateWorkflowIndex(mockAnalysis, mockConfig);

      expect(result).toContain('User Authentication');
      expect(result).toContain('security');
      expect(result).toContain('HIGH');
    });

    it('should link to workflow files', () => {
      const result = generateWorkflowIndex(mockAnalysis, mockConfig);

      expect(result).toContain('./workflows/user-authentication.md');
    });

    it('should include cross-reference section', () => {
      const result = generateWorkflowIndex(mockAnalysis, mockConfig);

      expect(result).toContain('CODE_TO_WORKFLOW_MAP.md');
    });
  });

  describe('generateCodeToWorkflowMap', () => {
    it('should generate valid markdown', () => {
      const result = generateCodeToWorkflowMap(mockAnalysis, mockConfig);

      expect(result).toContain('# Code to Workflow Map');
      expect(result).toContain('How to Use');
    });

    it('should include file index', () => {
      const result = generateCodeToWorkflowMap(mockAnalysis, mockConfig);

      expect(result).toContain('File Index');
    });

    it('should include update checklist', () => {
      const result = generateCodeToWorkflowMap(mockAnalysis, mockConfig);

      expect(result).toContain('Update Checklist');
      expect(result).toContain('/verify-docs-current');
    });
  });

  describe('generateWorkflowFile', () => {
    it('should generate valid workflow markdown', () => {
      const workflow = mockAnalysis.workflows[0];

      const result = generateWorkflowFile(workflow, mockAnalysis, mockConfig);

      expect(result).toContain('# User Authentication');
      expect(result).toContain('security');
      expect(result).toContain('HIGH');
    });

    it('should include YAML frontmatter', () => {
      const workflow = mockAnalysis.workflows[0];

      const result = generateWorkflowFile(workflow, mockAnalysis, mockConfig);

      expect(result).toContain('---');
      expect(result).toContain('name: user-authentication');
      expect(result).toContain('category: security');
    });

    it('should include key files section', () => {
      const workflow = mockAnalysis.workflows[0];

      const result = generateWorkflowFile(workflow, mockAnalysis, mockConfig);

      expect(result).toContain('Key Files');
      expect(result).toContain('auth.js');
    });

    it('should include call chain placeholder', () => {
      const workflow = mockAnalysis.workflows[0];

      const result = generateWorkflowFile(workflow, mockAnalysis, mockConfig);

      expect(result).toContain('Call Chain');
    });
  });

  describe('populateAllTemplates', () => {
    it('should return results object', async () => {
      const result = await populateAllTemplates(mockClaudeDir, mockAnalysis, mockConfig);

      expect(result).toHaveProperty('populated');
      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('errors');
    });

    it('should create workflow files', async () => {
      await populateAllTemplates(mockClaudeDir, mockAnalysis, mockConfig);

      const writeCallPaths = fs.writeFileSync.mock.calls.map(c => c[0]);
      const workflowFiles = writeCallPaths.filter(p => p.includes('workflows'));
      expect(workflowFiles.length).toBeGreaterThan(0);
    });

    it('should create architecture snapshot', async () => {
      await populateAllTemplates(mockClaudeDir, mockAnalysis, mockConfig);

      const writeCallPaths = fs.writeFileSync.mock.calls.map(c => c[0]);
      expect(writeCallPaths.some(p => p.includes('ARCHITECTURE_SNAPSHOT'))).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      const result = await populateAllTemplates(mockClaudeDir, mockAnalysis, mockConfig);

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('updateCategoryIndexes', () => {
    it('should create category index file', async () => {
      await updateCategoryIndexes(mockClaudeDir, mockAnalysis, mockConfig);

      const writeCallPaths = fs.writeFileSync.mock.calls.map(c => c[0]);
      expect(writeCallPaths.some(p => p.includes('CATEGORY_INDEX'))).toBe(true);
    });

    it('should group workflows by category', async () => {
      await updateCategoryIndexes(mockClaudeDir, mockAnalysis, mockConfig);

      const content = fs.writeFileSync.mock.calls.find(c => c[0].includes('CATEGORY_INDEX'))[1];
      expect(content).toContain('Security');
      expect(content).toContain('User Authentication');
    });
  });

  describe('populateClaudeMd', () => {
    it('should replace placeholders', async () => {
      const projectRoot = '/project';

      await populateClaudeMd(projectRoot, mockAnalysis, mockConfig);

      const content = fs.writeFileSync.mock.calls[0][1];
      expect(content).toContain('test-project');
      expect(content).not.toContain('{{PROJECT_NAME}}');
    });

    it('should not error when CLAUDE.md does not exist', async () => {
      fs.existsSync.mockReturnValue(false);

      await expect(populateClaudeMd('/project', mockAnalysis, mockConfig)).resolves.not.toThrow();
    });
  });
});
