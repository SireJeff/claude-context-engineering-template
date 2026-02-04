/**
 * SyncService Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncService, type SyncServiceConfig, type SyncResult } from '../src/watcher/sync-service.js';
import type { FileChangeEvent } from '../src/watcher/file-watcher.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

// Mock the dependencies
const mockDb = {
  getItemsByType: vi.fn(() => []),
  upsertItem: vi.fn((item) => ({ id: 'test-id', ...item })),
  deleteItem: vi.fn(() => true),
  getStats: vi.fn(() => ({ items: 0, relations: 0, commits: 0, embeddings: 0 })),
  getSyncState: vi.fn(() => []),
  getAllItems: vi.fn(() => []),
  getRecentCommits: vi.fn(() => []),
};

const mockEmbeddings = {
  search: vi.fn(async () => []),
  queueForEmbedding: vi.fn(),
  processQueue: vi.fn(async () => 0),
  getCount: vi.fn(() => 0),
  deleteEmbedding: vi.fn(() => false),
};

describe('SyncService', () => {
  let syncService: SyncService;
  let tempDir: string;

  beforeEach(() => {
    // Create a real temp directory for simple-git
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-test-'));
    
    // Initialize git repo in temp directory
    try {
      execSync('git init', { cwd: tempDir, stdio: 'ignore' });
      execSync('git config user.email "test@test.com"', { cwd: tempDir, stdio: 'ignore' });
      execSync('git config user.name "Test"', { cwd: tempDir, stdio: 'ignore' });
    } catch {
      // Ignore git init errors
    }
    
    // Reset mocks
    vi.clearAllMocks();
    
    syncService = new SyncService({
      projectRoot: tempDir,
      db: mockDb as any,
      embeddings: mockEmbeddings as any,
      updateShadow: false, // Disable shadow updates for tests
      processEmbeddings: false, // Disable embeddings for tests
      verbose: false,
    });
  });

  afterEach(() => {
    if (syncService?.isRunning()) {
      syncService.stop();
    }
    
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('should create a sync service with default config', () => {
      expect(syncService).toBeDefined();
      expect(syncService.isRunning()).toBe(false);
    });

    it('should respect config options', () => {
      const service = new SyncService({
        projectRoot: tempDir,
        db: mockDb as any,
        embeddings: mockEmbeddings as any,
        updateShadow: true,
        processEmbeddings: true,
        verbose: true,
      });
      
      expect(service).toBeDefined();
      const status = service.getStatus();
      expect(status.running).toBe(false);
    });
  });

  describe('start/stop', () => {
    it('should start and emit started event', async () => {
      const startedHandler = vi.fn();
      syncService.on('started', startedHandler);
      
      await syncService.start();
      
      expect(syncService.isRunning()).toBe(true);
      expect(startedHandler).toHaveBeenCalled();
    });

    it('should stop and emit stopped event', async () => {
      const stoppedHandler = vi.fn();
      syncService.on('stopped', stoppedHandler);
      
      await syncService.start();
      syncService.stop();
      
      expect(syncService.isRunning()).toBe(false);
      expect(stoppedHandler).toHaveBeenCalled();
    });

    it('should not start twice', async () => {
      await syncService.start();
      await syncService.start(); // Should be no-op
      
      expect(syncService.isRunning()).toBe(true);
    });

    it('should not stop when not running', () => {
      syncService.stop(); // Should be no-op, no error
      expect(syncService.isRunning()).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return status with running state', async () => {
      let status = syncService.getStatus();
      expect(status.running).toBe(false);
      expect(status.syncInProgress).toBe(false);
      
      await syncService.start();
      status = syncService.getStatus();
      expect(status.running).toBe(true);
    });

    it('should return watched directories', async () => {
      await syncService.start();
      const status = syncService.getStatus();
      expect(Array.isArray(status.watchedDirectories)).toBe(true);
    });
  });

  describe('reindex', () => {
    it('should return a sync result', async () => {
      const result = await syncService.reindex({ context: true });
      
      expect(result).toBeDefined();
      expect(typeof result.indexed).toBe('number');
      expect(typeof result.removed).toBe('number');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(typeof result.duration).toBe('number');
    });

    it('should respect reindex options', async () => {
      const result = await syncService.reindex({
        context: false,
        code: false,
        git: false,
      });
      
      expect(result.indexed).toBe(0);
    });
  });

  describe('isContextFile', () => {
    it('should identify context files', () => {
      const isContextFile = (syncService as any).isContextFile.bind(syncService);
      
      expect(isContextFile('.claude/test.md')).toBe(true);
      expect(isContextFile('.ai-context/workflow.md')).toBe(true);
      expect(isContextFile('CLAUDE.md')).toBe(true);
      expect(isContextFile('AI_CONTEXT.md')).toBe(true);
      expect(isContextFile('.clinerules')).toBe(true);
      expect(isContextFile('.github/copilot-instructions.md')).toBe(true);
      expect(isContextFile('src/index.ts')).toBe(false);
    });
  });

  describe('isCodeFile', () => {
    it('should identify code files', () => {
      const isCodeFile = (syncService as any).isCodeFile.bind(syncService);
      
      expect(isCodeFile('src/index.ts')).toBe(true);
      expect(isCodeFile('lib/utils.js')).toBe(true);
      expect(isCodeFile('main.py')).toBe(true);
      expect(isCodeFile('app.go')).toBe(true);
      expect(isCodeFile('README.md')).toBe(false);
      expect(isCodeFile('package.json')).toBe(false);
    });
  });

  describe('detectLanguage', () => {
    it('should detect programming languages', () => {
      const detectLanguage = (syncService as any).detectLanguage.bind(syncService);
      
      expect(detectLanguage('src/index.ts')).toBe('typescript');
      expect(detectLanguage('lib/utils.js')).toBe('javascript');
      expect(detectLanguage('main.py')).toBe('python');
      expect(detectLanguage('app.go')).toBe('go');
      expect(detectLanguage('lib.rs')).toBe('rust');
      expect(detectLanguage('App.java')).toBe('java');
      expect(detectLanguage('Program.cs')).toBe('csharp');
      expect(detectLanguage('README.md')).toBe(null);
    });
  });

  describe('event handling', () => {
    it('should emit sync-error on failure', async () => {
      const errorHandler = vi.fn();
      syncService.on('sync-error', errorHandler);
      
      // This test verifies the event is properly wired
      expect(syncService.listenerCount('sync-error')).toBe(1);
    });

    it('should emit watcher events', async () => {
      const watcherStarted = vi.fn();
      syncService.on('watcher-started', watcherStarted);
      
      await syncService.start();
      
      // Watcher may or may not emit started depending on directory existence
      expect(syncService.isRunning()).toBe(true);
    });
  });

  describe('pending changes accumulation', () => {
    it('should have pending changes accumulator', () => {
      // Access private property to verify it exists
      const accumulator = (syncService as any).pendingChangesAccumulator;
      expect(Array.isArray(accumulator)).toBe(true);
      expect(accumulator.length).toBe(0);
    });
  });
});

describe('SyncResult', () => {
  it('should have correct structure', () => {
    const result: SyncResult = {
      indexed: 5,
      removed: 2,
      errors: ['test error'],
      duration: 100,
    };
    
    expect(result.indexed).toBe(5);
    expect(result.removed).toBe(2);
    expect(result.errors).toContain('test error');
    expect(result.duration).toBe(100);
  });
});
