/**
 * Cross-Tool Sync Manager
 *
 * Orchestrates automatic synchronization between AI tool contexts.
 * Detects changes in one tool's context and propagates to others.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getAdapter, getAllAdapters, getAdapterNames } = require('../adapters');
const { analyzeCodebase } = require('../static-analyzer');
const { generateAll, initialize: initGenerator } = require('../ai-context-generator');

/**
 * Context file paths for each AI tool
 */
const TOOL_CONTEXT_FILES = {
  claude: ['AI_CONTEXT.md', '.claude/'],
  copilot: ['.github/copilot-instructions.md'],
  cline: ['.clinerules'],
  antigravity: ['.agent/']
};

/**
 * Conflict resolution strategies
 */
const CONFLICT_STRATEGY = {
  SOURCE_WINS: 'source_wins',       // Changed file always wins
  REGENERATE_ALL: 'regenerate_all', // Regenerate all from codebase
  MANUAL: 'manual',                  // Require manual resolution
  NEWEST: 'newest'                   // File with newest modification time wins
};

/**
 * Sync state storage path
 */
function getSyncStatePath(projectRoot) {
  return path.join(projectRoot, '.ai-context', 'sync-state.json');
}

/**
 * Initialize sync state (creates new if doesn't exist, loads existing if present)
 */
function initSyncState(projectRoot) {
  const statePath = getSyncStatePath(projectRoot);
  const stateDir = path.dirname(statePath);

  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }

  if (!fs.existsSync(statePath)) {
    const initialState = {
      version: '1.0.0',
      lastSync: null,
      toolHashes: {},
      conflicts: [],
      syncHistory: []
    };
    fs.writeFileSync(statePath, JSON.stringify(initialState, null, 2));
    return initialState;
  }

  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (error) {
    // File exists but is corrupted, create new state
    const initialState = {
      version: '1.0.0',
      lastSync: null,
      toolHashes: {},
      conflicts: [],
      syncHistory: []
    };
    fs.writeFileSync(statePath, JSON.stringify(initialState, null, 2));
    return initialState;
  }
}

/**
 * Load sync state (always loads from disk, doesn't create new)
 */
