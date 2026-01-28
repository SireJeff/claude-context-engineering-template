/**
 * AI Context Generator
 *
 * Orchestrates context generation for multiple AI tools.
 * Uses adapters to generate tool-specific output files.
 */

const path = require('path');
const { getAdapters, getAllAdapters, getAdapterNames } = require('./adapters');
const { initialize: initTemplateRenderer, buildContext } = require('./template-renderer');

/**
 * Default AI tools to generate for
 */
const DEFAULT_AI_TOOLS = ['claude', 'copilot', 'cline', 'antigravity'];

/**
 * Initialize the generator
 */
function initialize() {
  initTemplateRenderer();
}

/**
 * Generate context files for selected AI tools
 * @param {object} analysis - Analysis results from static analyzer
 * @param {object} config - Configuration from CLI
 * @param {string} projectRoot - Project root directory
 * @param {object} options - Generation options
 * @returns {object} Generation results
 */
async function generateAll(analysis, config, projectRoot, options = {}) {
  const {
    aiTools = config.aiTools || DEFAULT_AI_TOOLS,
    verbose = false,
    dryRun = false
  } = options;

  const results = {
    success: true,
    generated: [],
    skipped: [],
    errors: [],
    summary: {
      total: 0,
      successful: 0,
      failed: 0,
      files: 0
    }
  };

  // Initialize template renderer
  initialize();

  // Get adapters for selected tools
  const adapters = getAdapters(aiTools);

  if (adapters.length === 0) {
    results.success = false;
    results.errors.push({
      message: `No valid adapters found for: ${aiTools.join(', ')}`,
      validAdapters: getAdapterNames()
    });
    return results;
  }

  // Generate for each adapter
  for (const adapter of adapters) {
    results.summary.total++;

    if (verbose) {
      console.log(`Generating ${adapter.displayName} context...`);
    }

    if (dryRun) {
      results.skipped.push({
        adapter: adapter.name,
        reason: 'dry-run mode',
        outputPath: adapter.outputPath
      });
      continue;
    }

    try {
      const result = await adapter.generate(analysis, config, projectRoot);

      if (result.success) {
        results.summary.successful++;
        results.summary.files += result.files.length;
        results.generated.push({
          adapter: adapter.name,
          displayName: adapter.displayName,
          files: result.files,
          outputType: adapter.outputType
        });
      } else {
        results.summary.failed++;
        results.errors.push({
          adapter: adapter.name,
          errors: result.errors
        });
      }
    } catch (error) {
      results.summary.failed++;
      results.errors.push({
        adapter: adapter.name,
        message: error.message,
        stack: error.stack
      });
    }
  }

  // Update overall success
  results.success = results.summary.failed === 0;

  return results;
}

/**
 * Generate context for a single AI tool
 * @param {string} toolName - AI tool name (claude, copilot, cline, antigravity)
 * @param {object} analysis - Analysis results from static analyzer
 * @param {object} config - Configuration from CLI
 * @param {string} projectRoot - Project root directory
 * @returns {object} Generation result
 */
async function generateSingle(toolName, analysis, config, projectRoot) {
  initialize();

  const adapters = getAdapters([toolName]);

  if (adapters.length === 0) {
    return {
      success: false,
      error: `Unknown AI tool: ${toolName}`,
      validTools: getAdapterNames()
    };
  }

  const adapter = adapters[0];
  return adapter.generate(analysis, config, projectRoot);
}

/**
 * Validate generated context files
 * @param {string} projectRoot - Project root directory
 * @param {string[]} aiTools - AI tools to validate
 * @returns {object} Validation results
 */
function validateAll(projectRoot, aiTools = DEFAULT_AI_TOOLS) {
  const adapters = getAdapters(aiTools);
  const results = {
    valid: true,
    validations: []
  };

  for (const adapter of adapters) {
    const validation = adapter.validate(projectRoot);
    results.validations.push({
      adapter: adapter.name,
      displayName: adapter.displayName,
      ...validation
    });

    if (!validation.valid) {
      results.valid = false;
    }
  }

  return results;
}

/**
 * Check which AI tool outputs exist
 * @param {string} projectRoot - Project root directory
 * @returns {object} Existence check results
 */
function checkExisting(projectRoot) {
  const adapters = getAllAdapters();
  const existing = {};

  for (const adapter of adapters) {
    existing[adapter.name] = {
      exists: adapter.exists(projectRoot),
      path: adapter.outputPath
    };
  }

  return existing;
}

/**
 * Get context information for display
 * @param {object} analysis - Analysis results
 * @param {object} config - Configuration
 * @returns {object} Context info for display
 */
function getContextInfo(analysis, config) {
  const context = buildContext(analysis, config);

  return {
    projectName: context.project.name,
    techStack: context.project.tech_stack,
    workflowCount: context.workflows.length,
    entryPointCount: context.key_files.entry_points.length,
    gotchaCount: context.gotchas.length,
    constraintCount: context.critical_constraints.length
  };
}

/**
 * Get supported AI tools
 * @returns {object[]} Array of tool info objects
 */
function getSupportedTools() {
  return getAllAdapters().map(adapter => ({
    name: adapter.name,
    displayName: adapter.displayName,
    description: adapter.description,
    outputType: adapter.outputType,
    outputPath: adapter.outputPath
  }));
}

module.exports = {
  generateAll,
  generateSingle,
  validateAll,
  checkExisting,
  getContextInfo,
  getSupportedTools,
  initialize,
  DEFAULT_AI_TOOLS
};
