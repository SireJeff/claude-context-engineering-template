/**
 * Drift Detector - Detects documentation drift from code
 *
 * Compares documentation references against current code state
 * to identify outdated line numbers, renamed functions, etc.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { resolveAnchor, buildFileAnchors, loadAnchors } = require('./anchor-resolver');

const SYNC_DIR = path.join(__dirname, '..', '..', 'sync');
const HASHES_PATH = path.join(SYNC_DIR, 'hashes.json');
const STALENESS_PATH = path.join(SYNC_DIR, 'staleness.json');

/**
 * Drift severity levels
 */
const DRIFT_LEVEL = {
  NONE: 'none',
  LOW: 'low',         // Line number shifted slightly
  MEDIUM: 'medium',   // Function renamed or moved
  HIGH: 'high',       // Logic changed significantly
  CRITICAL: 'critical' // File deleted or major restructure
};

/**
 * Calculate file hash
 */
function hashFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Load stored hashes
 */
function loadHashes() {
  try {
    if (fs.existsSync(HASHES_PATH)) {
      const content = fs.readFileSync(HASHES_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to load hashes:', error.message);
  }
  return { version: '1.0.0', files: {} };
}

/**
 * Save hashes
 */
function saveHashes(data) {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    data.generatedAt = new Date().toISOString();
    fs.writeFileSync(HASHES_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save hashes:', error.message);
    return false;
  }
}

/**
 * Load staleness tracking
 */
function loadStaleness() {
  try {
    if (fs.existsSync(STALENESS_PATH)) {
      const content = fs.readFileSync(STALENESS_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to load staleness:', error.message);
  }
  return { version: '1.0.0', workflows: {}, thresholds: { warningDays: 30, staleDays: 90 } };
}

/**
 * Save staleness tracking
 */
function saveStaleness(data) {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    fs.writeFileSync(STALENESS_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save staleness:', error.message);
    return false;
  }
}

/**
 * Check if a file has changed since last recorded
 */
function checkFileChange(filePath, projectRoot = process.cwd()) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
  const stored = loadHashes();

  if (!fs.existsSync(fullPath)) {
    return {
      changed: true,
      level: DRIFT_LEVEL.CRITICAL,
      reason: 'File not found'
    };
  }

  const currentHash = hashFile(fullPath);
  const storedData = stored.files[filePath];

  if (!storedData) {
    return {
      changed: true,
      level: DRIFT_LEVEL.LOW,
      reason: 'File not previously tracked'
    };
  }

  if (storedData.hash !== currentHash) {
    return {
      changed: true,
      level: DRIFT_LEVEL.MEDIUM,
      reason: 'File content changed',
      previousHash: storedData.hash,
      currentHash
    };
  }

  return {
    changed: false,
    level: DRIFT_LEVEL.NONE
  };
}

/**
 * Extract line references from markdown content
 */
function extractLineReferences(content) {
  const references = [];

  // file:123 format
  const linePattern = /([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+):(\d+)/g;
  let match;
  while ((match = linePattern.exec(content)) !== null) {
    references.push({
      file: match[1],
      line: parseInt(match[2]),
      type: 'line',
      original: match[0]
    });
  }

  // file::function() format
  const anchorPattern = /([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)::(\w+)\(\)/g;
  while ((match = anchorPattern.exec(content)) !== null) {
    references.push({
      file: match[1],
      anchor: match[2],
      type: 'anchor',
      original: match[0]
    });
  }

  return references;
}

/**
 * Check drift for a workflow file
 */
function checkWorkflowDrift(workflowPath, projectRoot = process.cwd()) {
  const fullPath = path.isAbsolute(workflowPath)
    ? workflowPath
    : path.join(projectRoot, '.claude', workflowPath);

  if (!fs.existsSync(fullPath)) {
    return {
      workflow: workflowPath,
      status: 'error',
      error: 'Workflow file not found'
    };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const references = extractLineReferences(content);
  const issues = [];

  for (const ref of references) {
    if (ref.type === 'line') {
      // Check if file exists and line is valid
      const filePath = path.join(projectRoot, ref.file);

      if (!fs.existsSync(filePath)) {
        issues.push({
          ...ref,
          level: DRIFT_LEVEL.CRITICAL,
          issue: 'Referenced file not found'
        });
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      if (ref.line > lines.length) {
        issues.push({
          ...ref,
          level: DRIFT_LEVEL.HIGH,
          issue: `Line ${ref.line} exceeds file length (${lines.length} lines)`
        });
      }

      // Check if file has changed
      const changeResult = checkFileChange(ref.file, projectRoot);
      if (changeResult.changed && changeResult.level !== DRIFT_LEVEL.NONE) {
        issues.push({
          ...ref,
          level: changeResult.level,
          issue: changeResult.reason
        });
      }
    } else if (ref.type === 'anchor') {
      // Resolve semantic anchor
      const result = resolveAnchor(`${ref.file}::${ref.anchor}()`, projectRoot);
      if (!result.success) {
        issues.push({
          ...ref,
          level: DRIFT_LEVEL.HIGH,
          issue: result.error,
          availableSymbols: result.availableSymbols
        });
      }
    }
  }

  // Determine overall status
  let status = 'healthy';
  let maxLevel = DRIFT_LEVEL.NONE;

  for (const issue of issues) {
    if (issue.level === DRIFT_LEVEL.CRITICAL) {
      status = 'critical';
      maxLevel = DRIFT_LEVEL.CRITICAL;
    } else if (issue.level === DRIFT_LEVEL.HIGH && maxLevel !== DRIFT_LEVEL.CRITICAL) {
      status = 'stale';
      maxLevel = DRIFT_LEVEL.HIGH;
    } else if (issue.level === DRIFT_LEVEL.MEDIUM && maxLevel === DRIFT_LEVEL.NONE) {
      status = 'needs_update';
      maxLevel = DRIFT_LEVEL.MEDIUM;
    }
  }

  return {
    workflow: workflowPath,
    status,
    level: maxLevel,
    totalReferences: references.length,
    issues,
    checkedAt: new Date().toISOString()
  };
}

/**
 * Update file hashes for tracking
 */
function updateFileHashes(filePaths, projectRoot = process.cwd()) {
  const stored = loadHashes();

  for (const filePath of filePaths) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
    const hash = hashFile(fullPath);

    if (hash) {
      stored.files[filePath] = {
        hash,
        updatedAt: new Date().toISOString()
      };
    }
  }

  saveHashes(stored);
  return stored;
}

/**
 * Mark workflow as verified
 */
function markWorkflowVerified(workflowPath) {
  const staleness = loadStaleness();

  staleness.workflows[workflowPath] = {
    lastVerified: new Date().toISOString(),
    status: 'verified'
  };

  saveStaleness(staleness);
}

/**
 * Check staleness of all workflows
 */
function checkStaleness() {
  const staleness = loadStaleness();
  const now = Date.now();
  const results = [];

  for (const [workflow, data] of Object.entries(staleness.workflows)) {
    const lastVerified = new Date(data.lastVerified).getTime();
    const daysSince = (now - lastVerified) / (1000 * 60 * 60 * 24);

    let status = 'fresh';
    if (daysSince > staleness.thresholds.staleDays) {
      status = 'stale';
    } else if (daysSince > staleness.thresholds.warningDays) {
      status = 'warning';
    }

    results.push({
      workflow,
      lastVerified: data.lastVerified,
      daysSince: Math.round(daysSince),
      status
    });
  }

  return results;
}

/**
 * Generate drift report
 */
function generateReport(workflowPaths, projectRoot = process.cwd()) {
  const results = [];

  for (const workflow of workflowPaths) {
    const result = checkWorkflowDrift(workflow, projectRoot);
    results.push(result);
  }

  // Summary
  const summary = {
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    needsUpdate: results.filter(r => r.status === 'needs_update').length,
    stale: results.filter(r => r.status === 'stale').length,
    critical: results.filter(r => r.status === 'critical').length,
    generatedAt: new Date().toISOString()
  };

  return { summary, results };
}

module.exports = {
  checkFileChange,
  checkWorkflowDrift,
  updateFileHashes,
  markWorkflowVerified,
  checkStaleness,
  generateReport,
  extractLineReferences,
  loadHashes,
  saveHashes,
  DRIFT_LEVEL
};
