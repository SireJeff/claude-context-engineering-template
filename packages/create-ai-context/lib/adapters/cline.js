/**
 * Cline Adapter
 *
 * Generates .clinerules file for Cline VS Code extension.
 */

const fs = require('fs');
const path = require('path');
const { renderTemplateByName, buildContext } = require('../template-renderer');

/**
 * Adapter metadata
 */
const adapter = {
  name: 'cline',
  displayName: 'Cline',
  description: 'Rules file for Cline VS Code extension',
  outputType: 'single-file',
  outputPath: '.clinerules'
};

/**
 * Get output path for Cline rules file
 * @param {string} projectRoot - Project root directory
 * @returns {string} Output file path
 */
function getOutputPath(projectRoot) {
  return path.join(projectRoot, '.clinerules');
}

/**
 * Check if Cline output already exists
 * @param {string} projectRoot - Project root directory
 * @returns {boolean}
 */
function exists(projectRoot) {
  return fs.existsSync(getOutputPath(projectRoot));
}

/**
 * Generate Cline rules file
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
    // Build context from analysis
    const context = buildContext(analysis, config);

    // Render template
    const content = renderTemplateByName('cline', context);

    // Write output file
    const outputPath = getOutputPath(projectRoot);
    fs.writeFileSync(outputPath, content, 'utf-8');

    result.success = true;
    result.files.push({
      path: outputPath,
      relativePath: '.clinerules',
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
 * Validate Cline output
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validate(projectRoot) {
  const outputPath = getOutputPath(projectRoot);

  if (!fs.existsSync(outputPath)) {
    return {
      valid: false,
      error: '.clinerules not found'
    };
  }

  const content = fs.readFileSync(outputPath, 'utf-8');

  return {
    valid: true,
    size: content.length
  };
}

module.exports = {
  ...adapter,
  getOutputPath,
  exists,
  generate,
  validate
};
