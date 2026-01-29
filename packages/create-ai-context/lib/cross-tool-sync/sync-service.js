/**
 * Cross-Tool Sync Service
 *
 * Background service that monitors context files and auto-syncs changes.
 */

const path = require('path');
const { createToolContextWatcher } = require('./file-watcher');
const { propagateContextChange, checkSyncStatus, formatSyncStatus, CONFLICT_STRATEGY } = require('./sync-manager');

/**
 * Sync service configuration
 */
const DEFAULT_CONFIG = {
  // Polling interval for file changes (ms)
  pollInterval: 1000,

  // Debounce delay before triggering sync (ms)
  debounceDelay: 2000,

  // Auto-sync strategy
  strategy: CONFLICT_STRATEGY.SOURCE_WINS,

  // Enable/disable auto-sync
  enabled: true,

  // Log verbosity
  verbose: false,

  // Callbacks
  onSyncStart: null,
  onSyncComplete: null,
  onError: null
};

/**
 * Cross-tool sync service
 */
class SyncService {
  constructor(projectRoot, config = {}) {
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.watcher = null;
    this.syncTimeouts = new Map();
    this.isRunning = false;
    this.syncInProgress = false;
  }

  /**
   * Start the sync service
   */
  start() {
    if (this.isRunning) {
      this.log('Sync service already running');
      return;
    }

    this.log('Starting cross-tool sync service...');

    // Create file watcher
    this.watcher = createToolContextWatcher(this.projectRoot, {
      pollInterval: this.config.pollInterval
    });

    // Set up event listeners
    this.watcher.on('changed', (event) => this.handleFileChanged(event));
    this.watcher.on('created', (event) => this.handleFileCreated(event));
    this.watcher.on('deleted', (event) => this.handleFileDeleted(event));

    // Start watching
    this.watcher.start();
    this.isRunning = true;

    this.log('Sync service started');
    this.log(`Watching: ${this.watcher.getWatchedPaths().join(', ')}`);
  }

  /**
   * Stop the sync service
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.log('Stopping sync service...');

    if (this.watcher) {
      this.watcher.stop();
      this.watcher.unwatchAll();
      this.watcher = null;
    }

    // Clear any pending syncs
    for (const timeout of this.syncTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.syncTimeouts.clear();

    this.isRunning = false;
    this.log('Sync service stopped');
  }

  /**
   * Handle file changed event
   */
  handleFileChanged(event) {
    const toolName = this.detectToolFromPath(event.path);

    if (!toolName) {
      return;
    }

    this.log(`Detected change in ${toolName}: ${event.path}`);

    // Debounce sync
    this.scheduleSync(toolName, event.path);
  }

  /**
   * Handle file created event
   */
  handleFileCreated(event) {
    const toolName = this.detectToolFromPath(event.path);

    if (!toolName) {
      return;
    }

    this.log(`Detected creation in ${toolName}: ${event.path}`);
    this.scheduleSync(toolName, event.path);
  }

  /**
   * Handle file deleted event
   */
  handleFileDeleted(event) {
    const toolName = this.detectToolFromPath(event.path);

    if (!toolName) {
      return;
    }

    this.log(`Detected deletion in ${toolName}: ${event.path}`);
    // Don't auto-sync on delete - let user handle it
  }

  /**
   * Detect which tool a path belongs to
   */
  detectToolFromPath(filePath) {
    const { TOOL_CONTEXT_FILES } = require('./sync-manager');

    for (const [toolName, files] of Object.entries(TOOL_CONTEXT_FILES)) {
      for (const file of files) {
        const fullPath = path.join(this.projectRoot, file);

        if (filePath.startsWith(fullPath) || filePath === fullPath) {
          return toolName;
        }
      }
    }

    return null;
  }

  /**
   * Schedule a debounced sync
   */
  scheduleSync(toolName, changedPath) {
    // Clear existing timeout for this tool
    const existingTimeout = this.syncTimeouts.get(toolName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new sync
    const timeout = setTimeout(async () => {
      await this.performSync(toolName, changedPath);
      this.syncTimeouts.delete(toolName);
    }, this.config.debounceDelay);

    this.syncTimeouts.set(toolName, timeout);
  }

  /**
   * Perform the actual sync
   */
  async performSync(sourceTool, changedPath) {
    if (this.syncInProgress) {
      this.log('Sync already in progress, skipping');
      return;
    }

    this.syncInProgress = true;

    try {
      this.log(`Starting sync from ${sourceTool}...`);

      if (this.config.onSyncStart) {
        this.config.onSyncStart(sourceTool, changedPath);
      }

      // Get config for project
      const config = this.getProjectConfig();

      // Propagate changes
      const results = await propagateContextChange(
        sourceTool,
        this.projectRoot,
        config,
        this.config.strategy
      );

      if (results.errors.length > 0) {
        this.log(`Sync completed with ${results.errors.length} errors`);

        if (this.config.onError) {
          this.config.onError(results.errors);
        }
      } else {
        this.log(`Sync completed successfully`);
        this.log(`Propagated to: ${results.propagated.map(p => p.displayName).join(', ')}`);
      }

      if (this.config.onSyncComplete) {
        this.config.onSyncComplete(results);
      }

    } catch (error) {
      this.log(`Sync failed: ${error.message}`);

      if (this.config.onError) {
        this.config.onError([error]);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get project configuration
   */
  getProjectConfig() {
    const configPath = path.join(this.projectRoot, 'ai-context.config.json');

    if (require('fs').existsSync(configPath)) {
      try {
        return JSON.parse(require('fs').readFileSync(configPath, 'utf-8'));
      } catch {
        // Fall through to defaults
      }
    }

    return {
      // Default config
      includePatterns: ['**/*.{js,ts,jsx,tsx,py,go,rs,java}'],
      excludePatterns: ['node_modules/**', '**/node_modules/**']
    };
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return checkSyncStatus(this.projectRoot);
  }

  /**
   * Log message if verbose
   */
  log(message) {
    if (this.config.verbose) {
      console.log(`[SyncService] ${message}`);
    }
  }
}

/**
 * Create and start a sync service
 */
function createSyncService(projectRoot, config = {}) {
  const service = new SyncService(projectRoot, config);

  if (config.autoStart !== false) {
    service.start();
  }

  return service;
}

module.exports = {
  SyncService,
  createSyncService,
  DEFAULT_CONFIG
};
