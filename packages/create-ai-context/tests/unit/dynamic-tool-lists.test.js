/**
 * Test that tool lists use getAdapterNames() dynamically
 */

const { describe, it, expect } = require('@jest/globals');
const { getAdapterNames } = require('../../lib/adapters');

describe('Dynamic tool lists', () => {
  it('getAdapterNames should return expected tools', () => {
    const adapters = getAdapterNames();
    expect(adapters).toContain('claude');
    expect(adapters).toContain('copilot');
    expect(adapters).toContain('cline');
    expect(adapters).toContain('antigravity');
    expect(adapters).toContain('windsurf');
    expect(adapters).toContain('aider');
    expect(adapters).toContain('continue');
  });
});
