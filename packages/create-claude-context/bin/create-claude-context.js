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
  .action(async (projectName, options) => {
    console.log(banner);

    try {
      await run({
        projectName,
        skipPrompts: options.yes,
        installPlugin: options.plugin !== false,
        template: options.template,
        initGit: options.git !== false,
        dryRun: options.dryRun,
        verbose: options.verbose
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
