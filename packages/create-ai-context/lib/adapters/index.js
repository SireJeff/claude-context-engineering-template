/**
 * AI Context Adapters
 *
 * Exports all available AI tool adapters.
 */

const claude = require('./claude');
const copilot = require('./copilot');
const cline = require('./cline');
const antigravity = require('./antigravity');

/**
 * All available adapters
 */
const adapters = {
  claude,
  copilot,
  cline,
  antigravity
};

/**
 * Get adapter by name
 * @param {string} name - Adapter name
 * @returns {object|null} Adapter or null if not found
 */
function getAdapter(name) {
  return adapters[name] || null;
}

/**
 * Get all adapter names
 * @returns {string[]} Array of adapter names
 */
function getAdapterNames() {
  return Object.keys(adapters);
}

/**
 * Get adapters by names
 * @param {string[]} names - Array of adapter names
 * @returns {object[]} Array of adapters
 */
function getAdapters(names) {
  return names
    .map(name => adapters[name])
    .filter(Boolean);
}

/**
 * Get all adapters
 * @returns {object[]} Array of all adapters
 */
function getAllAdapters() {
  return Object.values(adapters);
}

module.exports = {
  adapters,
  getAdapter,
  getAdapterNames,
  getAdapters,
  getAllAdapters,
  // Export individual adapters
  claude,
  copilot,
  cline,
  antigravity
};
