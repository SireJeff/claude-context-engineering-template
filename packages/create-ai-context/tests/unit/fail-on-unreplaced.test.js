/**
 * Test --fail-on-unreplaced functionality
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const path = require('path');
const fs = require('fs');
const { replacePlaceholders } = require('../../lib/placeholder');

describe('--fail-on-unreplaced option', () => {
  const testDir = path.join(__dirname, '../fixtures/fail-unreplaced');
  const aiContextDir = path.join(testDir, '.ai-context');
  const testFile = path.join(aiContextDir, 'test.md');

  beforeEach(() => {
    fs.mkdirSync(aiContextDir, { recursive: true });

    // Create a file with custom placeholders that won't be replaced
    // Regex requires uppercase letters and underscores only: [A-Z_]+
    fs.writeFileSync(testFile, '# Test\n\n{{CUSTOM_UNIQUE_PLACEHOLDER_X}} is working on {{ANOTHER_CUSTOM_PLACEHOLDER_Y}}.');
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should throw when failOnUnreplaced is true and placeholders remain', async () => {
    await expect(replacePlaceholders(testDir, {
      failOnUnreplaced: true,
      verbose: false
    })).rejects.toThrow(/placeholders not replaced/);
  });

  it('should not throw when failOnUnreplaced is false', async () => {
    const result = await replacePlaceholders(testDir, {
      failOnUnreplaced: false,
      verbose: false
    });

    expect(result).toHaveProperty('unreplacedCount');
    expect(result.unreplacedCount).toBeGreaterThan(0);
  });
});
