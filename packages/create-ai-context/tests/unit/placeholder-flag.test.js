/**
 * Placeholder --fail-on-unreplaced flag Tests
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { replacePlaceholders } = require('../../lib/placeholder');

describe('Placeholder --fail-on-unreplaced flag', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'placeholder-flag-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('with failOnUnreplaced=false (default)', () => {
    it('should not throw when placeholders remain', async () => {
      // Create .ai-context directory
      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      // Create AI_CONTEXT.md at root (also checked by replacePlaceholders)
      const aiContextPath = path.join(tempDir, 'AI_CONTEXT.md');
      // Use a custom placeholder that doesn't exist in KNOWN_PLACEHOLDERS
      fs.writeFileSync(aiContextPath, 'Test with {{CUSTOM_PLACEHOLDER_XYZ}} content');

      const result = await replacePlaceholders(tempDir, { failOnUnreplaced: false });

      expect(result.totalReplaced).toBeGreaterThanOrEqual(0);
      expect(result.unreplacedCount).toBeGreaterThan(0);
      expect(result.unreplaced.some(u => u.placeholder === '{{CUSTOM_PLACEHOLDER_XYZ}}')).toBe(true);
    });

    it('should return empty unreplaced array when all placeholders replaced', async () => {
      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      // Create a file with only replaced content
      const testFile = path.join(aiContextDir, 'test.md');
      fs.writeFileSync(testFile, 'Test with replaced content');

      const result = await replacePlaceholders(tempDir, { failOnUnreplaced: false });

      expect(result.unreplacedCount).toBe(0);
      expect(result.unreplaced).toEqual([]);
    });
  });

  describe('with failOnUnreplaced=true', () => {
    it('should throw error when placeholders remain', async () => {
      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      // Create a file with unreplaced placeholder
      const testFile = path.join(aiContextDir, 'test.md');
      fs.writeFileSync(testFile, 'Test with {{UNREPLIED_PLACEHOLDER}} content');

      await expect(
        replacePlaceholders(tempDir, { failOnUnreplaced: true })
      ).rejects.toThrow('1 placeholder not replaced');
    });

    it('should not throw when all placeholders are replaced', async () => {
      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      // Create a file with only replaced content
      const testFile = path.join(aiContextDir, 'test.md');
      fs.writeFileSync(testFile, 'Test with replaced content');

      const result = await replacePlaceholders(tempDir, { failOnUnreplaced: true });

      expect(result.unreplacedCount).toBe(0);
    });
  });

  describe('verbose mode', () => {
    it('should log warnings when verbose=true and placeholders remain', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      const testFile = path.join(aiContextDir, 'test.md');
      fs.writeFileSync(testFile, 'Test with {{UNREPLACED}} and {{ANOTHER}}');

      await replacePlaceholders(tempDir, { failOnUnreplaced: false, verbose: true });

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('2 placeholders not replaced'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('{{UNREPLACED}}'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('{{ANOTHER}}'));

      consoleWarnSpy.mockRestore();
    });

    it('should not log warnings when verbose=false', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      const testFile = path.join(aiContextDir, 'test.md');
      fs.writeFileSync(testFile, 'Test with {{UNREPLACED}} content');

      await replacePlaceholders(tempDir, { failOnUnreplaced: false, verbose: false });

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('deduplication', () => {
    it('should deduplicate unreplaced placeholders from same file', async () => {
      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      // Create a file with duplicate unreplaced placeholder
      const testFile = path.join(aiContextDir, 'test.md');
      fs.writeFileSync(testFile, 'Test {{FOO}} and {{FOO}} again');

      const result = await replacePlaceholders(tempDir, { failOnUnreplaced: false });

      expect(result.unreplacedCount).toBe(1);
      expect(result.unreplaced[0].placeholder).toBe('{{FOO}}');
    });

    it('should track unreplaced placeholders from different files', async () => {
      const aiContextDir = path.join(tempDir, '.ai-context');
      fs.mkdirSync(aiContextDir, { recursive: true });

      fs.writeFileSync(path.join(aiContextDir, 'test1.md'), '{{FOO}}');
      fs.writeFileSync(path.join(aiContextDir, 'test2.md'), '{{BAR}}');

      const result = await replacePlaceholders(tempDir, { failOnUnreplaced: false });

      expect(result.unreplacedCount).toBe(2);
    });
  });
});
