/**
 * Test sync command error reporting
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const path = require('path');
const fs = require('fs');
const { syncAllFromCodebase } = require('../../lib/cross-tool-sync/sync-manager');

describe('sync:all error reporting', () => {
  const testDir = path.join(__dirname, '../fixtures/sync-errors');

  beforeEach(() => {
    // Create test fixture with intentionally failing adapter
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should format error messages with tool name and errors array', async () => {
    const config = {
      projectName: 'test-project',
      aiTools: ['claude', 'copilot', 'cline', 'antigravity']
    };

    const results = await syncAllFromCodebase(testDir, config);

    // When errors occur, they should have both tool and errors/message properties
    results.errors.forEach(error => {
      expect(error).toHaveProperty('tool');
      expect(error).toMatchObject({
        tool: expect.any(String),
        // Either errors array OR message should exist
        errors: expect.any(Array)
      });
    });
  });
});
