/**
 * Main orchestrator for create-claude-context
 *
 * Handles the full installation flow:
 * 1. Interactive prompts (or defaults)
 * 2. Directory structure creation
 * 3. Template copying
 * 4. Environment detection (Claude Code or standalone)
 * 5. Tech stack detection
 * 6. Deep codebase analysis
 * 7. Template population with real data
 * 8. Placeholder replacement
 * 9. AI orchestration (if in Claude Code)
 * 10. Validation
 * 11. Plugin installation (optional)
 * 12. Git initialization (optional)
 */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { runPrompts, getDefaults } = require('./prompts');
const { createSpinner } = require('./spinner');
const {
  createDirectoryStructure,
  copyTemplates,
  createClaudeMd
} = require('./installer');
const { detectTechStack } = require('./detector');
const { replacePlaceholders } = require('./placeholder');
const { validateInstallation } = require('./validate');

// New modules for context engineering initialization
const { detectEnvironment, forceMode, getEnvironmentDescription } = require('./environment-detector');
const { analyzeCodebase } = require('./static-analyzer');
const {
  createInitializationRequest,
  generateAgentInstructions,
  isInitializationPending
} = require('./ai-orchestrator');
const { populateAllTemplates } = require('./template-populator');

/**
 * Main entry point
 */
async function run(options = {}) {
  const {
    projectName,
    skipPrompts = false,
    installPlugin = true,
    template,
    initGit = true,
    dryRun = false,
    verbose = false,
    // New options for context engineering
    forceAi = false,
    forceStatic = false,
    analyzeOnly = false
  } = options;

  // Determine target directory
  const targetDir = projectName
    ? path.resolve(process.cwd(), projectName)
    : process.cwd();

  const projectNameResolved = projectName || path.basename(targetDir);
  const claudeDir = path.join(targetDir, '.claude');

  // Get configuration (prompts or defaults)
  let config;
  if (skipPrompts) {
    config = await getDefaults(targetDir, template);
  } else {
    config = await runPrompts(targetDir, template);
  }

  config.projectName = projectNameResolved;
  config.targetDir = targetDir;
  config.installPlugin = installPlugin && config.installPlugin;
  config.initGit = initGit;
  config.dryRun = dryRun;
  config.verbose = verbose;

  if (dryRun) {
    console.log(chalk.yellow('\n--dry-run mode: No changes will be made\n'));
    console.log('Configuration:', JSON.stringify(config, null, 2));
    return;
  }

  // Phase 1: Create target directory if needed
  const spinner = createSpinner();

  if (projectName && !fs.existsSync(targetDir)) {
    spinner.start('Creating project directory...');
    fs.mkdirSync(targetDir, { recursive: true });
    spinner.succeed(`Created project directory: ${projectNameResolved}`);
  }

  // Phase 2: Detect execution environment
  spinner.start('Detecting execution environment...');
  let env;
  if (forceAi) {
    env = forceMode('full-ai');
  } else if (forceStatic) {
    env = forceMode('standalone');
  } else {
    env = detectEnvironment();
  }
  spinner.succeed(`Environment: ${getEnvironmentDescription(env)}`);

  // Phase 3: Create .claude directory structure
  spinner.start('Creating .claude directory structure...');
  const dirsCreated = await createDirectoryStructure(targetDir, config);
  spinner.succeed(`Created .claude directory structure (${dirsCreated} directories)`);

  // Phase 4: Copy template files
  spinner.start('Copying template files...');
  const filesCopied = await copyTemplates(targetDir, config);
  spinner.succeed(`Copied ${filesCopied} template files`);

  // Phase 5: Detect technology stack
  spinner.start('Detecting technology stack...');
  const techStack = await detectTechStack(targetDir);
  config.techStack = techStack;
  spinner.succeed(`Detected: ${techStack.summary || 'Generic project'}`);

  // Phase 6: Deep codebase analysis
  spinner.start('Analyzing codebase...');
  let analysis;
  try {
    analysis = await analyzeCodebase(targetDir, { techStack });
    const summary = analysis.summary || {};
    spinner.succeed(
      `Analyzed: ${summary.totalFiles || 0} files, ` +
      `${summary.entryPointCount || 0} entry points, ` +
      `${summary.workflowCount || 0} workflows`
    );
  } catch (error) {
    spinner.warn(`Analysis partial: ${error.message}`);
    analysis = { workflows: [], entryPoints: [], architecture: {}, techStack };
  }

  // Add tech stack to analysis
  analysis.techStack = techStack;

  // Phase 7: Create CLAUDE.md at root (before population)
  spinner.start('Creating CLAUDE.md...');
  await createClaudeMd(targetDir, config, techStack);
  spinner.succeed('Created CLAUDE.md at project root');

  // Phase 8: Populate templates with real data
  spinner.start('Populating templates with analysis results...');
  let populationResults;
  try {
    populationResults = await populateAllTemplates(claudeDir, analysis, config);
    const counts = {
      populated: populationResults.populated?.length || 0,
      created: populationResults.created?.length || 0,
      errors: populationResults.errors?.length || 0
    };
    if (counts.errors > 0) {
      spinner.warn(`Populated ${counts.populated} files, created ${counts.created} workflows (${counts.errors} errors)`);
    } else {
      spinner.succeed(`Populated ${counts.populated} files, created ${counts.created} workflow docs`);
    }
  } catch (error) {
    spinner.warn(`Population partial: ${error.message}`);
    populationResults = { populated: [], created: [], errors: [error.message] };
  }

  // Phase 9: Replace remaining placeholders
  spinner.start('Replacing remaining placeholders...');
  const placeholdersReplaced = await replacePlaceholders(targetDir, {
    ...config,
    techStack,
    analysis
  });
  spinner.succeed(`Replaced ${placeholdersReplaced} placeholders`);

  // Phase 10: AI Orchestration (if in Claude Code environment)
  if (env.mode === 'full-ai' || env.mode === 'hybrid') {
    spinner.start('Preparing AI initialization request...');
    try {
      createInitializationRequest(claudeDir, config);
      generateAgentInstructions(claudeDir, analysis, config);
      spinner.succeed('Created INIT_REQUEST.md for @context-engineer');
    } catch (error) {
      spinner.warn(`AI setup skipped: ${error.message}`);
    }
  }

  // Phase 11: Validate installation
  spinner.start('Validating installation...');
  const validation = await validateInstallation(targetDir);
  if (validation.passed) {
    spinner.succeed('All validations passed');
  } else {
    spinner.warn(`Validation completed with ${validation.warnings} warnings`);
  }

  // Phase 12: Install Claude Code plugin (optional)
  if (config.installPlugin) {
    spinner.start('Installing Claude Code plugin...');
    spinner.succeed('Plugin ready (install with: /plugin install claude-context-engineering)');
  }

  // Phase 13: Initialize git (optional)
  if (config.initGit && !fs.existsSync(path.join(targetDir, '.git'))) {
    spinner.start('Initializing git repository...');
    try {
      const { execSync } = require('child_process');
      execSync('git init', { cwd: targetDir, stdio: 'pipe' });
      spinner.succeed('Initialized git repository');
    } catch (e) {
      spinner.warn('Could not initialize git (git may not be installed)');
    }
  }

  // Success message (mode-aware)
  showSuccess(config, techStack, env, analysis, populationResults);
}

