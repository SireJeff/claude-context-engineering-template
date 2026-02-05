/**
 * File Watcher Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileWatcher, type FileChangeEvent, type WatcherConfig } from '../src/watcher/file-watcher.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('FileWatcher', () => {
  let tempDir: string;
  let watcher: FileWatcher;

  beforeEach(() => {
    // Create a temporary directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watcher-test-'));
    
    // Create some test files
    fs.mkdirSync(path.join(tempDir, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), '# Test Context');
    fs.writeFileSync(path.join(tempDir, '.claude', 'test.md'), '# Test File');
  });

  afterEach(() => {
    // Stop watcher if running
    if (watcher) {
      watcher.stop();
    }
    
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('should create a watcher with default config', () => {
      watcher = new FileWatcher(tempDir);
      expect(watcher).toBeDefined();
      expect(watcher.isRunning()).toBe(false);
    });

    it('should accept custom config', () => {
      const config: Partial<WatcherConfig> = {
        debounceMs: 1000,
        verbose: true
      };
      
      watcher = new FileWatcher(tempDir, config);
      expect(watcher).toBeDefined();
    });
  });

  describe('start/stop', () => {
    it('should start and stop watching', async () => {
      watcher = new FileWatcher(tempDir);
      
      await watcher.start();
      expect(watcher.isRunning()).toBe(true);
      
      watcher.stop();
      expect(watcher.isRunning()).toBe(false);
    });

    it('should emit started event', async () => {
      watcher = new FileWatcher(tempDir);
      
      const startedHandler = vi.fn();
      watcher.on('started', startedHandler);
      
      await watcher.start();
      expect(startedHandler).toHaveBeenCalled();
    });

    it('should emit stopped event', async () => {
      watcher = new FileWatcher(tempDir);
      
      const stoppedHandler = vi.fn();
      watcher.on('stopped', stoppedHandler);
      
      await watcher.start();
      watcher.stop();
      
      expect(stoppedHandler).toHaveBeenCalled();
    });

    it('should not start twice', async () => {
      watcher = new FileWatcher(tempDir);
      
      await watcher.start();
      await watcher.start(); // Should be no-op
      
      expect(watcher.isRunning()).toBe(true);
    });
  });

  describe('pattern matching', () => {
    it('should match context file patterns', () => {
      watcher = new FileWatcher(tempDir);
      
      // Access private method via any cast for testing
      const matchesPattern = (watcher as any).matchesWatchPattern.bind(watcher);
      
      // The pattern .claude/**/*.md requires at least one subdirectory
      expect(matchesPattern('.claude/subdir/test.md')).toBe(true);
      // src/**/*.ts should match nested files
      expect(matchesPattern('src/components/test.ts')).toBe(true);
      // lib/**/*.js should match
      expect(matchesPattern('lib/utils/index.js')).toBe(true);
    });

    it('should ignore specified patterns', () => {
      watcher = new FileWatcher(tempDir);
      
      const shouldIgnore = (watcher as any).shouldIgnore.bind(watcher);
      
      // The ignore patterns require **/ at start to match anywhere
      // **/node_modules/** matches node_modules anywhere in the path
      expect(shouldIgnore('project/node_modules/test/file.js')).toBe(true);
      expect(shouldIgnore('a/b/dist/c/bundle.js')).toBe(true);
      expect(shouldIgnore('repo/.git/objects/pack/abc')).toBe(true);
    });
  });

  describe('addWatchPattern', () => {
    it('should add new watch patterns', () => {
      watcher = new FileWatcher(tempDir);
      
      watcher.addWatchPattern('custom/**/*.txt');
      
      const matchesPattern = (watcher as any).matchesWatchPattern.bind(watcher);
      expect(matchesPattern('custom/subdir/test.txt')).toBe(true);
    });
  });

  describe('addIgnorePattern', () => {
    it('should add new ignore patterns', () => {
      watcher = new FileWatcher(tempDir);
      
      watcher.addIgnorePattern('**/*.bak');
      
      const shouldIgnore = (watcher as any).shouldIgnore.bind(watcher);
      expect(shouldIgnore('dir/test.bak')).toBe(true);
    });
  });

  describe('getWatchedDirectories', () => {
    it('should return watched directories after start', async () => {
      watcher = new FileWatcher(tempDir);
      
      await watcher.start();
      const dirs = watcher.getWatchedDirectories();
      
      expect(dirs.length).toBeGreaterThan(0);
      expect(dirs).toContain(tempDir);
    });

    it('should return empty array before start', () => {
      watcher = new FileWatcher(tempDir);
      
      const dirs = watcher.getWatchedDirectories();
      expect(dirs).toEqual([]);
    });
  });
});

describe('WatcherConfig', () => {
  it('should have correct default values', () => {
    const watcher = new FileWatcher('/tmp');
    const config = (watcher as any).config;
    
    expect(config.debounceMs).toBe(500);
    expect(config.verbose).toBe(false);
    expect(config.watchPatterns).toContain('.claude/**/*.md');
    expect(config.ignorePatterns).toContain('**/node_modules/**');
    
    watcher.stop();
  });
});
