/**
 * Cross-Tool Sync Tests
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  initSyncState,
  saveSyncState,
  calculateFileHash,
  getToolContextFiles,
  detectChangedTool,
  checkSyncStatus,
  updateSyncStateOnly,
  TOOL_CONTEXT_FILES,
  CONFLICT_STRATEGY
} = require('../../lib/cross-tool-sync');

describe('Cross-Tool Sync', () => {
  let testDir;

  beforeEach(() => {
    // Create temporary directory for tests
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-context-sync-'));
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Sync State Management', () => {
    test('should initialize sync state', () => {
      const state = initSyncState(testDir);

      expect(state).toHaveProperty('version', '1.0.0');
      expect(state).toHaveProperty('lastSync', null);
      expect(state).toHaveProperty('toolHashes', {});
      expect(state).toHaveProperty('conflicts', []);
      expect(state).toHaveProperty('syncHistory', []);
    });

    test('should create sync state file', () => {
      initSyncState(testDir);

      const statePath = path.join(testDir, '.ai-context', 'sync-state.json');
      expect(fs.existsSync(statePath)).toBe(true);
    });

    test('should save and load sync state', () => {
      const state = initSyncState(testDir);
      state.lastSync = '2024-01-01T00:00:00Z';
      state.toolHashes = { claude: 'abc123' };

      saveSyncState(testDir, state);

      const loaded = require(path.join(testDir, '.ai-context', 'sync-state.json'));
      expect(loaded.lastSync).toBe('2024-01-01T00:00:00Z');
      expect(loaded.toolHashes.claude).toBe('abc123');
    });
  });

  describe('File Hash Calculation', () => {
    test('should calculate hash for existing file', () => {
      const testFile = path.join(testDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content');

      const hash = calculateFileHash(testFile);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hex length
    });

    test('should return null for non-existent file', () => {
      const hash = calculateFileHash(path.join(testDir, 'nonexistent.txt'));
      expect(hash).toBeNull();
    });

    test('should return different hashes for different content', () => {
      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');

      fs.writeFileSync(file1, 'content 1');
      fs.writeFileSync(file2, 'content 2');

      const hash1 = calculateFileHash(file1);
      const hash2 = calculateFileHash(file2);

      expect(hash1).not.toBe(hash2);
    });

    test('should return same hash for same content', () => {
      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');

      fs.writeFileSync(file1, 'same content');
      fs.writeFileSync(file2, 'same content');

      const hash1 = calculateFileHash(file1);
      const hash2 = calculateFileHash(file2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Tool Context Files', () => {
    test('should return empty array for non-existent files', () => {
      const files = getToolContextFiles('claude', testDir);
      expect(files).toEqual([]);
    });

    test('should find existing AI_CONTEXT.md', () => {
      const aiContextPath = path.join(testDir, 'AI_CONTEXT.md');
      fs.writeFileSync(aiContextPath, '# Test');

      const files = getToolContextFiles('claude', testDir);

      expect(files).toHaveLength(1);
      expect(files[0].path).toBe('AI_CONTEXT.md');
      expect(files[0].hash).toBeTruthy();
      expect(files[0].isDirectory).toBe(false);
    });

    test('should handle .claude/ directory', () => {
      const claudeDir = path.join(testDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'test.md'), 'test');

      const files = getToolContextFiles('claude', testDir);

      expect(files).toHaveLength(1);
      expect(files[0].path).toBe('.claude/');
      expect(files[0].hash).toBeTruthy();
      expect(files[0].isDirectory).toBe(true);
    });

    test('should know context file paths for each tool', () => {
      expect(TOOL_CONTEXT_FILES.claude).toContain('AI_CONTEXT.md');
      expect(TOOL_CONTEXT_FILES.claude).toContain('.claude/');
      expect(TOOL_CONTEXT_FILES.copilot).toContain('.github/copilot-instructions.md');
      expect(TOOL_CONTEXT_FILES.cline).toContain('.clinerules');
      expect(TOOL_CONTEXT_FILES.antigravity).toContain('.agent/');
    });
  });

  describe('Change Detection', () => {
    test('should detect no changes when no files exist', () => {
      const state = initSyncState(testDir);
      const { changedTools, currentHashes } = detectChangedTool(testDir, state);

      expect(changedTools).toHaveLength(0);
      expect(currentHashes).toBeDefined();
    });

    test('should detect new file', () => {
      const state = initSyncState(testDir);
      // First, record initial state (no files)
      const { currentHashes: initialHashes } = detectChangedTool(testDir, state);
      state.toolHashes = initialHashes;
      state.lastSync = new Date().toISOString(); // Mark as synced

      // Create file
      const aiContextPath = path.join(testDir, 'AI_CONTEXT.md');
      fs.writeFileSync(aiContextPath, '# Test');

      // Now detect changes
      const { changedTools } = detectChangedTool(testDir, state);

      expect(changedTools).toHaveLength(1);
      expect(changedTools[0].tool).toBe('claude');
    });

    test('should detect file modification', () => {
      const state = initSyncState(testDir);

      // Create initial file
      const aiContextPath = path.join(testDir, 'AI_CONTEXT.md');
      fs.writeFileSync(aiContextPath, '# Initial');

      // Record initial hash
      const { currentHashes } = detectChangedTool(testDir, state);
      state.toolHashes = currentHashes;

      // Modify file
      fs.writeFileSync(aiContextPath, '# Modified');

      // Detect change
      const { changedTools } = detectChangedTool(testDir, state);

      expect(changedTools).toHaveLength(1);
      expect(changedTools[0].tool).toBe('claude');
    });
  });

  describe('Sync Status', () => {
    test('should show in sync when no changes', () => {
      const status = checkSyncStatus(testDir);

      expect(status).toHaveProperty('inSync', true);
      expect(status).toHaveProperty('tools');
      expect(status).toHaveProperty('lastSync', null);
    });

    test('should show tools exist property', () => {
      // Create AI_CONTEXT.md
      const aiContextPath = path.join(testDir, 'AI_CONTEXT.md');
      fs.writeFileSync(aiContextPath, '# Test');

      const status = checkSyncStatus(testDir);

      expect(status.tools.claude.exists).toBe(true);
      expect(status.tools.copilot.exists).toBe(false);
    });

    test('should show out of sync after changes', () => {
      // Initialize sync state to establish baseline
      const state = initSyncState(testDir);
      const { currentHashes } = detectChangedTool(testDir, state);
      state.toolHashes = currentHashes;
      state.lastSync = new Date().toISOString();
      saveSyncState(testDir, state);

      // Initial status should be in sync
      const status1 = checkSyncStatus(testDir);
      expect(status1.inSync).toBe(true);

      // Create a file
      const aiContextPath = path.join(testDir, 'AI_CONTEXT.md');
      fs.writeFileSync(aiContextPath, '# Test');

      // Now should be out of sync
      const status2 = checkSyncStatus(testDir);
      expect(status2.inSync).toBe(false);
    });
  });

  describe('Conflict Strategies', () => {
    test('should have all required strategies', () => {
      expect(CONFLICT_STRATEGY.SOURCE_WINS).toBe('source_wins');
      expect(CONFLICT_STRATEGY.REGENERATE_ALL).toBe('regenerate_all');
      expect(CONFLICT_STRATEGY.MANUAL).toBe('manual');
      expect(CONFLICT_STRATEGY.NEWEST).toBe('newest');
    });
  });

  describe('Format Sync Status', () => {
    test('should format sync status for display', () => {
      const { formatSyncStatus } = require('../../lib/cross-tool-sync');

      const status = checkSyncStatus(testDir);
      const formatted = formatSyncStatus(status);

      expect(formatted).toContain('Cross-Tool Sync Status');
      expect(formatted).toContain('Overall:');
    });
  });

  describe('Update Sync State Only', () => {
    test('should update sync state without regenerating files', () => {
      // Create an AI context file
      const aiContextPath = path.join(testDir, 'AI_CONTEXT.md');
      fs.writeFileSync(aiContextPath, '# Test Context');

      // Update sync state only
      const result = updateSyncStateOnly(testDir);

      expect(result.updated).toBe(true);
      expect(result.timestamp).toBeTruthy();
      expect(result.hashes).toBeDefined();
    });

    test('should record post-commit source in history', () => {
      // Update sync state only
      updateSyncStateOnly(testDir);

      // Check sync state file
      const statePath = path.join(testDir, '.ai-context', 'sync-state.json');
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));

      expect(state.syncHistory).toHaveLength(1);
      expect(state.syncHistory[0].source).toBe('post-commit');
      expect(state.syncHistory[0].strategy).toBe('state_only');
      expect(state.syncHistory[0].propagatedCount).toBe(0);
    });

    test('should not create any new context files', () => {
      // Record files before
      const filesBefore = fs.readdirSync(testDir);

      // Update sync state only
      updateSyncStateOnly(testDir);

      // Only .ai-context directory should be added
      const filesAfter = fs.readdirSync(testDir);
      const newFiles = filesAfter.filter(f => !filesBefore.includes(f));

      expect(newFiles).toEqual(['.ai-context']);
    });

    test('should update lastSync timestamp', () => {
      const result = updateSyncStateOnly(testDir);

      const statePath = path.join(testDir, '.ai-context', 'sync-state.json');
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));

      expect(state.lastSync).toBe(result.timestamp);
    });
  });
});