/**
 * Display success message with next steps
 */
function showSuccess(config, techStack, env, analysis, populationResults) {
  const boxWidth = 59;
  const isAiMode = env.mode === 'full-ai' || env.mode === 'hybrid';
  const workflowCount = analysis?.workflows?.length || 0;
  const entryPointCount = analysis?.entryPoints?.length || 0;

  console.log(`
${chalk.green('╔' + '═'.repeat(boxWidth) + '╗')}
${chalk.green('║')}  ${chalk.bold.white('✓ Context Engineering Initialized Successfully!')}        ${chalk.green('║')}
${chalk.green('╚' + '═'.repeat(boxWidth) + '╝')}

${chalk.bold('Analysis Results:')}
  ${chalk.cyan('•')} Entry Points:    ${chalk.white(entryPointCount)} discovered
  ${chalk.cyan('•')} Workflows:       ${chalk.white(workflowCount)} documented
  ${chalk.cyan('•')} Mode:            ${chalk.white(env.mode)}

${chalk.bold('Created:')}
  ${chalk.cyan('•')} .claude/          ${chalk.gray('(context engineering system)')}
  ${chalk.cyan('•')} CLAUDE.md         ${chalk.gray('(AI navigation guide)')}
${workflowCount > 0 ? `  ${chalk.cyan('•')} ${workflowCount} workflow docs  ${chalk.gray('(auto-generated)')}` : ''}

${chalk.bold('Available Commands:')}
  ${chalk.cyan('•')} /rpi-research     ${chalk.gray('Research a feature')}
  ${chalk.cyan('•')} /rpi-plan         ${chalk.gray('Create implementation plan')}
  ${chalk.cyan('•')} /rpi-implement    ${chalk.gray('Execute with documentation')}
  ${chalk.cyan('•')} /validate-all     ${chalk.gray('Run validation suite')}
`);

  if (isAiMode) {
    console.log(`${chalk.bold.yellow('AI Initialization Pending:')}
  ${chalk.white('Run this command in Claude Code to complete:')}
  ${chalk.cyan('@context-engineer "Complete initialization using INIT_REQUEST.md"')}
`);
  } else {
    console.log(`${chalk.bold('Next Steps:')}
  ${chalk.white('1.')} Review ${chalk.cyan('CLAUDE.md')} and customize for your project
  ${chalk.white('2.')} Review generated workflow docs in ${chalk.cyan('.claude/context/workflows/')}
  ${chalk.white('3.')} Run ${chalk.cyan('@context-engineer "Enhance documentation"')} for AI analysis
`);
  }

  console.log(`${chalk.gray('Documentation: https://github.com/SireJeff/claude-context-engineering-template')}
`);
}

module.exports = { run };
