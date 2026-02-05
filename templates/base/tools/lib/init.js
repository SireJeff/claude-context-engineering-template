/**
 * Claude Context Engineering - Initialization Module
 *
 * Handles initialization of context engineering for a repository.
 * Includes tech stack detection, workflow discovery, and template population.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { configLoader, findClaudeDir } = require('./config-loader');
const { logger } = require('./logger');
const { InitializationError, FileSystemError } = require('./errors');
const { detectTechStack } = require('./detector');
const { replacePlaceholders } = require('./placeholder');

/**
 * Initialize context engineering for a repository
 */
async function init(options = {}) {
  const {
    config: configPath,
    interactive = true,
    resume = false,
    validateOnly = false,
    techStack = null,
    projectName = null,
  } = options;

  const op = logger.startOperation('init');

  try {
    console.log(chalk.cyan('\n📦 Initializing Claude Context Engineering...\n'));

    // Find or create .claude directory
    const claudeDir = findClaudeDir();
    const projectRoot = path.dirname(claudeDir);

    // Check for existing initialization
    const progressFile = path.join(claudeDir, 'INIT_PROGRESS.json');
    let progress = null;

    if (fs.existsSync(progressFile)) {
      progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));

      if (!resume && progress.status !== 'COMPLETED') {
        console.log(chalk.yellow('⚠️  Previous initialization found. Use --resume to continue.'));
        console.log(chalk.gray(`   Status: ${progress.status}`));
        console.log(chalk.gray(`   Last phase: ${progress.current_phase}`));
        return;
      }
    }

    // Validate-only mode
    if (validateOnly) {
      console.log(chalk.cyan('🔍 Validating existing initialization...\n'));
      return await validateInitialization(claudeDir);
    }

    // Resume mode
    if (resume && progress) {
      console.log(chalk.cyan(`🔄 Resuming from phase: ${progress.current_phase}\n`));
      return await resumeInitialization(claudeDir, progress, options);
    }

    // Start fresh initialization
    console.log(chalk.white('Phase 1: Repository Analysis'));
    console.log(chalk.gray('─'.repeat(50)));

    // Detect tech stack
    console.log('  Detecting technology stack...');
    const detected = await detectTechStack(projectRoot, { hint: techStack });

    console.log(chalk.green(`  ✓ Tech stack: ${detected.stack}`));
    console.log(chalk.gray(`    Languages: ${detected.languages.join(', ')}`));
    console.log(chalk.gray(`    Frameworks: ${detected.frameworks.join(', ')}`));
    console.log(chalk.gray(`    Files: ${detected.fileCount}`));

    // Create progress file
    progress = {
      version: '1.0.0',
      started_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      status: 'IN_PROGRESS',
      current_phase: 'analysis',
      phases: {
        analysis: { status: 'COMPLETE', duration_ms: 0 },
        discovery: { status: 'PENDING' },
        population: { status: 'PENDING' },
        validation: { status: 'PENDING' },
        finalization: { status: 'PENDING' },
      },
      detected: {
        tech_stack: detected.stack,
        languages: detected.languages,
        frameworks: detected.frameworks,
        file_count: detected.fileCount,
        loc: detected.loc || 0,
      },
      project_name: projectName || detected.projectName || path.basename(projectRoot),
      errors: [],
    };

    saveProgress(progressFile, progress);

    // Phase 2: Workflow Discovery
    console.log(chalk.white('\nPhase 2: Workflow Discovery'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.yellow('  ⚠️  Full workflow discovery requires Claude Code agent.'));
    console.log(chalk.gray('  Run: @context-engineer "Initialize context engineering"'));
    console.log(chalk.gray('  The agent will discover 8-15 workflows automatically.\n'));

    progress.current_phase = 'discovery';
    progress.phases.discovery.status = 'PENDING_AGENT';
    saveProgress(progressFile, progress);

    // Phase 3: Template Population (partial - placeholders only)
    console.log(chalk.white('Phase 3: Template Population (Partial)'));
    console.log(chalk.gray('─'.repeat(50)));

    const placeholderValues = {
      PROJECT_NAME: progress.project_name,
      TECH_STACK: detected.stack,
      DATE: new Date().toISOString().split('T')[0],
      WORKFLOWS_COUNT: '{{WORKFLOWS_COUNT}}', // To be filled by agent
      // Add more known values
    };

    const claudeMdPath = path.join(projectRoot, 'AI_CONTEXT.md');
    if (fs.existsSync(claudeMdPath)) {
      const result = await replacePlaceholders(claudeMdPath, placeholderValues, { dryRun: false });
      console.log(chalk.green(`  ✓ Replaced ${result.replaced} placeholders in AI_CONTEXT.md`));
      console.log(chalk.gray(`  Remaining: ${result.remaining} placeholders`));
    }

    progress.current_phase = 'population';
    progress.phases.population.status = 'PARTIAL';
    saveProgress(progressFile, progress);

    // Summary
    console.log(chalk.white('\n📋 Initialization Summary'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.green('  ✓ Repository analyzed'));
    console.log(chalk.green('  ✓ Tech stack detected'));
    console.log(chalk.yellow('  ⏳ Workflow discovery pending (run agent)'));
    console.log(chalk.yellow('  ⏳ Template population partial'));

    console.log(chalk.white('\n📌 Next Steps:'));
    console.log(chalk.cyan('  1. Run: @context-engineer "Initialize context engineering"'));
    console.log(chalk.gray('     This will discover workflows and complete the setup.'));
    console.log(chalk.cyan('  2. Review generated workflow documentation'));
    console.log(chalk.cyan('  3. Run: npx claude-context validate'));

    op.success();

  } catch (error) {
    op.fail(error);
    throw error;
  }
}

/**
 * Save initialization progress
 */
function saveProgress(filePath, progress) {
  progress.last_updated = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(progress, null, 2));
}

/**
 * Resume an interrupted initialization
 */
async function resumeInitialization(claudeDir, progress, options) {
  console.log(chalk.cyan(`Resuming from phase: ${progress.current_phase}`));
  // Implementation would continue from the last phase
  console.log(chalk.yellow('⚠️  Resume functionality requires full agent support.'));
  console.log(chalk.gray('  Run: @context-engineer "resume initialization"'));
}

/**
 * Validate an existing initialization
 */
async function validateInitialization(claudeDir) {
  const { validate } = require('./validate');
  return await validate({ all: true, claudeDir });
}

module.exports = {
  init,
  resumeInitialization,
  validateInitialization,
};
