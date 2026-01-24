/**
 * Environment Detector
 *
 * Detects execution context to determine analysis mode:
 * - full-ai: Running inside Claude Code with API access
 * - hybrid: Running inside Claude Code without direct API access
 * - standalone: Running via npx without Claude Code
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Environment indicators for Claude Code detection
 */
const CLAUDE_INDICATORS = {
  // Environment variables set by Claude Code
  envVars: [
    'CLAUDE_CODE_SESSION',
    'CLAUDE_SESSION_ID',
    'CLAUDE_AGENT_ID',
    'ANTHROPIC_API_KEY',
    'CLAUDE_API_KEY'
  ],

  // Directories that indicate Claude Code presence
  directories: [
    path.join(os.homedir(), '.claude'),
    path.join(os.homedir(), '.claude-code'),
    path.join(os.homedir(), '.config', 'claude-code')
  ],

  // Files that indicate active Claude Code session
  sessionFiles: [
    '.claude-session',
    '.claude-code-session'
  ]
};

/**
 * Capability definitions by mode
 */
const CAPABILITIES = {
  'full-ai': [
    'workflow-discovery',
    'call-tracing',
    'semantic-analysis',
    'architecture-understanding',
    'smart-documentation'
  ],
  'hybrid': [
    'workflow-discovery',
    'basic-analysis',
    'pattern-matching'
  ],
  'standalone': [
    'static-analysis',
    'pattern-matching',
    'structure-mapping'
  ]
};

/**
 * Detect if running inside a Claude Code session
 * @returns {boolean}
 */
function isClaudeCodeSession() {
  // Check environment variables
  for (const envVar of CLAUDE_INDICATORS.envVars) {
    if (process.env[envVar]) {
      return true;
    }
  }

  // Check for Claude directories
  for (const dir of CLAUDE_INDICATORS.directories) {
    if (fs.existsSync(dir)) {
      // Directory exists, check for recent session markers
      const sessionMarker = path.join(dir, 'session', 'current', 'state.json');
      if (fs.existsSync(sessionMarker)) {
        try {
          const state = JSON.parse(fs.readFileSync(sessionMarker, 'utf-8'));
          // Check if session is recent (within last 24 hours)
          if (state.startedAt) {
            const sessionStart = new Date(state.startedAt);
            const hoursSinceStart = (Date.now() - sessionStart.getTime()) / (1000 * 60 * 60);
            if (hoursSinceStart < 24) {
              return true;
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
      // Even without active session, presence of .claude indicates CLI usage
      return true;
    }
  }

  // Check for session files in current directory
  for (const sessionFile of CLAUDE_INDICATORS.sessionFiles) {
    if (fs.existsSync(path.join(process.cwd(), sessionFile))) {
      return true;
    }
  }

  // Check if we're in a TTY with Claude Code characteristics
  if (process.stdout.isTTY) {
    // Check for VS Code terminal (common Claude Code environment)
    if (process.env.TERM_PROGRAM === 'vscode') {
      return true;
    }

    // Check for Claude Code specific terminal markers
    if (process.env.CLAUDE_CODE_TERMINAL === 'true') {
      return true;
    }
  }

  return false;
}

/**
 * Check if API access is available
 * @returns {boolean}
 */
function hasApiAccess() {
  return !!(
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.CLAUDE_CODE_API_ACCESS === 'true'
  );
}

/**
 * Detect the current execution environment
 * @returns {{mode: string, isClaudeCode: boolean, hasApiAccess: boolean, capabilities: string[], indicators: string[]}}
 */
function detectEnvironment() {
  const result = {
    isClaudeCode: false,
    hasApiAccess: false,
    mode: 'standalone',
    capabilities: [],
    indicators: []
  };

  // Check for Claude Code session
  result.isClaudeCode = isClaudeCodeSession();

  // Check for API access
  result.hasApiAccess = hasApiAccess();

  // Collect detected indicators for debugging
  for (const envVar of CLAUDE_INDICATORS.envVars) {
    if (process.env[envVar]) {
      result.indicators.push(`env:${envVar}`);
    }
  }
  for (const dir of CLAUDE_INDICATORS.directories) {
    if (fs.existsSync(dir)) {
      result.indicators.push(`dir:${path.basename(dir)}`);
    }
  }

  // Determine mode based on detection
  if (result.isClaudeCode && result.hasApiAccess) {
    result.mode = 'full-ai';
  } else if (result.isClaudeCode) {
    result.mode = 'hybrid';
  } else {
    result.mode = 'standalone';
  }

  // Assign capabilities based on mode
  result.capabilities = CAPABILITIES[result.mode] || CAPABILITIES.standalone;

  return result;
}

/**
 * Get a human-readable description of the environment
 * @param {object} env - Environment detection result
 * @returns {string}
 */
function getEnvironmentDescription(env) {
  switch (env.mode) {
    case 'full-ai':
      return 'Claude Code session with AI analysis enabled';
    case 'hybrid':
      return 'Claude Code session (AI analysis available on next run)';
    case 'standalone':
      return 'Standalone mode (static analysis only)';
    default:
      return 'Unknown environment';
  }
}

/**
 * Check if a specific capability is available
 * @param {object} env - Environment detection result
 * @param {string} capability - Capability to check
 * @returns {boolean}
 */
function hasCapability(env, capability) {
  return env.capabilities.includes(capability);
}

/**
 * Force a specific mode (for testing or CLI override)
 * @param {string} mode - Mode to force ('full-ai', 'hybrid', 'standalone')
 * @returns {object} Environment result with forced mode
 */
function forceMode(mode) {
  if (!CAPABILITIES[mode]) {
    throw new Error(`Invalid mode: ${mode}. Valid modes: ${Object.keys(CAPABILITIES).join(', ')}`);
  }

  return {
    isClaudeCode: mode !== 'standalone',
    hasApiAccess: mode === 'full-ai',
    mode,
    capabilities: CAPABILITIES[mode],
    indicators: [`forced:${mode}`],
    forced: true
  };
}

module.exports = {
  detectEnvironment,
  isClaudeCodeSession,
  hasApiAccess,
  getEnvironmentDescription,
  hasCapability,
  forceMode,
  CLAUDE_INDICATORS,
  CAPABILITIES
};
