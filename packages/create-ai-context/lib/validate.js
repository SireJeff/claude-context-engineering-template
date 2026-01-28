/**
 * AI Context Engineering - Installation Validator
 *
 * Validates the installation was successful.
 */

const fs = require('fs');
const path = require('path');

/**
 * Context directory and file names
 */
const AI_CONTEXT_DIR = '.ai-context';
const AI_CONTEXT_FILE = 'AI_CONTEXT.md';

/**
 * Required files and directories for a valid installation
 */
const REQUIRED_STRUCTURE = {
  directories: [
    AI_CONTEXT_DIR,
    `${AI_CONTEXT_DIR}/context`,
    `${AI_CONTEXT_DIR}/research`,
    `${AI_CONTEXT_DIR}/plans`,
  ],
  files: [
    AI_CONTEXT_FILE,
    `${AI_CONTEXT_DIR}/README.md`,
    `${AI_CONTEXT_DIR}/settings.json`,
    `${AI_CONTEXT_DIR}/context/WORKFLOW_INDEX.md`,
  ],
};

/**
 * Validate the installation
 */
async function validateInstallation(targetDir) {
  const result = {
    passed: true,
    warnings: 0,
    errors: 0,
    checks: [],
  };

  // Check required directories
  for (const dir of REQUIRED_STRUCTURE.directories) {
    const fullPath = path.join(targetDir, dir);
    const exists = fs.existsSync(fullPath);

    result.checks.push({
      type: 'directory',
      path: dir,
      status: exists ? 'PASS' : 'FAIL',
    });

    if (!exists) {
      result.errors++;
      result.passed = false;
    }
  }

  // Check required files
  for (const file of REQUIRED_STRUCTURE.files) {
    const fullPath = path.join(targetDir, file);
    const exists = fs.existsSync(fullPath);

    result.checks.push({
      type: 'file',
      path: file,
      status: exists ? 'PASS' : 'FAIL',
    });

    if (!exists) {
      result.errors++;
      result.passed = false;
    }
  }

  // Check for remaining placeholders in key files
  const filesToCheck = [
    AI_CONTEXT_FILE,
    `${AI_CONTEXT_DIR}/README.md`,
    `${AI_CONTEXT_DIR}/settings.json`,
  ];

  for (const file of filesToCheck) {
    const fullPath = path.join(targetDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const placeholders = content.match(/\{\{[A-Z_]+\}\}/g) || [];

      if (placeholders.length > 0) {
        result.checks.push({
          type: 'placeholders',
          path: file,
          status: 'WARN',
          details: `${placeholders.length} placeholders remaining`,
        });
        result.warnings++;
      }
    }
  }

  // Validate settings.json is valid JSON
  const settingsPath = path.join(targetDir, AI_CONTEXT_DIR, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    try {
      JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      result.checks.push({
        type: 'json',
        path: `${AI_CONTEXT_DIR}/settings.json`,
        status: 'PASS',
      });
    } catch (e) {
      result.checks.push({
        type: 'json',
        path: `${AI_CONTEXT_DIR}/settings.json`,
        status: 'FAIL',
        details: 'Invalid JSON',
      });
      result.errors++;
      result.passed = false;
    }
  }

  return result;
}

/**
 * Count files in a directory
 */
function countFiles(dir, pattern = '*') {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      count++;
    } else if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name), pattern);
    }
  }

  return count;
}

module.exports = {
  validateInstallation,
  countFiles,
  REQUIRED_STRUCTURE,
  AI_CONTEXT_DIR,
  AI_CONTEXT_FILE,
};
