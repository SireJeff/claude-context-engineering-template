/**
 * File Watcher
 * 
 * Watches for file changes in the project and triggers re-indexing.
 * Uses fs.watch with debouncing to avoid excessive re-indexing.
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { glob } from 'glob';

/**
 * File change event
 */
export interface FileChangeEvent {
  type: 'create' | 'change' | 'delete';
  path: string;
  relativePath: string;
  timestamp: Date;
}

/**
 * Watcher configuration
 */
export interface WatcherConfig {
  /** Debounce delay in milliseconds (default: 500) */
  debounceMs: number;
  /** Patterns to watch (glob patterns) */
  watchPatterns: string[];
  /** Patterns to ignore */
  ignorePatterns: string[];
  /** Enable verbose logging */
  verbose: boolean;
}

/**
 * Default watcher configuration
 */
const DEFAULT_CONFIG: WatcherConfig = {
  debounceMs: 500,
  watchPatterns: [
    '.claude/**/*.md',
    '.ai-context/**/*.md',
    'CLAUDE.md',
    'src/**/*.ts',
    'src/**/*.js',
    'lib/**/*.js',
    'lib/**/*.ts',
    'docs/**/*.md'
  ],
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/*.db',
    '**/*.db-journal'
  ],
  verbose: false
};

/**
 * File watcher that monitors project files for changes
 */
export class FileWatcher extends EventEmitter {
  private projectRoot: string;
  private config: WatcherConfig;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private pendingChanges: Map<string, FileChangeEvent> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(projectRoot: string, config: Partial<WatcherConfig> = {}) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start watching files
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    // Find all directories to watch
    const directories = await this.getWatchDirectories();

    for (const dir of directories) {
      this.watchDirectory(dir);
    }

    this.emit('started', { directories: directories.length });
    
    if (this.config.verbose) {
      console.error(`[FileWatcher] Started watching ${directories.length} directories`);
    }
  }

  /**
   * Stop watching files
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Close all watchers
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    this.pendingChanges.clear();

    this.emit('stopped');
    
    if (this.config.verbose) {
      console.error('[FileWatcher] Stopped');
    }
  }

  /**
   * Check if watcher is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get directories to watch based on patterns
   */
  private async getWatchDirectories(): Promise<string[]> {
    const directories = new Set<string>();

    // Always watch the root
    directories.add(this.projectRoot);

    // Find directories matching patterns
    for (const pattern of this.config.watchPatterns) {
      const dirPattern = pattern.includes('*') 
        ? pattern.split('/').filter(p => !p.includes('*')).join('/')
        : path.dirname(pattern);

      if (dirPattern) {
        const fullPath = path.join(this.projectRoot, dirPattern);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
          directories.add(fullPath);
        }
      }
    }

    // Add common context directories if they exist
    const contextDirs = ['.claude', '.ai-context', 'docs', 'src', 'lib'];
    for (const dir of contextDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        directories.add(fullPath);
      }
    }

    return Array.from(directories);
  }

  /**
   * Start watching a directory
   */
  private watchDirectory(dirPath: string): void {
    if (this.watchers.has(dirPath)) {
      return;
    }

    try {
      const watcher = fs.watch(
        dirPath,
        { recursive: true },
        (eventType, filename) => {
          if (filename) {
            this.handleFileChange(dirPath, filename, eventType);
          }
        }
      );

      watcher.on('error', (error) => {
        if (this.config.verbose) {
          console.error(`[FileWatcher] Error watching ${dirPath}:`, error);
        }
        this.emit('error', { directory: dirPath, error });
      });

      this.watchers.set(dirPath, watcher);
    } catch (error) {
      if (this.config.verbose) {
        console.error(`[FileWatcher] Failed to watch ${dirPath}:`, error);
      }
    }
  }

  /**
   * Handle a file change event
   */
  private handleFileChange(
    dirPath: string, 
    filename: string, 
    eventType: string
  ): void {
    const fullPath = path.join(dirPath, filename);
    const relativePath = path.relative(this.projectRoot, fullPath);

    // Check if file should be ignored
    if (this.shouldIgnore(relativePath)) {
      return;
    }

    // Check if file matches watch patterns
    if (!this.matchesWatchPattern(relativePath)) {
      return;
    }

    // Determine change type
    let changeType: 'create' | 'change' | 'delete';
    if (!fs.existsSync(fullPath)) {
      changeType = 'delete';
    } else if (eventType === 'rename') {
      changeType = 'create';
    } else {
      changeType = 'change';
    }

    // Add to pending changes
    const event: FileChangeEvent = {
      type: changeType,
      path: fullPath,
      relativePath,
      timestamp: new Date()
    };

    this.pendingChanges.set(relativePath, event);

    // Debounce the change event
    this.scheduleFlush();
  }

  /**
   * Check if a path should be ignored
   */
  private shouldIgnore(relativePath: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if path matches any watch pattern
   */
  private matchesWatchPattern(relativePath: string): boolean {
    for (const pattern of this.config.watchPatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Simple glob pattern matching
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Convert glob pattern to regex
    // First escape special regex characters (except * and ?)
    let regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')  // Escape special regex chars
      .replace(/\*\*/g, '{{DOUBLESTAR}}')     // Temp placeholder for **
      .replace(/\*/g, '[^/]*')                // * matches anything except /
      .replace(/{{DOUBLESTAR}}/g, '.*')       // ** matches anything including /
      .replace(/\?/g, '.');                   // ? matches single char

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(normalizedPath);
  }

  /**
   * Schedule a flush of pending changes
   */
  private scheduleFlush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushChanges();
    }, this.config.debounceMs);
  }

  /**
   * Flush pending changes
   */
  private flushChanges(): void {
    if (this.pendingChanges.size === 0) {
      return;
    }

    const changes = Array.from(this.pendingChanges.values());
    this.pendingChanges.clear();

    if (this.config.verbose) {
      console.error(`[FileWatcher] Flushing ${changes.length} changes`);
    }

    this.emit('changes', changes);

    // Also emit individual change events
    for (const change of changes) {
      this.emit(change.type, change);
    }
  }

  /**
   * Get watched directories
   */
  getWatchedDirectories(): string[] {
    return Array.from(this.watchers.keys());
  }

  /**
   * Add a pattern to watch
   */
  addWatchPattern(pattern: string): void {
    if (!this.config.watchPatterns.includes(pattern)) {
      this.config.watchPatterns.push(pattern);
    }
  }

  /**
   * Add a pattern to ignore
   */
  addIgnorePattern(pattern: string): void {
    if (!this.config.ignorePatterns.includes(pattern)) {
      this.config.ignorePatterns.push(pattern);
    }
  }
}