function loadSyncState(projectRoot) {
  const statePath = getSyncStatePath(projectRoot);

  if (!fs.existsSync(statePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (error) {
    return null;
  }
}

/**
 * Save sync state
 */
function saveSyncState(projectRoot, state) {
  const statePath = getSyncStatePath(projectRoot);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

/**
 * Calculate file hash for change detection
 */
function calculateFileHash(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get all context files for a tool
 */
function getToolContextFiles(toolName, projectRoot) {
  const files = TOOL_CONTEXT_FILES[toolName] || [];
  const results = [];

  for (const file of files) {
    const fullPath = path.join(projectRoot, file);

    if (file.endsWith('/')) {
      // Directory - calculate combined hash of all files
      if (fs.existsSync(fullPath)) {
        const dirHash = hashDirectory(fullPath);
        results.push({ path: file, hash: dirHash, isDirectory: true });
      }
    } else {
      // Single file
      if (fs.existsSync(fullPath)) {
        results.push({ path: file, hash: calculateFileHash(fullPath), isDirectory: false });
      }
    }
  }

  return results;
}

/**
 * Calculate hash for a directory
 */
function hashDirectory(dirPath) {
  const hash = crypto.createHash('sha256');
  const files = getAllFiles(dirPath);

  for (const file of files.sort()) {
    const content = fs.readFileSync(file, 'utf-8');
    hash.update(content);
  }

  return hash.digest('hex');
}

/**
 * Get all files in directory recursively
 */
function getAllFiles(dirPath) {
  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Detect which tool's context has changed
 */
function detectChangedTool(projectRoot, state) {
  const currentHashes = {};
  const changedTools = [];

  for (const toolName of getAdapterNames()) {
    const files = getToolContextFiles(toolName, projectRoot);
    const toolHash = files.map(f => f.hash).filter(Boolean).join('|');

    currentHashes[toolName] = toolHash;

    // Use hasOwnProperty check to handle empty string case
    const hasStoredHash = Object.prototype.hasOwnProperty.call(state.toolHashes, toolName);
    const storedHash = state.toolHashes[toolName];

    if (hasStoredHash && storedHash !== toolHash) {
      changedTools.push({
        tool: toolName,
        previousHash: storedHash,
        currentHash: toolHash
      });
    }
  }

  return { changedTools, currentHashes };
}

/**
 * Propagate context change from source tool to all other tools
 */
async function propagateContextChange(sourceTool, projectRoot, config, strategy = CONFLICT_STRATEGY.SOURCE_WINS) {
  const results = {
    sourceTool,
    strategy,
    timestamp: new Date().toISOString(),
    propagated: [],
    skipped: [],
    errors: []
  };

  // 1. Re-analyze codebase to get fresh analysis
  let analysis;
  try {
    analysis = await analyzeCodebase(projectRoot, config);
  } catch (error) {
    results.errors.push({
      message: `Failed to analyze project: ${error.message}`
    });
    return results;
  }

  // 2. Get all adapters except source
  const allAdapters = getAllAdapters();
  const targetAdapters = allAdapters.filter(a => a.name !== sourceTool);

  // 3. Generate contexts for all target tools
  initGenerator();

  for (const adapter of targetAdapters) {
    try {
      const result = await adapter.generate(analysis, config, projectRoot);

      if (result.success) {
        results.propagated.push({
          tool: adapter.name,
          displayName: adapter.displayName,
          files: result.files
        });
      } else {
        results.errors.push({
          tool: adapter.name,
          errors: result.errors
        });
      }
    } catch (error) {
      results.errors.push({
        tool: adapter.name,
        message: error.message
      });
    }
  }

  // 4. Update sync state
  const state = initSyncState(projectRoot);
  const { currentHashes } = detectChangedTool(projectRoot, state);
  state.toolHashes = currentHashes;
  state.lastSync = new Date().toISOString();
  state.syncHistory.push({
    timestamp: new Date().toISOString(),
    sourceTool,
    strategy,
    propagatedCount: results.propagated.length,
    errorCount: results.errors.length
  });
  saveSyncState(projectRoot, state);

  return results;
}

/**
 * Check if contexts are out of sync
 */
function checkSyncStatus(projectRoot) {
  const state = loadSyncState(projectRoot) || initSyncState(projectRoot);
  const status = {
    inSync: true,
    tools: {},
    lastSync: state.lastSync,
    conflicts: []
  };

  const { changedTools, currentHashes } = detectChangedTool(projectRoot, state);

  for (const toolName of getAdapterNames()) {
    const files = getToolContextFiles(toolName, projectRoot);
    const exists = files.length > 0;
    const hasChanges = changedTools.some(c => c.tool === toolName);

    status.tools[toolName] = {
      exists,
      hasChanges,
      hash: currentHashes[toolName],
      previousHash: state.toolHashes[toolName]
    };

    if (hasChanges && !state.lastSync) {
      status.inSync = false;
    }
  }

  if (changedTools.length > 0 && state.lastSync) {
    status.inSync = false;
    status.changedTools = changedTools;
  }

  return status;
}

/**
 * Update sync state only (no file regeneration)
 * Used by post-commit hooks to avoid creating new uncommitted changes
 */
function updateSyncStateOnly(projectRoot) {
  const state = initSyncState(projectRoot);
  const { currentHashes } = detectChangedTool(projectRoot, state);
  
  // Only update hashes, don't regenerate files
  state.toolHashes = currentHashes;
  state.lastSync = new Date().toISOString();
  state.syncHistory.push({
    timestamp: new Date().toISOString(),
    source: 'post-commit',
    strategy: 'state_only',
    propagatedCount: 0,
    errorCount: 0
  });
  saveSyncState(projectRoot, state);
  
  return {
    updated: true,
    timestamp: state.lastSync,
    hashes: currentHashes
  };
}

/**
 * Sync all tools from codebase (fresh regeneration)
 */
async function syncAllFromCodebase(projectRoot, config) {
  const results = {
    timestamp: new Date().toISOString(),
    tools: [],
    errors: []
  };

  try {
    // Analyze project
    const analysis = await analyzeCodebase(projectRoot, config);

    // Generate for all tools
    const generateResults = await generateAll(analysis, config, projectRoot, {
      aiTools: getAdapterNames()
    });

    results.tools = generateResults.generated.map(g => ({
      tool: g.adapter,
      displayName: g.displayName,
      fileCount: g.files.length
    }));

    results.errors = generateResults.errors;

    // Update sync state
    const state = initSyncState(projectRoot);
    const { currentHashes } = detectChangedTool(projectRoot, state);
    state.toolHashes = currentHashes;
    state.lastSync = new Date().toISOString();
    state.syncHistory.push({
      timestamp: new Date().toISOString(),
      source: 'codebase',
      strategy: 'regenerate_all',
      propagatedCount: results.tools.length,
      errorCount: results.errors.length
    });
    saveSyncState(projectRoot, state);

  } catch (error) {
    results.errors.push({
      message: `Sync failed: ${error.message}`,
      stack: error.stack
    });
  }

  return results;
}

/**
 * Resolve conflict between tools
 */
async function resolveConflict(projectRoot, config, strategy, preferredTool = null) {
  const status = checkSyncStatus(projectRoot);

  if (status.inSync) {
    return {
      resolved: true,
      message: 'No conflicts to resolve'
    };
  }

  switch (strategy) {
    case CONFLICT_STRATEGY.SOURCE_WINS:
      if (!preferredTool) {
        return {
          resolved: false,
          message: 'Source strategy requires a preferred tool'
        };
      }
      return await propagateContextChange(preferredTool, projectRoot, config, strategy);

    case CONFLICT_STRATEGY.REGENERATE_ALL:
      return await syncAllFromCodebase(projectRoot, config);

    case CONFLICT_STRATEGY.NEWEST:
      // Find tool with most recent change
      const newestTool = findNewestTool(projectRoot, status);
      return await propagateContextChange(newestTool, projectRoot, config, strategy);

    case CONFLICT_STRATEGY.MANUAL:
      return {
        resolved: false,
        message: 'Manual resolution required',
        status
      };

    default:
      return {
        resolved: false,
        message: `Unknown strategy: ${strategy}`
      };
  }
}

/**
 * Find tool with most recently modified context
 */
function findNewestTool(projectRoot, status) {
  let newestTool = null;
  let newestTime = 0;

  for (const [toolName, toolStatus] of Object.entries(status.tools)) {
    const files = getToolContextFiles(toolName, projectRoot);

    for (const file of files) {
      const fullPath = path.join(projectRoot, file.path);

      if (file.isDirectory) {
        continue; // Skip directories for mtime check
      }

      const stats = fs.statSync(fullPath);
      if (stats.mtimeMs > newestTime) {
        newestTime = stats.mtimeMs;
        newestTool = toolName;
      }
    }
  }

  return newestTool;
}

/**
 * Get sync history
 */
function getSyncHistory(projectRoot, limit = 10) {
  const state = initSyncState(projectRoot);
  return state.syncHistory.slice(-limit);
}

/**
 * Format sync status for display
 */
function formatSyncStatus(status) {
  const lines = [];

  lines.push('');
  lines.push('Cross-Tool Sync Status');
  lines.push('='.repeat(50));
  lines.push('');

  const statusEmoji = status.inSync ? '✓' : '⚠';
  lines.push(`Overall: ${status.inSync ? 'In Sync' : 'Out of Sync'} ${statusEmoji}`);
  lines.push('');

  if (status.lastSync) {
    lines.push(`Last Sync: ${new Date(status.lastSync).toLocaleString()}`);
    lines.push('');
  }

  lines.push('Tools:');
  for (const [toolName, toolStatus] of Object.entries(status.tools)) {
    const existsEmoji = toolStatus.exists ? '✓' : '✗';
    const changesEmoji = toolStatus.hasChanges ? '⚠' : '';
    lines.push(`  ${toolName}: ${existsEmoji} ${changesEmoji}`);
  }

  if (status.changedTools && status.changedTools.length > 0) {
    lines.push('');
    lines.push('Changed Tools:');
    for (const change of status.changedTools) {
      lines.push(`  - ${change.tool}`);
    }
  }

  lines.push('');

  return lines.join('\n');
}

module.exports = {
  // Core functions
  detectChangedTool,
  propagateContextChange,
  checkSyncStatus,
  syncAllFromCodebase,
  updateSyncStateOnly,
  resolveConflict,
  getSyncHistory,

  // Utilities
  initSyncState,
  loadSyncState,
  saveSyncState,
  calculateFileHash,
  getToolContextFiles,
  formatSyncStatus,

  // Constants
  CONFLICT_STRATEGY,
  TOOL_CONTEXT_FILES
};
