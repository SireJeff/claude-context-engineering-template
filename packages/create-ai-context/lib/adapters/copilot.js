/**
 * GitHub Copilot Adapter
 *
 * Generates .github/copilot-instructions.md file.
 */

const fs = require('fs');
const path = require('path');
const { renderTemplateByName, buildContext } = require('../template-renderer');

/**
 * Adapter metadata
 */
const adapter = {
  name: 'copilot',
  displayName: 'GitHub Copilot',
  description: 'Context file for GitHub Copilot VS Code extension',
  outputType: 'single-file',
  outputPath: '.github/copilot-instructions.md'
};

/**
 * Get output path for Copilot instructions file
 * @param {string} projectRoot - Project root directory
 * @returns {string} Output file path
 */
function getOutputPath(projectRoot) {
  return path.join(projectRoot, '.github', 'copilot-instructions.md');
}

/**
 * Check if Copilot output already exists
 * @param {string} projectRoot - Project root directory
 * @returns {boolean}
 */
function exists(projectRoot) {
  return fs.existsSync(getOutputPath(projectRoot));
}

/**
 * Generate Copilot instructions file
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
    const content = renderTemplateByName('copilot', context);

    // Ensure .github directory exists
    const outputPath = getOutputPath(projectRoot);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output file
    fs.writeFileSync(outputPath, content, 'utf-8');

    result.success = true;
    result.files.push({
      path: outputPath,
      relativePath: '.github/copilot-instructions.md',
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
 * Validate Copilot output
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validate(projectRoot) {
  const outputPath = getOutputPath(projectRoot);

  if (!fs.existsSync(outputPath)) {
    return {
      valid: false,
      error: 'copilot-instructions.md not found'
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
