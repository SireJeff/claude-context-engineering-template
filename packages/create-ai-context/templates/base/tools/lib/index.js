/**
 * Claude Context Engineering Tools - Main Entry
 *
 * Exports all public APIs from the tools library.
 */

const { init } = require('./init');
const { validate } = require('./validate');
const { diagnose } = require('./diagnose');
const { configLoader } = require('./config-loader');
const { logger } = require('./logger');
const errors = require('./errors');

// Self-sustaining automation modules
const sessionManager = require('./session-manager');
const anchorResolver = require('./anchor-resolver');
const driftDetector = require('./drift-detector');

module.exports = {
  // Commands
  init,
  validate,
  diagnose,

  // Utilities
  configLoader,
  logger,
  errors,

  // Session Management
  sessionManager,

  // Synchronization
  anchorResolver,
  driftDetector,
};
