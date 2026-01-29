/**
 * Claude Adapter
 *
 * Generates AI_CONTEXT.md and .claude/ directory structure.
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
  outputType: 'multi-file',
  outputPath: '.claude/'
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
  const aiContextPath = getOutputPath(projectRoot);
  const claudeDir = path.join(projectRoot, '.claude');
  return fs.existsSync(aiContextPath) || fs.existsSync(claudeDir);
}

/**
 * Generate Claude context file and .claude/ directory structure
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
    // 1. Generate AI_CONTEXT.md at project root (existing behavior)
    const context = buildContext(analysis, config);
    const content = renderTemplateByName('claude', context);
    const outputPath = getOutputPath(projectRoot);
    fs.writeFileSync(outputPath, content, 'utf-8');
    result.files.push({
      path: outputPath,
      relativePath: 'AI_CONTEXT.md',
      size: content.length
    });

    // 2. Generate .claude/ directory structure (NEW)
    const claudeDirResult = await generateClaudeDirectory(projectRoot, context, result);
    if (claudeDirResult) {
      result.files.push(...claudeDirResult);
    }

    result.success = result.errors.length === 0 || result.errors.some(e => e.code === 'EXISTS');
  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack
    });
  }

  return result;
}

/**
 * Generate .claude/ directory with full structure
 * @param {string} projectRoot - Project root directory
 * @param {object} context - Template context
 * @param {object} result - Result object to track files/errors
 * @returns {Array} List of generated files
 */
async function generateClaudeDirectory(projectRoot, context, result) {
  const { copyDirectory } = require('../installer');
  const templatesDir = path.join(__dirname, '..', '..', 'templates', 'base');
  const claudeDir = path.join(projectRoot, '.claude');

  // Don't overwrite existing .claude/ directory
  if (fs.existsSync(claudeDir)) {
    result.errors.push({
      message: '.claude/ directory already exists, skipping structure generation',
      code: 'EXISTS',
      severity: 'warning'
    });
    return [{
      path: claudeDir,
      relativePath: '.claude/',
      size: 0,
      skipped: true
    }];
  }

  try {
    // Create .claude/ directory
    fs.mkdirSync(claudeDir, { recursive: true });

    // Copy relevant subdirectories from templates/base to .claude/
    const subdirsToCopy = [
      'agents',
      'commands',
      'indexes',
      'context',
      'schemas',
      'standards'
    ];

    // Only copy tools if explicitly enabled
    if (context.features?.tools !== false) {
      subdirsToCopy.push('tools');
    }

    let filesCopied = 0;
    for (const subdir of subdirsToCopy) {
      const srcPath = path.join(templatesDir, subdir);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(claudeDir, subdir);
        fs.mkdirSync(destPath, { recursive: true });
        const count = await copyDirectory(srcPath, destPath);
        filesCopied += count;
      }
    }

    // Create minimal .claude/settings.json
    const settingsPath = path.join(claudeDir, 'settings.json');
    const settings = {
      '$schema': './schemas/settings.schema.json',
      version: '2.2.2',
      project: {
        name: context.project?.name || 'Project',
        tech_stack: context.project?.tech_stack || 'Not detected'
      },
      agents: {
        context_engineer: 'enabled',
        core_architect: 'enabled',
        api_developer: 'enabled',
        database_ops: 'enabled',
        integration_hub: 'enabled',
        deployment_ops: 'enabled'
      },
      commands: {
        rpi_workflow: 'enabled',
        validation: 'enabled'
      }
    };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    filesCopied++;

    // Create .claude/README.md
    const readmePath = path.join(claudeDir, 'README.md');
    const readme = `# .claude Configuration - ${context.project?.name || 'Project'}

This directory contains Claude Code-specific context engineering files.

## Quick Start

1. Load agents: \`@context-engineer\`
2. Use commands: \`/rpi-research\`, \`/rpi-plan\`, \`/rpi-implement\`
3. Validate: \`/verify-docs-current\`

## Universal Context

See \`AI_CONTEXT.md\` at project root for universal AI context (works with all tools).

## Claude-Specific Files

- **agents/** - Specialized agents for different tasks
- **commands/** - Custom slash commands
- **indexes/** - 3-level navigation system
- **context/** - Workflow documentation

*Generated by create-universal-ai-context v${context.version || '2.1.0'}*
`;
    fs.writeFileSync(readmePath, readme);
    filesCopied++;

    return [{
      path: claudeDir,
      relativePath: '.claude/',
      size: filesCopied
    }];

  } catch (error) {
    result.errors.push({
      message: `Failed to generate .claude/ directory: ${error.message}`,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Validate Claude output
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validate(projectRoot) {
  const issues = [];

  // 1. Validate AI_CONTEXT.md
  const outputPath = getOutputPath(projectRoot);
  if (!fs.existsSync(outputPath)) {
    issues.push({ file: 'AI_CONTEXT.md', error: 'not found' });
  } else {
    const content = fs.readFileSync(outputPath, 'utf-8');
    const placeholderMatch = content.match(/\{\{[A-Z_]+\}\}/g);
    if (placeholderMatch && placeholderMatch.length > 0) {
      issues.push({
        file: 'AI_CONTEXT.md',
        error: `Found ${placeholderMatch.length} unreplaced placeholders`
      });
    }
  }

  // 2. Validate .claude/ directory (optional, warn if missing)
  const claudeDir = path.join(projectRoot, '.claude');
  if (!fs.existsSync(claudeDir)) {
    issues.push({
      file: '.claude/',
      error: 'directory not found (optional but recommended)',
      severity: 'warning'
    });
  } else {
    // Check for critical files
    const criticalFiles = [
      'settings.json',
      'README.md'
    ];
    for (const file of criticalFiles) {
      if (!fs.existsSync(path.join(claudeDir, file))) {
        issues.push({
          file: `.claude/${file}`,
          error: 'missing',
          severity: 'warning'
        });
      }
    }
  }

  return {
    valid: issues.filter(i => i.severity !== 'warning').length === 0,
    issues,
    warnings: issues.filter(i => i.severity === 'warning').length
  };
}

module.exports = {
  ...adapter,
  getOutputPath,
  exists,
  generate,
  validate
};
