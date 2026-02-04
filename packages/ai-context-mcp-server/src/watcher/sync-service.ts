/**
 * Auto-Sync Service
 * 
 * Orchestrates automatic re-indexing when files change.
 * Integrates the file watcher with the indexers.
 */

import { EventEmitter } from 'events';
import { DatabaseClient } from '../db/client.js';
import { EmbeddingsManager } from '../db/embeddings.js';
import { ContextIndexer } from '../indexers/context.js';
import { CodeIndexer } from '../indexers/code.js';
import { GitIndexer } from '../indexers/git.js';
import { ShadowGenerator } from '../shadow/generator.js';
import { FileWatcher, type FileChangeEvent, type WatcherConfig } from './file-watcher.js';

/**
 * Sync service configuration
 */
export interface SyncServiceConfig {
  /** Project root directory */
  projectRoot: string;
  /** Database client */
  db: DatabaseClient;
  /** Embeddings manager */
  embeddings: EmbeddingsManager;
  /** Watcher configuration overrides */
  watcherConfig?: Partial<WatcherConfig>;
  /** Whether to update shadow files after indexing */
  updateShadow?: boolean;
  /** Whether to process embeddings after indexing */
  processEmbeddings?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Sync result
 */
export interface SyncResult {
  indexed: number;
  removed: number;
  errors: string[];
  duration: number;
}

/**
 * Auto-sync service
 */
export class SyncService extends EventEmitter {
  private config: SyncServiceConfig;
  private watcher: FileWatcher;
  private contextIndexer: ContextIndexer;
  private codeIndexer: CodeIndexer;
  private gitIndexer: GitIndexer;
  private shadowGenerator: ShadowGenerator;
  private running = false;
  private syncInProgress = false;
  private pendingSync = false;

  constructor(config: SyncServiceConfig) {
    super();
    this.config = {
      updateShadow: true,
      processEmbeddings: true,
      verbose: false,
      ...config
    };

    // Initialize components
    this.watcher = new FileWatcher(config.projectRoot, config.watcherConfig);
    this.contextIndexer = new ContextIndexer(
      config.db,
      config.embeddings,
      config.projectRoot
    );
    this.codeIndexer = new CodeIndexer(
      config.db,
      config.embeddings,
      config.projectRoot
    );
    this.gitIndexer = new GitIndexer(
      config.db,
      config.embeddings,
      config.projectRoot
    );
    this.shadowGenerator = new ShadowGenerator(config.db, config.projectRoot);

    // Wire up events
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Handle batched changes
    this.watcher.on('changes', (changes: FileChangeEvent[]) => {
      this.handleChanges(changes);
    });

    // Forward watcher events
    this.watcher.on('started', (info) => {
      this.emit('watcher-started', info);
    });

    this.watcher.on('stopped', () => {
      this.emit('watcher-stopped');
    });

    this.watcher.on('error', (error) => {
      this.emit('watcher-error', error);
    });
  }

  /**
   * Start the sync service
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;
    await this.watcher.start();

    if (this.config.verbose) {
      console.error('[SyncService] Started');
    }

    this.emit('started');
  }

  /**
   * Stop the sync service
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    this.watcher.stop();

    if (this.config.verbose) {
      console.error('[SyncService] Stopped');
    }

    this.emit('stopped');
  }

  /**
   * Check if service is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Handle file changes
   */
  private async handleChanges(changes: FileChangeEvent[]): Promise<void> {
    // If sync is in progress, mark for pending sync
    if (this.syncInProgress) {
      this.pendingSync = true;
      return;
    }

    this.syncInProgress = true;
    const startTime = Date.now();

    try {
      const result = await this.processChanges(changes);
      
      this.emit('sync-complete', {
        ...result,
        changes: changes.length
      });

      if (this.config.verbose) {
        console.error(
          `[SyncService] Synced ${changes.length} changes in ${result.duration}ms`
        );
      }
    } catch (error) {
      this.emit('sync-error', { error, changes });

      if (this.config.verbose) {
        console.error('[SyncService] Sync failed:', error);
      }
    } finally {
      this.syncInProgress = false;

      // Process pending sync if any
      if (this.pendingSync) {
        this.pendingSync = false;
        // Schedule a full re-index
        setTimeout(() => {
          this.handleChanges([]);
        }, 100);
      }
    }
  }

  /**
   * Process file changes
   */
  private async processChanges(changes: FileChangeEvent[]): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      indexed: 0,
      removed: 0,
      errors: [],
      duration: 0
    };

