/**
 * Unit tests for environment-detector.js
 */

const path = require('path');

// Setup mocks before requiring the module
const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn()
};

const mockOs = {
  homedir: jest.fn(() => '/home/user')
};

jest.mock('fs', () => mockFs);
jest.mock('os', () => mockOs);

// Now require the module after mocks are set up
const {
  detectEnvironment,
  isClaudeCodeSession,
  hasApiAccess,
  getEnvironmentDescription,
  hasCapability,
  forceMode,
  CLAUDE_INDICATORS,
  CAPABILITIES
} = require('../../lib/environment-detector');

describe('environment-detector', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset environment variables
    delete process.env.CLAUDE_CODE_SESSION;
    delete process.env.CLAUDE_SESSION_ID;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CLAUDE_API_KEY;
    delete process.env.CLAUDE_CODE_API_ACCESS;
    delete process.env.TERM_PROGRAM;
    delete process.env.CLAUDE_CODE_TERMINAL;

    // Default mock implementations
    mockOs.homedir.mockReturnValue('/home/user');
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readFileSync.mockReturnValue('{}');
  });

  describe('detectEnvironment', () => {
    it('should detect standalone mode when no indicators present', () => {
      const result = detectEnvironment();

      expect(result.mode).toBe('standalone');
      expect(result.isClaudeCode).toBe(false);
      expect(result.hasApiAccess).toBe(false);
      expect(result.capabilities).toEqual(CAPABILITIES.standalone);
    });

    it('should detect full-ai mode with API key', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      mockFs.existsSync.mockReturnValue(true);

      const result = detectEnvironment();

      expect(result.mode).toBe('full-ai');
      expect(result.isClaudeCode).toBe(true);
      expect(result.hasApiAccess).toBe(true);
      expect(result.capabilities).toEqual(CAPABILITIES['full-ai']);
    });

    it('should detect hybrid mode with Claude Code but no API', () => {
      mockFs.existsSync.mockImplementation((p) => {
        return p.includes('.claude');
      });

      const result = detectEnvironment();

      expect(result.mode).toBe('hybrid');
      expect(result.isClaudeCode).toBe(true);
      expect(result.hasApiAccess).toBe(false);
    });

    it('should collect indicators for debugging', () => {
      process.env.CLAUDE_CODE_SESSION = 'test-session';
      mockFs.existsSync.mockImplementation((p) => p.includes('.claude'));

      const result = detectEnvironment();

      expect(result.indicators).toContain('env:CLAUDE_CODE_SESSION');
    });
  });

  describe('isClaudeCodeSession', () => {
    it('should return true when CLAUDE_CODE_SESSION is set', () => {
      process.env.CLAUDE_CODE_SESSION = 'test';

      expect(isClaudeCodeSession()).toBe(true);
    });

    it('should return true when .claude directory exists', () => {
      mockFs.existsSync.mockImplementation((p) => p.includes('.claude'));

      expect(isClaudeCodeSession()).toBe(true);
    });

    it('should return false when no indicators present', () => {
      expect(isClaudeCodeSession()).toBe(false);
    });
  });

  describe('hasApiAccess', () => {
    it('should return true when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      expect(hasApiAccess()).toBe(true);
    });

    it('should return true when CLAUDE_API_KEY is set', () => {
      process.env.CLAUDE_API_KEY = 'test-key';

      expect(hasApiAccess()).toBe(true);
    });

    it('should return false when no API keys are set', () => {
      expect(hasApiAccess()).toBe(false);
    });
  });

  describe('getEnvironmentDescription', () => {
    it('should return correct description for full-ai mode', () => {
      const env = { mode: 'full-ai' };

      expect(getEnvironmentDescription(env)).toBe('Claude Code session with AI analysis enabled');
    });

    it('should return correct description for hybrid mode', () => {
      const env = { mode: 'hybrid' };

      expect(getEnvironmentDescription(env)).toBe('Claude Code session (AI analysis available on next run)');
    });

    it('should return correct description for standalone mode', () => {
      const env = { mode: 'standalone' };

      expect(getEnvironmentDescription(env)).toBe('Standalone mode (static analysis only)');
    });
  });

  describe('hasCapability', () => {
    it('should return true for valid capability', () => {
      const env = { capabilities: ['workflow-discovery', 'pattern-matching'] };

      expect(hasCapability(env, 'workflow-discovery')).toBe(true);
    });

    it('should return false for missing capability', () => {
      const env = { capabilities: ['pattern-matching'] };

      expect(hasCapability(env, 'semantic-analysis')).toBe(false);
    });
  });

  describe('forceMode', () => {
    it('should force full-ai mode', () => {
      const result = forceMode('full-ai');

      expect(result.mode).toBe('full-ai');
      expect(result.isClaudeCode).toBe(true);
      expect(result.hasApiAccess).toBe(true);
      expect(result.forced).toBe(true);
      expect(result.indicators).toContain('forced:full-ai');
    });

    it('should force standalone mode', () => {
      const result = forceMode('standalone');

      expect(result.mode).toBe('standalone');
      expect(result.isClaudeCode).toBe(false);
      expect(result.hasApiAccess).toBe(false);
    });

    it('should throw for invalid mode', () => {
      expect(() => forceMode('invalid')).toThrow('Invalid mode');
    });
  });

  describe('CLAUDE_INDICATORS', () => {
    it('should have environment variables defined', () => {
      expect(CLAUDE_INDICATORS.envVars).toContain('CLAUDE_CODE_SESSION');
      expect(CLAUDE_INDICATORS.envVars).toContain('ANTHROPIC_API_KEY');
    });

    it('should have directories defined', () => {
      expect(CLAUDE_INDICATORS.directories.length).toBeGreaterThan(0);
    });
  });

  describe('CAPABILITIES', () => {
    it('should have capabilities for all modes', () => {
      expect(CAPABILITIES['full-ai']).toBeDefined();
      expect(CAPABILITIES['hybrid']).toBeDefined();
      expect(CAPABILITIES['standalone']).toBeDefined();
    });

    it('should have more capabilities for full-ai than standalone', () => {
      expect(CAPABILITIES['full-ai'].length).toBeGreaterThan(CAPABILITIES['standalone'].length);
    });
  });
});
