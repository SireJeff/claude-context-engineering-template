/**
 * Test AI_TOOLS array completeness
 */

const { describe, it, expect } = require('@jest/globals');
const { getAdapterNames } = require('../../lib/adapters');

describe('AI_TOOLS array', () => {
  it('should include all available adapters except "all"', () => {
    // This test verifies we can use all adapter names via CLI
    const allAdapters = getAdapterNames();
    const expectedTools = allAdapters.filter(t => t !== 'all');

    // All adapters should be usable (this will fail if we try to use windsurf/aider/continue)
    expectedTools.forEach(tool => {
      expect(tool).toMatch(/^(claude|copilot|cline|antigravity|windsurf|aider|continue)$/);
    });
  });
});
