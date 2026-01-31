/**
 * Test sync:from command error reporting
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const path = require('path');
const fs = require('fs');
const { propagateContextChange } = require('../../lib/cross-tool-sync/sync-manager');

describe('sync:from error reporting', () => {
  const testDir = path.join(__dirname, '../fixtures/sync-from-errors');

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should format error messages from propagation', async () => {
    const config = {
      projectName: 'test-project',
      aiTools: ['claude', 'copilot', 'cline', 'antigravity']
    };

    const results = await propagateContextChange('claude', testDir, config, 'source_wins');

    // Error objects should have tool property
    results.errors.forEach(error => {
      expect(error).toHaveProperty('tool');
      if (error.errors) {
        expect(Array.isArray(error.errors)).toBe(true);
      }
    });
  });
});
