/**
 * FS Wrapper Tests
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  writeFileSyncWithContext,
  mkdirSyncWithContext,
  logWarning
} = require('../../../lib/utils/fs-wrapper');

describe('FS Wrapper', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-wrapper-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('writeFileSyncWithContext', () => {
    it('should successfully write a file', () => {
      const filePath = path.join(tempDir, 'test.txt');
      const result = writeFileSyncWithContext(filePath, 'Hello, World!');

      expect(result.success).toBe(true);
      expect(result.warning).toBeUndefined();
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('Hello, World!');
    });

    it('should return warning for ENOENT error', () => {
      // Create a path with non-existent parent
      const filePath = path.join(tempDir, 'nonexistent', 'test.txt');
      const result = writeFileSyncWithContext(filePath, 'content', { mode: 0o600 });

      expect(result.success).toBe(false);
      expect(result.warning).toContain('does not exist');
    });

    it('should handle invalid file path gracefully', () => {
      // On Windows, some paths are invalid (e.g., containing invalid characters)
      const invalidPath = path.join(tempDir, 'invalid\0file.txt');
      const result = writeFileSyncWithContext(invalidPath, 'content');

      // Should return a result object (success may vary by platform)
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('mkdirSyncWithContext', () => {
    it('should successfully create a directory', () => {
      const dirPath = path.join(tempDir, 'newdir');
      const result = mkdirSyncWithContext(dirPath);

      expect(result.success).toBe(true);
      expect(result.warning).toBeUndefined();
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should create nested directories with recursive option', () => {
      const dirPath = path.join(tempDir, 'parent', 'child', 'grandchild');
      const result = mkdirSyncWithContext(dirPath, { recursive: true });

      expect(result.success).toBe(true);
      expect(result.warning).toBeUndefined();
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should handle existing directory gracefully', () => {
      const dirPath = path.join(tempDir, 'existing');
      fs.mkdirSync(dirPath);
      const result = mkdirSyncWithContext(dirPath);

      expect(result.success).toBe(true);
      expect(result.warning).toBeUndefined();
    });
  });

  describe('logWarning', () => {
    it('should log warning when verbose is true and result failed', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = { success: false, warning: 'Test warning message' };

      logWarning(result, true);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('⚠'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Test warning message'));

      consoleWarnSpy.mockRestore();
    });

    it('should not log when verbose is false', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = { success: false, warning: 'Test warning message' };

      logWarning(result, false);

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should not log when result succeeded', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = { success: true };

      logWarning(result, true);

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should not log when result has no warning', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = { success: false };

      logWarning(result, true);

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});
