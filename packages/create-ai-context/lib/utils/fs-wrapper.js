/**
 * Filesystem Operation Wrapper
 *
 * Adds context to filesystem errors (WARNING level, not fatal)
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Wrap sync file write with better error messages
 * Returns warning object instead of throwing (non-fatal)
 * @param {string} filePath - File path
 * @param {string} content - Content to write
 * @param {object} options - Write options
 * @returns {object} { success: boolean, warning?: string }
 */
function writeFileSyncWithContext(filePath, content, options = {}) {
  try {
    fs.writeFileSync(filePath, content, options);
    return { success: true };
  } catch (error) {
    let message;
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      message = `Permission denied writing to ${filePath}. Check file permissions.`;
    } else if (error.code === 'ENOENT') {
      message = `Directory does not exist: ${path.dirname(filePath)}. Ensure parent directory exists.`;
    } else if (error.code === 'ENOSPC') {
      message = `No space left on device while writing ${filePath}. Free up disk space.`;
    } else {
      message = `Failed to write ${filePath}: ${error.message}`;
    }
    return { success: false, warning: message, error };
  }
}

/**
 * Wrap sync directory creation with better error messages
 * Returns warning object instead of throwing (non-fatal)
 * @param {string} dirPath - Directory path
 * @param {object} options - mkdir options
 * @returns {object} { success: boolean, warning?: string }
 */
function mkdirSyncWithContext(dirPath, options = {}) {
  try {
    fs.mkdirSync(dirPath, options);
    return { success: true };
  } catch (error) {
    // EEXIST is not an error - directory already exists
    if (error.code === 'EEXIST') {
      return { success: true };
    }
    let message;
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      message = `Permission denied creating directory ${dirPath}. Check directory permissions.`;
    } else {
      message = `Failed to create directory ${dirPath}: ${error.message}`;
    }
    return { success: false, warning: message, error };
  }
}

/**
 * Log a warning message if verbose mode is enabled
 * @param {object} result - Result from writeFileSyncWithContext or mkdirSyncWithContext
 * @param {boolean} verbose - Whether to log warnings
 */
function logWarning(result, verbose = false) {
  if (!result.success && result.warning && verbose) {
    console.warn(chalk.yellow(`⚠ ${result.warning}`));
  }
}

module.exports = {
  writeFileSyncWithContext,
  mkdirSyncWithContext,
  logWarning
};
