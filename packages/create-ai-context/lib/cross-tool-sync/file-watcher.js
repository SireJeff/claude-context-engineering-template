/**
 * File Watcher for Cross-Tool Sync
 *
 * Monitors AI tool context files for changes and triggers synchronization.
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * Simple file watcher implementation (no chokidar dependency)
 * Uses polling to detect file changes
 */
class FileWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.watchPaths = new Map();
    this.fileStates = new Map();
    this.pollInterval = options.pollInterval || 1000; // 1 second default
    this.intervalId = null;
    this.running = false;
  }

  /**
   * Add a file or directory to watch
   */
  watch(watchPath, projectRoot) {
    const fullPath = path.isAbsolute(watchPath)
      ? watchPath
      : path.join(projectRoot, watchPath);

    const key = fullPath.toLowerCase();

    if (this.watchPaths.has(key)) {
      return;
    }

    // Store initial state
    this.recordFileState(fullPath, key);

    this.watchPaths.set(key, {
      path: fullPath,
      projectRoot,
      isDirectory: this.isDirectory(fullPath)
    });
  }

  /**
   * Record current state of a file/directory
   */
  recordFileState(filePath, key) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          // For directories, hash all files
          this.fileStates.set(key, {
            mtimeMs: stats.mtimeMs,
            hash: this.hashDirectory(filePath),
            exists: true
          });
        } else {
          // For files, use content hash
          const content = fs.readFileSync(filePath, 'utf-8');
          const crypto = require('crypto');
          const hash = crypto.createHash('sha256').update(content).digest('hex');

          this.fileStates.set(key, {
            mtimeMs: stats.mtimeMs,
            hash,
            exists: true
          });
        }
      } else {
        this.fileStates.set(key, { exists: false });
      }
    } catch (error) {
      this.fileStates.set(key, { exists: false, error: error.message });
    }
  }

  /**
   * Check if path is a directory
   */
  isDirectory(filePath) {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Hash all files in a directory
   */
  hashDirectory(dirPath) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const files = this.getAllFiles(dirPath);

    for (const file of files.sort()) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        hash.update(content);
      } catch {
        // Skip files that can't be read
      }
    }

    return hash.digest('hex');
  }

  /**
   * Get all files in directory recursively
   */
  getAllFiles(dirPath) {
    const files = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch {
      // Skip directories that can't be read
    }

    return files;
  }

  /**
   * Start watching
   */
  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.intervalId = setInterval(() => {
      this.checkForChanges();
    }, this.pollInterval);

    this.emit('ready');
  }

  /**
   * Stop watching
   */
  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.emit('stopped');
  }

  /**
   * Check all watched paths for changes
   */
  checkForChanges() {
    for (const [key, watchInfo] of this.watchPaths.entries()) {
      this.checkPath(key, watchInfo);
    }
  }

  /**
   * Check a single path for changes
   */
  checkPath(key, watchInfo) {
    const { path: filePath } = watchInfo;
    const oldState = this.fileStates.get(key);

    if (!oldState) {
      return;
    }

    // Record new state
    this.recordFileState(filePath, key);
    const newState = this.fileStates.get(key);

    // Detect changes
    if (!oldState.exists && newState.exists) {
      // File/directory was created
      this.emit('created', {
        path: filePath,
        ...watchInfo
      });
    } else if (oldState.exists && !newState.exists) {
      // File/directory was deleted
      this.emit('deleted', {
        path: filePath,
        ...watchInfo
      });
    } else if (oldState.exists && newState.exists) {
      // Check for modifications
      if (oldState.hash !== newState.hash) {
        this.emit('changed', {
          path: filePath,
          ...watchInfo,
          previousHash: oldState.hash,
          currentHash: newState.hash
        });
      }
    }
  }

  /**
   * Get current watch list
   */
  getWatchedPaths() {
    return Array.from(this.watchPaths.values()).map(w => w.path);
  }

  /**
   * Unwatch a specific path
   */
  unwatch(watchPath) {
    const fullPath = path.isAbsolute(watchPath)
      ? watchPath
      : path.join(process.cwd(), watchPath);

    const key = fullPath.toLowerCase();
    this.watchPaths.delete(key);
    this.fileStates.delete(key);
  }

  /**
   * Unwatch all paths
   */
  unwatchAll() {
    this.watchPaths.clear();
    this.fileStates.clear();
  }
}

/**
 * Create a file watcher for AI tool contexts
 */
function createToolContextWatcher(projectRoot, options = {}) {
  const watcher = new FileWatcher(options);

  // Add context files for all tools
  const { TOOL_CONTEXT_FILES } = require('./sync-manager');

  for (const [toolName, files] of Object.entries(TOOL_CONTEXT_FILES)) {
    for (const file of files) {
      watcher.watch(file, projectRoot);
    }
  }

  return watcher;
}

module.exports = {
  FileWatcher,
  createToolContextWatcher
};
