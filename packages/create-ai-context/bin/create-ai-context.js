#!/usr/bin/env node

/**
 * create-ai-context CLI
 *
 * Universal AI Context Engineering - Set up context for Claude, Copilot, Cline, Antigravity, and more.
 *
 * Usage:
 *   npx create-ai-context                      # Initialize in current directory
 *   npx create-ai-context my-project           # Initialize in new directory
 *   npx create-ai-context --yes                # Skip prompts
 *   npx create-ai-context --ai copilot         # Generate for specific tool
 *   npx create-ai-context generate             # Regenerate context files
 *   npx create-ai-context generate --ai cline  # Regenerate for specific tool
 *   npx create-ai-context migrate              # Migrate from v1.x
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { run } = require('../lib');
const { generateAll, getSupportedTools } = require('../lib/ai-context-generator');
const { migrateV1ToV2, getMigrationStatus } = require('../lib/migrate');
const { detectTechStack } = require('../lib/detector');
const { analyzeCodebase } = require('../lib/static-analyzer');
const { createSpinner } = require('../lib/spinner');
const packageJson = require('../package.json');

// ASCII Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('AI Context Engineering')} ${chalk.gray('v' + packageJson.version)}                        ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Universal context for Claude, Copilot, Cline & more')}      ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

// Supported AI tools
const AI_TOOLS = ['claude', 'copilot', 'cline', 'antigravity', 'all'];

// Parse AI tools helper
function parseAiTools(toolsString) {
  const tools = toolsString.split(',').map(t => t.trim().toLowerCase());
  const invalid = tools.filter(t => !AI_TOOLS.includes(t));
  if (invalid.length > 0) {
    console.error(chalk.red(`\n✖ Error: Invalid AI tools: ${invalid.join(', ')}`));
    console.error(chalk.gray(`  Valid options: ${AI_TOOLS.join(', ')}`));
    process.exit(1);
  }
  return tools.includes('all') ? ['claude', 'copilot', 'cline', 'antigravity'] : tools;
}

program
  .name('create-ai-context')
  .description('Universal AI Context Engineering - Set up context for multiple AI coding assistants')
  .version(packageJson.version);

// Main init command (default)
program
  .argument('[project-name]', 'Name of the project (defaults to current directory name)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--no-plugin', 'Skip plugin installation')
  .option('-t, --template <preset>', 'Use a tech stack preset (python-fastapi, node-express, etc.)')
  .option('--no-git', 'Skip git initialization')
  .option('-n, --dry-run', 'Show what would be done without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('--ai <tools>', 'Generate for specific AI tools (comma-separated: claude,copilot,cline,antigravity,all)', 'all')
  .option('--force-ai', 'Force AI-enhanced mode (creates INIT_REQUEST.md)')
  .option('--static', 'Force standalone mode (static analysis only, no AI setup)')
  .option('--analyze-only', 'Run codebase analysis without installation')
  .option('--monorepo', 'Initialize in monorepo mode with federation support')
  .option('--federate', 'Run federation to generate context for subprojects')
  .action(async (projectName, options) => {
    console.log(banner);

    const aiTools = parseAiTools(options.ai);

    if (options.forceAi && options.static) {
      console.error(chalk.red('\n✖ Error: --force-ai and --static are mutually exclusive'));
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
        aiTools,
        forceAi: options.forceAi,
        forceStatic: options.static,
        analyzeOnly: options.analyzeOnly,
        monorepo: options.monorepo,
        federate: options.federate
      });
    } catch (error) {
      console.error(chalk.red('\n✖ Error:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Generate subcommand - regenerate context files
program
  .command('generate')
  .description('Regenerate AI context files for an existing project')
  .option('--ai <tools>', 'Generate for specific AI tools (comma-separated)', 'all')
  .option('-d, --dryRun', 'Show what would be done without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);
    const aiTools = parseAiTools(options.ai);
    const spinner = createSpinner();

    // Check if project has .ai-context
    const contextDir = path.join(projectRoot, '.ai-context');
    if (!fs.existsSync(contextDir)) {
      console.error(chalk.red('\n✖ Error: No .ai-context directory found.'));
      console.error(chalk.gray('  Run `npx create-ai-context` first to initialize.'));
      process.exit(1);
    }

    try {
      // Detect tech stack
      spinner.start('Detecting technology stack...');
      const techStack = await detectTechStack(projectRoot);
      spinner.succeed(`Detected: ${techStack.summary || 'Generic project'}`);

      // Analyze codebase
      spinner.start('Analyzing codebase...');
      const analysis = await analyzeCodebase(projectRoot, { techStack });
      analysis.techStack = techStack;
      spinner.succeed(`Analyzed: ${analysis.summary?.totalFiles || 0} files`);

      // Generate context files
      spinner.start('Generating AI context files...');
      const config = {
        projectName: path.basename(projectRoot),
        aiTools,
        verbose: options.verbose
      };

      if (options.dryRun) {
        spinner.info('Dry run - no files will be written');
        console.log(chalk.gray('\nWould generate for:'));
        aiTools.forEach(tool => {
          console.log(chalk.gray(`  • ${tool}`));
        });
      } else {
        const results = await generateAll(analysis, config, projectRoot, {
          aiTools,
          verbose: options.verbose
        });

        if (results.success) {
          spinner.succeed(`Generated ${results.summary.files} files for ${results.summary.successful} AI tools`);

          console.log(chalk.bold('\nGenerated files:'));
          results.generated.forEach(g => {
            console.log(chalk.green(`  ✓ ${g.displayName}`));
            g.files.forEach(f => {
              console.log(chalk.gray(`      ${f.relativePath}`));
            });
          });
        } else {
          spinner.warn(`Generated ${results.summary.successful}/${results.summary.total} tools`);
          results.errors.forEach(e => {
            console.error(chalk.red(`  ✖ ${e.adapter}: ${e.message || e.errors?.[0]?.message}`));
          });
        }
      }
    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red('\n✖ Error:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Migrate subcommand - upgrade from v1.x
program
  .command('migrate')
  .description('Migrate from v1.x (.claude/) to v2.0 (.ai-context/)')
  .option('-d, --dryRun', 'Show what would be done without making changes')
  .option('--force', 'Overwrite existing v2.0 installation')
  .option('--backup', 'Create backup of existing files')
  .option('--no-update-refs', 'Skip updating internal references')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);
    const spinner = createSpinner();

    // Check migration status
    spinner.start('Checking installation...');
    const status = getMigrationStatus(projectRoot);
    spinner.succeed(`Status: ${status.message}`);

    if (!status.needsMigration) {
      console.log(chalk.green('\n✓ No migration needed.'));
      process.exit(0);
    }

    // Show what will happen
    console.log(chalk.bold('\nMigration plan:'));
    if (status.details?.oldDir) {
      console.log(chalk.cyan(`  • Rename .claude/ → .ai-context/`));
    }
    if (status.details?.oldFile) {
      console.log(chalk.cyan(`  • Rename CLAUDE.md → AI_CONTEXT.md`));
    }
    if (options.updateRefs !== false) {
      console.log(chalk.cyan(`  • Update internal references in files`));
    }

    if (options.dryRun) {
      console.log(chalk.yellow('\n[dry-run] No changes will be made'));
      process.exit(0);
    }

    // Perform migration
    spinner.start('Migrating...');
    try {
      const result = await migrateV1ToV2(projectRoot, {
        dryRun: false,
        force: options.force,
        backup: options.backup,
        updateReferences: options.updateRefs !== false
      });

      if (result.success) {
        spinner.succeed('Migration completed successfully');

        console.log(chalk.bold('\nChanges made:'));
        result.changes.forEach(change => {
          if (change.type === 'rename') {
            console.log(chalk.green(`  ✓ ${change.action} ${change.from} → ${change.to}`));
          } else if (change.type === 'update') {
            console.log(chalk.green(`  ✓ ${change.action} ${change.file}`));
          } else if (change.type === 'backup') {
            console.log(chalk.blue(`  ↺ ${change.action} ${change.from} → ${change.to}`));
          }
        });

        if (result.warnings.length > 0) {
          console.log(chalk.yellow('\nWarnings:'));
          result.warnings.forEach(w => console.log(chalk.yellow(`  ⚠ ${w}`)));
        }

        console.log(chalk.bold('\nNext steps:'));
        console.log(chalk.gray('  1. Review AI_CONTEXT.md for any needed updates'));
        console.log(chalk.gray('  2. Run `npx create-ai-context generate` to regenerate AI tool files'));
        console.log(chalk.gray('  3. Commit the changes'));
      } else {
        spinner.fail('Migration failed');
        result.errors.forEach(e => {
          console.error(chalk.red(`  ✖ ${e}`));
        });
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Migration failed');
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

// Status subcommand - show current installation status
program
  .command('status')
  .description('Show current AI context installation status')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);

    // Check migration status
    const migrationStatus = getMigrationStatus(projectRoot);

    console.log(chalk.bold('Installation Status:\n'));

    // Version status
    if (migrationStatus.status === 'none') {
      console.log(chalk.yellow('  ○ Not initialized'));
      console.log(chalk.gray('    Run `npx create-ai-context` to initialize\n'));
    } else if (migrationStatus.status === 'v1') {
      console.log(chalk.yellow('  ○ v1.x installation found'));
      console.log(chalk.gray('    Run `npx create-ai-context migrate` to upgrade to v2.0\n'));
    } else if (migrationStatus.status === 'v2') {
      console.log(chalk.green('  ✓ v2.0 installation'));
    } else if (migrationStatus.status === 'mixed') {
      console.log(chalk.yellow('  ⚠ Mixed v1.x and v2.0 installation'));
      console.log(chalk.gray('    Run `npx create-ai-context migrate --force` to clean up\n'));
    }

    // Check AI tool outputs
    if (migrationStatus.status === 'v2' || migrationStatus.status === 'mixed') {
      console.log(chalk.bold('\nAI Tool Outputs:'));

      const tools = getSupportedTools();
      for (const tool of tools) {
        let outputPath;
        if (tool.name === 'claude') {
          outputPath = path.join(projectRoot, 'AI_CONTEXT.md');
        } else if (tool.name === 'copilot') {
          outputPath = path.join(projectRoot, '.github', 'copilot-instructions.md');
        } else if (tool.name === 'cline') {
          outputPath = path.join(projectRoot, '.clinerules');
        } else if (tool.name === 'antigravity') {
          outputPath = path.join(projectRoot, '.agent');
        }

        const exists = fs.existsSync(outputPath);
        if (exists) {
          console.log(chalk.green(`  ✓ ${tool.displayName} (${tool.outputPath})`));
        } else {
          console.log(chalk.gray(`  ○ ${tool.displayName} (not generated)`));
        }
      }

      console.log(chalk.gray('\n  Run `npx create-ai-context generate` to regenerate'));
    }
  });

program.parse();
