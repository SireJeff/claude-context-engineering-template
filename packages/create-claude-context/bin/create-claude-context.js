#!/usr/bin/env node

/**
 * create-claude-context CLI
 *
 * Set up Claude Context Engineering for any project with a single command.
 *
 * Usage:
 *   npx create-claude-context
 *   npx create-claude-context my-project
 *   npx create-claude-context --yes
 */

const { program } = require('commander');
const chalk = require('chalk');
const { run } = require('../lib');
const packageJson = require('../package.json');

// ASCII Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('Claude Context Engineering')}                               ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Optimize AI-assisted development with pre-computed')}       ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('system knowledge and structured documentation.')}           ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

program
  .name('create-claude-context')
  .description('Set up Claude Context Engineering for your project')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project (defaults to current directory name)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--no-plugin', 'Skip Claude Code plugin installation')
  .option('-t, --template <preset>', 'Use a tech stack preset (python-fastapi, node-express, etc.)')
  .option('--no-git', 'Skip git initialization')
  .option('--dry-run', 'Show what would be done without making changes')
  .option('-v, --verbose', 'Show detailed output')
  // New options for context engineering initialization
  .option('--ai', 'Force AI mode (creates INIT_REQUEST.md for @context-engineer)')
  .option('--static', 'Force standalone mode (static analysis only, no AI setup)')
  .option('--analyze-only', 'Run codebase analysis without installation')
  .action(async (projectName, options) => {
    console.log(banner);

    // Validate mutually exclusive options
    if (options.ai && options.static) {
      console.error(chalk.red('\n✖ Error: --ai and --static are mutually exclusive'));
      process.exit(1);
    }

    try {
      await run({
        projectName,
        skipPrompts: options.yes,
        installPlugin: options.plugin !== false,
        template: options.template,
        initGit: options.git !== false,
        dryRun: options.dryRun,
        verbose: options.verbose,
        // New options
        forceAi: options.ai,
        forceStatic: options.static,
        analyzeOnly: options.analyzeOnly
      });
    } catch (error) {
      console.error(chalk.red('\n✖ Error:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

program.parse();
