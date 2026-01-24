/**
 * Unit tests for ai-orchestrator.js
 */

const path = require('path');
const fs = require('fs');

jest.mock('fs');

const {
  createInitializationRequest,
  generateAgentInstructions,
  checkInitializationStatus,
  updateInitializationProgress,
  completeInitialization,
  isInitializationPending,
  INIT_MARKER,
  INIT_REQUEST_FILE,
  PROGRESS_FILE
} = require('../../lib/ai-orchestrator');

describe('ai-orchestrator', () => {
  const mockClaudeDir = '/project/.claude';

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReturnValue('{}');
    fs.writeFileSync.mockImplementation(() => {});
    fs.unlinkSync.mockImplementation(() => {});
  });

  describe('createInitializationRequest', () => {
    it('should create initialization request file', () => {
      const config = { projectName: 'test-project' };

      const result = createInitializationRequest(mockClaudeDir, config);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('phases');
      expect(result.status).toBe('pending');
    });

    it('should include all initialization phases', () => {
      const config = { projectName: 'test-project' };

      const result = createInitializationRequest(mockClaudeDir, config);

      expect(result.phases.length).toBe(6);
      expect(result.phases.map(p => p.id)).toContain('repository-analysis');
      expect(result.phases.map(p => p.id)).toContain('workflow-discovery');
      expect(result.phases.map(p => p.id)).toContain('validation');
    });

    it('should write to correct file path', () => {
      const config = { projectName: 'test-project' };

      createInitializationRequest(mockClaudeDir, config);

      const writePath = fs.writeFileSync.mock.calls[0][0];
      expect(writePath).toContain(INIT_MARKER);
    });
  });

  describe('generateAgentInstructions', () => {
    it('should generate markdown instruction file', () => {
      const analysis = {
        entryPoints: [{ file: 'api.js', line: 10, route: '/users' }],
        workflows: [{ name: 'Auth', category: 'security', complexity: 'HIGH' }],
        architecture: { layers: [] },
        dependencies: [],
        summary: { totalFiles: 100 }
      };
      const config = { projectName: 'test-project' };

      const result = generateAgentInstructions(mockClaudeDir, analysis, config);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(result).toContain(INIT_REQUEST_FILE);
    });

    it('should include pre-analysis results in instructions', () => {
      const analysis = {
        entryPoints: [{ file: 'api.js', line: 10, route: '/users', method: 'GET' }],
        workflows: [{ name: 'Authentication', category: 'security', complexity: 'HIGH', fileCount: 5, confidence: 80 }],
        architecture: { layers: [{ name: 'api', directories: ['routes'], purpose: 'API' }] },
        dependencies: [{ name: 'express', version: '4.18.0', ecosystem: 'npm' }],
        summary: {}
      };
      const config = { projectName: 'test-project' };

      generateAgentInstructions(mockClaudeDir, analysis, config);

      const content = fs.writeFileSync.mock.calls[0][1];
      expect(content).toContain('Authentication');
      expect(content).toContain('api.js');
      expect(content).toContain('express');
    });

    it('should handle empty analysis gracefully', () => {
      const analysis = {
        entryPoints: [],
        workflows: [],
        architecture: { layers: [] },
        dependencies: []
      };
      const config = { projectName: 'test-project' };

      expect(() => generateAgentInstructions(mockClaudeDir, analysis, config)).not.toThrow();
    });
  });

  describe('checkInitializationStatus', () => {
    it('should return not-started when marker does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = checkInitializationStatus(mockClaudeDir);

      expect(result.status).toBe('not-started');
    });

    it('should return in-progress when some phases complete', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        phases: [
          { id: 'phase1', status: 'completed' },
          { id: 'phase2', status: 'pending' }
        ]
      }));

      const result = checkInitializationStatus(mockClaudeDir);

      expect(result.status).toBe('in-progress');
      expect(result.progress).toBe(50);
    });

    it('should return completed when all phases complete', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        phases: [
          { id: 'phase1', status: 'completed' },
          { id: 'phase2', status: 'completed' }
        ]
      }));

      const result = checkInitializationStatus(mockClaudeDir);

      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
    });

    it('should handle parse errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      const result = checkInitializationStatus(mockClaudeDir);

      expect(result.status).toBe('error');
    });
  });

  describe('updateInitializationProgress', () => {
    it('should update phase status', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        phases: [{ id: 'phase1', status: 'pending' }]
      }));

      const result = updateInitializationProgress(mockClaudeDir, 'phase1', 'completed', 100);

      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should return false when marker does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = updateInitializationProgress(mockClaudeDir, 'phase1', 'completed');

      expect(result).toBe(false);
    });

    it('should set overall status to completed when all phases complete', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        phases: [{ id: 'phase1', status: 'completed' }]
      }));

      updateInitializationProgress(mockClaudeDir, 'phase1', 'completed', 100);

      const writeCall = fs.writeFileSync.mock.calls[0][1];
      const written = JSON.parse(writeCall);
      expect(written.status).toBe('completed');
    });
  });

  describe('completeInitialization', () => {
    it('should archive request and remove marker', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        status: 'in-progress',
        phases: []
      }));

      completeInitialization(mockClaudeDir, true);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should not remove files when removeMarker is false', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        status: 'in-progress',
        phases: []
      }));

      completeInitialization(mockClaudeDir, false);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('isInitializationPending', () => {
    it('should return true when marker exists', () => {
      fs.existsSync.mockReturnValue(true);

      expect(isInitializationPending(mockClaudeDir)).toBe(true);
    });

    it('should return false when marker does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      expect(isInitializationPending(mockClaudeDir)).toBe(false);
    });
  });

  describe('constants', () => {
    it('should export file names', () => {
      expect(INIT_MARKER).toBe('.init-pending');
      expect(INIT_REQUEST_FILE).toBe('INIT_REQUEST.md');
      expect(PROGRESS_FILE).toBe('INIT_PROGRESS.json');
    });
  });
});
