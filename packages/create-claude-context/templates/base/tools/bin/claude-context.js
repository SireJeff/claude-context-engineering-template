#!/usr/bin/env node

/**
 * Claude Context Engineering CLI
 *
 * Main entry point for the claude-context command line tool.
 * Provides commands for initialization, validation, and management
 * of the Claude context engineering system.
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// Import command handlers
const { init } = require('../lib/init');
const { validate } = require('../lib/validate');
const { diagnose } = require('../lib/diagnose');
const { configLoader } = require('../lib/config-loader');

// Package info
const pkg = require('../package.json');

// ASCII banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('Claude Context Engineering')}                              ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Optimize AI-assisted development with pre-computed')}        ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('system knowledge and structured documentation.')}             ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

program
  .name('claude-context')
  .description('CLI tools for Claude Context Engineering')
  .version(pkg.version)
  .hook('preAction', () => {
    // Show banner on all commands
    if (process.argv.includes('--no-banner')) return;
    console.log(banner);
  });

// Init command
program
  .command('init')
  .description('Initialize context engineering for a repository')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-i, --interactive', 'Run in interactive mode', true)
  .option('--no-interactive', 'Run in non-interactive mode')
  .option('--resume', 'Resume interrupted initialization')
  .option('--validate-only', 'Only validate existing initialization')
  .option('--tech-stack <stack>', 'Specify tech stack (e.g., "python-fastapi")')
  .option('--project-name <name>', 'Specify project name')
  .action(async (options) => {
    try {
      await init(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate the context engineering setup')
  .option('-a, --all', 'Run all validations', false)
  .option('--links', 'Validate markdown links')
  .option('--lines', 'Check line number accuracy')
  .option('--placeholders', 'Check for remaining placeholders')
  .option('--schema', 'Validate JSON files against schemas')
  .option('--structure', 'Validate directory structure')
  .option('-t, --threshold <percent>', 'Minimum accuracy threshold', '60')
  .option('-o, --output <format>', 'Output format: console, json, markdown', 'console')
  .option('-f, --file <path>', 'Validate specific file')
  .action(async (options) => {
    try {
      // If no specific option, run all
      if (!options.links && !options.lines && !options.placeholders &&
          !options.schema && !options.structure && !options.file) {
        options.all = true;
      }
      await validate(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Diagnose command
program
  .command('diagnose')
  .description('Diagnose issues with the context engineering setup')
  .option('--fix', 'Attempt to fix detected issues')
  .option('-v, --verbose', 'Show detailed diagnostics')
  .action(async (options) => {
    try {
      await diagnose(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Manage configuration')
  .argument('[action]', 'Action: get, set, list, path')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value (for set)')
  .option('-e, --env <environment>', 'Environment (development, staging, production)')
  .action(async (action, key, value, options) => {
    try {
      const config = await configLoader.load({ env: options.env });

      switch (action) {
        case 'get':
          if (!key) {
            console.log(JSON.stringify(config, null, 2));
          } else {
            const val = key.split('.').reduce((o, k) => o?.[k], config);
            console.log(val !== undefined ? JSON.stringify(val, null, 2) : 'Key not found');
          }
          break;
        case 'list':
          console.log(JSON.stringify(config, null, 2));
          break;
        case 'path':
          console.log(configLoader.getConfigPath());
          break;
        case 'set':
          console.log(chalk.yellow('Config set not yet implemented. Edit files directly.'));
          break;
        default:
          console.log(JSON.stringify(config, null, 2));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Parse and execute
program.parse();

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
