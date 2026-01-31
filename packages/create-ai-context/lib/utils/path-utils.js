/**
 * Path Utilities
 *
 * Cross-platform path handling utilities
 */

const path = require('path');

/**
 * Normalize path separators to forward slashes for consistency
 * @param {string} filePath - Path to normalize
 * @returns {string} Normalized path
 */
function normalizePath(filePath) {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/');
}

/**
 * Get relative path with normalized separators
 * @param {string} from - Source path
 * @param {string} to - Destination path
 * @returns {string} Normalized relative path
 */
function relativePath(from, to) {
  const rel = path.relative(from, to);
  return normalizePath(rel);
}

/**
 * Join path segments and normalize
 * @param {...string} segments - Path segments
 * @returns {string} Normalized joined path
 */
function joinPath(...segments) {
  return normalizePath(path.join(...segments));
}

/**
 * Check if path is absolute (cross-platform)
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
function isAbsolute(filePath) {
  if (!filePath) return false;

  // Windows paths can start with drive letter (C:\) or UNC (\\)
  if (/^[a-zA-Z]:\\/.test(filePath) || /^\\\\/.test(filePath)) {
    return true;
  }

  return path.isAbsolute(filePath);
}

module.exports = {
  normalizePath,
  relativePath,
  joinPath,
  isAbsolute
};
