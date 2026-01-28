/**
 * Claude Adapter
 *
 * Generates AI_CONTEXT.md and .ai-context/ directory structure.
 * This is the primary/universal format.
 */

const fs = require('fs');
const path = require('path');
const { renderTemplateByName, buildContext } = require('../template-renderer');

/**
 * Adapter metadata
 */
const adapter = {
  name: 'claude',
  displayName: 'Claude Code',
  description: 'Universal AI context format for Claude Code and other AI assistants',
  outputType: 'single-file',
  outputPath: 'AI_CONTEXT.md'
};

/**
 * Get output path for Claude context file
 * @param {string} projectRoot - Project root directory
 * @returns {string} Output file path
 */
function getOutputPath(projectRoot) {
  return path.join(projectRoot, 'AI_CONTEXT.md');
}

/**
 * Check if Claude output already exists
 * @param {string} projectRoot - Project root directory
 * @returns {boolean}
 */
function exists(projectRoot) {
  return fs.existsSync(getOutputPath(projectRoot));
}

/**
 * Generate Claude context file
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
    const content = renderTemplateByName('claude', context);

    // Write output file
    const outputPath = getOutputPath(projectRoot);
    fs.writeFileSync(outputPath, content, 'utf-8');

    result.success = true;
    result.files.push({
      path: outputPath,
      relativePath: 'AI_CONTEXT.md',
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
 * Validate Claude output
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validate(projectRoot) {
  const outputPath = getOutputPath(projectRoot);

  if (!fs.existsSync(outputPath)) {
    return {
      valid: false,
      error: 'AI_CONTEXT.md not found'
    };
  }

  const content = fs.readFileSync(outputPath, 'utf-8');

  // Check for unreplaced placeholders
  const placeholderMatch = content.match(/\{\{[A-Z_]+\}\}/g);
  if (placeholderMatch && placeholderMatch.length > 0) {
    return {
      valid: false,
      error: `Found ${placeholderMatch.length} unreplaced placeholders`,
      placeholders: placeholderMatch
    };
  }

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
