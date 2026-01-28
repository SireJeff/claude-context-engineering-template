#!/usr/bin/env node

/**
 * Claude Context CLI
 *
 * Ongoing tools for managing Claude Context Engineering in your project.
 * Use after initial setup with `npx create-claude-context`.
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const { validate } = require('../lib/validate');
const { sync } = require('../lib/sync');
const { hooks } = require('../lib/hooks');
const { diagnose } = require('../lib/diagnose');
const { generate } = require('../lib/generate');

const packageJson = require('../package.json');

// Check if we're in a project with .claude directory
function checkClaudeDir() {
  const claudeDir = path.join(process.cwd(), '.claude');
  if (!fs.existsSync(claudeDir)) {
    console.error(chalk.red('\nError: No .claude directory found in current directory.'));
    console.error(chalk.yellow('Run `npx create-claude-context` first to initialize.\n'));
    process.exit(1);
  }
  return claudeDir;
}

program
  .name('claude-context')
  .description('CLI tools for Claude Context Engineering')
  .version(packageJson.version);

// Validate command
program
  .command('validate')
  .description('Validate context engineering setup')
  .option('-a, --all', 'Run all validations')
  .option('-s, --schema', 'Validate JSON schemas')
  .option('-l, --links', 'Validate internal links')
  .option('-p, --placeholders', 'Check for unreplaced placeholders')
  .option('-S, --structure', 'Validate directory structure')
  .option('-L, --lines', 'Check line number accuracy')
  .option('-t, --threshold <number>', 'Line accuracy threshold (default: 60)', '60')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    checkClaudeDir();
    try {
      const result = await validate(process.cwd(), options);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Sync command
program
  .command('sync')
  .description('Synchronize documentation with code')
  .option('-c, --check', 'Check for drift without fixing')
  .option('-f, --fix', 'Auto-fix shifted line numbers')
  .option('--rebuild-map', 'Regenerate CODE_TO_WORKFLOW_MAP')
  .option('--strict', 'Fail on any drift detected')
  .action(async (options) => {
    checkClaudeDir();
    try {
      const result = await sync(process.cwd(), options);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Hooks command
program
  .command('hooks')
  .description('Manage git hooks for context engineering')
  .argument('<action>', 'install or uninstall')
  .option('--pre-commit', 'Only pre-commit hook')
  .option('--post-commit', 'Only post-commit hook')
  .action(async (action, options) => {
    checkClaudeDir();
    if (!['install', 'uninstall'].includes(action)) {
      console.error(chalk.red(`Unknown action: ${action}. Use 'install' or 'uninstall'.`));
      process.exit(1);
    }
    try {
      const result = await hooks(process.cwd(), action, options);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Diagnose command
program
  .command('diagnose')
  .description('Run diagnostics on context engineering setup')
  .option('-f, --fix', 'Auto-fix detected issues')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    checkClaudeDir();
    try {
      const result = await diagnose(process.cwd(), options);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate')
  .description('Generate or regenerate documentation')
  .option('--code-map', 'Regenerate CODE_TO_WORKFLOW_MAP.md')
  .option('--indexes', 'Rebuild all indexes')
  .option('--anchors', 'Regenerate semantic anchors')
  .action(async (options) => {
    checkClaudeDir();
    try {
      const result = await generate(process.cwd(), options);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Parse and run
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
