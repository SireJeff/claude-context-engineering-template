#!/usr/bin/env node

/**
 * AI Context CLI Entry Point
 * 
 * This is the main entry point for the ai-context command.
 */

import('../dist/cli/index.js').catch((error) => {
  console.error('Failed to start AI Context CLI:', error);
  process.exit(1);
});
