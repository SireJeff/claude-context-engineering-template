/**
 * Main orchestrator for create-claude-context
 *
 * Handles the full installation flow:
 * 1. Interactive prompts (or defaults)
 * 2. Directory structure creation
 * 3. Template copying
 * 4. Tech stack detection
 * 5. Placeholder replacement
 * 6. Validation
 * 7. Plugin installation (optional)
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
    verbose = false
  } = options;

  // Determine target directory
  const targetDir = projectName
    ? path.resolve(process.cwd(), projectName)
    : process.cwd();

  const projectNameResolved = projectName || path.basename(targetDir);

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

  // Phase 2: Create .claude directory structure
  spinner.start('Creating .claude directory structure...');
  const dirsCreated = await createDirectoryStructure(targetDir, config);
  spinner.succeed(`Created .claude directory structure (${dirsCreated} directories)`);

  // Phase 3: Copy template files
  spinner.start('Copying template files...');
  const filesCopied = await copyTemplates(targetDir, config);
  spinner.succeed(`Copied ${filesCopied} template files`);

  // Phase 4: Detect technology stack
  spinner.start('Detecting technology stack...');
  const techStack = await detectTechStack(targetDir);
  spinner.succeed(`Detected: ${techStack.summary || 'Generic project'}`);

  // Phase 5: Replace placeholders
  spinner.start('Populating templates with project info...');
  const placeholdersReplaced = await replacePlaceholders(targetDir, {
    ...config,
    techStack
  });
  spinner.succeed(`Replaced ${placeholdersReplaced} placeholders`);

  // Phase 6: Create CLAUDE.md at root
  spinner.start('Creating CLAUDE.md...');
  await createClaudeMd(targetDir, config, techStack);
  spinner.succeed('Created CLAUDE.md at project root');

  // Phase 7: Validate installation
  spinner.start('Validating installation...');
  const validation = await validateInstallation(targetDir);
  if (validation.passed) {
    spinner.succeed('All validations passed');
  } else {
    spinner.warn(`Validation completed with ${validation.warnings} warnings`);
  }

  // Phase 8: Install Claude Code plugin (optional)
  if (config.installPlugin) {
    spinner.start('Installing Claude Code plugin...');
    // Plugin installation would use: npx claude-plugins install claude-context-engineering
    // For now, we'll note it as a next step
    spinner.succeed('Plugin ready (install with: /plugin install claude-context-engineering)');
  }

  // Phase 9: Initialize git (optional)
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

  // Success message
  showSuccess(config, techStack);
}

/**
 * Display success message with next steps
 */
function showSuccess(config, techStack) {
  const boxWidth = 59;

  console.log(`
${chalk.green('╔' + '═'.repeat(boxWidth) + '╗')}
${chalk.green('║')}  ${chalk.bold.white('✓ Context Engineering Initialized Successfully!')}        ${chalk.green('║')}
${chalk.green('╚' + '═'.repeat(boxWidth) + '╝')}

${chalk.bold('Created:')}
  ${chalk.cyan('•')} .claude/          ${chalk.gray('(context engineering system)')}
  ${chalk.cyan('•')} CLAUDE.md         ${chalk.gray('(AI navigation guide)')}

${chalk.bold('Available Commands:')}
  ${chalk.cyan('•')} /rpi-research     ${chalk.gray('Research a feature')}
  ${chalk.cyan('•')} /rpi-plan         ${chalk.gray('Create implementation plan')}
  ${chalk.cyan('•')} /rpi-implement    ${chalk.gray('Execute with documentation')}
  ${chalk.cyan('•')} /validate-all     ${chalk.gray('Run validation suite')}

${chalk.bold('Next Steps:')}
  ${chalk.white('1.')} Review ${chalk.cyan('CLAUDE.md')} and customize for your project
  ${chalk.white('2.')} Run: ${chalk.cyan('@context-engineer "Discover workflows for this codebase"')}
  ${chalk.white('3.')} Use ${chalk.cyan('/rpi-research')} for your first feature

${chalk.gray('Documentation: https://github.com/SireJeff/claude-context-engineering-template')}
`);
}

module.exports = { run };