    // Group changes by type
    const contextChanges: FileChangeEvent[] = [];
    const codeChanges: FileChangeEvent[] = [];

    for (const change of changes) {
      if (this.isContextFile(change.relativePath)) {
        contextChanges.push(change);
      } else if (this.isCodeFile(change.relativePath)) {
        codeChanges.push(change);
      }
    }

    // Process context file changes
    for (const change of contextChanges) {
      try {
        if (change.type === 'delete') {
          if (this.contextIndexer.removeFile(change.path)) {
            result.removed++;
          }
        } else {
          if (await this.contextIndexer.reindexFile(change.path)) {
            result.indexed++;
          }
        }
      } catch (error) {
        result.errors.push(`Error processing ${change.relativePath}: ${error}`);
      }
    }

    // Process code file changes
    for (const change of codeChanges) {
      try {
        if (change.type !== 'delete') {
          const language = this.detectLanguage(change.relativePath);
          if (language) {
            const chunks = await this.codeIndexer.indexFile(change.path, language);
            result.indexed += chunks;
          }
        }
      } catch (error) {
        result.errors.push(`Error processing ${change.relativePath}: ${error}`);
      }
    }

    // Update shadow files if enabled
    if (this.config.updateShadow && (contextChanges.length > 0 || result.indexed > 0)) {
      try {
        await this.shadowGenerator.generateAll();
      } catch (error) {
        result.errors.push(`Error updating shadow files: ${error}`);
      }
    }

    // Process embeddings if enabled
    if (this.config.processEmbeddings) {
      try {
        await this.config.embeddings.processQueue();
      } catch (error) {
        // Embeddings processing is optional
        if (this.config.verbose) {
          console.error('[SyncService] Embeddings processing skipped:', error);
        }
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Check if file is a context document
   */
  private isContextFile(relativePath: string): boolean {
    const contextPatterns = [
      /\.claude\/.*\.md$/,
      /\.ai-context\/.*\.md$/,
      /CLAUDE\.md$/,
      /AI_CONTEXT\.md$/,
      /\.clinerules$/,
      /\.github\/copilot-instructions\.md$/
    ];

    return contextPatterns.some(p => p.test(relativePath));
  }

  /**
   * Check if file is a code file
   */
  private isCodeFile(relativePath: string): boolean {
    const codeExtensions = [
      '.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs',
      '.py', '.go', '.rs', '.java', '.cs', '.rb', '.php'
    ];

    return codeExtensions.some(ext => relativePath.endsWith(ext));
  }

  /**
   * Detect programming language from file path
   */
  private detectLanguage(relativePath: string): string | null {
    const extensionMap: Record<string, string> = {
      '.js': 'javascript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.cs': 'csharp',
      '.rb': 'ruby',
      '.php': 'php'
    };

    for (const [ext, lang] of Object.entries(extensionMap)) {
      if (relativePath.endsWith(ext)) {
        return lang;
      }
    }

    return null;
  }

  /**
   * Manually trigger a full re-index
   */
  async reindex(options: {
    context?: boolean;
    code?: boolean;
    git?: boolean;
  } = {}): Promise<SyncResult> {
    const { context = true, code = false, git = false } = options;
    const startTime = Date.now();
    const result: SyncResult = {
      indexed: 0,
      removed: 0,
      errors: [],
      duration: 0
    };

    if (context) {
      const contextResult = await this.contextIndexer.indexAll();
      result.indexed += contextResult.indexed;
      result.errors.push(...contextResult.errors);
    }

    if (code) {
      const codeResult = await this.codeIndexer.indexAll();
      result.indexed += codeResult.chunks;
      result.errors.push(...codeResult.errors);
    }

    if (git) {
      const gitResult = await this.gitIndexer.indexNewCommits();
      result.indexed += gitResult.commits;
      result.errors.push(...gitResult.errors);
    }

    // Update shadow files
    if (this.config.updateShadow) {
      await this.shadowGenerator.generateAll();
    }

    // Process embeddings
    if (this.config.processEmbeddings) {
      try {
        await this.config.embeddings.processQueue();
      } catch {
        // Optional
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Get sync status
   */
  getStatus(): {
    running: boolean;
    syncInProgress: boolean;
    watchedDirectories: string[];
  } {
    return {
      running: this.running,
      syncInProgress: this.syncInProgress,
      watchedDirectories: this.watcher.getWatchedDirectories()
    };
  }
}

/**
 * Create and start a sync service
 */
export async function createSyncService(
  config: SyncServiceConfig
): Promise<SyncService> {
  const service = new SyncService(config);
  await service.start();
  return service;
}
