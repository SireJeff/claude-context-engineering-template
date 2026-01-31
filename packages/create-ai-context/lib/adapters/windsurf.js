/**
 * Windsurf IDE Adapter
 *
 * Generates .windsurf/rules.md file for Windsurf IDE Cascade AI
 */

const fs = require('fs');
const path = require('path');
const { renderTemplateByName, buildContext } = require('../template-renderer');
const { isManagedFile } = require('../template-coordination');

/**
 * Adapter metadata
 */
const adapter = {
  name: 'windsurf',
  displayName: 'Windsurf IDE',
  description: 'Project rules for Windsurf IDE Cascade AI',
  outputType: 'single-file',
  outputPath: '.windsurf/rules.md'
};

/**
 * Get output path for Windsurf rules file
 * @param {string} projectRoot - Project root directory
 * @returns {string} Output file path
 */
function getOutputPath(projectRoot) {
  return path.join(projectRoot, '.windsurf', 'rules.md');
}

/**
 * Check if Windsurf output already exists
 * @param {string} projectRoot - Project root directory
 * @returns {boolean}
 */
function exists(projectRoot) {
  const rulesPath = getOutputPath(projectRoot);
  const windsurfDir = path.join(projectRoot, '.windsurf');
  return fs.existsSync(rulesPath) || fs.existsSync(windsurfDir);
}

/**
 * Generate Windsurf rules file
 * @param {object} analysis - Analysis results from static analyzer
 * @param {object} config - Configuration from CLI
 * @param {string} projectRoot - Project root directory
 * @returns {object} Generation result
 */
async function generate(analysis, config, projectRoot) {
  const result = {
    success: false,
    adapter: adapter.name,
    files: [],
    errors: []
  };

  try {
    const rulesPath = getOutputPath(projectRoot);

    // Check if file exists and is custom (not managed by us)
    if (fs.existsSync(rulesPath) && !config.force) {
      if (!isManagedFile(rulesPath)) {
        result.errors.push({
          message: '.windsurf/rules.md exists and appears to be custom. Use --force to overwrite.',
          code: 'EXISTS_CUSTOM',
          severity: 'error'
        });
        return result;
      }
    }

    // Build context from analysis
    const context = buildContext(analysis, config, 'windsurf');

    // Render template
    const content = renderTemplateByName('windsurf-rules', context);

    // Create .windsurf directory if it doesn't exist
    const windsurfDir = path.dirname(rulesPath);
    if (!fs.existsSync(windsurfDir)) {
      fs.mkdirSync(windsurfDir, { recursive: true });
    }

    // Write output file
    fs.writeFileSync(rulesPath, content, 'utf-8');

    result.success = true;
    result.files.push({
      path: rulesPath,
      relativePath: '.windsurf/rules.md',
      size: content.length
    });
  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack
    });
  }

  return result;
}

/**
 * Validate Windsurf output
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validate(projectRoot) {
  const issues = [];
  const rulesPath = getOutputPath(projectRoot);

  if (!fs.existsSync(rulesPath)) {
    issues.push({ file: '.windsurf/rules.md', error: 'not found' });
  } else {
    const content = fs.readFileSync(rulesPath, 'utf-8');
    const placeholderMatch = content.match(/\{\{[A-Z_]+\}\}/g);
    if (placeholderMatch && placeholderMatch.length > 0) {
      issues.push({
        file: '.windsurf/rules.md',
        error: `Found ${placeholderMatch.length} unreplaced placeholders`
      });
    }
  }

  return {
    valid: issues.filter(i => i.severity !== 'warning').length === 0,
    issues
  };
}

module.exports = {
  ...adapter,
  getOutputPath,
  exists,
  generate,
  validate
};
